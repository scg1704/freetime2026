// src/shared/lib/colombiaLocations.js
// Datos estáticos de departamentos y municipios de Colombia

export const COLOMBIA_LOCATIONS = {
  "Amazonas": ["Leticia", "Puerto Nariño"],
  "Antioquia": ["Medellín", "Bello", "Itagüí", "Envigado", "Rionegro", "Apartadó", "Turbo", "Caucasia", "Sabaneta", "La Estrella", "Copacabana", "Girardota", "Caldas", "Barbosa"],
  "Arauca": ["Arauca", "Saravena", "Tame", "Arauquita", "Fortul"],
  "Atlántico": ["Barranquilla", "Soledad", "Malambo", "Sabanalarga", "Santo Tomás", "Baranoa", "Puerto Colombia", "Galapa", "Palmar de Varela"],
  "Bolívar": ["Cartagena", "Magangué", "Turbaco", "El Carmen de Bolívar", "Mompós", "Arjona", "Villanueva"],
  "Boyacá": ["Tunja", "Duitama", "Sogamoso", "Chiquinquirá", "Paipa", "Villa de Leyva", "Moniquirá", "Samacá"],
  "Caldas": ["Manizales", "La Dorada", "Chinchiná", "Riosucio", "Salamina", "Anserma", "Villamaría", "Manzanares"],
  "Caquetá": ["Florencia", "San Vicente del Caguán", "Puerto Rico", "El Doncello", "La Montañita"],
  "Casanare": ["Yopal", "Aguazul", "Villanueva", "Paz de Ariporo", "Trinidad", "Monterrey"],
  "Cauca": ["Popayán", "Santander de Quilichao", "Puerto Tejada", "Patía", "Timbío", "El Tambo"],
  "Cesar": ["Valledupar", "Aguachica", "Codazzi", "La Paz", "San Alberto", "Bosconia"],
  "Chocó": ["Quibdó", "Istmina", "Tadó", "Condoto", "Bahía Solano", "Nuquí"],
  "Córdoba": ["Montería", "Cereté", "Lorica", "Sahagún", "Montelíbano", "Planeta Rica", "Ciénaga de Oro"],
  "Cundinamarca": ["Bogotá D.C.", "Soacha", "Zipaquirá", "Facatativá", "Chía", "Mosquera", "Madrid", "Funza", "Cajicá", "Fusagasugá", "Tocancipá", "La Calera", "Sibaté", "Cota", "Tabio"],
  "Guainía": ["Inírida"],
  "Guaviare": ["San José del Guaviare", "El Retorno", "Calamar"],
  "Huila": ["Neiva", "Pitalito", "Garzón", "La Plata", "Campoalegre", "Palermo", "San Agustín"],
  "La Guajira": ["Riohacha", "Maicao", "Uribia", "Manaure", "Fonseca", "San Juan del Cesar"],
  "Magdalena": ["Santa Marta", "Ciénaga", "Fundación", "El Banco", "Aracataca", "Plato"],
  "Meta": ["Villavicencio", "Acacías", "Granada", "San Martín", "Puerto López", "Cumaral"],
  "Nariño": ["Pasto", "Tumaco", "Ipiales", "La Unión", "Túquerres", "Sandoná"],
  "Norte de Santander": ["Cúcuta", "Ocaña", "Pamplona", "Villa del Rosario", "Los Patios", "El Zulia", "Tibú"],
  "Putumayo": ["Mocoa", "Puerto Asís", "Orito", "Valle del Guamuéz", "Sibundoy"],
  "Quindío": ["Armenia", "Calarcá", "Montenegro", "La Tebaida", "Quimbaya", "Circasia", "Filandia"],
  "Risaralda": ["Pereira", "Dosquebradas", "Santa Rosa de Cabal", "La Virginia", "Quinchía", "Marsella"],
  "San Andrés y Providencia": ["San Andrés", "Providencia"],
  "Santander": ["Bucaramanga", "Floridablanca", "Girón", "Piedecuesta", "Barrancabermeja", "Socorro", "San Gil", "Málaga", "Vélez"],
  "Sucre": ["Sincelejo", "Corozal", "San Marcos", "Sampués", "Tolú", "Morroa"],
  "Tolima": ["Ibagué", "Espinal", "Honda", "Melgar", "Chaparral", "Líbano", "Mariquita", "Purificación"],
  "Valle del Cauca": ["Cali", "Buenaventura", "Palmira", "Tuluá", "Buga", "Cartago", "Jamundí", "Yumbo", "Guadalajara de Buga", "Caicedonia", "Sevilla"],
  "Vaupés": ["Mitú"],
  "Vichada": ["Puerto Carreño"]
};

export const DEPARTMENTS = Object.keys(COLOMBIA_LOCATIONS).sort();

export function getMunicipalities(department) {
  return COLOMBIA_LOCATIONS[department] || [];
}