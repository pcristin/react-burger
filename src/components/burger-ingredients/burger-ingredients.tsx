import React, { useEffect, useRef, useState } from 'react';
import { useAppSelector, useAppDispatch } from '../../services/hooks';
import { fetchIngredients } from '../../services/ingredientsSlice';
import { IngredientCard } from '../ingredient-card/ingredient-card';
import styles from './burger-ingredients.module.css';

type TTabValue = 'bun' | 'sauce' | 'main';

export const BurgerIngredients: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, loading, error } = useAppSelector(state => state.ingredients);
  const [currentTab, setCurrentTab] = useState<TTabValue>('bun');

  const containerRef = useRef<HTMLDivElement>(null);
  const bunRef = useRef<HTMLDivElement>(null);
  const sauceRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchIngredients());
  }, [dispatch]);

  const handleTabClick = (tab: TTabValue) => {
    setCurrentTab(tab);
    const refs = {
      bun: bunRef,
      sauce: sauceRef,
      main: mainRef
    };
    
    refs[tab].current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const options = {
      root: containerRef.current,
      rootMargin: '0px',
      threshold: [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
    };

    const callback: IntersectionObserverCallback = (entries) => {
      const visibleSections = entries
        .filter(entry => entry.isIntersecting)
        .map(entry => ({
          id: entry.target.id,
          ratio: entry.intersectionRatio
        }))
        .sort((a, b) => b.ratio - a.ratio);

      if (visibleSections.length > 0) {
        setCurrentTab(visibleSections[0].id as TTabValue);
      }
    };

    const observer = new IntersectionObserver(callback, options);

    if (bunRef.current) observer.observe(bunRef.current);
    if (sauceRef.current) observer.observe(sauceRef.current);
    if (mainRef.current) observer.observe(mainRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  const buns = items.filter(item => item.type === 'bun');
  const sauces = items.filter(item => item.type === 'sauce');
  const mains = items.filter(item => item.type === 'main');

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${currentTab === 'bun' ? styles.active : ''}`}
          onClick={() => handleTabClick('bun')}
        >
          Булки
        </button>
        <button
          className={`${styles.tab} ${currentTab === 'sauce' ? styles.active : ''}`}
          onClick={() => handleTabClick('sauce')}
        >
          Соусы
        </button>
        <button
          className={`${styles.tab} ${currentTab === 'main' ? styles.active : ''}`}
          onClick={() => handleTabClick('main')}
        >
          Начинки
        </button>
      </div>

      <div className={styles.ingredients} ref={containerRef}>
        <div id="bun" ref={bunRef}>
          <h2>Булки</h2>
          <div className={styles.group}>
            {buns.map(item => (
              <IngredientCard key={item._id} ingredient={item} />
            ))}
          </div>
        </div>

        <div id="sauce" ref={sauceRef}>
          <h2>Соусы</h2>
          <div className={styles.group}>
            {sauces.map(item => (
              <IngredientCard key={item._id} ingredient={item} />
            ))}
          </div>
        </div>

        <div id="main" ref={mainRef}>
          <h2>Начинки</h2>
          <div className={styles.group}>
            {mains.map(item => (
              <IngredientCard key={item._id} ingredient={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
