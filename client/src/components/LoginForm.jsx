// src/pages/LoginForm.jsx
import React, { useEffect, useState } from 'react';
import {
  Box, Button, Container, FormControl, FormLabel, Heading,
  Input, Stack, Text, useToast
} from '@chakra-ui/react';
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user] = useAuthState(auth);
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        toast({
          title: 'Email not verified.',
          description: 'Please verify your email. Check your spam folder.',
          status: 'warning', duration: 5000, isClosable: true
        });
      } else {
        toast({ title: 'Login successful.', status: 'success', duration: 3000, isClosable: true });
        navigate('/'); // Redirect after verified login
      }
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error', duration: 5000, isClosable: true });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      toast({ title: 'Google Login successful.', status: 'success', duration: 3000, isClosable: true });

      // Google accounts are already verified
      navigate('/');
    } catch (error) {
      toast({ title: 'Google Login Failed', description: error.message, status: 'error', duration: 5000, isClosable: true });
    }
  };

  const handleResendVerification = async () => {
    try {
      const user = auth.currentUser;
      if (user && !user.emailVerified) {
        await sendEmailVerification(user);
        toast({ title: 'Verification Email Resent', status: 'info', duration: 3000, isClosable: true });
      }
    } catch (error) {
      toast({ title: 'Error', description: error.message, status: 'error', duration: 5000, isClosable: true });
    }
  };

  useEffect(() => {
    const checkVerificationAndRedirect = async () => {
      if (user && !user.emailVerified) {
        await user.reload();
      }
      if (user && user.emailVerified) {
        navigate('/');
      }
    };
    checkVerificationAndRedirect();
  }, [user, navigate]);

  return (
    <Box minH="100vh" bg="black" display="flex" alignItems="center" justifyContent="center">
      <Container maxW="md" p={8} bg="gray.800" borderRadius="xl" boxShadow="xl" color="white">
        <Stack spacing={4} textAlign="center" mb={6}>
          <Heading>Login</Heading>
          <Text fontSize="sm">Welcome back! Check your spam folder for verification email.</Text>
        </Stack>
        <form onSubmit={handleLogin}>
          <Stack spacing={4}>
            <FormControl>
              <FormLabel>Email address</FormLabel>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </FormControl>
            <Button type="submit" colorScheme="teal">Login</Button>
            <Button onClick={handleGoogleLogin} colorScheme="red">Login with Google</Button>
            <Button onClick={handleResendVerification} variant="link" color="teal.200">Resend Verification Email</Button>
          </Stack>
        </form>
      </Container>
    </Box>
  );
};

export default LoginForm;
