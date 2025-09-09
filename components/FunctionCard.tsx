
import React from 'react';

interface FunctionCardProps {
  icon: React.ReactNode;
  name: string;
  isActive: boolean;
  onClick: () => void;
}

const FunctionCard: React.FC<FunctionCardProps> = ({ icon, name, isActive, onClick }) => {
  const activeClasses = 'bg-lime-400/20 border-lime-400 text-lime-300';
  const inactiveClasses = 'bg-gray-700/50 border-gray-600 hover:bg-gray-700 hover:border-gray-500 text-gray-300';

  return (
    <div
      onClick={onClick}
      className={`function-card flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-all duration-200 ${isActive ? activeClasses : inactiveClasses}`}
    >
      <div className="icon flex items-center justify-center mb-1.5 opacity-90">
        {icon}
      </div>
      <div className="text-sm font-medium">{name}</div>
    </div>
  );
};

export default FunctionCard;
