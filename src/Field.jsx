export function Field({ piece, white }) {
    if (white) {
      return <div className="field-white"></div>;
    } else if (!piece) {
      return <div className="field-black"></div>;
    } else {
      return (
        <div className="field-black">
          <div className={piece + "-piece"}></div>{" "}
        </div>
      );
    }
  }