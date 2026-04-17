// src/pages/_app.js
import Layout from '../components/Layout'; // Adjust this path if your Layout is elsewhere
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
