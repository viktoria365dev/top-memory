import { useState, useEffect } from "react";
import Card from "./Card";
import Overlay from "./Overlay";

// helper function for Pokémon ranges
function getPokemonRange(generation) {
  const ranges = {
    1: [1, 151], // Gen 1
    2: [152, 251], // Gen 2
    3: [252, 386], // Gen 3
    4: [387, 493], // Gen 4
  };
  return ranges[generation] || [1, 151];
}

function GameBoard({ score, setScore, bestScore, setBestScore }) {
  const [pokemon, setPokemon] = useState([]);
  const [clicked, setClicked] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [shinyMode, setShinyMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cryEnabled, setCryEnabled] = useState(true);
  const [generation, setGeneration] = useState(1);

  // fetch Pokémon based on generation
  async function fetchPokemon(limit = 12) {
    const [start, end] = getPokemonRange(generation);
    setLoading(true);

    // Generate unique random IDs within the generation range
    const ids = new Set();
    while (ids.size < limit) {
      ids.add(Math.floor(Math.random() * (end - start + 1)) + start);
    }

    // Fetch Pokémon data
    const detailed = await Promise.all(
      [...ids].map(async (id) => {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        return await res.json();
      })
    );

    // Preload all images
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
              img.onerror = resolve;
            })
        );
      })
    );

    // Preload all cries
    await Promise.all(
      detailed
        .map((p) => p.cries?.latest)
        .filter(Boolean)
        .map(
          (url) =>
            new Promise((resolve) => {
              const audio = new Audio();
              audio.src = url;
              audio.oncanplaythrough = resolve;
              audio.onerror = resolve;
            })
        )
    );

    // Update state
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
  }, [generation]); // refetch when generation changes

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
        <button className="difficulty" onClick={() => fetchPokemon(6)}>
          Easy
        </button>
        <button className="difficulty" onClick={() => fetchPokemon(12)}>
          Medium
        </button>
        <button className="difficulty" onClick={() => fetchPokemon(24)}>
          Hard
        </button>
        <button onClick={() => setShinyMode((s) => !s)}>
          {shinyMode ? "Shiny: ON" : "Shiny: OFF"}
        </button>
        <button onClick={() => setCryEnabled((c) => !c)}>
          {cryEnabled ? "Cry: ON 🔊" : "Cry: OFF 🔇"}
        </button>

        {/* Generation dropdown */}
        <label htmlFor="generation-select" className="visually-hidden">
          Generation
        </label>

        <select
          id="generation-select"
          value={generation}
          onChange={(e) => setGeneration(Number(e.target.value))}
        >
          <option value={1}>Gen 1</option>
          <option value={2}>Gen 2</option>
          <option value={3}>Gen 3</option>
          <option value={4}>Gen 4</option>
        </select>
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
              cry={p.cries?.latest}
              cryEnabled={cryEnabled}
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
