import Navbar from '../components/Navbar';

const MainLayout = ({ children }) => {
  return (
    <div className="app-background min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16 sm:pt-20 pb-safe-bottom">
        <div className="mobile-container max-w-[2000px] mx-auto">
          {children}
        </div>
      </main>
      
      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 pb-safe-bottom">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {/* Add your mobile navigation items here */}
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
