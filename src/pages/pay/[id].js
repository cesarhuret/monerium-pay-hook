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
import { useEffect, useState } from "react";
import { useAccount, useContractWrite } from "wagmi";
import { RiAccountCircleFill } from "react-icons/ri";
import { useRouter } from "next/router";
import { decode as base64_decode } from "base-64";
import { parseEther, parseUnits } from "viem";

const addresses = {
  EUR: "0x83B844180f66Bbc3BE2E97C6179035AF91c4Cce8",
};

export default function Pay() {
  const { open } = useWeb3Modal();
  const { address, isConnecting, isConnected, isDisconnected } = useAccount();
  const router = useRouter();

  const { id } = router.query;

  const data = (id && JSON.parse(base64_decode(id))) || {};

  console.log(data);

  const token = useContractWrite({
    address: addresses[data?.currency],
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
        <Spacer flex={2} />
        <VStack
          w={"90%"}
          justifyContent={"center"}
          alignItems={"center"}
          borderRadius={"xl"}
          borderColor={"blackAlpha.500"}
          spacing={"5"}
        >
          <Heading
            fontSize={"6xl"}
            alignSelf={"center"}
            borderBottomWidth={2}
            borderBottomColor={"blackAlpha.400"}
          >
            {data?.amount} {data?.currency?.toUpperCase()}
          </Heading>
          <VStack>
            <Text fontWeight={"bold"}>{data?.merchant}</Text>
            <Text fontSize={"sm"} fontWeight={"bold"}>
              {new Date(data?.date).toLocaleString()}
            </Text>
          </VStack>
        </VStack>
        <Spacer flex={3} />
        <HStack w={"90%"} justifyContent={"center"}>
          <Button
            maxW={"600px"}
            colorScheme={"green"}
            flex={1}
            isDisabled={!address || !isConnected || !data?.currency}
            onClick={() =>
              token.write({
                args: [data?.receiver, parseUnits(data?.amount, 18)],
                value: parseEther("0"),
                from: address,
              })
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
