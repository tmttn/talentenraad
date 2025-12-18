import {FormSkeleton} from '@components/skeletons';

export default function Loading() {
	return (
		<div className='animate-pulse'>
			{/* Back link */}
			<div className='h-5 bg-gray-200 rounded w-32 mb-6' />
			{/* Title */}
			<div className='h-9 bg-gray-200 rounded w-64 mb-8' />
			<FormSkeleton fields={6} />
		</div>
	);
}
