import {fetchOneEntry} from '@builder.io/sdk-react-nextjs';
import {BuilderSectionClient} from './builder-section-client';

const BUILDER_API_KEY = process.env.NEXT_PUBLIC_BUILDER_API_KEY!;

type BuilderSectionServerProperties = {
	model: string;
	urlPath?: string;
};

/**
 * Server-side Builder Section Component
 *
 * Fetches section content on the server and passes it to the client component.
 * Use this for sections that should be rendered server-side for better SEO.
 */
export async function BuilderSectionServer({
	model,
	urlPath = '/',
}: Readonly<BuilderSectionServerProperties>) {
	const content = await fetchOneEntry({
		model,
		apiKey: BUILDER_API_KEY,
		userAttributes: {
			urlPath,
		},
	});

	if (!content) {
		return null;
	}

	return (
		<BuilderSectionClient
			content={content}
			model={model}
			apiKey={BUILDER_API_KEY}
		/>
	);
}

/**
 * Server-side section components for common use cases
 */

export async function AnnouncementBarSectionServer() {
	return <BuilderSectionServer model='announcement-bar' />;
}

export async function HeroSectionServer({urlPath}: {urlPath?: string}) {
	return <BuilderSectionServer model='hero-section' urlPath={urlPath} />;
}

export async function CTASectionServer({urlPath}: {urlPath?: string}) {
	return <BuilderSectionServer model='cta-section' urlPath={urlPath} />;
}

export async function FooterCTASectionServer() {
	return <BuilderSectionServer model='footer-cta' />;
}

export async function FAQSectionServer({urlPath}: {urlPath?: string}) {
	return <BuilderSectionServer model='faq-section' urlPath={urlPath} />;
}
