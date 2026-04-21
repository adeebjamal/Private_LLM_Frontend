import React, { useEffect, useRef, useState, useCallback } from 'react';
import { getMessages, askQuestion } from '../api';
import type { Message } from '../api';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Loader2, Bot } from 'lucide-react';

interface Props {
  conversationId: number | null;
}

export const ChatArea: React.FC<Props> = ({ conversationId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentRow, setCurrentRow] = useState(1);
  const PAGE_SIZE = 10;

  const fetchMessages = useCallback(
    async (startRow: number, isInitial: boolean = false) => {
      if (!conversationId) return;

      if (isInitial) setIsLoading(true);
      else setIsFetchingHistory(true);

      try {
        const response = await getMessages(conversationId, startRow, startRow + PAGE_SIZE - 1);

        if (response.messages && response.messages.length > 0) {
          if (isInitial) {
            setMessages(response.messages.reverse());
            setTimeout(() => scrollToBottom(), 100);
          } else {
            const prevScrollHeight = containerRef.current?.scrollHeight || 0;
            setMessages((prev) => [...response.messages.reverse(), ...prev]);
            setTimeout(() => {
              if (containerRef.current) {
                containerRef.current.scrollTop = containerRef.current.scrollHeight - prevScrollHeight;
              }
            }, 0);
          }
          setCurrentRow(startRow + PAGE_SIZE);
          if (response.messages.length < PAGE_SIZE) {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
          if (isInitial) setMessages([]);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
        setIsFetchingHistory(false);
      }
    },
    [conversationId]
  );

  useEffect(() => {
    if (conversationId) {
      setMessages([]);
      setCurrentRow(1);
      setHasMore(true);
      fetchMessages(1, true);
    }
  }, [conversationId, fetchMessages]);

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop } = containerRef.current;
      if (scrollTop === 0 && hasMore && !isFetchingHistory && !isLoading) {
        fetchMessages(currentRow);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (query: string) => {
    if (!conversationId) return;

    const tempMessage: Message = {
      id: Date.now(),
      user_query: query,
      response: '',
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setTimeout(() => scrollToBottom(), 100);
    setIsLoading(true);

    try {
      const response = await askQuestion(conversationId, query);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id ? { ...msg, response: response.response } : msg
        )
      );
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Empty state
  if (!conversationId) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-secondary)',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '300px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.4 }}>💬</div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
            No Conversation Selected
          </h2>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.5 }}>
            Choose a conversation from the sidebar or create a new one.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg-primary)',
        overflow: 'hidden',
      }}
    >
      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
        }}
      >
        {isFetchingHistory && (
          <div style={{ textAlign: 'center', padding: '12px', color: 'var(--text-tertiary)' }}>
            <Loader2 size={18} style={{ animation: 'spin 1.5s linear infinite' }} />
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {isLoading && !isFetchingHistory && messages.length > 0 && (
          <div
            className="msg-ai"
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '8px',
              padding: '8px 0',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--bubble-ai-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)',
                flexShrink: 0,
              }}
            >
              <Bot size={14} strokeWidth={2.2} />
            </div>
            <div
              style={{
                padding: '14px 18px',
                background: 'var(--bubble-ai-bg)',
                borderRadius: '18px 18px 18px 4px',
                display: 'flex',
                gap: '5px',
                alignItems: 'center',
              }}
            >
              <span className="thinking-dot" />
              <span className="thinking-dot" />
              <span className="thinking-dot" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};
