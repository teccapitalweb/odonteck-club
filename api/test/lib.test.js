import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { describe, test } from 'node:test';
import {
  claseDesbloqueada,
  cortesiaVigente,
  cursoCompleto,
  esVip,
  membresiaVigente,
  tieneAccesoAClase,
  suscripcionVigente,
} from '../src/lib/acceso.js';
import { firmarEmbedBunny } from '../src/lib/bunny.js';
import { leerCuentaDeServicio } from '../src/lib/cuenta-servicio.js';
import { aMillis } from '../src/lib/fechas.js';
import { FOLIO_REGEX, folioValido, formatearFolio } from '../src/lib/folio.js';
import { validarClases, validarCurso, validarPreguntas } from '../src/lib/esquemas.js';
import { texto } from '../src/lib/validacion.js';
import { mapearCurso, mapearMaterial } from '../src/lib/semilla.js';

const AHORA = new Date('2026-09-17T12:00:00Z');
const AYER = '2026-09-16T12:00:00Z';
const MANANA = '2026-09-18T12:00:00Z';

// Imita un Timestamp de Firestore sin depender de firebase-admin.
const ts = (iso) => ({ toMillis: () => Date.parse(iso), toDate: () => new Date(iso) });

describe('esVip', () => {
  test('activa o activo sin vencimiento dan acceso', () => {
    assert.equal(esVip({ activa: true }, AHORA), true);
    assert.equal(esVip({ activo: true }, AHORA), true);
  });

  test('sin activa/activo en true no hay acceso', () => {
    assert.equal(esVip({}, AHORA), false);
    assert.equal(esVip(null, AHORA), false);
    assert.equal(esVip({ activa: false, activo: false }, AHORA), false);
    assert.equal(esVip({ activa: 'true' }, AHORA), false, 'solo el booleano true cuenta');
    assert.equal(esVip({ expiraEn: MANANA }, AHORA), false, 'una fecha futura sola no activa');
  });

  test('expiraEn: ISO, Timestamp y {seconds}', () => {
    assert.equal(esVip({ activa: true, expiraEn: MANANA }, AHORA), true);
    assert.equal(esVip({ activa: true, expiraEn: AYER }, AHORA), false);
    assert.equal(esVip({ activa: true, expiraEn: ts(MANANA) }, AHORA), true);
    assert.equal(esVip({ activa: true, expiraEn: ts(AYER) }, AHORA), false);
    assert.equal(esVip({ activo: true, expiraEn: { _seconds: Date.parse(MANANA) / 1000 } }, AHORA), true);
  });

  test('fechaFinAcceso funciona igual que expiraEn', () => {
    assert.equal(esVip({ activo: true, fechaFinAcceso: MANANA }, AHORA), true);
    assert.equal(esVip({ activo: true, fechaFinAcceso: AYER }, AHORA), false);
    assert.equal(esVip({ activo: true, fechaFinAcceso: ts(AYER) }, AHORA), false);
  });

  test('vencimiento exactamente ahora ya no da acceso (exp > ahora)', () => {
    assert.equal(esVip({ activa: true, expiraEn: AHORA.toISOString() }, AHORA), false);
  });

  test('fecha sin hora vale durante todo ese día; fecha ilegible falla cerrado', () => {
    assert.equal(esVip({ activa: true, expiraEn: '2026-09-17' }, AHORA), true);
    assert.equal(esVip({ activa: true, expiraEn: '2026-09-16' }, AHORA), false);
    assert.equal(esVip({ activa: true, expiraEn: 'pronto' }, AHORA), false);
    assert.equal(membresiaVigente({ activa: true, expiraEn: {} }, AHORA), false);
  });

  test('cortesía vigente da acceso aunque no haya membresía', () => {
    assert.equal(esVip(null, AHORA, { cortesia: { hasta: MANANA } }), true);
    assert.equal(esVip({ activa: false }, AHORA, { cortesia: { hasta: AYER } }), false);
    assert.equal(cortesiaVigente({ hasta: 'no-es-fecha' }, AHORA), false);
    assert.equal(cortesiaVigente({}, AHORA), false);
  });

  test('claim admin siempre es VIP', () => {
    assert.equal(esVip(null, AHORA, { esAdmin: true }), true);
    assert.equal(esVip({ activa: true, expiraEn: AYER }, AHORA, { esAdmin: true }), true);
    assert.equal(esVip(null, AHORA, { esAdmin: 'true' }), false);
  });
});

describe('desbloqueo secuencial y acceso a clase', () => {
  const curso = { clases: [{ n: 1 }, { n: 2 }, { n: 3 }] };

  test('la clase 1 siempre está abierta', () => {
    assert.equal(claseDesbloqueada(curso, 1, []), true);
  });

  test('la clase n requiere la n-1 vista', () => {
    assert.equal(claseDesbloqueada(curso, 2, []), false);
    assert.equal(claseDesbloqueada(curso, 2, [1]), true);
    assert.equal(claseDesbloqueada(curso, 3, [1]), false);
    assert.equal(claseDesbloqueada(curso, 3, [2]), true);
  });

  test('clase inexistente nunca está desbloqueada; huecos en la numeración se respetan', () => {
    assert.equal(claseDesbloqueada(curso, 9, [1, 2, 3]), false);
    const conHueco = { clases: [{ n: 1 }, { n: 3 }] };
    assert.equal(claseDesbloqueada(conHueco, 3, [1]), true);
  });

  test('acceso: VIP o clase gratis', () => {
    assert.equal(tieneAccesoAClase({ gratis: true }, false), true);
    assert.equal(tieneAccesoAClase({ gratis: false }, false), false);
    assert.equal(tieneAccesoAClase({}, true), true);
  });

  test('curso completo cuando todas las clases están vistas', () => {
    assert.equal(cursoCompleto(curso, [1, 2]), false);
    assert.equal(cursoCompleto(curso, [3, 1, 2]), true);
    assert.equal(cursoCompleto({ clases: [] }, []), false);
  });
});

describe('regla freemium unificada', () => {
  const primerCurso = {
    orden: 1,
    clases: [
      { n: 1, gratis: true },
      { n: 2, gratis: true },
      { n: 3, gratis: true },
      { n: 4, gratis: true },
      { n: 5, gratis: false },
    ],
  };
  const segundoCurso = {
    orden: 2,
    clases: [
      { n: 1, gratis: true },
      { n: 2, gratis: false },
      { n: 3, gratis: false },
    ],
  };

  const ahora = new Date('2026-09-24T12:00:00Z');
  const futuro = new Date('2027-01-01T00:00:00Z').toISOString();
  const pasado = new Date('2026-01-01T00:00:00Z').toISOString();

  test('primer curso, primera clase: accesible sin VIP', () => {
    assert.equal(tieneAccesoAClase(primerCurso.clases[0], false), true);
  });

  test('primer curso, penúltima clase: accesible sin VIP', () => {
    assert.equal(tieneAccesoAClase(primerCurso.clases[3], false), true);
  });

  test('primer curso, última clase: requiere VIP', () => {
    assert.equal(tieneAccesoAClase(primerCurso.clases[4], false), false);
    assert.equal(tieneAccesoAClase(primerCurso.clases[4], true), true);
  });

  test('segundo curso, primera clase: accesible sin VIP', () => {
    assert.equal(tieneAccesoAClase(segundoCurso.clases[0], false), true);
  });

  test('segundo curso, segunda clase: requiere VIP', () => {
    assert.equal(tieneAccesoAClase(segundoCurso.clases[1], false), false);
    assert.equal(tieneAccesoAClase(segundoCurso.clases[1], true), true);
  });

  test('usuario sin membresía no es VIP', () => {
    assert.equal(esVip(null, ahora), false);
    assert.equal(esVip({ activa: false }, ahora), false);
  });

  test('VIP activo con membresía vigente', () => {
    assert.equal(esVip({ activa: true, expiraEn: futuro }, ahora), true);
  });

  test('VIP vencido pierde acceso', () => {
    assert.equal(esVip({ activa: true, expiraEn: pasado }, ahora), false);
  });

  test('admin siempre tiene acceso', () => {
    assert.equal(esVip(null, ahora, { esAdmin: true }), true);
  });
});

describe('firma de Bunny', () => {
  test('coincide con un vector calculado de antemano', () => {
    const r = firmarEmbedBunny({
      libraryId: '725453',
      tokenAuthKey: 'llave-de-prueba',
      videoId: '56b5a950-60a5-4972-b974-d69bc991b447',
      ttlSeconds: 300,
      ahoraMs: 1_790_000_000_999,
    });
    assert.equal(r.expires, 1_790_000_300);
    assert.equal(
      r.embedUrl,
      'https://iframe.mediadelivery.net/embed/725453/56b5a950-60a5-4972-b974-d69bc991b447' +
        '?token=6d6c49bbf22e7e633325734dbb345e1a465bbc3909576daf07eb2cde3ebb0896&expires=1790000300',
    );
    const esperado = createHash('sha256').update('llave-de-prueba56b5a950-60a5-4972-b974-d69bc991b4471790000300').digest('hex');
    assert.equal(new URL(r.embedUrl).searchParams.get('token'), esperado);
  });

  test('rechaza datos inválidos', () => {
    assert.throws(() => firmarEmbedBunny({ libraryId: 'abc', tokenAuthKey: 'k', videoId: 'v' }));
    assert.throws(() => firmarEmbedBunny({ libraryId: '1', tokenAuthKey: 'k', videoId: '../x' }));
    assert.throws(() => firmarEmbedBunny({ libraryId: '1', tokenAuthKey: '', videoId: 'v' }));
  });
});

describe('folio de certificado', () => {
  test('formato ODT-AAAA-NNNNN', () => {
    assert.equal(formatearFolio(2026, 1), 'ODT-2026-00001');
    assert.equal(formatearFolio(2026, 12345), 'ODT-2026-12345');
    assert.match(formatearFolio(2027, 42), FOLIO_REGEX);
  });

  test('fuera de rango lanza error', () => {
    assert.throws(() => formatearFolio(2026, 0));
    assert.throws(() => formatearFolio(2026, 100000));
    assert.throws(() => formatearFolio(26, 1));
  });

  test('validación de folio', () => {
    assert.equal(folioValido('ODT-2026-00001'), true);
    assert.equal(folioValido('odt-2026-00001'), false);
    assert.equal(folioValido('ODT-2026-1'), false);
    assert.equal(folioValido(null), false);
  });
});

describe('validaciones', () => {
  test('texto sin HTML y con límite', () => {
    assert.equal(texto('  Hola  ', { campo: 'x', max: 10 }), 'Hola');
    assert.equal(texto('3 < 5', { campo: 'x', max: 10 }), '3 < 5');
    assert.throws(() => texto('<b>hola</b>', { campo: 'x', max: 100 }), /HTML/);
    assert.throws(() => texto('<script>alert(1)</script>', { campo: 'x', max: 100 }), /HTML/);
    assert.throws(() => texto('x'.repeat(11), { campo: 'x', max: 10 }), /máximo/);
    assert.throws(() => texto('   ', { campo: 'x', max: 10, requerido: true }), /obligatorio/);
  });

  test('clases: números únicos, videoId válido, orden por n', () => {
    const clases = validarClases([
      { n: 2, titulo: 'Dos', videoId: 'abc-2' },
      { n: 1, titulo: 'Uno', videoId: 'abc-1', gratis: true, duracionMin: 12 },
    ]);
    assert.deepEqual(clases.map((c) => c.n), [1, 2]);
    assert.equal(clases[1].gratis, false);
    assert.throws(() => validarClases([{ n: 1, titulo: 'a' }, { n: 1, titulo: 'b' }]), /repetido/);
    assert.throws(() => validarClases([{ n: 1, titulo: 'a', videoId: 'x/y' }]), /Bunny/);
  });

  test('curso: PATCH parcial solo devuelve lo enviado y permite limpiar portada', () => {
    assert.deepEqual(validarCurso({ titulo: 'Nuevo' }, { parcial: true }), { titulo: 'Nuevo' });
    assert.deepEqual(validarCurso({ portada: null }, { parcial: true }), { portada: null });
    assert.throws(() => validarCurso({ id: 'Mal Id', titulo: 't', area: 'a', nivel: 'Básico' }), /minúsculas/);
  });

  test('preguntas de quiz', () => {
    const [p] = validarPreguntas([{ q: '¿?', opciones: ['a', 'b'], correcta: 1, explicacion: 'porque' }]);
    assert.equal(p.correcta, 1);
    assert.throws(() => validarPreguntas([{ q: '¿?', opciones: ['a', 'b'], correcta: 2 }]));
    assert.throws(() => validarPreguntas([{ q: '¿?', opciones: ['a'], correcta: 0 }]));
  });

  test('fechas: aMillis distingue vacío de ilegible', () => {
    assert.equal(aMillis(undefined), null);
    assert.equal(aMillis(''), null);
    assert.ok(Number.isNaN(aMillis('nada')));
    assert.equal(aMillis(ts(MANANA)), Date.parse(MANANA));
  });

  test('cuenta de servicio en JSON o base64', () => {
    const json = JSON.stringify({ project_id: 'p', private_key: 'k', client_email: 'e@x' });
    assert.equal(leerCuentaDeServicio(json).project_id, 'p');
    assert.equal(leerCuentaDeServicio(Buffer.from(json).toString('base64')).client_email, 'e@x');
    assert.equal(leerCuentaDeServicio(''), null);
    assert.throws(() => leerCuentaDeServicio('{"project_id":"p"}'), /faltan/);
  });
});

describe('semilla v2', () => {
  test('curso del catálogo: duracion -> duracionMin, publicado y sin campos indefinidos', () => {
    const c = mapearCurso({
      id: 'curso-a', titulo: 'A', area: 'Endo', nivel: 'Básico', instructor: 'X', portada: '/p.webp',
      descripcion: 'd', orden: 1, bunnyCollectionId: 'col',
      clases: [{ n: 1, titulo: 'Clase 1', videoId: 'v1', duracion: null, gratis: true }, { n: 2, titulo: 'Clase 2', videoId: 'v2', duracion: 15 }],
    }, '2026-09-17T00:00:00.000Z');
    assert.equal(c.publicado, true);
    assert.deepEqual(c.aprenderas, []);
    assert.deepEqual(c.clases[0], { n: 1, titulo: 'Clase 1', videoId: 'v1', duracionMin: null, gratis: true });
    assert.equal(c.clases[1].duracionMin, 15);
    assert.equal(c.clases[1].gratis, false);
  });

  test('material: la ruta pública se convierte en archivo de Storage y conserva el acceso gratuito', () => {
    const m = mapearMaterial({ id: 'guia', titulo: 'Guía', tipo: 'PDF', estado: 'disponible', gratis: true, url: '/materiales/guia.pdf', cursoId: null }, 'hoy');
    assert.equal(m.archivo, 'materiales/guia.pdf');
    assert.equal(m.gratis, true);
    assert.equal('url' in m, false);
  });

  test('compatibilidad: fechaProximaRenovacion y esRegalo conservan acceso heredado', () => {
    assert.equal(esVip({ activa: true, fechaProximaRenovacion: '2026-09-18T00:00:00Z' }, AHORA), true);
    assert.equal(esVip({ esRegalo: true, expiraEn: '2026-09-18T00:00:00Z' }, AHORA), true);
    assert.equal(esVip({ esRegalo: true, expiraEn: '2026-09-16T00:00:00Z' }, AHORA), false);
  });
});

describe('suscripcionVigente (checkout nuevo)', () => {
  const ahora = new Date('2026-09-17T12:00:00Z');
  test('activa o en prueba con periodo futuro da acceso', () => {
    assert.equal(suscripcionVigente({ estado: 'active', periodoFin: '2026-10-17T12:00:00Z' }, ahora), true);
    assert.equal(suscripcionVigente({ estado: 'trialing', periodoFin: '2026-09-20T00:00:00Z' }, ahora), true);
  });
  test('cancelada al final conserva acceso hasta el fin del periodo', () => {
    assert.equal(suscripcionVigente({ estado: 'active', cancelaAlFinal: true, periodoFin: '2026-09-30T00:00:00Z' }, ahora), true);
    assert.equal(suscripcionVigente({ estado: 'active', cancelaAlFinal: true, periodoFin: '2026-09-01T00:00:00Z' }, ahora), false);
  });
  test('cancelada, incompleta o sin documento no da acceso', () => {
    assert.equal(suscripcionVigente({ estado: 'canceled', periodoFin: '2026-10-17T12:00:00Z' }, ahora), false);
    assert.equal(suscripcionVigente({ estado: 'incomplete' }, ahora), false);
    assert.equal(suscripcionVigente(null, ahora), false);
  });
  test('pago fallido respeta solo el periodo ya pagado', () => {
    assert.equal(suscripcionVigente({ estado: 'past_due', periodoFin: '2026-09-20T00:00:00Z' }, ahora), true);
    assert.equal(suscripcionVigente({ estado: 'past_due' }, ahora), false);
  });
  test('esVip considera la suscripción nueva', () => {
    assert.equal(esVip(null, ahora, { suscripcion: { estado: 'active', periodoFin: '2026-10-17T12:00:00Z' } }), true);
  });
});
