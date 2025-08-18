import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../utils/idb";
import { getSocket, connectSocket } from "../../utils/Socket";
import { Clock4, Paperclip, X } from "lucide-react";

const ScheduledMessages = ({ userId, userType }) => {
  const [messages, setMessages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user , theme } = useAuth();

  useEffect(() => {
    const fetchScheduledMessages = async () => {
      try {
        setMessages([]);
        const response = await axios.post(
          "https://webexback-06cc.onrender.com/api/chats/scheduled-messages",
          {
            from_user_id: user?.id,
            to_user_id: userId,
            user_type: userType,
          }
        );

        if (response.data?.status) {
          const sorted = response.data.data.sort(
            (a, b) => new Date(b.schedule_at) - new Date(a.schedule_at)
          );
          setMessages(sorted);
        } else {
          setError("Failed to fetch messages.");
        }
      } catch (err) {
        setError("An error occurred while fetching messages.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id && userId && userType) {
      fetchScheduledMessages();
    }
  }, [userId, userType]);

  useEffect(() => {
    connectSocket(user?.id);
    const socket = getSocket();

    const handleNewScheduleMessage = (data) => {
      console.log(data);
      if (data?.sender_id == user?.id) {
        setMessages((prev) =>
          [data, ...prev].sort(
            (a, b) => new Date(b.schedule_at) - new Date(a.schedule_at)
          )
        );
      }
    };

    const handleScheduledMessageDeleted = ({ id }) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    };

    socket.on("new_scheduled_message", handleNewScheduleMessage);
    socket.on("scheduled_message_deleted", handleScheduledMessageDeleted);

    return () => {
      socket.off("new_scheduled_message", handleNewScheduleMessage);
      socket.off("scheduled_message_deleted", handleScheduledMessageDeleted);
    };
  }, [user?.id, userId, userType]);

  if (loading || error || messages.length === 0) return null;

  const latest = messages[0];

  const removeTrailingEmptyDivs = (html) => {
    // Use DOMParser to clean up divs
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const container = doc.body;

    // Remove trailing empty or blank <div>s
    while (
      container.lastChild &&
      container.lastChild.tagName === "DIV" &&
      container.lastChild.innerHTML
        .trim()
        .replace(/&nbsp;|<br\s*\/?>/gi, "") === ""
    ) {
      container.removeChild(container.lastChild);
    }

    let cleaned = container.innerHTML;

    // Remove trailing <br> tags (including multiple)
    cleaned = cleaned.replace(/(<br\s*\/?>\s*)+$/gi, "");

    return cleaned;
  };

  return (
    <div className="absolute">
      <div className="relative group inline-block">
  {/* Always visible clock icon */}
  <div className="animate-blink bg-yellow-600 border border-yellow-300 px-2 py-2 rounded shadow-sm flex items-center cursor-pointer absolute z-[9] top-[-5px] left-[10px]">
    <Clock4 size={15} className="text-white" />
  </div>

  {/* Hidden details - show on hover */}
  <div className="absolute left-[42px] top-[-5px] w-fit white-space-nowrap bg-orange-500 text-white border border-yellow-300 px-2 py-2 rounded items-start 
                  hidden scale-95 group-hover:flex group-hover:scale-100 transition-all duration-300 z-10 flex-col gap-1">
    <p className="f-11 flex items-center">
      {/* <Clock4 size={15} className="mr-1" />  */}
      You scheduled a message to be delivered at{" "}
      <span className="font-semibold ml-1">
        {new Date(latest.schedule_at).toLocaleString()}
      </span>
    </p>
    <button
      onClick={() => setShowModal(true)}
      className="text-[10px] text-blue-600 font-medium bg-white px-2 py-1 leading-none rounded text-orange-600 hover:bg-orange-100"
    >
      View all scheduled messages
    </button>
  </div>
</div>


      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <div className={`${
          theme == "dark" ? "bg-gray-300 text-gray-700" : "bg-white text-gray-700"
        }  w-[400px]  rounded-lg`}>
            <div className="flex justify-between items-center px-4 py-2 bg-orange-500  rounded-t-lg">
          
            
            <h2 className="text-[17px] font-semibold text-white">All Scheduled Messages</h2>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-red-500"
            >
              <X size={20} className="text-white" />
            </button>
            </div>
            <div className="p-4 max-h-[400px] overflow-y-auto">
            <ul className="space-y-3">
              {messages.map((msg) => (
                <li
                  key={msg.id}
                  className="border rounded-lg px-2 py-1 bg-gray-50 shadow-sm f-11"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{msg.sender_name}</span>
                    <span className="f-11 text-gray-500">
                      {new Date(msg.schedule_at).toLocaleString()}
                    </span>
                  </div>
                  <div
                    className="mt-1 text-[13px]"
                    dangerouslySetInnerHTML={{
                      __html: removeTrailingEmptyDivs(msg.message),
                    }}
                  ></div>
                  {msg.filename && (
                    <div className="mt-2 f-12 text-blue-600 flex items-center">
                      <a
                        href={
                          msg.filename.startsWith("http")
                            ? msg.filename
                            : `https://rapidcollaborate.in/ccp${msg.filename}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {msg.filename.split("/").pop()}
                      </a>
                    </div>
                  )}

                  {msg.voice_note && (
                    <div className="mt-2">
                      🔊 <audio controls src={msg.voice_note}></audio>
                    </div>
                  )}
                  {msg.is_quoted === 1 && (
                    <blockquote className="mt-2 pl-3 border-l-2 border-orange-500 text-gray-600 italic text-sm bg-orange-100 f-13">
                      <span className="font-bold f-12">
                        {msg.quoted_msg_name}
                      </span>
                      : {msg.quoted_msg}
                    </blockquote>
                  )}
                </li>
              ))}
            </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledMessages;
