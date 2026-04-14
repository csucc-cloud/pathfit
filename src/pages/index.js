import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ 
      backgroundColor: '#051e34', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Decorative Background Mesh - Recreating the "Wave" feel */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'radial-gradient(circle at 10% 20%, #039be5 0%, transparent 40%), radial-gradient(circle at 90% 80%, #f4ebd1 10%, transparent 40%)',
        opacity: 0.3
      }}></div>

      <div style={{ 
        position: 'relative', 
        zIndex: 2, 
        textAlign: 'center', 
        maxWidth: '600px',
        animation: 'fadeIn 1s ease-out' 
      }}>
        {/* Animated Brand Icon */}
        <div style={{ 
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
          transform: 'rotate(-5deg)'
        }}>P</div>

        <h1 style={{ 
          fontSize: '4rem', 
          fontWeight: '900', 
          color: 'white', 
          margin: '0', 
          letterSpacing: '-3px',
          lineHeight: '0.9',
          textTransform: 'uppercase'
        }}>
          PATHFit <span style={{ color: '#039be5' }}>Pro</span>
        </h1>

        <p style={{ 
          color: 'rgba(255,255,255,0.7)', 
          fontSize: '14px', 
          lineHeight: '1.8', 
          marginTop: '25px', 
          marginBottom: '40px',
          fontWeight: '500',
          letterSpacing: '0.5px'
        }}>
          Welcome to your Institutional Fitness Tracker. Initialize your profile to begin your 
          <strong> Phase 1 Pre-Test</strong> and manage your weekly training logs with ease.
        </p>

        <Link href="/login" style={{ textDecoration: 'none' }}>
          <button style={{ 
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
            borderBottom: '5px solid #01579b'
          }}>
            Get Started: Set Up Profile
          </button>
        </Link>

        <div style={{ 
          marginTop: '60px', 
          fontSize: '10px', 
          fontWeight: '800', 
          color: 'rgba(255,255,255,0.2)', 
          textTransform: 'uppercase', 
          letterSpacing: '5px' 
        }}>
          Optimized for PATHFit Curriculum &copy; 2026
        </div>
      </div>

      {/* Embedded Animation Logic */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
