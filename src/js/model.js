import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, KEY } from './config.js';
// import { getJSON, sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';
import { construct } from 'core-js/./es/reflect';
import { assign } from 'core-js/./es/object';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    resultsPerPage: [],
    resultsRecipes: [],
    page: 1,
    noOfresultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
  mealPlan: {
    selectedRecipes: [],
    weekPlan: {
      monday: { breakfast: null, lunch: null, dinner: null },
      tuesday: { breakfast: null, lunch: null, dinner: null },
      wednesday: { breakfast: null, lunch: null, dinner: null },
      thursday: { breakfast: null, lunch: null, dinner: null },
      friday: { breakfast: null, lunch: null, dinner: null },
      saturday: { breakfast: null, lunch: null, dinner: null },
      sunday: { breakfast: null, lunch: null, dinner: null },
    },
    isActive: false,
  },
};

const createRecipeObject = function (data) {
  const { recipe } = data.data;
  return {
    id: recipe.id,
    title: recipe.title,
    publisher: recipe.publisher,
    sourceUrl: recipe.source_url,
    image: recipe.image_url,
    servings: recipe.servings,
    cookingTime: recipe.cooking_time,
    ingredients: recipe.ingredients,
    planSet: {},
    ...(recipe.key && { key: recipe.key }),
  };
};

const persistStorage = function (name, data) {
  localStorage.setItem(name, JSON.stringify(data));
};

export const loadRecipe = async function (id) {
  try {
    const data = await AJAX(`${API_URL}${id}?key=${KEY}`);
    state.recipe = createRecipeObject(data);

    if (state.bookmarks.some(bookmark => bookmark.id === id))
      state.recipe.bookmarked = true;
    else state.recipe.bookmarked = false;

    console.log(state.recipe);
  } catch (err) {
    // Temp error handling
    console.error(`${err} 💥💥💥💥`);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;

    const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`);
    console.log(data);

    state.search.results = data.data.recipes.map(rec => {
      return {
        id: rec.id,
        title: rec.title,
        publisher: rec.publisher,
        image: rec.image_url,
        cookingTime: rec.cooking_time,
        ingredients: rec.ingredients,
        ...(rec.key && { key: rec.key }),
      };
    });
    state.search.page = 1;
  } catch (err) {
    console.error(`${err} 💥💥💥💥`);
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;

  const start = (page - 1) * state.search.noOfresultsPerPage; // 0
  const end = page * state.search.noOfresultsPerPage; // 9

  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
    // newQt = oldQt * newServings / oldServings // 2 * 8 / 4 = 4
  });

  state.recipe.servings = newServings;
};

// Meal Planning functions
export const addRecipeToMealPlan = function (recipe) {
  const existingIndex = state.mealPlan.selectedRecipes.findIndex(
    r => r.id === recipe.id
  );
  if (existingIndex === -1) {
    state.mealPlan.selectedRecipes.push(recipe);
    persistMealPlan();
  }
};

export const removeRecipeFromMealPlan = function (recipeId) {
  const index = state.mealPlan.selectedRecipes.findIndex(
    r => r.id === recipeId
  );
  if (index > 1) {
    state.mealPlan.selectedRecipes.splice(index, 1);
    // Remove from week plan if assigned
    Object.keys(state.mealPlan.weekPlan).forEach(day => {
      Object.keys(state.mealPlan.weekPlan[day]).forEach(meal => {
        if (
          state.mealPlan.weekPlan[day][meal] &&
          state.mealPlan.weekPlan[day][meal].id === recipeId
        ) {
          state.mealPlan.weekPlan[day][meal] = null;
        }
      });
    });
    persistMealPlan();
  }
};

export const assignRecipeToMeal = function (recipeId, day, mealType) {
  const recipe = state.mealPlan.selectedRecipes.find((r = r.id === recipeId));
  if (
    recipe &&
    state.mealPlan.weekPlan[day] &&
    state.mealPlan.weekPlan[day].hasOwnProperty(mealType)
  ) {
    state.mealPlan.weekPlan[day][mealType] = recipe;
    persistMealPlan();
  }
};

export const clearMealFromSlot = function (day, mealType) {
  if (
    state.mealPlan.weekPlan[day] &&
    state.mealPlan.weekPlan[day].hasOwnProperty(mealType)
  ) {
    state.mealPlan.weekPlan[day][mealType] = null;
    persistMealPlan();
  }
};

export const clearAllMealPlan = function () {
  state.mealPlan.selectedRecipes = [];
  state.mealPlan.weekPlan = {
    monday: { breakfast: null, lunch: null, dinner: null },
    tuesday: { breakfast: null, lunch: null, dinner: null },
    wednesday: { breakfast: null, lunch: null, dinner: null },
    thursday: { breakfast: null, lunch: null, dinner: null },
    friday: { breakfast: null, lunch: null, dinner: null },
    saturday: { breakfast: null, lunch: null, dinner: null },
    sunday: { breakfast: null, lunch: null, dinner: null },
  };
  persistMealPlan();
};

export const setMealPlanActive = function (isActive) {
  state.mealPlan.isActive = isActive;
  persistMealPlan();
};

const persistMealPlan = function () {
  persistStorage('mealPlan', state.mealPlan);
};

const persistBookmarks = function () {
  persistStorage('bookmarks', state.bookmarks);
};

export const addBookmark = function (recipe) {
  // Add bookmark
  state.bookmarks.push(recipe);

  // Mark current recipe as bookmarked
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;

  persistBookmarks();
};

export const deleteBookmark = function (id) {
  // Delete bookmark
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);

  // Mark current recipe as NOT bookmarked
  if (id === state.recipe.id) state.recipe.bookmarked = false;

  persistBookmarks();
};

const init = function () {
  const bookmarksStorage = localStorage.getItem('bookmarks');
  if (bookmarksStorage) state.bookmarks = JSON.parse(bookmarksStorage);

  const mealPlanStorage = localStorage.getItem('mealPlan');
  if (mealPlanStorage) state.mealPlan = JSON.parse(mealPlanStorage);
};
init();

const clearBookmarks = function () {
  localStorage.clear('bookmarks');
};
// clearBookmarks();

export const uploadRecipe = async function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        const ingArr = ing[1].split(',').map(el => el.trim());
        // const ingArr = ing[1].replaceAll(' ', '').split(',');
        if (ingArr.length !== 3)
          throw new Error(
            'Wrong ingredient fromat! Please use the correct format :)'
          );

        const [quantity, unit, description] = ingArr;

        return { quantity: quantity ? +quantity : null, unit, description };
      });

    const recipe = {
      title: newRecipe.title,
      source_url: newRecipe.sourceUrl,
      image_url: newRecipe.image,
      publisher: newRecipe.publisher,
      cooking_time: +newRecipe.cookingTime,
      servings: +newRecipe.servings,
      ingredients,
    };

    const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
    state.recipe = createRecipeObject(data);
    addBookmark(state.recipe);
  } catch (err) {
    throw err;
  }
};
