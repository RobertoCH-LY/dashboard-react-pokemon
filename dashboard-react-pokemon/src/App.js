import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [pokemons, setPokemons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('todos');
  const [currentPage, setCurrentPage] = useState(1);
  const pokemonsPerPage = 12;

  const tiposTraducidos = {
    normal: 'Normal',
    fire: 'Fuego',
    water: 'Agua',
    electric: 'Eléctrico',
    grass: 'Planta',
    ice: 'Hielo',
    fighting: 'Lucha',
    poison: 'Veneno',
    ground: 'Tierra',
    flying: 'Volador',
    psychic: 'Psíquico',
    bug: 'Bicho',
    rock: 'Roca',
    ghost: 'Fantasma',
    dragon: 'Dragón',
    dark: 'Siniestro',
    steel: 'Acero',
    fairy: 'Hada'
  };

  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=150');
        const data = await response.json();
        
        const pokemonDetails = await Promise.all(
          data.results.map(pokemon =>
            fetch(pokemon.url).then(res => res.json())
          )
        );
        
        setPokemons(pokemonDetails);
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar pokémons:', error);
        setLoading(false);
      }
    };

    fetchPokemons();
  }, []);

  const filteredPokemons = pokemons.filter(pokemon => {
    const matchesSearch = pokemon.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === 'todos' || 
                        pokemon.types.some(t => t.type.name === selectedType);
    return matchesSearch && matchesType;
  });

  const indexOfLastPokemon = currentPage * pokemonsPerPage;
  const indexOfFirstPokemon = indexOfLastPokemon - pokemonsPerPage;
  const currentPokemons = filteredPokemons.slice(indexOfFirstPokemon, indexOfLastPokemon);
  const totalPages = Math.ceil(filteredPokemons.length / pokemonsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedType]);

  const allTypes = [...new Set(pokemons.flatMap(p => p.types.map(t => t.type.name)))].sort();

  const stats = {
    totalPokemons: pokemons.length,
    pokemonsVisibles: filteredPokemons.length,
    tipos: allTypes.length
  };

  if (loading) return <div className="loading"><p>Cargando pokémons...</p></div>;

  return (
    <div className="app">
      <header>
        <h1>Pokédex</h1>
        <p>Explora 150 pokémons con datos reales de la PokéAPI</p>
      </header>

      <div className="container">
        <div className="stats">
          <div className="stat-card">
            <div className="stat-number">{stats.totalPokemons}</div>
            <div className="stat-label">Pokémons</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.pokemonsVisibles}</div>
            <div className="stat-label">Mostrados</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.tipos}</div>
            <div className="stat-label">Tipos</div>
          </div>
        </div>

        <div className="controls">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
            <option value="todos">Todos los tipos</option>
            {allTypes.map(type => (
              <option key={type} value={type}>{tiposTraducidos[type]}</option>
            ))}
          </select>
          <button onClick={() => { setSearch(''); setSelectedType('todos'); }}>
            Limpiar
          </button>
        </div>

        {currentPokemons.length === 0 ? (
          <p className="no-results">Sin resultados</p>
        ) : (
          <>
            <div className="pokemons-grid">
              {currentPokemons.map(pokemon => (
                <div key={pokemon.id} className="pokemon-card">
                  <img src={pokemon.sprites.other['official-artwork'].front_default} alt={pokemon.name} className="pokemon-image" />
                  <div className="pokemon-info">
                    <h3>{pokemon.name}</h3>
                    <p className="pokemon-id">#{pokemon.id}</p>
                    <div className="pokemon-types">
                      {pokemon.types.map(type => (
                        <span key={type.type.name} className={`type ${type.type.name}`}>
                          {tiposTraducidos[type.type.name]}
                        </span>
                      ))}
                    </div>
                    <div className="pokemon-stats">
                      <p>Altura: {pokemon.height / 10} m</p>
                      <p>Peso: {pokemon.weight / 10} kg</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={currentPage === i + 1 ? 'active' : ''}
                  >
                    {i + 1}
                  </button>
                ))}
                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
