import Link from 'next/link';

export default function Home() {
  // Consolidated Style Object - No changes to values
  const styles = {
    container: {
      backgroundColor: '#051e34',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      margin: '0', // Ensures the white border disappears
    },
    backgroundMesh: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'radial-gradient(circle at 10% 20%, #039be5 0%, transparent 40%), radial-gradient(circle at 90% 80%, #f4ebd1 10%, transparent 40%)',
      opacity: 0.3,
    },
    contentWrapper: {
      position: 'relative',
      zIndex: 2,
      textAlign: 'center',
      maxWidth: '600px',
      animation: 'fadeIn 1s ease-out',
    },
    brandIcon: {
      backgroundColor: '#039be5',
      color: 'white',
      width: '80px',
      height: '80px',
      borderRadius: '24px',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '900',
      fontSize: '40px',
      fontStyle: 'italic',
      marginBottom: '30px',
      boxShadow: '0 20px 40px rgba(3, 155, 229, 0.4)',
      transform: 'rotate(-5deg)',
    },
    title: {
      fontSize: '4rem',
      fontWeight: '900',
      color: 'white',
      margin: '0',
      letterSpacing: '-3px',
      lineHeight: '0.9',
      textTransform: 'uppercase',
    },
    description: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: '14px',
      lineHeight: '1.8',
      marginTop: '25px',
      marginBottom: '40px',
      fontWeight: '500',
      letterSpacing: '0.5px',
    },
    button: {
      backgroundColor: '#039be5',
      color: 'white',
      padding: '22px 48px',
      borderRadius: '20px',
      fontWeight: '900',
      fontSize: '14px',
      textTransform: 'uppercase',
      letterSpacing: '3px',
      border: 'none',
      cursor: 'pointer',
      boxShadow: '0 15px 30px rgba(3, 155, 229, 0.3)',
      transition: 'all 0.3s ease',
      borderBottom: '5px solid #01579b',
    },
    footer: {
      marginTop: '60px',
      fontSize: '10px',
      fontWeight: '800',
      color: 'rgba(255,255,255,0.2)',
      textTransform: 'uppercase',
      letterSpacing: '5px',
    }
  };

  return (
    <div style={styles.container}>
      {/* Decorative Background Mesh */}
      <div style={styles.backgroundMesh}></div>

      <div style={styles.contentWrapper} className="content-container">
        {/* Animated Brand Icon */}
        <div style={styles.brandIcon}>P</div>

        <h1 style={styles.title} className="main-title">
          PATHFit <span style={{ color: '#039be5' }}>Pro</span>
        </h1>

        <p style={styles.description}>
          Welcome to your Institutional Fitness Tracker. Initialize your profile to begin your 
          <strong> Phase 1 Pre-Test</strong> and manage your weekly training logs with ease.
        </p>

        <Link href="/login" style={{ textDecoration: 'none' }}>
          <button style={styles.button} className="primary-btn">
            Get Started: Set Up Profile
          </button>
        </Link>

        <div style={styles.footer}>
          Optimized for PATHFit Curriculum &copy; 2026
        </div>
      </div>

      {/* Responsive & Animation Logic */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Mobile Adjustments */
        @media (max-width: 768px) {
          .main-title {
            fontSize: 2.5rem !important;
            letterSpacing: -1px !important;
          }
          .primary-btn {
            padding: 18px 30px !important;
            width: 100% !important;
            fontSize: 12px !important;
          }
          .content-container {
            padding: 0 10px;
          }
        }
      `}} />
    </div>
  );
}
