import { Cloud, Droplets, Zap, Coins } from 'lucide-react';
import { motion } from 'motion/react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { EcoMetrics } from '@/app/App';

interface EcoSidebarProps {
  metrics: EcoMetrics;
  savingsHistory: Array<{ time: string; tokens: number }>;
}

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  color: string;
  delay: number;
}

function MetricCard({ icon, label, value, unit, color, delay }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          {icon}
        </div>
        <div className="flex-1">
          <div className="text-xs text-gray-500 mb-1">{label}</div>
          <div className="flex items-baseline gap-1">
            <motion.span
              key={value}
              initial={{ scale: 1.2, color: '#2ECC71' }}
              animate={{ scale: 1, color: '#1F2937' }}
              transition={{ duration: 0.5 }}
              className="text-2xl font-semibold text-gray-900"
            >
              {value}
            </motion.span>
            <span className="text-sm text-gray-500">{unit}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function EcoSidebar({ metrics, savingsHistory }: EcoSidebarProps) {
  return (
    <div className="w-80 bg-gradient-to-b from-[#E8F5E9] to-[#F1F8E9] p-6 flex flex-col border-r border-green-200 overflow-y-auto">
      {/* Branding */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          EcoPrompt <span className="text-2xl">🌱</span>
        </h1>
        <p className="text-sm text-gray-600 leading-relaxed">
          AI for Sustainability
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="space-y-4 mb-6">
        <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
          Environmental Impact
        </h2>
        
        <MetricCard
          icon={<Cloud className="w-5 h-5 text-green-600" />}
          label="CO₂ Saved"
          value={metrics.co2Saved.toFixed(1)}
          unit="kg"
          color="bg-green-50"
          delay={0}
        />
        
        <MetricCard
          icon={<Droplets className="w-5 h-5 text-blue-600" />}
          label="Water Saved"
          value={metrics.waterSaved.toFixed(0)}
          unit="L"
          color="bg-blue-50"
          delay={0.1}
        />
        
        <MetricCard
          icon={<Zap className="w-5 h-5 text-yellow-600" />}
          label="Electricity Optimized"
          value={metrics.electricityOptimized.toFixed(1)}
          unit="kWh"
          color="bg-yellow-50"
          delay={0.2}
        />
        
        <MetricCard
          icon={<Coins className="w-5 h-5 text-purple-600" />}
          label="Tokens Saved"
          value={metrics.tokensSaved.toLocaleString()}
          unit=""
          color="bg-purple-50"
          delay={0.3}
        />
      </div>

      {/* Savings Graph */}
      {savingsHistory.length > 1 && (
        <div className="mb-6">
          <h2 className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-3">
            Savings Over Time
          </h2>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={savingsHistory}>
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10, fill: '#6B7280' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  tick={{ fontSize: 10, fill: '#6B7280' }}
                  tickLine={false}
                  axisLine={false}
                  width={40}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="tokens" 
                  stroke="#2ECC71" 
                  strokeWidth={2}
                  dot={{ fill: '#2ECC71', r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Footer Badge */}
      <div className="mt-auto pt-6 border-t border-green-200">
        <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg p-3 text-center">
          <div className="text-xs font-semibold">🌍 Eco-Certified AI</div>
          <div className="text-[10px] opacity-90 mt-1">Carbon-Neutral Processing</div>
        </div>
      </div>
    </div>
  );
}