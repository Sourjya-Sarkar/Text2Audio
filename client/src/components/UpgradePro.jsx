import React, { useState } from "react";
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
  HStack,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
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
  
  const [paymentStatus, setPaymentStatus] = useState("pending"); // pending, processing, success, failed
  const [orderId, setOrderId] = useState(null);
  const [userPlan, setUserPlan] = useState("Free");

  const paypalClientId = import.meta.env.VITE_PAYPAL_CLIENT_ID;

  // Check current user plan on component mount
  React.useEffect(() => {
    const checkUserPlan = async () => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUserPlan(userData.plan || "Free");
          }
        } catch (error) {
          console.error("Error checking user plan:", error);
        }
      }
    };
    checkUserPlan();
  }, [user]);

  // If user is already Pro, redirect to home
  if (userPlan === "Pro") {
    return (
      <Box position="relative" bg="black" color="white" minHeight="100vh" display="flex" flexDirection="column" overflow="hidden">
        <ParticleBackground />
        <Navbar />
        <Container maxW="md" py={20} centerContent zIndex={1}>
          <VStack spacing={6} textAlign="center">
            <Icon as={FaCrown} w={16} h={16} color="purple.400" />
            <Heading size="lg" color="purple.400">
              You're Already Pro! 🎉
            </Heading>
            <Text color="gray.300">
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

  // Handle successful payment
  const handlePaymentSuccess = async (orderId) => {
    setPaymentStatus("processing");
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { 
        plan: "Pro",
        upgradedAt: new Date(),
        orderId: orderId
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

      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate("/");
      }, 3000);

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

  // Handle payment error
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

  // Handle payment cancellation
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
    <Box position="relative" bg="black" color="white" minHeight="100vh" display="flex" flexDirection="column" overflow="hidden">
      <ParticleBackground />
      <Navbar />
      <Container maxW="2xl" py={10} zIndex={1}>
        <VStack spacing={6}>
          <Button
            leftIcon={<FaArrowLeft />}
            variant="ghost"
            onClick={() => navigate("/")}
            alignSelf="flex-start"
            color="gray.300"
            _hover={{ bg: "gray.800" }}
          >
            Back to Home
          </Button>

          <VStack spacing={8} w="full" bg="gray.900" p={8} borderRadius="lg" boxShadow="lg">
            <VStack spacing={4} textAlign="center">
              <Icon as={FaCrown} w={20} h={20} color="purple.400" />
              <Heading size="xl" color="purple.400">
                Upgrade to Pro
              </Heading>
              <Text color="gray.300" fontSize="lg">
                Unlock unlimited text-to-speech generation and premium features
              </Text>
            </VStack>

            <VStack spacing={6} w="full" align="start">
              <Heading size="md" color="white">
                Pro Features Include:
              </Heading>
              
              <VStack spacing={3} w="full" align="start">
                <HStack>
                  <Icon as={FaCheckCircle} color="green.400" />
                  <Text fontSize="md" color="gray.300">Unlimited character generation</Text>
                </HStack>
                <HStack>
                  <Icon as={FaCheckCircle} color="green.400" />
                  <Text fontSize="md" color="gray.300">All premium AI voices</Text>
                </HStack>
                <HStack>
                  <Icon as={FaCheckCircle} color="green.400" />
                  <Text fontSize="md" color="gray.300">Priority processing</Text>
                </HStack>
                <HStack>
                  <Icon as={FaCheckCircle} color="green.400" />
                  <Text fontSize="md" color="gray.300">Advanced export options</Text>
                </HStack>
              </VStack>
            </VStack>

            <VStack spacing={4} w="full">
              <Text fontSize="3xl" fontWeight="bold" color="green.400">
                Only ₹10,000
              </Text>
              <Text fontSize="sm" color="gray.400">
                One-time payment • No recurring fees
              </Text>
            </VStack>

            <Box w="full" maxW="400px">
              {paypalClientId && paypalClientId.trim() !== '' ? (
                <PayPalButtons
                  style={{ 
                    layout: "vertical", 
                    color: "gold", 
                    shape: "rect", 
                    label: "paypal" 
                  }}
                  createOrder={(data, actions) => {
                    return actions.order.create({
                      purchase_units: [
                        {
                          description: "Upgrade to Pro Plan - Text to Speech App",
                          amount: { 
                            currency_code: "INR", 
                            value: "10000.00" 
                          },
                          custom_id: user?.uid || "unknown_user"
                        },
                      ],
                      application_context: {
                        shipping_preference: "NO_SHIPPING"
                      }
                    });
                  }}
                  onApprove={async (data, actions) => {
                    try {
                      const order = await actions.order.capture();
                      console.log("Order captured:", order);
                      setOrderId(order.id);
                      handlePaymentSuccess(order.id);
                    } catch (error) {
                      console.error("Error capturing order:", error);
                      handlePaymentError(error);
                    }
                  }}
                  onError={handlePaymentError}
                  onCancel={handlePaymentCancel}
                />
              ) : (
                <VStack spacing={4} p={6} bg="gray.800" borderRadius="lg" border="1px" borderColor="gray.700">
                  <Icon as={FaTimesCircle} w={8} h={8} color="orange.400" />
                  <Text color="orange.400" fontWeight="bold">
                    PayPal Not Configured
                  </Text>
                  <Text fontSize="sm" color="gray.400" textAlign="center">
                    Please contact support to complete your upgrade.
                  </Text>
                  <Button 
                    colorScheme="blue" 
                    size="sm"
                    onClick={() => navigate("/")}
                  >
                    Return to Home
                  </Button>
                </VStack>
              )}
            </Box>

            <Divider borderColor="gray.700" />
            
            <Text fontSize="xs" color="gray.500" textAlign="center">
              By proceeding, you agree to our terms of service and privacy policy.
              Your payment is processed securely by PayPal.
            </Text>

            {/* Payment Status Display */}
            {paymentStatus === "processing" && (
              <VStack spacing={4} p={6} bg="gray.800" borderRadius="lg" border="1px" borderColor="gray.700">
                <Spinner size="xl" color="blue.400" />
                <Text fontSize="lg" color="blue.400">
                  Processing your payment...
                </Text>
                <Text fontSize="sm" color="gray.400">
                  Please wait while we upgrade your account.
                </Text>
              </VStack>
            )}

            {paymentStatus === "success" && (
              <VStack spacing={4} p={6} bg="gray.800" borderRadius="lg" border="1px" borderColor="gray.700">
                <Icon as={FaCheckCircle} w={16} h={16} color="green.400" />
                <Heading size="lg" color="green.400">
                  Welcome to Pro! 🎉
                </Heading>
                <Text color="green.400" textAlign="center">
                  Your payment was successful and your account has been upgraded to Pro.
                  You now have unlimited access to all features!
                </Text>
                <Badge colorScheme="purple" fontSize="lg" p={3}>
                  Pro Plan Active
                </Badge>
                <Text fontSize="sm" color="gray.400">
                  Redirecting to home page...
                </Text>
              </VStack>
            )}

            {paymentStatus === "failed" && (
              <VStack spacing={4} p={6} bg="gray.800" borderRadius="lg" border="1px" borderColor="gray.700">
                <Icon as={FaTimesCircle} w={16} h={16} color="red.400" />
                <Heading size="lg" color="red.400">
                  Payment Failed ❌
                </Heading>
                <Text color="red.400" textAlign="center">
                  There was an issue processing your payment. Please try again or contact support.
                </Text>
                <Button 
                  colorScheme="blue" 
                  onClick={() => setPaymentStatus("pending")}
                >
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
