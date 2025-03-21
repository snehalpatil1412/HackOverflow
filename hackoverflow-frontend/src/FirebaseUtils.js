import { getDatabase, ref, set, get, update } from "firebase/database";
import { auth } from "./firebaseConfig";

const saveStressData = async (inputType, inputData, prediction, videoSuggestions, aiSuggestions) => {
  const db = getDatabase();
  const userId = auth.currentUser?.uid;

  if (!userId) {
    console.error("User not authenticated.");
    return;
  }

  const isStressDetected = 
    prediction === "Highly Stressed" || prediction === "Moderate Stress" || prediction === "Stressed";

  if (!isStressDetected) {
    console.log("Not stressed, skipping Firebase save.");
    return;
  }

  const timestamp = new Date().toLocaleString();
  const stressCountRef = ref(db, `users/${userId}/input/stress_count`);

  try {
    const snapshot = await get(stressCountRef);
    let stressCount = snapshot.exists() ? snapshot.val().count : 0;

    const sessionId = Date.now();
    const inputRef = ref(db, `users/${userId}/input/${inputType}/${sessionId}`);

    await set(inputRef, {
      input: inputData ?? "No input provided",
      prediction: prediction ?? "Unknown",
      suggestions: videoSuggestions ?? [],
      aiSuggestions: aiSuggestions ?? "No AI suggestions",
      timestamp: timestamp,
    });

    stressCount += 1;
    await update(stressCountRef, { count: stressCount });

    console.log(`Stress detected! Total count: ${stressCount}`);

    if (stressCount >= 6) {
      console.log("STRESSED OVERLOADED!");
    }
  } catch (error) {
    console.error("Error saving stress data:", error);
  }
};



export default saveStressData;
