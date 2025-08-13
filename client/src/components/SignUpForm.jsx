import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  useToast,
  Link,
} from '@chakra-ui/react';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

const SignupForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(user);
      setVerificationSent(true);
      toast({
        title: 'Signup successful!',
        description: 'Verification email sent. Please check your inbox and spam folder.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Signup failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.emailVerified) {
        await sendEmailVerification(user);
        toast({
          title: 'Verification email sent',
          description: 'Please check your inbox and spam folder.',
          status: 'info',
          duration: 5000,
          isClosable: true,
        });
      } else {
        toast({
          title: 'Signed up successfully with Google',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        navigate('/');
      }
    } catch (error) {
      toast({
        title: 'Google signup failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleResend = async () => {
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        toast({
          title: 'Verification email resent.',
          description: 'Check your inbox and spam folder.',
          status: 'info',
          duration: 4000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error resending email',
          description: error.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  return (
    <Box
      bg="black"
      minH="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      py={10}
      px={4}
    >
      <Container maxW="md" bg="gray.900" borderRadius="lg" p={8} color="white">
        <Stack spacing={4} textAlign="center" mb={6}>
          <Heading>Create Account</Heading>
          <Text fontSize="sm" color="gray.400">
            Let’s get you started with an account.
          </Text>
        </Stack>

        <form onSubmit={handleSignup}>
          <Stack spacing={4}>
            <FormControl>
              <FormLabel>Email address</FormLabel>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormControl>

            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormControl>

            <Button type="submit" colorScheme="teal" width="full" mt={4} size="lg">
              Sign Up
            </Button>

            <Button onClick={handleGoogleSignup} colorScheme="red" variant="outline" size="lg">
              Sign Up with Google
            </Button>

            {verificationSent && (
              <Stack spacing={2} textAlign="center">
                <Text fontSize="sm" color="gray.400">
                  Didn't receive the email? Check your spam folder.
                </Text>
                <Button onClick={handleResend} size="sm" variant="link" color="teal.300">
                  Resend Verification Email
                </Button>
              </Stack>
            )}

            <Text fontSize="sm" color="gray.500" textAlign="center" pt={4}>
              Already have an account?{' '}
              <Link color="teal.300" onClick={() => navigate('/login')}>
                Login
              </Link>
            </Text>
          </Stack>
        </form>
      </Container>
    </Box>
  );
};

export default SignupForm;
