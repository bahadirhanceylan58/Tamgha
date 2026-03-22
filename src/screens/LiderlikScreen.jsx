import { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

export default function LiderlikScreen() {
  const { dispatch } = useGame();
  const [liderler, setLiderler] = useState([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState(null);

  useEffect(() => {
    async function skorlariGetir() {
      try {
        setYukleniyor(true);
        // "liderlik" koleksiyonundan en yüksek 20 skoru çek
        const q = query(collection(db, 'liderlik'), orderBy('puan', 'desc'), limit(20));
        const sorgu = await getDocs(q);
        const veriler = sorgu.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Geçici Fake Data (Firebase ayarlanana kadar boş görünmemesi için)
        if (veriler.length === 0) {
          setLiderler([
            { id: '1', isim: 'Bilge Kağan', puan: 95000 },
            { id: '2', isim: 'Kül Tigin', puan: 82000 },
            { id: '3', isim: 'Tonyukuk', puan: 71000 },
            { id: '4', isim: 'Tarkan', puan: 45000 },
            { id: '5', isim: 'Bumin Kağan', puan: 30000 }
          ]);
        } else {
          setLiderler(veriler);
        }
      } catch (error) {
        console.error("Liderlik tablosu alınamadı:", error);
        setHata("Sunucuya bağlanılamadı. Firebase ayarlarını kontrol et.");
        // Fake data fallback
        setLiderler([
          { id: '1', isim: 'Bilge Kağan', puan: 95000 },
          { id: '2', isim: 'Kül Tigin', puan: 82000 },
          { id: '3', isim: 'Tonyukuk', puan: 71000 },
        ]);
      } finally {
        setYukleniyor(false);
      }
    }
    skorlariGetir();
  }, []);

  return (
    <div className="screen liderlik-screen" style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', color: '#ffd700', fontFamily: "'Cinzel', serif" }}>
      <button className="geri-btn" onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'home' })}>&#8592;</button>
      
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2.5rem', textShadow: '0 0 10px rgba(255,215,0,0.5)', marginBottom: '10px' }}>
          🏆 BOZKIRIN EN İYİLERİ 🏆
        </h1>
        <p style={{ color: '#aaa', fontSize: '1.2rem', fontFamily: 'sans-serif' }}>Küresel Liderlik Tablosu</p>
      </div>

      {hata && <div style={{ color: '#ff4444', textAlign: 'center', marginBottom: '20px', padding: '10px', background: 'rgba(255,0,0,0.1)', borderRadius: '8px' }}>{hata}</div>}

      <div style={{ background: 'rgba(0,0,0,0.6)', borderRadius: '15px', padding: '20px', boxShadow: '0 0 20px rgba(255,215,0,0.1)' }}>
        {yukleniyor ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Ruhlar meclise çağrılıyor...</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {liderler.map((lider, index) => {
              let taç = '';
              let renk = '#fff';
              if (index === 0) { taç = '\u{1F451}'; renk = '#FFD700'; } // Altın
              else if (index === 1) { taç = '\u{1F948}'; renk = '#C0C0C0'; } // Gümüş
              else if (index === 2) { taç = '\u{1F949}'; renk = '#CD7F32'; } // Bronz

              return (
                <div key={lider.id} style={{
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '15px 20px',
                  background: index < 3 ? `rgba(255,215,0,${0.15 - index*0.04})` : 'rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  border: index === 0 ? '1px solid #ffd700' : 'none',
                  fontSize: index < 3 ? '1.2rem' : '1rem',
                  fontWeight: index < 3 ? 'bold' : 'normal',
                  color: renk
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ width: '30px', textAlign: 'center', opacity: 0.7 }}>#{index + 1}</span>
                    <span>{taç} {lider.isim}</span>
                  </div>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.1em' }}>{lider.puan.toLocaleString()} Puan</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
