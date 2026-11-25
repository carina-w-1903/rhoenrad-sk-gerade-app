import { useState } from "react";
import { berechneWertung } from "../utils/wertung";
import SG_SK_Anforderungen
  from "../data/SG_SK_Anforderungen.json";

export default function UebersichtPage({
  ak,
  uebungen,
  setUebungen,
  setEditIndex,
  setKorrekturModus,
  zurueck,
  naechsterTurner,
  neueAltersklasse,
}) {
  const result = berechneWertung(uebungen, ak);
  const akRegel = SG_SK_Anforderungen[ak];

  const sichtbareSG = Object.keys(
    akRegel?.sgRequirements || {}
  )
    .map(Number)
    .sort((a, b) => a - b);
  const bewerteteUebungen =  result.bewerteteUebungen;
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [showCorrectionTools, setShowCorrectionTools] =   useState(false);
  const [selectedExercise, setSelectedExercise] = useState(null);

  function deleteExercise() {
    if (selectedIndex === null) {
      return;
    }

    const neu = uebungen.filter(
      (_, i) => i !== selectedIndex
    );

    setUebungen(neu);
    setSelectedIndex(null);
  }

  function moveExerciseUp() {
    if (
      selectedIndex === null ||
      selectedIndex === 0
    ) {
      return;
    }

    const neu = [...uebungen];

    [neu[selectedIndex - 1], neu[selectedIndex]] =
      [neu[selectedIndex], neu[selectedIndex - 1]];

    setUebungen(neu);
    setSelectedIndex(selectedIndex - 1);
  }

  function moveExerciseDown() {
    if (
      selectedIndex === null ||
      selectedIndex >= uebungen.length - 1
    ) {
      return;
    }

    const neu = [...uebungen];

    [neu[selectedIndex + 1], neu[selectedIndex]] =
      [neu[selectedIndex], neu[selectedIndex + 1]];

    setUebungen(neu);
    setSelectedIndex(selectedIndex + 1);
  }

  function addExercise() {
    setEditIndex(null);
    setKorrekturModus(true);

    zurueck();
  }

  function editExercise() {
  if (selectedIndex === null) {
    return;
  }

  setEditIndex(selectedIndex);
  setKorrekturModus(true);

  zurueck();
}

function toggleFall() {

  if (selectedIndex === null) {
    return;
  }

  const neu = [...uebungen];

  neu[selectedIndex] = {
    ...neu[selectedIndex],
    status:
      neu[selectedIndex].status === "fall"
        ? "valid"
        : "fall",
  };

  setUebungen(neu);
}

function toggleNotRecognized() {

  if (selectedIndex === null) {
    return;
  }

  const neu = [...uebungen];

  neu[selectedIndex] = {
    ...neu[selectedIndex],
    status:
      neu[selectedIndex].status ===
      "notRecognized"
        ? "valid"
        : "notRecognized",
  };

  setUebungen(neu);
}

let uebungsNummer = 0;
let letzteBahn = null;

  return (
    <div className="overview-page">

      <h1 className="overview-title">
        Übersicht
      </h1>

      <div className="overview-ak-floating">
        {ak}
      </div>

      <div className="overview-actions">

    <div className="overview-actions-left">

    <button
      className="overview-back-btn"
      onClick={() => {
        if (showCorrectionTools) {
          setSelectedIndex(null);
        }

        setShowCorrectionTools(
          !showCorrectionTools
        );
      }}
    >
      {showCorrectionTools
        ? "Fertig"
        : "Korrektur"}
    </button>

    {showCorrectionTools && (
      <div className="overview-correction-tools">

        <button
          className="overview-small-btn"
          onClick={editExercise}
        >
          Bearbeiten
        </button>

        <button
          className="overview-small-btn"
          onClick={deleteExercise}
        >
          Löschen
        </button>

        <button
          className="overview-small-btn"
          onClick={moveExerciseUp}
        >
          ↑
        </button>

        <button
          className="overview-small-btn"
          onClick={moveExerciseDown}
        >
          ↓
        </button>

        <button
          className="overview-small-btn"
          onClick={addExercise}
        >
          Übung hinzufügen
        </button>

        <button
          className={`overview-small-btn ${
            selectedIndex !== null &&
            uebungen[selectedIndex]?.status === "fall"
              ? "overview-toggle-active"
              : ""
          }`}
          onClick={toggleFall}
        >
          Sturz
        </button>

        <button
          className={`overview-small-btn ${
            selectedIndex !== null &&
            uebungen[selectedIndex]?.status === "notRecognized"
              ? "overview-toggle-active"
              : ""
          }`}
          onClick={toggleNotRecognized}
        >
          Nicht anerkannt
        </button>

      </div>
      
    )}

  </div>

  <div className="overview-actions-right">

    <button
      className="overview-back-btn"
      onClick={naechsterTurner}
    >
      Nächster Turner
    </button>

    <button
      className="overview-back-btn"
      onClick={neueAltersklasse}
    >
      Neue Altersklasse
    </button>

  </div>


  </div>

      <div className="overview-layout">

        <div className="overview-left">

        <div className="overview-header-row">
          <span>Bahn</span>
          <span>Nr.</span>
          <span>Kürzel</span>
          <span>Übung</span>
          <span>SG</span>
          <span>Status</span>
        </div>

        {uebungen.map((u, index) => {
          const bahnWechsel =
            letzteBahn !== null &&
            letzteBahn !== u.bahn;

          letzteBahn = u.bahn;
          const bahnAnzeigen =
            index === 0 || bahnWechsel;
          const bewertet = bewerteteUebungen[index] || u;
          
          return (
            <>

                <div
                  key={`bahn-${index}`}
                  className={`overview-exercise ${
                    selectedExercise === u
                      ? "overview-selected"
                      : ""
                  } ${
                    bahnWechsel
                      ? "overview-bahn-start"
                      : ""
                  }`}
                ></div>
              <div
                key={index}
                className={`overview-exercise ${
                  selectedExercise === u
                    ? "overview-selected"
                    : ""
                }`}

                onClick={() => {

                  setSelectedExercise(u);

                  if (!showCorrectionTools) {
                    return;
                  }

                  setSelectedIndex(index);

                }}
             
              >
                <span>
                  {bahnAnzeigen ? u.bahn : ""}
                </span>

                <span>
                  {++uebungsNummer}.
                </span>

                <span
                  className={
                    u.status === "fall" ||
                    u.status === "notRecognized" ||
                    bewertet.status === "sgLimit" ||
                    bewertet.status === "bahnLimit"
                      ? "overview-id overview-invalid"
                      : "overview-id"
                  }
                >
                  {u.id}
                </span>

                <span
                  className={
                    u.status === "fall" ||
                    u.status === "notRecognized" ||
                    bewertet.status === "sgLimit" ||
                    bewertet.status === "bahnLimit"
                      ? "overview-invalid"
                      : "overview-name"
                  }
                >
                  {u.name}
                </span>

                <span
                  className={
                    u.status === "fall" ||
                    u.status === "notRecognized" ||
                    bewertet.status === "sgLimit" ||
                    bewertet.status === "bahnLimit"
                      ? "overview-groups overview-invalid"
                      : "overview-groups"
                  }
                >
                  {u.groups?.join(", ")}
                </span>

                <span className="overview-status">
                  {u.status === "fall"
                    ? "Sturz"
                    : u.status === "notRecognized"
                    ? "Nicht anerkannt"
                    : bewertet.status === "sgLimit"
                    ? "SG-Limit überschritten"
                    : bewertet.status === "bahnLimit"
                    ? "Max. 6 Bahnen"
                    : ""}
                </span>

              </div>

              {u.additionalExercises?.map(
                (a, idx) => (
                  <div
                    key={`sub-${index}-${idx}`}
                    className="overview-sub-row"
                  >

                    <span></span>
                    <span></span>

                    <span className="overview-id">
                      + {a.id}
                    </span>

                    <span className="overview-name">
                      {a.name}
                    </span>

                    <span className="overview-groups">
                      {a.groups?.join(", ")}
                    </span>

                    <span className="overview-status">
                      {a.status === "fall"
                        ? "Sturz"
                        : a.status ===
                          "notRecognized"
                        ? "Nicht anerkannt"
                        : ""}
                    </span>

                  </div>
                )
              )}
            </>
            
          );
            
        })}

        </div>

        <div className="overview-right">

          <div className="overview-block">

            <div className="overview-block-title">
              Technischer Wert
            </div>

            <div className="overview-table">

              {["0", "A", "B", "C", "D", "E"].map(
                (s) => (
                  <div
                    key={s}
                    className="overview-cell overview-header"
                  >
                    {s}
                  </div>
                )
              )}

              {["0", "A", "B", "C", "D", "E"].map(
                (s) => (
                  <div
                    key={s + "-count"}
                    className="overview-cell"
                  >
                    {result.schwierigkeiten[s]}
                  </div>
                )
              )}

            </div>

            <div className="overview-value">
              {result.technischerWert.toFixed(1)}
            </div>

          </div>

          <div className="overview-block">

            <div className="overview-block-title">
              Bonus für gezeigte Strukturgruppen
            </div>

            <div
              className="overview-table sg-table"
              style={{
                gridTemplateColumns:
                  `repeat(${sichtbareSG.length}, 1fr)`
              }}
            >
              {sichtbareSG.map((nr) => (
                <div
                  key={`header-${nr}`}
                  className="overview-cell overview-header"
                >
                  {nr}
                </div>
              ))}

              {sichtbareSG.map((nr) => (
                <div
                  key={`sg-${nr}`}
                  className="overview-cell"
                >
                  {result.ueberzaehligeInternationaleSG?.includes(nr)
                    ? "(✓)"
                    : result.strukturgruppenListe.includes(nr)
                    ? "✓"
                    : ""}
                </div>
              ))}

            </div>

            <div className="overview-value">
              {result.bonus.toFixed(1)}
            </div>
            </div>

          <div className="overview-endwert">

            <span>Endwert</span>

            <span>
              {result.endwert.toFixed(
                1
              )}
            </span>

          </div>

        </div>
        </div>
        {selectedExercise && (

          <div className="exercise-details">

            <div className="exercise-details-title">
              Details zur Übung
            </div>

            <div className="exercise-details-table">

              <div className="exercise-details-header">
                Kürzel
              </div>

              <div className="exercise-details-header">
                Name
              </div>

              <div className="exercise-details-header">
                Ausführung / Abzüge
              </div>

              <div className="exercise-details-header">
                Anerkennung
              </div>

              <div>
                {selectedExercise.id}
              </div>

              <div>
                {selectedExercise.name}
              </div>

              <div className="exercise-details-text">
                {selectedExercise.executionDeductions}
              </div>

              <div className="exercise-details-text">
                {selectedExercise.recognition}
              </div>

            </div>

          </div>

        )}
      
    </div>
  );
}