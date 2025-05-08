import React, { useState } from 'react';
import { Mention } from 'primereact/mention';
import './chatStyles.css';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import { useAuth } from '../../utils/idb';

const ChatSend = ({ type, userId, onMessageSent }) => {
  const [value, setValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const { user } = useAuth(); // Get sender_id

  const users = [
    { id: 1, nickname: 'Alice' },
    { id: 2, nickname: 'Bob' },
    { id: 3, nickname: 'Charlie' },
    { id: 4, nickname: 'David' },
  ];

  const onSearch = (event) => {
    const query = event.query.toLowerCase();
    const filteredUsers = users.filter(user =>
      user.nickname.toLowerCase().includes(query)
    );
    setSuggestions(filteredUsers);
  };

  const itemTemplate = (item) => (
    <div className="p-clearfix">
      <span>{item.nickname}</span>
    </div>
  );

  const handleSend = async () => {
    if (!value.trim()) return;

    try {
      const res = await fetch('http://localhost:5000/api/chats/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender_id: user.id,
          receiver_id: userId,
          message: value.trim()
        }),
      });

      if (!res.ok) throw new Error('Message send failed');

      setValue(''); // Clear textarea

      if (onMessageSent) onMessageSent(); // Optional callback to refresh chat
    } catch (error) {
      console.error('Send error:', error);
    }
  };

  return (
    <div className="chat-send-container space-x-2 flex items-end justify-between mx-auto">
      {type === 'group' ? (
        <Mention
          value={value}
          onChange={(e) => setValue(e.target.value)}
          suggestions={suggestions}
          onSearch={onSearch}
          field="nickname"
          placeholder="Enter @ to mention people"
          rows={5}
          cols={40}
          itemTemplate={itemTemplate}
          className="w-full border border-gray-300 rounded-md p-3 text-sm focus:outline-none resize-none"
        />
      ) : (
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Type your message..."
          rows={5}
          className="w-full h-[80px] border border-gray-300 rounded-md p-3 text-sm focus:outline-none resize-none"
        />
      )}

      <button
        onClick={handleSend}
        className="mt-2 w-24 bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 transition"
      >
        Send
      </button>
    </div>
  );
};

export default ChatSend;
