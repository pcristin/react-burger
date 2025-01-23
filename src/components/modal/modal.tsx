import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { CloseIcon } from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './modal.module.css';
import { ModalOverlay } from './modal-overlay';
import PropTypes from 'prop-types';

interface ModalProps {
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
  useEffect(() => {
    const handleEscClose = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscClose);
    return () => {
      document.removeEventListener('keydown', handleEscClose);
    };
  }, [onClose]);

  const modalRoot = document.getElementById('modals');

  if (!modalRoot) return null;

  return ReactDOM.createPortal(
    <>
      <ModalOverlay onClose={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          {title && <h2 className="text text_type_main-large">{title}</h2>}
          <button className={styles.closeButton} onClick={onClose}>
            <CloseIcon type="primary" />
          </button>
        </div>
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </>,
    modalRoot
  );
};

Modal.propTypes = {
  title: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
} as any; 