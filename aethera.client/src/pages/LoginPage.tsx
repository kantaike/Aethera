import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import styles from './Styles/AuthPage.module.css';
import { translations, useLanguage } from '../i18n/translations';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const language = useLanguage();
  const t = translations.auth.login[language];
  const navigate = useNavigate();
  const { mutate: login, isPending, error } = useLogin({
    onSuccess: () => {
      navigate('/profile');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ username, password });
  };

  return (
    <section className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t.title}</h1>
        <p className={styles.subtitle}>{t.subtitle}</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder={t.username}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
            required
          />
          <input
            type="password"
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
            required
          />
          <button type="submit" disabled={isPending} className={styles.submitButton}>
            {t.button}
          </button>
          {error && <p className={styles.error}>{error.message}</p>}
        </form>

        <div className={styles.footer}>
          {t.noAccount} <Link to="/registration" className={styles.footerLink}>{t.registration}</Link>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
