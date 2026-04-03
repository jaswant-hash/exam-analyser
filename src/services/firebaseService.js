/**
 * Firebase Service
 * Handles all Firestore and Storage operations
 * Manages test attempts, revision plans, and weakness reports
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Firebase configuration (replace with your actual config)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'YOUR_API_KEY',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'YOUR_AUTH_DOMAIN',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'YOUR_PROJECT_ID',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'YOUR_STORAGE_BUCKET',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'YOUR_SENDER_ID',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'YOUR_APP_ID',
};

// Initialize Firebase
let app;
let db;
let storage;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.error('Firebase initialization error:', error);
}

/**
 * Save a test attempt to Firestore
 * @param {string} studentName - Student identifier
 * @param {string} studentEmail - Student email
 * @param {Object} testData - Test data object
 * @returns {Promise<string>} Document ID
 */
export const saveTestAttempt = async (
  studentName,
  studentEmail,
  testData
) => {
  try {
    const testDocument = {
      studentName,
      studentEmail,
      uploadedAt: Timestamp.now(),
      fileType: testData.fileType || 'csv',
      rawData: testData.rawData || {},
      scores: testData.scores || {},
      weakConcepts: testData.weakConcepts || [],
      missingConcepts: testData.missingConcepts || [],
      recommendations: testData.recommendations || [],
      revisionPlan: testData.revisionPlan || [],
      overallScore: testData.overallScore || 0,
      totalMarksObtained: testData.totalMarksObtained || 0,
      totalMarksAvailable: testData.totalMarksAvailable || 0,
      confidenceScore: testData.confidenceScore || 0,
      status: 'completed',
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(db, 'testAttempts'),
      testDocument
    );

    return docRef.id;
  } catch (error) {
    console.error('Error saving test attempt:', error);
    throw new Error(`Failed to save test attempt: ${error.message}`);
  }
};

/**
 * Fetch all previous test attempts for a student
 * @param {string} studentEmail - Student email
 * @returns {Promise<Array>} Array of test attempts
 */
export const fetchPreviousAttempts = async (studentEmail) => {
  try {
    const q = query(
      collection(db, 'testAttempts'),
      where('studentEmail', '==', studentEmail),
      orderBy('uploadedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const attempts = [];

    querySnapshot.forEach((doc) => {
      attempts.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return attempts;
  } catch (error) {
    console.error('Error fetching previous attempts:', error);
    throw new Error(`Failed to fetch previous attempts: ${error.message}`);
  }
};

/**
 * Fetch a specific test attempt by ID
 * @param {string} attemptId - Document ID
 * @returns {Promise<Object>} Test attempt data
 */
export const fetchTestAttemptById = async (attemptId) => {
  try {
    if (!attemptId) throw new Error('Attempt ID is required');
    const docRef = doc(db, 'testAttempts', attemptId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      throw new Error('Test attempt not found');
    }
  } catch (error) {
    console.error('Error fetching test attempt:', error);
    throw new Error(`Failed to fetch test attempt: ${error.message}`);
  }
};

/**
 * Save revision plan to Firestore
 * @param {string} studentEmail - Student email
 * @param {string} testAttemptId - Reference to test attempt
 * @param {Array} revisionPlan - Revision plan array
 * @returns {Promise<string>} Document ID
 */
export const saveRevisionPlan = async (
  studentEmail,
  testAttemptId,
  revisionPlan
) => {
  try {
    const planDocument = {
      studentEmail,
      testAttemptId,
      createdAt: Timestamp.now(),
      plan: revisionPlan,
      status: 'active',
      completedDays: [],
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(db, 'revisionPlans'),
      planDocument
    );

    return docRef.id;
  } catch (error) {
    console.error('Error saving revision plan:', error);
    throw new Error(`Failed to save revision plan: ${error.message}`);
  }
};

/**
 * Save weakness report to Firestore
 * @param {string} studentEmail - Student email
 * @param {string} testAttemptId - Reference to test attempt
 * @param {Object} weaknessReport - Weakness report object
 * @returns {Promise<string>} Document ID
 */
export const saveWeaknessReport = async (
  studentEmail,
  testAttemptId,
  weaknessReport
) => {
  try {
    const reportDocument = {
      studentEmail,
      testAttemptId,
      createdAt: Timestamp.now(),
      weakTopics: weaknessReport.weakTopics || [],
      missingConcepts: weaknessReport.missingConcepts || [],
      confidenceScore: weaknessReport.confidenceScore || 0,
      detailedAnalysis: weaknessReport.detailedAnalysis || {},
      recommendations: weaknessReport.recommendations || [],
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(db, 'weaknessReports'),
      reportDocument
    );

    return docRef.id;
  } catch (error) {
    console.error('Error saving weakness report:', error);
    throw new Error(`Failed to save weakness report: ${error.message}`);
  }
};

/**
 * Fetch weakness reports for a student
 * @param {string} studentEmail - Student email
 * @returns {Promise<Array>} Array of weakness reports
 */
export const fetchWeaknessReports = async (studentEmail) => {
  try {
    const q = query(
      collection(db, 'weaknessReports'),
      where('studentEmail', '==', studentEmail),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const reports = [];

    querySnapshot.forEach((doc) => {
      reports.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return reports;
  } catch (error) {
    console.error('Error fetching weakness reports:', error);
    throw new Error(`Failed to fetch weakness reports: ${error.message}`);
  }
};

/**
 * Upload file to Firebase Storage
 * @param {File} file - File to upload
 * @param {string} studentEmail - Student email
 * @param {string} fileType - Type of file (csv, image, pdf)
 * @returns {Promise<string>} Download URL of uploaded file
 */
export const uploadFileToStorage = async (file, studentEmail, fileType) => {
  try {
    const timestamp = Date.now();
    const fileName = `${studentEmail}/${fileType}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (error) {
    console.error('Error uploading file to storage:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

/**
 * Get Firestore instance
 * @returns {Object} Firestore instance
 */
export const getDB = () => db;

/**
 * Get Storage instance
 * @returns {Object} Storage instance
 */
export const getStorageInstance = () => storage;

export default {
  saveTestAttempt,
  fetchPreviousAttempts,
  fetchTestAttemptById,
  saveRevisionPlan,
  saveWeaknessReport,
  fetchWeaknessReports,
  uploadFileToStorage,
  getDB,
  getStorageInstance,
};
