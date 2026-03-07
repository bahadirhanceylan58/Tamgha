import { useGame } from '../context/GameContext';

export default function SozlukScreen() {
  const { dispatch } = useGame();

  return (
    <div className="screen sozluk-secim-screen">
      <div className="sozluk-secim-header">
        <button
          className="geri-btn"
          onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'home' })}
        >
          &#8592;
        </button>
        <h2 className="sozluk-secim-baslik">Sözlük</h2>
      </div>

      <div className="sozluk-secim-icerik">
        <button
          className="sozluk-secim-kart"
          onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'sozluk_dlt' })}
        >
          <div className="sozluk-secim-ikon">📜</div>
          <div className="sozluk-secim-bilgi">
            <span className="sozluk-secim-ad">Divanü Lügati't-Türk</span>
            <span className="sozluk-secim-alt">Kaşgarlı Mahmud · 11. yy · 7918 kelime</span>
          </div>
          <span className="sozluk-secim-ok">›</span>
        </button>

        <button
          className="sozluk-secim-kart"
          onClick={() => dispatch({ type: 'NAVIGATE', ekran: 'sozluk_gokt' })}
        >
          <div className="sozluk-secim-ikon">𐱅</div>
          <div className="sozluk-secim-bilgi">
            <span className="sozluk-secim-ad">Göktürkçe Sözlük</span>
            <span className="sozluk-secim-alt">Orhun Yazıtları · 8. yy · 65 kelime</span>
          </div>
          <span className="sozluk-secim-ok">›</span>
        </button>

      </div>
    </div>
  );
}
