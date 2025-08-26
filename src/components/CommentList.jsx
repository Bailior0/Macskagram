import {useEffect, useState} from 'react';
import Button from '@enact/sandstone/Button';
import Input from '@enact/sandstone/Input';
import Spinner from '@enact/sandstone/Spinner';
import {addComment, fetchComments} from '../services/comments';

export default function CommentList({imageId}) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  // kommentek betöltése
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const list = await fetchComments(imageId);
        setComments(list);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [imageId]);

  // új komment beküldése
  const onSubmit = async () => {
    if (!text.trim()) return;
    try {
      setBusy(true);
      const newComment = await addComment(imageId, text.trim());
      setComments(prev => [...prev, newComment]);
      setText('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{marginTop: 12, padding: 8, borderTop: '1px solid rgba(255,255,255,.2)'}}>
      <h4 style={{margin: '4px 0'}}>Kommentek</h4>

      {loading ? <Spinner /> : (
        <div style={{display:'grid', gap: 6, marginBottom: 12}}>
          {comments.length === 0 && <div style={{opacity:0.7}}>Még nincs komment</div>}
          {comments.map(c => (
            <div key={c.id} style={{background:'rgba(255,255,255,.05)', padding:6, borderRadius:8}}>
              <strong style={{fontSize:13, marginRight:6}}>{c.displayName}:</strong>
              <span style={{fontSize:14, opacity:0.9}}>{c.text}</span>
            </div>
          ))}
        </div>
      )}

      <div style={{display:'flex', gap:8, alignItems:'center'}}>
        <Input
          placeholder="Írj egy kommentet..."
          value={text}
          onChange={({value}) => setText(value)}
          style={{flex:1}}
        />
        <Button onClick={onSubmit} disabled={busy || !text.trim()}>
          Küldés
        </Button>
      </div>
    </div>
  );
}
