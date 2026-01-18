# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Convert to Android App (using Capacitor)

You can easily convert this PWA into an Android app using [Capacitor](https://capacitorjs.com/), which seems to be the "cap" tool you looked for.

### Steps

1.  **Install Capacitor dependencies**:
    ```bash
    npm install @capacitor/core @capacitor/cli @capacitor/android
    ```

2.  **Initialize Capacitor**:
    ```bash
    npx cap init
    ```
    *   App Name: `Kuti Do`
    *   Package ID: `com.example.kutido` (or your unique ID)
    *   Web directory: `dist`

3.  **Build your React App**:
    ```bash
    npm run build
    ```
    *(Capacitor runs off the built assets in the `dist` folder)*

4.  **Add Android Platform**:
    ```bash
    npx cap add android
    ```

5.  **Open in Android Studio**:
    ```bash
    npx cap open android
    ```
    This command will launch Android Studio with your new native project pre-configured. You can then run it on an emulator or device directly from there.

6.  **Sync Changes**:
    If you update your React code, run this to update the Android app:
    ```bash
    npm run build
    npx cap sync
    ```

## Sound Effect
Sound Effect by <a href="https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=100953">freesound_community</a> from <a href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=100953">Pixabay</a>

Sound Effect by <a href="https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=97965">freesound_community</a> from <a href="https://pixabay.com//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=97965">Pixabay</a>

Sound Effect by <a href="https://pixabay.com/users/freesound_community-46691455/?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=91567">freesound_community</a> from <a href="https://pixabay.com/sound-effects//?utm_source=link-attribution&utm_medium=referral&utm_campaign=music&utm_content=91567">Pixabay</a>

## License
