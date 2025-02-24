import React from 'react';
import { Link } from 'react-router-dom';
import styles from './not-found.module.css';

export const NotFoundPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1 className={`${styles.title} text text_type_main-large`}>404</h1>
      <p className="text text_type_main-medium mb-10">Страница не найдена</p>
      <Link to="/" className={styles.link}>
        <span className="text text_type_main-default">Вернуться на главную</span>
      </Link>
    </div>
  );
}; 