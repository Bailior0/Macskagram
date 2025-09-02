import React, { useEffect, useMemo, useState, useRef } from 'react';
import Button from '@enact/sandstone/Button';
import {Spottable} from '@enact/spotlight/Spottable';
import { auth } from '../services/firebase';
import { hasUserLiked, toggleLike } from '../services/likes';
import { deleteMedia } from '../services/images';
import CommentList from './CommentList';

const FocusableVideoBase = (props) => {
  const videoRef = useRef(null);

  const handleKeyDown = (ev) => {
    if (ev.keyCode === 13 && videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  return (
    <div
      {...props}
      onKeyDown={handleKeyDown}
      className={`focusable-video ${props.className || ''}`}
      style={{width: '100%', height: '100%'}}
    >
      <video
        ref={videoRef}
        src={props.src}
        controls
        tabIndex={-1}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    </div>
  );
};

const FocusableVideo = Spottable(FocusableVideoBase);

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

  const onDelete = async () => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a fájlt?')) return;
    try {
      await deleteMedia(item.id, item.storagePath);
      window.dispatchEvent(new CustomEvent('media:deleted', { detail: item.id }));
    } catch (e) {
      console.error('Törlés hiba', e);
      alert('Nem sikerült törölni a fájlt.');
    }
  };

  const caption = useMemo(() => item.caption || '', [item.caption]);

  return (
    <div style={{
      borderRadius: 12,
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
      background: 'var(--header-bg)',
      color: 'var(--text-color)',
      marginBottom: 20,
      display: 'block'
    }}>
      <div
        style={{
          width: '100%',
          height: 320,
          backgroundColor: 'var(--bg-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {item.type === 'video' ? (
          <FocusableVideo src={item.url} />
        ) : (
          <img
            src={item.url}
            alt={caption}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
      </div>

      <div style={{ padding: 12, fontSize: 18, color: 'var(--text-color)' }}>{caption}</div>

      <div style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button
            onClick={onLike}
            selected={liked}
            disabled={busy}
            size="small"
            aria-label={liked ? 'Tetszik visszavonása' : 'Tetszik'}
            className="themed-button"
          >
            {liked ? '❤️' : '🤍'} {count}
          </Button>
        </div>

        {uid === item.ownerId && (
          <Button
            icon="trash"
            onClick={onDelete}
            size="small"
            aria-label="Fájl törlése"
            className="themed-button danger-button"
          />
        )}
      </div>

      <CommentList imageId={item.id} />
    </div>
  );
}
