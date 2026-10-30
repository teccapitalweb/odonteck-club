# Retos: premios y verificación

El Banco clínico entrega 10 XP y 10 OdonCoins por respuesta correcta, o 2 por intento no correcto, en el primer intento de cada pregunta por día UTC. Las repeticiones del día se guardan para práctica sin premio adicional. El marcador de velocidad y combo es distinto del monedero.

Las respuestas se califican en el servidor. El registro del intento, XP y movimiento de OdonCoins se escribe en una transacción. El identificador opcional de intento permite recuperar una respuesta tras una pérdida de conexión sin volver a sumar estadísticas ni monedas. Reutilizarlo con otra respuesta se rechaza.

La migración de XP anteriores calcula dentro de la transacción únicamente la diferencia aún no acreditada, manteniendo el límite histórico de 5000. No se modifican retroactivamente saldos de miembros.

Detective Dental y Flashcards son práctica local: la interfaz lo declara y no promete OdonCoins ni XP sincronizados. El logro Retador constante se desbloquea al acumular 100 puntos en el Banco clínico.

Verificación: pruebas de rutas para acierto, error, repetición, día siguiente, identidad, migración y logro; prueba con Firestore emulado para concurrencia y reenvío; revisión móvil con pérdida simulada de respuesta después de guardar. La consulta de producción es solo lectura y no completa retos de miembros reales.
