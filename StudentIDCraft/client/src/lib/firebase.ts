import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc, deleteDoc } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signInWithPopup, signOut } from "firebase/auth";
import { Student, SavedCard } from "@/types";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase - prevent duplicate initialization
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
const auth = getAuth(app);

// Authentication functions
export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    // Add scopes for better user experience
    provider.addScope('profile');
    provider.addScope('email');
    
    // Use redirect for better compatibility with Replit environment
    await signInWithRedirect(auth, provider);
    return null; // User will be available after redirect completes
  } catch (error) {
    console.error("Error signing in with Google", error);
    throw error;
  }
};

// Check for redirect result on page load
export const checkRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      // User successfully signed in after redirect
      return result.user;
    }
    return null;
  } catch (error) {
    console.error("Error with redirect result", error);
    throw error;
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

// Firestore operations
export const syncStudentToCloud = async (student: Student) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }
    
    // Format student object for Firestore
    const studentData = {
      ...student,
      userId: auth.currentUser.uid,
      syncedAt: new Date().toISOString(),
      allergies: Array.isArray(student.allergies) ? student.allergies : JSON.parse(student.allergies as unknown as string),
      customFields: student.customFields ? 
        (typeof student.customFields === 'string' ? JSON.parse(student.customFields) : student.customFields) 
        : null
    };
    
    // Use the student's id as the document ID
    await setDoc(doc(db, "students", student.id), studentData);
    return studentData;
  } catch (error) {
    console.error("Error syncing student to cloud", error);
    throw error;
  }
};

export const getCloudStudents = async () => {
  try {
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }
    
    const q = query(
      collection(db, "students"), 
      where("userId", "==", auth.currentUser.uid)
    );
    
    const querySnapshot = await getDocs(q);
    const students: Student[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Student;
      students.push(data);
    });
    
    return students;
  } catch (error) {
    console.error("Error getting students from cloud", error);
    throw error;
  }
};

export const syncCardToCloud = async (card: SavedCard) => {
  try {
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }
    
    // Format card for Firestore
    const cardData = {
      ...card,
      userId: auth.currentUser.uid,
      syncedAt: new Date().toISOString(),
      customLayout: card.customLayout ? 
        (typeof card.customLayout === 'string' ? JSON.parse(card.customLayout as string) : card.customLayout) 
        : null,
      student: {
        ...card.student,
        allergies: Array.isArray(card.student.allergies) ? 
          card.student.allergies : 
          JSON.parse(card.student.allergies as unknown as string),
        customFields: card.student.customFields ? 
          (typeof card.student.customFields === 'string' ? 
            JSON.parse(card.student.customFields) : 
            card.student.customFields) 
          : null
      }
    };
    
    // Use the card's id as the document ID
    await setDoc(doc(db, "saved_cards", card.id), cardData);
    return cardData;
  } catch (error) {
    console.error("Error syncing card to cloud", error);
    throw error;
  }
};

export const getCloudCards = async () => {
  try {
    if (!auth.currentUser) {
      throw new Error("User not authenticated");
    }
    
    const q = query(
      collection(db, "saved_cards"), 
      where("userId", "==", auth.currentUser.uid)
    );
    
    const querySnapshot = await getDocs(q);
    const cards: SavedCard[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as SavedCard;
      cards.push(data);
    });
    
    return cards;
  } catch (error) {
    console.error("Error getting cards from cloud", error);
    throw error;
  }
};

export { db, auth };