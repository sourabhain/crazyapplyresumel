
import { db } from "@/utils/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp,
  orderBy,
  Timestamp,
  DocumentData
} from "firebase/firestore";

export interface ResumeHistory {
  id?: string;
  userId: string;
  resumeText: string;
  jobDescription: string;
  timestamp: Timestamp | null;
  title: string;
}

// Collection reference
const resumeHistoryCollection = collection(db, "resumeHistory");

// Save resume to history
export const saveResumeToHistory = async (
  userId: string, 
  resumeText: string, 
  jobDescription: string,
  title: string = "Resume"
): Promise<string> => {
  try {
    const docRef = await addDoc(resumeHistoryCollection, {
      userId,
      resumeText,
      jobDescription,
      timestamp: serverTimestamp(),
      title
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving resume:", error);
    throw error;
  }
};

// Get user's resume history
export const getUserResumeHistory = async (userId: string): Promise<ResumeHistory[]> => {
  try {
    const q = query(
      resumeHistoryCollection, 
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        resumeText: data.resumeText,
        jobDescription: data.jobDescription,
        timestamp: data.timestamp,
        title: data.title || "Resume"
      };
    });
  } catch (error) {
    console.error("Error getting resume history:", error);
    throw error;
  }
};
