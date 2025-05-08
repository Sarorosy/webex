import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../utils/idb';
import { getSocket, connectSocket } from '../../utils/Socket';
import toast from 'react-hot-toast';

const ChatMessages = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);
  const isFetchingRef = useRef(false);
  const { user } = useAuth();
  
  const limit = 20; // Number of messages to fetch per request

  const fetchMessages = async (skipCount = 0) => {
    if (isFetchingRef.current) return [];
    
    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      
      // Updated to match your API endpoint structure
      const res = await fetch(
        `http://localhost:5000/api/chats/messages?sender_id=${user.id}&receiver_id=${userId}&skip=${skipCount}&limit=${limit}`
      );

      if (!res.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await res.json();
      return data.reverse();
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    const loadInitialMessages = async () => {
      const initialMessages = await fetchMessages(0);
      setMessages(initialMessages);
      setSkip(initialMessages.length);
      setHasMore(initialMessages.length >= limit);
    };
    
    if (userId && user?.id) {
      loadInitialMessages();
    }
    
    return () => {
      // Cleanup if needed
      setMessages([]);
      setSkip(0);
      setHasMore(true);
    };
  }, [userId, user?.id]);

  // Socket connection for real-time messages
  useEffect(() => {
    let mounted = true;
  
    if (user?.id && userId) {
      const socket = getSocket();
  
      // Connect socket if needed
      connectSocket(user.id);
  
      // Create message handler function
      const handleNewMessage = (msg) => {
        // Only process if component is still mounted
        if (!mounted) return;
  
        // Check if this message belongs to the current conversation
        const parsedUserId = parseInt(userId);
        const isRelevantMessage = 
          (msg.sender_id == user.id && msg.receiver_id == parsedUserId) || 
          (msg.sender_id == parsedUserId && msg.receiver_id == user.id);
  
        if (isRelevantMessage) {
          // Check if message already exists before adding
          setMessages((prevMessages) => {
            // Don't add if message ID already exists
            if (prevMessages.some(m => m.id === msg.id)) {
              return prevMessages;
            }
            return [...prevMessages, msg];
          });
  
          // Scroll to bottom after new message
          setTimeout(() => {
            if (containerRef.current) {
              containerRef.current.scrollTop = containerRef.current.scrollHeight;
            }
          }, 0);
  
         
        }
      };
  
      // Clean up existing listeners before adding a new one
      socket.off('new_message');
      socket.on('new_message', handleNewMessage);
  
      // Cleanup function
      return () => {
        mounted = false;
        if (socket) {
          socket.off('new_message', handleNewMessage);
        }
      };
    }
  
    return () => {
      mounted = false;
    };
  }, [user?.id, userId]);

  // Scroll to bottom on initial load
  useEffect(() => {
    if (containerRef.current && messages.length > 0) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle scroll to top to load more messages
  const handleScroll = async () => {
    const container = containerRef.current;
    
    if (!container || !hasMore || isLoading) return;
    
    // If user scrolls near the top (e.g., within 100px of the top)
    if (container.scrollTop < 100) {
      const oldScrollHeight = container.scrollHeight;
      
      // Fetch more messages
      const olderMessages = await fetchMessages(skip);
      
      if (olderMessages.length > 0) {
        setMessages(prevMessages => [...olderMessages, ...prevMessages]);
        setSkip(skip + olderMessages.length);
        setHasMore(olderMessages.length >= limit);
        
        // Maintain scroll position after new messages are added
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.scrollTop = 
              containerRef.current.scrollHeight - oldScrollHeight;
          }
        }, 0);
      } else {
        setHasMore(false);
      }
    }
  };

  // Format timestamp for display
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      ref={containerRef}
      className="messages-container"
      onScroll={handleScroll}
      style={{ 
        height: '70vh', 
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        padding: '10px'
      }}
    >
      {isLoading && <div className="loading-indicator">Loading...</div>}
      
      {messages.length === 0 && !isLoading ? (
        <div className="no-messages">No messages yet. Start a conversation!</div>
      ) : (
        messages.map((msg) => (
          <div 
            key={msg.id}
            className={`message ${msg.sender_id === user.id ? 'sent' : 'received'}`}
            style={{
              alignSelf: msg.sender_id === user.id ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender_id === user.id ? '#0084ff' : '#e4e6eb',
              color: msg.sender_id === user.id ? 'white' : 'black',
              borderRadius: '18px',
              padding: '8px 12px',
              margin: '4px 0',
              maxWidth: '70%',
              wordBreak: 'break-word'
            }}
          >
            <div className="message-content">{msg.message}</div>
            <div 
              className="message-time"
              style={{
                fontSize: '0.7rem',
                opacity: 0.7,
                textAlign: msg.sender_id === user.id ? 'right' : 'left'
              }}
            >
              {formatTime(msg.created_at)}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ChatMessages;