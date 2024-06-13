import {env} from 'node:process';
import {builder, type BuilderContent} from '@builder.io/sdk';
import {RenderBuilderContent} from '@components/builder';

// Builder Public API Key set in .env file
builder.init(env.NEXT_PUBLIC_BUILDER_API_KEY!);

type PageProperties = {
	params: {
		page: string[];
	};
};

const Page: React.FC<Readonly<PageProperties>> = async properties => {
	const builderModelName = 'page';

	const content = await builder
	// Get the page content from Builder with the specified options
		.get(builderModelName, {
			userAttributes: {
				urlPath: '/nieuws',
			},
		})
	// Convert the result to a promise
		.toPromise() as BuilderContent;

	return (
		<>
			{/* Render the Builder page */}
			<RenderBuilderContent content={content} model={builderModelName} />
		</>
	);
};

export default Page;
