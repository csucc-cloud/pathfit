import "../styles/globals.css";
import Layout from "../components/Layout";
import InstructorLayout from "../components/layouts/InstructorLayout"; // Added Instructor Layout
import { useRouter } from "next/router";

function MyApp({ Component, pageProps }) {
  const router = useRouter();

  // UPDATED: Added "/waiting-room" to the list of pages that bypass the sidebar/layout
  const noLayoutPages = [
    "/", 
    "/login", 
    "/auth/register", 
    "/auth/faculty-enroll", 
    "/waiting-room"
  ];

  // Check if the current path is in our "no layout" list
  const isNoLayoutPage = noLayoutPages.includes(router.pathname);

  // Check if the current path is an admin/instructor route
  const isInstructorRoute = router.pathname.startsWith('/admin');

  return (
    <>
      <style jsx global>{`
        @keyframes entrance {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-entrance { 
          animation: entrance 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        }
        
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #f8f9fd; }
        ::-webkit-scrollbar-thumb { 
          background: #0A0F1E; 
          border-radius: 10px; 
          border: 2px solid #f8f9fd;
        }
        ::-webkit-scrollbar-thumb:hover { background: #FF6B00; }
      `}</style>

      {isNoLayoutPage ? (
        // 1. AUTH & WAITING ROOM: No sidebar, no wrapper
        <Component {...pageProps} />
      ) : isInstructorRoute ? (
        // 2. INSTRUCTOR PAGES: Wrap in the new Instructor/Admin Sidebar
        <InstructorLayout>
          <Component {...pageProps} />
        </InstructorLayout>
      ) : (
        // 3. STUDENT PAGES: Wrap in the standard persistent Layout
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </>
  );
}

export default MyApp;
