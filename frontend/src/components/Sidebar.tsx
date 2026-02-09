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
        <div className="flex flex-col flex-grow bg-gradient-to-b from-primary-700 to-primary-900 pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="flex items-center">
              {logo ? (
                <img className="h-8 w-auto" src={logo} alt={title} />
              ) : (
                <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center">
                  <span className="text-primary-600 font-bold text-xl">M4A</span>
                </div>
              )}
              <span className="ml-3 text-white text-xl font-bold">{title}</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {items.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-800 text-white shadow-lg'
                      : 'text-primary-100 hover:bg-primary-800 hover:text-white'
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

