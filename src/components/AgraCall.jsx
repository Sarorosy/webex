import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { getSocket } from '../utils/Socket';
import { useAuth } from '../utils/idb';

const APP_ID = '4ddecc7d3b3143a3bb30fd714b230dc9';

const AgoraCall = ({callInfo,ringing, onLeave }) => {
  const [client] = useState(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [joined, setJoined] = useState(false);
  const {user} = useAuth();


  const hasJoinedRef = useRef(false);

const startCall = async () => {
  if (hasJoinedRef.current) return;
  hasJoinedRef.current = true;

  try {
    setJoined(true);
    await client.join(APP_ID, callInfo.channelName, callInfo.token, null);
    const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
    console.log("Mic Track Enabled:", micTrack.enabled);
    console.log('Microphone track created and enabled:', micTrack.enabled);
    await client.publish([micTrack]);
    setLocalAudioTrack(micTrack);
    console.log('Published local microphone track');
    

    client.on('user-published', async (user, mediaType) => {
      await client.subscribe(user, mediaType);
      if (mediaType == 'audio') user.audioTrack.play();
      console.log('Subscribed to user:', user);
    });

    client.on('user-unpublished', (user) => {
      console.log(`User ${user.uid} left`);
    });

  } catch (err) {
    console.error('Agora join error:', err);
  }
};


  useEffect(() => {
  const listener = (e) => {
    startCall();
  };

  window.addEventListener('start-agora-call', listener);

  return () => {
    window.removeEventListener('start-agora-call', listener);
    hasJoinedRef.current = false;
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }
    client.leave().catch(err => console.warn('Leave error:', err));
  };
}, []);


 const leaveCall = async () => {
  try {
    if (localAudioTrack) {
      localAudioTrack.stop();
      localAudioTrack.close();
    }
    await client.leave();

    const socket = getSocket();
    socket.emit("call_ended", {
      channelName: callInfo.channelName,
      userId: callInfo.uid,
    });
  } catch (err) {
    console.error("Error leaving call:", err);
  } finally {
    onLeave();
  }
};



    

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center z-50"
    >
      <button
        className="absolute top-4 right-4 p-2 rounded-full bg-red-600 hover:bg-red-700"
        onClick={leaveCall}
        title="End Call"
      >
        <X className="text-white w-5 h-5" />
      </button>
    {ringing ? (
<div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Ringing...</h1>
        <p className="text-lg text-gray-300">Audio call with channel <strong>{callInfo.channelName}</strong></p>
        <p className="mt-4 text-sm text-gray-400">Stay on this screen to remain in the call</p>
      </div>
    ) : (
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">You're on a call</h1>
        <p className="text-lg text-gray-300">Audio call with channel <strong>{callInfo.channelName}</strong></p>
        <p className="mt-4 text-sm text-gray-400">Stay on this screen to remain in the call</p>
      </div>
    )}
      
    </motion.div>
  );
};

export default AgoraCall;
