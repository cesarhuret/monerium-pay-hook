import { Inter } from "next/font/google";
import { MoneriumClient, placeOrderMessage } from "@monerium/sdk";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  SimpleGrid,
  Spacer,
  Spinner,
  Text,
  VStack,
  Stack,
  useDisclosure,
  Input,
  IconButton,
} from "@chakra-ui/react";
import { decode, encode } from "base-64";
import { useRouter } from "next/router";
import { CheckIcon, ChevronDownIcon } from "@chakra-ui/icons";
import QRCode from "react-qr-code";
import { createPublicClient, formatUnits, http } from "viem";
import { goerli } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import { getAccessToken } from "@/utils/getAccessToken";

const client = new MoneriumClient("sandbox");

const viemClient = createPublicClient({
  chain: goerli,
  transport: http(),
});

export default function Home() {
  const searchParams = useSearchParams();

  const codeParam = searchParams.get("code");

  const [profileId, setProfileId] = useState();
  const [temp, setTemp] = useState();

  const [checkoutUrl, setCheckoutUrl] = useState();

  const [success, setSuccess] = useState(false);

  const [parsed, setParsed] = useState({});

  useEffect(() => {
    const localProfileId = localStorage.getItem("profileId");

    setProfileId(localProfileId);

    const code = new URLSearchParams(window.location.search).get("code");
    if (code != null && !localProfileId)
      getAccessToken(
        client,
        code,
        window.location.origin + window.location.pathname
      );

    if (localProfileId) {
      console.log(localProfileId);

      const ws = new WebSocket("wss://chat.kesarx.repl.co/" + localProfileId);

      ws.onmessage = (message) => {
        console.log(message);
        if (message.data.startsWith("{\n\t")) {
          const data = JSON.parse(message.data);

          console.log(data.message);
          setCheckoutUrl(data.message);

          const id = data.message.replace(window.location.origin + "/pay/", "");

          const parsed = JSON.parse(decode(id)) || {};

          setParsed(parsed);

          const unwatch = viemClient.watchContractEvent({
            address: "0x83B844180f66Bbc3BE2E97C6179035AF91c4Cce8",
            abi: [
              {
                anonymous: false,
                inputs: [
                  {
                    indexed: true,
                    internalType: "address",
                    name: "from",
                    type: "address",
                  },
                  {
                    indexed: true,
                    internalType: "address",
                    name: "to",
                    type: "address",
                  },
                  {
                    indexed: false,
                    internalType: "uint256",
                    name: "value",
                    type: "uint256",
                  },
                ],
                name: "Transfer",
                type: "event",
              },
            ],
            eventName: "Transfer",
            onLogs: (logs) => {
              console.log("lol");
              console.log(formatUnits(logs[logs.length - 1].args.value, 18));
              console.log(logs);
              console.log(parsed);
              if (
                logs[logs.length - 1].args.to == parsed?.receiver &&
                formatUnits(logs[logs.length - 1].args.value, 18) ==
                  parsed?.amount
              ) {
                setSuccess(true);

                unwatch();

                setTimeout(() => {
                  setSuccess(false);
                  setCheckoutUrl(null);
                }, 5000);
              }
            },
          });
        }
      };
    }

    // unwatchContract();
  }, []);

  console.log(success);
  console.log(success);

  return (
    <Flex
      w={"full"}
      h={"100vh"}
      justifyContent={"center"}
      alignItems={"center"}
      overflowY={"scroll"}
    >
      {codeParam ? (
        <Spinner />
      ) : profileId ? (
        <VStack
          w={"full"}
          h={"100vh"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          {success ? (
            <Flex
              alignItems={"center"}
              justifyContent={"space-between"}
              flexDirection={"column"}
              gap={10}
              my={10}
              p={10}
              rounded={"2xl"}
            >
              <CheckIcon color={"green.500"} boxSize={32} />
              <Heading>Thank you!</Heading>
            </Flex>
          ) : checkoutUrl ? (
            <Flex
              alignItems={"center"}
              justifyContent={"space-between"}
              flexDirection={"column"}
              gap={10}
              my={10}
              p={10}
            >
              <Heading
                fontSize={"6xl"}
                alignSelf={"center"}
                borderBottomWidth={2}
                borderBottomColor={"blackAlpha.400"}
              >
                {parsed?.amount} {parsed?.currency?.toUpperCase()}
              </Heading>
              <VStack>
                <Text fontWeight={"bold"}>{parsed?.merchant}</Text>
                <Text fontSize={"sm"} fontWeight={"bold"}>
                  {parsed?.date && new Date(parsed?.date).toLocaleString()}
                </Text>
              </VStack>
              <QRCode size={256} value={checkoutUrl} />
            </Flex>
          ) : (
            <Heading>Welcome!</Heading>
          )}
        </VStack>
      ) : (
        <HStack>
          <Input
            placeholder="Profile ID"
            onChange={(e) => setTemp(e.target.value)}
          />
          <IconButton
            onClick={() => {
              localStorage.setItem("profileId", temp);
              setProfileId(temp);
            }}
            icon={<CheckIcon />}
            aria-label="Submit"
          />
        </HStack>
      )}
    </Flex>
  );
}
