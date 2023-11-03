// pages/_app.js
import { ChakraProvider } from '@chakra-ui/react'
import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'

import { WagmiConfig } from 'wagmi'
import { mainnet } from 'wagmi/chains'

const projectId = process.env.WALLETCONNECT_PROJECT_ID

const metadata = {
  name: 'Monerium Pay',
  description: 'Pay web2 merchants via web3',
  url: 'localhost:3000',
}

const chains = [mainnet]
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata})

createWeb3Modal({ wagmiConfig, projectId, chains})

function MyApp({ Component, pageProps }) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <ChakraProvider>
        <Component {...pageProps} />
      </ChakraProvider>
    </WagmiConfig>
  )
}

export default MyApp;