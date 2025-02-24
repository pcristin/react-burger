import React, { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Input, 
  EmailInput, 
  Button 
} from '@ya.praktikum/react-developer-burger-ui-components';
import { useAppDispatch, useAppSelector } from '../services/hooks';
import { register, resetError } from '../services/authSlice';
import styles from './auth.module.css';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, loading, error } = useAppSelector(state => state.auth);

  // Reset error when component mounts
  useEffect(() => {
    dispatch(resetError());
  }, [dispatch]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    dispatch(register({ name, email, password }));
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <h2 className="text text_type_main-medium">Регистрация</h2>
        
        <div className={styles.inputContainer}>
          <Input
            type="text"
            placeholder="Имя"
            onChange={e => setName(e.target.value)}
            value={name}
            name="name"
          />
        </div>
        
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
            placeholder="Пароль"
            onChange={e => setPassword(e.target.value)}
            value={password}
            name="password"
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
          {loading ? 'Регистрация...' : 'Зарегистрироваться'}
        </Button>
      </form>
      
      <div className={styles.links}>
        <p className="text text_type_main-default text_color_inactive">
          Уже зарегистрированы?{' '}
          <Link to="/login" className={styles.link}>
            Войти
          </Link>
        </p>
      </div>
    </div>
  );
}; 