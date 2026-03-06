// Göktürkçe Sözlük
// kaynak: 'orhun' = Orhun Yazıtları (8. yy)
// kaynak: 'kokturk' = Göktürkçe / Eski Türkçe genel sözlük (turkau.com)
// kaynak: 'dlt' = Divanü Lügati't-Türk - Kaşgarlı Mahmud (11. yy)
export const SOZLUK = [

  // ═══════════════════════════════════════
  // TOPLUM & DEVLET
  // ═══════════════════════════════════════
  {
    id: 'tengri', tamga: '\u{10C00}', goktürkce: 'TENGRI', kategori: 'toplum', kaynak: 'orhun',
    tr: 'Tanrı, gökyüzü', en: 'God, sky', ru: 'Бог, небо',
    ornek: 'Tengri yarlıkaduk üçün — Tanrı buyurduğu için',
  },
  {
    id: 'kagan', tamga: '\u{10C1A}', goktürkce: 'KAGAN', kategori: 'toplum', kaynak: 'orhun',
    tr: 'Kağan, büyük hükümdar', en: 'Great Khan, supreme ruler', ru: 'Каган, великий правитель',
    ornek: 'Bilge Kagan — Bilge Kağan',
  },
  {
    id: 'el', tamga: '\u{10C1F}', goktürkce: 'EL', kategori: 'toplum', kaynak: 'orhun',
    tr: 'Devlet, ülke, millet', en: 'State, country, nation', ru: 'Государство, страна, народ',
    ornek: 'Türk eli — Türk devleti',
  },
  {
    id: 'bodun', tamga: '\u{10C09}', goktürkce: 'BODUN', kategori: 'toplum', kaynak: 'orhun',
    tr: 'Halk, millet, boy', en: 'People, folk, tribe', ru: 'Народ, племя',
    ornek: 'Türk bodun — Türk halkı',
  },
  {
    id: 'beg', tamga: '\u{10C09}', goktürkce: 'BEG', kategori: 'toplum', kaynak: 'orhun',
    tr: 'Bey, komutan, soylu', en: 'Lord, commander, noble', ru: 'Бей, командир, знать',
    ornek: 'Alp beg — Kahraman bey',
  },
  {
    id: 'kan', tamga: '\u{10C1A}', goktürkce: 'KAN', kategori: 'toplum', kaynak: 'orhun',
    tr: 'Han, hükümdar; kan', en: 'Khan, ruler; blood', ru: 'Хан, правитель; кровь',
    ornek: 'İlteriş Kagan — Devleti toplayan han',
  },
  {
    id: 'tore', tamga: '\u{10C43}', goktürkce: 'TÖRE', kategori: 'toplum', kaynak: 'orhun',
    tr: 'Töre, örf, yasa', en: 'Custom, tradition, law', ru: 'Обычай, традиция, закон',
    ornek: 'Türk töresi — Türk geleneği',
  },
  {
    id: 'alp', tamga: '\u{10C00}', goktürkce: 'ALP', kategori: 'toplum', kaynak: 'orhun',
    tr: 'Kahraman, yiğit', en: 'Hero, brave warrior', ru: 'Герой, храбрый воин',
    ornek: 'Alp er — Kahraman yiğit',
  },
  {
    id: 'bilge', tamga: '\u{10C09}', goktürkce: 'BILGE', kategori: 'toplum', kaynak: 'orhun',
    tr: 'Bilge, akıllı, hikmet sahibi', en: 'Wise, sage', ru: 'Мудрый, мудрец',
    ornek: 'Bilge Kagan — Bilge Kağan',
  },
  {
    id: 'tugrul', tamga: '\u{10C43}', goktürkce: 'TUĞRUL', kategori: 'toplum', kaynak: 'orhun',
    tr: 'Tuğrul kuşu, kartal türü', en: 'Tuğrul bird, type of eagle', ru: 'Птица тугрул, вид орла',
    ornek: 'Tuğrul Beg — Tuğrul Bey',
  },
  {
    id: 'su', tamga: '\u{10C3D}', goktürkce: 'SU', kategori: 'toplum', kaynak: 'orhun',
    tr: 'Ordu, asker kitlesi', en: 'Army, military force', ru: 'Армия, войско',
    ornek: 'Türk suyu — Türk ordusu',
  },
  {
    id: 'yurt', tamga: '\u{10C16}', goktürkce: 'YURT', kategori: 'toplum', kaynak: 'orhun',
    tr: 'Yurt, vatan, ev', en: 'Homeland, home', ru: 'Родина, дом',
    ornek: 'Ata yurtu — Ata yurdu',
  },

  // ═══════════════════════════════════════
  // DOĞA
  // ═══════════════════════════════════════
  {
    id: 'gok', tamga: '\u{10C10}', goktürkce: 'GÖK', kategori: 'doga', kaynak: 'orhun',
    tr: 'Gök, mavi, gökyüzü', en: 'Sky, blue, heaven', ru: 'Небо, синий',
    ornek: 'Gök Türk — Göktürk (Gök Türk)',
  },
  {
    id: 'yer', tamga: '\u{10C16}', goktürkce: 'YER', kategori: 'doga', kaynak: 'orhun',
    tr: 'Yer, toprak, yeryüzü', en: 'Earth, ground, land', ru: 'Земля, почва',
    ornek: 'Yer sub — Yer ve su (vatan)',
  },
  {
    id: 'tag', tamga: '\u{10C43}', goktürkce: 'TAĞ', kategori: 'doga', kaynak: 'orhun',
    tr: 'Dağ', en: 'Mountain', ru: 'Гора',
    ornek: 'Altay Tağ — Altay Dağı',
  },
  {
    id: 'sub', tamga: '\u{10C3D}', goktürkce: 'SUB', kategori: 'doga', kaynak: 'orhun',
    tr: 'Su, ırmak', en: 'Water, river', ru: 'Вода, река',
    ornek: 'Orhun Subi — Orhun Irmağı',
  },
  {
    id: 'ot', tamga: '\u{10C06}', goktürkce: 'OT', kategori: 'doga', kaynak: 'orhun',
    tr: 'Ot, ateş', en: 'Grass; fire', ru: 'Трава; огонь',
    ornek: 'Od tengri — Ateş tanrısı',
  },
  {
    id: 'kun', tamga: '\u{10C1A}', goktürkce: 'KÜN', kategori: 'doga', kaynak: 'orhun',
    tr: 'Gün, güneş', en: 'Day, sun', ru: 'День, солнце',
    ornek: 'Kün batısı — Güneş batısı (Batı)',
  },
  {
    id: 'ay', tamga: '\u{10C00}', goktürkce: 'AY', kategori: 'doga', kaynak: 'orhun',
    tr: 'Ay (gökteki)', en: 'Moon', ru: 'Луна',
    ornek: 'Ay Tengri — Ay Tanrısı',
  },
  {
    id: 'yulduz', tamga: '\u{10C16}', goktürkce: 'YULDUZ', kategori: 'doga', kaynak: 'orhun',
    tr: 'Yıldız', en: 'Star', ru: 'Звезда',
    ornek: 'Yulduz ışığı — Yıldız ışığı',
  },
  {
    id: 'yel', tamga: '\u{10C16}', goktürkce: 'YEL', kategori: 'doga', kaynak: 'orhun',
    tr: 'Yel, rüzgar', en: 'Wind', ru: 'Ветер',
    ornek: 'Bozkır yeli — Bozkır rüzgarı',
  },
  {
    id: 'kara', tamga: '\u{10C1A}', goktürkce: 'KARA', kategori: 'doga', kaynak: 'orhun',
    tr: 'Kara, siyah; kara toprak', en: 'Black; mainland, dark earth', ru: 'Чёрный; суша',
    ornek: 'Kara bodun — Halk (sıradan insanlar)',
  },
  {
    id: 'ak', tamga: '\u{10C00}', goktürkce: 'AK', kategori: 'doga', kaynak: 'orhun',
    tr: 'Ak, beyaz; temiz', en: 'White; pure, clean', ru: 'Белый; чистый',
    ornek: 'Ak Tengri — Beyaz Tanrı',
  },
  {
    id: 'boz', tamga: '\u{10C09}', goktürkce: 'BOZ', kategori: 'doga', kaynak: 'orhun',
    tr: 'Boz, gri; bozkır', en: 'Grey; steppe', ru: 'Серый; степь',
    ornek: 'Bozkurt — Boz kurt',
  },

  // ═══════════════════════════════════════
  // İSİMLER (Nesneler)
  // ═══════════════════════════════════════
  {
    id: 'at', tamga: '\u{10C00}', goktürkce: 'AT', kategori: 'isim', kaynak: 'orhun',
    tr: 'At, (binek) hayvanı', en: 'Horse', ru: 'Лошадь',
    ornek: 'Alp atı — Kahraman\'ın atı',
  },
  {
    id: 'it', tamga: '\u{10C03}', goktürkce: 'IT', kategori: 'isim', kaynak: 'orhun',
    tr: 'Köpek', en: 'Dog', ru: 'Собака',
    ornek: 'It yılı — Köpek yılı',
  },
  {
    id: 'bars', tamga: '\u{10C09}', goktürkce: 'BARS', kategori: 'isim', kaynak: 'orhun',
    tr: 'Bars, kaplan', en: 'Tiger, leopard', ru: 'Тигр, леопард',
    ornek: 'Bars yılı — Kaplan yılı',
  },
  {
    id: 'kurt', tamga: '\u{10C1A}', goktürkce: 'KURT', kategori: 'isim', kaynak: 'orhun',
    tr: 'Kurt, bozkurt', en: 'Wolf', ru: 'Волк',
    ornek: 'Gök börü — Gök kurt',
  },
  {
    id: 'ok', tamga: '\u{10C06}', goktürkce: 'OK', kategori: 'isim', kaynak: 'orhun',
    tr: 'Ok (silah)', en: 'Arrow', ru: 'Стрела',
    ornek: 'Ok attı — Ok attı',
  },
  {
    id: 'kılıc', tamga: '\u{10C1A}', goktürkce: 'KILIČ', kategori: 'isim', kaynak: 'orhun',
    tr: 'Kılıç', en: 'Sword', ru: 'Меч',
    ornek: 'Alp kılıcı — Yiğitin kılıcı',
  },
  {
    id: 'tas', tamga: '\u{10C43}', goktürkce: 'TAŞ', kategori: 'isim', kaynak: 'orhun',
    tr: 'Taş', en: 'Stone, rock', ru: 'Камень',
    ornek: 'Yada taşı — Yağmur taşı',
  },
  {
    id: 'altın', tamga: '\u{10C00}', goktürkce: 'ALTIN', kategori: 'isim', kaynak: 'orhun',
    tr: 'Altın', en: 'Gold', ru: 'Золото',
    ornek: 'Altın tamga — Altın mühür',
  },
  {
    id: 'demir', tamga: '\u{10C11}', goktürkce: 'TEMIR', kategori: 'isim', kaynak: 'orhun',
    tr: 'Demir', en: 'Iron', ru: 'Железо',
    ornek: 'Timur — Demir (isim)',
  },

  // ═══════════════════════════════════════
  // FİİLLER
  // ═══════════════════════════════════════
  {
    id: 'bol', tamga: '\u{10C09}', goktürkce: 'BOL-', kategori: 'fiil', kaynak: 'orhun',
    tr: 'Olmak, var olmak', en: 'To be, to become', ru: 'Быть, становиться',
    ornek: 'Türk boldı — Türk oldu',
  },
  {
    id: 'bar', tamga: '\u{10C09}', goktürkce: 'BAR-', kategori: 'fiil', kaynak: 'orhun',
    tr: 'Gitmek, varmak', en: 'To go, to arrive', ru: 'Идти, прибыть',
    ornek: 'Bardım — Gittim',
  },
  {
    id: 'kel', tamga: '\u{10C1A}', goktürkce: 'KEL-', kategori: 'fiil', kaynak: 'orhun',
    tr: 'Gelmek', en: 'To come', ru: 'Приходить',
    ornek: 'Keldim — Geldim',
  },
  {
    id: 'yarlıka', tamga: '\u{10C16}', goktürkce: 'YARLIKA-', kategori: 'fiil', kaynak: 'orhun',
    tr: 'Buyurmak, lütfetmek', en: 'To command, to bestow grace', ru: 'Повелевать, миловать',
    ornek: 'Tengri yarlıkadı — Tanrı buyurdu',
  },
  {
    id: 'sü', tamga: '\u{10C3D}', goktürkce: 'SÜ-', kategori: 'fiil', kaynak: 'orhun',
    tr: 'Savaşmak, sefer çıkmak', en: 'To fight, to campaign', ru: 'Воевать, совершать поход',
    ornek: 'Süledim — Sefer çıktım',
  },
  {
    id: 'ol', tamga: '\u{10C06}', goktürkce: 'OL-', kategori: 'fiil', kaynak: 'orhun',
    tr: 'Olmak (o)', en: 'To be (3rd person)', ru: 'Быть (3-е лицо)',
    ornek: 'Ol bodun — O millet',
  },
  {
    id: 'yaz', tamga: '\u{10C16}', goktürkce: 'YAZ-', kategori: 'fiil', kaynak: 'orhun',
    tr: 'Yazmak, kaydetmek', en: 'To write, to inscribe', ru: 'Писать, записывать',
    ornek: 'Bitig yazdım — Yazıt yazdım',
  },
  {
    id: 'ber', tamga: '\u{10C09}', goktürkce: 'BER-', kategori: 'fiil', kaynak: 'orhun',
    tr: 'Vermek', en: 'To give', ru: 'Давать',
    ornek: 'Tengri berdı — Tanrı verdi',
  },

  // ═══════════════════════════════════════
  // ZAMIRLER & TEMEL
  // ═══════════════════════════════════════
  {
    id: 'ben', tamga: '\u{10C09}', goktürkce: 'BEN', kategori: 'isim', kaynak: 'orhun',
    tr: 'Ben', en: 'I, me', ru: 'Я, меня',
    ornek: 'Ben Türk kaganı — Ben Türk kağanı',
  },
  {
    id: 'sen', tamga: '\u{10C3E}', goktürkce: 'SEN', kategori: 'isim', kaynak: 'orhun',
    tr: 'Sen', en: 'You', ru: 'Ты',
    ornek: 'Sen bargu — Sen git',
  },
  {
    id: 'biz', tamga: '\u{10C09}', goktürkce: 'BIZ', kategori: 'isim', kaynak: 'orhun',
    tr: 'Biz', en: 'We', ru: 'Мы',
    ornek: 'Biz Türk — Biz Türkler',
  },
  {
    id: 'ucun', tamga: '\u{10C06}', goktürkce: 'ÜÇÜN', kategori: 'isim', kaynak: 'orhun',
    tr: 'İçin, uğruna', en: 'For, because of', ru: 'Для, ради',
    ornek: 'Türk bodun üçün — Türk halkı için',
  },

  // ═══════════════════════════════════════
  // GÖKTÜRKÇE SÖZLÜK (turkau.com)
  // ═══════════════════════════════════════
  {
    id: 'acun', tamga: '\u{10C00}', goktürkce: 'ACUN', kategori: 'doga', kaynak: 'kokturk',
    tr: 'Dünya, yeryüzü', en: 'World, earth', ru: 'Мир, земля',
    ornek: 'Acun begleri — Dünyanın beyleri',
  },
  {
    id: 'ata', tamga: '\u{10C00}', goktürkce: 'ATA', kategori: 'toplum', kaynak: 'kokturk',
    tr: 'Ulu kişi, baba, dede; atalar', en: 'Ancestor, father, elder', ru: 'Предок, отец, дед',
    ornek: 'Ata yurdu — Ata yurdu',
  },
  {
    id: 'and', tamga: '\u{10C00}', goktürkce: 'AND', kategori: 'toplum', kaynak: 'kokturk',
    tr: 'Yemin, söz, ant; kan kardeşliği', en: 'Oath, vow, blood brotherhood', ru: 'Клятва, обет, побратимство',
    ornek: 'And içmek — Yemin etmek',
  },
  {
    id: 'arslan', tamga: '\u{10C00}', goktürkce: 'ARSLAN', kategori: 'isim', kaynak: 'kokturk',
    tr: 'Aslan; cesaret ve yiğitliğin sembolü', en: 'Lion; symbol of courage', ru: 'Лев; символ храбрости',
    ornek: 'Arslan yürekli — Aslan yürekli',
  },
  {
    id: 'alkis', tamga: '\u{10C00}', goktürkce: 'ALKIŞ', kategori: 'toplum', kaynak: 'kokturk',
    tr: 'Dua, yakarış, niyaz; övme (modern alkış buradan)', en: 'Prayer, praise; origin of modern applause word', ru: 'Молитва, восхваление',
    ornek: 'Alkış tutmak — Dua etmek, yüceltmek',
  },
  {
    id: 'bay', tamga: '\u{10C09}', goktürkce: 'BAY', kategori: 'toplum', kaynak: 'kokturk',
    tr: 'Zengin, varlıklı, egemen', en: 'Rich, wealthy, powerful', ru: 'Богатый, состоятельный',
    ornek: 'Bay beg — Zengin bey',
  },
  {
    id: 'bayrak', tamga: '\u{10C09}', goktürkce: 'BAYRAK', kategori: 'toplum', kaynak: 'kokturk',
    tr: 'Varlık, bağımsızlık ve gücün simgesi', en: 'Symbol of existence, independence and power', ru: 'Символ независимости и силы',
    ornek: 'Türk bayragı — Türk bayrağı',
  },
  {
    id: 'bitig', tamga: '\u{10C09}', goktürkce: 'BİTİG', kategori: 'isim', kaynak: 'kokturk',
    tr: 'Yazı, yazıt, mektup', en: 'Writing, inscription, letter', ru: 'Письмо, надпись',
    ornek: 'Mengü bitig — Ebedi yazıt',
  },
  {
    id: 'bozkurt', tamga: '\u{10C09}', goktürkce: 'BOZKURT', kategori: 'isim', kaynak: 'kokturk',
    tr: 'Türklerin efsanevi milli sembolü; Oğuz\'a yol gösteren kurt', en: 'Legendary wolf, national symbol of the Turks', ru: 'Легендарный волк, национальный символ тюрков',
    ornek: 'Oğuz Kağan\'ın yol göstericisi',
  },
  {
    id: 'bori', tamga: '\u{10C09}', goktürkce: 'BÖRİ', kategori: 'isim', kaynak: 'kokturk',
    tr: 'Kurt; Göktürklerde kağan muhafızlarının genel adı', en: 'Wolf; name for Göktürk royal guards', ru: 'Волк; стражи кагана в Гёктюркском каганате',
    ornek: 'Gök börü — Gök kurdu',
  },
  {
    id: 'buyan', tamga: '\u{10C09}', goktürkce: 'BUYAN', kategori: 'toplum', kaynak: 'kokturk',
    tr: 'Kut, baht, mutluluk; sevap, hayır', en: 'Fortune, happiness; virtue, merit', ru: 'Счастье, судьба; добродетель',
    ornek: 'Buyan kıl — İyilik yap',
  },
  {
    id: 'cerig', tamga: '\u{10C17}', goktürkce: 'ÇERİG', kategori: 'toplum', kaynak: 'kokturk',
    tr: 'Asker, ordu, erat', en: 'Soldier, army, troops', ru: 'Солдат, армия, войско',
    ornek: 'Çerig sürmek — Orduyu sevk etmek',
  },
];

export const SOZLUK_KATEGORILER = [
  { id: 'hepsi', ikon: '✦' },
  { id: 'toplum', ikon: '👑' },
  { id: 'doga', ikon: '🌿' },
  { id: 'isim', ikon: '📦' },
  { id: 'fiil', ikon: '⚡' },
];

export const SOZLUK_KAYNAKLAR = [
  { id: 'hepsi', ikon: '✦', tr: 'Hepsi', en: 'All', ru: 'Все' },
  { id: 'orhun', ikon: '🪨', tr: 'Orhun Yazıtları', en: 'Orhun Inscriptions', ru: 'Орхонские надписи' },
  { id: 'kokturk', ikon: '⚔️', tr: 'Göktürkçe', en: 'Old Turkic', ru: 'Древнетюркский' },
];
