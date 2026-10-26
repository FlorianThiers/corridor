// Diagnostic page to verify Next.js routing is working
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default function DebugPage() {

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>✅ Next.js Routing Diagnostic</h1>
      <p>Als je deze pagina ziet, werkt Next.js routing correct!</p>
      
      <div style={{ marginTop: '2rem', padding: '1rem', background: '#f0f0f0', borderRadius: '8px' }}>
        <h2>Environment Info:</h2>
        <ul>
          <li><strong>Timestamp:</strong> {new Date().toISOString()}</li>
          <li><strong>Host:</strong> {typeof window !== 'undefined' ? window.location.host : 'server'}</li>
          <li><strong>Path:</strong> {typeof window !== 'undefined' ? window.location.pathname : '/debug'}</li>
          <li><strong>Framework:</strong> Next.js (App Router)</li>
        </ul>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <h2>Test Links:</h2>
        <ul>
          <li><Link href="/">Homepage</Link></li>
          <li><Link href="/evenementen">Evenementen</Link></li>
          <li><Link href="/zones">Zones</Link></li>
        </ul>
      </div>
    </div>
  )
}
