import React, { useEffect, useMemo, useState } from 'react';
import Button from '@enact/sandstone/Button';
import { auth } from '../services/firebase';
import { hasUserLiked, toggleLike } from '../services/likes';
import CommentList from './CommentList';

export default function ImageCard({ item }) {
  const user = auth.currentUser;
  const uid = user?.uid || null;

  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(item.likesCount || 0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!uid) { setLiked(false); return; }
      try {
        const v = await hasUserLiked(item.id, uid);
        if (alive) setLiked(v);
      } catch (e) {
        console.warn('hasUserLiked hiba', e);
      }
    })();
    return () => { alive = false; };
  }, [item.id, uid]);

  useEffect(() => {
    setCount(item.likesCount || 0);
  }, [item.likesCount]);

  const onLike = async () => {
    if (!uid || busy) return;
    setBusy(true);
    const prevLiked = liked;
    const prevCount = count;

    // optimista UI
    setLiked(!prevLiked);
    setCount(prevLiked ? Math.max(prevCount - 1, 0) : prevCount + 1);

    try {
      await toggleLike(item.id, uid);
    } catch (e) {
      setLiked(prevLiked);
      setCount(prevCount);
      console.warn('toggleLike hiba', e);
    } finally {
      setBusy(false);
    }
  };

  const caption = useMemo(() => item.caption || 'cica', [item.caption]);

  return (
    <div style={{
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
      background: 'linear-gradient(180deg,#0b0b0b,#020202)',
      color: '#fff',
      marginBottom: 20,
      display: 'block'
    }}>
      <div style={{ width: '100%', height: 320, backgroundColor: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={item.url}
          alt={caption}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      </div>

      <div style={{ padding: 12, fontSize: 18, color: '#fff' }}>{caption}</div>

      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button
            onClick={onLike}
            selected={liked}
            disabled={busy}
            size="small"
            aria-label={liked ? 'Tetszik visszavonása' : 'Tetszik'}
          >
            {liked ? '❤️' : '🤍'} {count}
          </Button>
        </div>
        {/* hely a jövőbeli gomboknak (pl. megosztás) */}
      </div>

      {/* Komment lista: klasszikus szövegbevitellel */}
      <CommentList imageId={item.id} />
    </div>
  );
}
