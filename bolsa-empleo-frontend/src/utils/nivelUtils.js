
export const NIVELES = [
    { valor: 1, label: "Básico" },
    { valor: 2, label: "Intermedio" },
    { valor: 3, label: "Avanzado" },
    { valor: 4, label: "Experto" },
    { valor: 5, label: "Máster" },
];


export function nivelLabel(nivel) {
    const n = Number(nivel);
    return NIVELES.find((x) => x.valor === n)?.label ?? `Nivel ${nivel}`;
}