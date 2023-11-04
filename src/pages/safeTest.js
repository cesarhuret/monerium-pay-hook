import { ethers } from "ethers";
import Safe, { EthersAdapter } from "@safe-global/protocol-kit";
import { SafeFactory } from "@safe-global/protocol-kit";
import { useEffect, useState } from "react";
import { useContractWrite } from "wagmi";
import { parseEther } from "viem";

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

  console.log(safeFactory);

  const signMessage = () => {
    const message = "I hereby declare that I am the address owner.";

    const signature = owner1Signer.signMessage(message);

    console.log(signature);
  };

  const signMessageLib = useContractWrite({
    address: "0xd53cd0aB83D845Ac265BE939c57F53AD838012c9",
    abi: [
      {
        inputs: [{ internalType: "bytes", name: "_data", type: "bytes" }],
        name: "signMessage",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    functionName: "signMessage",
  });

  const addSigToSafeLib = async () => {
    const sig =
      "0x60c3fc2448cfc41b2bd8b15bc838de61e82a8d8de37e2083fc7b4412120869ba0b1fd5e5ac3c6b75206e2bbb8eb08e61952f52562e7ac569f737d0075c3f5c951b";

    const ownerAddress = await owner1Signer.getAddress();

    console.log(ownerAddress);

    console.log(owner1Signer.getChainId());

    const signMessageLibContract = new ethers.Contract(
      "0xd53cd0aB83D845Ac265BE939c57F53AD838012c9",
      [
        {
          inputs: [{ internalType: "bytes", name: "_data", type: "bytes" }],
          name: "signMessage",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
      ],
      owner1Signer
    );

    const signMessageLib = await signMessageLibContract.signMessage(sig);

    console.log(signMessageLib);
  };

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
    // safeInit();
    // signMessage();
    addSigToSafeLib();
  }, []);

  useEffect(() => {
    if (predictedSafeAddress) {
      // deploySafe();
    }
  }, [safeFactory, safeAccountConfig, predictedSafeAddress]);

  return (
    <div>
      <h1>SafeTest</h1>
    </div>
  );
}
