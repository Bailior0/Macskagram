import React, {useEffect, useMemo, useState} from 'react';
import Button from '@enact/sandstone/Button';
import {auth} from '../services/firebase';
import {hasUserLiked, toggleLike} from '../services/likes';

export default function ImageCard({item}) {
  const user = auth.currentUser;
  const uid = user?.uid || null;

  // státuszok
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(item.likesCount || 0);
  const [busy, setBusy] = useState(false);

  // ha új item érkezik (vagy user vált), lekérdezzük, like-olta-e
  useEffect(() => {
    let alive = true;
    async function check() {
      if (!uid) { setLiked(false); return; }
      try {
        const v = await hasUserLiked(item.id, uid);
        if (alive) setLiked(v);
      } catch {
        // lenyeljük – UI szempontból nem kritikus
      }
    }
    check();
    return () => { alive = false; };
  }, [item.id, uid]);

  // ha kívülről változna a likesCount (pl. refresh), vegyük át
  useEffect(() => {
    setCount(item.likesCount || 0);
  }, [item.likesCount]);

  // lájk gomb kezelése (optimista UI-val)
  const onLike = async () => {
    if (!uid || busy) return;
    setBusy(true);
    const prevLiked = liked;
    const prevCount = count;

    // optimista frissítés
    setLiked(!prevLiked);
    setCount(prevLiked ? Math.max(prevCount - 1, 0) : prevCount + 1);

    try {
      await toggleLike(item.id, uid);
      // siker esetén nincs teendő: a tranzakció konzisztens volt
    } catch (e) {
      // visszagörgetjük, ha hiba
      setLiked(prevLiked);
      setCount(prevCount);
      console.warn('Like hiba:', e);
    } finally {
      setBusy(false);
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
        gridTemplateRows: 'auto auto auto'
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
        {/* A Sandstone Button spottolható → távirányítóval fókuszolható */}
        <Button
          onClick={onLike}
          selected={liked}
          disabled={busy}
          // TV-n jól látható/nyomható legyen
          size="small"
          aria-label={liked ? 'Tetszik visszavonása' : 'Tetszik'}
        >
          {liked ? '❤️ ' : '🤍 '}{count}
        </Button>

        {/* további akciók (komment, törlés, stb.) */}
      </div>
    </div>
  );
}
