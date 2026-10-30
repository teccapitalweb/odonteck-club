// Pure replay shared by the browser and the API. Scores are derived from valid moves.
export const VERSION_JUEGOS = 2;
export function reproducirPartida(g, eventos = []) {
  if (!Array.isArray(eventos) || eventos.length > 1200 || JSON.stringify(eventos).length > 90000) throw Error('Partida demasiado larga. Empieza un nuevo intento.');
  const s = { orden: [...g.rompecabezasImagen.ordenInicial], encontradas: [], pares: [], ronda: 0, letras: [], palabra: '', aciertos: 0, errores: 0, ayudas: 0, fallosRonda: 0, terminada: false, mensaje: '', puntaje: 0 };
  if(g.tipo==='rompecabezas')s.aciertos=s.orden.filter((id,i)=>id===i).length;
  const requerir = (ok) => { if (!ok) throw Error('La jugada no corresponde a esta partida.'); };
  for (const a of eventos) {
    requerir(a && typeof a === 'object' && !s.terminada);
    const campos={cambiar:['tipo','x','y'],ayuda:['tipo'],buscar:['tipo','celdas'],letra:['tipo','letra'],siguiente:['tipo'],par:['tipo','x','y'],borrar:['tipo'],comprobar:['tipo']}[a.tipo];
    requerir(campos && Object.keys(a).every(k=>campos.includes(k)));
    s.mensaje = '';
    if (g.tipo === 'rompecabezas') {
      let x = a.x, y = a.y;
      if (a.tipo === 'ayuda') { x = s.orden.findIndex((id, i) => id !== i); y = s.orden.indexOf(x); s.ayudas++; }
      else requerir(a.tipo === 'cambiar');
      requerir(Number.isInteger(x) && Number.isInteger(y) && x >= 0 && y >= 0 && x < 16 && y < 16 && x !== y);
      const antes = s.orden.filter((id,i)=>id===i).length;
      [s.orden[x],s.orden[y]] = [s.orden[y],s.orden[x]];
      const despues = s.orden.filter((id,i)=>id===i).length;
      if (a.tipo !== 'ayuda' && despues <= antes) s.errores++;
      s.aciertos = despues; s.terminada = despues === 16;
    } else if (g.tipo === 'sopa') {
      if (a.tipo === 'ayuda') { s.ayudas++; s.mensaje = 'Busca el inicio resaltado.'; }
      else {
        requerir(a.tipo === 'buscar' && Array.isArray(a.celdas) && a.celdas.length >= 2 && a.celdas.length <= 15 && a.celdas.every(x=>typeof x==='string'&&/^\d{1,2}:\d{1,2}$/.test(x)));
        const p = g.sopa.palabras.find(p => !s.encontradas.includes(p.id) && (p.celdas.join('|') === a.celdas.join('|') || [...p.celdas].reverse().join('|') === a.celdas.join('|')));
        if (p) { s.encontradas.push(p.id); s.aciertos++; s.mensaje = p.pista; } else { s.errores++; s.mensaje = 'Esa selección no coincide. Vuelve a intentarlo.'; }
        s.terminada = s.encontradas.length === g.sopa.palabras.length;
      }
    } else if (g.tipo === 'ahorcado') {
      const p = g.ahorcado[s.ronda]; requerir(!!p);
      const ganada = [...p.palabra].every(l=>s.letras.includes(l));
      if (a.tipo === 'siguiente') {
        requerir(ganada || s.fallosRonda >= 6);
        if (ganada) s.aciertos++;
        s.ronda++; s.letras=[]; s.fallosRonda=0;
        s.terminada = s.ronda === g.ahorcado.length;
      } else {
        requerir(!ganada && s.fallosRonda < 6);
        const letra = a.tipo === 'ayuda' ? [...p.palabra].find(l=>!s.letras.includes(l)) : a.letra;
        requerir(['letra','ayuda'].includes(a.tipo) && /^[A-ZÑ]$/.test(letra) && !s.letras.includes(letra));
        if (a.tipo === 'ayuda') s.ayudas++;
        s.letras.push(letra);
        if (!p.palabra.includes(letra)) { s.fallosRonda++; s.errores++; }
      }
    } else if (g.tipo === 'memorama') {
      requerir(a.tipo === 'par' && a.x !== a.y);
      const x=g.memorama.find(c=>c.uid===a.x), y=g.memorama.find(c=>c.uid===a.y);
      requerir(x && y && !s.pares.includes(x.parId) && !s.pares.includes(y.parId));
      if (x.parId===y.parId) { s.pares.push(x.parId); s.aciertos++; s.mensaje = g.terminos.find(t=>t.id===x.parId)?.pista || 'Pareja correcta.'; }
      else { s.errores++; s.mensaje='Estas tarjetas no forman pareja. Léelas y vuelve a intentar.'; }
      s.terminada=s.pares.length===g.memorama.length/2;
    } else if (g.tipo === 'palabra') {
      const p=g.retosPalabra[s.ronda]; requerir(!!p);
      if (a.tipo==='letra') {
        requerir(/^[A-Z]$/.test(a.letra) && s.palabra.length<p.palabra.length && [...s.palabra].filter(l=>l===a.letra).length < [...p.palabra].filter(l=>l===a.letra).length);
        s.palabra+=a.letra;
      } else if (a.tipo==='borrar') s.palabra=s.palabra.slice(0,-1);
      else if (a.tipo==='ayuda') {
        let i=0;while(i<s.palabra.length && s.palabra[i]===p.palabra[i])i++;
        requerir(i<p.palabra.length);s.palabra=p.palabra.slice(0,i+1);s.ayudas++;
      } else if(a.tipo==='comprobar') {
        requerir(s.palabra.length===p.palabra.length);
        if(s.palabra===p.palabra){s.aciertos++;s.ronda++;s.palabra='';s.terminada=s.ronda===g.retosPalabra.length;s.mensaje=p.pistaCompleta;}
        else{s.errores++;s.mensaje='Todavía no coincide con la pista. Reordena las letras.';}
      } else requerir(false);
    } else requerir(false);
  }
  const base = g.tipo === 'ahorcado' ? g.ahorcado.length : s.aciertos;
  s.puntaje = s.terminada ? Math.round(100*s.aciertos/Math.max(1,base+s.errores+s.ayudas)) : 0;
  return s;
}
