import View from './View.js';
import icons from 'url:../../img/icons.svg';

class AddRecipeView extends View {
  _parentElement = document.querySelector('.upload');
  _errorMessage = 'We could not upload your recipe. Please try again!';
  _message = 'Recipe was successfully uploaded!';

  _window = document.querySelector('.add-recipe-window');
  _overlay = document.querySelector('.overlay');
  _btnOpen = document.querySelector('.nav__btn--add-recipe');
  _btnClose = document.querySelector('.btn--close-modal');

  constructor() {
    super();
    this.addHandlerShowWindow();
    this.addHandlerHideWindow();
  }

  toggleWindow() {
    this._overlay.classList.toggle('hidden');
    this._window.classList.toggle('hidden');
  }

  addHandlerShowWindow() {
    this._btnOpen.addEventListener('click', this.toggleWindow.bind(this));
  }

  addHandlerHideWindow() {
    this._btnClose.addEventListener('click', this.toggleWindow.bind(this));
    this._overlay.addEventListener('click', this.toggleWindow.bind(this));
  }

  validateIngredients() {
    let isValid = true;
    const ingredients = this._parentElement.querySelectorAll(
      'input[name^="ingredient"]'
    );
    ingredients.forEach(ing => {
      const value = ing.value;
      const ingArr = value.split(',').map(el => el.trim());
      const errorElement = ing.nextElementSibling;
      if (
        errorElement &&
        errorElement.classList.contains('upload__ingredient-error')
      ) {
        errorElement.remove();
      }
      ing.classList.remove('invalid');

      if (value === '') return;

      if (ingArr.length !== 3) {
        isValid = false;
        ing.classList.add('invalid');
        ing.insertAdjacentHTML(
          'afterend',
          '<p class="upload__ingredient-error">Wrong format! Please use Quantity,Unit,Description.</p>'
        );
      }
    });
    return isValid;
  }

  addHandlerUpload(handler) {
    this._parentElement.addEventListener(
      'submit',
      function (e) {
        e.preventDefault();
        if (!this.validateIngredients()) return;
        const dataArr = [...new FormData(this)];
        const data = Object.fromEntries(dataArr);
        handler(data);
      }.bind(this)
    );
  }

  _generateMarkup() {}
}

export default new AddRecipeView();
