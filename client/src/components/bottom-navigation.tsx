import { Link, useLocation } from 'wouter';
import { Home, TrendingUp, ClipboardList, User } from 'lucide-react';

export function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/analytics', icon: TrendingUp, label: 'Analytics' },
    { path: '/plans', icon: ClipboardList, label: 'Plans' },
    { path: '/profile', icon: User, label: 'Profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = location === item.path;
            const Icon = item.icon;
            
            return (
              <Link key={item.path} href={item.path}>
                <button className={`flex flex-col items-center space-y-1 py-2 px-4 ${
                  isActive ? 'text-primary' : 'text-gray-400'
                }`}>
                  <Icon className="w-5 h-5" />
                  <span className="text-xs">{item.label}</span>
                </button>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
