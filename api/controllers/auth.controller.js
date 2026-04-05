import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Store en memoria — se reemplazará por PostgreSQL en el paso 6
const users = [];

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'dev_secret_changeme',
    { expiresIn: '24h' }
  );
}

export async function register(req, res) {
  try {
    const { email, password, name, lastName, phone, city, role } = req.body;

    if (!email || !password || !name || !lastName || !role) {
      return res.status(400).json({ message: 'Todos los campos son requeridos.' });
    }

    if (!['FREETIMER', 'FULLTIMER'].includes(role)) {
      return res.status(400).json({ message: 'Rol inválido.' });
    }

    const exists = users.find((u) => u.email === email);
    if (exists) {
      return res.status(409).json({ message: 'Ya existe una cuenta con este email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = {
      id: `user_${Date.now()}`,
      email,
      password: hashedPassword,
      name,
      lastName,
      phone: phone || '',
      city: city || '',
      role,
      rating: 5.0,
      tasksCompleted: 0,
      skills: [],
      badges: ['Principiante'],
      createdAt: new Date().toISOString(),
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

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Email o contraseña incorrectos.' });
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      message: 'Sesión iniciada exitosamente.',
      user: { ...userWithoutPassword, token },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Error interno del servidor.' });
  }
}

export function getMe(req, res) {
  return res.status(200).json({ user: req.user });
}