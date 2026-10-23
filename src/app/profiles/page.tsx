'use client';

import { useState, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, Check, X, User, Shield, Lock } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { mockProfiles } from '@/lib/mock-data';
import type { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<UserProfile[]>(mockProfiles);
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileIsKids, setNewProfileIsKids] = useState(false);

  const handleSelectProfile = (profile: UserProfile) => {
    // In a real app, this would set the active profile in context/cookies
    localStorage.setItem('pyflix_profile', JSON.stringify(profile));
    window.location.href = '/';
  };

  const handleEdit = (profile: UserProfile) => {
    setEditingProfile(profile);
  };

  const handleSaveEdit = (updated: UserProfile) => {
    setProfiles(profiles.map(p => p.id === updated.id ? updated : p));
    setEditingProfile(null);
  };

  const handleDelete = (id: string) => {
    if (profiles.length <= 1) return; // Prevent deleting last profile
    if (confirm('¿Eliminar este perfil? Se perderá el historial de visualización.')) {
      setProfiles(profiles.filter(p => p.id !== id));
    }
  };

  const handleAddProfile = () => {
    if (!newProfileName.trim()) return;
    const newProfile: UserProfile = {
      id: Date.now().toString(),
      name: newProfileName.trim(),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newProfileName}&backgroundColor=000000,e50914,141414`,
      isKids: newProfileIsKids,
      language: 'es',
      maturityRating: newProfileIsKids ? 'PG' : 'TV-14',
    };
    setProfiles([...profiles, newProfile]);
    setShowAddModal(false);
    setNewProfileName('');
    setNewProfileIsKids(false);
  };

  return (
    <Fragment>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="w-full max-w-4xl">
            {/* Header */}
            <div className="text-center mb-12">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold text-netflix-white mb-4"
              >
                ¿Quién está viendo?
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-netflix-lightGray text-lg"
              >
                Selecciona un perfil o añade uno nuevo
              </motion.p>
            </div>

            {/* Profiles Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {profiles.map((profile, index) => (
                <motion.button
                  key={profile.id}
                  onClick={() => handleSelectProfile(profile)}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative flex flex-col items-center gap-3 p-4 bg-netflix-card rounded-2xl hover:bg-netflix-cardHover transition-all duration-200 group"
                >
                  <div className="relative w-24 h-24">
                    <img
                      src={profile.avatar}
                      alt=""
                      className="w-full h-full rounded-xl object-cover"
                    />
                    {profile.isKids && (
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-netflix-red rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-netflix-white" />
                      </div>
                    )}
                    <div className="absolute inset-0 rounded-xl border-4 border-transparent group-hover:border-netflix-red transition-colors" />
                  </div>
                  
                  <div className="text-center w-full">
                    <h3 className="font-bold text-netflix-white truncate">{profile.name}</h3>
                    <p className="text-sm text-netflix-gray capitalize">{profile.isKids ? 'Para niños' : 'Adulto'}</p>
                  </div>

                  {/* Edit/Delete Menu */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEdit(profile); }}
                      className="p-1.5 rounded-lg bg-netflix-black/80 backdrop-blur-sm text-netflix-white hover:bg-netflix-gray/50 transition-colors"
                      aria-label={`Editar ${profile.name}`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {!profile.isKids && profiles.length > 1 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(profile.id); }}
                        className="p-1.5 rounded-lg bg-netflix-black/80 backdrop-blur-sm text-netflix-red hover:bg-netflix-red/20 transition-colors"
                        aria-label={`Eliminar ${profile.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </motion.button>
              ))}

              {/* Add Profile Button */}
              <motion.button
                onClick={() => setShowAddModal(true)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: profiles.length * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="flex flex-col items-center gap-3 p-4 bg-netflix-card/50 border-2 border-dashed border-netflix-gray/30 rounded-2xl hover:border-netflix-red hover:bg-netflix-card transition-all duration-200"
              >
                <div className="relative w-24 h-24">
                  <div className="w-full h-full rounded-xl bg-netflix-gray/20 flex items-center justify-center">
                    <Plus className="w-10 h-10 text-netflix-gray" />
                  </div>
                  <div className="absolute inset-0 rounded-xl border-2 border-dashed border-transparent hover:border-netflix-red transition-colors" />
                </div>
                <div className="text-center w-full">
                  <h3 className="font-bold text-netflix-white">Añadir perfil</h3>
                  <p className="text-sm text-netflix-gray">Hasta 5 perfiles</p>
                </div>
              </motion.button>
            </div>

            {/* Manage Profiles Link */}
            <div className="text-center">
              <Button variant="ghost" onClick={() => window.location.href = '/account'}>
                <User className="w-5 h-5" />
                <span>Gestionar perfiles</span>
              </Button>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-netflix-gray/20 py-10 px-6">
          <div className="max-w-[1920px] mx-auto text-center">
            <p className="text-netflix-gray text-sm">PyFlix España</p>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {editingProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-netflix-black/90 backdrop-blur-sm"
            onClick={() => setEditingProfile(null)}
            role="dialog"
            aria-modal="true"
            aria-label="Editar perfil"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-strong rounded-2xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-netflix-white">Editar perfil</h2>
                <button
                  onClick={() => setEditingProfile(null)}
                  className="p-2 rounded-lg text-netflix-gray hover:text-netflix-white hover:bg-netflix-gray/20 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <img
                    src={editingProfile.avatar}
                    alt=""
                    className="w-20 h-20 rounded-xl"
                  />
                  <button className="btn-secondary">Cambiar imagen</button>
                </div>

                <Input
                  label="Nombre del perfil"
                  value={editingProfile.name}
                  onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                  placeholder="Nombre"
                />

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="kids-profile"
                    checked={editingProfile.isKids}
                    onChange={(e) => setEditingProfile({ ...editingProfile, isKids: e.target.checked })}
                    className="w-5 h-5 rounded border-netflix-gray/30 bg-netflix-card text-netflix-red focus:ring-netflix-red"
                  />
                  <label htmlFor="kids-profile" className="text-netflix-white cursor-pointer">
                    <span className="font-medium">Perfil para niños</span>
                    <p className="text-sm text-netflix-gray">Contenido apto para todas las edades</p>
                  </label>
                </div>

                <select
                  value={editingProfile.language}
                  onChange={(e) => setEditingProfile({ ...editingProfile, language: e.target.value })}
                  className="w-full bg-netflix-card border border-netflix-gray/30 rounded-lg px-4 py-3 text-netflix-white focus:border-netflix-red focus:outline-none focus:ring-2 focus:ring-netflix-red/20"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                </select>

                <div className="flex gap-3 pt-4">
                  <Button variant="secondary" className="flex-1" onClick={() => setEditingProfile(null)}>
                    Cancelar
                  </Button>
                  <Button className="flex-1" onClick={() => handleSaveEdit(editingProfile)}>
                    <Check className="w-5 h-5" />
                    <span>Guardar</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Profile Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-netflix-black/90 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Añadir perfil"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass-strong rounded-2xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-netflix-white">Añadir perfil</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-2 rounded-lg text-netflix-gray hover:text-netflix-white hover:bg-netflix-gray/20 transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-20 h-20 rounded-xl bg-netflix-gray/20 flex items-center justify-center">
                    <User className="w-10 h-10 text-netflix-gray" />
                  </div>
                </div>

                <Input
                  label="Nombre del perfil"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  placeholder="Nombre"
                  autoFocus
                />

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="new-kids-profile"
                    checked={newProfileIsKids}
                    onChange={(e) => setNewProfileIsKids(e.target.checked)}
                    className="w-5 h-5 rounded border-netflix-gray/30 bg-netflix-card text-netflix-red focus:ring-netflix-red"
                  />
                  <label htmlFor="new-kids-profile" className="text-netflix-white cursor-pointer">
                    <span className="font-medium">Perfil para niños</span>
                    <p className="text-sm text-netflix-gray">Contenido apto para todas las edades</p>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="secondary" className="flex-1" onClick={() => setShowAddModal(false)}>
                    Cancelar
                  </Button>
                  <Button className="flex-1" onClick={handleAddProfile} disabled={!newProfileName.trim()}>
                    <Plus className="w-5 h-5" />
                    <span>Añadir perfil</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Fragment>
  );
}