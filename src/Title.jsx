export function Title(props) {
    return (
      <h1 className="title">
        <span className="names">{props.names}</span>{" "}
        <span className="result">{props.result}</span>
      </h1>
    );
  }