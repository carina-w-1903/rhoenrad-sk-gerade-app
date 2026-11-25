export function extrahiereTeilelemente(
  katalog
) {
  const teile = new Set();

  const katalogIds =
    new Set(
      katalog.map((u) =>
        String(
          u.katalogId || ""
        ).trim()
      )
    );

  const uebungsNamen =
    new Set(
      katalog.map((u) =>
        String(
          u.name || ""
        ).trim()
      )
    );

  katalog.forEach((u) => {

    [
      u.part1,
      u.part2,
      u.part3,
      u.part4,
    ]
      .filter(Boolean)
      .forEach((part) => {

        const wert =
          part.trim();

        // existiert bereits als Übungskürzel
        if (
          katalogIds.has(wert)
        ) {
          return;
        }

        // existiert bereits als Übungsname
        if (
          uebungsNamen.has(wert)
        ) {
          return;
        }

        // A-Teil, B-Teil usw.
        if (
          wert.includes("Teil")
        ) {
          return;
        }

        // B25 oder B44
        if (
          wert.includes(" oder ")
        ) {
          return;
        }

        teile.add(wert);

      });

  });

  return [...teile].sort();
}