function normalize(items) {
  return items
    .filter(Boolean)
    .map((x) => x.trim());
}

function splitAlternatives(text) {
  if (!text) return [];

  return text
    .split(/oder|bzw\.?/i)
    .map((x) => x.trim())
    .filter(Boolean);
}

function isDifficultyToken(text) {
  return (
    text.includes("A-Teil") ||
    text.includes("B-Teil") ||
    text.includes("C-Teil") ||
    text.includes("D-Teil") ||
    text.includes("E-Teil")
  );
}

function matchesDifficulty(
  exercise,
  token
) {
  const diff =
    exercise.difficulty;

  switch (token) {
    case "A-Teil":
      return diff === "A";

    case "B-Teil":
      return diff === "B";

    case "C-Teil":
      return diff === "C";

    case "D-Teil":
      return diff === "D";

    case "E-Teil":
      return diff === "E";

    case "B-/C-Teil":
      return ["B", "C"].includes(
        diff
      );

    case "B-/C-/D-Teil":
      return [
        "B",
        "C",
        "D",
      ].includes(diff);

    default:
      return false;
  }
}

function matchToken(
  selected,
  token
) {
  const alternatives =
    splitAlternatives(token);

  for (const alt of alternatives) {
    if (
      alt === selected.katalogId
    ) {
      return true;
    }

    if (
      matchesDifficulty(
        selected,
        alt
      )
    ) {
      return true;
    }

    if (
      alt === selected.name
    ) {
      return true;
    }

    if (
      alt ===
      selected.description
    ) {
      return true;
    }
  }

  return false;
}

function calcSpecificity(
  parts
) {
  let score = 0;

  parts.forEach((part) => {
    if (!part) return;

    if (
      part.includes("oder")
    ) {
      score += 5;
      return;
    }

    if (
      isDifficultyToken(part)
    ) {
      score += 1;
      return;
    }

    score += 20;
  });

  return score;
}

export function buildKombiDefinitionen(
  katalog
) {
  return katalog
    .filter(
      (u) =>
        u.part1 ||
        u.part2 ||
        u.part3 ||
        u.part4
    )
    .map((u) => ({
      exercise: u,

      parts: normalize([
        u.part1,
        u.part2,
        u.part3,
        u.part4,
      ]),

      specificity:
        calcSpecificity([
          u.part1,
          u.part2,
          u.part3,
          u.part4,
        ]),
    }));
}

function permutations(
  arr
) {
  if (arr.length <= 1)
    return [arr];

  const result = [];

  arr.forEach(
    (current, index) => {
      const remaining =
        arr.filter(
          (_, i) =>
            i !== index
        );

      permutations(
        remaining
      ).forEach(
        (perm) => {
          result.push([
            current,
            ...perm,
          ]);
        }
      );
    }
  );

  return result;
}

export function findeKombi(
  selectedExercises,
  definitionen
) {
  if (
    !selectedExercises.length
  ) {
    return null;
  }

  const candidates = [];

  const perms =
    permutations(
      selectedExercises
    );

  for (const rule of definitionen) {
    for (const perm of perms) {
      if (
        perm.length !==
        rule.parts.length
      ) {
        continue;
      }

      let valid = true;

      for (
        let i = 0;
        i <
        rule.parts.length;
        i++
      ) {
        const ok = matchToken(
          perm[i],
          rule.parts[i]
        );

        if (!ok) {
          valid = false;
          break;
        }
      }

      if (valid) {
        candidates.push(rule);
        break;
      }
    }
  }

  if (
    candidates.length === 0
  ) {
    return null;
  }

  candidates.sort(
    (a, b) =>
      b.specificity -
      a.specificity
  );

  return candidates[0]
    .exercise;
}

export function findeBesteZerlegung(
  selectedExercises,
  definitionen
) {

  if (!selectedExercises.length) {
    return [];
  }

  let bestMatch = null;
  let matchedExercises = [];

  for (const rule of definitionen) {

    const size = rule.parts.length;

    if (size > selectedExercises.length) {
      continue;
    }

    const perms =
      permutations(selectedExercises);

    for (const perm of perms) {

      const candidate =
        perm.slice(0, size);

      let valid = true;

      for (
        let i = 0;
        i < size;
        i++
      ) {

        if (
          !matchToken(
            candidate[i],
            rule.parts[i]
          )
        ) {
          valid = false;
          break;
        }

      }

      if (valid) {

        if (
          !bestMatch ||
          rule.exercise.value >
            bestMatch.value
        ) {

          bestMatch =
            rule.exercise;

          matchedExercises =
            candidate;

        }

      }

    }

  }

  if (!bestMatch) {

    const highest =
      [...selectedExercises].sort(
        (a, b) =>
          (b.value || 0) -
          (a.value || 0)
      )[0];

    return [
      {
        exercise: highest,
        countsForDifficulty: true,
        difficultySourceExercises: [highest],
      },
      ...selectedExercises
        .filter(
          (x) => x !== highest
        )
        .map((x) => ({
          exercise: x,
          countsForDifficulty:
            false,
          difficultySourceExercises: [x],
        })),
    ];

  }

  const remaining = [
      ...selectedExercises,
    ];

    matchedExercises.forEach(
      (used) => {

        const idx =
          remaining.indexOf(used);

        if (idx >= 0) {
          remaining.splice(idx, 1);
        }

      }
    );

  return [
    {
      exercise: bestMatch,
      countsForDifficulty: true,
      difficultySourceExercises:
        matchedExercises,
    },

    ...remaining.map((x) => ({
      exercise: x,
      countsForDifficulty:
        false,
      difficultySourceExercises: [x],
    })),
  ];

}
