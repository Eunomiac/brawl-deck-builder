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
                <h3 className="text-lg mb-sm card-title">🎨 Styling System</h3>
                <p className="text-sm text-secondary">
                  Modern SCSS with mixins, utilities, and responsive design
                </p>
              </div>
              <div className="card p-md">
                <h3 className="text-lg mb-sm card-title">⚡ Performance</h3>
                <p className="text-sm text-secondary">
                  Optimized build system with path aliases and modern tooling
                </p>
              </div>
              <div className="card p-md">
                <h3 className="text-lg mb-sm card-title">📱 Responsive</h3>
                <p className="text-sm text-secondary">
                  Mobile-first design with flexible grid system
                </p>
              </div>
            </div>

            <div className="card p-lg mb-lg bg-secondary">
              <h3 className="text-lg mb-md card-title">MTG Font Integration</h3>
              <div className="grid grid-cols-2 gap-lg">
                <div>
                  <h4 className="text-md mb-sm font-heading">Mana Symbols</h4>
                  <div className="mana-cost mb-sm">
                    <i className="ms ms-3"></i>
                    <i className="ms ms-w"></i>
                    <i className="ms ms-u"></i>
                    <i className="ms ms-b"></i>
                    <i className="ms ms-r"></i>
                    <i className="ms ms-g"></i>
                    <i className="ms ms-c"></i>
                    <i className="ms ms-x"></i>
                  </div>
                  <div className="mana-cost mb-sm">
                    <i className="ms ms-wu"></i>
                    <i className="ms ms-ub"></i>
                    <i className="ms ms-br"></i>
                    <i className="ms ms-rg"></i>
                    <i className="ms ms-gw"></i>
                    <i className="ms ms-tap"></i>
                    <i className="ms ms-loyalty-up"></i>
                    <i className="ms ms-loyalty-down"></i>
                  </div>
                  <p className="text-sm text-secondary">
                    Complete mana symbol library with hybrid, loyalty, and special symbols
                  </p>
                </div>
                <div>
                  <h4 className="text-md mb-sm font-heading">Typography</h4>
                  <p className="text-sm mb-xs">
                    <strong>Beleren:</strong> <span className="font-heading">Card titles and headers</span>
                  </p>
                  <p className="text-sm mb-xs">
                    <strong>MPlantin:</strong> <span className="font-body">Body text and descriptions</span>
                  </p>
                  <p className="text-sm flavor-text">
                    "The perfect blend of form and function."
                  </p>
                </div>
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
