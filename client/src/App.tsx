import { useEffect } from 'react'
import { Route, Switch } from 'wouter'
import { useAppStore } from './store'
import { Home } from './routes/Home'
import { Library } from './routes/Library'
import { Episode } from './routes/Episode'
import { Parents } from './routes/Parents'
import { Words } from './routes/Words'
import { About } from './routes/About'
import { Navbar } from './components/Navbar'

export function App() {
  const loadFromStorage = useAppStore((s) => s.loadFromStorage)

  useEffect(() => {
    loadFromStorage()
  }, [loadFromStorage])

  return (
    <div className="min-h-screen bg-parchment">
      <Navbar />
      <main className="mx-auto max-w-5xl px-4 pb-24 pt-4">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/library" component={Library} />
          <Route path="/episode/:slug" component={Episode} />
          <Route path="/parents" component={Parents} />
          <Route path="/words" component={Words} />
          <Route path="/about" component={About} />
          <Route>
            <div className="py-20 text-center font-serif text-2xl text-ink/60">
              This page doesn't exist, beta.
            </div>
          </Route>
        </Switch>
      </main>
    </div>
  )
}
