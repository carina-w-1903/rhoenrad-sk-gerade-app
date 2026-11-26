import SG_SK_Anforderungen
  from "../data/SG_SK_Anforderungen.json";
import { getDifficultyCounting } from "./difficultyCounting";

export function berechneWertung(
  uebungen,
  ak
) {
  const aktive = uebungen.filter(
    (u) =>
      u.status !== "fall" &&
      u.status !== "notRecognized"
  );

  const akRegel =
    SG_SK_Anforderungen[ak];

  const sgCounter = {};

  const gueltig = [];

  aktive.forEach((u) => {
    let invalid = false;

    if (u.bahn > 6) {
      gueltig.push({
        ...u,
        status: "bahnLimit",
      });
      return;
    }

    u.groups.forEach((group) => {

      if (
        u.difficulty !== "A" &&
        (sgCounter[group] || 0) >= 3
      ) {
        invalid = true;
      }

    });

    if (invalid) {
      gueltig.push({
        ...u,
        status: "sgLimit",
      });

      return;
    }

    u.groups.forEach((group) => {
      sgCounter[group] =
        (sgCounter[group] || 0) + 1;
    });

    gueltig.push(u);
  });

  const downgradeOrder = [
    "E",
    "D",
    "C",
    "B",
    "A",
    "0",
  ];

  const difficultyLimits =
    akRegel.difficultyMax;

  const cumulativeLimits = {
    E: difficultyLimits.E,
    D: difficultyLimits.E + difficultyLimits.D,
    C:
      difficultyLimits.E +
      difficultyLimits.D +
      difficultyLimits.C,
    B:
      difficultyLimits.E +
      difficultyLimits.D +
      difficultyLimits.C +
      difficultyLimits.B,
    A:
      difficultyLimits.E +
      difficultyLimits.D +
      difficultyLimits.C +
      difficultyLimits.B +
      difficultyLimits.A,
    "0": 8,
  };

  const difficultyCounter = {
    "0": 0,
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
  };

  const kandidaten = gueltig
    .filter(
      (u) =>
        u.status === "valid" &&
        u.countsForDifficulty !== false
    );

  const difficultyValues = {
    "0": 0.0,
    A: 0.2,
    B: 0.4,
    C: 0.6,
    D: 0.8,
    E: 1.0,
  };

  function countAtOrAbove(diff) {
    const order = ["0", "A", "B", "C", "D", "E"];

    const start =
      order.indexOf(diff);

    return order
      .slice(start)
      .reduce(
        (sum, d) =>
          sum + difficultyCounter[d],
        0
      );
  }

  const wertTeile = [];

  const gezeigteTeile = kandidaten
    .flatMap((u) =>
      getDifficultyCounting(u).map(
        (schwierigkeit) => ({
          u,
          schwierigkeit,
        })
      )
    )
    .filter(({ schwierigkeit }) =>
      downgradeOrder.includes(schwierigkeit)
    )
    .sort(
      (a, b) =>
        downgradeOrder.indexOf(a.schwierigkeit) -
        downgradeOrder.indexOf(b.schwierigkeit)
    );

  for (const { u, schwierigkeit } of gezeigteTeile) {
    if (wertTeile.length >= 8) {
      break;
    }

    let index =
      downgradeOrder.indexOf(schwierigkeit);

    while (index < downgradeOrder.length) {
      const ziel =
        downgradeOrder[index];

      if (
        countAtOrAbove(ziel) <
        cumulativeLimits[ziel]
      ) {
        difficultyCounter[ziel]++;

        wertTeile.push({
          ...u,
          gewerteteDifficulty: ziel,
          gewerteterWert:
            difficultyValues[ziel],
        });

        break;
      }

      index++;
    }
  }

    const schwierigkeiten = {
      "0": 0,
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      E: 0,
    };

    wertTeile.forEach((u) => {
      const diff =
        u.gewerteteDifficulty ??
        u.difficulty;

      if (
        schwierigkeiten[diff] !==
        undefined
      ) {
        schwierigkeiten[diff]++;
      }
    });

  const technischerWert =
    wertTeile.reduce(
      (sum, u) =>
        sum +
        (
          u.gewerteterWert ??
          u.value ??
          0
        ),
      0
    );

  const difficultyRank = {
    "0": 0,
    A: 1,
    B: 2,
    C: 3,
    D: 4,
    E: 5,
  };

  const strukturgruppen = new Set();

  gueltig.forEach((u) => {
    if (u.status !== "valid") {
      return;
    }

    u.groups.forEach((g) => {
      const requiredDifficulty =
        akRegel?.sgRequirements?.[g];

      if (!requiredDifficulty) {
        return;
      }

      if (
        difficultyRank[u.difficulty] >=
        difficultyRank[requiredDifficulty]
      ) {
        strukturgruppen.add(g);
      }
    });
  });

  const internationaleSG =
    [...strukturgruppen]
      .filter((sg) => sg <= 10);

  const nationaleSG =
    [...strukturgruppen]
      .filter((sg) => sg >= 11);

  const gewerteteInternationaleSG =
    internationaleSG.slice(
      0,
      akRegel.maxBonusInternationaleSG
    );

  const ueberzaehligeInternationaleSG =
    internationaleSG.slice(
      akRegel.maxBonusInternationaleSG
    );

  const bonusNational =
    nationaleSG.length * 0.2;

  const bonusInternational =
    Math.min(
      internationaleSG.length,
      akRegel.maxBonusInternationaleSG
    ) * 0.2;

  const bonus =
    bonusNational +
    bonusInternational;

  return {
    technischerWert,
    bonus,
    endwert:
      technischerWert + bonus,
    strukturgruppen:
      strukturgruppen.size,
    strukturgruppenListe:
      [...strukturgruppen],
    schwierigkeiten,
    gueltig,
    bewerteteUebungen: gueltig,
    gewerteteInternationaleSG,
    ueberzaehligeInternationaleSG,
  };
}