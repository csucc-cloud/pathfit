import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ThumbsUp, MessageSquare, Share2, MoreHorizontal, 
  ShieldCheck, Globe, Clock, FileText, Send, X,
  Heart, Flame, ThumbsDown, Copy, Facebook, Twitter,
  Trash2, Edit3, Loader2, CheckCircle2, ExternalLink
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

  // High-End UI States
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(ann?.content || "");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Shared Post State
  const [sharedPost, setSharedPost] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: comms, error: commError } = await supabase
          .from('comments')
          .select('*')
          .eq('announcement_id', ann.id)
          .order('created_at', { ascending: false });
        
        if (comms) setComments(comms.map(c => ({ id: c.id, text: c.content, user: c.user_full_name, created_at: c.created_at })));
        if (commError) alert("Fetch Error: " + commError.message);

        if (instructor?.id) {
          const { data: react } = await supabase.from('reactions').select('type').eq('announcement_id', ann.id).eq('user_id', instructor.id).maybeSingle(); 
          if (react) setReaction(react.type);
        }

        // Logic to fetch the original post if this is a share
        if (ann.parent_post_id) {
          const { data: parentData } = await supabase
            .from('announcements')
            .select(`
              *,
              instructors (full_name, avatar_url)
            `)
            .eq('id', ann.parent_post_id)
            .single();
          if (parentData) setSharedPost(parentData);
        }
      } catch (e) { console.error(e); }
    };
    if (ann.id) fetchData();
  }, [ann.id, instructor?.id, ann.parent_post_id]);

  const handleDeletePost = async () => {
    if (!window.confirm("Delete this announcement permanently?")) return;
    setIsDeleting(true);
    const { error } = await supabase.from('announcements').delete().eq('id', ann.id);
    if (error) { setIsDeleting(false); alert(error.message); } 
    else { setIsVisible(false); }
  };

  const handleUpdatePost = async () => {
    if (!editContent.trim()) return;
    setIsUpdating(true);
    const { error } = await supabase.from('announcements').update({ content: editContent }).eq('id', ann.id);
    if (error) { alert(error.message); setIsUpdating(false); } 
    else { 
      setTimeout(() => {
        setIsEditing(false); setIsUpdating(false); setShowMenu(false); ann.content = editContent; 
      }, 600);
    }
  };

  const reactions = [
    { id: 'like', icon: <ThumbsUp size={20} />, label: 'Like', color: 'text-blue-500', bg: 'bg-blue-50', fill: 'fill-blue-500' },
    { id: 'heart', icon: <Heart size={20} />, label: 'Love', color: 'text-rose-500', bg: 'bg-rose-50', fill: 'fill-rose-500' },
    { id: 'fire', icon: <Flame size={20} />, label: 'Fire', color: 'text-orange-500', bg: 'bg-orange-50', fill: 'fill-orange-500' },
    { id: 'dislike', icon: <ThumbsDown size={20} />, label: 'Bad', color: 'text-slate-600', bg: 'bg-slate-100', fill: 'fill-slate-600' },
  ];

  const handleReaction = async (type) => {
    if (!instructor?.id) return;
    const isRemoving = type === reaction;
    setReaction(isRemoving ? null : type);
    setShowReactions(false);
    if (isRemoving) await supabase.from('reactions').delete().eq('announcement_id', ann.id).eq('user_id', instructor.id);
    else await supabase.from('reactions').upsert({ announcement_id: ann.id, user_id: instructor.id, type }, { onConflict: 'announcement_id, user_id' });
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !instructor?.id) return;
    const { data } = await supabase.from('comments').insert([{ announcement_id: ann.id, user_id: instructor.id, content: commentText, user_full_name: instructor.full_name }]).select().single();
    if (data) { setComments([{ id: data.id, text: data.content, user: data.user_full_name, created_at: data.created_at }, ...comments]); setCommentText(""); }
  };

  const handleFacebookShare = async () => {
    // This creates a new announcement that points to the original one
    const { error } = await supabase.from('announcements').insert([{ 
      content: shareDescription, 
      instructor_id: instructor.id,
      parent_post_id: ann.id, // Linking back to original
      target_section: ann.target_section
    }]);
    if (!error) setShowShareModal(false);
    else alert(error.message);
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div 
          layout
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: isDeleting ? 0.5 : 1, scale: 1 }} 
          exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)", transition: { duration: 0.3 } }}
          className={`relative bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-6 group ${isDeleting ? 'pointer-events-none' : ''}`}
        >
          {isUpdating && <motion.div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-fbNavy to-fbOrange z-[80]" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1, repeat: Infinity }} />}

          <div className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <motion.div whileHover={{ scale: 1.05 }} className="w-12 h-12 rounded-2xl bg-fbNavy p-0.5 shadow-lg shadow-fbNavy/20">
                   <div className="w-full h-full rounded-[14px] overflow-hidden bg-fbNavy flex items-center justify-center text-white font-black">
                     {instructor?.avatar_url ? <img src={instructor.avatar_url} className="w-full h-full object-cover" alt="p"/> : instructor?.full_name?.[0]}
                   </div>
                </motion.div>
                <div>
                  <h4 className="text-[15px] font-black text-slate-900 flex items-center gap-2">
                    {instructor?.full_name} 
                    <ShieldCheck size={14} className="text-blue-500 fill-blue-500 text-white"/>
                  </h4>
                  <div className="flex items-center gap-2 mt-1 opacity-60">
                    <span className="text-[10px] font-bold flex items-center gap-1"><Clock size={12}/> {ann?.created_at ? new Date(ann.created_at).toLocaleDateString() : 'Just now'}</span>
                    <span className="text-[10px] font-black uppercase text-fbOrange px-2 py-0.5 bg-orange-50 rounded-md">
                      Section: {ann?.target_section || "General"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-2xl transition-all"><MoreHorizontal size={20} className="text-slate-400" /></button>
                <AnimatePresence>
                  {showMenu && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 mt-2 w-48 bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-2xl z-[90] py-2 ring-1 ring-black/5">
                      <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-600 hover:bg-fbNavy hover:text-white flex items-center gap-3 transition-colors"><Edit3 size={16} /> Edit Announcement</button>
                      <button onClick={handleDeletePost} className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-500 hover:bg-rose-500 hover:text-white flex items-center gap-3 transition-colors"><Trash2 size={16} /> Remove Post</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {isEditing ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 space-y-4">
                <textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl text-sm border-2 border-transparent focus:border-fbNavy/20 focus:bg-white outline-none min-h-[120px] transition-all" />
                <div className="flex gap-2">
                  <button onClick={handleUpdatePost} disabled={isUpdating} className="flex-1 bg-fbNavy text-white py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-fbNavy/20">
                    {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    {isUpdating ? 'Updating...' : 'Save Changes'}
                  </button>
                  <button onClick={() => setIsEditing(false)} className="px-6 bg-slate-100 text-slate-500 rounded-xl text-[11px] font-black uppercase hover:bg-slate-200 transition-colors">Cancel</button>
                </div>
              </motion.div>
            ) : (
              <>
                <motion.p layout className="mt-5 text-[16px] text-slate-700 leading-relaxed font-medium whitespace-pre-wrap selection:bg-fbNavy selection:text-white">{ann?.content}</motion.p>
                
                {/* NESTED SHARED POST CARD (The Facebook Style) */}
                {sharedPost && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 border border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50 p-4 transition-all hover:bg-slate-50 group/shared"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-fbNavy text-white flex items-center justify-center text-[10px] font-black">
                        {sharedPost.instructors?.avatar_url ? (
                          <img src={sharedPost.instructors.avatar_url} className="w-full h-full object-cover rounded-lg" />
                        ) : sharedPost.instructors?.full_name?.[0]}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{sharedPost.instructors?.full_name}</p>
                        <p className="text-[9px] font-bold text-slate-400">{new Date(sharedPost.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-3 whitespace-pre-wrap">{sharedPost.content}</p>
                    
                    {sharedPost.file_url && (
                      <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
                        {['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(sharedPost.file_type?.toLowerCase()) ? (
                          <img src={sharedPost.file_url} className="w-full h-auto max-h-[250px] object-cover" />
                        ) : (
                          <div className="p-3 flex items-center gap-3">
                            <FileText size={18} className="text-fbNavy" />
                            <span className="text-[10px] font-bold uppercase text-fbNavy">View Attached Resource</span>
                          </div>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* ATTACHMENT RENDERING SYSTEM (Directly on this post) */}
                {ann.file_url && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 border border-slate-100 rounded-[2rem] overflow-hidden bg-slate-50/50"
                  >
                    {['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ann.file_type?.toLowerCase()) ? (
                      <div className="relative group cursor-zoom-in">
                        <img 
                          src={ann.file_url} 
                          alt="Class Attachment" 
                          className="w-full h-auto max-h-[500px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                      </div>
                    ) : (
                      <a 
                        href={ann.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-5 hover:bg-white transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-fbNavy/10 text-fbNavy rounded-2xl flex items-center justify-center shadow-inner">
                            <FileText size={24} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-fbNavy uppercase tracking-widest">Attached Resource</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Format: {ann.file_type || 'Document'}</p>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-fbNavy group-hover:text-white group-hover:border-fbNavy transition-all">
                          <ExternalLink size={16} />
                        </div>
                      </a>
                    )}
                  </motion.div>
                )}
              </>
            )}
          </div>

          <div className="px-4 pb-4">
            <div className="bg-slate-50/80 backdrop-blur-md rounded-[24px] p-1.5 flex items-center gap-1">
              <div className="flex-1 relative" onMouseLeave={() => setShowReactions(false)}>
                <AnimatePresence>
                  {showReactions && (
                    <motion.div initial={{ opacity: 0, y: 10, scale: 0.5 }} animate={{ opacity: 1, y: -65, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.8 }} className="absolute left-0 bottom-full bg-white/90 backdrop-blur-xl shadow-2xl border border-white rounded-full p-2 flex gap-2 z-[100] mb-2 ring-1 ring-black/5">
                      {reactions.map((r) => (
                        <motion.button key={r.id} whileHover={{ scale: 1.5, y: -10, rotate: [0, -10, 10, 0] }} whileTap={{ scale: 0.8 }} onClick={() => handleReaction(r.id)} className={`p-3 rounded-full ${r.bg} ${r.color} transition-colors shadow-sm`}>{r.icon}</motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                
                <button 
                  onMouseEnter={() => setShowReactions(true)} 
                  onContextMenu={(e) => e.preventDefault()}
                  onClick={() => handleReaction('like')} 
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-[20px] text-[11px] font-black transition-all uppercase tracking-tighter no-system-menu ${reaction ? reactions.find(r => r.id === reaction).bg + " " + reactions.find(r => r.id === reaction).color : 'text-slate-400 hover:bg-white'}`}
                >
                  {reaction ? React.cloneElement(reactions.find(r => r.id === reaction).icon, { className: reactions.find(r => r.id === reaction).fill }) : <ThumbsUp size={18}/>}
                  {reaction ? reactions.find(r => r.id === reaction).label : 'React'}
                </button>
              </div>
              
              <button onClick={() => setShowComments(!showComments)} className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-white rounded-[20px] text-slate-400 hover:text-fbNavy text-[11px] font-black uppercase transition-all tracking-tighter">
                <MessageSquare size={18}/> {comments.length > 0 ? `${comments.length} Comments` : 'Comment'}
              </button>
              
              <button onClick={() => setShowShareModal(true)} className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-[20px] text-slate-400 hover:text-fbOrange transition-all">
                <Share2 size={18}/>
              </button>
            </div>
          </div>

          {/* SHARE MODAL COMPONENT */}
          <AnimatePresence>
            {showShareModal && (
              <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-sm">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl overflow-hidden relative">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-fbNavy uppercase tracking-tight">Share Post</h3>
                    <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
                  </div>
                  
                  <textarea 
                    value={shareDescription} 
                    onChange={(e) => setShareDescription(e.target.value)} 
                    placeholder="Write a caption for this share..." 
                    className="w-full p-4 bg-slate-50 border-none rounded-2xl text-sm min-h-[120px] mb-6 focus:ring-2 focus:ring-fbNavy/10"
                  />
                  
                  {/* Preview of the post being shared */}
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 mb-6">
                    <div className="flex gap-3 items-center mb-2">
                       <div className="w-8 h-8 bg-fbNavy rounded-lg flex items-center justify-center text-white font-black text-[10px]">{instructor?.full_name?.[0]}</div>
                       <p className="text-[10px] font-black text-fbNavy uppercase">{instructor?.full_name}</p>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{ann.content}</p>
                  </div>

                  <button onClick={handleFacebookShare} className="w-full py-4 bg-fbNavy text-white rounded-2xl font-black uppercase tracking-widest hover:bg-fbOrange transition-all shadow-lg shadow-fbNavy/20">Post Share</button>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showComments && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="border-t border-slate-50 bg-slate-50/30">
                <div className="p-6 space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-fbNavy text-white flex items-center justify-center text-xs font-black shadow-lg shadow-fbNavy/20 shrink-0">
                        {instructor?.avatar_url ? <img src={instructor.avatar_url} className="w-full h-full object-cover rounded-xl" alt="m" /> : instructor?.full_name?.[0]}
                    </div>
                    <div className="flex-1 relative group">
                        <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a response..." className="w-full bg-white border border-slate-100 rounded-2xl py-3 px-5 pr-12 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-fbNavy/5 transition-all shadow-sm" />
                        <button onClick={handleSendComment} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-fbNavy text-white rounded-xl hover:bg-fbOrange transition-colors shadow-md"><Send size={14} /></button>
                    </div>
                  </div>

                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {comments.map(c => (
                      <motion.div layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} key={c.id} className="flex gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-black shrink-0">{c.user?.[0]}</div>
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm flex-1">
                            <p className="text-[10px] font-black text-fbNavy uppercase tracking-widest mb-1">{c.user}</p>
                            <p className="text-[13px] text-slate-600 leading-snug">{c.text}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isDeleting && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-[100] bg-white/80 backdrop-blur-md flex items-center justify-center flex-col gap-4">
                <div className="relative">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-fbNavy/10 border-t-fbNavy rounded-full" />
                  <Trash2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-fbNavy" size={20} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-fbNavy animate-pulse">Archiving Announcement...</span>
              </motion.div>
            )}
          </AnimatePresence>

          <style jsx global>{`
            .no-system-menu {
              -webkit-touch-callout: none !important;
              -webkit-user-select: none !important;
              user-select: none !important;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
