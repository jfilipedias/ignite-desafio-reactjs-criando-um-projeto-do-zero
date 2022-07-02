import { da } from 'date-fns/locale';
import { GetStaticProps, NextPage } from 'next';
import { RichText } from 'prismic-dom';

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

const Home: NextPage<HomeProps> = ({ postsPagination }) => {
  return <h1>Home</h1>;
};

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient({});
  const postsResponse = await prismic.getByType('post', {
    fetch: ['post.title', 'post.subtitle', 'post.author', 'post.content'],
    pageSize: 1,
  });

  const { results, next_page } = postsResponse;

  console.log(JSON.stringify(results, null, 2));

  results.map(result => {
    return {
      uid: result.uid,
      first_publication_date: new Date(
        result.last_publication_date
      ).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
      data: {
        title: result.data.title,
        subtitle: result.data.subtitle,
        author: result.data.author,
      },
    };
  });

  return {
    props: {
      results,
      next_page,
    },
  };
};

export default Home;
