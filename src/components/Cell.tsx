import "./Cell.css";

export default function Cell({
  coords,
  dark,
}: {
  coords?: [string, number];
  dark?: boolean;
}) {
  return (
    <div className={"cell " + (dark ? "dark-cell" : "light-cell")}>{coords}</div>
  );
}
