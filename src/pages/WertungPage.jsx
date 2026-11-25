import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { ladeKatalog } from "../data/katalogLoader";
import { extrahiereTeilelemente } from "../data/teilelemente";
import {
  buildKombiDefinitionen,
  findeKombi,
  findeBesteZerlegung,
} from "../data/kombiEngine";
import SG_SK_Anforderungen from "../data/SG_SK_Anforderungen.json";
import { buildExercise } from "../utils/exerciseBuilder";
import "../styles/app.css";

export default function WertungPage({
  ak,
  uebungen,
  setUebungen,
  editIndex,
  setEditIndex,
  korrekturModus,
  setKorrekturModus,
  onFinish,
  zurStartseite,
}) {
  const [katalog, setKatalog] = useState([]);
  const [teilelemente, setTeilelemente] = useState([]);
  const [hauptReiter, setHauptReiter] = useState(null);
  const [unterReiter, setUnterReiter] = useState(null);
  const [currentItems, setCurrentItems] = useState([]);
  const [erkannteUebung, setErkannteUebung] = useState(null);
  const [dezentralPage, setDezentralPage] = useState(1);
  const [gruppenSeite, setGruppenSeite] = useState(1);
  const [touchStartX, setTouchStartX] = useState(null);
  const [manualGroups, setManualGroups,] = useState([]);
  const [aktuelleBahn, setAktuelleBahn] = useState(1);

  const akRegel =
    SG_SK_Anforderungen[ak];

  useEffect(() => {
    if (uebungen.length === 0) {
      setAktuelleBahn(1);
    }
  }, [uebungen]);

  useEffect(() => {
    ladeKatalog().then((data) => {
      setKatalog(data);

      const teile =
        extrahiereTeilelemente(data);

      setTeilelemente(teile);

      const ersteKategorie =
        [...new Set(
          data.map((x) => x.category1)
        )][0];

      setHauptReiter(ersteKategorie);
    });
  }, []);

  const kombiDefinitionen =
    useMemo(
      () =>
        buildKombiDefinitionen(
          katalog
        ),
      [katalog]
    );

  useEffect(() => {
    if (
      currentItems.length === 0
    ) {
      setErkannteUebung(null);
      return;
    }

    const kombi =
      findeKombi(
        currentItems,
        kombiDefinitionen
      );

    if (kombi) {
      setErkannteUebung(kombi);
      return;
    }

    if (
      currentItems.length === 1
    ) {
      setErkannteUebung(
        currentItems[0]
      );
      return;
    }

    setErkannteUebung(null);
  }, [
    currentItems,
    kombiDefinitionen,
  ]);

  const hauptKategorien =
  useMemo(() => {
    const reihenfolge = [
      "Bindungen",
      "Zentral ohne Bindungen",
      "Teilzentral",
      "Dezentral",
      "Abgang",
    ];

    return reihenfolge.filter((cat) =>
      katalog.some(
        (x) => x.category1 === cat
      )
    );
  }, [katalog]);

  const unterKategorien =
  useMemo(() => {
    if (!hauptReiter)
      return [];

    let result = [
      ...new Set(
        katalog
          .filter(
            (x) =>
              x.category1 ===
              hauptReiter
          )
          .map(
            (x) =>
              x.category2
          )
      ),
    ].filter(Boolean);

    if (hauptReiter === "Bindungen") {
  const reihenfolge = [
    "In beiden Bindungen",
    "In einer Bindung",
  ];

  result.sort(
    (a, b) =>
      reihenfolge.indexOf(a) -
      reihenfolge.indexOf(b)
  );
}

    return result;
  }, [
    katalog,
    hauptReiter,
  ]);

  useEffect(() => {
    if (
      unterKategorien.length > 0 &&
      !unterReiter
    ) {
      setUnterReiter(
        unterKategorien[0]
      );
    }
  }, [
    unterKategorien,
    unterReiter,
  ]);

  const gruppen =
  useMemo(() => {
    let filtered =
      katalog.filter(
        (x) =>
          x.category1 ===
          hauptReiter
      );

    if (
      unterReiter
    ) {
      filtered =
        filtered.filter(
          (x) =>
            x.category2 ===
            unterReiter
        );
    }

    const result = {};

    filtered.forEach((e) => {

      if (
        e.category3
          ?.toLowerCase()
          .includes("kombination")
      ) {
        return;
      }

      if (
        e.name
          ?.toLowerCase()
          .includes("kombi")
      ) {
        return;
      }

      if (
        e.description
          ?.toLowerCase()
          .includes("kombi")
      ) {
        return;
      }

      const gruppe =
        e.category3 ||
        "Weitere";

      if (
        !result[gruppe]
      ) {
        result[gruppe] = [];
      }

      result[gruppe].push(e);
    });
    if (
      hauptReiter === "Dezentral" &&
      unterReiter === "Obere Phase"
    ) {
      result["Teilelemente"] =
        teilelemente.map(
          (teil, index) => ({
            id: `teil-${index}`,
            katalogId: "",
            name: teil,
          })
        );
    }
    return result;
  }, [
    katalog,
    hauptReiter,
    unterReiter,
  ]);

const sichtbareGruppen =
  useMemo(() => {

    let entries =
      Object.entries(
        gruppen
      );
    if (
      hauptReiter === "Dezentral" &&
      unterReiter === "Obere Phase"
    ) {

      const reihenfolge = [
        "Hohe Rollen",
        "Hüft-Auf-/Ab-/Umschwünge",
        "Andere Umschwünge",
        "Knie-/Fersen-/Trapezhänge",
        "Überhocken",
        "Statisch",
        "Weitere Elemente",
        "Teilelemente",
      ];

      entries.sort(
        (a, b) =>
          reihenfolge.indexOf(a[0]) -
          reihenfolge.indexOf(b[0])
      );
    }
    if (
      hauptReiter ===
      "Bindungen"
    ) {

      const reihenfolge = [
        "In beiden Bindungen",
        "In einer Bindung",
      ];

      entries.sort(
        (a, b) =>
          reihenfolge.indexOf(a[0]) -
          reihenfolge.indexOf(b[0])
      );
    }

    return entries;

  }, [
    gruppen,
    hauptReiter,
    unterReiter,
    dezentralPage,
  ]);

  const gruppenSeiten =
  useMemo(() => {

    const result = [];

    for (
      let i = 0;
      i < sichtbareGruppen.length;
      i += 3
    ) {
      result.push(
        sichtbareGruppen.slice(
          i,
          i + 3
        )
      );
    }

    return result;

  }, [sichtbareGruppen]);

const aktuelleGruppen =
  gruppenSeiten[
    gruppenSeite - 1
  ] || [];

  useEffect(() => {
    setGruppenSeite(1);
  }, [
    hauptReiter,
    unterReiter,
  ]);
  useEffect(() => {

    if (
      gruppenSeite >
      gruppenSeiten.length
    ) {
      setGruppenSeite(1);
    }

  }, [
    gruppenSeite,
    gruppenSeiten,
  ]);
  const anzahlSpalten =
  aktuelleGruppen.length;

  function handleTouchStart(e) {
  setTouchStartX(
    e.touches[0].clientX
  );
}

function handleTouchEnd(e) {

  if (
    touchStartX === null
  ) {
    return;
  }

  const touchEndX =
    e.changedTouches[0]
      .clientX;

  const diff =
    touchStartX -
    touchEndX;

  // nach links gewischt
  if (
    diff > 80 &&
    gruppenSeite <
      gruppenSeiten.length
  ) {
    setGruppenSeite(
      (s) => s + 1
    );
  }

  // nach rechts gewischt
  if (
    diff < -80 &&
    gruppenSeite > 1
  ) {
    setGruppenSeite(
      (s) => s - 1
    );
  }

  setTouchStartX(null);
}

  function addItem(item) {
    setCurrentItems([
      ...currentItems,
      item,
    ]);
  }

  function undoLastItem() {

    if (
      currentItems.length === 0
    ) {
      return;
    }

    setCurrentItems(
      currentItems.slice(
        0,
        -1
      )
    );
  }

  function addUnknownItem() {

    setCurrentItems([
      ...currentItems,

      {
        id:
          `unknown-${Date.now()}`,

        katalogId: "?",

        name:
          "Unbekannte Übung",

        difficulty: 0,

        groups: [],
      },
    ]);
  }

  function toggleManualGroup(
    group
  ) {
    setManualGroups((prev) =>
      prev.includes(group)
        ? prev.filter(
            (g) => g !== group
          )
        : [...prev, group]
    );
  }

  function speichern(status) {

    if (currentItems.length === 0) {
      return;
    }

    const zerlegung =
      findeBesteZerlegung(
        currentItems,
        kombiDefinitionen
      );

    const exercises =
      zerlegung
        .map(
          ({
            exercise,
            countsForDifficulty,
          }) => {

            const built =
              buildExercise({
                recognizedExercise:
                  exercise,
                sourceExercises:
                  currentItems,
                status,
              });

            if (!built) {
              return null;
            }

            return {
              ...built,
              countsForDifficulty,
            };

          }
        )
        .filter(Boolean);

    if (exercises.length === 0) {
      return;
    }
    
    const hauptExercise = {
      ...exercises[0],
      additionalExercises:
        exercises.slice(1),

      bahn: aktuelleBahn,
    };

    hauptExercise.groups = [
      ...new Set([
        ...(hauptExercise.groups || []),
        ...manualGroups,
      ]),
    ];

    if (
      korrekturModus &&
      editIndex !== null
    ) {

      const neu = [...uebungen];

      neu[editIndex] =
        hauptExercise;

      setUebungen(neu);

      setEditIndex(null);
      setKorrekturModus(false);

    } else {

      setUebungen([
        ...uebungen,
        hauptExercise,
      ]);

    }

    setManualGroups([]);
    setCurrentItems([]);
    setErkannteUebung(null);

  }

  function zurUebersicht() {

    if (currentItems.length > 0) {

      const zerlegung =
        findeBesteZerlegung(
          currentItems,
          kombiDefinitionen
        );
      
      const exercises =
        zerlegung
          .map(
            ({
              exercise,
              countsForDifficulty,
            }) => {

              const built =
                buildExercise({
                  recognizedExercise:
                    exercise,
                  sourceExercises:
                    currentItems,
                  status: "valid",
                });

              if (!built) {
                return null;
              }

              return {
                ...built,
                countsForDifficulty,
              };

            }
          )
          .filter(Boolean);

      if (exercises.length > 0) {

        const hauptExercise = {
          ...exercises[0],
          additionalExercises:
            exercises.slice(1),
          bahn: aktuelleBahn,
        };

        hauptExercise.groups = [
          ...new Set([
            ...(hauptExercise.groups || []),
            ...manualGroups,
          ]),
        ];

        if (
          korrekturModus &&
          editIndex !== null
        ) {

          const neu = [...uebungen];

          neu[editIndex] =
            hauptExercise;

          setUebungen(neu);

          setEditIndex(null);
          setKorrekturModus(false);

        } else {

          setUebungen([
            ...uebungen,
            hauptExercise,
          ]);

        }

      }

    }

    setManualGroups([]);
    setCurrentItems([]);
    setErkannteUebung(null);

    onFinish();

  }


  return (
  <div className="wertung-page">

    <div className="main-content">
      <div
        className="ak-floating"
        onClick={zurStartseite}
      >
        {ak}
      </div>
      <div className="main-tabs">
        {hauptKategorien.map(
          (cat) => (
            <button
              key={cat}
              onClick={() => {
                setHauptReiter(cat);
                setUnterReiter(null);
              }}
              className={`main-tab ${
                cat === hauptReiter
                  ? ""
                  : "inactive"
              } ${
                cat === "Bindungen"
                  ? "bindungen"
                  : cat ===
                    "Zentral ohne Bindungen"
                  ? "zentral"
                  : cat === "Teilzentral"
                  ? "teilzentral"
                  : cat === "Dezentral"
                  ? "dezentral"
                  : "abgang"
              }`}
            >
              {cat}
            </button>
          )
        )}
      </div>

      <div className="sub-tabs">
        {unterKategorien.map(
          (cat) => (
            <button
              key={cat}
              onClick={() =>
                setUnterReiter(cat)
              }
              className={`sub-tab ${
                cat === unterReiter
                  ? "active"
                  : ""
              }`}
            >
              {cat}
            </button>
          )
        )}
      </div>
      {gruppenSeiten.length > 1 && (
        <div className="page-tabs">

          <button
            className="page-arrow"
            disabled={gruppenSeite === 1}
            onClick={() =>
              setGruppenSeite(
                (s) => Math.max(1, s - 1)
              )
            }
          >
            ◀
          </button>

          <div className="page-indicator">
            {gruppenSeite} / {gruppenSeiten.length}
          </div>

          <button
            className="page-arrow"
            disabled={
              gruppenSeite ===
              gruppenSeiten.length
            }
            onClick={() =>
              setGruppenSeite(
                (s) =>
                  Math.min(
                    gruppenSeiten.length,
                    s + 1
                  )
              )
            }
          >
            ▶
          </button>

        </div>
      )}
    <div
      className="groups-container"
      style={{
        gridTemplateColumns:
          `repeat(${anzahlSpalten},
          minmax(0, 1fr))`
      }}
      onTouchStart={
        handleTouchStart
      }
      onTouchEnd={
        handleTouchEnd
      }
    >

{aktuelleGruppen.map(
    ([gruppe, items]) => (
      <div
        key={gruppe}
        className="group-card"
      >

        {!(
          (hauptReiter === "Teilzentral" &&
            gruppe === "Weitere") ||

          (hauptReiter === "Abgang" &&
            gruppe === "Weitere")
        ) && (
          <div className="group-title">
            {gruppe}
          </div>
        )}

        <div className="group-content">

          {items.map((e) => (
            <button
              key={e.id}
              className="exercise-card"
              onClick={() =>
                addItem(e)
              }
            >
              <div className="exercise-row">

                <span className="exercise-id">
                  {e.katalogId}
                </span>

                <span className="exercise-name">
                  {e.name}
                </span>

              </div>
            </button>
          ))}

        </div>

      </div>
    )
  )}

</div>
</div>

    <div className="sidebar">

      <div className="current-box">

        <div className="current-title">
          Aktuelle Übung
        </div>

        {currentItems.length ===
          0 && (
          <div
            style={{
              textAlign:
                "center",
                fontSize: "14px",
            }}
          >
            Noch keine
            Auswahl
          </div>
        )}

        {currentItems.map(
          (
            item,
            index
          ) => (
            <div
              key={index}
              className="current-item"
            >
              <strong>
                {
                  item.katalogId
                }
              </strong>
              {" "}
              {
                item.name
              }
            </div>
          )
        )}

        <div className="current-divider" />

        {erkannteUebung && (
          <div className="current-result">

            <div className="current-result-id">
              {
                erkannteUebung.katalogId
              }
            </div>

            <div className="current-result-name">
              {
                erkannteUebung.description
              }
            </div>

          </div>
        )}

      </div>
      
      <div className="manual-sg-box">

        <div className="manual-sg-title">
          Zusätzliche SG
        </div>

        <div className="manual-sg-grid">

          {Array.from(
            { length: 10 },
            (_, i) => i + 1
          ).map((sg) => (
            <button
              key={sg}
              className={`manual-sg-btn ${
                manualGroups.includes(sg)
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                toggleManualGroup(sg)
              }
            >
              {sg}
            </button>
          ))}

        </div>

      </div>

      <button
        className="action-btn overview-btn"
        onClick={undoLastItem}
      >
        Undo
      </button>
      
      <button
        className="action-btn notrecognized-btn"
        onClick={() =>
          speichern(
            "notRecognized"
          )
        }
      >
        Nicht anerkannt
      </button>

      <button
        className="action-btn fall-btn"
        onClick={() =>
          speichern(
            "fall"
          )
        }
      >
        Sturz
      </button>
      
      <button
        className="action-btn small-action-btn"
        onClick={addUnknownItem}
      >
        ?
      </button>

      <button
        className="action-btn next-btn"
        onClick={() =>
          speichern(
            "valid"
          )
        }
      >
        Nächste Übung
      </button>

      <button
        className="action-btn"
        onClick={() => {

          if (currentItems.length > 0) {
            speichern("valid");
          }

          setAktuelleBahn((b) => b + 1);

        }}
      >
        Neue Bahn
      </button>

      <button
        className="action-btn overview-btn"
        onClick={zurUebersicht}
      >
        Übersicht
      </button>

      <div className="exercise-list">

        <div className="exercise-list-title">
          Erfasste Übungen
        </div>

        {uebungen.map((u, index) => {

            return (
              <div
                key={index}
                className="exercise-list-item"
              >

                <strong>
                  {u.id}
                </strong>

                <br />

                {u.name}

                <br />

                <span
                  className={
                    u.status === "fall"
                      ? "exercise-status-fall"
                      : u.status === "notRecognized"
                      ? "exercise-status-notrecognized"
                      : "exercise-status-valid"
                  }
                >
                  {u.status}
                </span>

              </div>
            );

          })}

      </div>

    </div>

  </div>
);
}