export default function Spinner({ text = 'Loading…' }) {
  return (
    <div className="spinner-wrap">
      <div className="spinner-ring" />
      <span>{text}</span>
    </div>
  );
}
