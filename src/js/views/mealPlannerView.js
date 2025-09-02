// import View from './View.js';
// import icons from 'url:../../img/icons.svg'

class MealPlannerView {
  #parentElement = document.querySelector('.nav__item');

  _data;

  render(data) {
    this._data = data;
    const markup = this._generateMarkup();
    this._clear();
    this.#parentElement.insertAdjacentHTML('afterbegin', markup);

    // Add all event listeners after rendering
    this._addEventListeners();
  }

  _clear() {
    this.#parentElement.innerHTML = '';
  }

  _generateMarkup() {
    return `
      <div class="meal-planner-overlay">
        <div class="meal-planner-modal">
          <button class="btn--close-modal">&times;</button>
          
          <div class="meal-planner-container">
            <div class="meal-planner-header">
              <h2 class="heading--2">Weekly Meal Planner</h2>
              <p class="meal-planner-description">Search and add recipes to your weekly meal plan</p>
            </div>

            <div class="meal-planner-content">
              <!-- Search Section -->
              <div class="meal-planner-search-section">
                <h3 class="heading--3">Search & Add Recipes</h3>
                <form class="search meal-planner-search">
                  <input
                    type="text"
                    class="search__field meal-planner-search-input"
                    placeholder="Search over 1,000,000 recipes..."
                  />
                  <button class="btn search__btn meal-planner-search-btn">
                    <svg class="search__icon">
                      <use href="#icon-search"></use>
                    </svg>
                    <span>Search</span>
                  </button>
                </form>
                
                <div class="search-results meal-planner-search-results">
                  <ul class="results meal-planner-results">
                    <!-- Search results will be rendered here -->
                  </ul>
                  <div class="pagination"></div>
                </div>
              </div>

              <!-- Selected Recipes Pool -->
              <div class="selected-recipes-section">
                <h3 class="heading--3">Selected Recipes (${
                  this._data.selectedRecipes.length
                })</h3>
                <div class="selected-recipes-pool">
                  ${this._generateSelectedRecipesMarkup()}
                </div>
              </div>

              <!-- Weekly Calendar -->
              <div class="weekly-calendar-section">
                <h3 class="heading--3">Weekly Calendar</h3>
                <div class="weekly-calendar">
                  ${this._generateWeeklyCalendarMarkup()}
                </div>
              </div>
            </div>

            <div class="meal-planner-actions">
              <button class="btn btn--round meal-planner-save">Save Meal Plan</button>
              <button class="btn btn--round btn--secondary meal-planner-clear">Clear All</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  _generateSelectedRecipesMarkup() {
    if (this._data.selectedRecipes.length === 0) {
      return '<p class="message">No recipes selected. Search and add recipes above!</p>';
    }

    return this._data.selectedRecipes
      .map(
        recipe => `
      <div class="selected-recipe-card" data-id="${recipe.id}" draggable="true">
        <img src="${recipe.image}" alt="${recipe.title}" class="selected-recipe-img" />
        <div class="selected-recipe-info">
          <h4 class="selected-recipe-title">${recipe.title}</h4>
          <p class="selected-recipe-publisher">${recipe.publisher}</p>
        </div>
        <button class="btn--tiny btn--remove-recipe" data-id="${recipe.id}">Ã—</button>
      </div>
    `
      )
      .join('');
  }

  _generateWeeklyCalendarMarkup() {
    const days = [
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
      'sunday',
    ];
    const mealTypes = ['breakfast', 'lunch', 'dinner'];

    return `
      <div class="calendar-grid">
        <div class="calendar-header">
          <div class="day-label"></div>
          ${mealTypes
            .map(meal => {
              return `<div class="meal-header">
                ${meal.charAt(0).toUpperCase() + meal.slice(1)}
              </div>`;
            })
            .join('')}
        </div>
        
        ${days
          .map(
            day => `
          <div class="calendar-row">
            <div class="day-label">${
              day.charAt(0).toUpperCase() + day.slice(1)
            }</div>
            ${mealTypes
              .map(
                meal => `
              <div class="meal-slot" data-day="${day}" data-meal="${meal}">
                ${this._generateMealSlotContent(day, meal)}
              </div>
            `
              )
              .join('')}
          </div>
        `
          )
          .join('')}
      </div>
    `;
  }

  _generateMealSlotContent(day, meal) {
    const assignedRecipe = this._data.weekPlan[day][meal];

    if (assignedRecipe) {
      return `
        <div class="assigned-recipe">
          <img src="${assignedRecipe.image}" alt="${assignedRecipe.title}" class="meal-img" />
          <p class="meal-title">${assignedRecipe.title}</p>
          <button class="btn--tiny btn--remove-meal" data-day="${day}" data-meal="${meal}">Ã—</button>
        </div>
      `;
    }

    return `
      <div class="empty-meal-slot">
        <p>Drop recipe here</p>
      </div>
    `;
  }

  _addEventListeners() {
    // Close modal events
    this._addCloseModalListeners();

    // Search events
    this._addSearchListeners();

    // Recipe management events
    this._addRecipeManagementListeners();

    // Drag and drop events
    this._addDragAndDropListeners();

    // Action button events
    this._addActionButtonListeners();
  }

  _addCloseModalListeners() {
    const overlay = document.querySelector('.meal-planner-overlay');
    const closeBtn = document.querySelector('.btn--close-modal');

    if (overlay) {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) {
          this._closeModal();
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this._closeModal();
      });
    }

    document.addEventListener('keydown', e => {
      if (
        e.key === 'Escape' &&
        document.querySelector('.meal-planner-overlay')
      ) {
        this._closeModal();
      }
    });
  }

  _addSearchListeners() {
    const searchForm = document.querySelector('.meal-planner-search');
    const searchBtn = document.querySelector('.meal-planner-search-btn');
    const searchInput = document.querySelector('.meal-planner-search-input');

    if (searchForm) {
      searchForm.addEventListener('submit', e => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (!query) return;

        // Trigger search event
        this._handleSearch(query);
      });
    }

    if (searchBtn) {
      searchBtn.addEventListener('click', e => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (!query) return;

        // Trigger search event
        this._handleSearch(query);
      });
    }
  }

  _addRecipeManagementListeners() {
    const container = document.querySelector('.meal-planner-container');

    if (container) {
      container.addEventListener('click', e => {
        // Add recipe to meal plan
        const addBtn = e.target.closest('.btn--add-to-plan');
        if (addBtn) {
          e.preventDefault();
          const id = addBtn.dataset.id;
          this._handleAddRecipe(id);
          return;
        }

        // Remove recipe from meal plan
        const removeBtn = e.target.closest('.btn--remove-recipe');
        if (removeBtn) {
          e.preventDefault();
          const id = removeBtn.dataset.id;
          this._handleRemoveRecipe(id);
          return;
        }

        // Remove meal from calendar slot
        const removeMealBtn = e.target.closest('.btn--remove-meal');
        if (removeMealBtn) {
          e.preventDefault();
          const day = removeMealBtn.dataset.day;
          const meal = removeMealBtn.dataset.meal;
          this._handleRemoveMeal(day, meal);
          return;
        }
      });
    }
  }

  _addDragAndDropListeners() {
    const container = document.querySelector('.meal-planner-container');

    if (container) {
      // Drag start
      container.addEventListener('dragstart', e => {
        const recipeCard = e.target.closest('.selected-recipe-card');
        if (recipeCard) {
          e.dataTransfer.setData('text/plain', recipeCard.dataset.id);
          e.dataTransfer.effectAllowed = 'move';
          recipeCard.classList.add('dragging');
        }
      });

      // Drag end
      container.addEventListener('dragend', e => {
        const recipeCard = e.target.closest('.selected-recipe-card');
        if (recipeCard) {
          recipeCard.classList.remove('dragging');
        }

        // Remove all drop zone highlights
        document.querySelectorAll('.meal-slot').forEach(slot => {
          slot.classList.remove('drop-zone-active');
        });
      });

      // Drag over
      container.addEventListener('dragover', e => {
        const mealSlot = e.target.closest('.meal-slot');
        if (mealSlot && !mealSlot.querySelector('.assigned-recipe')) {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';

          // Highlight drop zone
          document.querySelectorAll('.meal-slot').forEach(slot => {
            slot.classList.remove('drop-zone-active');
          });
          mealSlot.classList.add('drop-zone-active');
        }
      });

      // Drag enter
      container.addEventListener('dragenter', e => {
        const mealSlot = e.target.closest('.meal-slot');
        if (mealSlot && !mealSlot.querySelector('.assigned-recipe')) {
          e.preventDefault();
        }
      });

      // Drop
      container.addEventListener('drop', e => {
        const mealSlot = e.target.closest('.meal-slot');
        if (mealSlot && !mealSlot.querySelector('.assigned-recipe')) {
          e.preventDefault();

          const recipeId = e.dataTransfer.getData('text/plain');
          const day = mealSlot.dataset.day;
          const meal = mealSlot.dataset.meal;

          this._handleAssignRecipe(recipeId, day, meal);

          // Remove drop zone highlight
          mealSlot.classList.remove('drop-zone-active');
        }
      });
    }
  }

  _addActionButtonListeners() {
    const saveBtn = document.querySelector('.meal-planner-save');
    const clearBtn = document.querySelector('.meal-planner-clear');

    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this._handleSavePlan();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the entire meal plan?')) {
          this._handleClearPlan();
        }
      });
    }
  }

  // Event handler methods - these will be overridden by the controller
  _handleSearch(query) {
    console.log('Search triggered:', query);
    // This will be overridden by controller
  }

  _handleAddRecipe(id) {
    console.log('Add recipe triggered:', id);
    // This will be overridden by controller
  }

  _handleRemoveRecipe(id) {
    console.log('Remove recipe triggered:', id);
    // This will be overridden by controller
  }

  _handleAssignRecipe(recipeId, day, meal) {
    console.log('Assign recipe triggered:', recipeId, day, meal);
    // This will be overridden by controller
  }

  _handleRemoveMeal(day, meal) {
    console.log('Remove meal triggered:', day, meal);
    // This will be overridden by controller
  }

  _handleSavePlan() {
    console.log('Save plan triggered');
    // This will be overridden by controller
  }

  _handleClearPlan() {
    console.log('Clear plan triggered');
    // This will be overridden by controller
  }

  // Public methods for controller to override event handlers
  addHandlerSearch(handler) {
    this._handleSearch = handler;
  }

  addHandlerAddRecipe(handler) {
    this._handleAddRecipe = handler;
  }

  addHandlerRemoveRecipe(handler) {
    this._handleRemoveRecipe = handler;
  }

  addHandlerAssignRecipe(handler) {
    this._handleAssignRecipe = handler;
  }

  addHandlerRemoveMeal(handler) {
    this._handleRemoveMeal = handler;
  }

  addHandlerSavePlan(handler) {
    this._handleSavePlan = handler;
  }

  addHandlerClearPlan(handler) {
    this._handleClearPlan = handler;
  }

  _closeModal() {
    const overlay = document.querySelector('.meal-planner-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  renderSearchResults(data) {
    const resultsContainer = document.querySelector('.meal-planner-results');
    if (!resultsContainer) return;

    const markup = data
      .map(
        result => `
      <li class="preview">
        <a class="preview__link" href="#${result.id}">
          <figure class="preview__fig">
            <img src="${result.image}" alt="${result.title}" />
          </figure>
          <div class="preview__data">
            <h4 class="preview__title">${result.title}</h4>
            <p class="preview__publisher">${result.publisher}</p>
          </div>
          <button class="btn--tiny btn--add-to-plan" data-id="${result.id}">Add</button>
        </a>
      </li>
    `
      )
      .join('');

    resultsContainer.innerHTML = markup;
  }

  showMessage(message, type = 'success') {
    const existingMessage = document.querySelector('.meal-planner-message');
    if (existingMessage) existingMessage.remove();

    const messageEl = document.createElement('div');
    messageEl.className = `meal-planner-message message ${type}`;
    messageEl.textContent = message;

    const header = document.querySelector('.meal-planner-header');
    if (header) {
      header.appendChild(messageEl);
      setTimeout(() => messageEl.remove(), 3000);
    }
  }

  updateSelectedRecipes(recipes) {
    const container = document.querySelector('.selected-recipes-pool');
    const countEl = document.querySelector('.selected-recipes-section h3');

    if (container) {
      this._data.selectedRecipes = recipes;
      container.innerHTML = this._generateSelectedRecipesMarkup();

      // Re-add drag listeners for new elements
      this._addDragAndDropListeners();
    }

    if (countEl) {
      countEl.textContent = `Selected Recipes (${recipes.length})`;
    }
  }

  updateWeeklyCalendar(weekPlan) {
    const calendar = document.querySelector('.weekly-calendar');
    if (calendar) {
      this._data.weekPlan = weekPlan;
      calendar.innerHTML = this._generateWeeklyCalendarMarkup();
    }
  }

  showLoading() {
    const resultsContainer = document.querySelector('.meal-planner-results');
    if (resultsContainer) {
      resultsContainer.innerHTML = '<div class="spinner"></div>';
    }
  }

  showError(message) {
    const resultsContainer = document.querySelector('.meal-planner-results');
    if (resultsContainer) {
      resultsContainer.innerHTML = `<div class="error"><p>${message}</p></div>`;
    }
  }
}

export default new MealPlannerView();
