export default function StartPage({
  setAk,
  onStart,
}) {
  return (
  <div className="start-page">

    <h1 className="start-title">
      Rhönrad
    </h1>


    <h2 className="start-heading">
      Schwierigkeit Gerade
    </h2>

    <h3 className="start-subheading">
      Altersklasse wählen:
    </h3>

    <select
      className="start-select"
      onChange={(e) =>
        setAk(e.target.value)
      }
    >
      <option value="">
        Bitte wählen
      </option>

      <option>AK 7/8</option>
      <option>AK 9/10</option>
      <option>AK 11/12</option>

      <option>AKL 13/14</option>
      <option>AKL 15/16</option>
      <option>AKL 17/18</option>
      <option>AKL 19+</option>
      <option>AKL 25+</option>
      <option>AKL 30+</option>
      <option>AKL 40+</option>

      <option>AKB 12</option>
      <option>AKB 13/14</option>
      <option>AKB 15/16</option>
      <option>AKB 17/18</option>
      <option>AKB 19+</option>
    </select>

    <button
      className="start-button"
      onClick={onStart}
    >
      Wertung starten
    </button>

  </div>
);
}