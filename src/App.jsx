import './App.css';
import { useEffect, useState } from 'react';

function App () {
  const [searchTerm, setSearchTerm] = useState('pikachu');
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const trimmedSearch = searchTerm.trim().toLowerCase();

    if (!trimmedSearch) {
      setPokemon(null);
      setError('Escribe el nombre de un Pokémon para empezar la búsqueda.');
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();

    const fetchPokemon = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${trimmedSearch}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(response.status === 404 ? 'Pokémon no encontrado.' : 'No se pudo obtener la información del Pokémon.');
        }

        const data = await response.json();

        setPokemon({
          id: data.id,   
          name: data.name,
          image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
          types: data.types.map((typeInfo) => typeInfo.type.name),
          height: data.height,
          weight: data.weight,
          ability: data.abilities[0]?.ability.name || 'desconocida',
        });
      } catch (fetchError) {
        if (fetchError.name === 'AbortError') {
          return;
        }

        setPokemon(null);
        setError(fetchError.message || 'Ha ocurrido un error inesperado.');
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    const timeoutId = setTimeout(fetchPokemon, 350);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [searchTerm]);

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <main className='app'>
      <section className='search-panel'>
        <p className='eyebrow'>PokeAPI + React</p>
        <h1>Buscador de Pokémon</h1>
        <p className='description'>
          Busca por nombre.
        </p>

        <form className='search-form' onSubmit={handleSubmit}>
          <label className='search-label' htmlFor='pokemon-search'>
            Nombre del Pokémon
          </label>
          <input
            id='pokemon-search'
            className='search-input'
            type='text'
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder='Ejemplo: pikachu'
            autoComplete='off'
          />
        </form>

        <div className='status-panel'>
          {loading && <p className='status-message'>Buscando Pokémon...</p>}
          {!loading && error && <p className='status-message error'>{error}</p>}

          {!loading && !error && pokemon && (
            <article className='pokemon-card'>
              <div className='pokemon-image-wrapper'>
                <img className='pokemon-image' src={pokemon.image} alt={pokemon.name} />
              </div>

              <div className='pokemon-content'>
                <div className='pokemon-heading'>
                  <span className='pokemon-id'>#{pokemon.id}</span>
                  <h2>{pokemon.name}</h2>
                </div>

                <div className='pokemon-types'>
                  {pokemon.types.map((type) => (
                    <span key={type} className='type-badge'>
                      {type}
                    </span>
                  ))}
                </div>

                <dl className='pokemon-stats'>
                  <div>
                    <dt>Altura</dt>
                    <dd>{pokemon.height / 10} m</dd>
                  </div>
                  <div>
                    <dt>Peso</dt>
                    <dd>{pokemon.weight / 10} kg</dd>
                  </div>
                  <div>
                    <dt>Habilidad</dt>
                    <dd>{pokemon.ability}</dd>
                  </div>
                </dl>
              </div>
            </article>
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
