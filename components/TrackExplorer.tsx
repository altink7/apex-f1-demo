import React, { useState, useEffect } from 'react';
import { Map, Marker, ZoomControl } from "pigeon-maps";
import { exploreTrackWithMaps } from '../services/geminiService';
import { fetchCircuitList, fetchWikiImageForCircuit } from '../services/f1Service';

interface Track {
  id: string;
  name: string;
  location: string;
  url: string;
  lat: number;
  lng: number;
}

const TrackExplorer: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [trackImage, setTrackImage] = useState<string | null>(null);
  const [trackInfo, setTrackInfo] = useState<string | null>(null);
  const [mapLinks, setMapLinks] = useState<Array<{title: string, uri: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [center, setCenter] = useState<[number, number]>([20, 0]);
  const [zoom, setZoom] = useState(2);
  const [showList, setShowList] = useState(true); // Toggle for mobile mainly

  useEffect(() => {
    const loadTracks = async () => {
      const data = await fetchCircuitList();
      setTracks(data);
    };
    loadTracks();
  }, []);

  const handleSelectTrack = async (track: Track) => {
    // Reset State
    setSelectedTrack(track);
    setCenter([track.lat, track.lng]);
    setZoom(13);
    setTrackImage(null);
    setTrackInfo(null);
    setMapLinks([]);
    setLoading(true);
    setShowList(false); // On mobile, hide list after selection to show map/details

    try {
      // Run fetches in parallel but handle them independently
      const results = await Promise.allSettled([
        fetchWikiImageForCircuit(track.url),
        exploreTrackWithMaps(track.name, track.location, track.lat, track.lng)
      ]);

      // Handle Image Result
      if (results[0].status === 'fulfilled') {
        setTrackImage(results[0].value);
      } else {
        console.warn("Image fetch failed", results[0].reason);
      }

      // Handle Intel Result
      if (results[1].status === 'fulfilled') {
        setTrackInfo(results[1].value.text);
        setMapLinks(results[1].value.links);
      } else {
        setTrackInfo("Intelligence system offline.");
      }

    } catch (error) {
      console.error("Unexpected error selecting track:", error);
      setTrackInfo("An unexpected error occurred while retrieving track data.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetMap = () => {
    setSelectedTrack(null);
    setCenter([20, 0]);
    setZoom(2);
    setShowList(true);
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col lg:flex-row gap-6 overflow-hidden relative">
      
      {/* Track List Sidebar (Desktop) / Overlay (Mobile) */}
      <div className={`${showList ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} absolute lg:relative z-40 inset-y-0 left-0 w-64 lg:w-1/4 bg-racing-charcoal border-r border-gray-800 flex flex-col transition-transform duration-300 shadow-2xl lg:shadow-none lg:rounded-xl lg:border`}>
        <div className="p-4 border-b border-gray-800 bg-racing-dark">
           <h3 className="font-bold text-white flex items-center justify-between">
             Circuit Index
             <span className="text-xs bg-racing-red px-2 py-0.5 rounded-full">{tracks.length}</span>
           </h3>
        </div>
        <div className="overflow-y-auto flex-1 custom-scrollbar">
          {tracks.map(track => (
            <button 
              key={track.id}
              onClick={() => handleSelectTrack(track)}
              className={`w-full text-left p-3 text-sm border-b border-gray-800 hover:bg-white/5 transition-colors ${selectedTrack?.id === track.id ? 'bg-racing-red/10 border-l-4 border-l-racing-red text-white' : 'text-gray-400'}`}
            >
               <div className="font-bold">{track.name}</div>
               <div className="text-xs opacity-70">{track.location}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Toggle Button */}
      {!showList && (
        <button 
          onClick={() => setShowList(true)}
          className="absolute top-4 left-4 z-30 lg:hidden bg-racing-charcoal p-2 rounded-md shadow-lg text-white border border-gray-700"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      )}

      {/* Map Area */}
      <div className={`relative transition-all duration-500 ease-in-out bg-racing-charcoal rounded-xl border border-gray-800 overflow-hidden shadow-2xl flex-1 flex flex-col`}>
        <div className={`relative flex-1 ${selectedTrack ? 'h-1/2' : 'h-full'}`}>
          <Map 
            height={selectedTrack ? 400 : 800} 
            defaultCenter={[20, 0]} 
            defaultZoom={2}
            center={center}
            zoom={zoom}
            onBoundsChanged={({ center, zoom }) => {
              setCenter(center);
              setZoom(zoom);
            }}
            metaWheelZoom={true}
          >
            <ZoomControl />
            {tracks.map(track => (
              <Marker 
                key={track.id} 
                width={40} 
                anchor={[track.lat, track.lng]} 
                onClick={() => handleSelectTrack(track)}
                color={selectedTrack?.id === track.id ? '#FFFFFF' : '#E10600'}
              />
            ))}
          </Map>
          
          <div className="absolute top-4 right-4 z-[500]">
             {selectedTrack && (
              <button 
                onClick={handleResetMap}
                className="bg-racing-red hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2"
              >
                Reset View
              </button>
            )}
          </div>
        </div>

        {/* Detail Panel - Slides up or expands */}
        {selectedTrack && (
          <div className="flex-1 bg-racing-charcoal border-t border-gray-800 flex flex-col overflow-hidden animate-fade-in">
            <div className="relative h-32 shrink-0 overflow-hidden bg-black group">
              {trackImage ? (
                <>
                  <img src={trackImage} alt={selectedTrack.name} className="w-full h-full object-cover opacity-60" />
                  <div className="absolute inset-0 bg-gradient-to-t from-racing-charcoal via-transparent to-transparent"></div>
                </>
              ) : (
                 <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                     <span className="text-gray-700 text-xs uppercase">Visual Unavailable</span>
                 </div>
              )}
              <div className="absolute bottom-0 left-0 p-4 w-full">
                <h1 className="text-xl font-bold text-white leading-tight shadow-black drop-shadow-lg">{selectedTrack.name}</h1>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
              {loading && !trackInfo ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-32 bg-gray-700/50 rounded-lg mt-6"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="prose prose-invert prose-sm max-w-none">
                     <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">
                       {trackInfo}
                     </p>
                  </div>
                  
                  {mapLinks.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {mapLinks.map((link, idx) => (
                          <a key={idx} href={link.uri} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline border border-blue-900/30 bg-blue-900/10 px-2 py-1 rounded">
                            {link.title}
                          </a>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackExplorer;
