import React from "react";
import { VStack, Icon, Heading, Text, Box, Button } from "@chakra-ui/react";
import { FaCrown } from "react-icons/fa";
import { PayPalButtons } from "@paypal/react-paypal-js";

export default function UpgradePage() {
  return (
    <Box
      minH="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      bg="gray.800"
      px={4}
    >
      <VStack
        spacing={8}
        w="full"
        maxW="md"
        bg="gray.900"
        p={8}
        borderRadius="lg"
        boxShadow="xl"
      >
        {/* Header Section */}
        <VStack spacing={4} textAlign="center">
          <Icon as={FaCrown} w={20} h={20} color="purple.400" />
          <Heading size="xl" color="purple.400">
            Upgrade to Pro
          </Heading>
          <Text color="gray.300" fontSize="lg">
            Unlock unlimited text-to-speech generation and premium features
          </Text>
        </VStack>

        {/* Pricing Section */}
        <VStack spacing={2} w="full">
          <Text fontSize="3xl" fontWeight="bold" color="green.400">
            Only $120
          </Text>
          <Text fontSize="sm" color="gray.400">
            One-time payment • No recurring fees
          </Text>
        </VStack>

        {/* PayPal Button */}
        <Box w="full" bg="gray.700" p={4} borderRadius="md">
          <PayPalButtons
            style={{ layout: "vertical", color: "gold", shape: "pill" }}
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: { value: "120.00" },
                  },
                ],
              });
            }}
            onApprove={(data, actions) => {
              return actions.order.capture().then((details) => {
                alert(
                  `Transaction completed by ${details.payer.name.given_name}`
                );
                // TODO: Update Firestore user plan to "Pro"
              });
            }}
          />
        </Box>

        {/* Back to Home Button */}
        <Button
          as="a"
          href="/"
          w="full"
          size="lg"
          colorScheme="purple"
          variant="outline"
        >
          Back to Home
        </Button>
      </VStack>
    </Box>
  );
}
