// views/shoppingListView.js
import View from './View.js';
import icons from '../../img/icons.svg';

class ShoppingListView extends View {
  _parentElement = document.querySelector('.shopping');
  _errorMessage = 'No shopping list items found!';
  _message = '';

  addHandlerRender(handler) {
    window.addEventListener('load', handler);
  }

  addHandlerDeleteItem(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.shopping__delete');
      if (!btn) return;

      const id = btn.closest('.shopping__item').dataset.itemid;
      handler(id);
    });
  }

  addHandlerUpdateItem(handler) {
    this._parentElement.addEventListener('change', function (e) {
      if (!e.target.matches('.shopping__count-value')) return;

      const id = e.target.closest('.shopping__item').dataset.itemid;
      const newQuantity = +e.target.value;
      handler(id, newQuantity);
    });
  }

  addHandlerToggleItem(handler) {
    this._parentElement.addEventListener('change', function (e) {
      if (!e.target.matches('.shopping__checkbox')) return;

      const id = e.target.closest('.shopping__item').dataset.itemid;
      handler(id);
    });
  }

  addHandlerClearList(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.shopping__clear');
      if (!btn) return;

      handler();
    });
  }

  renderMessage(message = this._message) {
    const markup = `
      <div class="message">
        <div>
          <svg>
            <use href="${icons}#icon-smile"></use>
          </svg>
        </div>
        <p>${message}</p>
      </div>
    `;

    this._clear();
    this._parentElement.insertAdjacentHTML('afterbegin', markup);

    // Auto-hide message after 3 seconds
    setTimeout(() => {
      this.render(this._data);
    }, 3000);
  }

  _generateMarkup() {
    if (this._data.length === 0) {
      return this._generateEmptyMessage();
    }

    return `
      <div class="shopping__header">
        <h2 class="heading--2">Shopping List</h2>
        <button class="btn--small shopping__clear">
          <svg class="search__icon">
            <use href="${icons}#icon-delete"></use>
          </svg>
          Clear all
        </button>
      </div>
      <ul class="shopping__list">
        ${this._data.map(this._generateMarkupItem).join('')}
      </ul>
    `;
  }

  _generateMarkupItem(item) {
    return `
      <li class="shopping__item" data-itemid="${item.id}">
        <div class="shopping__count">
          <input type="checkbox" class="shopping__checkbox" ${
            item.checked ? 'checked' : ''
          }>
          <input 
            type="number" 
            value="${item.quantity}" 
            step="0.1" 
            class="shopping__count-value"
            ${item.checked ? 'disabled' : ''}
          >
          <p>${item.unit}</p>
        </div>
        <p class="shopping__description ${
          item.checked ? 'shopping__description--checked' : ''
        }">${item.description}</p>
        <button class="shopping__delete btn--tiny">
          <svg>
            <use href="${icons}#icon-circle-with-cross"></use>
          </svg>
        </button>
      </li>
    `;
  }

  _generateEmptyMessage() {
    return `
      <div class="shopping__header">
        <h2 class="heading--2">Shopping List</h2>
      </div>
      <div class="message">
        <div>
          <svg>
            <use href="${icons}#icon-smile"></use>
          </svg>
        </div>
        <p>No ingredients added to shopping list yet. Add some from your favorite recipes!</p>
      </div>
    `;
  }
}

export default new ShoppingListView();
