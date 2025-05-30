import { render, screen, fireEvent } from '../../test/test-utils';
import { describe, it, expect, jest } from '@jest/globals';
import { AnimatedCard } from './AnimatedCard';

describe('AnimatedCard Component', () => {
  it('renders children correctly', () => {
    render(
      <AnimatedCard>
        <span>Test Content</span>
      </AnimatedCard>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <AnimatedCard className="custom-class">
        <span>Test Content</span>
      </AnimatedCard>
    );

    const card = screen.getByText('Test Content').closest('.card');
    expect(card).toHaveClass('card', 'custom-class');
  });

  it('renders as div by default', () => {
    render(
      <AnimatedCard>
        <span>Test Content</span>
      </AnimatedCard>
    );

    const card = screen.getByText('Test Content').closest('div');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass('card');
  });

  it('renders as button when onClick is provided', () => {
    const handleClick = jest.fn();

    render(
      <AnimatedCard onClick={handleClick}>
        <span>Test Content</span>
      </AnimatedCard>
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('card');
    expect(button).toHaveStyle({
      cursor: 'pointer',
      background: 'none',
      padding: '0px'
    });
  });

  it('handles click events when clickable', () => {
    const handleClick = jest.fn();

    render(
      <AnimatedCard onClick={handleClick}>
        <span>Clickable Content</span>
      </AnimatedCard>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('enables fade-in animation when specified', () => {
    render(
      <AnimatedCard enableFadeIn={true} enableHover={false}>
        <span>Fade In Content</span>
      </AnimatedCard>
    );

    // Test that the component renders (fade-in ref is applied internally)
    expect(screen.getByText('Fade In Content')).toBeInTheDocument();
  });

  it('enables hover animation when specified', () => {
    render(
      <AnimatedCard enableHover={true}>
        <span>Hover Content</span>
      </AnimatedCard>
    );

    // Test that the component renders (hover ref is applied internally)
    expect(screen.getByText('Hover Content')).toBeInTheDocument();
  });

  it('prioritizes hover animation over fade-in when both are enabled', () => {
    render(
      <AnimatedCard enableHover={true} enableFadeIn={true}>
        <span>Priority Test</span>
      </AnimatedCard>
    );

    // Test that the component renders (hover ref takes priority)
    expect(screen.getByText('Priority Test')).toBeInTheDocument();
  });

  it('works with disabled animations', () => {
    render(
      <AnimatedCard enableHover={false} enableFadeIn={false}>
        <span>No Animation</span>
      </AnimatedCard>
    );

    // Test that the component renders without animation refs
    expect(screen.getByText('No Animation')).toBeInTheDocument();
  });

  it('combines onClick with fade-in animation', () => {
    const handleClick = jest.fn();

    render(
      <AnimatedCard
        onClick={handleClick}
        enableFadeIn={true}
        enableHover={false}
        className="animated-clickable"
      >
        <span>Animated Clickable</span>
      </AnimatedCard>
    );

    const button = screen.getByRole('button');
    expect(button).toHaveClass('card', 'animated-clickable');

    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
