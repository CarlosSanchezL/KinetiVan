/* =========================================================
   KinetiVan — main.js
   Funcionalidad: menú, navegación activa, carrito con
   localStorage, checkout simulado, demo interactiva de la app,
   modales, formulario de contacto y animaciones.
   ========================================================= */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

/* ---------- Utilidades ---------- */
const money = (n) => "$" + n.toLocaleString("en-US");
const store = {
  get(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* sin almacenamiento */ }
  },
};

let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

/* =========================================================
   HEADER / NAVEGACIÓN
   ========================================================= */
const header = $("#header");
const nav = $("#nav");

window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 30);
});

$("#burger").addEventListener("click", () => nav.classList.toggle("open"));
$$(".nav__link").forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));

// Marca el link activo según la sección visible
const sections = $$("section[id]");
const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      $$(".nav__link").forEach((l) =>
        l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id)
      );
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
sections.forEach((s) => navObserver.observe(s));

// Animación de aparición
const revealObserver = new IntersectionObserver(
  (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("visible")),
  { threshold: 0.15 }
);
$$(".reveal").forEach((el) => revealObserver.observe(el));

$("#year").textContent = new Date().getFullYear();

/* =========================================================
   HOW IT WORKS — resaltar capas del diagrama
   ========================================================= */
function highlightLayer(n) {
  $$("[data-layer]").forEach((el) => el.classList.toggle("hl", el.dataset.layer === String(n)));
}
$$(".steps li, .labels li").forEach((el) => {
  el.addEventListener("mouseenter", () => highlightLayer(el.dataset.layer));
  el.addEventListener("mouseleave", () => highlightLayer(-1));
  el.addEventListener("click", () => highlightLayer(el.dataset.layer));
});

// Las losetas del diagrama se "iluminan" como si alguien caminara
const diagramTiles = $$(".layer--tiles i");
setInterval(() => {
  const t = diagramTiles[Math.floor(Math.random() * diagramTiles.length)];
  t.classList.add("lit");
  setTimeout(() => t.classList.remove("lit"), 700);
}, 900);

/* =========================================================
   TIENDA + CARRITO
   ========================================================= */
const PRODUCTS = [
  {
    id: "starter",
    name: "Starter Kit",
    price: 649,
    tiles: 4,
    icon: "▦",
    photo: "1594495894542-a46cc73e081a",
    features: ["4 kinetic floor tiles", "Controller", "250 Wh buffer battery", "1× USB-C (30 W)"],
  },
  {
    id: "pro",
    name: "Pro Kit",
    price: 1099,
    tiles: 8,
    icon: "⚡",
    featured: true,
    photo: "1576793048000-494aaa93d160",
    features: ["8 kinetic floor tiles", "Smart controller + app", "500 Wh buffer battery", "2× USB-C (60 W)", "Solar input ready"],
  },
  {
    id: "tile",
    name: "Extra Tile",
    price: 89,
    tiles: 1,
    icon: "◼",
    photo: "1627386172764-1d1b7ea90b66",
    features: ["1 kinetic floor tile", "Click-in installation", "IP65 rated", "Compatible with all kits"],
  },
];

let cart = store.get("kv-cart", []);

function renderProducts() {
  $("#products").innerHTML = PRODUCTS.map(
    (p) => `
    <article class="product reveal ${p.featured ? "featured" : ""}">
      ${p.featured ? '<span class="product__tag">BEST SELLER</span>' : ""}
      <div class="product__visual" style="background-image:linear-gradient(180deg,rgba(11,22,32,.15),rgba(11,22,32,.85)),url('https://images.unsplash.com/photo-${p.photo}?auto=format&fit=crop&w=700&q=80')">
        <div class="mini-tiles" style="grid-template-columns: repeat(${Math.min(p.tiles, 4)}, 1fr)">
          ${"<i></i>".repeat(p.tiles)}
        </div>
      </div>
      <h3>${p.name}</h3>
      <ul>${p.features.map((f) => `<li>${f}</li>`).join("")}</ul>
      <div class="product__foot">
        <span class="price">${money(p.price)} <small>USD</small></span>
        <button class="btn btn--green add-btn" data-add="${p.id}">Add to cart</button>
      </div>
    </article>`
  ).join("");
  $$("#products .reveal").forEach((el) => revealObserver.observe(el));
}

function addToCart(id) {
  const item = cart.find((i) => i.id === id);
  item ? item.qty++ : cart.push({ id, qty: 1 });
  saveCart();
  const p = PRODUCTS.find((x) => x.id === id);
  toast(`✓ ${p.name} added to cart`);
  const badge = $("#cartCount");
  badge.classList.remove("bump");
  void badge.offsetWidth; // reinicia la animación
  badge.classList.add("bump");
}

function changeQty(id, delta) {
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter((i) => i.id !== id);
  saveCart();
}

function saveCart() {
  store.set("kv-cart", cart);
  renderCart();
}

function cartTotal() {
  return cart.reduce((sum, i) => sum + PRODUCTS.find((p) => p.id === i.id).price * i.qty, 0);
}

function renderCart() {
  const count = cart.reduce((n, i) => n + i.qty, 0);
  const badge = $("#cartCount");
  badge.textContent = count;
  badge.classList.toggle("show", count > 0);

  const box = $("#cartItems");
  if (!cart.length) {
    box.innerHTML = `<div class="empty">🛒<p>Your cart is empty</p><a href="#shop" class="link" data-close>Browse kits</a></div>`;
  } else {
    box.innerHTML = cart
      .map((i) => {
        const p = PRODUCTS.find((x) => x.id === i.id);
        return `
        <div class="cart-item">
          <div class="cart-item__thumb">${p.icon}</div>
          <div class="cart-item__info">
            <b>${p.name}</b>
            <small>${money(p.price)} each</small>
            <div class="qty">
              <button data-qty="${p.id}" data-d="-1" aria-label="Less">−</button>
              <span>${i.qty}</span>
              <button data-qty="${p.id}" data-d="1" aria-label="More">+</button>
            </div>
          </div>
          <div style="text-align:right">
            <b>${money(p.price * i.qty)}</b><br/>
            <button class="remove" data-remove="${p.id}">Remove</button>
          </div>
        </div>`;
      })
      .join("");
  }
  $("#cartTotal").textContent = money(cartTotal());
  $("#checkoutBtn").disabled = !cart.length;
  $("#checkoutBtn").style.opacity = cart.length ? 1 : 0.5;
}

/* ---------- Abrir / cerrar ---------- */
const drawer = $("#cartDrawer");
const overlay = $("#overlay");
const modal = $("#modal");

function openCart() { drawer.classList.add("open"); overlay.classList.add("show"); }
function closeAll() {
  drawer.classList.remove("open");
  overlay.classList.remove("show");
  modal.classList.remove("show");
}
function openModal(html) {
  drawer.classList.remove("open");
  overlay.classList.remove("show");
  $("#modalContent").innerHTML = html;
  modal.classList.add("show");
}

$("#cartBtn").addEventListener("click", openCart);
overlay.addEventListener("click", closeAll);
modal.addEventListener("click", (e) => e.target === modal && closeAll());
document.addEventListener("keydown", (e) => e.key === "Escape" && closeAll());

// Delegación de eventos para botones generados dinámicamente
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-add],[data-qty],[data-remove],[data-close],[data-toast]");
  if (!t) return;
  if (t.dataset.add) addToCart(t.dataset.add);
  if (t.dataset.qty) changeQty(t.dataset.qty, Number(t.dataset.d));
  if (t.dataset.remove) changeQty(t.dataset.remove, -Infinity);
  if (t.hasAttribute("data-close")) closeAll();
  if (t.dataset.toast) { e.preventDefault(); toast(t.dataset.toast); }
});

/* ---------- Checkout simulado ---------- */
$("#checkoutBtn").addEventListener("click", () => {
  if (!cart.length) return;
  const lines = cart
    .map((i) => {
      const p = PRODUCTS.find((x) => x.id === i.id);
      return `<div><span>${i.qty}× ${p.name}</span><span>${money(p.price * i.qty)}</span></div>`;
    })
    .join("");

  openModal(`
    <h3>Checkout</h3>
    <p class="muted">This is a demo — no real payment is processed.</p>
    <div class="summary">${lines}<div><b>Total</b><b>${money(cartTotal())}</b></div></div>
    <form id="checkoutForm" novalidate>
      <div class="field"><label>Full name</label><input name="name" required placeholder="Jane Doe"/><small class="error"></small></div>
      <div class="field"><label>Email</label><input name="email" type="email" required placeholder="you@email.com"/><small class="error"></small></div>
      <div class="field"><label>Shipping address</label><input name="address" required placeholder="Street, city, ZIP"/><small class="error"></small></div>
      <button class="btn btn--green btn--block" type="submit">Place order</button>
    </form>
  `);

  $("#checkoutForm").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateForm(e.target)) return;
    const data = Object.fromEntries(new FormData(e.target));
    const order = {
      id: "KV-" + Date.now().toString().slice(-6),
      date: new Date().toISOString(),
      customer: data,
      items: cart,
      total: cartTotal(),
    };
    const orders = store.get("kv-orders", []);
    orders.push(order);
    store.set("kv-orders", orders);
    cart = [];
    saveCart();
    openModal(`
      <div style="text-align:center">
        <div style="font-size:3rem">🎉</div>
        <h3>Order confirmed!</h3>
        <p class="muted">Thanks, ${data.name.split(" ")[0]}. Your order <b>${order.id}</b> is on its way.<br/>We sent a confirmation to ${data.email}.</p>
        <br/><button class="btn btn--green" data-close>Keep exploring</button>
      </div>
    `);
  });
});

/* ---------- Cuenta (pedidos guardados) ---------- */
$("#accountBtn").addEventListener("click", () => {
  const orders = store.get("kv-orders", []);
  openModal(`
    <h3>My orders</h3>
    ${
      orders.length
        ? orders
            .slice()
            .reverse()
            .map(
              (o) => `<div class="summary"><div><b>${o.id}</b><span>${new Date(o.date).toLocaleDateString()}</span></div>
              <div><span>${o.items.reduce((n, i) => n + i.qty, 0)} item(s)</span><b>${money(o.total)}</b></div></div>`
            )
            .join("")
        : '<p class="muted">You have no orders yet.</p>'
    }
  `);
});

/* ---------- Video / Learn more ---------- */
const flowHTML = `
  <div class="flow">
    <div class="flow__node"><div>👣</div>Tiles</div><span class="flow__arrow"></span>
    <div class="flow__node"><div>⚙️</div>Controller</div><span class="flow__arrow"></span>
    <div class="flow__node"><div>🔋</div>Battery</div><span class="flow__arrow"></span>
    <div class="flow__node"><div>🔌</div>USB-C</div>
  </div>`;

$("#videoBtn").addEventListener("click", () =>
  openModal(`
    <h3>KinetiVan in 30 seconds</h3>
    <p class="muted">Every step you take inside your van presses a kinetic tile. That motion becomes electricity that flows to the controller, gets stored in the buffer battery and powers your devices via USB-C.</p>
    ${flowHTML}
    <a href="#app" class="btn btn--green btn--block" data-close>Try the live demo</a>
  `)
);

$("#learnMoreBtn").addEventListener("click", () =>
  openModal(`
    <h3>How KinetiVan works</h3>
    ${flowHTML}
    <div class="summary">
      <div><span>Energy per step</span><b>2–8 W</b></div>
      <div><span>Daily generation (8 tiles)</span><b>200–400 Wh</b></div>
      <div><span>Battery capacity</span><b>250 / 500 Wh</b></div>
      <div><span>Tile rating</span><b>IP65</b></div>
      <div><span>Warranty</span><b>3 years</b></div>
    </div>
    <a href="#shop" class="btn btn--green btn--block" data-close>See the kits</a>
  `)
);

/* =========================================================
   DEMO INTERACTIVA DE LA APP
   ========================================================= */
const CAPACITY = 500; // Wh
const state = store.get("kv-demo", { battery: 72, generated: 320, usbOn: true });
const RING_LEN = 2 * Math.PI * 52;

// Construir losetas
const tileGrid = $("#tileGrid");
tileGrid.innerHTML = Array.from({ length: 8 }, (_, i) => `<button class="tile" data-tile="${i}" aria-label="Tile ${i + 1}"></button>`).join("");
const tiles = $$(".tile", tileGrid);
let flowWatts = 0;

function step(tile) {
  tile.classList.add("on");
  setTimeout(() => tile.classList.remove("on"), 600);
  const watts = 2 + Math.random() * 6; // 2–8 W por paso
  flowWatts = Math.round(watts);
  state.generated += watts / 10;
  state.battery = Math.min(100, state.battery + watts / 25);
  $("#ring").classList.remove("charging");
  void $("#ring").offsetWidth;
  $("#ring").classList.add("charging");
  updateUI();
}

tiles.forEach((t) => t.addEventListener("click", () => step(t)));

// Toggle USB-C
$("#usbToggle").addEventListener("click", () => {
  state.usbOn = !state.usbOn;
  toast(state.usbOn ? "🔌 USB-C output turned on" : "⏻ USB-C output turned off");
  updateUI();
});

// Navegación del teléfono
$$(".phone__nav button").forEach((b) =>
  b.addEventListener("click", () => {
    $$(".phone__nav button").forEach((x) => x.classList.toggle("active", x === b));
    $$(".screen").forEach((s) => s.classList.toggle("active", s.dataset.screen === b.dataset.go));
  })
);

// Simular caminar automáticamente
let walkTimer = null;
$("#autoWalk").addEventListener("change", (e) => {
  clearInterval(walkTimer);
  if (e.target.checked) {
    walkTimer = setInterval(() => step(tiles[Math.floor(Math.random() * tiles.length)]), 450);
    toast("👣 Walking simulation on");
  }
});

// Consumo: si el USB-C está encendido la batería baja poco a poco
setInterval(() => {
  if (state.usbOn) state.battery = Math.max(0, state.battery - 0.15);
  if (state.battery === 0 && state.usbOn) {
    state.usbOn = false;
    toast("🔋 Battery empty — USB-C turned off");
  }
  flowWatts = Math.max(0, flowWatts - 1);
  updateUI();
}, 1500);

function updateUI() {
  const pct = Math.round(state.battery);
  const usbW = state.usbOn ? 12 : 0;

  // Anillo
  const ring = $("#ringFg");
  ring.style.strokeDasharray = RING_LEN;
  ring.style.strokeDashoffset = RING_LEN * (1 - state.battery / 100);
  ring.style.stroke = pct < 20 ? "#e06b6b" : "var(--green)";
  $("#batteryPct").textContent = pct;
  $("#genWh").textContent = Math.round(state.generated);

  // USB-C
  $("#usbState").textContent = state.usbOn ? "On" : "Off";
  $("#usbWatts").textContent = usbW + " W";
  $("#usbToggle").classList.toggle("off", !state.usbOn);
  const us = $("#usbStatus");
  us.textContent = state.usbOn ? "On" : "Off";
  us.className = state.usbOn ? "ok" : "bad";

  // Tiles
  $("#activeTiles").textContent = $$(".tile.on").length;
  $("#flowW").textContent = flowWatts;

  // Batería
  $("#barFill").style.width = pct + "%";
  $("#barPct").textContent = pct + "%";
  const stored = Math.round((state.battery / 100) * CAPACITY);
  $("#storedWh").textContent = stored + " Wh";
  if (usbW) {
    const mins = Math.round((stored / usbW) * 60) / 10; // escala demo
    const h = Math.floor(mins / 60);
    $("#remaining").textContent = `${h} h ${Math.round(mins % 60)} min`;
  } else {
    $("#remaining").textContent = "—";
  }
  $("#temp").textContent = (23 + flowWatts / 4).toFixed(0) + "°C";

  store.set("kv-demo", state);
}

/* =========================================================
   QR decorativo
   ========================================================= */
(function buildQR() {
  const size = 21;
  const cells = [];
  const finder = (x, y) => {
    const inBox = (ox, oy) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
    for (const [ox, oy] of [[0, 0], [14, 0], [0, 14]]) {
      if (inBox(ox, oy)) {
        const dx = x - ox, dy = y - oy;
        const ring = dx === 0 || dx === 6 || dy === 0 || dy === 6;
        const core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
        return ring || core ? 1 : 0;
      }
    }
    return null;
  };
  let seed = 7;
  const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const f = finder(x, y);
      const on = f === null ? rand() > 0.5 : f === 1;
      cells.push(`<i class="${on ? "" : "w"}"></i>`);
    }
  $("#qr").innerHTML = cells.join("");
})();

/* =========================================================
   FORMULARIO DE CONTACTO
   ========================================================= */
function validateForm(form) {
  let ok = true;
  $$("input, textarea", form).forEach((input) => {
    const field = input.closest(".field");
    const err = $(".error", field);
    let msg = "";
    const v = input.value.trim();
    if (input.required && !v) msg = "This field is required";
    else if (input.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = "Enter a valid email";
    else if (input.name === "message" && v.length < 10) msg = "Message must be at least 10 characters";
    field.classList.toggle("invalid", !!msg);
    err.textContent = msg;
    if (msg) ok = false;
  });
  return ok;
}

$("#contactForm").addEventListener("submit", (e) => {
  e.preventDefault();
  if (!validateForm(e.target)) return;
  const msgs = store.get("kv-messages", []);
  msgs.push({ ...Object.fromEntries(new FormData(e.target)), date: new Date().toISOString() });
  store.set("kv-messages", msgs);
  e.target.reset();
  toast("✓ Message sent! We'll reply within 24 hours.");
});

/* =========================================================
   GALERÍA + LIGHTBOX
   Las fotos vienen de Unsplash (licencia libre).
   Para usar tus propias fotos, cambia "src" por "img/tu-foto.jpg".
   ========================================================= */
const U = (id, w = 1200) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const PHOTOS = [
  { id: "1549194898-60fd030ecc0f", cat: "mountain", cap: "Parked under the peaks", big: true },
  { id: "1782117627915-cc22efcd12bf", cat: "coast", cap: "Ocean views, full battery" },
  { id: "1780886661843-abc65352bd01", cat: "forest", cap: "Forest campsite at dusk" },
  { id: "1649284538754-8d69dfa984cc", cat: "inside", cap: "Waking up by the sea", tall: true },
  { id: "1688619103602-35c5b27a6619", cat: "mountain", cap: "Winding mountain roads" },
  { id: "1656426650699-a76ffe479608", cat: "coast", cap: "Beach day, zero noise" },
  { id: "1778402620479-64bb441d5826", cat: "forest", cap: "Powered under the stars" },
  { id: "1627386173348-4b19a6feefda", cat: "inside", cap: "A kitchen that runs on steps" },
  { id: "1515876305430-f06edab8282a", cat: "forest", cap: "Golden hour off-grid", big: true },
  { id: "1743612216604-647a11178fae", cat: "coast", cap: "Surf trip ready" },
  { id: "1644949733491-7432ea0c2a98", cat: "mountain", cap: "Snow roads, warm inside" },
  { id: "1627386172764-1d1b7ea90b66", cat: "inside", cap: "Wood, light and clean energy" },
];

let visiblePhotos = PHOTOS;
let lbIndex = 0;

function renderGallery(filter = "all") {
  visiblePhotos = filter === "all" ? PHOTOS : PHOTOS.filter((p) => p.cat === filter);
  $("#galleryGrid").innerHTML = visiblePhotos
    .map(
      (p, i) => `
      <button class="g-item ${filter === "all" && p.big ? "big" : ""} ${filter === "all" && p.tall ? "tall" : ""}" data-photo="${i}">
        <img src="${U(p.id, 800)}" alt="${p.cap}" loading="lazy" onerror="this.parentElement.classList.add('noimg')" />
        <span>${p.cap}</span>
      </button>`
    )
    .join("");
}

$$(".chip").forEach((c) =>
  c.addEventListener("click", () => {
    $$(".chip").forEach((x) => x.classList.toggle("active", x === c));
    renderGallery(c.dataset.filter);
  })
);

const lb = $("#lightbox");
function openLightbox(i) {
  lbIndex = (i + visiblePhotos.length) % visiblePhotos.length;
  const p = visiblePhotos[lbIndex];
  $("#lbImg").src = U(p.id, 1800);
  $("#lbImg").alt = p.cap;
  $("#lbCap").textContent = `${p.cap}  ·  ${lbIndex + 1} / ${visiblePhotos.length}`;
  lb.classList.add("show");
}
$("#galleryGrid").addEventListener("click", (e) => {
  const item = e.target.closest("[data-photo]");
  if (item) openLightbox(Number(item.dataset.photo));
});
lb.addEventListener("click", (e) => {
  const a = e.target.closest("[data-lb]")?.dataset.lb;
  if (a === "prev") openLightbox(lbIndex - 1);
  else if (a === "next") openLightbox(lbIndex + 1);
  else if (a === "close" || e.target === lb) lb.classList.remove("show");
});
document.addEventListener("keydown", (e) => {
  if (!lb.classList.contains("show")) return;
  if (e.key === "ArrowLeft") openLightbox(lbIndex - 1);
  if (e.key === "ArrowRight") openLightbox(lbIndex + 1);
  if (e.key === "Escape") lb.classList.remove("show");
});

/* =========================================================
   TESTIMONIOS
   ========================================================= */
const TESTIMONIALS = [
  { name: "Lucía & Marco", trip: "Baja California, 6 months", photo: "1656426650699-a76ffe479608", text: "We barely turn on the generator anymore. Just cooking and moving around the van keeps our phones and lights charged." },
  { name: "Daniel R.", trip: "Rocky Mountains, full-time", photo: "1549194898-60fd030ecc0f", text: "Installation took one afternoon. Seeing the battery go up in the app while I walk around is honestly addictive." },
  { name: "Sofía M.", trip: "Pacific coast road trip", photo: "1782117627915-cc22efcd12bf", text: "Silent, clean and it actually works on cloudy days when my solar panel doesn't. Best upgrade I've made." },
];

$("#testiGrid").innerHTML = TESTIMONIALS.map(
  (t) => `
  <article class="testi reveal">
    <div class="testi__img" style="background-image:url('${U(t.photo, 700)}')"></div>
    <div class="testi__body">
      <div class="stars">★★★★★</div>
      <p>“${t.text}”</p>
      <b>${t.name}</b><small>${t.trip}</small>
    </div>
  </article>`
).join("");
$$("#testiGrid .reveal").forEach((el) => revealObserver.observe(el));

/* =========================================================
   CONTADORES ANIMADOS
   ========================================================= */
const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count);
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / 1600);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toLocaleString("en-US") + (p === 1 && target > 1000 ? "+" : "");
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countObserver.unobserve(el);
  });
}, { threshold: 0.5 });
$$("[data-count]").forEach((el) => countObserver.observe(el));

/* ---------- Inicio ---------- */
renderGallery();
renderProducts();
renderCart();
updateUI();
