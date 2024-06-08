import {env} from 'node:process';
import {builder, type BuilderContent} from '@builder.io/sdk';
import Head from 'next/head';
import {RenderBuilderContent} from '@components/builder';

builder.init(env.NEXT_PUBLIC_BUILDER_API_KEY!);

type PageProperties = {
	params: {
		page: string[];
	};
};

const NewsArticle: React.FC<Readonly<PageProperties>> = async properties => {
	const model = 'news-article';
	const content = await builder
		.get('news-article', {
			prerender: false,
			// Include references, like the `author` ref
			options: {includeRefs: true},
			query: {
				data: {
					handle: properties?.params?.page?.join('/'),
				},
			},
		})
		.toPromise() as BuilderContent;

	return (
		<>
			<Head>
				{/* Render meta tags from custom field */}
				<title>{content?.data?.title}</title>
				<title>test</title>
				<meta name='description' content={content?.data?.blurb as string} />
				<meta name='og:image' content={content?.data?.image as string} />
			</Head>
			<div>
				{/* Render the Builder drag/dropped content */}
				<RenderBuilderContent
					content={content}
					model={model}
				/>
			</div>
		</>
	);
};

export default NewsArticle;
