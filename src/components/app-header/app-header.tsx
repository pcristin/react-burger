import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../services/hooks';
import {
  Logo,
  BurgerIcon,
  ListIcon,
  ProfileIcon,
} from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './app-header.module.css';

export const AppHeader: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated } = useAppSelector(state => state.auth);

  // Helper to determine if a path is active
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.leftSection}>
          <NavLink to="/" className={styles.link}>
            <BurgerIcon type={isActive('/') ? "primary" : "secondary"} />
            <span className={`text text_type_main-default ${!isActive('/') && 'text_color_inactive'}`}>
              Конструктор
            </span>
          </NavLink>
          <NavLink to="/feed" className={styles.link}>
            <ListIcon type={isActive('/feed') ? "primary" : "secondary"} />
            <span className={`text text_type_main-default ${!isActive('/feed') && 'text_color_inactive'}`}>
              Лента заказов
            </span>
          </NavLink>
        </div>
        
        <div className={styles.logo}>
          <Logo />
        </div>
        
        <NavLink to={isAuthenticated ? "/profile" : "/login"} className={styles.link}>
          <ProfileIcon type={isActive('/profile') || isActive('/login') ? "primary" : "secondary"} />
          <span className={`text text_type_main-default ${!(isActive('/profile') || isActive('/login')) && 'text_color_inactive'}`}>
            Личный кабинет
          </span>
        </NavLink>
      </nav>
    </header>
  );
};
