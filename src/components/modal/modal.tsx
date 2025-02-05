import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { CloseIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import { ModalOverlay } from './modal-overlay.tsx';
import styles from './modal.module.css';

const modalRoot = document.getElementById('modal-root') as HTMLElement;

type TModalProps = {
  children: React.ReactNode;
  title?: string;
  onClose: () => void;
};

export const Modal: React.FC<TModalProps> = ({ children, title, onClose }) => {
  useEffect(() => {
    const handleEscClose = (evt: KeyboardEvent) => {
      if (evt.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscClose);
    return () => {
      document.removeEventListener('keydown', handleEscClose);
    };
  }, [onClose]);

  return ReactDOM.createPortal(
    <>
      <div className={styles.modal}>
        <div className={styles.header}>
          {title && <h2 className="text text_type_main-large">{title}</h2>}
          <button className={styles.closeButton} onClick={onClose}>
            <CloseIcon type="primary" />
          </button>
        </div>
        {children}
      </div>
      <ModalOverlay onClose={onClose} />
    </>,
    modalRoot
  );
}; 