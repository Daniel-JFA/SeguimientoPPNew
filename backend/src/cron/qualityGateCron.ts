import pool from '../config/db';

export const runQualityGateCheck = async () => {
  console.log('⏰ Iniciando verificación automática de calidad (Calidad Gate - 48 Horas)...');
  
  try {
    // 1. Replicar 48horas_cron.php:
    // Buscar eventos creados hace más de 48 horas (2 días) que estén sin revisar (color #3182ce o nulo)
    // o en revisión (#fdcae1) pero sin evidencias suficientes cargadas (anexosscore nulo o vacío).
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10);
    
    // Buscar id_evento de las sesiones que no cumplen
    const [expiredSessions]: any = await pool.query(
      `SELECT s.id_evento, s.id_sesion, s.anexoscore, e.color 
       FROM sesiones as s
       JOIN eventos as e ON s.id_evento = e.id_evento
       WHERE e.fechaevent <= ? AND (s.anexoscore IS NULL OR s.anexoscore = '' OR s.anexoscore NOT LIKE '%FO-GINF-093%')
       AND e.color != '#D97866'`,
      [twoDaysAgo]
    );

    if (expiredSessions.length > 0) {
      console.log(`⚠️ Se encontraron ${expiredSessions.length} sesiones vencidas sin evidencias. Marcando como No Conforme.`);
      
      for (const ses of expiredSessions) {
        // Marcar evento como No Conforme (#D97866) con la razón
        await pool.query(
          `UPDATE eventos 
           SET color = '#D97866', tiponoConforme = 'Sin evidencias', mtvonoconfome = 'Expiró el límite de 48 horas para subir el formato FO-GINF-093' 
           WHERE id_evento = ?`,
          [ses.id_evento]
        );
        
        // Registrar en observaciones de calidad de la sesión
        await pool.query(
          `UPDATE sesiones 
           SET observacioncalidad = 'Marcado por el sistema: No se cargaron evidencias a tiempo (48h)' 
           WHERE id_sesion = ?`,
          [ses.id_sesion]
        );
      }
    } else {
      console.log('✅ Todos los eventos en curso cumplen los plazos de evidencias.');
    }

    // 2. Replicar cierremes_cron.php:
    // Buscar cierres del mes. Si estamos a fin de mes, cualquier sesión anterior que quede en revisión (#fdcae1)
    // o con anomalías, se congela y notifica al mediador.
    // (Lógica complementaria ejecutable periódicamente)

  } catch (error: any) {
    console.error('❌ Error en el proceso automático de compuertas de calidad:', error.message);
  }
};

// Programar ejecución cada 12 horas
export const startQualityCron = () => {
  const TWELVE_HOURS = 12 * 60 * 60 * 1000;
  
  // Ejecutar inmediatamente al arrancar el servidor
  runQualityGateCheck();
  
  setInterval(() => {
    runQualityGateCheck();
  }, TWELVE_HOURS);
};
