# .well-known

## assetlinks.json — vérification des liens Android (App Links)

Ce fichier autorise Android à ouvrir SmartBudget directement quand quelqu'un
touche un lien `https://smartbudget-site.onrender.com/rejoindre…`, au lieu
d'ouvrir le navigateur. Sans lui, `autoVerify: true` dans `app.json` ne sert
à rien.

Empreinte actuelle : **clé de téléversement EAS** (keystore `csN0Ym5Qe7`,
créée le 27 mai 2026), lisible sur
`expo.dev/accounts/kinglyon/projects/mobile/credentials`.

> ⚠️ **À METTRE À JOUR LE JOUR DE LA PUBLICATION SUR GOOGLE PLAY.**
>
> Avec *Play App Signing* — activé par défaut — Google **re-signe**
> l'application avec SA clé. L'empreinte qui compte devient alors celle
> affichée dans la Play Console sous **Setup → App integrity → App signing**,
> et non plus celle d'EAS.
>
> Le piège : le lien profond marchera parfaitement sur l'APK de test et
> cessera de marcher sur la version publiée, sans aucun message d'erreur.
> Le plus sûr est de lister **les deux empreintes** dans le tableau
> `sha256_cert_fingerprints` — c'est autorisé, et ça couvre les deux
> versions en circulation.

## Vérifier que le fichier est bien servi

    https://smartbudget-site.onrender.com/.well-known/assetlinks.json

Il doit répondre en `application/json`. Render sert les fichiers tels quels :
rien à configurer. Puis, sur un appareil avec l'application installée :

    adb shell pm verify-app-links --re-verify com.kinglyon.smartbudget
    adb shell pm get-app-links com.kinglyon.smartbudget

L'état attendu est `verified` pour le domaine.
