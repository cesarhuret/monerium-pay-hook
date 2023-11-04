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
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import { ChevronDownIcon } from "@chakra-ui/icons";

const client = new MoneriumClient("sandbox");

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [authContext, setAuthCTX] = useState({});
  const [profileId, setProfileId] = useState("");
  const [accounts, setAccounts] = useState({});
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [transactions, setTransactions] = useState([]);

  const router = useRouter();

  const searchParams = useSearchParams();

  const codeParam = searchParams.get("code");

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

  const Accounts = ({ accounts }) => (
    <VStack
      w={"full"}
      spacing={5}
      justifyContent={"center"}
      alignItems={"center"}
      p={4}
    >
      <Heading>Receive</Heading>
      {Object.keys(accounts).map((account, index) => {
        console.log(accounts);
        return (
          <HStack justify={"space-between"} key={account} p={6}>
            {/* <Heading fontFamily={inter} pb={6} size={"md"}>
              {account.substring(0, 6)}...{account.substring(38, 42)}
            </Heading> */}
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                Recipient
              </MenuButton>
              <MenuList>
                {Object.values(accounts[account]).map((data, index) => (
                  <MenuItem>{data.currency}</MenuItem>
                ))}
              </MenuList>
            </Menu>
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                Currency
              </MenuButton>
              <MenuList>
                {Object.values(accounts[account]).map((data, index) => (
                  <MenuItem>{data.currency}</MenuItem>
                ))}
              </MenuList>
            </Menu>
          </HStack>
        );
      })}
    </VStack>
  );

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
          </HStack>
          <VStack
            w={"100%"}
            h={"90vh"}
            alignItems={"center"}
            spacing={10}
            py={5}
          >
            <Accounts accounts={accounts} />
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
