export function handleProduct(Cart) {
  
  let globalproducts;
  let userCart = new Cart();
  const search = document.getElementById("search");
  const select = document.getElementById("category");
  const products_container = document.getElementById("products_container");
  
  async function fetchProducts() {
  
    products_container.innerHTML = `<div class= "loading">Loading products.......</div>`
    const response = await fetch("https://dummyjson.com/products?limit=20");
  
    const data = await response.json();
  
    const products = await data.products;
    
    return products;
  };

  function addToCart(itemId) {
    
    let clickedItem = globalproducts.find(product => product.id == itemId);

    userCart.addItem(clickedItem);

    localStorage.setItem("userCart", JSON.stringify(userCart.items));

    document.getElementById('badge').textContent = `${userCart.getItemCount()}`

  }

  window.addToCart = addToCart;
  
  function createProductCard(product) {
     let html = `<div class="product_card">
                      <img src="${product.thumbnail}" alt="">
                      <div class="product_details">
                          <p class="product_name">${product.title}</p>
                          <p class="product_price">$${product.price}</p>
                      </div>
  
                      <button id="add_to_Cart" onclick="addToCart('${product.id}')">+ Add to Cart</button>
                  </div>`;
  
    return html;
  };
  
  function displayProducts(products) {
    if (products.length == 0) {
      
      products_container.innerHTML = `<div class="not_found">No Product Found<\div>`
      document.getElementById("showing_length").textContent = `showing ${products.length} of ${globalproducts.length} products`
      
    } else {
  
      let html = products.map(product => createProductCard(product)).join("");
  
        products_container.innerHTML = html;
      document.getElementById("showing_length").textContent = `showing ${products_container.childElementCount} of ${globalproducts.length} products`
      
    }
    
  }
  
  async function loadCategory() {
  
    const response = await fetch("https://dummyjson.com/products/category-list");
  
    const data = await response.json();
  
  
    data.forEach(category => {
      let option = document.createElement("option");
  
      option.value = category;
      option.textContent = category;
      
      select.appendChild(option);
    })
  }
  
  try {
  
   
    fetchProducts()
      .then(res => {
        globalproducts = res;
  
        displayProducts(globalproducts)
    
      
      });
  
  
   loadCategory();
    
  } catch (error) {
  
    console.log(error.message)
    
  }


  
  select.addEventListener("change", e => {
  
    let selectedCategory = e.target.value;
  
    if (selectedCategory == "all") {
      displayProducts(globalproducts);
      return;
    }
    
    let categoryProducts = globalproducts.filter(product => product.category == selectedCategory);
  
    displayProducts(categoryProducts);
    
  });
  
  
  search.addEventListener("input", e => {
    const input = e.target.value.toLowerCase();
  
   const searchProducts = globalproducts.filter(product => {
     return product.title.toLowerCase().includes(input);
   });
  
    displayProducts(searchProducts)
  });


} 


