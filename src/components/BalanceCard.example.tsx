import React from 'react';
import BalanceCard from './BalanceCard';

export const BalanceCardExample: React.FC = () => {
  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      <div className="max-w-md">
        {/* Default state */}
        <h3 className="text-white mb-4 text-lg font-semibold">Default</h3>
        <BalanceCard
          balance={25400.50}
          income={5200}
          expense={1800}
          percentageChange={3.5}
          gregorianDate="December 25, 2025"
          ethiopianDate="ታህሳስ 15, 2017"
        />

        {/* Negative change */}
        <h3 className="text-white mt-8 mb-4 text-lg font-semibold">Negative Change</h3>
        <BalanceCard
          balance={18900.75}
          income={3500}
          expense={2100}
          percentageChange={-2.3}
          gregorianDate="December 25, 2025"
          ethiopianDate="ታህሳስ 15, 2017"
        />

        {/* Loading state */}
        <h3 className="text-white mt-8 mb-4 text-lg font-semibold">Loading</h3>
        <BalanceCard
          balance={0}
          income={0}
          expense={0}
          percentageChange={0}
          isLoading={true}
        />
      </div>
    </div>
  );
};
