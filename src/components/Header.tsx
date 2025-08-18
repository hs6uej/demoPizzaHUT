import React from 'react';
import { ArrowLeftIcon, XIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
interface HeaderProps {
  title?: string;
  showBackButton?: boolean;
  showCloseButton?: boolean;
}
const Header: React.FC<HeaderProps> = ({
  title,
  showBackButton = false,
  showCloseButton = false
}) => {
  const navigate = useNavigate();
  return <div className="w-full py-4 px-4 flex items-center justify-between border-b">
      <div className="flex items-center">
        {showBackButton && <button onClick={() => navigate(-1)} className="mr-3">
            <ArrowLeftIcon size={20} />
          </button>}
        {title && <h1 className="font-bold text-lg">{title}</h1>}
      </div>
      {showCloseButton && <button onClick={() => navigate('/')}>
          <XIcon size={20} />
        </button>}
    </div>;
};
export default Header;