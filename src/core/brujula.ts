export interface AfinidadBrujula { id: string; etiqueta: string; puntaje: number; afinidad?: number }
export interface ResultadoBrujula { version: number; areas: AfinidadBrujula[]; estilos: AfinidadBrujula[]; alcance: 'orientacion_no_diagnostica' }

export const AREAS_BRUJULA: Record<string, string> = {
  diagnostico: 'Diagnóstico y cariología', ortodoncia: 'Ortodoncia', endodoncia: 'Endodoncia', restauradora: 'Odontología restauradora',
  estetica: 'Estética dental', cirugia: 'Cirugía bucal', periodoncia: 'Periodoncia', pediatria: 'Odontopediatría',
  rehabilitacion: 'Rehabilitación oral', medicina_bucal: 'Medicina bucal',
};
export const ESTILOS_BRUJULA: Record<string, string> = {
  analitico: 'Análisis clínico', manual: 'Precisión manual', comunicacion: 'Comunicación y confianza',
  planificacion: 'Planificación de largo plazo', urgencias: 'Resolución bajo presión', docencia: 'Docencia e investigación',
};

const P: Record<string, Record<string, { a: string[]; e: string[] }>> = {
  problema: { patrones:{a:['diagnostico','medicina_bucal'],e:['analitico']}, transformar:{a:['restauradora','estetica'],e:['manual']}, precision:{a:['endodoncia','restauradora'],e:['manual','analitico']}, plan:{a:['ortodoncia','rehabilitacion'],e:['planificacion']} },
  jornada: { planificada:{a:['ortodoncia','rehabilitacion'],e:['planificacion']}, variada:{a:['diagnostico','restauradora'],e:['analitico','comunicacion']}, intensa:{a:['cirugia','endodoncia'],e:['urgencias','manual']}, acompanamiento:{a:['pediatria','periodoncia'],e:['comunicacion','planificacion']} },
  detalle: { imagenes:{a:['diagnostico','medicina_bucal'],e:['analitico']}, simetria:{a:['estetica','ortodoncia'],e:['manual']}, tejidos:{a:['periodoncia','medicina_bucal'],e:['analitico']}, oclusion:{a:['rehabilitacion','ortodoncia'],e:['planificacion']} },
  resultado: { dolor:{a:['endodoncia','cirugia'],e:['urgencias']}, sonrisa:{a:['estetica','restauradora'],e:['manual']}, crecimiento:{a:['pediatria','ortodoncia'],e:['comunicacion','planificacion']}, funcion:{a:['rehabilitacion','periodoncia'],e:['planificacion']} },
  pacientes: { ninos:{a:['pediatria'],e:['comunicacion']}, ansiosos:{a:['restauradora','endodoncia'],e:['comunicacion']}, complejos:{a:['diagnostico','medicina_bucal'],e:['analitico']}, seguimiento:{a:['periodoncia','rehabilitacion'],e:['planificacion','comunicacion']} },
  aprender: { casos:{a:['diagnostico','medicina_bucal'],e:['analitico']}, protocolos:{a:['endodoncia','cirugia'],e:['planificacion']}, simulacion:{a:['restauradora','cirugia'],e:['manual']}, visual:{a:['estetica','ortodoncia'],e:['manual']}, evidencia:{a:['medicina_bucal','periodoncia'],e:['docencia','analitico']} },
  proyecto: { integral:{a:['diagnostico','restauradora'],e:['comunicacion']}, estudio:{a:['estetica','rehabilitacion'],e:['manual','planificacion']}, quirurgico:{a:['cirugia','endodoncia'],e:['urgencias','manual']}, academia:{a:['medicina_bucal','pediatria'],e:['docencia','comunicacion']} },
};
const F: Record<string, string> = { analisis:'analitico', manos:'manual', explicar:'comunicacion', organizar:'planificacion', presion:'urgencias', investigar:'docencia' };

export function calcularBrujula(respuestas: Record<string, unknown>): ResultadoBrujula {
  const areas: Record<string, number> = {}, estilos: Record<string, number> = {};
  const sumar = (m: Record<string, number>, ids: string[], n=1) => ids.forEach((id) => { m[id]=(m[id]||0)+n; });
  Object.entries(P).forEach(([q, opciones]) => { const s=opciones[String(respuestas[q]||'')]; if(s){sumar(areas,s.a,2);sumar(estilos,s.e,2);} });
  (Array.isArray(respuestas.fortalezas) ? respuestas.fortalezas : []).forEach((v) => { const e=F[String(v)]; if(e) sumar(estilos,[e],2); });
  const ordenar=(m:Record<string,number>, etiquetas:Record<string,string>, n:number)=>Object.entries(etiquetas).map(([id,etiqueta])=>({id,etiqueta,puntaje:m[id]||0})).sort((a,b)=>b.puntaje-a.puntaje||a.etiqueta.localeCompare(b.etiqueta,'es')).slice(0,n);
  const top=ordenar(areas,AREAS_BRUJULA,3), max=Math.max(1,...top.map((x)=>x.puntaje));
  return { version:1, areas:top.map((x)=>({...x,afinidad:Math.round(x.puntaje/max*100)})), estilos:ordenar(estilos,ESTILOS_BRUJULA,3), alcance:'orientacion_no_diagnostica' };
}
