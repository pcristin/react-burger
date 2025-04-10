/// <reference types="cypress" />
import React from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { BrowserRouter } from 'react-router-dom'
import { BurgerConstructor } from '../../src/components/burger-constructor/burger-constructor'
import constructorReducer, { initialState as constructorInitialState } from '../../src/services/constructorSlice'
import ingredientsReducer from '../../src/services/ingredientsSlice'

// Selectors
const SELECTORS = {
  INGREDIENT_CARD: '[data-testid="ingredient-card"]',
  CONSTRUCTOR_DROP_AREA: '[data-testid="constructor-drop-area"]',
  CONSTRUCTOR_INGREDIENT: '[data-testid="constructor-ingredient"]',
  CONSTRUCTOR_BUN_TOP: '[data-testid="constructor-bun-top"]',
  CONSTRUCTOR_BUN_BOTTOM: '[data-testid="constructor-bun-bottom"]',
  ORDER_BUTTON: '[data-testid="order-button"]',
  MODAL: '[data-testid="modal"]',
  MODAL_CLOSE: '[data-testid="modal-close"]',
  ORDER_NUMBER: '[data-testid="order-number"]',
  INGREDIENTS: '[data-testid="ingredients"]',
  INGREDIENT_DETAILS: '[data-testid="ingredient-details"]',
  REMOVE_INGREDIENT_BUTTON: '[data-testid="remove-ingredient-button"]'
};

// Импортируем данные из фикстуры ингредиентов
const testIngredients = require('../../cypress/fixtures/ingredients.json');

// Setup mock state
const mockState = {
  ingredients: {
    items: testIngredients.data,
    loading: false,
    error: null
  },
  order: { 
    order: null, 
    loading: false, 
    error: null 
  },
  auth: { 
    user: { name: 'Test User', email: 'test@example.com' },
    isAuthenticated: true, 
    loading: false, 
    error: null 
  }
}

// Create a store creator function
const createTestStore = () => {
  return configureStore({
    reducer: {
      constructor: constructorReducer,
      ingredients: (state = mockState.ingredients) => state,
      order: (state = mockState.order) => state,
      auth: (state = mockState.auth) => state
    },
    preloadedState: {
      constructor: constructorInitialState,
      ingredients: mockState.ingredients,
      order: mockState.order,
      auth: mockState.auth
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
      }),
  })
}

// Create a wrapper component that provides all the necessary context
const TestWrapper = ({ children }) => {
  const store = createTestStore()
  
  return (
    <Provider store={store}>
      <BrowserRouter>
        <DndProvider backend={HTML5Backend}>
          {children}
        </DndProvider>
      </BrowserRouter>
    </Provider>
  )
}

describe('BurgerConstructor Component Testing', () => {
  beforeEach(() => {
    // Мокаем POST запрос для создания заказа
    cy.intercept('POST', 'api/orders', {
      statusCode: 200,
      body: {
        success: true,
        name: 'Test Burger',
        order: {
          number: 12345
        }
      }
    }).as('postOrder');
    
    // Монтируем компонент со всеми провайдерами
    cy.mount(
      <TestWrapper>
        <BurgerConstructor />
      </TestWrapper>
    )
  })

  it('should render empty constructor and allow adding ingredients', () => {
    // Проверяем, что конструктор отображается пустым
    cy.contains('Перетащите ингредиенты сюда').should('exist')
    
    // Перетаскиваем булку в конструктор
    const dataTransfer = new DataTransfer()
    
    // Находим булку в списке ингредиентов и имитируем перетаскивание
    cy.get(`[data-test-id="ingredient-${testIngredients.data[0]._id}"]`)
      .should('exist')
      .trigger('dragstart', { dataTransfer })
    
    // Имитируем сброс ингредиента в зону конструктора
    cy.get(SELECTORS.CONSTRUCTOR_DROP_AREA)
      .trigger('drop', { dataTransfer })
    
    // Проверяем, что булка появилась в конструкторе
    cy.get(SELECTORS.CONSTRUCTOR_BUN_TOP).should('exist')
    cy.get(SELECTORS.CONSTRUCTOR_BUN_BOTTOM).should('exist')
    
    // Перетаскиваем начинку
    const dataTransfer2 = new DataTransfer()
    
    // Находим начинку и имитируем перетаскивание
    cy.get(`[data-test-id="ingredient-${testIngredients.data[2]._id}"]`) // Говяжий метеорит
      .should('exist')
      .trigger('dragstart', { dataTransfer: dataTransfer2 })
    
    // Имитируем сброс ингредиента в зону конструктора
    cy.get(SELECTORS.CONSTRUCTOR_DROP_AREA)
      .trigger('drop', { dataTransfer: dataTransfer2 })
    
    // Проверяем, что начинка появилась в конструкторе
    cy.get(SELECTORS.CONSTRUCTOR_INGREDIENT).should('have.length', 1)
    
    // Проверяем, что кнопка заказа активна
    cy.get(SELECTORS.ORDER_BUTTON).should('not.be.disabled')
  })
  
  it('should create an order when order button is clicked', () => {
    // Перетаскиваем булку и начинку в конструктор
    const dataTransfer = new DataTransfer()
    
    // Булка
    cy.get(`[data-test-id="ingredient-${testIngredients.data[0]._id}"]`)
      .trigger('dragstart', { dataTransfer })
    cy.get(SELECTORS.CONSTRUCTOR_DROP_AREA)
      .trigger('drop', { dataTransfer })
    
    // Начинка
    const dataTransfer2 = new DataTransfer()
    cy.get(`[data-test-id="ingredient-${testIngredients.data[2]._id}"]`)
      .trigger('dragstart', { dataTransfer: dataTransfer2 })
    cy.get(SELECTORS.CONSTRUCTOR_DROP_AREA)
      .trigger('drop', { dataTransfer: dataTransfer2 })
    
    // Нажимаем кнопку "Оформить заказ"
    cy.get(SELECTORS.ORDER_BUTTON).click()
    
    // Ждем завершения запроса на создание заказа
    cy.wait('@postOrder')
    
    // Проверяем, что модальное окно с номером заказа отображается
    cy.get(SELECTORS.MODAL).should('be.visible')
    cy.get(SELECTORS.ORDER_NUMBER).should('contain', '12345')
    
    // Закрываем модальное окно
    cy.get(SELECTORS.MODAL_CLOSE).click()
    cy.get(SELECTORS.MODAL).should('not.exist')
  })
}) 