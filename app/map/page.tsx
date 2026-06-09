'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map as MapIcon,
  Award,
  Leaf,
  Search,
  HelpCircle,
  Globe,
  User,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  Calendar,
  MapPin,
  TrendingUp,
} from 'lucide-react';

interface DistrictStat {
  district: string;
  treeCount: number;
  recordCount: number;
  contributorCount: number;
  speciesBreakdown: { species: string; count: number }[];
  recentRecords: any[];
}

const DISTRICT_COORDS = [
  { id: 'dhubri', name: 'Dhubri', x: 80, y: 180, code: 'DB', region: 'Lower Assam' },
  { id: 'goalpara', name: 'Goalpara', x: 140, y: 190, code: 'GP', region: 'Lower Assam' },
  { id: 'bongaigaon', name: 'Bongaigaon', x: 140, y: 130, code: 'BG', region: 'Lower Assam' },
  { id: 'barpeta', name: 'Barpeta', x: 200, y: 120, code: 'BP', region: 'Lower Assam' },
  { id: 'nalbari', name: 'Nalbari', x: 240, y: 110, code: 'NL', region: 'Lower Assam' },
  { id: 'kamrup', name: 'Kamrup', x: 280, y: 130, code: 'KP', region: 'Lower Assam' },
  { id: 'kamrup_metro', name: 'Kamrup Metropolitan', x: 320, y: 150, code: 'KM', region: 'Central Assam' },
  { id: 'morigaon', name: 'Morigaon', x: 380, y: 140, code: 'MR', region: 'Central Assam' },
  { id: 'nagaon', name: 'Nagaon', x: 440, y: 150, code: 'NG', region: 'Central Assam' },
  { id: 'sonitpur', name: 'Sonitpur', x: 460, y: 90, code: 'ST', region: 'Upper Assam' },
  { id: 'golaghat', name: 'Golaghat', x: 540, y: 160, code: 'GG', region: 'Upper Assam' },
  { id: 'jorhat', name: 'Jorhat', x: 590, y: 130, code: 'JH', region: 'Upper Assam' },
  { id: 'majuli', name: 'Majuli', x: 620, y: 100, code: 'MJ', region: 'Upper Assam' },
  { id: 'sivasagar', name: 'Sivasagar', x: 650, y: 120, code: 'SV', region: 'Upper Assam' },
  { id: 'lakhimpur', name: 'Lakhimpur', x: 580, y: 70, code: 'LK', region: 'Upper Assam' },
  { id: 'dhemaji', name: 'Dhemaji', x: 660, y: 60, code: 'DM', region: 'Upper Assam' },
  { id: 'dibrugarh', name: 'Dibrugarh', x: 710, y: 100, code: 'DR', region: 'Upper Assam' },
  { id: 'tinsukia', name: 'Tinsukia', x: 770, y: 90, code: 'TS', region: 'Upper Assam' },
  { id: 'karbi_anglong', name: 'Karbi Anglong', x: 470, y: 210, code: 'KA', region: 'Hills & Barak Valley' },
  { id: 'dima_hasao', name: 'Dima Hasao', x: 420, y: 260, code: 'DH', region: 'Hills & Barak Valley' },
  { id: 'cachar', name: 'Cachar', x: 400, y: 320, code: 'CH', region: 'Hills & Barak Valley' },
  { id: 'karimganj', name: 'Karimganj', x: 350, y: 340, code: 'KJ', region: 'Hills & Barak Valley' },
];

const REGION_THEMES: Record<
  string,
  {
 color: string;
 glow: string;
 fill: string;
 stroke: string;
 badge: string;
 dot: string;
}
> = {
  'Lower Assam': {
    color: 'text-amber-500',
    glow: 'shadow-amber-500/20',
    fill: 'fill-amber-500 dark:fill-amber-950/40',
    stroke: 'stroke-amber-600 dark:stroke-amber-500',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
    dot: 'bg-amber-500',
  },
  'Central Assam': {
    color: 'text-emerald-500',
    glow: 'shadow-emerald-500/20',
    fill: 'fill-emerald-500 dark:fill-emerald-950/40',
    stroke: 'stroke-emerald-600 dark:stroke-emerald-500',
    badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
    dot: 'bg-emerald-500',
  },
  'Upper Assam': {
    color: 'text-indigo-500',
    glow: 'shadow-indigo-500/20',
    fill: 'fill-indigo-500 dark:fill-indigo-950/40',
    stroke: 'stroke-indigo-600 dark:stroke-indigo-500',
    badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20',
    dot: 'bg-indigo-500',
  },
  'Hills & Barak Valley': {
    color: 'text-rose-500',
    glow: 'shadow-rose-500/20',
    fill: 'fill-rose-500 dark:fill-rose-950/40',
    stroke: 'stroke-rose-600 dark:stroke-rose-500',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20',
    dot: 'bg-rose-500',
  },
};

export default function PlantationMap() {
  const { t, language } = useLanguage();
  const [dbStats, setDbStats] = useState<Record<string, DistrictStat>>({});
  const [overallStats, setOverallStats] = useState<{
    totalTrees: number;
    totalContributors: number;
    totalDistricts: number;
    recentActivity: any[];
    speciesStats: { species: string; count: number }[];
  } | null>(null);

  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'heatmap' | 'regions'>('heatmap');
  const [loading, setLoading] = useState(true);

  // Zoom and Pan State
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Floating Tooltip State
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    name: string;
    code: string;
    count: number;
    contributors: number;
    rank: number;
    region: string;
  } | null>(null);

  // Sidebar Tabs
  const [activeTab, setActiveTab] = useState<'insights' | 'species' | 'activity'>('insights');

  // Photo Lightbox
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMapData() {
      try {
        const res = await fetch('/api/map-data');
        const data = await res.json();
        if (data.stats) {
          const statsMap: Record<string, DistrictStat> = {};
          data.stats.forEach((item: DistrictStat) => {
            statsMap[item.district.toLowerCase().trim()] = item;
          });
          setDbStats(statsMap);
        }
        if (data.overall) {
          setOverallStats(data.overall);
        }
      } catch (err) {
        console.error('Error fetching map data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMapData();
  }, []);

  // Helpers to fetch metrics per district
  const getTreeCount = (name: string) => {
    return dbStats[name.toLowerCase().trim()]?.treeCount || 0;
  };

  const getContributorCount = (name: string) => {
    return dbStats[name.toLowerCase().trim()]?.contributorCount || 0;
  };

  const getRecordCount = (name: string) => {
    return dbStats[name.toLowerCase().trim()]?.recordCount || 0;
  };

  const getSpeciesBreakdown = (name: string) => {
    return dbStats[name.toLowerCase().trim()]?.speciesBreakdown || [];
  };

  const getRecentRecords = (name: string) => {
    return dbStats[name.toLowerCase().trim()]?.recentRecords || [];
  };

  const sortedDistricts = DISTRICT_COORDS.map((dist) => ({
    ...dist,
    count: getTreeCount(dist.name),
  })).sort((a, b) => b.count - a.count);

  const getDistrictRank = (id: string) => {
    return sortedDistricts.findIndex((d) => d.id === id) + 1;
  };

  const filteredDistricts = sortedDistricts.filter((d) =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedDistInfo = selectedDistrict
    ? sortedDistricts.find((d) => d.id === selectedDistrict)
    : null;

  const selectedDistRank = selectedDistrict ? getDistrictRank(selectedDistrict) : 0;

  // Zoom & Pan Actions
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () =>
    setZoom((prev) => {
      const nextZoom = Math.max(prev - 0.25, 1);
      if (nextZoom === 1) setPan({ x: 0, y: 0 });
      return nextZoom;
    });
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      const limit = (zoom - 1) * 250;
      setPan({
        x: Math.max(-limit, Math.min(limit, newX)),
        y: Math.max(-limit, Math.min(limit, newY)),
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Tooltip Handlers
  const handleNodeMouseEnter = (e: React.MouseEvent, dist: (typeof DISTRICT_COORDS)[0]) => {
    const container = document.getElementById('map-container');
    if (container) {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top - 12;

      setTooltip({
        x,
        y,
        name: dist.name,
        code: dist.code,
        count: getTreeCount(dist.name),
        contributors: getContributorCount(dist.name),
        rank: getDistrictRank(dist.id),
        region: dist.region,
      });
    }
  };

  const handleNodeMouseMove = (e: React.MouseEvent) => {
    if (tooltip) {
      const container = document.getElementById('map-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        setTooltip((prev) =>
          prev
            ? {
                ...prev,
                x: e.clientX - rect.left,
                y: e.clientY - rect.top - 12,
              }
            : null
        );
      }
    }
  };

  const handleNodeMouseLeave = () => {
    setTooltip(null);
  };

  // Node styles generator
  const getNodeColorClass = (
    dist: (typeof DISTRICT_COORDS)[0],
    count: number,
    isSelected: boolean,
    isSearched: boolean
  ) => {
    if (viewMode === 'regions') {
      const theme = REGION_THEMES[dist.region] || REGION_THEMES['Lower Assam'];
      if (isSelected) return `${theme.fill} ${theme.stroke} stroke-[3] scale-110`;
      if (isSearched) return `${theme.fill} ${theme.stroke} stroke-[2.5]`;
      return `${theme.fill} ${theme.stroke} opacity-85 hover:opacity-100 hover:scale-105`;
    } else {
      if (count === 0) return 'fill-muted stroke-border opacity-60 hover:opacity-100';

      let base = '';
      if (count < 20) {
        base =
          'fill-emerald-100 stroke-emerald-300 dark:fill-emerald-950/35 dark:stroke-emerald-800';
      } else if (count < 50) {
        base = 'fill-emerald-500 stroke-emerald-600 dark:fill-emerald-800 dark:stroke-emerald-500';
      } else {
        base = 'fill-emerald-700 stroke-emerald-800 dark:fill-emerald-600 dark:stroke-emerald-400';
      }

      if (isSelected) return `${base} stroke-[3] scale-110`;
      if (isSearched) return `${base} stroke-[2.5]`;
      return `${base} hover:scale-105`;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
          <Leaf className="h-6 w-6 text-primary absolute inset-0 m-auto animate-pulse" />
        </div>
        <p className="text-sm font-bold text-muted-foreground animate-pulse">
          {language === 'en' ? 'Loading Plantation Map...' : 'মানচিত্ৰ ল’ড হৈ আছে...'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2.5">
          <MapIcon className="h-7 w-7 text-primary" />
          <span>{t('map_title')}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t('map_subtitle')}</p>
      </div>

      {/* Top Overview Statistics Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Active Districts */}
        <div className="aesthetic-card rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Globe className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {language === 'en' ? 'Active Districts' : 'সক্ৰিয় জিলাসমূহ'}
            </span>
            <span className="text-sm sm:text-base font-black text-foreground">
              {overallStats?.totalDistricts || 0} / 22
            </span>
          </div>
        </div>

        {/* Total Trees */}
        <div className="aesthetic-card rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Leaf className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {t('map_total_trees')}
            </span>
            <span className="text-sm sm:text-base font-black text-foreground">
              {overallStats?.totalTrees || 0}
            </span>
          </div>
        </div>

        {/* Contributors */}
        <div className="aesthetic-card rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <User className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {language === 'en' ? 'Contributors' : 'অংশগ্ৰহণকাৰী'}
            </span>
            <span className="text-sm sm:text-base font-black text-foreground">
              {overallStats?.totalContributors || 0}
            </span>
          </div>
        </div>

        {/* Leading District */}
        <div className="aesthetic-card rounded-2xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              {language === 'en' ? 'Leading District' : 'শীৰ্ষ জিলা'}
            </span>
            <span className="text-sm sm:text-base font-black text-foreground truncate block">
              {sortedDistricts[0]?.count > 0 ? sortedDistricts[0].name : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Map Area */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="aesthetic-card rounded-3xl p-4 sm:p-6 flex flex-col justify-between overflow-hidden min-h-[500px]">
            {/* View switcher & Legend */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/40 pb-4 mb-4">
              <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/60">
                <button
                  onClick={() => setViewMode('heatmap')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'heatmap'
                      ? 'bg-card text-primary shadow-sm border border-border/20'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {language === 'en' ? 'Heatmap' : 'তাপমানচিত্ৰ'}
                </button>
                <button
                  onClick={() => setViewMode('regions')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'regions'
                      ? 'bg-card text-primary shadow-sm border border-border/20'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {language === 'en' ? 'Regions' : 'আঞ্চলিক'}
                </button>
              </div>

              {/* Legends depending on mode */}
              {viewMode === 'heatmap' ? (
                <div className="flex items-center gap-3 text-xs select-none">
                  <span className="text-muted-foreground font-semibold">Density:</span>
                  <div className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded bg-muted border border-border"></span>
                    <span className="text-muted-foreground text-[10px]">0</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded bg-emerald-100 dark:bg-emerald-950/35 border border-emerald-300 dark:border-emerald-800"></span>
                    <span className="text-muted-foreground text-[10px]">1-19</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded bg-emerald-500 dark:bg-emerald-800 border border-emerald-600"></span>
                    <span className="text-muted-foreground text-[10px]">20-49</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-3 w-3 rounded bg-emerald-700 dark:bg-emerald-600 border border-emerald-850 animate-pulse"></span>
                    <span className="text-muted-foreground text-[10px]">50+</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2.5 text-xs select-none">
                  <span className="text-muted-foreground font-semibold">Zones:</span>
                  {Object.entries(REGION_THEMES).map(([regionName, theme]) => (
                    <div key={regionName} className="flex items-center gap-1">
                      <span className={`h-2.5 w-2.5 rounded-full ${theme.dot}`} />
                      <span className="text-muted-foreground text-[10px]">
                        {regionName.replace(' Assam', '').replace(' & Barak Valley', '')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Map Wrapper with drag/zoom */}
            <div
              id="map-container"
              className={`flex-1 flex items-center justify-center relative bg-muted/15 rounded-2xl border border-border/40 py-6 overflow-hidden select-none ${
                zoom > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {/* SVG Canvas */}
              <svg
                viewBox="0 0 850 400"
                className="w-full max-w-4xl h-auto drop-shadow-sm select-none pointer-events-none"
              >
                <defs>
                  {/* Glowing river gradient */}
                  <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
                    <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#0284c7" stopOpacity="0.4" />
                  </linearGradient>

                  {/* Standard dropshadow filter */}
                  <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.1" />
                  </filter>
                </defs>

                <style>{`
                  @keyframes riverFlow {
                    to {
                      stroke-dashoffset: -40;
                    }
                  }
                  .river-path {
                    animation: riverFlow 12s linear infinite;
                  }
                `}</style>

                {/* Transform group applying zoom and pan */}
                <motion.g
                  animate={{ x: pan.x, y: pan.y, scale: zoom }}
                  transition={{ type: 'spring', stiffness: 220, damping: 28 }}
                  className="origin-center"
                >
                  {/* River line (Brahmaputra flow representation) */}
                  <path
                    d="M 780 80 Q 720 120 640 100 T 500 120 T 350 150 T 150 180 T 80 180"
                    fill="none"
                    stroke="url(#riverGradient)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    className="river-path pointer-events-none"
                    style={{
                      strokeDasharray: '10, 12',
                    }}
                  />

                  {/* Connection Links */}
                  {DISTRICT_COORDS.map((dist, idx) => {
                    const nextDist = DISTRICT_COORDS[idx + 1];
                    if (!nextDist) return null;
                    return (
                      <line
                        key={`line-${idx}`}
                        x1={dist.x}
                        y1={dist.y}
                        x2={nextDist.x}
                        y2={nextDist.y}
                        stroke="var(--border)"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        strokeOpacity="0.4"
                        className="pointer-events-none"
                      />
                    );
                  })}

                  {/* District Nodes */}
                  {DISTRICT_COORDS.map((dist) => {
                    const count = getTreeCount(dist.name);
                    const isSelected = selectedDistrict === dist.id;
                    const isSearched =
                      searchQuery.trim() !== '' &&
                      dist.name.toLowerCase().includes(searchQuery.toLowerCase());
                    const nodeStyle = getNodeColorClass(dist, count, isSelected, isSearched);

                    // Scale node radius based on count
                    const r = isSelected
                      ? 11 + Math.min(count / 15, 6)
                      : 8 + Math.min(count / 15, 6);

                    return (
                      <g
                        key={dist.id}
                        className="cursor-pointer pointer-events-auto"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDistrict(dist.id);
                        }}
                        onMouseEnter={(e) => handleNodeMouseEnter(e, dist)}
                        onMouseMove={handleNodeMouseMove}
                        onMouseLeave={handleNodeMouseLeave}
                      >
                        {/* Outer pulsing beacon ring for highly active or selected districts */}
                        {(isSelected || isSearched || count >= 50) && (
                          <circle
                            cx={dist.x}
                            cy={dist.y}
                            r={r + 8}
                            className={`fill-none stroke-2 opacity-35 ${
                              isSelected
                                ? 'stroke-primary animate-pulse'
                                : isSearched
                                ? 'stroke-amber-400 animate-ping'
                                : 'stroke-emerald-450 dark:stroke-emerald-400 animate-pulse'
                            }`}
                          />
                        )}

                        {/* Outer hover highlight circle */}
                        <circle
                          cx={dist.x}
                          cy={dist.y}
                          r={r + 4}
                          className={`transition-all duration-300 stroke-[1.5] ${
                            isSelected
                              ? 'stroke-primary/40 fill-primary/5'
                              : 'stroke-transparent fill-transparent hover:stroke-primary/20 hover:fill-primary/5'
                          }`}
                        />

                        {/* Main circle node */}
                        <circle
                          cx={dist.x}
                          cy={dist.y}
                          r={r}
                          className={`transition-all duration-300 stroke-2 filter-[url(#shadow)] ${nodeStyle}`}
                        />

                        {/* District code text */}
                        <text
                          x={dist.x}
                          y={dist.y + 3.2}
                          textAnchor="middle"
                          className={`text-[8px] font-extrabold select-none pointer-events-none transition-colors ${
                            count >= 20 && viewMode === 'heatmap'
                              ? 'fill-primary-foreground font-black'
                              : 'fill-muted-foreground'
                          }`}
                        >
                          {dist.code}
                        </text>
                      </g>
                    );
                  })}
                </motion.g>
              </svg>

              {/* Hint overlay */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-[10px] text-muted-foreground select-none">
                <HelpCircle className="h-3.5 w-3.5 text-primary opacity-60" />
                <span>
                  {language === 'en'
                    ? 'Hover for details. Drag to pan. Scroll or use buttons to zoom.'
                    : 'বিৱৰণৰ বাবে কাষলৈ নিয়ক। ড্ৰেগ কৰক। জুম কৰিবলৈ বুটাম ব্যৱহাৰ কৰক।'}
                </span>
              </div>

              {/* Zoom Controls Overlay */}
              <div className="absolute bottom-3 right-3 flex flex-col gap-1 bg-card/85 backdrop-blur-md p-1.5 rounded-xl border border-border shadow-md z-30">
                <button
                  onClick={handleZoomIn}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-foreground transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={handleZoomOut}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-foreground transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="h-4.5 w-4.5" />
                </button>
                <button
                  onClick={handleReset}
                  className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-muted text-foreground transition-colors"
                  title="Reset View"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              {/* Floating Tooltip */}
              <AnimatePresence>
                {tooltip && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="absolute z-40 bg-card/90 backdrop-blur-md border border-border/80 rounded-2xl p-3 shadow-xl pointer-events-none select-none"
                    style={{
                      left: `${tooltip.x}px`,
                      top: `${tooltip.y}px`,
                      transform: 'translate(-50%, -105%)',
                    }}
                  >
                    <div className="space-y-1.5 text-xs min-w-[150px]">
                      <div className="flex items-center justify-between gap-3 border-b border-border/40 pb-1.5 mb-1.5">
                        <span className="font-extrabold text-foreground">{tooltip.name}</span>
                        <span className="text-[9px] font-black text-primary px-1.5 py-0.5 bg-primary/10 rounded-md border border-primary/20">
                          {tooltip.code}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground text-[10px]">
                          {language === 'en' ? 'Zone:' : 'মণ্ডল:'}
                        </span>
                        <span className="font-semibold text-foreground text-[10px]">
                          {tooltip.region}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground text-[10px]">
                          {t('map_total_trees')}:
                        </span>
                        <span className="font-extrabold text-primary text-[10px]">
                          {tooltip.count}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground text-[10px]">
                          {language === 'en' ? 'Rank:' : 'জিলাৰ স্থান:'}
                        </span>
                        <span className="font-extrabold text-foreground text-[10px]">
                          #{tooltip.rank}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground text-[10px]">
                          {language === 'en' ? 'Volunteers:' : 'স্বেচ্ছাসেৱক:'}
                        </span>
                        <span className="font-semibold text-foreground text-[10px]">
                          {tooltip.contributors}
                        </span>
                      </div>
                      <div className="text-[8px] text-center text-muted-foreground border-t border-border/20 pt-1 mt-1">
                        {language === 'en' ? 'Click to select' : 'নিৰ্বাচন কৰিবলৈ ক্লিক কৰক'}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Selected District Stats Card */}
          <div className="aesthetic-card rounded-3xl p-6 min-h-[220px] flex flex-col justify-between">
            <h2 className="text-sm sm:text-base font-black text-foreground border-b border-border/60 pb-3 flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span>{t('map_stats')}</span>
            </h2>

            {selectedDistInfo ? (
              <div className="flex-1 flex flex-col justify-between pt-3 space-y-4">
                {/* Header Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-primary">{selectedDistInfo.name}</h3>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        (REGION_THEMES[selectedDistInfo.region] || REGION_THEMES['Lower Assam'])
                          .badge
                      }`}
                    >
                      {selectedDistInfo.region}
                    </span>
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">
                    District Code: {selectedDistInfo.code}
                  </p>
                </div>

                {/* Tab Controls */}
                <div className="flex items-center border-b border-border/50 text-[11px] font-bold text-muted-foreground">
                  <button
                    onClick={() => setActiveTab('insights')}
                    className={`flex-1 pb-2 border-b-2 text-center transition-colors ${
                      activeTab === 'insights'
                        ? 'border-primary text-primary font-black'
                        : 'border-transparent hover:text-foreground'
                    }`}
                  >
                    {language === 'en' ? 'Insights' : 'পৰিসংখ্যা'}
                  </button>
                  <button
                    onClick={() => setActiveTab('species')}
                    className={`flex-1 pb-2 border-b-2 text-center transition-colors ${
                      activeTab === 'species'
                        ? 'border-primary text-primary font-black'
                        : 'border-transparent hover:text-foreground'
                    }`}
                  >
                    {language === 'en' ? 'Species Mix' : 'প্ৰজাতি বিভাজন'}
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`flex-1 pb-2 border-b-2 text-center transition-colors ${
                      activeTab === 'activity'
                        ? 'border-primary text-primary font-black'
                        : 'border-transparent hover:text-foreground'
                    }`}
                  >
                    {language === 'en' ? 'Activity Log' : 'ল’গ'}
                  </button>
                </div>

                {/* Tab Contents */}
                <div className="flex-1 min-h-[160px] overflow-y-auto">
                  {/* Tab 1: Insights */}
                  {activeTab === 'insights' && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 pt-1"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted/30 p-2.5 rounded-xl border border-border/50">
                          <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                            {t('map_total_trees')}
                          </span>
                          <span className="text-sm font-black text-foreground flex items-center gap-1 mt-0.5">
                            <Leaf className="h-4 w-4 text-primary" />
                            <span>{selectedDistInfo.count}</span>
                          </span>
                        </div>
                        <div className="bg-muted/30 p-2.5 rounded-xl border border-border/50">
                          <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                            {t('map_district_rank')}
                          </span>
                          <span className="text-sm font-black text-foreground mt-0.5 block">
                            #{selectedDistRank}
                          </span>
                        </div>
                        <div className="bg-muted/30 p-2.5 rounded-xl border border-border/50">
                          <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                            {language === 'en' ? 'Contributors' : 'অংশগ্ৰহণকাৰী'}
                          </span>
                          <span className="text-sm font-black text-foreground mt-0.5 block">
                            {getContributorCount(selectedDistInfo.name)}
                          </span>
                        </div>
                        <div className="bg-muted/30 p-2.5 rounded-xl border border-border/50">
                          <span className="block text-[9px] uppercase tracking-wider text-muted-foreground font-bold">
                            {language === 'en' ? 'Plantation Logs' : 'বৃত্তান্ত ল’গ'}
                          </span>
                          <span className="text-sm font-black text-foreground mt-0.5 block">
                            {getRecordCount(selectedDistInfo.name)}
                          </span>
                        </div>
                      </div>

                      {/* Milestone target */}
                      <div className="border-t border-border/50 pt-3">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold">
                          <span>
                            {language === 'en' ? 'Milestone Progress' : 'মাইলষ্টোন অগ্ৰগতি'}
                          </span>
                          <span>{selectedDistInfo.count} / 500</span>
                        </div>
                        <div className="h-2 w-full bg-muted rounded-full mt-1.5 overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min((selectedDistInfo.count / 500) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Tab 2: Species Mix */}
                  {activeTab === 'species' && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3 pt-1"
                    >
                      {getSpeciesBreakdown(selectedDistInfo.name).length > 0 ? (
                        getSpeciesBreakdown(selectedDistInfo.name).map((sp: any) => {
                          const pct = selectedDistInfo.count
                            ? Math.round((sp.count / selectedDistInfo.count) * 100)
                            : 0;
                          return (
                            <div key={sp.species} className="text-xs space-y-1">
                              <div className="flex items-center justify-between font-bold text-foreground">
                                <span>{sp.species}</span>
                                <span>
                                  {sp.count} ({pct}%)
                                </span>
                              </div>
                              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-550 dark:bg-emerald-500 rounded-full"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-6 text-muted-foreground text-xs">
                          {language === 'en'
                            ? 'No species details logged.'
                            : 'কোনো প্ৰজাতিৰ তথ্য নাই।'}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* Tab 3: Recent Activity Timeline */}
                  {activeTab === 'activity' && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4 pt-1 pr-1 timeline-list"
                    >
                      {getRecentRecords(selectedDistInfo.name).length > 0 ? (
                        getRecentRecords(selectedDistInfo.name).map((rec: any, idx: number) => (
                          <div key={rec.id} className="relative flex gap-3 text-xs">
                            {/* Vertical Line */}
                            {idx < getRecentRecords(selectedDistInfo.name).length - 1 && (
                              <span className="absolute left-3.5 top-7 bottom-[-20px] w-[1px] bg-border/60" />
                            )}

                            {/* Bullet Circle */}
                            <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-extrabold text-[10px] shrink-0 uppercase">
                              {rec.name ? rec.name.charAt(0) : 'W'}
                            </div>

                            {/* Details Card */}
                            <div className="flex-1 min-w-0 bg-muted/20 p-2.5 rounded-xl border border-border/40 hover:bg-muted/40 transition-colors">
                              <div className="flex justify-between items-start gap-2">
                                <span className="font-extrabold text-foreground truncate block">
                                  {rec.name}
                                </span>
                                <span className="text-[9px] text-muted-foreground font-semibold shrink-0">
                                  {new Date(rec.date).toLocaleDateString(
                                    language === 'en' ? 'en-US' : 'as-IN',
                                    {
                                      month: 'short',
                                      day: 'numeric',
                                    }
                                  )}
                                </span>
                              </div>
                              <span className="block text-[10px] text-primary font-bold mt-0.5">
                                Planted {rec.treeCount} x {rec.species}
                              </span>
                              <span className="block text-[9px] text-muted-foreground mt-0.5">
                                Location: {rec.village || 'N/A'}
                              </span>

                              {rec.notes && (
                                <p className="text-[10px] text-muted-foreground italic leading-normal border-l-2 border-border pl-1.5 mt-1.5 line-clamp-2">
                                  "{rec.notes}"
                                </p>
                              )}

                              {/* Clickable Image Proof */}
                              {rec.imageUrl && (
                                <div className="mt-2">
                                  <button
                                    onClick={() => setActivePhoto(rec.imageUrl)}
                                    className="inline-flex items-center gap-1 text-[9px] text-primary hover:text-emerald-600 font-bold border border-primary/20 bg-primary/5 hover:bg-primary/10 px-2 py-0.5 rounded-md transition-colors"
                                  >
                                    <span>
                                      {language === 'en' ? 'View Photo Proof' : 'ফটো প্ৰমাণ চাওক'}
                                    </span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-6 text-muted-foreground text-xs">
                          {language === 'en'
                            ? 'No approved logs in this district.'
                            : 'কোনো অনুমোদিত ল’গ নাই।'}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground py-10">
                <MapIcon className="h-10 w-10 text-primary opacity-25 mb-3 animate-pulse" />
                <p className="text-xs leading-normal px-6">
                  {t('map_select_district') || 'Click on a district node to view detailed insights.'}
                </p>
              </div>
            )}
          </div>

          {/* District list search */}
          <div className="aesthetic-card rounded-3xl p-5 flex-1 flex flex-col gap-3 max-h-[380px] overflow-hidden">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder={
                  language === 'en' ? 'Search district...' : 'জিলা অনুসন্ধান কৰক...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted/30 px-3.5 py-2 pl-9 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredDistricts.length > 0 ? (
                filteredDistricts.map((d, index) => {
                  const isSelected = selectedDistrict === d.id;
                  const isSearched =
                    searchQuery.trim() !== '' &&
                    d.name.toLowerCase().includes(searchQuery.toLowerCase());

                  return (
                    <div
                      key={d.id}
                      onClick={() => {
                        setSelectedDistrict(d.id);
                        // Center/pan towards this node slightly on list selection
                        if (zoom > 1) {
                          setPan({
                            x: -(d.x - 425) * (zoom - 0.5),
                            y: -(d.y - 200) * (zoom - 0.5),
                          });
                        }
                      }}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold cursor-pointer border transition-colors ${
                        isSelected
                          ? 'bg-primary/10 border-primary text-primary'
                          : isSearched
                          ? 'bg-amber-500/5 border-amber-500/30 hover:bg-amber-500/10 text-foreground'
                          : 'bg-card border-border/80 hover:bg-muted text-foreground'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground font-bold">#{index + 1}</span>
                        <span>{d.name}</span>
                        <span className="text-[9px] text-muted-foreground font-normal">
                          ({d.region.split(' ')[0]})
                        </span>
                      </div>
                      <span className="flex items-center gap-1 font-bold">
                        <Leaf className="h-3.5 w-3.5 text-primary" />
                        <span>{d.count}</span>
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-center text-muted-foreground py-6">
                  {language === 'en' ? 'No districts match search.' : 'কোনো জিলা পোৱা নগ’ল।'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Photo lightbox modal */}
      <AnimatePresence>
        {activePhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative max-w-3xl w-full max-h-[85vh] flex flex-col items-center"
            >
              <button
                onClick={() => setActivePhoto(null)}
                className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition-all shadow-md focus:outline-none"
                aria-label="Close photo"
              >
                <X className="h-5.5 w-5.5" />
              </button>
              <img
                src={activePhoto}
                alt="Plantation Proof"
                className="rounded-2xl max-w-full max-h-[75vh] object-contain border border-white/10 shadow-2xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
