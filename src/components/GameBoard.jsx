import { useState, useEffect } from "react";
import Card from "./Card";
import Overlay from "./Overlay";

function GameBoard({ score, setScore, bestScore, setBestScore }) {
  const [pokemon, setPokemon] = useState([]);
  const [clicked, setClicked] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [shinyMode, setShinyMode] = useState(true);
  const [loading, setLoading] = useState(false);

  // Fetch random Gen 1 Pokémon
  async function fetchPokemon(limit = 12) {
    const maxGen1 = 151;
    setLoading(true);

    // Generate unique random IDs
    const ids = new Set();
    while (ids.size < limit) {
      ids.add(Math.floor(Math.random() * maxGen1) + 1);
    }

    // Fetch Pokémon data
    const detailed = await Promise.all(
      [...ids].map(async (id) => {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        return await res.json();
      })
    );

    // ✅ Preload all images (normal + shiny if available)
    await Promise.all(
      detailed.flatMap((p) => {
        const urls = [p.sprites.front_default, p.sprites.front_shiny].filter(
          Boolean
        );
        return urls.map(
          (url) =>
            new Promise((resolve) => {
              const img = new Image();
              img.src = url;
              img.onload = resolve;
              img.onerror = resolve; // still resolve if it fails
            })
        );
      })
    );

    // Once data + images are ready, update state
    setPokemon(detailed);
    setClicked([]);
    setGameOver(false);
    setGameWon(false);
    setScore(0);
    setLoading(false);
  }

  // Initial fetch
  useEffect(() => {
    fetchPokemon(12);
  }, []);

  function handleClick(id) {
    if (clicked.includes(id)) {
      setGameOver(true);
    } else {
      const newScore = score + 1;
      setClicked([...clicked, id]);
      setScore(newScore);

      if (newScore > bestScore) setBestScore(newScore);
      if (newScore === pokemon.length) setGameWon(true);
    }
    setPokemon([...pokemon].sort(() => Math.random() - 0.5));
  }

  return (
    <div>
      {/* Controls */}
      <div className="difficulty-buttons">
        <button onClick={() => fetchPokemon(6)}>Easy</button>
        <button onClick={() => fetchPokemon(12)}>Medium</button>
        <button onClick={() => fetchPokemon(24)}>Hard</button>
        <button onClick={() => setShinyMode((s) => !s)}>
          {shinyMode ? "Shiny: ON" : "Shiny: OFF"}
        </button>
      </div>

      {/* Loading indicator */}
      {loading ? (
        <div className="loading">Loading Pokémon… ✨</div>
      ) : (
        <div className="grid">
          {pokemon.map((p) => (
            <Card
              key={p.id}
              id={p.id}
              name={p.name}
              sprite={p.sprites.front_default}
              shinySprite={p.sprites.front_shiny}
              shinyMode={shinyMode}
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
      )}
    </div>
  );
}

export default GameBoard;
