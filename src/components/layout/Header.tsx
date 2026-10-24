'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, X, Bell, User, ChevronDown, Home, Tv, Film, Sparkles, ListFilter, Settings, RefreshCw } from 'lucide-react';
import { mockProfiles, type UserProfile } from '@/lib/mock-data';
import { SyncModal } from '@/components/content/SyncModal';
import { cn } from '@/lib/utils';

export function Header() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(mockProfiles[0]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    // Check saved profile
    try {
      const saved = localStorage.getItem('pyflix_profile');
      if (saved) {
        setCurrentProfile(JSON.parse(saved));
      }
    } catch {
      // fallback
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectProfile = (profile: UserProfile) => {
    setCurrentProfile(profile);
    localStorage.setItem('pyflix_profile', JSON.stringify(profile));
    setShowProfileMenu(false);
    window.location.reload();
  };

  const navItems = [
    { href: '/', label: 'Inicio', icon: Home },
    { href: '/?type=series', label: 'Series', icon: Tv },
    { href: '/?type=movie', label: 'Películas', icon: Film },
    { href: '/?filter=new', label: 'Novedades populares', icon: Sparkles },
    { href: '/?filter=my-list', label: 'Mi lista', icon: ListFilter },
  ];

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled ? 'bg-netflix-black/95 backdrop-blur-xl shadow-netflix border-b border-white/5' : 'bg-gradient-to-b from-netflix-black/80 via-netflix-black/40 to-transparent'
        )}
      >
        <nav className="max-w-[1920px] mx-auto px-4 md:px-8 py-3 md:py-4 flex items-center justify-between" role="navigation" aria-label="Navegación principal">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-1 group" aria-label="PyFlix - Inicio">
              <span className="text-2xl md:text-3xl font-extrabold tracking-tighter text-netflix-red uppercase drop-shadow-[0_2px_12px_rgba(229,9,20,0.6)] group-hover:scale-105 transition-transform duration-200">
                PyFlix
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 text-sm font-medium">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-netflix-lightGray hover:text-white transition-colors duration-200 hover:bg-white/5"
                >
                  <Icon className="w-4 h-4 opacity-75" />
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Right Actions: Search, Notifications, Profile */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <div
                className={cn(
                  'flex items-center transition-all duration-300 rounded-full border',
                  searchOpen || searchQuery
                    ? 'w-48 sm:w-64 md:w-72 bg-netflix-dark/90 border-netflix-red/60 px-3 py-1.5 shadow-lg shadow-netflix-red/10'
                    : 'w-9 h-9 border-transparent justify-center cursor-pointer hover:bg-white/10'
                )}
                onClick={() => setSearchOpen(true)}
              >
                <Search className={cn("w-4 h-4 text-netflix-lightGray flex-shrink-0 cursor-pointer hover:text-white transition-colors", searchOpen ? "mr-2" : "")} />
                {(searchOpen || searchQuery) && (
                  <input
                    type="search"
                    placeholder="Títulos, personas, géneros..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onBlur={() => {
                      if (!searchQuery) setSearchOpen(false);
                    }}
                    autoFocus
                    className="w-full bg-transparent text-sm text-white placeholder-netflix-gray focus:outline-none"
                  />
                )}
              </div>
            </form>

            {/* Notifications */}
            <button
              className="p-2 rounded-full text-netflix-lightGray hover:text-white hover:bg-white/10 transition-colors relative"
              aria-label="Notificaciones"
              onClick={() => alert('No tienes nuevas notificaciones.')}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-netflix-red rounded-full ring-2 ring-netflix-black" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-1.5 p-1 rounded-lg hover:ring-2 hover:ring-white/20 transition-all"
                aria-expanded={showProfileMenu}
                aria-haspopup="true"
                aria-label="Menú de perfil"
              >
                <img
                  src={currentProfile.avatar}
                  alt={currentProfile.name}
                  className="w-8 h-8 rounded-md object-cover ring-1 ring-white/20"
                />
                <ChevronDown className={cn("w-3.5 h-3.5 text-netflix-lightGray transition-transform duration-200", showProfileMenu && "rotate-180")} />
              </button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-3 w-64 bg-netflix-card/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl p-2 z-50"
                    role="menu"
                  >
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="text-xs font-semibold text-netflix-gray uppercase tracking-wider">Perfiles</p>
                    </div>

                    <div className="space-y-1">
                      {mockProfiles.map((profile) => (
                        <button
                          key={profile.id}
                          onClick={() => handleSelectProfile(profile)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors",
                            currentProfile.id === profile.id
                              ? "bg-netflix-red/15 text-white font-semibold"
                              : "text-netflix-lightGray hover:text-white hover:bg-white/5"
                          )}
                          role="menuitem"
                        >
                          <img src={profile.avatar} alt="" className="w-8 h-8 rounded-md object-cover" />
                          <div className="flex-1 truncate">
                            <p className="text-sm truncate">{profile.name}</p>
                            {profile.isKids && (
                              <span className="text-[10px] uppercase font-bold text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">Kids</span>
                            )}
                          </div>
                          {currentProfile.id === profile.id && (
                            <span className="w-2 h-2 rounded-full bg-netflix-red" />
                          )}
                        </button>
                      ))}
                    </div>

                    <div className="border-t border-white/10 mt-2 pt-2 space-y-1">
                      <Link
                        href="/profiles"
                        onClick={() => setShowProfileMenu(false)}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-netflix-lightGray hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        role="menuitem"
                      >
                        <User className="w-4 h-4 text-netflix-red" />
                        <span>Administrar perfiles</span>
                      </Link>
                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          alert('Preferencias y configuración de PyFlix');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-netflix-lightGray hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        role="menuitem"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Cuenta y configuración</span>
                      </button>
                      <Link
                        href="/profiles"
                        onClick={() => {
                          localStorage.removeItem('pyflix_profile');
                          setShowProfileMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-netflix-red hover:bg-netflix-red/10 rounded-xl transition-colors"
                        role="menuitem"
                      >
                        <span>Cerrar sesión en PyFlix</span>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden p-2 rounded-xl text-netflix-lightGray hover:text-white hover:bg-white/10 transition-colors"
              aria-label={showMobileMenu ? 'Cerrar menú' : 'Abrir menú'}
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 lg:hidden bg-netflix-black/98 backdrop-blur-2xl flex flex-col p-6"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <span className="text-2xl font-extrabold text-netflix-red tracking-tight">PyFlix</span>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-full text-netflix-lightGray hover:text-white hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 py-6 space-y-2">
              {navItems.map(({ href, label, icon: Icon }) => (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setShowMobileMenu(false)}
                  className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-medium text-netflix-lightGray hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Icon className="w-5 h-5 text-netflix-red" />
                  <span>{label}</span>
                </Link>
              ))}
              <Link
                href="/search"
                onClick={() => setShowMobileMenu(false)}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-medium text-netflix-lightGray hover:text-white hover:bg-white/10 transition-colors"
              >
                <Search className="w-5 h-5 text-netflix-red" />
                <span>Búsqueda avanzada</span>
              </Link>
              <Link
                href="/profiles"
                onClick={() => setShowMobileMenu(false)}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-lg font-medium text-netflix-lightGray hover:text-white hover:bg-white/10 transition-colors"
              >
                <User className="w-5 h-5 text-netflix-red" />
                <span>Gestionar perfiles</span>
              </Link>
            </nav>

            <div className="pt-6 border-t border-white/10">
              <div className="flex items-center gap-3">
                <img src={currentProfile.avatar} alt="" className="w-10 h-10 rounded-md object-cover" />
                <div>
                  <p className="font-semibold text-white">{currentProfile.name}</p>
                  <p className="text-xs text-netflix-gray">{currentProfile.maturityRating}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
