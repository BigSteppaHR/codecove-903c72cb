
import { createRoot } from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'
import App from './App.tsx'
import './index.css'

const PUBLISHABLE_KEY = "pk_test_b3Blbi1yYWNjb29uLTE3LmNsZXJrLmFjY291bnRzLmRldiQ"

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

createRoot(document.getElementById("root")!).render(
  <ClerkProvider 
    publishableKey={PUBLISHABLE_KEY}
    appearance={{
      baseTheme: dark,
      variables: {
        colorPrimary: '#3b82f6',
        colorBackground: '#0f172a',
        colorInputBackground: '#1e293b',
        colorInputText: '#f1f5f9',
      }
    }}
  >
    <App />
  </ClerkProvider>
);
