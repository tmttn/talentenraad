import {render, screen} from '@testing-library/react';
import {TeamMemberInfo} from '../../../app/features/team/team-member';

const TeamMember = TeamMemberInfo.component;

describe('TeamMember', () => {
  const defaultProps = {
    name: 'Jan Janssen',
    role: 'Voorzitter',
  };

  describe('card variant (default)', () => {
    it('renders name and role', () => {
      render(<TeamMember {...defaultProps} />);
      expect(screen.getByRole('heading', {name: 'Jan Janssen'})).toBeInTheDocument();
      expect(screen.getByText('Voorzitter')).toBeInTheDocument();
    });

    it('renders initials when no image provided', () => {
      render(<TeamMember {...defaultProps} />);
      expect(screen.getByText('JJ')).toBeInTheDocument();
    });

    it('renders description when provided', () => {
      render(<TeamMember {...defaultProps} description='A great leader' />);
      expect(screen.getByText('A great leader')).toBeInTheDocument();
    });

    it('renders email link when provided', () => {
      render(<TeamMember {...defaultProps} email='jan@example.com' />);
      const emailLink = screen.getByRole('link', {name: /jan@example.com/i});
      expect(emailLink).toHaveAttribute('href', 'mailto:jan@example.com');
    });

    it('applies correct color for Voorzitter role', () => {
      render(<TeamMember {...defaultProps} role='Voorzitter' />);
      const roleTag = screen.getByText('Voorzitter');
      expect(roleTag).toHaveClass('bg-primary', 'text-white');
    });

    it('applies correct color for Secretaris role', () => {
      render(<TeamMember {...defaultProps} role='Secretaris' />);
      const roleTag = screen.getByText('Secretaris');
      expect(roleTag).toHaveClass('bg-secondary', 'text-white');
    });

    it('applies correct color for Penningmeester role', () => {
      render(<TeamMember {...defaultProps} role='Penningmeester' />);
      const roleTag = screen.getByText('Penningmeester');
      expect(roleTag).toHaveClass('bg-accent', 'text-white');
    });

    it('applies correct color for Lid role', () => {
      render(<TeamMember {...defaultProps} role='Lid' />);
      const roleTag = screen.getByText('Lid');
      expect(roleTag).toHaveClass('bg-gray-200', 'text-gray-700');
    });

    it('applies default color for unknown role', () => {
      render(<TeamMember {...defaultProps} role='Custom Role' />);
      const roleTag = screen.getByText('Custom Role');
      expect(roleTag).toHaveClass('bg-primary/10', 'text-primary-text');
    });
  });

  describe('compact variant', () => {
    it('renders in compact layout', () => {
      render(<TeamMember {...defaultProps} variant='compact' />);
      expect(screen.getByRole('heading', {name: 'Jan Janssen'})).toBeInTheDocument();
      expect(screen.getByText('Voorzitter')).toBeInTheDocument();
    });

    it('renders initials in compact variant', () => {
      render(<TeamMember {...defaultProps} variant='compact' />);
      expect(screen.getByText('JJ')).toBeInTheDocument();
    });
  });

  describe('horizontal variant', () => {
    it('renders in horizontal layout', () => {
      render(<TeamMember {...defaultProps} variant='horizontal' />);
      expect(screen.getByRole('heading', {name: 'Jan Janssen'})).toBeInTheDocument();
    });

    it('renders description in horizontal variant', () => {
      render(<TeamMember {...defaultProps} variant='horizontal' description='Bio text' />);
      expect(screen.getByText('Bio text')).toBeInTheDocument();
    });

    it('renders email link in horizontal variant', () => {
      render(<TeamMember {...defaultProps} variant='horizontal' email='jan@test.com' />);
      const emailLink = screen.getByRole('link', {name: /jan@test.com/i});
      expect(emailLink).toHaveAttribute('href', 'mailto:jan@test.com');
    });

    it('renders initials in horizontal variant', () => {
      render(<TeamMember {...defaultProps} variant='horizontal' />);
      expect(screen.getByText('JJ')).toBeInTheDocument();
    });
  });

  describe('initials generation', () => {
    it('generates two-letter initials from full name', () => {
      render(<TeamMember name='John Doe' role='Lid' />);
      expect(screen.getByText('JD')).toBeInTheDocument();
    });

    it('handles single name', () => {
      render(<TeamMember name='John' role='Lid' />);
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('handles three-part name', () => {
      render(<TeamMember name='Jan van den Berg' role='Lid' />);
      expect(screen.getByText('JV')).toBeInTheDocument();
    });
  });
});

describe('TeamMemberInfo', () => {
  it('exports correct component info', () => {
    expect(TeamMemberInfo.name).toBe('TeamMember');
    expect(TeamMemberInfo.component).toBeDefined();
    expect(TeamMemberInfo.inputs).toBeInstanceOf(Array);
  });

  it('has required inputs for name and role', () => {
    const nameInput = TeamMemberInfo.inputs.find(i => i.name === 'name');
    const roleInput = TeamMemberInfo.inputs.find(i => i.name === 'role');
    expect(nameInput?.required).toBe(true);
    expect(roleInput?.required).toBe(true);
  });
});
