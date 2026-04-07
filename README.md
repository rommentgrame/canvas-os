# Canvas OS 🎨

Plateforme de création visuelle ultra-avancée. Canvas libre, cartes mentales, dashboards — pensée pour dépasser Notion et Excel dans la structuration visuelle de projets.

---

## ✨ Fonctionnalités

- **Canvas interactif** — pan, zoom (molette), grille intelligente
- **7 types de nœuds** — Texte, Note, Image, Forme, Tableau, Lien, Carte mentale
- **Connexions visuelles** entre nœuds (flèches courbes)
- **Drag & drop + Redimensionnement** natif
- **Pages multiples** (style Excel) avec clic droit pour renommer/dupliquer
- **Sidebar** — Outils / Calques / Recherche
- **Panneau de propriétés** à droite sur sélection
- **Export / Import JSON** — sauvegarde complète du projet
- **Auto-save** dans localStorage toutes les 1,5 secondes
- **Dark mode natif** — design minimaliste noir & blanc

---

## 🚀 Installation locale

```bash
# 1. Cloner le dépôt
git clone https://github.com/rommentgrame/canvas-os.git
cd canvas-os

# 2. Installer les dépendances
npm install

# 3. Lancer en développement
npm run dev
```

Ouvrir **http://localhost:5173** dans votre navigateur.

---

## 📦 Build de production

```bash
npm run build
# Les fichiers sont générés dans /dist
npm run preview  # Prévisualiser le build
```

---

## 🌐 Déploiement GitHub Pages (automatique)

### Première mise en place

1. **Créer le dépôt GitHub** nommé `canvas-os` sous `rommentgrame`

2. **Activer GitHub Pages** dans les paramètres du dépôt :
   - Settings → Pages → Source : **GitHub Actions**

3. **Vérifier `vite.config.js`** — le nom du repo doit correspondre :
   ```js
   const REPO_NAME = 'canvas-os'  // ← votre nom de dépôt
   ```

4. **Push sur la branche `main`** :
   ```bash
   git init
   git add .
   git commit -m "feat: initial Canvas OS"
   git remote add origin https://github.com/rommentgrame/canvas-os.git
   git push -u origin main
   ```

5. GitHub Actions lance automatiquement le build et le déploiement.

6. L'application sera disponible sur :
   ```
   https://rommentgrame.github.io/canvas-os/
   ```

### Déploiements suivants

Chaque `git push origin main` déclenche automatiquement un nouveau déploiement. C'est tout.

---

## ⌨️ Raccourcis clavier

| Touche | Action |
|--------|--------|
| `V` | Outil Sélection |
| `H` | Outil Déplacement (pan) |
| `T` | Insérer un Texte |
| `N` | Insérer une Note |
| `I` | Insérer une Image |
| `S` | Insérer une Forme |
| `D` | Insérer un Tableau |
| `L` | Insérer un Lien |
| `M` | Insérer un nœud Mental |
| `C` | Outil Connexion |
| `Ctrl+S` | Sauvegarder |
| `Delete` | Supprimer la sélection |
| `Escape` | Désélectionner |
| `Shift+Click` | Multi-sélection |
| Molette | Zoom |
| Clic molette | Pan |
| Double-clic nœud | Éditer le contenu |
| Clic droit | Menu contextuel |

---

## 🗂️ Structure du projet

```
canvas-os/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions — déploiement automatique
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx                # Point d'entrée React
│   ├── App.jsx                 # Composant principal — tout l'état global
│   ├── utils.js                # Constantes, factories, localStorage
│   ├── ui.jsx                  # Composants UI réutilisables (Ico, Tip, IBtn…)
│   ├── TopBar.jsx              # Barre supérieure
│   ├── Sidebar.jsx             # Sidebar gauche (outils / calques / recherche)
│   ├── CanvasNode.jsx          # Nœud canvas (drag, resize, connect, ports)
│   ├── NodeContent.jsx         # Contenu des nœuds (Text, Note, Image…)
│   ├── Connections.jsx         # Couche SVG des connexions
│   └── Panels.jsx              # RightPanel, ContextMenu, ZoomBar, BottomBar
├── index.html
├── vite.config.js
├── package.json
├── .gitignore
├── .env.example
└── README.md
```

---

## 🔐 Variables d'environnement

```bash
cp .env.example .env
# Éditer .env avec vos valeurs
```

Le fichier `.env` est dans `.gitignore` — il ne sera jamais commité.

---

## 🛠️ Stack technique

| Couche | Technologie | Justification |
|--------|-------------|---------------|
| Framework | React 18 | Composants, hooks, state réactif |
| Build | Vite 5 | HMR ultra-rapide, build optimisé |
| Canvas | DOM + CSS transforms | Zéro dépendance, contrôle total |
| Connexions | SVG inline | Courbes quadratiques légères |
| Persistence | localStorage | Fonctionne sans backend |
| Deploy | GitHub Pages + Actions | Gratuit, automatique |

---

## 📄 Licence

MIT — libre d'utilisation et de modification.
