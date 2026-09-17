
// Simple Data-fetching
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'

import {
  fetchPokemon,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon'

import {createResource} from '../utils'

// Create a resource for the Pikachu request
const pokemonResource = createResource(fetchPokemon('pikachu'))

function PokemonInfo() {
  // Read the pokemon data from the resource
  // If it's pending, this throws the promise and Suspense handles it
  // If it failed, this throws the error and ErrorBoundary handles it
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
  return (
    <div className="pokemon-info-app">
      <div className="pokemon-info">
        <PokemonErrorBoundary>
          <React.Suspense fallback={<PokemonInfoFallback />}>
            <PokemonInfo />
          </React.Suspense>
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}

export default App

