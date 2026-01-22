📖 README – Éléonore Growth Tracker (version optimisée)
Une application web qui visualise les données de croissance et de nutrition de la petite Éléonore (née le 14 mai 2025).
Le back‑end lit le classeur Excel unique Eléonore.xlsx, expose deux endpoints JSON, et le front‑end affiche des graphiques interactifs (courbes de croissance, consommation de lait, phases d’alimentation).

🎯 Ce que fait l’application
Fonctionnalité	Description
Courbes de croissance	Poids, taille et périmètre crânien tracés selon les courbes de référence OMS (WHO) et CDC (filles 0‑24 mois).
Tableau nutrition	Diagramme en aires des différents laits : Kabrita, Aptamil, Kendamil, France Lait, lait maternel (sein) & biberon + aliments solides.
Phases d’alimentation	Lignes verticales (ex. « Intro Kabrita », « Fin Kendamil », « Intro Solides », etc.) affichées sur le graphique nutrition.
Responsive UI	Construite avec React, Tailwind CSS et Recharts – fonctionne sur ordinateur et mobile.
PWA	Manifest + icônes pwa-192x192.png et pwa-512x512.png (déclarées dans vite.config.js).
Mise à jour sans code	Ajouter une nouvelle semaine de données dans le classeur Excel met automatiquement à jour les graphiques – aucune modification du code n’est nécessaire.
Déploiement sur Render	Un seul clic pour mettre en production (front‑end + API Flask).
🗂️ Structure du dépôt
/
│
├─ .gitignore                # ignore node_modules, dist, venv, __pycache__, …
├─ Procfile                  # Render démarre le serveur Flask avec gunicorn
├─ package.json              # dépendances front‑end + scripts npm
├─ vite.config.js            # Vite + React + plugin PWA
├─ tailwind.config.js        # chemins de recherche Tailwind
├─ postcss.config.js         # Tailwind + autoprefixer
├─ README.md                 # <‑‑ vous êtes ici
│
├─ Eléonore.xlsx            # classeur source (doit rester à la racine)
│
├─ backend/
│   ├─ app.py               # API Flask (parsing Excel, /growth & /nutrition)
│   └─ requirements.txt     # Flask, pandas, openpyxl, python‑dateutil, gunicorn
│
├─ public/
│   ├─ pwa-192x192.png      # icône PWA (déposer ici)
│   └─ pwa-512x512.png      # icône PWA (déposer ici)
│
└─ src/
    ├─ index.html           # point d’entrée Vite (div#root)
    ├─ main.jsx             # bootstrap React (`ReactDOM.createRoot`)
    ├─ App.jsx              # UI principale (onglets, fetch, graphiques)
    ├─ NutritionDashboard.jsx # graphique nutrition + lignes de phase
    ├─ growthData.js        # tables OMS & CDC (poids, taille, tête)
    ├─ index.css            # imports Tailwind + utilitaire .metric-card
    └─ (autres composants éventuels)
🚀 Installation locale (développement)
Prérequis
Outil	Version minimale
Node.js	18 ou supérieur (LTS)
Python	3.9 ou supérieur
Git	toute version récente
Étapes
# 1️⃣ Cloner le dépôt
git clone https://github.com/<votre-utilisateur>/eleonore-growth-tracker.git
cd eleonore-growth-tracker

# 2️⃣ Front‑end
npm install               # installe React, Tailwind, Recharts, etc.
npm run dev               # démarre Vite → http://localhost:5173

# 3️⃣ Back‑end (dans un autre terminal)
python -m venv venv
source venv/bin/activate   # Windows : venv\Scripts\activate
pip install -r backend/requirements.txt
python backend/app.py       # écoute sur http://127.0.0.1:5000

Le front‑end utilise la variable d’environnement REACT_APP_BACKEND_URL. En local, laissez‑la vide ; le code tombera alors sur http://127.0.0.1:5000.
Hot‑reload : toute modification du code React rafraîchit automatiquement le navigateur.
☁️ Déploiement sur Render (production)
Créer un service Web sur Render et le lier à ce dépôt GitHub.

Commande de build (déjà configurée) :

npm install && npm run build

Répertoire publié → dist (Vite génère les fichiers statiques ici).

Procfile (déjà présent à la racine) :

web: cd backend && gunicorn -w 4 -b 0.0.0.0:$PORT app:app

Variables d’environnement (Render → Settings → Environment) :

Nom	Valeur
REACT_APP_BACKEND_URL	https://<votre‑service‑backend>.onrender.com (URL fournie par Render pour le service Flask).
PYTHONUNBUFFERED (optionnel)	1 (facilite la lecture des logs).
Déployer – chaque push sur la branche surveillée déclenche automatiquement le build et le déploiement.

Après le déploiement
Visitez l’URL du front‑end (ex. https://eleonore-growth-tracker.onrender.com).

Les graphiques doivent s’afficher avec les données du classeur.

Testez les endpoints du back‑end directement :

https://<backend>.onrender.com/growth
https://<backend>.onrender.com/nutrition

Ils doivent renvoyer du JSON.

📊 Tables de référence (growthData.js)
OMS : jeu complet de percentiles (p3, p15, p50, p85, p97).
CDC : percentiles officiellement publiés (p3, p50, p97).
Ces tables sont stockées dans src/growthData.js et importées dynamiquement dans App.jsx :

const mod = await import("./growthData");
setTables(mod);   // { omsTables, cdcTables }

Le sélecteur dans l’UI (chartStandard) permet de basculer entre OMS et CDC.

🛠️ Ajouter / Mettre à jour des données
Ajouter une nouvelle semaine dans le classeur Excel
Ouvrez Eléonore.xlsx.

Ajoutez un bloc complet de 7 jours à l’onglet « Lait » (dates, quantités, heures, tétées, totaux, moyenne hebdo).

Enregistrez le fichier, puis :

git add Eléonore.xlsx
git commit -m "Add new week of data (2026‑01‑xx)"
git push origin main

Le back‑end lira automatiquement les nouvelles lignes ; le front‑end affichera les nouvelles valeurs au prochain rafraîchissement.

Ajouter une nouvelle phase d’alimentation (ligne verticale)
Modifiez src/NutritionDashboard.jsx. Le tableau phases se trouve en haut du fichier :

const phases = [
  { label: "Intro Kabrita (Chèvre)", date: "2025-07-29" },
  // 👉 ajoutez votre nouvelle phase ici
  { label: "Fin Kabrita (Chèvre)",   date: "2025-08-09" },
  // …
];

Chaque entrée génère automatiquement une ReferenceLine sur le graphique nutrition.

🤝 Contribuer
Fork le dépôt.
Créez une branche : git checkout -b ma‑nouvelle‑fonction.
Effectuez vos modifications.
(Optionnel) lancez les linters : le projet utilise Prettier via les réglages VS Code ; vous pouvez ajouter ESLint si vous le souhaitez.
Commitez : git commit -m "Add …" puis git push origin ma-nouvelle-fonction.
Ouvrez une Pull Request sur GitHub.
Toutes les contributions sont les bienvenues : corrections de bugs, améliorations UI, nouvelles visualisations, documentation, etc.

📜 Licence
Ce projet est distribué sous la licence MIT. Vous êtes libre d’utiliser, modifier et redistribuer le code, à condition de conserver le copyright et les mentions de licence.

MIT License

Copyright (c) 2024‑2025 <Votre Nom / Organisation>

Permission is hereby granted, free of charge, to any person obtaining a copy...

Voir le fichier LICENSE du dépôt pour le texte complet.

🙋‍♀️ Besoin d’aide ?
Issues : ouvrez une issue sur GitHub en décrivant le problème (captures d’écran, logs console, etc.).
Questions : démarrez une discussion dans le dépôt ou contactez directement le mainteneur.
Bonne visualisation, et profitez de suivre la croissance d’Éléonore ! 🎉

🙋‍♀️ Besoin d’aide ?
Issues : ouvrez une issue sur GitHub en décrivant le problème (captures d’écran, logs console, etc.).
Questions : démarrez une discussion dans le dépôt ou contactez directement le mainteneur.
Bonne visualisation ! 🎉
