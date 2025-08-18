import React from 'react';
interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  color?: 'red' | 'green';
}
const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  onClick,
  className = '',
  color = 'red'
}) => {
  const baseClasses = 'w-full py-3 px-4 rounded-md font-medium text-white text-center';
  const colorClasses = color === 'red' ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700';
  return <button onClick={onClick} className={`${baseClasses} ${colorClasses} ${className}`}>
      {children}
    </button>;
};
export default PrimaryButton;