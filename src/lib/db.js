
import { database } from "./firebase";
import { ref, set, push ,onValue} from "firebase/database";

export const writeMessage = async (text) => {
  const messagesRef = ref(database, 'messages');
  const newMessageRef = push(messagesRef);
  await set(newMessageRef, {
    text,
    createdAt: new Date().toISOString()
  });
};


export const subscribeToMessages = (callback) => {
  const messagesRef = ref(database, 'messages');
  const unsubscribe = onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    callback(data);
  });

  return () => unsubscribe(); // To stop listening
};