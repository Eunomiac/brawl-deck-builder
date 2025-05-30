import { render, screen } from '../../test/test-utils';
import { describe, it, expect } from '@jest/globals';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('loading-spinner');
  });

  it('applies custom className', () => {
    const customClass = 'my-custom-spinner';
    render(<LoadingSpinner className={customClass} />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('loading-spinner', customClass);
  });

  it('applies size classes correctly', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    let spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('loading-spinner-sm');

    rerender(<LoadingSpinner size="lg" />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('loading-spinner-lg');

    rerender(<LoadingSpinner />);
    spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('loading-spinner');
    expect(spinner).not.toHaveClass('loading-spinner-sm');
    expect(spinner).not.toHaveClass('loading-spinner-lg');
  });

  it('has proper accessibility attributes', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading...');
  });

  it('combines size and custom className correctly', () => {
    render(<LoadingSpinner size="lg" className="custom-class" />);

    const spinner = screen.getByRole('status');
    expect(spinner).toHaveClass('loading-spinner-lg', 'custom-class');
  });
});
