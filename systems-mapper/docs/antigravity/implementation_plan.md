# Firebase Authentication Integration Plan

This plan details how to add Firebase Authentication to the Systems Mapper tool. We will support **Google Sign-In** (as a primary, modern, and secure default) and option for **Email/Password** or **Guest Mode** (with localStorage sync). Once logged in, the application will display the user's name and photo, laying the groundwork for saving maps in the cloud.

---

## User Setup Instructions (Prerequisites)

To integrate Firebase, we need to set up a project in the Firebase Console and retrieve your app's unique configuration keys.

### Step 1: Create a Firebase Project
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** (or select an existing one).
3. Name your project (e.g., `systems-mapper-yourname`) and click **Continue**.
4. Enable/disable Google Analytics according to your preference (not required for Auth), and click **Create project**.

### Step 2: Register a Web App
1. On your project home screen, click the **Web** icon (`</>`) to add a web app.
2. Enter an App Nickname (e.g., `Systems Mapper`).
3. Click **Register app**.
4. Copy the `firebaseConfig` JavaScript object that appears. It will look like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
     messagingSenderId: "YOUR_SENDER_ID",
     appId: "YOUR_APP_ID"
   };
   ```
5. We will paste these config keys into a new `src/firebase.ts` configuration file.

### Step 3: Enable Authentication Providers
1. In the left sidebar of the Firebase Console, go to **Build** -> **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, click **Add new provider**:
   - **Google**: Click **Google**, toggle **Enable**, select a **Project support email**, and click **Save**.
   - *(Optional)* **Email/Password**: Click **Email/Password**, toggle **Enable**, and click **Save**.

---

## User Review Required

> [!IMPORTANT]
> **Authentication Entry Flow:**
> We will design the authentication entry flow in two ways. Please review and let me know your preference:
> 1. **Soft Lock (Recommended):** The user can view and edit a map immediately in "Guest Mode" (saving to local storage). If they want to sync maps to the cloud or share them, they can click a "Sign In" button in the corner to sign in.
> 2. **Hard Lock:** The user is greeted by a beautiful, blurred glassmorphism full-page login screen and *must* log in before they can view or use the systems mapping tool.

---

## Open Questions

1. **Which entry flow do you prefer?**
   - **Option A:** **Soft Lock (Guest Mode)**: Users can use the canvas immediately. Logging in enables cloud syncing.
   - **Option B:** **Hard Lock (Auth Wall)**: Users must log in first to use the app.
2. **Would you like us to set up Firebase Firestore Cloud Storage now?**
   - We can also implement syncing their maps to Firestore so that when they are logged in, their map automatically saves to the cloud instead of just local storage.

---

## Proposed Changes

### Configuration and Setup

#### [MODIFY] [package.json](file:///Users/diderik/Developer/Antigravity/systems-mapper/package.json)
Install the `firebase` package:
- Add `"firebase": "^11.0.0"` (or latest) to the dependencies.

#### [NEW] [firebase.ts](file:///Users/diderik/Developer/Antigravity/systems-mapper/src/firebase.ts)
Initialize Firebase and export the auth service:
- Configure using the configuration keys copied from the console.
- Export the `auth` and Google Sign-In Provider instances.

---

### React Context & Authentication State

#### [NEW] [AuthContext.tsx](file:///Users/diderik/Developer/Antigravity/systems-mapper/src/context/AuthContext.tsx)
Create a React Context to distribute the active user state throughout the application:
- Expose properties: `user` (Firebase User or null), `loading` (boolean), `signInWithGoogle`, `signInWithEmail`, `signUpWithEmail`, and `logout`.
- Monitor active sessions using `onAuthStateChanged`.

#### [MODIFY] [main.tsx](file:///Users/diderik/Developer/Antigravity/systems-mapper/src/main.tsx)
Wrap the root `<App />` component in `<AuthProvider>` to make authentication states available anywhere.

---

### User Interface Components

#### [NEW] [LoginModal.tsx](file:///Users/diderik/Developer/Antigravity/systems-mapper/src/components/LoginModal.tsx)
A gorgeous, modern modal overlay that fits the project's glassmorphism aesthetic:
- **Styling**: Semi-transparent frosted glass backdrop filter, pastel-themed Google Sign-In button, and clean inputs for email/password.
- **Micro-animations**: Subtle entrance zooms, hover scale transitions on buttons, and error messages that fade in gracefully.

#### [NEW] [UserMenu.tsx](file:///Users/diderik/Developer/Antigravity/systems-mapper/src/components/UserMenu.tsx)
A premium user profile button in the toolbar/header:
- Shows the user's Google photo or a placeholder pastel colored initial avatar.
- Displays the user's name on hover.
- Reveals a dropdown on click with user details and a "Sign Out" button.

#### [MODIFY] [Toolbar.tsx](file:///Users/diderik/Developer/Antigravity/systems-mapper/src/components/Toolbar.tsx)
- Embed the new `UserMenu` in the toolbar.
- If in Guest Mode, show a "Sign In" button with an accent pastel color (e.g. peach or mint) to encourage the user to log in.

#### [MODIFY] [App.tsx](file:///Users/diderik/Developer/Antigravity/systems-mapper/src/App.tsx)
- Integrate the auth listener.
- Toggle between displaying the canvas/toolbar and showing the `LoginModal` depending on the selected user entry flow choice.

---

## Verification Plan

### Automated Tests
- Run `npm run build` to verify there are no TypeScript compile issues or bundler conflicts.

### Manual Verification
1. **Google Login:** Click the "Sign In with Google" button, authenticate via the popup window, and check that the user profile picture and name update correctly in the toolbar.
2. **Email Login:** Test creating a new account using the email/password fields, and logging in with those credentials.
3. **Session Persistence:** Log in, refresh the browser page, and verify that the user session remains logged in without prompting again.
4. **Sign Out:** Click "Sign Out" and verify the app immediately updates to guest mode (or redirects to the auth wall).
