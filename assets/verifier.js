/* ═══════════════════════════════════════════════════════════════════════════
   Vérification d'un passeport financier
   ═══════════════════════════════════════════════════════════════════════════

   ⚠️ POURQUOI CE CODE EST DANS UN FICHIER SÉPARÉ ET NON DANS UN <script> INLINE
      Pour pouvoir servir la page avec une Content-Security-Policy stricte
      (`script-src 'self'`). Un script inline oblige à autoriser
      'unsafe-inline', ce qui désarme la protection principale contre
      l'injection de script. Sur une page dont le rôle est d'affirmer qu'un
      document est authentique, un script injecté pourrait afficher
      « Document authentique » sur n'importe quoi.
   ═══════════════════════════════════════════════════════════════════════════ */

// ⚠️ L'ADRESSE DE L'API, EN UN SEUL ENDROIT.
//    Si elle change, elle change ici — pas dans trois fichiers.
//    Elle doit aussi figurer dans CORS_ORIGINS côté backend, sinon le
//    navigateur rejette l'appel et la page reste muette.
const API = 'https://smartbudget-api-kbh8.onrender.com';

const form  = document.getElementById('form');
const input = document.getElementById('num');
const out   = document.getElementById('out');
const go    = document.getElementById('go');

function show(cls, title, body) {
  // textContent et non innerHTML : le numéro saisi vient de l'utilisateur et
  // ne doit jamais être interprété comme du HTML.
  out.innerHTML = '';
  const box = document.createElement('div');
  box.className = 'result ' + cls;
  const h = document.createElement('h3');
  h.textContent = title;
  box.appendChild(h);
  if (body) { const p = document.createElement('p'); p.textContent = body; box.appendChild(p); }
  out.appendChild(box);
  return box;
}

function line(box, text, marginTop) {
  const p = document.createElement('p');
  if (marginTop) p.style.marginTop = marginTop;
  p.textContent = text;
  box.appendChild(p);
  return p;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const raw = input.value.trim();

  if (!raw) {
    show('warn', 'Saisissez un numéro', 'Le numéro se trouve en haut du document, sous le bandeau vert.');
    return;
  }

  go.disabled = true;
  go.textContent = 'Vérification…';
  out.innerHTML = '';

  try {
    // Le serveur normalise lui-même la saisie : tirets, espaces, minuscules.
    // On lui envoie ce que la personne a tapé, sans la corriger ici — deux
    // normalisations qui divergent, c'est un bug qui n'arrive qu'en production.
    const url = API + '/api/public/passport/' + encodeURIComponent(raw);

    // ⚠️ RÉVEIL DU SERVEUR — ET POURQUOI LE RATTRAPAGE EST DANS UN try/catch.
    //    L'hébergement gratuit met l'instance API en veille après quelques
    //    minutes d'inactivité. Cette page est consultée rarement : la veille est
    //    le cas NORMAL, pas l'exception. Sans rattrapage, un agent d'EMF verrait
    //    « Vérification impossible » à presque chaque usage et cesserait
    //    d'utiliser l'outil.
    //
    //    Subtilité constatée en test, pas devinée : la réponse d'erreur de
    //    l'hébergeur ne porte PAS les en-têtes CORS. Le navigateur rejette donc
    //    fetch() au lieu de renvoyer une réponse 503 lisible — impossible de
    //    tester res.status, l'exception arrive avant. Le rattrapage doit donc
    //    attraper l'exception, pas inspecter un code de statut.
    const ATTEMPTS = 5, PAUSE = 8000;
    let res = null, lastError = null;

    for (let i = 0; i < ATTEMPTS; i++) {
      if (i === 1) {
        show('warn', 'Réveil du serveur…',
          'Première vérification depuis un moment. Le serveur démarre — patientez une trentaine de secondes.');
      }
      try {
        const r = await fetch(url);
        if (r.status === 502 || r.status === 503) { lastError = new Error('http ' + r.status); }
        else { res = r; break; }
      } catch (err) { lastError = err; }
      if (i < ATTEMPTS - 1) await new Promise(r => setTimeout(r, PAUSE));
    }

    out.innerHTML = '';
    if (!res) throw lastError || new Error('injoignable');

    // ⚠️ NE JAMAIS DÉDUIRE « NUMÉRO INCONNU » D'UNE RÉPONSE QUI N'EN EST PAS UNE.
    //    Le serveur répond TOUJOURS 200 pour une vérification — un 404 serait un
    //    oracle permettant de balayer l'espace des numéros pour découvrir
    //    lesquels existent. Donc tout code autre que 200 signifie serveur
    //    indisponible, mal déployé, ou endpoint déplacé : jamais document faux.
    //    Sans ce garde-fou, un backend non déployé renvoie un 404 JSON, `data`
    //    est absent, et la page accuse de faux un document parfaitement valide.
    if (!res.ok) throw new Error('http ' + res.status);

    const body = await res.json();
    const d = (body && body.data) || {};

    // Même logique : un corps qui ne porte pas un statut reconnu n'est pas une
    // réponse de vérification. On ne l'interprète pas, on le signale.
    if (['VALID', 'REVOKED', 'EXPIRED', 'UNKNOWN'].indexOf(d.status) === -1) {
      throw new Error('payload inattendu');
    }

    if (d.status === 'VALID') {
      const box = show('valid', 'Document authentique',
        'Ce numéro correspond à un passeport émis par SmartBudget Africa, actuellement valide.');

      const lbl = document.createElement('p');
      lbl.style.marginTop = '12px';
      const strong = document.createElement('strong');
      strong.textContent = 'Empreinte enregistrée — comparez-la avec celle imprimée :';
      lbl.appendChild(strong);
      box.appendChild(lbl);

      const fp = document.createElement('div');
      fp.className = 'fingerprint';
      fp.textContent = d.shortFingerprint || '—';
      box.appendChild(fp);

      line(box, 'Émis le ' + (d.issuedAt || '—') + ' · valable jusqu’au ' + (d.expiresAt || '—'));

      // ⚠️ Dire si les montants ont été inclus évite un contresens coûteux :
      //    un agent voyant un document sans chiffres pourrait conclure à un
      //    revenu nul, alors que le titulaire a simplement choisi de ne pas les
      //    publier. La nuance change une décision de crédit.
      line(box, d.amountsIncluded
        ? 'Ce document inclut les montants déclarés par son titulaire.'
        : 'Le titulaire a choisi de ne pas publier ses montants. Cela ne signifie pas qu’ils sont nuls.',
        '8px');

    } else if (d.status === 'REVOKED') {
      show('invalid', 'Document retiré',
        'Ce document a été remplacé par un plus récent, ou retiré par son titulaire. Demandez-lui la version à jour.');

    } else if (d.status === 'EXPIRED') {
      show('warn', 'Document expiré',
        'Ce document a bien été émis par SmartBudget, mais sa période de validité de 90 jours est passée. Les chiffres qu’il porte ne décrivent plus la situation actuelle.');

    } else {
      show('invalid', 'Numéro inconnu',
        'Aucun document ne porte ce numéro. Vérifiez votre saisie — attention aux confusions entre O et 0, ou entre I et 1. Si le numéro est bien recopié, ce document n’a pas été émis par SmartBudget.');
    }
  } catch (err) {
    // ⚠️ On ne dit JAMAIS que le document est faux quand c'est le réseau qui a
    //    échoué. Accuser un document authentique à cause d'une coupure serait la
    //    pire erreur que cette page puisse commettre.
    show('warn', 'Vérification impossible',
      'Le serveur n’a pas répondu. Cela ne dit rien sur le document — réessayez dans un instant.');
  } finally {
    go.disabled = false;
    go.textContent = 'Vérifier';
  }
});

// Pré-remplissage depuis l'adresse : /verifier.html?n=SB-2609-K7M2Q9XF
// Permet de faire un QR code qui ouvre la page déjà remplie.
const preset = new URLSearchParams(location.search).get('n');
if (preset) { input.value = preset; form.requestSubmit(); }
