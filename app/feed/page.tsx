'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  MessageCircle,
  MapPin,
  Leaf,
  Calendar,
  Send,
  PlusCircle,
  CheckCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Tag,
  Search,
  Check,
  X
} from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
}

interface Post {
  id: string;
  caption: string;
  imageUrl?: string;
  videoUrl?: string;
  location?: string;
  district?: string;
  species?: string;
  treeCount: number;
  likesCount: number;
  commentsCount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  user: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    isVerified: boolean;
  };
  likes: { userId: string }[];
  comments: Comment[];
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
  'Karimganj',
  'Goalpara',
  'Morigaon',
  'Golaghat',
  'Nalbari',
  'Dhemaji',
  'Lakhimpur',
  'Majuli',
];

function FeedContent() {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();

  // Feed States
  const [posts, setPosts] = useState<Post[]>([]);
  const [sort, setSort] = useState('latest');
  const [districtFilter, setDistrictFilter] = useState('');
  const [feedLoading, setFeedLoading] = useState(true);

  // Form Modal / View States
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);

  // New Comment Input
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // New Post/Plantation Form State
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState('');
  const [location, setLocation] = useState('');
  const [district, setDistrict] = useState('Kamrup Metropolitan');
  const [village, setVillage] = useState('');
  const [treeCount, setTreeCount] = useState('1');
  const [species, setSpecies] = useState('');
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [notes, setNotes] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Focus modal if redirect query action=plant is present
  useEffect(() => {
    if (searchParams.get('action') === 'plant' && user) {
      setShowForm(true);
      // Pre-fill full name if user is logged in
      setFullName(user.displayName);
    }
  }, [searchParams, user]);

  const fetchPosts = async () => {
    setFeedLoading(true);
    try {
      const url = `/api/posts?sort=${sort}&district=${districtFilter}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.posts) {
        setPosts(data.posts);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setFeedLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [sort, districtFilter]);

  // Handle post submit
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setFormSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption,
          imageUrl: imageUrl || undefined,
          videoUrl: videoUrl || undefined,
          location,
          district: parseInt(treeCount) > 0 ? district : undefined,
          village: parseInt(treeCount) > 0 ? village : undefined,
          treeCount: parseInt(treeCount) || 0,
          species,
          name: fullName,
          mobile,
          notes,
          date,
        }),
      });

      if (res.ok) {
        // Reset form
        setCaption('');
        setImageUrl('');
        setVideoUrl('');
        setFileError('');
        setLocation('');
        setVillage('');
        setTreeCount('1');
        setSpecies('');
        setFullName('');
        setMobile('');
        setNotes('');
        setShowForm(false);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 5000);
        
        // Refresh feed
        fetchPosts();
      }
    } catch (err) {
      console.error('Error creating post:', err);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle direct file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError('');
    if (file) {
      // 15MB file size limit to prevent UI thread lock
      if (file.size > 15 * 1024 * 1024) {
        setFileError('File size must be less than 15MB. (ফাইলৰ আকাৰ ১৫এমবিতকৈ কম হ’ব লাগিব।)');
        return;
      }
      
      setFileLoading(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (file.type.startsWith('video/')) {
          setVideoUrl(result);
          setImageUrl('');
        } else if (file.type.startsWith('image/')) {
          setImageUrl(result);
          setVideoUrl('');
        } else {
          setFileError('Unsupported file type. Please upload an image or video.');
        }
        setFileLoading(false);
      };
      reader.onerror = () => {
        setFileError('Error reading file. (ফাইল পঢ়াত ত্ৰুটি হৈছে।)');
        setFileLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  // Like Toggle
  const handleLike = async (postId: string) => {
    if (!user) return;
    
    // Optimistic update
    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          const userLiked = post.likes.some(l => l.userId === user.id);
          const newLikes = userLiked
            ? post.likes.filter(l => l.userId !== user.id)
            : [...post.likes, { userId: user.id }];
          return {
            ...post,
            likes: newLikes,
            likesCount: userLiked ? post.likesCount - 1 : post.likesCount + 1,
          };
        }
        return post;
      })
    );

    try {
      await fetch('/api/posts/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId }),
      });
    } catch (err) {
      console.error('Error toggling like:', err);
    }
  };

  // Comment submit
  const handleCommentSubmit = async (postId: string) => {
    const content = commentInputs[postId]?.trim();
    if (!user || !content) return;

    // Reset comment field
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));

    try {
      const res = await fetch('/api/posts/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, content }),
      });
      if (res.ok) {
        const data = await res.json();
        // Update posts state with new comment
        setPosts(prev =>
          prev.map(post => {
            if (post.id === postId) {
              return {
                ...post,
                comments: [...post.comments, data.comment],
                commentsCount: post.commentsCount + 1,
              };
            }
            return post;
          })
        );
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
      {/* Feed Area: Columns 1-8 */}
      <div className="lg:col-span-8 space-y-6">
        
        {/* Success toast */}
        <AnimatePresence>
          {showSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="rounded-2xl bg-emerald-500 text-white p-4 shadow-lg flex items-center gap-3"
            >
              <CheckCircle className="h-6 w-6 shrink-0" />
              <div>
                <p className="font-semibold">{t('form_success')}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Feed Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {t('feed_title')}
            </h1>
            <p className="text-sm text-muted-foreground">{t('feed_subtitle')}</p>
          </div>
          
          {user && (
            <button
              onClick={() => {
                setShowForm(true);
                setFullName(user.displayName);
              }}
              className="flex items-center justify-center gap-2 rounded-full bg-primary hover:bg-secondary text-primary-foreground font-semibold px-5 py-2.5 shadow-md shadow-primary/10 transition-transform active:scale-95"
            >
              <PlusCircle className="h-5 w-5" />
              <span>{t('feed_create_post')}</span>
            </button>
          )}
        </div>

        {/* Sorting and Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border/80 p-2.5 rounded-2xl shadow-sm">
          {/* Sort tabs */}
          <div className="flex gap-1.5 bg-muted p-1 rounded-xl">
            {['latest', 'popular', 'trending'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSort(tab)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                  sort === tab
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab === 'latest' ? t('feed_latest') : tab === 'popular' ? t('feed_popular') : t('feed_trending')}
              </button>
            ))}
          </div>

          {/* District filter */}
          <div className="relative">
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="appearance-none rounded-xl border border-border bg-card px-4 py-2 pr-10 text-xs font-medium text-foreground hover:bg-muted focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
            >
              <option value="">All Districts (সকলো জিলা)</option>
              {DISTRICTS_LIST.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Posts List */}
        {feedLoading ? (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse rounded-3xl border border-border bg-card p-6 h-64 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded w-1/4" />
                    <div className="h-3 bg-muted rounded w-1/6" />
                  </div>
                </div>
                <div className="h-20 bg-muted rounded-2xl w-full" />
                <div className="h-10 bg-muted rounded-2xl w-1/2" />
              </div>
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="space-y-6">
            {posts.map((post) => {
              const isLiked = user ? post.likes.some(l => l.userId === user.id) : false;
              const isCommentsActive = activeCommentPostId === post.id;
              
              return (
                <motion.article
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="aesthetic-card rounded-3xl p-5 sm:p-6 space-y-4"
                  key={post.id}
                >
                  {/* User profile header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${post.user.username}`}
                        alt={post.user.displayName}
                        className="h-10 w-10 rounded-full object-cover border border-primary/20"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                          <span>{post.user.displayName}</span>
                          {post.user.isVerified && (
                            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-white text-[8px]">✓</span>
                          )}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          @{post.user.username} • {new Date(post.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'as-IN', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Verification Status Badge (Only shows if treeCount > 0) */}
                    {post.treeCount > 0 && (
                      <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                        post.status === 'APPROVED'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50'
                          : post.status === 'REJECTED'
                          ? 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200 dark:border-red-900/50'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
                      }`}>
                        {post.status === 'APPROVED' ? (
                          <>
                            <Check className="h-3.5 w-3.5" />
                            <span>{post.treeCount} {t('feed_trees_planted')} (Verified)</span>
                          </>
                        ) : post.status === 'REJECTED' ? (
                          <span>Rejected Entry</span>
                        ) : (
                          <>
                            <Clock className="h-3.5 w-3.5" />
                            <span>{post.treeCount} {t('feed_trees_planted')} (Pending Verification)</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Caption & Content */}
                  <div className="space-y-3">
                    <p className="text-sm text-foreground whitespace-pre-line leading-relaxed">
                      {post.caption}
                    </p>
                    
                    {post.imageUrl && (
                      <div className="overflow-hidden rounded-2xl border border-border">
                        <img
                          src={post.imageUrl}
                          alt="Plantation"
                          className="w-full max-h-[400px] object-cover hover:scale-[1.01] transition-transform duration-500"
                        />
                      </div>
                    )}
                    {post.videoUrl && (
                      <div className="overflow-hidden rounded-2xl border border-border">
                        <video
                          src={post.videoUrl}
                          controls
                          className="w-full max-h-[400px] object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Post details: species / location */}
                  {(post.species || post.location) && (
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border-y border-border/40 py-2.5">
                      {post.species && (
                        <div className="flex items-center gap-1">
                          <Leaf className="h-3.5 w-3.5 text-primary" />
                          <span>Species: <strong className="text-foreground">{post.species}</strong></span>
                        </div>
                      )}
                      {post.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-accent" />
                          <span>Location: <strong className="text-foreground">{post.location}</strong></span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Interaction bar */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex gap-4">
                      {/* Like button */}
                      <button
                        onClick={() => handleLike(post.id)}
                        disabled={!user}
                        className={`flex items-center gap-1.5 text-sm font-semibold transition-all hover:scale-105 ${
                          isLiked ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${isLiked ? 'fill-current' : ''}`} />
                        <span>{post.likesCount}</span>
                      </button>

                      {/* Comments toggle button */}
                      <button
                        onClick={() => setActiveCommentPostId(isCommentsActive ? null : post.id)}
                        className={`flex items-center gap-1.5 text-sm font-semibold transition-all hover:scale-105 ${
                          isCommentsActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                        }`}
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span>{post.commentsCount}</span>
                      </button>
                    </div>

                    <span className="text-xs text-muted-foreground">
                      ID: {post.id.substring(0, 8)}
                    </span>
                  </div>

                  {/* Comments section */}
                  {isCommentsActive && (
                    <div className="border-t border-border pt-4 mt-3 space-y-4">
                      {/* Comments list */}
                      <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                        {post.comments.length > 0 ? (
                          post.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-2.5 items-start text-xs bg-muted/40 p-2.5 rounded-xl border border-border/30">
                              <img
                                src={comment.user.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${comment.user.username}`}
                                alt={comment.user.displayName}
                                className="h-6 w-6 rounded-full object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-bold text-foreground">
                                  {comment.user.displayName}{' '}
                                  <span className="text-[10px] text-muted-foreground font-normal">@{comment.user.username}</span>
                                </p>
                                <p className="text-muted-foreground mt-0.5 whitespace-pre-line">{comment.content}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-muted-foreground text-center py-2">No comments yet. Write the first one!</p>
                        )}
                      </div>

                      {/* Add comment input */}
                      {user ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder={t('feed_write_comment')}
                            value={commentInputs[post.id] || ''}
                            onChange={(e) =>
                              setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleCommentSubmit(post.id);
                            }}
                            className="flex-1 rounded-xl border border-border bg-card px-3.5 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <button
                            onClick={() => handleCommentSubmit(post.id)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-secondary transition-colors"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-center text-muted-foreground bg-muted p-2.5 rounded-xl">
                          Please <Link href="/login" className="font-bold text-primary hover:underline">Sign In</Link> to write a comment.
                        </p>
                      )}
                    </div>
                  )}
                </motion.article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
            <Leaf className="mx-auto h-12 w-12 text-primary opacity-20 mb-4" />
            <p className="font-semibold">{t('feed_no_posts')}</p>
          </div>
        )}
      </div>

      {/* Verification / Log Form Modal Sidebar: Columns 9-12 */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Guest Warning Card */}
        {!user && (
          <div className="rounded-3xl border border-primary/20 bg-emerald-50/50 dark:bg-emerald-950/10 p-6 shadow-sm text-center space-y-4">
            <Leaf className="h-8 w-8 text-primary mx-auto" />
            <h3 className="font-bold text-foreground">Want to join the movement?</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sign in to share your tree plantations, like posts, comment, and have your trees count towards the Zubeen Garg live tribute counter.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link href="/login" className="rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground hover:bg-secondary transition-colors">
                {t('nav_login')}
              </Link>
              <Link href="/signup" className="rounded-xl border border-border bg-card py-2 text-xs font-bold text-foreground hover:bg-muted transition-colors">
                {t('nav_signup')}
              </Link>
            </div>
          </div>
        )}

        {/* Sidebar Info - Trending Tags */}
        <div className="aesthetic-card rounded-3xl p-6 space-y-4">
          <h2 className="font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
            <Tag className="h-5 w-5 text-primary" />
            <span>{t('feed_trending')}</span>
          </h2>
          <div className="flex flex-wrap gap-2 text-xs">
            {['#ZubeenNahor', '#OneGreenerAssam', '#PlantationDrive', '#ZubeenGarg', '#EcoWarrior', '#SeujiAxom', '#NahorPlanted', '#BakulMemory'].map((tag) => (
              <button
                key={tag}
                onClick={() => setCaption(prev => (prev ? prev + ' ' + tag : tag))}
                className="rounded-lg bg-muted px-2.5 py-1.5 font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Plantation Form Inline (or modal toggle) */}
        {user && (
          <div className="aesthetic-card rounded-3xl p-6 bg-gradient-to-br from-card to-secondary/5 space-y-4">
            <h2 className="font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Leaf className="h-5 w-5 text-primary" />
              <span>Log a Plantation</span>
            </h2>
            <p className="text-xs text-muted-foreground">
              Submit your planting details to update the live counter. All data is reviewed by admins.
            </p>
            <button
              onClick={() => {
                setShowForm(true);
                setFullName(user.displayName);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-secondary text-primary-foreground font-semibold px-4 py-2.5 shadow-sm text-sm transition-transform active:scale-95"
            >
              <span>Launch Verification Form</span>
            </button>
          </div>
        )}
      </div>

      {/* Full Verification Modal Screen */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-card border border-border rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto my-8"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowForm(false)}
                className="absolute top-4 right-4 rounded-full p-1.5 hover:bg-muted text-muted-foreground"
              >
                <ChevronDown className="h-6 w-6" />
              </button>

              <h2 className="text-xl sm:text-2xl font-extrabold text-foreground flex items-center gap-2">
                <Leaf className="h-6 w-6 text-primary" />
                <span>{t('form_title')}</span>
              </h2>
              <p className="text-xs text-muted-foreground mt-1 mb-6 border-b border-border pb-3">
                {t('form_subtitle')}
              </p>

              {/* Plantation Form */}
              <form onSubmit={handleCreatePost} className="space-y-4">
                {/* 1. Caption / Social share */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Feed Caption (সোশ্যাল মিডিয়া কেপশ্বন)
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder={t('feed_placeholder_caption')}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  />
                </div>

                {/* Grid inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      {t('form_name')}
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                    />
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      {t('form_mobile')}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                    />
                  </div>

                  {/* District select */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      {t('form_district')}
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                    >
                      {DISTRICTS_LIST.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Village / Town */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      {t('form_village')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Teok / Nazira"
                      value={village}
                      onChange={(e) => setVillage(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                    />
                  </div>

                  {/* Location Details */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      {t('form_location')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Near high school playground"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                    />
                  </div>

                  {/* Tree Count */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      {t('form_count')}
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={treeCount}
                      onChange={(e) => setTreeCount(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                    />
                  </div>

                  {/* Tree Species */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      {t('form_species')}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nahor, Bakul, Krishnachura"
                      value={species}
                      onChange={(e) => setSpecies(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                      {t('form_date')}
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                    />
                  </div>
                </div>

                {/* Direct File Upload */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Upload Plantation Photo or Video (ফটো বা ভিডিঅ’ আপলোড কৰক)
                  </label>
                  
                  {fileError && (
                    <p className="text-xs text-red-500 font-semibold mb-2">{fileError}</p>
                  )}

                  {!imageUrl && !videoUrl ? (
                    <div className="relative border-2 border-dashed border-border/80 hover:border-primary rounded-2xl p-6 transition-all duration-300 bg-muted/20 hover:bg-muted/30 group flex flex-col items-center justify-center text-center cursor-pointer">
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        disabled={fileLoading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {fileLoading ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                          <span className="text-xs text-muted-foreground font-medium">Processing file...</span>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="mx-auto h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                            <PlusCircle className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-foreground block">Click or Drag to Upload</span>
                            <span className="text-[10px] text-muted-foreground block mt-0.5">Supports images & videos up to 15MB</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative rounded-2xl overflow-hidden border border-border bg-muted/10 p-2">
                      {imageUrl && (
                        <div className="relative max-h-48 w-full overflow-hidden rounded-xl">
                          <img
                            src={imageUrl}
                            alt="Uploaded preview"
                            className="w-full h-full object-cover max-h-48 rounded-xl"
                          />
                        </div>
                      )}
                      {videoUrl && (
                        <div className="relative max-h-48 w-full overflow-hidden rounded-xl">
                          <video
                            src={videoUrl}
                            controls
                            className="w-full h-full object-cover max-h-48 rounded-xl"
                          />
                        </div>
                      )}
                      
                      {/* Delete Overlay Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrl('');
                          setVideoUrl('');
                        }}
                        className="absolute top-4 right-4 rounded-full bg-black/60 hover:bg-black/80 text-white p-1.5 shadow-md backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95 z-20"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                    {t('form_notes')}
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Write details or message for verifiers..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="rounded-full px-5 py-2 text-xs font-bold hover:bg-muted text-muted-foreground transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="flex items-center gap-1.5 rounded-full bg-primary hover:bg-secondary text-primary-foreground font-semibold px-6 py-2.5 shadow-md shadow-primary/10 transition-colors"
                  >
                    {formSubmitting ? 'Submitting...' : t('form_submit')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Feed() {
  return (
    <Suspense fallback={
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    }>
      <FeedContent />
    </Suspense>
  );
}
