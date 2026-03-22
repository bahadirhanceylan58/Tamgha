import { useState } from 'react';
import { useGame } from '../context/GameContext';
import { TAMGALAR } from '../data/tamgalar';

const BOLGE_RENK = {
  orhun: '#c87020',
  selenga: '#4080c0',
  altay: '#40a060',
  tengri_yurdu: '#9040c0',
};

const NASIL_OYNANIR = [
  {
    ikon: '🗺',
    baslik: 'Haritayı Keşfet',
    aciklama: 'Orhun\'dan başlayarak 4 bölgeyi kilid açarsın. Her bölgede seviyeler seni bekliyor.',
  },
  {
    ikon: '🀄',
    baslik: 'Taş Eşleştir',
    aciklama: 'Taş tahtasında serbest taşlara dokun — tepside biriken taşlardan çift bul, eşleştir ve tahtayı temizle.',
  },
  {
    ikon: '⚡',
    baslik: 'Bozkurt Combo',
    aciklama: 'Arka arkaya hızlı eşleştirmeler yap (4 saniye içinde) ve x2, x3, x5 puan çarpanı kazan!',
  },
  {
    ikon: '🔑',
    baslik: 'Kelime Avcısı',
    aciklama: 'Eşleştirme yaparken alt kısımdaki gizli Göktürkçe kelimelerin (KUT, SU vb.) harflerini açarak bonus altın kazan.',
  },
  {
    ikon: '📜',
    baslik: 'Günlük Görevler',
    aciklama: 'Ana menüdeki görevler penceresini aç. Her gün verilen 3 özel mücadeleyi (Combo yap, mitoloji taşı bul vb.) tamamla ve ödülleri topla.',
  },
  {
    ikon: '🔮',
    baslik: 'İsim Çarkı',
    aciklama: 'Ana menüden İsim Çarkı\'na girerek yüzlerce otantik Göktürk ismini keşfet ve anlamlarını öğren.',
  },
  {
    ikon: '📝',
    baslik: 'Quiz Çöz',
    aciklama: 'Tamga sesini duyunca doğru Göktürk harfini seç. 5 soruda 3 yıldız kazan.',
  },
  {
    ikon: '🃏',
    baslik: 'Kart Topla',
    aciklama: 'Her oyunda kart kazanırsın. Hayvan Ruhu ve Mitoloji kartları sana özel güçler verir.',
  },
  {
    ikon: '⚔',
    baslik: 'Ruh Arenası',
    aciklama: 'Hayvan ve Mitoloji ruhlarını güçleriyle eşleştir. 90 saniyede maksimum combo yap.',
  },
];

export default function RehberScreen() {
  const { dispatch } = useGame();
  const [sekme, setSekme] = useState('nasil');

  const bolgeGruplari = {};
  TAMGALAR.forEach(t => {
    if (!bolgeGruplari[t.bolge]) bolgeGruplari[t.bolge] = [];
    bolgeGruplari[t.bolge].push(t);
  });

  const bolgeAdi = { orhun: 'Orhun', selenga: 'Selenga', altay: 'Altay', tengri_yurdu: 'Tengri Yurdu' };

  return (
    <div className="screen rehber-screen">
      {/* Header */}
      <div className="rehber-header">
        <button className="geri-btn" onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'home' })}>
          &#8592;
        </button>
        <h2 className="rehber-baslik">Nasıl Oynanır</h2>
        <div style={{ width: 40 }} />
      </div>

      {/* Sekme */}
      <div className="rehber-sekmeler">
        <button
          className={`rehber-sekme ${sekme === 'nasil' ? 'aktif' : ''}`}
          onClick={() => setSekme('nasil')}
        >
          Nasıl Oynanır
        </button>
        <button
          className={`rehber-sekme ${sekme === 'tamgalar' ? 'aktif' : ''}`}
          onClick={() => setSekme('tamgalar')}
        >
          38 Tamga
        </button>
      </div>

      <div className="rehber-icerik">
        {sekme === 'nasil' && (
          <div className="rehber-nasil">
            {/* Kısa giriş */}
            <div className="rehber-giris">
              <div className="rehber-giris-tamga">{'\u{10C00}'}</div>
              <p className="rehber-giris-yazi">
                TAMGHA, Göktürk alfabesini oyun oynayarak öğretir.
                MS 6–8. yüzyılda Türklerin kullandığı bu yazıyı
                kartlar toplayarak, bölgeler keşfederek öğrenirsin.
              </p>
            </div>

            {/* Oyun adımları */}
            <div className="rehber-adimlar">
              {NASIL_OYNANIR.map((adim, i) => (
                <div key={i} className="rehber-adim">
                  <div className="rehber-adim-ikon">{adim.ikon}</div>
                  <div className="rehber-adim-metin">
                    <div className="rehber-adim-baslik">{adim.baslik}</div>
                    <div className="rehber-adim-aciklama">{adim.aciklama}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tepsi ipucu */}
            <div className="rehber-ipucu-kutu">
              <div className="rehber-ipucu-baslik">💡 Tepsi Mekaniği</div>
              <p className="rehber-ipucu-metin">
                Taşa dokununca üstteki tepsiye gider.
                Aynı taştan 2 tane tepsiye alınca eşleşme olur ve tahtadan kalkar.
                Tepsi 4 taşla dolarsa oyun biter — dikkatli seç!
              </p>
            </div>
          </div>
        )}

        {sekme === 'tamgalar' && (
          <div className="rehber-tamgalar">
            <p className="rehber-tamga-not">
              Göktürk alfabesi 38 harften oluşur. Her harf bir sesi temsil eder.
            </p>
            {Object.entries(bolgeGruplari).map(([bolgeId, tamgalar]) => (
              <div key={bolgeId} className="rehber-bolge-grup">
                <div
                  className="rehber-bolge-baslik"
                  style={{ borderColor: BOLGE_RENK[bolgeId] || '#888', color: BOLGE_RENK[bolgeId] || '#888' }}
                >
                  {bolgeAdi[bolgeId] || bolgeId}
                </div>
                <div className="rehber-tamga-grid">
                  {tamgalar.map(tamga => (
                    <div key={tamga.id} className="rehber-tamga-kart">
                      <div className="rehber-tamga-sembol">{tamga.tamga}</div>
                      <div className="rehber-tamga-ses">{tamga.ses}</div>
                      <div className="rehber-tamga-fonetik">[{tamga.fonetik}]</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
