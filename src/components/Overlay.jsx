function Overlay({ message, onRestart }) {
  return (
    <div className="overlay">
      <div className="overlay-content">
        <h2>{message}</h2>
        <button onClick={onRestart}>Play Again</button>
      </div>
    </div>
  );
}

export default Overlay;
