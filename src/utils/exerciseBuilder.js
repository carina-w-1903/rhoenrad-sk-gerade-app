export function buildExercise({
  recognizedExercise,
  sourceExercises,
  status = "valid",
}) {
  if (!recognizedExercise) {
    return null;
  }

  const groups = new Set();

  // SG der erkannten Übung
  (recognizedExercise.groups || [])
    .filter(Boolean)
    .forEach((g) => groups.add(g));

  // SG der tatsächlich gewählten Bestandteile
  sourceExercises.forEach((exercise) => {
    (exercise.groups || [])
      .filter(Boolean)
      .forEach((g) => groups.add(g));
  });

  return {
    id:
      recognizedExercise.katalogId,

    name:
      recognizedExercise.description,

    shortName:
      recognizedExercise.name,

    difficulty:
      recognizedExercise.difficulty,

    value:
      recognizedExercise.value,

    groups:
      [...groups],

    sourceExercises,

    countsForDifficulty: true,

    additionalExercises: [],
    
    status,
    executionDeductions:
      recognizedExercise.executionDeductions,

    recognition:
      recognizedExercise.recognition,
  };
}