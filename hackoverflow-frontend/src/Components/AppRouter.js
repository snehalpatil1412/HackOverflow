
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
// import AudioPage from "../Pages/Inputs/AudioPage";
import VideoPage from "../Pages/Inputs/VideoPage";
// import TextPage from "../Pages/Inputs/TextPage";
import InputsPage from "../Pages/Inputs/InputsPage";
import HomePage from "../Pages/HomePage/HomePage";
import ExerciseOption from "../Pages/HomePage/Exercise/ExerciseOption";
import YogaOption from "../Pages/HomePage/Yoga/YogaOption";
import FunActivitiesOption from "../Pages/HomePage/FunActivity/FunActivitiesOption";
import GamePage from "../Pages/HomePage/FunActivity/Games/GamePage";
import MusicPage from "../Pages/HomePage/FunActivity/Music/MusicPage";
import MindfulActivity from "../Pages/Inputs/Activities/Mindful";
import AlertDr from "../Pages/Inputs/Activities/AlertDr";
import LoginPage from "../Pages/Authentication/LoginPage";
import SignupPage from "../Pages/Authentication/SigupPage";
// import QuizPage from "../Pages/Inputs/QuizPage";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import LoaderComponent from "./Loader";

export default function AppRouter() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div><LoaderComponent/></div>; // Optional loading screen while checking auth state
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage setUser={setUser} />} />
        <Route path="/signup" element={<SignupPage setUser={setUser} />} />
        <Route path="/video" element={user ? <VideoPage /> : <Navigate to="/login" />} />
        <Route path="/input" element={user ? <InputsPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/yogaoption" element={<YogaOption />} />
        <Route path="/exerciseoption" element={<ExerciseOption />} />
        <Route path="/funactivitiesoption" element={<FunActivitiesOption />} />
        <Route path="/games" element={<GamePage />} />
        <Route path="/music" element={<MusicPage />} />
        <Route path="/mindful" element={<MindfulActivity />} />
        <Route path="/alertDr" element={<AlertDr />} />
      </Routes>
    </Router>
    )
  }