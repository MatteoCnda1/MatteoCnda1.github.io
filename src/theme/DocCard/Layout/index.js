import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {ThemeClassNames} from '@docusaurus/theme-common';
import Heading from '@theme/DocCard/Heading';
import Description from '@theme/DocCard/Description';
import styles from './styles.module.css';

function Container({className, href, children}) {
  return (
    <Link
      href={href}
      className={clsx(
        'card padding--lg',
        ThemeClassNames.docs.docCard.container,
        styles.cardContainer,
        className,
      )}>
      {children}
    </Link>
  );
}

export default function DocCardLayout({item, className, href, icon, title, description}) {
  const thumbnail = item.customProps?.thumbnail;
  return (
    <Container href={href} className={className}>
      {thumbnail && (
        <div className={styles.thumbnailWrapper}>
          <img src={thumbnail} alt="" className={styles.thumbnail} loading="lazy" />
        </div>
      )}
      <Heading item={item} icon={thumbnail ? undefined : icon} title={title} />
      {description && <Description item={item} description={description} />}
    </Container>
  );
}
