import React, { useEffect, useState, useRef } from "react";
import { getDatabase, ref, get } from "firebase/database";
import { auth } from "../../firebaseConfig";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Heading, Box, Text, Spinner } from "@chakra-ui/react";

const UserHistory = () => {
  const chartRef = useRef();
  const [stressData, setStressData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStressData = async () => {
      const db = getDatabase();
      const userId = auth.currentUser?.uid;

      if (!userId) {
        console.error("User not logged in or userId not available");
        setLoading(false);
        return;
      }

      try {
        const snapshot = await get(ref(db, `users/${userId}/input/video`));

        if (snapshot.exists()) {
          const data = snapshot.val();
          console.log("Fetched Firebase Data:", data);

          // Convert object to array and sort by timestamp
          const entries = Object.values(data)
            .map((entry) => {
              const stressLevel = getStressLevel(entry.prediction);
              const entryDate = entry.timestamp ? new Date(entry.timestamp) : new Date();
              return {
                ...entry,
                date: entryDate,
                stressLevel: stressLevel,
                readableTime: entry.timestamp || entryDate.toLocaleString()
              };
            })
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort oldest to newest

          // Get the last 5 entries
          const lastFive = entries.slice(-5);
          setStressData(lastFive);
        } else {
          console.warn("No stress data found");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }

      setLoading(false);
    };

    fetchStressData();
  }, []);

  const getStressLevel = (prediction) => {
    if (prediction === "Highly Stressed") return 3;
    if (prediction === "Moderate Stress") return 2;
    if (prediction === "Not Stressed") return 1;
    return 0;
  };

  return (
    <Box p={6} background="white" borderRadius="lg" shadow="md" width="100%" maxW="1200px" mx="auto">
      <Heading mb={6} textAlign="center">Last 5 Stress Predictions</Heading>
      {loading ? (
        <Box textAlign="center"><Spinner size="xl" color="purple.500" /></Box>
      ) : (
        <>
          {stressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={stressData} ref={chartRef}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="readableTime" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" />
                <YAxis
                  domain={[0, 3]}
                  tickFormatter={(value) => ["None", "Low", "Moderate", "High"][value]}
                />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="stressLevel" stroke="#6c3bde" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Text>No stress data available.</Text>
          )}
        </>
      )}
    </Box>
  );
};

export default UserHistory;
