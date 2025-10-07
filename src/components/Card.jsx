function Card({ id, name, sprite, shinySprite, shinyMode, onClick }) {
  return (
    <div className="card" onClick={() => onClick(id)}>
      <img src={shinyMode ? shinySprite || sprite : sprite} alt={name} />
      <p>{name}</p>
    </div>
  );
}

export default Card;
