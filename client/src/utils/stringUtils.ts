/**
 * Calcula la distancia de Levenshtein entre dos cadenas.
 * La distancia de Levenshtein es el número mínimo de ediciones de un solo carácter
 * (inserciones, eliminaciones o sustituciones) necesarias para cambiar una palabra por otra.
 * @param s1 La primera cadena.
 * @param s2 La segunda cadena.
 * @returns La distancia de Levenshtein entre s1 y s2.
 */
export function calculateLevenshteinDistance(s1: string, s2: string): number {
  // Asegurarse de que s1 sea la cadena más corta para optimizar el espacio.
  if (s1.length < s2.length) {
    return calculateLevenshteinDistance(s2, s1);
  }

  // Casos base
  if (s2.length === 0) {
    return s1.length;
  }

  const previousRow = Array.from(Array(s2.length + 1).keys());

  for (let i = 0; i < s1.length; i++) {
    const s1Char = s1[i];
    let currentRow = [i + 1];
    for (let j = 0; j < s2.length; j++) {
      const s2Char = s2[j];
      const insertions = previousRow[j + 1] + 1;
      const deletions = currentRow[j] + 1;
      const substitutions = previousRow[j] + (s1Char === s2Char ? 0 : 1);
      currentRow.push(Math.min(insertions, deletions, substitutions));
    }
    previousRow.splice(0, previousRow.length, ...currentRow); // Optimización: reusar previousRow
  }

  return previousRow[s2.length];
} 