// assets/mouvement.js
// ───────────────────────────────────────────────────────────────────────────
// LE MOUVEMENT — « l'écriture se pose »
//
// ⚠️ CHARGÉ DANS <head> SANS `defer`, ET C'EST VOLONTAIRE.
//    La première ligne pose `js` sur <html> avant le premier rendu : les
//    états masqués du CSS n'existent que sous cette classe. Différée, elle
//    arriverait après l'affichage et ferait disparaître des blocs déjà lus.
//
// ⚠️ FICHIER EXTERNE PARCE QUE LA CSP VISE `script-src 'self'`.
//    Ne jamais remettre ce code en ligne dans le HTML : il faudrait
//    `'unsafe-inline'`, et la page de vérification perdrait sa protection
//    contre l'injection de script. Même raison que pour verifier.js.
// ───────────────────────────────────────────────────────────────────────────

document.documentElement.className += " js";

document.addEventListener("DOMContentLoaded", function () {
  /* ═══════════════════════════════════════════════════════════════════════════
   LE MOUVEMENT — en ligne, sans requête, et sans danger pour le contenu
   ═══════════════════════════════════════════════════════════════════════════
   ⚠️ FILET DE SÉCURITÉ OBLIGATOIRE (voir plus bas). Si l'observateur ne se
      déclenche pas — vieux navigateur, onglet restauré, capture d'écran
      automatisée — tout est révélé au bout de 2,5 s. Une animation ratée ne
      doit jamais effacer un texte.
   ⚠️ `unobserve` APRÈS RÉVÉLATION : chaque bloc se pose une fois. Un élément
      qui rejoue son entrée à chaque passage est une distraction, pas une
      animation.
═══════════════════════════════════════════════════════════════════════════ */

  var doux = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var blocs = [].slice.call(document.querySelectorAll(".pose"));
  function montrer(e) { e.classList.add("vu"); }

  if (doux || !("IntersectionObserver" in window)) { blocs.forEach(montrer); }
  else {
    var obs = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (x) { if (x.isIntersecting) { montrer(x.target); obs.unobserve(x.target); } });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });
    blocs.forEach(function (b) { obs.observe(b); });
    setTimeout(function () { blocs.forEach(montrer); }, 2500);   // le filet
  }

  /* La cinquième écriture arrive après les autres, et le total suit.
     C'est le mécanisme du produit joué une fois : un registre qui se remplit
     sous les yeux du groupe. Les données sont celles de la démonstration, et
     le pied du registre le dit. */
  var tardive = document.querySelector("[data-tardive]");
  var total = document.querySelector("[data-total]");
  if (tardive && total && !doux) {
    tardive.style.visibility = "hidden";
    total.textContent = "100 000";
    setTimeout(function () {
      tardive.style.visibility = "";
      tardive.querySelectorAll("td").forEach(function (c, i) {
        c.animate([{ opacity: 0, transform: "translateX(-7px)" }, { opacity: 1, transform: "none" }],
                  { duration: 520, delay: i * 45, easing: "cubic-bezier(.16,1,.3,1)", fill: "backwards" });
      });
      var de = 100000, vers = 125000, t0 = performance.now();
      (function pas(t) {
        var k = Math.min(1, (t - t0) / 760), e = 1 - Math.pow(1 - k, 3);
        total.textContent = Math.round(de + (vers - de) * e).toLocaleString("fr-FR");
        if (k < 1) requestAnimationFrame(pas);
      })(t0);
    }, 1900);
  }

});
