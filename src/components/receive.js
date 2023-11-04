import {
  Stack,
  Flex,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Input,
  IconButton,
} from "@chakra-ui/react";
import { ChevronDownIcon, ExternalLinkIcon } from "@chakra-ui/icons";

const CURRENCIES = ["EUR", "GBP", "USD", "ISK"];

export default function Receive({
  recipient,
  setCurrency,
  setAmount,
  currency,
  amount,
  sendMessage,
  setIban,
  iban,
  checkoutUrl,
}) {
  const ibanWrapper = (data) => {
    setIban(data);
    localStorage.setItem("iban", data);
  };

  return (
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
          <HStack w={"full"}>
            <Input
              placeholder={"IBAN"}
              value={iban}
              onChange={(e) => ibanWrapper(e.target.value)}
            />
          </HStack>

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
        <HStack w={"full"}>
          <Button
            w={"full"}
            colorScheme="green"
            isDisabled={!recipient || !amount}
            onClick={sendMessage}
          >
            Receive {amount} {currency}
          </Button>
          {/* <IconButton isDisabled={!checkoutUrl} icon={<ExternalLinkIcon />} /> */}
        </HStack>
      </Flex>
    </Stack>
  );
}
