import {useEffect, useState} from 'react';
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

  const load = async () => {
    setLoading(true);
    const {items: page, lastDoc} = await fetchImagesPage({after: cursor});
    setItems(prev => [...prev, ...page]);
    setCursor(lastDoc);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div {...props}>
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
        {cursor && !loading && <Button onClick={load}>További képek</Button>}
        {loading && <Spinner />}
      </div>
    </div>
  );
}
