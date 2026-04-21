import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface Props {
  onSendMessage: (query: string) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<Props> = ({ onSendMessage, isLoading }) => {
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSendMessage(query.trim());
      setQuery('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSend = query.trim() && !isLoading;

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: '12px 16px 16px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '8px',
          padding: '8px 12px 8px 16px',
          background: 'var(--input-bg)',
          border: '0.5px solid var(--input-border)',
          borderRadius: '22px',
          boxShadow: 'var(--shadow-sm)',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        }}
      >
        <textarea
          ref={textareaRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message"
          disabled={isLoading}
          rows={1}
          style={{
            flex: 1,
            padding: '6px 0',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-primary)',
            fontSize: '0.93rem',
            lineHeight: 1.45,
            resize: 'none',
            outline: 'none',
            overflowY: 'auto',
            maxHeight: '140px',
          }}
        />
        <button
          type="submit"
          disabled={!canSend}
          style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: canSend ? 'var(--accent)' : 'var(--separator)',
            border: 'none',
            color: canSend ? '#fff' : 'var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: canSend ? 'pointer' : 'default',
            transition: 'background 0.15s ease',
            flexShrink: 0,
            marginBottom: '2px',
          }}
        >
          <ArrowUp size={16} strokeWidth={2.5} />
        </button>
      </div>
    </form>
  );
};
