'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { motion } from 'framer-motion';
import { Leaf, Users, Map, Calendar, Music, ArrowRight, Quote, Shield, Heart } from 'lucide-react';

interface Stats {
  totalTrees: number;
  totalContributors: number;
  totalDistricts: number;
  totalEvents: number;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  district: string;
  imageUrl?: string;
  attendeesCount: number;
}

interface Group {
  id: string;
  name: string;
  description: string;
  type: string;
  imageUrl?: string;
  membersCount: number;
}

export default function Home() {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState<Stats>({
    totalTrees: 0,
    totalContributors: 0,
    totalDistricts: 0,
    totalEvents: 0,
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/home-data');
        const data = await res.json();
        if (data.stats) setStats(data.stats);
        if (data.latestEvents) setEvents(data.latestEvents);
        if (data.latestGroups) setGroups(data.latestGroups);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <div className="space-y-12">
      {/* 1. Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-950 text-white shadow-2xl border border-emerald-800/40"
      >
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-85 mix-blend-overlay" style={{ backgroundImage: "url('/images/hero.jpg')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-950/80 to-transparent z-0"></div>

        {/* Ambient glow behind hero content */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl px-6 py-14 sm:px-12 sm:py-24 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/25 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400 backdrop-blur-sm">
            <Music className="h-3.5 w-3.5 text-primary" />
            <span>{t('tribute_title')}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight bg-gradient-to-r from-white via-emerald-100 to-white bg-clip-text text-transparent">
            {t('hero_title')}
          </h1>
          <p className="text-sm sm:text-base text-emerald-200/90 max-w-xl leading-relaxed">
            {t('hero_subtitle')}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-3">
            <Link
              href="/feed?action=plant"
              className="flex items-center gap-2 rounded-full bg-primary hover:bg-emerald-500 px-6 py-3.5 font-bold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95"
            >
              <Leaf className="h-4.5 w-4.5" />
              <span>{t('cta_plant')}</span>
            </Link>
            <Link
              href="/tribute"
              className="flex items-center gap-2 rounded-full border border-emerald-700 bg-emerald-900/20 hover:bg-emerald-900/50 px-6 py-3.5 font-bold text-emerald-300 hover:text-white transition-all hover:scale-105 active:scale-95 backdrop-blur-sm"
            >
              <span>{t('cta_tribute')}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/music"
              className="flex items-center justify-center rounded-full bg-pink-600 hover:bg-pink-500 text-white p-3.5 shadow-lg shadow-pink-600/25 transition-all hover:scale-110 active:scale-95 hover:rotate-6 group"
              title={t('hero_heart_tooltip')}
              aria-label={t('hero_heart_tooltip')}
            >
              <Heart className="h-5.5 w-5.5 fill-current text-white transition-transform group-hover:scale-110" />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* 2. Live Counter Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
      >
        {/* Tree Count Card */}
        <motion.div
          variants={itemVariants}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-emerald-800 text-white p-5 sm:p-6 shadow-xl shadow-primary/10 border border-primary/20 hover:scale-[1.02] transition-transform duration-300"
        >
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10">
            <Leaf className="h-32 w-32" />
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 border border-white/10 mb-4">
            <Leaf className="h-5.5 w-5.5 text-emerald-300 glow-indicator" />
          </div>
          <p className="text-3xl sm:text-4xl font-black tracking-tight text-white">
            <AnimatedCounter value={stats.totalTrees} />
          </p>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-emerald-200 mt-1.5">
            {t('counter_total_trees')}
          </h3>
        </motion.div>

        {/* Contributors Card */}
        <motion.div
          variants={itemVariants}
          className="aesthetic-card relative overflow-hidden rounded-2xl p-5 sm:p-6"
        >
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 text-primary">
            <Users className="h-32 w-32" />
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/15 border border-primary/10 text-primary mb-4">
            <Users className="h-5.5 w-5.5" />
          </div>
          <p className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            <AnimatedCounter value={stats.totalContributors} />
          </p>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1.5">
            {t('counter_contributors')}
          </h3>
        </motion.div>

        {/* Districts Card */}
        <motion.div
          variants={itemVariants}
          className="aesthetic-card relative overflow-hidden rounded-2xl p-5 sm:p-6"
        >
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 text-accent">
            <Map className="h-32 w-32" />
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10 border border-accent/10 text-accent mb-4">
            <Map className="h-5.5 w-5.5" />
          </div>
          <p className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            <AnimatedCounter value={stats.totalDistricts} />
          </p>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1.5">
            {t('counter_districts')}
          </h3>
        </motion.div>

        {/* Events Card */}
        <motion.div
          variants={itemVariants}
          className="aesthetic-card relative overflow-hidden rounded-2xl p-5 sm:p-6"
        >
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-5 text-primary">
            <Calendar className="h-32 w-32" />
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/15 border border-primary/10 text-primary mb-4">
            <Calendar className="h-5.5 w-5.5" />
          </div>
          <p className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            <AnimatedCounter value={stats.totalEvents} />
          </p>
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-1.5">
            {t('counter_events')}
          </h3>
        </motion.div>
      </motion.section>

      {/* 3. Tribute & Quote Section */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="md:col-span-5 aesthetic-card rounded-3xl p-6 flex flex-col justify-between overflow-hidden relative"
        >
          <div className="space-y-4">
            <Quote className="h-8 w-8 text-primary/40" />
            <p className="text-base sm:text-lg font-medium italic text-foreground leading-relaxed font-serif">
              {t('tribute_quote')}
            </p>
          </div>

          <div className="flex items-center gap-3 mt-6 border-t border-border/60 pt-4">
            <img
              src="/images/Zubeen Garg.jpg"
              alt="Zubeen Garg Tribute"
              className="h-12 w-12 rounded-full border border-primary object-cover object-top shadow-sm"
            />
            <div>
              <p className="text-sm font-bold text-foreground">Zubeen Garg</p>
              <p className="text-xs text-muted-foreground">Legendary Assamese Singer & Environmentalist</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="md:col-span-7 aesthetic-card rounded-3xl p-6 flex flex-col justify-between bg-gradient-to-br from-card to-secondary/5"
        >
          <div className="space-y-4">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-primary">
              {t('tribute_vision_title')}
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {t('tribute_vision_text')}
            </p>
            <div className="pt-2 flex flex-col gap-2.5">
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs mt-0.5">✓</span>
                <span className="text-xs sm:text-sm text-foreground"><strong>2,500+ trees</strong> already committed across 15+ districts of Assam.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs mt-0.5">✓</span>
                <span className="text-xs sm:text-sm text-foreground">Verification system managed by verified Super Admins to ensure compliance.</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Motto: {t('motto')}</span>
            <Link href="/tribute" className="text-xs sm:text-sm font-bold text-primary hover:text-secondary flex items-center gap-1">
              <span>Read Bio</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* 4. Events & Groups Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Events list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>{t('events_title')}</span>
            </h2>
            <Link href="/events" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {events.length > 0 ? (
              events.map((evt) => (
                <div key={evt.id} className="aesthetic-card flex gap-4 rounded-2xl p-4">
                  {evt.imageUrl && (
                    <img src={evt.imageUrl} alt={evt.title} className="hidden sm:block h-20 w-20 rounded-xl object-cover border border-border" />
                  )}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-foreground text-sm truncate">{evt.title}</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{evt.location} ({evt.district})</p>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/40">
                      <span className="text-[11px] text-primary font-bold">
                        {new Date(evt.date).toLocaleDateString(language === 'en' ? 'en-US' : 'as-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-semibold">{evt.attendeesCount} joined</span>
                      <Link href="/events" className="text-[11px] font-bold text-primary hover:underline">
                        Join Event →
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground p-8 border border-dashed border-border rounded-2xl text-center">No upcoming events listed.</p>
            )}
          </div>
        </div>

        {/* Groups list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span>{t('groups_title')}</span>
            </h2>
            <Link href="/groups" className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5">
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groups.length > 0 ? (
              groups.slice(0, 2).map((gp) => (
                <div key={gp.id} className="aesthetic-card rounded-2xl p-4 flex flex-col justify-between">
                  <div>
                    {gp.imageUrl && (
                      <img src={gp.imageUrl} alt={gp.name} className="h-24 w-full rounded-xl object-cover mb-3 border border-border" />
                    )}
                    <span className="inline-block rounded bg-primary/10 border border-primary/5 text-primary px-1.5 py-0.5 text-[9px] font-bold uppercase mb-1">
                      {gp.type}
                    </span>
                    <h3 className="font-bold text-foreground text-xs sm:text-sm truncate">{gp.name}</h3>
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{gp.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
                    <span className="text-[10px] text-muted-foreground font-semibold">{gp.membersCount} {t('groups_members')}</span>
                    <Link href="/groups" className="text-[11px] font-bold text-primary hover:underline">
                      Join Group
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-2 text-xs text-muted-foreground p-8 border border-dashed border-border rounded-2xl text-center">No active community groups listed.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
