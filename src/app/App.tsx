import { useState } from 'react';
import { EcoSidebar } from '@/app/components/EcoSidebar';
import { EcoChatArea } from '@/app/components/EcoChatArea';
import { EcoFooter } from '@/app/components/EcoFooter';
import { optimizePrompt } from '@/app/utils/promptOptimizer';

export interface EcoMetrics {
  co2Saved: number;
  waterSaved: number;
  electricityOptimized: number;
  tokensSaved: number;
}

export interface MessageMetrics {
  tokensSaved: number;
  co2Saved: number;
  waterSaved: number;
  electricityOptimized: number;
}

export type OutputType = 'code' | 'image' | 'essay' | 'speech';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  optimizedPrompt?: string;
  output?: string;
  outputType?: OutputType;
  explanation?: string;
  metrics?: MessageMetrics;
}

export type ProgressStep = 'idle' | 'optimizing' | 'generating' | 'calculating' | 'complete';

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);

  const [metrics, setMetrics] = useState<EcoMetrics>({
    co2Saved: 0,
    waterSaved: 0,
    electricityOptimized: 0,
    tokensSaved: 0,
  });

  const [savingsHistory, setSavingsHistory] = useState<Array<{ time: string; tokens: number }>>([
    { time: '0', tokens: 0 },
  ]);

  const [progressStep, setProgressStep] = useState<ProgressStep>('idle');

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    };
    setMessages(prev => [...prev, userMessage]);

    setProgressStep('optimizing');

    // Stagger the progress indicators while the real async work happens
    const t1 = setTimeout(() => setProgressStep('generating'), 1500);
    const t2 = setTimeout(() => setProgressStep('calculating'), 3000);

    try {
      const optimization = await optimizePrompt(content);

      clearTimeout(t1);
      clearTimeout(t2);
      setProgressStep('complete');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        optimizedPrompt: optimization.optimizedPrompt,
        output: optimization.output,
        outputType: optimization.outputType,
        explanation: optimization.explanation,
        metrics: optimization.metrics,
      };
      setMessages(prev => [...prev, assistantMessage]);

      setMetrics(prev => ({
        co2Saved: prev.co2Saved + optimization.metrics.co2Saved,
        waterSaved: prev.waterSaved + optimization.metrics.waterSaved,
        electricityOptimized: prev.electricityOptimized + optimization.metrics.electricityOptimized,
        tokensSaved: prev.tokensSaved + optimization.metrics.tokensSaved,
      }));

      setSavingsHistory(prev => {
        const newHistory = [
          ...prev,
          {
            time: prev.length.toString(),
            tokens: (prev[prev.length - 1]?.tokens || 0) + optimization.metrics.tokensSaved,
          },
        ];
        return newHistory.slice(-10);
      });

    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);

      // Show the real error so it's easy to diagnose
      const message = err instanceof Error ? err.message : String(err);
      console.error('[EcoPrompt] API call failed:', message);

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `⚠️ Error: ${message}`,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setTimeout(() => setProgressStep('idle'), 500);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] font-['Inter']">
      <EcoSidebar metrics={metrics} savingsHistory={savingsHistory} />
      <div className="flex-1 flex flex-col">
        <EcoChatArea messages={messages} progressStep={progressStep} />
        <EcoFooter onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}