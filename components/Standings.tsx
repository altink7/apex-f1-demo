import React, { useEffect, useState } from 'react';
import { Driver, Team } from '../types';
import { fetchDriverStandings, fetchConstructorStandings } from '../services/f1Service';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface StandingsProps {
  onSelectDriver: (driver: Driver) => void;
}

const Standings: React.FC<StandingsProps> = ({ onSelectDriver }) => {
  const [driversData, setDriversData] = useState<Driver[]>([]);
  const [teamsData, setTeamsData] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllStandings = async () => {
      setLoading(true);
      const [drivers, teams] = await Promise.all([
        fetchDriverStandings(),
        fetchConstructorStandings()
      ]);
      setDriversData(drivers);
      setTeamsData(teams);
      setLoading(false);
    };
    fetchAllStandings();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="text-gray-400 flex items-center gap-2">
           <div className="w-4 h-4 bg-racing-red rounded-full animate-bounce"></div>
           Loading Standings...
        </div>
      </div>
    );
  }

  // Prepare chart data - top 10 drivers
  const chartData = driversData.slice(0, 10);

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-racing-charcoal p-6 rounded-xl border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-4">Top 10 Driver Points</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                <XAxis dataKey="name" tick={{fill: '#9CA3AF', fontSize: 10}} interval={0} tickFormatter={(val) => val.split(' ')[1].substring(0, 3).toUpperCase()} />
                <YAxis tick={{fill: '#9CA3AF'}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#1F1F27', border: '1px solid #374151', color: '#F3F3F3'}}
                  itemStyle={{color: '#F3F3F3'}}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="points" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index < 3 ? '#E10600' : '#374151'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-racing-charcoal p-6 rounded-xl border border-gray-800">
          <h3 className="text-xl font-bold text-white mb-4">Constructor Points</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                <XAxis type="number" tick={{fill: '#9CA3AF'}} />
                <YAxis type="category" dataKey="name" width={100} tick={{fill: '#9CA3AF', fontSize: 11}} />
                <Tooltip 
                  contentStyle={{backgroundColor: '#1F1F27', border: '1px solid #374151', color: '#F3F3F3'}}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                />
                <Bar dataKey="points" fill="#C9B037" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Table */}
      <div className="bg-racing-charcoal rounded-xl border border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Driver Standings</h2>
          <span className="text-xs text-gray-500 uppercase tracking-wider">Full Grid</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-black/20 text-gray-400 text-xs uppercase tracking-wider">
                <th className="p-4 font-medium w-16">Rank</th>
                <th className="p-4 font-medium">Driver</th>
                <th className="p-4 font-medium">Team</th>
                <th className="p-4 font-medium text-right">Wins</th>
                <th className="p-4 font-medium text-right">Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {driversData.map((driver) => (
                <tr 
                  key={driver.id} 
                  onClick={() => onSelectDriver(driver)}
                  className="hover:bg-white/5 transition-colors group cursor-pointer"
                >
                  <td className="p-4 font-mono text-white font-bold text-lg text-center">{driver.rank}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-gray-700 group-hover:border-racing-red transition-colors">
                        <img src={driver.image} alt={driver.name} className="w-full h-full object-cover object-top" />
                      </div>
                      <div>
                         <div className="font-bold text-white">{driver.name}</div>
                         <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] bg-gray-700 px-1.5 py-0.5 rounded text-gray-300 uppercase">{driver.country}</span>
                         </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">{driver.team}</td>
                  <td className="p-4 text-right text-gray-300 font-mono">{driver.wins}</td>
                  <td className="p-4 text-right font-bold text-racing-red font-mono text-lg">{driver.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Standings;
