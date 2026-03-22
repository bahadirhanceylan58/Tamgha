import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCqoG5OVziri1FDKPxX5Yb1iB_cWBO7Ijw",
  authDomain: "tamgha-e35a5.firebaseapp.com",
  projectId: "tamgha-e35a5",
  storageBucket: "tamgha-e35a5.firebasestorage.app",
  messagingSenderId: "1032012662313",
  appId: "1:1032012662313:web:de3bd4b840356f61973e38",
  measurementId: "G-0XMG5LNXZQ"
};

// Uygulamayı başlat
const app = initializeApp(firebaseConfig);

// Veritabanı bağlantısını dışa aktar
export const db = getFirestore(app);
