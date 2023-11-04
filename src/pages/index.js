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
import { encode } from "base-64";
import { useRouter } from "next/router";
import { ChevronDownIcon } from "@chakra-ui/icons";
import QRCode from "react-qr-code";

const client = new MoneriumClient("sandbox");

const inter = Inter({ subsets: ["latin"] });

const CURRENCIES = ["EUR", "GBP", "USD", "ISK"];

export default function Home() {
  const [authContext, setAuthCTX] = useState({});
  const [profileId, setProfileId] = useState("");
  const [accounts, setAccounts] = useState({});
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [transactions, setTransactions] = useState([]);

  const [currency, setCurrency] = useState("EUR");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState(0);

  const router = useRouter();

  const searchParams = useSearchParams();

  const codeParam = searchParams.get("code");

  const { isOpen, onOpen, onClose } = useDisclosure();

  const getAccessToken = async (code) => {
    // After user authentication, Monerium redirects back to your specified URI with a code.
    // Capture this code from the URL and proceed with the authentication.

    // Extract the 'code' URL parameter.
    const authCode = new URLSearchParams(window.location.search).get("code");

    // Retrieve the stored code verifier.
    const retrievedCodeVerifier = window.localStorage.getItem("myCodeVerifier");

    // Finalize the authentication process.
    await client.auth({
      client_id: "f40ac19e-7a76-11ee-8b41-d2500a0c99b2", // replace with your client ID
      code: authCode,
      code_verifier: retrievedCodeVerifier,
      redirect_url: "http://your-webpage.com/monerium-integration", // ensure this matches the redirect_uri used initially
    });

    // Confirm the user is authenticated and retrieve the authentication data.
    const authCtx = await client.getAuthContext();
    setAuthCTX(authCtx);

    const { id, accounts } = await client.getProfile(authCtx.profiles[0].id);

    console.log(id, accounts);

    let filteredAccounts = {};

    for (const account of accounts) {
      const { address } = account;

      if (!filteredAccounts[address]) {
        filteredAccounts[address] = [];
      }

      filteredAccounts[address].push(account);
    }

    setProfileId(id);
    setAccounts(filteredAccounts);

    console.log(filteredAccounts);

    // Your access and refresh tokens are now available.
    const { access_token, refresh_token } = client.bearerProfile;

    localStorage.setItem("profileId", id);
    localStorage.setItem("accessToken", access_token);
    localStorage.setItem("refreshToken", refresh_token);

    setAccessToken(access_token);
    setRefreshToken(refresh_token);

    console.log(access_token, refresh_token);

    console.log(await getOrders());

    setTransactions(await getOrders());

    console.log(authCtx.profiles[0].id);

    router.replace("/", undefined, { shallow: true });
  };

  const redirectLogin = () => {
    // Generate the URL where users will be redirected to authenticate.
    let authFlowUrl = client.getAuthFlowURI({
      client_id: "f40ac19e-7a76-11ee-8b41-d2500a0c99b2", // replace with your auth flow client ID
      redirect_uri: "http://localhost:3000/", // specify your redirect URI
      // Optional parameters for automatic wallet selection (if applicable)
      network: "goerli", // specify the network
      chain: "ethereum", // specify the chain
    });

    // Store the code verifier securely between requests.
    window.localStorage.setItem("myCodeVerifier", client.codeVerifier);

    // Redirect the user to the Monerium authentication flow.
    window.location.replace(authFlowUrl);
  };

  const getOrders = async () => {
    const orders = await client.getOrders(profileId);
    return orders;
  };

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");
    const localAccessToken = localStorage.getItem("accessToken");
    const localRefreshToken = localStorage.getItem("refreshToken");
    const localProfileId = localStorage.getItem("profileId");
    if (code != null && !accessToken) getAccessToken(code);
    else if (code == null && localAccessToken && localRefreshToken) {
      (async () => {
        setAccessToken(localAccessToken);
        setRefreshToken(localRefreshToken);

        console.log(localRefreshToken);

        const lol = await client
          .auth({
            client_id: "f40ac19e-7a76-11ee-8b41-d2500a0c99b2",
            refresh_token: localRefreshToken,
          })
          .catch(() => {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("profileId");
          });

        console.log(lol);

        const authCtx = await client.getAuthContext();
        setAuthCTX(authCtx);

        console.log(
          "%c authCtx",
          "color:white; padding: 30px; background-color: darkgreen",
          authCtx
        );

        const { id, accounts } = await client.getProfile(
          authCtx?.defaultProfile
        );
        console.log(id, accounts);
        let filteredAccounts = {};
        for (const account of accounts) {
          const { address } = account;
          if (!filteredAccounts[address]) {
            filteredAccounts[address] = [];
          }
          filteredAccounts[address].push(account);
        }
        setProfileId(id);
        setAccounts(filteredAccounts);
        setTransactions(await getOrders());
      })();
    }
  }, []);

  const Receive = ({ accounts }) => (
    <Stack w={{ base: "95%", md: "400px" }}>
      <Flex
        alignItems={"center"}
        justifyContent={"space-between"}
        flexDirection={"column"}
        minH={"lg"}
        gap={10}
        my={10}
        p={10}
        rounded={"2xl"}
        boxShadow={"2xl"}
        bgColor={"#fffefe"}
      >
        <Heading>Receive</Heading>
        <VStack
          w={"90%"}
          alignItems={"flex-start"}
          justifyContent={"start"}
          spacing={5}
        >
          <Menu>
            <HStack w={"full"}>
              <Text>To: </Text>
              <MenuButton
                w={"full"}
                as={Button}
                rightIcon={<ChevronDownIcon />}
              >
                {recipient &&
                  recipient.substring(0, 6) +
                    "..." +
                    recipient.substring(38, 42)}
              </MenuButton>
            </HStack>
            <MenuList>
              {Object.keys(accounts).map((data, index) => (
                <MenuItem
                  value={data}
                  onClick={(e) => setRecipient(e.target.value)}
                  key={index}
                >
                  {data}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <HStack w={"full"}>
              <Text>Receive: </Text>
              <MenuButton
                w={"full"}
                as={Button}
                rightIcon={<ChevronDownIcon />}
              >
                {currency}
              </MenuButton>
            </HStack>
            <MenuList>
              {CURRENCIES.map((data, index) => (
                <MenuItem
                  key={index}
                  value={data}
                  onClick={(e) => setCurrency(e.target.value)}
                >
                  {data}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <NumberInput
            w={"full"}
            onChange={(value) => setAmount(value)}
            min={0}
            value={parseInt(amount)}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </VStack>
        <Button
          w={"full"}
          colorScheme="green"
          isDisabled={!recipient || !amount}
          onClick={sendMessage}
        >
          Receive {amount} {currency}
        </Button>
      </Flex>
    </Stack>
  );

  const getPaymentURL = () => {
    const object = {
      receiver: recipient,
      amount: amount,
      currency: currency,
      date: new Date().toISOString(),
      merchant: authContext?.name,
    };

    const encoded = encode(JSON.stringify(object));
    return encoded;
  };

  const waitForPayment = async () => {};

  const Transactions = ({ transactions }) => (
    <VStack justifyContent={"start"} alignItems={"start"}>
      <Heading>Transaction History</Heading>
      {transactions.map((tx, index) => (
        <Text key={index}>
          {tx.address}, {tx.amount}
        </Text>
      ))}
    </VStack>
  );

  const sendMessage = () => {
    const ws = new WebSocket("wss://chat.kesarx.repl.co/" + profileId);

    ws.onopen = () => {
      ws.send("http://localhost:3000/pay/" + getPaymentURL());
    };
  };

  return (
    <Flex
      w={"full"}
      h={"100vh"}
      justifyContent={"center"}
      alignItems={"center"}
      overflowY={"scroll"}
    >
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent h={"lg"}>
          <ModalBody p={10}>
            <VStack
              w={"full"}
              h={"full"}
              alignItems={"center"}
              justifyContent={"space-around"}
            >
              {/* <Heading>Receive</Heading> */}
              <QRCode
                size={180}
                value={"http://localhost:3000/pay/" + getPaymentURL()}
              />
              {/* <VStack spacing={3}>
                <Text>Waiting For Payment</Text>
                <Spinner />
              </VStack> */}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {codeParam ? (
        <Spinner />
      ) : accessToken ? (
        <VStack
          w={"full"}
          h={"100vh"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <HStack w={"full"} p={6} h={"4vh"} alignItems={"center"}>
            <Spacer flex={1} />
            <Text>{authContext?.name}</Text>
          </HStack>
          <VStack
            w={"100%"}
            h={"90vh"}
            alignItems={"center"}
            spacing={10}
            py={5}
          >
            <Receive accounts={accounts} />
            <Transactions transactions={transactions} />
          </VStack>
        </VStack>
      ) : (
        <>
          <Button onClick={redirectLogin}>Login with Monerium</Button>
        </>
      )}
    </Flex>
  );
}
