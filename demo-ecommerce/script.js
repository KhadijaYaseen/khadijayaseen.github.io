/* ======================================================== */
/* KY TRENDZONE — CORE E-COMMERCE JAVASCRIPT ENGINE        */
/* Architected by Khadija Yaseen                           */
/* ======================================================== */

// Global State
let allProducts = [];
let filteredProducts = [];
let cart = [];
let wishlist = [];
let currentCategory = 'all';
let currentSort = 'featured';
let currentSearch = '';
let currentCurrency = 'USD';
let discountRate = 0; // e.g. 0.15 for 15%
let isAdmin = false;

// Currency Exchange Rates against USD
const currencyRates = {
  USD: { symbol: '$', rate: 1.0 },
  PKR: { symbol: '₨', rate: 280.0 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.79 }
};

// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  fetchProducts();
});

// Toast Notification
function showToast(message) {
  const toast = document.getElementById('toast-banner');
  const text = document.getElementById('toast-text');
  text.textContent = message;
  toast.classList.remove('opacity-0', 'translate-y-8', 'pointer-events-none');
  toast.classList.add('opacity-100', 'translate-y-0');
  setTimeout(() => {
    toast.classList.add('opacity-0', 'translate-y-8', 'pointer-events-none');
    toast.classList.remove('opacity-100', 'translate-y-0');
  }, 3500);
}

// Format Price with Active Currency
function formatPrice(usdAmount) {
  const currency = currencyRates[currentCurrency] || currencyRates.USD;
  const converted = usdAmount * currency.rate;
  if (currentCurrency === 'PKR') {
    return `${currency.symbol} ${Math.round(converted).toLocaleString()}`;
  }
  return `${currency.symbol}${converted.toFixed(2)}`;
}

// Currency Switcher Handler
function changeCurrency(newCurrency) {
  currentCurrency = newCurrency;
  renderProducts();
  updateCartTotals();

  // Update Featured Lookbook Price Labels
  document.querySelectorAll('.product-price-val').forEach(el => {
    const usd = parseFloat(el.getAttribute('data-usd') || 0);
    el.textContent = formatPrice(usd);
  });

  showToast(`Currency converted to ${newCurrency}`);
}

// 1. FETCH PRODUCTS FROM FAKESTORE API
async function fetchProducts() {
  const loader = document.getElementById('product-loader');
  try {
    const res = await fetch('https://fakestoreapi.com/products');
    if (!res.ok) throw new Error('API offline');
    const data = await res.json();
    allProducts = data;
  } catch (err) {
    console.warn('FakeStoreAPI offline, using cached luxury inventory', err);
    allProducts = [
      { id: 1, title: "Fjallraven - Foldsack No. 1 Backpack", price: 109.95, category: "men's clothing", image: "https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_t.png", rating: { rate: 4.8, count: 120 }, description: "Perfect backpack for daily outdoor adventures." },
      { id: 2, title: "Mens Casual Premium Slim Fit T-Shirts", price: 22.3, category: "men's clothing", image: "https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_t.png", rating: { rate: 4.5, count: 259 }, description: "Lightweight organic cotton." },
      { id: 3, title: "Mens Cotton Jacket", price: 55.99, category: "men's clothing", image: "https://fakestoreapi.com/img/71li-ujtlUL._AC_UX679_t.png", rating: { rate: 4.7, count: 500 }, description: "Warm cotton outerwear." },
      { id: 4, title: "John Hardy Women's Legends Naga Gold & Silver Bracelet", price: 695.0, category: "jewelery", image: "https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_t.png", rating: { rate: 4.9, count: 400 }, description: "Fine jewelry inspired by Balinese craftsmanship." },
      { id: 5, title: "Solid Gold Petite Micropave Ring", price: 168.0, category: "jewelery", image: "https://fakestoreapi.com/img/61sbMiUnoGL._AC_UL640_QL65_ML3_t.png", rating: { rate: 4.6, count: 70 }, description: "Satisfaction guaranteed gold diamond ring." },
      { id: 6, title: "White Gold Plated Princess Ring", price: 9.99, category: "jewelery", image: "https://fakestoreapi.com/img/71YAIFU48IL._AC_UL640_QL65_ML3_t.png", rating: { rate: 4.8, count: 890 }, description: "Sparkling cubic zirconia princess cut." },
      { id: 7, title: "WD 2TB Elements Portable External Hard Drive", price: 64.0, category: "electronics", image: "https://fakestoreapi.com/img/61IBBVJvSDL._AC_SY879_t.png", rating: { rate: 4.3, count: 203 }, description: "Fast USB 3.0 storage." },
      { id: 8, title: "SanDisk SSD PLUS 1TB Internal SSD", price: 109.0, category: "electronics", image: "https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_t.png", rating: { rate: 4.2, count: 470 }, description: "Reliable solid-state drive performance." },
      { id: 9, title: "BIYLACLESEN Women's 3-in-1 Snowboard Jacket", price: 56.99, category: "women's clothing", image: "https://fakestoreapi.com/img/51Y5NI-I5jL._AC_UX679_t.png", rating: { rate: 4.6, count: 235 }, description: "Detachable hooded waterproof jacket." },
      { id: 10, title: "Rain Jacket Women Windbreaker Striped", price: 39.99, category: "women's clothing", image: "https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_t.png", rating: { rate: 4.9, count: 320 }, description: "Lightweight windbreaker rain shell." },
      { id: 11, title: "MBJ Women's Solid Short Sleeve Boat Neck V", price: 9.85, category: "women's clothing", image: "https://fakestoreapi.com/img/71z3kpMAYsL._AC_UY879_t.png", rating: { rate: 4.7, count: 130 }, description: "Soft modal fabric everyday tee." },
      { id: 12, title: "Opna Women's Short Sleeve Moisture Classic", price: 7.95, category: "women's clothing", image: "https://fakestoreapi.com/img/51eg55uWmdL._AC_UX679_t.png", rating: { rate: 4.5, count: 146 }, description: "Athletic moisture wicking tee." }
    ];
  } finally {
    if (loader) loader.classList.add('hidden');
    applyFilters();
  }
}

// 2. FILTERING & SORTING LOGIC
function filterCategory(category, btnElement) {
  currentCategory = category;

  // Update Category Pills
  document.querySelectorAll('.cat-pill').forEach(btn => {
    btn.classList.remove('active-cat', 'bg-slateDark-900', 'text-white');
    btn.classList.add('bg-alabaster-100', 'text-slate-700');
  });

  if (btnElement) {
    btnElement.classList.add('active-cat', 'bg-slateDark-900', 'text-white');
    btnElement.classList.remove('bg-alabaster-100', 'text-slate-700');
  } else {
    // If triggered from a department card, activate matching pill
    const matchingPill = Array.from(document.querySelectorAll('.cat-pill')).find(p => 
      p.getAttribute('onclick')?.toLowerCase().includes(category.toLowerCase())
    );
    if (matchingPill) {
      matchingPill.classList.add('active-cat', 'bg-slateDark-900', 'text-white');
      matchingPill.classList.remove('bg-alabaster-100', 'text-slate-700');
    }
  }

  // Update Dynamic Section Title
  const titleMap = {
    'all': '✨ Explore All Products',
    'women\'s clothing': '👗 Women\'s Fashion & Ready-to-Wear',
    'men\'s clothing': '👔 Men\'s Style & Apparel',
    'jewelery': '💍 Fine Jewelry, Rings & Gemstones',
    'electronics': '⚡ Modern Tech, Tablets & Gadgets'
  };

  const sectionTitle = document.getElementById('catalog-section-title');
  if (sectionTitle) {
    sectionTitle.textContent = titleMap[category.toLowerCase()] || `Category: ${category}`;
  }

  applyFilters();

  // Smoothly Scroll directly to Products Section
  const productsSection = document.getElementById('products-section');
  if (productsSection) {
    productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function handleSearch(query) {
  currentSearch = query.trim().toLowerCase();
  applyFilters();
}

function sortProducts(sortType) {
  currentSort = sortType;
  applyFilters();
}

function resetFilters() {
  currentCategory = 'all';
  currentSearch = '';
  document.getElementById('live-search-input').value = '';
  document.querySelectorAll('.cat-pill').forEach(btn => btn.classList.remove('active-cat'));
  const allBtn = document.querySelector('.cat-pill');
  if (allBtn) allBtn.classList.add('active-cat');
  applyFilters();
}

function applyFilters() {
  filteredProducts = allProducts.filter(p => {
    const matchesCat = (currentCategory === 'all' || p.category.toLowerCase() === currentCategory.toLowerCase());
    const matchesSearch = (currentSearch === '' || 
      p.title.toLowerCase().includes(currentSearch) || 
      p.category.toLowerCase().includes(currentSearch));
    return matchesCat && matchesSearch;
  });

  // Sort
  if (currentSort === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (currentSort === 'rating') {
    filteredProducts.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
  }

  renderProducts();
}

// 3. RENDER PRODUCTS TO GRID
function renderProducts() {
  const container = document.getElementById('product-container');
  const emptyState = document.getElementById('empty-search-state');
  const countLabel = document.getElementById('product-count-label');

  if (!container) return;
  container.innerHTML = '';
  countLabel.textContent = filteredProducts.length;

  if (filteredProducts.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  } else {
    emptyState.classList.add('hidden');
  }

  filteredProducts.forEach(product => {
    const rating = product.rating?.rate || 4.8;
    const reviewCount = product.rating?.count || 120;
    const formattedPrice = formatPrice(product.price);
    const categoryName = product.category || 'Fashion';

    const card = document.createElement('div');
    card.className = "product-card bg-white rounded-3xl p-5 border border-alabaster-300 shadow-sm flex flex-col justify-between group relative";
    card.id = `product-card-${product.id}`;

    card.innerHTML = `
      <div>
        <!-- Image Box -->
        <div class="relative overflow-hidden rounded-2xl bg-alabaster-50 p-6 aspect-square flex items-center justify-center cursor-pointer" onclick="openQuickView(${product.id})">
          <img src="${product.image}" alt="${product.title}" onerror="this.src='https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_t.png'" class="max-h-48 object-contain group-hover:scale-105 transition-transform duration-300">
          
          <button onclick="event.stopPropagation(); toggleWishlistItem('${escapeQuotes(product.title)}', ${product.price}, '${product.image}')" class="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-rose-500 shadow transition" title="Save to Wishlist">
            <i data-lucide="heart" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Product Meta -->
        <div class="pt-4 space-y-1.5">
          <div class="flex items-center justify-between text-[11px]">
            <span class="text-slate-400 uppercase font-mono tracking-wider font-semibold">${categoryName}</span>
            <span class="text-amber-500 font-bold flex items-center gap-1">★ ${rating} <span class="text-slate-400 text-[10px]">(${reviewCount})</span></span>
          </div>
          
          <h3 class="font-bold text-slateDark-900 text-xs sm:text-sm line-clamp-2 leading-snug cursor-pointer hover:text-terracotta-600 transition" onclick="openQuickView(${product.id})">
            ${product.title}
          </h3>
        </div>
      </div>

      <!-- Price & Actions Row -->
      <div class="pt-4 mt-2 border-t border-alabaster-200">
        <div class="flex items-center justify-between">
          <div class="text-base font-black text-slateDark-900">${formattedPrice}</div>
          <button onclick="addToCart('${escapeQuotes(product.title)}', ${product.price}, '${product.image}')" class="px-3.5 py-2 rounded-xl bg-slateDark-900 hover:bg-terracotta-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm">
            <i data-lucide="plus" class="w-3.5 h-3.5"></i>
            <span>Add</span>
          </button>
        </div>

        <!-- Admin Control Toolbar (Visible Only When Admin is Active) -->
        <div class="admin-controls-row ${isAdmin ? 'flex' : 'hidden'} items-center justify-end gap-2 pt-3 mt-3 border-t border-dashed border-amber-300 bg-amber-50/50 p-2 rounded-xl">
          <button onclick="openEditProductModal(${product.id})" class="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1">
            <i data-lucide="edit-2" class="w-3 h-3"></i>
            <span>Edit</span>
          </button>
          <button onclick="deleteProduct(${product.id})" class="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold flex items-center gap-1">
            <i data-lucide="trash-2" class="w-3 h-3"></i>
            <span>Delete</span>
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  lucide.createIcons();
}

function escapeQuotes(str) {
  return (str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

// 4. CART DRAWER & STATE MANAGEMENT
function toggleCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');

  if (drawer.classList.contains('translate-x-full')) {
    drawer.classList.remove('translate-x-full');
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    overlay.classList.add('opacity-100');
  } else {
    drawer.classList.add('translate-x-full');
    overlay.classList.remove('opacity-100');
    overlay.classList.add('opacity-0', 'pointer-events-none');
  }
}

function addToCart(title, price, image) {
  const existing = cart.find(item => item.title === title);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ title, price, image, quantity: 1 });
  }

  updateCartTotals();
  renderCartDrawer();
  showToast(`Added '${title.substring(0, 24)}...' to bag!`);
}

function updateCartQuantity(index, delta) {
  if (cart[index]) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
  }
  updateCartTotals();
  renderCartDrawer();
}

function removeFromCart(index) {
  if (cart[index]) {
    const removedName = cart[index].title;
    cart.splice(index, 1);
    updateCartTotals();
    renderCartDrawer();
    showToast(`Removed from bag`);
  }
}

function updateCartTotals() {
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotalUsd = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discountUsd = subtotalUsd * discountRate;
  const finalTotalUsd = Math.max(0, subtotalUsd - discountUsd);

  document.getElementById('nav-cart-count').textContent = totalCount;
  document.getElementById('nav-cart-total').textContent = formatPrice(finalTotalUsd);
  document.getElementById('drawer-item-count-badge').textContent = totalCount;
  document.getElementById('drawer-subtotal').textContent = formatPrice(subtotalUsd);
  document.getElementById('drawer-total').textContent = formatPrice(finalTotalUsd);
  document.getElementById('checkout-btn-total').textContent = formatPrice(finalTotalUsd);

  const discountRow = document.getElementById('drawer-discount-row');
  if (discountRate > 0) {
    discountRow.style.display = 'flex';
    document.getElementById('drawer-discount').textContent = `-${formatPrice(discountUsd)}`;
  } else {
    discountRow.style.display = 'none';
  }
}

function renderCartDrawer() {
  const list = document.getElementById('drawer-items-list');
  const emptyMsg = document.getElementById('empty-cart-msg');

  if (cart.length === 0) {
    list.innerHTML = `
      <div id="empty-cart-msg" class="py-20 text-center space-y-3">
        <div class="w-16 h-16 rounded-full bg-alabaster-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
          🛍️
        </div>
        <p class="text-xs text-slate-500">Your shopping bag is currently empty.</p>
        <button onclick="toggleCartDrawer()" class="px-5 py-2 rounded-xl bg-slateDark-900 text-white text-xs font-bold">Start Shopping</button>
      </div>
    `;
    return;
  }

  list.innerHTML = '';
  cart.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = "py-4 flex items-center gap-4 text-xs";
    row.innerHTML = `
      <img src="${item.image}" alt="${item.title}" class="w-14 h-14 object-contain rounded-xl bg-alabaster-50 p-1 border border-alabaster-200">
      <div class="flex-1 space-y-1">
        <h4 class="font-bold text-slateDark-900 line-clamp-1">${item.title}</h4>
        <div class="font-bold text-terracotta-600">${formatPrice(item.price)}</div>
        <div class="flex items-center gap-2 pt-1">
          <div class="flex items-center border border-alabaster-300 rounded-lg bg-white">
            <button onclick="updateCartQuantity(${index}, -1)" class="px-2 py-0.5 hover:bg-alabaster-100 text-slate-600 font-bold">-</button>
            <span class="px-2 font-mono text-[11px]">${item.quantity}</span>
            <button onclick="updateCartQuantity(${index}, 1)" class="px-2 py-0.5 hover:bg-alabaster-100 text-slate-600 font-bold">+</button>
          </div>
          <button onclick="removeFromCart(${index})" class="text-rose-500 hover:text-rose-700 text-[11px] font-semibold">Remove</button>
        </div>
      </div>
    `;
    list.appendChild(row);
  });
}

function applyPromoCode() {
  const code = document.getElementById('promo-input').value.trim().toUpperCase();
  if (code === 'KY2026') {
    discountRate = 0.15;
    updateCartTotals();
    showToast('Promo Code KY2026 applied! 15% discount activated.');
  } else {
    showToast('Invalid promo code. Try KY2026');
  }
}

// 5. CHECKOUT FLOW
function openCheckoutModal() {
  if (cart.length === 0) {
    showToast('Your cart is empty! Add items first.');
    return;
  }
  toggleCartDrawer();
  document.getElementById('checkout-modal').classList.remove('hidden');
}
function closeCheckoutModal() {
  document.getElementById('checkout-modal').classList.add('hidden');
}

function handlePlaceOrder(e) {
  e.preventDefault();
  const orderId = 'KY-ORD-' + Math.floor(100000 + Math.random() * 900000);
  closeCheckoutModal();
  cart = [];
  discountRate = 0;
  updateCartTotals();
  renderCartDrawer();
  showToast(`🎉 Order ${orderId} confirmed! Thank you for shopping with KY TrendZone.`);
}

// 6. QUICK VIEW MODAL
function openQuickView(id) {
  const product = allProducts.find(p => p.id === id);
  if (!product) return;

  document.getElementById('qv-image').src = product.image;
  document.getElementById('qv-title').textContent = product.title;
  document.getElementById('qv-category').textContent = product.category;
  document.getElementById('qv-price').textContent = formatPrice(product.price);
  document.getElementById('qv-desc').textContent = product.description || 'Premium craftsmanship featuring durable materials and tailored silhouette.';
  
  const addBtn = document.getElementById('qv-add-btn');
  addBtn.onclick = () => {
    addToCart(product.title, product.price, product.image);
    closeQuickViewModal();
  };

  document.getElementById('quick-view-modal').classList.remove('hidden');
  lucide.createIcons();
}
function closeQuickViewModal() {
  document.getElementById('quick-view-modal').classList.add('hidden');
}

function selectSize(btn) {
  document.querySelectorAll('.size-btn').forEach(b => {
    b.classList.remove('bg-slateDark-900', 'text-white', 'border-slateDark-900');
    b.classList.add('bg-white', 'border-alabaster-300');
  });
  btn.classList.add('bg-slateDark-900', 'text-white', 'border-slateDark-900');
  btn.classList.remove('bg-white', 'border-alabaster-300');
}

function quickAddHeroItem() {
  addToCart('Autumn Cashmere Trench', 189.0, 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800&auto=format&fit=crop');
}

// 7. WISHLIST TOGGLE
function toggleWishlistItem(title, price, image) {
  const idx = wishlist.findIndex(w => w.title === title);
  if (idx >= 0) {
    wishlist.splice(idx, 1);
    showToast(`Removed '${title.substring(0, 20)}...' from wishlist`);
  } else {
    wishlist.push({ title, price, image });
    showToast(`Saved to wishlist ❤️`);
  }
  document.getElementById('wishlist-badge').textContent = wishlist.length;
}
function toggleWishlistModal() {
  if (wishlist.length === 0) {
    showToast('Your wishlist is empty. Tap any heart icon to save favorites!');
  } else {
    showToast(`You have ${wishlist.length} saved favorites!`);
  }
}

// 8. STORE MANAGER ADMIN CRUD LOGIC
function toggleAdminModal() {
  const modal = document.getElementById('admin-modal');
  modal.classList.toggle('hidden');
  lucide.createIcons();
}

function loginAdmin() {
  const pass = document.getElementById('admin-pass-input').value;
  if (pass === 'admin123') {
    isAdmin = true;
    document.getElementById('admin-login-box').classList.add('hidden');
    document.getElementById('admin-dashboard-box').classList.remove('hidden');
    document.getElementById('admin-nav-text').textContent = 'Admin (Active)';
    document.getElementById('admin-nav-btn').classList.add('bg-emerald-100', 'text-emerald-800', 'border-emerald-300');
    renderProducts();
    showToast('Store Manager Terminal Unlocked! Edit & Delete active on all cards.');
  } else {
    showToast('Incorrect Admin Password! Try admin123');
  }
}

function logoutAdmin() {
  isAdmin = false;
  document.getElementById('admin-login-box').classList.remove('hidden');
  document.getElementById('admin-dashboard-box').classList.add('hidden');
  document.getElementById('admin-nav-text').textContent = 'Admin';
  document.getElementById('admin-nav-btn').classList.remove('bg-emerald-100', 'text-emerald-800', 'border-emerald-300');
  toggleAdminModal();
  renderProducts();
  showToast('Logged out of Store Manager Terminal.');
}

async function handleAddNewProduct(e) {
  e.preventDefault();
  const title = document.getElementById('new-prod-title').value.trim();
  const price = parseFloat(document.getElementById('new-prod-price').value) || 29.99;
  const category = document.getElementById('new-prod-category').value;
  let image = document.getElementById('new-prod-image').value.trim();
  if (!image) image = 'https://fakestoreapi.com/img/81XH0e8fefL._AC_UY879_t.png';

  const newProd = {
    id: Date.now(),
    title,
    price,
    category,
    image,
    rating: { rate: 5.0, count: 1 },
    description: "New addition to KY TrendZone boutique."
  };

  allProducts.unshift(newProd);
  applyFilters();
  toggleAdminModal();

  document.getElementById('add-product-form').reset();
  showToast(`Product '${title}' published successfully!`);
}

function deleteProduct(id) {
  if (!confirm('Are you sure you want to delete this product from the boutique catalog?')) return;
  allProducts = allProducts.filter(p => p.id !== id);
  applyFilters();
  showToast(`Product #${id} removed from catalog.`);
}

function openEditProductModal(id) {
  const prod = allProducts.find(p => p.id === id);
  if (!prod) return;

  const newTitle = prompt('Enter updated product title:', prod.title);
  if (newTitle === null) return;
  const newPrice = prompt('Enter updated product price ($ USD):', prod.price);
  if (newPrice === null) return;

  prod.title = newTitle;
  prod.price = parseFloat(newPrice) || prod.price;
  applyFilters();
  showToast(`Product #${id} updated successfully!`);
}

// 9. FAQ ACCORDION TOGGLE
function toggleFaq(card) {
  const content = card.querySelector('.faq-content');
  const icon = card.querySelector('[data-lucide="chevron-down"]');
  const isHidden = content.classList.contains('hidden');

  document.querySelectorAll('.faq-content').forEach(c => c.classList.add('hidden'));
  document.querySelectorAll('[data-lucide="chevron-down"]').forEach(i => i.classList.remove('rotate-180'));

  if (isHidden) {
    content.classList.remove('hidden');
    if (icon) icon.classList.add('rotate-180');
  }
}
