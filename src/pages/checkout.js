import { Inter } from "next/font/google";
import { MoneriumClient } from "@monerium/sdk";
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
import { ChevronDownIcon } from "@chakra-ui/icons";
import QRCode from "react-qr-code";

const client = new MoneriumClient("sandbox");

const inter = Inter({ subsets: ["latin"] });

const CURRENCIES = ["EUR", "GBP", "USD", "ISK"];

export default function Home() {
  const searchParams = useSearchParams();

  const codeParam = searchParams.get("code");

  const [profileId, setProfileId] = useState();

  const [checkoutUrl, setCheckoutUrl] = useState();

  const getAccessToken = async (code) => {
    const authCode = new URLSearchParams(window.location.search).get("code");

    // Retrieve the stored code verifier.
    const retrievedCodeVerifier = window.localStorage.getItem("myCodeVerifier");

    // Finalize the authentication process.
    await client.auth({
      client_id: "f40ac19e-7a76-11ee-8b41-d2500a0c99b2", // replace with your client ID
      code: authCode,
      code_verifier: retrievedCodeVerifier,
      redirect_url: "http://localhost:3000/checkout", // ensure this matches the redirect_uri used initially
    });

    // Confirm the user is authenticated and retrieve the authentication data.
    const authCtx = await client.getAuthContext();

    localStorage.setItem("profileId", authCtx.profiles[0].id);
  };

  const redirectLogin = () => {
    // Generate the URL where users will be redirected to authenticate.
    let authFlowUrl = client.getAuthFlowURI({
      client_id: "f40ac19e-7a76-11ee-8b41-d2500a0c99b2", // replace with your auth flow client ID
      redirect_uri: "http://localhost:3000/checkout", // specify your redirect URI
      // Optional parameters for automatic wallet selection (if applicable)
      network: "goerli", // specify the network
      chain: "ethereum", // specify the chain
    });

    // Store the code verifier securely between requests.
    window.localStorage.setItem("myCodeVerifier", client.codeVerifier);

    // Redirect the user to the Monerium authentication flow.
    window.location.replace(authFlowUrl);
  };

  const getData = () => {
    console.log(checkoutUrl.replace("https://localhost:3000/pay/", ""));

    const data = decode(checkoutUrl.replace("https://localhost:3000/pay/", ""));

    console.log(data);
  };

  useEffect(() => {
    console.log(checkoutUrl);
    if (checkoutUrl) getData();
  }, [checkoutUrl]);

  useEffect(() => {
    const localProfileId = localStorage.getItem("profileId");

    setProfileId(localProfileId);

    const code = new URLSearchParams(window.location.search).get("code");
    if (code != null && !localProfileId) getAccessToken(code);

    if (localProfileId) {
      const ws = new WebSocket("wss://chat.kesarx.repl.co/" + localProfileId);

      ws.onmessage = (message) => {
        if (message.data.startsWith("{\n\t")) {
          const data = JSON.parse(message.data);

          setCheckoutUrl(data.message);
        }
      };
    }
  }, []);

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
          {checkoutUrl ? (
            <Flex
              alignItems={"center"}
              justifyContent={"space-between"}
              flexDirection={"column"}
              gap={10}
              my={10}
              p={10}
              rounded={"2xl"}
              // boxShadow={"2xl"}
              //   bgColor={"#fffefe"}
            >
              <Heading size={"md"} fontWeight={"md"}>
                Scan To Pay
              </Heading>
              <QRCode size={256} value={checkoutUrl} />
            </Flex>
          ) : (
            <Text>Waiting for checkout...</Text>
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
