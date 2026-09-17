// Interacciones del panel de administración (formularios y botones).
import { Datos, slug, imagenAWebp, type Curso, type Material, type Evento, type Quiz } from '../core/datos';
import { Comunidad } from '../core/comunidad';
import { navigate, render, current } from '../core/router';

type Toast = (msg: string, icon?: string) => void;

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
  const preguntas = [];
  for (let i = 0; d.has(`p-${i}-q`); i++) {
    preguntas.push({ q: String(d.get(`p-${i}-q`)).trim(), opciones: [0, 1, 2, 3].map((o) => String(d.get(`p-${i}-o-${o}`) || '').trim()),
                     correcta: Number(d.get(`p-${i}-correcta`) ?? 0), explicacion: String(d.get(`p-${i}-explicacion`) || '').trim() });
  }
  const previo = Datos.quiz(f.dataset.curso!, Number(f.dataset.n));
  return { id: f.dataset.id!, cursoId: f.dataset.curso!, n: Number(f.dataset.n), estado: previo?.estado || 'borrador', preguntas, actualizado: '' };
}

export function instalarAccionesAdmin(toast: Toast) {
  document.addEventListener('submit', async (e) => {
    const f = e.target as HTMLFormElement;
    const tipo = f.dataset.form;
    if (!tipo || !current().path.startsWith('/admin')) return;
    e.preventDefault();
    const d = new FormData(f);
    try {
      if (tipo === 'curso') {
        const c = cursoDesdeForm(f);
        if (!f.dataset.id && Datos.cursos().some((x) => x.id === c.id)) { toast('Ya existe un curso con ese título', 'alert-triangle'); return; }
        if (!c.clases.length) { toast('Agrega al menos una clase', 'alert-triangle'); return; }
        Datos.guardarCurso(c); toast('Curso guardado'); navigate(`/admin/cursos/${c.id}`); if (f.dataset.id) render();
      }
      if (tipo === 'quiz') {
        const q = quizDesdeForm(f);
        const accion = (e as SubmitEvent).submitter?.getAttribute('value');
        if (accion === 'aprobar') {
          if (!q.preguntas.length) { toast('Agrega al menos una pregunta', 'alert-triangle'); return; }
          if (q.preguntas.some((p) => new Set(p.opciones.map((o) => o.toLowerCase())).size < 4)) { toast('Hay opciones repetidas en alguna pregunta', 'alert-triangle'); return; }
          q.estado = 'aprobado';
        } else q.estado = 'borrador';
        Datos.guardarQuiz(q); toast(q.estado === 'aprobado' ? 'Quiz aprobado · ya lo ven los miembros' : 'Borrador guardado'); render();
      }
      if (tipo === 'material') {
        const previo = Datos.materiales().find((m) => m.id === f.dataset.id);
        const titulo = String(d.get('titulo')).trim();
        const m: Material = { ...(previo || {}), id: f.dataset.id || slug(titulo), titulo, tipo: String(d.get('tipo')), categoria: String(d.get('categoria')).trim(),
          area: String(d.get('area')).trim(), autor: String(d.get('autor')).trim(), paginas: Number(d.get('paginas')) || 1, portada: String(d.get('portada')),
          cursoId: String(d.get('cursoId')) || null, descripcion: String(d.get('descripcion')).trim(), estado: String(d.get('estado')), url: String(d.get('url')).trim() };
        if (m.estado === 'disponible' && !m.url) { toast('Para marcarlo disponible indica el archivo', 'alert-triangle'); return; }
        Datos.guardarMaterial(m); toast('Material guardado'); navigate('/admin/materiales');
      }
      if (tipo === 'evento') {
        const previo = Datos.eventos().find((x) => x.id === f.dataset.id);
        const titulo = String(d.get('titulo')).trim();
        const ev: Evento = { ...(previo || {}), id: f.dataset.id || `${slug(titulo)}-${Date.now().toString(36)}`, titulo, ponente: String(d.get('ponente')).trim(),
          fecha: new Date(String(d.get('fecha'))).toISOString(), duracionMin: Number(d.get('duracionMin')) || 60, enlace: String(d.get('enlace')).trim(),
          cursoId: String(d.get('cursoId')) || undefined, publicado: d.get('publicado') === '1' };
        Datos.guardarEvento(ev); toast('Clase en vivo guardada', 'radio'); navigate('/admin/en-vivo');
      }
      if (tipo === 'cortesia') {
        const m = Datos.miembros().find((x) => x.uid === f.dataset.uid)!;
        const base = m.cortesiaHasta && new Date(m.cortesiaHasta).getTime() > Date.now() ? new Date(m.cortesiaHasta).getTime() : Date.now();
        m.cortesiaHasta = new Date(base + Number(d.get('dias')) * 864e5).toISOString(); m.cortesiaMotivo = String(d.get('motivo')).trim();
        Datos.guardarMiembro(m); toast('Cortesía otorgada', 'gift'); render();
      }
      if (tipo === 'aviso') {
        Datos.publicarAviso({ titulo: String(d.get('titulo')).trim(), texto: String(d.get('texto')).trim(), enlace: String(d.get('enlace')).trim() || undefined });
        toast('Aviso publicado', 'megaphone'); render();
      }
      if (tipo === 'config') {
        Datos.guardarConfig({ precioMensual: Number(d.get('precioMensual')), precioAnual: Number(d.get('precioAnual')), descuentoVIP: Number(d.get('descuentoVIP')),
          whatsappSoporte: String(d.get('whatsappSoporte')).trim(), canalWhatsApp: String(d.get('canalWhatsApp')).trim(), praxiaUrl: String(d.get('praxiaUrl')).trim() });
        toast('Ajustes guardados');
      }
      if (tipo === 'buscar-miembro') {
        const p = current().query; p.set('q', String(d.get('q'))); navigate('/admin/miembros?' + p.toString());
      }
    } catch (err) { console.error(err); }
  });

  document.addEventListener('click', async (e) => {
    const el = e.target as HTMLElement;
    if (!current().path.startsWith('/admin')) return;

    const pub = el.closest<HTMLElement>('[data-toggle-publicado]');
    if (pub) { const c = Datos.cursos().find((x) => x.id === pub.dataset.togglePublicado)!; c.publicado = c.publicado === false; Datos.guardarCurso(c); toast(c.publicado ? 'Curso publicado' : 'Curso oculto'); render(); }

    const mov = el.closest<HTMLElement>('[data-mover-curso]');
    if (mov) { const [id, dir] = mov.dataset.moverCurso!.split(':'); const ids = Datos.cursos().map((c) => c.id); const i = ids.indexOf(id); const j = i + Number(dir);
      if (j >= 0 && j < ids.length) { [ids[i], ids[j]] = [ids[j], ids[i]]; Datos.reordenarCursos(ids); render(); } }

    const ca = el.closest<HTMLElement>('[data-clase-accion]');
    if (ca) {
      const f = ca.closest('form') as HTMLFormElement; const c = cursoDesdeForm(f); const [acc, idx] = ca.dataset.claseAccion!.split(':'); const i = Number(idx);
      if (acc === 'agregar') c.clases.push({ n: c.clases.length + 1, titulo: `Clase ${c.clases.length + 1}`, videoId: '', duracion: null, gratis: c.clases.length === 0 });
      if (acc === 'quitar') { if (!confirm('¿Quitar esta clase del curso?')) return; c.clases.splice(i, 1); }
      if (acc === 'subir' && i > 0) [c.clases[i - 1], c.clases[i]] = [c.clases[i], c.clases[i - 1]];
      if (acc === 'bajar' && i < c.clases.length - 1) [c.clases[i + 1], c.clases[i]] = [c.clases[i], c.clases[i + 1]];
      c.clases.forEach((k, n) => (k.n = n + 1));
      if (!c.titulo) { toast('Escribe el título del curso primero', 'alert-triangle'); return; }
      Datos.guardarCurso(c); if (!f.dataset.id) navigate(`/admin/cursos/${c.id}`); else render();
    }

    const qa = el.closest<HTMLElement>('[data-quiz-accion]');
    if (qa) {
      const f = qa.closest('form') as HTMLFormElement; const q = quizDesdeForm(f); const [acc, idx] = qa.dataset.quizAccion!.split(':');
      if (acc === 'agregar') q.preguntas.push({ q: '', opciones: ['', '', '', ''], correcta: 0, explicacion: '' });
      if (acc === 'quitar') q.preguntas.splice(Number(idx), 1);
      q.estado = 'borrador'; Datos.guardarQuiz(q); render();
    }

    const dias = el.closest<HTMLElement>('[data-dias]');
    if (dias) { const inp = dias.closest('form')!.querySelector<HTMLInputElement>('[name="dias"]')!; inp.value = dias.dataset.dias!; }

    const rev = el.closest<HTMLElement>('[data-revocar-cortesia]');
    if (rev && confirm('¿Revocar la cortesía ahora?')) { const m = Datos.miembros().find((x) => x.uid === rev.dataset.revocarCortesia)!; m.cortesiaHasta = null; m.cortesiaMotivo = ''; Datos.guardarMiembro(m); toast('Cortesía revocada'); render(); }

    const bc = el.closest<HTMLElement>('[data-borrar-curso]');
    if (bc && confirm('¿Borrar este curso? No se puede deshacer.')) { Datos.borrarCurso(bc.dataset.borrarCurso!); toast('Curso borrado', 'trash-2'); navigate('/admin/cursos'); }
    const bm = el.closest<HTMLElement>('[data-borrar-material]');
    if (bm && confirm('¿Borrar este material?')) { Datos.borrarMaterial(bm.dataset.borrarMaterial!); toast('Material borrado', 'trash-2'); navigate('/admin/materiales'); }
    const be = el.closest<HTMLElement>('[data-borrar-evento]');
    if (be && confirm('¿Borrar esta clase en vivo?')) { Datos.borrarEvento(be.dataset.borrarEvento!); toast('Clase borrada', 'trash-2'); navigate('/admin/en-vivo'); }
    const ba = el.closest<HTMLElement>('[data-borrar-aviso]');
    if (ba && confirm('¿Borrar este aviso?')) { Datos.borrarAviso(ba.dataset.borrarAviso!); render(); }
    const oh = el.closest<HTMLElement>('[data-ocultar-hilo]');
    if (oh) { Comunidad.alternarOculto(oh.dataset.ocultarHilo!); render(); }
    if (el.closest('[data-restablecer-demo]') && confirm('Esto borra todos los cambios hechos en el demo. ¿Continuar?')) { Datos.restablecerDemo(); toast('Demo restablecido', 'rotate-ccw'); render(); }
  });

  document.addEventListener('change', async (e) => {
    const inp = e.target as HTMLInputElement;
    if (!inp.matches('[data-subir-imagen]') || !inp.files?.[0]) return;
    const campo = inp.dataset.subirImagen!;
    const form = inp.closest('form')!;
    try {
      const url = await imagenAWebp(inp.files[0]);
      form.querySelector<HTMLInputElement>(`input[name="${campo}"]`)!.value = url;
      form.querySelector<HTMLImageElement>(`[data-preview="${campo}"]`)!.src = url;
      toast('Imagen lista · guarda para aplicar', 'image');
    } catch { toast('No se pudo leer la imagen', 'alert-triangle'); }
  });
}
