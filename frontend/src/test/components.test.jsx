import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import ProgressBar from '../components/ui/ProgressBar';
import EmptyState from '../components/ui/EmptyState';
import Breadcrumbs from '../components/ui/Breadcrumbs';
import { SkeletonLine, SkeletonCard } from '../components/ui/Skeleton';
import { ToastProvider, useToast } from '../components/ui/Toast';
import { Building2 } from 'lucide-react';

function Wrapper({ children }) {
  return <BrowserRouter>{children}</BrowserRouter>;
}

describe('Button', () => {
  it('renders with children text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<Button loading>Submit</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('fires onClick handler', () => {
    const handler = vi.fn();
    render(<Button onClick={handler}>Click</Button>);
    fireEvent.click(screen.getByText('Click'));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it('renders with icon', () => {
    render(<Button icon={Building2}>With Icon</Button>);
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });

  it('applies variant classes', () => {
    const { container } = render(<Button variant="danger">Delete</Button>);
    expect(container.firstChild.className).toContain('border-red');
  });
});

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies hoverable class', () => {
    const { container } = render(<Card hoverable>Hover me</Card>);
    expect(container.firstChild.className).toContain('hover:scale');
  });

  it('applies variant styles', () => {
    const { container } = render(<Card variant="glass">Glass card</Card>);
    expect(container.firstChild.className).toContain('glass');
  });
});

describe('Badge', () => {
  it('renders with text', () => {
    render(<Badge>Status</Badge>);
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  it('renders dot indicator by default', () => {
    const { container } = render(<Badge variant="success">Done</Badge>);
    const dot = container.querySelector('.rounded-full');
    expect(dot).toBeInTheDocument();
  });

  it('hides dot when dot=false', () => {
    const { container } = render(<Badge dot={false}>No dot</Badge>);
    const dots = container.querySelectorAll('.w-1\\.5');
    expect(dots.length).toBe(0);
  });
});

describe('ProgressBar', () => {
  it('renders with percentage label', () => {
    render(<ProgressBar value={75} />);
    expect(screen.getByText('75%')).toBeInTheDocument();
  });

  it('hides label when showLabel=false', () => {
    render(<ProgressBar value={50} showLabel={false} />);
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });

  it('clamps values to 0-100', () => {
    render(<ProgressBar value={150} />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });
});

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(<EmptyState icon={Building2} title="No items" description="Add your first item" />);
    expect(screen.getByText('No items')).toBeInTheDocument();
    expect(screen.getByText('Add your first item')).toBeInTheDocument();
  });

  it('renders action button', () => {
    render(
      <EmptyState
        title="Empty"
        action={<button>Add</button>}
      />
    );
    expect(screen.getByText('Add')).toBeInTheDocument();
  });
});

describe('Breadcrumbs', () => {
  it('renders all items', () => {
    render(
      <Wrapper>
        <Breadcrumbs items={[
          { label: 'Home', to: '/' },
          { label: 'Businesses', to: '/businesses' },
          { label: 'Detail' },
        ]} />
      </Wrapper>
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Businesses')).toBeInTheDocument();
    expect(screen.getByText('Detail')).toBeInTheDocument();
  });

  it('renders last item as plain text (not a link)', () => {
    render(
      <Wrapper>
        <Breadcrumbs items={[
          { label: 'Home', to: '/' },
          { label: 'Current' },
        ]} />
      </Wrapper>
    );
    const current = screen.getByText('Current');
    expect(current.tagName).toBe('SPAN');
  });
});

describe('Skeleton', () => {
  it('renders SkeletonLine', () => {
    const { container } = render(<SkeletonLine />);
    expect(container.firstChild).toHaveClass('skeleton');
  });

  it('renders SkeletonCard', () => {
    const { container } = render(<SkeletonCard />);
    expect(container.querySelectorAll('.skeleton').length).toBeGreaterThan(0);
  });
});

describe('Toast', () => {
  function ToastTrigger() {
    const toast = useToast();
    return (
      <div>
        <button onClick={() => toast.success('Success!')}>Trigger</button>
      </div>
    );
  }

  it('shows toast on trigger', async () => {
    render(
      <ToastProvider>
        <ToastTrigger />
      </ToastProvider>
    );
    fireEvent.click(screen.getByText('Trigger'));
    expect(await screen.findByText('Success!')).toBeInTheDocument();
  });
});
