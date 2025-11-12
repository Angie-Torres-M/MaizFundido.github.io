(() => {
  /* ========= Utilidades ========= */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const debounce = (fn, wait = 100) => {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
  };

  /* ========= 1) Compensación del header fijo ========= */
  function setHeaderOffset() {
    const header = $('header.fixed-top') || $('#site-header');
    const h = header ? header.offsetHeight : 0;
    document.body.style.paddingTop = (h || 0) + 'px';
  }

  /* ========= 2) Carrito / Cotización ========= */
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('cart')) || []; } catch { cart = []; }
  const saveCart = () => localStorage.setItem('cart', JSON.stringify(cart));

  function renderCart() {
    const cartItemsList = $('#cart-items');   // tbody
    const cartTotal = $('#cart-total');
    const cartCount = $('.cart-count');

    if (!cartItemsList || !cartTotal) return;

    cartItemsList.innerHTML = '';
    let total = 0, totalCount = 0;

    cart.forEach((p, i) => {
      const price = Number(p.price) || 0;
      const qty = Number(p.quantity) || 1;
      const subtotal = price * qty;
      total += subtotal;
      totalCount += qty;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${p.name}</td>
        <td>$${price.toFixed(2)}</td>
        <td><input type="number" value="${qty}" min="1" class="quantity form-control form-control-sm" data-index="${i}" style="width:80px"></td>
        <td>$${subtotal.toFixed(2)}</td>
        <td><button class="btn btn-sm btn-danger remove-from-cart" data-index="${i}">Eliminar</button></td>
      `;
      cartItemsList.appendChild(tr);
    });

    cartTotal.textContent = total.toFixed(2);
    if (cartCount) cartCount.textContent = totalCount;
    saveCart();
  }

  /* ========= 3) DOM Ready ========= */
  document.addEventListener('DOMContentLoaded', () => {
    // Compensación del header fijo
    setHeaderOffset();
    window.addEventListener('resize', debounce(setHeaderOffset, 120));

    const headerEl = $('header.fixed-top') || $('#site-header');
    if (headerEl && 'MutationObserver' in window) {
      new MutationObserver(setHeaderOffset).observe(headerEl, { childList: true, subtree: true });
    }

    // Toggle panel cotización (si existe)
    const cartPanel = $('#cart-panel');
    const cotizarBtn = $('#cotizar-btn') || $('#cart-icon');
    if (cotizarBtn && cartPanel) {
      cotizarBtn.addEventListener('click', () => {
        const visible = getComputedStyle(cartPanel).display !== 'none';
        cartPanel.style.display = visible ? 'none' : 'block';
      });
    }

    // Botones "Agregar al carrito"
    $$('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id') || crypto.randomUUID?.() || String(Date.now());
        const name = btn.getAttribute('data-name') || 'Producto';
        const price = parseFloat(btn.getAttribute('data-price') || '0');
        const idx = cart.findIndex(p => p.id === id);
        if (idx >= 0) cart[idx].quantity += 1;
        else cart.push({ id, name, price, quantity: 1 });
        renderCart();
      });
    });

    // Delegación: eliminar / cambiar cantidad
    document.addEventListener('click', (e) => {
      const btn = e.target;
      if (btn.classList?.contains('remove-from-cart')) {
        const i = Number(btn.getAttribute('data-index'));
        if (!Number.isNaN(i)) {
          cart.splice(i, 1);
          renderCart();
        }
      }
    });
    document.addEventListener('change', (e) => {
      const inp = e.target;
      if (inp.classList?.contains('quantity')) {
        const i = Number(inp.getAttribute('data-index'));
        let q = parseInt(inp.value || '1', 10);
        q = Number.isFinite(q) && q > 0 ? q : 1;
        if (cart[i]) cart[i].quantity = q;
        renderCart();
      }
    });

    // Finalizar compra (si hay botón)
    const checkoutBtn = $('#checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (cart.length) {
          alert('¡Compra finalizada!');
          cart = [];
          renderCart();
        } else {
          alert('El carrito está vacío.');
        }
      });
    }

    // Generar PDF (Cotización) si existe botón
    const cotizacionBtn = $('#cotizacion');
    if (cotizacionBtn) {
      cotizacionBtn.addEventListener('click', () => {
        if (!window.jspdf || !window.jspdf.jsPDF) {
          alert('No se pudo cargar jsPDF.');
          return;
        }
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        let y = 20;
        doc.setFont('helvetica', 'bold');
        doc.text('Cotización de Productos', 10, y); y += 10;

        doc.setFont('helvetica', 'normal');
        if (!cart.length) {
          doc.text('No hay productos en el carrito.', 10, y);
        } else {
          cart.forEach((p, i) => {
            const line = `${i + 1}. ${p.name}  -  ${p.quantity} x $${Number(p.price).toFixed(2)}`;
            doc.text(line, 10, y); y += 8;
          });
          y += 4;
          const total = cart.reduce((acc, p) => acc + (Number(p.price) * Number(p.quantity)), 0);
          doc.setFont('helvetica', 'bold');
          doc.text(`Total: $${total.toFixed(2)} MXN`, 10, y);
        }
        doc.save('cotizacion.pdf');
      });
    }

    // Desplegables “ver más” (hasta 50 si existen)
    function wireToggleDescription(buttonId, contentId) {
      const btn = document.getElementById(buttonId);
      const content = document.getElementById(contentId);
      if (!btn || !content) return;
      btn.addEventListener('click', function () {
        const hidden = getComputedStyle(content).display === 'none';
        content.style.display = hidden ? 'block' : 'none';
        this.innerHTML = hidden
          ? '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#5f6368"><path d="M480-528 296-344l-56-56 240-240 240 240-56 56-184-184Z"/></svg>'
          : '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24" fill="#5f6368"><path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"/></svg>';
      });
    }
    for (let i = 1; i <= 50; i++) wireToggleDescription(`verMasBtn${i}`, `extraContent${i}`);

    // Cerrar navbar colapsable al click fuera (si existe)
    document.addEventListener('click', (event) => {
      const menu = document.getElementById('navbarNav');
      const toggler = document.querySelector('.navbar-toggler');
      if (!menu || !toggler) return;
      const clickInsideMenu = menu.contains(event.target);
      const clickOnToggle = toggler.contains(event.target);
      if (!clickInsideMenu && !clickOnToggle && menu.classList.contains('show')) {
        const bsCollapse = new bootstrap.Collapse(menu, { toggle: false });
        bsCollapse.hide();
      }
    });

    // Carruseles (indicadores SVG) + corrección de índices
    const carousels = $$('.carousel');
    carousels.forEach((carousel, cidx) => {
      const items = $$('.carousel-item', carousel);
      if (!items.length) return;

      const indicatorsContainer =
        document.getElementById(`png-container-0${cidx + 1}`) ||
        $('[data-indicators-target]', carousel) || null;
      if (!indicatorsContainer) return;

      indicatorsContainer.innerHTML = '';
      items.forEach((item, idx) => {
        const indicator = document.createElement('svg');
        indicator.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        indicator.setAttribute('height', '24');
        indicator.setAttribute('width', '24');
        indicator.innerHTML = `
          <path d="M480-320q48 0 85.5-28.5T620-422H340q17 45 54.5 73.5T480-320ZM380-480q25 0 42.5-17.5T440-540q0-25-17.5-42.5T380-600q-25 0-42.5 17.5T320-540q0 25 17.5 42.5T380-480Zm200 0q25 0 42.5-17.5T640-540q0-25-17.5-42.5T580-600q-25 0-42.5 17.5T520-540q0 25 17.5 42.5T580-480Z"/>
        `;
        indicator.style.cursor = 'pointer';
        indicator.classList.add('indicator');
        indicator.addEventListener('click', () => {
          const bsCarousel = bootstrap.Carousel.getOrCreateInstance(carousel);
          bsCarousel.to(idx);
        });
        indicatorsContainer.appendChild(indicator);
      });

      const updateIndicators = () => {
        const activeIndex = items.findIndex(el => el.classList.contains('active'));
        const svgs = $$('.indicator', indicatorsContainer);
        svgs.forEach((svg, idx) => {
          svg.setAttribute('fill', idx === activeIndex ? '#000' : '#ccc');
        });
      };

      carousel.addEventListener('slid.bs.carousel', updateIndicators);
      // Init
      updateIndicators();
    });

    // Zoom en imágenes de carrusel (seguro)
    const zoomImgs = $$('.zoom-image');
    zoomImgs.forEach(image => {
      let scaleValue = 1;
      const carousel = image.closest('.carousel');
      const prevBtn = carousel?.querySelector('.carousel-control-prev') || null;
      const nextBtn = carousel?.querySelector('.carousel-control-next') || null;

      const applyControlsVisibility = () => {
        if (!prevBtn || !nextBtn) return;
        const show = scaleValue === 1.8;
        prevBtn.style.display = show ? 'block' : 'none';
        nextBtn.style.display = show ? 'block' : 'none';
      };

      image.style.transition = 'transform .25s ease';

      image.addEventListener('click', () => {
        scaleValue = scaleValue === 1 ? 1.8 : 1;
        image.style.transform = `scale(${scaleValue})`;
        applyControlsVisibility();
      });

      // Bloquear navegación si no está en zoom
      prevBtn?.addEventListener('click', (e) => { if (scaleValue !== 1.8) e.preventDefault(); });
      nextBtn?.addEventListener('click', (e) => { if (scaleValue !== 1.8) e.preventDefault(); });

      // Estado inicial
      applyControlsVisibility();
    });

    // Pintar carrito si hay datos
    renderCart();
  });
})();

/* === Toggle de panel flotante === */
const cartPanel = document.getElementById('cart-panel');
const openCartBtn = document.getElementById('cotizar-btn') || document.getElementById('cart-icon');
const closeCartBtn = cartPanel ? cartPanel.querySelector('.cart-close') : null;

function showCartPanel() {
  if (!cartPanel) return;
  cartPanel.style.display = 'block';
  // Restaurar última posición si existe
  const saved = localStorage.getItem('cartPanelPos');
  if (saved) {
    try {
      const { x, y } = JSON.parse(saved);
      cartPanel.style.left = x + 'px';
      cartPanel.style.top  = y + 'px';
      cartPanel.style.right = 'auto';       // asegurar que use left/top guardados
      cartPanel.style.transform = 'none';
    } catch {}
  }
}
function hideCartPanel() {
  if (cartPanel) cartPanel.style.display = 'none';
}

openCartBtn && openCartBtn.addEventListener('click', (e) => {
  e.preventDefault();
  if (!cartPanel) return;
  const visible = getComputedStyle(cartPanel).display !== 'none';
  visible ? hideCartPanel() : showCartPanel();
});
closeCartBtn && closeCartBtn.addEventListener('click', hideCartPanel);

/* === Arrastrable (mouse + touch) === */
function makeDraggable(panel, handle) {
  if (!panel || !handle) return;
  let dragging = false, startX = 0, startY = 0, startLeft = 0, startTop = 0;

  const onPointerDown = (clientX, clientY) => {
    dragging = true;
    const rect = panel.getBoundingClientRect();
    startLeft = rect.left + window.scrollX;
    startTop  = rect.top  + window.scrollY;
    startX = clientX;
    startY = clientY;
    // Para usar left/top, anulamos right/transform
    panel.style.right = 'auto';
    panel.style.transform = 'none';
    document.body.style.userSelect = 'none';
  };

  const onPointerMove = (clientX, clientY) => {
    if (!dragging) return;
    let newLeft = startLeft + (clientX - startX);
    let newTop  = startTop  + (clientY - startY);

    // Limitar al viewport
    const vw = window.innerWidth, vh = window.innerHeight;
    const rect = panel.getBoundingClientRect();
    const pw = rect.width, ph = rect.height;

    newLeft = Math.min(Math.max(0, newLeft), vw - pw);
    newTop  = Math.min(Math.max(0, newTop),  vh - ph);

    panel.style.left = newLeft + 'px';
    panel.style.top  = newTop  + 'px';
  };

  const onPointerUp = () => {
    if (!dragging) return;
    dragging = false;
    document.body.style.userSelect = '';
    // Guardar posición
    const rect = panel.getBoundingClientRect();
    localStorage.setItem('cartPanelPos', JSON.stringify({ x: rect.left, y: rect.top }));
  };

  /* Mouse */
  handle.addEventListener('mousedown', (e) => onPointerDown(e.clientX, e.clientY));
  window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY));
  window.addEventListener('mouseup', onPointerUp);

  /* Touch */
  handle.addEventListener('touchstart', (e) => {
    const t = e.touches[0]; if (!t) return;
    onPointerDown(t.clientX, t.clientY);
  }, { passive: true });
  window.addEventListener('touchmove', (e) => {
    const t = e.touches[0]; if (!t) return;
    onPointerMove(t.clientX, t.clientY);
  }, { passive: false });
  window.addEventListener('touchend', onPointerUp);
}

if (cartPanel) {
  const dragHandle = cartPanel.querySelector('.cart-drag-handle');
  makeDraggable(cartPanel, dragHandle);
}

/* === Botón “Ir al carrito” (ya redirige con <a>) ===
   Si quisieras forzar con JS, descomenta:*/

const goToCart = document.getElementById('go-to-cart');
 goToCart && goToCart.addEventListener('click', (e) => {
  e.preventDefault(); window.location.href = './carrito.html';
 });
