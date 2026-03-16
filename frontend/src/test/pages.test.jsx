import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from '../components/ui/Toast';

// Mock the api module
vi.mock('../services/api', () => ({
  default: {
    defaults: { headers: { common: {} } },
    interceptors: { response: { use: vi.fn(), eject: vi.fn() } },
    get: vi.fn(() => Promise.resolve({ data: [] })),
    post: vi.fn(() => Promise.resolve({ data: {} })),
  },
  businessAPI: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    getById: vi.fn(() => Promise.resolve({ data: {} })),
    create: vi.fn(() => Promise.resolve({ data: {} })),
  },
  promptsAPI: {
    getProgress: vi.fn(() => Promise.resolve({ data: [] })),
    getTypes: vi.fn(() => Promise.resolve({ data: { prompt_types: [] } })),
  },
  contentAPI: {
    getByBusiness: vi.fn(() => Promise.resolve({ data: [] })),
  },
  analyticsAPI: {
    getDashboard: vi.fn(() => Promise.resolve({ data: { total_businesses: 0, total_content_generated: 0, completion_rate: 0, recent_activity: [] } })),
  },
}));

// Mock AuthContext
vi.mock('../contexts/AuthContext', () => ({
  AuthProvider: ({ children }) => children,
  useAuth: () => ({
    user: { id: 1, full_name: 'Test User', email: 'test@test.com', role: 'client' },
    loading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
}));

function TestWrapper({ children }) {
  return (
    <BrowserRouter>
      <ToastProvider>
        {children}
      </ToastProvider>
    </BrowserRouter>
  );
}

describe('Login Page', async () => {
  const Login = (await import('../pages/Login')).default;

  it('renders login form', () => {
    render(<TestWrapper><Login /></TestWrapper>);
    expect(screen.getByText('Welcome back')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
  });

  it('has link to register', () => {
    render(<TestWrapper><Login /></TestWrapper>);
    expect(screen.getByText('Create one')).toBeInTheDocument();
  });
});

describe('Register Page', async () => {
  const Register = (await import('../pages/Register')).default;

  it('renders register form', () => {
    render(<TestWrapper><Register /></TestWrapper>);
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('John Doe')).toBeInTheDocument();
  });

  it('has link to login', () => {
    render(<TestWrapper><Register /></TestWrapper>);
    expect(screen.getByText('Sign in')).toBeInTheDocument();
  });
});

describe('Dashboard Page', async () => {
  const Dashboard = (await import('../pages/Dashboard')).default;

  it('renders dashboard heading', async () => {
    render(<TestWrapper><Dashboard /></TestWrapper>);
    expect(await screen.findByText('Dashboard')).toBeInTheDocument();
  });
});

describe('BusinessList Page', async () => {
  const BusinessList = (await import('../pages/BusinessList')).default;

  it('renders businesses heading', async () => {
    render(<TestWrapper><BusinessList /></TestWrapper>);
    expect(await screen.findByRole('heading', { name: 'Businesses' })).toBeInTheDocument();
  });
});

describe('BusinessForm Page', async () => {
  const BusinessForm = (await import('../pages/BusinessForm')).default;

  it('renders add new business form', () => {
    render(<TestWrapper><BusinessForm /></TestWrapper>);
    expect(screen.getByRole('heading', { name: 'Add New Business' })).toBeInTheDocument();
    expect(screen.getByText('Basic Information')).toBeInTheDocument();
    expect(screen.getByText('SEO Information')).toBeInTheDocument();
  });
});
