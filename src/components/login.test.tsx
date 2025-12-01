import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Login } from './login';

// Mock the useStoreAdminLogin hook
vi.mock('@/services/base/store-admin/auth/useStoreAdminLogin', () => ({
  useStoreAdminLogin: vi.fn(),
}));

// Mock the store
vi.mock('@/stores/store', () => ({
  useStore: vi.fn(() => ({
    setAdminData: vi.fn(),
    setLoading: vi.fn(),
  })),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock TanStack Router Link
vi.mock('@tanstack/react-router', async () => {
  const actual = await vi.importActual('@tanstack/react-router');
  return {
    ...actual,
    Link: ({ to, children, ...props }: { to: string; children: React.ReactNode }) => (
      <a href={to} {...props}>
        {children}
      </a>
    ),
  };
});

import { useStoreAdminLogin } from '@/services/base/store-admin/auth/useStoreAdminLogin';

const mockUseStoreAdminLogin = useStoreAdminLogin as ReturnType<typeof vi.fn>;

describe('Login', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Reset mocks
    vi.clearAllMocks();
  });

  const renderLoginComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <Login />
      </QueryClientProvider>
    );
  };

  it('renders login form correctly', () => {
    mockUseStoreAdminLogin.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    });

    renderLoginComponent();

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByText('Enter your credentials to access your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/mobile number/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    expect(screen.getByText(/don't have an account/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /register/i })).toBeInTheDocument();
  });

  it('displays mobile number input with correct placeholder', () => {
    mockUseStoreAdminLogin.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    });

    renderLoginComponent();

    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    expect(mobileInput).toBeInTheDocument();
    expect(mobileInput).toHaveAttribute('type', 'tel');
  });

  it('displays password input with correct placeholder', () => {
    mockUseStoreAdminLogin.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    });

    renderLoginComponent();

    const passwordInput = screen.getByPlaceholderText('Enter your password');
    expect(passwordInput).toBeInTheDocument();
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('toggles password visibility when eye icon is clicked', async () => {
    const user = userEvent.setup();
    mockUseStoreAdminLogin.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    });

    renderLoginComponent();

    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const toggleButton = screen.getByRole('button', { name: '' }); // Eye icon button

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Click to show password
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Click again to hide password
    await user.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('validates mobile number format', async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn();
    mockUseStoreAdminLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    });

    renderLoginComponent();

    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    // Enter invalid mobile number (less than 10 digits)
    await user.type(mobileInput, '12345');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/mobile number must be 10 digits/i)).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('validates password minimum length', async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn();
    mockUseStoreAdminLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    });

    renderLoginComponent();

    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    // Enter valid mobile but short password
    await user.type(mobileInput, '1234567890');
    await user.type(passwordInput, '12345'); // Less than 6 characters
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 6 characters/i)).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn();
    mockUseStoreAdminLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    });

    renderLoginComponent();

    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(mobileInput, '1234567890');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        mobileNumber: '1234567890',
        password: 'password123',
        isMobile: false,
      });
    });
  });

  it('disables form inputs and button when loading', () => {
    mockUseStoreAdminLogin.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
      isError: false,
      error: null,
    });

    renderLoginComponent();

    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /logging in/i });

    expect(mobileInput).toBeDisabled();
    expect(passwordInput).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('Logging in...')).toBeInTheDocument();
  });

  it('shows loading spinner when submitting', () => {
    mockUseStoreAdminLogin.mockReturnValue({
      mutate: vi.fn(),
      isPending: true,
      isError: false,
      error: null,
    });

    renderLoginComponent();

    expect(screen.getByText('Logging in...')).toBeInTheDocument();
    // Check for spinner icon (Loader2)
    const spinner = screen.getByRole('button', { name: /logging in/i });
    expect(spinner).toBeInTheDocument();
  });

  it('renders register link with correct route', () => {
    mockUseStoreAdminLogin.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    });

    renderLoginComponent();

    const registerLink = screen.getByRole('link', { name: /register/i });
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/auth/register');
  });

  it('allows user to type in mobile number field', async () => {
    const user = userEvent.setup();
    mockUseStoreAdminLogin.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    });

    renderLoginComponent();

    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    await user.type(mobileInput, '9876543210');

    expect(mobileInput).toHaveValue('9876543210');
  });

  it('allows user to type in password field', async () => {
    const user = userEvent.setup();
    mockUseStoreAdminLogin.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    });

    renderLoginComponent();

    const passwordInput = screen.getByPlaceholderText('Enter your password');
    await user.type(passwordInput, 'mySecretPassword');

    expect(passwordInput).toHaveValue('mySecretPassword');
  });

  it('validates mobile number with non-numeric characters', async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn();
    mockUseStoreAdminLogin.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
      error: null,
    });

    renderLoginComponent();

    const mobileInput = screen.getByPlaceholderText('Enter 10-digit mobile number');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    const submitButton = screen.getByRole('button', { name: /login/i });

    await user.type(mobileInput, '123456789a'); // Contains letter
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/mobile number must be 10 digits/i)).toBeInTheDocument();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });
});
