export class Cart {
  
  constructor(items=[]) {
    this.items = items;
  }

  addItem(product) {

    let existing = this.items.find(item => item.id == product.id);

    if(existing) {
      this.updateQuantity(product.id)
    } else{
      this.items.push(
        {
          id: product.id,
          title: product.title,
          price: product.price,
          thumbnail: product.thumbnail,
          quantity: 1
        }
      );
    }
  }

  removeItem(id) {
    
    this.items = this.items.filter(item => item.id != id);

    localStorage.setItem("userCart", JSON.stringify(this.items))
    
  }

  updateQuantity(id, mode = 'increment') {
    
    let existing = this.items.find(item => item.id == id);
    
    if (existing.quantity == 1 && mode == 'decrement' ) {

      this.removeItem(id)
      
    } else if (mode == 'decrement') {

      existing.quantity--;
      
    } else {
      
      existing.quantity++;
    }
      
    localStorage.setItem("userCart", JSON.stringify(this.items));
  }

  getTotal() {
    
    return this.items.reduce((a, b) => a + (b.quantity * b.price), 0)
    
  }

  getItemCount() {
    return this.items.length;
  }
}


export function handleCart() {
    let testCart = new Cart(JSON.parse(localStorage.getItem("userCart")))

    window.testCart = testCart;
    
    
    const emptyCartContainer = document.getElementById("emptyCart_container");
    const cartItemsContainer = document.getElementById("cart_items_container");
    const itemsContainer = document.getElementById("items_card_container");
    const cartsNumber = document.getElementById("cart_items_num");
    const subtotal = document.getElementById("subtotal");
    
    
    function createItemCard(item) {
      let html = `
      <div class="item_card">
          <img src=${item.thumbnail} alt="">
          <div class="item_detail">
              <p class="item_title"><strong>${item.title}</strong></p>
              <p class="item_price">N ${item.price} each</p>
              <div class="item_total">Total: N ${(item.price * item.quantity).toFixed(2)}</div>
    
              <div class="item_btn_control">
                  <div class="qty_control_btn">
                      <button class="btn" id="decrement" onclick="testCart.updateQuantity('${item.id}', 'decrement')">-</button>
                      <p>${item.quantity}</p>
                      <button class="btn" id="increment" onclick="testCart.updateQuantity('${item.id}')">+</button>
                  </div>
                  <button class="btn" id="remove" onclick="testCart.removeItem('${item.id}')">Remove</button>
              </div>
          </div>
      </div>`;
    
      return html;
    }
    
    function renderItems(cartInstance) {
      let html = cartInstance.items.map(item => createItemCard(item)).join("");
    
      itemsContainer.innerHTML = html;
    
      cartsNumber.textContent = `${cartInstance.getItemCount()} items ready for you.`;
      subtotal.textContent = `N${cartInstance.getTotal().toFixed(2)}`;
    
      document.getElementById('badge').textContent = `${cartInstance.getItemCount()}`
    };


    
    if (testCart.items.length == 0) {
      
      emptyCartContainer.classList.remove("hidden");
      cartItemsContainer.classList.add("hidden");
      
    } else {
      
      emptyCartContainer.classList.add("hidden");
      cartItemsContainer.classList.remove("hidden");
    
      renderItems(testCart)
    };

    
    window.addEventListener("click", e => {
    
      let clicked = e.target.closest(".btn");
    
      if (clicked) {

        renderItems(testCart);
      }
    });


    document.getElementById("cont_to_checkout").addEventListener('click', () => {

        document.getElementById("checkout_a_tag").click();
      
    });


}

