# smartbudget-site

Site public de **SmartBudget Africa**. Quatre pages statiques, aucune
dépendance, aucun code source applicatif.

> ⚠️ **Ce dépôt est public.** Rien qui touche au backend ou au mobile n'y entre :
> pas de clé, pas d'URL de base de données, pas de schéma, pas de capture d'API.
> La seule adresse qui y figure est celle de l'endpoint public de vérification,
> qui est de toute façon imprimée sur chaque passeport.

## À quoi il sert

| Page | Rôle |
|---|---|
| `index.html` | Présentation, et la phrase « SmartBudget ne détient aucun fonds » |
| `verifier.html` | **Le cœur** — l'adresse imprimée sur chaque passeport financier |
| `institutions.html` | Ce qu'un passeport prouve et ne prouve pas (lecteur : agent d'EMF) |
| `telecharger.html` | Accès à l'application pendant la phase d'observation |
| `conditions.html` · `confidentialite.html` · `suppression-compte.html` | Obligations Google Play et RGPD |

`suppression-compte.html` est **obligatoire** : Google Play exige une URL web
publique de suppression de compte, en plus de la suppression dans
l'application.

## Contraintes de conception

**Aucune dépendance externe.** Pas de police Google, pas de CDN, pas de
framework, pas de traceur. Ce site est consulté depuis le téléphone d'un agent
d'EMF sur un réseau camerounais, parfois en 2G. Chaque requête vers un domaine
tiers est une seconde d'attente et un risque d'échec. Et un site qui reçoit des
numéros de documents n'a pas à les partager avec qui que ce soit.

**Aucune donnée personnelle affichée.** `verifier.html` montre uniquement :
statut, empreinte courte, dates, et si les montants ont été inclus. Jamais de
nom, de montant, de taux ni de nombre de tontines. Quelqu'un qui tient le
papier a déjà tout cela sous les yeux ; quelqu'un qui ne l'a pas n'a aucune
raison de l'obtenir en tapant huit caractères.

**Le serveur répond toujours HTTP 200**, même pour un numéro inconnu. Un 404
serait un oracle : il permettrait de balayer l'espace des numéros pour
découvrir lesquels existent.

**Pas de mode sombre.** Ce site sert à lire un papier posé à côté de l'écran,
souvent en plein jour. Contrairement à l'application.

## Modifier l'adresse de l'API

Une seule occurrence, en haut de `assets/verifier.js` :

```js
const API = 'https://smartbudget-api-kbh8.onrender.com';
```

Après tout changement d'origine — du site **ou** de l'API — le backend doit
autoriser la nouvelle : variable `CORS_ORIGINS` sur Render. Sans cela le
navigateur rejette l'appel avant même de lire la réponse, et la page reste
bloquée sur « Vérification impossible ».

## Pourquoi le JavaScript est dans un fichier séparé

Pour permettre `script-src 'self'` dans la CSP. Un `<script>` inline oblige à
autoriser `'unsafe-inline'`, ce qui désarme la protection principale contre
l'injection. Sur une page dont le rôle est d'affirmer qu'un document est
authentique, un script injecté pourrait afficher « Document authentique » sur
n'importe quoi.

## Hébergement : Render Static Site

Dashboard Render → **New > Static Site** → dépôt `smartbudget-site`.

| Champ | Valeur |
|---|---|
| Branch | `main` |
| Root Directory | *(vide)* |
| Build Command | *(vide)* |
| Publish Directory | `.` |

Pas de build : ce sont des fichiers HTML servis tels quels. Ajouter la variable
d'environnement `SKIP_INSTALL_DEPS=true` pour que Render n'essaie pas de
détecter des dépendances inexistantes.

### En-têtes de réponse (Settings → Headers)

C'est la raison principale de préférer Render à GitHub Pages ici : Pages ne
permet aucun en-tête personnalisé.

Chemin `/*` :

```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Content-Security-Policy: default-src 'none'; script-src 'self'; style-src 'self'; connect-src https://smartbudget-api-kbh8.onrender.com; img-src 'self' data:; base-uri 'none'; form-action 'none'
```

`X-Frame-Options: DENY` n'est pas décoratif : sans lui, un site frauduleux peut
afficher cette page de vérification dans un cadre invisible pour emprunter sa
crédibilité. `Referrer-Policy: no-referrer` évite que le numéro de document,
présent dans l'URL en cas de lecture d'un QR code, parte dans l'en-tête
`Referer` vers un tiers.

Le déploiement se déclenche à chaque `git push` sur `main` et prend environ une
minute.

`.nojekyll` ne sert qu'en repli sur GitHub Pages ; il est sans effet sur Render
et ne coûte rien.

## Si le domaine change un jour

Les passeports déjà émis portent l'ancienne adresse imprimée. Deux filets :
un passeport expire au bout de 90 jours, et l'ancienne adresse peut rester en
redirection permanente vers la nouvelle. Aucun document ne devient
invérifiable.

## Vérifier avant de pousser

Ouvrir les cinq pages en local et contrôler :

- chaque lien de la barre de navigation et du pied de page aboutit ;
- `verifier.html?n=SB-0000-XXXXXXXX` affiche « Numéro inconnu » et non une erreur ;
- couper le réseau : le message doit être « Vérification impossible », jamais
  « document invalide ». Accuser un document authentique à cause d'une coupure
  serait la pire erreur que ce site puisse commettre.
