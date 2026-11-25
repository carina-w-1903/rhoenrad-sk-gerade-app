import { useState } from "react";
import StartPage from "./pages/StartPage";
import WertungPage from "./pages/WertungPage";
import UebersichtPage from "./pages/UebersichtPage";

function App() {
  const [screen, setScreen] = useState("start");
  const [ak, setAk] = useState("");
  const [uebungen, setUebungen] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [korrekturModus, setKorrekturModus] = useState(false);

  return (
    <>
      {screen === "start" && (
        <StartPage
          setAk={setAk}
          onStart={() => setScreen("wertung")}
        />
      )}

      {screen === "wertung" && (
        <WertungPage
          ak={ak}
          uebungen={uebungen}
          setUebungen={setUebungen}
          editIndex={editIndex}
          setEditIndex={setEditIndex}
          korrekturModus={korrekturModus}
          setKorrekturModus={setKorrekturModus}

          onFinish={() => setScreen("overview")}

          zurStartseite={() => {
            setUebungen([]);
            setAk("");
            setScreen("start");
          }}
        />
      )}

      {screen === "overview" && (
        <UebersichtPage
          ak={ak}
          uebungen={uebungen}
          setUebungen={setUebungen}
          setEditIndex={setEditIndex}
          setKorrekturModus={setKorrekturModus}

          zurueck={() =>
           setScreen("wertung")
          }

          naechsterTurner={() => {

            setUebungen([]);

            setScreen("wertung");

          }}

          neueAltersklasse={() => {

            setUebungen([]);

            setAk("");

            setScreen("start");

          }}
        />
      )}
    </>
  );
}

export default App;
