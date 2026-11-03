import { motion } from 'motion/react';
import { User, Leaf, Copy, Check, Cloud, Droplets, Zap, Coins, ImageIcon, FileText, Mic } from 'lucide-react';
import { useState } from 'react';
import type { Message, ProgressStep, MessageMetrics } from '@/app/App';
import { EcoProgressBar } from '@/app/components/EcoProgressBar';

interface EcoChatAreaProps {
  messages: Message[];
  progressStep: ProgressStep;
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-3 rounded-lg overflow-hidden border border-gray-700">
      <div className="bg-[#1E1E1E] px-4 py-2 flex items-center justify-between">
        <span className="text-xs text-gray-400 font-['Fira_Code']">JavaScript</span>
        <button
          onClick={handleCopy}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-700"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <div className="bg-[#1E1E1E] p-4 overflow-x-auto">
        <pre className="text-sm font-['Fira_Code'] leading-relaxed">
          <code className="text-gray-100">
            {code.split('\n').map((line, i) => (
              <div key={i}>
                {line.split(/(\/\/.*|function|return|const|let|if|for|\(|\)|{|}|=>)/g).map((token, j) => {
                  if (token.startsWith('//')) {
                    return <span key={j} className="text-green-400">{token}</span>;
                  } else if (['function', 'return', 'const', 'let', 'if', 'for'].includes(token)) {
                    return <span key={j} className="text-[#C586C0]">{token}</span>;
                  } else if (['(', ')', '{', '}', '=>'].includes(token)) {
                    return <span key={j} className="text-[#FFD700]">{token}</span>;
                  }
                  return <span key={j}>{token}</span>;
                })}
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}

function ImagePlaceholder() {
  return (
    <div className="mt-3 rounded-lg overflow-hidden border-2 border-dashed border-green-300 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="aspect-video flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="w-16 h-16 text-green-500 mx-auto mb-3" />
          <p className="text-sm text-gray-600 font-medium">Optimized Image Output</p>
          <p className="text-xs text-gray-500 mt-1">Image generation placeholder</p>
        </div>
      </div>
    </div>
  );
}

function EssayOutput({ content }: { content: string }) {
  return (
    <div className="mt-3 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-3 text-gray-600">
        <FileText className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">Essay Output</span>
      </div>
      <div className="prose prose-sm max-w-none">
        {content.split('\n\n').map((paragraph, i) => (
          <p key={i} className="text-gray-800 leading-relaxed mb-3 last:mb-0">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}

function SpeechOutput({ content }: { content: string }) {
  return (
    <div className="mt-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
      <div className="flex items-center gap-2 mb-3 text-purple-600">
        <Mic className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">Speech Transcript</span>
      </div>
      <div className="space-y-3">
        <div className="bg-white rounded-lg p-3 border border-purple-100">
          <div className="text-xs text-purple-600 font-semibold mb-2">SPEAKER</div>
          <p className="text-gray-800 leading-relaxed italic">
            "{content}"
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          Optimized for clarity and conciseness
        </div>
      </div>
    </div>
  );
}

function InlineMetrics({ metrics }: { metrics: MessageMetrics }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="mt-4 pt-4 border-t border-gray-200"
    >
      <div className="flex items-center gap-2 mb-2">
        <Leaf className="w-4 h-4 text-green-600" />
        <span className="text-xs font-semibold text-gray-700">Eco Impact for this optimization:</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 bg-green-50 rounded-lg px-3 py-2">
          <Cloud className="w-4 h-4 text-green-600" />
          <div>
            <div className="text-xs text-gray-500">CO₂ Saved</div>
            <motion.div
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-sm font-semibold text-gray-900"
            >
              {metrics.co2Saved.toFixed(3)} kg
            </motion.div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-blue-50 rounded-lg px-3 py-2">
          <Droplets className="w-4 h-4 text-blue-600" />
          <div>
            <div className="text-xs text-gray-500">Water Saved</div>
            <motion.div
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-sm font-semibold text-gray-900"
            >
              {metrics.waterSaved.toFixed(1)} L
            </motion.div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-yellow-50 rounded-lg px-3 py-2">
          <Zap className="w-4 h-4 text-yellow-600" />
          <div>
            <div className="text-xs text-gray-500">Electricity</div>
            <motion.div
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-sm font-semibold text-gray-900"
            >
              {metrics.electricityOptimized.toFixed(4)} kWh
            </motion.div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-purple-50 rounded-lg px-3 py-2">
          <Coins className="w-4 h-4 text-purple-600" />
          <div>
            <div className="text-xs text-gray-500">Tokens Saved</div>
            <motion.div
              initial={{ scale: 1.3 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
              className="text-sm font-semibold text-gray-900"
            >
              {metrics.tokensSaved}
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-end mb-6"
    >
      <div className="flex items-start gap-3 max-w-2xl">
        <div className="bg-white border-2 border-[#2ECC71] rounded-2xl px-4 py-3 shadow-sm">
          <p className="text-gray-800 leading-relaxed">{content}</p>
        </div>
        <div className="bg-[#2ECC71] rounded-full p-2 flex-shrink-0">
          <User className="w-5 h-5 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

function AssistantMessage({ message }: { message: Message }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-start mb-6"
    >
      <div className="flex items-start gap-3 max-w-4xl">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-full p-2 flex-shrink-0">
          <Leaf className="w-5 h-5 text-white" />
        </div>
        <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 flex-1">
          {/* Optimized Prompt */}
          {message.optimizedPrompt && (
            <div className="mb-4 pb-4 border-b border-gray-100">
              <div className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
                ✨ Optimized Prompt
              </div>
              <p className="text-sm text-gray-700 italic bg-green-50 rounded-lg px-3 py-2">
                "{message.optimizedPrompt}"
              </p>
            </div>
          )}
          
          {/* Output Section */}
          {message.output && (
            <div className="mb-4">
              <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">
                📄 Output
              </div>
              {message.outputType === 'code' && <CodeBlock code={message.output} />}
              {message.outputType === 'image' && <ImagePlaceholder />}
              {message.outputType === 'essay' && <EssayOutput content={message.output} />}
              {message.outputType === 'speech' && <SpeechOutput content={message.output} />}
            </div>
          )}
          
          {/* Explanation */}
          {message.explanation && (
            <div className="mb-4">
              <div className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">
                💡 Optimization Explanation
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {message.explanation}
              </p>
            </div>
          )}
          
          {/* Legacy content support */}
          {!message.optimizedPrompt && message.content && (
            <p className="text-gray-800 leading-relaxed mb-4">{message.content}</p>
          )}
          
          {/* Inline Metrics */}
          {message.metrics && <InlineMetrics metrics={message.metrics} />}
        </div>
      </div>
    </motion.div>
  );
}

export function EcoChatArea({ messages, progressStep }: EcoChatAreaProps) {
  return (
    <div className="flex-1 flex flex-col bg-white">
      <EcoProgressBar step={progressStep} />
      
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-2xl">
              <div className="text-6xl mb-4">🌍</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                Welcome to EcoPrompt
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Your AI assistant for sustainable, efficient prompt optimization.
                Every prompt is optimized for minimal environmental impact.
              </p>
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                  <div className="text-3xl mb-2">💻</div>
                  <div className="text-xs font-semibold text-green-800">Code Optimization</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                  <div className="text-3xl mb-2">🖼️</div>
                  <div className="text-xs font-semibold text-blue-800">Image Prompts</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                  <div className="text-3xl mb-2">📝</div>
                  <div className="text-xs font-semibold text-purple-800">Essay Generation</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            {messages.map((message) => (
              message.role === 'user' ? (
                <UserMessage key={message.id} content={message.content} />
              ) : (
                <AssistantMessage key={message.id} message={message} />
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}