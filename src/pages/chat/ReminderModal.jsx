import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import moment from 'moment';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

const ReminderModal = ({ msgId, userId, onClose }) => {
  const [selectedTime, setSelectedTime] = useState('30 minutes');
  const [error, setError] = useState('');

  // Calculate the appropriate date-time value based on the selected time
  const calculateReminderTime = (timeOption) => {
    const currentTime = moment();
    switch (timeOption) {
      case '30 minutes':
        return currentTime.add(30, 'minutes').format('YYYY-MM-DD HH:mm');
      case '1 hour':
        return currentTime.add(1, 'hour').format('YYYY-MM-DD HH:mm');
      case '4 hours':
        return currentTime.add(4, 'hours').format('YYYY-MM-DD HH:mm');
      case '1 day':
        return currentTime.add(1, 'day').format('YYYY-MM-DD HH:mm');
      case '7 days':
        return currentTime.add(7, 'days').format('YYYY-MM-DD HH:mm');
      default:
        return currentTime.format('YYYY-MM-DD HH:mm');
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    const reminderTime = calculateReminderTime(selectedTime);
    try {
      const response = await axios.post('https://webexback-06cc.onrender.com/api/reminders/reminder', {
        msg_id: msgId,
        user_id: userId,
        time: reminderTime
      });
      if (response.status === 201) {
        toast.success('Reminder set successfully!');
        onClose(); // Close the modal after success
      }
    } catch (error) {
      setError('Failed to set reminder');
    }
  };

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 flex justify-center items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{zIndex:60}}
    >
      <motion.div
        className="bg-white rounded-lg shadow-lg w-[400px]"
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        
      >
        <div 
        
        className='flex justify-between items-center px-4 py-2 bg-orange-500  rounded-t-lg'>
          <h2 className="text-lg font-semibold text-white">Set Reminder for Message</h2>
          <div>
            <button
            className="hover:bg-gray-100 text-white hover:text-black py-1 px-2 rounded"
            onClick={onClose} // Close modal without doing anything
          >
            <X size={15}  />
          </button>
          </div>
        </div>
        
        <div className=" p-4">
          <label className="block text-sm font-medium text-gray-700">Select Reminder Time</label>
          <select
            className="mt-2 p-2 w-full border rounded "
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
          >
            <option value="30 minutes">30 minutes</option>
            <option value="1 hour">1 hour</option>
            <option value="4 hours">4 hours</option>
            <option value="1 day">1 day</option>
            <option value="7 days">7 days</option>
          </select>
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end mt-6">
            
            <div>
              <button
                className="px-4 py-1 rounded border border-orange-500 hover:text-white hover:bg-orange-500 f-13"
                onClick={handleSubmit} // Submit the reminder
              >
                Set Reminder
              </button>
            </div>
          </div>
        </div>

        
      </motion.div>
    </motion.div>
  );
};

export default ReminderModal;
