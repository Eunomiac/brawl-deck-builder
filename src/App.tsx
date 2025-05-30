// MTG Brawl Deck Builder - Main Application Component
import {AnimatedCard} from './components/common/AnimatedCard';
import {DraggableCard} from './components/common/DraggableCard';
import {LoadingSpinner} from './components/common/LoadingSpinner';
import {GSAPProvider} from './contexts/GSAPContext';

function App() {
  return (
    <GSAPProvider>
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
            <AnimatedCard className="app-content p-xl text-center" delay={0.2}>
              <h2 className="text-accent mb-md">Welcome to your MTG Brawl Deck Builder!</h2>
              <p className="text-secondary mb-lg">
                Project setup complete with React, TypeScript, Vite, SCSS architecture, and GSAP animations.
              </p>

              <div className="grid grid-cols-3 gap-md mb-lg">
                <AnimatedCard className="p-md" delay={0.4}>
                  <h3 className="text-lg mb-sm card-title">🎨 Styling System</h3>
                  <p className="text-sm text-secondary">
                    Modern SCSS with mixins, utilities, and responsive design
                  </p>
                </AnimatedCard>
                <AnimatedCard className="p-md" delay={0.5}>
                  <h3 className="text-lg mb-sm card-title">⚡ Performance</h3>
                  <p className="text-sm text-secondary">
                    Optimized build system with path aliases and modern tooling
                  </p>
                </AnimatedCard>
                <AnimatedCard className="p-md" delay={0.6}>
                  <h3 className="text-lg mb-sm card-title">📱 Responsive</h3>
                  <p className="text-sm text-secondary">
                    Mobile-first design with flexible grid system
                  </p>
                </AnimatedCard>
              </div>

              <AnimatedCard className="p-lg mb-lg bg-secondary" delay={0.7}>
                <h3 className="text-lg mb-md card-title">MTG Font Integration</h3>
                <div className="grid grid-cols-2 gap-lg">
                  <div>
                    <h4 className="text-md mb-sm font-heading">Mana Symbols</h4>
                    <div className="mana-cost mb-sm">
                      <i className="ms ms-3 ms-cost ms-shadow"></i>
                      <i className="ms ms-w ms-cost ms-shadow"></i>
                      <i className="ms ms-u ms-cost ms-shadow"></i>
                      <i className="ms ms-b ms-cost ms-shadow"></i>
                      <i className="ms ms-r ms-cost ms-shadow"></i>
                      <i className="ms ms-g ms-cost ms-shadow"></i>
                      <i className="ms ms-c ms-cost ms-shadow"></i>
                      <i className="ms ms-x ms-cost ms-shadow"></i>
                    </div>
                    <div className="mana-cost mb-sm">
                      <i className="ms ms-wu ms-cost ms-shadow"></i>
                      <i className="ms ms-ub ms-cost ms-shadow"></i>
                      <i className="ms ms-br ms-cost ms-shadow"></i>
                      <i className="ms ms-rg ms-cost ms-shadow"></i>
                      <i className="ms ms-gw ms-cost ms-shadow"></i>
                      <i className="ms ms-tap ms-cost ms-shadow"></i>
                    </div>
                    <i className="ms ms-loyalty-up ms-loyalty-3"></i>
                    <i className="ms ms-loyalty-down ms-loyalty-4"></i>
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
              </AnimatedCard>

              <AnimatedCard className="p-lg mb-lg bg-primary" delay={0.8}>
                <h3 className="text-lg mb-md card-title">🎬 GSAP Animation System</h3>
                <div className="grid grid-cols-2 gap-lg">
                  <div>
                    <h4 className="text-md mb-sm font-heading">Interactive Cards</h4>
                    <p className="text-sm text-secondary mb-sm">
                      Hover over cards to see smooth animations and transitions
                    </p>
                    <LoadingSpinner size="sm" className="mb-sm" />
                    <p className="text-xs text-secondary">Animated loading spinner</p>
                  </div>
                  <div>
                    <h4 className="text-md mb-sm font-heading">Drag & Drop Ready</h4>
                    <DraggableCard className="p-sm bg-accent text-center">
                      <p className="text-sm font-semibold">Drag me!</p>
                      <p className="text-xs">GSAP Draggable integration</p>
                    </DraggableCard>
                  </div>
                </div>
              </AnimatedCard>

              <button className="btn-primary">
                Ready for Development
              </button>
            </AnimatedCard>
          </div>
        </main>
      </div>
    </GSAPProvider>
  )
}

export default App
