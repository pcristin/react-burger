import React, { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  EmailInput, 
  Button 
} from '@ya.praktikum/react-developer-burger-ui-components';
import styles from './auth.module.css';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Clear success message after 3 seconds and navigate
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
        navigate('/reset-password');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Пожалуйста, введите email');
      setSuccessMessage(null);
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const response = await fetch('https://norma.nomoreparties.space/api/password-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Store email in sessionStorage to verify user came from forgot-password
        sessionStorage.setItem('resetEmail', email);
        setSuccessMessage('Письмо с инструкциями отправлено на ваш email');
        setError(null);
      } else {
        setError(data.message || 'Произошла ошибка при восстановлении пароля');
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
          <EmailInput
            onChange={e => setEmail(e.target.value)}
            value={email}
            name="email"
            placeholder="Укажите e-mail"
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
          {loading ? 'Отправка...' : 'Восстановить'}
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