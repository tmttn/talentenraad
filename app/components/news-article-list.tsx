import {builder} from '@builder.io/sdk';
import Link from 'next/link';
import Image from 'next/image';

type PageProperties = {
	params: {
		page: string[];
	};
};

const articlesPerPage = 30;

const NewsArticleList: React.FC<Readonly<PageProperties>> = async (properties: PageProperties) => {
	const pageNumber = 1;
	const articles = await builder.getAll('blog-article', {
		options: {includeRefs: true},
		omit: 'data.blocks',
		limit: articlesPerPage,
		offset: (pageNumber - 1) * articlesPerPage,
	});

	return (
		<div>
			{articles.map(item => (item.data
					&& <Link key={item.data.handle as string} href={`/nieuws/${item.data.handle}`}>
						<div>
							<div>
								<Image src={item.data.image as string} alt='' />
							</div>
							{item.data.title}
							{item.data.description}
						</div>
					</Link>
			),
			)}
			<div>
				{pageNumber > 1 && (
					<a href={`/nieuws/pagina/${pageNumber - 1}`}>
                        ‹ Previous page
					</a>
				)}

				{articles.length > articlesPerPage && (
					<a href={`/nieuws/pagina/${pageNumber + 1}`}>
                        Next page ›
					</a>
				)}
			</div>
		</div>
	);
};

export default NewsArticleList;
