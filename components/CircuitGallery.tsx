import React, { useEffect, useState, useRef } from 'react';
import { fetchCircuitList, fetchLastRaceResults, fetchWikiImageForCircuit } from '../services/f1Service';
import { getTrackRecords } from '../services/geminiService';

interface Track {
  id: string;
  name: string;
  location: string;
  url: string;
  image?: string;
}

interface TrackRecords {
  lap_record: {
    time: string;
    driver: string;
    year: string;
  };
  most_wins: {
    driver: string;
    count: string;
  };
  description: string;
}

interface RaceResultData {
  raceName: string;
  season: string;
  date: string;
  results: Array<{
    position: string;
    driverName: string;
    driverCode: string;
    constructor: string;
    time: string;
    points: string;
  }>;
}

type Tab = 'RESULTS' | 'MAP' | 'VIDEO' | 'RECORDS';

const CircuitGallery: React.FC = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [raceData, setRaceData] = useState<RaceResultData | null>(null);
  const [records, setRecords] = useState<TrackRecords | null>(null);
  
  const [loadingTracks, setLoadingTracks] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  
  const [activeTab, setActiveTab] = useState<Tab>('RESULTS');
  const [isFullscreenMap, setIsFullscreenMap] = useState(false);
  
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      setLoadingTracks(true);
      const list = await fetchCircuitList();
      setTracks(list);
      if (list.length > 0) {
        handleSelectTrack(list[0]);
      }
      setLoadingTracks(false);
    };
    load();
  }, []);

  const handleSelectTrack = async (track: Track) => {
    setSelectedTrack(track);
    setLoadingData(true);
    setRaceData(null);
    setRecords(null);
    setActiveTab('RESULTS'); // Reset to default tab

    // Parallel fetches
    const [results, recordData, img] = await Promise.all([
      fetchLastRaceResults(track.id),
      getTrackRecords(track.name, track.location),
      !track.image ? fetchWikiImageForCircuit(track.url) : Promise.resolve(null)
    ]);

    setRaceData(results);
    setRecords(recordData);

    if (img) {
      setTracks(prev => prev.map(t => t.id === track.id ? { ...t, image: img } : t));
      setSelectedTrack(prev => prev ? { ...prev, image: img } : null);
    }

    setLoadingData(false);
  };

  // Modal Render
  const renderFullscreenMap = () => {
    if (!isFullscreenMap || !selectedTrack) return null;

    return (
      <div 
        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        onClick={() => setIsFullscreenMap(false)}
      >
        <div className="relative max-w-7xl w-full h-full max-h-[90vh] flex items-center justify-center">
          <img 
            src={selectedTrack.image} 
            alt={`${selectedTrack.name} Fullscreen`} 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl border border-racing-red/30"
          />
          <button 
            className="absolute top-4 right-4 bg-racing-red hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-transform hover:scale-110"
            onClick={(e) => { e.stopPropagation(); setIsFullscreenMap(false); }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="absolute bottom-8 bg-black/60 px-6 py-3 rounded-full text-white font-bold backdrop-blur-md border border-white/10">
            {selectedTrack.name}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {renderFullscreenMap()}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white border-l-4 border-racing-red pl-4">Circuit Gallery</h2>
        <span className="text-xs text-gray-500 uppercase tracking-wider hidden sm:inline">Explore the Calendar</span>
      </div>

      {/* Carousel */}
      <div className="relative group">
        <div 
            ref={carouselRef}
            className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 custom-scrollbar"
        >
            {tracks.map(track => (
                <button
                    key={track.id}
                    onClick={() => handleSelectTrack(track)}
                    className={`snap-center shrink-0 w-64 h-40 rounded-xl overflow-hidden relative transition-all duration-300 border-2 ${selectedTrack?.id === track.id ? 'border-racing-red scale-105 shadow-xl shadow-racing-red/20 ring-2 ring-racing-red/20' : 'border-gray-800 opacity-70 hover:opacity-100'}`}
                >
                    {track.image ? (
                        <img src={track.image} alt={track.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-racing-charcoal flex items-center justify-center">
                            <span className="text-gray-600 text-xs">Loading...</span>
                        </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-3 text-left w-full">
                        <div className="text-white font-bold text-sm truncate">{track.name}</div>
                        <div className="text-gray-400 text-xs truncate">{track.location}</div>
                    </div>
                </button>
            ))}
        </div>
      </div>

      {/* Main Content Area */}
      {selectedTrack && (
        <div className="bg-racing-charcoal rounded-xl border border-gray-800 overflow-hidden shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="bg-black/30 p-6 border-b border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white">{selectedTrack.name}</h1>
              <p className="text-gray-400 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {selectedTrack.location}
              </p>
            </div>
            
            {/* Tabs */}
            <div className="flex bg-gray-900/50 p-1 rounded-lg">
              {(['RESULTS', 'MAP', 'VIDEO', 'RECORDS'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${activeTab === tab ? 'bg-racing-red text-white shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  {tab === 'MAP' ? 'Track Map' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 min-h-[400px]">
            {loadingData ? (
               <div className="h-full flex flex-col items-center justify-center space-y-4 py-20">
                   <div className="w-12 h-12 border-4 border-racing-red border-t-transparent rounded-full animate-spin"></div>
                   <p className="text-gray-400">Retrieving circuit telemetry...</p>
               </div>
            ) : (
              <>
                {/* SECTION 1: RESULTS */}
                {activeTab === 'RESULTS' && (
                   <div className="animate-fade-in">
                     {raceData ? (
                       <>
                         <div className="flex items-center justify-between mb-6">
                           <h3 className="text-xl font-bold text-white flex items-center gap-2">
                             <span className="text-racing-red">Last Race</span> Results
                             <span className="text-sm bg-gray-800 text-gray-400 px-2 py-1 rounded border border-gray-700 ml-2">{raceData.season}</span>
                           </h3>
                           <div className="text-right">
                             <div className="text-xs text-gray-500 uppercase">Date</div>
                             <div className="text-gray-300 font-mono">{raceData.date}</div>
                           </div>
                         </div>
                         <div className="overflow-x-auto">
                           <table className="w-full text-left text-sm">
                             <thead>
                               <tr className="text-gray-500 border-b border-gray-800 uppercase text-xs tracking-wider">
                                 <th className="pb-3 font-medium">Pos</th>
                                 <th className="pb-3 font-medium">Driver</th>
                                 <th className="pb-3 font-medium">Team</th>
                                 <th className="pb-3 font-medium text-right">Time</th>
                                 <th className="pb-3 font-medium text-right">Pts</th>
                               </tr>
                             </thead>
                             <tbody className="divide-y divide-gray-800">
                               {raceData.results.slice(0, 10).map((res) => (
                                 <tr key={res.position} className="group hover:bg-white/5 transition-colors">
                                   <td className={`py-3 font-mono font-bold ${['1','2','3'].includes(res.position) ? 'text-racing-gold' : 'text-gray-400'}`}>{res.position}</td>
                                   <td className="py-3 font-medium text-white">{res.driverName}</td>
                                   <td className="py-3 text-gray-400">{res.constructor}</td>
                                   <td className="py-3 text-right text-gray-300 font-mono">{res.time}</td>
                                   <td className="py-3 text-right text-racing-red font-bold font-mono">{res.points}</td>
                                 </tr>
                               ))}
                             </tbody>
                           </table>
                         </div>
                       </>
                     ) : (
                       <div className="text-center py-20 text-gray-500">No recent race results found.</div>
                     )}
                   </div>
                )}

                {/* SECTION 2: MAP */}
                {activeTab === 'MAP' && (
                  <div className="animate-fade-in flex flex-col items-center justify-center h-full">
                    <div className="relative w-full max-w-3xl aspect-video bg-black rounded-xl overflow-hidden border border-gray-800 group">
                      <img 
                        src={selectedTrack.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Silhouette_Anonyme.svg/500px-Silhouette_Anonyme.svg.png'} 
                        alt={selectedTrack.name} 
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                         <button 
                           onClick={() => setIsFullscreenMap(true)}
                           className="bg-racing-red text-white px-6 py-3 rounded-full font-bold shadow-lg transform scale-95 group-hover:scale-105 transition-transform flex items-center gap-2"
                         >
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                           Show Fullscreen
                         </button>
                      </div>
                    </div>
                    <p className="mt-4 text-gray-500 text-sm italic">Tap image to expand circuit layout</p>
                  </div>
                )}

                {/* SECTION 3: VIDEO */}
                {activeTab === 'VIDEO' && (
                  <div className="animate-fade-in h-full min-h-[400px]">
                    <div className="w-full h-full min-h-[400px] bg-black rounded-xl overflow-hidden border border-gray-800 relative">
                       <iframe 
                         width="100%" 
                         height="100%" 
                         className="absolute inset-0"
                         src={`https://www.youtube.com/embed?listType=search&list=F1+${encodeURIComponent(selectedTrack.name)}+Hot+Lap+Onboard`} 
                         title="F1 Circuit Video"
                         frameBorder="0" 
                         allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                         allowFullScreen
                       ></iframe>
                    </div>
                  </div>
                )}

                {/* SECTION 4: RECORDS */}
                {activeTab === 'RECORDS' && (
                  <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6">
                    {records ? (
                      <>
                         <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-racing-red/20 text-racing-red rounded-full flex items-center justify-center mb-4">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <h4 className="text-gray-500 uppercase tracking-widest font-bold text-sm mb-2">Lap Record</h4>
                            <div className="text-3xl font-bold text-white font-mono mb-1">{records.lap_record?.time || "N/A"}</div>
                            <div className="text-racing-red font-bold text-lg">{records.lap_record?.driver || "Unknown"}</div>
                            <div className="text-gray-600 text-sm mt-1">{records.lap_record?.year}</div>
                         </div>

                         <div className="bg-gray-900/50 p-8 rounded-xl border border-gray-800 flex flex-col items-center justify-center text-center">
                            <div className="w-16 h-16 bg-racing-gold/20 text-racing-gold rounded-full flex items-center justify-center mb-4">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                            </div>
                            <h4 className="text-gray-500 uppercase tracking-widest font-bold text-sm mb-2">Most Wins</h4>
                            <div className="text-3xl font-bold text-white mb-1">{records.most_wins?.count || "0"} Wins</div>
                            <div className="text-racing-gold font-bold text-lg">{records.most_wins?.driver || "N/A"}</div>
                            <div className="text-gray-600 text-sm mt-1">Circuit Legend</div>
                         </div>
                         
                         <div className="md:col-span-2 bg-gray-800/30 p-6 rounded-xl border border-gray-800 mt-2">
                            <h4 className="text-white font-bold mb-2">Circuit Insight</h4>
                            <p className="text-gray-400 leading-relaxed">{records.description}</p>
                         </div>
                      </>
                    ) : (
                      <div className="md:col-span-2 text-center py-20 text-gray-500">
                        <p>Historical record data unavailable.</p>
                      </div>
                    )}
                  </div>
                )}

              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CircuitGallery;
