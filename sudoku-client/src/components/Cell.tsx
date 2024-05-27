import { AspectRatio } from "@mui/joy";

const Cell = (props) => {
  const i = props.index;
  const thickLocations = [2, 5, 8];
  const className = [];
  className.push("cell");
  className.push(thickLocations.includes(i % 9) ? "thick-right" : "thin-right");
  className.push(
    thickLocations.includes(Math.trunc(i / 9)) ? "thick-bottom" : "thin-bottom"
  );
  className.push(i < 9 ? "thick-top" : "thin-top");
  className.push(i % 9 === 0 ? "thick-left" : "thin-left");
  if (props.error) {
    className.push("error");
  }
  if (props.next) {
    className.push("next");
  }
  const candidates = [];
  for (let j = 1; j < 10; j++) {
    if (j in props.candidates) {
      candidates.push(
        <span
          className={props.candidates[j]}
        >
          {j}
        </span>
      );
    }
  }
  return (
    <AspectRatio ratio="1/1">
      <input
        ref={props.cellRef}
        className={className.join(" ")}
        id={i.toString()}
        value={props.value}
        disabled={props.submitted && !props.related}
        readOnly={props.submitted}
        onChange={(e) => props.onCellChange(i, e.target.value)}
        onKeyPress={(event) => {
          if (!/[1-9]/.test(event.key)) {
            event.preventDefault();
          } else if (!props.submitted) {
            props.deleteCell(i);
          }
        }}
        onKeyDown={(event) => {
          switch (event.key) {
            case "Down":
            case "ArrowDown":
            case "j":
              event.preventDefault();
              if (i < 72) {
                props.changeFocus(i + 9);
              }
              break;
            case "Up":
            case "ArrowUp":
            case "k":
              event.preventDefault();
              if (i > 8) {
                props.changeFocus(i - 9);
              }
              break;
            case "Right":
            case "ArrowRight":
            case "l":
              event.preventDefault();
              if (i < 80) {
                props.changeFocus(i + 1);
              }
              break;
            case "Left":
            case "ArrowLeft":
            case "h":
              event.preventDefault();
              if (i > 0) {
                props.changeFocus(i - 1);
              }
              break;
            case "Enter":
              props.handleSubmit();
              break;
            case "Backspace":
              event.preventDefault();
              if (props.value !== "") {
                props.deleteCell(i);
              } else if (i > 0) {
                props.changeFocus(i - 1);
              }
              break;
            case "Delete":
              event.preventDefault();
              if (props.value !== "") {
                props.deleteCell(i);
                props.cleanupErrors(i);
              }
              break;
            default:
              break;
          }
        }}
      />
      <div className="candidates">{candidates}</div>
    </AspectRatio>
  );
};

export default Cell;