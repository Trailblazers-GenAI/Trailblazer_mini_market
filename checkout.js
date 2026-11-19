export function handleCheckout() {



    //Task Objectives
    // 1 Retrieve the customer's cart from localStorage.
    //2 Display the cart items and calculate the total.
    //3 Validate the customer's information.
    //4 Create an order object.
    //5 Save the order and move the customer to the summary page. 


    
    const CART_KEY = "minimarket_cart";
    const ORDER_KEY = "minimarket_latest_order";
    function readCart() {
      try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
      } catch {
        return [];
      }
    }
    function saveCart(items) {
      localStorage.setItem(CART_KEY, JSON.stringify(items));
      updateBadge();
    }
    function updateBadge() {
      const badge = document.getElementById("badge");
      if (badge)
        badge.textContent = readCart().reduce(
          (sum, item) => sum + item.quantity,
          0,
        );
    }
    // function money(value) {
    //   return "$" + Number(value).toFixed(2);
    // }
    
    function money(value) {
      return (
        "₦" +
        Number(value).toLocaleString("en-NG", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    }
    
    updateBadge();
    
    const form = document.getElementById("checkout-form"),
      cart = readCart();
    const checkoutItems = document.getElementById("checkout-items");
    if (cart.length === 0) {
      checkoutItems.innerHTML =
        '<p class="muted">Your cart is empty. <a href="products.html">Browse products</a>.</p>';
      form.querySelector('button[type="submit"]').disabled = true;
      form.querySelector('button[type="submit"]').style.opacity = ".5";
    } else {
      checkoutItems.innerHTML = cart
        .map(
          (item) =>
            `<p>${item.title} × ${item.quantity} — <strong>${money(item.price * item.quantity)}</strong></p>`,
        )
        .join("");
    }
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.getElementById("checkout-total").textContent = money(total);
    function showError(field, message) {
      document.getElementById(field + "-error").textContent = message;
      document.getElementById(field).classList.toggle("invalid", Boolean(message));
    }

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      alert("Hi")
      let valid = true;
      const name = document.getElementById("name").value.trim(),
        email = document.getElementById("email").value.trim(),
        phone = document.getElementById("phone").value.trim(),
        address = document.getElementById("address").value.trim();
      const checks = {
        name:
          name.length >= 2
            ? ""
            : "Please enter your full name (at least 2 characters).",
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          ? ""
          : "Enter a valid email address.",
        phone: /^\d{10,15}$/.test(phone) ? "" : "Use numbers only (10–15 digits).",
        address:
          address.length >= 8 ? "" : "Please enter a complete delivery address.",
      };

      Object.entries(checks).forEach(([field, message]) => {
        showError(field, message);
        if (message) valid = false;
      });

      if (cart.length === 0) {
        document.getElementById("form-message").textContent =
          "Your cart is empty. Add products before placing an order.";
        return;
      }
      if (!valid) return;
      const order = {
        orderId: "ORD-" + Date.now().toString().slice(-8),
        customer: { name, email, phone, address },
        items: cart,
        total,
        date: new Date().toISOString()
      };
      localStorage.setItem(ORDER_KEY, JSON.stringify(order));
      window.location.href = "summary.html";

    //   return order;
    });
}
