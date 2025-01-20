import admin from 'firebase-admin';
// TODO: go back to env variables and may not want to expose them on client.
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: 'https://baseball--hackathon.firebaseio.com',
    });
}



export const fetchUserEmails = async (): Promise<string[]> => {
    const usersSnapshot = await db.collection('users').get();
    return usersSnapshot.docs.map((doc: any) => doc.data().email);
}

export const db = admin.firestore();