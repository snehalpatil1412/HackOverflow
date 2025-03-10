import { getDatabase, ref, set, get, update } from "firebase/database";
import { auth } from "./firebaseConfig"; // Import your Firebase config

const saveStressData = async (inputType, inputData, prediction, result, videoSuggestions) => {
  const db = getDatabase();
  const userId = auth.currentUser?.uid;

  if (!userId) {
    console.error("User not authenticated.");
    return;
  }

  // Check stress condition before saving
  const isStressDetected = 
    (inputType !== "quiz" && (prediction === "stressed" || prediction === "Moderate Stress" || prediction === "Stressed")) || 
    (inputType === "quiz" && (result?.mood === "Severely Stressed" || result?.mood === "Highly Stressed"));

  if (!isStressDetected) {
    console.log("Not stressed, skipping Firebase save.");
    return; // Stop execution here
  }

  // Generate timestamp
  const timestamp = new Date().toLocaleString();

  // Path for stress count tracking
  const stressCountRef = ref(db, `users/${userId}/input/stress_count`);

  try {
    // Fetch current stress count
    const snapshot = await get(stressCountRef);
    let stressCount = snapshot.exists() ? snapshot.val().count : 0;

    // Ensure all values are defined
    const sanitizedInputData = inputData ?? "No input provided";
    const sanitizedPrediction = prediction ?? "Unknown";
    const sanitizedVideoSuggestions = videoSuggestions ?? []; // Ensure an empty array instead of undefined

    // Save data only if it's "stressed"
    const sessionId = Date.now();
    const inputRef = ref(db, `users/${userId}/input/${inputType}/${sessionId}`);

    await set(inputRef, {
      input: sanitizedInputData,
      prediction: sanitizedPrediction,
      suggestions: sanitizedVideoSuggestions,
      timestamp: timestamp,
    });

    // Increment stress count and update Firebase
    stressCount += 1;
    await update(stressCountRef, { count: stressCount });

    console.log(`Stress detected! Total count: ${stressCount}`);

    // Check if stress count reached 6
    if (stressCount >= 6) {
      console.log("STRESSED OVERLOADED!");
    }
  } catch (error) {
    console.error("Error saving stress data:", error);
  }
};

export default saveStressData;
