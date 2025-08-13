import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Icon,
  Stack,
  Text,
  useToast,
  Badge,
} from '@chakra-ui/react';
import { FaWaveSquare } from 'react-icons/fa';
import { motion } from 'framer-motion';
import ParticlesBackground from '../components/ParticleBackground';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../firebase/config';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { doc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

const MotionStack = motion(Stack);

const HomePage = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [userPlan, setUserPlan] = useState('Free');
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      const isVerified = !!user && user.emailVerified;
      setIsAuthenticated(isVerified);
      setUser(user);

      if (isVerified && user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserPlan(data.plan || 'Free');
          setCharCount(data.characterCount || 0);
        }

        // Add real-time listener to keep character count in sync
        const userDocRef = doc(db, 'users', user.uid);
        const userUnsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setUserPlan(data.plan || 'Free');
            setCharCount(data.characterCount || 0);
          }
        });

        // Return cleanup function for the user document listener
        return () => {
          userUnsubscribe();
        };
      }
    });

    return () => unsubscribe();
  }, []);

  const handleGenerateClick = () => {
    if (!isAuthenticated) {
      toast({
        title: 'Authentication required',
        description: 'Please login or signup and verify your email.',
        status: 'warning',
        duration: 4000,
        isClosable: true,
      });
    } else {
      navigate('/generate');
    }
  };

  return (
    <Box position="relative" bg="black" color="white" minHeight="100vh" display="flex" flexDirection="column" overflow="hidden">
      <ParticlesBackground />
      <Navbar />

      <Container maxW="3xl" flex="1" centerContent py={20} zIndex="1">
        <MotionStack spacing={6} textAlign="center" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <Icon as={FaWaveSquare} w={16} h={16} color="teal.300" mx="auto" />
          <Heading as="h1" size="2xl" fontWeight="bold">
            Convert Text to Voice Instantly
          </Heading>
          <Text fontSize="lg" color="gray.300">
            Seamlessly turn your ideas into sound using advanced AI voices.
          </Text>

          <Button colorScheme="teal" size="lg" px={10} py={6} onClick={handleGenerateClick} isDisabled={!isAuthenticated}>
            Generate Audio
          </Button>

          {isAuthenticated && (
            <Stack spacing={3} mt={6} align="center">
              <Text fontSize="md" color="gray.300">
                Plan:{' '}
                <Badge colorScheme={userPlan === 'Pro' ? 'purple' : 'green'}>
                  {userPlan}
                </Badge>{' '}
                | Characters Used: <strong>{charCount}</strong> /{' '}
                {userPlan === 'Pro' ? 'Unlimited' : '2000'}
              </Text>

              {userPlan === 'Free' && (
                <Link to="/upgrade">
                  <Button colorScheme="yellow" size="sm">
                    Upgrade to Pro
                  </Button>
                </Link>
              )}
            </Stack>
          )}
        </MotionStack>
      </Container>

      <Footer />
    </Box>
  );
};

export default HomePage;
