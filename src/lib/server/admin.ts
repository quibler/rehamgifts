// lib/server/admin.ts
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { CLIENT_EMAIL, PRIVATE_KEY, PROJECT_ID } from "$env/static/private";
import pkg from "firebase-admin";

try {
  pkg.initializeApp({
    credential: pkg.credential.cert({
      projectId: PROJECT_ID,
      clientEmail: CLIENT_EMAIL,
      privateKey: PRIVATE_KEY,
    }),
  });
} catch (err: any) {
  if (!/already exists/u.test(err.message)) {
    console.error("Firebase Admin Error: ", err.stack);
  }
}

export const adminDB = getFirestore();
export const adminAuth = getAuth();
export async function isUserAdmin(uid: string): Promise<boolean> {
  const adminDoc = await adminDB.collection('admins').doc(uid).get();
  return adminDoc.exists;
}