import React from 'react';
import styles from './modal-overlay.module.css';
import PropTypes from 'prop-types';

interface ModalOverlayProps {
  onClose: () => void;
}

export const ModalOverlay: React.FC<ModalOverlayProps> = ({ onClose }) => {
  return <div className={styles.overlay} onClick={onClose} />;
};

ModalOverlay.propTypes = {
  onClose: PropTypes.func.isRequired
} as any; 