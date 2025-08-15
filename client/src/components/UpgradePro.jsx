import React, { useState, useEffect } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Badge,
  Button,
  useToast,
  Spinner,
  Divider,
  Icon,
} from "@chakra-ui/react";
import { FaCrown, FaCheckCircle, FaTimesCircle, FaArrowLeft } from "react-icons/fa";
import ParticleBackground from "./ParticleBackground";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function UpgradePro() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [orderId, setOrderId] = useState(null);
  const [userPlan, setUserPlan] = useState("Free");

  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  useEffect(() => {
    const checkUserPlan = async () => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUserPlan(userSnap.data().plan || "Free");
          }
        } catch (error) {
          console.error("Error checking user plan:", error);
        }
      }
    };
    checkUserPlan();
  }, [user]);

  if (userPlan === "Pro") {
    return (
      <Box bg="black" color="white" minHeight="100vh">
        <ParticleBackground />
        <Navbar />
        <Container maxW="md" py={20} centerContent>
          <VStack spacing={6} bg="whiteAlpha.100" p={10} borderRadius="lg" boxShadow="lg">
            <Icon as={FaCrown} w={16} h={16} color="purple.400" />
            <Heading size="lg" color="purple.300">
              You're Already Pro! 🎉
            </Heading>
            <Text color="gray.200" textAlign="center">
              You already have access to all Pro features.
            </Text>
            <Button colorScheme="purple" onClick={() => navigate("/")}>
              Go to Home
            </Button>
          </VStack>
        </Container>
        <Footer />
      </Box>
    );
  }

  const handlePaymentSuccess = async (orderId) => {
    setPaymentStatus("processing");
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        plan: "Pro",
        upgradedAt: new Date(),
        orderId,
      });

      setPaymentStatus("success");
      setUserPlan("Pro");

      toast({
        title: "🎉 Upgrade Successful!",
        description: "You are now a Pro user with unlimited access!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      console.error("Error upgrading to Pro:", error);
      setPaymentStatus("failed");
      toast({
        title: "❌ Upgrade Failed",
        description: "Payment was successful but account update failed. Contact support.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handlePaymentError = (err) => {
    console.error("PayPal Checkout error:", err);
    setPaymentStatus("failed");
    toast({
      title: "❌ Payment Failed",
      description: "There was an error processing your payment. Please try again.",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  };

  const handlePaymentCancel = () => {
    setPaymentStatus("pending");
    toast({
      title: "Payment Cancelled",
      description: "You can try again anytime.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box bg="black" color="white" minHeight="100vh">
      <ParticleBackground />
      <Navbar />
      <Container maxW="2xl" py={12}>
        <VStack spacing={6} align="stretch">
          <Button
            leftIcon={<FaArrowLeft />}
            variant="outline"
            onClick={() => navigate("/")}
            alignSelf="flex-start"
            colorScheme="gray"
            borderColor="gray.500"
          >
            Back to Home
          </Button>

          {/* Main Card */}
          <VStack
            spacing={8}
            w="full"
            bg="white"
            color="gray.800"
            p={10}
            borderRadius="lg"
            boxShadow="2xl"
          >
            <VStack spacing={4} textAlign="center">
              <Icon as={FaCrown} w={20} h={20} color="purple.500" />
              <Heading size="xl" color="purple.600">
                Upgrade to Pro
              </Heading>
              <Text fontSize="lg" color="gray.600">
                Unlock unlimited text-to-speech generation and premium features.
              </Text>
            </VStack>

            <VStack spacing={1} w="full">
              <Text fontSize="3xl" fontWeight="bold" color="green.500">
                Only $120
              </Text>
              <Text fontSize="sm" color="gray.500">
                One-time payment • No recurring fees
              </Text>
            </VStack>

            {/* PayPal */}
            <Box w="full" maxW="400px">
              {paypalClientId ? (
                <PayPalButtons
                  style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal" }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [
                        {
                          description: "Upgrade to Pro Plan - Text to Speech App",
                          amount: { currency_code: "USD", value: "120.00" },
                          custom_id: user?.uid || "unknown_user",
                        },
                      ],
                      application_context: { shipping_preference: "NO_SHIPPING" },
                    });
                  }}
                  onApprove={async (data, actions) => {
                    try {
                      const order = await actions.order.capture();
                      setOrderId(order.id);
                      handlePaymentSuccess(order.id);
                    } catch (error) {
                      handlePaymentError(error);
                    }
                  }}
                  onError={handlePaymentError}
                  onCancel={handlePaymentCancel}
                />
              ) : (
                <VStack spacing={4} p={6} bg="gray.100" borderRadius="lg">
                  <Icon as={FaTimesCircle} w={8} h={8} color="orange.400" />
                  <Text color="orange.500" fontWeight="bold">
                    PayPal Not Configured
                  </Text>
                  <Button colorScheme="blue" size="sm" onClick={() => navigate("/")}>
                    Return to Home
                  </Button>
                </VStack>
              )}
            </Box>

            <Divider borderColor="gray.300" />

            {paymentStatus === "processing" && (
              <VStack spacing={4} p={6} bg="gray.100" borderRadius="lg">
                <Spinner size="xl" color="blue.500" />
                <Text fontSize="lg" color="blue.500">
                  Processing your payment...
                </Text>
              </VStack>
            )}

            {paymentStatus === "success" && (
              <VStack spacing={4} p={6} bg="green.50" borderRadius="lg">
                <Icon as={FaCheckCircle} w={16} h={16} color="green.500" />
                <Heading size="lg" color="green.600">
                  Welcome to Pro! 🎉
                </Heading>
                <Badge colorScheme="purple" fontSize="lg" p={3}>
                  Pro Plan Active
                </Badge>
              </VStack>
            )}

            {paymentStatus === "failed" && (
              <VStack spacing={4} p={6} bg="red.50" borderRadius="lg">
                <Icon as={FaTimesCircle} w={16} h={16} color="red.500" />
                <Heading size="lg" color="red.600">
                  Payment Failed ❌
                </Heading>
                <Button colorScheme="blue" onClick={() => setPaymentStatus("pending")}>
                  Try Again
                </Button>
              </VStack>
            )}
          </VStack>
        </VStack>
      </Container>
      <Footer />
    </Box>
  );
}
