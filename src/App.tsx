// MTG Brawl Deck Builder - Main Application Component

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="container">
          <h1 className="text-center mb-sm">MTG Brawl Deck Builder</h1>
          <p className="text-center text-secondary mb-0">
            A powerful deck building tool for MTG Arena Brawl format
          </p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <div className="app-content card p-xl text-center">
            <h2 className="text-accent mb-md">Welcome to your MTG Brawl Deck Builder!</h2>
            <p className="text-secondary mb-lg">
              Project setup complete with React, TypeScript, Vite, and comprehensive SCSS architecture.
            </p>

            <div className="grid grid-cols-3 gap-md mb-lg">
              <div className="card p-md">
                <h3 className="text-lg mb-sm">🎨 Styling System</h3>
                <p className="text-sm text-secondary">
                  Modern SCSS with mixins, utilities, and responsive design
                </p>
              </div>
              <div className="card p-md">
                <h3 className="text-lg mb-sm">⚡ Performance</h3>
                <p className="text-sm text-secondary">
                  Optimized build system with path aliases and modern tooling
                </p>
              </div>
              <div className="card p-md">
                <h3 className="text-lg mb-sm">📱 Responsive</h3>
                <p className="text-sm text-secondary">
                  Mobile-first design with flexible grid system
                </p>
              </div>
            </div>

            <button className="btn-primary">
              Ready for Development
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
