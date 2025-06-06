import { render, screen } from './test/test-utils';
import { describe, it, expect } from '@jest/globals';
import App from './app/App';

describe('App Component', () => {
  it('renders the main heading', () => {
    render(<App />);

    const heading = screen.getByRole('heading', {
      name: /MTG Brawl Deck Builder/i,
      level: 1
    });

    expect(heading).toBeInTheDocument();
  });

  it('renders the welcome message', () => {
    render(<App />);

    const welcomeText = screen.getByText(/Welcome to your MTG Brawl Deck Builder!/i);
    expect(welcomeText).toBeInTheDocument();
  });

  it('renders the project description', () => {
    render(<App />);

    const description = screen.getByText(/A powerful deck building tool for MTG Arena Brawl format/i);
    expect(description).toBeInTheDocument();
  });

  it('renders the feature cards', () => {
    render(<App />);

    // Check for the three main feature cards
    expect(screen.getByText(/Styling System/i)).toBeInTheDocument();
    expect(screen.getByText(/Performance/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Responsive/i })).toBeInTheDocument();
  });

  it('renders the MTG font integration section', () => {
    render(<App />);

    expect(screen.getByText(/MTG Font Integration/i)).toBeInTheDocument();
    expect(screen.getByText(/Mana Symbols/i)).toBeInTheDocument();
    expect(screen.getByText(/Typography/i)).toBeInTheDocument();
  });

  it('renders the GSAP animation section', () => {
    render(<App />);

    expect(screen.getByText(/GSAP Animation System/i)).toBeInTheDocument();
    expect(screen.getByText(/Interactive Cards/i)).toBeInTheDocument();
    expect(screen.getByText(/Drag & Drop Ready/i)).toBeInTheDocument();
  });

  it('renders the ready for development button', () => {
    render(<App />);

    const button = screen.getByRole('button', { name: /Ready for Development/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('btn-primary');
  });

  it('has proper semantic structure', () => {
    render(<App />);

    // Check for proper semantic HTML
    expect(screen.getByRole('banner')).toBeInTheDocument(); // header
    expect(screen.getByRole('main')).toBeInTheDocument(); // main
  });
});
