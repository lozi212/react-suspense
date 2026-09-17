// Suspense Image
// http://localhost:3000/isolated/exercise/05.js

import React from 'react'

import {
  fetchPokemon,
  getImageUrlForPokemon,
  PokemonInfoFallback,
  PokemonForm,
  PokemonErrorBoundary,
} from '../pokemon'

import {createResource} from '../utils'

window.useRealAPI = true

// --------------------------------------------------
// Extra 2: Render as You Fetch
// --------------------------------------------------

const PokemonInfo = React.lazy(() =>
  import('../lazy/pokemon-info-render-as-you-fetch'),
)

// ❗❗❗❗
// Make sure "Disable cache" is UNCHECKED
// in the DevTools Network Tab.
// ❗❗❗❗

// --------------------------------------------------
// Suspense configuration
// --------------------------------------------------

const SUSPENSE_CONFIG = {
  timeoutMs: 4000,
  busyDelayMs: 300,
  busyMinDurationMs: 700,
}

// --------------------------------------------------
// Pokemon Resource Cache
// --------------------------------------------------

const pokemonResourceCache = {}

// --------------------------------------------------
// Extra 1: Avoid Waterfall
// --------------------------------------------------

function createPokemonInfoResource(pokemonName) {
  const data = createResource(fetchPokemon(pokemonName))

  const image = createResource(
    preloadImage(getImageUrlForPokemon(pokemonName)),
  )

  return {
    data,
    image,
  }
}

function getPokemonResource(name) {
  const lowerName = name.toLowerCase()

  let resource = pokemonResourceCache[lowerName]

  if (!resource) {
    resource = createPokemonInfoResource(lowerName)
    pokemonResourceCache[lowerName] = resource
  }

  return resource
}

// --------------------------------------------------
// Preload Image
// --------------------------------------------------

function preloadImage(src) {
  return new Promise(resolve => {
    const img = document.createElement('img')

    img.src = src

    img.onload = () => resolve(src)
  })
}

// --------------------------------------------------
// App
// --------------------------------------------------

function App() {
  const [pokemonName, setPokemonName] = React.useState('')

  const [startTransition, isPending] =
    React.useTransition(SUSPENSE_CONFIG)

  const [pokemonResource, setPokemonResource] =
    React.useState(null)

  React.useEffect(() => {
    if (!pokemonName) {
      setPokemonResource(null)
      return
    }

    startTransition(() => {
      setPokemonResource(getPokemonResource(pokemonName))
    })
  }, [pokemonName, startTransition])

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm
        pokemonName={pokemonName}
        onSubmit={handleSubmit}
      />

      <hr />

      <div
        className={`pokemon-info ${
          isPending ? 'pokemon-loading' : ''
        }`}
      >
        {pokemonResource ? (
          <PokemonErrorBoundary
            onReset={handleReset}
            resetKeys={[pokemonResource]}
          >
            <React.Suspense
              fallback={
                <PokemonInfoFallback name={pokemonName} />
              }
            >
              <PokemonInfo
                pokemonResource={pokemonResource}
              />
            </React.Suspense>
          </PokemonErrorBoundary>
        ) : (
          'Submit a pokemon'
        )}
      </div>
    </div>
  )
}

export default App