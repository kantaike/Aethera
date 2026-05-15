import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Home,
  Sword,
  Castle,
  Crown,
  Backpack,
  ScrollText,
  UserCircle,
  Menu,
  Globe,
} from 'lucide-react';
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

  const toggleLanguage = () => {
    handleLanguageChange(language === 'uk' ? 'en' : 'uk');
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
            <Home className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>{t.home}</span>
          </Link>
          <Link
            to="/characters"
            className={`${styles.navLink} ${
              location.pathname.startsWith('/characters') ? styles.navLinkActive : ''
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <Sword className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>{t.characters}</span>
          </Link>
          <Link
            to="/settlements"
            className={`${styles.navLink} ${
              location.pathname.startsWith('/settlements') ? styles.navLinkActive : ''
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <Castle className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>{t.settlements}</span>
          </Link>
          <Link
            to="/dynasties"
            className={`${styles.navLink} ${
              location.pathname.startsWith('/dynasties') ? styles.navLinkActive : ''
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <Crown className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>{t.dynasties}</span>
          </Link>
          <Link
            to="/items"
            className={`${styles.navLink} ${
              location.pathname.startsWith('/items') ? styles.navLinkActive : ''
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <Backpack className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>{t.items}</span>
          </Link>
          <Link
            to="/stories"
            className={`${styles.navLink} ${
              location.pathname.startsWith('/stories') ? styles.navLinkActive : ''
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            <ScrollText className={styles.navIcon} size={18} />
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
            <UserCircle className={styles.navIcon} size={18} />
            <span className={styles.navLabel}>{t.profile}</span>
          </Link>

          <button
            type="button"
            className={`${styles.langButton} ${language === 'uk' ? styles.langButtonActive : ''}`}
            onClick={toggleLanguage}
            aria-label={language === 'uk' ? 'Switch language to English' : 'Switch language to Ukrainian'}
            title={language === 'uk' ? 'English' : 'Українська'}
          >
            <Globe className={styles.langIcon} size={18} />
          </button>
        </div>
      </aside>

      <div className={styles.main}>
        <header className={styles.mobileHeader}>
          <button className={styles.menuButton} onClick={toggleSidebar} aria-label="Toggle menu">
            <Menu size={22} />
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