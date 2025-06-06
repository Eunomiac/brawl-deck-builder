// Test utilities with providers
/* eslint-disable react-refresh/only-export-components */
import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react';

// Custom render function that includes providers
// Note: GSAP components are excluded from unit testing and tested via integration tests
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <div data-testid="test-wrapper">
      {children}
    </div>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything from React Testing Library except render
export {
  screen,
  fireEvent,
  waitFor,
  waitForElementToBeRemoved,
  within,
  getByRole,
  getByText,
  getByLabelText,
  getByPlaceholderText,
  getByAltText,
  getByDisplayValue,
  getByTitle,
  getByTestId,
  getAllByRole,
  getAllByText,
  getAllByLabelText,
  getAllByPlaceholderText,
  getAllByAltText,
  getAllByDisplayValue,
  getAllByTitle,
  getAllByTestId,
  queryByRole,
  queryByText,
  queryByLabelText,
  queryByPlaceholderText,
  queryByAltText,
  queryByDisplayValue,
  queryByTitle,
  queryByTestId,
  queryAllByRole,
  queryAllByText,
  queryAllByLabelText,
  queryAllByPlaceholderText,
  queryAllByAltText,
  queryAllByDisplayValue,
  queryAllByTitle,
  queryAllByTestId,
  findByRole,
  findByText,
  findByLabelText,
  findByPlaceholderText,
  findByAltText,
  findByDisplayValue,
  findByTitle,
  findByTestId,
  findAllByRole,
  findAllByText,
  findAllByLabelText,
  findAllByPlaceholderText,
  findAllByAltText,
  findAllByDisplayValue,
  findAllByTitle,
  findAllByTestId,
  act,
  cleanup,
  renderHook,
} from '@testing-library/react';

// Export our custom render function
export { customRender as render };
