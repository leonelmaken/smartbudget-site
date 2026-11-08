// assets/rejoindre.js
// ───────────────────────────────────────────────────────────────────────────
// LA PAGE D'INVITATION — lire le code, le donner à copier, rien d'autre
//
// ⚠️ FICHIER EXTERNE, comme verifier.js et mouvement.js : la CSP du site vise
//    `script-src 'self'`. Ne jamais remettre ce code en ligne dans le HTML.
//
// ⚠️ AUCUN APPEL RÉSEAU. Cette page ne vérifie pas le jeton et n'interroge
//    aucune API. Seul le serveur sait si un code est valide, au moment où
//    l'application le lui présente. Une page publique qui répondrait « ce
//    code existe » permettrait de balayer l'espace des jetons.
//
// ⚠️ LE JETON N'EST NI JOURNALISÉ NI ENVOYÉ NULLE PART. Il ne sort pas de
//    cette page, sauf vers le presse-papier, à la demande explicite.
// ───────────────────────────────────────────────────────────────────────────

(function () {
  "use strict";

  var SCHEME = "smartbudget://rejoindre/";

  var elCode = document.getElementById("code");
  var elEtat = document.getElementById("etat");
  var btn = document.getElementById("copier");
  var lienApp = document.getElementById("ouvrir");
  var bloc = document.getElementById("bloc-code");

  // Le jeton vient de `?c=`. On accepte aussi `/rejoindre/<jeton>` au cas où
  // une règle de réécriture serait ajoutée côté hébergeur plus tard.
  var jeton = new URLSearchParams(location.search).get("c");
  if (!jeton) {
    var m = location.pathname.match(/\/rejoindre\/([^/?#]+)/);
    if (m) { try { jeton = decodeURIComponent(m[1]); } catch (e) { jeton = null; } }
  }
  if (jeton) jeton = jeton.trim();

  /* Arrivée sans code : on ne laisse pas un tiret et un bouton mort. La page
     se replie sur ce qu'elle peut encore faire — expliquer quoi demander. */
  if (!jeton) {
    bloc.style.display = "none";
    document.querySelector("h1").textContent = "Ce lien est incomplet.";
    document.querySelector(".amorce").textContent =
      "Il manque le code d'invitation. Demandez à la personne qui vous a " +
      "invité de vous renvoyer le lien entier, ou le code seul — les deux " +
      "fonctionnent.";
    lienApp.style.display = "none";
    return;
  }

  elCode.textContent = jeton;
  lienApp.setAttribute("href", SCHEME + encodeURIComponent(jeton));

  btn.addEventListener("click", function () {
    function reussi() {
      elEtat.textContent = "Code copié. Installez l'application, puis collez-le.";
      btn.textContent = "Copié";
      setTimeout(function () { btn.textContent = "Copier le code"; }, 2600);
    }
    function echoue() {
      // ⚠️ ON NE MENT PAS SUR UN ÉCHEC DE COPIE. Quelqu'un qui croit avoir
      //    copié son code part installer l'application et revient les mains
      //    vides, sur une page qu'il ne retrouvera pas.
      elEtat.textContent =
        "La copie automatique a échoué. Sélectionnez le code ci-dessus et " +
        "copiez-le à la main.";
      try {
        var s = window.getSelection(), r = document.createRange();
        r.selectNodeContents(elCode); s.removeAllRanges(); s.addRange(r);
      } catch (e) { /* sélection impossible : le texte reste lisible */ }
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(jeton).then(reussi, echoue);
    } else {
      echoue();
    }
  });
})();
