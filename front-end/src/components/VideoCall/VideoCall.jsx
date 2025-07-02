import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import "./VideoCall.scss";
import Chat from "../chat/Chat";
import Whiteboard from "../Whiteboard/Whiteboard";

const SOCKET_SERVER_URL = "https://localhost:3001";

function VideoCall() {
  const { roomId } = useParams();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pcRef = useRef(null);
  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

  const [started, setStarted] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [sharingScreen, setSharingScreen] = useState(false);
  const [users, setUsers] = useState([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [whiteboardOpen, setWhiteboardOpen] = useState(false);
  const [messages, setMessages] = useState([]);

  const [username, setUsername] = useState(localStorage.getItem("username") || "");

  // --- Message delete handler
  const handleDeleteMessage = (index) => {
    setMessages((prev) => prev.filter((_, i) => i !== index));
  };

  // --- Create peer connection
  function createPeerConnection() {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", { candidate: event.candidate, roomId });
      }
    };

    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return pc;
  }

  // --- Handlers for SDP and ICE
  async function handleOffer({ sdp }) {
    pcRef.current = createPeerConnection();

    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = localStream;
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
    localStream.getTracks().forEach((track) => pcRef.current.addTrack(track, localStream));

    await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
    const answer = await pcRef.current.createAnswer();
    await pcRef.current.setLocalDescription(answer);
    socketRef.current.emit("answer", { sdp: answer, roomId });
    setStarted(true);
  }

  async function handleAnswer({ sdp }) {
    await pcRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
  }

  function handleNewICECandidateMsg({ candidate }) {
    const iceCandidate = new RTCIceCandidate(candidate);
    pcRef.current.addIceCandidate(iceCandidate);
  }

  // --- Start Call
  const startCall = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = localStream;
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;

    pcRef.current = createPeerConnection();
    localStream.getTracks().forEach((track) => pcRef.current.addTrack(track, localStream));

    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
    socketRef.current.emit("offer", { sdp: offer, roomId });
    setStarted(true);
  };

  // --- End Call
  const endCallCleanup = () => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }
  };

  const endCall = () => {
    endCallCleanup();
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setStarted(false);
    setSharingScreen(false);
    setAudioEnabled(true);
    setVideoEnabled(true);
    socketRef.current.emit("leave-room", roomId, username);
    setUsers([{ username, socketId: socketRef.current.id }]);
    setMessages([]);
  };

  // --- Toggle Audio/Video
  const toggleAudio = () => {
    if (localStreamRef.current) {
      const enabled = localStreamRef.current.getAudioTracks()[0].enabled;
      localStreamRef.current.getAudioTracks().forEach((track) => (track.enabled = !enabled));
      setAudioEnabled(!enabled);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const enabled = localStreamRef.current.getVideoTracks()[0].enabled;
      localStreamRef.current.getVideoTracks().forEach((track) => (track.enabled = !enabled));
      setVideoEnabled(!enabled);
    }
  };

  // --- Screen Share
  const toggleScreenShare = async () => {
    if (!sharingScreen) {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = screenStream;

        const screenTrack = screenStream.getVideoTracks()[0];
        const sender = pcRef.current.getSenders().find((s) => s.track.kind === "video");
        if (sender) await sender.replaceTrack(screenTrack);

        if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;
        screenTrack.onended = stopScreenShare;

        setSharingScreen(true);
      } catch (err) {
        console.error("Error sharing screen:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const stopScreenShare = async () => {
    if (!sharingScreen) return;
    const localStream = localStreamRef.current;
    if (!localStream) return;

    const videoTrack = localStream.getVideoTracks()[0];
    const sender = pcRef.current.getSenders().find((s) => s.track.kind === "video");
    if (sender) await sender.replaceTrack(videoTrack);

    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
    }

    setSharingScreen(false);
  };

  // --- Chat send
  const handleSendMessage = (text) => {
    if (!text.trim()) return;
    const message = { username, text };
    socketRef.current.emit("send-message", message);
    setMessages((prev) => [...prev, message]);
  };

  // --- User list render
  const renderUsers = () => (
    users.length > 0 && (
      <div className="users-list">
        <h4>Users in room:</h4>
        {users.map((user) => (
          <div
            key={user.socketId}
            className={user.username === username ? "user-self" : "user"}
          >
            {user.username}
          </div>
        ))}
      </div>
    )
  );

  // --- useEffect
  useEffect(() => {
    socketRef.current = io(SOCKET_SERVER_URL);
    socketRef.current.emit("join-room", { roomId, username });

    socketRef.current.on("room-users", setUsers);
    socketRef.current.on("offer", handleOffer);
    socketRef.current.on("answer", handleAnswer);
    socketRef.current.on("ice-candidate", handleNewICECandidateMsg);
    socketRef.current.on("user-left", ({ socketId }) =>
      setUsers((prev) => prev.filter((u) => u.socketId !== socketId))
    );
    socketRef.current.on("new-message", (message) =>
      setMessages((prev) => [...prev, message])
    );

    return () => {
      endCallCleanup();
      socketRef.current.disconnect();
    };
  }, [roomId, username]);

  // --- Render
  return (
    <div className="call-container">
      <div className="video-area">
        <h2>Room</h2>

        {!started && (
          <>
            <button onClick={startCall} className="start-btn">Start Call</button>
            <p>
              Share this link:{" "}
              <a
                href={`${window.location.origin}/video/${roomId}`}
                target="_blank"
                rel="noreferrer"
              >
                {window.location.origin}/video/{roomId}
              </a>
            </p>
          </>
        )}

        {started && (
          <>
            <div className="video-wrapper">
              <video ref={localVideoRef} autoPlay muted playsInline className="video-player" />
            </div>

            <div className="controls">
              <button onClick={toggleAudio}>{audioEnabled ? "Mute Mic" : "Unmute Mic"}</button>
              <button onClick={toggleVideo}>{videoEnabled ? "Stop Camera" : "Start Camera"}</button>
              <button onClick={toggleScreenShare}>{sharingScreen ? "Stop Screen Share" : "Share Screen"}</button>
              <button onClick={endCall} className="end-btn">End Call</button>
            </div>

            <div className="extras-controls">
              <button onClick={() => setChatOpen((prev) => !prev)}>
                {chatOpen ? "Close Chat" : "Open Chat"}
              </button>
              <button onClick={() => setWhiteboardOpen((prev) => !prev)}>
                {whiteboardOpen ? "Close Whiteboard" : "Open Whiteboard"}
              </button>
            </div>

            {renderUsers()}

            {chatOpen && (
              <Chat
                messages={messages}
                onSend={handleSendMessage}
                onDelete={handleDeleteMessage}
                username={username}
              />
            )}

            {whiteboardOpen && (
              <Whiteboard socket={socketRef.current} roomId={roomId} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default VideoCall;  