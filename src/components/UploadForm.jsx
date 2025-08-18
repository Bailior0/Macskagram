import {useState} from 'react';
import Button from '@enact/sandstone/Button';
import Input from '@enact/sandstone/Input';
import {uploadImage} from '../services/images';

export default function UploadForm(props) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  const onFile = (e) => setFile(e.target.files?.[0] ?? null);

  const onSubmit = async () => {
    if (!file) return setMsg('Válassz egy képet!');
    try {
      setBusy(true); setMsg('');
      await uploadImage(file, caption);
      setFile(null); setCaption('');
      setMsg('Feltöltve!');
    } catch (e) {
      setMsg('Hiba: ' + e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div {...props} style={{display: 'grid', gap: 12, alignItems: 'center'}}>
      <label style={{fontSize: 18}}>Macskafotó feltöltése</label>
      <input type="file" accept="image/*" onChange={onFile} />
      <Input placeholder="Felirat (opcionális)" value={caption} onChange={({value}) => setCaption(value)} />
      <Button disabled={busy} onClick={onSubmit}>Feltöltés</Button>
      {msg && <div aria-live="polite">{msg}</div>}
    </div>
  );
}
