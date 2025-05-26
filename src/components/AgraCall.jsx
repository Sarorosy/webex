import React, { useEffect, useRef, useState } from 'react';
import AgoraRTC from 'agora-rtc-sdk-ng';

const APP_ID = '2b2b05bb475846e29149a9040dc3542e';
const TOKEN = '007eJxTYBC83WY361/KbZ8Yjgr+XbJGPBmaMzZOXbcgsJllan/lky8KDEZJRkkGpklJJuamFiZmqUaWhiaWiZYGJgYpycamJkapSTYmGQ2BjAxVqleZGBkgEMTnYShJLS7RTc5IzMtLzWFgAADMwiBx'; // Or null if App Certificate is disabled
const CHANNEL = 'test-channel';

const AgoraCall = () => {
  const [client] = useState(() => AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' }));
  const [localAudioTrack, setLocalAudioTrack] = useState(null);

  useEffect(() => {
    let isUnmounted = false;

    async function startCall() {
      try {
        await client.join(APP_ID, CHANNEL, TOKEN, null);

        const microphoneTrack = await AgoraRTC.createMicrophoneAudioTrack();
        setLocalAudioTrack(microphoneTrack);

        await client.publish([microphoneTrack]);
        console.log('Published local audio track');

        client.on('user-published', async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === 'audio') {
            user.audioTrack.play();
            console.log(`Playing remote audio track of user ${user.uid}`);
          }
        });

        client.on('user-unpublished', (user) => {
          console.log(`User ${user.uid} unpublished`);
        });
      } catch (error) {
        console.error('Agora error:', error);
      }
    }

    startCall();

    return () => {
      isUnmounted = true;
      if (localAudioTrack) localAudioTrack.close();
      client.leave();
    };
  }, []);

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h2 className="font-semibold text-lg mb-2">Agora Audio Call</h2>
      <p>Microphone is active. Keep this page open to stay connected.</p>
    </div>
  );
};

export default AgoraCall;
