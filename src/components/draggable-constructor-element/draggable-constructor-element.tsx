import React, { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ConstructorElement, DragIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import { TConstructorIngredient } from '../../utils/types';
import styles from './draggable-constructor-element.module.css';

type TDraggableConstructorElementProps = {
  ingredient: TConstructorIngredient;
  index: number;
  handleRemove: () => void;
  handleMove: (dragIndex: number, hoverIndex: number) => void;
};

export const DraggableConstructorElement: React.FC<TDraggableConstructorElementProps> = ({
  ingredient,
  index,
  handleRemove,
  handleMove
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'constructor-element',
    item: () => ({ id: ingredient.uniqueId, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  const [{ handlerId }, drop] = useDrop<
    { id: string; index: number },
    void,
    { handlerId: string | symbol | null }
  >({
    accept: 'constructor-element',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId()
      };
    },
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();

      if (!clientOffset) {
        return;
      }

      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Перетаскивание вниз
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Перетаскивание вверх
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      handleMove(dragIndex, hoverIndex);
      item.index = hoverIndex;
    }
  });

  const opacity = isDragging ? 0.5 : 1;
  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={styles.element}
      style={{ opacity }}
      data-handler-id={handlerId}
    >
      <div className={styles.dragIcon}>
        <DragIcon type="primary" />
      </div>
      <ConstructorElement
        text={ingredient.name}
        price={ingredient.price}
        thumbnail={ingredient.image}
        handleClose={handleRemove}
      />
    </div>
  );
}; 