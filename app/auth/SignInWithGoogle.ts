import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, setUserInfo } from '@/firebase';

// cross origin error to investigate, i see it in firebase console too.
const signInWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
     //   console.log('Google user signed in:', user);

        const displayName = user.displayName;
        const firstName = displayName ? displayName.split(" ")[0] : "Unknown";
        const lastName = displayName ? displayName.split(" ")[1] : "Unknown";

        const language = "English";

        await setUserInfo(user, firstName, lastName, language);

        // Redirect or store user details in your app
    } catch (error) {
        console.error('Error signing in with Google:', error);
    }
};


export default signInWithGoogle;
