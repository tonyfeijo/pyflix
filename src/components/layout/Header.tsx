'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Bell, 
  ChevronDown, 
  Home, 
  Tv, 
  Film, 
  Sparkles, 
  ListFilter 
} from 'lucide-react';
import { mockProfiles, type UserProfile } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export function Header() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentProfile, setCurrentProfile] = useState<UserProfile>(mockProfiles[0]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    try {
      const saved = localStorage.getItem('pyflix_profile');
      if (saved) {
        setCurrentProfile(JSON.parse(saved));
      }
    } catch {
      // Fallback si falla localStorage
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
          'fixed top-0 z-40 w-full transition-colors duration-300 px-4 md:px-8 py-3 flex items-center justify-between',
          scrolled ? 'bg-zinc-950/95 backdrop-blur-md shadow-lg' : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent'
        )}
      >
        {/* LOGO Y NAVEGACIÓN PRINCIPAL */}
        <div className="flex items-center gap-8">
          <Link href="/" className="text-red-600 font-extrabold text-2xl md:text-3xl tracking-wider hover:scale-105 transition-transform">
            PYFLIX
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-zinc-300">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* CONTROLES DERECHA */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* BUSCADOR */}
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>

            {searchOpen && (
              <input
                type="text"
                placeholder="Títulos, personas, géneros..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ml-2 px-3 py-1 bg-black/80 border border-zinc-700 rounded-md text-sm text-white focus:outline-none focus:border-red-600 w-40 md:w-60"
                autoFocus
              />
            )}
          </form>

          {/* NOTIFICACIONES */}
          <button
            className="p-2 rounded-full text-zinc-300 hover:text-white hover:bg-white/10 transition-colors relative"
            aria-label="Notificaciones"
            onClick={() => alert('No tienes nuevas notificaciones.')}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-600 rounded-full ring-2 ring-black" />
          </button>

          {/* MENÚ DE PERFIL */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-1.5 p-1 rounded-lg hover:ring-2 hover:ring-white/20 transition-all"
              aria-label="Menú de perfil"
            >
              <img
                src={currentProfile.avatar}
                alt={currentProfile.name}
                className="w-8 h-8 rounded-md object-cover ring-1 ring-white/20"
              />
              <ChevronDown className={cn('w-3.5 h-3.5 text-zinc-400 transition-transform duration-200', showProfileMenu && 'rotate-180')} />
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl py-2 z-50 text-sm"
                >
                  <div className="px-3 py-2 border-b border-zinc-800 font-semibold text-zinc-200">
                    {currentProfile.name}
                  </div>
                  {mockProfiles.map((profile) => (
                    <button
                      key={profile.id}
                      onClick={() => handleSelectProfile(profile)}
                      className="w-full text-left px-3 py-2 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center gap-2"
                    >
                      <img src={profile.avatar} alt={profile.name} className="w-6 h-6 rounded" />
                      {profile.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>
    </>
  );
}

export default Header;