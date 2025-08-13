import { doc, getDoc, setDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

export const saveUserGeneration = async (uid, text, audioUrl) => {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    const charCount = text.length;

    if (userSnap.exists()) {
      const prevCount = userSnap.data().characterCount || 0;
      await setDoc(userRef, {
        ...userSnap.data(),
        characterCount: prevCount + charCount,
      });
    } else {
      await setDoc(userRef, {
        plan: 'Free',
        characterCount: charCount,
      });
    }

    // Convert blob URL to base64 for persistent storage
    let audioData = null;
    if (audioUrl && audioUrl.startsWith('blob:')) {
      try {
        const response = await fetch(audioUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        audioData = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error('Error converting blob to base64:', error);
        audioData = null;
      }
    } else {
      audioData = audioUrl; // Keep original URL if it's not a blob
    }

    // Save generation history
    const historyRef = collection(db, 'history');
    await addDoc(historyRef, {
      uid,
      text,
      audioUrl: audioData, // Store base64 data instead of blob URL
      characterCount: charCount,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error saving user generation:', error);
  }
};
