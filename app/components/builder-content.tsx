'use client';

import {Content, type BuilderContent as BuilderContentType} from '@builder.io/sdk-react-nextjs';
import {HeaderInfo} from './header';
import {FooterInfo} from './footer';

type BuilderContentProperties = {
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
