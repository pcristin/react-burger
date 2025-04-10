describe('Burger Constructor functionality', () => {
  beforeEach(() => {
    // Visit the main page before each test
    cy.visit('/');
    
    // Mock the API response for ingredients
    cy.intercept('GET', 'https://norma.nomoreparties.space/api/ingredients', {
      fixture: 'ingredients.json'
    }).as('getIngredients');
    
    // Mock the order post request
    cy.intercept('POST', 'https://norma.nomoreparties.space/api/orders', {
      statusCode: 200,
      body: {
        success: true,
        name: 'Test Burger',
        order: {
          number: 12345
        }
      }
    }).as('postOrder');
  });

  it('Should allow dragging ingredients to create a burger and place an order', () => {
    // Wait for ingredients to load
    cy.wait('@getIngredients');
    
    // Verify that ingredients are displayed
    cy.get('[data-testid="ingredients"]').should('exist');
    
    // Drag a bun to the constructor
    cy.get('[data-testid="ingredient-card"]').contains('Краторная булка').trigger('dragstart');
    cy.get('[data-testid="constructor-drop-area"]').trigger('drop');
    
    // Verify bun is added to constructor
    cy.get('[data-testid="constructor-bun-top"]').should('exist');
    cy.get('[data-testid="constructor-bun-bottom"]').should('exist');
    
    // Drag a main ingredient to the constructor
    cy.get('[data-testid="ingredient-card"]').contains('Говяжий').first().trigger('dragstart');
    cy.get('[data-testid="constructor-drop-area"]').trigger('drop');
    
    // Verify main ingredient is added
    cy.get('[data-testid="constructor-ingredient"]').should('exist');
    
    // Drag a sauce to the constructor
    cy.get('[data-testid="ingredient-card"]').contains('соус').first().trigger('dragstart');
    cy.get('[data-testid="constructor-drop-area"]').trigger('drop');
    
    // Verify there are now two ingredients (plus buns)
    cy.get('[data-testid="constructor-ingredient"]').should('have.length', 2);
    
    // Test dragging ingredients to change order
    cy.get('[data-testid="constructor-ingredient"]').first().trigger('dragstart');
    cy.get('[data-testid="constructor-ingredient"]').last().trigger('dragover').trigger('drop');
    
    // Create order (need to login first if auth required)
    cy.get('[data-testid="order-button"]').click();
    
    // Mock auth if needed
    cy.window().then(win => {
      // Check if user is authenticated or redirect to login happened
      if (win.location.pathname.includes('login')) {
        // Fill login form
        cy.get('[data-testid="email-input"]').type('test@example.com');
        cy.get('[data-testid="password-input"]').type('password');
        cy.get('[data-testid="login-button"]').click();
        
        // Get back to constructor and click order again
        cy.visit('/');
        cy.wait('@getIngredients');
        
        // Repeat the burger creation process
        cy.get('[data-testid="ingredient-card"]').contains('Краторная булка').trigger('dragstart');
        cy.get('[data-testid="constructor-drop-area"]').trigger('drop');
        cy.get('[data-testid="ingredient-card"]').contains('Говяжий').first().trigger('dragstart');
        cy.get('[data-testid="constructor-drop-area"]').trigger('drop');
        
        cy.get('[data-testid="order-button"]').click();
      }
    });
    
    // Wait for the order to be created
    cy.wait('@postOrder');
    
    // Verify that the modal with order details appears
    cy.get('[data-testid="modal"]').should('be.visible');
    cy.get('[data-testid="order-number"]').should('contain', '12345');
    
    // Close modal
    cy.get('[data-testid="modal-close"]').click();
    cy.get('[data-testid="modal"]').should('not.exist');
    
    // Verify constructor is reset
    cy.get('[data-testid="constructor-drop-area"]').should('be.empty');
  });

  it('Should open and close ingredient modal when clicking ingredient', () => {
    // Wait for ingredients to load
    cy.wait('@getIngredients');
    
    // Click on an ingredient to open details modal
    cy.get('[data-testid="ingredient-card"]').first().click();
    
    // Verify modal is displayed with ingredient details
    cy.get('[data-testid="modal"]').should('be.visible');
    cy.get('[data-testid="ingredient-details"]').should('exist');
    
    // Close the modal
    cy.get('[data-testid="modal-close"]').click();
    cy.get('[data-testid="modal"]').should('not.exist');
  });

  it('Should be able to remove ingredients from the constructor', () => {
    // Wait for ingredients to load
    cy.wait('@getIngredients');
    
    // Add bun and ingredient to constructor
    cy.get('[data-testid="ingredient-card"]').contains('Краторная булка').trigger('dragstart');
    cy.get('[data-testid="constructor-drop-area"]').trigger('drop');
    
    cy.get('[data-testid="ingredient-card"]').contains('Говяжий').first().trigger('dragstart');
    cy.get('[data-testid="constructor-drop-area"]').trigger('drop');
    
    // Verify ingredient is added
    cy.get('[data-testid="constructor-ingredient"]').should('have.length', 1);
    
    // Remove the ingredient by clicking the remove button
    cy.get('[data-testid="remove-ingredient-button"]').first().click();
    
    // Verify ingredient is removed
    cy.get('[data-testid="constructor-ingredient"]').should('have.length', 0);
  });
}); 