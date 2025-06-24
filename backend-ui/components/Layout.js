import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  Home, 
  Users, 
  FileText, 
  MessageSquare, 
  Database 
} from 'lucide-react';

const Layout = ({ children }) => {
  const router = useRouter();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Files', href: '/files', icon: FileText },
    { name: 'Chat Sessions', href: '/chat-sessions', icon: MessageSquare },
    { name: 'Chat Messages', href: '/chat-messages', icon: Database },
  ];

  return (
    <div className="layout">
      <div className="sidebar">
        <h1>SimpleRAG Admin</h1>
        <nav>
          <ul className="nav-menu">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              
              return (
                <li key={item.name} className="nav-item">
                  <Link 
                    href={item.href} 
                    className={`nav-link ${isActive ? 'active' : ''}`}
                  >
                    <Icon className="nav-icon" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;