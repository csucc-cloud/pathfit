import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ThumbsUp, MessageSquare, Share2, MoreHorizontal, 
  ShieldCheck, Globe, Clock, FileText, Send, X,
  Heart, Flame, ThumbsDown, Copy, Facebook, Twitter,
  Trash2, Edit3, Loader2, CheckCircle2, ExternalLink
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

// ─── Reaction definitions (now includes Wow + Sad) ───────────────────────────
const REACTIONS = [
  { id: 'like',    emoji: '👍', label: 'Like',  color: 'text-blue-500',   bg: 'bg-blue-50'   },
  { id: 'heart',   emoji: '❤️', label: 'Love',  color: 'text-rose-500',   bg: 'bg-rose-50'   },
  { id: 'fire',    emoji: '🔥', label: 'Fire',  color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'wow',     emoji: '😮', label: 'Wow',   color: 'text-yellow-500', bg: 'bg-yellow-50' },
  { id: 'sad',     emoji: '😢', label: 'Sad',   color: 'text-sky-400',    bg: 'bg-sky-50'    },
  { id: 'dislike', emoji: '👎', label: 'Bad',   color: 'text-slate-600',  bg: 'bg-slate-100' },
];

// ─── Emoji Reaction Picker ─────────────────────────────────────────────────
function ReactionPicker({ onSelect }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.88 }}
      animate={{ opacity: 1, y: 0,  scale: 1     }}
      exit ={{ opacity: 0, y: 10, scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      className="absolute bottom-[calc(100%+10px)] left-0 z-[120] bg-white border border-white/80 rounded-full px-3 py-2 flex gap-1 shadow-2xl shadow-slate-900/15 ring-1 ring-black/5"
    >
      {REACTIONS.map((r, i) => (
        <motion.button
          key={r.id}
          initial={{ opacity: 0, y: 8, scale: 0.6 }}
          animate={{ opacity: 1, y: 0, scale: 1   }}
          transition={{ delay: i * 0.035, type: 'spring', stiffness: 500, damping: 22 }}
          whileHover={{ scale: 1.55, y: -8 }}
          whileTap={{ scale: 0.85 }}
          onClick={() => onSelect(r.id)}
          className="relative w-10 h-10 flex items-center justify-center text-[22px] rounded-full cursor-pointer select-none focus:outline-none group"
          title={r.label}
        >
          {r.emoji}
          {/* tooltip */}
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[8px] font-black text-slate-500 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {r.label}
          </span>
        </motion.button>
      ))}
    </motion.div>
  );
}

// ─── Shared/Original Post Embed (Facebook-style) ──────────────────────────
function PostEmbed({ post }) {
  if (!post) return null;
  const authorName = post.instructors?.full_name || 'Instructor';
  const initial    = authorName[0]?.toUpperCase() || 'I';
  return (
    <div className="mt-4 border-[1.5px] border-slate-200 rounded-2xl overflow-hidden bg-slate-50/60 hover:bg-slate-50 transition-colors">
      {/* "Original Post" label */}
      <div className="flex items-center gap-1.5 px-4 pt-3 pb-1">
        <Share2 size={9} className="text-slate-400" />
        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em]">Original Post</span>
      </div>
      {/* Author row */}
      <div className="flex items-center gap-3 px-4 pb-2">
        <div className="w-7 h-7 rounded-lg bg-fbNavy text-white flex items-center justify-center text-[10px] font-black overflow-hidden shrink-0">
          {post.instructors?.avatar_url
            ? <img src={post.instructors.avatar_url} className="w-full h-full object-cover" alt=""/>
            : initial}
        </div>
        <div>
          <p className="text-[11px] font-black text-slate-800 uppercase tracking-tight leading-none">{authorName}</p>
          <p className="text-[9px] font-bold text-slate-400 mt-0.5">
            {post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}{post.target_section ? ` · ${post.target_section}` : ''}
          </p>
        </div>
      </div>
      {/* Content */}
      <div className="px-4 pb-3 border-t border-slate-200 pt-2 text-[12px] text-slate-600 leading-relaxed whitespace-pre-wrap">
        {post.content}
      </div>
      {/* Attached file if any */}
      {post.file_url && (
        ['jpg','jpeg','png','gif','webp'].includes(post.file_type?.toLowerCase())
          ? <img src={post.file_url} className="w-full max-h-[220px] object-cover border-t border-slate-200" alt=""/>
          : (
            <div className="border-t border-slate-200 px-4 py-3 flex items-center gap-3">
              <FileText size={15} className="text-fbNavy shrink-0" />
              <span className="text-[10px] font-bold uppercase text-fbNavy tracking-widest">Attached Resource</span>
            </div>
          )
      )}
    </div>
  );
}

// ─── Share Modal ────────────────────────────────────────────────────────────
// ─── Share Modal ────────────────────────────────────────────────────────────
function ShareModal({ ann, instructor, sharedPost, onClose, onPosted }) {
  const [shareDescription, setShareDescription] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!instructor?.id) return;
    setIsPosting(true);
    
    // THE FIX: We add .select(`*, instructors(*)`) to get the full object back immediately
    const { data, error } = await supabase
      .from('announcements')
      .insert([{
        content:        shareDescription,
        instructor_id:  instructor.id,
        parent_post_id: ann.id,
        target_section: ann.target_section,
      }])
      .select(`
        *,
        instructors (
          full_name,
          avatar_url
        )
      `)
      .single();

    setIsPosting(false);
    
    if (error) { 
      alert(error.message); 
      return; 
    }

    setShareDescription('');
    
    // Pass the newly created post (with instructor data) back to the parent list
    if (onPosted && data) {
      onPosted(data); 
    }
    
    onClose();
  };

  // The post we show inside the modal is the original source:
  const embedPost = sharedPost
    ? sharedPost
    : { 
        content: ann.content, 
        created_at: ann.created_at, 
        target_section: ann.target_section, 
        file_url: ann.file_url, 
        file_type: ann.file_type, 
        instructors: { 
          full_name: instructor?.full_name, 
          avatar_url: instructor?.avatar_url 
        } 
      };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-5 bg-slate-900/50 backdrop-blur-sm">
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 16 }}
          animate={{ scale: 1,    opacity: 1, y: 0  }}
          exit  ={{ scale: 0.92, opacity: 0, y: 16 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="bg-white rounded-[28px] w-full max-w-[460px] p-7 shadow-2xl shadow-slate-900/20"
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-[17px] font-black text-fbNavy uppercase tracking-tight">Share Post</h3>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
              <X size={15} className="text-slate-500" />
            </button>
          </div>

          {/* Composer row */}
          <div className="flex gap-3 items-start mb-4">
            <div className="w-9 h-9 rounded-xl bg-fbNavy text-white flex items-center justify-center text-[11px] font-black overflow-hidden shrink-0">
              {instructor?.avatar_url
                ? <img src={instructor.avatar_url} className="w-full h-full object-cover" alt=""/>
                : instructor?.full_name?.[0]}
            </div>
            <textarea
              value={shareDescription}
              onChange={e => setShareDescription(e.target.value)}
              placeholder="Say something about this post..."
              className="flex-1 bg-slate-50 border-[1.5px] border-transparent focus:border-fbNavy/20 focus:bg-white rounded-2xl p-3.5 text-[13px] font-medium text-slate-700 min-h-[88px] resize-none outline-none transition-all"
            />
          </div>

          {/* Original post embedded inside modal */}
          <PostEmbed post={embedPost} />

          {/* Post button */}
          <button
            onClick={handlePost}
            disabled={isPosting}
            className="mt-5 w-full bg-fbNavy text-white py-3.5 rounded-[14px] text-[11px] font-black uppercase tracking-[0.12em] flex items-center justify-center gap-2 hover:bg-fbOrange transition-colors shadow-lg shadow-fbNavy/20 disabled:opacity-60"
          >
            {isPosting ? <Loader2 size={15} className="animate-spin" /> : <Share2 size={15} />}
            {isPosting ? 'Posting...' : 'Post Share'}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Main PostCard ──────────────────────────────────────────────────────────
export default function PostCard({ ann, instructor }) {
  const [reaction, setReaction]           = useState(null);
  const [showReactions, setShowReactions] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showComments, setShowComments]   = useState(false);
  const [commentText, setCommentText]     = useState('');
  const [comments, setComments]           = useState([]);
  const [showMenu, setShowMenu]           = useState(false);
  const [isEditing, setIsEditing]         = useState(false);
  const [editContent, setEditContent]     = useState(ann?.content || '');
  const [isUpdating, setIsUpdating]       = useState(false);
  const [isDeleting, setIsDeleting]       = useState(false);
  const [isVisible, setIsVisible]         = useState(true);
  const [sharedPost, setSharedPost]       = useState(null);

  const reactionTimerRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: comms, error: commError } = await supabase
          .from('comments')
          .select('*')
          .eq('announcement_id', ann.id)
          .order('created_at', { ascending: false });

        if (comms) setComments(comms.map(c => ({ id: c.id, text: c.content, user: c.user_full_name, created_at: c.created_at })));
        if (commError) console.error('Fetch Error: ' + commError.message);

        if (instructor?.id) {
          const { data: react } = await supabase
            .from('reactions').select('type')
            .eq('announcement_id', ann.id)
            .eq('user_id', instructor.id)
            .maybeSingle();
          if (react) setReaction(react.type);
        }

        if (ann.parent_post_id) {
          const { data: parentData, error: pError } = await supabase
            .from('announcements')
            .select('*, instructors (full_name, avatar_url)')
            .eq('id', ann.parent_post_id)
            .maybeSingle();
          if (parentData) setSharedPost(parentData);
          if (pError) console.error('Share Fetch Error:', pError);
        }
      } catch (e) { console.error(e); }
    };
    if (ann.id) fetchData();
  }, [ann.id, instructor?.id, ann.parent_post_id]);

  const handleDeletePost = async () => {
    if (!window.confirm('Delete this announcement permanently?')) return;
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

  const handleReaction = async (type) => {
    if (!instructor?.id) return;
    const isRemoving = type === reaction;
    setReaction(isRemoving ? null : type);
    setShowReactions(false);
    if (isRemoving) {
      await supabase.from('reactions').delete().eq('announcement_id', ann.id).eq('user_id', instructor.id);
    } else {
      await supabase.from('reactions').upsert(
        { announcement_id: ann.id, user_id: instructor.id, type },
        { onConflict: 'announcement_id, user_id' }
      );
    }
  };

  const handleSendComment = async () => {
    if (!commentText.trim() || !instructor?.id) return;
    const { data } = await supabase
      .from('comments')
      .insert([{ announcement_id: ann.id, user_id: instructor.id, content: commentText, user_full_name: instructor.full_name }])
      .select().single();
    if (data) {
      setComments([{ id: data.id, text: data.content, user: data.user_full_name, created_at: data.created_at }, ...comments]);
      setCommentText('');
    }
  };

  const currentReaction = REACTIONS.find(r => r.id === reaction);

  // hover-delay helpers so picker doesn't vanish instantly
  const handleReactionMouseEnter = () => {
    clearTimeout(reactionTimerRef.current);
    setShowReactions(true);
  };
  const handleReactionMouseLeave = () => {
    reactionTimerRef.current = setTimeout(() => setShowReactions(false), 200);
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: isDeleting ? 0.5 : 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8, filter: 'blur(10px)', transition: { duration: 0.3 } }}
          className={`relative bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-6 group ${isDeleting ? 'pointer-events-none' : ''}`}
        >
          {/* Update progress bar */}
          {isUpdating && (
            <motion.div
              className="absolute top-0 left-0 h-1 bg-gradient-to-r from-fbNavy to-fbOrange z-[80]"
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}

          <div className="p-6">
            {/* ── Header ── */}
            <div className="flex justify-between items-start">
              <div className="flex gap-4">
                <motion.div whileHover={{ scale: 1.05 }} className="w-12 h-12 rounded-2xl bg-fbNavy p-0.5 shadow-lg shadow-fbNavy/20">
                  <div className="w-full h-full rounded-[14px] overflow-hidden bg-fbNavy flex items-center justify-center text-white font-black">
                    {instructor?.avatar_url
                      ? <img src={instructor.avatar_url} className="w-full h-full object-cover" alt="p"/>
                      : instructor?.full_name?.[0]}
                  </div>
                </motion.div>
                <div>
                  <h4 className="text-[15px] font-black text-slate-900 flex items-center gap-2">
                    {instructor?.full_name}
                    <ShieldCheck size={14} className="text-blue-500 fill-blue-500"/>
                  </h4>
                  <div className="flex items-center gap-2 mt-1 opacity-60">
                    <span className="text-[10px] font-bold flex items-center gap-1">
                      <Clock size={12}/> {ann?.created_at ? new Date(ann.created_at).toLocaleDateString() : 'Just now'}
                    </span>
                    <span className="text-[10px] font-black uppercase text-fbOrange px-2 py-0.5 bg-orange-50 rounded-md">
                      Section: {ann?.target_section || 'General'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ⋮ Menu */}
              <div className="relative">
                <button onClick={() => setShowMenu(!showMenu)} className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-2xl transition-all">
                  <MoreHorizontal size={20} className="text-slate-400" />
                </button>
                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white/80 backdrop-blur-xl border border-white shadow-2xl rounded-2xl z-[90] py-2 ring-1 ring-black/5"
                    >
                      <button onClick={() => { setIsEditing(true); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-xs font-bold text-slate-600 hover:bg-fbNavy hover:text-white flex items-center gap-3 transition-colors">
                        <Edit3 size={16} /> Edit Announcement
                      </button>
                      <button onClick={handleDeletePost} className="w-full px-4 py-2.5 text-left text-xs font-bold text-rose-500 hover:bg-rose-500 hover:text-white flex items-center gap-3 transition-colors">
                        <Trash2 size={16} /> Remove Post
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Body: edit mode or read mode ── */}
            {isEditing ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5 space-y-4">
                <textarea
                  value={editContent}
                  onChange={e => setEditContent(e.target.value)}
                  className="w-full p-4 bg-slate-50 rounded-2xl text-sm border-2 border-transparent focus:border-fbNavy/20 focus:bg-white outline-none min-h-[120px] transition-all"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleUpdatePost}
                    disabled={isUpdating}
                    className="flex-1 bg-fbNavy text-white py-3 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-fbNavy/20"
                  >
                    {isUpdating ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle2 size={16}/>}
                    {isUpdating ? 'Updating...' : 'Save Changes'}
                  </button>
                  <button onClick={() => setIsEditing(false)} className="px-6 bg-slate-100 text-slate-500 rounded-xl text-[11px] font-black uppercase hover:bg-slate-200 transition-colors">
                    Cancel
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                <motion.p layout className="mt-5 text-[16px] text-slate-700 leading-relaxed font-medium whitespace-pre-wrap selection:bg-fbNavy selection:text-white">
                  {ann?.content}
                </motion.p>

                {/* ── Facebook-style original post embed ── */}
                <PostEmbed post={sharedPost} />

                {/* ── File attachment ── */}
                {ann.file_url && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 border border-slate-100 rounded-[2rem] overflow-hidden bg-slate-50/50"
                  >
                    {['jpg','jpeg','png','gif','webp'].includes(ann.file_type?.toLowerCase()) ? (
                      <div className="relative group cursor-zoom-in">
                        <img src={ann.file_url} alt="Class Attachment" className="w-full h-auto max-h-[500px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"/>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"/>
                      </div>
                    ) : (
                      <a href={ann.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-5 hover:bg-white transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-fbNavy/10 text-fbNavy rounded-2xl flex items-center justify-center shadow-inner">
                            <FileText size={24}/>
                          </div>
                          <div>
                            <p className="text-xs font-black text-fbNavy uppercase tracking-widest">Attached Resource</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Format: {ann.file_type || 'Document'}</p>
                          </div>
                        </div>
                        <div className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-fbNavy group-hover:text-white group-hover:border-fbNavy transition-all">
                          <ExternalLink size={16}/>
                        </div>
                      </a>
                    )}
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* ── Action bar ── */}
          <div className="px-4 pb-4">
            <div className="bg-slate-50/80 backdrop-blur-md rounded-[24px] p-1.5 flex items-center gap-1">

              {/* REACT button + animated emoji picker */}
              <div
                className="flex-1 relative"
                onMouseEnter={handleReactionMouseEnter}
                onMouseLeave={handleReactionMouseLeave}
              >
                <AnimatePresence>
                  {showReactions && (
                    <ReactionPicker onSelect={handleReaction} />
                  )}
                </AnimatePresence>

                <button
                  onClick={() => reaction ? handleReaction(reaction) : handleReaction('like')}
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-[20px] text-[11px] font-black transition-all uppercase tracking-tighter no-system-menu
                    ${currentReaction ? `${currentReaction.bg} ${currentReaction.color}` : 'text-slate-400 hover:bg-white'}`}
                >
                  {currentReaction
                    ? <span className="text-[18px] leading-none">{currentReaction.emoji}</span>
                    : <ThumbsUp size={18}/>
                  }
                  {currentReaction ? currentReaction.label : 'React'}
                </button>
              </div>

              <button
                onClick={() => setShowComments(!showComments)}
                className="flex-1 flex items-center justify-center gap-2 py-3 hover:bg-white rounded-[20px] text-slate-400 hover:text-fbNavy text-[11px] font-black uppercase transition-all tracking-tighter"
              >
                <MessageSquare size={18}/>
                {comments.length > 0 ? `${comments.length} Comments` : 'Comment'}
              </button>

              <button
                onClick={() => setShowShareModal(true)}
                className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-[20px] text-slate-400 hover:text-fbOrange transition-all"
              >
                <Share2 size={18}/>
              </button>
            </div>
          </div>

          {/* ── Comments section ── */}
          <AnimatePresence>
            {showComments && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-slate-50 bg-slate-50/30"
              >
                <div className="p-6 space-y-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-fbNavy text-white flex items-center justify-center text-xs font-black shadow-lg shadow-fbNavy/20 shrink-0">
                      {instructor?.avatar_url
                        ? <img src={instructor.avatar_url} className="w-full h-full object-cover rounded-xl" alt="m"/>
                        : instructor?.full_name?.[0]}
                    </div>
                    <div className="flex-1 relative group">
                      <input
                        type="text"
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendComment()}
                        placeholder="Write a response..."
                        className="w-full bg-white border border-slate-100 rounded-2xl py-3 px-5 pr-12 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-fbNavy/5 transition-all shadow-sm"
                      />
                      <button onClick={handleSendComment} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-fbNavy text-white rounded-xl hover:bg-fbOrange transition-colors shadow-md">
                        <Send size={14}/>
                      </button>
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

          {/* ── Share Modal ── */}
          {showShareModal && (
            <ShareModal
              ann={ann}
              instructor={instructor}
              sharedPost={sharedPost}
              onClose={() => setShowShareModal(false)}
              onPosted={() => {}}
            />
          )}

          {/* ── Deleting overlay ── */}
          <AnimatePresence>
            {isDeleting && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-[100] bg-white/80 backdrop-blur-md flex items-center justify-center flex-col gap-4">
                <div className="relative">
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-12 h-12 border-4 border-fbNavy/10 border-t-fbNavy rounded-full"/>
                  <Trash2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-fbNavy" size={20}/>
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
