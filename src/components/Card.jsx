function Card({ id, name, sprite, onClick }) {
  return (
    <div className="card" onClick={() => onClick(id)}>
      <img src={sprite} alt={name} />
      <p>{name}</p>
    </div>
  );
}

export default Card;
