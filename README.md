# Site de Jamal Moutaouakkil — professeur de mathématiques

Site statique, sans dépendance : trois fichiers, aucun framework, aucune
bibliothèque externe. Les animations (cercle trigonométrique, Pythagore,
Monte-Carlo, Syracuse, courbe des anniversaires) sont écrites à la main en
canevas 2D.

```
docs/
├── index.html
└── assets/
    ├── css/style.css
    ├── js/main.js
    └── files/CV-Jamal-Moutaouakkil.docx
```

## Voir le site en local

```bash
python3 -m http.server 8000 --directory docs
# puis ouvrir http://localhost:8000
```

## Mise en ligne — option A : depuis ce dépôt (immédiat)

Dans **Settings → Pages** du dépôt : *Source* = « Deploy from a branch »,
dossier **`/docs`**, et comme branche celle qui contient réellement `docs/` :
`claude/dads-portfolio-website-ei9ruq` pour publier tout de suite, ou la
branche par défaut du dépôt une fois la pull request fusionnée. Attention,
`main` ne convient pas : cette branche ne contient pas `docs/`. Le site sera
publié sur `https://<compte>.github.io/TweetmyBitcoin/`.

## Mise en ligne — option B : jmoutaouakkil.github.io (l'adresse voulue)

Cette adresse exige un **compte GitHub nommé `jmoutaouakkil`** et un dépôt
public appelé exactement `jmoutaouakkil.github.io`. Une fois le compte créé :

1. créer le dépôt public `jmoutaouakkil.github.io` ;
2. y copier **le contenu du dossier `docs/`** (donc `index.html` à la racine
   du dépôt, pas dans un sous-dossier) ;
3. **Settings → Pages** : source = branche `main`, dossier `/ (root)`.

Le site est alors servi sur `https://jmoutaouakkil.github.io` (l'adresse
déjà inscrite sur le CV).

## Ce qu'il est facile de modifier

| Quoi | Où |
|---|---|
| Textes, parcours, coordonnées | `index.html` |
| Problèmes d'olympiades (énoncé, indice, solution) | `index.html`, section `#olympiades` |
| Couleurs, typographies, espacements | variables `:root` en haut de `style.css` |
| Animations et simulations | modules numérotés de `main.js` |

Le numéro de téléphone et l'adresse e-mail sont en clair dans la section
contact d'`index.html` ; il suffit de supprimer le bloc correspondant pour
les retirer.
