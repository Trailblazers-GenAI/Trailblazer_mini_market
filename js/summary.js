export function handleSummary() {

    let order = JSON.parse(localStorage.getItem("orderDetails"));
  
    const time = document.getElementById("time");
    const cardContainer = document.getElementById("itemCard_container");
    const btn = document.getElementById("continue_btn");

    document.getElementById("username").textContent = order.customer.name;

    document.getElementById("order_id").textContent = order.orderId;

    time.textContent = order.date;
    time.datetime = order.date;

    console.log(order.total);

    document.getElementById("customer_name").textContent = order.customer.name;
    document.getElementById("customer_email").textContent = order.customer.email;
    document.getElementById("customer_phone").textContent = order.customer.phone;
    document.getElementById("customer_address").textContent = order.customer.address;

    document.getElementById("item_num").textContent = order.items.length;

    document.getElementById("summary_subtotal").textContent = "₦ " + order.total;
    document.getElementById("delivery").textContent = "₦ " + order.deliveryFee.toLocaleString();
    document.getElementById("total").textContent = "₦ " + (Number(order.total) + order.deliveryFee).toLocaleString();


    function formatCard(card) {
        let html = `
            <div class="card">
                <img src=${card.thumbnail} alt=${card.title}>
                <div class="item_detail">
                    <p>${card.title} x ${card.quantity}</p>
                    <p class="price">₦ ${card.price.toLocaleString()} each</p>
                    <p class="total">Total: ₦ ${(card.price * card.quantity).toLocaleString()}</p>
                </div>
            </div>
            `;

        return html;
    };

    const cards = order.items.map(card => formatCard(card)).join("");

    cardContainer.innerHTML = cards;

    btn.addEventListener("click", () => {

        localStorage.removeItem("userCart");
        localStorage.removeItem("orderDetails");

        document.getElementById("product_a_tag").click();
    })

}
