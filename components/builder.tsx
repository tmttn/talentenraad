'use client';
import {env} from 'node:process';
import {type ComponentProps} from 'react';
import {builder} from '@builder.io/sdk';
import DefaultErrorPage from 'next/error';
import {BuilderComponent, useIsPreviewing} from '@builder.io/react';
// eslint-disable-next-line import/no-unassigned-import, import/extensions
import '../builder-registry';

type BuilderPageProperties = ComponentProps<typeof BuilderComponent>;

// Builder Public API Key set in .env file
builder.init(env.NEXT_PUBLIC_BUILDER_API_KEY!);

export function RenderBuilderContent({content, model}: Readonly<BuilderPageProperties>) {
	// Call the useIsPreviewing hook to determine if
	// the page is being previewed in Builder
	const isPreviewing = useIsPreviewing();
	// If "content" has a value or the page is being previewed in Builder,
	// render the BuilderComponent with the specified content and model props.
	if (content ?? isPreviewing) {
		return <BuilderComponent content={content} model={model} />;
	}

	// If the "content" is falsy and the page is
	// not being previewed in Builder, render the
	// DefaultErrorPage with a 404.
	return <DefaultErrorPage statusCode={404} />;
}
