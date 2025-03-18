import React, { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebaseConfig";
import { getDatabase, ref, set, get } from "firebase/database";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Get additional user info from database
        const database = getDatabase();
        const userRef = ref(database, `users/${user.uid}`);
        
        get(userRef).then((snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUser({
              ...user,
              firstName: userData.firstName || '',
              lastName: userData.lastName || ''
            });
          } else {
            setUser(user);
          }
        }).catch(error => {
          console.error("Error fetching user data:", error);
          setUser(user);
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in database
      const database = getDatabase();
      const userRef = ref(database, `users/${user.uid}`);
      
      const snapshot = await get(userRef);
      if (!snapshot.exists()) {
        // If new user, save to database
        // Extract first and last name from display name
        const displayName = user.displayName || '';
        const nameParts = displayName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        await set(userRef, {
          firstName,
          lastName,
          email: user.email,
          sessions: {}
        });
        
        // Update user state
        setUser({
          ...user,
          firstName,
          lastName
        });
        
        // Save to localStorage
        localStorage.setItem(
          "user",
          JSON.stringify({
            uid: user.uid,
            firstName,
            lastName,
            email: user.email
          })
        );
      }
      
      return user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, signInWithGoogle }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}