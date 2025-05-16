import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, UserCircle, Info } from 'lucide-react';

type SidebarProps = {
  onNavigate?: () => void;
};

function Sidebar({ onNavigate }: SidebarProps) {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleClick = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div className="flex flex-col w-64 border-r border-gray-200 pt-5 pb-4 bg-white h-full">
      <div className="flex items-center flex-shrink-0 px-6">
        <h1 className="text-xl font-semibold text-primary-600">BP TimeSheet</h1>
      </div>
      
      <div className="mt-6 h-0 flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-3 space-y-1">
          <Link 
            to="/dashboard" 
            onClick={handleClick}
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/dashboard') 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Home className={`mr-3 h-5 w-5 ${
              isActive('/dashboard') ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
            }`} />
            Dashboard
          </Link>
          
          <Link 
            to="/aggiungi-turno"
            onClick={handleClick}
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/aggiungi-turno') 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <PlusCircle className={`mr-3 h-5 w-5 ${
              isActive('/aggiungi-turno') ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
            }`} />
            Aggiungi Turno
          </Link>
          
          <Link 
            to="/profilo"
            onClick={handleClick}
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/profilo') 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <UserCircle className={`mr-3 h-5 w-5 ${
              isActive('/profilo') ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
            }`} />
            Profilo
          </Link>

          <Link 
            to="/credits"
            onClick={handleClick}
            className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/credits') 
                ? 'bg-primary-100 text-primary-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <Info className={`mr-3 h-5 w-5 ${
              isActive('/credits') ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-500'
            }`} />
            Credits
          </Link>
        </nav>
      </div>
      
      <div className="px-3 mt-6">
        <Link 
          to="/aggiungi-turno"
          onClick={handleClick}
          className="btn-primary w-full flex items-center justify-center"
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Nuovo Turno
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;