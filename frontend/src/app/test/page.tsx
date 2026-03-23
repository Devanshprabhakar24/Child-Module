'use client';

export default function TestPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'Not set';
  const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'Not set';

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui' }}>
      <h1>Deployment Test Page</h1>
      
      <div style={{ marginTop: '20px', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
        <h2>Environment Variables</h2>
        <p><strong>API URL:</strong> {apiUrl}</p>
        <p><strong>Razorpay Key:</strong> {razorpayKey}</p>
      </div>

      <div style={{ marginTop: '20px', padding: '20px', background: '#e8f5e9', borderRadius: '8px' }}>
        <h2>Status</h2>
        <p>✅ Frontend is deployed and running</p>
        <p>✅ Next.js is working</p>
        <p>✅ React is rendering</p>
      </div>

      <div style={{ marginTop: '20px' }}>
        <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>Go to Homepage</a>
      </div>
    </div>
  );
}
