
// useTransition for improved loading states
// http://localhost:3000/isolated/exercise/03.js

import * as React from 'react'
import {
  fetchPokemon,
  PokemonInfoFallback,
  PokemonForm,
  PokemonDataView,
  PokemonErrorBoundary,
} from '../pokemon'
import {createResource} from '../utils'

// 💯 Extra Credit 2:
// busyDelayMs matches the CSS transition delay.
// busyMinDurationMs keeps the pending state visible long enough
// to avoid a flash of loading content.
const SUSPENSE_CONFIG = {
  timeoutMs: 4000,
  busyDelayMs: 300,
  busyMinDurationMs: 500,
}

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

function createPokemonResource(pokemonName) {
  // You can experiment with different delays:
  // 450 = shows busy indicator
  // 1500 = normal loading
  // 5000 = busy indicator, then Suspense fallback
  // 200 = very fast request / flash of loading content
  const delay = 1500

  return createResource(fetchPokemon(pokemonName, delay))
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')

  // React 17 syntax:
  // [startTransition, isPending]
  const [startTransition, isPending] =
    React.useTransition(SUSPENSE_CONFIG)

  const [pokemonResource, setPokemonResource] = React.useState(null)

  React.useEffect(() => {
    if (!pokemonName) {
      setPokemonResource(null)
      return
    }

    // 🐨 Start the resource update inside a transition
    startTransition(() => {
      setPokemonResource(createPokemonResource(pokemonName))
    })
  }, [pokemonName, startTransition])

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
          {/* 💯 Extra Credit 1:
              Apply the CSS class instead of inline opacity styles.
              The pokemon-loading class is defined in styles.css.
          */}
          <div
            className={
              isPending
                ? 'pokemon-info pokemon-loading'
                : 'pokemon-info'
            }
          >
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

