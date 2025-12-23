'use client';

import {
  useState, useMemo, type FormEvent, type ChangeEvent,
} from 'react';
import {toast} from 'sonner';
import {
  Loader2, Shield, ShieldOff, Pencil, Trash2, Send, Lock,
} from 'lucide-react';
import type {User} from '@lib/db/schema';
import {DeleteDialog} from '@features/admin/delete-dialog';
import {TableFilters} from '@features/admin/table-filters';
import {TablePagination} from '@features/admin/table-pagination';
import {SortableHeader, useSorting} from '@features/admin/sortable-header';
import {ViewModeToggle} from '@features/admin/view-mode-toggle';
import {useViewMode} from '@features/admin/use-view-mode';

type UsersManagerProps = {
  initialUsers: User[];
  protectedEmails: string[];
};

const inputStyles = [
  'w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-300 rounded-button bg-white text-gray-900',
  'focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none',
  'transition-colors duration-fast text-base',
].join(' ');

type FormData = {
  email: string;
  name: string;
  isAdmin: boolean;
};

const emptyForm: FormData = {
  email: '',
  name: '',
  isAdmin: true,
};

const roleOptions = [
  {value: 'admin', label: 'Administrator'},
  {value: 'user', label: 'Gebruiker'},
];

const statusOptions = [
  {value: 'active', label: 'Actief'},
  {value: 'invited', label: 'Uitnodiging verstuurd'},
];

export function UsersManager({initialUsers, protectedEmails}: UsersManagerProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const {viewMode, setViewMode} = useViewMode();

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Sort state
  const {sortKey, sortDirection, handleSort} = useSorting<User>(users, 'createdAt', 'desc');

  // Helper to check if email is protected
  const isProtectedEmail = (email: string) => protectedEmails.includes(email.toLowerCase());

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setFormData({
      email: user.email,
      name: user.name ?? '',
      isAdmin: user.isAdmin,
    });
    setIsCreating(false);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.email.trim()) {
        toast.error('E-mail is verplicht');
        return;
      }

      const url = editingId
        ? `/api/admin/users/${editingId}`
        : '/api/admin/users';

      const body = editingId
        ? {name: formData.name || undefined, isAdmin: formData.isAdmin}
        : {email: formData.email, name: formData.name || undefined, isAdmin: formData.isAdmin};

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(body),
      });

      const data = await response.json() as {error?: string; user?: User; warning?: string};

      if (!response.ok) {
        toast.error(data.error ?? 'Opslaan mislukt');
        return;
      }

      // Update local state
      if (editingId && data.user) {
        setUsers(previous => previous.map(u => u.id === editingId ? data.user! : u));
        toast.success('Gebruiker bijgewerkt');
      } else if (data.user) {
        setUsers(previous => [data.user!, ...previous]);
        if (data.warning) {
          toast.warning(data.warning);
        } else {
          toast.success('Uitnodiging verstuurd');
        }
      }

      handleCancel();
    } catch {
      toast.error('Er is een fout opgetreden');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteUser) {
      return;
    }

    const response = await fetch(`/api/admin/users/${deleteUser.id}`, {
      method: 'DELETE',
    });

    const data = await response.json() as {error?: string};

    if (!response.ok) {
      toast.error(data.error ?? 'Verwijderen mislukt');
      setDeleteUser(null);
      return;
    }

    setUsers(previous => previous.filter(u => u.id !== deleteUser.id));
    setDeleteUser(null);
    toast.success('Gebruiker verwijderd');
  };

  const handleToggleAdmin = async (user: User) => {
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({isAdmin: !user.isAdmin}),
    });

    const data = await response.json() as {error?: string; user?: User};

    if (!response.ok) {
      toast.error(data.error ?? 'Status wijzigen mislukt');
      return;
    }

    if (data.user) {
      setUsers(previous => previous.map(u => u.id === user.id ? data.user! : u));
      toast.success(data.user.isAdmin ? 'Admin rechten toegekend' : 'Admin rechten verwijderd');
    }
  };

  const handleResendInvitation = async (user: User) => {
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({resendInvitation: true}),
    });

    const data = await response.json() as {error?: string; user?: User};

    if (!response.ok) {
      toast.error(data.error ?? 'Uitnodiging opnieuw versturen mislukt');
      return;
    }

    if (data.user) {
      setUsers(previous => previous.map(u => u.id === user.id ? data.user! : u));
      toast.success('Uitnodiging opnieuw verstuurd');
    }
  };

  // Filter, sort, and paginate users
  const filteredAndSortedUsers = useMemo(() => {
    let result = [...users];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Boolean OR for filter condition
      result = result.filter(u => (u.name?.toLowerCase().includes(query)) || u.email.toLowerCase().includes(query));
    }

    // Apply role filter
    if (roleFilter) {
      result = result.filter(u => roleFilter === 'admin' ? u.isAdmin : !u.isAdmin);
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter(u => {
        if (statusFilter === 'active') {
          return u.acceptedAt !== null;
        }

        if (statusFilter === 'invited') {
          return u.invitedAt !== null && u.acceptedAt === null;
        }

        return true;
      });
    }

    // Apply sorting
    if (sortKey && sortDirection) {
      result.sort((a, b) => {
        let comparison = 0;
        switch (sortKey) {
          case 'name': {
            comparison = (a.name ?? '').localeCompare(b.name ?? '');
            break;
          }

          case 'email': {
            comparison = a.email.localeCompare(b.email);
            break;
          }

          case 'createdAt': {
            comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            break;
          }

          default: {
            break;
          }
        }

        return sortDirection === 'desc' ? -comparison : comparison;
      });
    }

    return result;
  }, [users, searchQuery, roleFilter, statusFilter, sortKey, sortDirection]);

  // Pagination calculations
  const totalItems = filteredAndSortedUsers.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedUsers.slice(start, start + pageSize);
  }, [filteredAndSortedUsers, currentPage, pageSize]);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const filterConfigs = [
    {
      key: 'role',
      label: 'Alle rollen',
      options: roleOptions,
      value: roleFilter,
      onChange: handleRoleFilterChange,
    },
    {
      key: 'status',
      label: 'Alle statussen',
      options: statusOptions,
      value: statusFilter,
      onChange: handleStatusFilterChange,
    },
  ];

  const renderForm = () => (
    <form onSubmit={handleSubmit} className='bg-white rounded-card shadow-base p-4 sm:p-6 mb-6'>
      <h2 className='text-lg sm:text-xl font-bold text-gray-800 mb-4'>
        {editingId ? 'Gebruiker bewerken' : 'Gebruiker uitnodigen'}
      </h2>

      <div className='space-y-4'>
        <div>
          <label htmlFor='email' className='block text-sm font-semibold text-gray-800 mb-2'>
            E-mail <span className='text-red-500'>*</span>
          </label>
          <input
            type='email'
            id='email'
            value={formData.email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setFormData(previous => ({...previous, email: e.target.value}));
            }}
            required
            disabled={Boolean(editingId)}
            className={`${inputStyles} ${editingId ? 'bg-gray-100 cursor-not-allowed' : ''}`}
            placeholder='gebruiker@voorbeeld.be'
          />
          {editingId && (
            <p className='mt-1 text-sm text-gray-500'>E-mail kan niet worden gewijzigd</p>
          )}
        </div>

        <div>
          <label htmlFor='name' className='block text-sm font-semibold text-gray-800 mb-2'>
            Naam
          </label>
          <input
            type='text'
            id='name'
            value={formData.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setFormData(previous => ({...previous, name: e.target.value}));
            }}
            className={inputStyles}
            placeholder='Volledige naam'
          />
        </div>

        <div>
          <label className='flex items-center gap-3 cursor-pointer py-1'>
            <input
              type='checkbox'
              checked={formData.isAdmin}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setFormData(previous => ({...previous, isAdmin: e.target.checked}));
              }}
              className='w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary'
            />
            <span className='text-gray-700'>Administrator</span>
          </label>
          <p className='mt-1 text-sm text-gray-500'>
            Administrators hebben toegang tot het admin dashboard
          </p>
        </div>
      </div>

      <div className='mt-6 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4'>
        <button
          type='button'
          onClick={handleCancel}
          disabled={isSubmitting}
          className='w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 font-medium rounded-card hover:bg-gray-200 transition-colors disabled:opacity-50'
        >
          Annuleren
        </button>
        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-primary text-white font-medium rounded-card hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2'
        >
          {isSubmitting
            ? (
              <>
                <Loader2 className='w-4 h-4 animate-spin' />
                Bezig...
              </>
            )
            : (editingId
              ? (
                'Opslaan'
              )
              : (
                <>
                  <Send className='w-4 h-4' />
                  Uitnodigen
                </>
              ))}
        </button>
      </div>
    </form>
  );

  const formatDate = (date: Date) => new Date(date).toLocaleDateString('nl-BE', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div>
      <TableFilters
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder='Zoeken op naam of e-mail...'
        filters={filterConfigs}
      >
        <ViewModeToggle mode={viewMode} onChange={setViewMode} />
        {!isCreating && !editingId && (
          <button
            type='button'
            onClick={handleCreate}
            className='px-4 py-2.5 bg-primary text-white font-medium rounded-button hover:bg-primary-hover transition-colors flex items-center gap-2 whitespace-nowrap'
          >
            <Send className='w-4 h-4' />
            Uitnodigen
          </button>
        )}
      </TableFilters>

      {(isCreating || editingId) && renderForm()}

      {viewMode === 'table'
        ? (
          <div className='bg-white rounded-card shadow-base overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[600px]'>
                <thead className='bg-gray-50 border-b border-gray-200'>
                  <tr>
                    <th className='px-4 sm:px-6 py-3'>
                      <SortableHeader
                        label='Gebruiker'
                        sortKey='name'
                        currentSortKey={sortKey}
                        currentSortDirection={sortDirection}
                        onSort={handleSort}
                      />
                    </th>
                    <th className='px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-4 sm:px-6 py-3'>
                      <SortableHeader
                        label='Aangemaakt'
                        sortKey='createdAt'
                        currentSortKey={sortKey}
                        currentSortDirection={sortDirection}
                        onSort={handleSort}
                      />
                    </th>
                    <th className='px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                      Acties
                    </th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-200'>
                  {paginatedUsers.length === 0
                    ? (
                      <tr>
                        <td colSpan={4} className='px-4 sm:px-6 py-8 text-center text-gray-500'>
                          {searchQuery || roleFilter || statusFilter
                            ? 'Geen gebruikers gevonden met de huidige filters.'
                            : 'Geen gebruikers gevonden.'}
                        </td>
                      </tr>
                    )
                    : (
                      paginatedUsers.map(user => (
                        <tr key={user.id} className='hover:bg-gray-50'>
                          <td className='px-4 sm:px-6 py-4'>
                            <button
                              type='button'
                              onClick={() => {
                                handleEdit(user);
                              }}
                              className='text-left group'
                            >
                              <p className='font-medium text-gray-900 group-hover:text-primary transition-colors'>{user.name ?? '-'}</p>
                              <p className='text-sm text-gray-500 break-all'>{user.email}</p>
                            </button>
                          </td>
                          <td className='px-4 sm:px-6 py-4'>
                            <div className='flex flex-col gap-1'>
                              <span className={`px-2 py-1 text-xs font-medium rounded whitespace-nowrap w-fit ${
                                user.isAdmin
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {user.isAdmin ? 'Administrator' : 'Gebruiker'}
                              </span>
                              {user.invitedAt && !user.acceptedAt && (
                                <span className='px-2 py-1 text-xs font-medium rounded whitespace-nowrap w-fit bg-amber-100 text-amber-800'>
                                  Uitnodiging verstuurd
                                </span>
                              )}
                              {user.acceptedAt && (
                                <span className='px-2 py-1 text-xs font-medium rounded whitespace-nowrap w-fit bg-blue-100 text-blue-800'>
                                  Actief
                                </span>
                              )}
                            </div>
                          </td>
                          <td className='px-4 sm:px-6 py-4 text-sm text-gray-500 whitespace-nowrap'>
                            {formatDate(user.createdAt)}
                          </td>
                          <td className='px-4 sm:px-6 py-4 text-right'>
                            <div className='flex justify-end items-center gap-1 sm:gap-2'>
                              {isProtectedEmail(user.email) && (
                                <span
                                  title='Beschermd admin e-mail'
                                  className='p-2 text-amber-600'
                                >
                                  <Lock className='w-4 h-4' />
                                </span>
                              )}
                              {user.invitedAt && !user.acceptedAt && (
                                <button
                                  type='button'
                                  onClick={() => {
                                    void handleResendInvitation(user);
                                  }}
                                  title='Uitnodiging opnieuw versturen'
                                  className='inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm rounded-button text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-amber-300'
                                >
                                  <Send className='w-4 h-4' />
                                  <span className='hidden lg:inline'>Opnieuw</span>
                                </button>
                              )}
                              <button
                                type='button'
                                onClick={() => {
                                  void handleToggleAdmin(user);
                                }}
                                disabled={isProtectedEmail(user.email) && user.isAdmin}
                                title={isProtectedEmail(user.email) && user.isAdmin
                                  ? 'Beschermd admin e-mail'
                                  : (user.isAdmin
                                    ? 'Admin rechten verwijderen'
                                    : 'Admin maken')}
                                className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm rounded-button transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                  isProtectedEmail(user.email) && user.isAdmin
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:ring-gray-300'
                                }`}
                              >
                                {user.isAdmin ? <ShieldOff className='w-4 h-4' /> : <Shield className='w-4 h-4' />}
                                <span className='hidden lg:inline'>{user.isAdmin ? 'Verwijder admin' : 'Maak admin'}</span>
                              </button>
                              <button
                                type='button'
                                onClick={() => {
                                  handleEdit(user);
                                }}
                                title='Bewerken'
                                className='inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm rounded-button text-primary hover:text-primary-hover hover:bg-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary/30'
                              >
                                <Pencil className='w-4 h-4' />
                                <span className='hidden lg:inline'>Bewerken</span>
                              </button>
                              <button
                                type='button'
                                onClick={() => {
                                  setDeleteUser(user);
                                }}
                                disabled={isProtectedEmail(user.email)}
                                title={isProtectedEmail(user.email) ? 'Beschermd admin e-mail' : 'Verwijderen'}
                                className={`inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm rounded-button transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                                  isProtectedEmail(user.email)
                                    ? 'text-gray-300 cursor-not-allowed'
                                    : 'text-red-500 hover:text-red-700 hover:bg-red-50 focus:ring-red-300'
                                }`}
                              >
                                <Trash2 className='w-4 h-4' />
                                <span className='hidden lg:inline'>Verwijderen</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                </tbody>
              </table>
            </div>
            {totalItems > 0 && (
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={handlePageSizeChange}
              />
            )}
          </div>
        )
        : (
          <div>
            {paginatedUsers.length === 0
              ? (
                <div className='bg-white rounded-card shadow-base p-8 text-center text-gray-500'>
                  {searchQuery || roleFilter || statusFilter
                    ? 'Geen gebruikers gevonden met de huidige filters.'
                    : 'Geen gebruikers gevonden.'}
                </div>
              )
              : (
                <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
                  {paginatedUsers.map(user => (
                    <div key={user.id} className='bg-white rounded-card shadow-base p-4'>
                      <div className='flex items-start justify-between gap-2 mb-3'>
                        <button
                          type='button'
                          onClick={() => {
                            handleEdit(user);
                          }}
                          className='text-left group min-w-0'
                        >
                          <p className='font-medium text-gray-900 group-hover:text-primary transition-colors truncate'>{user.name ?? '-'}</p>
                          <p className='text-sm text-gray-500 break-all'>{user.email}</p>
                        </button>
                        {isProtectedEmail(user.email) && (
                          <span title='Beschermd admin e-mail' className='text-amber-600 shrink-0'>
                            <Lock className='w-4 h-4' />
                          </span>
                        )}
                      </div>
                      <p className='text-sm text-gray-500 mb-3'>
                        {formatDate(user.createdAt)}
                      </p>
                      <div className='flex flex-wrap gap-2 mb-4'>
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          user.isAdmin
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {user.isAdmin ? 'Administrator' : 'Gebruiker'}
                        </span>
                        {user.invitedAt && !user.acceptedAt && (
                          <span className='px-2 py-1 text-xs font-medium rounded bg-amber-100 text-amber-800'>
                            Uitnodiging verstuurd
                          </span>
                        )}
                        {user.acceptedAt && (
                          <span className='px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800'>
                            Actief
                          </span>
                        )}
                      </div>
                      <div className='flex flex-wrap gap-1 border-t border-gray-100 pt-3'>
                        {user.invitedAt && !user.acceptedAt && (
                          <button
                            type='button'
                            onClick={() => {
                              void handleResendInvitation(user);
                            }}
                            title='Uitnodiging opnieuw versturen'
                            className='inline-flex items-center gap-1.5 px-2 py-1.5 text-sm rounded-button text-amber-600 hover:text-amber-800 hover:bg-amber-50 transition-colors'
                          >
                            <Send className='w-4 h-4' />
                            <span>Opnieuw</span>
                          </button>
                        )}
                        <button
                          type='button'
                          onClick={() => {
                            void handleToggleAdmin(user);
                          }}
                          disabled={isProtectedEmail(user.email) && user.isAdmin}
                          title={isProtectedEmail(user.email) && user.isAdmin
                            ? 'Beschermd admin e-mail'
                            : (user.isAdmin
                              ? 'Admin rechten verwijderen'
                              : 'Admin maken')}
                          className={`inline-flex items-center gap-1.5 px-2 py-1.5 text-sm rounded-button transition-colors ${
                            isProtectedEmail(user.email) && user.isAdmin
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {user.isAdmin ? <ShieldOff className='w-4 h-4' /> : <Shield className='w-4 h-4' />}
                          <span>{user.isAdmin ? 'Verwijder admin' : 'Maak admin'}</span>
                        </button>
                        <button
                          type='button'
                          onClick={() => {
                            handleEdit(user);
                          }}
                          title='Bewerken'
                          className='inline-flex items-center gap-1.5 px-2 py-1.5 text-sm rounded-button text-primary hover:text-primary-hover hover:bg-primary/10 transition-colors'
                        >
                          <Pencil className='w-4 h-4' />
                          <span>Bewerken</span>
                        </button>
                        <button
                          type='button'
                          onClick={() => {
                            setDeleteUser(user);
                          }}
                          disabled={isProtectedEmail(user.email)}
                          title={isProtectedEmail(user.email) ? 'Beschermd admin e-mail' : 'Verwijderen'}
                          className={`inline-flex items-center gap-1.5 px-2 py-1.5 text-sm rounded-button transition-colors ${
                            isProtectedEmail(user.email)
                              ? 'text-gray-300 cursor-not-allowed'
                              : 'text-red-500 hover:text-red-700 hover:bg-red-50'
                          }`}
                        >
                          <Trash2 className='w-4 h-4' />
                          <span>Verwijderen</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            {totalItems > 0 && (
              <div className='mt-4 bg-white rounded-card shadow-base overflow-hidden'>
                <TablePagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            )}
          </div>
        )}

      {deleteUser && (
        <DeleteDialog
          title='Gebruiker verwijderen?'
          message={`Weet je zeker dat je ${deleteUser.email} wilt verwijderen?`}
          onConfirm={handleDelete}
          onCancel={() => {
            setDeleteUser(null);
          }}
        />
      )}
    </div>
  );
}
