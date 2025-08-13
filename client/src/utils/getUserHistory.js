import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export const maybeResetUserQuota = async (uid) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  const data = userSnap.data();

  if (!data?.lastResetDate) {
    await updateDoc(userRef, { lastResetDate: new Date().toISOString() });
    return;
  }

  const lastReset = new Date(data.lastResetDate);
  const now = new Date();
  const monthPassed = now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear();

  if (monthPassed && data.planStatus === "free") {
    await updateDoc(userRef, {
      totalWordsGenerated: 0,
      lastResetDate: new Date().toISOString(),
    });
  }
};