const articlesPerPage = 30;

const NewsArticleList: React.FC = async properties => (
	<div>
			${JSON.stringify(properties)}
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
	</div>);

export default NewsArticleList;
