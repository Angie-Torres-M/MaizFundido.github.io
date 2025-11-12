   (function () {
      function adjustOffset() {
        const header = document.getElementById('site-header');
        if (!header) return;
        const h = header.offsetHeight || 0;
        document.body.style.paddingTop = (h ? h + 16 : 0) + 'px'; // +16px de respiro
      }

      // Recalcula cuando el header se inserte o cambie
      window.addEventListener('load', adjustOffset);
      window.addEventListener('resize', adjustOffset);
      const headerEl = document.getElementById('site-header');
      if (headerEl && 'MutationObserver' in window) {
        new MutationObserver(adjustOffset).observe(headerEl, { childList: true, subtree: true });
      }
    })();
  
  const cartIcon = document.getElementById('cart-icon');
       
        const cartItemsList = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        const cartCount = document.querySelector('.cart-count');

        // Mostrar/ocultar el panel del carrito
        cartIcon.addEventListener('click', () => {
            cartPanel.style.display = (cartPanel.style.display === 'none' || cartPanel.style.display === '') ? 'block' : 'none';
        });

        // Variables para el carrito de compras
        let cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Función para actualizar el carrito en la página
        function updateCart() {
            cartItemsList.innerHTML = '';  // Limpiar el contenido de la tabla
            let total = 0;
            let totalCount = 0;  // Contador total de unidades

            cart.forEach((product, index) => {
                const subtotal = product.price * product.quantity;
                total += subtotal;
                totalCount += product.quantity;  // Acumulando la cantidad de unidades

                const tr = document.createElement('tr');
                tr.innerHTML = `
      <td>${product.name}</td>
      <td>$${product.price}</td>
      <td><input type="number" value="${product.quantity}" min="1" class="quantity" data-index="${index}"></td>
      <td>$${subtotal.toFixed(2)}</td>
      <td><button class="btn btn-danger remove-from-cart" data-index="${index}">Eliminar</button></td>
    `;
                cartItemsList.appendChild(tr);
            });

            cartTotal.textContent = total.toFixed(2);
            cartCount.textContent = totalCount;  // Actualiza el contador total de unidades

            // Actualizar el almacenamiento en localStorage
            localStorage.setItem('cart', JSON.stringify(cart));
        }

        // Agregar producto al carrito
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', () => {
                const id = button.getAttribute('data-id');
                const name = button.getAttribute('data-name');
                const price = parseFloat(button.getAttribute('data-price'));

                const existingProductIndex = cart.findIndex(product => product.id === id);

                if (existingProductIndex !== -1) {
                    cart[existingProductIndex].quantity += 1;
                } else {
                    cart.push({ id, name, price, quantity: 1 });
                }

                updateCart();
            });
        });

        // Eliminar producto del carrito
        document.addEventListener('click', function (e) {
            if (e.target.classList.contains('remove-from-cart')) {
                const index = e.target.getAttribute('data-index');
                cart.splice(index, 1);  // Eliminar el producto del carrito
                updateCart();  // Volver a renderizar el carrito
            }
        });

        // Actualizar cantidad de productos
        document.addEventListener('change', function (e) {
            if (e.target.classList.contains('quantity')) {
                const index = e.target.getAttribute('data-index');
                const newQuantity = parseInt(e.target.value);

                if (newQuantity > 0) {
                    cart[index].quantity = newQuantity;
                } else {
                    cart[index].quantity = 1;
                }

                updateCart();
            }
        });

        // Finalizar Compra
        document.getElementById('checkout-btn').addEventListener('click', () => {
            if (cart.length > 0) {
                alert('¡Compra finalizada!');
                cart = [];
                updateCart();
            } else {
                alert('El carrito está vacío.');
            }
        });

        // Inicializar el carrito en la carga de la página
        updateCart();



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
   Si quisieras forzar con JS, descomenta: */
// const goToCart = document.getElementById('go-to-cart');
// goToCart && goToCart.addEventListener('click', (e) => {
//   e.preventDefault();
//   window.location.href = './carrito.html';
// });
