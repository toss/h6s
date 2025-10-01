import Link from '@docusaurus/Link'
import useDocusaurusContext from '@docusaurus/useDocusaurusContext'
import { useHover } from '@site/src/hooks/useHover'
import clsx from 'clsx'
import React from 'react'

import styles from './HomepageHeader.module.css'

export function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext()
  const [ref, isHover] = useHover()

  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className={clsx(['container', styles.flex, styles.spaceBetween])}>
        <div>
          <h1 className="hero__title" style={{ maxWidth: 620 }}>
            {siteConfig.tagline}
          </h1>
          <p className="hero__subtitle">
            <strong className={styles.gradientRedOrange}>{siteConfig.title}</strong>{' '}
            means{' '}
            <span ref={ref} className={styles.animationFlutter}>
              {isHover
                ? <strong className={clsx('reverse', styles.gradientOrangeRed)}>headless</strong>
                : <span className={styles.gradientSlates}>h______s</span>}
            </span>
          </p>
          <div className={styles.buttons}>
            <Link
              className="button button--primary button--lg"
              to="/docs/intro">
              Get Started
            </Link>
            <a
              className="button button--primary button--outline button--lg"
              href="https://github.com/toss/h6s" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </div>
        </div>
        <img className={styles.heroImage} src="/img/assets/logo@3x.png" alt="" width="320" />
      </div>
    </header>
  )
}
