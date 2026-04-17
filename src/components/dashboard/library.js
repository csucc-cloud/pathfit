import React, { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  PlayCircle, 
  FileText, 
  ArrowRight, 
  Clock, 
  Star,
  Layers,
  Sparkles
} from 'lucide-react';

const Library = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Tutorials', 'Fitness Info', 'Guides', 'Resources'];

  const libraryItems = [
    {
      id: 1,
      type: 'Tutorial',
      title: 'Proper Squat Form 101',
      description: 'Master the fundamental movement patterns to prevent injury and maximize gains.',
      duration: '8 min read',
      category: 'Tutorials',
      icon: PlayCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      id: 2,
      type: 'Information',
      title: 'Nutrition Strategy Guide',
      description: 'Understanding macronutrients and how to fuel your PATHFit journey effectively.',
      duration: '12 min read',
      category: 'Fitness Info',
      icon: FileText,
      color: 'text-fbOrange',
      bgColor: 'bg-fbOrange/10'
    },
    {
      id: 3,
      type: 'Guide',
      title: 'Setting SMART Goals',
      description: 'How to structure your fitness objectives for the upcoming post-test evaluations.',
      duration: '5 min read',
      category: 'Guides',
      icon: BookOpen,
      color: 'text-fbAmber',
      bgColor: 'bg-fbAmber/10'
    },
    {
      id: 4,
      type: 'Resource',
      title: 'Flexibility Routine PDF',
      description: 'A comprehensive list of stretches to improve your overall mobility and posture.',
      duration: '3 pages',
      category: 'Resources',
      icon: Layers,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    }
  ];

  const filteredItems = libraryItems.filter(item => {
    const matchesTab = activeTab === 'All' || item.category === activeTab;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="max-w-[1250px] mx-auto px-6 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={18} className="text-fbOrange" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Knowledge Hub</span>
          </div>
          <h1 className="text-4xl font-black text-fbNavy tracking-tighter">
            Digital <span className="text-fbOrange">Library</span>
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Access tutorials, guides, and essential fitness information.</p>
        </div>

        {/* SEARCH BAR */}
        <div className="relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-fbOrange transition-colors">
            <Search size={18} />
          </div>
          <input 
            type="text"
            placeholder="Search resources..."
            className="w-full md:w-80 pl-12 pr-4 py-4 bg-white border border-gray-100 rounded-[2rem] shadow-sm focus:ring-4 focus:ring-fbOrange/10 focus:border-fbOrange outline-none transition-all font-bold text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-6 py-2.5 rounded-full text-xs font-black whitespace-nowrap transition-all border ${
              activeTab === cat 
                ? 'bg-fbNavy text-white border-fbNavy shadow-lg shadow-fbNavy/20 scale-105' 
                : 'bg-white text-gray-400 border-gray-100 hover:border-fbOrange hover:text-fbOrange'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* CONTENT GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const ItemIcon = item.icon;
          return (
            <div 
              key={item.id}
              className="group bg-white rounded-[2.5rem] p-8 border border-gray-50 hover:border-fbOrange/20 shadow-sm hover:shadow-2xl hover:shadow-fbOrange/10 transition-all duration-500 relative overflow-hidden"
            >
              {/* Decorative Background Element */}
              <div className={`absolute -top-10 -right-10 w-32 h-32 ${item.bgColor} rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700`} />

              <div className="relative z-10">
                <div className={`w-14 h-14 ${item.bgColor} ${item.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300`}>
                  <ItemIcon size={28} />
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${item.color}`}>
                    {item.type}
                  </span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full" />
                  <div className="flex items-center gap-1 text-gray-400">
                    <Clock size={12} />
                    <span className="text-[10px] font-bold">{item.duration}</span>
                  </div>
                </div>

                <h3 className="text-xl font-black text-fbNavy mb-3 group-hover:text-fbOrange transition-colors leading-tight">
                  {item.title}
                </h3>
                
                <p className="text-gray-500 text-sm font-medium mb-6 line-clamp-2">
                  {item.description}
                </p>

                <button className="flex items-center gap-2 text-fbNavy font-black text-xs group/btn">
                  <span>Explore Content</span>
                  <div className="w-8 h-8 bg-fbGray rounded-full flex items-center justify-center group-hover/btn:bg-fbOrange group-hover/btn:text-white transition-all">
                    <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* EMPTY STATE */}
      {filteredItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
            <BookOpen size={40} />
          </div>
          <h3 className="text-xl font-black text-fbNavy tracking-tight">No resources found</h3>
          <p className="text-gray-400 font-medium mt-1">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};

export default Library;
