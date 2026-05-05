import { PrivyClientConfig } from '@privy-io/react-auth'
import { base } from 'viem/chains'

export const PRIVY_APP_ID =
  process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? 'cmorft6s700hc0ek0jbq495jx'

export const privyConfig: PrivyClientConfig = {
  appearance: {
    theme: 'dark',
    accentColor: '#c8f135',
  },
  loginMethods: ['wallet', 'email', 'google', 'twitter'],
  defaultChain: base,
  embeddedWallets: {
    ethereum: {
      createOnLogin: 'users-without-wallets',
    },
    solana: {
      createOnLogin: 'users-without-wallets',
    },
  },
}
