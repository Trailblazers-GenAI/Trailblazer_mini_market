export function handleCheckout() {
  
  const form = document.getElementById("delivery_form");
  const fullnameError = document.getElementById("fullname_error");
  const emailError = document.getElementById("email_error");
  const phoneError = document.getElementById("phone_error");
  const addressError = document.getElementById("address_error");
  const placeOrderBtn = document.getElementById("place_order");
  const deliveryItemNum = document.getElementById("delivery_item_num");
  const deliveryTotal = document.getElementById("delivery_total");

  
  let userCart = JSON.parse(localStorage.getItem("userCart"));
  let total = userCart.reduce((a,b) => a + (b.price * b.quantity), 0);
  
  let orderDetails = {
      orderId: "ORD-1001",
      total: Number(total).toFixed(2),
      items: userCart,
      deliveryFee: 200,
      date: new Date().toDateString()
  };


  function emptyInputs() {
    form.fullname.value = "";
    form.email.value = "";
    form.phone.value = "";
    form.address.value = "";
  }
  
  
  deliveryItemNum.textContent = `${orderDetails.items.length} items. delivery included`;
  
  deliveryTotal.textContent = `N${orderDetails.total}`;
  
  
  placeOrderBtn.addEventListener('click', e => {
  
    let fullname = form.fullname.value;
    let email = form.email.value;
    let phone = form.phone.value;
    let address = form.address.value;
  
    fullnameError.textContent = '';
    emailError.textContent = '';
    phoneError.textContent = '';
    addressError.textContent = '';
    
    let errorFlagged = false;
  
    if (!fullname || fullname.length <= 2) {
      
      fullnameError.textContent = "please fullname cannot be empty or less than 3 letters";
  
      errorFlagged = true;
      
    } 
    
    if(!email || !email.includes('@')) {
      
      emailError.textContent = "please enter valid email address";
      errorFlagged = true;
      
    } 
    
    if (!phone || phone.length < 11) {
      
      phoneError.textContent = "please enter valid phone number";
      errorFlagged = true;
      
    } 
    
    if (!address) {
  
      addressError.textContent = "please enter valid address";
      errorFlagged = true;
      
    }
  
  
    if(errorFlagged) return;
    
    let user_detail = {
      name: fullname,
      email,
      phone,
      address
      
    }
    
    orderDetails = {...orderDetails, customer: user_detail}
    
  
    localStorage.setItem("orderDetails", JSON.stringify(orderDetails))

    document.getElementById("summary_a_tag").click();

    emptyInputs();
  })
  
  
  
}
