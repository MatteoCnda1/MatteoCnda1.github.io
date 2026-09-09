import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const CategoryGroups = [
  {
    title: 'Cybersécurité & Réseaux',
    items: [
      {icon: '🛡️', title: 'Cybersecurity', to: '/docs/Cybersecurity'},
      {icon: '🌐', title: 'Networking', to: '/docs/networking'},
      {icon: '🔐', title: 'Cryptography', to: '/docs/Cryptography'},
      {icon: '🔎', title: 'OSINT', to: '/docs/OSINT'},
    ],
  },
  {
    title: 'Systèmes & Infrastructure',
    items: [
      {icon: '💻', title: 'Operating Systems', to: '/docs/Operating_sys'},
      {icon: '📦', title: 'Containers', to: '/docs/Containers'},
      {icon: '☸️', title: 'Container Orchestration', to: '/docs/Container_Orchestration'},
      {icon: '⚙️', title: 'Config Management & Automation', to: '/docs/Configuration_Management_Automation'},
      {icon: '🔧', title: 'Hardware', to: '/docs/Hardware'},
      {icon: '🚀', title: 'DevOps', to: '/docs/DevOps'},
      {icon: '☁️', title: 'Cloud Computing', to: '/docs/Cloud_Computing'},
      {icon: '🔌', title: 'Électronique', to: '/docs/Electronique'},
      {icon: '🦾', title: 'Robotique & Embarqué', to: '/docs/Robotique'},
    ],
  },
  {
    title: 'Programmation & Données',
    items: [
      {icon: '👨‍💻', title: 'Programmation', to: '/docs/Programmation'},
      {icon: '🗄️', title: 'Database', to: '/docs/Databases'},
      {icon: '🤖', title: 'AI', to: '/docs/Artificial_Intelligence'},
      {icon: '🧮', title: 'Algorithmique & Structures de données', to: '/docs/Algorithmique_Structures_De_Donnees'},
      {icon: '🏗️', title: 'Architecture logicielle', to: '/docs/Software_Architecture'},
      {icon: '🕸️', title: 'Systèmes distribués', to: '/docs/Systemes_Distribues'},
    ],
  },
  {
    title: 'Sciences',
    items: [
      {icon: '📐', title: 'Mathématiques', to: '/docs/Mathématics'},
      {icon: '⚛️', title: 'Physics', to: '/docs/Physics'},
      {icon: '📡', title: 'Traitement du signal', to: '/docs/Traitement_du_signal'},
      {icon: '📊', title: 'Statistiques & Probabilités', to: '/docs/Statistiques_Probabilites'},
      {icon: '🧪', title: 'Chimie', to: '/docs/Chimie'},
      {icon: '🧬', title: 'Biologie', to: '/docs/Biologie'},
    ],
  },
  {
    title: 'Culture générale & vie pratique',
    items: [
      {icon: '⚖️', title: 'Droit', to: '/docs/Droit'},
      {icon: '🗣️', title: 'Langues', to: '/docs/Langues'},
      {icon: '💰', title: 'Économie & Finance', to: '/docs/Economie_Finance'},
      {icon: '🗂️', title: 'Productivité', to: '/docs/Productivite'},
      {icon: '📋', title: 'Gestion de projet', to: '/docs/Gestion_de_Projet'},
      {icon: '🧠', title: 'Philosophie', to: '/docs/Philosophie'},
      {icon: '🏛️', title: 'Histoire', to: '/docs/Histoire'},
      {icon: '🌍', title: 'Géopolitique', to: '/docs/Geopolitique'},
      {icon: '🩺', title: 'Santé & Nutrition', to: '/docs/Sante_Nutrition'},
    ],
  },
];

function CategoryCard({icon, title, to}) {
  return (
    <Link to={to} className={styles.card}>
      <span className={styles.cardIcon} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.cardTitle}>{title}</span>
    </Link>
  );
}

function CategoryGroup({title, items}) {
  return (
    <div className={styles.group}>
      <Heading as="h3" className={styles.groupTitle}>
        {title}
      </Heading>
      <div className={styles.grid}>
        {items.map((item) => (
          <CategoryCard key={item.title} {...item} />
        ))}
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        {CategoryGroups.map((group) => (
          <CategoryGroup key={group.title} {...group} />
        ))}
      </div>
    </section>
  );
}
