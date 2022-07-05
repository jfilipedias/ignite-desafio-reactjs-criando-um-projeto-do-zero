import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

const Post: NextPage<PostProps> = ({ post }) => {
  const formattedPost = {
    ...post,
    first_publication_date: format(
      new Date(post.first_publication_date),
      'dd MMM yyyy',
      {
        locale: ptBR,
      }
    ),
  };

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>

      <main>
        <img className={styles.banner} src={post.data.banner.url} alt="" />

        <article className={commonStyles.container}>
          <h1 className={styles.heading}>{formattedPost.data.title}</h1>

          <div className={styles.postDetails}>
            <div>
              <FiCalendar />
              <time>{formattedPost.first_publication_date}</time>
            </div>
            <div>
              <FiUser />
              <span>{formattedPost.first_publication_date}</span>
            </div>

            <div>
              <FiClock />
              <span>4 min</span>
            </div>
          </div>

          <div className={styles.content}>
            {formattedPost.data.content.map(content => (
              <div>
                <h3>{content.heading}</h3>

                {content.body.map(paragraph => (
                  <p>{paragraph.text}</p>
                ))}
              </div>
            ))}
          </div>
        </article>
      </main>
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient({});
  const posts = await prismic.getByType('post');

  const paths = posts.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    };
  });

  return {
    paths,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismic = getPrismicClient({});
  const response = await prismic.getByUID('post', String(slug), {});

  const post = {
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: response.data.content.map(content => ({
        heading: content.heading,
        body: content.body,
      })),
    },
  };

  return {
    props: {
      post,
    },
    revalidate: 60 * 30, // 30 minutes
  };
};

export default Post;
