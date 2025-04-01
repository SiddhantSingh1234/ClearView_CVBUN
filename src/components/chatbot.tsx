// import React, { useState } from 'react';
// import './chatbot.css';

// interface ChatbotProps {
//   onClose: () => void; // Function to close the modal
// }

// const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
//   const [question, setQuestion] = useState<string>('');
//   const [answers, setAnswers] = useState<string[]>([]);
//   const [isLoading, setIsLoading] = useState<boolean>(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       // Send the question to the backend API
//       const response = await fetch('http://localhost:7000/api/chatbot', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ question }),
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! Status: ${response.status}`);
//       }  

//       const data = await response.json();
//       setAnswers([...answers, `Q: ${question}`, `A: ${data.answer}`]); // Add Q&A to the answers list
//       setQuestion(''); // Clear the input field
//     } catch (error) {
//       console.error('Error:', error);
//       setAnswers([...answers, `Error: Failed to get a response.`]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="chatbot-overlay">
//       <div className="chatbot-modal">
//         <button className="chatbot-close-btn" onClick={onClose}>
//           &times;
//         </button>
//         <h2 className="chatbot-header">Chatbot</h2>
//         <div className="chatbot-messages">
//           {answers.map((answer, index) => (
//             <div key={index} className="chatbot-message">
//               {answer}
//             </div>
//           ))}
//         </div>
//         <form onSubmit={handleSubmit} className="chatbot-form">
//           <input
//             type="text"
//             value={question}
//             onChange={(e) => setQuestion(e.target.value)}
//             placeholder="Ask a question..."
//             className="chatbot-input"
//             disabled={isLoading}
//           />
//           <button type="submit" className="chatbot-submit-btn" disabled={isLoading}>
//             {isLoading ? 'Sending...' : 'Send'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default Chatbot;

import React, { useState } from 'react';
import { MessageSquare, Send, X } from 'lucide-react';

interface ChatbotProps {
  onClose: () => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onClose }) => {
  const [question, setQuestion] = useState<string>('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    
    setIsLoading(true);

    try {
      // Send the question to the backend API
      const response = await fetch('http://localhost:7000/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }  

      const data = await response.json();
      setAnswers([...answers, `Q: ${question}`, `A: ${data.answer}`]);
      setQuestion('');
    } catch (error) {
      console.error('Error:', error);
      setAnswers([...answers, `Error: Failed to get a response.`]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden border border-border">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground flex items-center">
            <MessageSquare className="mr-2 h-5 w-5 text-primary" />
            <span>ClearView Assistant</span>
          </h2>
          <button 
            onClick={onClose}
            className="h-8 w-8 rounded-full inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto bg-accent/30">
          {answers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <MessageSquare className="h-12 w-12 text-primary/30 mb-4" />
              <p className="text-center text-muted-foreground">
                How can I help you today?
              </p>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Ask me anything about ClearView...
              </p>
            </div>
          ) : (
            answers.map((answer, index) => (
              <div 
                key={index} 
                className={`mb-3 p-3 rounded-lg ${
                  answer.startsWith('Q:') 
                    ? 'bg-primary/10 text-foreground ml-8' 
                    : answer.startsWith('Error:')
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-muted text-muted-foreground mr-8'
                }`}
              >
                {answer}
              </div>
            ))
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-background flex">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type your question here..."
            className="flex-1 p-2 bg-background text-foreground border border-input rounded-l-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-r-md disabled:bg-muted disabled:text-muted-foreground transition-colors flex items-center"
            disabled={isLoading || !question.trim()}
          >
            {isLoading ? 'Sending...' : <Send className="h-4 w-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;