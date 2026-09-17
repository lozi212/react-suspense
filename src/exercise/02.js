// Render as you fetch
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react'
import {
  fetchPokemon,
  PokemonInfoFallback,
  PokemonForm,
  PokemonDataView,
  PokemonErrorBoundary,
} from '../pokemon'

import {createResource} from '../utils'

function PokemonInfo({pokemonResource}) {
  const pokemon = pokemonResource.read()

  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemon.image} alt={pokemon.name} />
      </div>

      <PokemonDataView pokemon={pokemon} />
    </div>
  )
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')
  const [pokemonResource, setPokemonResource] = React.useState(null)

  React.useEffect(() => {
    if (pokemonName) {
      setPokemonResource(createResource(fetchPokemon(pokemonName)))
    } else {
      setPokemonResource(null)
    }
  }, [pokemonName])

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
    setPokemonResource(null)
  }

  return (
    <PokemonErrorBoundary
      onReset={handleReset}
      resetKeys={[pokemonResource]}
    >
      <div className="pokemon-info-app">
        <PokemonForm
          pokemonName={pokemonName}
          onSubmit={handleSubmit}
        />

        <hr />

        <React.Suspense
          fallback={
            <div className="pokemon-info">
              <PokemonInfoFallback name={pokemonName} />
            </div>
          }
        >
          <div className="pokemon-info">
            {pokemonResource ? (
              <PokemonInfo pokemonResource={pokemonResource} />
            ) : (
              'Submit a pokemon'
            )}
          </div>
        </React.Suspense>
      </div>
    </PokemonErrorBoundary>
  )
}

export default App

