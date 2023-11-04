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
import {encode as base64_encode} from 'base-64';
import { useRouter } from "next/router";
import QRCode from "react-qr-code";

export default function Pay() {
  const router = useRouter();

  const object = {
    "receiver": "0x0fE4168d2dE4729b8843409a6aceB6461a39757d",
    "amount": "4000000",
    "currency": "USD",
    "items": [
      {
        "name": "Big Mac",
        "quantity": "1",
        "price": "4",
        "currency": "USD"
      }
    ],
    "date": "2021-10-10T10:10:10Z",
    "merchant": "McDonalds",
  }

  const encoded = base64_encode(JSON.stringify(object))

  console.log(encoded)  

  return (
    <VStack justifyContent={"center"} h={"100vh"}>
      <QRCode value={`http://localhost:3000/pay/${encoded}`} />
      <Button onClick={()=>{router.push(`/pay/${encoded}`)}}>
        Pay  
      </Button>  
    </VStack>
  );
}