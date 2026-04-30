import { useEffect, useRef, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatArea } from './components/ChatArea';
import { NewChatModal } from './components/NewChatModal';
import { RenameModal } from './components/RenameModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { getConversations, createConversation, renameConversation, deleteConversation } from './api';
import type { Conversation } from './api';
import './index.css';

function App() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Rename modal state
  const [renameTarget, setRenameTarget] = useState<Conversation | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = (message: string) => {
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    setToastMessage(message);
    toastTimerRef.current = window.setTimeout(() => setToastMessage(null), 3000);
  };

  // Theme logic
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Fetch initial conversations
  useEffect(() => {
    const fetchConvos = async () => {
      try {
        const data = await getConversations();
        setConversations(data.sort((a, b) => b.id - a.id));
        if (data.length > 0 && !activeConversationId) {
          setActiveConversationId(data[0].id);
        }
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      }
    };
    fetchConvos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateConversation = async (title: string) => {
    if (!title.trim()) return;
    setIsCreating(true);
    try {
      const newConv = await createConversation(title);
      setConversations((prev) => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setIsOpenMobile(false);
      setIsModalOpen(false);
      showToast('Conversation created');
    } catch (error) {
      console.error('Failed to create conversation:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleRenameConversation = async (newName: string) => {
    if (!renameTarget) return;
    try {
      const updated = await renameConversation(renameTarget.id, newName);
      setConversations((prev) =>
        prev.map((c) => (c.id === renameTarget.id ? { ...c, title: updated.title } : c))
      );
      showToast('Conversation renamed');
    } catch (error) {
      console.error('Failed to rename conversation:', error);
    }
    setRenameTarget(null);
  };

  const handleDeleteConversation = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setIsDeleting(true);
    try {
      await deleteConversation(id);
      setConversations((prev) => {
        const remaining = prev.filter((c) => c.id !== id);
        if (activeConversationId === id) {
          setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
        }
        return remaining;
      });
      setDeleteTarget(null);
      showToast('Conversation deleted');
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={setActiveConversationId}
        onNewChatClick={() => setIsModalOpen(true)}
        onRenameClick={(conv) => setRenameTarget(conv)}
        onDeleteConversation={(conv) => setDeleteTarget(conv)}
        isCreating={isCreating}
        theme={theme}
        toggleTheme={toggleTheme}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
      />
      <ChatArea conversationId={activeConversationId} />

      <NewChatModal
        isOpen={isModalOpen}
        isCreating={isCreating}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateConversation}
      />

      <RenameModal
        key={renameTarget?.id ?? 'rename-modal'}
        isOpen={renameTarget !== null}
        currentName={renameTarget?.title || ''}
        onClose={() => setRenameTarget(null)}
        onRename={handleRenameConversation}
      />

      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        conversationTitle={deleteTarget?.title || ''}
        isDeleting={isDeleting}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConversation}
      />
      
      {/* Conversation action toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            left: '50%',
            bottom: '88px',
            transform: 'translateX(-50%)',
            padding: '9px 15px',
            borderRadius: '999px',
            background:
              'linear-gradient(140deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.10) 45%, rgba(255,255,255,0.05) 100%)',
            border: '1px solid rgba(255,255,255,0.24)',
            backdropFilter: 'saturate(230%) blur(32px)',
            WebkitBackdropFilter: 'saturate(230%) blur(32px)',
            boxShadow:
              '0 8px 22px rgba(0,0,0,0.14), inset 0 1px 0 rgba(255,255,255,0.40), inset 0 -1px 0 rgba(255,255,255,0.08)',
            color: 'var(--text-primary)',
            fontSize: '12px',
            fontWeight: 500,
            zIndex: 200,
            pointerEvents: 'none',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Mobile styling specific overrides */}
      <style>
        {`
          @media (max-width: 768px) {
            .mobile-menu-btn {
              display: flex !important;
            }
            .sidebar-container {
              position: absolute !important;
              transform: translateX(-100%);
              transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1) !important;
            }
            .sidebar-container.open {
              transform: translateX(0);
            }
            .sidebar-header {
              padding-top: 52px !important;
            }
          }
        `}
      </style>
    </div>
  );
}

export default App;
