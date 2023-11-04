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

  const [checkoutUrl, setCheckoutUrl] = useState();

  const [success, setSuccess] = useState(false);

  const [parsed, setParsed] = useState({});

  const redirectLogin = () => {
    // Generate the URL where users will be redirected to authenticate.
    let authFlowUrl = client.getAuthFlowURI({
      client_id: "f40ac19e-7a76-11ee-8b41-d2500a0c99b2", // replace with your auth flow client ID
      redirect_uri: window.location.origin + window.location.pathname, // specify your redirect URI
      // Optional parameters for automatic wallet selection (if applicable)
      network: "goerli", // specify the network
      chain: "ethereum", // specify the chain
    });

    // Store the code verifier securely between requests.
    window.localStorage.setItem("myCodeVerifier", client.codeVerifier);

    // Redirect the user to the Monerium authentication flow.
    window.location.replace(authFlowUrl);
  };

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
      const ws = new WebSocket("wss://chat.kesarx.repl.co/" + localProfileId);

      ws.onmessage = (message) => {
        if (message.data.startsWith("{\n\t")) {
          const data = JSON.parse(message.data);

          setCheckoutUrl(data.message);

          const id = data.message.replace(window.location.origin + "/pay/", "");

          const parsed = JSON.parse(decode(id)) || {};

          setParsed(parsed);

          console.log(data.message);

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
        <>
          <Button onClick={redirectLogin}>Login with Monerium</Button>
        </>
      )}
    </Flex>
  );
}
