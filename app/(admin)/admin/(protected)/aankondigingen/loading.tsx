import {PageHeaderSkeleton, CardGridSkeleton} from '@components/skeletons';

export default function Loading() {
	return (
		<div>
			<PageHeaderSkeleton showButton={false} />
			<CardGridSkeleton cards={4} />
		</div>
	);
}
