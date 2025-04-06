import React, { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Input, 
  Button 
} from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './auth.module.css';
import { BASE_URL, RESET_PASSWORD_ENDPOINT } from '../utils/constants';

export const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user came from forgot-password page
    const resetEmail = sessionStorage.getItem('resetEmail');
    if (!resetEmail) {
      navigate('/forgot-password', { replace: true });
    }
  }, [navigate]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        navigate('/login');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!password || !token) {
      setError('Пожалуйста, заполните все поля');
      setSuccessMessage(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fetch(`${BASE_URL}${RESET_PASSWORD_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ password, token })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Clear the reset email from session storage
        sessionStorage.removeItem('resetEmail');
        // Show success message
        setSuccessMessage('Пароль успешно изменен');
        setError(null);
      } else {
        setError(data.message || 'Произошла ошибка при сбросе пароля');
        setSuccessMessage(null);
      }
    } catch (error) {
      setError('Произошла ошибка при отправке запроса');
      setSuccessMessage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className="text text_type_main-medium">Восстановление пароля</h2>
        
        <div className={styles.inputContainer}>
          <Input
            type="password"
            placeholder="Введите новый пароль"
            onChange={e => setPassword(e.target.value)}
            value={password}
            name="password"
          />
        </div>
        
        <div className={styles.inputContainer}>
          <Input
            type="text"
            placeholder="Введите код из письма"
            onChange={e => setToken(e.target.value)}
            value={token}
            name="token"
          />
        </div>
        
        {error && !successMessage && (
          <p className="text text_type_main-default text_color_error">{error}</p>
        )}
        
        {successMessage && (
          <p className="text text_type_main-default text_color_success">{successMessage}</p>
        )}
        
        <Button 
          htmlType="submit" 
          type="primary" 
          size="medium"
          disabled={loading}
        >
          {loading ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </form>
      
      <div className={styles.links}>
        <p className="text text_type_main-default text_color_inactive">
          Вспомнили пароль?{' '}
          <Link to="/login" className={styles.link}>
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}; 