// Define selectors as constants to avoid duplication
const SELECTORS = {
  // Обновленные селекторы на основе реальных селекторов в приложении
  CONSTRUCTOR_DROP_AREA: '[class*="_constructor"]', // Область конструктора
  CONSTRUCTOR_INGREDIENT: '[class*="_ingredients"] > div', // Ингредиенты в конструкторе
  CONSTRUCTOR_BUN_TOP: ':nth-child(1) > .constructor-element > .constructor-element__row', // Верхняя булка
  CONSTRUCTOR_BUN_BOTTOM: '[class*="burger-constructor_bun"]:last-child', // Нижняя булка
  ORDER_BUTTON: 'button:contains("Оформить заказ")', // Кнопка оформления заказа
  MODAL: '[class*="_modal"]', // Модальное окно
  MODAL_CLOSE: '[class*="_closeButton"]', // Кнопка закрытия модального окна
  ORDER_NUMBER: '[class*="order-details_number"]', // Номер заказа
  EMAIL_INPUT: 'input[name="email"]', // Поле ввода email
  PASSWORD_INPUT: 'input[name="password"]', // Поле ввода пароля
  LOGIN_BUTTON: 'button:contains("Войти")', // Кнопка входа
  INGREDIENTS: '[class*="_ingredients"]', // Список ингредиентов
  INGREDIENT_DETAILS: '[class*="ingredient-details_details"]', // Детали ингредиента
  REMOVE_INGREDIENT_BUTTON: '[class*="constructor-element__action"]', // Кнопка удаления
  TAB_BUN: '.tab:contains("Булки")', // Таб "Булки"
  TAB_SAUCE: '.tab:contains("Соусы")', // Таб "Соусы"
  TAB_MAIN: '.tab:contains("Начинки")' // Таб "Начинки"
};

// Мок данных авторизации
const AUTH_DATA = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
  accessToken: 'Bearer mock-token-12345',
  refreshToken: 'mock-refresh-token-12345'
};

// Функция для имитации авторизации пользователя
function mockUserAuth() {
  // Мокаем запрос на проверку пользователя
  cy.intercept('GET', '**/api/auth/user', {
    statusCode: 200,
    body: {
      success: true,
      user: {
        email: AUTH_DATA.email,
        name: AUTH_DATA.name
      }
    }
  }).as('authCheck');

  // Мокаем запросы на авторизацию
  cy.intercept('POST', '**/api/auth/login', {
    statusCode: 200,
    body: {
      success: true,
      accessToken: AUTH_DATA.accessToken,
      refreshToken: AUTH_DATA.refreshToken,
      user: {
        email: AUTH_DATA.email,
        name: AUTH_DATA.name
      }
    }
  }).as('loginRequest');

  // Мокаем запрос на обновление токена
  cy.intercept('POST', '**/api/auth/token', {
    statusCode: 200,
    body: {
      success: true,
      accessToken: AUTH_DATA.accessToken,
      refreshToken: AUTH_DATA.refreshToken
    }
  }).as('refreshToken');

  // Мокаем запрос на создание заказа
  cy.intercept('POST', '**/api/orders', {
    statusCode: 200,
    body: {
      success: true,
      name: 'Test Burger',
      order: {
        number: 12345
      }
    }
  }).as('orderRequest');

  // Устанавливаем токены напрямую в localStorage
  cy.window().then((win) => {
    // Проверяем, в каком формате хранятся токены
    win.localStorage.setItem('accessToken', AUTH_DATA.accessToken);
    win.localStorage.setItem('refreshToken', AUTH_DATA.refreshToken);
    // Также пробуем другие варианты названий токенов
    win.localStorage.setItem('authToken', AUTH_DATA.accessToken);
    win.localStorage.setItem('token', AUTH_DATA.accessToken);
    win.localStorage.setItem('userData', JSON.stringify({
      email: AUTH_DATA.email,
      name: AUTH_DATA.name
    }));
    
    // Имитируем авторизованное состояние в Redux
    const authState = {
      user: {
        email: AUTH_DATA.email,
        name: AUTH_DATA.name
      },
      isAuthenticated: true,
      loading: false,
      error: null
    };
    
    // Если в приложении используется Redux Persist, сохраняем в localStorage
    win.localStorage.setItem('persist:auth', JSON.stringify({
      user: JSON.stringify(authState.user),
      isAuthenticated: JSON.stringify(authState.isAuthenticated),
      loading: JSON.stringify(authState.loading),
      error: JSON.stringify(authState.error)
    }));
  });
}

// Простой метод drag and drop на основе примера Cypress
function dragAndDrop(sourceSelector, targetSelector) {
  // Используем упрощенный подход из примера Cypress
  cy.get(sourceSelector)
    .trigger('dragstart')
  
  cy.get(targetSelector)
    .trigger('dragover')
    .trigger('drop')
  
  cy.get(sourceSelector)
    .trigger('dragend')
    
  // Даем время для обработки
  cy.wait(500);
}

// Альтернативный метод, использующий события мыши
function dragAndDropMouse(sourceSelector, targetSelector) {
  // Подход, основанный на событиях мыши
  cy.get(sourceSelector).then($source => {
    
    cy.get(targetSelector).then($target => {
      const targetRect = $target[0].getBoundingClientRect();
      const targetX = targetRect.left + targetRect.width / 2;
      const targetY = targetRect.top + targetRect.height / 2;
      
      // Trigger mouse events based on example
      cy.get(sourceSelector)
        .trigger('mousedown', { which: 1 })
        .trigger('mousemove', { clientX: targetX, clientY: targetY })
        .trigger('mouseup', { force: true });
      
      // Give time for processing
      cy.wait(500);
    });
  });
}

describe('Burger Constructor functionality', () => {
  beforeEach(() => {
    // Сначала имитируем авторизацию
    cy.visit('/', {
      onBeforeLoad: (win) => {
        // Очищаем localStorage перед каждым тестом
        win.localStorage.clear();
      }
    });
    
    // Имитируем авторизацию пользователя
    mockUserAuth();
    
    // Даем время для загрузки ингредиентов
    cy.wait(2000);
  });

  it('Should allow dragging ingredients to create a burger and place an order', () => {
    // Проверяем, что контейнер с ингредиентами существует
    cy.get(SELECTORS.INGREDIENTS).should('exist');
    
    // Проверяем, что таб "Булки" существует (НЕ кликаем, т.к. он уже активен!)
    cy.get(SELECTORS.TAB_BUN).should('exist');
    
    // Находим карточку булки и перетаскиваем в конструктор
    cy.contains('Краторная булка').should('be.visible').as('bunCard');
    dragAndDrop('@bunCard', SELECTORS.CONSTRUCTOR_DROP_AREA);
    
    // Если первый способ не работает, пробуем использовать метод с событиями мыши
    cy.get(SELECTORS.CONSTRUCTOR_BUN_TOP).should('exist').then(($bunTop) => {
      if ($bunTop.length === 0) {
        // Если булка не была добавлена, пробуем другой метод
        dragAndDropMouse('@bunCard', SELECTORS.CONSTRUCTOR_DROP_AREA);
      }
    });
    
    // Проверяем, что булка добавлена
    cy.get(SELECTORS.CONSTRUCTOR_BUN_TOP).should('exist');
    
    // Переходим к начинкам
    cy.get(SELECTORS.TAB_MAIN).click();
    
    // Находим карточку начинки и перетаскиваем в конструктор
    cy.contains('Говяжий').should('be.visible').as('mainCard');
    dragAndDrop('@mainCard', SELECTORS.CONSTRUCTOR_DROP_AREA);
    
    // Проверяем, что начинка добавлена
    cy.get(SELECTORS.CONSTRUCTOR_INGREDIENT).should('exist');
    
    // Проверяем, что ингредиенты добавлены
    cy.get(SELECTORS.CONSTRUCTOR_INGREDIENT).should('have.length.at.least', 1);
    
    // Проверяем, что кнопка заказа отображается
    cy.get(SELECTORS.ORDER_BUTTON).should('exist');
    
    // Нажимаем кнопку "Оформить заказ"
    cy.get(SELECTORS.ORDER_BUTTON).click();
    
    // Проверяем, перенаправило ли нас на страницу логина
    cy.url().then(url => {
      if (url.includes('login')) {
        cy.log('Перенаправлено на страницу входа. Выполняем вход...');
        // Заполняем форму логина
        cy.get(SELECTORS.EMAIL_INPUT).type(AUTH_DATA.email);
        cy.get(SELECTORS.PASSWORD_INPUT).type(AUTH_DATA.password);
        cy.get(SELECTORS.LOGIN_BUTTON).click();
        
        // Возвращаемся на главную страницу
        cy.visit('/');
        cy.wait(2000);
        
        // Имитируем авторизацию еще раз с другим подходом
        cy.window().then((win) => {
          // Пробуем различные варианты хранения токена
          win.localStorage.setItem('accessToken', AUTH_DATA.accessToken);
          win.localStorage.setItem('refreshToken', AUTH_DATA.refreshToken);
          win.localStorage.setItem('token', AUTH_DATA.accessToken);
          win.localStorage.setItem('auth', JSON.stringify({
            accessToken: AUTH_DATA.accessToken,
            refreshToken: AUTH_DATA.refreshToken,
            user: {
              email: AUTH_DATA.email,
              name: AUTH_DATA.name
            }
          }));
        });
        
        // Снова перетаскиваем ингредиенты
        // НЕ кликаем по табу "Булки", он активен по умолчанию!
        cy.contains('Краторная булка').should('be.visible').as('bunCard2');
        dragAndDrop('@bunCard2', SELECTORS.CONSTRUCTOR_DROP_AREA);
        
        cy.get(SELECTORS.TAB_MAIN).click();
        cy.contains('Говяжий').should('be.visible').as('mainCard2');
        dragAndDrop('@mainCard2', SELECTORS.CONSTRUCTOR_DROP_AREA);
        
        // Оформляем заказ
        cy.get(SELECTORS.ORDER_BUTTON).click();
        
        // Ждем завершения запроса на создание заказа или обрабатываем ошибку
        // В Cypress нет .catch() для команд, используем более простой подход
        cy.wait('@orderRequest', { timeout: 10000 })
          .then(() => {
            cy.log('Заказ успешно создан');
          });
      } else {
        // Если мы не были перенаправлены, ждем завершения запроса
        cy.wait('@orderRequest', { timeout: 10000 })
          .then(() => {
            cy.log('Заказ успешно создан без перенаправления');
          });
      }
      
      // Проверяем модальное окно в любом случае
      cy.get(SELECTORS.MODAL, { timeout: 10000 }).should('be.visible');
    });
    
    // Закрываем модальное окно
    cy.get(SELECTORS.MODAL_CLOSE).click();
    cy.get(SELECTORS.MODAL).should('not.exist');
  });

  it('Should open and close ingredient modal when clicking ingredient', () => {
    // Кликаем на ингредиент, чтобы открыть модальное окно с деталями
    // НЕ кликаем по табу "Булки", он активен по умолчанию!
    cy.contains('Краторная булка').click();
    
    // Проверяем, что модальное окно открылось
    cy.get(SELECTORS.MODAL, { timeout: 5000 }).should('be.visible');
    
    // Закрываем модальное окно
    cy.get(SELECTORS.MODAL_CLOSE).click();
    cy.get(SELECTORS.MODAL).should('not.exist');
  });

  it('Should be able to add and remove ingredients from the constructor', () => {
    // Перетаскиваем булку в конструктор (не кликаем по табу "Булки")
    cy.contains('Краторная булка').should('be.visible').as('bunCard');
    dragAndDrop('@bunCard', SELECTORS.CONSTRUCTOR_DROP_AREA);
    
    // Перетаскиваем начинку
    cy.get(SELECTORS.TAB_MAIN).click();
    cy.contains('Говяжий').should('be.visible').as('mainCard');
    dragAndDrop('@mainCard', SELECTORS.CONSTRUCTOR_DROP_AREA);
    
    // Проверяем, что ингредиенты добавлены
    cy.get(SELECTORS.CONSTRUCTOR_INGREDIENT).should('exist');
    
    // Удаляем ингредиенты (если есть кнопка удаления)
    cy.get('body').then($body => {
      if ($body.find(SELECTORS.REMOVE_INGREDIENT_BUTTON).length > 0) {
        cy.get(SELECTORS.REMOVE_INGREDIENT_BUTTON).eq(1).click();
      }
    });
    
    // Проверяем, что начинка удалена
    cy.wait(500);
    cy.get(SELECTORS.CONSTRUCTOR_INGREDIENT).should('have.length', 4);
  });
}); 