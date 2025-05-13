import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors'

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(),
    coinbaseWallet(),
    walletConnect({ projectId: import.meta.env.VITE_PROJECT_ID }),
  ],
  transports: {
    [sepolia.id]: http("https://rpc.ankr.com/zksync_era_sepolia"),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
