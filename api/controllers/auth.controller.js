// api/controllers/auth.controller.js
// NOTE: users[] is an in-memory store – will be replaced by PostgreSQL in Step 6.

import bcrypt from 'bcryptjs';
import jwt    from 'jsonwebtoken';
import crypto from 'crypto';

const users = [];

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'freetime_dev_secret',
    { expiresIn: '30d' }
  );
}

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────
export async function register(req, res) {
  try {
    const {
      email, password, googleId,
      name, lastName, phone, city, department, municipality,
      birthdate, role,
      photoBase64, photoURL,
    } = req.body;

    if (!email || !name || !lastName || !role) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    if (!['FREETIMER', 'FULLTIMER'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido.' });
    }

    // One email = one account. Period.
    const exists = users.find((u) => u.email === email);
    if (exists) {
      // If this is a Google user trying to re-register, just log them in
      if (googleId && exists.googleId === googleId) {
        const token = generateToken(exists);
        const { password: _, ...safe } = exists;
        return res.status(200).json({ message: 'Sesión iniciada.', user: { ...safe, token } });
      }
      return res.status(409).json({ message: 'Ya existe una cuenta con este email.' });
    }

    const rawPassword    = password || crypto.randomBytes(32).toString('hex');
    const hashedPassword = await bcrypt.hash(rawPassword, 12);

    const newUser = {
      id:           `user_${Date.now()}`,
      email,
      password:     hashedPassword,
      googleId:     googleId   || null,
      name,
      lastName,
      phone:        phone      || '',
      city:         city       || '',
      department:   department || '',
      municipality: municipality || '',
      birthdate:    birthdate  || '',
      role,
      photoURL:     photoURL    || null,
      photoBase64:  photoBase64 || null,
      rating:         5.0,
      tasksCompleted: 0,
      skills:         [],
      badges:         ['Principiante'],
      verified:       !!googleId,
      createdAt:      new Date().toISOString(),
    };

    users.push(newUser);

    const token = generateToken(newUser);
    const { password: _, ...userWithoutPassword } = newUser;

    return res.status(201).json({
      message: 'Cuenta creada exitosamente.',
      user: { ...userWithoutPassword, token },
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
}

// ─────────────────────────────────────────────
// POST /api/auth/login  (manual)
// ─────────────────────────────────────────────
export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }

    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos.' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos.' });
    }

    const token = generateToken(user);
    const { password: _, ...safe } = user;
    return res.status(200).json({ message: 'Sesión iniciada exitosamente.', user: { ...safe, token } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
}

// ─────────────────────────────────────────────
// POST /api/auth/google-login
// Looks up by email only. Role is returned from
// whatever the account was registered with.
// ─────────────────────────────────────────────
export async function googleLogin(req, res) {
  try {
    const { googleId, email } = req.body;

    if (!googleId || !email) {
      return res.status(400).json({ message: 'googleId y email son requeridos.' });
    }

    // Find by email — one email = one account = one role, no ambiguity
    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(404).json({
        message: 'No encontramos una cuenta con este correo de Google. ¿Ya te registraste?',
      });
    }

    // Optionally attach googleId if this user registered manually and is now using Google
    if (!user.googleId) {
      user.googleId = googleId;
    }

    const token = generateToken(user);
    const { password: _, ...safe } = user;
    return res.status(200).json({ message: 'Sesión iniciada exitosamente.', user: { ...safe, token } });
  } catch (err) {
    console.error('Google login error:', err);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
}

// ─────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────
export function getMe(req, res) {
  return res.status(200).json({ user: req.user });
}