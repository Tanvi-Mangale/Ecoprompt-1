import { motion } from 'motion/react';
import { FileText, Code, Leaf, Check } from 'lucide-react';
import type { ProgressStep } from '@/app/App';

interface EcoProgressBarProps {
  step: ProgressStep;
}

interface StepIndicatorProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isComplete: boolean;
}

function StepIndicator({ icon, label, isActive, isComplete }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center flex-1">
      <motion.div
        animate={{
          scale: isActive ? 1.1 : 1,
          backgroundColor: isComplete ? '#2ECC71' : isActive ? '#3498DB' : '#E5E7EB',
        }}
        transition={{ duration: 0.3 }}
        className="w-12 h-12 rounded-full flex items-center justify-center mb-2 relative"
      >
        {isComplete ? (
          <Check className="w-6 h-6 text-white" />
        ) : (
          <div className={isActive ? 'text-white' : 'text-gray-400'}>
            {icon}
          </div>
        )}
        
        {isActive && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-[#3498DB]"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}
      </motion.div>
      
      <span
        className={`text-xs font-medium text-center ${
          isActive ? 'text-[#3498DB]' : isComplete ? 'text-[#2ECC71]' : 'text-gray-400'
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export function EcoProgressBar({ step }: EcoProgressBarProps) {
  const getProgress = () => {
    switch (step) {
      case 'optimizing':
        return 33;
      case 'generating':
        return 66;
      case 'calculating':
      case 'complete':
        return 100;
      default:
        return 0;
    }
  };

  const progress = getProgress();

  if (step === 'idle') {
    return null;
  }

  return (
    <div className="bg-white border-b border-gray-200 px-8 py-6">
      <div className="max-w-5xl mx-auto">
        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-100 rounded-full mb-8 overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#2ECC71] to-[#3498DB] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
          
          {/* Animated shimmer effect */}
          {progress > 0 && progress < 100 && (
            <motion.div
              className="absolute inset-y-0 w-20 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              animate={{ x: ['-100%', '400%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          )}
        </div>

        {/* Step Indicators */}
        <div className="flex items-start justify-between gap-4">
          <StepIndicator
            icon={<FileText className="w-6 h-6" />}
            label="Optimizing prompt"
            isActive={step === 'optimizing'}
            isComplete={['generating', 'calculating', 'complete'].includes(step)}
          />
          
          <div className="flex-1 h-[1px] bg-gray-200 mt-6" />
          
          <StepIndicator
            icon={<Code className="w-6 h-6" />}
            label="Generating code"
            isActive={step === 'generating'}
            isComplete={['calculating', 'complete'].includes(step)}
          />
          
          <div className="flex-1 h-[1px] bg-gray-200 mt-6" />
          
          <StepIndicator
            icon={<Leaf className="w-6 h-6" />}
            label="Calculating eco impact"
            isActive={step === 'calculating'}
            isComplete={step === 'complete'}
          />
        </div>
      </div>
    </div>
  );
}
