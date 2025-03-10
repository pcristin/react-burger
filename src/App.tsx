import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './services/hooks';
import { checkAuth } from './services/authSlice';
import { resetOrder } from './services/orderSlice';
import styles from './App.module.css';
import { AppHeader } from './components/app-header/app-header';
import { Modal } from './components/modal/modal';
import { OrderDetails } from './components/order-details/order-details';
import { IngredientDetails } from './components/ingredient-details/ingredient-details';
import { ProtectedRoute } from './components/protected-route/protected-route';
import { HomePage } from './pages/home';
import { LoginPage } from './pages/login';
import { RegisterPage } from './pages/register';
import { ForgotPasswordPage } from './pages/forgot-password';
import { ResetPasswordPage } from './pages/reset-password';
import { ProfilePage } from './pages/profile';
import { IngredientPage } from './pages/ingredient';
import { NotFoundPage } from './pages/not-found';
import { setCurrentIngredient, resetCurrentIngredient } from './services/currentIngredientSlice';

// Component to handle modals with routing
const ModalSwitch: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { order } = useAppSelector(state => state.order);
  const { items } = useAppSelector(state => state.ingredients);

  // Check if we have a background location (for modal)
  const background = location.state && location.state.background;

  // Handle closing the modal
  const handleCloseModal = () => {
    navigate(-1);
    dispatch(resetCurrentIngredient());
  };

  // If we're on an ingredient route and have a background, show the ingredient in a modal
  const isIngredientModal = location.pathname.includes('/ingredients/') && background;

  // If we have an order, show the order details modal
  const isOrderModal = order !== null;

  // Find the ingredient if we're on an ingredient route
  const ingredientId = isIngredientModal ? location.pathname.split('/').pop() : null;
  const ingredient = ingredientId ? items.find(item => item._id === ingredientId) : null;

  // If we found an ingredient, set it as current
  useEffect(() => {
    if (ingredient) {
      dispatch(setCurrentIngredient(ingredient));
    }
  }, [dispatch, ingredient]);

  return (
    <>
      <Routes location={background || location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={
          <ProtectedRoute element={<LoginPage />} anonymous={true} />
        } />
        <Route path="/register" element={
          <ProtectedRoute element={<RegisterPage />} anonymous={true} />
        } />
        <Route path="/forgot-password" element={
          <ProtectedRoute element={<ForgotPasswordPage />} anonymous={true} />
        } />
        <Route path="/reset-password" element={
          <ProtectedRoute element={<ResetPasswordPage />} anonymous={true} />
        } />
        <Route path="/profile/*" element={
          <ProtectedRoute element={<ProfilePage />} />
        } />
        <Route path="/ingredients/:id" element={<IngredientPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Ingredient Modal */}
      {isIngredientModal && ingredient && (
        <Modal onClose={handleCloseModal}>
          <IngredientDetails ingredient={ingredient} />
        </Modal>
      )}

      {/* Order Modal */}
      {isOrderModal && (
        <Modal onClose={() => dispatch(resetOrder())}>
          <OrderDetails />
        </Modal>
      )}
    </>
  );
};

function App() {
  const dispatch = useAppDispatch();

  // Check authentication status on app load
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  return (
    <Router>
      <div className={styles.app}>
        <AppHeader />
        <ModalSwitch />
      </div>
    </Router>
  );
}

export default App; 