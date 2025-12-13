'use client';

import {Content, type BuilderContent as BuilderContentType} from '@builder.io/sdk-react-nextjs';
// eslint-disable-next-line import/extensions, n/file-extension-in-import
import {HeaderInfo} from './header';
// eslint-disable-next-line import/extensions, n/file-extension-in-import
import {FooterInfo} from './footer';

type BuilderContentProperties = {
	// eslint-disable-next-line @typescript-eslint/ban-types
	content: BuilderContentType | null;
	apiKey: string;
	model: string;
};

export function BuilderContent({content, apiKey, model}: Readonly<BuilderContentProperties>) {
	return (
		<Content
			content={content}
			apiKey={apiKey}
			model={model}
			customComponents={[HeaderInfo, FooterInfo]}
		/>
	);
}
