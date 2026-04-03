import { motion } from 'framer-motion';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { Target, TrendingUp, BookOpen, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const performanceData = [
  { name: 'Mock 1', score: 65 },
  { name: 'Mock 2', score: 72 },
  { name: 'Mock 3', score: 68 },
  { name: 'Mock 4', score: 81 },
  { name: 'Mock 5', score: 86 },
  { name: 'Mock 6', score: 92 },
];

const topicData = [
  { subject: 'Physics', A: 120, fullMark: 150 },
  { subject: 'Math', A: 98, fullMark: 150 },
  { subject: 'Chemistry', A: 86, fullMark: 150 },
  { subject: 'Biology', A: 99, fullMark: 150 },
  { subject: 'Aptitude', A: 85, fullMark: 150 },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Overview Dashboard</h1>
          <p className="text-gray-400 text-sm">Welcome back. Here is your recent performance data.</p>
        </div>
        <Link to="/upload" className="glow-button px-4 py-2 text-sm">
          Upload New Test
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard title="Tests Analyzed" value="6" icon={BookOpen} trend="+2 this week" />
        <StatCard title="Average Score" value="77.3%" icon={TrendingUp} trend="+5% improvement" />
        <StatCard title="Weakest Link" value="Chemistry" icon={Target} crit />
        <StatCard title="Study Hours Rec." value="14h" icon={Clock} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 glass-panel p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Performance Progress</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6b00" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff6b00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121216', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#ff9a00' }}
                />
                <Area type="monotone" dataKey="score" stroke="#ff9a00" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Concept Strength</h2>
          <div className="h-[300px] w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={topicData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="Student" dataKey="A" stroke="#ff6b00" fill="#ff6b00" fillOpacity={0.4} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#121216', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#ff9a00' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, crit = false }) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className="glass-card p-5 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-4 opacity-20">
        <Icon className="w-16 h-16 text-brand-orange" />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-2 text-gray-400">
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className={`text-3xl font-bold mb-1 ${crit ? 'text-brand-orange' : 'text-white'}`}>
          {value}
        </div>
        {trend && (
          <div className="text-xs text-emerald-400/80 font-medium">
            {trend}
          </div>
        )}
      </div>
    </motion.div>
  );
}
