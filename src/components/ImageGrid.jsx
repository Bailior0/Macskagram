import { useEffect, useState, useCallback } from 'react';
import Button from '@enact/sandstone/Button';
import Spinner from '@enact/sandstone/Spinner';
import { fetchImagesPage } from '../services/images';
import ImageCard from './ImageCard';

export default function ImageGrid(props) {
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadPage = useCallback(async (after = null, replace = false) => {
    setLoading(true);
    try {
      const { items: page, lastDoc } = await fetchImagesPage({ after });
      setItems(prev => replace ? page : [...prev, ...page]);
      setCursor(lastDoc);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setCursor(null);
    await loadPage(null, true);
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    await loadPage(cursor, false);
  }, [cursor, loading, loadPage]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    const handler = (e) => {
      const doc = e.detail;
      setItems(prev => (prev.some(p => p.id === doc.id) ? prev : [doc, ...prev]));
    };
    window.addEventListener('image:uploaded', handler);
    return () => window.removeEventListener('image:uploaded', handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const deletedId = e.detail;
      setItems(prev => prev.filter(p => p.id !== deletedId));
    };
    window.addEventListener('image:deleted', handler);
    return () => window.removeEventListener('image:deleted', handler);
  }, []);

  return (
    <div
      {...props}
      style={{
        backgroundColor: 'var(--bg-color)',
        minHeight: '100vh',
        paddingBottom: 48
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <Button onClick={refresh} disabled={loading} className="themed-button">Frissítés</Button>
        {loading && <Spinner />}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: 20
      }}>
        {items.map(it => <ImageCard key={it.id} item={it} />)}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        {cursor && !loading && <Button onClick={loadMore} className="themed-button">További képek</Button>}
        {loading && <Spinner />}
      </div>
    </div>
  );
}
