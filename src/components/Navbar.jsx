import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: 'fa-gauge-high' },
    
    { path: '/products', label: 'Products', icon: 'fa-box' },
    { path: '/suppliers', label: 'Suppliers', icon: 'fa-handshake' },
    { path: '/inventory', label: 'Inventory', icon: 'fa-boxes-stacked' },
    { path: '/orders', label: 'Orders', icon: 'fa-cart-shopping' },
    { path: '/pos', label: 'POS', icon: 'fa-cash-register' },
    // { path: '/reports', label: 'Reports', icon: 'fa-chart-line' },
    // { path: '/history', label: 'History', icon: 'fa-clock-rotate-left' },
    { path: '/settings', label: 'Settings', icon: 'fa-gear' },
   
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const gradientClasses = darkMode
    ? 'from-violet-600 via-indigo-600 to-purple-600'
    : 'from-blue-600 via-indigo-600 to-purple-600';

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 
      ${scrolled ? 'py-2' : 'py-4'}
      ${darkMode ? 'bg-gray-900/95' : 'bg-white/90'} backdrop-blur-md`}>
      <div className="px-4 lg:px-8 max-w-[2000px] mx-auto">
        <div className="flex justify-between items-center">
          {/* Logo Section */}
          <div className="flex items-center">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className={`bg-gradient-to-br ${gradientClasses}
                p-2.5 rounded-xl transform transition-all duration-300 
                group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl
                group-hover:shadow-indigo-500/25`}>
                <i className="fa-solid fa-shirt text-xl text-white"></i>
              </div>
              <span className={`text-xl font-bold bg-gradient-to-r ${gradientClasses}
                bg-clip-text text-transparent transform transition-all duration-300 
                group-hover:tracking-wider group-hover:scale-105`}>
                GarmentsPro
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex ml-12 space-x-1">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                    relative group flex items-center gap-2 ${location.pathname === item.path
                      ? 'text-white'
                      : darkMode
                        ? 'text-gray-400 hover:text-white'
                        : 'text-gray-600 hover:text-indigo-600'
                    }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <i className={`fa-solid ${item.icon} ${location.pathname === item.path ? 'animate-bounce-small' : ''
                      }`}></i>
                    <span className="transform transition-transform group-hover:translate-x-1">
                      {item.label}
                    </span>
                  </span>
                  <div className={`absolute inset-0 h-full w-full transition-all duration-300
                    rounded-lg ${location.pathname === item.path
                      ? `bg-gradient-to-r ${gradientClasses} opacity-100 scale-100`
                      : 'opacity-0 scale-90 group-hover:scale-100 group-hover:opacity-10'
                    }`}
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <i className={`fa-solid ${isMenuOpen ? 'fa-xmark' : 'fa-bars'} text-xl`}></i>
          </button>

          {/* Right Section */}
          <div className="hidden lg:flex items-center gap-6">
            <button className="p-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-800 
              transition-all duration-300 relative group">
              <i className="fa-solid fa-bell text-gray-600 dark:text-gray-400 
                group-hover:text-indigo-600 dark:group-hover:text-indigo-400
                transition-colors text-lg"></i>
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full
                group-hover:animate-ping"></span>
            </button>

            <div className="hidden md:flex items-center gap-5 border-l border-gray-200 
              dark:border-gray-700 pl-6">
              <div className="text-right">
                <p className={`text-sm font-medium ${darkMode ? 'text-gray-200' : 'text-gray-900'
                  }`}>Admin User</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">admin@garmentspro.com</p>
              </div>

              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradientClasses}
                flex items-center justify-center text-white transform transition-all duration-300
                hover:scale-110 hover:shadow-xl hover:shadow-indigo-500/25 cursor-pointer
                hover:rotate-6`}>
                <i className="fa-solid fa-user text-sm"></i>
              </div>

              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800
                  transition-all duration-300 group"
              >
                <i className={`fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'} 
                  text-gray-600 dark:text-gray-400 text-lg
                  group-hover:text-indigo-600 dark:group-hover:text-indigo-400
                  transition-transform group-hover:rotate-12`}></i>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2 pt-4">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium 
                    ${location.pathname === item.path
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  <i className={`fa-solid ${item.icon}`}></i>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
