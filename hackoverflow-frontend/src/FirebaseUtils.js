import { getDatabase, ref, set, get, update } from "firebase/database";
import { auth } from "./firebaseConfig"; // Import your Firebase config

const saveStressData = async (inputType, inputData, prediction, videoSuggestions, aiSuggestions) => {
  const db = getDatabase();
  const userId = auth.currentUser?.uid;

  if (!userId) {
    console.error("User not authenticated.");
    return;
  }

  // Removed the conditional check that previously only counted stress entries
  // Now all predictions will be saved including "Not Stressed"
  
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

    // Increment the stress count for all entries including "Not Stressed"
    stressCount += 1;
    await update(stressCountRef, { count: stressCount });

    console.log(`Prediction recorded! Total count: ${stressCount}`);

    if (stressCount >= 6) {
      console.log("STRESSED OVERLOADED!");
    }
  } catch (error) {
    console.error("Error saving stress data:", error);
  }
};

export default saveStressData;