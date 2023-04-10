import React from 'react';

import {classNames} from '../../../../../../utilities/css';
import {SkeletonBodyText} from '../../../../../SkeletonBodyText';
import {SkeletonDisplayText} from '../../../../../SkeletonDisplayText';

import styles from './Title.scss';

export interface TitleProps {
  /** Page title, in large type */
  title?: string | 'loading';
  /** Page subtitle, in regular type*/
  subtitle?: string | 'loading';
  /** Important and non-interactive status information shown immediately after the title. */
  titleMetadata?: React.ReactNode;
  /** Removes spacing between title and subtitle */
  compactTitle?: boolean;
}

export function Title({
  title,
  subtitle,
  titleMetadata,
  compactTitle,
}: TitleProps) {
  const className = classNames(
    styles.Title,
    subtitle && styles.TitleWithSubtitle,
  );

  let titleMarkup = title ? <h1 className={className}>{title}</h1> : null;
  titleMarkup = title === 'loading' ? <SkeletonDisplayText /> : titleMarkup;

  const titleMetadataMarkup = titleMetadata ? (
    <div className={styles.TitleMetadata}>{titleMetadata}</div>
  ) : null;

  const wrappedTitleMarkup = titleMetadata ? (
    <div className={styles.TitleWithMetadataWrapper}>
      {titleMarkup}
      {titleMetadataMarkup}
    </div>
  ) : (
    titleMarkup
  );

  const subtitleMarkup = subtitle ? (
    <div
      className={classNames(
        styles.SubTitle,
        compactTitle && styles.SubtitleCompact,
      )}
    >
      {subtitle === 'loading' ? (
        <SkeletonBodyText lines={1} />
      ) : (
        <p>{subtitle}</p>
      )}
    </div>
  ) : null;

  return (
    <>
      {wrappedTitleMarkup}
      {subtitleMarkup}
    </>
  );
}
