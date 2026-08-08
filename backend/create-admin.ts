import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import dotenv from 'dotenv';

dotenv.config();

initializeApp({
  credential: applicationDefault(),
});

const auth = getAuth();
const db = getFirestore();

async function createAdmin() {
  const email = 'admin@smartstock.com';
  const password = 'AdminPassword123!';
  
  try {
    let userRecord;
    try {
      userRecord = await auth.getUserByEmail(email);
      console.log('User already exists, updating password and role...');
      await auth.updateUser(userRecord.uid, { password });
    } catch (e: any) {
      if (e.code === 'auth/user-not-found') {
        userRecord = await auth.createUser({
          email,
          password,
          displayName: 'System Admin',
        });
        console.log('Successfully created new user in Firebase Auth.');
      } else {
        throw e;
      }
    }

    // Now set the profile in Firestore
    await db.collection('profiles').doc(userRecord.uid).set({
      email: email,
      name: 'System Admin',
      role: 'admin',
      createdAt: new Date().toISOString()
    }, { merge: true });

    console.log('----------------------------------------');
    console.log('SUCCESS! Admin Dashboard Account Created');
    console.log('ID / Email : ' + email);
    console.log('Password   : ' + password);
    console.log('----------------------------------------');

  } catch (error) {
    console.error('Error creating admin:', error);
  }
}

createAdmin();
