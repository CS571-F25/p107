# Adapting Guide

> This guide helps you replicate, customize, and deploy this project on your own GitHub Pages site.


## 0️⃣ Before You Begin

Make sure you have:

- **Git** installed → [Install Git](https://git-scm.com/downloads)
- **Node.js + npm** installed → [Download here](https://nodejs.org/)
- A **GitHub account** with a repository ready (you can create one using “Use this template”)

Optional but recommended:
- Use [Visual Studio Code](https://code.visualstudio.com/) or any text editor you like.

## 1️⃣ Get the Code

You can start in one of these ways:

- **Use as Template** → click **“Use this template”** on GitHub to create your own copy.  
- **Fork** → make a linked copy under your account.  
- **Clone manually**
  ```bash
  git clone <source-repo-url> <your-repo>
  cd <your-repo>
  git remote remove origin
  git remote add origin git@github.com:<your-username>/<your-repo>.git
  git push -u origin main
  ```

After getting the code, install dependencies:
```bash
npm install
```
> 📝 Note: You need Node.js installed for `npm install` and `npm run build` to work.  
> If you're not sure, run `node -v` in your terminal to check.

You can always test the project locally:
```bash
npm run dev
```
Then open the shown localhost URL in your browser to confirm it runs correctly.

## 2️⃣ Update the Base Path

Open `vite.config.js` and change the `base` value according to where you deploy:

If you deploy it to a **project page** (e.g. `https://username.github.io/repo-name/`),  

```js
base: '/<your-repo-name>/'
```

If you deploy to a **user page** (e.g. `https://username.github.io/`),  
set it to:
```js
base: '/'
```

## 3️⃣ Customize for Your Own Site

Most personal changes happen inside the `/src` folder:

| Folder / File | Purpose |
|----------------|----------|
| `src/assets/` | Images, logos, or icons. Replace with your own. |
| `src/components/` | React components and sections. Edit or add new ones here. |
| `src/App.jsx` | Main layout and routes. Adjust to fit your site structure. |
| `src/main.jsx` | Entry point — usually no need to modify. |

You can freely rename or remove components — just keep the import paths consistent.

## 4️⃣ Build and Deploy

Build the static site:
```bash
npm run build
```

This creates a `docs/` folder containing the production files.  
(If you haven’t changed any source files, you can skip this — the existing `/docs` will still work.)

Then push to your repository:
```bash
git add -A
git commit -m "build: generate docs for GitHub Pages"
git push
```

Under **GitHub → Settings → Pages**, set:
- **Source:** `main` branch  
- **Folder:** `/docs`  

Then click **Save**.

After a minute or two, your site will be available at one of the following URLs, depending on your setup:
- `https://<username>.github.io/<your-repo>/`
- `https://<username>.github.io/`

## 🌐 Optional: Custom Domain  
To use your own domain, go to  
**GitHub → Settings → Pages → Custom domain**  
and follow the instructions to configure your DNS records. 


## 📜 License
Licensed under the [MIT License](./LICENSE) © 2025 [eliotziqi](https://github.com/eliotziqi)  
You are free to use, modify, and distribute it with proper attribution.