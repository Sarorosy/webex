import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const APP_ID = '4ddecc7d3b3143a3bb30fd714b230dc9';

const AgoraCall = ({callInfo}) => {
  const [client] = useState(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));
  const [localAudioTrack, setLocalAudioTrack] = useState(null);
  const [joined, setJoined] = useState(false);

  const startCall = async () => {
    try {
      await client.join(APP_ID, callInfo.channelName, callInfo.token, callInfo.uid);
      const micTrack = await AgoraRTC.createMicrophoneAudioTrack();
      await client.publish([micTrack]);
      setLocalAudioTrack(micTrack);
      setJoined(true);

      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'audio') {
          user.audioTrack.play();
        }
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
      startCall(e.detail);
    };

    window.addEventListener('start-agora-call', listener);
    return () => {
      window.removeEventListener('start-agora-call', listener);
      if (localAudioTrack) localAudioTrack.close();
      client.leave();
    };
  }, []);

  if (!joined) return null;

  return (
    <div className="p-4 bg-blue-100 rounded mt-4">
      <h2 className="font-bold">Audio Call Active</h2>
      <p>Stay on this screen to remain in call.</p>
    </div>
  );
};

export default AgoraCall;
