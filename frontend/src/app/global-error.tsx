'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div>
        <h2 style={{ fontSize: '24px', marginBottom: '16px' }}>Something went wrong!</h2>
        <button 
          onClick={() => reset()}
          style={{ 
            padding: '12px 24px', 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer',
            marginRight: '8px'
          }}
        >
          Try Again
        </button>
        <button 
          onClick={() => window.location.href = '/'}
          style={{ 
            padding: '12px 24px', 
            backgroundColor: '#6b7280', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Go Home
        </button>
      </div>
    </div>
  );
}

