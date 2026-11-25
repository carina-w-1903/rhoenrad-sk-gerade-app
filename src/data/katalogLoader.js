import Papa from "papaparse";

export async function ladeKatalog() {
  const response = await fetch(
    `${import.meta.env.BASE_URL}Schwierigkeitskatalog.csv`
  );

  const csvText =
    await response.text();

  return new Promise((resolve) => {
    Papa.parse(csvText, {
      delimiter: ";",
      header: false,
      skipEmptyLines: true,

      complete: (results) => {
        const daten = [];

        results.data.forEach((row) => {
          if (
            !row[3] ||
            row[3] === "Kürzel"
          ) {
            return;
          }

          // Knieumschwung vorwärts (C)
          // wird über C14 abgedeckt
          if (
            row[3] === "C" &&
            row[2] === "Andere Umschwünge"
          ) {
            return;
          }

          const wert = parseFloat(
            String(
              row[15] || "0"
            ).replace(",", ".")
          );

          const difficulty =
            wert === 0
              ? "0"
              : wert === 0.2
              ? "A"
              : wert === 0.4
              ? "B"
              : wert === 0.6
              ? "C"
              : wert === 0.8
              ? "D"
              : "E";

          const groups = [
            row[10],
            row[11],
            row[12],
            row[13],
            row[14],
          ]
            .filter(Boolean)
            .filter((g) => g !== "-")
            .map((g) => Number(g));

          daten.push({
            id: `${row[3]}-${daten.length}`,

            katalogId: row[3],

            difficulty,
            value: wert,

            name: row[5],
            description: row[4],

            category1: row[0],
            category2: row[1],
            category3: row[2],

            groups,

            part1: row[6],
            part2: row[7],
            part3: row[8],
            part4: row[9],

            executionDeductions: row[16],
            recognition: row[17],
          });
        });

        resolve(daten);
      },
    });
  });
}