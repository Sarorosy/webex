import React, { useEffect, useState } from "react";
import axios from "axios";
import { getSocket, connectSocket } from "../../utils/Socket";
import { useAuth } from "../../utils/idb";

const ReadPersons = ({ messageId }) => {
  const [readUsers, setReadUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const fetchReadUsers = async (load = true) => {
    try {
      setLoading(load);
      const res = await axios.get(
        `http://localhost:5000/api/chats/read-persons/${messageId}`
      );
      if (res.data.status) {
        setReadUsers(res.data.data);
      }
    } catch (error) {
      console.error("Error fetching read users:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!messageId) return;

    fetchReadUsers(true);
  }, [messageId]);

  useEffect(() => {
    if (!messageId) return;

    connectSocket();
    const socket = getSocket();

    const handleReadMessage = (payload) => {
      // If the read message affects this messageId, refetch
      if (payload?.message_ids?.includes(messageId)) {
        fetchReadUsers(false);
      }
    };

    socket.on("read_message", handleReadMessage);

    return () => {
      socket.off("read_message", handleReadMessage);
    };
  }, [messageId]);

  if (loading) return <p className="text-gray-500 text-sm text-center">...</p>;
  const otherUsers = readUsers.filter((u) => u.id !== user?.id);

  if (otherUsers.length === 0) return null;

  return (
    <div className="flex justify-center items-center mt-2 gap-1">
      <p className="text-gray-500 f-11">Seen by</p>
      <div className="flex justify-center items-center gap-2">
        {readUsers
          .filter((u) => u.id != user?.id)
          .map((user) => (
            <div
              key={user.id}
              className="w-6 h-6 rounded-full overflow-hidden"
              data-tooltip-id="my-tooltip"
              data-tooltip-content={user.name}
            >
              {user.profile_pic ? (
                <img
                  src={`http://localhost:5000${user.profile_pic}`}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-blue-500 text-white flex items-center justify-center text-sm  uppercase">
                  {user.name.charAt(0)}
                </div>
              )}
            </div>
          ))}
      </div>
    </div>
  );
};

export default ReadPersons;
