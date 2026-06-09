'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { Trophy, Award, MapPin, Leaf, ShieldAlert, Star, Shield } from 'lucide-react';

interface UserBadge {
  name: string;
  code: string;
}

interface User {
  id: string;
  displayName: string;
  username: string;
  avatarUrl?: string;
  totalTrees: number;
  badges: UserBadge[];
}

interface District {
  district: string;
  treeCount: number;
}

export default function Leaderboard() {
  const { t, language } = useLanguage();
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [topDistricts, setTopDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch('/api/leaderboard');
        const data = await res.json();
        if (data.topUsers) setTopUsers(data.topUsers);
        if (data.topDistricts) setTopDistricts(data.topDistricts);
      } catch (err) {
        console.error('Error fetching leaderboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  // Podium Positions: [2nd, 1st, 3rd]
  const podiumUsers = [];
  if (topUsers.length > 1) podiumUsers.push(topUsers[1]); // 2nd Place
  if (topUsers.length > 0) podiumUsers.push(topUsers[0]); // 1st Place
  if (topUsers.length > 2) podiumUsers.push(topUsers[2]); // 3rd Place

  const remainingUsers = topUsers.slice(3);

  // Badge list criteria
  const badgeCriteria = [
    {
      code: 'WARRIOR',
      name: 'Green Warrior (সেউজ যোদ্ধা)',
      description: 'Awarded automatically to environmental volunteers who plant and verify 10+ trees.',
      color: 'from-emerald-500 to-green-600',
      iconColor: 'text-emerald-500',
      count: '10+ Trees',
    },
    {
      code: 'PROTECTOR',
      name: 'Nature Protector (প্ৰকৃতি ৰক্ষক)',
      description: 'Awarded to volunteers leading local drives, with 30+ approved tree plantations.',
      color: 'from-blue-500 to-indigo-600',
      iconColor: 'text-indigo-500',
      count: '30+ Trees',
    },
    {
      code: 'CHAMPION',
      name: 'Zubeen Nahor Champion (জুবিন নাহৰ চেম্পিয়ন)',
      description: 'Highest volunteer honor! Awarded to elite volunteers planting 50+ trees.',
      color: 'from-amber-500 to-yellow-600',
      iconColor: 'text-amber-500',
      count: '50+ Trees',
    },
  ];

  return (
    <div className="space-y-12">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          {t('leaderboard_title')}
        </h1>
        <p className="text-sm text-muted-foreground">{t('leaderboard_subtitle')}</p>
      </div>

      {/* Podium Section for Top 3 */}
      {!loading && topUsers.length > 0 && (
        <section className="flex flex-col items-center justify-center pt-8 pb-4 relative">
          <div className="flex items-end justify-center gap-4 sm:gap-8 max-w-xl w-full">
            {/* 2nd Place */}
            {podiumUsers[0] && (
              <div className="flex flex-col items-center flex-1">
                <div className="relative mb-2 group">
                  <img
                    src={podiumUsers[0].avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${podiumUsers[0].username}`}
                    alt={podiumUsers[0].displayName}
                    className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-4 border-slate-350 object-cover bg-card shadow-lg transition-transform duration-350 group-hover:scale-105"
                  />
                  <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-400 text-xs font-black text-white border-2 border-card shadow-sm">2</span>
                </div>
                <div className="text-center mb-2 max-w-[100px] sm:max-w-none">
                  <p className="text-xs font-bold text-foreground truncate">{podiumUsers[0].displayName}</p>
                  <span className="text-[10px] text-muted-foreground">@{podiumUsers[0].username}</span>
                </div>
                {/* Podium Pedestal */}
                <div className="w-24 sm:w-28 h-20 bg-gradient-to-t from-slate-200 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/30 border border-slate-300/40 dark:border-slate-800/40 rounded-t-2xl shadow-inner flex flex-col items-center justify-center text-slate-655 dark:text-slate-400">
                  <span className="text-sm font-black tracking-widest uppercase">2nd</span>
                  <span className="text-xs font-black flex items-center gap-0.5 mt-1">
                    <Leaf className="h-3.5 w-3.5 text-primary" />
                    <span>{podiumUsers[0].totalTrees}</span>
                  </span>
                </div>
              </div>
            )}

            {/* 1st Place */}
            {podiumUsers[1] && (
              <div className="flex flex-col items-center flex-1 z-10 -translate-y-2">
                <div className="relative mb-3 group">
                  <img
                    src={podiumUsers[1].avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${podiumUsers[1].username}`}
                    alt={podiumUsers[1].displayName}
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-full border-4 border-yellow-400 object-cover bg-card shadow-xl ring-4 ring-yellow-400/10 transition-transform duration-350 group-hover:scale-105"
                  />
                  <span className="absolute -top-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-yellow-400 text-xs font-black text-yellow-950 border-2 border-card shadow-sm">1</span>
                  <Trophy className="absolute -top-7 left-1/2 -translate-x-1/2 h-6 w-6 text-yellow-400 drop-shadow-md animate-bounce" />
                </div>
                <div className="text-center mb-2 max-w-[100px] sm:max-w-none">
                  <p className="text-sm font-black text-foreground truncate">{podiumUsers[1].displayName}</p>
                  <span className="text-[10px] text-muted-foreground font-semibold">@{podiumUsers[1].username}</span>
                </div>
                {/* Podium Pedestal */}
                <div className="w-28 sm:w-32 h-28 bg-gradient-to-t from-yellow-500/10 via-yellow-400/5 to-transparent border-t-2 border-x border-yellow-400/40 dark:border-yellow-500/20 rounded-t-2xl shadow-inner flex flex-col items-center justify-center text-yellow-650 dark:text-yellow-400">
                  <span className="text-base font-black tracking-widest uppercase">1st</span>
                  <span className="text-sm font-black flex items-center gap-0.5 mt-1.5">
                    <Leaf className="h-4 w-4 text-primary animate-pulse" />
                    <span>{podiumUsers[1].totalTrees}</span>
                  </span>
                </div>
              </div>
            )}

            {/* 3rd Place */}
            {podiumUsers[2] && (
              <div className="flex flex-col items-center flex-1">
                <div className="relative mb-2 group">
                  <img
                    src={podiumUsers[2].avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${podiumUsers[2].username}`}
                    alt={podiumUsers[2].displayName}
                    className="h-14 w-14 sm:h-18 sm:w-18 rounded-full border-4 border-amber-600/60 object-cover bg-card shadow-lg transition-transform duration-350 group-hover:scale-105"
                  />
                  <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-600/80 text-xs font-black text-white border-2 border-card shadow-sm">3</span>
                </div>
                <div className="text-center mb-2 max-w-[100px] sm:max-w-none">
                  <p className="text-xs font-bold text-foreground truncate">{podiumUsers[2].displayName}</p>
                  <span className="text-[10px] text-muted-foreground">@{podiumUsers[2].username}</span>
                </div>
                {/* Podium Pedestal */}
                <div className="w-24 sm:w-28 h-16 bg-gradient-to-t from-amber-600/10 to-amber-600/5 dark:from-amber-950/20 dark:to-amber-950/5 border border-amber-600/20 dark:border-amber-950/20 rounded-t-2xl shadow-inner flex flex-col items-center justify-center text-amber-800 dark:text-amber-500">
                  <span className="text-xs font-black tracking-widest uppercase">3rd</span>
                  <span className="text-xs font-black flex items-center gap-0.5 mt-1">
                    <Leaf className="h-3.5 w-3.5 text-primary" />
                    <span>{podiumUsers[2].totalTrees}</span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Leaderboard Lists */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Users Rankings List */}
        <div className="aesthetic-card rounded-3xl p-5 sm:p-6 space-y-4">
          <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
            <Trophy className="h-5 w-5 text-primary" />
            <span>{t('leaderboard_top_users')}</span>
          </h2>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded-xl w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {remainingUsers.length > 0 ? (
                remainingUsers.map((u, idx) => (
                  <div key={u.id} className="flex items-center justify-between py-2.5 px-3 hover:bg-muted/30 rounded-xl transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-6">#{idx + 4}</span>
                      <img
                        src={u.avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${u.username}`}
                        alt={u.displayName}
                        className="h-8 w-8 rounded-full object-cover border border-primary/10"
                      />
                      <div>
                        <h3 className="text-xs sm:text-sm font-bold text-foreground">{u.displayName}</h3>
                        <p className="text-[10px] text-muted-foreground">@{u.username}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {/* Badges earned indicator */}
                      <div className="flex gap-0.5">
                        {u.badges.map((b, bidx) => (
                          <span
                            key={bidx}
                            title={b.name}
                            className={`flex h-4.5 w-4.5 items-center justify-center rounded-full text-[8px] font-black ${
                              b.code === 'CHAMPION'
                                ? 'bg-amber-400 text-amber-950 shadow-sm'
                                : b.code === 'PROTECTOR'
                                ? 'bg-blue-400 text-blue-950 shadow-sm'
                                : 'bg-emerald-400 text-emerald-950 shadow-sm'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-foreground flex items-center gap-0.5">
                        <Leaf className="h-3.5 w-3.5 text-primary" />
                        <span>{u.totalTrees}</span>
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">No additional volunteer entries.</p>
              )}
            </div>
          )}
        </div>

        {/* Districts Rankings List */}
        <div className="aesthetic-card rounded-3xl p-5 sm:p-6 space-y-4">
          <h2 className="text-base sm:text-lg font-black text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
            <MapPin className="h-5 w-5 text-accent" />
            <span>{t('leaderboard_top_districts')}</span>
          </h2>

          {loading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded-xl w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              {topDistricts.length > 0 ? (
                topDistricts.map((d, idx) => (
                  <div key={d.district} className="flex items-center justify-between py-3 px-3 hover:bg-muted/30 rounded-xl transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground w-6">#{idx + 1}</span>
                      <span className="text-xs sm:text-sm font-bold text-foreground">{d.district}</span>
                    </div>
                    <span className="text-xs font-bold text-foreground flex items-center gap-0.5">
                      <Leaf className="h-3.5 w-3.5 text-primary" />
                      <span>{d.treeCount}</span>
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">No district records recorded yet.</p>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Rewards and Badges Criteria Section */}
      <section className="aesthetic-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="border-b border-border/60 pb-4">
          <h2 className="text-lg sm:text-xl font-black text-foreground flex items-center gap-2">
            <Award className="h-6 w-6 text-primary" />
            <span>Volunteer Rewards & Badges</span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Earn official badges displayed on your profile. Stand out as an environmental warrior of Assam!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {badgeCriteria.map((badge) => (
            <div
              key={badge.code}
              className="aesthetic-card rounded-2xl bg-muted/10 p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${badge.color} text-white shadow-md`}>
                  <Star className="h-6 w-6 fill-current animate-pulse" />
                </div>
                <h3 className="font-extrabold text-foreground text-sm sm:text-base">{badge.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{badge.description}</p>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/40">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Requirement</span>
                <span className="text-xs font-black text-primary">{badge.count}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
