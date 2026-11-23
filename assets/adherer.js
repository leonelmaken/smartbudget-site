// assets/adherer.js
// La page d'adhésion ne vérifie pas le jeton et ne contacte aucun serveur.
// Le jeton reste en mémoire dans cette fonction et dans le href d'ouverture,
// sans être écrit dans le stockage du navigateur.
(function () {
  "use strict";

  var elLien = document.getElementById("ouvrir");
  var elEtat = document.getElementById("etat");
  var bloc = document.getElementById("bloc-code");
  var lienTelechargement = document.getElementById("store");
  var jeton = new URLSearchParams(location.search).get("p");

  if (typeof jeton === "string") jeton = jeton.trim();

  if (!jeton || !/^[A-Za-z0-9_-]{20,64}$/.test(jeton)) {
    bloc.style.display = "none";
    document.querySelector("h1").textContent = "Ce lien est incomplet.";
    document.querySelector(".amorce").textContent =
      "Demandez à la personne qui vous a invité de vous renvoyer le lien entier.";
    document.querySelector(".note").style.display = "none";
    lienTelechargement.closest("p").style.display = "none";
    return;
  }

  elLien.setAttribute("href", "smartbudget://adherer/" + encodeURIComponent(jeton));
  elEtat.textContent =
    "Appuyez sur « Ouvrir dans SmartBudget ». Si l'application ne s'ouvre pas, " +
    "téléchargez-la puis ouvrez de nouveau ce lien.";
})();
