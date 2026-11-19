
/**
 * Mini Marketplace — Member 4: Application Integration
 *
 * Owns page navigation and persistence. Member 1's product cache is separate:
 *   miniMarketplaceCart        — current cart items
 *   miniMarketplaceLatestOrder — most recently placed order
 *
 * Required page sections: #products-page, #cart-page, #checkout-page,
 * #summary-page. Navigation links use data-page="products|cart|checkout|summary".
 * See each feature module for its required child element IDs.
 *
 * Load from index.html with: <script type="module" src="./main.js"></script>
 */

import { initProducts } from './js/products.js';
import { Cart, initCartUI } from './cart.js';
import { initCheckout } from './checkout.js';
import { initSummary } from './summary.js';

const CART_STORAGE_KEY = 'miniMarketplaceCart';
const ORDER_STORAGE_KEY = 'miniMarketplaceLatestOrder';
const PAGE_NAMES = ['products', 'cart', 'checkout', 'summary'];

function readStoredJSON(key) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? null : JSON.parse(value);
  } catch (error) {
    console.warn(`Could not read ${key} from localStorage.`, error);
    return null;
  }
}

function writeStoredJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Could not save ${key} to localStorage.`, error);
    return false;
  }
}

function restoreCart() {
  const savedItems = readStoredJSON(CART_STORAGE_KEY);
  try {
    return new Cart(Array.isArray(savedItems) ? savedItems : []);
  } catch (error) {
    console.warn('Saved cart could not be restored.', error);
    return new Cart();
  }
}

async function startApp() {
  const pages = Object.fromEntries(PAGE_NAMES.map((name) => [
    name, document.getElementById(`${name}-page`),
  ]));
  const missing = PAGE_NAMES.filter((name) => !pages[name]);
  if (missing.length) {
    throw new Error(`Missing page sections: ${missing.map((name) => `#${name}-page`).join(', ')}`);
  }

  const cart = restoreCart();
  let latestOrder = readStoredJSON(ORDER_STORAGE_KEY);
  let productsAPI = null;
  let currentPage = 'products';

  function saveCart() {
    writeStoredJSON(CART_STORAGE_KEY, cart.getItems());
  }

  function showPage(pageName) {
    if (!PAGE_NAMES.includes(pageName)) return false;

    if (pageName === 'checkout' && cart.getItemCount() === 0) {
      pageName = 'cart';
    }
    if (pageName === 'summary') {
      // render() validates the saved order and returns false if invalid.
      if (!latestOrder || !summaryUI.render(latestOrder)) {
        pageName = 'products';
      }
    }

    PAGE_NAMES.forEach((name) => {
      pages[name].hidden = name !== pageName;
    });
    document.querySelectorAll('[data-page]').forEach((link) => {
      const isActive = link.dataset.page === pageName;
      if (isActive) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });

    currentPage = pageName;
    if (pageName === 'cart') cartUI.render();
    if (pageName === 'checkout') checkoutUI.refresh();
    window.scrollTo({ top: 0, behavior: 'instant' });
    return true;
  }

  const cartUI = initCartUI(cart, {
    onChange: () => {
      saveCart();
      if (currentPage === 'checkout') checkoutUI.refresh();
    },
    onCheckout: () => showPage('checkout'),
    getProductById: (id) => productsAPI?.getProducts().find(
      (product) => String(product.id) === String(id)
    ) ?? null,
  });

  const checkoutUI = initCheckout(cart, {
    onOrder: (order) => {
      // Persist the latest completed order before showing confirmation.
      latestOrder = order;
      writeStoredJSON(ORDER_STORAGE_KEY, order);
      showPage('summary');
    },
  });

  const summaryUI = initSummary({
    onContinueShopping: () => {
      cart.clear();
      saveCart();
      cartUI.render();
      checkoutUI.reset();
      summaryUI.clear();
      // Retain the latest order in storage for later reference.
      showPage('products');
    },
  });

  document.querySelectorAll('[data-page]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      showPage(link.dataset.page);
    });
  });

  // Start on Products. The product fetch is asynchronous, so the cart,
  // checkout, and navigation are already functional while products load.
  showPage('products');
  try {
    productsAPI = await initProducts((product) => {
      cart.addItem(product);
      saveCart();
      cartUI.render();
    });
    cartUI.render(); // Product thumbnails can now be resolved in the cart.
  } catch (error) {
    console.error('Products could not be initialized.', error);
    const grid = document.getElementById('products-grid');
    if (grid) {
      const message = document.createElement('p');
      message.className = 'products-message products-message--error';
      message.textContent = 'Products are unavailable right now. Please refresh and try again.';
      grid.replaceChildren(message);
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    startApp().catch((error) => console.error('Application failed to start.', error));
  }, { once: true });
} else {
  startApp().catch((error) => console.error('Application failed to start.', error));
}
