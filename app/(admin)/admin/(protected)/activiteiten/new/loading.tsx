import {PageHeaderSkeleton, FormSkeleton} from '@components/skeletons';

export default function Loading() {
	return (
		<div>
			<PageHeaderSkeleton showButton={false} />
			<FormSkeleton fields={6} />
		</div>
	);
}
