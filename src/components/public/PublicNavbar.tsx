import React, { useState } from 'react';
import {
  GraduationCap,
  Menu,
  X,
  Sun,
  Moon,
  LogIn,
  LayoutDashboard,
  Phone,
  Mail,
  ShieldCheck,
  Search,
  ChevronDown,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../lib/auth/AuthContext';
import { useTheme } from '../../lib/theme/ThemeContext';
import { SiteSetting, ActiveNav, NavigationMenu } from '../../types';
import { cmsStore } from '../../lib/db';
import { Button } from '../ui/Button';

interface PublicNavbarProps {
  settings: SiteSetting;
  currentNav: ActiveNav;
  onNavigate: (nav: ActiveNav, slugOrQuery?: string) => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  settings,
  currentNav,
  onNavigate,
}) => {
  const { user, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Dynamic tree from store
  const menuTree = cmsStore.getMenuTree();

  const handleNavClick = (url: string, target?: string) => {
    setOpenDropdownId(null);
    setMobileMenuOpen(false);

    if (target === '_blank' || url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    // Map URL to ActiveNav
    if (url === '/' || url === '') {
      onNavigate('home');
    } else if (url === '/tentang' || url === '/visi-misi-tujuan' || url === '/fasilitas-kampus') {
      onNavigate('about');
    } else if (url === '/berita') {
      onNavigate('news');
    } else if (url === '/artikel') {
      onNavigate('articles');
    } else if (url === '/pengumuman') {
      onNavigate('announcements');
    } else if (url === '/agenda') {
      onNavigate('agenda');
    } else if (url === '/galeri') {
      onNavigate('gallery');
    } else if (url === '/kontak') {
      onNavigate('contact');
    } else if (url.startsWith('/search')) {
      onNavigate('search');
    } else {
      onNavigate('home');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('search', searchQuery.trim());
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      {/* Top Bar Informasi Resmi */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span>{settings.phone}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400" />
              <span>{settings.email}</span>
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center gap-1 bg-blue-900/80 text-blue-200 px-2 py-0.5 rounded text-[11px] font-medium border border-blue-700/50">
              <ShieldCheck className="w-3 h-3 text-blue-400" />
              {settings.accreditation || 'Akreditasi Unggul (A)'}
            </span>
            {settings.npsn && <span>NPSN: {settings.npsn}</span>}
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo Brand */}
          <div
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
                {settings.siteName}
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 max-w-[260px] sm:max-w-md">
                {settings.tagline}
              </p>
            </div>
          </div>

          {/* Desktop Dynamic Menus with Dropdowns */}
          <nav className="hidden lg:flex items-center space-x-1">
            {menuTree.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isDropdownOpen = openDropdownId === item.id;

              if (hasChildren) {
                return (
                  <div
                    key={item.id}
                    className="relative"
                    onMouseEnter={() => setOpenDropdownId(item.id)}
                    onMouseLeave={() => setOpenDropdownId(null)}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenDropdownId(isDropdownOpen ? null : item.id)}
                      className="px-3 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
                    >
                      <span>{item.label}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                      <div className="absolute left-0 mt-1 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50 animate-in fade-in">
                        {item.children!.map((sub) => (
                          <button
                            key={sub.id}
                            type="button"
                            onClick={() => handleNavClick(sub.url, sub.target)}
                            className="w-full text-left px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 flex items-center justify-between transition-colors"
                          >
                            <span>{sub.label}</span>
                            {sub.target === '_blank' && (
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.url, item.target)}
                  className="px-3 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
                >
                  <span>{item.label}</span>
                  {item.target === '_blank' && (
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Icons & Search */}
          <div className="hidden sm:flex items-center space-x-3">
            {/* Quick Search */}
            <form onSubmit={handleSearchSubmit} className="relative w-44 lg:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Cari portal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-100 dark:bg-slate-800 text-xs rounded-xl pl-8 pr-3 py-1.5 text-slate-800 dark:text-slate-100 placeholder-slate-400 border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>

            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              aria-label="Ganti mode tema gelap/terang"
              className="rounded-full w-9 h-9"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </Button>

            {isAuthenticated && user ? (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigate('admin-dashboard')}
                className="gap-2 shadow-sm font-bold"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Panel CMS</span>
                <span className="text-[10px] bg-blue-800 px-1.5 py-0.5 rounded text-blue-100 font-semibold">
                  {user.role}
                </span>
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onNavigate('login')}
                className="gap-2 shadow-sm font-bold"
              >
                <LogIn className="w-4 h-4" />
                <span>Portal CMS</span>
              </Button>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex sm:hidden items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Ganti tema"
              className="rounded-full w-9 h-9"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Buka navigasi menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-3">
          {/* Mobile Search */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari warta, agenda, artikel..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-800 dark:text-slate-100"
            />
          </form>

          <div className="space-y-1">
            {menuTree.map((item) => (
              <div key={item.id} className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleNavClick(item.url, item.target)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-between"
                >
                  <span>{item.label}</span>
                  {item.target === '_blank' && <ExternalLink className="w-3 h-3 text-slate-400" />}
                </button>
                {item.children && (
                  <div className="pl-4 space-y-1 border-l-2 border-slate-200 dark:border-slate-800 ml-2">
                    {item.children.map((sub) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => handleNavClick(sub.url, sub.target)}
                        className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600"
                      >
                        {sub.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            {isAuthenticated ? (
              <Button
                variant="primary"
                className="w-full justify-center text-xs font-bold"
                onClick={() => {
                  onNavigate('admin-dashboard');
                  setMobileMenuOpen(false);
                }}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Buka Panel CMS ({user?.role})
              </Button>
            ) : (
              <Button
                variant="primary"
                className="w-full justify-center text-xs font-bold"
                onClick={() => {
                  onNavigate('login');
                  setMobileMenuOpen(false);
                }}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Masuk Portal CMS
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
