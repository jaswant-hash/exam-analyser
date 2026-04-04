/**
 * Firebase Service — User-scoped course data
 * All data is stored under users/{uid}/courses/{courseId}
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore, collection, addDoc, getDocs, getDoc,
  doc, Timestamp, query, orderBy, deleteDoc, updateDoc,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);

/** Helper — get current user's UID (throws if not authed) */
function getUID() {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('User not authenticated');
  return uid;
}

/**
 * Save a complete course analysis result for the current user.
 * @param {string} courseName - Name entered by user (e.g. "DBMS")
 * @param {Object} analysisData - Full analysis payload
 * @returns {Promise<string>} courseId
 */
export const saveCourseAnalysis = async (courseName, analysisData) => {
  const uid = getUID();
  const docRef = await addDoc(collection(db, 'users', uid, 'courses'), {
    courseName,
    uploadedAt: Timestamp.now(),
    score: analysisData.score || 0,
    totalTopics: analysisData.totalTopics || 0,
    gapCount: analysisData.gapCount || 0,
    coveredCount: analysisData.coveredCount || 0,
    overallFeedback: analysisData.overallFeedback || '',
    topicResults: analysisData.topicResults || [],
    weakTopics: analysisData.weakTopics || [],
    coveredTopics: analysisData.coveredTopics || [],
    missingConcepts: analysisData.missingConcepts || [],
    recommendations: analysisData.recommendations || [],
    revisionPlan: analysisData.revisionPlan || [],
  });
  return docRef.id;
};

/**
 * Fetch all courses for the current user, ordered by upload date desc.
 * @returns {Promise<Array>} list of { id, courseName, uploadedAt, score, ... }
 */
export const fetchUserCourses = async () => {
  const uid = getUID();
  const q = query(collection(db, 'users', uid, 'courses'), orderBy('uploadedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

/**
 * Fetch a single course by its Firestore ID.
 * @param {string} courseId
 */
export const fetchCourseById = async (courseId) => {
  const uid = getUID();
  const snap = await getDoc(doc(db, 'users', uid, 'courses', courseId));
  if (!snap.exists()) throw new Error('Course not found');
  return { id: snap.id, ...snap.data() };
};

/**
 * Delete a course.
 */
export const deleteCourse = async (courseId) => {
  const uid = getUID();
  await deleteDoc(doc(db, 'users', uid, 'courses', courseId));
};

// ── Legacy helpers kept for compatibility ──────────────

export const saveTestAttempt = async (studentName, studentEmail, testData) => {
  const uid = auth.currentUser?.uid || 'anonymous';
  const docRef = await addDoc(collection(db, 'testAttempts'), {
    uid, studentName, studentEmail, uploadedAt: Timestamp.now(), ...testData,
  });
  return docRef.id;
};

export const fetchTestAttemptById = async (attemptId) => {
  const snap = await getDoc(doc(db, 'testAttempts', attemptId));
  if (!snap.exists()) throw new Error('Not found');
  return { id: snap.id, ...snap.data() };
};

export { app };
export default { saveCourseAnalysis, fetchUserCourses, fetchCourseById, deleteCourse };
