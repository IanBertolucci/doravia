import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, Settings, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header({ title, subtitle }) {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md" style={{backgroundColor: 'color-mix(in srgb, var(--bg-card) 80%, transparent)', borderBottom: '1px solid var(--border)'}}>
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="min-w-0">
          <Link to="/" className="text-lg font-bold tracking-tight" style={{color: 'var(--text-primary)'}}>
            {title || 'DoraVia'}
          </Link>
          {subtitle && (
            <p className="text-[11px] text-secondary truncate mt-0.5">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm hidden sm:inline" style={{color: 'var(--text-secondary)'}}>{user?.username}</span>
          <button onClick={toggle} className="p-2 transition" style={{color: 'var(--text-secondary)'}} title={theme === 'dark' ? 'Tema claro' : 'Tema escuro'}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link to="/admin" className="p-2 transition" style={{color: 'var(--text-secondary)'}}>
            <Settings size={18} />
          </Link>
          <button onClick={logout} className="p-2 transition" style={{color: 'var(--text-secondary)'}}>
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
