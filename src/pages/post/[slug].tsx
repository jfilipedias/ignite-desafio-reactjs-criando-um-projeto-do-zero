/* eslint-disable react/no-array-index-key */
/* eslint-disable no-param-reassign */
import { GetStaticPaths, GetStaticProps, NextPage } from 'next';
import Head from 'next/head';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { useRouter } from 'next/router';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  uid: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
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
  const formattedDate = format(
    new Date(post.first_publication_date),
    'dd MMM yyyy',
    {
      locale: ptBR,
    }
  );

  const wordCount = post.data.content.reduce((acc, content) => {
    acc += content.heading.split(' ').length;
    acc += content.body.reduce((accWords, body) => {
      accWords += body.text.split(' ').length;
      return accWords;
    }, 0);

    return acc;
  }, 0);

  const router = useRouter();

  if (router.isFallback) {
    return <h1>Carregando...</h1>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title} | spacetraveling</title>
      </Head>

      <main>
        <img className={styles.banner} src={post.data.banner.url} alt="" />

        <article className={commonStyles.container}>
          <h1 className={styles.heading}>{post.data.title}</h1>

          <div className={styles.postDetails}>
            <div>
              <FiCalendar />
              <time>{formattedDate}</time>
            </div>
            <div>
              <FiUser />
              <span>{post.data.author}</span>
            </div>

            <div>
              <FiClock />
              <span>{Math.ceil(wordCount / 200)} min</span>
            </div>
          </div>

          <div className={styles.content}>
            {post.data.content.map((content, headingIndex) => (
              <div key={headingIndex}>
                <h3>{content.heading}</h3>

                {content.body.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex}>{paragraph.text}</p>
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
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
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
