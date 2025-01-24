import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, deleteDoc, updateDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, deleteUser } from 'firebase/auth';
import { ISavedVideos } from './app/utils/schemas';

// Firebase configuration (get this from the Firebase console)
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    authDomain: "baseball--hackathon.firebaseapp.com",
    projectId: "baseball--hackathon",
    storageBucket: "baseball--hackathon.firebasestorage.app",
    messagingSenderId: "797564563598",
    appId: "1:797564563598:web:4e51b2ba5a001af282d9df",
    measurementId: "G-4DD7MXP197"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

const setUserInfo = async (user: any, firstName: string, lastName: string, language: string) => {

    try {
        const userDocRef = doc(db, "users", user.uid);

        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) return;

         // Default notification preference
        const notificationPreference = {
            frequency: "daily", // Default to daily,
            subscribed: true,
            time: "05:00", // Default time
            timeZone: "America/New_York", // Default time zone
        };

        await setDoc(doc(db, "users", user.uid), {
            firstName,
            lastName,
            language,
            notificationPreference
        })

    } catch (error) {
        console.error(`Error setting user info: ${error}`);
    }
}

const getLoggedInUserDetails = async (user: any) => {

    try {
        const userDoc = doc(db, 'users', user)
        const userData = await getDoc(userDoc)
        if (userData.exists()) {
            return { firstName: userData.data()?.firstName, lastName: userData.data()?.lastName, language: userData.data()?.language }
        }

    } catch (error) {
        console.error("Error fetching followed players: ", error);
    }
}

const updateUserDetails = async (userId: string, firstName?: string, lastName?: string, language?: string) => {
    try {
      const userDoc = doc(db, 'users', userId);
      
      const updates: any = {};
      
      if (firstName) updates.firstName = firstName;
      if (lastName) updates.lastName = lastName;
      if (language) updates.language = language;
  
      if (Object.keys(updates).length > 0) {
        // Update the document if there are changes
        await updateDoc(userDoc, updates);
        // console.log('User details updated successfully!');
      } else {
       // console.log('No changes provided to update.');
      }
    } catch (error) {
      console.error('Error updating user details: ', error);
    }
  };

const saveVideo = async (userId: string, videoURL: string, videoName: string, videoSummary?: string, preferredLanguage?: string) => {

    if (!videoSummary) videoSummary = '';
    if (!preferredLanguage) preferredLanguage = 'English';

    try {
        await addDoc(collection(db, 'users', userId, 'savedVideos'), {
            videoName: videoName,
            videoURL: videoURL,
            savedDate: new Date(),
            videoSummary: {
                [preferredLanguage]: videoSummary
            }
        })

        //console.log(`Video ${videoName} successfully saved by user ID ${userId}`);
    } catch (error) {
        console.error(`Error saving video ${error}`);
    }
}

const saveArticle = async (userId: string, article: string, articleTitle: string) => {
    if (!userId || !article) return;

    const articleSummary = article.substring(0, 200) + "..."; // Preview of the article for summary

    try {
      await addDoc(collection(db, 'users', userId, 'savedArticles'), {
        articleTitle,
        articleContent: article,
        savedDate: new Date(),
        articleSummary,
      });

      //console.log(`Article successfully saved by user ID ${userId}`);
    } catch (error) {
      console.error(`Error saving article: ${error}`);
    }
  };

const getSavedVideos = async (userId: string, preferredLanguage: string) => {

    if (!userId) return;

    try {
        const q = query(collection(db, 'users', userId, 'savedVideos'));
        const querySnapshot = await getDocs(q);

        const savedVideos: ISavedVideos[] = [];
        for (const docSnapshot of querySnapshot.docs) {
            const data = docSnapshot.data();
            const id = docSnapshot.id;
            const savedDate = data.savedDate;
            const videoName = data.videoName;
            const videoUrl = data.videoURL;
            const videoSummary = data.videoSummary[preferredLanguage];
            
        //   if (!videoSummary || !videoSummary[preferredLanguage]) {
        //         const generatedSummary = await analyzeVideoWithAudio(videoUrl, preferredLanguage);
        //         videoSummary = {
        //             ...videoSummary,
        //             [preferredLanguage]: generatedSummary
        //         };

        //         await updateDoc(docSnapshot.ref, { videoSummary });

        //     }
          

            savedVideos.push( {id: id, savedDate: savedDate, videoName: videoName, videoUrl: videoUrl, videoSummary: videoSummary } );
        };

        return savedVideos;


    } catch (error) {
        console.error(`Error fetching saved videos for userId ${userId}`);
    }
}

interface ISavedChart {
    id: string;
    savedDate: any; // Firestore Timestamp
    chartType: string;
    chartData: any;
    chartOptions: any;
  }

const getSavedCharts = async (userId: string): Promise<ISavedChart[]> => {
    if (!userId) return [];

    try {
        const q = query(collection(db, "users", userId, "savedCharts"));
        const querySnapshot = await getDocs(q);

        const savedCharts: ISavedChart[] = [];
        for (const docSnapshot  of querySnapshot.docs) {
            const data = docSnapshot.data();
            const id = docSnapshot.id;

            savedCharts.push({
                id,
                savedDate: data.savedDate,
                chartType: data.chartType,
                chartData: data.chartData,
                chartOptions: data.chartOptions,
            });
        }

        return savedCharts;
    } catch (error) {
        console.error(`Error fetching saved charts for userId ${userId}:`, error);
        return [];
    }
};

/*
D:\Hackathons\Google…hon\firebase.ts:188 
 Error updating video: FirebaseError: [code=invalid-argument]: Function updateDoc() called with invalid data. Unsupported field value: undefined (found in field videoSummary.Japanese in document users/iHdaHkzJ0ccgNerMV5c5altHdht2/savedVideos/TtEakvjMI6lyMTpsuaWv)
*/
const updateVideo = async (
  userId: string,
  videoId: string, 
  updates: {
    videoName?: string;
    videoURL?: string;
    videoSummary?: { [language: string]: string };
  }
) => {
  try {
    // Reference to the specific video document
    const videoDocRef = doc(db, 'users', userId, 'savedVideos', videoId);
    
    // Fetch the current document to get the existing videoSummary
    const videoDoc = await getDoc(videoDocRef);
    if (!videoDoc.exists()) {
    //  console.log('No such video!');
      return;
    }

    // Get the current video data (including videoSummary)
    const currentData = videoDoc.data();
    const currentVideoSummary = currentData?.videoSummary || {};

    // Merge the current videoSummary with the new updates
    const mergedVideoSummary = updates.videoSummary
      ? { ...currentVideoSummary, ...updates.videoSummary }
      : currentVideoSummary;

    // Update the document with the provided fields
    await updateDoc(videoDocRef, {
      ...(updates.videoName && { videoName: updates.videoName }),
      ...(updates.videoURL && { videoURL: updates.videoURL }),
      ...(updates.videoSummary && { videoSummary: mergedVideoSummary }), // Use merged videoSummary
    });

   // console.log(`Video ${videoId} successfully updated for user ID ${userId}`);
  } catch (error) {
    console.error(`Error updating video: ${error}`);
  }
};

const followPlayer = async (userId: string, playerId: string) => {

    try {
        await addDoc(collection(db, 'users', userId, 'followedPlayers'), {
            playerId: playerId,
            followedAt: new Date(),
        });

        //console.log(`User ${userId} followed player ${playerId}`);
    } catch (error) {
        console.error(`Error following player: ${error}`);
    }
}

const followTeam = async (userId: string, teamId: string) => {

    try {
        await addDoc(collection(db, 'users', userId, 'followedTeams'), {
            teamId: teamId,
            followedAt: new Date(),
        });

        //console.log(`User ${userId} followed team ${teamId}`);
    } catch (error) {
        console.error(`Error following team: ${error}`);
    }
}

const unfollowPlayer = async (userId: string, playerId: string) => {
    try {
        const q = query(
            collection(db, 'users', userId, 'followedPlayers'),
            where('playerId', '==', playerId)
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnapshot) => {
            deleteDoc(doc(db, 'users', userId, 'followedPlayers', docSnapshot.id));
        });

        //console.log(`User ${userId} unfollowed player ${playerId}`);
    } catch (error) {
        console.error("Error unfollowing player: ", error);
    }
}


const unfollowTeam = async (userId: string, teamId: string) => {
    try {
        const q = query(
            collection(db, 'users', userId, 'followedTeams'),
            where('teamId', '==', teamId)
        );

        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnapshot) => {
            deleteDoc(doc(db, 'users', userId, 'followedTeams', docSnapshot.id));
        });

        //console.log(`User ${userId} unfollowed team ${teamId}`);
    } catch (error) {
        console.error("Error unfollowing team: ", error);
    }
}

const getFollowedPlayers = async (userId: string) => {

    try {
        const q = query(collection(db, 'users', userId, 'followedPlayers'));
        const querySnapshot = await getDocs(q);

        const followedPlayers: string[] = [];
        querySnapshot.forEach((docSnapshot) => {
            followedPlayers.push(docSnapshot.data().playerId);
        });

       // console.log(`Followed players for user ${userId}:`, followedPlayers);
        return followedPlayers;
    } catch (error) {
        console.error("Error fetching followed players: ", error);
    }

    // e these IDs to fetch more details (like player names, stats, etc.) from a different collection if needed.
}

const getFollowedTeams = async (userId: string) => {

    try {
        const q = query(collection(db, 'users', userId, 'followedTeams'));
        const querySnapshot = await getDocs(q);

        const followedTeams: string[] = [];
        querySnapshot.forEach((docSnapshot) => {
            followedTeams.push(docSnapshot.data().teamId);
        });

       // console.log(`Followed teams for user ${userId}:`, followedTeams);
        return followedTeams;
    } catch (error) {
        console.error("Error fetching followed teams: ", error);
    }
}

const getRandomFollowedPlayer = async (userId: string) => {
    try {
        const q = query(collection(db, 'users', userId, 'followedPlayers'));
        const querySnapshot = await getDocs(q);

        const followedPlayers: string[] = [];
        querySnapshot.forEach((docSnapshot) => {
            followedPlayers.push(docSnapshot.data().playerId);
        });

        if (followedPlayers.length > 0) {
            const randomIndex = Math.floor(Math.random() * followedPlayers.length);
            const randomFollowedPlayer = followedPlayers[randomIndex];
      //      console.log(`Random followed player for user ${userId}:`, randomFollowedPlayer);
            return randomFollowedPlayer;
        } else {
        //    console.log(`No followed players found for user ${userId}`);
            return null;
        }
    } catch (error) {
        console.error("Error fetching followed players: ", error);
    }
}

const deleteUserAccount = async (userId: string) => {
    const auth = getAuth();

    try {
        await deleteUserDataFromFirestore(userId);

        const user = auth.currentUser;
        if (user) {
            await deleteUser(user);
      //      console.log("User account deleted successfully");

            await auth.signOut();
    //        console.log("User signed out after delete");
        }
    } catch (error) {
        console.error(`Error deleting account: ${error}`);
    }
}

const deleteUserDataFromFirestore = async (userId: string) => {
    try {
        const userDocRef = doc(db, "users", userId);
        await deleteDoc(userDocRef);
        console.log("User data deleted from firestore");
    } catch (error) {
        console.error("Error deleting user data from firestore: " + error);
    }
}

const saveChart = async (userId: string, graphDetails: any) => {
    if (!graphDetails) {
        return { error: "No graph details to save." };
    }

    try {
        await addDoc(collection(db, 'users', userId, 'savedCharts'), {
            chartType: graphDetails.chartType,
            chartData: graphDetails.chartData,
            chartOptions: graphDetails.chartOptions,
            savedDate: new Date(),
          });

        return { success:"Graph details successfully saved." };
    } catch (e) {
        return { error: `Error saving chart: ${e}` }
    }
}

// allow comments across articles and to share it with other users?
const getSavedArticles = async (userId: string) => {
    if (!userId) return [];

    try {
        const q = query(collection(db, "users", userId, "savedArticles"));
        const querySnapshot = await getDocs(q);

        const savedArticles = [];
        for (const docSnapshot of querySnapshot.docs) {
            const data = docSnapshot.data();
            savedArticles.push({
                id: docSnapshot.id,
                savedDate: data.savedDate,
                articleTitle: data.articleTitle,
                articleContent: data.articleContent,
                articleSummary: data.articleSummary,
            });
        }

        return savedArticles;
    } catch (error) {
        console.error(`Error fetching saved articles for userId ${userId}`, error);
        return [];
    }
};

const deleteChartById = async (userId: string, chartId: string) => {
    const chartRef = doc(db, "users", userId, "savedCharts", chartId);
    await deleteDoc(chartRef);
  };



  const updateChartById = async (
    userId: string,
    chartId: string,
    updatedData: any
  ): Promise<{ success?: string; error?: string }> => {
    try {
      const chartRef = doc(collection(db, "users", userId, "savedCharts"), chartId);
      await updateDoc(chartRef, updatedData);
      return { success: "Chart updated successfully." };
    } catch (e: any) {
      return { error: `Error updating chart: ${e.message}` };
    }
  };

// TODO: Give timezone option?
const updateUserNotificationPreference = async (
  userId: string,
  frequency: "daily" | "weekly" | "monthly" = "daily",
  dayOfWeek?: string, // e.g., "Monday"
  dayOfMonth?: number, // e.g., 1
  subscribed: boolean = true
) => {
  try {
    const userDocRef = doc(db, "users", userId);

    const notificationPreference: any = {
      frequency,
      subscribed,
      time: "05:00", // Default time
      timeZone: "America/New_York",
    };

    if (frequency === "weekly" && dayOfWeek) {
      notificationPreference["dayOfWeek"] = dayOfWeek;
    } else if (frequency === "monthly" && dayOfMonth) {
      notificationPreference["dayOfMonth"] = dayOfMonth;
    }

    await updateDoc(userDocRef, {
      notificationPreference,
    });

    console.log("Notification preference updated successfully!");
  } catch (error) {
    console.error("Error updating notification preference:", error);
  }
};

const getUserNotificationPreference = async (userId: string) => {
  try {
    const userDocRef = doc(db, "users", userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      return userData.notificationPreference || null;
    } else {
      console.warn("No such user found!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching notification preference:", error);
    return null;
  }
};


  


// TODO: Can generate MLB.com link for article or video for specific content piece. Perhaps when you click on a player, can do a query of related content and then ask for link to source.
// TODO: What are my favorite players? May have to add it to BigQuery too.
export { getUserNotificationPreference, updateUserNotificationPreference, updateChartById, deleteChartById, getSavedArticles, saveArticle, auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup, followPlayer, unfollowPlayer, getFollowedPlayers, getRandomFollowedPlayer, followTeam, unfollowTeam, getFollowedTeams, setUserInfo, getLoggedInUserDetails, saveVideo, getSavedVideos, updateUserDetails, deleteUserAccount, updateVideo, saveChart, getSavedCharts };
