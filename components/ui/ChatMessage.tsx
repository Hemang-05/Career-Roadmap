//components\ui\ChatMessage.tsx
import React from 'react';

interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant' | 'system' | 'data';
    content: string;
  };
  isUser: boolean;
  parsedContent: {
    message: string;
    buttons?: string[];
  };
  isLoading: boolean;
  onButtonClick: (buttonText: string) => void;
  'data-message-id'?: string;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ 
  message, 
  isUser, 
  parsedContent,
  isLoading,
  onButtonClick,
  'data-message-id': dataMessageId
}) => {
  // Determine if this message should show documents/attachments
  const hasDocuments = !isUser && parsedContent.message.includes('document');

  return (
    <div 
      className={`flex items-start ${isUser ? 'justify-end' : ''}`}
      data-message-id={dataMessageId}
    >
      <div className="flex flex-col items-start gap-2 sm:gap-3 max-w-xs sm:max-w-2xl">
        {/* Message bubble */}
        <div className={`
          relative px-3 sm:px-4 py-3 sm:py-4 rounded-2xl max-w-full
          ${isUser 
            ? 'bg-slate-200/60 text-gray-800 text-sm rounded-tr-sm ml-8 sm:ml-52' 
            : 'bg-transparent text-gray-900 text-sm'
          }
        `}>
          {/* Main message content */}
          <div className="whitespace-pre-wrap leading-relaxed">
            {parsedContent.message}
          </div>
        </div>
      </div>
    </div>
  );
};