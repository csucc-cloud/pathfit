import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ThumbsUp, MessageSquare, Share2, MoreHorizontal, 
  ShieldCheck, Globe, Clock, FileText, Send, X,
  Heart, Flame, ThumbsDown, Copy, Facebook, Twitter,
  Trash2, Edit3, Loader2
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
  const [showMenu, setShowMenu] = useState(false);

  // New states for Edit/Delete functionality
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(ann?.content || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Animation variants for Telegram-like feel
  const floatingEmoji = {
    initial: { scale: 0, y: 20 },
    animate: { scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 15 } },
    hover: { scale: 1.4, y: -8, rotate: [0, -10, 10, 0], transition: { duration: 0.3 } }
  };

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

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    
    setIsDeleting(true);
    const { error } = await supabase
      .from('announcements')
      .delete()
      .eq('id', ann.id);

    if (error) {
      alert("Delete Error: " + error.message);
      setIsDeleting(false);
    } else {
      setIsVisible(false);
    }
  };

  const handleUpdatePost = async () => {
    if (!editContent.trim()) return;

    setIsUpdating(true);
    const { error } = await supabase
      .from('announcements')
      .update({ content: editContent })
      .eq('id', ann.id);

    if (error) {
      alert("Update Error: " + error.message);
      setIsUpdating(false);
    } else {
      setIsEditing(false);
      setIsUpdating(false);
      setShowMenu(false);
      ann.content = editContent; 
    }
  };

  const reactions = [
    { id: 'like', icon: <ThumbsUp size={18} className="text-blue-500 fill-blue-500" />, label: 'Like', color: 'text-blue-500', burst: "bg-blue-400" },
    { id: 'heart', icon: <Heart size={18} className="text-red-500 fill-red-500" />, label: 'Love', color: 'text-red-500', burst: "bg-red-400" },
    { id: 'fire', icon: <Flame size={18} className="text-orange-500 fill-orange-500" />, label: 'Fire', color: 'text-orange-500', burst: "bg-orange-400" },
    { id: 'dislike', icon: <ThumbsDown size={18} className="text-slate-500 fill-slate-500" />, label: 'Dislike', color: 'text-slate-500', burst: "bg-slate-400" },
  ];

  const handleReaction = async (type) => {
    if (!instructor?.id) return alert("Error: Instructor ID is missing.");
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
    if (error) { setReaction(previousReaction); alert("Database Reaction Error: " + error.message); }
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
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: isDeleting ? 0.6 : 1, y: 0, scale: isDeleting ? 0.98 : 1 }} 
          exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)", transition: { duration: 0.3 } }}
          layout
          className={`bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all duration-500 mb-6 group relative ${isDeleting ? 'pointer-events-none' : ''}`}
        >
          {/* Deleting Overlay */}
          <AnimatePresence>
            {isDeleting && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="absolute inset-0 z-[70] bg-white/40 backdrop-blur-md flex items-center justify-center flex-col gap-3"
              >
                <div className="relative">
                   <Loader2 className="animate-spin text-fbNavy" size={32} />
                   <motion.div 
                     animate={{ scale: [1, 1.2, 1] }} 
                     transition={{ repeat: Infinity, duration: 2 }}
                     className="absolute inset-0 bg-fbNavy/10 blur-xl rounded-full"
                   />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-fbNavy animate-pulse">Removing Post</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <motion.div 
                  whileHover={{ scale: 1.05 }}
                  className="w-12 h-12 rounded-2xl bg-fbNavy flex items-center justify-center text-white text-lg font-bold overflow-hidden shadow-lg shadow-fbNavy/20 ring-4 ring-slate-50"
                >
                   {instructor?.avatar_url ? <img src={instructor.avatar_url} className="w-full h-full object-cover" alt="prof"/> : instructor?.full_name?.[0]}
                </motion.div>
                <div>
                  <h4 className="text-[15px] font-black text-slate-900 flex items-center gap-2">
                    {instructor?.full_name} 
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                        <ShieldCheck size={12} className="text-blue-500 fill-blue-500 text-white"/>
                        <span className="text-[9px] text-blue-600 uppercase font-black">Verified</span>
                    </motion.div>
                  </h4>
                  <div className="flex items-center gap-3 mt-1.5">
                    <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-md">
                        <Clock size={12} className="text-slate-300"/> {ann?.created_at ? new Date(ann.created_at).toLocaleDateString() : 'Just now'}
                    </p>
                    <p className="text-[10px] text-fbOrange font-black uppercase flex items-center gap-1.5 bg-orange-50 px-2 py-0.5 rounded-md">
                        <Globe size={12} className="text-fbOrange/50"/> {ann?.target_section || "Global Access"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative" onMouseLeave={() => setShowMenu(false)}>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2.5 hover:bg-slate-100 rounded-xl transition-all active:scale-90"
                >
                  <MoreHorizontal size={20} className="text-slate-400" />
                </button>
                
                <AnimatePresence>
                  {showMenu && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, y: -10, filter: "blur(4px)" }}
                      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, scale: 0.9, y: -10, filter: "blur(4px)" }}
                      className="absolute right-0 mt-2 w-44 bg-white/80 backdrop-blur-xl border border-slate-200/50 shadow-2xl rounded-2xl z-[60] py-2 overflow-hidden ring-1 ring-black/5"
                    >
                      <button 
                        onClick={() => { setIsEditing(true); setShowMenu(false); }}
                        className="w-full px-4 py-2.5 text-left text-[11px] font-black text-slate-600 hover:bg-fbNavy hover:text-white transition-colors flex items-center gap-3"
                      >
                        <Edit3 size={14} /> EDIT POST
                      </button>
                      <div className="h-[1px] bg-slate-100 my-1 mx-2" />
                      <button 
                        onClick={handleDeletePost}
                        className="w-full px-4 py-2.5 text-left text-[11px] font-black text-red-500 hover:bg-red-500 hover:text-white transition-colors flex items-center gap-3"
                      >
                        <Trash2 size={14} /> DELETE POST
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* POST CONTENT */}
            <div className="mt-5">
              {isEditing ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <textarea 
                    value={editContent}
                    disabled={isUpdating}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-4 bg-slate-50 rounded-2xl text-[14px] border-2 border-transparent focus:border-fbNavy focus:bg-white transition-all outline-none min-h-[120px] font-medium text-slate-700"
                  />
                  <div className="flex gap-2">
                    <button 
                      disabled={isUpdating}
                      onClick={handleUpdatePost} 
                      className="bg-fbNavy text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-lg shadow-fbNavy/20 active:scale-95 transition-transform"
                    >
                      {isUpdating && <Loader2 size={14} className="animate-spin"/>}
                      {isUpdating ? 'Updating...' : 'Save Changes'}
                    </button>
                    <button 
                      disabled={isUpdating}
                      onClick={() => setIsEditing(false)} 
                      className="bg-slate-100 text-slate-500 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              ) : (
                <p className="text-[15px] text-slate-700 leading-[1.6] font-medium whitespace-pre-wrap">{ann?.content}</p>
              )}
            </div>
          </div>

          {/* ACTION BAR */}
          <div className="px-4 pb-4">
            <div className="bg-slate-50/80 backdrop-blur-sm rounded-2xl p-1 flex items-center justify-between gap-1 relative select-none">
              <div className="flex-1 relative" onMouseLeave={() => setShowReactions(false)}>
                <AnimatePresence>
                  {showReactions && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.8 }} 
                      animate={{ opacity: 1, y: -65, scale: 1 }} 
                      exit={{ opacity: 0, y: 10, scale: 0.8 }}
                      className="absolute left-0 bg-white/90 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] border border-white rounded-[20px] p-2 flex gap-2 z-50 ring-1 ring-black/5"
                    >
                      {reactions.map((r) => (
                        <motion.button 
                          key={r.id} 
                          variants={floatingEmoji}
                          initial="initial"
                          animate="animate"
                          whileHover="hover"
                          onClick={() => handleReaction(r.id)}
                          className="relative p-2.5 hover:bg-slate-50 rounded-xl transition-colors group"
                        >
                          {r.icon}
                          <motion.div 
                            className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${r.burst} opacity-0 group-hover:opacity-100`}
                            animate={{ scale: [1, 1.5, 1] }}
                            transition={{ repeat: Infinity }}
                          />
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <button 
                  onMouseEnter={() => setShowReactions(true)}
                  onClick={() => handleReaction('like')}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[11px] font-black transition-all uppercase tracking-wider ${reaction ? reactions.find(r => r.id === reaction).color + ' bg-white shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}
                >
                  <motion.div animate={reaction ? { scale: [1, 1.4, 1] } : {}}>
                    {reaction ? reactions.find(r => r.id === reaction).icon : <ThumbsUp size={18} className="opacity-70"/>}
                  </motion.div>
                  {reaction ? reactions.find(r => r.id === reaction).label : 'Like'}
                </button>
              </div>
              
              <button 
                onClick={() => setShowComments(!showComments)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-slate-500 hover:text-fbNavy text-[11px] font-black uppercase tracking-wider transition-all ${showComments ? 'bg-white shadow-sm text-fbNavy' : 'hover:bg-white/50'}`}
              >
                <MessageSquare size={18} className="opacity-70"/> Comment
              </button>
              
              <button 
                onClick={() => setShowShareModal(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-slate-500 hover:text-fbNavy text-[11px] font-black uppercase tracking-wider transition-all hover:bg-white/50"
              >
                <Share2 size={18} className="opacity-70"/> Share
              </button>
            </div>
          </div>

          {/* SHARE MODAL */}
          <AnimatePresence>
            {showShareModal && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                  animate={{ scale: 1, opacity: 1, y: 0 }} 
                  exit={{ scale: 0.9, opacity: 0, y: 20 }} 
                  className="bg-white rounded-[32px] w-full max-w-md overflow-hidden shadow-2xl border border-white"
                >
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Forward Announcement</h3>
                    <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20}/></button>
                  </div>
                  <div className="p-8">
                    <textarea 
                      value={shareDescription}
                      onChange={(e) => setShareDescription(e.target.value)}
                      placeholder="Add a comment to this share..." 
                      className="w-full h-32 p-4 bg-slate-50 rounded-2xl text-sm focus:outline-none border-2 border-transparent focus:border-fbNavy transition-all resize-none"
                    />
                    <button 
                      onClick={handleFacebookShare} 
                      className="w-full mt-6 bg-fbNavy text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:shadow-xl hover:shadow-fbNavy/30 active:scale-95 transition-all"
                    >
                      Share Post Now
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* COMMENTS SECTION */}
          <AnimatePresence>
            {showComments && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }} 
                className="border-t border-slate-100 bg-slate-50/30 overflow-hidden"
              >
                <div className="p-6 space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-fbNavy text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-md shadow-fbNavy/20">
                        {instructor?.avatar_url ? <img src={instructor.avatar_url} className="w-full h-full object-cover" alt="me" /> : instructor?.full_name?.[0]}
                    </div>
                    <div className="flex-1 relative group">
                        <input 
                          type="text" 
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Write your thoughts..." 
                          className="w-full bg-white border border-slate-200 rounded-2xl py-3 px-5 pr-12 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-fbNavy/5 transition-all"
                        />
                        <button 
                          onClick={handleSendComment} 
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-fbNavy hover:bg-fbNavy hover:text-white rounded-xl transition-all"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {comments.map((c, i) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: i * 0.05 }}
                        key={c.id} 
                        className="flex gap-4"
                      >
                        <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-black shrink-0 border-2 border-white">
                            {c.user?.[0]}
                        </div>
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex-1">
                            <p className="text-[10px] font-black text-fbNavy uppercase tracking-tighter">{c.user}</p>
                            <p className="text-[13px] text-slate-600 mt-1 font-medium leading-relaxed">{c.text}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
