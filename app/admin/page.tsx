'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import dynamic from 'next/dynamic';
import {
  ShieldAlert,
  Users,
  Rss,
  Leaf,
  Calendar,
  Check,
  X,
  Plus,
  Download,
  Award,
  Clock,
  LayoutDashboard,
  Trash2,
  Edit3,
  MessageSquare,
  Flag,
  Ban,
  UserCheck,
  Music,
  Heart,
  Camera,
  Video,
  LineChart
} from 'lucide-react';

const GrowthChart = dynamic(() => import('@/components/GrowthChart'), { ssr: false });
const AnalyticsCharts = dynamic(() => import('@/components/AnalyticsCharts'), { ssr: false });

interface PendingRecord {
  id: string;
  name: string;
  mobile: string;
  district: string;
  village: string;
  location: string;
  treeCount: number;
  species: string;
  date: string;
  imageUrl?: string;
  notes?: string;
}

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: 'USER' | 'ADMIN';
  totalTrees: number;
  isVerified: boolean;
  createdAt: string;
  isSuspended?: boolean;
}

const DISTRICTS_LIST = [
  'Kamrup Metropolitan',
  'Kamrup',
  'Jorhat',
  'Dibrugarh',
  'Sonitpur',
  'Sivasagar',
  'Nagaon',
  'Cachar',
  'Bongaigaon',
  'Barpeta',
  'Tinsukia',
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'verifications' | 'users' | 'groups' | 'events' | 'badges' | 'manual' | 'feed' | 'music' | 'tribute' | 'analytics'>('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalApprovedTrees: 0,
    pendingCount: 0,
    totalEvents: 0,
  });
  const [pendingList, setPendingList] = useState<PendingRecord[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [chartData, setChartData] = useState<{ month: string; trees: number }[]>([]);
  const [groupsList, setGroupsList] = useState<any[]>([]);
  const [badgesList, setBadgesList] = useState<any[]>([]);
  const [eventsList, setEventsList] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // Admin selected group for details moderation
  const [selectedAdminGroupId, setSelectedAdminGroupId] = useState<string | null>(null);
  const [selectedGroupTab, setSelectedGroupTab] = useState<'highlights' | 'members' | 'chat'>('highlights');
  const [groupPastWorks, setGroupPastWorks] = useState('');
  const [groupMemories, setGroupMemories] = useState('');
  const [groupNextPlan, setGroupNextPlan] = useState('');
  const [groupMediaUrls, setGroupMediaUrls] = useState('');
  const [savingGroupDetails, setSavingGroupDetails] = useState(false);

  // Users management states
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserDisplayName, setEditUserDisplayName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');

  // Social feed moderation states
  const [postsList, setPostsList] = useState<any[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Manual entry states
  const [manualEmail, setManualEmail] = useState('');
  const [manualDistrict, setManualDistrict] = useState('Kamrup Metropolitan');
  const [manualVillage, setManualVillage] = useState('');
  const [manualLocation, setManualLocation] = useState('');
  const [manualCount, setManualCount] = useState('1');
  const [manualSpecies, setManualSpecies] = useState('');
  const [manualDate, setManualDate] = useState(new Date().toISOString().substring(0, 10));
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualSuccess, setManualSuccess] = useState(false);

  // Manual badge states
  const [badgeUserId, setBadgeUserId] = useState('');
  const [badgeName, setBadgeName] = useState('Green Warrior');
  const [badgeCode, setBadgeCode] = useState('WARRIOR');
  const [badgeDesc, setBadgeDesc] = useState('Awarded for planting 10+ trees.');
  const [badgeSubmitting, setBadgeSubmitting] = useState(false);

  // Event creation states
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().substring(0, 10));
  const [eventLoc, setEventLoc] = useState('');
  const [eventDist, setEventDist] = useState('Kamrup Metropolitan');
  const [eventImg, setEventImg] = useState('');
  const [eventSubmitting, setEventSubmitting] = useState(false);

  // Admin Edit Event states
  const [editingAdminEvent, setEditingAdminEvent] = useState<any | null>(null);
  const [editAdminTitle, setEditAdminTitle] = useState('');
  const [editAdminDesc, setEditAdminDesc] = useState('');
  const [editAdminDate, setEditAdminDate] = useState('');
  const [editAdminLoc, setEditAdminLoc] = useState('');
  const [editAdminDist, setEditAdminDist] = useState('Kamrup Metropolitan');
  const [editAdminImg, setEditAdminImg] = useState('');
  const [editAdminChiefGuest, setEditAdminChiefGuest] = useState('');
  const [editAdminTreesPlanted, setEditAdminTreesPlanted] = useState('0');
  const [editAdminStatus, setEditAdminStatus] = useState('UPCOMING');
  const [editAdminSchedule, setEditAdminSchedule] = useState('');
  const [editAdminDocuments, setEditAdminDocuments] = useState('');
  const [editAdminMemories, setEditAdminMemories] = useState('');
  const [editAdminMediaUrls, setEditAdminMediaUrls] = useState('');
  const [editAdminSubmitting, setEditAdminSubmitting] = useState(false);

  // Song management states
  const [songsList, setSongsList] = useState<any[]>([]);
  const [loadingSongs, setLoadingSongs] = useState(false);
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('Zubeen Garg');
  const [songAlbum, setSongAlbum] = useState('');
  const [songAudioUrl, setSongAudioUrl] = useState('');
  const [songCoverUrl, setSongCoverUrl] = useState('');
  const [songDuration, setSongDuration] = useState('0');
  const [songSubmitting, setSongSubmitting] = useState(false);

  // Edit song states
  const [editingSong, setEditingSong] = useState<any | null>(null);
  const [editSongTitle, setEditSongTitle] = useState('');
  const [editSongArtist, setEditSongArtist] = useState('');
  const [editSongAlbum, setEditSongAlbum] = useState('');
  const [editSongAudioUrl, setEditSongAudioUrl] = useState('');
  const [editSongCoverUrl, setEditSongCoverUrl] = useState('');
  const [editSongDuration, setEditSongDuration] = useState('0');
  const [editSongSubmitting, setEditSongSubmitting] = useState(false);

  // Tribute management states
  const [milestonesList, setMilestonesList] = useState<any[]>([]);
  const [quotesList, setQuotesList] = useState<any[]>([]);
  const [loadingTribute, setLoadingTribute] = useState(false);

  // Milestone form states
  const [mileYear, setMileYear] = useState('');
  const [mileTitle, setMileTitle] = useState('');
  const [mileDesc, setMileDesc] = useState('');
  const [mileSubmitting, setMileSubmitting] = useState(false);

  // Edit milestone states
  const [editingMilestone, setEditingMilestone] = useState<any | null>(null);
  const [editMileYear, setEditMileYear] = useState('');
  const [editMileTitle, setEditMileTitle] = useState('');
  const [editMileDesc, setEditMileDesc] = useState('');
  const [editMileSubmitting, setEditMileSubmitting] = useState(false);

  // SongQuote form states
  const [quoteSongTitle, setQuoteSongTitle] = useState('');
  const [quoteLyric, setQuoteLyric] = useState('');
  const [quoteMeaning, setQuoteMeaning] = useState('');
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);

  // Edit quote states
  const [editingQuote, setEditingQuote] = useState<any | null>(null);
  const [editQuoteSongTitle, setEditQuoteSongTitle] = useState('');
  const [editQuoteLyric, setEditQuoteLyric] = useState('');
  const [editQuoteMeaning, setEditQuoteMeaning] = useState('');
  const [editQuoteSubmitting, setEditQuoteSubmitting] = useState(false);

  // Analytics states
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/dashboard');
      const data = await res.json();
      if (res.ok) {
        setStats(data.stats);
        setPendingList(data.pendingSubmissions);
        setUsersList(data.users);
        setChartData(data.growthChartData);
        setGroupsList(data.groups || []);
        setBadgesList(data.badges || []);
        setEventsList(data.events || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'feed') {
      fetchPostsList();
    }
  }, [activeTab]);

  const fetchSongsList = async () => {
    setLoadingSongs(true);
    try {
      const res = await fetch('/api/admin/songs');
      const data = await res.json();
      if (res.ok) {
        setSongsList(data.songs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSongs(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'music') {
      fetchSongsList();
    }
  }, [activeTab]);

  const fetchTributeData = async () => {
    setLoadingTribute(true);
    try {
      const res = await fetch('/api/tribute');
      const data = await res.json();
      if (res.ok) {
        setMilestonesList(data.milestones || []);
        setQuotesList(data.quotes || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingTribute(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tribute') {
      fetchTributeData();
    }
  }, [activeTab]);

  const fetchAnalyticsData = async () => {
    setLoadingAnalytics(true);
    try {
      const res = await fetch('/api/admin/analytics');
      const data = await res.json();
      if (res.ok) {
        setAnalyticsData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalyticsData();
    }
  }, [activeTab]);

  // Handle Group Deletion
  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to permanently delete this community group?')) return;
    try {
      const res = await fetch(`/api/admin/groups?groupId=${groupId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setGroupsList(prev => prev.filter(g => g.id !== groupId));
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Group Details (Highlights/Memories/Plan/Media) updates
  const handleSaveGroupDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdminGroupId) return;
    setSavingGroupDetails(true);
    try {
      const res = await fetch('/api/admin/groups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedAdminGroupId,
          pastWorks: groupPastWorks,
          memories: groupMemories,
          nextPlan: groupNextPlan,
          mediaUrls: groupMediaUrls,
        }),
      });
      if (res.ok) {
        setGroupsList(prev => prev.map(g => g.id === selectedAdminGroupId ? {
          ...g,
          pastWorks: groupPastWorks,
          memories: groupMemories,
          nextPlan: groupNextPlan,
          mediaUrls: groupMediaUrls
        } : g));
        alert('Group highlights and media updated successfully.');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update group highlights');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving group details');
    } finally {
      setSavingGroupDetails(false);
    }
  };

  // Handle Event Deletion
  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure you want to cancel and delete this event?')) return;
    try {
      const res = await fetch(`/api/admin/events?eventId=${eventId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setEventsList(prev => prev.filter(e => e.id !== eventId));
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Event Creation
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setEventSubmitting(true);
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventTitle,
          description: eventDesc,
          date: eventDate,
          location: eventLoc,
          district: eventDist,
          imageUrl: eventImg,
        }),
      });
      if (res.ok) {
        setEventTitle('');
        setEventDesc('');
        setEventLoc('');
        setEventImg('');
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEventSubmitting(false);
    }
  };

  const handleOpenAdminEditEvent = (evt: any) => {
    setEditingAdminEvent(evt);
    setEditAdminTitle(evt.title);
    setEditAdminDesc(evt.description);
    setEditAdminDate(evt.date ? new Date(evt.date).toISOString().substring(0, 10) : '');
    setEditAdminLoc(evt.location);
    setEditAdminDist(evt.district);
    setEditAdminImg(evt.imageUrl || '');
    setEditAdminChiefGuest(evt.chiefGuest || '');
    setEditAdminTreesPlanted(evt.treesPlanted?.toString() || '0');
    setEditAdminStatus(evt.status || 'UPCOMING');
    setEditAdminSchedule(evt.schedule || '');
    setEditAdminDocuments(evt.documents || '');
    setEditAdminMemories(evt.memories || '');
    setEditAdminMediaUrls(evt.mediaUrls || '');
  };

  const handleSaveAdminEventEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAdminEvent) return;
    setEditAdminSubmitting(true);
    try {
      const res = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: editingAdminEvent.id,
          title: editAdminTitle,
          description: editAdminDesc,
          date: editAdminDate,
          location: editAdminLoc,
          district: editAdminDist,
          imageUrl: editAdminImg,
          chiefGuest: editAdminChiefGuest,
          treesPlanted: parseInt(editAdminTreesPlanted) || 0,
          status: editAdminStatus,
          schedule: editAdminSchedule,
          documents: editAdminDocuments,
          memories: editAdminMemories,
          mediaUrls: editAdminMediaUrls,
        }),
      });
      if (res.ok) {
        setEditingAdminEvent(null);
        fetchDashboardData();
        alert('Event drive updated successfully.');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update event');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while saving event details');
    } finally {
      setEditAdminSubmitting(false);
    }
  };

  // Handle Badge manual issuance
  const handleAwardBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeUserId) {
      alert('Please select a volunteer.');
      return;
    }
    setBadgeSubmitting(true);
    try {
      const res = await fetch('/api/admin/badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: badgeUserId,
          badgeName,
          badgeCode,
          description: badgeDesc,
        }),
      });
      if (res.ok) {
        setBadgeUserId('');
        setBadgeDesc('Awarded for achievements.');
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBadgeSubmitting(false);
    }
  };

  // Handle Badge revocation
  const handleRevokeBadge = async (badgeId: string) => {
    if (!confirm('Are you sure you want to revoke this badge from the volunteer?')) return;
    try {
      const res = await fetch(`/api/admin/badges?badgeId=${badgeId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setBadgesList(prev => prev.filter(b => b.id !== badgeId));
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle manual event registration
  const handleRegisterUserForEvent = async (eventId: string, userId: string) => {
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, userId, action: 'REGISTER' }),
      });
      if (res.ok) {
        fetchDashboardData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to register volunteer');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle manual event registration cancellation
  const handleCancelRegistration = async (eventId: string, userId: string) => {
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, userId, action: 'CANCEL' }),
      });
      if (res.ok) {
        fetchDashboardData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to cancel registration');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin remove group member
  const handleAdminRemoveGroupMember = async (groupId: string, userId: string) => {
    if (!confirm('Are you sure you want to remove this member from the group?')) return;
    try {
      const res = await fetch(`/api/admin/groups/members?groupId=${groupId}&userId=${userId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchDashboardData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to remove member');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin delete group message
  const handleAdminDeleteGroupMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this group chat message?')) return;
    try {
      const res = await fetch(`/api/admin/groups/messages?messageId=${messageId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchDashboardData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete message');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Admin delete event message
  const handleAdminDeleteEventMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this event broadcast message?')) return;
    try {
      const res = await fetch(`/api/admin/events/messages?messageId=${messageId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchDashboardData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete message');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // User Verification toggle
  const handleToggleUserVerify = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'TOGGLE_VERIFY' }),
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, isVerified: data.user.isVerified } : u));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to toggle verification');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // User Role toggle
  const handleToggleUserRole = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'TOGGLE_ROLE' }),
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: data.user.role } : u));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to toggle role');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // User Suspension toggle
  const handleToggleUserSuspend = async (userId: string) => {
    try {
      const res = await fetch('/api/admin/users/action', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'SUSPEND' }),
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(prev => prev.map(u => u.id === userId ? { ...u, isSuspended: data.user.isSuspended } : u));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to toggle suspension');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save edited user details (displayName, email)
  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      const res = await fetch('/api/admin/users/action', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          action: 'EDIT',
          displayName: editUserDisplayName,
          email: editUserEmail,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setUsersList(prev => prev.map(u => u.id === editingUser.id ? { ...u, displayName: data.user.displayName, email: data.user.email } : u));
        setEditingUser(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update volunteer details');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Permanently delete user
  const handleAdminDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to permanently delete this user account? All their posts and registrations will be removed.')) return;
    try {
      const res = await fetch(`/api/admin/users/action?userId=${userId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setUsersList(prev => prev.filter(u => u.id !== userId));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch posts for moderation
  const fetchPostsList = async () => {
    setLoadingPosts(true);
    try {
      const res = await fetch('/api/admin/posts');
      const data = await res.json();
      if (res.ok) {
        setPostsList(data.posts || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPosts(false);
    }
  };

  // Moderate post status (approve / reject)
  const handleModeratePostStatus = async (postId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/admin/posts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, status }),
      });
      if (res.ok) {
        setPostsList(prev => prev.map(p => p.id === postId ? { ...p, status } : p));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to moderate post');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Delete social feed post
  const handleAdminDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this social post permanently?')) return;
    try {
      const res = await fetch(`/api/admin/posts?postId=${postId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPostsList(prev => prev.filter(p => p.id !== postId));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete post');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Moderate / Delete Comment on a post
  const handleAdminDeleteComment = async (postId: string, commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    try {
      const res = await fetch(`/api/admin/posts/comments?commentId=${commentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPostsList(prev => prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              comments: p.comments.filter((c: any) => c.id !== commentId),
            };
          }
          return p;
        }));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete comment');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Verification Action
  const handleVerify = async (recordId: string, action: 'APPROVE' | 'REJECT') => {
    setVerifyingId(recordId);
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recordId, action }),
      });
      if (res.ok) {
        // Optimistic / clean removal from pending list
        setPendingList(prev => prev.filter(r => r.id !== recordId));
        // Refresh full stats
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVerifyingId(null);
    }
  };

  // Handle Manual Entry Submit
  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualSubmitting(true);
    try {
      const res = await fetch('/api/admin/manual-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: manualEmail,
          district: manualDistrict,
          village: manualVillage,
          location: manualLocation,
          treeCount: parseInt(manualCount) || 1,
          species: manualSpecies,
          date: manualDate,
        }),
      });

      if (res.ok) {
        setManualEmail('');
        setManualVillage('');
        setManualLocation('');
        setManualCount('1');
        setManualSpecies('');
        setManualSuccess(true);
        setTimeout(() => setManualSuccess(false), 5000);
        
        // Refresh dashboard stats
        fetchDashboardData();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setManualSubmitting(false);
    }
  };

  // Song CRUD handlers
  const handleCreateSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!songTitle || !songAudioUrl) {
      alert('Title and Audio URL are required.');
      return;
    }
    setSongSubmitting(true);
    try {
      const res = await fetch('/api/admin/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: songTitle,
          artist: songArtist,
          album: songAlbum,
          audioUrl: songAudioUrl,
          coverUrl: songCoverUrl,
          duration: parseInt(songDuration) || 0,
        }),
      });
      if (res.ok) {
        setSongTitle('');
        setSongArtist('Zubeen Garg');
        setSongAlbum('');
        setSongAudioUrl('');
        setSongCoverUrl('');
        setSongDuration('0');
        fetchSongsList();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add song');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSongSubmitting(false);
    }
  };

  const handleEditSong = (song: any) => {
    setEditingSong(song);
    setEditSongTitle(song.title);
    setEditSongArtist(song.artist);
    setEditSongAlbum(song.album || '');
    setEditSongAudioUrl(song.audioUrl);
    setEditSongCoverUrl(song.coverUrl || '');
    setEditSongDuration(song.duration?.toString() || '0');
  };

  const handleSaveSongEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSong || !editSongTitle || !editSongAudioUrl) {
      alert('Title and Audio URL are required.');
      return;
    }
    setEditSongSubmitting(true);
    try {
      const res = await fetch('/api/admin/songs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSong.id,
          title: editSongTitle,
          artist: editSongArtist,
          album: editSongAlbum,
          audioUrl: editSongAudioUrl,
          coverUrl: editSongCoverUrl,
          duration: parseInt(editSongDuration) || 0,
        }),
      });
      if (res.ok) {
        setEditingSong(null);
        fetchSongsList();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update song');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEditSongSubmitting(false);
    }
  };

  const handleDeleteSong = async (songId: string) => {
    if (!confirm('Are you sure you want to permanently delete this song?')) return;
    try {
      const res = await fetch(`/api/admin/songs?songId=${songId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSongsList(prev => prev.filter(s => s.id !== songId));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete song');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Milestone CRUD handlers
  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mileYear || !mileTitle || !mileDesc) {
      alert('All milestone fields are required.');
      return;
    }
    setMileSubmitting(true);
    try {
      const res = await fetch('/api/admin/tribute/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: mileYear,
          title: mileTitle,
          description: mileDesc,
        }),
      });
      if (res.ok) {
        setMileYear('');
        setMileTitle('');
        setMileDesc('');
        fetchTributeData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add milestone');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setMileSubmitting(false);
    }
  };

  const handleEditMilestone = (milestone: any) => {
    setEditingMilestone(milestone);
    setEditMileYear(milestone.year);
    setEditMileTitle(milestone.title);
    setEditMileDesc(milestone.description);
  };

  const handleSaveMilestoneEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMilestone || !editMileYear || !editMileTitle || !editMileDesc) {
      alert('All milestone fields are required.');
      return;
    }
    setEditMileSubmitting(true);
    try {
      const res = await fetch('/api/admin/tribute/milestones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingMilestone.id,
          year: editMileYear,
          title: editMileTitle,
          description: editMileDesc,
        }),
      });
      if (res.ok) {
        setEditingMilestone(null);
        fetchTributeData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update milestone');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEditMileSubmitting(false);
    }
  };

  const handleDeleteMilestone = async (id: string) => {
    if (!confirm('Are you sure you want to delete this timeline milestone?')) return;
    try {
      const res = await fetch(`/api/admin/tribute/milestones?milestoneId=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setMilestonesList(prev => prev.filter(m => m.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete milestone');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // SongQuote CRUD handlers
  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quoteSongTitle || !quoteLyric || !quoteMeaning) {
      alert('All quote fields are required.');
      return;
    }
    setQuoteSubmitting(true);
    try {
      const res = await fetch('/api/admin/tribute/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: quoteSongTitle,
          lyric: quoteLyric,
          meaning: quoteMeaning,
        }),
      });
      if (res.ok) {
        setQuoteSongTitle('');
        setQuoteLyric('');
        setQuoteMeaning('');
        fetchTributeData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to add quote');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const handleEditQuote = (quote: any) => {
    setEditingQuote(quote);
    setEditQuoteSongTitle(quote.title);
    setEditQuoteLyric(quote.lyric);
    setEditQuoteMeaning(quote.meaning);
  };

  const handleSaveQuoteEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuote || !editQuoteSongTitle || !editQuoteLyric || !editQuoteMeaning) {
      alert('All quote fields are required.');
      return;
    }
    setEditQuoteSubmitting(true);
    try {
      const res = await fetch('/api/admin/tribute/quotes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingQuote.id,
          title: editQuoteSongTitle,
          lyric: editQuoteLyric,
          meaning: editQuoteMeaning,
        }),
      });
      if (res.ok) {
        setEditingQuote(null);
        fetchTributeData();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update quote');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setEditQuoteSubmitting(false);
    }
  };

  const handleDeleteQuote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this song quote?')) return;
    try {
      const res = await fetch(`/api/admin/tribute/quotes?quoteId=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setQuotesList(prev => prev.filter(q => q.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete quote');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Export report to CSV
  const handleExportCSV = () => {
    const headers = ['User ID', 'Email', 'Display Name', 'Role', 'Total Trees', 'Verified Account'];
    const rows = usersList.map(u => [u.id, u.email, u.displayName, u.role, u.totalTrees, u.isVerified ? 'YES' : 'NO']);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Zubeen_Nahor_Volunteers_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 1. Role verification check
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50/50 dark:bg-red-950/10 p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm">
        <ShieldAlert className="h-12 w-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-extrabold text-foreground">Access Denied (প্ৰৱেশ নিষিদ্ধ)</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          You do not have administrator permissions to view this secure panel. Please contact the system coordinator if you believe this is in error.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {t('admin_title')}
          </h1>
          <p className="text-sm text-muted-foreground">Manage tree verifications, system volunteers, and view analytics.</p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center justify-center gap-2 rounded-full border border-border bg-card hover:bg-muted text-foreground font-semibold px-5 py-2.5 shadow-sm text-xs transition-colors"
        >
          <Download className="h-4 w-4 text-primary" />
          <span>{t('admin_export_data')}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="aesthetic-card rounded-2xl p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-primary border border-primary/10">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Volunteers</span>
            <span className="text-xl sm:text-2xl font-black text-foreground">{stats.totalUsers}</span>
          </div>
        </div>

        <div className="aesthetic-card rounded-2xl p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/15 text-primary border border-primary/10">
            <Rss className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Posts</span>
            <span className="text-xl sm:text-2xl font-black text-foreground">{stats.totalPosts}</span>
          </div>
        </div>

        <div className="aesthetic-card rounded-2xl p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/10">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Approved Trees</span>
            <span className="text-xl sm:text-2xl font-black text-foreground">{stats.totalApprovedTrees}</span>
          </div>
        </div>

        <div className="aesthetic-card rounded-2xl p-5 flex items-center gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-accent border border-accent/10">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pending Reviews</span>
            <span className="text-xl sm:text-2xl font-black text-foreground">{stats.pendingCount}</span>
          </div>
        </div>
      </section>

      {/* Tabs Menu */}
      <div className="flex flex-wrap gap-1.5 border-b border-border pb-2.5">
        {[
          { id: 'overview', name: 'Overview & Stats', icon: LayoutDashboard },
          { id: 'analytics', name: 'Google Website Analytics', icon: LineChart },
          { id: 'verifications', name: `${t('admin_pending')} (${pendingList.length})`, icon: Clock },
          { id: 'users', name: 'Volunteer Management', icon: Users },
          { id: 'feed', name: 'Social Feed Moderation', icon: Rss },
          { id: 'music', name: t('admin_music_tab'), icon: Music },
          { id: 'tribute', name: t('admin_tribute_tab'), icon: Heart },
          { id: 'groups', name: 'Community Groups', icon: Users },
          { id: 'events', name: 'Event Management', icon: Calendar },
          { id: 'badges', name: 'Badge Distribution', icon: Award },
          { id: 'manual', name: 'Manual Entry Logger', icon: Plus },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tabs Content */}
      <div className="mt-6">
        
        {/* Tab 1: Overview & Analytics */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8 aesthetic-card rounded-3xl p-5 sm:p-6 space-y-4">
              <h2 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary border-b border-border pb-3">
                {t('admin_growth_chart')}
              </h2>
              <GrowthChart data={chartData} />
            </div>

            <div className="lg:col-span-4 aesthetic-card rounded-3xl p-6 space-y-4">
              <h2 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary border-b border-border pb-3">
                Quick Action Panel
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Review pending tree counts to increment the live counter publicly in memory of Zubeen Garg.
              </p>
              <button
                onClick={() => setActiveTab('verifications')}
                className="w-full rounded-xl bg-primary hover:bg-secondary text-primary-foreground font-semibold py-2.5 text-xs shadow-sm transition-transform active:scale-95"
              >
                Go to Verifications Review ({pendingList.length})
              </button>
            </div>
          </div>
        )}

        {/* Tab: Google Website Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {loadingAnalytics || !analyticsData ? (
              <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <>
                {/* 1. Scorecards Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {/* Website Visitors card */}
                  <div className="aesthetic-card rounded-2xl p-5 flex flex-col justify-between min-h-[110px]">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">30d Unique Visitors</span>
                    <span className="text-xl sm:text-2xl font-black text-foreground mt-2">
                      {analyticsData.totalVisitors30d?.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-500 font-semibold mt-1">▲ 14.8% vs last month</span>
                  </div>

                  {/* Active Users card */}
                  <div className="aesthetic-card rounded-2xl p-5 flex flex-col justify-between min-h-[110px]">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Active Users (DAU / MAU)</span>
                    <span className="text-xl sm:text-2xl font-black text-foreground mt-2">
                      {analyticsData.dau} / {analyticsData.mau}
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-1">DAU/MAU Ratio: {((analyticsData.dau / analyticsData.mau) * 100).toFixed(1)}%</span>
                  </div>

                  {/* Leads generated card */}
                  <div className="aesthetic-card rounded-2xl p-5 flex flex-col justify-between min-h-[110px]">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Leads Generated (30d)</span>
                    <span className="text-xl sm:text-2xl font-black text-foreground mt-2">
                      {analyticsData.totalLeads30d}
                    </span>
                    <span className="text-[10px] text-emerald-500 font-semibold mt-1">▲ 8.3% conversion velocity</span>
                  </div>

                  {/* Signup conversion rate */}
                  <div className="aesthetic-card rounded-2xl p-5 flex flex-col justify-between min-h-[110px]">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Conversion Rates</span>
                    <div className="space-y-1 mt-2">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-muted-foreground">Visits → Signup:</span>
                        <span className="text-foreground">{analyticsData.conversions?.visitorSignup}%</span>
                      </div>
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-muted-foreground">Signup → Planter:</span>
                        <span className="text-foreground">{analyticsData.conversions?.signupPlanter}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Recharts Graph Component */}
                <AnalyticsCharts data={analyticsData} />

                {/* 3. Service Performance Grid */}
                <div className="aesthetic-card rounded-3xl p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary">
                      Service Performance Metrics (Google Core Vitals)
                    </h3>
                    <p className="text-xs text-muted-foreground">Real-time system performance index and resource optimization tracking.</p>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pt-2">
                    <div className="border border-border/80 bg-muted/10 rounded-2xl p-4 text-center space-y-1.5">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Page Load</span>
                      <span className="text-lg font-black text-emerald-500">{analyticsData.performance?.pageLoadTime}</span>
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-bold text-emerald-600 dark:text-emerald-400">Excellent</span>
                    </div>

                    <div className="border border-border/80 bg-muted/10 rounded-2xl p-4 text-center space-y-1.5">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Server Resp</span>
                      <span className="text-lg font-black text-emerald-500">{analyticsData.performance?.serverResponse}</span>
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-bold text-emerald-600 dark:text-emerald-400">Excellent</span>
                    </div>

                    <div className="border border-border/80 bg-muted/10 rounded-2xl p-4 text-center space-y-1.5">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">DB Latency</span>
                      <span className="text-lg font-black text-emerald-500">{analyticsData.performance?.dbQueryLatency}</span>
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-bold text-emerald-600 dark:text-emerald-400">Excellent</span>
                    </div>

                    <div className="border border-border/80 bg-muted/10 rounded-2xl p-4 text-center space-y-1.5">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">API Success</span>
                      <span className="text-lg font-black text-emerald-500">{analyticsData.performance?.apiSuccessRate}</span>
                      <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[8px] font-bold text-emerald-600 dark:text-emerald-400">Healthy</span>
                    </div>

                    <div className="border border-border/80 bg-muted/10 rounded-2xl p-4 text-center space-y-1.5">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Server CPU</span>
                      <span className="text-lg font-black text-foreground">{analyticsData.performance?.serverCpuUsage}</span>
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-bold text-primary">Normal</span>
                    </div>

                    <div className="border border-border/80 bg-muted/10 rounded-2xl p-4 text-center space-y-1.5">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Mem Usage</span>
                      <span className="text-lg font-black text-foreground">{analyticsData.performance?.memoryUsage}</span>
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[8px] font-bold text-primary">Normal</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Tab 2: Verifications */}
        {activeTab === 'verifications' && (
          <div className="aesthetic-card rounded-3xl p-5 sm:p-6 space-y-4">
            <h2 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary border-b border-border pb-3">
              Review Plantation Verification Submissions
            </h2>

            {pendingList.length > 0 ? (
              <div className="space-y-6">
                {pendingList.map((rec) => (
                  <div key={rec.id} className="rounded-2xl border border-border/80 bg-muted/20 p-5 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                    <div className="flex flex-col md:flex-row gap-4 items-start">
                      {rec.imageUrl && (
                        <div className="shrink-0 block overflow-hidden rounded-xl border border-border">
                          {rec.imageUrl.startsWith('data:video/') ? (
                            <video src={rec.imageUrl} controls className="h-24 w-24 object-cover" />
                          ) : (
                            <a href={rec.imageUrl} target="_blank" rel="noopener noreferrer" className="hover:opacity-95">
                              <img src={rec.imageUrl} alt="Submitted Photo" className="h-24 w-24 object-cover" />
                            </a>
                          )}
                        </div>
                      )}
                      
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-extrabold text-foreground text-sm sm:text-base">{rec.name}</h3>
                          <span className="rounded bg-primary/10 text-primary px-1.5 py-0.5 text-[9px] font-bold uppercase">{rec.district}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Village: <strong>{rec.village}</strong> • Location: <strong>{rec.location}</strong></p>
                        <p className="text-xs text-muted-foreground">Mobile: <strong>{rec.mobile}</strong> • Date: <strong>{new Date(rec.date).toLocaleDateString()}</strong></p>
                        <p className="text-xs text-primary font-bold">Species: {rec.species} ({rec.treeCount} saplings)</p>
                        {rec.notes && <p className="text-xs italic text-muted-foreground leading-normal mt-1 border-l-2 border-border pl-2">"{rec.notes}"</p>}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 self-end md:self-auto pt-2 border-t md:border-t-0 border-border/40 w-full md:w-auto justify-end">
                      <button
                        onClick={() => handleVerify(rec.id, 'REJECT')}
                        disabled={verifyingId === rec.id}
                        className="flex items-center justify-center gap-1 rounded-full border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/20 dark:hover:bg-red-950/40 px-4 py-2 text-xs font-bold transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span>{t('admin_reject_btn')}</span>
                      </button>
                      <button
                        onClick={() => handleVerify(rec.id, 'APPROVE')}
                        disabled={verifyingId === rec.id}
                        className="flex items-center justify-center gap-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-colors"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>{t('admin_approve_btn')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-center text-muted-foreground py-8 border border-dashed border-border rounded-2xl">All verifications are up-to-date! No pending submissions.</p>
            )}
          </div>
        )}

        {/* Tab 3: Users */}
        {activeTab === 'users' && (
          <div className="aesthetic-card rounded-3xl p-5 sm:p-6 space-y-4">
            <h2 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary border-b border-border pb-3">
              Volunteers Directory & Account Controls
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-semibold">
                    <th className="pb-3 pr-4">Display Name</th>
                    <th className="pb-3 px-4">Contact Info</th>
                    <th className="pb-3 px-4">Verification</th>
                    <th className="pb-3 px-4">Role Promotion</th>
                    <th className="pb-3 px-4">Account Status</th>
                    <th className="pb-3 px-4 text-center">Trees</th>
                    <th className="pb-3 pl-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {usersList.map(u => (
                    <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                      <td className="py-3.5 pr-4 font-bold text-foreground">{u.displayName}</td>
                      <td className="py-3.5 px-4 text-muted-foreground flex flex-col justify-center gap-0.5">
                        <span className="font-semibold text-foreground">@{u.username}</span>
                        <span className="text-[10px] text-muted-foreground">{u.email}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleUserVerify(u.id)}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                            u.isVerified
                              ? 'bg-emerald-50 text-emerald-600 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400'
                              : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          <span>{u.isVerified ? 'Verified' : 'Unverified'}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleUserRole(u.id)}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold border transition-colors ${
                            u.role === 'ADMIN'
                              ? 'bg-accent/10 text-accent border-accent/20'
                              : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          {u.role}
                        </button>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleUserSuspend(u.id)}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                            u.isSuspended
                              ? 'bg-red-50 text-red-650 border-red-200 dark:bg-red-950/20 dark:text-red-400'
                              : 'bg-emerald-50 text-emerald-600 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400'
                          }`}
                        >
                          <span>{u.isSuspended ? 'Suspended' : 'Active'}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-primary">{u.totalTrees}</td>
                      <td className="py-3.5 pl-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setEditUserDisplayName(u.displayName);
                              setEditUserEmail(u.email);
                            }}
                            className="inline-flex items-center justify-center p-2 rounded-full text-foreground hover:bg-muted transition-colors border border-border"
                            title="Edit User Details"
                          >
                            <Edit3 className="h-3.5 w-3.5 text-primary" />
                          </button>
                          <button
                            onClick={() => handleAdminDeleteUser(u.id)}
                            className="inline-flex items-center justify-center p-2 rounded-full text-red-650 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors border border-red-200"
                            title="Delete User"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* User Edit Modal */}
            {editingUser && (
              <div className="fixed inset-0 z-55 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
                <div className="w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
                  <h3 className="text-base sm:text-lg font-extrabold text-foreground flex items-center gap-2">
                    <Edit3 className="h-5 w-5 text-primary" />
                    <span>Edit Volunteer Profile</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-4 pb-2 border-b border-border">
                    Modify display name and email address for @{editingUser.username}.
                  </p>

                  <form onSubmit={handleSaveUserEdit} className="space-y-4 text-xs">
                    <div>
                      <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Display Name</label>
                      <input
                        type="text"
                        required
                        value={editUserDisplayName}
                        onChange={(e) => setEditUserDisplayName(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Email Address</label>
                      <input
                        type="email"
                        required
                        value={editUserEmail}
                        onChange={(e) => setEditUserEmail(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                      <button
                        type="button"
                        onClick={() => setEditingUser(null)}
                        className="rounded-full px-5 py-2 font-bold hover:bg-muted text-muted-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="rounded-full bg-primary hover:bg-secondary text-primary-foreground font-semibold px-6 py-2"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Manual Entry */}
        {activeTab === 'manual' && (
          <div className="aesthetic-card rounded-3xl p-5 sm:p-6 max-w-xl space-y-4">
            <h2 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary border-b border-border pb-3">
              {t('admin_add_manual')}
            </h2>
            <p className="text-xs text-muted-foreground">
              Add tree plantation records directly (e.g. for guest sign-ups, corporate drives, or offline logs).
            </p>

            {manualSuccess && (
              <div className="rounded-xl bg-emerald-500 text-white p-3 text-xs font-semibold flex items-center gap-2">
                <Check className="h-4 w-4 shrink-0" />
                <span>Manual plantation record added and approved successfully!</span>
              </div>
            )}

            <form onSubmit={handleManualEntry} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">User / Recipient Email</label>
                  <input
                    type="email"
                    required
                    placeholder="volunteer@gmail.com"
                    value={manualEmail}
                    onChange={(e) => setManualEmail(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">District</label>
                  <select
                    value={manualDistrict}
                    onChange={(e) => setManualDistrict(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {DISTRICTS_LIST.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Village / Town</label>
                  <input
                    type="text"
                    placeholder="e.g. Jorhat Town"
                    value={manualVillage}
                    onChange={(e) => setManualVillage(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Location details</label>
                  <input
                    type="text"
                    placeholder="e.g. Public Park campus"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Trees Planted Count</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={manualCount}
                    onChange={(e) => setManualCount(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Tree Species</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nahor, Krishnachura"
                    value={manualSpecies}
                    onChange={(e) => setManualSpecies(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Date of Plantation</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border mt-6">
                <button
                  type="submit"
                  disabled={manualSubmitting}
                  className="rounded-full bg-primary hover:bg-secondary text-primary-foreground font-semibold px-6 py-2 text-xs shadow-sm"
                >
                  {manualSubmitting ? 'Logging...' : 'Save Manual Record'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 5: Community Groups */}
        {activeTab === 'groups' && (
          <div className="aesthetic-card rounded-3xl p-5 sm:p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary">
                Community Groups Control
              </h2>
              <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold">
                {groupsList.length} Groups
              </span>
            </div>

            {groupsList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-semibold">
                      <th className="pb-3 pr-4">Group Name</th>
                      <th className="pb-3 px-4">Creator</th>
                      <th className="pb-3 px-4">Type</th>
                      <th className="pb-3 px-4">Members</th>
                      <th className="pb-3 px-4">Created Date</th>
                      <th className="pb-3 pl-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {groupsList.map((g) => (
                      <tr key={g.id} className="hover:bg-muted/10 transition-colors">
                        <td className="py-3.5 pr-4 font-bold text-foreground">
                          <div>
                            <span className="block text-sm font-extrabold">{g.name}</span>
                            {g.description && <span className="block text-[11px] font-normal text-muted-foreground mt-0.5 line-clamp-1">{g.description}</span>}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {g.creator ? (
                            <div>
                              <span className="block font-semibold text-foreground">{g.creator.displayName}</span>
                              <span className="block text-[10px]">@{g.creator.username}</span>
                            </div>
                          ) : (
                            'System'
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="rounded bg-secondary/15 text-primary px-2 py-0.5 text-[10px] font-bold uppercase">
                            {g.type}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-foreground">{g.membersCount}</td>
                        <td className="py-3.5 px-4 text-muted-foreground">
                          {new Date(g.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 pl-4 text-right">
                          <div className="flex justify-end items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedAdminGroupId(g.id);
                                setSelectedGroupTab('highlights');
                                setGroupPastWorks(g.pastWorks || '');
                                setGroupMemories(g.memories || '');
                                setGroupNextPlan(g.nextPlan || '');
                                setGroupMediaUrls(g.mediaUrls || '');
                              }}
                              className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-2.5 py-1 text-[10px] font-bold text-foreground hover:bg-muted transition-colors shadow-sm"
                            >
                              Manage
                            </button>
                            <button
                              onClick={() => handleDeleteGroup(g.id)}
                              className="inline-flex items-center justify-center p-1.5 rounded-full text-red-600 hover:bg-red-55/20 transition-colors"
                              title="Delete Group"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-center text-muted-foreground py-8 border border-dashed border-border rounded-2xl">
                No community groups found.
              </p>
            )}

            {/* Admin Group Details Moderation Modal */}
            {selectedAdminGroupId && (() => {
              const selectedGroup = groupsList.find(g => g.id === selectedAdminGroupId);
              if (!selectedGroup) return null;
              const members = selectedGroup.members || [];
              const messages = selectedGroup.messages || [];

              return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
                  <div className="w-full max-w-4xl h-[80vh] bg-card border border-border/80 rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center border-b border-border pb-4">
                      <div>
                        <h3 className="font-extrabold text-foreground text-base sm:text-lg">Moderating: {selectedGroup.name}</h3>
                        <span className="text-[10px] text-muted-foreground font-semibold">Group ID: {selectedGroup.id}</span>
                      </div>
                      <button
                        onClick={() => setSelectedAdminGroupId(null)}
                        className="rounded-full border border-border p-1.5 text-muted-foreground hover:bg-muted"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Sub-tabs menu inside the Group Moderation Modal */}
                    <div className="flex gap-2 border-b border-border pb-2.5 my-3">
                      <button
                        type="button"
                        onClick={() => setSelectedGroupTab('highlights')}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                          selectedGroupTab === 'highlights'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        Highlights & Memories
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedGroupTab('members')}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                          selectedGroupTab === 'members'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        Members ({members.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedGroupTab('chat')}
                        className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                          selectedGroupTab === 'chat'
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                        }`}
                      >
                        Chat Log ({messages.length})
                      </button>
                    </div>

                    {/* Tab content inside the Group Moderation Modal */}
                    <div className="flex-1 overflow-y-auto my-4 min-h-0 flex flex-col">
                      {selectedGroupTab === 'highlights' && (
                        <form onSubmit={handleSaveGroupDetails} className="space-y-4 text-xs flex-1 pr-2">
                          <div>
                            <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                              Past Works Highlight (প্ৰাক্তন কাম)
                            </label>
                            <textarea
                              rows={3}
                              placeholder="E.g., Planted 250 Nahor saplings at Kahilipara Hills in March 2026."
                              value={groupPastWorks}
                              onChange={(e) => setGroupPastWorks(e.target.value)}
                              className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>

                          <div>
                            <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                              Memories & Short Story (স্মৃতি আৰু কাহিনী)
                            </label>
                            <textarea
                              rows={3}
                              placeholder="E.g., A beautiful sunny morning where 50 volunteers joined hands and sang Zubeen Garg's environment songs while digging the soil."
                              value={groupMemories}
                              onChange={(e) => setGroupMemories(e.target.value)}
                              className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>

                          <div>
                            <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                              Next Plantation Plan / Goals (পৰৱৰ্তী পৰিকল্পনা)
                            </label>
                            <textarea
                              rows={3}
                              placeholder="E.g., Planting 500 Nahor and Bokul trees on World Environment Day (June 5) at Assam State Zoo outskirts."
                              value={groupNextPlan}
                              onChange={(e) => setGroupNextPlan(e.target.value)}
                              className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                          </div>

                          <div>
                            <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                              Group Media Gallery (Photos & Videos)
                            </label>
                            <div className="space-y-3">
                              {/* Thumbnails grid */}
                              {groupMediaUrls ? (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border border-border bg-card p-2 rounded-2xl">
                                  {groupMediaUrls.split(',').filter(Boolean).map((url, index) => {
                                    const trimmedUrl = url.trim();
                                    const isVideo = trimmedUrl.startsWith('data:video/') || trimmedUrl.endsWith('.mp4') || trimmedUrl.endsWith('.mov') || trimmedUrl.endsWith('.webm') || trimmedUrl.includes('video');
                                    return (
                                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-border bg-muted/40 group">
                                        {isVideo ? (
                                          <video src={trimmedUrl} className="w-full h-full object-cover" />
                                        ) : (
                                          <img src={trimmedUrl} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                        )}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const urls = groupMediaUrls.split(',').filter(Boolean);
                                            urls.splice(index, 1);
                                            setGroupMediaUrls(urls.join(','));
                                          }}
                                          className="absolute top-1 right-1 rounded-full bg-black/70 hover:bg-black text-white p-1 shadow-md transition-all scale-90"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : null}

                              {/* File selector zone */}
                              <div className="relative border-2 border-dashed border-border/80 hover:border-primary rounded-2xl p-4 transition-all bg-muted/20 hover:bg-muted/30 group flex flex-col items-center justify-center text-center cursor-pointer min-h-[90px]">
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*,video/*"
                                  onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    let loadedCount = 0;
                                    const newUrls: string[] = [];
                                    
                                    if (files.length === 0) return;

                                    files.forEach((file) => {
                                      if (file.size > 15 * 1024 * 1024) {
                                        alert(`File "${file.name}" exceeds 15MB size limit.`);
                                        return;
                                      }
                                      
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        newUrls.push(reader.result as string);
                                        loadedCount++;
                                        
                                        if (loadedCount === files.length) {
                                          const current = groupMediaUrls ? groupMediaUrls.split(',').filter(Boolean) : [];
                                          setGroupMediaUrls([...current, ...newUrls].join(','));
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    });
                                  }}
                                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className="space-y-1">
                                  <div className="mx-auto h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Camera className="h-4 w-4" />
                                  </div>
                                  <div>
                                    <span className="text-[10px] font-bold text-foreground block">Select & Add Media from Gallery</span>
                                    <span className="text-[9px] text-muted-foreground block">Supports multiple images & videos (up to 15MB each)</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-border mt-4 flex justify-end">
                            <button
                              type="submit"
                              disabled={savingGroupDetails}
                              className="rounded-xl bg-primary hover:bg-secondary text-primary-foreground font-semibold px-6 py-2.5 text-xs shadow-sm transition-colors"
                            >
                              {savingGroupDetails ? 'Saving...' : 'Save Highlights & Media'}
                            </button>
                          </div>
                        </form>
                      )}

                      {selectedGroupTab === 'members' && (
                        <div className="flex-1 overflow-y-auto pr-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
                            Members Directory ({members.length})
                          </h4>
                          {members.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {members.map((mem: any) => (
                                <div key={mem.user.id} className="rounded-xl border border-border bg-muted/10 p-3 flex justify-between items-center gap-4">
                                  <div className="min-w-0">
                                    <span className="block font-bold text-foreground text-xs">{mem.user.displayName}</span>
                                    <span className="block text-[10px] text-muted-foreground truncate">@{mem.user.username} • {mem.user.email}</span>
                                  </div>
                                  <button
                                    onClick={() => handleAdminRemoveGroupMember(selectedGroup.id, mem.user.id)}
                                    className="rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/20 px-2.5 py-1 text-[10px] font-bold transition-colors shrink-0"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">No members in this group.</p>
                          )}
                        </div>
                      )}

                      {selectedGroupTab === 'chat' && (
                        <div className="flex-1 overflow-y-auto pr-2">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
                            Chat Log Moderation ({messages.length})
                          </h4>
                          {messages.length > 0 ? (
                            <div className="space-y-3">
                              {messages.map((msg: any) => (
                                <div key={msg.id} className="rounded-xl border border-border bg-card p-3 flex justify-between items-start gap-4">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mb-1 font-semibold">
                                      <span className="text-foreground font-extrabold">{msg.user?.displayName || 'Unknown'}</span>
                                      <span>@{msg.user?.username}</span> •
                                      <span>{new Date(msg.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                  </div>
                                  <button
                                    onClick={() => handleAdminDeleteGroupMessage(msg.id)}
                                    className="rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 text-red-650 p-1 transition-colors shrink-0"
                                    title="Delete Message"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground italic">No messages sent in this group chat.</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border pt-4 flex justify-end">
                      <button
                        onClick={() => setSelectedAdminGroupId(null)}
                        className="rounded-full bg-primary hover:bg-secondary text-primary-foreground font-semibold px-6 py-2 text-xs transition-colors"
                      >
                        Close Panel
                      </button>
                    </div>

                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Tab 6: Event Management */}
        {activeTab === 'events' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Event Scheduler Form */}
            <div className="lg:col-span-4 aesthetic-card rounded-3xl p-5 sm:p-6 space-y-4">
              <h2 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary border-b border-border pb-3">
                Schedule Event Drive
              </h2>
              <form onSubmit={handleCreateEvent} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Event Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zubeen Nahor Plantation Drive"
                    value={eventTitle}
                    onChange={(e) => setEventTitle(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide details about target saplings, assembly point, etc."
                    value={eventDesc}
                    onChange={(e) => setEventDesc(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Date</label>
                    <input
                      type="date"
                      required
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">District</label>
                    <select
                      value={eventDist}
                      onChange={(e) => setEventDist(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      {DISTRICTS_LIST.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nehru Park Campus"
                    value={eventLoc}
                    onChange={(e) => setEventLoc(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Cover Image (Optional)</label>
                  {eventImg ? (
                    <div className="relative rounded-2xl overflow-hidden border border-border bg-muted/10 p-2">
                      <div className="relative h-20 w-full overflow-hidden rounded-xl">
                        <img src={eventImg} alt="Event Cover Preview" className="w-full h-full object-cover rounded-xl" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setEventImg('')}
                        className="absolute top-4 right-4 rounded-full bg-black/60 hover:bg-black/80 text-white p-1 backdrop-blur-sm transition-all"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-border/80 hover:border-primary rounded-2xl p-2 transition-all bg-muted/20 hover:bg-muted/30 group flex flex-col items-center justify-center text-center cursor-pointer h-20">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 15 * 1024 * 1024) {
                              alert('File size must be less than 15MB. (ফাইলৰ আকাৰ ১৫এমবিতকৈ কম হ’ব লাগিব।)');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEventImg(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="space-y-0.5">
                        <div className="mx-auto h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Plus className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-[9px] font-bold text-foreground block">Upload Cover Photo</span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={eventSubmitting}
                  className="w-full rounded-xl bg-primary hover:bg-secondary text-primary-foreground font-semibold py-2.5 text-xs shadow-sm transition-colors"
                >
                  {eventSubmitting ? 'Creating Event...' : 'Schedule Event Drive'}
                </button>
              </form>
            </div>

            {/* Event Listing and Attendees management */}
            <div className="lg:col-span-8 space-y-6">
              <div className="aesthetic-card rounded-3xl p-5 sm:p-6 space-y-4">
                <h2 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary border-b border-border pb-3">
                  Scheduled Events & Registrations
                </h2>

                {eventsList.length > 0 ? (
                  <div className="space-y-6">
                    {eventsList.map((evt) => {
                      const attendees = evt.registrations || [];
                      return (
                        <div key={evt.id} className="rounded-2xl border border-border bg-muted/10 p-5 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                            <div>
                              <h3 className="font-extrabold text-foreground text-sm sm:text-base">{evt.title}</h3>
                              <p className="text-xs text-muted-foreground mt-1">{evt.description}</p>
                              <div className="flex flex-wrap gap-2.5 mt-2.5 text-[11px] text-muted-foreground font-medium">
                                <span className="rounded bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-bold uppercase">
                                  {evt.district}
                                </span>
                                <span>📍 {evt.location}</span>
                                <span>📅 {evt.date ? new Date(evt.date).toLocaleDateString() : ''}</span>
                                <span>👥 {evt.attendeesCount} Registered</span>
                              </div>
                            </div>
                            <div className="flex gap-2 self-end sm:self-auto shrink-0">
                              <button
                                onClick={() => handleOpenAdminEditEvent(evt)}
                                className="flex items-center justify-center gap-1 rounded-full border border-border bg-card hover:bg-muted text-foreground px-3.5 py-1.5 text-xs font-bold transition-colors shadow-sm"
                              >
                                <Edit3 className="h-3.5 w-3.5 text-primary" />
                                <span>Edit Event</span>
                              </button>
                              <button
                                onClick={() => handleDeleteEvent(evt.id)}
                                className="flex items-center justify-center gap-1 rounded-full border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/20 dark:hover:bg-red-950/40 px-3.5 py-1.5 text-xs font-bold transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Cancel Event</span>
                              </button>
                            </div>
                          </div>

                          {/* Event Registrations Management */}
                          <div className="border-t border-border/60 pt-4 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                                Registered Volunteers ({attendees.length})
                              </h4>
                              {/* Manual Registration Dropdown */}
                              <div className="flex items-center gap-2">
                                <select
                                  id={`reg-select-${evt.id}`}
                                  className="rounded-lg border border-border bg-card px-2.5 py-1.5 text-[11px] text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                  defaultValue=""
                                >
                                  <option value="" disabled>Select volunteer...</option>
                                  {usersList
                                    .filter(u => !attendees.some((a: any) => a.user.id === u.id))
                                    .map(u => (
                                      <option key={u.id} value={u.id}>
                                        {u.displayName} (@{u.username})
                                      </option>
                                    ))
                                  }
                                </select>
                                <button
                                  onClick={() => {
                                    const selectEl = document.getElementById(`reg-select-${evt.id}`) as HTMLSelectElement;
                                    if (selectEl && selectEl.value) {
                                      handleRegisterUserForEvent(evt.id, selectEl.value);
                                      selectEl.value = "";
                                    } else {
                                      alert("Please select a volunteer from the dropdown.");
                                    }
                                  }}
                                  className="rounded-lg bg-primary hover:bg-secondary text-primary-foreground font-semibold px-3 py-1.5 text-[11px] shadow-sm transition-colors"
                                >
                                  Register
                                </button>
                              </div>
                            </div>

                            {attendees.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {attendees.map((att: any) => (
                                  <div
                                    key={att.id}
                                    className="flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-[11px] text-foreground shadow-sm"
                                  >
                                    <span className="font-semibold">{att.user.displayName}</span>
                                    <span className="text-muted-foreground text-[10px]">(@{att.user.username})</span>
                                    <button
                                      onClick={() => handleCancelRegistration(evt.id, att.user.id)}
                                      className="text-red-500 hover:text-red-700 transition-colors p-0.5"
                                      title="Remove registration"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[11px] text-muted-foreground italic">No registered attendees yet.</p>
                            )}
                          </div>

                          {/* Event Announcements Management */}
                          <div className="border-t border-border/60 pt-4 space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                              Organizer Broadcasts ({evt.messages?.length || 0})
                            </h4>
                            {evt.messages && evt.messages.length > 0 ? (
                              <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                                {evt.messages.map((msg: any) => (
                                  <div key={msg.id} className="rounded-xl border border-border bg-card p-3 flex justify-between items-start gap-4">
                                    <div className="min-w-0">
                                      <p className="text-xs text-foreground font-medium leading-relaxed">{msg.content}</p>
                                      <span className="block text-[9px] text-muted-foreground mt-1">Broadcasted on {new Date(msg.createdAt).toLocaleString()}</span>
                                    </div>
                                    <button
                                      onClick={() => handleAdminDeleteEventMessage(msg.id)}
                                      className="rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 p-1 transition-colors shrink-0"
                                      title="Delete Broadcast Message"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[11px] text-muted-foreground italic">No announcements broadcasted yet.</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-center text-muted-foreground py-8 border border-dashed border-border rounded-2xl">
                    No scheduled events found.
                  </p>
                )}
              </div>
            </div>

            {/* Admin Event Edit Modal */}
            {editingAdminEvent && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md p-4 overflow-y-auto">
                <div className="w-full max-w-lg bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8">
                  <h3 className="text-base sm:text-lg font-extrabold text-foreground flex items-center gap-2">
                    <Edit3 className="h-5 w-5 text-primary" />
                    <span>Edit Event Drive Settings</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 mb-4 pb-2 border-b border-border">
                    Modify the properties, day schedule, guidelines, and media gallery for this plantation drive.
                  </p>

                  <form onSubmit={handleSaveAdminEventEdit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Drive Title</label>
                        <input
                          type="text"
                          required
                          value={editAdminTitle}
                          onChange={(e) => setEditAdminTitle(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Chief Guest</label>
                        <input
                          type="text"
                          placeholder="e.g. Zubeen Garg"
                          value={editAdminChiefGuest}
                          onChange={(e) => setEditAdminChiefGuest(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Date</label>
                        <input
                          type="date"
                          required
                          value={editAdminDate}
                          onChange={(e) => setEditAdminDate(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">District</label>
                        <select
                          value={editAdminDist}
                          onChange={(e) => setEditAdminDist(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {DISTRICTS_LIST.map((dist) => (
                            <option key={dist} value={dist}>
                              {dist}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Location details</label>
                        <input
                          type="text"
                          required
                          value={editAdminLoc}
                          onChange={(e) => setEditAdminLoc(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Target/Planted Trees</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={editAdminTreesPlanted}
                          onChange={(e) => setEditAdminTreesPlanted(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Drive Status</label>
                        <select
                          value={editAdminStatus}
                          onChange={(e) => setEditAdminStatus(e.target.value)}
                          className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-semibold text-primary"
                        >
                          <option value="UPCOMING">Upcoming (সক্ৰিয়)</option>
                          <option value="COMPLETED">Completed (সমাপ্ত)</option>
                          <option value="CANCELLED">Cancelled (বাতিল কৰা হৈছে)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Cover Image</label>
                        {editAdminImg ? (
                          <div className="relative rounded-2xl overflow-hidden border border-border bg-muted/10 p-2">
                            <div className="relative h-20 w-full overflow-hidden rounded-xl">
                              <img src={editAdminImg} alt="Event Cover Preview" className="w-full h-full object-cover rounded-xl" />
                            </div>
                            <button
                              type="button"
                              onClick={() => setEditAdminImg('')}
                              className="absolute top-4 right-4 rounded-full bg-black/60 hover:bg-black/80 text-white p-1 backdrop-blur-sm transition-all"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="relative border-2 border-dashed border-border/80 hover:border-primary rounded-2xl p-2 transition-all bg-muted/20 hover:bg-muted/30 group flex flex-col items-center justify-center text-center cursor-pointer h-20">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  if (file.size > 15 * 1024 * 1024) {
                                    alert('File size must be less than 15MB. (ফাইলৰ আকাৰ ১৫এমবিতকৈ কম হ’ব লাগিব।)');
                                    return;
                                  }
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    setEditAdminImg(reader.result as string);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="space-y-0.5">
                              <div className="mx-auto h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Plus className="h-3.5 w-3.5" />
                              </div>
                              <span className="text-[9px] font-bold text-foreground block">Upload Cover Photo</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Description</label>
                      <textarea
                        rows={2}
                        required
                        value={editAdminDesc}
                        onChange={(e) => setEditAdminDesc(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                      />
                    </div>

                    <div>
                      <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Timeline Schedule (newline separated time - activity)
                      </label>
                      <textarea
                        rows={3}
                        placeholder="e.g.&#10;09:00 AM - Assemble&#10;10:00 AM - Plant saplings"
                        value={editAdminSchedule}
                        onChange={(e) => setEditAdminSchedule(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Downloadable Documents (comma separated Title:URL)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g., Guidelines:https://example.com/guide.pdf, Maps:https://example.com/map.jpg"
                        value={editAdminDocuments}
                        onChange={(e) => setEditAdminDocuments(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>

                    {editAdminStatus === 'COMPLETED' && (
                      <>
                        <div>
                          <label className="block font-bold uppercase tracking-wider text-emerald-650 dark:text-emerald-400 mb-1.5 font-sans">
                            Drive Memories (Story / Experience Recap)
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Share a short recap of what happened during the drive..."
                            value={editAdminMemories}
                            onChange={(e) => setEditAdminMemories(e.target.value)}
                            className="w-full rounded-xl border border-emerald-250 dark:border-emerald-955 bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                        </div>

                        <div>
                          <label className="block font-bold uppercase tracking-wider text-emerald-650 dark:text-emerald-400 mb-1.5 font-sans">
                            Photo & Video Gallery Media
                          </label>
                          <div className="space-y-3">
                            {/* Thumbnails grid */}
                            {editAdminMediaUrls ? (
                              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border border-border bg-card p-2 rounded-2xl">
                                {editAdminMediaUrls.split(',').filter(Boolean).map((url, index) => {
                                  const trimmedUrl = url.trim();
                                  const isVideo = trimmedUrl.startsWith('data:video/') || trimmedUrl.endsWith('.mp4') || trimmedUrl.endsWith('.mov') || trimmedUrl.endsWith('.webm') || trimmedUrl.includes('video');
                                  return (
                                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-border bg-muted/40 group">
                                      {isVideo ? (
                                        <video src={trimmedUrl} className="w-full h-full object-cover" />
                                      ) : (
                                        <img src={trimmedUrl} alt={`Gallery ${index}`} className="w-full h-full object-cover" />
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const urls = editAdminMediaUrls.split(',').filter(Boolean);
                                          urls.splice(index, 1);
                                          setEditAdminMediaUrls(urls.join(','));
                                        }}
                                        className="absolute top-1 right-1 rounded-full bg-black/70 hover:bg-black text-white p-1 shadow-md transition-all scale-90"
                                      >
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : null}

                            {/* File selector zone */}
                            <div className="relative border-2 border-dashed border-emerald-200 dark:border-emerald-900/60 hover:border-emerald-500 rounded-2xl p-4 transition-all bg-emerald-50/5 dark:bg-emerald-950/5 hover:bg-emerald-500/10 group flex flex-col items-center justify-center text-center cursor-pointer min-h-[90px]">
                              <input
                                type="file"
                                multiple
                                accept="image/*,video/*"
                                onChange={(e) => {
                                  const files = Array.from(e.target.files || []);
                                  let loadedCount = 0;
                                  const newUrls: string[] = [];
                                  
                                  if (files.length === 0) return;

                                  files.forEach((file) => {
                                    if (file.size > 15 * 1024 * 1024) {
                                      alert(`File "${file.name}" exceeds 15MB size limit.`);
                                      return;
                                    }
                                    
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      newUrls.push(reader.result as string);
                                      loadedCount++;
                                      
                                      if (loadedCount === files.length) {
                                        const current = editAdminMediaUrls ? editAdminMediaUrls.split(',').filter(Boolean) : [];
                                        setEditAdminMediaUrls([...current, ...newUrls].join(','));
                                      }
                                    };
                                    reader.readAsDataURL(file);
                                  });
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div className="space-y-1">
                                <div className="mx-auto h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform">
                                  <Camera className="h-4 w-4" />
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold text-foreground block">Select & Add Media from Gallery</span>
                                  <span className="text-[9px] text-muted-foreground block">Supports multiple images & videos (up to 15MB each)</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                      <button
                        type="button"
                        onClick={() => setEditingAdminEvent(null)}
                        className="rounded-full px-5 py-2 font-bold hover:bg-muted text-muted-foreground"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={editAdminSubmitting}
                        className="rounded-full bg-primary hover:bg-secondary text-primary-foreground font-semibold px-6 py-2.5 shadow-sm"
                      >
                        {editAdminSubmitting ? 'Saving...' : 'Save Drive Details'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 7: Badge Distribution */}
        {activeTab === 'badges' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Badge Issuance Form */}
            <div className="lg:col-span-4 aesthetic-card rounded-3xl p-5 sm:p-6 space-y-4">
              <h2 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary border-b border-border pb-3">
                Award Badge Manually
              </h2>
              <form onSubmit={handleAwardBadge} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Select Volunteer</label>
                  <select
                    required
                    value={badgeUserId}
                    onChange={(e) => setBadgeUserId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="" disabled>-- Select Volunteer --</option>
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.displayName} (@{u.username}) - {u.totalTrees} trees
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Badge Tier</label>
                  <select
                    value={badgeName}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBadgeName(val);
                      if (val === 'Green Warrior') {
                        setBadgeCode('WARRIOR');
                        setBadgeDesc('Awarded for planting 10+ trees.');
                      } else if (val === 'Nature Protector') {
                        setBadgeCode('PROTECTOR');
                        setBadgeDesc('Awarded for outstanding tree care and planting 50+ trees.');
                      } else if (val === 'Zubeen Nahor Champion') {
                        setBadgeCode('CHAMPION');
                        setBadgeDesc('Awarded for exceptional leadership in Zubeen Nahor drives.');
                      }
                    }}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Green Warrior">Green Warrior (WARRIOR)</option>
                    <option value="Nature Protector">Nature Protector (PROTECTOR)</option>
                    <option value="Zubeen Nahor Champion">Zubeen Nahor Champion (CHAMPION)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Badge Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. Awarded for planting 10+ trees."
                    value={badgeDesc}
                    onChange={(e) => setBadgeDesc(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={badgeSubmitting}
                  className="w-full rounded-xl bg-primary hover:bg-secondary text-primary-foreground font-semibold py-2.5 text-xs shadow-sm transition-colors"
                >
                  {badgeSubmitting ? 'Awarding Badge...' : 'Award Badge'}
                </button>
              </form>
            </div>

            {/* Badge List */}
            <div className="lg:col-span-8 aesthetic-card rounded-3xl p-5 sm:p-6 space-y-4">
              <h2 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary border-b border-border pb-3">
                Awarded Badges Directory
              </h2>

              {badgesList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-semibold">
                        <th className="pb-3 pr-4">Badge</th>
                        <th className="pb-3 px-4">Recipient</th>
                        <th className="pb-3 px-4">Description</th>
                        <th className="pb-3 px-4">Awarded Date</th>
                        <th className="pb-3 pl-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {badgesList.map((b) => (
                        <tr key={b.id} className="hover:bg-muted/10 transition-colors">
                          <td className="py-3.5 pr-4 font-bold text-foreground">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                                <Award className="h-4 w-4" />
                              </div>
                              <div>
                                <span className="block font-extrabold">{b.name}</span>
                                <span className="block text-[9px] font-bold text-muted-foreground uppercase">{b.code}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground">
                            {b.user ? (
                              <div>
                                <span className="block font-semibold text-foreground">{b.user.displayName}</span>
                                <span className="block text-[10px]">@{b.user.username}</span>
                              </div>
                            ) : (
                              'Unknown Volunteer'
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground max-w-[200px] truncate" title={b.description}>
                            {b.description}
                          </td>
                          <td className="py-3.5 px-4 text-muted-foreground">
                            {new Date(b.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 pl-4 text-right">
                            <button
                              onClick={() => handleRevokeBadge(b.id)}
                              className="inline-flex items-center justify-center p-2 rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                              title="Revoke Badge"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-center text-muted-foreground py-8 border border-dashed border-border rounded-2xl">
                  No badges manually issued yet.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Tab 8: Social Feed Moderation */}
        {activeTab === 'feed' && (
          <div className="aesthetic-card rounded-3xl p-5 sm:p-6 space-y-6">
            <div className="flex justify-between items-center border-b border-border pb-3">
              <h2 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary">
                Social Feed Moderation
              </h2>
              <span className="rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold">
                {postsList.length} Posts
              </span>
            </div>

            {loadingPosts ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : postsList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {postsList.map((post) => {
                  const hasReports = post.reports && post.reports.length > 0;
                  return (
                    <div
                      key={post.id}
                      className={`rounded-2xl border p-5 flex flex-col justify-between space-y-4 bg-muted/10 transition-shadow hover:shadow-md ${
                        hasReports ? 'border-red-350 bg-red-500/5 dark:border-red-950/40' : 'border-border'
                      }`}
                    >
                      {/* Post Header / Author */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm">
                            {post.user.displayName ? post.user.displayName.substring(0, 2).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="font-extrabold text-foreground text-xs">{post.user.displayName}</span>
                              {post.user.isVerified && (
                                <span title="Verified Volunteer">
                                  <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                                </span>
                              )}
                            </div>
                            <span className="block text-[10px] text-muted-foreground">@{post.user.username}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            post.status === 'APPROVED'
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-250 dark:bg-emerald-950/20'
                              : post.status === 'REJECTED'
                              ? 'bg-red-50 text-red-650 border border-red-200 dark:bg-red-950/20'
                              : 'bg-amber-50 text-amber-600 border border-amber-250 dark:bg-amber-950/20'
                          }`}>
                            {post.status}
                          </span>
                          <span className="text-[9px] text-muted-foreground">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Tree count and location */}
                      <div className="flex flex-wrap gap-2 text-[10px]">
                        <span className="flex items-center gap-1 rounded bg-emerald-500/10 text-emerald-600 px-2 py-0.5 font-bold">
                          <Leaf className="h-3 w-3" />
                          <span>{post.treeCount} saplings</span>
                        </span>
                        {post.species && (
                          <span className="rounded bg-secondary/15 text-primary px-2 py-0.5 font-semibold">
                            {post.species}
                          </span>
                        )}
                        {post.location && (
                          <span className="text-muted-foreground py-0.5">
                            📍 {post.location} {post.district ? `(${post.district})` : ''}
                          </span>
                        )}
                      </div>

                      {/* Caption */}
                      {post.caption && (
                        <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                          {post.caption}
                        </p>
                      )}

                      {/* Media Preview */}
                      {(post.imageUrl || post.videoUrl) && (
                        <div className="overflow-hidden rounded-xl border border-border bg-black/5 max-h-48 flex items-center justify-center">
                          {post.videoUrl ? (
                            <video src={post.videoUrl} controls className="max-h-48 w-full object-contain" />
                          ) : (
                            <img src={post.imageUrl || undefined} alt="Feed Post Attachment" className="max-h-48 w-full object-contain" />
                          )}
                        </div>
                      )}

                      {/* Reports Section */}
                      {hasReports && (
                        <div className="rounded-xl border border-red-200 bg-red-50/50 dark:bg-red-950/10 p-3 space-y-1.5 text-[11px]">
                          <span className="flex items-center gap-1 text-red-650 font-bold">
                            <Flag className="h-3.5 w-3.5" />
                            <span>Reported Content ({post.reports.length} Flagged)</span>
                          </span>
                          <div className="divide-y divide-red-200/50 dark:divide-red-950/20 max-h-24 overflow-y-auto pr-1">
                            {post.reports.map((rep: any) => (
                              <div key={rep.id} className="py-1">
                                <p className="text-foreground font-semibold">"{rep.reason}"</p>
                                <span className="text-[9px] text-muted-foreground">
                                  Flagged by {rep.reporter.displayName} (@{rep.reporter.username})
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 justify-between items-center pt-2.5 border-t border-border">
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleModeratePostStatus(post.id, 'APPROVED')}
                            className={`rounded-full px-3 py-1.5 text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                              post.status === 'APPROVED'
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-card text-foreground hover:bg-muted border-border'
                            }`}
                          >
                            <Check className="h-3 w-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleModeratePostStatus(post.id, 'REJECTED')}
                            className={`rounded-full px-3 py-1.5 text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                              post.status === 'REJECTED'
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-card text-foreground hover:bg-muted border-border'
                            }`}
                          >
                            <X className="h-3 w-3" />
                            <span>Reject</span>
                          </button>
                        </div>

                        <button
                          onClick={() => handleAdminDeletePost(post.id)}
                          className="flex items-center justify-center p-1.5 rounded-full text-red-600 hover:bg-red-55/20 transition-colors border border-red-200"
                          title="Delete Post permanently"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Comments Moderation Accordion */}
                      <div className="pt-3 border-t border-border/60 space-y-2">
                        <span className="flex items-center gap-1 text-[11px] font-bold text-foreground">
                          <MessageSquare className="h-3.5 w-3.5 text-primary" />
                          <span>Comments Feed ({post.comments?.length || 0})</span>
                        </span>

                        {post.comments && post.comments.length > 0 ? (
                          <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                            {post.comments.map((comment: any) => (
                              <div
                                key={comment.id}
                                className="rounded-lg border border-border bg-card p-2.5 flex justify-between items-start gap-3 text-[11px]"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-semibold mb-0.5">
                                    <span className="text-foreground">{comment.user.displayName}</span>
                                    <span>@{comment.user.username}</span>
                                  </div>
                                  <p className="text-foreground font-medium leading-relaxed">{comment.content}</p>
                                </div>
                                <button
                                  onClick={() => handleAdminDeleteComment(post.id, comment.id)}
                                  className="text-red-500 hover:text-red-700 transition-colors p-0.5 shrink-0"
                                  title="Delete comment"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-muted-foreground italic">No comments on this post yet.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-center text-muted-foreground py-8 border border-dashed border-border rounded-2xl">
                No feed posts found in database.
              </p>
            )}
          </div>
        )}

        {/* Tab 9: Zubeen Music Player Management */}
        {activeTab === 'music' && (
          <div className="space-y-8">
            {/* Create Song Form */}
            <div className="aesthetic-card rounded-3xl p-5 sm:p-6 space-y-4">
              <h2 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary border-b border-border pb-3 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Add New Zubeen Song</span>
              </h2>

              <form onSubmit={handleCreateSong} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Song Title *</label>
                  <input
                    type="text"
                    required
                    value={songTitle}
                    onChange={(e) => setSongTitle(e.target.value)}
                    placeholder="e.g. Maya"
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground font-semibold shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Artist *</label>
                  <input
                    type="text"
                    required
                    value={songArtist}
                    onChange={(e) => setSongArtist(e.target.value)}
                    placeholder="e.g. Zubeen Garg"
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground font-semibold shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Album Name</label>
                  <input
                    type="text"
                    value={songAlbum}
                    onChange={(e) => setSongAlbum(e.target.value)}
                    placeholder="e.g. Maya"
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground font-semibold shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Duration (Seconds)</label>
                  <input
                    type="number"
                    min="0"
                    value={songDuration}
                    onChange={(e) => setSongDuration(e.target.value)}
                    placeholder="e.g. 240"
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground font-semibold shadow-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Audio Track *</label>
                  {songAudioUrl ? (
                    <div className="rounded-xl border border-border bg-muted/10 p-3 flex justify-between items-center gap-4">
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs font-bold text-foreground truncate">Audio Track Selected</span>
                        <audio src={songAudioUrl} controls className="h-8 mt-1.5 w-full" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setSongAudioUrl('')}
                        className="rounded-full bg-black/60 hover:bg-black/80 text-white p-1.5 shadow-md backdrop-blur-sm transition-all"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative border border-dashed border-border/80 hover:border-primary rounded-xl p-3.5 transition-all bg-card hover:bg-muted/10 group flex flex-col items-center justify-center text-center cursor-pointer min-h-[60px]">
                      <input
                        type="file"
                        required
                        accept="audio/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 25 * 1024 * 1024) {
                              alert('Audio file size must be less than 25MB. (অডিঅ’ ফাইলটোৰ আকাৰ ২৫এমবিতকৈ কম হ’ব লাগিব।)');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setSongAudioUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex items-center gap-2">
                        <Music className="h-4 w-4 text-primary group-hover:scale-105 transition-transform" />
                        <span className="text-xs font-bold text-foreground">Select and Upload Audio File</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cover Image</label>
                  {songCoverUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-border bg-muted/10 p-2">
                      <div className="relative h-20 w-full overflow-hidden rounded-xl">
                        <img src={songCoverUrl} alt="Album Cover Preview" className="w-full h-full object-cover rounded-xl" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setSongCoverUrl('')}
                        className="absolute top-4 right-4 rounded-full bg-black/60 hover:bg-black/80 text-white p-1 backdrop-blur-sm transition-all"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-border/80 hover:border-primary rounded-2xl p-2 transition-all bg-muted/20 hover:bg-muted/30 group flex flex-col items-center justify-center text-center cursor-pointer h-20">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 15 * 1024 * 1024) {
                              alert('File size must be less than 15MB. (ফাইলৰ আকাৰ ১৫এমবিতকৈ কম হ’ব লাগিব।)');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setSongCoverUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="space-y-0.5">
                        <div className="mx-auto h-6 w-6 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Plus className="h-3.5 w-3.5" />
                        </div>
                        <span className="text-[9px] font-bold text-foreground block">Upload Cover Photo</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={songSubmitting}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-emerald-500 text-primary-foreground font-bold px-6 py-3 text-xs shadow-md shadow-primary/10 transition-transform active:scale-95 disabled:opacity-50"
                  >
                    {songSubmitting ? 'Adding...' : 'Add Track to Player'}
                  </button>
                </div>
              </form>
            </div>

            {/* Songs List */}
            <div className="aesthetic-card rounded-3xl p-5 sm:p-6 space-y-4">
              <h2 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary border-b border-border pb-3">
                Current Songs Database
              </h2>

              {loadingSongs ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : songsList.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider">
                        <th className="pb-3 pl-3 w-16">Cover</th>
                        <th className="pb-3">Title</th>
                        <th className="pb-3">Artist</th>
                        <th className="pb-3">Album</th>
                        <th className="pb-3">Duration</th>
                        <th className="pb-3 text-right pr-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {songsList.map((song) => (
                        <tr key={song.id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3 pl-3">
                            <div className="h-10 w-10 overflow-hidden rounded-lg border border-border bg-muted flex items-center justify-center">
                              {song.coverUrl ? (
                                <img src={song.coverUrl} alt="" className="h-full w-full object-cover" />
                              ) : (
                                <Music className="h-4 w-4 text-muted-foreground/50" />
                              )}
                            </div>
                          </td>
                          <td className="py-3 font-extrabold text-foreground">{song.title}</td>
                          <td className="py-3 font-semibold text-muted-foreground">{song.artist}</td>
                          <td className="py-3 font-medium text-muted-foreground italic">{song.album || '—'}</td>
                          <td className="py-3 font-semibold text-muted-foreground">
                            {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                          </td>
                          <td className="py-3 text-right pr-3">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => handleEditSong(song)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted text-primary transition-colors"
                                title="Edit song details"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteSong(song.id)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 bg-card hover:bg-red-55 hover:text-red-600 text-red-500 dark:hover:bg-red-950/20 transition-colors"
                                title="Delete song"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-center text-muted-foreground py-8 border border-dashed border-border rounded-2xl">
                  No songs registered in the music player.
                </p>
              )}
            </div>

            {/* Edit Song Modal Overlay */}
            {editingSong && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
                <div className="relative w-full max-w-xl rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4">
                  <button
                    onClick={() => setEditingSong(null)}
                    className="absolute top-4 right-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <h3 className="font-extrabold text-foreground text-base sm:text-lg">Edit Song Details</h3>
                  
                  <form onSubmit={handleSaveSongEdit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Song Title *</label>
                      <input
                        type="text"
                        required
                        value={editSongTitle}
                        onChange={(e) => setEditSongTitle(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Artist *</label>
                      <input
                        type="text"
                        required
                        value={editSongArtist}
                        onChange={(e) => setEditSongArtist(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Album</label>
                      <input
                        type="text"
                        value={editSongAlbum}
                        onChange={(e) => setEditSongAlbum(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Duration (Seconds)</label>
                      <input
                        type="number"
                        min="0"
                        value={editSongDuration}
                        onChange={(e) => setEditSongDuration(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Audio URL *</label>
                      <input
                        type="url"
                        required
                        value={editSongAudioUrl}
                        onChange={(e) => setEditSongAudioUrl(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Cover Image URL</label>
                      <input
                        type="url"
                        value={editSongCoverUrl}
                        onChange={(e) => setEditSongCoverUrl(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground font-semibold focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 flex justify-end gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setEditingSong(null)}
                        className="rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold px-5 py-2.5 text-xs transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={editSongSubmitting}
                        className="rounded-xl bg-primary hover:bg-emerald-500 text-primary-foreground font-bold px-5 py-2.5 text-xs transition-colors disabled:opacity-50"
                      >
                        {editSongSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 10: Tribute Page Content Management */}
        {activeTab === 'tribute' && (
          <div className="space-y-12">
            {/* --- SECTION 1: ENVIRONMENTAL JOURNEY TIMELINE --- */}
            <div className="space-y-8">
              {/* Add Milestone Form */}
              <div className="aesthetic-card rounded-3xl p-5 sm:p-6 space-y-4">
                <h2 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary border-b border-border pb-3 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Timeline Milestone</span>
                </h2>

                <form onSubmit={handleCreateMilestone} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Year *</label>
                    <input
                      type="text"
                      required
                      value={mileYear}
                      onChange={(e) => setMileYear(e.target.value)}
                      placeholder="e.g. 2026"
                      className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground font-semibold shadow-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Milestone Title *</label>
                    <input
                      type="text"
                      required
                      value={mileTitle}
                      onChange={(e) => setMileTitle(e.target.value)}
                      placeholder="e.g. Guwahati Forest Planting"
                      className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground font-semibold shadow-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Description *</label>
                    <textarea
                      required
                      rows={3}
                      value={mileDesc}
                      onChange={(e) => setMileDesc(e.target.value)}
                      placeholder="Enter detailed description of the environmental milestone..."
                      className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground font-semibold shadow-sm focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3 pt-2">
                    <button
                      type="submit"
                      disabled={mileSubmitting}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-emerald-500 text-primary-foreground font-bold px-6 py-3 text-xs shadow-md transition-transform active:scale-95 disabled:opacity-50"
                    >
                      {mileSubmitting ? 'Adding...' : 'Add Milestone'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Milestones List */}
              <div className="aesthetic-card rounded-3xl p-5 sm:p-6 space-y-4">
                <h3 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary border-b border-border pb-3">
                  Environmental Timeline Milestones
                </h3>

                {loadingTribute ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : milestonesList.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border text-muted-foreground font-bold uppercase tracking-wider">
                          <th className="pb-3 pl-3 w-20">Year</th>
                          <th className="pb-3 w-48">Title</th>
                          <th className="pb-3">Description</th>
                          <th className="pb-3 text-right pr-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {milestonesList.map((m) => (
                          <tr key={m.id} className="hover:bg-muted/20 transition-colors">
                            <td className="py-3 pl-3 font-extrabold text-primary">{m.year}</td>
                            <td className="py-3 font-bold text-foreground">{m.title}</td>
                            <td className="py-3 text-muted-foreground max-w-xs truncate">{m.description}</td>
                            <td className="py-3 text-right pr-3">
                              <div className="inline-flex gap-2">
                                <button
                                  onClick={() => handleEditMilestone(m)}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted text-primary transition-colors"
                                  title="Edit Milestone"
                                >
                                  <Edit3 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMilestone(m.id)}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 bg-card hover:bg-red-55 hover:text-red-600 text-red-500 dark:hover:bg-red-950/20 transition-colors"
                                  title="Delete Milestone"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-center text-muted-foreground py-8 border border-dashed border-border rounded-2xl">
                    No environmental milestones found in the database.
                  </p>
                )}
              </div>
            </div>

            {/* --- SECTION 2: SONG NATURE QUOTES --- */}
            <div className="space-y-8 border-t border-border pt-10">
              {/* Add Quote Form */}
              <div className="aesthetic-card rounded-3xl p-5 sm:p-6 space-y-4">
                <h2 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary border-b border-border pb-3 flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Add Song Nature Quote</span>
                </h2>

                <form onSubmit={handleCreateQuote} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Song Title *</label>
                    <input
                      type="text"
                      required
                      value={quoteSongTitle}
                      onChange={(e) => setQuoteSongTitle(e.target.value)}
                      placeholder="e.g. Mayabini"
                      className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground font-semibold shadow-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assamese Lyric/Verse *</label>
                    <input
                      type="text"
                      required
                      value={quoteLyric}
                      onChange={(e) => setQuoteLyric(e.target.value)}
                      placeholder='e.g. "মায়াবিনী দুচকুতে কাজল সানি ল’লে..."'
                      className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground font-semibold shadow-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Environmental Meaning *</label>
                    <textarea
                      required
                      rows={3}
                      value={quoteMeaning}
                      onChange={(e) => setQuoteMeaning(e.target.value)}
                      placeholder="Describe how Zubeen's song connects with environmental issues or nature..."
                      className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground font-semibold shadow-sm focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2">
                    <button
                      type="submit"
                      disabled={quoteSubmitting}
                      className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-primary hover:bg-emerald-500 text-primary-foreground font-bold px-6 py-3 text-xs shadow-md transition-transform active:scale-95 disabled:opacity-50"
                    >
                      {quoteSubmitting ? 'Adding...' : 'Add Song Quote'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Quotes List */}
              <div className="aesthetic-card rounded-3xl p-5 sm:p-6 space-y-4">
                <h3 className="font-bold text-foreground text-sm uppercase tracking-wider text-primary border-b border-border pb-3">
                  Echoes of Nature in Music (Quotes)
                </h3>

                {loadingTribute ? (
                  <div className="flex h-32 items-center justify-center">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  </div>
                ) : quotesList.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quotesList.map((q) => (
                      <div key={q.id} className="rounded-2xl border border-border/80 bg-muted/10 p-4 flex flex-col justify-between space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="font-extrabold text-foreground text-xs uppercase tracking-wide">Song: {q.title}</span>
                            <span className="text-primary text-xs font-bold">♪</span>
                          </div>
                          <p className="text-sm font-bold text-primary italic font-serif leading-relaxed">{q.lyric}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{q.meaning}</p>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                          <button
                            onClick={() => handleEditQuote(q)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted text-primary transition-colors"
                            title="Edit Quote"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteQuote(q.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-red-200 bg-card hover:bg-red-55 hover:text-red-600 text-red-500 dark:hover:bg-red-950/20 transition-colors"
                            title="Delete Quote"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-center text-muted-foreground py-8 border border-dashed border-border rounded-2xl">
                    No song quotes found in database.
                  </p>
                )}
              </div>
            </div>

            {/* Edit Milestone Modal */}
            {editingMilestone && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
                <div className="relative w-full max-w-xl rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4">
                  <button
                    onClick={() => setEditingMilestone(null)}
                    className="absolute top-4 right-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <h3 className="font-extrabold text-foreground text-base sm:text-lg">Edit Timeline Milestone</h3>
                  
                  <form onSubmit={handleSaveMilestoneEdit} className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Year *</label>
                      <input
                        type="text"
                        required
                        value={editMileYear}
                        onChange={(e) => setEditMileYear(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Milestone Title *</label>
                      <input
                        type="text"
                        required
                        value={editMileTitle}
                        onChange={(e) => setEditMileTitle(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-3">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Description *</label>
                      <textarea
                        required
                        rows={3}
                        value={editMileDesc}
                        onChange={(e) => setEditMileDesc(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground font-semibold focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-3 flex justify-end gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setEditingMilestone(null)}
                        className="rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold px-5 py-2.5 text-xs transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={editMileSubmitting}
                        className="rounded-xl bg-primary hover:bg-emerald-500 text-primary-foreground font-bold px-5 py-2.5 text-xs transition-colors disabled:opacity-50"
                      >
                        {editMileSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Edit Quote Modal */}
            {editingQuote && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4">
                <div className="relative w-full max-w-xl rounded-3xl bg-card border border-border p-6 shadow-2xl space-y-4">
                  <button
                    onClick={() => setEditingQuote(null)}
                    className="absolute top-4 right-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors border border-border"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <h3 className="font-extrabold text-foreground text-base sm:text-lg">Edit Song Quote</h3>
                  
                  <form onSubmit={handleSaveQuoteEdit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Song Title *</label>
                      <input
                        type="text"
                        required
                        value={editQuoteSongTitle}
                        onChange={(e) => setEditQuoteSongTitle(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Lyric *</label>
                      <input
                        type="text"
                        required
                        value={editQuoteLyric}
                        onChange={(e) => setEditQuoteLyric(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground font-semibold focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Environmental Meaning *</label>
                      <textarea
                        required
                        rows={3}
                        value={editQuoteMeaning}
                        onChange={(e) => setEditQuoteMeaning(e.target.value)}
                        className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground font-semibold focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2 flex justify-end gap-3 pt-3">
                      <button
                        type="button"
                        onClick={() => setEditingQuote(null)}
                        className="rounded-xl border border-border bg-card hover:bg-muted text-foreground font-bold px-5 py-2.5 text-xs transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={editQuoteSubmitting}
                        className="rounded-xl bg-primary hover:bg-emerald-500 text-primary-foreground font-bold px-5 py-2.5 text-xs transition-colors disabled:opacity-50"
                      >
                        {editQuoteSubmitting ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
