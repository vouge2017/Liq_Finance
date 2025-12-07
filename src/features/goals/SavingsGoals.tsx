import React, { useRef, useState, useEffect } from 'react';
import { Icons } from '@/shared/components/Icons';
import { useAppContext } from '@/context/AppContext';
import { HorizontalScroll } from '@/shared/components/HorizontalScroll';
import { EmptyState } from '@/shared/components/EmptyState';

export const SavingsGoals: React.FC = () => {
  const { state, isPrivacyMode, setActiveTab, navigateTo } = useAppContext();
  const { savingsGoals } = state;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-Scroll Logic
  useEffect(() => {
    if (savingsGoals.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      // Find the scroll container within HorizontalScroll wrapper if possible, 
      // but here we might rely on manual scroll or just visual indicators.
      // For simplicity, let's keep the manual navigation indicators and remove auto-scroll interference
      // if user is interacting.
      // Actually, HorizontalScroll manages its own ref. We can pass a ref to it if needed, 
      // but standard horizontal scroll is fine. 
      // Let's rely on HorizontalScroll for arrows and keep dot logic separate if we can track scroll.
    }, 4000);

    return () => clearInterval(interval);
  }, [activeIndex, isPaused, savingsGoals.length]);

  return (
    <div className="mb-6">
      <div
        className="flex justify-between items-center mb-4 px-1 cursor-pointer group"
        onClick={() => setActiveTab('goals')}
      >
        <div>
          <h3 className="text-theme-primary text-lg font-bold group-hover:text-cyan-400 transition-colors">Savings Goals</h3>
          <p className="text-theme-secondary text-xs ethiopic">የቁጠባ ግቦች</p>
        </div>
        <button className="text-cyan-400 text-sm font-medium flex items-center gap-1 hover:text-cyan-300">
          See All <Icons.ChevronRight size={14} />
        </button>
      </div>

      {/* Carousel Container */}
      {savingsGoals.length > 0 ? (
        <HorizontalScroll className="flex gap-4 pb-2 snap-x snap-mandatory">
          {savingsGoals.map((goal) => {
            const progress = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
            const isCyan = goal.color === 'cyan';
            const isPink = goal.color === 'pink';
            const isYellow = goal.color === 'yellow';

            return (
              <div
                key={goal.id}
                onClick={() => navigateTo('goals', 'goal', goal.id)}
                className="min-w-[180px] bg-theme-card rounded-3xl p-5 border border-theme flex flex-col justify-between h-40 transition-colors duration-300 shadow-md snap-center cursor-pointer hover:border-cyan-500/50"
              >
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 rounded-full bg-gray-700/30 flex items-center justify-center">
                    {goal.icon === 'car' && <Icons.Car className="text-gray-400" size={20} />}
                    {goal.icon === 'emergency' && <Icons.Emergency className="text-gray-400" size={20} />}
                    {goal.icon === 'house' && <Icons.Wallet className="text-gray-400" size={20} />}
                    {/* Fallback for other icons if added dynamically */}
                    {goal.icon !== 'car' && goal.icon !== 'emergency' && goal.icon !== 'house' && <Icons.Goals className="text-gray-400" size={20} />}
                  </div>
                  <span className={`text-sm font-bold ${isCyan ? 'text-cyan-400' : isPink ? 'text-pink-500' : 'text-yellow-400'}`}>
                    {Math.round(progress)}%
                  </span>
                </div>

                <div>
                  <p className="text-theme-primary font-medium mb-1">{goal.title}</p>
                  <p className="text-theme-secondary text-xs mb-3">
                    {isPrivacyMode ? '•••' : (goal.currentAmount >= 1000 ? `${(goal.currentAmount / 1000).toFixed(0)}k` : goal.currentAmount)} /
                    {isPrivacyMode ? ' •••' : (goal.targetAmount >= 1000000 ? ` ${(goal.targetAmount / 1000000).toFixed(0)}M` : ` ${(goal.targetAmount / 1000).toFixed(0)}k`)}
                  </p>

                  <div className="w-full h-2 bg-gray-700/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isCyan ? 'bg-cyan-400' : isPink ? 'bg-pink-500' : 'bg-yellow-400'}`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {/* Placeholder for 'Add Goal' or 'View All' at end of scroll */}
          <div
            onClick={() => setActiveTab('goals')}
            className="min-w-[60px] flex items-center justify-center bg-theme-main rounded-3xl border border-dashed border-theme cursor-pointer hover:bg-theme-card snap-center"
          >
            <Icons.ChevronRight className="text-theme-secondary" />
          </div>
        </HorizontalScroll>
      ) : (
        <EmptyState
          icon={<Icons.Goals size={24} />}
          title="No Active Goals"
          description="Set a savings goal to track your progress."
          action={{
            label: "Create Goal",
            onClick: () => setActiveTab('goals'),
            icon: <Icons.Plus size={16} />
          }}
          className="py-6"
        />
      )}
    </div>
  );
};
