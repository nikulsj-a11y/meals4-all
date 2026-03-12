import { NavLink } from 'react-router-dom';
import { LucideIcon, X, UtensilsCrossed } from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: SidebarItem[];
  logo?: string;
  title?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar = ({ items, title = 'Meals4All', isOpen = false, onClose }: SidebarProps) => {
  const sidebarContent = (
    <div className="flex flex-col flex-grow glass-sidebar pt-5 pb-4 overflow-y-auto h-full">
      {/* Logo */}
      <div className="flex items-center justify-between flex-shrink-0 px-5 mb-8">
        <div className="flex items-center">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg">
            <UtensilsCrossed className="w-4.5 h-4.5 text-white" />
          </div>
          <span className="ml-3 text-white text-lg font-semibold tracking-tight">{title}</span>
        </div>
        {/* Close button - mobile only */}
        {onClose && (
          <button onClick={onClose} className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-2 flex-1 px-3 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) =>
              `group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-white/15 text-white shadow-lg backdrop-blur-sm'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <item.icon
              className="mr-3 flex-shrink-0 h-5 w-5"
              aria-hidden="true"
            />
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          {sidebarContent}
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 w-72 z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
