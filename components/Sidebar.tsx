import React from 'react';
import { HistoryItem } from '../types';
import { PlusIcon, TrashIcon } from './icons';

interface SidebarProps {
  history: HistoryItem[];
  activeSessionId: string | null;
  onNewSession: () => void;
  onLoadSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ history, activeSessionId, onNewSession, onLoadSession, onDeleteSession, isOpen, setIsOpen }) => {
  
  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(timestamp));
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent onLoadSession from firing
    if(window.confirm('Are you sure you want to delete this session?')) {
      onDeleteSession(id);
    }
  };

  return (
    <>
      <aside className={`absolute lg:relative inset-y-0 left-0 z-30 w-72 bg-gray-100 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex-col flex transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-4 flex-shrink-0 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-lg font-semibold">History</h2>
          <button onClick={onNewSession} className="p-2 rounded-md text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700" title="New Session">
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
              {history.map(item => (
                <button 
                  key={item.id}
                  onClick={() => onLoadSession(item.id)}
                  className={`w-full text-left group flex items-start justify-between p-2 rounded-md ${item.id === activeSessionId ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-200 dark:hover:bg-gray-800'}`}
                >
                  <div className="flex-grow overflow-hidden">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(item.timestamp)}</p>
                  </div>
                  <button 
                    onClick={(e) => handleDelete(e, item.id)}
                    className="flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
                    title="Delete Session"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </button>
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
