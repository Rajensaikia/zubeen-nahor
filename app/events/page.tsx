'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { Calendar, Plus, MapPin, Check, Users, Bell, Send, X, AlertCircle, Camera, Video, FileText, Clock, Settings, Edit } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  district: string;
  imageUrl?: string;
  attendeesCount: number;
  organiserId: string;
  chiefGuest?: string;
  treesPlanted?: number;
  status?: string;
  schedule?: string;
  documents?: string;
  memories?: string;
  mediaUrls?: string;
  organiser?: {
    id: string;
    displayName: string;
    username: string;
    avatarUrl?: string;
  };
}

interface Announcement {
  id: string;
  content: string;
  createdAt: string;
  user: {
    displayName: string;
    username: string;
    avatarUrl?: string;
  };
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
  'Dhubri',
];

export default function Events() {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [districtFilter, setDistrictFilter] = useState('');
  
  // Registration state
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  
  // Create Event Modal state
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [district, setDistrict] = useState('Kamrup Metropolitan');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Announcement Hub States
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(false);
  const [activeEventDetails, setActiveEventDetails] = useState<{
    event: Event;
    announcements: Announcement[];
    isRegistered: boolean;
  } | null>(null);
  const [broadcastContent, setBroadcastContent] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Custom Detailed Event Tabs & Forms States
  const [activeModalTab, setActiveModalTab] = useState<'info' | 'timeline' | 'memories' | 'broadcast'>('info');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editDistrict, setEditDistrict] = useState('Kamrup Metropolitan');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editChiefGuest, setEditChiefGuest] = useState('');
  const [editTreesPlanted, setEditTreesPlanted] = useState('0');
  const [editStatus, setEditStatus] = useState('UPCOMING');
  const [editSchedule, setEditSchedule] = useState('');
  const [editDocuments, setEditDocuments] = useState('');
  const [editMemories, setEditMemories] = useState('');
  const [editMediaUrls, setEditMediaUrls] = useState('');
  const [updatingEvent, setUpdatingEvent] = useState(false);

  async function fetchEvents() {
    try {
      const res = await fetch('/api/events');
      const data = await res.json();
      if (res.ok) {
        setEvents(data.events || []);
        setRegisteredEventIds(data.registeredEventIds || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEvents();
  }, [user]);

  // Fetch event details (announcements / registrations)
  const fetchEventDetails = async (eventId: string) => {
    setLoadingAnnouncements(true);
    try {
      const res = await fetch(`/api/events?eventId=${eventId}`);
      const data = await res.json();
      if (res.ok) {
        setActiveEventDetails({
          event: data.event,
          announcements: data.event.messages || [],
          isRegistered: data.isRegistered,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  useEffect(() => {
    if (!activeEventId) {
      setActiveEventDetails(null);
      return;
    }
    fetchEventDetails(activeEventId);
  }, [activeEventId]);

  const handleOpenEditModal = () => {
    if (!activeEventDetails?.event) return;
    const evt = activeEventDetails.event;
    setEditTitle(evt.title);
    setEditDescription(evt.description);
    setEditDate(evt.date ? new Date(evt.date).toISOString().substring(0, 10) : '');
    setEditLocation(evt.location);
    setEditDistrict(evt.district);
    setEditImageUrl(evt.imageUrl || '');
    setEditChiefGuest(evt.chiefGuest || '');
    setEditTreesPlanted(evt.treesPlanted?.toString() || '0');
    setEditStatus(evt.status || 'UPCOMING');
    setEditSchedule(evt.schedule || '');
    setEditDocuments(evt.documents || '');
    setEditMemories(evt.memories || '');
    setEditMediaUrls(evt.mediaUrls || '');
    setShowEditModal(true);
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEventId) return;
    setUpdatingEvent(true);

    try {
      const res = await fetch('/api/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: activeEventId,
          title: editTitle,
          description: editDescription,
          date: editDate,
          location: editLocation,
          district: editDistrict,
          imageUrl: editImageUrl,
          chiefGuest: editChiefGuest,
          treesPlanted: parseInt(editTreesPlanted) || 0,
          status: editStatus,
          schedule: editSchedule,
          documents: editDocuments,
          memories: editMemories,
          mediaUrls: editMediaUrls,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update list
        setEvents(prev => prev.map(evt => evt.id === activeEventId ? data.event : evt));
        // Update active details
        setActiveEventDetails(prev => prev ? {
          ...prev,
          event: data.event
        } : null);
        setShowEditModal(false);
        alert('Drive updated successfully.');
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to update event');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating the event');
    } finally {
      setUpdatingEvent(false);
    }
  };

  const handleRegisterEvent = async (eventId: string) => {
    if (!user) return;
    const isJoined = registeredEventIds.includes(eventId);
    const action = isJoined ? 'LEAVE' : 'JOIN';
    
    try {
      const res = await fetch('/api/events', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, action }),
      });
      if (res.ok) {
        if (isJoined) {
          setRegisteredEventIds(prev => prev.filter(id => id !== eventId));
          setEvents(prev => prev.map(e => e.id === eventId ? { ...e, attendeesCount: Math.max(0, e.attendeesCount - 1) } : e));
          if (activeEventId === eventId) {
            setActiveEventId(null);
          }
        } else {
          setRegisteredEventIds(prev => [...prev, eventId]);
          setEvents(prev => prev.map(e => e.id === eventId ? { ...e, attendeesCount: e.attendeesCount + 1 } : e));
        }
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to update registration');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          date,
          location,
          district,
          imageUrl,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setEvents(prev => [data.event, ...prev]);
        setRegisteredEventIds(prev => [...prev, data.event.id]);
        
        setTitle('');
        setDescription('');
        setDate('');
        setLocation('');
        setDistrict('Kamrup Metropolitan');
        setImageUrl('');
        setShowModal(false);
        fetchEvents();
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to create event');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastContent.trim() || !activeEventId) return;
    setSendingBroadcast(true);

    try {
      const res = await fetch('/api/events/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: activeEventId, content: broadcastContent }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveEventDetails(prev => 
          prev 
            ? { ...prev, announcements: [data.announcement, ...prev.announcements] } 
            : null
        );
        setBroadcastContent('');
      } else {
        const errorData = await res.json();
        alert(errorData.error || 'Failed to post broadcast');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingBroadcast(false);
    }
  };

  const filteredEvents = districtFilter === ''
    ? events
    : events.filter(e => e.district.toLowerCase() === districtFilter.toLowerCase());

  return (
    <div className="space-y-8 relative">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {t('events_title')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('events_subtitle')}</p>
        </div>

        {user && (
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-secondary text-primary-foreground font-semibold px-5 py-2.5 shadow-md shadow-primary/10 transition-transform active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Create Drive</span>
          </button>
        )}
      </div>

      {/* Filter and search */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border p-3 rounded-2xl">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">Filter By District</span>
        <div className="relative">
          <select
            value={districtFilter}
            onChange={(e) => setDistrictFilter(e.target.value)}
            className="appearance-none rounded-xl border border-border bg-card px-4 py-2 pr-10 text-xs font-semibold text-foreground hover:bg-muted focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          >
            <option value="">All Districts</option>
            {DISTRICTS_LIST.map((dist) => (
              <option key={dist} value={dist}>
                {dist}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Events List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="h-72 bg-card border border-border rounded-3xl" />
          ))}
        </div>
      ) : filteredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((evt) => {
            const hasJoined = registeredEventIds.includes(evt.id);
            return (
              <div
                key={evt.id}
                className="aesthetic-card rounded-3xl overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="h-44 overflow-hidden relative border-b border-border">
                    <img
                      src={evt.imageUrl || 'https://images.unsplash.com/photo-1588880331179-bc9b93a8c5c8?auto=format&fit=crop&q=80&w=600'}
                      alt={evt.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-3 left-3 rounded-xl bg-card border border-border/80 px-3 py-1 text-xs font-bold text-primary shadow-sm">
                      {new Date(evt.date).toLocaleDateString(language === 'en' ? 'en-US' : 'as-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <span className="inline-block rounded bg-secondary/15 text-primary px-1.5 py-0.5 text-[10px] font-bold uppercase">
                      {evt.district}
                    </span>
                    <h3 className="font-extrabold text-foreground text-base sm:text-lg truncate">{evt.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">{evt.description}</p>
                    
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 border-t border-border/40 mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-primary" />
                    <span>{evt.attendeesCount} Volunteers</span>
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setActiveEventId(evt.id);
                        setActiveModalTab('info');
                      }}
                      className="flex items-center gap-1 rounded-full bg-secondary/15 hover:bg-secondary/35 text-primary px-3.5 py-1.5 text-xs font-bold transition-all border border-primary/10"
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Details</span>
                    </button>
                    
                    {user ? (
                      <button
                        onClick={() => handleRegisterEvent(evt.id)}
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
                          <span>{t('events_join_btn')}</span>
                        )}
                      </button>
                    ) : (
                      <span className="text-[10px] text-muted-foreground italic">Sign in to join drive</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-border p-12 text-center text-muted-foreground bg-card">
          <Calendar className="mx-auto h-12 w-12 text-primary opacity-20 mb-4" />
          <p className="font-semibold font-sans">No plantation drives scheduled in this district.</p>
        </div>
      )}

      {/* Event Details Hub Modal */}
      {activeEventId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6">
          <div className="w-full max-w-2xl h-[80vh] bg-card border border-border/80 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 rounded-xl bg-accent/10 text-accent flex items-center justify-center border border-accent/10">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-extrabold text-foreground truncate max-w-sm sm:max-w-md">
                    {activeEventDetails?.event?.title || 'Loading Board...'}
                  </h2>
                  <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider mt-0.5 ${
                    activeEventDetails?.event?.status === 'COMPLETED'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/35 dark:text-emerald-400'
                      : activeEventDetails?.event?.status === 'CANCELLED'
                      ? 'bg-red-100 text-red-700 dark:bg-red-950/35 dark:text-red-400'
                      : 'bg-secondary/20 text-primary'
                  }`}>
                    {activeEventDetails?.event?.status || 'UPCOMING'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeEventDetails && user?.id === activeEventDetails.event.organiserId && (
                  <button
                    onClick={handleOpenEditModal}
                    className="flex items-center gap-1 rounded-xl bg-secondary/15 hover:bg-secondary/35 text-primary px-3 py-1.5 text-xs font-bold transition-colors border border-primary/10"
                    title="Edit Drive Settings"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Edit Settings</span>
                  </button>
                )}
                
                <button
                  onClick={() => setActiveEventId(null)}
                  className="rounded-full border border-border p-1.5 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Modal Tabs */}
            {activeEventDetails && (
              <div className="flex gap-1.5 px-4 sm:px-5 border-b border-border bg-muted/10 py-2 overflow-x-auto scrollbar-none">
                {[
                  { id: 'info', label: 'General Info', icon: Calendar },
                  { id: 'timeline', label: 'Timeline & Resources', icon: Clock },
                  { id: 'memories', label: 'Memories & Gallery', icon: Camera, hidden: activeEventDetails.event.status !== 'COMPLETED' },
                  { id: 'broadcast', label: 'Announcements', icon: Bell }
                ].filter(t => !t.hidden).map((tab) => {
                  const TabIcon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveModalTab(tab.id as any)}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-bold transition-all ${
                        activeModalTab === tab.id
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <TabIcon className="h-3.5 w-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Modal Body */}
            {loadingAnnouncements ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              </div>
            ) : activeEventDetails ? (
              <div className="flex-1 flex flex-col overflow-hidden animate-fade-in-subtle">
                
                {/* 1. General Info Tab */}
                {activeModalTab === 'info' && (
                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="aesthetic-card rounded-2xl p-4 border border-border space-y-1">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Date & Time</span>
                        <span className="text-xs font-bold text-foreground">
                          {new Date(activeEventDetails.event.date).toLocaleString(language === 'en' ? 'en-US' : 'as-IN', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="aesthetic-card rounded-2xl p-4 border border-border space-y-1">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Location</span>
                        <span className="text-xs font-bold text-foreground">
                          {activeEventDetails.event.location}, {activeEventDetails.event.district}
                        </span>
                      </div>

                      <div className="aesthetic-card rounded-2xl p-4 border border-border space-y-1">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Chief Guest</span>
                        <span className="text-xs font-bold text-foreground">
                          {activeEventDetails.event.chiefGuest || 'To Be Announced'}
                        </span>
                      </div>

                      <div className="aesthetic-card rounded-2xl p-4 border border-border space-y-1">
                        <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                          {activeEventDetails.event.status === 'COMPLETED' ? 'Saplings Planted' : 'Planted / Target'}
                        </span>
                        <span className="text-xs font-bold text-primary">
                          {activeEventDetails.event.status === 'COMPLETED'
                            ? `${activeEventDetails.event.treesPlanted} trees successfully planted`
                            : `Targeting ${activeEventDetails.event.treesPlanted || 100} saplings`}
                        </span>
                      </div>
                    </div>

                    <div className="aesthetic-card rounded-2xl p-4 border border-border space-y-2">
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Organiser Details</span>
                      <div className="flex items-center gap-3">
                        <img
                          src={activeEventDetails.event.organiser?.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${activeEventDetails.event.organiser?.username}`}
                          alt="Organiser Avatar"
                          className="h-9 w-9 rounded-full border border-border"
                        />
                        <div>
                          <span className="block text-xs font-extrabold text-foreground">{activeEventDetails.event.organiser?.displayName}</span>
                          <span className="block text-[10px] text-muted-foreground">@{activeEventDetails.event.organiser?.username}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border mt-4 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-semibold">
                        {activeEventDetails.event.attendeesCount} volunteers registered
                      </span>
                      {user ? (
                        <button
                          onClick={() => handleRegisterEvent(activeEventDetails.event.id)}
                          className={`rounded-full px-5 py-2 text-xs font-bold transition-all ${
                            activeEventDetails.isRegistered
                              ? 'bg-red-55/10 text-red-655 dark:bg-red-955/20 dark:text-red-400 border border-red-200'
                              : 'bg-primary hover:bg-secondary text-primary-foreground shadow-sm'
                          }`}
                        >
                          {activeEventDetails.isRegistered ? 'Leave Drive' : 'Join Drive'}
                        </button>
                      ) : (
                        <span className="text-[10px] text-muted-foreground italic">Sign in to join drive</span>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. Timeline & Resources Tab */}
                {activeModalTab === 'timeline' && (
                  <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>Schedule Timeline</span>
                      </h3>
                      {activeEventDetails.event.schedule ? (
                        <div className="relative border-l-2 border-primary/20 pl-4 ml-2.5 space-y-4 py-1.5">
                          {activeEventDetails.event.schedule.split('\n').map((item, idx) => {
                            const hyphenIdx = item.indexOf('-');
                            const time = hyphenIdx !== -1 ? item.substring(0, hyphenIdx).trim() : '';
                            const text = hyphenIdx !== -1 ? item.substring(hyphenIdx + 1).trim() : item.trim();
                            return (
                              <div key={idx} className="relative animate-fade-in-subtle">
                                <span className="absolute -left-[23px] top-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-primary border-2 border-card shadow-sm" />
                                <div className="space-y-0.5">
                                  {time && <span className="block text-[10px] font-bold text-primary uppercase">{time}</span>}
                                  <p className="text-xs text-foreground font-medium">{text}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic py-3 border border-dashed border-border rounded-xl text-center">No schedule logged for this event.</p>
                      )}
                    </div>

                    <div className="border-t border-border/60 pt-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-primary" />
                        <span>Drive Documents & Resource Links</span>
                      </h3>
                      {activeEventDetails.event.documents ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {activeEventDetails.event.documents.split(',').map((docStr, idx) => {
                            const colonIdx = docStr.indexOf(':');
                            const title = colonIdx !== -1 ? docStr.substring(0, colonIdx).trim() : 'Document Link';
                            const url = colonIdx !== -1 ? docStr.substring(colonIdx + 1).trim() : docStr.trim();
                            return (
                              <a
                                key={idx}
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-xs font-semibold hover:bg-muted text-foreground transition-all shadow-sm"
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText className="h-4 w-4 text-primary shrink-0" />
                                  <span className="truncate pr-2">{title}</span>
                                </div>
                                <span className="text-[10px] text-primary shrink-0 hover:underline">Download</span>
                              </a>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic py-3 border border-dashed border-border rounded-xl text-center">No documents uploaded.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 3. Memories & Gallery Tab */}
                {activeModalTab === 'memories' && activeEventDetails.event.status === 'COMPLETED' && (
                  <div className="flex-1 overflow-y-auto p-5 space-y-5">
                    <div className="aesthetic-card rounded-2xl p-4 border border-border bg-gradient-to-br from-card to-emerald-500/5 space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Event Memories & Story</h4>
                      <p className="text-xs sm:text-sm text-foreground leading-relaxed italic">
                        "{activeEventDetails.event.memories || 'No memories logged. Write a recap details for this completed drive.'}"
                      </p>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                        <Camera className="h-4 w-4 text-primary" />
                        <span>Photos & Video Gallery</span>
                      </h4>
                      {activeEventDetails.event.mediaUrls ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {activeEventDetails.event.mediaUrls.split(',').map((url, idx) => {
                            const cleanUrl = url.trim();
                            const isVideo = cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.mov') || cleanUrl.endsWith('.webm') || cleanUrl.includes('video');
                            return (
                              <div key={idx} className="relative aspect-video sm:aspect-square overflow-hidden rounded-xl border border-border bg-muted group shadow-sm">
                                {isVideo ? (
                                  <video src={cleanUrl} controls className="w-full h-full object-cover" />
                                ) : (
                                  <a href={cleanUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                                    <img src={cleanUrl} alt="Event Memory" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                  </a>
                                )}
                                <div className="absolute top-2 right-2 p-1 bg-black/55 backdrop-blur-sm rounded-lg pointer-events-none text-white text-[9px]">
                                  {isVideo ? <Video className="h-3 w-3" /> : <Camera className="h-3 w-3" />}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic py-8 border border-dashed border-border rounded-xl text-center">No gallery media uploaded yet.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. Announcements Tab */}
                {activeModalTab === 'broadcast' && (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Announcements Feed */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                      {activeEventDetails.announcements.length > 0 ? (
                        activeEventDetails.announcements.map((ann) => (
                          <div key={ann.id} className="rounded-2xl border border-border bg-muted/15 p-4 space-y-2">
                            <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                              <span className="font-extrabold text-primary">📣 Broadcaster: {ann.user?.displayName || 'Organizer'}</span>
                              <span>{new Date(ann.createdAt).toLocaleString()}</span>
                            </div>
                            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                          </div>
                        ))
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                          <Bell className="h-10 w-10 text-primary opacity-20 mb-2" />
                          <p className="text-xs font-semibold">No announcements yet.</p>
                          <p className="text-[10px] mt-0.5">Announcements posted by the organizer will appear here.</p>
                        </div>
                      )}
                    </div>

                    {/* Organizer Broadcaster Form */}
                    {user?.id === activeEventDetails.event.organiserId && (
                      <form onSubmit={handleSendBroadcast} className="p-4 border-t border-border bg-muted/10 shrink-0 flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Broadcast Announcement (Organizer Mode)</label>
                          <span className="text-[9px] text-accent font-semibold">Will notify all {activeEventDetails.event.attendeesCount} attendees.</span>
                        </div>
                        <div className="flex gap-2">
                          <textarea
                            required
                            rows={2}
                            placeholder="Type an announcement to notify registered volunteers..."
                            value={broadcastContent}
                            onChange={(e) => setBroadcastContent(e.target.value)}
                            className="flex-1 rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm resize-none"
                          />
                          <button
                            type="submit"
                            disabled={sendingBroadcast || !broadcastContent.trim()}
                            className="rounded-xl bg-primary hover:bg-secondary text-primary-foreground px-4 py-2 text-xs font-bold shadow-md transition-colors shrink-0 flex items-center justify-center gap-1"
                          >
                            <Send className="h-4 w-4" />
                            <span>Send</span>
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-muted-foreground">
                <AlertCircle className="h-10 w-10 text-primary opacity-20 mb-2" />
                <p className="text-xs font-semibold">Failed to fetch announcement details.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative my-8">
            <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <span>Edit Drive Settings</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1 mb-4 pb-2 border-b border-border">
              Modify the properties, day schedule, guidelines, and media gallery for this plantation drive.
            </p>

            <form onSubmit={handleUpdateEvent} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Drive Title</label>
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Chief Guest</label>
                  <input
                    type="text"
                    placeholder="e.g. Zubeen Garg"
                    value={editChiefGuest}
                    onChange={(e) => setEditChiefGuest(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Date</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">District</label>
                  <select
                    value={editDistrict}
                    onChange={(e) => setEditDistrict(e.target.value)}
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
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Target/Planted Trees</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editTreesPlanted}
                    onChange={(e) => setEditTreesPlanted(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Drive Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-semibold text-primary"
                  >
                    <option value="UPCOMING">Upcoming (সক্ৰিয়)</option>
                    <option value="COMPLETED">Completed (সমাপ্ত)</option>
                    <option value="CANCELLED">Cancelled (বাতিল কৰা হৈছে)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Cover Image</label>
                  {editImageUrl ? (
                    <div className="relative rounded-2xl overflow-hidden border border-border bg-muted/10 p-2">
                      <div className="relative h-20 w-full overflow-hidden rounded-xl">
                        <img src={editImageUrl} alt="Event Cover Preview" className="w-full h-full object-cover rounded-xl" />
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
                              alert('File size must be less than 15MB. (ফাইলৰ আকাৰ ১৫এমবিতকৈ কম হ’ব লাগিব।)');
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
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
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
                  value={editSchedule}
                  onChange={(e) => setEditSchedule(e.target.value)}
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
                  value={editDocuments}
                  onChange={(e) => setEditDocuments(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {editStatus === 'COMPLETED' && (
                <>
                  <div>
                    <label className="block font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5 font-sans">
                      Drive Memories (Story / Experience Recap)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Share a short recap of what happened during the drive..."
                      value={editMemories}
                      onChange={(e) => setEditMemories(e.target.value)}
                      className="w-full rounded-xl border border-emerald-200 dark:border-emerald-950 bg-card px-3.5 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1.5 font-sans">
                      Photo & Video Gallery Media
                    </label>
                    <div className="space-y-3">
                      {/* Thumbnails grid */}
                      {editMediaUrls ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border border-border bg-card p-2 rounded-2xl">
                          {editMediaUrls.split(',').filter(Boolean).map((url, index) => {
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
                                    const urls = editMediaUrls.split(',').filter(Boolean);
                                    urls.splice(index, 1);
                                    setEditMediaUrls(urls.join(','));
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
                                  // Append new base64 urls to existing ones
                                  const current = editMediaUrls ? editMediaUrls.split(',').filter(Boolean) : [];
                                  setEditMediaUrls([...current, ...newUrls].join(','));
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
                  onClick={() => setShowEditModal(false)}
                  className="rounded-full px-5 py-2 font-bold hover:bg-muted text-muted-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingEvent}
                  className="rounded-full bg-primary hover:bg-secondary text-primary-foreground font-semibold px-6 py-2.5 shadow-sm"
                >
                  {updatingEvent ? 'Saving...' : 'Save Drive Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              <span>Host a Plantation Drive</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-1 mb-4 pb-2 border-b border-border">
              Organize a local tree planting campaign. Invite community members and track registrations.
            </p>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Drive Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nahor plantation around Dighalipukhuri"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="What is the objective, how many saplings are you planting?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Date of Drive</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
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
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Venue Location Details</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Uzanbazar river bank, Guwahati"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Cover Photo</label>
                {imageUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-border bg-muted/10 p-2">
                    <div className="relative h-20 w-full overflow-hidden rounded-xl">
                      <img src={imageUrl} alt="Event Cover Preview" className="w-full h-full object-cover rounded-xl" />
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
                      <span className="text-[9px] font-bold text-foreground block">Upload Cover Photo</span>
                    </div>
                  </div>
                )}
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
                  {submitting ? 'Scheduling...' : 'Schedule Drive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);
