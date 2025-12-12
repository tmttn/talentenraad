'use client';

import {Content} from '@builder.io/sdk-react-nextjs';
import {HeaderInfo} from './header';
import {FooterInfo} from './footer';

type BuilderContentProperties = {
	content: unknown;
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
