import {useEffect, useState, useCallback} from 'react';
import Button from '@enact/sandstone/Button';
import Spinner from '@enact/sandstone/Spinner';
import {fetchImagesPage} from '../services/images';

const ImageCard = ({item}) => (
  <div
    tabIndex={0}
    style={{
      outline: 'none',
      borderRadius: 16,
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,.3)'
    }}
  >
    <img
      src={item.url}
      alt={item.caption || 'cica'}
      style={{width: '100%', height: 220, objectFit: 'cover', display: 'block'}}
    />
    <div style={{padding: 12, fontSize: 18}}>{item.caption}</div>
  </div>
);

export default function ImageGrid(props) {
  const [items, setItems] = useState([]);
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadPage = useCallback(async (after = null, replace = false) => {
    setLoading(true);
    try {
      const {items: page, lastDoc} = await fetchImagesPage({after});
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

  // esemény az újonnan feltöltött kép azonnali megjelenítéséhez
  useEffect(() => {
    const handler = (e) => {
      const doc = e.detail;
      setItems(prev => (prev.some(p => p.id === doc.id) ? prev : [doc, ...prev]));
    };
    window.addEventListener('image:uploaded', handler);
    return () => window.removeEventListener('image:uploaded', handler);
  }, []);

  return (
    <div {...props}>
      <div style={{display:'flex', gap:12, alignItems:'center', marginBottom:12}}>
        <Button onClick={refresh} disabled={loading}>Frissítés</Button>
        {loading && <Spinner />}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16
        }}
      >
        {items.map(it => <ImageCard key={it.id} item={it} />)}
      </div>

      <div style={{display:'flex', justifyContent:'center', marginTop: 24}}>
        {cursor && !loading && <Button onClick={loadMore}>További képek</Button>}
        {loading && <Spinner />}
      </div>
    </div>
  );
}
