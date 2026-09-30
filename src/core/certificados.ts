export interface CertificadoRemoto {
  folio: string;
  uid: string;
  nombre: string;
  cursoId: string;
  cursoTitulo: string;
  area: string;
  clases: number;
  emitido: string;
}

let certificados: CertificadoRemoto[] = [];

export const Certificados = {
  hidratar(lista: CertificadoRemoto[]) { certificados = Array.isArray(lista) ? lista : []; },
  listar() { return certificados; },
  deCurso(cursoId: string) { return certificados.find((c) => c.cursoId === cursoId); },
};
