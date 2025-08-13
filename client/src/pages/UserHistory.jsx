import {
  Box,
  Button,
  Heading,
  Icon,
  Input,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
  useToast,
  Container,
} from '@chakra-ui/react';
import { FaPlay, FaDownload, FaTrash } from 'react-icons/fa';
import { useEffect, useState, useCallback } from 'react';
import { auth, db } from '../firebase/config';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import ParticleBackground from '../components/ParticleBackground';

const UserHistory = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchHistory = useCallback(async () => {
    const user = auth.currentUser;
    if (!user || !user.emailVerified) return;

    try {
      // First try with the ordered query
      const q = query(
        collection(db, 'history'),
        where('uid', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setHistory(data);
      setFilteredHistory(data);
      setLoading(false);
    } catch (error) {
      if (error.code === 'failed-precondition') {
        // If index doesn't exist, fall back to unordered query and sort in memory
        const q = query(
          collection(db, 'history'),
          where('uid', '==', user.uid)
        );
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        // Sort by createdAt in descending order (newest first)
        const sortedData = data.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });
        setHistory(sortedData);
        setFilteredHistory(sortedData);
        setLoading(false);
      } else {
        console.error('Error fetching history:', error);
        setLoading(false);
        toast({
          title: 'Error',
          description: 'Failed to load history',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  }, [toast]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSearch = (value) => {
    setSearch(value);
    const filtered = history.filter((item) =>
      item.text.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredHistory(filtered);
  };

  const handleDelete = async (itemId) => {
    await deleteDoc(doc(db, 'history', itemId));
    toast({ title: 'Deleted', status: 'info', duration: 2000, isClosable: true });
    fetchHistory();
  };

  const handlePlayAudio = (audioUrl) => {
    if (audioUrl) {
      // Check if it's base64 data or a regular URL
      const audioSource = audioUrl.startsWith('data:audio/') ? audioUrl : audioUrl;
      const audio = new Audio(audioSource);
      audio.play().catch(error => {
        console.error('Error playing audio:', error);
        toast({
          title: 'Error',
          description: 'Could not play audio. The audio file may have expired.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      });
    }
  };

  const handleDownloadAudio = (audioUrl, text) => {
    if (audioUrl) {
      // Create a temporary link element to trigger download
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `audio_${text.substring(0, 20).replace(/[^a-zA-Z0-9]/g, '_')}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isAudioValid = (audioUrl) => {
    if (!audioUrl) return false;
    // Check if it's a valid base64 audio data or a regular URL
    return audioUrl.startsWith('data:audio/') || audioUrl.startsWith('http') || audioUrl.startsWith('blob:');
  };

  return (
    <Box position="relative" minH="100vh" overflow="hidden" py={12}>
      <ParticleBackground />
      <Container maxW="6xl" position="relative" zIndex={1}>
        <Heading size="lg" textAlign="center" mb={6} color="white">
          Your Audio History
        </Heading>

        <Input
          placeholder="Search your history..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          mb={6}
          bg="white"
        />

        {loading ? (
          <Spinner color="teal.400" size="xl" mt={10} />
        ) : filteredHistory.length === 0 ? (
          <Text textAlign="center" color="gray.300">
            No history found.
          </Text>
        ) : (
          <SimpleGrid columns={[1, 2, 3]} spacing={6}>
            {filteredHistory.map((item) => (
              <Box
                key={item.id}
                borderWidth="1px"
                borderRadius="lg"
                p={4}
                bg="gray.800"
                color="white"
                boxShadow="md"
              >
                <Text noOfLines={2} fontSize="md" mb={2}>
                  "{item.text}"
                </Text>

                <Text fontSize="sm" color="gray.400">
                  {item.charCount} characters
                </Text>

                {!isAudioValid(item.audioUrl) && (
                  <Text fontSize="xs" color="red.400" mb={2}>
                    ⚠️ Audio file not available
                  </Text>
                )}

                <Text fontSize="xs" color="gray.500">
                  {item.createdAt?.seconds &&
                    new Date(item.createdAt.seconds * 1000).toLocaleString()}
                </Text>

                <Stack direction="row" spacing={3} mt={4}>
                  {isAudioValid(item.audioUrl) && (
                    <>
                      <Button
                        size="sm"
                        colorScheme="teal"
                        leftIcon={<Icon as={FaPlay} />}
                        onClick={() => handlePlayAudio(item.audioUrl)}
                      >
                        Play
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="gray"
                        leftIcon={<Icon as={FaDownload} />}
                        onClick={() => handleDownloadAudio(item.audioUrl, item.text)}
                      >
                        Download
                      </Button>
                    </>
                  )}
                  <Button
                    size="sm"
                    colorScheme="red"
                    leftIcon={<Icon as={FaTrash} />}
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </Button>
                </Stack>
              </Box>
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  );
};

export default UserHistory;
