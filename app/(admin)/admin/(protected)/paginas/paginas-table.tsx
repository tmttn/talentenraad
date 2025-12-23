'use client';

import {useState, useMemo} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {toast} from 'sonner';
import {
  ExternalLink,
  Pencil,
  Trash2,
  Shield,
} from 'lucide-react';
import {
  type Page,
  PROTECTED_PAGE_URLS,
} from '@lib/builder-types';
import {TableFilters} from '@features/admin/table-filters';
import {TablePagination} from '@features/admin/table-pagination';
import {SortableHeader, useSorting} from '@features/admin/sortable-header';
import {DeleteDialog} from '@features/admin/delete-dialog';

type PaginasTableProps = {
  pages: Page[];
};

const statusOptions = [
  {value: 'published', label: 'Gepubliceerd'},
  {value: 'draft', label: 'Concept'},
];

export function PaginasTable({pages}: PaginasTableProps) {
  const router = useRouter();
  const [deleteItem, setDeleteItem] = useState<Page | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Sort state
  const {sortKey, sortDirection, handleSort} = useSorting<Page>(pages, 'data.url', 'asc');

  const isProtected = (page: Page) => {
    const url = page.data?.url;
    return url ? PROTECTED_PAGE_URLS.includes(url) : false;
  };

  const handleDelete = async () => {
    if (!deleteItem) {
      return;
    }

    if (isProtected(deleteItem)) {
      toast.error('Deze pagina is beschermd en kan niet worden verwijderd');
      setDeleteItem(null);
      return;
    }

    const response = await fetch(`/api/admin/content/page/${deleteItem.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({})) as {error?: string};
      toast.error(data.error ?? 'Verwijderen mislukt');
      setDeleteItem(null);
      return;
    }

    toast.success('Pagina verwijderd');
    setDeleteItem(null);
    router.refresh();
  };

  // Filter, sort, and paginate items
  const filteredAndSortedItems = useMemo(() => {
    let result = [...pages];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => {
        const url = item.data?.url ?? '';
        const title = item.data?.title ?? item.name ?? '';
        return url.toLowerCase().includes(query) || title.toLowerCase().includes(query);
      });
    }

    // Apply status filter
    if (statusFilter) {
      result = result.filter(item => item.published === statusFilter);
    }

    // Apply sorting
    if (sortKey && sortDirection) {
      result.sort((a, b) => {
        let comparison = 0;
        switch (sortKey) {
          case 'data.url': {
            const urlA = a.data?.url ?? '';
            const urlB = b.data?.url ?? '';
            comparison = urlA.localeCompare(urlB);
            break;
          }

          case 'name': {
            comparison = (a.name ?? '').localeCompare(b.name ?? '');
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
  }, [pages, searchQuery, statusFilter, sortKey, sortDirection]);

  // Pagination calculations
  const totalItems = filteredAndSortedItems.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedItems.slice(start, start + pageSize);
  }, [filteredAndSortedItems, currentPage, pageSize]);

  // Reset to page 1 when filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
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
      key: 'status',
      label: 'Alle statussen',
      options: statusOptions,
      value: statusFilter,
      onChange: handleStatusFilterChange,
    },
  ];

  return (
    <div>
      <TableFilters
        searchValue={searchQuery}
        onSearchChange={handleSearchChange}
        searchPlaceholder='Zoeken op URL of titel...'
        filters={filterConfigs}
      />

      <div className='bg-white rounded-card shadow-base overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[640px]'>
            <thead className='bg-gray-50 border-b border-gray-200'>
              <tr>
                <th className='px-4 sm:px-6 py-3'>
                  <SortableHeader
                    label='URL'
                    sortKey='data.url'
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className='px-4 sm:px-6 py-3'>
                  <SortableHeader
                    label='Naam'
                    sortKey='name'
                    currentSortKey={sortKey}
                    currentSortDirection={sortDirection}
                    onSort={handleSort}
                  />
                </th>
                <th className='px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                  Status
                </th>
                <th className='px-4 sm:px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider'>
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200'>
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={4} className='px-4 sm:px-6 py-8 text-center text-gray-500'>
                    {searchQuery || statusFilter
                      ? 'Geen pagina\'s gevonden met de huidige filters.'
                      : 'Geen pagina\'s gevonden.'}
                  </td>
                </tr>
              ) : (
                paginatedItems.map(item => (
                  <tr key={item.id} className='hover:bg-gray-50'>
                    <td className='px-4 sm:px-6 py-4'>
                      <div className='flex items-center gap-2'>
                        {isProtected(item) && (
                          <span title='Beschermde pagina'>
                            <Shield className='w-4 h-4 text-amber-500' />
                          </span>
                        )}
                        <span className='text-gray-900 font-mono text-sm'>
                          {item.data?.url ?? '/'}
                        </span>
                      </div>
                    </td>
                    <td className='px-4 sm:px-6 py-4'>
                      <span className='text-gray-700'>
                        {item.data?.title ?? item.name ?? '-'}
                      </span>
                    </td>
                    <td className='px-4 sm:px-6 py-4'>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          item.published === 'published'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {item.published === 'published' ? 'Gepubliceerd' : 'Concept'}
                      </span>
                    </td>
                    <td className='px-4 sm:px-6 py-4 whitespace-nowrap text-right'>
                      <div className='flex justify-end gap-1 sm:gap-2'>
                        <Link
                          href={item.data?.url ?? '/'}
                          target='_blank'
                          title='Bekijk op website'
                          className='inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm rounded-button text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors'
                        >
                          <ExternalLink className='w-4 h-4' />
                          <span className='hidden lg:inline'>Bekijken</span>
                        </Link>
                        <Link
                          href={`/admin/paginas/${item.id}`}
                          title='Bewerken'
                          className='inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm rounded-button text-primary hover:text-primary-hover hover:bg-primary/10 transition-colors'
                        >
                          <Pencil className='w-4 h-4' />
                          <span className='hidden lg:inline'>Bewerken</span>
                        </Link>
                        <button
                          type='button'
                          onClick={() => {
                            setDeleteItem(item);
                          }}
                          disabled={isProtected(item)}
                          title={isProtected(item) ? 'Beschermde pagina' : 'Verwijderen'}
                          className='inline-flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm rounded-button text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
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

      {deleteItem && (
        <DeleteDialog
          title='Pagina verwijderen?'
          message={`Weet je zeker dat je de pagina "${deleteItem.data?.url ?? deleteItem.name}" wilt verwijderen?`}
          onConfirm={handleDelete}
          onCancel={() => {
            setDeleteItem(null);
          }}
        />
      )}
    </div>
  );
}
