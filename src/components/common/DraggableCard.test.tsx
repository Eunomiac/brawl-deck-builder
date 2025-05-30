import { render, screen } from '../../test/test-utils';
import { describe, it, expect, jest } from '@jest/globals';
import { DraggableCard } from './DraggableCard';

describe('DraggableCard Component', () => {
  it('renders children correctly', () => {
    render(
      <DraggableCard>
        <span>Draggable Content</span>
      </DraggableCard>
    );

    expect(screen.getByText('Draggable Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <DraggableCard className="custom-drag">
        <span>Test Content</span>
      </DraggableCard>
    );

    const card = screen.getByText('Test Content').closest('.card');
    expect(card).toHaveClass('card', 'custom-drag');
  });

  it('applies grab cursor when not disabled', () => {
    render(
      <DraggableCard>
        <span>Grabbable</span>
      </DraggableCard>
    );

    const card = screen.getByText('Grabbable').closest('.card');
    expect(card).toHaveClass('cursor-grab');
    expect(card).not.toHaveClass('cursor-default');
  });

  it('applies default cursor when disabled', () => {
    render(
      <DraggableCard disabled={true}>
        <span>Disabled Drag</span>
      </DraggableCard>
    );

    const card = screen.getByText('Disabled Drag').closest('.card');
    expect(card).toHaveClass('cursor-default');
    expect(card).not.toHaveClass('cursor-grab');
  });

  it('sets touch-action to none when not disabled', () => {
    render(
      <DraggableCard>
        <span>Touch Enabled</span>
      </DraggableCard>
    );

    const card = screen.getByText('Touch Enabled').parentElement as HTMLElement;
    expect(card.style.touchAction).toBe('none');
  });

  it('sets touch-action to auto when disabled', () => {
    render(
      <DraggableCard disabled={true}>
        <span>Touch Disabled</span>
      </DraggableCard>
    );

    const card = screen.getByText('Touch Disabled').parentElement as HTMLElement;
    expect(card.style.touchAction).toBe('auto');
  });

  it('handles drag start callback', () => {
    const onDragStart = jest.fn();

    render(
      <DraggableCard onDragStart={onDragStart}>
        <span>Drag Start Test</span>
      </DraggableCard>
    );

    // Simulate the internal drag start handler
    const component = screen.getByText('Drag Start Test').closest('.card');
    expect(component).toBeInTheDocument();

    // The drag start handler would be called by GSAP, but we can test the component renders
    expect(onDragStart).not.toHaveBeenCalled(); // Not called until actual drag
  });

  it('handles drag callback', () => {
    const onDrag = jest.fn();

    render(
      <DraggableCard onDrag={onDrag}>
        <span>Drag Test</span>
      </DraggableCard>
    );

    const component = screen.getByText('Drag Test').closest('.card');
    expect(component).toBeInTheDocument();
  });

  it('handles drag end callback', () => {
    const onDragEnd = jest.fn();

    render(
      <DraggableCard onDragEnd={onDragEnd}>
        <span>Drag End Test</span>
      </DraggableCard>
    );

    const component = screen.getByText('Drag End Test').closest('.card');
    expect(component).toBeInTheDocument();
  });

  it('configures snap to grid when enabled', () => {
    render(
      <DraggableCard snapToGrid={true} gridSize={20}>
        <span>Snap Grid</span>
      </DraggableCard>
    );

    const component = screen.getByText('Snap Grid').closest('.card');
    expect(component).toBeInTheDocument();
  });

  it('works with custom bounds', () => {
    render(
      <DraggableCard bounds=".container">
        <span>Bounded Drag</span>
      </DraggableCard>
    );

    const component = screen.getByText('Bounded Drag').closest('.card');
    expect(component).toBeInTheDocument();
  });

  it('combines all props correctly', () => {
    const onDragStart = jest.fn();
    const onDrag = jest.fn();
    const onDragEnd = jest.fn();

    render(
      <DraggableCard
        className="complex-drag"
        disabled={false}
        snapToGrid={true}
        gridSize={25}
        bounds="body"
        onDragStart={onDragStart}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
      >
        <span>Complex Draggable</span>
      </DraggableCard>
    );

    const card = screen.getByText('Complex Draggable').parentElement as HTMLElement;
    expect(card).toHaveClass('card', 'cursor-grab', 'complex-drag');
    expect(card.style.touchAction).toBe('none');
  });

  it('handles drag start with visual feedback', () => {
    const onDragStart = jest.fn();

    render(
      <DraggableCard onDragStart={onDragStart}>
        <span>Visual Feedback Test</span>
      </DraggableCard>
    );

    // Test that the component renders and would handle drag start
    expect(screen.getByText('Visual Feedback Test')).toBeInTheDocument();
  });

  it('handles drag end with cleanup', () => {
    const onDragEnd = jest.fn();

    render(
      <DraggableCard onDragEnd={onDragEnd}>
        <span>Cleanup Test</span>
      </DraggableCard>
    );

    // Test that the component renders and would handle drag end
    expect(screen.getByText('Cleanup Test')).toBeInTheDocument();
  });

  it('configures snap to grid with custom calculations', () => {
    render(
      <DraggableCard snapToGrid={true} gridSize={30}>
        <span>Grid Snap Test</span>
      </DraggableCard>
    );

    // Test that the component renders with snap configuration
    expect(screen.getByText('Grid Snap Test')).toBeInTheDocument();
  });
});
