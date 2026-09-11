import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const CategoryGroups = [
  {
    ref: '01',
    title: 'Cybersécurité & Réseaux',
    items: [
      {title: 'Cybersecurity', to: '/docs/Cybersecurity'},
      {title: 'Networking', to: '/docs/networking'},
      {title: 'Cryptography', to: '/docs/Cryptography'},
      {title: 'OSINT', to: '/docs/OSINT'},
    ],
  },
  {
    ref: '02',
    title: 'Systèmes & Infrastructure',
    items: [
      {title: 'Operating Systems', to: '/docs/Operating_sys'},
      {title: 'Containers', to: '/docs/Containers'},
      {title: 'Container Orchestration', to: '/docs/Container_Orchestration'},
      {title: 'Config Management & Automation', to: '/docs/Configuration_Management_Automation'},
      {title: 'Hardware', to: '/docs/Hardware'},
      {title: 'DevOps', to: '/docs/DevOps'},
      {title: 'Cloud Computing', to: '/docs/Cloud_Computing'},
      {title: 'Électronique', to: '/docs/Electronique'},
      {title: 'Robotique & Embarqué', to: '/docs/Robotique'},
    ],
  },
  {
    ref: '03',
    title: 'Programmation & Données',
    items: [
      {title: 'Programmation', to: '/docs/Programmation'},
      {title: 'Database', to: '/docs/Databases'},
      {title: 'AI', to: '/docs/Artificial_Intelligence'},
      {title: 'Algorithmique & Structures de données', to: '/docs/Algorithmique_Structures_De_Donnees'},
      {title: 'Architecture logicielle', to: '/docs/Software_Architecture'},
      {title: 'Systèmes distribués', to: '/docs/Systemes_Distribues'},
    ],
  },
  {
    ref: '04',
    title: 'Sciences',
    items: [
      {title: 'Mathématiques', to: '/docs/Mathématics'},
      {title: 'Physics', to: '/docs/Physics'},
      {title: 'Traitement du signal', to: '/docs/Traitement_du_signal'},
      {title: 'Statistiques & Probabilités', to: '/docs/Statistiques_Probabilites'},
      {title: 'Chimie', to: '/docs/Chimie'},
      {title: 'Biologie', to: '/docs/Biologie'},
    ],
  },
  {
    ref: '05',
    title: 'Culture générale & vie pratique',
    items: [
      {title: 'Droit', to: '/docs/Droit'},
      {title: 'Langues', to: '/docs/Langues'},
      {title: 'Économie & Finance', to: '/docs/Economie_Finance'},
      {title: 'Productivité', to: '/docs/Productivite'},
      {title: 'Gestion de projet', to: '/docs/Gestion_de_Projet'},
      {title: 'Philosophie', to: '/docs/Philosophie'},
      {title: 'Histoire', to: '/docs/Histoire'},
      {title: 'Géopolitique', to: '/docs/Geopolitique'},
      {title: 'Santé & Nutrition', to: '/docs/Sante_Nutrition'},
    ],
  },
];

function CategoryRow({ref, title, items}) {
  return (
    <div className={styles.row}>
      <div className={styles.rowMark} aria-hidden="true">
        {ref}
      </div>
      <div className={styles.rowBody}>
        <Heading as="h3" className={styles.rowTitle}>
          {title}
        </Heading>
        <ul className={styles.itemList}>
          {items.map((item) => (
            <li key={item.title} className={styles.itemEntry}>
              <Link to={item.to} className={styles.itemLink}>
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        {CategoryGroups.map((group) => (
          <CategoryRow key={group.title} {...group} />
        ))}
      </div>
    </section>
  );
}
