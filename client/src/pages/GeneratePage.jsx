import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Select,
  Stack,
  Text,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ParticleBackground from '../components/ParticleBackground';
import { auth, db } from '../firebase/config';
import { doc, getDoc, updateDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { saveUserGeneration } from '../utils/saveUserGeneration';

const GeneratePage = () => {
  const [prompt, setPrompt] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('EXAVITQu4vr4xnSDxMaL');
  const [audioUrl, setAudioUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [characterCount, setCharacterCount] = useState(0);
  const [plan, setPlan] = useState('Free');
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const toast = useToast();

  const voiceOptions = [
    { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Rachel' },
    { id: '21m00Tcm4TlvDq8ikWAM', name: 'Adam' },
    { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni' },
  ];

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setCharacterCount(data.characterCount || 0);
          setPlan(data.plan || 'Free');
        } else {
          await setDoc(docRef, { characterCount: 0, plan: 'Free' });
          setCharacterCount(0);
          setPlan('Free');
        }

        // Add real-time listener to keep character count in sync
        const unsubscribeSnapshot = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setCharacterCount(data.characterCount || 0);
            setPlan(data.plan || 'Free');
          }
        });

        return () => unsubscribeSnapshot();
      } else {
        setUser(null);
        setCharacterCount(0);
        setPlan('Free');
      }
      setAuthLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  const handleGenerate = async () => {
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please login to generate audio.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!prompt) {
      toast({
        title: 'Prompt required',
        description: 'Please enter a prompt before generating audio.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const charactersInPrompt = prompt.length;
    const isFreeUser = plan === 'Free';

    if (isFreeUser && characterCount + charactersInPrompt > 200) {
      toast({
        title: 'Free limit exceeded',
        description: 'Upgrade to Pro to generate more audio.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setLoading(true);
      setAudioUrl(null);

      const response = await axios.post(
        '/api/generate-voice',
        { prompt, voiceId: selectedVoice },
        { responseType: 'blob' }
      );

      const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(audioBlob);
      setAudioUrl(url);

      // Update character count in the user document (this will be handled by saveUserGeneration)
      // Remove the duplicate updateDoc call here to avoid double counting

      await saveUserGeneration(user.uid, prompt, url); // Save history to Firestore

      // Update local state to reflect the new count
      setCharacterCount((prev) => prev + charactersInPrompt);
      
      toast({
        title: 'Audio generated successfully!',
        description: 'Your audio has been generated and saved to your history.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: error.response?.data?.error || error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      position="relative"
      bg="black"
      color="white"
      minHeight="100vh"
      display="flex"
      flexDirection="column"
    >
      <ParticleBackground />
      <Navbar />

      <Container
        maxW="xl"
        flex="1"
        py={10}
        px={4}
        bg="gray.900"
        borderRadius="lg"
        mt={6}
        zIndex={1}
        position="relative"
      >
        <Stack spacing={6}>
          <Heading textAlign="center">AI Voice Generator</Heading>

          {!authLoading && !user ? (
            <Text fontSize="sm" color="red.300" textAlign="center">
              Please login to generate audio
            </Text>
          ) : (
            <Text fontSize="sm" color="gray.300" textAlign="center">
              Plan: {plan} &nbsp;|&nbsp; {characterCount} / {plan === 'Free' ? 200 : '∞'} characters used
            </Text>
          )}

          <Input
            placeholder="Enter your prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            bg="white"
            color="black"
            isDisabled={authLoading || !user}
          />

          <Select
            value={selectedVoice}
            onChange={(e) => setSelectedVoice(e.target.value)}
            bg="white"
            color="black"
            isDisabled={authLoading || !user}
          >
            {voiceOptions.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name}
              </option>
            ))}
          </Select>

          <Button
            onClick={handleGenerate}
            colorScheme="teal"
            isLoading={loading || authLoading}
            isDisabled={authLoading || !user || (plan === 'Free' && characterCount >= 200)}
          >
            {authLoading ? 'Loading...' : 'Generate Audio'}
          </Button>

          {audioUrl && (
            <Stack spacing={4} align="center">
              <audio controls src={audioUrl} style={{ width: '100%' }} />
              <Button
                as="a"
                href={audioUrl}
                download="generated-voice.mp3"
                colorScheme="blue"
                variant="outline"
              >
                Download Audio
              </Button>
            </Stack>
          )}
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
};

export default GeneratePage;
