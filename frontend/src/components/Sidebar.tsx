import { NavLink } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface SidebarItem {
  name: string;
  path: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: SidebarItem[];
  logo?: string;
  title?: string;
}

const Sidebar = ({ items, logo, title = 'Meals4All' }: SidebarProps) => {
  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col flex-grow glass-sidebar pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-5 mb-8">
            <div className="flex items-center">
              {logo ? (
                <img className="h-8 w-auto" src={logo} alt={title} />
              ) : (
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">M</span>
                </div>
              )}
              <span className="ml-3 text-white text-xl font-semibold tracking-tight">{title}</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-2 flex-1 px-3 space-y-1">
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
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
      </div>
    </div>
  );
};

export default Sidebar;
