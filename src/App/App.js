import kind from '@enact/core/kind';
import ThemeDecorator from '@enact/sandstone/ThemeDecorator';
import Button from '@enact/sandstone/Button';
import UploadForm from '../components/UploadForm';
import ImageGrid from '../components/ImageGrid';
import {AuthProvider} from '../components/AuthProvider';
import AuthGate from '../components/AuthGate';
import HeaderBar from '../components/HeaderBar';

// Opcionális: Tizen "Back" gomb
if (typeof window !== 'undefined' && window.tizen) {
  document.addEventListener('tizenhwkey', (e) => {
    if (e.keyName === 'back') {
      try {
        window.tizen.application.getCurrentApplication().exit();
      } catch (err) {
        console.warn('Nem sikerült kilépni az appból:', err);
      }
    }
  });
}

const AppBase = kind({
  name: 'AppBase',
  render: (props) => (
    <div
      {...props}
      style={{
        padding: 24,
        /* háttér a téma változóból, hogy tényleg váltson */
        background: 'var(--bg-color)',
        minHeight: '100vh'
      }}
    >
      <HeaderBar />

      <AuthGate>
        <div style={{display: 'grid', gap: 24}}>
          <UploadForm />
          <ImageGrid />
        </div>
      </AuthGate>

      <footer style={{marginTop: 32, opacity: 0.7}}>
        <Button size="small" className="themed-button">Rólunk</Button>
      </footer>
    </div>
  )
});

const Skinned = ThemeDecorator(AppBase);

// Providerrel burkolt export (így a ThemeDecorator megmarad)
export default function App(props) {
  return (
    <AuthProvider>
      <Skinned {...props} />
    </AuthProvider>
  );
}
