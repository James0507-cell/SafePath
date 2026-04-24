'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Map as MapIcon,
    Rss,
    Calendar,
    Settings,
    LogOut,
    Shield,
    Search,
    Bell,
    User,
    Star,
    MapPin,
    Clock,
    Phone,
    Globe,
    X,
    Maximize2,
    Minimize2
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
    const [places, setPlaces] = useState([]);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [activeDetailTab, setActiveDetailTab] = useState('overview');
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    
    const resultsEndRef = useRef(null);
    const isLoadingRef = useRef(false);
    const mapRef = useRef(null);
    const router = useRouter();
    const supabase = createClient();
    const hasResultsPanel = places.length > 0;

    useEffect(() => {
        if (!hasMore || isLoading) return;

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

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
        } catch (err) {
            console.error('Error logging out:', err);
        }
    };

    const handleSearch = async (e, page = 1) => {
        if (e) {
            e.preventDefault();
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
        { id: 'maps', label: 'Maps', icon: MapIcon },
        { id: 'feed', label: 'Feed', icon: Rss },
        { id: 'planner', label: 'Planner', icon: Calendar },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="flex flex-col md:flex-row h-[100dvh] bg-white text-slate-800 font-sans overflow-hidden">
            <aside className="hidden md:flex w-[72px] flex-col bg-white border-r border-slate-200 shrink-0 z-30">
                <div className="h-16 flex items-center justify-center border-b border-slate-100">
                    <div className="bg-slate-900 p-1.5 rounded-lg"><Shield className="text-white" size={20} /></div>
                </div>
                <nav className="flex-1 py-6 flex flex-col items-center gap-2">
                    {navItems.map((item) => (
                        <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-[60px] py-3 rounded-xl flex flex-col items-center gap-1 ${activeTab === item.id ? 'bg-slate-100' : 'text-slate-400'}`}>
                            <item.icon size={20} />
                            <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 justify-between shrink-0 z-20">
                    <form onSubmit={handleSearch} className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                type="text"
                                placeholder="Search locations..."
                                className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-2 rounded-xl text-sm focus:outline-hidden"
                            />
                        </div>
                    </form>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold">{user?.email?.charAt(0).toUpperCase()}</div>
                </header>

                <main className="flex-1 flex flex-row bg-slate-50 overflow-hidden font-sans">

                    {/* Search Results Panel */}
                    <div className={`${hasResultsPanel ? 'w-[400px]' : 'w-0'} h-full bg-white border-r border-slate-200 overflow-y-auto z-40 shrink-0`}>
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white">
                            <h2 className="font-bold text-sm text-slate-900">Results</h2>
                            <button onClick={() => { setPlaces([]); setSelectedPlace(null); }} className="text-slate-400 hover:text-slate-600">
                                <X size={16} />
                            </button>
                        </div>
                        {Array.isArray(places) && places.map((place, idx) => (
                            <div key={idx} onClick={() => {
                                setSelectedPlace(place);
                                if (mapRef.current && place.latitude && place.longitude) {
                                    mapRef.current.flyTo(place.longitude, place.latitude);
                                }
                                setActiveDetailTab('overview');
                            }} className={`flex gap-4 p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer ${selectedPlace?.name === place.name ? 'bg-slate-50' : ''}`}>
                                {place.image_url && (
                                    <img src={place.image_url} alt={place.name} className="w-20 h-20 object-cover rounded shrink-0" />
                                )}
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-bold text-sm truncate">{place.name}</h3>
                                    {place.category && (
                                        <span className="inline-block bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded font-medium mb-1">
                                            {place.category}
                                        </span>
                                    )}
                                    <p className="text-xs text-slate-500 truncate">{place.address}</p>
                                    <div className="flex flex-col gap-1 mt-2 text-xs text-slate-600">
                                        {place.rating && (
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        size={12}
                                                        className={star <= Math.round(place.rating) ? "text-yellow-500 fill-yellow-500" : "text-slate-300"}
                                                    />
                                                ))}
                                                <span className="ml-1 text-slate-600">{place.rating}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} className="text-slate-400" />
                                            <span className="truncate">{place.hours}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Phone size={12} className="text-slate-400" />
                                            <span className="truncate">{place.phone || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={resultsEndRef} className="h-4" />
                        {isLoading && (
                            <div className="p-4 text-center text-xs text-slate-400">Loading more...</div>
                        )}
                    </div>

                    {/* Detailed Place Panel */}
                    {selectedPlace && (
                        <div className="w-[450px] h-full bg-white border-r border-slate-200 flex flex-col z-50 overflow-hidden shrink-0 transition-all duration-300">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                                <h2 className="font-bold text-lg">Details</h2>
                                <button onClick={() => setSelectedPlace(null)} className="text-slate-400 hover:text-slate-600">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Tabs */}
                            <div className="flex border-b border-slate-100">
                                <button
                                    onClick={() => setActiveDetailTab('overview')}
                                    className={`flex-1 py-3 text-sm font-semibold ${activeDetailTab === 'overview' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500'}`}
                                >
                                    Overview
                                </button>
                                <button
                                    onClick={() => setActiveDetailTab('about')}
                                    className={`flex-1 py-3 text-sm font-semibold ${activeDetailTab === 'about' ? 'text-slate-900 border-b-2 border-slate-900' : 'text-slate-500'}`}
                                >
                                    About
                                </button>
                            </div>

                            <div className="overflow-y-auto p-6 flex flex-col gap-6">
                                {activeDetailTab === 'overview' ? (
                                    <div className="flex flex-col gap-6">
                                        {selectedPlace.image_url && (
                                            <div className="w-full shrink-0">
                                                <img src={selectedPlace.image_url} className="w-full h-auto object-contain rounded" />
                                            </div>
                                        )}
                                        <div className="flex-1 flex flex-col gap-4">
                                            <div>
                                                <h1 className="text-2xl font-semibold text-slate-900">{selectedPlace.name}</h1>
                                                {selectedPlace.category && (
                                                    <span className="inline-block bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded font-medium mt-1">
                                                        {selectedPlace.category}
                                                    </span>
                                                )}
                                                <p className="text-slate-500 mt-1">{selectedPlace.address}</p>
                                            </div>
                                            <div className="flex flex-col gap-3 text-sm text-slate-600">
                                                {selectedPlace.rating && (
                                                    <div className="flex items-center gap-3">
                                                        <Star size={16} className="text-slate-400" />
                                                        <span>{selectedPlace.rating} out of 5</span>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3">
                                                    <Phone size={16} className="text-slate-400" />
                                                    <span>{selectedPlace.phone || 'No phone number available'}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Clock size={16} className="text-slate-400" />
                                                    <span>{selectedPlace.hours}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <MapPin size={16} className="text-slate-400" />
                                                    <span className="font-mono text-xs">{selectedPlace.plus_code || 'N/A'}</span>
                                                </div>
                                                {selectedPlace.latitude && selectedPlace.longitude && (
                                                    <div className="flex items-center gap-3">
                                                        <MapPin size={16} className="text-slate-400" />
                                                        <span className="text-sm font-mono">
                                                            {typeof selectedPlace.latitude === 'number' ? selectedPlace.latitude.toFixed(6) : selectedPlace.latitude}, 
                                                            {typeof selectedPlace.longitude === 'number' ? selectedPlace.longitude.toFixed(6) : selectedPlace.longitude}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            {selectedPlace.website && (
                                                <a href={selectedPlace.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-blue-600 transition-colors">
                                                    <Globe size={16} className="text-slate-400" />
                                                    <span className="text-sm">Visit website</span>
                                                </a>
                                            )}
                                            <div className="border-t border-slate-100 mt-4 pt-4">
                                                <h3 className="font-semibold text-slate-900 mb-3">Reviews</h3>
                                                <div className="flex flex-col gap-4">
                                                    {[
                                                        { author: 'Jane Doe', text: 'Great place, very helpful!', rating: 5 },
                                                        { author: 'John Smith', text: 'Good service, but a bit crowded.', rating: 4 },
                                                    ].map((review, i) => (
                                                        <div key={i} className="flex flex-col gap-1">
                                                            <div className="flex justify-between text-xs">
                                                                <span className="font-medium text-slate-900">{review.author}</span>
                                                                <span className="text-slate-500">{review.rating}/5</span>
                                                            </div>
                                                            <p className="text-xs text-slate-600 italic">"{review.text}"</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-6">
                                        {selectedPlace.about_sections ? (
                                            Object.entries(selectedPlace.about_sections).map(([key, items], index) => (
                                                <div key={key}>
                                                    {index > 0 && <div className="h-px bg-slate-100 my-6" />}
                                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                                                        {key.replace('_', ' ')}
                                                    </h3>
                                                    <ul className="text-sm text-slate-800 space-y-3">
                                                        {items.map((item, idx) => (
                                                            <li key={idx} className="flex items-start gap-3">
                                                                <div className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                                                                    <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
                                                                </div>
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-slate-500 italic">No additional information available.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex-1 relative">
                        <MapView ref={mapRef} places={places} />
                        {isLoading && (
                            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm shadow-lg rounded-xl p-4 border border-slate-200 z-40 text-sm font-medium">
                                Searching...
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
