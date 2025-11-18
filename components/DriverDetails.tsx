import React, { useEffect, useState } from 'react';
import { Driver, RaceResult } from '../types';
import { fetchDriverResults } from '../services/f1Service';
import { generateDriverAnalysis } from '../services/geminiService';

interface DriverDetailsProps {
  driver: Driver;
  onBack: () => void;
}

const DriverDetails: React.FC<DriverDetailsProps> = ({ driver, onBack }) => {
  const [results, setResults] = useState<RaceResult[]>([]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      
      // Parallel Fetch
      const [raceResults, _] = await Promise.allSettled([
        fetchDriverResults(driver.id),
        // Artificial delay for smooth UI transition
        new Promise(r => setTimeout(r, 500)) 
      ]);

      const resultData = raceResults.status === 'fulfilled' ? raceResults.value : [];
      setResults(resultData);

      // Generate AI Analysis based on recent performance
      const recentForm = resultData.slice(0, 3).map(r => `P${r.position} at ${r.raceName}`).join(', ');
      const analysisText = await generateDriverAnalysis(driver.name, driver.team, recentForm);
      setAnalysis(analysisText);

      setLoading(false);
    };
    loadDetails();
  }, [driver]);

  return (
    <div className="animate-fade-in space-y-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        Back to Grid
      </button>

      {/* Hero Header */}
      <div className="relative bg-racing-charcoal rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 text-9xl font-bold text-white/5 pointer-events-none italic select-none">
          {driver.rank}
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center p-8 gap-8">
          <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-racing-red shadow-2xl shrink-0 bg-gray-900">
             <img src={driver.image} alt={driver.name} className="w-full h-full object-cover object-top" />
          </div>
          
          <div className="text-center md:text-left space-y-2">
             <div className="flex items-center justify-center md:justify-start gap-3">
               <span className="px-3 py-1 bg-racing-red text-white text-xs font-bold uppercase tracking-wider rounded shadow-lg">
                 {driver.team}
               </span>
               <span className="px-3 py-1 bg-gray-700 text-gray-300 text-xs font-bold uppercase tracking-wider rounded">
                 {driver.country}
               </span>
             </div>
             <h1 className="text-4xl md:text-6xl font-bold text-white italic tracking-tight">
               {driver.name}
             </h1>
             
             <div className="flex items-center justify-center md:justify-start gap-8 mt-6">
                <div>
                   <span className="block text-gray-500 text-xs uppercase tracking-widest">Points</span>
                   <span className="text-2xl font-mono font-bold text-racing-gold">{driver.points}</span>
                </div>
                <div>
                   <span className="block text-gray-500 text-xs uppercase tracking-widest">Wins</span>
                   <span className="text-2xl font-mono font-bold text-white">{driver.wins}</span>
                </div>
                <div>
                   <span className="block text-gray-500 text-xs uppercase tracking-widest">Rank</span>
                   <span className="text-2xl font-mono font-bold text-white">#{driver.rank}</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* AI Analysis */}
         <div className="lg:col-span-2 bg-gradient-to-br from-racing-charcoal to-gray-900 rounded-xl border border-gray-800 p-6">
           <div className="flex items-center gap-2 mb-4 text-racing-red font-bold uppercase tracking-widest text-sm">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
             AI Performance Analysis
           </div>
           {loading ? (
             <div className="space-y-3 animate-pulse">
               <div className="h-4 bg-gray-800 rounded w-3/4"></div>
               <div className="h-4 bg-gray-800 rounded w-full"></div>
               <div className="h-4 bg-gray-800 rounded w-5/6"></div>
             </div>
           ) : (
             <div className="prose prose-invert prose-sm max-w-none">
               <div className="text-gray-300 whitespace-pre-line leading-relaxed">
                  {analysis}
               </div>
             </div>
           )}
         </div>

         {/* Current Season Stats Summary */}
         <div className="bg-racing-charcoal rounded-xl border border-gray-800 p-6">
            <h3 className="text-white font-bold mb-4">Season Stats</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                 <span className="text-gray-400">Races Completed</span>
                 <span className="text-white font-mono">{results.length}</span>
               </div>
               <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                 <span className="text-gray-400">Avg. Finish</span>
                 <span className="text-white font-mono">
                   {results.length > 0 
                     ? (results.reduce((acc, cur) => acc + (parseInt(cur.position) || 20), 0) / results.length).toFixed(1)
                     : '-'
                   }
                 </span>
               </div>
               <div className="flex justify-between items-center border-b border-gray-800 pb-2">
                 <span className="text-gray-400">Best Finish</span>
                 <span className="text-racing-gold font-mono font-bold">
                    {results.length > 0 
                      ? `P${Math.min(...results.map(r => parseInt(r.position) || 20))}`
                      : '-'
                    }
                 </span>
               </div>
            </div>
         </div>
      </div>

      {/* Recent Results Table */}
      <div className="bg-racing-charcoal rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800">
          <h3 className="text-xl font-bold text-white">Season Results</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-black/20 text-gray-500 uppercase tracking-wider">
                <th className="p-4">Round</th>
                <th className="p-4">Grand Prix</th>
                <th className="p-4">Grid</th>
                <th className="p-4">Finish</th>
                <th className="p-4 text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">Loading race telemetry...</td>
                </tr>
              ) : results.length === 0 ? (
                 <tr>
                   <td colSpan={5} className="p-8 text-center text-gray-500">No results found for this season.</td>
                 </tr>
              ) : (
                results.map((res, idx) => (
                  <tr key={idx} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 text-gray-400 font-mono">{res.round}</td>
                    <td className="p-4 font-medium text-white">{res.raceName}</td>
                    <td className="p-4 text-gray-400 font-mono">{res.grid}</td>
                    <td className={`p-4 font-bold font-mono ${['1','2','3'].includes(res.position) ? 'text-racing-gold' : 'text-white'}`}>
                      {res.position}
                    </td>
                    <td className="p-4 text-right text-white font-mono">{res.points}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DriverDetails;
