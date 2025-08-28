import {useRef, useState} from 'react';
import Button from '@enact/sandstone/Button';
import Input from '@enact/sandstone/Input';
import {uploadImage} from '../services/images';

export default function UploadForm(props) {
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const fileInputRef = useRef(null);

  const onFile = (e) => setFile(e.target.files?.[0] ?? null);

  const onPickFile = () => {
    fileInputRef.current?.click();
  };

  const onSubmit = async () => {
    if (!file) return setMsg('Válassz egy képet!');
    try {
      setBusy(true); setMsg('');
      const doc = await uploadImage(file, caption);
      // esemény a listának
      window.dispatchEvent(new CustomEvent('image:uploaded', {detail: doc}));

      setFile(null); setCaption('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      setMsg('Feltöltve!');
    } catch (e) {
      setMsg('Hiba: ' + (e?.message ?? e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div {...props} style={{display: 'grid', gap: 12, alignItems: 'center'}}>
      <label style={{fontSize: 18}}>Macskafotó feltöltése</label>

      {/* Rejtett input – TV-n gombbal nyílik */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFile}
        style={{position: 'absolute', opacity: 0, width: 1, height: 1, pointerEvents: 'none'}}
        tabIndex={-1}
      />

      <div style={{display:'flex', gap:12, alignItems:'center', flexWrap:'wrap'}}>
        <Button onClick={onPickFile} disabled={busy} className="themed-button">Kép kiválasztása</Button>
        <span style={{opacity:.8}}>{file ? file.name : '— nincs fájl kiválasztva —'}</span>
      </div>

      <Input placeholder="Felirat (opcionális)" value={caption} onChange={({value}) => setCaption(value)} />
      <Button disabled={busy} onClick={onSubmit} className="themed-button">Feltöltés</Button>
      {msg && <div aria-live="polite">{msg}</div>}
    </div>
  );
}
