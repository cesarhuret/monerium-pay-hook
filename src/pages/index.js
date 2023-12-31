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
import { ChevronDownIcon } from "@chakra-ui/icons";
import QRCode from "react-qr-code";
import { createPublicClient, formatUnits, http, parseUnits } from "viem";
import { gnosis } from "viem/chains";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { Transactions, Receive } from "@/components";
import { getAccessToken, getAccessTokenExtended } from "@/utils/getAccessToken";
import { TOKENS } from "@/utils/tokens";

const client = new MoneriumClient("production");

const viemClient = createPublicClient({
  chain: gnosis,
  transport: http(),
});

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [authContext, setAuthCTX] = useState({});
  const [profileId, setProfileId] = useState("");
  const [accounts, setAccounts] = useState({});
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [transactions, setTransactions] = useState([]);

  const [iban, setIban] = useState("");

  console.log(iban);

  const [currency, setCurrency] = useState("EUR");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState(0);

  const [checkoutUrl, setCheckoutUrl] = useState();

  const [message, setMessage] = useState();

  const [signature, setSignature] = useState();

  const router = useRouter();

  const searchParams = useSearchParams();

  const codeParam = searchParams.get("code");

  const getAccessTokenWrapper = async (code) => {
    return getAccessTokenExtended(
      client,
      code,
      setAuthCTX,
      setProfileId,
      setAccounts,
      setRecipient,
      router,
      setTransactions,
      setAccessToken,
      setRefreshToken,
      getOrders
    );
  };

  const generateNewWalletAndSignMessage = async () => {
    var localPrivKey = localStorage.getItem("privateKey");
    if (!localPrivKey) {
      const localPrivKey = generatePrivateKey();
      localStorage.setItem("privateKey", localPrivKey);
    }
    const account = privateKeyToAccount(localPrivKey);

    console.log(localPrivKey);

    const signature = await account.signMessage({
      message: "I hereby declare that I am the address owner.",
    });

    return { address: account.address, signature: signature };
  };

  const redirectLogin = async () => {
    const { address, signature } = await generateNewWalletAndSignMessage();

    // Generate the URL where users will be redirected to authenticate.
    let authFlowUrl = client.getAuthFlowURI({
      client_id: process.env.NEXT_PUBLIC_CLIENT_AUTH_CODE, // replace with your auth flow client ID
      redirect_uri: window.location.origin + window.location.pathname, // specify your redirect URI
      // Optional parameters for automatic wallet selection (if applicable)
      network: "mainnet", // specify the network
      chain: "gnosis", // specify the chain
      address,
      signature,
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
    localStorage.getItem("iban") && setIban(localStorage.getItem("iban"));

    const code = new URLSearchParams(window.location.search).get("code");
    const localAccessToken = localStorage.getItem("accessToken");
    const localRefreshToken = localStorage.getItem("refreshToken");
    const localProfileId = localStorage.getItem("profileId");
    if (code != null && !accessToken) getAccessTokenWrapper(code);
    else if (code == null && localAccessToken && localRefreshToken) {
      (async () => {
        setAccessToken(localAccessToken);
        setRefreshToken(localRefreshToken);

        console.log(localRefreshToken);

        const lol = await client
          .auth({
            client_id: process.env.NEXT_PUBLIC_CLIENT_AUTH_CODE,
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
        setRecipient(
          Object.keys(filteredAccounts)[
            Object.keys(filteredAccounts).length - 1
          ]
        );
        console.log(
          filteredAccounts[
            Object.keys(filteredAccounts)[
              Object.keys(filteredAccounts).length - 1
            ]
          ]
        );

        setAccounts(filteredAccounts);
        setTransactions(await getOrders());
      })();
    }
  }, []);

  const getPaymentURL = () => {
    const object = {
      receiver: recipient,
      amount: amount,
      currency: currency,
      date: new Date().toISOString(),
      merchant: authContext?.name,
      iban: iban,
    };

    const encoded = encode(JSON.stringify(object));

    return encoded;
  };

  const getData = () => {
    const base64Data = checkoutUrl.replace(
      window.location.origin + "/pay/",
      ""
    );
    const data = decode(base64Data);
    const parsed = JSON.parse(data);
    console.log(parsed);
    return parsed;
  };

  const placeOrder = async () => {
    const data = getData();

    console.log(data);

    console.log(signature);

    await client
      .placeOrder({
        kind: "redeem",
        amount: data.amount,
        signature,
        address: data.receiver,
        counterpart: {
          identifier: {
            standard: "iban",
            iban,
          },
          details: {
            firstName: "Cesar",
            lastName: "Huret",
            country: data.iban.substring(0, 2),
          },
        },
        message,
        memo: "Powered by Monerium",
        chain: "gnosis",
        network: "mainnet",
      })
      .then(async (data) => {
        console.log(data);
        setTransactions(await getOrders());
      });
  };

  useEffect(() => {
    if (signature) {
      const unwatch = viemClient.watchContractEvent({
        address: TOKENS[getData()?.currency],
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
          console.log(formatUnits(logs[logs.length - 1].args.value, 18));
          const { receiver } = getData();
          if (
            logs[logs.length - 1].args.to == receiver &&
            formatUnits(logs[logs.length - 1].args.value, 18) == amount
          ) {
            placeOrder();
            unwatch();
          }
        },
      });
    }
  }, [signature]);

  const signMessage = async (msg) => {
    const privateKey = localStorage.getItem("privateKey");

    const account = privateKeyToAccount(privateKey);

    const signature = await account.signMessage({
      message: msg,
    });

    console.log(signature);

    return { address: account.address, signature: signature };
  };

  useEffect(() => {
    if (message) {
      (async () => {
        const sig = await signMessage(message);
        setSignature(sig.signature);
      })();
    }
  }, [message]);

  const sendMessage = () => {
    const ws = new WebSocket("wss://chat.kesarx.repl.co/" + profileId);

    console.log(profileId);

    const data = window.location.origin + "/pay/" + getPaymentURL();

    setCheckoutUrl(data);
    setMessage(placeOrderMessage(amount, iban));

    ws.onopen = () => {
      ws.send(data);
    };
  };

  console.log(authContext);

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
            <Text>{authContext?.defaultProfile}</Text>
          </HStack>
          <VStack
            w={"100%"}
            h={"90vh"}
            alignItems={"center"}
            spacing={10}
            py={5}
          >
            <Receive
              recipient={recipient}
              setCurrency={setCurrency}
              setAmount={setAmount}
              currency={currency}
              amount={amount}
              sendMessage={sendMessage}
              setIban={setIban}
              iban={iban}
              checkoutUrl={checkoutUrl}
            />
            <Transactions transactions={transactions} iban={iban} />
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
