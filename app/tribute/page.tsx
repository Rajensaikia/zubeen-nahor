'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { Music, Leaf, Calendar, Quote, Heart, Award } from 'lucide-react';

interface Stats {
  totalTrees: number;
  totalContributors: number;
}

export default function Tribute() {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState<Stats>({ totalTrees: 0, totalContributors: 0 });

  const [timelineMilestones, setTimelineMilestones] = useState<any[]>([]);
  const [songQuotes, setSongQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const statsRes = await fetch('/api/stats');
        const statsData = await statsRes.json();
        if (statsData.totalTrees !== undefined) {
          setStats({
            totalTrees: statsData.totalTrees,
            totalContributors: statsData.totalContributors,
          });
        }

        const tributeRes = await fetch('/api/tribute');
        const tributeData = await tributeRes.json();
        if (tributeData.milestones) {
          setTimelineMilestones(tributeData.milestones);
        }
        if (tributeData.quotes) {
          setSongQuotes(tributeData.quotes);
        }
      } catch (err) {
        console.error('Error fetching tribute data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }


  return (
    <div className="space-y-12">
      {/* 1. Header Hero */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-emerald-950 text-white shadow-2xl min-h-[380px] flex items-center border border-zinc-800/40">
        {/* Background images overlay */}
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-25 mix-blend-overlay" style={{ backgroundImage: "url('/images/ZUBEEN.jpg')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-900/90 to-transparent z-0"></div>

        {/* Ambient glow behind portrait */}
        <div className="absolute left-12 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl px-6 py-12 sm:px-12 flex flex-col md:flex-row items-center gap-8">
          <img
            src="/images/Zubeen Garg.jpg"
            alt="Zubeen Garg Portrait"
            className="h-40 w-40 sm:h-52 sm:w-52 rounded-2xl border-4 border-emerald-600 object-cover object-top shadow-2xl shrink-0 scale-[1.01] transition-transform duration-500 hover:scale-[1.03]"
          />
          <div className="space-y-4 text-center md:text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/35 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-400 backdrop-blur-sm">
              <Music className="h-3.5 w-3.5" />
              <span>Artist & Environmental Pioneer</span>
            </span>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-emerald-100 to-zinc-200 bg-clip-text text-transparent">
              Zubeen Garg
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 max-w-xl italic">
              "One Tree, One Memory, One Greener Assam (এটি গছ, এটি স্মৃতি, এখন সেউজীয়া অসম)"
            </p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-3.5 border-t border-zinc-800">
              <div>
                <span className="block text-2xl font-black text-emerald-400">{stats.totalTrees}</span>
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Trees Dedicated</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-emerald-400">{stats.totalContributors}</span>
                <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">Memory Keepers</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Environmental Philosophy & Vision */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="space-y-6">
          <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2">
            <Leaf className="h-5.5 w-5.5 text-primary" />
            <span>The Environmental Philosophy</span>
          </h2>
          <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed space-y-4">
            <p>
              For over three decades, Zubeen Garg has inspired millions of people through his music. But beyond the stage, he has always maintained a deep connection to the soil and forests of Assam. His call to action is simple yet powerful: <strong>do not let your memories fade; plant a tree to seal them forever.</strong>
            </p>
            <p>
              Whether celebrating a birthday, commemorating a wedding, or remembering a lost loved one, dedicating a tree creates a living, breathing tribute. Through the <em>Zubeen Nahor</em> platform, we digitize this dream, helping local volunteers plant indigenous species like Nahor (Ironwood), Bakul, and Krishnachura across Assam's landscapes.
            </p>
          </div>
          
          {/* Quote Box */}
          <div className="aesthetic-card rounded-2xl p-6 relative overflow-hidden bg-gradient-to-br from-card to-secondary/5">
            <Quote className="absolute -right-2 -bottom-2 h-16 w-16 text-primary/10" />
            <p className="text-xs sm:text-sm font-medium italic text-foreground leading-relaxed font-serif">
              "Every song I sing was born from the wind rustling the leaves of Assam. If we do not plant trees today, our children will inherit a silent land with no songs left to hear."
            </p>
            <p className="text-xs text-primary font-bold mt-4 text-right">— Zubeen Garg</p>
          </div>
        </div>

        {/* Music Connection */}
        <div className="aesthetic-card rounded-3xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 border-b border-border/60 pb-3">
            <Music className="h-5 w-5 text-primary" />
            <span>Echoes of Nature in Music</span>
          </h2>
          <p className="text-xs text-muted-foreground">
            Zubeen's lyrics reflect the weather, seasons, and flora of the Brahmaputra Valley:
          </p>

          <div className="space-y-4">
            {songQuotes.map((q) => (
              <div key={q.title} className="bg-muted/30 border border-border/40 hover:border-primary/15 hover:bg-muted/50 p-4 rounded-2xl space-y-2.5 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">Song: {q.title}</span>
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 text-xs">♪</span>
                </div>
                <p className="text-sm font-bold text-primary italic font-serif leading-relaxed">{q.lyric}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{q.meaning}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Timeline of the Movement */}
      <section className="aesthetic-card rounded-3xl p-6 sm:p-8 space-y-6">
        <h2 className="text-xl sm:text-2xl font-black text-foreground flex items-center gap-2 border-b border-border/60 pb-4">
          <Calendar className="h-6 w-6 text-primary" />
          <span>{t('tribute_timeline_title')}</span>
        </h2>

        {/* Vertical Timeline */}
        <div className="relative border-l-2 border-border/80 pl-6 ml-4 space-y-8">
          {timelineMilestones.map((m, idx) => (
            <div key={idx} className="relative group">
              {/* Dot */}
              <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary ring-4 ring-card transition-transform group-hover:scale-125 duration-300"></span>
              
              <div className="space-y-1">
                <span className="inline-block rounded bg-primary/10 text-primary border border-primary/5 px-2 py-0.5 text-[10px] font-bold">
                  {m.year}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-foreground group-hover:text-primary transition-colors">{m.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">{m.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
