'use client';
import {env} from 'node:process';
import {builder, Builder} from '@builder.io/react';
import {
	Header, Footer, FeedbackForm, NewsArticleList,
} from '@components/index';

builder.init(env.NEXT_PUBLIC_BUILDER_API_KEY!);

Builder.registerComponent(Footer, {
	name: 'Footer',
	inputs: [
		{
			name: 'navigation',
			type: 'reference',
			model: 'grouped-navigation-links',
			required: true,
		},
	],
});

Builder.registerComponent(FeedbackForm, {
	name: 'FeedbackForm',
});

Builder.registerComponent(Header, {
	name: 'Header',
	inputs: [
		{
			name: 'navigation',
			type: 'reference',
			model: 'navigation-links',
			required: true,
		},
	],
});

Builder.registerComponent(NewsArticleList, {
	name: 'NewsArticleList',
});
