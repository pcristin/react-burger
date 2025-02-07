
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
    const container = containerRef.current;
    if (!container || !bunHeaderRef.current || !sauceHeaderRef.current || !mainHeaderRef.current) return;
    
    const scrollTop = container.scrollTop;
    
    const bunDistance = Math.abs(bunHeaderRef.current.offsetTop - scrollTop);
    const sauceDistance = Math.abs(sauceHeaderRef.current.offsetTop - scrollTop);
    const mainDistance = Math.abs(mainHeaderRef.current.offsetTop - scrollTop);

    let newTab: TTabValue;
    if (bunDistance <= sauceDistance && bunDistance <= mainDistance) {
      newTab = 'bun';
    } else if (sauceDistance <= mainDistance) {
      newTab = 'sauce';
    } else {
      newTab = 'main';
    }
    
    if (newTab !== currentTab) {
      setCurrentTab(newTab);
    }
  }, [currentTab]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('scroll', handleScroll);
    handleScroll();

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
        style={{ overflowY: 'auto', height: '500px' }}
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
