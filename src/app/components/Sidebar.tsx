import { Plus, MessageSquare, Trash2 } from 'lucide-react';
import type { Chat } from '@/app/App';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isOpen,
}: SidebarProps) {
  if (!isOpen) return null;

  return (
    <div className="w-[260px] bg-[#202123] flex flex-col border-r border-white/10">
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="flex items-center gap-3 w-full px-3 py-3 rounded-lg border border-white/20 hover:bg-white/10 transition-colors text-white"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm">New chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="space-y-1">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`group relative flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${
                activeChatId === chat.id
                  ? 'bg-[#343541]'
                  : 'hover:bg-[#2A2B32]'
              }`}
              onClick={() => onSelectChat(chat.id)}
            >
              <MessageSquare className="w-4 h-4 text-white/70 flex-shrink-0" />
              <span className="text-sm text-white/90 truncate flex-1">
                {chat.title}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-opacity"
              >
                <Trash2 className="w-4 h-4 text-white/70" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
