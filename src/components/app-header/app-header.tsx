import React from 'react';
import styles from './app-header.module.css';
import { Logo, BurgerIcon, ListIcon, ProfileIcon, Tab } from '@ya.praktikum/react-developer-burger-ui-components';

export const AppHeader: React.FC = () => {
  const [current, setCurrent] = React.useState('burgerConstructor');

  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <div className={styles.leftGroup}>
          <Tab value="burgerConstructor" active={current === 'burgerConstructor'} onClick={setCurrent}>
            <BurgerIcon type={current === 'burgerConstructor' ? 'primary' : 'secondary'} />
            <span className={`text text_type_main-default ml-2 ${current !== 'burgerConstructor' ? 'text_color_inactive' : ''}`}>
              Конструктор
            </span>
          </Tab>
          <Tab value="orders" active={current === 'orders'} onClick={setCurrent}>
            <ListIcon type={current === 'orders' ? 'primary' : 'secondary'} />
            <span className={`text text_type_main-default ml-2 ${current !== 'orders' ? 'text_color_inactive' : ''}`}>
              Лента заказов
            </span>
          </Tab>
        </div>
        <Logo />
        <Tab value="profile" active={current === 'profile'} onClick={setCurrent}>
          <ProfileIcon type={current === 'profile' ? 'primary' : 'secondary'} />
          <span className={`text text_type_main-default ml-2 ${current !== 'profile' ? 'text_color_inactive' : ''}`}>
            Личный кабинет
          </span>
        </Tab>
      </nav>
    </header>
  );
};
