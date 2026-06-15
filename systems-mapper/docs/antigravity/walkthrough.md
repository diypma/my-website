# Systems Mapper Walkthrough

We have successfully created a browser-based systems mapping tool with an infinite canvas, drag-and-drop node creation, customizable pastel themes, curved connections, self-loops, and animated flow particles showing how information moves through the systems.

---

## 🎨 Interface Preview

![Systems Mapper UI Mockup](/Users/diderik/.gemini/antigravity/brain/6654e143-b50a-4d70-aa8f-3bd950c5ce79/systems_mapper_mockup_1781520673303.png)

---

## Features Implemented

1. **Infinite Canvas**:
   - Supports panning by dragging on the empty canvas space.
   - Smooth mouse-wheel zoom from 20% to 300% (centered around the cursor).
   - Dynamic SVG background grid that translates and scales matching the viewport.
   
2. **Interactive Nodes**:
   - Double-click anywhere on the empty canvas to create a node, or click "Add Node" in the toolbar.
   - Nodes can be repositioned by dragging and dropping them.
   - Nodes have pastel theme colors (Rose, Peach, Yellow, Mint, Ice, Lavender, Sand) that can be changed dynamically.
   - Editable label text (double-click node to edit, press Enter/click away to save).
   - Hovering over a node displays a delete button (`×`) and a connection anchor.

3. **Curved Connections & Self-Loops**:
   - Draw connections by dragging from the right handle of any node and dropping it onto another.
   - Normal connections are drawn as smooth **quadratic Bezier curves**. Curvature can be adjusted via a slider (from straight line to curves in either direction).
   - Self-loops (connecting a node to itself) are supported and rendered as a loop arc on top of the node, with adjustable loop size.
   - SVG arrowheads automatically align to the borders of the rectangular nodes, regardless of positions or curves.
   - Connection label text can be edited at the midpoint of the curve.

4. **Animated Flow**:
   - High-performance SVG animations using `<animateMotion>` to move small circles (representing information flow) along the curved paths.
   - Play/Pause toggle and a speed slider to adjust the flow rate.

5. **Data Management**:
   - Automatically saves map states (nodes, connections, and viewport position) to local storage.
   - Import and Export maps as JSON files to save and share diagrams.

---

## Verification & Build Validation

- **Automated Compile Verification**: We ran `npm run build` which compiled the TypeScript and Vite assets cleanly without warnings or errors.
  ```
  vite v8.0.16 building client environment for production...
  transforming...✓ 23 modules transformed.
  rendering chunks...
  computing gzip size...
  dist/index.html                   0.83 kB │ gzip:  0.51 kB
  dist/assets/index-CC2gP73C.css    7.68 kB │ gzip:  2.24 kB
  dist/assets/index-DMyJFXGV.js   212.50 kB │ gzip: 66.85 kB
  ✓ built in 259ms
  ```

---

## Guide: Hosting on Your Private GitHub

To upload the project code to your private GitHub repository and host the website using **GitHub Pages**, follow these steps:

### Step 1: Initialize Git and Commit Code
Open your terminal inside the project directory `/Users/diderik/Developer/Antigravity/systems-mapper` and run:
```bash
git init
git add .
git commit -m "Initial commit of Systems Mapper"
```

### Step 2: Create a Private GitHub Repository
1. Go to [github.com/new](https://github.com/new).
2. Set the repository name to `systems-mapper`.
3. Select **Private**.
4. Leave other settings (Readme, .gitignore) unchecked since they are already in the project.
5. Click **Create repository**.

### Step 3: Link Local Git to GitHub and Push
Copy the remote repository URL and run the following in your local repository terminal:
```bash
git remote add origin git@github.com:<your-username>/systems-mapper.git
# Or HTTPS:
# git remote add origin https://github.com/<your-username>/systems-mapper.git

git branch -M main
git push -u origin main
```

### Step 4: Configure GitHub Pages for a Private Repository
Normally, GitHub Pages is free only for public repositories. For **private** repositories, it requires **GitHub Pro, GitHub Team, or GitHub Enterprise**. If you have one of those:
1. On GitHub, navigate to your repository's **Settings** tab.
2. Under **Code and automation**, click **Pages**.
3. Under **Build and deployment** -> **Source**, select **GitHub Actions**.
4. Since we have already added the `.github/workflows/deploy.yml` workflow, the site will build and deploy automatically every time you push to the `main` branch!

> [!TIP]
> **Alternative Hosting for Free Private Repositories:**
> If you do not have GitHub Pro/Enterprise, you can host your private repo for free on **Vercel** or **Netlify**:
> 1. Sign up for a free Vercel account and import your private GitHub repo.
> 2. Vercel will auto-detect Vite, build it, and deploy it to a free `<name>.vercel.app` URL.
