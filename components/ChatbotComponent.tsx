// components/ChatbotComponent.tsx
"use client";
import { useChat } from '@ai-sdk/react'; 
import React, { useEffect, useRef, useState } from "react";
import { ChatMessage } from './ui/ChatMessage';

interface ChatbotComponentProps {
  user: any; 
  onComplete: (career: string) => void; 
}

export default function ChatbotComponent({ user, onComplete }: ChatbotComponentProps) {
  const [finalCareer, setFinalCareer] = useState("");
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const { messages, input, handleInputChange, handleSubmit, isLoading, append } = useChat({
    api: "/api/chatbot",
    onError: (error) => {
      console.error("Chat error:", error);
    },
    onFinish: (message) => {
      if (message.content.includes("FINAL_CAREER:") && !awaitingConfirmation) {
        // Updated regex to be more precise and stop at line breaks or JSON characters
        const careerMatch = message.content.match(/FINAL_CAREER:\s*([^\n\r\]}"]+)/);
        if (careerMatch) {
          const career = careerMatch[1].trim();
          setFinalCareer(career);
          setAwaitingConfirmation(true);
          
          // Add confirmation message to chat with a slight delay to avoid flickering
          setTimeout(() => {
            append({
              role: "assistant",
              content: `\`\`\`json\n{"message": "Perfect! Your final career choice is: ${career}. Click confirm to start the roadmap generation process.", "buttons": ["Confirm", "Not Sure, show me other options"]}\n\`\`\``
            });
          }, 100);
        }
      }
    }
  });

  const hasSentInitialMessage = useRef(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasSentInitialMessage.current && !isLoading) {
      append({
        role: "user",
        content: `Hi I'm confused about what career to choose.`,
      });
      hasSentInitialMessage.current = true;
    }
  }, [append, isLoading]);

  // Smart scrolling: User messages at top, Assistant responses at bottom
  useEffect(() => {
    if (chatContainerRef.current && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // If user just sent a message, scroll to show it at the top
      if (lastMessage.role === 'user') {
        setTimeout(() => {
          if (chatContainerRef.current) {
            const messageElements = chatContainerRef.current.querySelectorAll('[data-message-id]');
            const lastUserMessageElement = Array.from(messageElements).find(
              el => el.getAttribute('data-message-id') === lastMessage.id
            ) as HTMLElement;
            
            if (lastUserMessageElement) {
              const scrollOffset = lastUserMessageElement.offsetTop - 8; // top-2 equivalent (8px)
              
              chatContainerRef.current.scrollTo({
                top: scrollOffset,
                behavior: 'smooth'
              });
            }
          }
        }, 50);
      }
      // For assistant messages, scroll to bottom to show the response
      else if (lastMessage.role === 'assistant') {
        setTimeout(() => {
          if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
          }
        }, 50);
      }
    }
  }, [messages]);

  // Improved parsing function that handles streaming better
  const parseMessageContent = (content: string, isStreaming: boolean = false) => {
    // If still streaming and content looks incomplete, show raw content
    if (isStreaming && !content.trim().endsWith('}')) {
      return { message: content, buttons: [] };
    }

    // Try to extract JSON from various formats
    const jsonPatterns = [
      /```json\s*(\{[\s\S]*?\})\s*```/,  // Markdown code block
      /```(\{[\s\S]*?\})```/,      // Generic code block
      /(\{[\s\S]*\})/                // Raw JSON
    ];

    for (const pattern of jsonPatterns) {
      const match = content.match(pattern);
      if (match) {
        try {
          const jsonStr = match[1].trim();
          const parsed = JSON.parse(jsonStr);
          
          // Validate the parsed object has expected structure
          if (parsed && typeof parsed.message === 'string') {
            return {
              message: parsed.message,
              buttons: Array.isArray(parsed.buttons) ? parsed.buttons : []
            };
          }
        } catch (e) {
          // JSON parsing failed, continue to next pattern
          continue;
        }
      }
    }

    // If no valid JSON found but content starts with ```json, hide it during streaming
    if (content.includes('```json') && isStreaming) {
      return { message: '', buttons: [] };
    }

    // If no valid JSON found, return raw content
    return { message: content, buttons: [] };
  };

  const handleButtonClick = async (buttonText: string) => {
    if (isLoading) return;
    
    // Handle confirmation buttons specially
    if (awaitingConfirmation) {
      if (buttonText === "Confirm") {
        onComplete(finalCareer);
        return;
      } else if (buttonText.includes("Not Sure") || buttonText.includes("other options")) {
        setAwaitingConfirmation(false);
        setFinalCareer("");
        try {
          await append({
            role: "user",
            content: "I'm not sure about this career. Can you suggest some other options?"
          });
        } catch (error) {
          console.error("Error sending rejection message:", error);
        }
        return;
      }
    }
    
    // Regular button handling
    try {
      await append({
        role: "user",
        content: buttonText
      });
    } catch (error) {
      console.error("Error sending button message:", error);
    }
  };

  return (
    <div className="flex flex-col w-full items-center h-screen max-w-4xl mx-auto overflow-hidden">
      {/* Chat Messages */}
      <div ref={chatContainerRef} className="flex-1 pt-6 sm:p-8 max-h-full pb-24 md:pb-96 top-0 mb-8 sm:mb-12 overflow-y-auto scrollbar-hidden space-y-4 sm:space-y-6">
        {messages
          .filter((m, i) => !(i === 0 && m.role === 'user'))
          .map((m) => {
            const isUser = m.role === "user";
            const isCurrentlyStreaming = isLoading && messages[messages.length - 1]?.id === m.id;
            
            // Clean the message content by removing FINAL_CAREER line
            let cleanContent = m.content;
            if (!isUser && cleanContent.includes('FINAL_CAREER:')) {
              cleanContent = cleanContent.replace(/FINAL_CAREER:.*$/m, '').trim();
            }
            
            const parsedContent = isUser ? 
              { message: cleanContent } : 
              parseMessageContent(cleanContent, isCurrentlyStreaming);
            
            return (
              <ChatMessage
                key={m.id}
                message={{...m, content: cleanContent}}
                isUser={isUser}
                parsedContent={parsedContent}
                isLoading={isLoading}
                onButtonClick={handleButtonClick}
                data-message-id={m.id}
              />
            );
        })}
        
        {isLoading && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex justify-start">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-2xl rounded-tl-md p-3 sm:p-4 shadow-sm border border-gray-100">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Response Buttons - Show latest assistant message buttons above input */}
      {(() => {
        const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop();
        if (!lastAssistantMessage || isLoading) return null;
        
        const parsedContent = parseMessageContent(lastAssistantMessage.content, false);
        if (!parsedContent.buttons || parsedContent.buttons.length === 0) return null;
        
        return (
          <div className="absolute bottom-[7vh] sm:bottom-[10vh] z-10">
            {/* Horizontal scrolling container */}
            <div 
              className="overflow-x-auto sm:max-w-2xl max-w-sm  scrollbar-hidden px-2"
            >
              {/* Flex container with nowrap */}
              <div className="flex gap-2 pb-2" style={{ minWidth: 'max-content' }}>
                {parsedContent.buttons.map((button: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => handleButtonClick(button)}
                    disabled={isLoading}
                    className="px-4 py-2 rounded-full backdrop-blur-sm bg-[#e0dcdd]/70 text-gray-700 text-sm font-normal hover:bg-[#e0dcdd]/80 disabled:opacity-50 transition-all duration-200 hover:shadow-md whitespace-nowrap flex-shrink-0"
                  >
                    {button}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      })()}
      

      {/* Input Form */}
      <div className="absolute bottom-4 z-10 w-full flex justify-center px-4 sm:px-0">
        <form onSubmit={handleSubmit} className="relative w-full max-w-sm sm:max-w-2xl">
          <input
            autoFocus
            value={input}
            onChange={handleInputChange}
            placeholder={awaitingConfirmation ? "Please use the buttons above to confirm..." : "Ask me anything..."}
            className="w-full pl-4 sm:pl-6 pr-10 sm:pr-12 py-3 sm:py-4 rounded-full backdrop-blur-sm bg-[#e0dcdd]/70 text-gray-700 placeholder:text-sm placeholder:text-[#8f8588] focus:outline-none shadow-inner"
            disabled={isLoading || awaitingConfirmation}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim() || awaitingConfirmation} 
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 sm:p-3 text-gray-800 shadow-md disabled:opacity-50 disabled:cursor-pointer transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V6M5 13l7-7 7 7"/>
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}