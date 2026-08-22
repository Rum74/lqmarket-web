import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import firebaseConfigData from '../firebase-applet-config.json' with { type: 'json' };

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfigData.firestoreDatabaseId || '(default)');

const COLLECTIONS_TO_CLEAR = [
  'accounts',
  'orders',
  'transactions',
  'messages',
  'users'
];

async function clearAllFirebaseData() {
  console.log('🚀 Starting Firebase Firestore Data Wipe...');
  console.log(`Target Database ID: ${firebaseConfigData.firestoreDatabaseId}`);

  let totalDeleted = 0;

  for (const colName of COLLECTIONS_TO_CLEAR) {
    try {
      console.log(`\nScanning collection: [${colName}]...`);
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);

      console.log(`Found ${snapshot.size} documents in [${colName}].`);

      if (snapshot.empty) {
        console.log(`Collection [${colName}] is already empty.`);
        continue;
      }

      for (const document of snapshot.docs) {
        await deleteDoc(doc(db, colName, document.id));
        totalDeleted++;
        console.log(`  - Deleted document: ${colName}/${document.id}`);
      }

      console.log(`✅ Cleared all documents in [${colName}] successfully.`);
    } catch (err) {
      console.error(`❌ Error clearing collection [${colName}]:`, err);
    }
  }

  console.log(`\n🎉 Completed! Total deleted documents: ${totalDeleted}`);
  process.exit(0);
}

clearAllFirebaseData().catch(err => {
  console.error('Fatal error during cleanup:', err);
  process.exit(1);
});
