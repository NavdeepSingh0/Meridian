'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import UserMenu from './UserMenu';
import styles from './AppHeader.module.css';

const NAV = [
  { href: '/documents', label: 'My resumes' },
  { href: '/checker', label: 'ATS checker' },
  { href: '/builder', label: 'Builder' },
];

/** Top bar for the app's non-builder pages (documents, checker). */
export default function AppHeader() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand} aria-label="Meridian home">
          <Logo width={120} />
        </Link>

        <nav className={styles.nav} aria-label="Main">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.link} ${active ? styles.active : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <UserMenu />
      </div>
    </header>
  );
}
