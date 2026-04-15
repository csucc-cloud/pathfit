// src/pages/_app.js
import '../styles/globals.css'; // Make sure you have this file with Tailwind directives

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
