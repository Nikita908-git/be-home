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
    this.products = []; 

    this.init();
  }

  async init() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    this.cartListElement.innerHTML = "";

    if (cart.length === 0) {
      this.cartListElement.innerHTML = "<p>Корзина пуста :(</p>";
      this.totalPriceElement.textContent = "0₽";
      this.removeClearButton();
      return;
    }

    const cartCount = cart.reduce((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {});

    try {
      const response = await fetch("products.json");
      this.products = await response.json(); 

      let total = 0;

      for (let id in cartCount) {
        const product = this.products.find(p => String(p.id) === id);
        if (!product) continue;

        const quantity = cartCount[id];
        const itemPrice = product.price * quantity;
        total += itemPrice;

        const li = document.createElement("li");
        li.setAttribute("data-js-item", id); 
        li.innerHTML = `
          ${product.name} x<span data-js-quantity>${quantity}</span> - 
          <span data-js-price>${itemPrice}</span>₽
          <button class="button-price" data-js-decrease>-</button>
          <button class="button-price" data-js-increase>+</button>
        `;
        this.cartListElement.appendChild(li);

        li.querySelector("[data-js-increase]").addEventListener("click", () => this.updateQuantity(id, 1));
        li.querySelector("[data-js-decrease]").addEventListener("click", () => this.updateQuantity(id, -1));
      }

      let deliveryCost = 0;
      this.deliveryOptions.forEach(option => {
        if (option.checked && option.value === "Курьер") {
          deliveryCost = 40;
        }
        option.addEventListener("change", () => this.updateTotalPrice());
      });

      this.totalPriceElement.textContent = `${total + deliveryCost}₽`;

      this.addClearButton();
    } catch (error) {
      console.error("Ошибка загрузки products.json:", error);
    }
  }

  updateQuantity(id, change) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (change > 0) {
      cart.push(id);
    } else {
      const index = cart.indexOf(id);
      if (index !== -1) cart.splice(index, 1);
    }

    localStorage.setItem("cart", JSON.stringify(cart));

    this.updateCartItem(id);
    this.updateTotalPrice();
  }

  updateCartItem(id) {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const cartCount = cart.reduce((acc, itemId) => {
      acc[itemId] = (acc[itemId] || 0) + 1;
      return acc;
    }, {});

    const li = this.cartListElement.querySelector(`[data-js-item="${id}"]`);
    if (!li) return;

    if (cartCount[id]) {
      const product = this.products.find(p => String(p.id) === id);
      if (!product) return;

      const quantityElement = li.querySelector("[data-js-quantity]");
      const priceElement = li.querySelector("[data-js-price]");

      quantityElement.textContent = cartCount[id];
      priceElement.textContent = cartCount[id] * product.price;
    } else {
      li.remove();
    }

    if (cart.length === 0) {
      this.cartListElement.innerHTML = "<p>Корзина пуста</p>";
      this.totalPriceElement.textContent = "0₽";
      this.removeClearButton();
    }
  }

  updateTotalPrice() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    let total = 0;

    cart.forEach(id => {
      const product = this.products.find(p => String(p.id) === id);
      if (product) {
        total += product.price;
      }
    });

    let deliveryCost = 0;
    this.deliveryOptions.forEach(option => {
      if (option.checked && option.value === "Курьер") {
        deliveryCost = 40;
      }
    });

    this.totalPriceElement.textContent = `${total + deliveryCost}₽`;
  }

  addClearButton() {
    if (!document.querySelector("[data-js-clear-cart]")) {
      const clearButton = document.createElement("button");
      clearButton.textContent = "Очистить корзину";
      clearButton.setAttribute("data-js-clear-cart", "");
      clearButton.addEventListener("click", () => this.clearCart());
      clearButton.classList.add("button", "button-accent");
      this.cartListElement.after(clearButton);
    }
  }

  removeClearButton() {
    const clearButton = document.querySelector("[data-js-clear-cart]");
    if (clearButton) clearButton.remove();
  }

  clearCart() {
    localStorage.removeItem("cart");
    this.init();
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
