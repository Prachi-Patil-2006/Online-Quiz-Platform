import React, { useState } from 'react';
import { UserProfile } from '../types/quiz';
import { storageService } from '../services/storageService';

interface UserProfileViewProps {
  currentUser: UserProfile;
  onUserUpdated: (user: UserProfile) => void;
  onNavigate: (view: string) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  currentUser,
  onUserUpdated,
  onNavigate,
}) => {
  const [firstName, setFirstName] = useState(currentUser.user.first_name);
  const [lastName, setLastName] = useState(currentUser.user.last_name);
  const [email, setEmail] = useState(currentUser.user.email);
  const [bio, setBio] = useState(currentUser.bio);
  const [avatarUrl, setAvatarUrl] = useState(currentUser.profile_image);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const sampleAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  ];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...currentUser,
      bio,
      profile_image: avatarUrl,
      user: {
        ...currentUser.user,
        first_name: firstName,
        last_name: lastName,
        email,
      },
    };

    storageService.updateUserProfile(updated);
    onUserUpdated(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-8 text-white text-center">
          <div className="relative inline-block mb-3">
            <img
              src={avatarUrl}
              alt={currentUser.user.username}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-white/50 shadow-md mx-auto"
            />
            <span className="absolute bottom-0 right-0 px-2 py-0.5 rounded-full bg-yellow-400 text-slate-950 font-bold text-[10px]">
              {currentUser.role}
            </span>
          </div>
          <h2 className="text-2xl font-bold">{currentUser.user.username}</h2>
          <p className="text-xs text-blue-200">
            Registered on {new Date(currentUser.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <form onSubmit={handleSave} className="p-6 sm:p-8 space-y-6">
          {savedSuccess && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
              <i className="fa-solid fa-circle-check text-emerald-600"></i>
              <span>Profile details updated successfully!</span>
            </div>
          )}

          {/* Avatar Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Choose Profile Picture
            </label>
            <div className="flex flex-wrap items-center gap-3">
              {sampleAvatars.map((url, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setAvatarUrl(url)}
                  className={`w-12 h-12 rounded-full overflow-hidden border-2 transition cursor-pointer ${
                    avatarUrl === url ? 'border-blue-600 ring-2 ring-blue-300 scale-105' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt={`Avatar option ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Username
              </label>
              <input
                type="text"
                value={currentUser.user.username}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Biography
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={3}
              placeholder="Tell others about your study focus, technical interests, etc."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50 transition cursor-pointer"
            >
              Back to Dashboard
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow transition cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
