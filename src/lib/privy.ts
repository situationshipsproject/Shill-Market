import { PrivyClientConfig } from '@privy-io/react-auth'
import { base } from 'viem/chains'

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
