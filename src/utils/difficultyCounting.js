export function getDifficultyCounting(uebung) {
  const katalogId =
    uebung?.katalogId || uebung?.id;

  const difficultySourceExercises =
    uebung?.difficultySourceExercises ||
    uebung?.sourceExercises ||
    [];

  if (katalogId === "D6") {
    const firstPart =
      difficultySourceExercises.find(
        (exercise) =>
          exercise.katalogId === "B22" ||
          exercise.katalogId === "C13"
      );

    if (
      firstPart?.difficulty === "B" ||
      firstPart?.difficulty === "C"
    ) {
      return [firstPart.difficulty, "D"];
    }

    return [];
  }

  if (katalogId === "D34") {
    const firstPart =
      difficultySourceExercises.find(
        (exercise) =>
          exercise.katalogId !== "C11"
      );

    if (
      ["B", "C", "D"].includes(
        firstPart?.difficulty
      )
    ) {
      return [firstPart.difficulty, "D"];
    }

    return [];
  }

  return Array.isArray(uebung?.countsAs)
    ? uebung.countsAs
    : [];
}
