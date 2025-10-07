function Card({
  id,
  name,
  sprite,
  shinySprite,
  shinyMode,
  cry,
  cryEnabled,
  onClick,
}) {
  function handleClick() {
    if (cryEnabled && cry) {
      const audio = new Audio(cry);
      audio.play().catch(() => {
        console.warn(`Cry for ${name} could not be played`);
      });
    }
    onClick(id);
  }

  return (
    <div className={`card ${shinyMode ? "shiny" : ""}`} onClick={handleClick}>
      <img src={shinyMode ? shinySprite || sprite : sprite} alt={name} />
      <p>{name}</p>
    </div>
  );
}

export default Card;
