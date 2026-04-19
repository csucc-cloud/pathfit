import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ThumbsUp, MessageSquare, Share2, MoreHorizontal, 
  ShieldCheck, Globe, Clock, FileText, Send, X,
  Heart, Flame, ThumbsDown, Copy, Facebook, Twitter
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function PostCard({ ann, instructor }) {
  const [reaction, setReaction] = useState(null); // 'like', 'heart', 'fire', 'dislike'
  const [showReactions, setShowReactions] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  const reactions = [
    { id: 'like', icon: <ThumbsUp size={18} className="text-blue-500 fill-blue-500" />, label: 'Like', color: 'text-blue-500' },
    { id: 'heart', icon: <Heart size={18} className="text-red-500 fill-red-500" />, label: 'Love', color: 'text-red-500' },
    { id: 'fire', icon: <Flame size={18} className="text-orange-500 fill-orange-500" />, label: 'Fire', color: 'text-orange-500' },
    { id: 'dislike', icon: <ThumbsDown size={18} className="text-slate-500 fill-slate-500" />, label: 'Dislike', color: 'text-slate-500' },
  ];

  const handleReaction = async (type) => {
    setReaction(type === reaction ? null : type);
    setShowReactions(false);
    // Logic for Supabase update would go here (UPSERT into reactions table)
  };

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now(),
      text: commentText,
      user: instructor?.full_name || "Instructor",
      created_at: new Date().toISOString()
    };
    setComments([newComment, ...comments]);
    setCommentText("");
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = ann?.content;
    
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      alert("Link copied!");
    } else if (platform === 'fb') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    }
    setShowShareMenu(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300"
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className="w-11 h-11 rounded-xl bg-fbNavy flex items-center justify-center text-white text-sm font-bold overflow-hidden shadow-inner">
               {instructor?.avatar_url ? <img src={instructor.avatar_url} className="w-full h-full object-cover" alt="prof"/> : instructor?.full_name?.[0]}
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                {instructor?.full_name} 
                <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                    <ShieldCheck size={12} className="text-blue-500 fill-blue-500 text-white"/>
                    <span className="text-[9px] text-blue-600 uppercase font-black">Verified</span>
                </div>
              </h4>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                    <Clock size={12}/> {ann?.created_at ? new Date(ann.created_at).toLocaleDateString() : 'Just now'}
                </p>
                <p className="text-[10px] text-fbOrange font-black uppercase flex items-center gap-1">
                    <Globe size={12}/> {ann?.target_section || "Global Access"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="relative group">
            <button className="text-slate-400 hover:bg-slate-50 p-2 rounded-xl transition-colors">
                <MoreHorizontal size={20}/>
            </button>
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
                <button className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 first:rounded-t-xl">Edit Post</button>
                <button className="w-full text-left px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Pin to Top</button>
                <button className="w-full text-left px-4 py-2 text-xs font-bold text-red-500 hover:bg-red-50 last:rounded-b-xl">Delete Post</button>
            </div>
          </div>
        </div>
        
        <p className="mt-4 text-[15px] text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{ann?.content}</p>
      </div>

      {ann?.file_url && (
        <div className="mx-5 mb-5 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-slate-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 text-fbNavy group-hover:text-fbOrange transition-colors">
                <FileText size={22} />
            </div>
            <div>
                <span className="text-xs font-black text-slate-700 block uppercase tracking-tight">Resource</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">{ann?.file_type || 'Document'}</span>
            </div>
          </div>
          <a href={ann.file_url} target="_blank" rel="noreferrer" className="px-4 py-2 bg-white text-[10px] font-black text-fbNavy rounded-xl border border-slate-200 hover:bg-fbNavy hover:text-white transition-all shadow-sm">VIEW</a>
        </div>
      )}

      {/* ACTION BUTTONS */}
      <div className="px-5 py-2 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between gap-2 relative">
        
        {/* REACTION SYSTEM */}
        <div className="flex-1 relative" onMouseLeave={() => setShowReactions(false)}>
          <AnimatePresence>
            {showReactions && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.9 }} 
                animate={{ opacity: 1, y: -50, scale: 1 }} 
                exit={{ opacity: 0, y: 10 }}
                className="absolute left-0 bg-white shadow-xl border border-slate-100 rounded-full p-1.5 flex gap-2 z-50"
              >
                {reactions.map((r) => (
                  <button 
                    key={r.id} 
                    onClick={() => handleReaction(r.id)}
                    className="p-2 hover:bg-slate-50 rounded-full transition-transform hover:scale-125"
                  >
                    {r.icon}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          <button 
            onMouseEnter={() => setShowReactions(true)}
            onClick={() => handleReaction('like')}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${reaction ? reactions.find(r => r.id === reaction).color : 'text-slate-500 hover:bg-white'}`}
          >
            {reaction ? reactions.find(r => r.id === reaction).icon : <ThumbsUp size={16}/>}
            {reaction ? reactions.find(r => r.id === reaction).label : 'Like'}
          </button>
        </div>
        
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 hover:bg-white hover:shadow-sm rounded-xl text-slate-500 hover:text-fbNavy text-xs font-black transition-all uppercase tracking-widest"
        >
          <MessageSquare size={16}/> Comment
        </button>
        
        {/* SHARE MENU */}
        <div className="flex-1 relative">
          <button 
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="w-full flex items-center justify-center gap-2 py-2.5 hover:bg-white hover:shadow-sm rounded-xl text-slate-500 hover:text-fbNavy text-xs font-black transition-all uppercase tracking-widest"
          >
            <Share2 size={16}/> Share
          </button>
          
          <AnimatePresence>
            {showShareMenu && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute bottom-full right-0 mb-2 w-40 bg-white shadow-xl border border-slate-100 rounded-xl overflow-hidden z-50"
              >
                <button onClick={() => handleShare('fb')} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black text-slate-600 hover:bg-slate-50"><Facebook size={14} className="text-blue-600"/> FACEBOOK</button>
                <button onClick={() => handleShare('copy')} className="w-full flex items-center gap-3 px-4 py-2.5 text-[10px] font-black text-slate-600 hover:bg-slate-50 border-t border-slate-50"><Copy size={14}/> COPY LINK</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-slate-100 bg-slate-50/50 overflow-hidden">
            <div className="p-4 space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-200 shrink-0 overflow-hidden">
                    {instructor?.avatar_url && <img src={instructor.avatar_url} className="w-full h-full object-cover" alt="me" />}
                </div>
                <div className="flex-1 relative">
                    <input 
                      type="text" 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Write a comment..." 
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-4 pr-10 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-fbNavy/10"
                    />
                    <button onClick={handleSendComment} className="absolute right-2 top-1/2 -translate-y-1/2 text-fbNavy hover:text-fbOrange transition-colors">
                        <Send size={16} />
                    </button>
                </div>
              </div>

              <div className="space-y-3">
                {comments.map(c => (
                  <div key={c.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-lg bg-fbNavy text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                        {c.user[0]}
                    </div>
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                        <p className="text-[10px] font-black text-fbNavy uppercase">{c.user}</p>
                        <p className="text-xs text-slate-700 mt-0.5">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
