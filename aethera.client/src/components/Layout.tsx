import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import styles from './Layout.module.css';

type Language = 'uk' | 'en';

const translations: Record<
  Language,
  {
    menu: string;
    home: string;
    characters: string;
    settlements: string;
    dynasties: string;
    items: string;
    stories: string;
  }
> = {
  uk: {
    menu: 'Меню',
    home: 'Головна',
    characters: 'Персонажі',
    settlements: 'Поселення',
    dynasties: 'Династії',
    items: 'Предмети',
    stories: 'Історії',
  },
  en: {
    menu: 'Menu',
    home: 'Home',
    characters: 'Characters',
    settlements: 'Settlements',
    dynasties: 'Dynasties',
    items: 'Items',
    stories: 'Stories',
  },
};

const Layout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('language') as Language | null;
      if (stored === 'uk' || stored === 'en') {
        setLanguage(stored);
      }
    }
  }, []);

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('language', lang);
    }
  };

  const t = translations[language];

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