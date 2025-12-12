import {
	fetchOneEntry, isPreviewing, isEditing, Content,
} from '@builder.io/sdk-react-nextjs';
import {HeaderInfo, FooterInfo} from '@/components';

// Add this line to make the page dynamic
export const dynamic = 'force-dynamic';

// Builder Public API Key set in .env file
const builderPublicApiKey = process.env.NEXT_PUBLIC_BUILDER_API_KEY!;

type PageProperties = {
	params: Promise<{slug: string[]}>;
	searchParams: Promise<Record<string, string>>;
};

export default async function Page(properties: Readonly<PageProperties>) {
	const urlPath = '/' + ((await properties.params)?.slug?.join('/') || '');

	const content = await fetchOneEntry({
		options: (await properties.searchParams),
		apiKey: builderPublicApiKey,
		model: 'page',
		userAttributes: {urlPath},
	});

	const canShowContent
		= content ?? isPreviewing((await properties.searchParams)) ?? isEditing((await properties.searchParams));

	if (!canShowContent) {
		return (
			<>
				<h1>404</h1>
				<p>Make sure you have your content published at builder.io.</p>
			</>
		);
	}

	return <Content content={content} apiKey={builderPublicApiKey} model={'page'} customComponents={[HeaderInfo, FooterInfo]} />;
}
