import { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="border-t border-white/10 bg-[#343541] p-4">
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
        <div className="relative flex items-center bg-[#40414F] rounded-lg shadow-lg">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Send a message..."
            className="flex-1 bg-transparent text-white placeholder-white/50 px-4 py-3 outline-none resize-none max-h-[200px]"
            rows={1}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="absolute right-2 p-2 rounded-lg bg-transparent hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5 text-white/70" />
          </button>
        </div>
        <div className="text-center text-xs text-white/40 mt-3">
          ChatGPT can make mistakes. Check important info.
        </div>
      </form>
    </div>
  );
}
