const itemsSection = document.querySelector('.items');
const cartItems = document.querySelector('.cart__items');
let savedProducts = [];
const totalPriceElement = document.querySelector('.total-price');
let totalPrice = 0;
const clearBtn = document.querySelector('.empty-cart');
const loaderDiv = document.querySelector('.loading');

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}

function createProductItemElement({ id: sku, title: name, thumbnail: image }) {
  const section = document.createElement('section');
  section.className = 'item';
  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  return section;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}

function renderTotalPrice(price) {
  totalPrice = parseFloat((totalPrice + price).toFixed(2));
  totalPriceElement.innerText = totalPrice;
}

function saveProductsStorage() {
  if (savedProducts.length === 0) {
    localStorage.removeItem('products');
    return;
  } 
  const jsonProducts = JSON.stringify(savedProducts);
  localStorage.setItem('products', jsonProducts);
}

function cartItemClickListener(event) {
  savedProducts.forEach((obj, index) => {
    if (event.target.innerText.includes(obj.sku)) {
      savedProducts.splice(index, 1);
      renderTotalPrice(-obj.salePrice);
    }
  });
  saveProductsStorage();
  event.target.remove();
}

function createCartItemElement({ id: sku, title: name, price: salePrice }) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  savedProducts.push({ sku, name, salePrice });
  renderTotalPrice(salePrice);
  saveProductsStorage();
  return li;
}

async function getDataApi(item) {
  loaderDiv.innerHTML = 'loading...';
  try {
    const response = await fetch(`https://api.mercadolibre.com/sites/MLB/search?q=${item}`);
    const object = await response.json();
    loaderDiv.remove();
    return object.results;
  } catch (err) {
    console.log(err);
  }
}

async function renderObj(item) {
  try {
      const data = await getDataApi(item);

    data.forEach((element) => {
    itemsSection.appendChild(createProductItemElement(element));
  });
  } catch (error) {
    console.log(error);
  }
}

async function getDataFromId(id) {
  try {
    const response = await fetch(`https://api.mercadolibre.com/items/${id}`);
    const obj = await response.json();
    const item = createCartItemElement(obj);
    cartItems.appendChild(item);
  } catch (err) {
    console.log(err);
  }
}

document.addEventListener('click', (e) => {
  const { target } = e;

  if (target.classList.contains('item__add')) {
    const id = getSkuFromProductItem(target.parentNode);
    getDataFromId(id);
  }
});

function loadSavedProducts() {
  let productsOnStorage = localStorage.getItem('products');
  productsOnStorage = JSON.parse(productsOnStorage);
  productsOnStorage.forEach(({ sku, name, salePrice }) => {
    const obj = { id: sku, title: name, price: salePrice };
    const item = createCartItemElement(obj);
    cartItems.appendChild(item);
  });
}

clearBtn.addEventListener('click', () => {
  cartItems.innerHTML = '';
  renderTotalPrice(-totalPrice);
  savedProducts = [];
  saveProductsStorage();
});

window.onload = () => {
  loaderDiv.innerHTML = 'loading...';
  if (localStorage.getItem('products')) loadSavedProducts();
  renderObj('computador');
};
