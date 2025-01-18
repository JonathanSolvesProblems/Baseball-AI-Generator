"use client";
import React, { useEffect, useState } from "react";
import { auth, getLoggedInUserDetails, saveVideo } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import AuthModal from "../auth/AuthModal";
import { analyzeVideoWithAudio } from "../utils/geminiCalls";
import { useUser } from "../context/UserContext";

interface VideoPlayerProps {
  videoSrc: string;
  videoName: string;
  width?: string;
  height?: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
}

// TODO: Make button unsavable if already saved.
const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoSrc,
  videoName,
  width = "100%",
  height = "auto",
  controls = true,
  autoplay = false,
  loop = false,
}) => {
  const {
    userId,
    followedPlayers,
    playerDetails,
    loading,
    savedVideos,
    userDetails,
  } = useUser();
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [videoSummary, setVideoSummary] = useState<any>();

  const getVideoSummary = async () => {
    // retrieve latest language set
    if (!userId) return;

    const userDetails = await getLoggedInUserDetails(userId);

    if (!userDetails) return;

    setVideoSummary("Generating...");

    const videoSummary = await analyzeVideoWithAudio(
      videoSrc,
      videoName,
      userDetails.language
    );
    setVideoSummary(videoSummary);
  };

  // Function to check if the URL is a YouTube URL
  const isYouTube =
    videoSrc.includes("youtube.com") || videoSrc.includes("youtu.be");

  const isMLB = videoSrc.includes("mlb.com/video");

  // Extract YouTube video ID from URL
  const extractYouTubeVideoId = (url: string) => {
    const match = url.match(
      /(?:youtube\.com\/(?:[^\/]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
    );
    return match ? match[1] : null;
  };

  const getMLBVideoEmbedUrl = (url: string) => {
    const playIdMatch = url.match(/playid="([^"]+)"/);
    if (playIdMatch && playIdMatch[1]) {
      return `https://www.mlb.com/video/${playIdMatch[1]}`;
    }
    return "";
  };

  const videoId = isYouTube ? extractYouTubeVideoId(videoSrc) : null;
  const mlbEmbedUrl = isMLB ? getMLBVideoEmbedUrl(videoSrc) : "";

  const handleSaveVideo = async () => {
    if (userId) {
      await saveVideo(
        userId,
        videoSrc,
        videoName,
        videoSummary,
        userDetails.language
      );
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <div className="flex justify-center items-center">
        {isYouTube && videoId ? (
          // YouTube Embed
          <iframe
            className="rounded-lg"
            width={width}
            height={height}
            src={`https://www.youtube.com/embed/${videoId}?autoplay=${
              autoplay ? 1 : 0
            }&loop=${loop ? 1 : 0}&controls=${controls ? 1 : 0}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : isMLB && mlbEmbedUrl ? (
          // MLB Video Embed
          <iframe
            className="rounded-lg"
            width={width}
            height={height}
            src={`${mlbEmbedUrl}?autoplay=${autoplay ? 1 : 0}&loop=${
              loop ? 1 : 0
            }&controls=${controls ? 1 : 0}`}
            title="MLB video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        ) : (
          // Fallback for non-YouTube videos
          <video
            className="rounded-lg"
            width={width}
            height={height}
            controls={controls}
            autoPlay={autoplay}
            loop={loop}
          >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}

        {showAuthModal && <AuthModal setIsModalOpen={setShowAuthModal} />}
      </div>
      {!videoSummary ? (
        <div>
          <button className="mt-4 btn btn-primary" onClick={getVideoSummary}>
            Get Summary
          </button>
        </div>
      ) : (
        <p>{videoSummary}</p>
      )}
      <div>
        <button className="mt-4 btn btn-primary" onClick={handleSaveVideo}>
          Save Video
        </button>
      </div>
    </>
  );
};

export default VideoPlayer;

/*

// Example of displaying saved videos
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

const SavedVideos = () => {
  const [savedVideos, setSavedVideos] = useState<string[]>([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const fetchSavedVideos = async () => {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setSavedVideos(userDoc.data()?.savedVideos || []);
        }
      };

      fetchSavedVideos();
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold mb-8">Saved Videos</h1>
      <div className="flex flex-wrap">
        {savedVideos.map((videoUrl, index) => (
          <div key={index} className="m-4">
            <VideoPlayer videoSrc={videoUrl} width="400" height="225" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedVideos;

*/
