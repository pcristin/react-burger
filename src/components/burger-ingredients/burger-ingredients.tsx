
import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useAppSelector, useAppDispatch } from '../../services/hooks';
import { fetchIngredients } from '../../services/ingredientsSlice';
import { Tab } from '@ya.praktikum/react-developer-burger-ui-components';
import { IngredientGroup } from '../ingredient-group/ingredient-group';
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
  const bunHeaderRef = useRef<HTMLHeadingElement>(null);
  const sauceHeaderRef = useRef<HTMLHeadingElement>(null);
  const mainHeaderRef = useRef<HTMLHeadingElement>(null);

  const buns = useMemo(() => items.filter(item => item.type === 'bun'), [items]);
  const sauces = useMemo(() => items.filter(item => item.type === 'sauce'), [items]);
  const mains = useMemo(() => items.filter(item => item.type === 'main'), [items]);

  useEffect(() => {
    dispatch(fetchIngredients());
  }, [dispatch]);

  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    
    // Получаем позиции заголовков относительно верха контейнера
    const bunHeaderTop = bunHeaderRef.current?.getBoundingClientRect().top || 0;
    const sauceHeaderTop = sauceHeaderRef.current?.getBoundingClientRect().top || 0;
    const mainHeaderTop = mainHeaderRef.current?.getBoundingClientRect().top || 0;
    
    // Определяем, какой заголовок ближе всего к верху контейнера
    const tabsHeight = 50; // Примерная высота табов
    
    if (bunHeaderTop <= tabsHeight + 100 && sauceHeaderTop > tabsHeight + 50) {
      setCurrentTab('bun');
    } else if (sauceHeaderTop <= tabsHeight + 100 && mainHeaderTop > tabsHeight + 50) {
      setCurrentTab('sauce');
    } else if (mainHeaderTop <= tabsHeight + 100) {
      setCurrentTab('main');
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', handleScroll);
    
    // Вызываем handleScroll сразу после монтирования компонента
    setTimeout(handleScroll, 100);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const handleTabClick = (value: string) => {
    setCurrentTab(value as TTabValue);
    const sectionRefs: Record<TTabValue, React.RefObject<HTMLDivElement>> = {
      bun: bunRef,
      sauce: sauceRef,
      main: mainRef,
    };
    sectionRefs[value as TTabValue].current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>Ошибка: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={`text text_type_main-large ${styles.title}`}>Соберите бургер</h1>
      
      <div className={styles.tabs}>
        <Tab value="bun" active={currentTab === 'bun'} onClick={handleTabClick}>
          Булки
        </Tab>
        <Tab value="sauce" active={currentTab === 'sauce'} onClick={handleTabClick}>
          Соусы
        </Tab>
        <Tab value="main" active={currentTab === 'main'} onClick={handleTabClick}>
          Начинки
        </Tab>
      </div>

      <div
        className={styles.ingredients}
        ref={containerRef}
        onScroll={handleScroll}
      >
        <IngredientGroup
          ingredients={buns}
          type="bun"
          groupRef={bunRef}
          headerRef={bunHeaderRef}
          title="Булки"
        />
        <IngredientGroup
          ingredients={sauces}
          type="sauce"
          groupRef={sauceRef}
          headerRef={sauceHeaderRef}
          title="Соусы"
        />
        <IngredientGroup
          ingredients={mains}
          type="main"
          groupRef={mainRef}
          headerRef={mainHeaderRef}
          title="Начинки"
        />
      </div>
    </div>
  );
};
