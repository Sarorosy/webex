import React, { useEffect, useRef, useState } from "react";
import { getSocket, connectSocket } from "../utils/Socket";
import { useAuth } from "../utils/idb";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { X } from "lucide-react";

const ScreenSharing = () => {
  const [incomingRequest, setIncomingRequest] = useState(null);
  const [isSharing, setIsSharing] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [role, setRole] = useState(null); // 'sharer' or 'viewer'
  const videoRef = useRef(null);
  const peerRef = useRef(null);
  const sharingStartedRef = useRef(false);
  const { user } = useAuth();

  useEffect(() => {
    connectSocket(user?.id);
    const socket = getSocket();

    socket.on("incoming-screen-share", ({ from }) => {
      setIncomingRequest(from);
    });

    socket.on("screen-share-accepted", async ({ from }) => {
      if (sharingStartedRef.current) return;
      sharingStartedRef.current = true;

      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        stream.getTracks().forEach((track) => {
          track.onended = () => closeSharing(); // if browser stops it
        });

        setIsSharing(true);
        setWaiting(false);
        setRole("sharer");

        const peer = new RTCPeerConnection();
        peerRef.current = peer;

        stream.getTracks().forEach((track) => peer.addTrack(track, stream));

        peer.onicecandidate = (e) => {
          if (e.candidate) {
            socket.emit("ice-candidate", {
              candidate: e.candidate,
              to: from.socketId,
            });
          }
        };

        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        socket.emit("offer", { offer, to: from.socketId });
      } catch (err) {
        //toast.error("Failed to share screen.");
        console.error("Error getting display media", err);
      }
    });

    socket.on("offer", async ({ offer, from }) => {
      const peer = new RTCPeerConnection();
      peerRef.current = peer;
      setRole("viewer");

      peer.ontrack = (event) => {
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
        }
      };

      peer.onicecandidate = (e) => {
        if (e.candidate) {
          socket.emit("ice-candidate", {
            candidate: e.candidate,
            to: from,
          });
        }
      };

      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);
      socket.emit("answer", { answer, to: from });
    });

    socket.on("answer", async ({ answer }) => {
      if (peerRef.current) {
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      }
    });

    socket.on("ice-candidate", async ({ candidate }) => {
      try {
        if (peerRef.current) {
          await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.error("ICE candidate error", err);
      }
    });

    socket.on("stop-screen-share", () => {
      closeSharing(true); // remote stop
    });

    return () => {
      socket.off("incoming-screen-share");
      socket.off("screen-share-accepted");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
      socket.off("stop-screen-share");
    };
  }, []);

  const acceptShare = () => {
    const socket = getSocket();
    socket.emit("accept-screen-share", {
      to: incomingRequest.id,
      from: { ...user, socketId: socket.id },
    });
    setIncomingRequest(null);
  };

  const closeSharing = (remote = false) => {
    const socket = getSocket();

    if (!remote) {
      socket.emit("stop-screen-share");
      //toast.success("Screen sharing stopped");
    } else {
      //toast("The other user stopped sharing", { icon: "📴" });
    }

    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    if (peerRef.current) {
      peerRef.current.close();
      peerRef.current = null;
    }

    sharingStartedRef.current = false;
    setRole(null);
    setIsSharing(false);
    setIncomingRequest(null);
    setWaiting(false);
  };

  return (
    <div className="">
      {incomingRequest && (
        <div className="fixed top-4 right-4 bg-white shadow-lg p-4 rounded border z-[100]">
          <p className="mb-2">
            <strong>{incomingRequest.name}</strong> wants to share their screen
            with you.
          </p>
          <button
            onClick={acceptShare}
            className="bg-green-500 text-white px-4 py-1 rounded hover:bg-green-700"
          >
            Accept
          </button>
        </div>
      )}

      {role === "viewer" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center  p-4 relative z-[110]"
        >
          <video ref={videoRef} autoPlay playsInline className="" />
          {role && (
            <button
              onClick={() => closeSharing()}
              className="absolute top-2 right-2 right-0  bg-red-600 text-white px-4 py-2 rounded z-50"
            >
              <X size={14} className="text-white" />
            </button>
          )}
        </motion.div>
      )}

      {/* {role === "sharer" && (
        <div className="text-sm text-gray-600">Sharing your screen...</div>
      )} */}

      {waiting && (
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded mb-2">
          Waiting for receiver to accept screen share...
        </div>
      )}
    </div>
  );
};

export default ScreenSharing;
