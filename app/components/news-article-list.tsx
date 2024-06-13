function NewsArticleList() {
	return (
		<div>
			<h1>News</h1>
			{/* {articles.map(item => (item.data
						&& <Link key={item.data.handle as string} href={`/nieuws/${item.data.handle}`}>
							<div>
								<div>
									<Image width={300} height={200} src={item.data.image as string} alt='' />
								</div>
								{item.data.title}
								{item.data.description}
							</div>
						</Link>
				),
				)} */}
		</div>
	);
}

export const NewsArticleListInfo = {
	name: 'NewsArticleList',
	component: NewsArticleList,
	// You must add the below option or the SDK will fail to render.
	// eslint-disable-next-line @typescript-eslint/naming-convention
	isRSC: true,
};

