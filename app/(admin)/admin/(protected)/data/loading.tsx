export default function DataManagementLoading() {
  return (
    <div className='space-y-6'>
      {/* Header skeleton */}
      <div>
        <div className='h-9 w-48 bg-gray-200 rounded animate-pulse' />
        <div className='h-5 w-72 bg-gray-200 rounded mt-2 animate-pulse' />
      </div>

      {/* Tabs skeleton */}
      <div className='bg-white rounded-card shadow-base'>
        <div className='border-b border-gray-200 p-4'>
          <div className='flex gap-4'>
            <div className='h-8 w-28 bg-gray-200 rounded animate-pulse' />
            <div className='h-8 w-28 bg-gray-200 rounded animate-pulse' />
          </div>
        </div>

        <div className='p-6'>
          {/* Content type grid skeleton */}
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {Array.from({length: 8}).map((_, index) => (
              <div key={index} className='p-4 rounded-card border-2 border-gray-200'>
                <div className='flex items-start justify-between'>
                  <div className='w-10 h-10 bg-gray-200 rounded-button animate-pulse' />
                  <div className='w-5 h-5 bg-gray-200 rounded-full animate-pulse' />
                </div>
                <div className='h-5 w-24 bg-gray-200 rounded mt-3 animate-pulse' />
                <div className='h-4 w-16 bg-gray-200 rounded mt-2 animate-pulse' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
