import React from 'react';
import { ConstructorElement, CurrencyIcon, Button, DragIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './burger-constructor.module.css';
import { IIngredient } from '../../utils/data';
import PropTypes from 'prop-types';

interface BurgerConstructorProps {
  ingredients: IIngredient[];
}

export const BurgerConstructor: React.FC<BurgerConstructorProps> = ({ ingredients }) => {
  const bun = ingredients.find(item => item.type === 'bun');
  const fillings = ingredients.filter(item => item.type !== 'bun');

  const totalPrice = React.useMemo(() => {
    return (bun ? bun.price * 2 : 0) + fillings.reduce((sum, item) => sum + item.price, 0);
  }, [bun, fillings]);

  return (
    <section className={styles.section}>
      <div className={styles.burgerConstructor}>
        {bun && (
          <div className={styles.bun}>
            <ConstructorElement
              type="top"
              isLocked={true}
              text={`${bun.name} (верх)`}
              price={bun.price}
              thumbnail={bun.image}
            />
          </div>
        )}

        <div className={styles.ingredients}>
          {fillings.map((item) => (
            <div key={item._id} className={styles.ingredient}>
              <span className={styles.dragIcon}><DragIcon type="primary" /></span>
              <ConstructorElement
                text={item.name}
                price={item.price}
                thumbnail={item.image}
              />
            </div>
          ))}
        </div>

        {bun && (
          <div className={styles.bun}>
            <ConstructorElement
              type="bottom"
              isLocked={true}
              text={`${bun.name} (низ)`}
              price={bun.price}
              thumbnail={bun.image}
            />
          </div>
        )}
      </div>

      <div className={styles.total}>
        <div className={styles.price}>
          <span className="text text_type_digits-medium">{totalPrice}</span>
          <CurrencyIcon type="primary" />
        </div>
        <Button htmlType="button" type="primary" size="large">
          Оформить заказ
        </Button>
      </div>
    </section>
  );
};

BurgerConstructor.propTypes = {
  ingredients: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['bun', 'main', 'sauce']).isRequired,
      proteins: PropTypes.number.isRequired,
      fat: PropTypes.number.isRequired,
      carbohydrates: PropTypes.number.isRequired,
      calories: PropTypes.number.isRequired,
      price: PropTypes.number.isRequired,
      image: PropTypes.string.isRequired,
      image_mobile: PropTypes.string.isRequired,
      image_large: PropTypes.string.isRequired,
      __v: PropTypes.number.isRequired
    })
  ).isRequired
} as any;
