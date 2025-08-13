// src/components/Navbar.jsx
import React, { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  Spacer,
  Button,
  Avatar,
  useColorModeValue,
  Stack,
  Text,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';


const Navbar = () => {
  const navigate = useNavigate();
  const [user] = useAuthState(auth);
  const [userPlan, setUserPlan] = useState('');

  useEffect(() => {
    const fetchPlan = async () => {
      if (user && user.emailVerified) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserPlan(docSnap.data().plan || 'Free');
        } else {
          setUserPlan('Free');
        }
      }
    };
    fetchPlan();
  }, [user]);

  const handleLogout = () => {
    auth.signOut();
    navigate('/');
  };

  return (
    <Box
      bg={useColorModeValue('blackAlpha.800', 'blackAlpha.900')}
      color="white"
      px={8}
      py={4}
      boxShadow="md"
      backdropFilter="blur(6px)"
      zIndex="999"
      position="sticky"
      top="0"
    >
      <Flex align="center">
        <Heading size="md" color="teal.300" cursor="pointer" onClick={() => navigate('/')}>Text2Audio</Heading>
        <Spacer />

        {user && user.emailVerified ? (
          <Stack direction="row" align="center" spacing={4}>
            <Text fontSize="sm" color="gray.300" bg="gray.700" px={3} py={1} borderRadius="md">
              {userPlan} Plan
            </Text>
            <Button
    size="sm"
    variant="ghost"
    colorScheme="teal"
    onClick={() => navigate('/history')}
  >
    History
  </Button>
            <Avatar
              name={user.displayName || user.email}
              bg="purple.500"
              color="white"
              size="sm"
              cursor="pointer"
            />
            <Button size="sm" variant="outline" colorScheme="teal" onClick={handleLogout}>
              Logout
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={4}>
            <Button variant="ghost" colorScheme="teal" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button variant="outline" colorScheme="teal" onClick={() => navigate('/signup')}>
              Sign Up
            </Button>
          </Stack>
        )}
      </Flex>
    </Box>
  );
};

export default Navbar;
