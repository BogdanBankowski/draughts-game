export function Title(props) {
    return (
      <div className="title">
        <span className="names">{props.names}</span>{" "}
        <span className="result">{props.result}</span>
      </div>
    );
  }