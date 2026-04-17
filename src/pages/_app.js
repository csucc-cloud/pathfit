import "../styles/globals.css";
import Layout from "../components/Layout";
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // Define which paths should NOT have the sidebar/layout
  const noLayoutPages = ["/login", "/auth/register", "/auth/faculty-enroll"];

  // Check if the current path is in our "no layout" list
  const isNoLayoutPage = noLayoutPages.includes(router.pathname);

  return (
    <>
      {isNoLayoutPage ? (
        // If it's a login/auth page, just show the component alone
        <Component {...pageProps} />
      ) : (
        // Otherwise, wrap it in the persistent Layout
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </>
  );
}

export default MyApp;
