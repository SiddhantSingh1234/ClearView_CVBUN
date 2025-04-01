import React from 'react';
import Chatbot from '../components/chatbot';

const ChatbotPage: React.FC = () => {
  return (
    <div>
      <h1>Chatbot Page</h1>
      <Chatbot onClose={() => console.log('Chatbot closed')} />
    </div>
  );
};

export default ChatbotPage;