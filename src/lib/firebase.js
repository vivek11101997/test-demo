import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCHiK1N5LjM-scFCxyIjFg0Bo6UpG0Mw2w",
  databaseURL: "https://vivek11101997-nam-jap-2025-default-rtdb.firebaseio.com/",
  authDomain: "vivek11101997-nam-jap-2025.firebaseapp.com",
  projectId: "vivek11101997-nam-jap-2025",
  storageBucket: "vivek11101997-nam-jap-2025.firebasestorage.app",
  messagingSenderId: "816776710959",
  appId: "1:816776710959:web:cf925925fe84a36b56afda",
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database };
