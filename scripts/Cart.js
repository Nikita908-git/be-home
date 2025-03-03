import BaseComponent from "./BaseComponent.js";

const rootSelector = "[data-js-cart]";

class Cart extends BaseComponent {
  selectors = {
    root: rootSelector,
    cartList: "[data-js-cart-list]",
    totalPrice: "[data-js-cart-amount]",
    deliveryOptions: "[data-js-cart-radio]", 
  };

  constructor(rootElement) {
    super();
    this.rootElement = rootElement;
    this.cartListElement = this.rootElement.querySelector(this.selectors.cartList);
    this.totalPriceElement = this.rootElement.querySelector(this.selectors.totalPrice);
    this.deliveryOptions = this.rootElement.querySelectorAll(this.selectors.deliveryOptions);

    this.init();
  }

  async init() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartCount = cart.reduce((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});

    try {
      // Загружаем данные о товарах
      const response = await fetch("products.json");
      const products = await response.json();

      let total = 0;
      this.cartListElement.innerHTML = ""; 

      for (let id in cartCount) {
        const product = products.find(p => String(p.id) === id);
        if (!product) continue;

        const quantity = cartCount[id];
        const itemPrice = product.price * quantity;
        total += itemPrice;

        const li = document.createElement("li");
        li.textContent = `${product.name} x${quantity} - ${itemPrice}₽`;
        this.cartListElement.appendChild(li);
      }

      let deliveryCost = 0;
      this.deliveryOptions.forEach(option => {
        if (option.checked && option.value === "Курьер") {
          deliveryCost = 40;
        }
        option.addEventListener("change", () => this.updateTotal(total));
      });

      this.totalPriceElement.textContent = `${total + deliveryCost}₽`;
    } catch (error) {
      console.error("Ошибка загрузки products.json:", error);
    }
  }

  updateTotal(baseTotal) {
    let deliveryCost = 0;
    this.deliveryOptions.forEach(option => {
      if (option.checked && option.value === "Курьер") {
        deliveryCost = 40;
      }
    });
    this.totalPriceElement.textContent = `${baseTotal + deliveryCost}₽`;
  }
}

class CartCollection {
  constructor() {
    this.init();
  }

  init() {
    document.querySelectorAll(rootSelector).forEach(element => {
      new Cart(element);
    });
  }
}

export default CartCollection;
