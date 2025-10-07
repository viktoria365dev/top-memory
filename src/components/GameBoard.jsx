import { useState, useEffect } from "react";
import Card from "./Card";
import Overlay from "./Overlay";

function GameBoard({ score, setScore, bestScore, setBestScore }) {
  const [pokemon, setPokemon] = useState([]);
  const [clicked, setClicked] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);

  // Fetch Pokémon with a variable limit (default 12)
  async function fetchPokemon(limit = 12) {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}`);
    const data = await res.json();

    const detailed = await Promise.all(
      data.results.map(async (p) => {
        const pokeRes = await fetch(p.url);
        return await pokeRes.json();
      })
    );

    setPokemon(detailed);
    setClicked([]);
    setGameOver(false);
    setGameWon(false);
    setScore(0);
  }

  // Initial fetch on mount
  useEffect(() => {
    fetchPokemon(12); // default difficulty
  }, []);

  function handleClick(id) {
    if (clicked.includes(id)) {
      // Game Over
      setGameOver(true);
    } else {
      const newScore = score + 1;
      setClicked([...clicked, id]);
      setScore(newScore);

      if (newScore > bestScore) setBestScore(newScore);

      // Win condition: clicked all Pokémon
      if (newScore === pokemon.length) {
        setGameWon(true);
      }
    }

    // Shuffle cards
    setPokemon([...pokemon].sort(() => Math.random() - 0.5));
  }

  return (
    <div>
      {/* Difficulty Selector */}
      <div className="difficulty-buttons">
        <button onClick={() => fetchPokemon(6)}>Easy</button>
        <button onClick={() => fetchPokemon(12)}>Medium</button>
        <button onClick={() => fetchPokemon(20)}>Hard</button>
      </div>

      {/* Game Grid */}
      <div className="grid">
        {pokemon.map((p) => (
          <Card
            key={p.id}
            id={p.id}
            name={p.name}
            sprite={p.sprites.front_default}
            onClick={handleClick}
          />
        ))}

        {gameOver && (
          <Overlay
            message="Game Over!"
            onRestart={() => fetchPokemon(pokemon.length)}
          />
        )}
        {gameWon && (
          <Overlay
            message="You Win!"
            onRestart={() => fetchPokemon(pokemon.length)}
          />
        )}
      </div>
    </div>
  );
}

export default GameBoard;
