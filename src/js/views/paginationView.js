import View from './View.js';
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
  _parentElement = document.querySelector('.pagination');

  addHandlerClick(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--inline');
      if (!btn) return;
      const goToPage = +btn.dataset.goto;
      handler(goToPage);
    });
  }

  _createPrevButton(curPage = 1) {
    return `
      <button data-goto="${
        curPage - 1
      }" class="btn--inline pagination__btn--prev">
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-left"></use>
        </svg>
        <span>${curPage - 1}</span>
      </button>
    `;
  }

  _createNextButton(curPage = 1) {
    return `
      <button data-goto="${
        curPage + 1
      }" class="btn--inline pagination__btn--next">
        <span>${curPage + 1}</span>
        <svg class="search__icon">
          <use href="${icons}#icon-arrow-right"></use>
        </svg>
      </button>
    `;
  }

  _createPagesInfo(curPage, numPages) {
    return `
      <div class="pagination__info">
        Page ${curPage} of ${numPages}
      </div>
    `;
  }

  _generateMarkup() {
    const curPage = this._data.page;
    const numPages = Math.ceil(this._data.results.length / 10);

    // Only one page
    if (numPages <= 1) return '';

    // First page (has next)
    if (curPage === 1 && numPages > 1) {
      return `${this._createNextButton(curPage)}${this._createPagesInfo(
        curPage,
        numPages
      )}`;
    }

    // Last page (has prev)
    if (curPage === numPages && numPages > 1) {
      return `${this._createPrevButton(curPage)}${this._createPagesInfo(
        curPage,
        numPages
      )}`;
    }

    // Middle pages (has both)
    if (curPage < numPages) {
      return `${this._createPrevButton(curPage)}${this._createPagesInfo(
        curPage,
        numPages
      )}${this._createNextButton(curPage)}`;
    }
  }
}

export default new PaginationView();
