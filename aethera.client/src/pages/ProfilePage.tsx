import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { translations, useLanguage } from '../i18n/translations';
import { useAuthStore } from '../store/authStore';
import styles from './Styles/ProfilePage.module.css';

const ProfilePage = () => {
  const language = useLanguage();
  const t = translations.profile[language];
  const navigate = useNavigate();
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const currentUser = useAuthStore((state) => state.currentUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const roleLabel = t.roles[currentUser?.role as keyof typeof t.roles] ?? currentUser?.role ?? t.roles.Unknown;

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isHydrated, navigate]);

  if (!isHydrated) {
    return null;
  }

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <h2 className={styles.title}>{t.title}</h2>
        <p className={styles.subtitle}>{t.welcome}</p>
        <p className={styles.summary}>{t.summary}</p>

        {currentUser ? (
          <dl className={styles.details}>
            <div className={styles.row}>
              <dt className={styles.label}>{t.username}</dt>
              <dd className={styles.value}>{currentUser.username}</dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.label}>{t.id}</dt>
              <dd className={styles.value}>{currentUser.id}</dd>
            </div>
            <div className={styles.row}>
              <dt className={styles.label}>{t.role}</dt>
              <dd className={styles.value}>{roleLabel}</dd>
            </div>
          </dl>
        ) : (
          <p className={styles.empty}>{t.missing}</p>
        )}

        <button className={styles.logoutButton} onClick={handleLogout}>
          {t.logout}
        </button>
      </div>
    </section>
  );
};

export default ProfilePage;
