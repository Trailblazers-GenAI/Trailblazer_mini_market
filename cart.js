// cart.js — Member 2: Shopping Cart

export class Cart {
    constructor(savedItems = []) {
        this.items = savedItems;
    }

    // Accepts a full product object { id, title, price, thumbnail, ... }
    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);

        if (existingItem) {
            this.updateQuantity(product.id, existingItem.quantity + 1);
            return;
        }

        // Matches agreed Cart item object shape + thumbnail for UI display
        this.items.push({
            id: product.id,
            title: product.title,
            price: product.price,
            thumbnail: product.thumbnail || "images/product.jpg",
            quantity: 1
        });
    }

    removeItem(id) {
        this.items = this.items.filter(item => item.id !== Number(id));
    }

    updateQuantity(id, newQuantity) {
        const numericId = Number(id);
        if (newQuantity <= 0) {
            this.removeItem(numericId);
            return;
        }

        const item = this.items.find(item => item.id === numericId);
        if (item) {
            item.quantity = newQuantity;
        }
    }

    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    clear() {
        this.items = [];
    }
}

export function initCartUI(cart, { onCartChange, onCheckoutClick, onBrowseClick } = {}) {
    const productSelectedSection = document.getElementById("product-selected");
    const emptyCartSection = document.getElementById("empty-cart-section");
    const cardContainer = document.getElementById("card-container");
    const itemMessage = document.getElementById("item-msg");
    const totalPrice = document.getElementById("total-price");
    const cartBadge = document.getElementById("badge");
    const checkoutBtn = document.getElementById("Checkout-btn");
    const browseBtn = document.getElementById("browse-btn");

    function renderCart() {
        const totalItems = cart.getItemCount();

        // 1. Update header cart badge
        if (cartBadge) {
            cartBadge.textContent = totalItems;
        }

        // 2. Notify main.js so Member 4 can save cart.items to localStorage
        if (typeof onCartChange === "function") {
            onCartChange(cart.items);
        }

        // 3. Toggle "Your cart is empty" vs active cart panel
        if (totalItems === 0) {
            productSelectedSection.classList.add("hidden");
            emptyCartSection.classList.remove("hidden");
            return;
        }

        productSelectedSection.classList.remove("hidden");
        emptyCartSection.classList.add("hidden");

        // 4. Update summary text and subtotal
        itemMessage.textContent = `${totalItems} ${totalItems === 1 ? "item" : "items"} ready for you`;
        totalPrice.textContent = `$${cart.getTotal().toFixed(2)}`;

        // 5. Render each item with line total, quantity controls, and Remove button
        cardContainer.innerHTML = cart.items.map(item => {
            const lineTotal = (item.price * item.quantity).toFixed(2);
            return `
                <div class="product-card" data-id="${item.id}">
                    <img src="${item.thumbnail}" alt="${item.title}">
                    <div class="product-info">
                        <div class="product">
                            <p class="product-name">${item.title}</p>
                            <p class="total-priceProduct">$${lineTotal}</p>
                        </div>
                        <p class="product-price">$${item.price.toFixed(2)} each</p>
                        <div class="qty-btn">
                            <div class="quantity_change">
                                <button type="button" class="subtract" data-id="${item.id}" aria-label="Decrease quantity">-</button>
                                <p class="quantity">${item.quantity}</p>
                                <button type="button" class="add" data-id="${item.id}" aria-label="Increase quantity">+</button>
                            </div>
                            <button type="button" class="remove-btn" data-id="${item.id}">Remove</button>
                        </div>
                    </div>
                </div>
            `;
        }).join("");
    }

    // Handle +, -, and Remove clicks using event delegation
    cardContainer.addEventListener("click", (e) => {
        const id = Number(e.target.dataset.id);
        if (!id) return;

        const currentItem = cart.items.find(item => item.id === id);
        if (!currentItem) return;

        if (e.target.classList.contains("add")) {
            cart.updateQuantity(id, currentItem.quantity + 1);
            renderCart();
        } else if (e.target.classList.contains("subtract")) {
            cart.updateQuantity(id, currentItem.quantity - 1);
            renderCart();
        } else if (e.target.classList.contains("remove-btn")) {
            cart.removeItem(id);
            renderCart();
        }
    });

    // Navigate to Checkout section (Member 3)
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            if (cart.getItemCount() > 0 && typeof onCheckoutClick === "function") {
                onCheckoutClick();
            }
        });
    }

    // Navigate back to Products section (Member 1)
    if (browseBtn) {
        browseBtn.addEventListener("click", (e) => {
            e.preventDefault();
            if (typeof onBrowseClick === "function") {
                onBrowseClick();
            }
        });
    }

    renderCart();

    // Return renderCart so main.js can trigger UI refresh when Member 1 adds a product
    return { renderCart };
}
