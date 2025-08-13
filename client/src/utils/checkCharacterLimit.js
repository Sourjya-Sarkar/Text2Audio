import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

export const checkCharacterLimit = async (uid, newChars) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  const data = userSnap.data();

  const currentChars = data?.totalCharactersGenerated || 0;
  const plan = data?.planStatus || "free";

  if (plan === "pro") return true;
  return (currentChars + newChars) <= 2000;
};
