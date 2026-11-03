import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface EcoFooterProps {
  onSendMessage: (message: string) => void;
}

export function EcoFooter({ onSendMessage }: EcoFooterProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    await onSendMessage(input);
    setInput('');
    setIsProcessing(false);
  };

  return (
    <div className="bg-white border-t border-gray-200 px-8 py-6">
      <form onSubmit={handleSubmit} className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your code or prompt to optimize..."
              disabled={isProcessing}
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl 
                       focus:outline-none focus:ring-2 focus:ring-[#2ECC71] focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed
                       text-gray-800 placeholder-gray-400 transition-all"
            />
          </div>
          
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className="bg-gradient-to-r from-[#2ECC71] to-[#27AE60] hover:from-[#27AE60] hover:to-[#229954]
                     text-white px-8 py-4 rounded-xl font-semibold
                     disabled:opacity-50 disabled:cursor-not-allowed
                     flex items-center gap-2 transition-all shadow-lg shadow-green-500/30
                     hover:shadow-xl hover:shadow-green-500/40 active:scale-95"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
        
        <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Eco-mode active
          </span>
          <span>•</span>
          <span>Carbon-neutral processing enabled</span>
        </div>
      </form>
    </div>
  );
}
