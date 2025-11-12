// js/includes.js
async function includeHTML(selector, url) {
  const host = document.querySelector(selector);
  if (!host) return;
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`No se pudo cargar ${url}`);
  host.innerHTML = await res.text();
}

function adjustMainOffset() {
  const header = document.querySelector('header');       // del fragmento header.html
  const main = document.querySelector('main');         // el único main de index
  if (header && main) {
    main.style.marginTop = `${header.offsetHeight}px`;
  }
}

(async () => {
  // Inserta header y luego ajusta offset
  await includeHTML('#site-header', './header.html');
  adjustMainOffset();

  // Inserta el contenido del main (NO trae <main>), y el footer
  await includeHTML('#site-main', './main.html');
  await includeHTML('#site-footer', './footer.html');
 

  // Recalcular en resize (por si cambia la altura)
  window.addEventListener('resize', adjustMainOffset);

  // Recalcular cuando carguen fuentes/íconos que puedan alterar altura
  window.addEventListener('load', adjustMainOffset);
})();

document.addEventListener('click', function (event) {
  var menu = document.getElementById('navbarNav');
  var isClickInsideMenu = menu.contains(event.target);
  var isClickOnToggle = document.querySelector('.navbar-toggler').contains(event.target);

  if (!isClickInsideMenu && !isClickOnToggle) {
    if (menu.classList.contains('show')) {
      var bsCollapse = new bootstrap.Collapse(menu, {
        toggle: false
      });
      bsCollapse.hide();
    }
  }
});