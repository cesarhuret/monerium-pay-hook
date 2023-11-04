"use client";

import {
  Box,
  Button,
  Divider,
  Flex,
  HStack,
  Heading,
  IconButton,
  Image,
  List,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useEffect } from "react";
import { useAccount, useContractWrite } from "wagmi";
import { RiAccountCircleFill } from "react-icons/ri";
import { useRouter } from "next/router";
import { decode as base64_decode } from "base-64";
import { parseEther } from "viem";

export default function Pay() {
  const { open } = useWeb3Modal();
  const { address, isConnecting, isConnected, isDisconnected } = useAccount();
  const router = useRouter();
  const { id } = router.query;

  const usdc = useContractWrite({
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    abi: [
      {
        inputs: [
          { internalType: "address", name: "to", type: "address" },
          { internalType: "uint256", name: "value", type: "uint256" },
        ],
        name: "transfer",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        stateMutability: "nonpayable",
        type: "function",
      },
    ],
    functionName: "transfer",
  });

  const object = JSON.parse(base64_decode(id));

  console.log({ address, isConnecting, isDisconnected });

  useEffect(() => {
    if (isDisconnected) open();
  }, [isDisconnected, open]);

  const viewAccount = () => {
    isDisconnected ? open() : open({ view: "Account" });
  };

  return (
    <VStack justifyContent={"center"} h={"100vh"}>
      <VStack justify={"space-between"} w={"full"} h={"90vh"} px={5}>
        <Image alt="logo" src={"/LOGO.svg"} />
        <Spacer flex={1} />
        <VStack
          w={"90%"}
          justifyContent={"center"}
          alignItems={"center"}
          borderRadius={"xl"}
          borderColor={"blackAlpha.500"}
          spacing={"5"}
        >
          <Heading fontSize={"2xl"} alignSelf={"start"}>
            {object.merchant} Order
          </Heading>
          <Divider />
          {object.items.map((value, index) => (
            <HStack w={"full"} justify={"space-between"} key={index}>
              <Text>
                <b>{value.name}</b>
              </Text>
              <Text>
                {value.price} {value.currency}
              </Text>
              <Text>{value.quantity}</Text>
            </HStack>
          ))}
          <Divider />
          <HStack w={"full"} justify={"space-between"}>
            <Text>
              <b>Total</b>
            </Text>
            <Text>{object.amount}$</Text>
          </HStack>
        </VStack>
        <Spacer flex={2} />
        <HStack w={"90%"} justifyContent={"center"}>
          <Button
            maxW={"600px"}
            colorScheme={"green"}
            flex={1}
            onClick={() =>
              usdc.write({ args: [object.receiver, object.amount], value: parseEther("0"), from: address})
            }
          >
            Pay
          </Button>
          <IconButton
            aria-label="View Account"
            icon={<RiAccountCircleFill />}
            colorScheme="blue"
            onClick={viewAccount}
          />
        </HStack>
      </VStack>
    </VStack>
  );
}
