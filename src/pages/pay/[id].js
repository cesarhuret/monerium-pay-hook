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
import {
  useAccount,
  useContractWrite,
  useNetwork,
  useSwitchNetwork,
} from "wagmi";
import { RiAccountCircleFill } from "react-icons/ri";
import { useRouter } from "next/router";
import { decode as base64_decode } from "base-64";
import { parseEther, parseUnits } from "viem";
import { TOKENS } from "@/utils/tokens";

export default function Pay() {
  const { open } = useWeb3Modal();
  const { address, isConnecting, isConnected, isDisconnected } = useAccount();
  const { chain } = useNetwork();
  const router = useRouter();

  const { id } = router.query;

  const data = (id && JSON.parse(base64_decode(id))) || {};

  console.log(chain);

  const token = useContractWrite({
    address: TOKENS[data?.currency],
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

  const bridge = useContractWrite({
    address: "0xA4218e1F39DA4AaDaC971066458Db56e901bcbdE",
    abi: [
      {
        outputs: [],
        inputs: [
          { name: "localToken", internalType: "address", type: "address" },
          { name: "remoteChainId", internalType: "uint16", type: "uint16" },
          { name: "amount", internalType: "uint256", type: "uint256" },
          { name: "to", internalType: "address", type: "address" },
          { name: "unwrapWeth", internalType: "bool", type: "bool" },
          {
            components: [
              {
                name: "refundAddress",
                internalType: "address payable",
                type: "address",
              },
              {
                name: "zroPaymentAddress",
                internalType: "address",
                type: "address",
              },
            ],
            name: "callParams",
            internalType: "struct LzLib.CallParams",
            type: "tuple",
          },
          { name: "adapterParams", internalType: "bytes", type: "bytes" },
        ],
        name: "bridge",
        stateMutability: "payable",
        type: "function",
      },
    ],
    functionName: "bridge",
  });

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
        {/* {chain?.id == 1116 && (
          <HStack w={"90%"} justifyContent={"center"}>
            <Button
              maxW={"320px"}
              colorScheme={"green"}
              flex={1}
              isDisabled={!address || !isConnected || !data?.currency}
              onClick={() =>
                bridge.write({
                  args: [
                    "0xa4151b2b3e269645181dccf2d426ce75fcbdeca9",
                    137,
                    parseUnits(11, 18),
                    address,
                    false,
                    {
                      refundAddress: address,
                      zroPaymentAddress:
                        "0x0000000000000000000000000000000000000000",
                    },
                    "0x",
                  ],
                  value: parseEther("0"),
                  from: address,
                })
              }
            >
              Bridge To Polygon
            </Button>
            <Button
              maxW={"320px"}
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
              Swap To EURe
            </Button>
          </HStack>
        )} */}
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
