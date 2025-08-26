import React, {useEffect, useMemo, useState} from 'react';
import Button from '@enact/sandstone/Button';
import {auth} from '../services/firebase';
import {hasUserLiked, toggleLike} from '../services/likes';
import {addComment, subscribeComments} from '../services/comments';

export default function ImageCard({item}) {
  const user = auth.currentUser;
  const uid = user?.uid || null;

  // like state
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(item.likesCount || 0);
  const [busy, setBusy] = useState(false);

  // comment state
  const [comments, setComments] = useState([]);
  const quickComments = ['Cuki!', 'Imádom!', '😍', '😺', '👍'];

  // like status lekérés
  useEffect(() => {
    let alive = true;
    async function check() {
      if (!uid) { setLiked(false); return; }
      try {
        const v = await hasUserLiked(item.id, uid);
        if (alive) setLiked(v);
      } catch {}
    }
    check();
    return () => { alive = false; };
  }, [item.id, uid]);

  // külső likesCount változás
  useEffect(() => {
    setCount(item.likesCount || 0);
  }, [item.likesCount]);

  // kommentek streamelése
  useEffect(() => {
    if (!item.id) return;
    const unsub = subscribeComments(item.id, setComments);
    return () => unsub();
  }, [item.id]);

  // like kezelés
  const onLike = async () => {
    if (!uid || busy) return;
    setBusy(true);
    const prevLiked = liked;
    const prevCount = count;

    setLiked(!prevLiked);
    setCount(prevLiked ? Math.max(prevCount - 1, 0) : prevCount + 1);

    try {
      await toggleLike(item.id, uid);
    } catch (e) {
      setLiked(prevLiked);
      setCount(prevCount);
      console.warn('Like hiba:', e);
    } finally {
      setBusy(false);
    }
  };

  // gyors komment hozzáadása
  const onQuickComment = async (text) => {
    if (!uid) return;
    try {
      await addComment(item.id, uid, text);
    } catch (e) {
      console.warn('Komment hiba:', e);
    }
  };

  const caption = useMemo(() => item.caption || 'cica', [item.caption]);

  return (
    <div
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,.3)',
        display: 'grid',
        gridTemplateRows: 'auto auto auto auto'
      }}
    >
      <img
        src={item.url}
        alt={caption}
        style={{width: '100%', height: 220, objectFit: 'cover', display: 'block'}}
      />

      <div style={{padding: 12, fontSize: 18}}>{caption}</div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px'
      }}>
        <Button
          onClick={onLike}
          selected={liked}
          disabled={busy}
          size="small"
          aria-label={liked ? 'Tetszik visszavonása' : 'Tetszik'}
        >
          {liked ? '❤️ ' : '🤍 '}{count}
        </Button>
      </div>

      {/* Kommentek megjelenítése */}
      <div style={{padding: '8px 12px'}}>
        <div style={{marginBottom: 8, fontSize: 14, color: '#ccc'}}>
          Kommentek
        </div>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8}}>
          {quickComments.map((txt, i) => (
            <Button
              key={i}
              size="small"
              onClick={() => onQuickComment(txt)}
              aria-label={`Komment: ${txt}`}
            >
              {txt}
            </Button>
          ))}
        </div>
        <div style={{maxHeight: 100, overflowY: 'auto', fontSize: 14}}>
          {comments.length === 0 && <div style={{color: '#888'}}>Nincsenek kommentek</div>}
          {comments.map(c => (
            <div key={c.id} style={{marginBottom: 4}}>
              <span style={{fontWeight: 'bold'}}>{c.uid.slice(0,6)}:</span> {c.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
