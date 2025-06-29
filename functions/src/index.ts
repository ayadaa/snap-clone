/**
 * @fileoverview Firebase Cloud Functions entry point for Snap Factor RAG project.
 * 
 * This file exports all Cloud Functions that the frontend application will 
 * interact with for Snap Factor's math learning features.
 */

import * as admin from "firebase-admin";

// Initialize the Firebase Admin SDK.
// This must be done only once, and it provides the functions with the
// necessary permissions to interact with other Firebase services like
// Firestore and Storage.
admin.initializeApp();

// Export all RAG-related Cloud Functions
export {
  getMathExplanation,
  analyzeMathSnap,
  getDefinition,
  exploreConcept,
  checkRagHealth,
  generateSmartCaption,
  generateDailyChallenge,
  submitChallengeAnswer,
  getDailyChallenge,
  generateVisualRepresentation,
} from "./functions/mathHelp.functions";

// Note: Additional functions can be exported here as the project grows
// For example:
// export { generatePracticeProblems } from "./functions/practice.functions";
// export { createMathChallenge } from "./functions/challenges.functions";