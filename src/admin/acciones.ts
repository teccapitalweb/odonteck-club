// Interacciones del panel de administración (formularios y botones).
import { Datos, slug, imagenAWebp, type Curso, type Material, type Evento, type Quiz, type Pregunta } from '../core/datos';
import { Comunidad } from '../core/comunidad';
import { mensajeError } from '../core/auth';
import { resumenEncuestasDemo } from '../core/encuestas';
import {
  Admin, borrarCursoAdmin, borrarEventoAdmin, borrarMaterialAdmin, cambiarEstadoCuponAdmin, cargarAdmin, crearCuponAdmin, guardarConfigAdmin, guardarCortesiaAdmin,
  guardarCursoAdmin, guardarEventoAdmin, guardarMaterialAdmin, guardarQuizAdmin, moderarHiloAdmin, moderarReporteDirectorioAdmin, publicarAvisoAdmin,
  reordenarCursosAdmin, revocarCortesiaAdmin, reiniciarCursoGratisAdmin,
} from '../core/admin';
import { navigate, render, current } from '../core/router';

type Toast = (msg: string, icon?: string) => void;
const cursosNuevos = new Set<string>();

function cursoDesdeForm(f: HTMLFormElement): Curso {
  const d = new FormData(f);
  const id = f.dataset.id || '';
  const previo = Datos.cursos().find((c) => c.id === id);
  const clases = [];
  for (let i = 0; d.has(`clase-${i}-titulo`); i++) {
    const dur = String(d.get(`clase-${i}-duracion`) || '');
    clases.push({ ...(previo?.clases[i] || {}), n: i + 1, titulo: String(d.get(`clase-${i}-titulo`)).trim(), videoId: String(d.get(`clase-${i}-videoId`)).trim(),
                  duracion: dur ? Number(dur) : null, gratis: d.get(`clase-${i}-gratis`) === 'on' });
  }
  const titulo = String(d.get('titulo')).trim();
  return {
    ...(previo || {}),
    id: id || slug(titulo), titulo, area: String(d.get('area')).trim(), nivel: String(d.get('nivel')), instructor: String(d.get('instructor')).trim(),
    descripcion: String(d.get('descripcion')).trim(), aprenderas: String(d.get('aprenderas')).split('\n').map((x) => x.trim()).filter(Boolean),
    bunnyCollectionId: String(d.get('bunnyCollectionId')).trim(), publicado: d.get('publicado') === '1', portada: String(d.get('portada')),
    orden: previo?.orden ?? Datos.cursos().length + 1, clases,
  };
}

function quizDesdeForm(f: HTMLFormElement): Quiz {
  const d = new FormData(f);
  const preguntas: Pregunta[] = [];
  const lineas = (nombre: string) => String(d.get(nombre) || '').split(/\r?\n/).map((x) => x.trim()).filter(Boolean);
  const partes = (linea: string) => linea.split('|').map((x) => x.trim());
  for (let i = 0; d.has(`p-${i}-q`); i++) {
    const tipo = String(d.get(`p-${i}-tipo`) || 'seleccion') as NonNullable<Pregunta['tipo']>;
    const base = { id: String(d.get(`p-${i}-id`) || `p${i + 1}`), tipo, q: String(d.get(`p-${i}-q`)).trim(),
      instruccion: String(d.get(`p-${i}-instruccion`) || '').trim(), compatibleRetos: d.get(`p-${i}-compatible-retos`) === '1', explicacion: String(d.get(`p-${i}-explicacion`) || '').trim() };
    if (tipo === 'seleccion' || tipo === 'seleccion_multiple') {
      const opciones = Array.from({ length: 6 }, (_, o) => String(d.get(`p-${i}-o-${o}`) || '').trim()).filter(Boolean);
      preguntas.push(tipo === 'seleccion'
        ? { ...base, opciones, correcta: Number(d.get(`p-${i}-correcta`) ?? 0) }
        : { ...base, opciones, correctas: d.getAll(`p-${i}-correctas`).map(Number) });
    } else if (tipo === 'ordenar') {
      const elementos = lineas(`p-${i}-elementos`).map((linea, j) => { const [id, ...texto] = partes(linea); return { id: id || `e${j + 1}`, texto: texto.join(' | ') }; });
      const ordenCorrecto = String(d.get(`p-${i}-orden`) || '').split(',').map((x) => x.trim()).filter(Boolean);
      preguntas.push({ ...base, opciones: [], elementos, ordenCorrecto });
    } else if (tipo === 'relacionar') {
      const filas = lineas(`p-${i}-pares`).map((linea, j) => { const [izqId, izqTexto, derId, ...derTexto] = partes(linea); return { izqId: izqId || `i${j + 1}`, izqTexto, derId: derId || `d${j + 1}`, derTexto: derTexto.join(' | ') }; });
      preguntas.push({ ...base, opciones: [], izquierda: filas.map((x) => ({ id: x.izqId, texto: x.izqTexto })), derecha: filas.map((x) => ({ id: x.derId, texto: x.derTexto })), pares: Object.fromEntries(filas.map((x) => [x.izqId, x.derId])) });
    } else {
      const huecos = lineas(`p-${i}-huecos`).map((linea, j) => { const [id, etiqueta, ...respuestas] = partes(linea); return { id: id || `h${j + 1}`, etiqueta, respuestas: respuestas.filter(Boolean) }; });
      preguntas.push({ ...base, opciones: [], plantilla: String(d.get(`p-${i}-plantilla`) || '').trim(), huecos });
    }
  }
  const previo = Datos.quiz(f.dataset.curso!, Number(f.dataset.n));
  return { id: f.dataset.id!, cursoId: f.dataset.curso!, n: Number(f.dataset.n), estado: previo?.estado || 'borrador', preguntas, actualizado: '' };
}

// Agregados de encuestas (lo mismo que ve el panel, sin PII) como CSV descargable.
function exportarEncuestasCsv() {
  const plan = current().query.get('plan');
  const r = Datos.modo === 'api' ? Admin.encuestas : resumenEncuestasDemo(plan === 'vip' ? 'vip' : plan === 'gratis' ? 'gratis' : null);
  if (!r) return;
  const celda = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const filas: unknown[][] = [['encuesta', 'version', 'pregunta', 'tipo', 'opcion_o_metrica', 'total', 'porcentaje_o_valor']];
  for (const e of r.encuestas) for (const p of e.preguntas) {
    if (p.tipo === 'escala') {
      filas.push([e.titulo, e.version, p.texto, p.tipo, 'promedio', p.total, p.promedio ?? '']);
      if (p.nps !== undefined) filas.push([e.titulo, e.version, p.texto, p.tipo, 'nps', p.total, p.nps ?? ''], [e.titulo, e.version, p.texto, p.tipo, 'promotores', p.promotores ?? 0, ''], [e.titulo, e.version, p.texto, p.tipo, 'pasivos', p.pasivos ?? 0, ''], [e.titulo, e.version, p.texto, p.tipo, 'detractores', p.detractores ?? 0, '']);
    } else if (p.tipo === 'texto') for (const c of p.comentarios || []) filas.push([e.titulo, e.version, p.texto, p.tipo, 'comentario', 1, c]);
    else for (const o of p.opciones || []) filas.push([e.titulo, e.version, p.texto, p.tipo, o.etiqueta, o.total, o.porcentaje]);
  }
  for (const per of r.encuestas.find((e) => e.tipo === 'pulso')?.periodos || []) filas.push(['Experiencia por periodo', '', per.periodo, 'periodo', 'nps', per.total, per.nps ?? '']);
  const csv = '﻿' + filas.map((f) => f.map(celda).join(',')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `odonteck-encuestas${plan ? `-${plan}` : ''}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function instalarAccionesAdmin(toast: Toast) {
  document.addEventListener('submit', async (e) => {
    const f = e.target as HTMLFormElement;
    const tipo = f.dataset.form;
    if (!tipo || !current().path.startsWith('/admin')) return;
    e.preventDefault();
    const d = new FormData(f);
    const boton = (e as SubmitEvent).submitter as HTMLButtonElement | null;
    if (boton) boton.disabled = true;
    try {
      if (tipo === 'curso') {
        const c = cursoDesdeForm(f);
        if (!f.dataset.id && Datos.cursos().some((x) => x.id === c.id)) { toast('Ya existe un curso con ese título', 'alert-triangle'); return; }
        if (!c.clases.length) { toast('Agrega al menos una clase', 'alert-triangle'); return; }
        const guardado = await guardarCursoAdmin(c, !f.dataset.id || cursosNuevos.has(c.id));
        cursosNuevos.delete(c.id); toast('Curso guardado'); navigate(`/admin/cursos/${guardado.id}`); if (f.dataset.id) render();
      }
      if (tipo === 'quiz') {
        const q = quizDesdeForm(f);
        const accion = (e as SubmitEvent).submitter?.getAttribute('value');
        if (accion === 'aprobar') {
          if (!q.preguntas.length) { toast('Agrega al menos una pregunta', 'alert-triangle'); return; }
          const incompleta = q.preguntas.some((p) => {
            const tipoPregunta = p.tipo || 'seleccion';
            if (!p.q || !p.explicacion) return true;
            if (tipoPregunta === 'seleccion') return !p.opciones || p.opciones.length < 2 || p.correcta === undefined;
            if (tipoPregunta === 'seleccion_multiple') return !p.opciones || p.opciones.length < 2 || !p.correctas?.length;
            if (tipoPregunta === 'ordenar') return !p.elementos || p.elementos.length < 2 || p.ordenCorrecto?.length !== p.elementos.length;
            if (tipoPregunta === 'relacionar') return !p.izquierda || p.izquierda.length < 2 || p.derecha?.length !== p.izquierda.length;
            return !p.plantilla || !p.huecos?.length || p.huecos.some((h) => !h.respuestas?.length);
          });
          if (incompleta) { toast('Completa la pregunta, su solución y la explicación antes de aprobar', 'alert-triangle'); return; }
          q.estado = 'aprobado';
        } else q.estado = 'borrador';
        await guardarQuizAdmin(q); toast(q.estado === 'aprobado' ? 'Quiz aprobado · ya lo ven los miembros' : 'Borrador guardado'); render();
      }
      if (tipo === 'material') {
        const previo = Datos.materiales().find((m) => m.id === f.dataset.id);
        const titulo = String(d.get('titulo')).trim();
        const m: Material = { ...(previo || {}), id: f.dataset.id || slug(titulo), titulo, tipo: String(d.get('tipo')), categoria: String(d.get('categoria')).trim(),
           area: String(d.get('area')).trim(), autor: String(d.get('autor')).trim(), paginas: Number(d.get('paginas')) || 1, portada: String(d.get('portada')),
          cursoId: String(d.get('cursoId')) || null, descripcion: String(d.get('descripcion')).trim(), estado: String(d.get('estado')), gratis: d.get('gratis') === '1', url: String(d.get('url') || '').trim() };
        const archivo = f.querySelector<HTMLInputElement>('[name="archivoFile"]')?.files?.[0];
        const portadaFile = f.querySelector<HTMLInputElement>('[name="portadaFile"]')?.files?.[0];
        if (Datos.modo === 'demo' && m.estado === 'disponible' && !m.url) { toast('Para marcarlo disponible indica el archivo', 'alert-triangle'); return; }
        if (Datos.modo === 'api' && !previo && m.estado === 'disponible' && !archivo) { toast('Sube el PDF antes de marcar el material disponible', 'alert-triangle'); return; }
        let portada: Blob | undefined;
        if (portadaFile) portada = await (await fetch(await imagenAWebp(portadaFile))).blob();
        await guardarMaterialAdmin(m, !f.dataset.id, { archivo, portada });
        toast('Material guardado'); navigate('/admin/materiales');
      }
      if (tipo === 'evento') {
        const previo = Datos.eventos().find((x) => x.id === f.dataset.id);
        const titulo = String(d.get('titulo')).trim();
        const ev: Evento = { ...(previo || {}), id: f.dataset.id || `${slug(titulo)}-${Date.now().toString(36)}`, titulo, ponente: String(d.get('ponente')).trim(),
          fecha: new Date(String(d.get('fecha'))).toISOString(), duracionMin: Number(d.get('duracionMin')) || 60, enlace: String(d.get('enlace')).trim(),
          cursoId: String(d.get('cursoId')) || undefined, publicado: d.get('publicado') === '1' };
        await guardarEventoAdmin(ev, !f.dataset.id); toast('Clase en vivo guardada', 'radio'); navigate('/admin/en-vivo');
      }
      if (tipo === 'cortesia') {
        await guardarCortesiaAdmin(f.dataset.uid!, Number(d.get('dias')), String(d.get('motivo')).trim());
        await cargarAdmin(current().path, current().query, true); toast('Cortesía otorgada', 'gift'); render();
      }
      if (tipo === 'aviso') {
        await publicarAvisoAdmin({ titulo: String(d.get('titulo')).trim(), texto: String(d.get('texto')).trim(), enlace: String(d.get('enlace')).trim() || undefined });
        toast('Aviso publicado', 'megaphone'); render();
      }
      if (tipo === 'cupon') {
        const venceStr = String(d.get('vence') || '').trim();
        const cupon = await crearCuponAdmin({
          codigo: String(d.get('codigo') || '').trim() || undefined,
          dias: Number(d.get('dias')) || 30,
          usosMax: Math.max(0, Number(d.get('usosMax')) || 0),
          vence: venceStr ? new Date(venceStr + 'T23:59:59').toISOString() : null,
          etiqueta: String(d.get('etiqueta') || '').trim(),
        });
        try { await navigator.clipboard?.writeText(cupon.codigo); } catch { /* sin portapapeles */ }
        toast(`Cupón ${cupon.codigo} creado · código copiado`, 'ticket'); render();
      }
      if (tipo === 'config') {
        await guardarConfigAdmin({ precioMensual: Number(d.get('precioMensual')), precioAnual: Number(d.get('precioAnual')), descuentoVIP: Number(d.get('descuentoVIP')),
          whatsappSoporte: String(d.get('whatsappSoporte')).trim(), canalWhatsApp: String(d.get('canalWhatsApp')).trim(), praxiaUrl: String(d.get('praxiaUrl')).trim() });
        toast('Ajustes guardados');
      }
      if (tipo === 'buscar-miembro') {
        const p = current().query; p.set('q', String(d.get('q'))); navigate('/admin/miembros?' + p.toString());
      }
    } catch (err) { console.error(err); toast(mensajeError(err), 'alert-triangle'); }
    finally { if (boton) boton.disabled = false; }
  });

  document.addEventListener('click', async (e) => {
    const el = e.target as HTMLElement;
    if (!current().path.startsWith('/admin')) return;

    const pub = el.closest<HTMLElement>('[data-toggle-publicado]');
    if (pub) { const c = Datos.cursos().find((x) => x.id === pub.dataset.togglePublicado)!; c.publicado = c.publicado === false; try { await guardarCursoAdmin(c, false); toast(c.publicado ? 'Curso publicado' : 'Curso oculto'); render(); } catch (err) { c.publicado = !c.publicado; toast(mensajeError(err), 'alert-triangle'); } }

    const mov = el.closest<HTMLElement>('[data-mover-curso]');
    if (mov) { const [id, dir] = mov.dataset.moverCurso!.split(':'); const ids = Datos.cursos().map((c) => c.id); const i = ids.indexOf(id); const j = i + Number(dir);
      if (j >= 0 && j < ids.length) { [ids[i], ids[j]] = [ids[j], ids[i]]; try { await reordenarCursosAdmin(ids); render(); } catch (err) { toast(mensajeError(err), 'alert-triangle'); } } }

    const ca = el.closest<HTMLElement>('[data-clase-accion]');
    if (ca) {
      const f = ca.closest('form') as HTMLFormElement; const c = cursoDesdeForm(f); const [acc, idx] = ca.dataset.claseAccion!.split(':'); const i = Number(idx);
      if (acc === 'agregar') c.clases.push({ n: c.clases.length + 1, titulo: `Clase ${c.clases.length + 1}`, videoId: '', duracion: null, gratis: c.clases.length === 0 });
      if (acc === 'quitar') { if (!confirm('¿Quitar esta clase del curso?')) return; c.clases.splice(i, 1); }
      if (acc === 'subir' && i > 0) [c.clases[i - 1], c.clases[i]] = [c.clases[i], c.clases[i - 1]];
      if (acc === 'bajar' && i < c.clases.length - 1) [c.clases[i + 1], c.clases[i]] = [c.clases[i], c.clases[i + 1]];
      c.clases.forEach((k, n) => (k.n = n + 1));
      if (!c.titulo) { toast('Escribe el título del curso primero', 'alert-triangle'); return; }
      Datos.guardarCurso(c); if (!f.dataset.id) { cursosNuevos.add(c.id); navigate(`/admin/cursos/${c.id}`); } else render();
    }

    const qa = el.closest<HTMLElement>('[data-quiz-accion]');
    if (qa) {
      const f = qa.closest('form') as HTMLFormElement; const q = quizDesdeForm(f); const [acc, idx] = qa.dataset.quizAccion!.split(':');
      if (acc === 'agregar') q.preguntas.push({ id: `p${Date.now().toString(36)}`, tipo: 'seleccion', q: '', opciones: ['', '', '', ''], correcta: 0, explicacion: '' });
      if (acc === 'quitar') q.preguntas.splice(Number(idx), 1);
      q.estado = 'borrador'; Datos.guardarQuiz(q); render();
    }

    const dias = el.closest<HTMLElement>('[data-dias]');
    if (dias) { const inp = dias.closest('form')!.querySelector<HTMLInputElement>('[name="dias"]')!; inp.value = dias.dataset.dias!; }

    const cuponDias = el.closest<HTMLElement>('[data-cupon-dias]');
    if (cuponDias) { cuponDias.closest('form')!.querySelector<HTMLInputElement>('[name="dias"]')!.value = cuponDias.dataset.cuponDias!; return; }
    const copiar = el.closest<HTMLElement>('[data-copiar-cupon]');
    if (copiar) { try { await navigator.clipboard.writeText(copiar.dataset.copiarCupon!); toast('Código copiado', 'copy'); } catch { toast('No se pudo copiar', 'alert-triangle'); } return; }
    const cuponEstado = el.closest<HTMLElement>('[data-cupon-estado]');
    if (cuponEstado) {
      const [codigo, estado] = cuponEstado.dataset.cuponEstado!.split(':') as [string, 'activo' | 'revocado'];
      if (estado === 'revocado' && !confirm(`¿Revocar el cupón ${codigo}? Dejará de poder canjearse.`)) return;
      try { await cambiarEstadoCuponAdmin(codigo, estado); toast(estado === 'revocado' ? 'Cupón revocado' : 'Cupón reactivado', 'ticket'); render(); } catch (err) { toast(mensajeError(err), 'alert-triangle'); }
      return;
    }

    const rcg = el.closest<HTMLElement>('[data-reiniciar-curso-gratis]');
    if (rcg && confirm('¿Reiniciar la elección de curso gratis? El miembro volverá a elegir.')) { try { await reiniciarCursoGratisAdmin(rcg.dataset.reiniciarCursoGratis!); await cargarAdmin(current().path, current().query, true); toast('Elección reiniciada', 'rotate-ccw'); render(); } catch (err) { toast(mensajeError(err), 'alert-triangle'); } return; }
    const rev = el.closest<HTMLElement>('[data-revocar-cortesia]');
    if (rev && confirm('¿Revocar la cortesía ahora?')) { try { await revocarCortesiaAdmin(rev.dataset.revocarCortesia!); await cargarAdmin(current().path, current().query, true); toast('Cortesía revocada'); render(); } catch (err) { toast(mensajeError(err), 'alert-triangle'); } }

    const bc = el.closest<HTMLElement>('[data-borrar-curso]');
    if (bc && confirm('¿Borrar este curso? No se puede deshacer.')) { try { await borrarCursoAdmin(bc.dataset.borrarCurso!); toast('Curso borrado', 'trash-2'); navigate('/admin/cursos'); } catch (err) { toast(mensajeError(err), 'alert-triangle'); } }
    const bm = el.closest<HTMLElement>('[data-borrar-material]');
    if (bm && confirm('¿Borrar este material?')) { try { await borrarMaterialAdmin(bm.dataset.borrarMaterial!); toast('Material borrado', 'trash-2'); navigate('/admin/materiales'); } catch (err) { toast(mensajeError(err), 'alert-triangle'); } }
    const be = el.closest<HTMLElement>('[data-borrar-evento]');
    if (be && confirm('¿Borrar esta clase en vivo?')) { try { await borrarEventoAdmin(be.dataset.borrarEvento!); toast('Clase borrada', 'trash-2'); navigate('/admin/en-vivo'); } catch (err) { toast(mensajeError(err), 'alert-triangle'); } }
    const ba = el.closest<HTMLElement>('[data-borrar-aviso]');
    if (ba && Datos.modo === 'demo' && confirm('¿Borrar este aviso?')) { Datos.borrarAviso(ba.dataset.borrarAviso!); render(); }
    const oh = el.closest<HTMLElement>('[data-ocultar-hilo]');
    if (oh) { const hilo = Comunidad.todos().find((h) => h.id === oh.dataset.ocultarHilo); try { await moderarHiloAdmin(oh.dataset.ocultarHilo!, !hilo?.oculto); await cargarAdmin(current().path, current().query, true); render(); } catch (err) { toast(mensajeError(err), 'alert-triangle'); } }
    const rd = el.closest<HTMLButtonElement>('[data-directorio-reporte]');
    if (rd) {
      const [id, estado, accion] = rd.dataset.directorioReporte!.split(':') as [string, 'revisado' | 'descartado', 'ninguna' | 'ocultar' | 'cerrar'];
      const mensaje = accion === 'ocultar' ? '¿Ocultar el perfil denunciado?' : accion === 'cerrar' ? '¿Cerrar la oportunidad denunciada?' : '¿Descartar esta denuncia sin retirar contenido?';
      if (!confirm(mensaje)) return;
      rd.disabled = true;
      try { await moderarReporteDirectorioAdmin(id, estado, accion); await cargarAdmin(current().path, current().query, true); toast('Denuncia revisada', 'shield-check'); render(); }
      catch (err) { toast(mensajeError(err), 'alert-triangle'); rd.disabled = false; }
    }
    if (el.closest('[data-restablecer-demo]') && confirm('Esto borra todos los cambios hechos en el demo. ¿Continuar?')) { Datos.restablecerDemo(); toast('Demo restablecido', 'rotate-ccw'); render(); }
    if (el.closest('[data-reintentar-admin]')) { await cargarAdmin(current().path, current().query, true); render(); }
    if (el.closest('[data-exportar-encuestas]')) { exportarEncuestasCsv(); toast('CSV descargado', 'download'); }
  });

  document.addEventListener('change', async (e) => {
    const inp = e.target as HTMLInputElement;
    if (inp.matches('[data-quiz-tipo]')) {
      const f = inp.closest('form') as HTMLFormElement;
      const q = quizDesdeForm(f); q.estado = 'borrador'; Datos.guardarQuiz(q); render(); return;
    }
    if (!inp.matches('[data-subir-imagen]') || !inp.files?.[0]) return;
    const campo = inp.dataset.subirImagen!;
    const form = inp.closest('form')!;
    try {
      const url = await imagenAWebp(inp.files[0]);
      if (Datos.modo === 'demo') form.querySelector<HTMLInputElement>(`input[name="${campo}"]`)!.value = url;
      form.querySelector<HTMLImageElement>(`[data-preview="${campo}"]`)!.src = url;
      toast('Imagen lista · guarda para aplicar', 'image');
    } catch { toast('No se pudo leer la imagen', 'alert-triangle'); }
  });
}
