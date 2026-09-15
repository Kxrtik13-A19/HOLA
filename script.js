 document.addEventListener('DOMContentLoaded', () => {

  /* ============================================
     Footer year
     ============================================ */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ============================================
     Mobile nav toggle
     ============================================ */
  const hamburger = document.getElementById('hamburgerBtn');
  const closeBtn = document.getElementById('closeMobileNav');
  const mobileLinks = document.querySelectorAll('.mobile-nav a');
  hamburger.addEventListener('click', () => document.body.classList.add('nav-open'));
  closeBtn.addEventListener('click', () => document.body.classList.remove('nav-open'));
  mobileLinks.forEach(l => l.addEventListener('click', () => document.body.classList.remove('nav-open')));

  /* ============================================
     Sticky navbar shrink
     ============================================ */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  /* ============================================
     Menu tab filter
     ============================================ */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const menuCards = document.querySelectorAll('.menu-card');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.CDATA_SECTION_NODE.category;
      menuCards.forEach(card => {
        const match = cat === 'all' || card.CDATA_SECTION_NODE.category === cat;
        card.classList.toggle('hidden-card', !match);
      });
    });
  });

  /* ============================================
     Toast helper
     ============================================ */
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  let toastTimer;

  function showToast(msg) {
    toastMsg.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
  }

  /* ============================================
     CART (demo only  no real orders / payments)
     ============================================ */
  const cart = []; // { id, name, price, img, qty }

  const fab = document.getElementById('cartFab');
  const badges = document.querySelectorAll('.cart-badge-value');

  const cartOverlay = document.getElementById('cartOverlay');
  const cartCloseBtn = document.getElementById('cartCloseBtn');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  const cartFeeEl = document.getElementById('cartFee');
  const cartTotalEl = document.getElementById('cartTotal');
  const cartCheckoutTotalEl = document.getElementById('cartCheckoutTotal');
  const cartCheckoutBtn = document.getElementById('cartCheckoutBtn');
  const paymentOptions = document.querySelectorAll('.payment-option');

  function formatPrice(n) {
    return '$' + n.toFixed(2);
  }

  function openCart() {
    document.body.classList.add('cart-open');
  }
  function closeCart() {
    document.body.classList.remove('cart-open');
  }

  function renderCart() {
    cartItemsList.innerHTML = '';
    let subtotal = 0;
    let count = 0;

    cart.forEach(item => {
      subtotal += item.price * item.qty;
      count += item.qty;

      const li = document.createElement('li');
      li.className = 'cart-item';
      li.dataset.id = item.id;
      li.innerHTML = `
        <img src="${item.img}" alt="${item.name}">
        <div class="cart-item-info">
          <strong>${item.name}</strong>
          <span>${formatPrice(item.price)} each</span>
        </div>
        <div class="cart-item-qty">
          <button class="qty-btn minus" type="button" aria-label="Decrease quantity of ${item.name}"></button>
          <span class="qty-value">${item.qty}</span>
          <button class="qty-btn plus" type="button" aria-label="Increase quantity of ${item.name}">+</button>
        </div>
        <button class="cart-item-remove" type="button" aria-label="Remove ${item.name} from cart">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0-1 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L6 6"/></svg>
        </button>`;
      cartItemsList.appendChild(li);
    });

    document.body.classList.toggle('cart-has-items', cart.length > 0);
    badges.forEach(b => b.textContent = count);

    const fee = subtotal > 0 ? Math.max(0.5, subtotal * 0.05) : 0;
    const total = subtotal + fee;

    cartSubtotalEl.textContent = formatPrice(subtotal);
    cartFeeEl.textContent = formatPrice(fee);
    cartTotalEl.textContent = formatPrice(total);
    cartCheckoutTotalEl.textContent = formatPrice(total);
    cartCheckoutBtn.disabled = cart.length === 0;
  }

  function addToCart(item) {
    const existing = cart.find(c => c.id === item.id);
    if (existing) existing.qty += 1;
    else cart.push({ ...item, qty: 1 });
    renderCart();
  }

  function changeQty(id, delta) {
    const item = cart.find(c => c.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) removeFromCart(id);
    else renderCart();
  }

  function removeFromCart(id) {
    const idx = cart.findIndex(c => c.id === id);
    if (idx > -1) cart.splice(idx, 1);
    renderCart();
  }

  /* Add-to-cart buttons on every menu card */
  document.querySelectorAll('.menu-card').forEach(card => {
    const addBtn = card.querySelector('.add-btn');
    addBtn.addEventListener('click', () => {
      const item = {
        id: card.dataset.name,
        name: card.dataset.name,
        price: parseFloat(card.dataset.price),
        img: card.dataset.img      };
      addToCart(item);

      fab.classList.remove('bump');
      void fab.offsetWidth;
      fab.classList.add('bump');

      showToast('Added ' + item.name + ' to cart');
    });
  });

  /* Quantity + remove controls inside the drawer */
  cartItemsList.addEventListener('click', (e) => {
    const li = e.target.closest('.cart-item');
    if (!li) return;
    const id = li.dataset.id;
    if (e.target.closest('.plus')) changeQty(id, 1);
    else if (e.target.closest('.minus')) changeQty(id, -1);
    else if (e.target.closest('.cart-item-remove')) removeFromCart(id);
  });

  /* Open / close the drawer */
  document.getElementById('cartIconBtn').addEventListener('click', openCart);
  fab.addEventListener('click', openCart);
  cartCloseBtn.addEventListener('click', closeCart);
  cartOverlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCart();
  });

  /* Payment method selector  selectable UI only, nothing is charged */
  paymentOptions.forEach(btn => {
    btn.addEventListener('click', () => {
      paymentOptions.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-checked', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-checked', 'true');
    });
  });

  /* "Place order"  demo only, no real payment is ever processed */
  cartCheckoutBtn.addEventListener('click', () => {
    if (cart.length === 0) return;
    const activeMethod = document.querySelector('.payment-option.active');
    const methodLabel = activeMethod ? activeMethod.textContent.trim() : 'Card';
    showToast('Demo order placed via ' + methodLabel + '  no real payment taken');
    cart.length = 0;
    renderCart();
    closeCart();
  });

  renderCart(); // set initial empty state

  /* ============================================
     Count-up stats (single contained moment, triggered once)
     ============================================ */
  const statEls = document.querySelectorAll('.stat-number');
  const statIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statIO.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  statEls.forEach(el => statIO.observe(el));

  function animateCount(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const decimal = el.dataset.decimal === 'true';
    const duration = 1500;
    const start = performance.now();
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = (decimal ? value.toFixed(1) : Math.round(value)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ============================================
     Testimonial carousel
     ============================================ */
  const slides = document.querySelectorAll('.testi-slide');
  const dots = document.querySelectorAll('.testi-dot');
  let activeSlide = 0;
  let autoplay;

  function goToSlide(i) {
    slides[activeSlide].classList.remove('active');
    dots[activeSlide].classList.remove('active');
    activeSlide = (i + slides.length) % slides.length;
    slides[activeSlide].classList.add('active');
    dots[activeSlide].classList.add('active');
  }
  function startAutoplay() { autoplay = setInterval(() => goToSlide(activeSlide + 1), 6000); }
  function resetAutoplay() { clearInterval(autoplay); startAutoplay(); }

  document.getElementById('testiPrev').addEventListener('click', () => { goToSlide(activeSlide - 1); resetAutoplay(); });
  document.getElementById('testiNext').addEventListener('click', () => { goToSlide(activeSlide + 1); resetAutoplay(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { goToSlide(i); resetAutoplay(); }));

  startAutoplay();
  const testiWrap = document.querySelector('.testi-track-wrap');
  testiWrap.addEventListener('mouseenter', () => clearInterval(autoplay));
  testiWrap.addEventListener('mouseleave', startAutoplay);

  /* ============================================
     Hero holographic background parallax
     ============================================ */
  if (window.matchMedia('(pointer:fine)').matches) {
    const layers = document.querySelectorAll('.blob-layer');
    let mouseX = 0, mouseY = 0, ticking = false;
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX / window.innerWidth - 0.5;
      mouseY = e.clientY / window.innerHeight - 0.5;
      if (!ticking) {
        requestAnimationFrame(() => {
          layers.forEach(layer => {
            const depth = parseFloat(layer.dataset.depth) || 18;
            layer.computedStyleMap.transform = `translate(${mouseX * depth}px, ${mouseY * depth}px)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /* ============================================
     3D blue frappuccino  drag to spin + gentle auto-rotate
     ============================================ */
  (function initFrapp3D() {
    const scene = document.getElementById('frappScene');
    const cup3d = document.getElementById('frapp3d');
    if (!scene || !cup3d) return;

    let rotX = 6;
    let rotY = -18;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    const idleSpeed = 0.06; // degrees per frame of ambient auto-rotate

    function applyTransform() {
      cup3d.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    }
    applyTransform();

    function clamp(v, min, max) {
      return Math.max(min, Math.min(max, v));
    }

    function onPointerDown(e) {
      dragging = true;
      cup3d.classList.add('is-dragging');
      lastX = e.clientX;
      lastY = e.clientY;
      scene.setPointerCapture && e.pointerId != null && scene.setPointerCapture(e.pointerId);
    }
    function onPointerMove(e) {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      rotY += dx * 0.45;
      rotX = clamp(rotX - dy * 0.3, -24, 24);
      lastX = e.clientX;
      lastY = e.clientY;
      applyTransform();
    }
    function onPointerUp() {
      dragging = false;
      cup3d.classList.remove('is-dragging');
    }

    scene.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    function idleLoop() {
      if (!dragging) {
        rotY += idleSpeed;
        applyTransform();
      }
      requestAnimationFrame(idleLoop);
    }
    requestAnimationFrame(idleLoop);
  })();

  /* ============================================
     Newsletter form
     ============================================ */
  const form = document.getElementById('newsletterForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input');
    if (!input.value.includes('@')) { input.focus(); return; }
    form.querySelector('button').textContent = 'Subscribed';
    input.value = '';
    input.placeholder = "You're on the list!";
    input.disabled = true;
    showToast('Subscribed  15% off code sent to your inbox');
  });

}); 