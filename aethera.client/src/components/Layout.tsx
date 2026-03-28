import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';
import { setStoredLanguage, type Language, translations, useLanguage } from '../i18n/translations';

const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const language = useLanguage();
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const handleLanguageChange = (lang: Language) => {
    setStoredLanguage(lang);
  };

  const t = translations.layout[language];

  return (
    <div className={styles.container}>
      {isSidebarOpen && <div className={styles.overlay} onClick={toggleSidebar} />}

      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarActive : ''}`}>
        <nav className={styles.nav}>
          <Link
            to="/"
            className={`${styles.navLink} ${
              location.pathname === '/' ? styles.navLinkActive : ''
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className={styles.navIcon}>🏠</span>
            <span className={styles.navLabel}>{t.home}</span>
          </Link>
          <Link
            to="/characters"
            className={`${styles.navLink} ${
              location.pathname.startsWith('/characters') ? styles.navLinkActive : ''
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className={styles.navIcon}>🧙‍♂️</span>
            <span className={styles.navLabel}>{t.characters}</span>
          </Link>
          <Link
            to="/settlements"
            className={`${styles.navLink} ${
              location.pathname.startsWith('/settlements') ? styles.navLinkActive : ''
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className={styles.navIcon}>🏰</span>
            <span className={styles.navLabel}>{t.settlements}</span>
          </Link>
          <Link
            to="/dynasties"
            className={`${styles.navLink} ${
              location.pathname.startsWith('/dynasties') ? styles.navLinkActive : ''
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className={styles.navIcon}>👑</span>
            <span className={styles.navLabel}>{t.dynasties}</span>
          </Link>
          <Link
            to="/items"
            className={`${styles.navLink} ${
              location.pathname.startsWith('/items') ? styles.navLinkActive : ''
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className={styles.navIcon}>🎒</span>
            <span className={styles.navLabel}>{t.items}</span>
          </Link>
          <Link
            to="/stories"
            className={`${styles.navLink} ${
              location.pathname.startsWith('/stories') ? styles.navLinkActive : ''
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className={styles.navIcon}>📜</span>
            <span className={styles.navLabel}>{t.stories}</span>
          </Link>
        </nav>

        <div className={styles.sidebarFooter}>
          <Link
            to="/profile"
            className={`${styles.navLink} ${
              location.pathname.startsWith('/profile') ? styles.navLinkActive : ''
            } ${styles.footerProfileLink}`}
            onClick={() => setSidebarOpen(false)}
          >
            <span className={styles.navIcon}>👤</span>
            <span className={styles.navLabel}>{t.profile}</span>
          </Link>

          <div className={styles.langButtons}>
            <button
              type="button"
              className={`${styles.langButton} ${
                language === 'uk' ? styles.langButtonActive : ''
              }`}
              onClick={() => handleLanguageChange('uk')}
            >
              UA
            </button>
            <button
              type="button"
              className={`${styles.langButton} ${
                language === 'en' ? styles.langButtonActive : ''
              }`}
              onClick={() => handleLanguageChange('en')}
            >
              EN
            </button>
          </div>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.mobileHeader}>
          <button className={styles.menuButton} onClick={toggleSidebar}>
            ☰
          </button>
          <span style={{ marginLeft: '20px' }}>{t.menu}</span>
        </header>

        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;