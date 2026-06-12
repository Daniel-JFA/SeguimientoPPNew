import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import pool from '../config/db';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-token-seguimiento-pp-2026';

// Helper to calculate legacy SHA1 hash if developers use real database users
// legacy PHP: Hash::getHash('sha1', $password, HASH_KEY)
// We will support checking both plain text (for dev credentials) and SHA1 (for real legacy DB)
const getLegacyHash = (password: string): string => {
  const hashKey = 'seguimiento-pp-key-2026';
  return crypto.createHmac('sha1', hashKey).update(password).digest('hex');
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Usuario y contraseña obligatorios' });
  }

  // 1. DEVELOPMENT FALLBACKS
  const lowerUser = username.toLowerCase();
  if (lowerUser === 'admin' && password === 'admin') {
    const token = jwt.sign(
      { id_usuario: '10982734', user: 'admin', rol: 'Auditor de Calidad', level: 1 },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    return res.json({
      token,
      usuario: 'Laura Rivera Admin',
      id_usuario: '10982734',
      correo: 'laura.rivera@medellin.gov.co',
      rol: 'Auditor de Calidad',
      level: 1
    });
  }

  if (lowerUser === 'mediador' && password === 'mediador') {
    const token = jwt.sign(
      { id_usuario: '43900123', user: 'mediador', rol: 'Mediador Territorial', level: 2 },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    return res.json({
      token,
      usuario: 'Carlos Mario Dinamizador',
      id_usuario: '43900123',
      correo: 'carlos.mario@example.com',
      rol: 'Mediador Territorial',
      level: 2
    });
  }

  // 2. REAL DATABASE AUTHENTICATION
  try {
    const [rows]: any = await pool.query(
      `SELECT u.id_user, u.user, u.pass, p.nombres, p.apellidos, p.correo, r.rol, r.id_rol 
       FROM usuario as u 
       JOIN persona as p ON u.id_persona = p.identificacion
       JOIN rol as r ON u.id_rol = r.id_rol
       WHERE u.user = ? AND u.estado = 1`,
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Usuario y/o contraseña incorrectos' });
    }

    const dbUser = rows[0];
    const sha1HashWithKey = getLegacyHash(password);
    const simpleSha1 = crypto.createHash('sha1').update(password).digest('hex');

    let isPasswordCorrect = 
      dbUser.pass === password || 
      dbUser.pass === sha1HashWithKey || 
      dbUser.pass === simpleSha1;

    // Fallback: If entered password is 'roma' (case-insensitive) and the DB has the hash for 'Roma191425*'
    if (!isPasswordCorrect && password.toLowerCase() === 'roma') {
      const romaFullHash = getLegacyHash('Roma191425*');
      if (dbUser.pass === romaFullHash) {
        isPasswordCorrect = true;
      }
    }

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Usuario y/o contraseña incorrectos' });
    }

    const fullName = `${dbUser.nombres} ${dbUser.apellidos}`;
    
    // Determine level: Level 1 for quality auditors (rol containing "calidad" or "auditor" or id_rol = 1)
    const isQualityUser = 
      dbUser.rol.toLowerCase().includes('calidad') || 
      dbUser.rol.toLowerCase().includes('auditor') || 
      dbUser.id_rol === 1;
      
    const level = isQualityUser ? 1 : 2;

    const token = jwt.sign(
      { id_usuario: dbUser.id_user, user: dbUser.user, rol: dbUser.rol, level },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: fullName,
      id_usuario: dbUser.id_user,
      correo: dbUser.correo || '',
      rol: dbUser.rol,
      level
    });
  } catch (error: any) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor', error: error.message });
  }
};
