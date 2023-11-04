import { ethers } from "ethers";
import Safe, { EthersAdapter } from "@safe-global/protocol-kit";
import { SafeFactory } from "@safe-global/protocol-kit";
import { useEffect, useState } from "react";

export default function SafeTest() {
  const [safeFactory, setSafeFactory] = useState();
  const [safeAccountConfig, setSafeAccountConfig] = useState();
  const [predictedSafeAddress, setPredictedSafeAddress] = useState();

  const pk = process.env.OWNER_PRIVATE_KEY;

  const RPC_URL = "https://eth-goerli.public.blastapi.io";
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

  const owner1Signer = new ethers.Wallet(pk, provider);

  const ethApdapterOwner1 = new EthersAdapter({
    ethers,
    signerOrProvider: owner1Signer,
  });

  const safeInit = async () => {
    const ownerAddress = await owner1Signer.getAddress();

    const newSafeFactory = await SafeFactory.create({
      ethAdapter: ethApdapterOwner1,
    });

    setSafeFactory(newSafeFactory);

    const newSafeAccountConfig = {
      owners: [ownerAddress],
      threshold: 1,
    };

    setSafeAccountConfig(newSafeAccountConfig);

    const newPredictedSafeAddress = await newSafeFactory.predictSafeAddress(
      newSafeAccountConfig,
      await provider.getTransactionCount(ownerAddress)
    );

    setPredictedSafeAddress(newPredictedSafeAddress);

  };

  console.log(safeFactory)

  const connectSafe = async () => {

    const createSafeSDK = await Safe.create({
      ethAdapter: ethApdapterOwner1,
      safeAddress: predictedSafeAddress,
    });

    const connectSafeSDK = await createSafeSDK.connect({
      ethAdapter: ethApdapterOwner1,
    });

    return connectSafeSDK;
  };

  const deploySafe = async () => {
    console.log(predictedSafeAddress);
    console.log(safeFactory);

    const newSafe = await safeFactory.deploySafe({ safeAccountConfig });
    const newSafeAddress = await newSafe.getAddress();

    console.log("Safe has been deployed:");
    console.log(`https://goerli.etherscan.io/address/${newSafeAddress}`);
    console.log(`https://app.safe.global/gor:${newSafeAddress}`);
  };

  useEffect(() => {
    safeInit()
  }, []);

  useEffect(() => {
    if (predictedSafeAddress) {
      
    }
  }, [safeFactory, safeAccountConfig, predictedSafeAddress]);

  return (
    <div>
      <h1>SafeTest</h1>
    </div>
  );
}
