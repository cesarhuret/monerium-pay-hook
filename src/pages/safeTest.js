import { Button, Flex } from '@chakra-ui/react';
import { MoneriumPack } from '@safe-global/onramp-kit'
import Safe, { EthersAdapter } from '@safe-global/protocol-kit'
import { ethers } from 'ethers';

const pk = process.env.OWNER_PRIVATE_KEY;

const RPC_URL = "https://eth-goerli.public.blastapi.io";
const provider = new ethers.providers.JsonRpcProvider(RPC_URL)

const owner1Signer = new ethers.Wallet(pk, provider)

const ethApdapterOwner1 = new EthersAdapter({
  ethers,
  signerOrProvider: owner1Signer,
});

const safeSdk = await Safe.create({
  ethAdapter: ethApdapterOwner1,
  safeAddress: '0x2f98F29165d34CDd8889Cb552fB0623b57509a95',
});

const moneriumPack = new MoneriumPack({
  clientId: 'f40ac19e-7a76-11ee-8b41-d2500a0c99b2' , // Get your client id from Monerium
  environment: 'sandbox' // Use the proper Monerium environment ('sandbox' | 'production')})
})

await moneriumPack.init({ safeSdk })

export default function SafeTest() {
  const signMoneriumMessage = async () => {
    const message = 'I hereby declare that I am the address owner.'
  
    // const signature = await safeSdk.signTransaction({
    //   to: '0x00000000',
    //   value: 0,
    //   data: message,
    // })
  
    // console.log(signature)

    const safeTransactionData = {
      to: '0x',
      value: 0,
      data: message,
    }

    const safeTransaction = await safeSdk.createTransaction(safeTransactionData)
    const signature = await safeSdk.signTransaction(safeTransaction)

    console.log(signature)
  }
  
  return (
    <Flex justify="center" align="center" h="100vh" direction="col">
      <h1>SafeTest</h1>
      <Button
        onClick={async () => {
          await moneriumPack.open({ redirectUrl: 'http://localhost:3000' }).then(() => {
          })
        }}
      >Open</Button>
      <Button
        onClick={async () => {
          await signMoneriumMessage()
        }}
      >
        Test Sig
      </Button>
    </Flex>
  );
}
