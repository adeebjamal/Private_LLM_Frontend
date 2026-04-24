import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  getMessages,
  submitQuestion,
  startTaskPolling,
  getTasksForConversation,
  clearTask,
} from '../api';
import type { Message } from '../api';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { Loader2, Bot } from 'lucide-react';

interface Props {
  conversationId: number | null;
}

export const ChatArea: React.FC<Props> = ({ conversationId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [currentRow, setCurrentRow] = useState(1);
  const PAGE_SIZE = 10;

  const fetchMessages = useCallback(
    async (startRow: number, isInitial: boolean = false) => {
      if (!conversationId) return;

      if (isInitial) setIsInitialLoading(true);
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
        if (isInitial) setIsInitialLoading(false);
        setIsFetchingHistory(false);
      }
    },
    [conversationId]
  );

  // -----------------------------------------------------------------------
  // On conversation switch: fetch messages, then restore any pending tasks
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!conversationId) return;

    setMessages([]);
    setCurrentRow(1);
    setHasMore(true);

    fetchMessages(1, true).then(() => {
      const tasks = getTasksForConversation(conversationId);
      for (const task of tasks) {
        if (task.status === 'completed' && task.result) {
          setMessages((prev) => {
            if (prev.some((m) => m.user_query === task.query && m.response)) return prev;
            return [
              ...prev,
              {
                id: task.tempMessageId,
                user_query: task.query,
                response: task.result!.response,
                created_at: new Date().toISOString(),
              },
            ];
          });
          clearTask(task.taskId);
          setTimeout(() => scrollToBottom(), 100);
        } else if (task.status === 'failed') {
          clearTask(task.taskId);
        } else if (task.status === 'polling') {
          setMessages((prev) => {
            if (prev.some((m) => m.id === task.tempMessageId)) return prev;
            return [
              ...prev,
              {
                id: task.tempMessageId,
                user_query: task.query,
                response: '',
                created_at: new Date().toISOString(),
              },
            ];
          });
          setIsAILoading(true);
          setTimeout(() => scrollToBottom(), 100);
        }
      }
    });
  }, [conversationId, fetchMessages]);

  // -----------------------------------------------------------------------
  // Lightweight local checker — every 1.5 s, looks at the module-level task
  // store (no network calls) and applies completed / failed results.
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!conversationId) return;

    const interval = setInterval(() => {
      const tasks = getTasksForConversation(conversationId);
      
      for (const task of tasks) {
        if (task.status === 'completed' && task.result) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === task.tempMessageId
                ? { ...msg, response: task.result!.response }
                : msg
            )
          );
          clearTask(task.taskId);
          setTimeout(() => scrollToBottom(), 100);
        } else if (task.status === 'failed') {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === task.tempMessageId
                ? { ...msg, response: `⚠️ ${task.error || 'Failed to get response.'}` }
                : msg
            )
          );
          clearTask(task.taskId);
        }
      }

      // Sync loading state based on active tasks and current message list
      const hasPolling = tasks.some(t => t.status === 'polling');
      const hasEmptyResponse = messages.some(m => m.response === '');
      setIsAILoading(hasPolling || hasEmptyResponse);
    }, 1500);

    return () => clearInterval(interval);
  }, [conversationId, messages]);

  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop } = containerRef.current;
      if (scrollTop === 0 && hasMore && !isFetchingHistory && !isInitialLoading) {
        fetchMessages(currentRow);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const showTypingIndicator = isAILoading && !isInitialLoading && !isFetchingHistory;

  // -----------------------------------------------------------------------
  // Send message — submits to backend, registers background polling
  // -----------------------------------------------------------------------
  const handleSendMessage = async (query: string, useInternet: boolean) => {
    if (!conversationId) return;

    const tempMessage: Message = {
      id: Date.now(),
      user_query: query,
      response: '',
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);
    setTimeout(() => scrollToBottom(), 100);
    setIsAILoading(true);

    try {
      const accepted = await submitQuestion(conversationId, query, useInternet);
      startTaskPolling(accepted.task_id, conversationId, query, tempMessage.id);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessage.id
            ? { ...msg, response: '⚠️ Failed to send message. Please try again.' }
            : msg
        )
      );
      setIsAILoading(false);
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

        {isInitialLoading && messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
            <Loader2 size={24} style={{ animation: 'spin 1.5s linear infinite' }} />
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {showTypingIndicator && (
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
      <ChatInput onSendMessage={handleSendMessage} isLoading={isInitialLoading || isAILoading} />
    </div>
  );
};
