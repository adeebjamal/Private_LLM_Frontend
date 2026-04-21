import React from 'react';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../api';
import { User, Bot } from 'lucide-react';

interface Props {
  message: Message;
}

export const MessageBubble: React.FC<Props> = ({ message }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
      {/* User Query */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', gap: '8px' }}>
        <div
          style={{
            maxWidth: '75%',
            padding: '10px 14px',
            background: 'var(--bubble-user-bg)',
            color: 'var(--bubble-user-text)',
            borderRadius: '18px 18px 4px 18px',
            fontSize: '0.93rem',
            lineHeight: 1.45,
          }}
        >
          {message.user_query}
        </div>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0,
          }}
        >
          <User size={14} strokeWidth={2.2} />
        </div>
      </div>

      {/* AI Response */}
      {message.response && (
        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-end', gap: '8px' }}>
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
            className="markdown-body"
            style={{
              maxWidth: '75%',
              padding: '10px 14px',
              background: 'var(--bubble-ai-bg)',
              color: 'var(--bubble-ai-text)',
              borderRadius: '18px 18px 18px 4px',
              fontSize: '0.93rem',
              lineHeight: 1.45,
            }}
          >
            <ReactMarkdown>{message.response}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};
