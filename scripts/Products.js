import BaseComponent from "./BaseComponent.js";

const rootSelector = "[data-js-shop]";

class Products extends BaseComponent {
  selectors = {
    root: rootSelector,
    search: "[data-js-search]",
    filter: "[data-js-filter]",
    sort: "[data-js-sort]",
    catalog: "[data-js-catalog]",
    catalogButton: "[data-js-catalog-button]",
    cartButton: "[data-js-cart-button]",
    cartCount: "[data-js-cart-count]",
  };

  constructor(rootElement) {
    super();
    this.rootElement = rootElement;
    this.searchElement = this.rootElement.querySelector(this.selectors.search);
    this.filterElement = this.rootElement.querySelector(this.selectors.filter);
    this.sortElement = this.rootElement.querySelector(this.selectors.sort);
    this.catalogElement = this.rootElement.querySelector(this.selectors.catalog);
    this.cartCountElement = document.querySelector(this.selectors.cartCount);

    this.products = []; 
    this.filteredProducts = []; 

    this._init();
  }

  _init() {
    this._fetchProducts(); 
    this._bindEvents(); 
  }

  _fetchProducts() {
    fetch('./products.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Не удалось загрузить файл');
        }
        return response.json(); 
      })
      .then(data => {
        this.products = data; 
        this.filteredProducts = [...this.products]; 
        this._renderCatalog(); 
      })
      .catch(error => console.error('Ошибка загрузки файла:', error));
  }
  
  _renderCatalog() {
    this.catalogElement.innerHTML = ""; 
    this.filteredProducts.forEach((product) => {
      const productElement = document.createElement("li");
      productElement.classList.add("catalog__item");
      productElement.innerHTML = `
          <figure class="catalog__item-inner">
            <img src="${product.image}" alt="${product.name}" class="catalog__item-img">
            <figcaption class="catalog__item-title h6">${product.name}</figcaption>
          </figure>
          <p class="catalog__item-price">${product.price} руб.</p>
          <button class="catalog__item-button button button-accent" data-id="${product.id}" data-js-catalog-button>Добавить в корзину</button>
        `;
      this.catalogElement.appendChild(productElement);
    });
    this._bindAddToCartButtons(); 
  }

  _bindEvents() {
    this.searchElement.addEventListener("input", this._handleSearch.bind(this));
    this.filterElement.addEventListener("change", this._handleFilter.bind(this));
    this.sortElement.addEventListener("change", this._handleSort.bind(this));
  }

  _handleSearch(event) {
    const searchQuery = event.target.value.toLowerCase();
    this.filteredProducts = this.products.filter((product) =>
      product.name.toLowerCase().includes(searchQuery)
    );
    this._renderCatalog();
  }

  _handleFilter(event) {
    const filterValue = event.target.value;
    this.filteredProducts = this.products.filter((product) =>
      filterValue === "all" ? true : product.category === filterValue
    );
    this._renderCatalog();
  }

  _handleSort(event) {
    const sortValue = event.target.value;
    this.filteredProducts.sort((a, b) =>
      sortValue === "asc" ? a.price - b.price : b.price - a.price
    );
    this._renderCatalog();
  }

  _bindAddToCartButtons() {
    const buttons = this.catalogElement.querySelectorAll(this.selectors.catalogButton);
    buttons.forEach((button) => {
      button.addEventListener("click", this._handleAddToCart.bind(this));
    });
  }

  _handleAddToCart(event) {
    const productId = event.target.dataset.id;
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    cart.push(productId);
    localStorage.setItem("cart", JSON.stringify(cart));
    this._updateCartCount();
  }

  _updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    this.cartCountElement.textContent = cart.length;
  }
}

class ProductsCollection {
  constructor() {
    this.init();
  }

  init() {
    document.querySelectorAll(rootSelector).forEach((element) => {
      new Products(element);
    });
  }
}

export default ProductsCollection;