import React, { useEffect, useState } from 'react';
import { Driver, RaceEvent } from '../types';
import { generateF1Analysis } from '../services/geminiService';
import { fetchNextRace, fetchDriverStandings } from '../services/f1Service';

interface DashboardProps {
  onSelectDriver: (driver: Driver) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectDriver }) => {
  const [nextRace, setNextRace] = useState<RaceEvent | null>(null);
  const [topDrivers, setTopDrivers] = useState<Driver[]>([]);
  const [analysis, setAnalysis] = useState<string>('Loading AI race insights...');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Fetch data in parallel
      const [race, drivers] = await Promise.all([
        fetchNextRace(),
        fetchDriverStandings()
      ]);

      setNextRace(race);
      setTopDrivers(drivers.slice(0, 3)); // Top 3

      if (race) {
        const text = await generateF1Analysis(`Analyze the upcoming ${race.name} at ${race.location}. What should fans watch out for? Keep it under 50 words.`);
        setAnalysis(text);
      } else {
        setAnalysis("Season concluded or schedule unavailable.");
      }
      
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-racing-red border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-400 animate-pulse">Fetching live telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      {nextRace ? (
        <div className="relative rounded-2xl overflow-hidden bg-racing-charcoal shadow-2xl border border-gray-800">
          <div className="absolute inset-0">
            {/* Use a generic race track background since we don't have per-race images from API */}
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Monza_track_map.svg/1920px-Monza_track_map.svg.png" className="w-full h-full object-cover opacity-10 scale-110 blur-sm" alt="Background" />
            <div className="absolute inset-0 bg-gradient-to-r from-racing-dark via-racing-dark/80 to-transparent"></div>
          </div>
          
          <div className="relative p-8 md:p-12 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4 text-center md:text-left z-10">
              <div className="inline-block px-3 py-1 bg-racing-red text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg shadow-racing-red/20">
                Next Race
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white italic tracking-tight leading-tight">
                {nextRace.name}
              </h1>
              <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-2 md:gap-6 text-gray-300 text-lg font-medium">
                <span className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-lg border border-white/5">
                  <span className="text-2xl">{nextRace.flag}</span> {nextRace.location}
                </span>
                <span className="hidden md:inline opacity-50">•</span>
                <span className="text-racing-gold">{nextRace.date}</span>
              </div>
            </div>
            
            <div className="bg-black/40 backdrop-blur-md p-6 rounded-xl border border-white/10 max-w-md w-full shadow-xl z-10 hover:bg-black/50 transition-colors">
              <div className="flex items-center gap-2 mb-3 text-racing-red font-bold uppercase tracking-widest text-xs">
                <span className="w-2 h-2 rounded-full bg-racing-red animate-pulse"></span>
                AI Race Strategy Insight
              </div>
              <p className="text-gray-200 leading-relaxed text-sm font-light">
                {analysis}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-racing-charcoal rounded-xl border border-gray-800">
           <h2 className="text-2xl text-gray-400">No upcoming races found.</h2>
        </div>
      )}

      {/* Top Drivers Quick View */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white border-l-4 border-racing-red pl-4">Championship Leaders</h2>
          <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Live Standings</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topDrivers.map((driver) => (
            <div 
              key={driver.id} 
              onClick={() => onSelectDriver(driver)}
              className="bg-racing-charcoal rounded-xl p-6 border border-gray-800 hover:border-racing-red transition-all duration-300 group relative overflow-hidden shadow-lg cursor-pointer hover:bg-gray-800"
            >
              <div className="absolute top-0 right-0 p-4 text-8xl font-bold text-white/5 pointer-events-none italic select-none">
                {driver.rank}
              </div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-700 group-hover:border-racing-red transition-colors">
                     <img src={driver.image} alt={driver.name} className="w-full h-full object-cover object-top" />
                  </div>
                  {driver.rank === 1 && <span className="absolute -bottom-1 -right-1 text-xl drop-shadow-md">👑</span>}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-racing-red transition-colors leading-none mb-1">{driver.name}</h3>
                  <p className="text-gray-400 text-sm font-medium">{driver.team}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded border border-gray-700">{driver.country}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-700/50 flex justify-between text-sm">
                <div className="text-center">
                  <span className="block text-gray-500 uppercase text-[10px] tracking-wider">Points</span>
                  <span className="text-white font-mono text-xl font-bold">{driver.points}</span>
                </div>
                <div className="text-center">
                  <span className="block text-gray-500 uppercase text-[10px] tracking-wider">Wins</span>
                  <span className="text-white font-mono text-xl font-bold">{driver.wins}</span>
                </div>
                <div className="text-center">
                  <span className="block text-gray-500 uppercase text-[10px] tracking-wider">Rank</span>
                  <span className="text-racing-red font-mono text-xl font-bold">P{driver.rank}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
