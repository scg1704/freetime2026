// api/controllers/auth.controller.js
// Store in-memory — se reemplazará por PostgreSQL más adelante.

import bcrypt   from 'bcryptjs';
import jwt      from 'jsonwebtoken';
import crypto   from 'crypto';
import nodemailer from 'nodemailer';

const users      = [];   // store de usuarios
const codeCodes  = [];   // store de códigos de verificación

// ─────────────────────────────────────────────
// Configuración de Nodemailer (Gmail)
// Variables de entorno requeridas en .env:
//   EMAIL_USER=tucuenta@gmail.com
//   EMAIL_PASS=xxxx xxxx xxxx xxxx  (App Password de Google)
// ─────────────────────────────────────────────
function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'freetime_dev_secret',
    { expiresIn: '30d' }
  );
}

function generateCode() {
  // 6 dígitos, con cero a la izquierda si es necesario
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ─────────────────────────────────────────────
// POST /api/auth/send-code
// Genera y envía un código de 6 dígitos al email del usuario.
// El código expira en 10 minutos.
// ─────────────────────────────────────────────
export async function sendVerificationCode(req, res) {
  try {
    const userId = req.user.id;
    const user   = users.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });
    if (user.verified) return res.status(400).json({ message: 'Esta cuenta ya está verificada.' });

    const code      = generateCode();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutos

    // Eliminar códigos anteriores del mismo usuario
    const prevIdx = codeCodes.findIndex((c) => c.userId === userId);
    if (prevIdx !== -1) codeCodes.splice(prevIdx, 1);
    codeCodes.push({ userId, code, expiresAt, attempts: 0 });

    // Enviar email
    const transporter = createTransporter();
    await transporter.sendMail({
      from:    `"FreeTime" <${process.env.EMAIL_USER}>`,
      to:      user.email,
      subject: 'Tu código de verificación FreeTime',
      html: `
        <div style="font-family:sans-serif;max-width:420px;margin:auto;padding:32px 24px;background:#fff;border-radius:16px;border:1px solid #ede9fe">
          <img src="https://res.cloudinary.com/djhzmob44/image/upload/v1775446214/FTLOGO3-removebg-preview_j1yad7.png" alt="FreeTime" style="height:48px;margin-bottom:24px;display:block />
          <h2 style="margin:0 0 8px;font-size:22px;color:#1a1a2e">Verifica tu correo</h2>
          <p style="color:#6b7280;font-size:14px;margin:0 0 28px">
            Usa el siguiente código para verificar tu cuenta de FreeTime.<br/>
            <strong>Expira en 10 minutos.</strong>
          </p>
          <div style="background:#f5f3ff;border-radius:12px;padding:20px;text-align:center;margin-bottom:28px">
            <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#6d28d9">${code}</span>
          </div>
          <p style="color:#9ca3af;font-size:12px;margin:0">
            Si no creaste una cuenta en FreeTime, ignora este correo.
          </p>
        </div>
      `,
    });

    return res.status(200).json({ message: 'Código enviado al correo.' });
  } catch (err) {
    console.error('sendVerificationCode error:', err);
    return res.status(500).json({ message: 'No se pudo enviar el correo. Revisa la configuración de EMAIL_USER y EMAIL_PASS en el .env.' });
  }
}

// ─────────────────────────────────────────────
// POST /api/auth/confirm-code
// Valida el código ingresado por el usuario.
// Máximo 5 intentos antes de invalidar el código.
// ─────────────────────────────────────────────
export async function confirmVerificationCode(req, res) {
  try {
    const userId = req.user.id;
    const { code } = req.body;

    if (!code || String(code).length !== 6) {
      return res.status(400).json({ message: 'Código inválido.' });
    }

    const entry = codeCodes.find((c) => c.userId === userId);

    if (!entry) {
      return res.status(400).json({ message: 'No hay un código activo. Solicita uno nuevo.' });
    }

    if (Date.now() > entry.expiresAt) {
      codeCodes.splice(codeCodes.indexOf(entry), 1);
      return res.status(400).json({ message: 'El código expiró. Solicita uno nuevo.' });
    }

    entry.attempts += 1;
    if (entry.attempts > 5) {
      codeCodes.splice(codeCodes.indexOf(entry), 1);
      return res.status(400).json({ message: 'Demasiados intentos incorrectos. Solicita un código nuevo.' });
    }

    if (entry.code !== String(code)) {
      const remaining = 5 - entry.attempts;
      return res.status(400).json({
        message: `Código incorrecto. Te quedan ${remaining} intento${remaining !== 1 ? 's' : ''}.`,
      });
    }

    // ✓ Código correcto
    codeCodes.splice(codeCodes.indexOf(entry), 1);

    const user = users.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

    user.verified   = true;
    user.verifiedAt = new Date().toISOString();

    const token = generateToken(user);
    const { password: _, ...safe } = user;

    return res.status(200).json({
      message: 'Correo verificado exitosamente.',
      user: { ...safe, token },
    });
  } catch (err) {
    console.error('confirmVerificationCode error:', err);
    return res.status(500).json({ message: 'Error interno.' });
  }
}

// ─────────────────────────────────────────────
// POST /api/auth/verify  (verificación biométrica — para el perfil)
// ─────────────────────────────────────────────
export async function verifyUser(req, res) {
  try {
    const userId = req.user.id;
    const user   = users.find((u) => u.id === userId);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado.' });

    user.verified   = true;
    user.verifiedAt = new Date().toISOString();

    const token = generateToken(user);
    const { password: _, ...safe } = user;
    return res.status(200).json({ message: 'Verificado.', user: { ...safe, token } });
  } catch (err) {
    console.error('Verify error:', err);
    return res.status(500).json({ message: 'Error interno.' });
  }
}

// ─────────────────────────────────────────────
// POST /api/auth/register
// ─────────────────────────────────────────────
export async function register(req, res) {
  try {
    const {
      email, password, googleId,
      name, lastName, phone, department, municipality,
      birthdate, role, photoBase64, photoURL,
    } = req.body;

    if (!email || !name || !lastName || !role) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }
    if (!['FREETIMER', 'FULLTIMER'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido.' });
    }

    const exists = users.find((u) => u.email === email);
    if (exists) {
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
      googleId:     googleId    || null,
      name,
      lastName,
      phone:        phone        || '',
      department:   department   || '',
      municipality: municipality || '',
      birthdate:    birthdate    || '',
      role,
      photoURL:     photoURL     || null,
      photoBase64:  photoBase64  || null,
      rating:         5.0,
      tasksCompleted: 0,
      skills:         [],
      badges:         ['Principiante'],
      // Google users: email already verified by Google → skip email verification
      // Manual users: must verify email before accessing dashboard
      verified:  true, //!!googleId
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    const token = generateToken(newUser);
    const { password: _p, ...safe } = newUser;

    return res.status(201).json({ message: 'Cuenta creada exitosamente.', user: { ...safe, token } });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Error interno.' });
  }
}

// ─────────────────────────────────────────────
// POST /api/auth/login
// ─────────────────────────────────────────────
export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }
    const user = users.find((u) => u.email === email);
    if (!user) return res.status(401).json({ message: 'Email o contraseña incorrectos.' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Email o contraseña incorrectos.' });

    const token = generateToken(user);
    const { password: _, ...safe } = user;
    return res.status(200).json({ message: 'Sesión iniciada.', user: { ...safe, token } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Error interno.' });
  }
}

// ─────────────────────────────────────────────
// POST /api/auth/google-login
// ─────────────────────────────────────────────
export async function googleLogin(req, res) {
  try {
    const { email, googleId, name, lastName, photoURL, role } = req.body;
    if (!email || !googleId) {
      return res.status(400).json({ message: 'Datos de Google incompletos.' });
    }

    let user = users.find((u) => u.email === email);
    if (user) {
      if (!user.googleId) user.googleId = googleId;
      const token = generateToken(user);
      const { password: _, ...safe } = user;
      return res.status(200).json({ message: 'Sesión iniciada.', user: { ...safe, token } });
    }

    if (!role || !['FREETIMER', 'FULLTIMER'].includes(role)) {
      return res.status(400).json({ message: 'Rol requerido para nuevos usuarios.' });
    }

    const hashedPassword = await bcrypt.hash(crypto.randomBytes(32).toString('hex'), 12);
    const newUser = {
      id:           `user_${Date.now()}`,
      email, googleId,
      password:     hashedPassword,
      name:         name     || '',
      lastName:     lastName || '',
      phone: '', department: '', municipality: '', birthdate: '',
      role,
      photoURL:     photoURL || null,
      photoBase64:  null,
      rating: 5.0, tasksCompleted: 0, skills: [], badges: ['Principiante'],
      verified:  true,   // Google OAuth = email ya verificado
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    const token = generateToken(newUser);
    const { password: _, ...safe } = newUser;
    return res.status(201).json({ message: 'Cuenta creada.', user: { ...safe, token } });
  } catch (err) {
    console.error('Google login error:', err);
    return res.status(500).json({ message: 'Error interno.' });
  }
}

// ─────────────────────────────────────────────
// GET /api/auth/me
// ─────────────────────────────────────────────
export function getMe(req, res) {
  return res.status(200).json({ user: req.user });
}