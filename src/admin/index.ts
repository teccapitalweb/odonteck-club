// Punto de entrada del panel admin. main.ts lo carga con import() dinámico, de
// modo que todo el código del panel (shell, acciones, contenido y gestión) queda
// en su propio chunk y no pesa en el bundle de los miembros, que nunca lo usan.
export { adminShellHTML, marcarAdminActivo } from './shell';
export { adminRecompensas } from './recompensas';
export { instalarAccionesAdmin } from './acciones';
export { adminCursos, adminCurso, adminQuizzes, adminQuiz, adminMateriales, adminMaterial, adminEnVivo, adminEvento } from './contenido';
export { adminResumen, adminMiembros, adminMiembro, adminComunidad, adminAvisos, adminAjustes, adminEncuestas, adminCupones } from './gestion';

export { adminBitacora } from './bitacora';
