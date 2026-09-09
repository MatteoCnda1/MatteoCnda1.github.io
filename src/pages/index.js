import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHeader() {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          Mes ressources
        </Heading>
        <p className="hero__subtitle">Knowledge is key</p>
        <p className={styles.heroDescription}>
          Base de connaissances personnelle : notes et cours sur la cybersécurité, les
          réseaux, les systèmes d&apos;exploitation, la programmation et plus encore.
        </p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs">
            Parcourir les ressources
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <Layout
      title="Accueil"
      description="Base de connaissances personnelle : notes et cours sur la cybersécurité, les réseaux, les systèmes d'exploitation, la programmation et plus encore.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
