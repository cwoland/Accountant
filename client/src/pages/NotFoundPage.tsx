import { Link } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <div className={styles.page}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>Такой страницы нет</h1>
      <p className={styles.text}>Возможно, ссылка устарела или в адресе опечатка.</p>
      <Link to="/" className={styles.link}>Вернуться на стену</Link>
    </div>
  );
}