// source/shared/lib/mockTasks.js
// Tarea de prueba compartida entre MyTasksPage y TaskHistoryPage

export const MOCK_APPLICANTS = [
  {
    id: 'ap1',
    name: 'Carlos',
    lastName: 'Ramírez',
    rating: 4.8,
    tasksCompleted: 23,
    city: 'Manizales, Caldas',
    verified: true,
    offeredPrice: 38000,
    skills: ['Plomería', 'Electricidad', 'Hogar'],
    bio: 'Técnico con 5 años de experiencia en reparaciones del hogar.',
  },
  {
    id: 'ap2',
    name: 'Sofía',
    lastName: 'Torres',
    rating: 4.6,
    tasksCompleted: 11,
    city: 'Manizales, Caldas',
    verified: false,
    offeredPrice: 35000,
    skills: ['Plomería', 'Mantenimiento'],
    bio: 'Especialista en instalaciones sanitarias y reparaciones menores.',
  },
];

export const MOCK_TASKS = [
  {
    id: 'mock-1',
    title: 'Reparación de Grifo',
    description: 'El grifo del lavamanos de la cocina está goteando constantemente. Se necesita reemplazar el empaque y ajustar la presión del agua.',
    status: 'PENDING',
    category: 'Hogar · Plomería',
    specializationLevel: 'Básico',
    location: 'Manizales, Caldas',
    address: 'Calle 50 #23-10, El Cable, Manizales',
    date: '2026-05-10',
    budget: 40000,
    applicants: 2,
    applicantsList: MOCK_APPLICANTS,
    lat: 5.0703,
    lng: -75.5138,
  },
];