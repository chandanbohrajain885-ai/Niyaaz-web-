/* Version A — brochure rebuild: static menu + branch list, no transactions */
(function () {
  const D = window.NIYAAZ;
  document.getElementById("yr").textContent = new Date().getFullYear();
  document.getElementById("cMenu").innerHTML = D.categories.map(c => {
    const items = D.menu.filter(m => m.cat === c.id);
    return '<div class="mi" style="flex-direction:column"><h4 style="font-family:var(--display);font-size:1.4rem;color:var(--maroon)">' + c.icon + " " + esc(c.name) + '</h4>' +
      items.map(m => '<div style="display:flex;justify-content:space-between;width:100%;border-bottom:1px dashed var(--line);padding:.35rem 0"><span>' + esc(m.name) + '</span><b>' + inr(m.price) + '</b></div>').join("") + '</div>';
  }).join("");
  document.getElementById("cBr").innerHTML = D.branches.map(b => '<article class="br"><span class="city">' + esc(b.city) + '</span><h3>' + esc(b.name) + '</h3><p class="addr">' + esc(b.address) + '</p></article>').join("");
  const t = document.getElementById("menuToggle"), n = document.getElementById("navLinks");
  t.addEventListener("click", () => { const o = n.classList.toggle("open"); t.setAttribute("aria-expanded", o); });
})();
