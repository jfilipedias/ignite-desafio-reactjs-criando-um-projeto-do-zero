import Image from 'next/image';
import Link from 'next/link';

import commonStyles from '../../styles/common.module.scss';
import styles from './header.module.scss';

const Header: React.FC = () => {
  return (
    <header className={commonStyles.container}>
      <div className={styles.logo}>
        <Link href="/">
          <a>
            <Image
              src="/images/logo.svg"
              alt="logo"
              width={238.62}
              height={25.63}
            />
          </a>
        </Link>
      </div>
    </header>
  );
};

export default Header;
