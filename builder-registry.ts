'use client';
import {env} from "node:process";
import {builder, Builder} from '@builder.io/react';
import {
	FeedbackForm, Footer, Header, NewsArticleList,
} from '@components/index';

builder.init(env.NEXT_PUBLIC_BUILDER_API_KEY!);

Builder.registerComponent(Header, {
	name: 'Header',
	inputs: [
		{
			name: 'navigation',
			type: 'reference',
			model: 'navigation-list',
			required: true,
		},
	],
});

Builder.registerComponent(Footer, {
	name: 'Footer',
	inputs: [
		{
			name: 'navigation',
			type: 'reference',
			model: 'grouped-navigation-list',
			required: true,
		},
	],
});

Builder.registerComponent(FeedbackForm, {
	name: 'FeedbackForm',
});

Builder.registerComponent(NewsArticleList, {
	name: 'NewsArticleList',
});
