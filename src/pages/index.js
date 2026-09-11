import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import styles from './index.module.css';

function HomepageHeader() {
  return (
    <header className={styles.hero}>
      <div className="container">
        <Heading as="h1" className={styles.heroTitle}>
          Mes ressources
        </Heading>
        <p className={styles.heroTagline}>Knowledge is key</p>
        <p className={styles.heroDescription}>
          Notes et cours personnels, classés et tenus à jour au fil de l&apos;apprentissage :
          cybersécurité, réseaux, systèmes, programmation, sciences, droit et culture générale.
        </p>
        <Link className={styles.heroAction} to="/docs">
          Parcourir les ressources
        </Link>
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
