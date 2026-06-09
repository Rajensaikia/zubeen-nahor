'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { Leaf, User, Image, Rss, Award, Edit3, Save, X, Calendar, MapPin, Users, Bell, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface Badge {
  id: string;
  name: string;
  code: string;
  description: string;
}

interface Post {
  id: string;
  caption: string;
  imageUrl?: string;
  videoUrl?: string;
  treeCount: number;
  likesCount: number;
  createdAt: string;
}

interface Plantation {
  id: string;
  treeCount: number;
  species: string;
  district: string;
  date: string;
  imageUrl?: string;
}

interface Group {
  id: string;
  name: string;
  description: string;
  type: string;
  membersCount: number;
  creator: {
    displayName: string;
    username: string;
  };
}

interface EventDrive {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  district: string;
  attendeesCount: number;
}

interface InAppNotification {
  id: string;
  type: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    displayName: string;
    username: string;
    avatarUrl?: string;
  };
}

export default function Profile() {
  const { user: authUser, refreshUser } = useAuth();
  const { t, language } = useLanguage();

  const [profileUser, setProfileUser] = useState<any>(null);
  const [postsCount, setPostsCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [plantations, setPlantations] = useState<Plantation[]>([]);
  const [joinedGroups, setJoinedGroups] = useState<Group[]>([]);
  const [joinedEvents, setJoinedEvents] = useState<EventDrive[]>([]);
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'gallery' | 'badges' | 'groups_drives' | 'notifications'>('posts');
  
  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatarUrl, setEditAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchProfileData = async () => {
    try {
      const res = await fetch('/api/user/profile');
      const data = await res.json();
      if (res.ok) {
        setProfileUser(data.user);
        setPostsCount(data.postsCount);
        setFollowersCount(data.followersCount);
        setFollowingCount(data.followingCount);
        setBadges(data.badges);
        setPosts(data.posts);
        setPlantations(data.plantations);
        setJoinedGroups(data.joinedGroups || []);
        setJoinedEvents(data.joinedEvents || []);
        
        // Prep edit fields
        setEditName(data.user.displayName);
        setEditBio(data.user.bio || '');
        setEditAvatarUrl(data.user.avatarUrl || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/user/notifications');
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.notifications || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfileData();
    fetchNotifications();
  }, [authUser]);

  useEffect(() => {
    if (activeTab === 'notifications') {
      fetchNotifications();
    }
  }, [activeTab]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: editName, bio: editBio, avatarUrl: editAvatarUrl }),
      });
      if (res.ok) {
        setIsEditing(false);
        await refreshUser(); // Update global auth context
        await fetchProfileData(); // Reload local profile states
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/user/notifications', { method: 'PATCH' });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="text-center py-12 rounded-3xl bg-card border border-border p-6">
        <User className="h-12 w-12 text-primary opacity-20 mx-auto mb-4" />
        <h2 className="text-lg font-bold">Profile Unavailable</h2>
        <p className="text-xs text-muted-foreground mt-1">Please sign in to view your profile dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Info Header Card */}
      <section className="aesthetic-card rounded-3xl p-6 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left w-full md:w-auto">
          <div className="flex flex-col items-center shrink-0">
            <img
              src={isEditing && editAvatarUrl ? editAvatarUrl : (profileUser.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profileUser.username}`)}
              alt={profileUser.displayName}
              className="h-24 w-24 rounded-full border-2 border-primary object-cover shadow-sm bg-card"
            />
            {isEditing && (
              <label className="mt-2 cursor-pointer rounded-xl bg-muted border border-border px-2.5 py-1 text-[10px] font-bold text-primary hover:bg-muted/80 transition-colors shadow-sm">
                Change Photo
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
          
          <div className="space-y-3 w-full md:w-auto">
            {isEditing ? (
              <div className="space-y-2 max-w-sm">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-bold"
                />
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full rounded-xl border border-border bg-muted/30 px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary leading-normal"
                  placeholder="Tell us about yourself..."
                />
              </div>
            ) : (
              <div className="space-y-1">
                <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center justify-center md:justify-start gap-2">
                  <span>{profileUser.displayName}</span>
                  {profileUser.role === 'ADMIN' && (
                    <span className="rounded bg-accent/15 px-1.5 py-0.5 text-[9px] font-bold text-accent uppercase tracking-wider">Admin</span>
                  )}
                </h2>
                <p className="text-xs text-muted-foreground">@{profileUser.username}</p>
                <p className="text-xs sm:text-sm text-muted-foreground max-w-md pt-1">{profileUser.bio || 'No bio written yet.'}</p>
              </div>
            )}

            <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-semibold text-muted-foreground pt-1 border-t border-border/40">
              <span className="flex items-center gap-0.5 text-foreground font-extrabold"><Leaf className="h-4 w-4 text-primary" /> {profileUser.totalTrees} {t('leaderboard_trees')}</span>
              <span>•</span>
              <span>{postsCount} Posts</span>
              <span>•</span>
              <span>{followersCount} Followers</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 pt-2">
          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-full border border-border bg-card p-2 text-muted-foreground hover:bg-muted"
                title="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-full bg-primary hover:bg-secondary text-primary-foreground font-semibold px-4 py-2 text-xs shadow-sm"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{saving ? 'Saving...' : t('profile_save_btn')}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 rounded-full border border-border bg-card hover:bg-muted text-foreground font-semibold px-4 py-2 text-xs shadow-sm transition-colors"
            >
              <Edit3 className="h-3.5 w-3.5 text-primary" />
              <span>{t('profile_edit_btn')}</span>
            </button>
          )}
        </div>
      </section>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-border pb-2.5">
        <button
          onClick={() => setActiveTab('posts')}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${
            activeTab === 'posts'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Rss className="h-4 w-4" />
          <span>My Posts</span>
        </button>

        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${
            activeTab === 'gallery'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Image className="h-4 w-4" />
          <span>{t('profile_gallery')}</span>
        </button>

        <button
          onClick={() => setActiveTab('badges')}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${
            activeTab === 'badges'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Award className="h-4 w-4" />
          <span>{t('profile_badges')}</span>
        </button>

        <button
          onClick={() => setActiveTab('groups_drives')}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${
            activeTab === 'groups_drives'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Joined Groups & Drives</span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors relative ${
            activeTab === 'notifications'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Notifications Feed</span>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-black text-accent-foreground shadow-sm animate-pulse">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Tabs Content */}
      <div className="mt-6">
        {activeTab === 'posts' && (
          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map((p) => (
                <div key={p.id} className="aesthetic-card rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex gap-4 items-center">
                    {p.imageUrl && (
                      <img src={p.imageUrl} alt="Post preview" className="h-16 w-16 rounded-xl object-cover border border-border" />
                    )}
                    {p.videoUrl && (
                      <video src={p.videoUrl} className="h-16 w-16 rounded-xl object-cover border border-border" />
                    )}
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'as-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-sm text-foreground line-clamp-1 max-w-md font-medium">{p.caption}</p>
                      {p.treeCount > 0 && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-primary/10 px-1 py-0.2 text-[10px] font-bold text-primary">
                          <Leaf className="h-3 w-3" /> {p.treeCount} Trees Planted
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{p.likesCount} Likes</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-center text-muted-foreground py-8 border border-dashed border-border bg-card rounded-2xl">You haven't posted anything yet.</p>
            )}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {plantations.length > 0 ? (
              plantations.map((pl) => (
                <div key={pl.id} className="aesthetic-card rounded-2xl overflow-hidden relative group">
                  {pl.imageUrl && pl.imageUrl.startsWith('data:video/') ? (
                    <video
                      src={pl.imageUrl}
                      className="w-full h-36 object-cover"
                      controls
                    />
                  ) : (
                    <img
                      src={pl.imageUrl || 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=200'}
                      alt={pl.species}
                      className="w-full h-36 object-cover"
                    />
                  )}
                  <div className="p-3 border-t border-border/40 space-y-0.5">
                    <h4 className="font-bold text-xs text-foreground truncate">{pl.species}</h4>
                    <p className="text-[10px] text-muted-foreground truncate">{pl.district} ({pl.treeCount} trees)</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-4 text-xs text-center text-muted-foreground py-8 border border-dashed border-border bg-card rounded-2xl">No verified plantation photos to display.</p>
            )}
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {badges.length > 0 ? (
              badges.map((b) => (
                <div key={b.id} className="aesthetic-card rounded-2xl p-4 flex gap-3 items-center">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm font-bold bg-gradient-to-br ${
                    b.code === 'CHAMPION'
                      ? 'from-amber-400 to-yellow-600'
                      : b.code === 'PROTECTOR'
                      ? 'from-blue-400 to-indigo-600'
                      : 'from-emerald-400 to-green-600'
                  }`}>
                    ★
                  </div>
                  <div>
                    <h4 className="font-extrabold text-foreground text-xs sm:text-sm">{b.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{b.description}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-3 text-xs text-center text-muted-foreground py-8 border border-dashed border-border bg-card rounded-2xl">No badges earned yet. Plant and verify trees to unlock badges!</p>
            )}
          </div>
        )}

        {activeTab === 'groups_drives' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Groups Joined */}
            <div className="aesthetic-card rounded-3xl p-5 sm:p-6 space-y-4">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary border-b border-border pb-3 flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span>Joined Groups ({joinedGroups.length})</span>
              </h3>
              {joinedGroups.length > 0 ? (
                <div className="space-y-4">
                  {joinedGroups.map((gp) => (
                    <div key={gp.id} className="rounded-2xl border border-border bg-muted/10 p-4 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <span className="block font-bold text-foreground text-xs sm:text-sm truncate">{gp.name}</span>
                        <span className="block text-[10px] text-muted-foreground truncate mt-0.5">Created by @{gp.creator?.username} • {gp.membersCount} members</span>
                      </div>
                      <Link
                        href="/groups"
                        className="rounded-full bg-primary hover:bg-secondary text-primary-foreground font-semibold px-4 py-1.5 text-[11px] shadow-sm shrink-0 flex items-center gap-1"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Chat Hub</span>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-center text-muted-foreground py-6 italic">You haven't joined any groups yet.</p>
              )}
            </div>

            {/* Event Drives Registered */}
            <div className="aesthetic-card rounded-3xl p-5 sm:p-6 space-y-4">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary border-b border-border pb-3 flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>Registered Drives ({joinedEvents.length})</span>
              </h3>
              {joinedEvents.length > 0 ? (
                <div className="space-y-4">
                  {joinedEvents.map((evt) => (
                    <div key={evt.id} className="rounded-2xl border border-border bg-muted/10 p-4 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <span className="block font-bold text-foreground text-xs sm:text-sm truncate">{evt.title}</span>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                          <MapPin className="h-3 w-3 text-primary shrink-0" />
                          <span className="truncate">{evt.location} ({evt.district})</span>
                        </div>
                        <span className="block text-[9px] text-primary font-bold mt-1">📅 {new Date(evt.date).toLocaleDateString()}</span>
                      </div>
                      <Link
                        href="/events"
                        className="rounded-full border border-primary/20 bg-card hover:bg-muted text-primary font-bold px-4 py-1.5 text-[11px] shrink-0"
                      >
                        Announcements
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-center text-muted-foreground py-6 italic">You haven't registered for any drives yet.</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="aesthetic-card rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Bell className="h-4 w-4" />
                <span>Inbox ({unreadCount} unread)</span>
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold px-3 py-1.5 text-[10px] transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {notifications.length > 0 ? (
              <div className="divide-y divide-border/40">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`py-3.5 flex items-start justify-between gap-4 ${notif.isRead ? '' : 'bg-primary/5 rounded-xl px-3 -mx-3'}`}>
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center font-bold text-white bg-gradient-to-br ${
                        notif.type === 'EVENT'
                          ? 'from-amber-400 to-orange-500'
                          : notif.type === 'APPROVAL'
                          ? 'from-emerald-400 to-green-500'
                          : 'from-blue-400 to-indigo-500'
                      }`}>
                        {notif.type === 'EVENT' ? '📢' : notif.type === 'APPROVAL' ? '✓' : '★'}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <p className="text-xs text-foreground leading-normal font-medium">{notif.content}</p>
                        <span className="block text-[9px] text-muted-foreground">{new Date(notif.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                    {!notif.isRead && (
                      <span className="h-2 w-2 rounded-full bg-accent shrink-0 mt-2"></span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-center text-muted-foreground py-8 border border-dashed border-border bg-card rounded-2xl">No notifications in your inbox.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
