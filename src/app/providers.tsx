'use client'

import { PrivyProvider } from '@privy-io/react-auth'
import { PRIVY_APP_ID, privyConfig } from '@/lib/privy'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider appId={PRIVY_APP_ID} config={privyConfig}>
      {children}
    </PrivyProvider>
  )
}
