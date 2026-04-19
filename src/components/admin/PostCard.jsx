import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ThumbsUp, MessageSquare, Share2, MoreHorizontal, 
  ShieldCheck, Globe, Clock, FileText, Send, X,
  Heart, Flame, ThumbsDown, Copy, Facebook, Twitter,
  Trash2, Edit3
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function PostCard({ ann, instructor }) {
  const [reaction, setReaction] = useState(null);
  const [showReactions, setShowReactions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareDescription, setShareDescription] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  
  // State for the three dots menu
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: comms, error: commError } = await supabase
          .from('comments')
          .select('*')
          .eq('announcement_id', ann.id)
          .order('created_at', { ascending: false });
        
        if (comms) setComments(comms.map(c => ({ id: c.id, text: c.content, user: c.user_full_name, created_at: c.created_at })));
        if (commError) alert("Fetch Comments Error: " + commError.message);

        if (instructor?.id) {
          const { data: react, error: reactError } = await supabase
            .from('reactions')
            .select('type')
            .eq('announcement_id', ann.id)
            .eq('user_id', instructor.id)
            .maybeSingle(); 
          
          if (react) setReaction(react.type);
        }
      } catch (e) {
        alert("System Error: " + e.message);
      }
    };
    if (ann.id) fetchData();
  }, [ann.id, instructor?.id]);

  const reactions = [
    { id: 'like', icon: <ThumbsUp size={18} className="text-blue-500 fill-blue-500" />, label: 'Like', color: 'text-blue-500' },
    { id: 'heart', icon: <Heart size={18} className="text-red-500 fill-red-500" />, label: 'Love', color: 'text-red-500' },
    { id: 'fire', icon: <Flame size={18} className="text-orange-500 fill-orange-500" />, label: 'Fire', color: 'text-orange-500' },
    { id: 'dislike', icon: <ThumbsDown size={18} className="text-slate-500 fill-slate-500" />, label: 'Dislike', color: 'text-slate-500' },
  ];

  const handleReaction = async (type) => {
    if (!instructor?.id) return alert("Error: Instructor ID is missing. Are you logged in?");
    const isRemoving = type === reaction;
    const previousReaction = reaction;
    setReaction(isRemoving ? null : type);
    setShowReactions(false);

    let error;
    if (isRemoving) {
      const { error: delError } = await supabase.from('reactions').delete().eq('announcement_id', ann.id).eq('user_id', instructor.id);
      error = delError;
    } else {
      const { error: upsertError } = await supabase.from('reactions').upsert({ 
          announcement_id: ann.id, user_id: instructor.id, type: type 
        }, { onConflict: 'announcement_id, user_id' });
      error = upsertError;
    }

    if (error) {
      setReaction(previousReaction);
      alert("Database Reaction Error: " + error.message);
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !instructor?.id) return;
    const { data, error } = await supabase.from('comments').insert([{
      announcement_id: ann.id, user_id: instructor.id, content: commentText, user_full_name: instructor.full_name
    }]).select().single();

    if (error) alert("Database Comment Error: " + error.message);
    else if (data) {
      setComments([{ id: data.id, text: data.content, user: data.user_full_name, created_at: data.created_at }, ...comments]);
      setCommentText("");
    }
  };

  const handleFacebookShare = async () => {
    if (!instructor?.id) return alert("Error: Instructor ID missing");
    const { error } = await supabase.from('announcements').insert([{
      content: `${shareDescription}\n\n--- Shared Post ---\n${ann.content}`,
      instructor_id: instructor.id, target_section: null, file_url: ann.file_url || null, file_type: ann.file_type || null
    }]);
    
    if (error) alert("Database Share Error: " + error.message);
    else { setShowShareModal(false); setShareDescription(""); alert("Success!"); }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all duration-300 mb-4"
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

          {/* ADDED: Three Dots Button */}
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-slate-50 rounded-full transition-colors"
            >
              <MoreHorizontal size={20} className="text-slate-400" />
            </button>
            
            <AnimatePresence>
              {showMenu && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="absolute right-0 mt-2 w-40 bg-white border border-slate-100 shadow-xl rounded-xl z-[60] py-2 overflow-hidden"
                >
                  <button className="w-full px-4 py-2 text-left text-xs font-bold text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                    <Edit3 size={14} /> Edit Post
                  </button>
                  <button className="w-full px-4 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2">
                    <Trash2 size={14} /> Delete
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        <p className="mt-4 text-[15px] text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{ann?.content}</p>
      </div>

      {/* ACTION BAR with Long-Press Fix */}
      <div 
        className="px-5 py-2 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between gap-2 relative select-none touch-none"
        style={{ WebkitTouchCallout: 'none' }} 
      >
        <div 
          className="flex-1 relative" 
          onMouseLeave={() => setShowReactions(false)}
        >
          <AnimatePresence>
            {showReactions && (
              <motion.div 
                initial={{ opacity: 0, y: 20, scale: 0.5 }} 
                animate={{ opacity: 1, y: -55, scale: 1 }} 
                exit={{ opacity: 0, y: 20, scale: 0.5 }}
                className="absolute left-0 bg-white shadow-2xl border border-slate-100 rounded-full p-1.5 flex gap-1 z-50"
              >
                {reactions.map((r) => (
                  <motion.button 
                    key={r.id} 
                    whileHover={{ scale: 1.4, y: -5 }}
                    onClick={() => handleReaction(r.id)}
                    className="p-2 hover:bg-slate-50 rounded-full"
                  >
                    {r.icon}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
          
          <button 
            onMouseEnter={() => setShowReactions(true)}
            onContextMenu={(e) => e.preventDefault()} // Prevents long-press menu
            onClick={() => handleReaction('like')}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all uppercase tracking-widest ${reaction ? reactions.find(r => r.id === reaction).color : 'text-slate-500 hover:bg-white'}`}
          >
            {reaction ? reactions.find(r => r.id === reaction).icon : <ThumbsUp size={16}/>}
            {reaction ? reactions.find(r => r.id === reaction).label : 'Like'}
          </button>
        </div>
        
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 hover:bg-white hover:shadow-sm rounded-xl text-slate-500 hover:text-fbNavy text-xs font-black uppercase"
        >
          <MessageSquare size={16}/> Comment
        </button>
        
        <button 
          onClick={() => setShowShareModal(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 hover:bg-white hover:shadow-sm rounded-xl text-slate-500 hover:text-fbNavy text-xs font-black uppercase"
        >
          <Share2 size={16}/> Share
        </button>
      </div>

      {/* REMAINDER OF YOUR CODE (Modals/Comments) REMAINS UNCHANGED */}
      <AnimatePresence>
        {showShareModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-black text-slate-800 uppercase text-sm">Share Post</h3>
                <button onClick={() => setShowShareModal(false)}><X size={20}/></button>
              </div>
              <div className="p-5">
                <textarea 
                  value={shareDescription}
                  onChange={(e) => setShareDescription(e.target.value)}
                  placeholder="Say something about this..." 
                  className="w-full h-24 p-3 bg-slate-50 rounded-xl text-sm focus:outline-none border-none resize-none"
                />
                <div className="mt-4 p-4 border rounded-2xl bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Original Post</p>
                  <p className="text-xs text-slate-600 line-clamp-3">{ann.content}</p>
                </div>
                <button onClick={handleFacebookShare} className="w-full mt-5 bg-fbNavy text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-fbNavy/90 transition-all shadow-lg">Share Now</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-slate-100 bg-slate-50/50 overflow-hidden">
            <div className="p-4 space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-lg bg-fbNavy text-white flex items-center justify-center text-[10px] font-bold overflow-hidden shrink-0 shadow-sm">
                    {instructor?.avatar_url ? <img src={instructor.avatar_url} className="w-full h-full object-cover" alt="me" /> : instructor?.full_name?.[0]}
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
                        {c.user?.[0]}
                    </div>
                    <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex-1">
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
