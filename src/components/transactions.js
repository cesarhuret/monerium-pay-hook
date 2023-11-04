import { VStack, Heading, Box, HStack, Text, Spacer } from "@chakra-ui/react";

export default function Transactions({ transactions, iban }) {
  return (
    <VStack justifyContent={"start"} alignItems={"start"}>
      <Heading>Transaction History</Heading>
      {transactions.map((tx, index) => (
        <Box
          key={index}
          alignItems={"center"}
          justifyContent={"space-between"}
          flexDirection={"column"}
          my={2}
          p={6}
          rounded={"lg"}
          boxShadow={"lg"}
          borderWidth={1}
          bgColor={"#fffefe"}
          w={{ base: "95%", md: "400px" }}
        >
          <HStack>
            <Text>
              {tx.kind == "issue" || tx?.counterpart?.identifier?.iban == iban
                ? "+"
                : "-"}{" "}
              {tx.amount} {tx.currency.toUpperCase()}
            </Text>
            <Spacer flex={1} />
            <Text fontSize={"xs"} fontWeight={"bold"}>
              {tx.meta.state.toUpperCase()}
            </Text>
          </HStack>
        </Box>
      ))}
    </VStack>
  );
}
