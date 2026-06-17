'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Users, Plus, Leaf, Globe, Check, AlertCircle, MessageSquare, Send, X, LogOut, Trophy, Quote, Calendar, Camera, Video, Shield, ShieldAlert, Link2, Edit } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

interface Group {
  id: string;
  name: string;
  description: string;
  type: string;
  imageUrl?: string;
  membersCount: number;
  creatorId: string;
  pastWorks?: string;
  memories?: string;
  nextPlan?: string;
  mediaUrls?: string;
}

interface GroupMessage {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl?: string;
  };
}

interface GroupMember {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  groupRole?: string;
}

function GroupsContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  
  // Joined groups state
  const [joinedGroupIds, setJoinedGroupIds] = useState<string[]>([]);
  
  // Create Group Modal states
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('NGO');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Group Hub / Chat States
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [loadingHub, setLoadingHub] = useState(false);
  const [activeHubTab, setActiveHubTab] = useState<'chat' | 'highlights' | 'media'>('chat');
  const [activeGroupDetails, setActiveGroupDetails] = useState<{
    group: Group;
    members: GroupMember[];
    messages: GroupMessage[];
  } | null>(null);
  const [chatContent, setChatContent] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Edit Group Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editType, setEditType] = useState('NGO');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editPastWorks, setEditPastWorks] = useState('');
  const [editMemories, setEditMemories] = useState('');
  const [editNextPlan, setEditNextPlan] = useState('');
  const [editMediaUrls, setEditMediaUrls] = useState('');
  const [updatingGroup, setUpdatingGroup] = useState(false);

  // Invite Link copy state
  const [linkCopied, setLinkCopied] = useState(false);

  const searchParams = useSearchParams();
  const joinGroupId = searchParams.get('groupId');
  const isJoinAction = searchParams.get('join') === 'true';

  // Auto-scroll ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function fetchGroups() {
    try {
      const res = await fetch('/api/groups');
      const data = await res.json();
      if (res.ok) {
        setGroups(data.groups || []);
        setJoinedGroupIds(data.joinedGroupIds || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGroups();
  }, [user]);

  // Fetch detailed group info (members/chat)
  const fetchGroupDetails = async (groupId: string) => {
    setLoadingHub(true);
    try {
      const res = await fetch(`/api/groups?groupId=${groupId}`);
      const data = await res.json();
      if (res.ok) {
        setActiveGroupDetails(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHub(false);
    }
  };

  // Poll only messages for chat
  const pollGroupMessages = async (groupId: string) => {
    try {
      const res = await fetch(`/api/groups/messages?groupId=${groupId}`);
      const data = await res.json();
      if (res.ok && activeGroupDetails) {
        setActiveGroupDetails(prev => prev ? { ...prev, messages: data.messages } : null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Scroll to bottom helper
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeGroupDetails?.messages]);

  // Polling hook
  useEffect(() => {
    if (!activeGroupId) {
      setActiveGroupDetails(null);
      return;
    }

    fetchGroupDetails(activeGroupId);

    const interval = setInterval(() => {
      pollGroupMessages(activeGroupId);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeGroupId]);

  // Handle invitation link auto-join
  useEffect(() => {
    if (user && joinGroupId && isJoinAction && !loading) {
      const isAlreadyJoined = joinedGroupIds.includes(joinGroupId);
      if (!isAlreadyJoined) {
        handleJoinGroup(joinGroupId);
      }
      setActiveGroupId(joinGroupId);
      window.history.replaceState({}, '', '/groups');
    }
  }, [user, joinGroupId, isJoinAction, loading, joinedGroupIds]);

  async function handleJoinGroup(groupId: string) {
    if (!user) return;
    const isJoined = joinedGroupIds.includes(groupId);
    const action = isJoined ? 'LEAVE' : 'JOIN';
    
    try {
      const res = await fetch('/api/groups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, action }),
      });
      if (res.ok) {
        if (isJoined) {
          setJoinedGroupIds(prev => prev.filter(id => id !== groupId));
          setGroups(prev => prev.map(g => g.id === groupId ? { ...g, membersCount: Math.max(0, g.membersCount - 1) } : g));
          if (activeGroupId === groupId) {
            setActiveGroupId(null);
          }
        } else {
          setJoinedGroupIds(prev => [...prev, groupId]);
          setGroups(prev => prev.map(g => g.id === groupId ? { ...g, membersCount: g.membersCount + 1 } : g));
        }
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to update membership');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, type, imageUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        setGroups(prev => [data.group, ...prev]);
        setJoinedGroupIds(prev => [...prev, data.group.id]);
        
        setName('');
        setDescription('');
        setType('NGO');
        setImageUrl('');
        setShowModal(false);
        fetchGroups();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to create group');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatContent.trim() || !activeGroupId) return;
    setSendingMessage(true);

    try {
      const res = await fetch('/api/groups/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId: activeGroupId, content: chatContent }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveGroupDetails(prev => prev ? { ...prev, messages: [...prev.messages, data.message] } : null);
        setChatContent('');
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to send message');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleToggleAdminRole = async (targetUserId: string) => {
    if (!activeGroupId) return;
    try {
      const res = await fetch('/api/groups', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: activeGroupId,
          action: 'TOGGLE_ADMIN_ROLE',
          targetUserId
        })
      });
      if (res.ok) {
        fetchGroupDetails(activeGroupId);
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to update user role');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroupId || !user) return;
    setUpdatingGroup(true);

    try {
      const res = await fetch('/api/groups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: activeGroupId,
          name: editName,
          description: editDescription,
          type: editType,
          imageUrl: editImageUrl,
          pastWorks: editPastWorks,
          memories: editMemories,
          nextPlan: editNextPlan,
          mediaUrls: editMediaUrls,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveGroupDetails(prev => prev ? { ...prev, group: data.group } : null);
        setGroups(prev => prev.map(g => g.id === activeGroupId ? data.group : g));
        setShowEditModal(false);
        fetchGroups();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to update group settings');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingGroup(false);
    }
  };

  const handleOpenEditModal = () => {
    if (!activeGroupDetails?.group) return;
    const gp = activeGroupDetails.group;
    setEditName(gp.name);
    setEditDescription(gp.description);
    setEditType(gp.type);
    setEditImageUrl(gp.imageUrl || '');
    setEditPastWorks(gp.pastWorks || '');
    setEditMemories(gp.memories || '');
    setEditNextPlan(gp.nextPlan || '');
    setEditMediaUrls(gp.mediaUrls || '');
    setShowEditModal(true);
  };

  const handleUploadGroupMedia = async (files: File[]) => {
    if (!activeGroupId || !activeGroupDetails?.group) return;
    setLoadingHub(true);
    try {
      let loadedCount = 0;
      const newUrls: string[] = [];
      
      files.forEach((file) => {
        if (file.size > 15 * 1024 * 1024) {
          alert(`File "${file.name}" exceeds 15MB size limit.`);
          return;
        }
        
        const reader = new FileReader();
        reader.onloadend = async () => {
          newUrls.push(reader.result as string);
          loadedCount++;
          
          if (loadedCount === files.length) {
            const current = activeGroupDetails.group.mediaUrls
              ? activeGroupDetails.group.mediaUrls.split(',').filter(Boolean)
              : [];
            const updatedMediaUrls = [...current, ...newUrls].join(',');
            
            // Call PUT to save
            const res = await fetch('/api/groups', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                groupId: activeGroupId,
                mediaUrls: updatedMediaUrls,
              }),
            });
            
            if (res.ok) {
              await fetchGroupDetails(activeGroupId);
            } else {
              const errData = await res.json();
              alert(errData.error || 'Failed to upload media');
            }
          }
        };
        reader.readAsDataURL(file);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHub(false);
    }
  };

  const handleDeleteGroupMedia = async (indexToDelete: number) => {
    if (!activeGroupId || !activeGroupDetails?.group) return;
    if (!confirm('Are you sure you want to delete this media?')) return;
    
    setLoadingHub(true);
    try {
      const current = activeGroupDetails.group.mediaUrls
        ? activeGroupDetails.group.mediaUrls.split(',').filter(Boolean)
        : [];
      current.splice(indexToDelete, 1);
      const updatedMediaUrls = current.join(',');
      
      const res = await fetch('/api/groups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: activeGroupId,
          mediaUrls: updatedMediaUrls,
        }),
      });
      
      if (res.ok) {
        await fetchGroupDetails(activeGroupId);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to delete media');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHub(false);
    }
  };

  const filteredGroups = filterType === 'All'
    ? groups
    : groups.filter(g => g.type.toLowerCase() === filterType.toLowerCase());

  return (
    <div className="space-y-8 relative">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {t('groups_title')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('groups_subtitle')}</p>
        </div>

        {user && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-secondary text-primary-foreground font-semibold px-5 py-2.5 shadow-md shadow-primary/10 transition-transform active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>{t('groups_create_btn')}</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {['All', 'Village', 'School', 'College', 'NGO'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterType(tab)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
              filterType === tab
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border border-border text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Groups List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-card border border-border rounded-3xl" />
          ))}
        </div>
      ) : filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredGroups.map((gp) => {
            const hasJoined = joinedGroupIds.includes(gp.id);
            return (
              <div
                key={gp.id}
                className="aesthetic-card rounded-3xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="h-40 overflow-hidden relative border-b border-border">
                    <img
                      src={gp.imageUrl || 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600'}
                      alt={gp.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 rounded bg-primary text-primary-foreground px-2 py-0.5 text-[10px] font-bold uppercase shadow-sm">
                      {gp.type}
                    </span>
                  </div>

                  <div className="p-5 space-y-2">
                    <h3 className="font-extrabold text-foreground text-base truncate">{gp.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{gp.description}</p>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-border/40 mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-semibold">
                    {gp.membersCount} {t('groups_members')}
                  </span>
                  
                  <div className="flex gap-2">
                    {hasJoined && (
                      <button
                        onClick={() => setActiveGroupId(gp.id)}
                        className="flex items-center gap-1 rounded-full bg-secondary/15 hover:bg-secondary/35 text-primary px-3 py-1.5 text-xs font-bold transition-all border border-primary/10"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>Chat Hub</span>
                      </button>
                    )}
                    
                    {user ? (
                      <button
                        onClick={() => handleJoinGroup(gp.id)}
                        className={`flex items-center gap-1 rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                          hasJoined
                            ? 'bg-emerald-55/10 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200'
                            : 'bg-primary hover:bg-secondary text-primary-foreground shadow-sm'
                        }`}
                      >
                        {hasJoined ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>Joined</span>
                          </>
                        ) : (
                          <span>Join Group</span>
                        )}
                      </button>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">Sign in to join</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground bg-card">
          <Users className="mx-auto h-12 w-12 text-primary opacity-20 mb-4" />
          <p className="font-semibold">No groups found in this category.</p>
        </div>
      )}

      {/* Group Hub Modal (Chat & Member Directory) */}
      {activeGroupId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6">
          <div className="w-full max-w-4xl h-[85vh] bg-card border border-border/80 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border flex flex-col gap-3 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/10">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-extrabold text-foreground truncate max-w-md">
                      {activeGroupDetails?.group?.name || 'Loading Hub...'}
                    </h2>
                    <span className="inline-block rounded bg-secondary/20 text-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider mt-0.5">
                      {activeGroupDetails?.group?.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeGroupDetails && user?.id === activeGroupDetails.group.creatorId && (
                    <button
                      onClick={handleOpenEditModal}
                      className="flex items-center gap-1 rounded-xl bg-secondary/15 hover:bg-secondary/35 text-primary px-3 py-1.5 text-xs font-bold transition-colors border border-primary/10"
                      title="Edit Group Details"
                    >
                      <Edit className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Edit Details</span>
                    </button>
                  )}

                  {activeGroupDetails?.group && (
                    <button
                      onClick={() => handleJoinGroup(activeGroupDetails.group.id)}
                      className="flex items-center gap-1 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/20 dark:hover:bg-red-950/45 px-3 py-1.5 text-xs font-bold transition-colors"
                      title="Leave Group"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Leave Group</span>
                    </button>
                  )}
                  
                  <button
                    onClick={() => setActiveGroupId(null)}
                    className="rounded-full border border-border p-1.5 text-muted-foreground hover:bg-muted"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Group Hub Tabs */}
              {activeGroupDetails && (
                <div className="flex gap-2 border-t border-border/40 pt-2.5">
                  {[
                    { id: 'chat', label: 'Chat Hub' },
                    { id: 'highlights', label: 'Highlights & Goals' },
                    { id: 'media', label: 'Media Gallery' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveHubTab(tab.id as any)}
                      className={`rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${
                        activeHubTab === tab.id
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Content Pane */}
            {loadingHub ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : activeGroupDetails ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {activeHubTab === 'chat' && (
                  <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Members list (Left side) */}
                    <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border p-4 flex flex-col overflow-y-auto bg-muted/5 shrink-0">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span>Members ({activeGroupDetails.members.length})</span>
                      </h3>
                      <div className="space-y-2.5">
                        {activeGroupDetails.members.map((member) => (
                          <div key={member.id} className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-muted/10">
                            <img
                              src={member.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${member.username}`}
                              alt={member.displayName}
                              className="h-8 w-8 rounded-full border border-border"
                            />
                            <div className="min-w-0">
                              <span className="block text-xs font-extrabold text-foreground truncate">{member.displayName}</span>
                              <span className="block text-[10px] text-muted-foreground">@{member.username}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chat window (Right side) */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                      {/* Messages Feed */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {activeGroupDetails.messages.length > 0 ? (
                          activeGroupDetails.messages.map((msg) => {
                            const isMe = msg.user.id === user?.id;
                            return (
                              <div key={msg.id} className={`flex gap-3 max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
                                {!isMe && (
                                  <img
                                    src={msg.user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${msg.user.username}`}
                                    alt={msg.user.displayName}
                                    className="h-8 w-8 rounded-full border border-border mt-0.5 shrink-0"
                                  />
                                )}
                                <div>
                                  <div className={`text-[10px] text-muted-foreground mb-1 ${isMe ? 'text-right' : 'text-left'}`}>
                                    <span className="font-bold">{msg.user.displayName}</span> • 
                                    <span className="ml-1">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <div className={`rounded-2xl px-4 py-2 text-xs leading-relaxed ${
                                    isMe 
                                      ? 'bg-primary text-primary-foreground rounded-tr-none' 
                                      : 'bg-muted text-foreground rounded-tl-none border border-border/40'
                                  }`}>
                                    {msg.content}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                            <MessageSquare className="h-10 w-10 text-primary opacity-20 mb-2" />
                            <p className="text-xs font-semibold">Welcome to the group chat!</p>
                            <p className="text-[10px] mt-0.5">Send a message to start conversing with members.</p>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Input form */}
                      <form onSubmit={handleSendMessage} className="p-4 border-t border-border flex gap-2 bg-muted/10 shrink-0">
                        <input
                          type="text"
                          required
                          placeholder="Write your message..."
                          value={chatContent}
                          onChange={(e) => setChatContent(e.target.value)}
                          className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                        />
                        <button
                          type="submit"
                          disabled={sendingMessage || !chatContent.trim()}
                          className="rounded-xl bg-primary hover:bg-secondary text-primary-foreground px-4 py-2.5 shadow-md shadow-primary/10 transition-colors shrink-0 flex items-center justify-center"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {activeHubTab === 'highlights' && (
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Past Works */}
                    <div className="aesthetic-card rounded-2xl p-5 border border-border bg-gradient-to-br from-card to-secondary/5 space-y-3">
                      <div className="flex items-center gap-2 text-primary">
                        <Trophy className="h-5 w-5" />
                        <h4 className="font-extrabold text-sm uppercase tracking-wider">Past Works Highlight</h4>
                      </div>
                      <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                        {activeGroupDetails.group.pastWorks || 'No past plantation works logged yet. Let\'s start planting!'}
                      </p>
                    </div>

                    {/* Memories */}
                    <div className="aesthetic-card rounded-2xl p-5 border border-border bg-gradient-to-br from-card to-secondary/5 space-y-3">
                      <div className="flex items-center gap-2 text-pink-600">
                        <Quote className="h-5 w-5 fill-current" />
                        <h4 className="font-extrabold text-sm uppercase tracking-wider">Memories & Stories</h4>
                      </div>
                      <p className="text-xs sm:text-sm text-foreground leading-relaxed italic font-serif">
                        "{activeGroupDetails.group.memories || 'No memories or stories logged yet. Plant a tree, make a memory!'}"
                      </p>
                    </div>

                    {/* Next Plan */}
                    <div className="aesthetic-card rounded-2xl p-5 border border-border bg-gradient-to-br from-card to-secondary/5 space-y-3">
                      <div className="flex items-center gap-2 text-accent">
                        <Calendar className="h-5 w-5" />
                        <h4 className="font-extrabold text-sm uppercase tracking-wider">Next Plan of Plantation</h4>
                      </div>
                      <p className="text-xs sm:text-sm text-foreground leading-relaxed">
                        {activeGroupDetails.group.nextPlan || 'No upcoming plantation plans logged yet. Consult with members to set a goal!'}
                      </p>
                    </div>
                  </div>
                )}

                {activeHubTab === 'media' && (
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-1.5">
                      <Camera className="h-4 w-4 text-primary" />
                      <span>Group Media Directory</span>
                    </h3>
                    
                    {activeGroupDetails.group.mediaUrls ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {activeGroupDetails.group.mediaUrls.split(',').filter(Boolean).map((url, idx) => {
                          const cleanUrl = url.trim();
                          const isVideo = cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.webm') || cleanUrl.includes('video') || cleanUrl.startsWith('data:video/');
                          return (
                            <div key={idx} className="relative aspect-video sm:aspect-square overflow-hidden rounded-2xl border border-border bg-muted group shadow-sm">
                              {isVideo ? (
                                <video src={cleanUrl} controls className="w-full h-full object-cover" />
                              ) : (
                                <a href={cleanUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                                  <img src={cleanUrl} alt="Group Memory" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                </a>
                              )}
                              <div className="absolute top-2 left-2 p-1 bg-black/55 backdrop-blur-sm rounded-lg pointer-events-none text-white text-[9px] font-bold uppercase">
                                {isVideo ? <Video className="h-3 w-3" /> : <Camera className="h-3 w-3" />}
                              </div>
                              {user && activeGroupDetails.group.creatorId === user.id && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteGroupMedia(idx)}
                                  className="absolute top-2 right-2 rounded-full bg-red-600 hover:bg-red-500 text-white p-1 shadow-md transition-colors backdrop-blur-sm"
                                  title="Delete Media"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-48 flex flex-col items-center justify-center border border-dashed border-border rounded-2xl text-center text-muted-foreground">
                        <Camera className="h-10 w-10 text-primary opacity-20 mb-2" />
                        <p className="text-xs font-semibold">No photos or videos logged yet.</p>
                        <p className="text-[10px] mt-0.5">
                          {user && activeGroupDetails.group.creatorId === user.id
                            ? 'Upload some photos or videos below to share memories!'
                            : "Group creator hasn't uploaded any media yet."}
                        </p>
                      </div>
                    )}

                    {user && activeGroupDetails.group.creatorId === user.id && (
                      <div className="mt-6 pt-4 border-t border-border">
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 font-sans">
                          Add Photo & Video Gallery Media (Creator Mode)
                        </label>
                        <div className="relative border-2 border-dashed border-primary/20 dark:border-primary/40 hover:border-primary rounded-2xl p-4 transition-all bg-primary/5 dark:bg-primary/5 hover:bg-primary/10 group flex flex-col items-center justify-center text-center cursor-pointer min-h-[90px]">
                          <input
                            type="file"
                            multiple
                            accept="image/*,video/*"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              if (files.length > 0) {
                                handleUploadGroupMedia(files);
                              }
                            }}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="space-y-1">
                            <div className="mx-auto h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                              <Camera className="h-4 w-4" />
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-foreground block">Select & Add Media to Group Gallery</span>
                              <span className="text-[9px] text-muted-foreground block">Supports multiple images & videos (up to 15MB each)</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-muted-foreground">
                <AlertCircle className="h-10 w-10 text-primary opacity-20 mb-2" />
                <p className="text-xs font-semibold">Failed to fetch group hub details.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <span>Create Community Group</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1 mb-4 pb-2 border-b border-border">
              Build a group to coordinate tree planting drives with your friends, school, or NGO.
            </p>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Guwahati High School Eco Club"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="What is the mission of this group?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Group Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="NGO">NGO</option>
                    <option value="School">School</option>
                    <option value="College">College</option>
                    <option value="Village">Village</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Cover Image</label>
                  {imageUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-border bg-muted/10 p-2">
                      <div className="relative h-20 w-full overflow-hidden rounded-xl">
                        <img src={imageUrl} alt="Group Cover Preview" className="w-full h-full object-cover rounded-xl" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
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
                              setImageUrl(reader.result as string);
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
                        <span className="text-[9px] font-bold text-foreground block">Upload Cover Image</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-full px-5 py-2 text-xs font-bold hover:bg-muted text-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-primary hover:bg-secondary text-primary-foreground font-semibold px-6 py-2.5 shadow-sm text-xs"
                >
                  {submitting ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <Edit className="h-6 w-6 text-primary" />
              <span>Edit Group Details</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1 mb-4 pb-2 border-b border-border">
              Update group details, highlights, and next plans.
            </p>

            <form onSubmit={handleUpdateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Group Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Guwahati High School Eco Club"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="What is the mission of this group?"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Group Type</label>
                  <select
                    value={editType}
                    onChange={(e) => setEditType(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="NGO">NGO</option>
                    <option value="School">School</option>
                    <option value="College">College</option>
                    <option value="Village">Village</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Cover Image</label>
                  {editImageUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-border bg-muted/10 p-2">
                      <div className="relative h-20 w-full overflow-hidden rounded-xl">
                        <img src={editImageUrl} alt="Group Cover Preview" className="w-full h-full object-cover rounded-xl" />
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditImageUrl('')}
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
                              alert('File size must be less than 15MB.');
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditImageUrl(reader.result as string);
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
                        <span className="text-[9px] font-bold text-foreground block">Upload Cover Image</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Past Works Highlight</label>
                <textarea
                  rows={2}
                  placeholder="Describe past tree planting activities..."
                  value={editPastWorks}
                  onChange={(e) => setEditPastWorks(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Memories & Stories</label>
                <textarea
                  rows={2}
                  placeholder="Share a quote, memory, or story..."
                  value={editMemories}
                  onChange={(e) => setEditMemories(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Next Plan of Plantation</label>
                <textarea
                  rows={2}
                  placeholder="Describe upcoming plantation targets/plans..."
                  value={editNextPlan}
                  onChange={(e) => setEditNextPlan(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-full px-5 py-2 text-xs font-bold hover:bg-muted text-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingGroup}
                  className="rounded-full bg-primary hover:bg-secondary text-primary-foreground font-semibold px-6 py-2.5 shadow-sm text-xs"
                >
                  {updatingGroup ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GroupsPage() {
  return (
    <Suspense fallback={
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    }>
      <GroupsContent />
    </Suspense>
  );
}

