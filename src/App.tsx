import React, { useEffect, useState } from 'react';
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
import { FeedPage } from './pages/feed';
import { OrderPage } from './pages/order';
import { setCurrentOrder, resetCurrentOrder } from './services/currentOrderSlice';
import { fetchOrderDetails } from './services/feedSlice';
import { fetchIngredients } from './services/ingredientsSlice';
import { ProfileOrdersPage } from './pages/profile-orders';

// Component to handle modals with routing
const ModalSwitch: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { order } = useAppSelector(state => state.order);
  const { items, loading: ingredientsLoading } = useAppSelector(state => state.ingredients);
  const { orders: feedOrders } = useAppSelector(state => state.feed);
  const { orders: userOrders } = useAppSelector(state => state.userOrders);

  // Check if we have a background location (for modal)
  const background = location.state && location.state.background;

  // Check for a saved path from session storage (for page refreshes)
  useEffect(() => {
    const savedPath = sessionStorage.getItem('currentOrderPath');
    if (savedPath && location.pathname === '/') {
      console.log(`Found saved path ${savedPath}, navigating there instead of constructor`);
      // Clear the saved path immediately to prevent navigation loops
      sessionStorage.removeItem('currentOrderPath');
      // Navigate to the saved path
      navigate(savedPath);
    }
  }, [navigate, location.pathname]);

  // Save current path to session storage before refresh when on an order page
  useEffect(() => {
    if (location.pathname.includes('/profile/orders/') || location.pathname.includes('/feed/')) {
      sessionStorage.setItem('currentOrderPath', location.pathname);
      console.log(`Saved current path ${location.pathname} to session storage for potential refresh`);
    }
  }, [location.pathname]);

  // Load ingredients if they're not already loaded
  useEffect(() => {
    if (items.length === 0 && !ingredientsLoading) {
      console.log('ModalSwitch: Loading ingredients data');
      dispatch(fetchIngredients());
    }
  }, [dispatch, items.length, ingredientsLoading]);

  // Handle closing the modal
  const handleCloseModal = () => {
    navigate(-1);
    dispatch(resetCurrentIngredient());
  };

  // Handle closing the order modal
  const handleCloseOrderModal = () => {
    navigate(-1);
    dispatch(resetCurrentOrder());
  };

  // If we're on an ingredient route and have a background, show the ingredient in a modal
  const isIngredientModal = location.pathname.includes('/ingredients/') && background;

  // If we're on a feed order route and have a background, show the order in a modal
  const isFeedOrderModal = location.pathname.includes('/feed/') && location.pathname !== '/feed' && background;

  // If we're on a profile order route and have a background, show the order in a modal
  const isProfileOrderModal = location.pathname.includes('/profile/orders/') && 
                              location.pathname !== '/profile/orders' && 
                              background;

  // If we're directly accessing a profile order route (no background), we show the standalone page
  const isDirectProfileOrderAccess = location.pathname.includes('/profile/orders/') && 
                                    location.pathname !== '/profile/orders' && 
                                    !background;

  // If we're directly accessing a feed order route (no background), we show the standalone page
  const isDirectFeedOrderAccess = location.pathname.includes('/feed/') &&
                                  location.pathname !== '/feed' &&
                                  !background;

  // If we have an order, show the order details modal (for order creation popup)
  const isOrderModal = order !== null;

  // Find the ingredient if we're on an ingredient route
  const ingredientId = isIngredientModal ? location.pathname.split('/').pop() : null;
  const ingredient = ingredientId ? items.find(item => item._id === ingredientId) : null;

  // Find the order if we're on an order route
  const orderNumber = isFeedOrderModal || isProfileOrderModal ? location.pathname.split('/').pop() : null;

  // If we found an ingredient, set it as current
  useEffect(() => {
    if (ingredient) {
      dispatch(setCurrentIngredient(ingredient));
    }
  }, [dispatch, ingredient]);

  // If we found an order number, load the order details
  useEffect(() => {
    if (orderNumber) {
      console.log(`Loading order details for order #${orderNumber}`);
      
      // First try to find the order in the current state
      const orderFromFeed = feedOrders.find(o => String(o.number) === orderNumber);
      const orderFromUserOrders = userOrders.find(o => String(o.number) === orderNumber);
      const orderToShow = orderFromFeed || orderFromUserOrders;

      if (orderToShow) {
        console.log(`Found order #${orderNumber} in state, using cached data`);
        dispatch(setCurrentOrder(orderToShow));
      } else {
        // If order is not in current state, fetch it from API
        console.log(`Order #${orderNumber} not found in state, fetching from API`);
        dispatch(fetchOrderDetails(orderNumber));
      }
    }
  }, [dispatch, orderNumber, feedOrders, userOrders]);

  // If we're directly accessing a profile order or feed order, ensure we're loading it properly
  useEffect(() => {
    if ((isDirectProfileOrderAccess || isDirectFeedOrderAccess) && !background) {
      const directOrderNumber = location.pathname.split('/').pop();
      if (directOrderNumber) {
        console.log(`Direct access to order #${directOrderNumber}, ensuring it's loaded`);
        
        // Check if we already have the order loaded in appropriate state
        const existingOrderFromFeed = feedOrders.find(o => String(o.number) === directOrderNumber);
        const existingOrderFromUserOrders = userOrders.find(o => String(o.number) === directOrderNumber);
        const existingOrder = existingOrderFromFeed || existingOrderFromUserOrders;
        
        if (!existingOrder) {
          console.log(`Order #${directOrderNumber} not loaded yet, fetching from API`);
          dispatch(fetchOrderDetails(directOrderNumber));
        } else {
          console.log(`Order #${directOrderNumber} already loaded, using cached data`);
          dispatch(setCurrentOrder(existingOrder));
        }
      }
    }
  }, [dispatch, isDirectProfileOrderAccess, isDirectFeedOrderAccess, background, location.pathname, feedOrders, userOrders]);

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
        <Route path="/profile" element={
          <ProtectedRoute element={<ProfilePage />} />
        }>
          <Route path="orders" element={<ProfileOrdersPage />} />
        </Route>
        <Route path="/profile/orders/:number" element={
          <ProtectedRoute element={<OrderPage />} />
        } />
        <Route path="/ingredients/:id" element={<IngredientPage />} />
        <Route path="/feed" element={<FeedPage />} />
        <Route path="/feed/:number" element={<OrderPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* Ingredient Modal */}
      {isIngredientModal && ingredient && (
        <Modal onClose={handleCloseModal}>
          <IngredientDetails ingredient={ingredient} />
        </Modal>
      )}

      {/* Feed Order Modal */}
      {isFeedOrderModal && (
        <Modal onClose={handleCloseOrderModal}>
          <OrderDetails modal={true} />
        </Modal>
      )}

      {/* Profile Order Modal */}
      {isProfileOrderModal && (
        <Modal onClose={handleCloseOrderModal}>
          <OrderDetails modal={true} />
        </Modal>
      )}

      {/* Order Creation Modal */}
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
  const [authCheckAttempted, setAuthCheckAttempted] = useState(false);
  const { isAuthenticated } = useAppSelector(state => state.auth);

  // Check authentication status on app load only once
  useEffect(() => {
    // Only check auth if:
    // 1. We haven't attempted a check yet
    // 2. We're not already authenticated
    if (!authCheckAttempted && !isAuthenticated) {
      console.log('App: Checking authentication status');
      setAuthCheckAttempted(true);
      
      dispatch(checkAuth())
        .unwrap()
        .then(() => {
          console.log('Authentication check successful');
        })
        .catch(err => {
          console.log('Authentication check failed, proceeding as unauthenticated:', err);
          // This is fine, we'll proceed as unauthenticated
        });
    }
  }, [dispatch, authCheckAttempted, isAuthenticated]);

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