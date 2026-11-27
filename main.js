import { handleProduct } from "./js/product.js";
import { Cart, handleCart } from "./js/cart.js";
import { handleCheckout } from "./js/checkout.js";
import { handleSummary } from "./js/summary.js";



const nav = document.getElementById("nav");
const searchBar = document.getElementById("search_bar");

nav.addEventListener("click", e => {
  let clickedATag = e.target.closest("a");

  document.querySelectorAll("nav ul li a").forEach(aTag => {
    if(aTag.textContent == clickedATag.textContent) {
      aTag.classList.add("active");
      
      switchSections(clickedATag.textContent.toLowerCase())
      
    } else {
      aTag.classList.remove("active");
    
    }
  })
});



function switchSections(sectionName) {
  
    let userCart = localStorage.getItem("userCart");
    let orderDetails = localStorage.getItem("orderDetails");
     
     userCart = userCart ? JSON.parse(userCart) : "";
     orderDetails = orderDetails ? JSON.parse(orderDetails) : "";
    

  if ((sectionName == 'cart' || sectionName == "checkout" || sectionName == "summary") && !userCart) {
    
    return;
    
  }


  //  extra layer for summary page load;

  if(sectionName == "summary" && !orderDetails) return;


  if (sectionName == 'cart' && userCart) {
    handleCart();
    searchBar.classList.add("hidden");
    
  } else if (sectionName == 'checkout' && userCart) {

    handleCheckout();
    searchBar.classList.add("hidden");
    
  } else if (sectionName == "summary" && orderDetails) {
    
    handleSummary();
    searchBar.classList.add("hidden");
    
  } else {

    searchBar.classList.remove("hidden");
  }

  document.querySelectorAll("section").forEach(section => {
    if (section.id == sectionName) {
      
        section.classList.remove("hidden");
      
    } else {
      
      section.classList.add("hidden");
      
    }
    
  })
  
}


handleProduct(Cart);


document.addEventListener("visibilitychange", e => {

  if (document.visibilityState === "hidden") {
    
    localStorage.removeItem("userCart");
    localStorage.removeItem("orderDetails");
    
  }
});

