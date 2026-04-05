// Placeholder — se conectará a PostgreSQL en el paso 6
export function getUserById(req, res) {
  return res.status(200).json({ user: req.user });
}

export function updateUser(req, res) {
  const { name, lastName, phone, city, skills } = req.body;
  return res.status(200).json({
    message: 'Perfil actualizado.',
    user: { ...req.user, name, lastName, phone, city, skills },
  });
}