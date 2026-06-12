import dotenv from 'dotenv';
import path from 'path';

// Pre-load environment configuration before anything else
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from './app';
import { startQualityCron } from './cron/qualityGateCron';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor ejecutándose exitosamente en http://localhost:${PORT}`);
  console.log(`📂 Repositorio de evidencias estáticas expuesto en http://localhost:${PORT}/uploads`);
  
  // Start automated quality gate checks
  startQualityCron();
});
