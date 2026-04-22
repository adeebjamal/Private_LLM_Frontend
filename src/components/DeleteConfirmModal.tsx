import React from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  conversationTitle: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<Props> = ({
  isOpen,
  conversationTitle,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 220,
        padding: '20px',
      }}
    >
      <div
        onClick={isDeleting ? undefined : onClose}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          animation: 'fadeIn 0.15s ease',
        }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '360px',
          backgroundColor: 'var(--modal-bg-solid)',
          background: 'var(--modal-bg)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          border: '0.5px solid var(--content-border)',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: 'var(--shadow-lg)',
          animation: 'modalIn 0.2s ease-out',
        }}
      >
        <button
          onClick={onClose}
          disabled={isDeleting}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-tertiary)',
            cursor: isDeleting ? 'default' : 'pointer',
            padding: '4px',
            display: 'flex',
            borderRadius: '4px',
            opacity: isDeleting ? 0.5 : 1,
          }}
        >
          <X size={16} />
        </button>

        <h2
          style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}
        >
          Delete Conversation
        </h2>

        <p
          style={{
            fontSize: '0.82rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            marginBottom: '14px',
          }}
        >
          Are you sure you want to delete{' '}
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
            "{conversationTitle}"
          </span>
          ? This action cannot be undone.
        </p>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            disabled={isDeleting}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: '0.5px solid var(--input-border)',
              background: 'transparent',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 500,
              cursor: isDeleting ? 'default' : 'pointer',
              transition: 'background 0.12s',
              opacity: isDeleting ? 0.6 : 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--sidebar-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              border: 'none',
              background: '#ff453a',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 500,
              cursor: isDeleting ? 'default' : 'pointer',
              transition: 'filter 0.12s, opacity 0.12s',
              opacity: isDeleting ? 0.75 : 1,
            }}
          >
            {isDeleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
