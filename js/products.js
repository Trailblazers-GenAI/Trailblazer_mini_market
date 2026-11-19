// --------------------------------------------------
// 1. CONFIGURATION
// --------------------------------------------------

const PRODUCTS_URL =
  'https://dummyjson.com/products?limit=20';

const CATEGORIES_URL =
  'https://dummyjson.com/products/category-list';

const BACKUP_URL = './products.json';

const STORAGE_KEY = 'miniMarketplaceProducts';


// --------------------------------------------------
// 2. PRICE FORMATTING
// --------------------------------------------------

const formatPrice = (price) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);


// --------------------------------------------------
// 3. PRODUCT DATA NORMALIZATION
// --------------------------------------------------

function normalizeProducts(data) {
  const items = Array.isArray(data)
    ? data
    : data?.products;

  if (!Array.isArray(items)) {
    throw new Error(
      'The product data is not in the expected format.'
    );
  }

  return items
    .filter((item) =>
      item &&
      (typeof item.id === 'number' ||
        typeof item.id === 'string') &&
      typeof item.title === 'string' &&
      Number.isFinite(item.price)
    )
    .map((item) => ({
      id: item.id,
      title: item.title,
      price: item.price,
      category:
        typeof item.category === 'string'
          ? item.category
          : 'other',
      thumbnail:
        typeof item.thumbnail === 'string'
          ? item.thumbnail
          : '',
      stock:
        Number.isFinite(item.stock)
          ? item.stock
          : 0,
    }));
}


// --------------------------------------------------
// 4. FETCH JSON DATA
// --------------------------------------------------

async function fetchJSON(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Request failed (HTTP ${response.status}).`
    );
  }

  return response.json();
}


// --------------------------------------------------
// 5. LOCAL STORAGE HELPERS
// --------------------------------------------------


// Save validated products to localStorage.

// Storage failures should not prevent products
// from displaying successfully.


function saveProducts(products) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(products)
    );
  } catch {
    // Storage may be disabled, full, or unavailable.
    // The application can still use fetched products.
  }
}



// Retrieve previously cached products.

//Cached data is normalized again to ensure
//that it follows the agreed product structure.

//Returns null when no valid cache exists.

function getSavedProducts() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return null;
    }

    const products = normalizeProducts(
      JSON.parse(saved)
    );

    return products.length > 0
      ? products
      : null;
  } catch {
    // Missing, corrupted, or inaccessible storage.
    return null;
  }
}


// --------------------------------------------------
// 6. DOM ELEMENT HELPER
// --------------------------------------------------

function createElement(tag, className, text) {
  const element = document.createElement(tag);

  if (className) {
    element.className = className;
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  return element;
}


// --------------------------------------------------
// 7. CREATE PRODUCT CARDS
// --------------------------------------------------

function createProductCard(product, onAddToCart) {
  const card = createElement(
    'article',
    'product-card'
  );

  const imageWrap = createElement(
    'div',
    'product-card__image-wrap'
  );

  const image = createElement(
    'img',
    'product-card__image'
  );

  image.src = product.thumbnail || '';
  image.alt = product.title;
  image.loading = 'lazy';
  image.decoding = 'async';

  imageWrap.append(image);

  const title = createElement(
    'h3',
    'product-card__title',
    product.title
  );

  const price = createElement(
    'p',
    'product-card__price',
    formatPrice(product.price)
  );

  const isAvailable = product.stock > 0;

  const button = createElement(
    'button',
    'product-card__button',
    isAvailable
      ? '+ Add to Cart'
      : 'Out of Stock'
  );

  button.type = 'button';
  button.disabled = !isAvailable;

  button.setAttribute(
    'aria-label',
    isAvailable
      ? `Add ${product.title} to cart`
      : `${product.title} is out of stock`
  );

  button.addEventListener('click', () => {
    onAddToCart({ ...product });
  });

  card.append(
    imageWrap,
    title,
    price,
    button
  );

  return card;
}


// --------------------------------------------------
// 8. INITIALIZE PRODUCTS FEATURE
// --------------------------------------------------


// Initialize the products feature.

// Call this function once after the HTML
// document has finished loading.

export async function initProducts(onAddToCart) {
  if (typeof onAddToCart !== 'function') {
    throw new TypeError(
      'initProducts requires an onAddToCart callback.'
    );
  }

  // ----------------------------------------------
  // 8.1 GET REQUIRED HTML ELEMENTS
  // ----------------------------------------------

  const searchInput =
    document.getElementById('search');

  const categorySelect =
    document.getElementById('category-filter');

  const grid =
    document.getElementById('products-grid');

  if (!searchInput || !categorySelect || !grid) {
    throw new Error(
      'Products UI is missing #search, ' +
      '#category-filter, or #products-grid.'
    );
  }

  // Optional product count element.
  const count =
    document.getElementById('products-count');

  let products = [];
  let categories = [];


  // ----------------------------------------------
  // 8.2 DISPLAY STATUS MESSAGES
  // ----------------------------------------------

  function showMessage(
    message,
    className = 'products-message'
  ) {
    grid.replaceChildren(
      createElement('p', className, message)
    );

    if (count) {
      count.textContent = '';
    }
  }


  // ----------------------------------------------
  // 8.3 RENDER FILTERED PRODUCTS
  // ----------------------------------------------

  function renderProducts() {
    const query = searchInput.value
      .trim()
      .toLowerCase();

    const category = categorySelect.value;

    const visibleProducts = products.filter(
      (product) =>
        product.title
          .toLowerCase()
          .includes(query) &&
        (
          category === 'all' ||
          product.category === category
        )
    );

    const cards = visibleProducts.map(
      (product) =>
        createProductCard(
          product,
          onAddToCart
        )
    );

    if (cards.length === 0) {
      showMessage(
        'No products found. Try another search or category.'
      );
    } else {
      grid.replaceChildren(...cards);
    }

    if (count) {
      count.textContent =
        `Showing ${visibleProducts.length} ` +
        `of ${products.length} products`;
    }
  }


  // ----------------------------------------------
  // 8.4 RENDER CATEGORY OPTIONS
  // ----------------------------------------------

  function renderCategories() {
    const options = ['all', ...categories].map(
      (category) => {
        const label =
          category === 'all'
            ? 'All categories'
            : category.replace(/-/g, ' ');

        return new Option(label, category);
      }
    );

    categorySelect.replaceChildren(...options);
  }


  // ----------------------------------------------
  // 8.5 REGISTER EVENT LISTENERS
  // ----------------------------------------------

  searchInput.addEventListener(
    'input',
    renderProducts
  );

  categorySelect.addEventListener(
    'change',
    renderProducts
  );


  // ----------------------------------------------
  // 8.6 MANAGE FALLBACK NOTICES
  // ----------------------------------------------

  function removeNotices() {
    const notices =
      grid.parentElement.querySelectorAll(
        '.products-notice'
      );

    notices.forEach((notice) => {
      notice.remove();
    });
  }


  function showNotice(message) {
    removeNotices();

    const notice = createElement(
      'p',
      'products-notice',
      message
    );

    grid.before(notice);
  }


  // ----------------------------------------------
  // 8.7 LOAD PRODUCTS
  // ----------------------------------------------

  
  // Product loading priority:
  
  // 1. DummyJSON API
  // 2. localStorage cache
  // 3. Local products.json backup
  
  // A successful API response updates the cache.
  
  // Cached and backup products are displayed
  // when the live API is unavailable.
  

  async function reload() {
    showMessage('Loading products…');

    removeNotices();

    categorySelect.disabled = true;
    searchInput.disabled = true;

    try {
      let loadedProducts = [];
      let dataSource = 'api';

      // ------------------------------------------
      // FIRST: FETCH FROM LIVE API
      // ------------------------------------------

      try {
        const apiData =
          await fetchJSON(PRODUCTS_URL);

        loadedProducts =
          normalizeProducts(apiData);

        if (loadedProducts.length === 0) {
          throw new Error(
            'No valid products received from API.'
          );
        }

        // Cache successfully fetched products.
        saveProducts(loadedProducts);

      } catch {
        // ----------------------------------------
        // SECOND: CHECK LOCAL STORAGE
        // ----------------------------------------

        const cachedProducts =
          getSavedProducts();

        if (cachedProducts) {
          loadedProducts = cachedProducts;
          dataSource = 'cache';

        } else {
          // --------------------------------------
          // THIRD: FETCH LOCAL JSON BACKUP
          // --------------------------------------

          const backupData =
            await fetchJSON(BACKUP_URL);

          loadedProducts =
            normalizeProducts(backupData);

          if (loadedProducts.length === 0) {
            throw new Error(
              'No valid products found in backup.'
            );
          }

          dataSource = 'backup';
        }
      }

      // ------------------------------------------
      // UPDATE PRODUCT DATA
      // ------------------------------------------

      products = loadedProducts;

      // ------------------------------------------
      // LOAD CATEGORIES
      // ------------------------------------------

      const loadedCategories = [
        ...new Set(
          products.map(
            (product) => product.category
          )
        ),
      ];

      if (dataSource === 'api') {
        try {
          const apiCategories =
            await fetchJSON(CATEGORIES_URL);

          if (Array.isArray(apiCategories)) {
            const available =
              new Set(loadedCategories);

            categories = apiCategories.filter(
              (category) =>
                available.has(category)
            );

            // Include categories not returned
            // by the category endpoint.
            categories.push(
              ...loadedCategories.filter(
                (category) =>
                  !categories.includes(category)
              )
            );

          } else {
            categories = loadedCategories;
          }

        } catch {
          // Product categories are sufficient
          // when the category endpoint fails.
          categories = loadedCategories;
        }

      } else {
        // Avoid unnecessary API requests when
        // using cached or backup products.
        categories = loadedCategories;
      }

      // ------------------------------------------
      // DISPLAY PRODUCTS
      // ------------------------------------------

      renderCategories();
      renderProducts();

      // ------------------------------------------
      // DISPLAY FALLBACK NOTICES
      // ------------------------------------------

      if (dataSource === 'cache') {
        showNotice(
          'Live products are temporarily unavailable. ' +
          'Showing previously saved products.'
        );

      } else if (dataSource === 'backup') {
        showNotice(
          'Live products are temporarily unavailable. ' +
          'Showing local backup products.'
        );

      } else {
        removeNotices();
      }

    } catch {
      // ------------------------------------------
      // ALL THREE SOURCES FAILED
      // ------------------------------------------

      products = [];
      categories = [];

      renderCategories();

      showMessage(
        'Sorry, we could not load products. ' +
        'Please try again later.',
        'products-message products-message--error'
      );

    } finally {
      // ------------------------------------------
      // RESTORE SEARCH AND CATEGORY CONTROLS
      // ------------------------------------------

      categorySelect.disabled = false;
      searchInput.disabled = false;
    }
  }


  // ----------------------------------------------
  // 8.8 INITIAL PRODUCT LOAD
  // ----------------------------------------------

  await reload();


  // ----------------------------------------------
  // 8.9 PUBLIC MODULE API
  // ----------------------------------------------

  return {
    reload,

    getProducts: () =>
      products.map(
        (product) => ({ ...product })
      ),
  };
}
