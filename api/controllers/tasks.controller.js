// Placeholder — se conectará a PostgreSQL en el paso 6
const tasks = [];

export function getTasks(req, res) {
  const { status } = req.query;
  const filtered = status ? tasks.filter((t) => t.status === status) : tasks;
  return res.status(200).json({ tasks: filtered });
}

export function getTaskById(req, res) {
  const task = tasks.find((t) => t.id === req.params.taskId);
  if (!task) return res.status(404).json({ message: 'Tarea no encontrada.' });
  return res.status(200).json({ task });
}

export function getMyTasks(req, res) {
  const { id, role } = req.user;
  const field = role === 'FREETIMER' ? 'freetimerId' : 'fulltimerId';
  const myTasks = tasks.filter((t) => t[field] === id);
  return res.status(200).json({ tasks: myTasks });
}

export function createTask(req, res) {
  const { title, description, category, budget, location, date, specializationLevel } = req.body;

  if (!title || !description || !category || !budget || !location || !date) {
    return res.status(400).json({ message: 'Todos los campos son requeridos.' });
  }

  if (req.user.role !== 'FULLTIMER') {
    return res.status(403).json({ message: 'Solo los FullTimers pueden publicar tareas.' });
  }

  const newTask = {
    id: `task_${Date.now()}`,
    title,
    description,
    category,
    budget: Number(budget),
    location,
    date,
    specializationLevel: specializationLevel || 'PRINCIPIANTE',
    status: 'OPEN',
    fulltimerId: req.user.id,
    fulltimerName: `${req.user.name}`,
    freetimerId: null,
    applicants: 0,
    createdAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  return res.status(201).json({ message: 'Tarea publicada exitosamente.', task: newTask });
}

export function getApplicants(req, res) {
  // Placeholder — retorna lista vacía hasta conectar con DB
  return res.status(200).json({ applicants: [] });
}

export function acceptApplicant(req, res) {
  const { taskId } = req.params;
  const { applicantId } = req.body;

  const task = tasks.find((t) => t.id === taskId);
  if (!task) return res.status(404).json({ message: 'Tarea no encontrada.' });
  if (task.fulltimerId !== req.user.id) return res.status(403).json({ message: 'No autorizado.' });

  task.freetimerId = applicantId;
  task.status = 'ACTIVE';

  return res.status(200).json({ message: 'Postulante aceptado.', task });
}