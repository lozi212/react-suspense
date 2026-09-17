// Cache resources
// http://localhost:3000/isolated/exercise/04.js

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

const SUSPENSE_CONFIG = {
  timeoutMs: 4000,
  busyDelayMs: 300,
  busyMinDurationMs: 700,
}

// --------------------------------------------------
// Main Exercise
// --------------------------------------------------

// Cache for pokemon resources
const pokemonResourceCache = {}

// Get a pokemon resource from the cache.
// If it doesn't exist, create it and add it to the cache.
function getPokemonResource(pokemonName) {
  let pokemonResource = pokemonResourceCache[pokemonName]

  if (!pokemonResource) {
    pokemonResource = createResource(fetchPokemon(pokemonName))
    pokemonResourceCache[pokemonName] = pokemonResource
  }

  return pokemonResource
}

// --------------------------------------------------
// Extra 1, 2 & 3:
// Put cache in Context + Provider + Cache Timeout
// --------------------------------------------------

const PokemonResourceCacheContext =
  React.createContext(getPokemonResource)

function PokemonCacheProvider({children, cacheTime = 5000}) {
  // Keep the cache attached to this provider component
  const cacheRef = React.useRef({})

  const getPokemonResource = React.useCallback(
    pokemonName => {
      let pokemonResource = cacheRef.current[pokemonName]

      if (!pokemonResource) {
        pokemonResource = createResource(fetchPokemon(pokemonName))

        cacheRef.current[pokemonName] = pokemonResource

        // Extra 3:
        // Remove the resource from the cache after cacheTime
        setTimeout(() => {
          if (cacheRef.current[pokemonName] === pokemonResource) {
            delete cacheRef.current[pokemonName]
          }
        }, cacheTime)
      }

      return pokemonResource
    },
    [cacheTime],
  )

  return (
    <PokemonResourceCacheContext.Provider value={getPokemonResource}>
      {children}
    </PokemonResourceCacheContext.Provider>
  )
}

function usePokemonResourceCache() {
  return React.useContext(PokemonResourceCacheContext)
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

  // Extra 1 & 2:
  // Get getPokemonResource from Context
  const getPokemonResource = usePokemonResourceCache()

  React.useEffect(() => {
    if (!pokemonName) {
      setPokemonResource(null)
      return
    }

    startTransition(() => {
      // Use the cached resource instead of
      // creating a new resource every time
      setPokemonResource(getPokemonResource(pokemonName))
    })
  }, [pokemonName, startTransition, getPokemonResource])

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

// --------------------------------------------------
// AppWithProvider
// --------------------------------------------------

function AppWithProvider() {
  return (
    <PokemonCacheProvider cacheTime={5000}>
      <App />
    </PokemonCacheProvider>
  )
}

export default AppWithProvider