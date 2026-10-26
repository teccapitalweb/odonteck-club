import { readFileSync } from 'node:fs';
const plantillas = JSON.parse(
  readFileSync(
    new URL('../../private/recompensas/plantillas.json', import.meta.url),
    'utf8',
  ),
);
const esc = (s) =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  );
export const tienePlantilla = (id) => Object.hasOwn(plantillas, id);
export function archivoRecompensa(id) {
  const p = plantillas[id];
  if (!p) return null;
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>${esc(p.titulo)} · OdonTeck</title><style>
*{box-sizing:border-box}body{margin:0;background:#f5f4ef;color:#172d46;font:16px/1.6 system-ui,sans-serif}main{max-width:1080px;margin:30px auto;background:white;padding:48px;border-radius:24px;border:1px solid #d8e1e7}header{border-bottom:3px solid #329391;padding-bottom:24px;margin-bottom:28px}.brand{letter-spacing:.18em;font-size:12px;color:#317c8d;font-weight:800}h1{font-size:34px;line-height:1.15;margin:12px 0}h2{font-size:19px;margin:30px 0 10px}p{color:#4d6072}.tools{position:sticky;top:0;display:flex;gap:10px;padding:12px;background:#132f4b;color:white;align-items:center;flex-wrap:wrap}button{border:0;border-radius:9px;background:#e4f3f0;color:#14344c;padding:10px 15px;font-weight:700;cursor:pointer}.tools span{font-size:13px}table{width:100%;border-collapse:collapse;font-size:14px}th{background:#e9f4f3;text-align:left}th,td{padding:12px;border:1px solid #cad8df;min-width:95px}td{height:48px;vertical-align:top}[contenteditable]:focus{outline:2px solid #329391;outline-offset:2px}.table-wrap{overflow-x:auto}.hint{font-size:13px;background:#f0f5f7;padding:16px;border-radius:12px}footer{margin-top:40px;border-top:1px solid #ccd8df;padding-top:16px;font-size:12px;color:#607382}.add{margin-top:8px;font-size:12px}@media(max-width:650px){main{padding:22px;margin:14px}h1{font-size:27px}}@media print{body{background:white}.tools,.add{display:none}main{border:0;padding:0;margin:0;max-width:none}h2{break-after:avoid}tr{break-inside:avoid}table{font-size:10px}th,td{min-width:0;padding:7px}header{margin-bottom:18px}}
</style></head><body><nav class="tools"><button id="save">Guardar copia editada</button><button id="print">Imprimir / PDF</button><span>Haz clic en las celdas para escribir. Guarda una copia antes de cerrar.</span></nav><main><header><div class="brand">ODONTECK CLUB · COLECCIÓN PROFESIONAL</div><h1 contenteditable="true">${esc(p.titulo)}</h1><p>${esc(p.objetivo)}</p><p contenteditable="true">Nombre: ____________________ &nbsp; Fecha / periodo: ____________________</p></header><p class="hint">Plantilla de uso personal. Puedes editar títulos y celdas, añadir filas y guardar una nueva copia HTML que conserva tus cambios. El archivo funciona sin conexión y no envía tus datos a OdonTeck.</p>${p.secciones.map((s) => `<section><h2 contenteditable="true">${esc(s.titulo)}</h2><div class="table-wrap"><table><thead><tr>${s.columnas.map((c) => `<th contenteditable="true">${esc(c)}</th>`).join('')}</tr></thead><tbody>${Array.from({ length: s.filas }, () => `<tr>${s.columnas.map(() => '<td contenteditable="true"><br></td>').join('')}</tr>`).join('')}</tbody></table></div><button class="add" type="button">Añadir fila</button></section>`).join('')}<section><h2>Cómo aprovechar esta plantilla</h2><ul>${p.consejos.map((c) => `<li>${esc(c)}</li>`).join('')}</ul></section><footer>OdonTeck Club · Plantilla original de organización y desarrollo profesional. No sustituye asesoramiento clínico, jurídico o contable. No incluyas datos identificables de pacientes.</footer></main><script>
document.querySelectorAll('.add').forEach(b=>b.onclick=()=>{const t=b.previousElementSibling.querySelector('tbody');const row=t.lastElementChild.cloneNode(true);row.querySelectorAll('td').forEach(c=>c.innerHTML='<br>');t.appendChild(row)});
document.getElementById('print').onclick=()=>window.print();
document.getElementById('save').onclick=()=>{const copy=document.documentElement.cloneNode(true),originals=document.querySelectorAll('[contenteditable]');copy.querySelectorAll('[contenteditable]').forEach((e,i)=>{e.textContent=originals[i].innerText;e.style.whiteSpace='pre-wrap'});const data='<!doctype html>'+copy.outerHTML;const u=URL.createObjectURL(new Blob([data],{type:'text/html;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download='${id}-editado.html';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000)};
document.addEventListener('paste',ev=>{if(!ev.target.closest('[contenteditable]'))return;ev.preventDefault();document.execCommand('insertText',false,ev.clipboardData.getData('text/plain'))});
</script></body></html>`;
}
