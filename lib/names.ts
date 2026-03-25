const NAMES = [
  "Sofía", "Diego", "Valentina", "Carlos", "Camila", "Andrés",
  "Lucía", "Miguel", "Isabella", "Javier", "Daniela", "Sebastián",
  "Natalia", "Pablo", "Fernanda", "Mateo", "Andrea", "Luis",
  "Gabriela", "Rodrigo", "Paula", "Fernando", "Laura", "Eduardo",
  "Mariana", "Alejandro", "Valeria", "Ricardo", "Ana", "Tomás",
];

export function pickTwoNames(): [string, string] {
  const shuffled = [...NAMES].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}
