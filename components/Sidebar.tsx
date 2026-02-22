import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { PlusIcon, TrashIcon, StarIcon } from './icons';

interface SidebarProps {
  history: HistoryItem[];
  activeSessionId: string | null;
  onNewSession: () => void;
  onLoadSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onUpdateSession?: (id: string, updates: Partial<HistoryItem>) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ history, activeSessionId, onNewSession, onLoadSession, onDeleteSession, onUpdateSession, isOpen, setIsOpen }) => {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  
  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp));
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if(window.confirm('Are you sure you want to delete this session?')) {
      onDeleteSession(id);
    }
  };

  const handleRename = (e: React.MouseEvent, id: string, currentTitle: string) => {
    e.stopPropagation();
    setRenamingId(id);
    setNewTitle(currentTitle);
  };

  const handleSaveRename = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (newTitle.trim() && onUpdateSession) {
      onUpdateSession(id, { title: newTitle.trim() });
      setRenamingId(null);
    }
  };

  const handleToggleStar = (e: React.MouseEvent, id: string, isStarred?: boolean) => {
    e.stopPropagation();
    if (onUpdateSession) {
      onUpdateSession(id, { isStarred: !isStarred });
    }
  };

  return (
    <>
      <aside className={`absolute lg:relative inset-y-0 left-0 z-30 w-72 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col flex transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-4 flex-shrink-0 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">History</h2>
          <button 
            onClick={onNewSession} 
            className="p-2 rounded-md text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200" 
            title="New Session"
            aria-label="Create new session"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto">
          {history.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Your split sessions will appear here.
            </div>
          ) : (
            <nav className="p-2 space-y-1">
              {history.slice().sort((a, b) => (b.isStarred ? 1 : 0) - (a.isStarred ? 1 : 0)).map(item => (
                <div key={item.id}>
                  {renamingId === item.id ? (
                    <div className="flex gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(e as any, item.id);
                          if (e.key === 'Escape') setRenamingId(null);
                        }}
                        className="flex-grow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={(e) => handleSaveRename(e, item.id)}
                        className="px-2 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => onLoadSession(item.id)}
                      className={`sidebar-item w-full text-left group flex items-start justify-between p-3 rounded-lg transition-all duration-200 ${
                        item.id === activeSessionId 
                          ? 'bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800/60 shadow-sm' 
                          : 'hover:bg-gray-200 dark:hover:bg-gray-800/60 border border-transparent hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                      aria-current={item.id === activeSessionId ? 'page' : undefined}
                    >
                      <div className="flex-grow overflow-hidden">
                        <p className={`text-sm font-medium truncate ${item.id === activeSessionId ? 'text-blue-700 dark:text-blue-300' : 'text-gray-800 dark:text-gray-200'}`}>{item.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{formatDate(item.timestamp)}</p>
                      </div>
                      <div className="flex-shrink-0 flex gap-1">
                        <button 
                          onClick={(e) => handleToggleStar(e, item.id, item.isStarred)}
                          className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-yellow-500 dark:text-gray-500 dark:hover:text-yellow-400 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-yellow-500 rounded transition-all duration-200"
                          title={item.isStarred ? 'Unstar' : 'Star'}
                          aria-label={item.isStarred ? `Unstar ${item.title}` : `Star ${item.title}`}
                        >
                          <StarIcon className={`w-4 h-4 ${item.isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                        </button>
                        <button 
                          onClick={(e) => handleRename(e, item.id, item.title)}
                          className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-500 dark:text-gray-500 dark:hover:text-blue-400 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-all duration-200"
                          title="Rename"
                          aria-label={`Rename ${item.title}`}
                        >
                          ✎
                        </button>
                        <button 
                          onClick={(e) => handleDelete(e, item.id)}
                          className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 rounded transition-all duration-200"
                          title="Delete Session"
                          aria-label={`Delete ${item.title}`}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </button>
                  )}
                </div>
              ))}
            </nav>
          )}
        </div>
      </aside>
      {/* Backdrop for mobile */}
      {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/50 z-20 lg:hidden"></div>}
    </>
  );
};

export default Sidebar;
