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
  const [attempt, setAttempt] = useState(0);
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, error } = useAppSelector(state => state.auth);

  // Get the redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';

  // Reset error when component mounts
  useEffect(() => {
    dispatch(resetError());
    setLoginError(null);
  }, [dispatch]);

  // Update login error when redux error changes
  useEffect(() => {
    if (error) {
      setLoginError(error);
    }
  }, [error]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    
    if (!email || !password) {
      setLoginError('Введите email и пароль');
      return;
    }
    
    try {
      setAttempt(prev => prev + 1);
      console.log(`Login attempt ${attempt + 1}`);
      
      const result = await dispatch(login({ email, password })).unwrap();
      console.log('Login success:', result);
    } catch (err) {
      console.error('Login failed:', err);
      setLoginError(typeof err === 'string' ? err : 'Ошибка авторизации. Повторите попытку позже.');
    }
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
        
        {loginError && (
          <p className="text text_type_main-default text_color_error">{loginError}</p>
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