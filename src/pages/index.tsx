import { GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

const Home: NextPage<HomeProps> = ({ postsPagination }: HomeProps) => {
  return (
    <>
      <Head>
        <title>Posts | spacetraveling</title>
      </Head>
      <main className={commonStyles.container}>
        <div className={styles.posts}>
          {postsPagination.results.map(post => (
            <Link key={post.uid} href={`/posts/${post.uid}`}>
              <a>
                <strong>{post.data.title}</strong>
                <p>{post.data.subtitle}</p>
                <div className={styles.postDetails}>
                  <div>
                    <FiCalendar />
                    <time>
                      {format(
                        new Date(post.first_publication_date),
                        'dd MMM yyyy',
                        {
                          locale: ptBR,
                        }
                      )}
                    </time>
                  </div>

                  <div>
                    <FiUser />
                    <span>{post.data.author}</span>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>

        <button type="button" className={styles.loadMore}>
          Carregar mais posts
        </button>
      </main>
    </>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('post', {
    fetch: ['post.title', 'post.subtitle', 'post.author', 'post.content'],
    pageSize: 1,
  });

  const { next_page, results } = postsResponse;

  results.map(result => {
    return {
      uid: result.uid,
      first_publication_date: result.first_publication_date,
      data: {
        title: result.data.title,
        subtitle: result.data.subtitle,
        author: result.data.author,
      },
    };
  });

  return {
    props: {
      postsPagination: {
        next_page,
        results,
      },
    },
  };
};

export default Home;
