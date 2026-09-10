import React, {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './recent-updates.module.css';

const SECTION_LABELS = {
  docs: 'Mes ressources',
  marie: 'Cours de Marie',
};

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function RecentUpdates() {
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/recent-updates.json')
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setEntries)
      .catch(() => setError(true));
  }, []);

  return (
    <Layout title="Dernières mises à jour" description="Pages récemment modifiées sur le site.">
      <main className="container margin-vert--lg">
        <Heading as="h1">Dernières mises à jour</Heading>
        <p>Les pages les plus récemment modifiées, toutes sections confondues.</p>

        {error && <p>Impossible de charger les dernières mises à jour.</p>}
        {!entries && !error && <p>Chargement…</p>}

        {entries && (
          <ul className={styles.list}>
            {entries.map((entry) => (
              <li key={entry.url} className={styles.item}>
                <Link to={entry.url} className={styles.title}>
                  {entry.title}
                </Link>
                <span className={styles.meta}>
                  <span className={styles.badge} data-section={entry.section}>
                    {SECTION_LABELS[entry.section] ?? entry.section}
                  </span>
                  {formatDate(entry.date)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </main>
    </Layout>
  );
}
