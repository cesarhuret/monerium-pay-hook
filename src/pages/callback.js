import Head from "next/head";
import Image from "next/image";
import { Inter } from "next/font/google";
import styles from "@/styles/Home.module.css";
import { MoneriumClient } from "@monerium/sdk";
import { useEffect } from "react";

const client = new MoneriumClient("sandbox");

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  useEffect(() => {
    // Generate the URL where users will be redirected to authenticate.
    let authFlowUrl = client.getAuthFlowURI({
      client_id: "f40ac19e-7a76-11ee-8b41-d2500a0c99b2", // replace with your auth flow client ID
      redirect_uri: "http://localhost:3000/", // specify your redirect URI
      // Optional parameters for automatic wallet selection (if applicable)
      network: "goerli", // specify the network
      chain: "ethereum", // specify the chain
      address: "0xValidAddress72413Fa92980B889A1eCE84dD", // user wallet address
      signature:
        "0xValidSignature0df2b6c9e0fc067ab29bdbf322bec30aad7c46dcd97f62498a91ef7795957397e0f49426e000b0f500c347219ddd98dc5080982563055e918031c", // user wallet signature
    });

    // Store the code verifier securely between requests.
    window.localStorage.setItem("myCodeVerifier", client.codeVerifier);

    // Redirect the user to the Monerium authentication flow.
    window.location.replace(authFlowUrl);
  }, []);

  return <Button></Button>;
}
