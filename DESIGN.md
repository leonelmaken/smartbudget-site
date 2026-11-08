# DESIGN.md — site public SmartBudget Africa

Monde visuel : **le registre opposable**. Écrit après la construction, depuis
le code livré. `assets/style.css` fait foi ; ce fichier l'explique.

---

## La thèse

Le site **est** le registre, pas une page qui en parle. Une couverture reliée
qu'on regarde, des pages réglées qu'on lit. Il refuse la page fintech par
défaut — téléphone incliné, dégradé flou, trois cartes à icône — parce que
SmartBudget n'est pas une application qui gère l'argent : c'est une écriture
que personne ne peut réécrire.

**Conséquence tenue partout : il n'y a aucune carte sur ce site.** Les blocs
sont des lignes de registre, séparées par des filets. Une grille de cartes à
ombre portée est exactement le gabarit que cette refonte remplace.

## Deux surfaces, deux fonds

Ce n'est pas un thème clair et un thème sombre. C'est le dessus et le dedans
du même objet, et chacun suit sa scène d'usage.

| Surface | Fond | Pourquoi |
|---|---|---|
| Couverture (accueil, pied) | `--reliure` vert profond | On la regarde. Elle porte la marque et l'offre. |
| Pages (vérification, textes) | `--page` ivoire réglé | On les **lit**, souvent avec un papier posé à côté de l'écran, en plein jour. |

⚠️ Ne jamais poser un fond vert sur la page de vérification. Un agent d'EMF
compare un document imprimé à un écran, dehors.

## Jetons

```css
--reliure: #0B3B2E;  --reliure-haut: #15543F;  --reliure-bas: #072A20;
--dorure:  #C8942A;  --dorure-clair: #E8C675;
--page:    #F7F3E8;  --page-creux:   #EFE9DA;
--encre:   #14130F;  --encre-pale:   #5B5748;
--reglure: #C6D4DF;  --filet:        #DCD4C2;
--credit:  #A8211A;  --credit-vif:   #C62B22;   /* le filet de la colonne crédit */
--tampon:  #1F4FA8;                              /* le bleu de l'encreur */
--mesure:  68ch;
```

**Le rouge est le seul accent**, et il vient du filet qui marque la colonne
crédit d'un registre imprimé : action primaire, filet d'intitulé, verdict
négatif. L'or est réservé à la dorure de la reliure — il n'apparaît jamais sur
fond ivoire. Le bleu ne sert qu'au tampon : visa, mise au point d'un champ.

## Typographie

Trois fontes, servies depuis le dépôt, sous-ensemblées au français. **60 Ko.
Aucune requête vers un tiers.**

| Rôle | Fonte | Pourquoi celle-là |
|---|---|---|
| Titres et texte | **Schola** (TeX Gyre, d'après Century Schoolbook L) | La voix du cahier réglé. Grande hauteur d'x, empattements solides : lisible sur un téléphone bon marché en plein soleil. L'inverse d'un serif élégant choisi pour « faire livre ». |
| Intitulés de colonne, chiffres, chrome | **Etroite** (Liberation Sans Narrow, gras) | Le grotesque étroit en capitales espacées des en-têtes d'un registre imprimé. |

Pas d'italique embarqué : 20 Ko pour un usage marginal. L'emphase passe par le
gras.

Chiffres toujours en `font-variant-numeric: tabular-nums lining-nums` : des
montants qui ne s'alignent pas en colonne ne sont pas des montants.

## Mouvement — « l'écriture se pose »

**Une seule grammaire**, une seule courbe : `cubic-bezier(.16,1,.3,1)`, une
sortie exponentielle qui démarre vite et s'arrête net, comme une plume.

Tout ce qui apparaît arrive **par la gauche**, de dix à douze pixels. Jamais
par le bas, jamais en zoom, jamais en rebond.

Le moment signature : **le registre se remplit**. Quatre écritures à
l'ouverture, la cinquième arrive à 1,9 s, et le total passe de 100 000 à
125 000. C'est le mécanisme du produit joué une fois.

⚠️ **Rien n'est jamais caché durablement.** L'état masqué n'existe que sous
`html.js`, posé par un script en ligne avant le premier rendu, et un filet de
sécurité à 2,5 s révèle tout quoi qu'il arrive. Sans JavaScript, sur un
navigateur ancien, ou si l'observateur ne se déclenche pas, la page est
entière. `prefers-reduced-motion` coupe tout.

## Règles dures

1. **Aucune requête vers un tiers.** Pas de CDN, pas de framework, pas de
   feuille de police hébergée. Accueil complet : 97 Ko non compressé.
2. **La phrase réglementaire** — « SmartBudget ne détient aucun fonds » — est
   sur chaque page, au-dessus de l'action, jamais reléguée en pied. Ce n'est
   pas de la communication : détenir les fonds d'autrui au Cameroun exige
   4 milliards FCFA de capital.
3. **Le verdict de vérification se lit sans la couleur.** Couleur *et* texte.
4. **Les surfaces du navigateur sont thématisées** : sélection, caret, barre
   de défilement, anneau de focus. C'est ce qui distingue une page construite
   d'une page assemblée.
5. **Les données de démonstration portent leur mention.** Le pied du registre
   et l'étiquette de la souche le disent.

## Pièges rencontrés, à ne pas refaire

- **Le registre doit fixer `color: var(--encre)`.** Il est posé sur la
  couverture, qui met `color: var(--page)` : sans cette ligne, les cellules
  héritent de l'ivoire et s'écrivent en ivoire sur ivoire. La table paraît
  vide.
- **`clip-path` sur un `<tr>` ne clippe pas de façon fiable** : les cellules
  sortent vides. On anime les `<td>`.
- **Pas de dégradé à segments sur `.reliure::after`** : les arrêts en
  pourcentage produisaient une encoche de trente pixels qui se lisait comme un
  défaut d'affichage.
