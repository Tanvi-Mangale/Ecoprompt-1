import { Menu } from 'lucide-react';
import type { Message } from '@/app/App';

interface ChatAreaProps {
  messages: Message[];
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
}

export function ChatArea({ messages, onToggleSidebar, sidebarOpen }: ChatAreaProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {!sidebarOpen && (
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg bg-[#202123] border border-white/10 hover:bg-[#2A2B32] transition-colors"
          >
            <Menu className="w-5 h-5 text-white" />
          </button>
        </div>
      )}

      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h1 className="text-4xl font-semibold text-white mb-8">ChatGPT</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto px-4">
              <div className="bg-[#444654] p-4 rounded-lg">
                <div className="text-white/90 mb-2">💡 Examples</div>
                <div className="text-white/60 text-sm">
                  "Explain quantum computing in simple terms"
                </div>
              </div>
              <div className="bg-[#444654] p-4 rounded-lg">
                <div className="text-white/90 mb-2">⚡ Capabilities</div>
                <div className="text-white/60 text-sm">
                  Remembers what user said earlier in the conversation
                </div>
              </div>
              <div className="bg-[#444654] p-4 rounded-lg">
                <div className="text-white/90 mb-2">⚠️ Limitations</div>
                <div className="text-white/60 text-sm">
                  May occasionally generate incorrect information
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-4 py-8">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`py-8 ${
                message.role === 'assistant' ? 'bg-[#444654]' : ''
              }`}
            >
              <div className="max-w-3xl mx-auto px-4 flex gap-6">
                <div className="flex-shrink-0">
                  <div
                    className={`w-8 h-8 rounded-sm flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-[#5436DA]'
                        : 'bg-[#19C37D]'
                    }`}
                  >
                    <span className="text-white text-sm">
                      {message.role === 'user' ? '👤' : '🤖'}
                    </span>
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="text-white/90 leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
