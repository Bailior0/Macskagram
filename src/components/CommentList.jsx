import {useEffect, useState} from 'react';
import Button from '@enact/sandstone/Button';
import Input from '@enact/sandstone/Input';
import Spinner from '@enact/sandstone/Spinner';
import {addComment, subscribeComments} from '../services/comments';
import {auth} from '../services/firebase';

export default function CommentList({imageId}) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const user = auth.currentUser;

  // kommentek betöltése real-time streammel
  useEffect(() => {
    if (!imageId) return;
    setLoading(true);
    const unsub = subscribeComments(imageId, (list) => {
      setComments(list);
      setLoading(false);
    });
    return () => unsub();
  }, [imageId]);

  // új komment beküldése
  const onSubmit = async () => {
    if (!text.trim() || !user) return;
    try {
      setBusy(true);
      await addComment(imageId, text.trim());
      setText('');
    } finally {
      setBusy(false);
    }
  };

  // ha túl sok komment van, vágjuk le
  const visibleComments = showAll ? comments : comments.slice(-3); 
  const extraCount = comments.length > 3 ? comments.length - 3 : 0;

  return (
    <div style={{marginTop: 12, padding: 8, borderTop: '1px solid rgba(255,255,255,.2)'}}>
      <h4 style={{margin: '4px 0'}}>Kommentek</h4>

      {loading ? <Spinner /> : (
        <div style={{display:'grid', gap: 6, marginBottom: 12}}>
          {comments.length === 0 && <div style={{opacity:0.7}}>Még nincs komment</div>}
          {visibleComments.map(c => (
            <div key={c.id} style={{background:'rgba(255,255,255,.05)', padding:6, borderRadius:8}}>
              <strong style={{fontSize:13, marginRight:6}}>
                {c.uid?.slice(0,6) || 'Anon'}:
              </strong>
              <span style={{fontSize:14, opacity:0.9}}>{c.text}</span>
            </div>
          ))}

          {/* ha van több komment, mutatunk egy "megnézés" gombot */}
          {!showAll && extraCount > 0 && (
            <Button 
              size="small" 
              onClick={() => setShowAll(true)} 
              style={{marginTop:4, fontSize:13}}
            >
              +{extraCount} további komment megtekintése
            </Button>
          )}

          {/* ha teljes nézetben vagyunk */}
          {showAll && comments.length > 3 && (
            <Button 
              size="small" 
              onClick={() => setShowAll(false)} 
              style={{marginTop:4, fontSize:13}}
            >
              Kevesebb megjelenítése
            </Button>
          )}
        </div>
      )}

      <div style={{display:'flex', gap:8, alignItems:'center'}}>
        <Input
          placeholder="Írj egy kommentet..."
          value={text}
          onChange={({value}) => setText(value)}
          style={{flex:1, minWidth:0}}
        />
        <Button
          onClick={onSubmit}
          disabled={busy || !text.trim()}
          style={{minWidth:120}}
        >
          Küldés
        </Button>
      </div>
    </div>
  );
}
