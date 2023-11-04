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
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

export default function Receive() {
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
            <Text>To: </Text>
            <Text>
              {recipient.substring(0, 6) + "..." + recipient.substring(38, 42)}{" "}
            </Text>
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
}