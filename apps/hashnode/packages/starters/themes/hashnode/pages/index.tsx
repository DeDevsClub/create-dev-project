import { InferGetStaticPropsType } from 'next';
import { WithUrqlProps, initUrqlClient } from 'next-urql';
import Head from 'next/head';
import Image from 'next/legacy/image';
import { useState } from 'react';
import { twJoin } from 'tailwind-merge';
import { useQuery } from 'urql';

import { addPublicationJsonLd } from '@starter-kit/utils/seo/addPublicationJsonLd';
import { getAutogeneratedPublicationOG } from '@starter-kit/utils/social/og';
import { AppProvider } from '../components/contexts/appContext';
import { Header } from '../components/header';
import { Layout } from '../components/layout';
import ModernLayoutPosts from '../components/modern-layout-posts';
import {
	HomePageInitialDocument,
	HomePageInitialQueryVariables,
	HomePagePostsDocument,
	HomePagePostsQueryVariables,
} from '../generated/graphql';
import { createHeaders, createSSRExchange, getUrqlClientConfig } from '../lib/api/client';

import FeaturedPosts from '../components/features-posts';

import PublicationFooter from '../components/publication-footer';
import PublicationMeta from '../components/publication-meta';
import { resizeImage } from '../utils/image';

const REVALIDATION_INTERVAL_POST_VIEWS_ACTIVE = 60 * 60; // 1 hour
const REVALIDATION_INTERVAL = 60 * 60 * 24 * 30; // 1 month

const NoPostsImage = ({ alt = '' }) => {
	return (
		<Image
			alt={alt}
			height={500}
			width={500}
			src={resizeImage(
				'https://cdn.hashnode.com/res/hashnode/image/upload/v1625676910594/d1jtXmfQC.png?auto=compress',
				{ h: 800, w: 800, c: 'thumb' },
			)}
		/>
	);
};

export default function Index(
	props: InferGetStaticPropsType<typeof getStaticProps> & Required<WithUrqlProps>,
) {
	const { host, publication, initialLimit } = props;

	const ssrCache = createSSRExchange();
	const urqlClient = initUrqlClient(getUrqlClientConfig(ssrCache), false); // TODO: Check why is urqlClient not automatically being passed in props. Ideally, since we are using WithUrqlClient HOC, it should automatically come

	const [fetching, setFetching] = useState(false);

	const { author, preferences, pinnedPost } = publication;
	const dynamicLimit = preferences.layout === 'magazine' ? 12 : 6;

	const [{ data }] = useQuery({
		query: HomePagePostsDocument,
		variables: { host, first: initialLimit, filter: { excludePinnedPost: !!pinnedPost } },
	});

	const { posts } = data?.publication!;

	const fetchedOnce = posts.edges.length > initialLimit;

	const postsToBeRendered = {
		edges: pinnedPost
			? [{ node: pinnedPost, cursor: `${pinnedPost.id}_${pinnedPost.publishedAt}` }].concat(
					posts.edges,
			  )
			: posts.edges,
		pageInfo: posts.pageInfo,
	};

	const fetchMore = async () => {
		setFetching(true);
		await urqlClient
			.query(HomePagePostsDocument, {
				host,
				first: dynamicLimit,
				after: posts.pageInfo.endCursor,
				filter: { excludePinnedPost: !!pinnedPost },
			})
			.toPromise()
			.finally(() => {
				setFetching(false);
			});
	};

	return (
		<AppProvider publication={publication}>
			<Layout>
				<Head>
					<title>
						{publication.displayTitle || publication.title || 'Hashnode Blog Starter Kit'}
					</title>
					<meta
						name="description"
						content={
							publication.descriptionSEO || publication.title || `${publication.author.name}'s Blog`
						}
					/>
					<meta property="twitter:card" content="summary_large_image" />
					<meta
						property="twitter:title"
						content={publication.displayTitle || publication.title || 'Hashnode Blog Starter Kit'}
					/>
					<meta
						property="twitter:description"
						content={
							publication.descriptionSEO || publication.title || `${publication.author.name}'s Blog`
						}
					/>
					<meta
						property="og:image"
						content={publication.ogMetaData.image || getAutogeneratedPublicationOG(publication)}
					/>
					<meta
						property="twitter:image"
						content={publication.ogMetaData.image || getAutogeneratedPublicationOG(publication)}
					/>
					<script
						type="application/ld+json"
						dangerouslySetInnerHTML={{
							__html: JSON.stringify(addPublicationJsonLd(publication)),
						}}
					/>
				</Head>
				<Header isHome={true} />
				<div>
					{postsToBeRendered.edges.length > 0 ? (
						<FeaturedPosts
							posts={postsToBeRendered.edges.map((p: any) => p.node).slice(0, 3)}
							publication={publication}
						/>
					) : null}

					{publication.about?.html ? (
						<div className="blog-author-container border-b dark:border-slate-800">
							<div
								className={twJoin(
									'blog-author-area feed-width mx-auto md:w-3/4 lg:w-2/3',
									preferences.layout === 'grid' ? '' : 'px-4 lg:px-8',
								)}
							>
								<PublicationMeta
									author={author}
									aboutHTML={publication.about.html}
									isTeam={publication.isTeam}
								/>
							</div>
						</div>
					) : null}

					<div className="blog-content-area feed-width mx-auto md:w-2/3">
						<div>
							{postsToBeRendered.edges.length === 0 ? (
								<>
									<div className="min-h-30 my-10 flex w-full flex-col items-center px-6 dark:border-slate-800">
										<div className="block">
											<NoPostsImage alt="No Posts" />
										</div>
									</div>
								</>
							) : null}
						</div>
					</div>

					{postsToBeRendered.edges.length > 3 ? (
						<ModernLayoutPosts
							publication={publication}
							posts={postsToBeRendered}
							fetchMore={fetchMore}
							fetchedOnce={fetchedOnce}
							fetching={fetching}
						/>
					) : null}
				</div>
				{publication ? (
					<PublicationFooter
						authorName={publication.author.name}
						title={publication.title}
						imprint={publication.imprint}
						disableFooterBranding={publication.preferences.disableFooterBranding}
						isTeam={publication.isTeam}
						logo={publication.preferences.logo}
						darkMode={publication.preferences.darkMode}
					/>
				) : null}
			</Layout>
		</AppProvider>
	);
}

export const getStaticProps = async () => {
	const ssrCache = createSSRExchange();
	const urqlClient = initUrqlClient(getUrqlClientConfig(ssrCache), false);
	const host = process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST;
	const homePageInitialQueryVariables: HomePageInitialQueryVariables = {
		host,
	};
	const publicationInfo = await urqlClient
		.query(HomePageInitialDocument, homePageInitialQueryVariables, {
			fetchOptions: {
				headers: createHeaders({ byPassCache: false }),
			},
			requestPolicy: 'network-only',
		})
		.toPromise();

	if (publicationInfo.error) {
		console.error('Error while fetching publication info', {
			variables: homePageInitialQueryVariables,
			error: publicationInfo.error,
		});
		throw publicationInfo.error;
	}
	if (!publicationInfo.data?.publication) {
		console.error('Publication not found fetching publication info; returning 404', {
			variables: homePageInitialQueryVariables,
		});
		return {
			notFound: true,
			revalidate: REVALIDATION_INTERVAL,
		};
	}

	const { publication } = publicationInfo.data;

	const subtractValue = publication.pinnedPost ? 1 : 0;
	const initialLimit =
		publication.preferences.layout === 'magazine' ? 12 - subtractValue : 6 - subtractValue;

	const homePagePostsVariables: HomePagePostsQueryVariables = {
		host,
		first: initialLimit,
		filter: { excludePinnedPost: !!publication.pinnedPost },
	};
	const homePagePostsResponse = await urqlClient
		.query(HomePagePostsDocument, homePagePostsVariables, {
			fetchOptions: {
				headers: createHeaders({ byPassCache: false }),
			},
			requestPolicy: 'network-only',
		})
		.toPromise();
	if (homePagePostsResponse.error) {
		console.error('Error while fetching home page posts', {
			error: homePagePostsResponse.error,
			variables: homePagePostsVariables,
		});
		throw homePagePostsResponse.error;
	}
	if (!homePagePostsResponse.data?.publication) {
		console.error('Publication not found fetching home page posts; returning 404', {
			variables: homePagePostsVariables,
		});
		return {
			notFound: true,
			revalidate: REVALIDATION_INTERVAL,
		};
	}

	return {
		props: {
			publication,
			initialLimit,
			urqlState: ssrCache.extractData(),
			host,
			isHome: true,
		},
		revalidate: 1,
	};
};
