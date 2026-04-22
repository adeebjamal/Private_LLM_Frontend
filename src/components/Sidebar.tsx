import React, { useState, useRef, useEffect } from 'react';
import { Plus, MessageSquare, Menu, X, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import type { Conversation } from '../api';
import { ThemeToggle } from './ThemeToggle';

interface Props {
  conversations: Conversation[];
  activeConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewChatClick: () => void;
  onRenameClick: (conv: Conversation) => void;
  onDeleteConversation: (id: number) => void;
  isCreating: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (isOpen: boolean) => void;
}

export const Sidebar: React.FC<Props> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChatClick,
  onRenameClick,
  onDeleteConversation,
  isCreating,
  theme,
  toggleTheme,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpenId(null);
      }
    };
    if (menuOpenId !== null) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpenId]);

  const handleRenameStart = (conv: Conversation) => {
    setMenuOpenId(null);
    onRenameClick(conv);
  };

  const handleDeleteClick = (id: number) => {
    setMenuOpenId(null);
    onDeleteConversation(id);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setIsOpenMobile(!isOpenMobile)}
        style={{
          position: 'fixed',
          top: '12px',
          left: '12px',
          zIndex: 100,
          background: 'var(--sidebar-bg)',
          backdropFilter: 'blur(20px)',
          border: '0.5px solid var(--sidebar-border)',
          borderRadius: '8px',
          padding: '6px',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          display: 'none',
        }}
      >
        {isOpenMobile ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay for mobile */}
      {isOpenMobile && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 40,
            animation: 'fadeIn 0.2s ease',
          }}
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`sidebar-glass sidebar-container ${isOpenMobile ? 'open' : ''}`}
        style={{
          width: '260px',
          minWidth: '260px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.3s ease',
          zIndex: 50,
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          className="sidebar-header"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 16px 12px',
            transition: 'padding 0.3s ease',
          }}
        >
          <h1
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
            }}
          >
            Pulse.AI
          </h1>
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
        </div>

        {/* New Chat Button */}
        <div style={{ padding: '0 12px 8px' }}>
          <button
            onClick={onNewChatClick}
            disabled={isCreating}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              width: '100%',
              padding: '8px 12px',
              backgroundColor: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
              cursor: isCreating ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s, opacity 0.15s',
              opacity: isCreating ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isCreating) e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
            }}
            onMouseLeave={(e) => {
              if (!isCreating) e.currentTarget.style.backgroundColor = 'var(--accent)';
            }}
          >
            <Plus size={16} strokeWidth={2.5} />
            {isCreating ? 'Creating...' : 'New Conversation'}
          </button>
        </div>

        {/* Separator */}
        <div style={{ height: '0.5px', background: 'var(--separator)', margin: '4px 16px 8px' }} />

        {/* Conversations List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px 12px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
            {conversations.map((conv) => {
              const isActive = activeConversationId === conv.id;

              return (
                <div key={conv.id} className="conv-item" style={{ position: 'relative' }}>
                  <button
                    onClick={() => {
                      onSelectConversation(conv.id);
                      setIsOpenMobile(false);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      width: '100%',
                      padding: '8px 10px',
                      backgroundColor: isActive ? 'var(--sidebar-active)' : 'transparent',
                      border: 'none',
                      borderRadius: '6px',
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.12s ease',
                      fontSize: '13px',
                      fontWeight: isActive ? 500 : 400,
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'var(--sidebar-hover)';
                      const dots = e.currentTarget.querySelector('[data-dots]') as HTMLElement;
                      if (dots) dots.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                      if (menuOpenId !== conv.id) {
                        const dots = e.currentTarget.querySelector('[data-dots]') as HTMLElement;
                        if (dots) dots.style.opacity = '0';
                      }
                    }}
                  >
                    <MessageSquare size={15} strokeWidth={1.8} style={{ flexShrink: 0, opacity: 0.7 }} />
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1,
                      }}
                    >
                      {conv.title}
                    </span>

                    {/* 3-dot menu trigger */}
                    <span
                      data-dots=""
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === conv.id ? null : conv.id);
                      }}
                      style={{
                        opacity: menuOpenId === conv.id ? 1 : 0,
                        display: 'flex',
                        alignItems: 'center',
                        padding: '2px',
                        borderRadius: '4px',
                        transition: 'opacity 0.12s, background 0.12s',
                        flexShrink: 0,
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--sidebar-active)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <MoreHorizontal size={15} strokeWidth={1.8} />
                    </span>
                  </button>

                  {/* Dropdown menu */}
                  {menuOpenId === conv.id && (
                    <div
                      ref={menuRef}
                      className="dropdown-menu"
                      onMouseDown={(e) => e.stopPropagation()}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '36px',
                        zIndex: 100,
                        minWidth: '160px',
                        backgroundColor: 'var(--modal-bg-solid)',
                        background: 'var(--modal-bg)',
                        backdropFilter: 'saturate(180%) blur(20px)',
                        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                        border: '0.5px solid var(--sidebar-border)',
                        borderRadius: '10px',
                        boxShadow: 'var(--shadow-md)',
                        padding: '5px',
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameStart(conv);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%',
                          padding: '8px 12px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          color: 'var(--text-primary)',
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--accent)';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--text-primary)';
                        }}
                      >
                        <Pencil size={14} /> Rename
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(conv.id);
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          width: '100%',
                          padding: '8px 12px',
                          background: 'transparent',
                          border: 'none',
                          borderRadius: '6px',
                          color: '#ff453a',
                          fontSize: '13px',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#ff453a';
                          e.currentTarget.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = '#ff453a';
                        }}
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Contact Footer */}
        <div
          style={{
            padding: '10px 16px 14px',
            borderTop: '0.5px solid var(--separator)',
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontSize: '10px',
              color: 'var(--text-secondary)',
              opacity: 0.5,
              letterSpacing: '0.01em',
            }}
          >
            Contact the developer —{' '}
            <a
              href="mailto:adeebjamal@hotmail.com"
              style={{
                color: 'inherit',
                textDecoration: 'none',
                borderBottom: '0.5px solid currentColor',
              }}
            >
              adeebjamal@hotmail.com
            </a>
          </span>
        </div>
      </div>
    </>
  );
};
