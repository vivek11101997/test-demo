import { database } from "./firebase";
import { ref, set, push, onValue } from "firebase/database";

/**
 * Write a message to Firebase Realtime Database.
 * @param {string|number} text - The text or value to store.
 */
export const writeMessage = async (text) => {
  try {
    const messagesRef = ref(database, 'messages');
    const newMessageRef = push(messagesRef);
    await set(newMessageRef, {
      text,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    let errorMessage = "Failed to write message.";
    console.error("Error writing message to Firebase:", error);
     throw new Error(errorMessage); ;
  }
};

/**
 * Subscribe to messages and receive real-time updates.
 * @param {function} callback - Called with the data object when messages change.
 * @param {function} [errorCallback] - Optional error handler.
 * @returns {function} Unsubscribe function.
 */
export const subscribeToMessages = (callback, errorCallback) => {
  try {
    const messagesRef = ref(database, 'messages');
    const unsubscribe = onValue(
      messagesRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          callback(data);
        } else {
          console.warn("No messages found in Firebase.");
          callback({}); // Send empty object or handle in UI
        }
      },
      (error) => {
        console.error("Error subscribing to Firebase messages:", error);
        if (errorCallback) errorCallback(error);
      }
    );

    return () => unsubscribe();
  } catch (error) {
    console.error("Unexpected error setting up Firebase listener:", error);
    if (errorCallback) errorCallback(error);
    return () => {}; // Return dummy unsubscribe
  }
};
