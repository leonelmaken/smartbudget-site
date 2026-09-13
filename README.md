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

Une seule occurrence, en haut du `<script>` de `verifier.html` :

```js
const API = 'https://smartbudget-api-kbh8.onrender.com';
```

Après un changement de domaine, le backend doit autoriser la nouvelle origine :
variable `CORS_ORIGINS` sur Render.

## Publication

GitHub Pages, branche `main`, dossier racine.

```bash
git add -A
git commit -m "..."
git push
```

Le déploiement prend environ une minute.

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
