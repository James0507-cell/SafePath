'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Compass,
    LayoutGrid,
    CalendarRange,
    Settings2,
    Shield,
    Search,
    Star,
    MapPin,
    Pin,
    Clock,
    Phone,
    Globe,
    X,
    Bell,
    User
} from 'lucide-react';
import { createClient } from '@/src/lib/supabaseClient';
import MapView from '@/src/components/MapView';
import {fetchPlaces} from "@/src/services/places";

function dedupePlacesById(items) {
    const seen = new Set();

    return items.filter((place) => {
        if (!place?.id || seen.has(place.id)) {
            return false;
        }

        seen.add(place.id);
        return true;
    });
}

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState('maps');
    const [user, setUser] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasSearched, setHasSearched] = useState(false);
    const [places, setPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [activeDetailTab, setActiveDetailTab] = useState('overview');
    const [routeData, setRouteData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const resultsEndRef = useRef(null);
    const isLoadingRef = useRef(false);
    const mapRef = useRef(null);
    const router = useRouter();
    const supabase = createClient();
    const showResultsPanel = hasSearched || isLoading;

    // Reset route data when a new place is selected or searched
    useEffect(() => {
        setRouteData(null);
    }, [selectedPlace]);

    useEffect(() => {
        if (!hasMore || isLoading) return;
        // ... rest of observer logic
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && !isLoadingRef.current) {
                    handleSearch(null, currentPage + 1);
                }
            },
            { threshold: 0.1 }
        );

        const currentRef = resultsEndRef.current;
        if (currentRef) observer.observe(currentRef);

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [hasMore, isLoading, currentPage]);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') router.replace('/login');
        });

        return () => subscription?.unsubscribe();
    }, [router, supabase]);

    const handleSearch = async (e, page = 1) => {
        if (e) {
            e.preventDefault();
            setHasSearched(true);
            setPlaces([]);
            setCurrentPage(1);
            setHasMore(true);
        }
        
        if (!searchQuery.trim()) return;

        isLoadingRef.current = true;
        setIsLoading(true);
        try {
            const displayedPlaceIds =
                page > 1
                    ? [...new Set(places.map((place) => place.id).filter(Boolean))]
                    : [];

            const results = await fetchPlaces(searchQuery, page, 10, displayedPlaceIds);
            
            if (page === 1) {
                setPlaces(dedupePlacesById(results));
            } else {
                setPlaces((prev) => dedupePlacesById([...prev, ...results]));
            }

            setHasMore(results.length > 0);
            setCurrentPage(page);
        } catch (err) {
            console.error('Error fetching places:', err);
        } finally {
            setIsLoading(false);
            isLoadingRef.current = false;
        }
    };

    const navItems = [
        { id: 'maps', label: 'Maps', icon: Compass },
        { id: 'feed', label: 'Feed', icon: LayoutGrid },
        { id: 'planner', label: 'Planner', icon: CalendarRange },
        { id: 'settings', label: 'Settings', icon: Settings2 },
    ];

    const panelFontFamilies = {
        editorial: 'var(--font-display-serif), Georgia, serif',
        refined: 'var(--font-ui-sans), system-ui, sans-serif',
        technical: 'var(--font-geist-mono), monospace',
        gallery: 'var(--font-display-accent), var(--font-display-serif), serif',
        modernist: 'var(--font-space-grotesk), var(--font-ui-sans), sans-serif',
        humanist: 'var(--font-source-sans), var(--font-ui-sans), sans-serif',
        luxury: 'var(--font-fraunces), var(--font-display-serif), serif',
        bookish: 'var(--font-newsreader), var(--font-display-serif), serif',
        civic: 'var(--font-ibm-plex-sans), var(--font-ui-sans), sans-serif',
        clean: 'var(--font-outfit), var(--font-ui-sans), sans-serif',
    };

    const panelFontStyle = 'bookish';
    const panelRadius = 30;
    const panelOpacity = 0.82;
    const panelShadow = 'medium';

    const panelShadowStyles = {
        soft: '0 14px 36px rgba(15,23,42,0.12)',
        medium: '0 22px 60px rgba(15,23,42,0.18)',
        dramatic: '0 30px 90px rgba(15,23,42,0.28)',
    };

    const panelThemeVars = {
        '--panel-radius': `${panelRadius}px`,
        '--panel-card-radius': `${Math.max(panelRadius - 6, 16)}px`,
        '--panel-pill-radius': `${Math.max(panelRadius - 12, 14)}px`,
        '--panel-font-family': panelFontFamilies[panelFontStyle],
        '--panel-surface': `rgba(255,255,255,${panelOpacity})`,
        '--panel-border': `rgba(255,255,255,${Math.min(panelOpacity + 0.06, 0.94)})`,
        '--panel-shadow': panelShadowStyles[panelShadow],
        '--panel-blur': 'blur(22px)',
    };

    const panelShellStyle = {
        ...panelThemeVars,
        fontFamily: 'var(--panel-font-family)',
        borderRadius: 'var(--panel-radius)',
        backgroundColor: 'var(--panel-surface)',
        borderColor: 'var(--panel-border)',
        boxShadow: 'var(--panel-shadow)',
        backdropFilter: 'var(--panel-blur)',
        WebkitBackdropFilter: 'var(--panel-blur)',
    };

    const panelCardStyle = {
        borderRadius: 'var(--panel-card-radius)',
    };

    const panelPillStyle = {
        borderRadius: 'var(--panel-pill-radius)',
    };

    return (
        <div className="flex flex-col md:flex-row h-[100dvh] bg-white text-slate-800 font-sans overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-[72px] flex-col bg-white border-r border-slate-200 shrink-0 z-30 justify-between">
                <div>
                    <div className="h-16 flex items-center justify-center border-b border-slate-100">
                        <div className="bg-slate-900 p-1.5 rounded-lg"><Shield className="text-white" size={20} /></div>
                    </div>
                    <nav className="py-6 flex flex-col items-center gap-2">
                        {navItems.map((item) => (
                            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-[60px] py-3 rounded-xl flex flex-col items-center gap-1 ${activeTab === item.id ? 'bg-slate-100' : 'text-slate-400'}`}>
                                <item.icon size={20} />
                                <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="py-6 flex flex-col items-center gap-4">
                    <button className="text-slate-400 hover:text-slate-600">
                        <Bell size={20} />
                    </button>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                        <User size={16} />
                    </div>
                </div>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* Mobile Header */}
                <header className="flex md:hidden h-16 shrink-0 items-center justify-between px-4 bg-white/90 backdrop-blur-md border-b border-slate-200 z-50">
                    <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                        <User size={18} />
                    </div>
                    <button className="relative text-slate-400 hover:text-slate-600 transition-colors">
                        <Bell size={20} />
                        <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
                    </button>
                </header>

                <main className="relative flex-1 overflow-hidden bg-slate-100 font-sans">
                    <div className="absolute inset-0">
                        <MapView ref={mapRef} places={places} />
                    </div>

                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.48),_transparent_28%),linear-gradient(180deg,rgba(15,23,42,0.02),rgba(15,23,42,0.16))]" />

                    {/* Mobile Floating Dock */}
                    <nav className="fixed md:hidden bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/80 backdrop-blur-2xl border border-white/50 p-1.5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 mb-safe" style={{ borderRadius: '20px' }}>
                        {navItems.map((item) => (
                            <button 
                                key={item.id} 
                                onClick={() => setActiveTab(item.id)} 
                                className={`flex items-center justify-center w-11 h-11 rounded-[14px] transition-all duration-300 ${
                                    activeTab === item.id 
                                        ? 'bg-slate-900 text-white shadow-md' 
                                        : 'text-slate-400 hover:bg-slate-100/50'
                                }`}
                            >
                                <item.icon size={20} className={activeTab === item.id ? 'scale-105' : ''} />
                            </button>
                        ))}
                    </nav>

                    {/* Search and Results Panel */}
                    <div className={`pointer-events-none absolute z-40 transition-all duration-300 ${
                        showResultsPanel 
                            ? 'inset-x-0 top-16 bottom-0 md:inset-x-auto md:left-4 md:top-4 md:bottom-4 md:w-[390px]' 
                            : 'inset-x-3 top-3 md:inset-x-auto md:left-4 md:top-4 md:w-[390px]'
                    }`}>
                        <div className={`pointer-events-auto flex flex-col overflow-hidden border backdrop-blur-xl transition-all duration-300 ${
                            showResultsPanel 
                                ? 'h-full min-h-0 !rounded-t-[32px] !rounded-b-none md:!rounded-[var(--panel-radius)]' 
                                : ''
                        }`} style={panelShellStyle}>
                            <div className="border-b border-slate-200/70 px-5 py-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">Search</h2>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Refine your search and browse nearby matches.
                                        </p>
                                    </div>
                                    {showResultsPanel && (
                                        <button
                                            onClick={() => {
                                                setHasSearched(false);
                                                setPlaces([]);
                                                setSelectedPlace(null);
                                                setCurrentPage(1);
                                                setHasMore(true);
                                            }}
                                            className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200/80 bg-white/80 text-slate-400 transition hover:text-slate-700"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>

                                <form onSubmit={handleSearch} className="mt-4">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            type="text"
                                            placeholder="Search locations..."
                                            className="w-full border border-slate-200/80 bg-white/80 pl-10 pr-24 py-3 text-sm text-slate-800 shadow-[0_10px_28px_rgba(15,23,42,0.06)] focus:outline-hidden"
                                            style={panelPillStyle}
                                        />
                                        <button
                                            type="submit"
                                            aria-label="Search locations"
                                            className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center bg-slate-900 text-white transition hover:bg-slate-800"
                                            style={panelPillStyle}
                                        >
                                            <Search size={16} />
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {showResultsPanel && (
                                <>
                                    <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 overscroll-contain">
                                        {places.length > 0 ? (
                                            <div className="flex flex-col gap-3">
                                                {Array.isArray(places) && places.map((place, idx) => (
                                                    <div
                                                        key={idx}
                                                        onClick={() => {
                                                            setSelectedPlace(place);
                                                            if (mapRef.current && place.latitude && place.longitude) {
                                                                mapRef.current.flyTo(place.longitude, place.latitude);
                                                            }
                                                            setActiveDetailTab('overview');
                                                        }}
                                                        className={`group cursor-pointer rounded-[24px] border p-3 transition duration-200 ${
                                                            selectedPlace?.name === place.name
                                                                ? 'border-slate-900/10 bg-slate-900 text-white shadow-[0_18px_40px_rgba(15,23,42,0.24)]'
                                                                : 'border-white/70 bg-white/80 text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:bg-white'
                                                        }`}
                                                        style={panelCardStyle}
                                                    >
                                                        <div className="flex gap-3">
                                                            {place.image_url && (
                                                                <img src={place.image_url} alt={place.name} className="h-24 w-24 shrink-0 object-cover" style={{ borderRadius: 'calc(var(--panel-card-radius) - 6px)' }} />
                                                            )}
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-start justify-between gap-3">
                                                                    <div className="min-w-0">
                                                                        <h3 className="truncate text-sm font-bold">{place.name}</h3>
                                                                        {place.category && (
                                                                            <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                                                                                selectedPlace?.name === place.name
                                                                                    ? 'bg-white/14 text-white/75'
                                                                                    : 'bg-slate-100 text-slate-600'
                                                                            }`}>
                                                                                {place.category}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {place.rating && (
                                                                        <div className={`px-2 py-1 text-[11px] font-semibold ${
                                                                            selectedPlace?.name === place.name
                                                                                ? 'bg-white/14 text-white'
                                                                                : 'bg-amber-50 text-amber-700'
                                                                        }`} style={panelPillStyle}>
                                                                            {place.rating}
                                                                        </div>
                                                                    )}
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                if (mapRef.current && place.latitude && place.longitude) {
                                                                                    mapRef.current.setRoute(place.latitude, place.longitude);
                                                                                }
                                                                            }}
                                                                            className={`mt-3 inline-flex items-center justify-center rounded-full p-2 text-white transition ${
                                                                                selectedPlace?.name === place.name
                                                                                    ? 'bg-white/20 hover:bg-white/30'
                                                                                    : 'bg-slate-900 hover:bg-slate-700'
                                                                            }`}
                                                                        >
                                                                            <MapPin size={16} />
                                                                        </button>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                // Pin logic here
                                                                            }}
                                                                            className={`mt-3 inline-flex items-center justify-center rounded-full p-2 text-white transition ${
                                                                                selectedPlace?.name === place.name
                                                                                    ? 'bg-white/20 hover:bg-white/30'
                                                                                    : 'bg-slate-900 hover:bg-slate-700'
                                                                            }`}
                                                                        >
                                                                            <Pin size={16} />
                                                                        </button>
                                                                    </div>

                                                                    <p className={`mt-2 line-clamp-2 text-xs ${selectedPlace?.name === place.name ? 'text-white/75' : 'text-slate-500'}`}>
                                                                    {place.address}
                                                                    </p>
                                                                <div className={`mt-3 grid grid-cols-1 gap-2 text-xs ${selectedPlace?.name === place.name ? 'text-white/80' : 'text-slate-600'}`}>
                                                                    {place.rating && (
                                                                        <div className="flex items-center gap-1">
                                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                                <Star
                                                                                    key={star}
                                                                                    size={12}
                                                                                    className={star <= Math.round(place.rating)
                                                                                        ? 'fill-yellow-400 text-yellow-400'
                                                                                        : selectedPlace?.name === place.name
                                                                                            ? 'text-white/25'
                                                                                            : 'text-slate-300'}
                                                                                />
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock size={12} className={selectedPlace?.name === place.name ? 'text-white/50' : 'text-slate-400'} />
                                                                        <span className="truncate">{place.hours}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <Phone size={12} className={selectedPlace?.name === place.name ? 'text-white/50' : 'text-slate-400'} />
                                                                        <span className="truncate">{place.phone || 'N/A'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : !isLoading ? (
                                            <div className="border border-dashed border-slate-200/80 bg-white/55 px-4 py-6 text-center text-sm text-slate-500" style={panelCardStyle}>
                                                No places found. Try a broader location or different keyword.
                                            </div>
                                        ) : null}

                                        <div ref={resultsEndRef} className="h-4" />
                                        {isLoading && (
                                            <div className="flex items-center justify-center py-5">
                                                <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-4 py-2 shadow-[0_10px_28px_rgba(15,23,42,0.08)]" style={panelPillStyle}>
                                                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
                                                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Loading</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Detailed Place Panel */}
                    {selectedPlace && (
                        <div className="pointer-events-none absolute z-50 transition-all duration-300 inset-x-0 top-16 bottom-0 md:inset-x-auto md:bottom-4 md:left-[418px] md:top-4 md:w-[440px]">
                            <div className="pointer-events-auto flex h-full flex-col overflow-hidden border backdrop-blur-xl !rounded-t-[32px] !rounded-b-none md:!rounded-[var(--panel-radius)]" style={panelShellStyle}>
                                <div className="border-b border-slate-200/70 px-5 py-4">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-sm font-semibold tracking-[0.18em] text-slate-500 uppercase">Details</h2>
                                        <button onClick={() => setSelectedPlace(null)} className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-slate-400 transition hover:text-slate-700">
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <div className="mt-0 text-center">
                                        <p className="text-sm font-semibold text-slate-900">{selectedPlace.name}</p>
                                    </div>
                                </div>

                                <div className="px-4 pt-4">
                                    <div className="inline-flex border border-slate-200 bg-slate-100/80 p-1" style={panelPillStyle}>
                                        <button
                                            onClick={() => setActiveDetailTab('overview')}
                                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                                activeDetailTab === 'overview'
                                                    ? 'bg-slate-900 text-white shadow-sm'
                                                    : 'text-slate-500'
                                            }`}
                                            style={panelPillStyle}
                                        >
                                            Overview
                                        </button>
                                        <button
                                            onClick={() => setActiveDetailTab('about')}
                                            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                                                activeDetailTab === 'about'
                                                    ? 'bg-slate-900 text-white shadow-sm'
                                                    : 'text-slate-500'
                                            }`}
                                            style={panelPillStyle}
                                        >
                                            About
                                        </button>
                                    </div>
                                </div>

                                <div className="overflow-y-auto px-5 py-5">
                                    {activeDetailTab === 'overview' ? (
                                        <div className="flex flex-col gap-5">
                                            {selectedPlace.image_url && (
                                                <div className="overflow-hidden border border-white/70 bg-slate-100 shadow-[0_18px_40px_rgba(15,23,42,0.08)]" style={panelCardStyle}>
                                                    <img
                                                        src={selectedPlace.image_url}
                                                        alt={selectedPlace.name}
                                                        className="h-56 w-full object-cover"
                                                    />
                                                </div>
                                            )}

                                            <div className="border border-white/70 bg-white/70 p-5 shadow-[0_16px_35px_rgba(15,23,42,0.06)]" style={panelCardStyle}>
                                                <div className="flex flex-col gap-3">
                                                    <div>
                                                        <h1 className="text-2xl font-semibold text-slate-900">{selectedPlace.name}</h1>
                                                        {selectedPlace.category && (
                                                            <span className="mt-2 inline-flex bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600" style={panelPillStyle}>
                                                                {selectedPlace.category}
                                                            </span>
                                                        )}
                                                        <p className="mt-3 text-sm leading-6 text-slate-500">{selectedPlace.address}</p>
                                                    </div>

                                                    <div className="grid gap-3 text-sm text-slate-600">
                                                        {selectedPlace.rating && (
                                                            <div className="flex items-center gap-3 bg-slate-50 px-4 py-3" style={panelPillStyle}>
                                                                <Star size={16} className="text-amber-500" />
                                                                <span>{selectedPlace.rating} out of 5</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-3" style={panelPillStyle}>
                                                            <Phone size={16} className="text-slate-400" />
                                                            <span>{selectedPlace.phone || 'No phone number available'}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-3" style={panelPillStyle}>
                                                            <Clock size={16} className="text-slate-400" />
                                                            <span>{selectedPlace.hours}</span>
                                                        </div>
                                                        <div className="flex items-center gap-3 bg-slate-50 px-4 py-3" style={panelPillStyle}>
                                                            <MapPin size={16} className="text-slate-400" />
                                                            <span className="font-mono text-xs">{selectedPlace.plus_code || 'N/A'}</span>
                                                        </div>
                                                        {selectedPlace.latitude && selectedPlace.longitude && (
                                                            <div className="flex items-center gap-3 bg-slate-50 px-4 py-3" style={panelPillStyle}>
                                                                <MapPin size={16} className="text-slate-400" />
                                                                <span className="font-mono text-xs">
                                                                    {typeof selectedPlace.latitude === 'number' ? selectedPlace.latitude.toFixed(6) : selectedPlace.latitude},
                                                                    {' '}
                                                                    {typeof selectedPlace.longitude === 'number' ? selectedPlace.longitude.toFixed(6) : selectedPlace.longitude}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {selectedPlace.website && (
                                                        <a href={selectedPlace.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800" style={panelPillStyle}>
                                                            <Globe size={16} className="text-white/70" />
                                                            <span>Visit website</span>
                                                        </a>
                                                    )}
                                                    <button
                                                        onClick={() => {
                                                            if (mapRef.current && selectedPlace.latitude && selectedPlace.longitude) {
                                                                mapRef.current.setRoute(selectedPlace.latitude, selectedPlace.longitude);
                                                            }
                                                        }}
                                                        className="inline-flex items-center justify-center gap-3 bg-slate-100 px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-200"
                                                        style={panelPillStyle}
                                                    >
                                                        <MapPin size={16} className="text-slate-600" />
                                                        <span>Show Directions</span>
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="border border-white/70 bg-white/70 p-5 shadow-[0_16px_35px_rgba(15,23,42,0.06)]" style={panelCardStyle}>
                                                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Reviews</h3>
                                                <div className="mt-4 flex flex-col gap-3">
                                                    {[
                                                        { author: 'Jane Doe', text: 'Great place, very helpful!', rating: 5 },
                                                        { author: 'John Smith', text: 'Good service, but a bit crowded.', rating: 4 },
                                                    ].map((review, i) => (
                                                        <div key={i} className="bg-slate-50 px-4 py-4" style={panelPillStyle}>
                                                            <div className="flex items-center justify-between gap-3 text-xs">
                                                                <span className="font-semibold text-slate-900">{review.author}</span>
                                                                <span className="bg-white px-2.5 py-1 text-slate-500" style={panelPillStyle}>{review.rating}/5</span>
                                                            </div>
                                                            <p className="mt-2 text-sm leading-6 text-slate-600">&quot;{review.text}&quot;</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col gap-4">
                                            {selectedPlace.about_sections ? (
                                                Object.entries(selectedPlace.about_sections).map(([key, items]) => (
                                                    <div key={key} className="border border-white/70 bg-white/70 p-5 shadow-[0_16px_35px_rgba(15,23,42,0.06)]" style={panelCardStyle}>
                                                        <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">
                                                            {key.replace('_', ' ')}
                                                        </h3>
                                                        <ul className="mt-4 space-y-3 text-sm text-slate-800">
                                                            {items.map((item, idx) => (
                                                                <li key={idx} className="flex items-start gap-3">
                                                                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100">
                                                                        <div className="h-2 w-2 rounded-full bg-emerald-600" />
                                                                    </div>
                                                                    <span className="leading-6">{item}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="border border-dashed border-slate-200 bg-white/60 p-5 text-sm italic text-slate-500" style={panelCardStyle}>
                                                    No additional information available.
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </main>
            </div>
        </div>
    );
}
