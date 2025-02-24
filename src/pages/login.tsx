import React, { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  EmailInput, 
  Input, 
  Button 
} from '@ya.praktikum/react-developer-burger-ui-components';
import { useAppDispatch, useAppSelector } from '../services/hooks';
import { login, resetError } from '../services/authSlice';
import styles from './auth.module.css';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, error } = useAppSelector(state => state.auth);

  // Get the redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';

  // Reset error when component mounts
  useEffect(() => {
    dispatch(resetError());
  }, [dispatch]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className="text text_type_main-medium">Вход</h2>
        
        <div className={styles.inputContainer}>
          <EmailInput
            onChange={e => setEmail(e.target.value)}
            value={email}
            name="email"
            placeholder="E-mail"
          />
        </div>
        
        <div className={styles.inputContainer}>
          <Input
            type="password"
            onChange={e => setPassword(e.target.value)}
            value={password}
            name="password"
            placeholder="Пароль"
          />
        </div>
        
        {error && (
          <p className="text text_type_main-default text_color_error">{error}</p>
        )}
        
        <Button 
          htmlType="submit" 
          type="primary" 
          size="medium"
          disabled={loading}
        >
          {loading ? 'Вход...' : 'Войти'}
        </Button>
      </form>
      
      <div className={styles.links}>
        <p className="text text_type_main-default text_color_inactive">
          Вы — новый пользователь?{' '}
          <Link to="/register" className={styles.link}>
            Зарегистрироваться
          </Link>
        </p>
        <p className="text text_type_main-default text_color_inactive">
          Забыли пароль?{' '}
          <Link to="/forgot-password" className={styles.link}>
            Восстановить пароль
          </Link>
        </p>
      </div>
    </div>
  );
}; 