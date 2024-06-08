import BuilderDevTools from '@builder.io/dev-tools/next';

/** @type {import('next').NextConfig} */
// eslint-disable-next-line new-cap
const nextConfig = BuilderDevTools()({});
nextConfig.webpack = (webpackConfig, {webpack}) => {
	webpackConfig.plugins.push(
		// Remove node: from import specifiers, because Next.js does not yet support node: scheme
		// https://github.com/vercel/next.js/issues/28774
		new webpack.NormalModuleReplacementPlugin(
			/^node:/,
			resource => {
				resource.request = resource.request.replace(/^node:/, '');
			},
		),
	);

	return webpackConfig;
};

export default nextConfig;
