/* =========================================================
   HOSPODA U HOŘKÉHO KOHOUTU – 3D výčepní hra
   ---------------------------------------------------------
   Čistý JavaScript + WebGL, žádné knihovny. Chodíš po hospodě
   z pohledu první osoby, čepuješ, obsluhuješ stoly, sbíráš
   sklenice a měníš sudy. Vylepšení kupuješ v knize na pultu.
   Všechna herní data jsou v polích hned na začátku souboru –
   nové věci stačí připsat na konec příslušného pole.
   ========================================================= */
'use strict';

/* =========================================================
   1) ZÁKLADNÍ NASTAVENÍ
   ========================================================= */
const NASTAVENI = {
  rychlostChuze: 3.0,      // m/s
  polomerHrace: 0.28,      // jak „široký“ je hráč (kvůli zdem a nábytku)
  vyskaOci: 1.62,          // výška kamery nad podlahou
  dosah: 2.3,              // jak daleko dosáhneš na věci (m)
  dosahHost: 2.6,          // hostovi podáš pivo i přes pult
  cilHladiny: 90,          // ideální výška vršku pěny (% sklenice)
  tolerancePerfekt: 2.5,   // ± od cíle = perfektní hladinka
  toleranceDobre: 6.5,     // ± od cíle = dobře natočené
  minHotove: 74,           // pod tímhle se pivo ještě nedá podat (můžeš dočepovat)
  maxPreteceni: 108,       // tady pivo přeteče
  rychlostCepovani: 32,    // % sklenice za sekundu
  trpelivostObjednavka: 70,// kolik sekund čeká host u stolu, než si přijdeš pro objednávku
  trpelivostPivo: 65,      // kolik sekund čeká na pivo
  trpelivostPlaceni: 80,   // kolik sekund čeká, než si přijdeš pro peníze
  intervalHostu: 15,       // průměrně po kolika sekundách přijde nová partička
  cisteSklenice: 12,       // kolik čistých sklenic je na začátku v regálu
  cistePanakovky: 12,      // kolik čistých panákovek je na začátku
  unosnostPiv: 2,          // kolik nápojů uneseš v rukou (bez tácu)
  unosnostSklenic: 4,      // kolik prázdných sklenic uneseš najednou
  pitiZaPivo: [26, 40],    // jak dlouho host pije jedno pivo (s)
  kapacitaSudu: 20,        // kolik piv je v jednom sudu
  dovozSudu: 15,           // za kolik sekund přivezou objednané sudy
  // panák se nalévá po čárku (cejch 0,04 l) – hodnoty jsou v % výšky panákovky
  panak: { cil: 72, perfekt: 3.2, dobre: 7.5, min: 56, max: 100, rychlost: 42 },
  startovniPenize: 10000,  // s kolika korunami v kase začínáš novou hospodu
  trpelivostJidlo: 80,     // kolik sekund host čeká na jídlo (k tomu +1,6× doba vaření)
  jidloChladne: 40,        // po kolika sekundách na okénku jídlo vychladne (bez ohřívacích lamp)
  kapacitaOkenka: 6,       // kolik talířů se vejde na výdejní okénko kuchyně
  kapacitaVydeje: 8,       // kolik nápojů se vejde na výdej pro číšníky
  unosnostCisnika: 4,      // kolik nápojů (nebo 2 talíře) unese číšník na tácu
  unosnostSberace: 6,      // kolik prázdných sklenic a talířů unese sběrač
  klicUlozeni: 'hospodaRadegast3D.v3'
};

/* =========================================================
   2) PIVA NA ČEPU
   x = poloha kohoutu na pultu, sklo = tvar sklenice
   odemknout = cena nového kohoutu v knize (0 = je na čepu od začátku)
   nazvy = jak pivu hosté říkají; dve/tri = jak řeknou víc kusů
   ========================================================= */
const PIVA = [
  {
    id: 'r10', nazev: 'Radegast 10', kratce: 'Radegast 10', typ: 'výčepní, hořké', cena: 42, sud: 480, odemknout: 0,
    x: 4.2, sklo: 'pulitr', barva: [0.93, 0.62, 0.12], packa: [0.75, 0.12, 0.1], pruh: [0.72, 0.1, 0.1],
    popis: 'Rázná desítka z Nošovic: lehčí výčepní pivo, ale pořádně hořké (30 IBU).',
    nazvy: ['Radegast desítku', 'desítku z Radegastu', 'Ráznou desítku', 'hořkou desítku z Nošovic', 'desítku Radegast', 'Radegast deset'],
    dve: ['dvě Radegast desítky', 'dvakrát Radegast desítku'], tri: ['tři Radegast desítky']
  },
  {
    id: 'r12', nazev: 'Radegast 12', kratce: 'Radegast 12', typ: 'ležák, hořký', cena: 54, sud: 620, odemknout: 0,
    x: 3.9, sklo: 'pulitr', barva: [0.86, 0.52, 0.08], packa: [0.55, 0.08, 0.08], pruh: [0.55, 0.06, 0.06],
    popis: 'Ryze hořká dvanáctka: světlý ležák s plnou hořkou chutí (36 IBU, 5,1 %).',
    nazvy: ['Radegast dvanáctku', 'Ryze hořkou', 'hořkou dvanáctku z Nošovic', 'dvanáctku Radegast', 'Radegast dvanáct', 'dvanáctku od Radegastu'],
    dve: ['dvě Radegast dvanáctky', 'dvakrát Ryze hořkou'], tri: ['tři Radegast dvanáctky']
  },
  {
    id: 'r15', nazev: 'Radegast 15', kratce: 'Radegast 15', typ: 'speciál, silné', cena: 69, sud: 820, odemknout: 0,
    x: 3.6, sklo: 'pulitr', barva: [0.68, 0.34, 0.07], packa: [0.25, 0.05, 0.05], pruh: [0.2, 0.05, 0.05],
    popis: 'Silná patnáctka – Radegast vaří patnáctky jako limitované edice (třeba polotmavá Drsná 15 má 6,4 % a 45 IBU).',
    nazvy: ['patnáctku', 'Radegast patnáctku', 'něco silnýho', 'to nejsilnější, co máte', 'speciál od Radegastu', 'Drsnou patnáctku'],
    dve: ['dvě patnáctky', 'dvakrát patnáctku'], tri: ['tři patnáctky']
  },
  {
    id: 'g10', nazev: 'Gambrinus 10', kratce: 'Gambrinus', typ: 'výčepní', cena: 44, sud: 500, odemknout: 0,
    x: 6.95, sklo: 'valec', barva: [0.95, 0.68, 0.18], packa: [0.12, 0.45, 0.2], pruh: [0.1, 0.45, 0.2],
    popis: 'Gambrinus Originál 10 z Plzně – nejoblíbenější desítka v Česku, 4,3 % alkoholu.',
    nazvy: ['Gambrinusa', 'Gambáče', 'Gambrinus desítku', 'jednoho Gambáče', 'desítku Gambrinus', 'zelenou desítku'],
    dve: ['dva Gambrinusy', 'dva Gambáče'], tri: ['tři Gambrinusy', 'tři Gambáče']
  },
  {
    id: 'k', nazev: 'Kozel Černý', kratce: 'Kozel černý', typ: 'tmavé', cena: 46, sud: 520, odemknout: 0, tmave: true,
    x: 6.65, sklo: 'pohar', barva: [0.24, 0.1, 0.04], packa: [0.2, 0.12, 0.08], pruh: [0.75, 0.6, 0.25],
    popis: 'Tmavé pivo z Velkých Popovic, kde se Kozel vaří od roku 1874. Jemně nasládlé, 3,8 %.',
    nazvy: ['Kozla', 'černýho Kozla', 'tmavýho Kozla', 'jedno tmavý', 'tmavé pivo', 'Kozla černýho'],
    dve: ['dva Kozly', 'dvě tmavý', 'dva černý Kozly'], tri: ['tři Kozly', 'tři tmavý']
  },
  {
    id: 'pu', nazev: 'Pilsner Urquell', kratce: 'Plzeň', typ: 'ležák', cena: 62, sud: 720, odemknout: 0,
    x: 6.35, sklo: 'pulitr', barva: [0.94, 0.66, 0.15], packa: [0.75, 0.6, 0.2], pruh: [0.08, 0.35, 0.15],
    popis: 'Plzeňský Prazdroj: první světlý ležák na světě, uvařil ho Josef Groll v roce 1842. Žatecký chmel, 4,4 %.',
    nazvy: ['Plzeň', 'Prazdroj', 'Plzničku', 'Pilsner', 'plzeňskou dvanáctku', 'Urquell'],
    dve: ['dvě Plzně', 'dvakrát Plzeň', 'dva Prazdroje'], tri: ['tři Plzně', 'tři Prazdroje']
  },
  {
    id: 'rb', nazev: 'Rebel 12', kratce: 'Rebel', typ: 'ležák', cena: 52, sud: 600, odemknout: 0,
    x: 6.05, sklo: 'pulitr', barva: [0.9, 0.6, 0.13], packa: [0.15, 0.25, 0.55], pruh: [0.15, 0.25, 0.55],
    popis: 'Rebel Originál 12 – světlý ležák z Havlíčkova Brodu, 4,8 %.',
    nazvy: ['Rebela', 'Rebel dvanáctku', 'něco z Brodu', 'Havlíčkobrodskýho Rebela', 'jednoho Rebela', 'brodskou dvanáctku'],
    dve: ['dva Rebely', 'dvakrát Rebela'], tri: ['tři Rebely']
  },
  // tři piva navíc – nový kohout si koupíš v knize
  {
    id: 'ratar', nazev: 'Radegast Ratar', kratce: 'Ratar', typ: 'ležák, extra hořký', cena: 56, sud: 650, odemknout: 800,
    x: 3.3, sklo: 'pulitr', barva: [0.95, 0.64, 0.14], packa: [0.92, 0.42, 0.06], pruh: [0.85, 0.3, 0.05],
    popis: 'Nejhořčejší pivo v historii Radegastu: 50 IBU a 4,4 %. Na trhu od roku 2020.',
    nazvy: ['Ratara', 'Radegast Ratar', 'to nejhořčí, co máte', 'něco pořádně hořkýho', 'jednoho Ratara'],
    dve: ['dva Ratary', 'dvakrát Ratara'], tri: ['tři Ratary']
  },
  {
    id: 'k11', nazev: 'Kozel 11', kratce: 'Kozel 11', typ: 'ležák', cena: 48, sud: 540, odemknout: 700,
    x: 3.0, sklo: 'pohar', barva: [0.96, 0.72, 0.22], packa: [0.8, 0.64, 0.26], pruh: [0.3, 0.18, 0.1],
    popis: 'Světlý ležák z Velkých Popovic – jedenáctka s jemnou hořkostí, 4,6 %.',
    nazvy: ['Kozla jedenáctku', 'světlýho Kozla', 'jedenáctku', 'Kozel jedenáct', 'jedenáctku od Kozla'],
    dve: ['dvě jedenáctky', 'dva světlý Kozly'], tri: ['tři jedenáctky']
  },
  {
    id: 'rbc', nazev: 'Rebel Černý', kratce: 'Rebel černý', typ: 'tmavé', cena: 54, sud: 600, odemknout: 900, tmave: true,
    x: 5.75, sklo: 'valec', barva: [0.2, 0.08, 0.035], packa: [0.08, 0.1, 0.22], pruh: [0.62, 0.52, 0.32],
    popis: 'Tmavý ležák Black Rebel 12° z Havlíčkova Brodu, 4,7 %.',
    nazvy: ['černýho Rebela', 'tmavýho Rebela', 'Rebel černý', 'tmavý z Brodu', 'jednoho černýho Rebela'],
    dve: ['dva černý Rebely', 'dvakrát černýho Rebela'], tri: ['tři černý Rebely']
  }
];
PIVA.forEach((p) => {
  p.druh = 'pivo';
  p._barva = new Float32Array([...p.barva, 1]);
  p._packa = new Float32Array([...p.packa, 1]);
  p._pruh = new Float32Array([...p.pruh, 1]);
});

/* =========================================================
   3) HODNOCENÍ NAČEPOVANÉHO PIVA (dýško v Kč)
   ========================================================= */
const HODNOCENI = {
  perfekt: { text: '🌟 Perfektní hladinka!', kratce: '🌟', dysko: 15, spokojenost: 1, trida: 'dobre' },
  dobre:   { text: '👍 Pěkně natočené', kratce: '👍', dysko: 8, spokojenost: 0.8, trida: 'dobre' },
  pena:    { text: '😬 Moc pěny', kratce: '😬', dysko: 2, spokojenost: 0.45, trida: 'stredni' },
  malo:    { text: '😕 Pod míru', kratce: '😕', dysko: 0, spokojenost: 0.3, trida: 'stredni' }
};

/* =========================================================
   4) KNIHA VYLEPŠENÍ (ceny jsou oproti minulé verzi dvojnásobné)
   kat: 'vycep' = za pultem, 'hospoda' = sál a hosté, 'kuchyne' = kuchyně,
        'sklad' = sudy; personál je zvlášť (PERSONAL v j01e)
   potreba = co musíš mít koupené dřív
   ========================================================= */
const VYLEPSENI = [
  { id: 'kohout', kat: 'vycep', ikona: '🚰', nazev: 'Rychlejší kohouty', ceny: [500, 1200, 2400], popis: 'Pivo teče o 15 % rychleji za každou úroveň.' },
  { id: 'ruka', kat: 'vycep', ikona: '✋', nazev: 'Jistá ruka', ceny: [600, 1400, 2800], popis: 'Zelená zóna perfektní hladinky (i čárky u panáků) se rozšíří.' },
  { id: 'sklenice', kat: 'vycep', ikona: '🍺', nazev: 'Víc sklenic', ceny: [300, 800, 1600], popis: '+6 čistých sklenic do regálu za úroveň.' },
  { id: 'panakovky', kat: 'vycep', ikona: '🥃', nazev: 'Víc panákovek', ceny: [300, 800], popis: '+6 čistých panákovek ke stanovišti s lahvemi za úroveň.' },
  { id: 'odmerka', kat: 'vycep', ikona: '🧪', nazev: 'Nalévátka na lahve', ceny: [600, 1600], popis: 'Z lahve teče pomaleji a rovnoměrně – trefit čárku je snazší.' },
  { id: 'tac', kat: 'vycep', ikona: '🍽️', nazev: 'Tác', ceny: [800, 2200], popis: 'Na tác se vejdou 4, pak 6 nápojů nebo talířů. Uneseš i víc prázdných sklenic.' },
  { id: 'boty', kat: 'vycep', ikona: '👟', nazev: 'Pohodlné boty', ceny: [400, 1000, 2000], popis: 'Chodíš o 12 % rychleji za úroveň.' },
  { id: 'usmev', kat: 'vycep', ikona: '😊', nazev: 'Úsměv za pípou', ceny: [700, 1800], popis: 'Hosté dávají o 25 % větší dýško za úroveň.' },
  { id: 'stul', kat: 'hospoda', ikona: '🪑', nazev: 'Nový stůl', ceny: [1200, 2600, 5000, 7000, 9000], popis: 'Přibude stůl s kostkovaným ubrusem a čtyřmi ohýbanými židlemi (až 10 stolů).' },
  { id: 'reklama', kat: 'hospoda', ikona: '🪧', nazev: 'Cedule u silnice', ceny: [1000, 2400], popis: 'Hosté chodí častěji (o 15 % za úroveň).' },
  { id: 'jukebox', kat: 'hospoda', ikona: '🎵', nazev: 'Jukebox', ceny: [1800], popis: 'Hraje k pivu (opravdu hraje!) – hosté vydrží čekat o 30 % déle.' },
  { id: 'televize', kat: 'hospoda', ikona: '📺', nazev: 'Televize s hokejem', ceny: [3000], popis: 'Větší dýško a občas běží zápas – fanoušci se pak hrnou dovnitř a slaví góly.' },
  { id: 'kuchyne', kat: 'kuchyne', ikona: '🍳', nazev: 'Otevřít kuchyni', ceny: [8000], popis: 'Za sálem se postaví kuchyně se sporákem, digestoří, pracovním stolem, lednicí a výdejním okénkem. Přijde kuchařka Jarmila a hosté začnou objednávat jídlo.' },
  { id: 'nabidka', kat: 'kuchyne', ikona: '📜', nazev: 'Větší nabídka jídel', ceny: [3000, 6000], popis: 'Na lístek přibudou řízek s pivním sýrem, pak topinky a nakládaný hermelín.', potreba: 'kuchyne' },
  { id: 'rychlaKuchyne', kat: 'kuchyne', ikona: '🔥', nazev: 'Rychlejší vaření', ceny: [2400, 5000], popis: 'Kuchařka dostane lepší nože a hrnce – vaří o 20 % rychleji za úroveň.', potreba: 'kuchyne' },
  { id: 'sporak2', kat: 'kuchyne', ikona: '🍲', nazev: 'Druhý sporák', ceny: [6000], popis: 'Kuchařka vaří dvě jídla najednou.', potreba: 'kuchyne' },
  { id: 'ohrivac', kat: 'kuchyne', ikona: '💡', nazev: 'Ohřívací lampy u okénka', ceny: [2000], popis: 'Jídlo na okénku nevychladne a hosté vydrží na jídlo čekat o 20 % déle.', potreba: 'kuchyne' },
  { id: 'sudy', kat: 'sklad', ikona: '🛢️', nazev: 'Větší sudy', ceny: [1400, 3200], popis: 'Do sudu se vejde o 10 piv víc (30, pak 40).' },
  { id: 'smlouva', kat: 'sklad', ikona: '📜', nazev: 'Smlouva s pivovarem', ceny: [4000], popis: 'Když dojde zásoba, pivovar sám přiveze nový sud (zaplatíš ho při dovozu).' }
];

/* =========================================================
   5) NÁVOD PRO NOVÉHO VÝČEPNÍHO (cíle nahoře na obrazovce)
   ========================================================= */
const NAVOD = {
  otevrit: '🎯 Dojdi ke dveřím a otoč cedulku na OTEVŘENO',
  cekej: '🎯 Hospoda je otevřená – za chvíli přijdou první hosté',
  vola: '🎯 Host u stolu mává – dojdi k němu a převezmi objednávku',
  bar: '🎯 Host sedí u pultu – podívej se, co chce, a jdi k pípě',
  cepuj: '🎯 Podívej se na správný kohout a drž akci – pusť, až bude pěna v zelené zóně',
  podej: '🎯 Máš pivo! Dones ho hostovi a podej mu ho',
  plati: '🎯 Host chce platit – dojdi si k němu pro peníze',
  kniha: '🎯 Za vydělané peníze si v knize na pultu kup vylepšení',
  sklenice: '🎯 Po hostech zůstaly prázdné sklenice – posbírej je a dej do dřezu',
  sud: '🎯 Došel sud! Jdi do skladu za barem a narazi nový',
  panak: '🥃 Host chce panáka – deset lahví stojí na zadním pultu vlevo za tebou. Drž akci a nalij po čárku',
  jidlo: '🍽️ Host si objednal jídlo – kuchařka už vaří. Až zazvoní zvonek, vyzvedni talíř na okénku kuchyně',
  okenko: '🔔 Jídlo je na okénku! Vezmi talíř a dones ho ke stolu',
  nesJidlo: '🍽️ Neseš jídlo – dones ho hostovi, který si ho objednal',
  kuchyne: '📖 Teď si můžeš v knize otevřít kuchyni (záložka Kuchyně) – hosté pak budou chtít i jídlo',
  personal: '📖 V knize si můžeš najmout personál (záložka Personál) – pomůže ti sbírat sklenice, nosit a vybírat'
};
/* =========================================================
   6) TYPY HOSTŮ – vzhled, oblíbená piva a co říkají
   {p} = pozdrav, {o} = objednávka, {j} = jméno výčepního (Franto, šéfe…)
   styl: trup, spodek, pokryvka, vlasy, vousy, doplňky → poskládá je j07
   ========================================================= */
const OSLOVENI = ['šéfe', 'mladej', 'Franto', 'pane vrchní', 'kámo', 'hospodskej'];

const TYPY_HOSTU = [
  {
    id: 'stamgast', nazev: 'Štamgast', vaha: 3, muz: 0.95, vek: [50, 78], bar: 0.65, parta: [1, 1, 1, 2], dalsiKolo: 0.7,
    piva: { r10: 4, g10: 3, r12: 2, k: 1, pu: 1 },
    styl: { trup: ['kosile', 'svetr', 'vesta', 'flanel'], spodek: ['kalhoty'], pokryvka: [['bekovka', 0.45]], vlasy: ['kratke', 'pleš', 'pleš'],
      vousy: [['knir', 0.45], ['plnovous', 0.15]], bricho: 0.75 },
    pozdravy: ['Nazdar, {j}!', 'Tak jsem tu zase.', 'Dobrej večír.', 'Čau {j}, jak se vede?', 'Zdar, {j}.', 'No nazdar.'],
    objednavky: ['{p} Jako vždycky – {o}.', '{p} Dej mi {o}, ať se nezapotím.', '{p} {o}, a ať je studený!', '{p} Nalej mi {o}, {ženská|chlap} je u tchýně.',
      '{p} Tak co, {o}? Jasně že jo.', '{p} {o}, pro začátek.', '{p} Dneska si dám {o}. Jako včera.'],
    dekuje: ['Zlatý ruce, {j}!', 'To je krása, díky.', 'Takhle se to má točit!', 'No vidíš, že to jde.', 'Na zdraví, {j}!'],
    vola: ['{j}, ještě jedno!', 'Haló, tady to vyschlo!', '{j}, pojď sem!', 'Pane vrchní, prosím!', 'Hej, obsluha!'],
    plati: ['{j}, zaplatím!', 'Spočítej mi to, půjdu.', 'Tak kolik ti dlužím?', 'Zaplatím, {ženská|chlap} volá.'],
    odchazi: ['Tak zítra, {j}!', 'Měj se, zítra zas.', 'Dobrou, {j}.'],
    nastvany: ['Za dvacet let jsem tu tak dlouho {nečekal|nečekala}!', 'To dřív nebývalo, {j}.', 'Jdu k Jelenovi, tam točí rychlejc.'],
    ceka: ['Tak co, {j}, zapomněls na mě?', 'Tady to nějak vázne…', 'Já tu snad zakořením.']
  },
  {
    id: 'delnik', nazev: 'Dělník po šichtě', vaha: 3, muz: 0.9, vek: [22, 58], bar: 0.45, parta: [1, 2, 2, 3], dalsiKolo: 0.55,
    piva: { g10: 4, r10: 3, r12: 2, k: 1, rb: 1 },
    styl: { trup: ['monterky', 'tricko', 'mikina'], spodek: ['monterky', 'dziny'], pokryvka: [['helma', 0.2], ['ksiltovka', 0.3], ['kulich', 0.15]],
      vlasy: ['kratke', 'jezek', 'kratke'], vousy: [['strniste', 0.4], ['plnovous', 0.2]], bricho: 0.3 },
    pozdravy: ['Zdar!', 'Nazdar, {j}.', 'Ahoj.', 'Čau, chlape.', 'Dobrej.'],
    objednavky: ['{p} Po šichtě potřebuju {o}.', '{p} {o}, rychle, mám žízeň jak trám!', '{p} Dvanáct hodin na stavbě… {o}, prosím.',
      '{p} Šéf dneska řval, tak {o}.', '{p} Hoď mi {o}.', '{p} {o}, ať spláchnu ten prach.'],
    dekuje: ['Díky, zachránils mi život.', 'To je ono!', 'Paráda, chlape.', 'Díky moc.', 'Konečně!'],
    vola: ['Hej, {j}! Ještě jedno!', '{j}, objednáme!', 'Haló, tady!', 'Šéfe, sem!'],
    plati: ['Zaplatím, ráno vstávám.', '{j}, kolik to dělá?', 'Platím, musím na autobus.'],
    odchazi: ['Tak ahoj!', 'Díky, zejtra zas.', 'Čau.'],
    nastvany: ['To se nedá, jdu jinam.', 'Na tohle nemám čas.', 'Ještě že nemám žízeň jak vždycky…'],
    ceka: ['Tak co, bude to?', 'Já mám žízeň jak trám!', 'Ty tam spíš, {j}?']
  },
  {
    id: 'student', nazev: 'Student', vaha: 3, muz: 0.55, vek: [19, 26], bar: 0.25, parta: [1, 2, 3, 3], dalsiKolo: 0.45,
    piva: { g10: 4, r10: 4, k: 2, rb: 1 },
    styl: { trup: ['mikina', 'tricko', 'mikina'], spodek: ['dziny', 'kratasy'], pokryvka: [['sluchatka', 0.3], ['kulich', 0.2], ['ksiltovka', 0.15]],
      vlasy: ['kudrny', 'mikado', 'dlouhe', 'culik', 'jezek'], vousy: [['strniste', 0.15]], batoh: 0.5 },
    pozdravy: ['Ahoj!', 'Čau.', 'Zdravím.', 'Ahojky.', 'Nazdar.'],
    objednavky: ['{p} Dáme {o}, prosím.', '{p} Po zkoušce si dám {o}.', '{p} Máte {o}? Super, tak sem s tím.', '{p} {o}, prosím, stipendium přišlo!',
      '{p} Prosím {o}. Zítra mám zápočet, ale co.', '{p} Tak jo, {o}.'],
    dekuje: ['Díky moc!', 'Super, děkuju.', 'Paráda!', 'Ty jo, hezky natočený.', 'Díky!'],
    vola: ['Prosím vás!', 'Haló, můžem objednat?', 'Promiňte, prosím!', 'Pane, objednáme si!'],
    plati: ['Zaplatíme, prosím!', 'Můžu platit?', 'Platíme zvlášť… teda dohromady!'],
    odchazi: ['Díky, ahoj!', 'Čau!', 'Děkujem, mějte se.'],
    nastvany: ['Tak nic, jdem jinam.', 'Fakt dlouhý čekání…', 'Jdeme na kolej.'],
    ceka: ['Asi nás nevidí…', 'Haló, jsme tady!', 'Za chvíli mi ujede tramvaj.']
  },
  {
    id: 'turista', nazev: 'Turista', vaha: 2, muz: 0.6, vek: [25, 65], bar: 0.5, parta: [1, 2, 2], dalsiKolo: 0.35, cizinec: true,
    piva: { pu: 5, k: 3, r12: 2, g10: 1 },
    styl: { trup: ['havajska', 'tricko'], spodek: ['kratasy', 'kalhoty'], pokryvka: [['ksiltovka', 0.4], ['slamak', 0.25]],
      vlasy: ['kratke', 'pleš', 'dlouhe', 'culik'], vousy: [['plnovous', 0.15]], slunecni: 0.45, fotak: 0.6 },
    pozdravy: ['Hello!', 'Hallo!', 'Dobrý den… right?', 'Ahoj! Ha, I know Czech!', 'Good evening!'],
    objednavky: ['{p} Beer, please – {o}!', '{p} Bier, bitte – {o}!', '{p} Pivo prosím… {o}?', '{p} I want the famous one: {o}!',
      '{p} {o}, please. Best beer in the world, yes?', '{p} Birra, per favore… ehm, {o}!'],
    dekuje: ['Thank you! Very good!', 'Danke schön!', 'Děkuji! Ha!', 'Wow, so much foam, I love it!', 'Amazing!'],
    vola: ['Excuse me!', 'Hallo, bitte!', 'Sorry, can we order?', 'Pane… pan… waiter!'],
    plati: ['The bill, please!', 'Die Rechnung, bitte!', 'Can I pay with card? No? Okay, cash!', 'Zaplatit… pay!'],
    odchazi: ['Na zdraví! Bye!', 'Tschüss!', 'Thank you, see you!'],
    nastvany: ['Too slow, sorry!', 'Wir gehen…', 'Okay, we go somewhere else.'],
    ceka: ['Hello? Anybody?', 'Is this self-service?', 'Hallo? Bitte?']
  },
  {
    id: 'fanousek', nazev: 'Hokejový fanoušek', vaha: 2, muz: 0.8, vek: [18, 55], bar: 0.35, parta: [2, 2, 3, 3], dalsiKolo: 0.6,
    piva: { g10: 4, r10: 3, r12: 2, pu: 1 },
    styl: { trup: ['dres', 'dres', 'mikina'], spodek: ['dziny', 'kalhoty'], pokryvka: [['ksiltovka', 0.3], ['kulich', 0.2]],
      vlasy: ['kratke', 'jezek', 'pleš', 'culik'], vousy: [['strniste', 0.3], ['plnovous', 0.15]], sala: 0.7, bricho: 0.3 },
    pozdravy: ['Zdar, jdeme na hokej!', 'Ahoj! Dneska vyhrajem!', 'Nazdar, {j}!', 'Pojď, Češi, pojď!'],
    objednavky: ['{p} {o}, ať to dneska vyhrajem!', '{p} Na první třetinu {o}!', '{p} Rychle {o}, za chvíli buly!',
      '{p} {o}, a pusť tam hokej!', '{p} Na zdraví našich – {o}!'],
    dekuje: ['Díky! Gól!', 'Paráda, jako gól v prodloužení!', 'Díky, {j}, jsi borec.', 'To je hladinka jak z mistrovství!'],
    vola: ['{j}, další kolo!', 'Haló, přestávka, objednáme!', 'Šéfe, sem!', 'Tady, tady!'],
    plati: ['Platíme, jdeme slavit jinam!', 'Kolik to dělá, {j}?', 'Zaplatíme, zápas skončil.'],
    odchazi: ['Čau a hokeji zdar!', 'Díky, příště zas!', 'Ahoj!'],
    nastvany: ['Takhle dlouho trvá celá třetina!', 'Jdeme, propásnem zápas.', 'To je horší než rozhodčí!'],
    ceka: ['Tak co, bude to do konce zápasu?', 'Haló, je přestávka!', 'Rychle, ať stihnem druhou třetinu!']
  },
  {
    id: 'byznys', nazev: 'Pán v obleku', vaha: 2, muz: 0.75, vek: [30, 60], bar: 0.5, parta: [1, 1, 2], dalsiKolo: 0.3,
    piva: { pu: 5, r12: 3, rb: 2 },
    styl: { trup: ['saco', 'saco', 'kosile'], spodek: ['kalhoty'], pokryvka: [], vlasy: ['pesinka', 'kratke', 'drdol', 'pleš'],
      vousy: [['strniste', 0.2]], bryle: 0.35, kravata: 0.8 },
    pozdravy: ['Dobrý večer.', 'Dobrý den.', 'Zdravím vás.', 'Dobrý večer, pane vrchní.'],
    objednavky: ['{p} {Prosil|Prosila} bych {o}.', '{p} Mohu poprosit o {o}?', '{p} Po poradě si dám {o}.', '{p} {o}, prosím. Rychle, mám schůzku.',
      '{p} {Dal|Dala} bych si {o}, děkuji.'],
    dekuje: ['Děkuji, výborné.', 'Velmi pěkně natočené.', 'Děkuji vám.', 'Excelentní.'],
    vola: ['Pane vrchní!', 'Prosím vás!', 'Mohl byste, prosím?', 'Obsluha, prosím.'],
    plati: ['Zaplatím, prosím.', 'Účet, prosím.', 'Mohu platit? Spěchám.'],
    odchazi: ['Na shledanou.', 'Děkuji, hezký večer.', 'Sbohem.'],
    nastvany: ['Nemám čas tu sedět.', 'To je neprofesionální.', 'Zrušeno. Odcházím.'],
    ceka: ['Čas jsou peníze…', 'Pane vrchní?', 'Hm. Ještě pořád nic.']
  }
];
TYPY_HOSTU.push(
  {
    id: 'rocker', nazev: 'Rocker', vaha: 2, muz: 0.8, vek: [25, 60], bar: 0.55, parta: [1, 1, 2, 3], dalsiKolo: 0.6,
    piva: { r12: 4, rb: 3, r15: 3, k: 1 },
    styl: { trup: ['kozenka', 'tricko', 'kozenka'], spodek: ['dziny', 'kalhoty'], pokryvka: [['kulich', 0.15]], vlasy: ['dlouhe', 'dlouhe', 'cirak', 'pleš'],
      vousy: [['plnovous', 0.45], ['kozi', 0.25]], slunecni: 0.2, bricho: 0.25 },
    pozdravy: ['Zdar!', 'Čus.', 'Rock and roll, {j}!', 'Nazdar, bando.', 'Hej.'],
    objednavky: ['{p} {o}. Hořký jako můj život.', '{p} Dej mi {o}, ať to řve!', '{p} {o}, a pusť tam něco pořádnýho.',
      '{p} Po koncertě potřebuju {o}.', '{p} {o}. Žádný limonády.'],
    dekuje: ['Tohle je ono, {j}!', 'Hořký, jak má bejt. Díky.', 'Rock!', 'Dobrý, chlape.'],
    vola: ['Hej, {j}!', 'Další kolo, bando!', 'Šéfe, ještě!', 'Tady to vyschlo!'],
    plati: ['Platím, jdu na zkoušku.', 'Kolik, {j}?', 'Zaplatím a mizím.'],
    odchazi: ['Čus!', 'Rock and roll!', 'Měj se.'],
    nastvany: ['Na tohle kašlu, jdu jinam.', 'Pomalý jak balada.', 'Tohle je horší než dechovka.'],
    ceka: ['Tak co, bude to?', 'Hej, já tu čekám!', 'To je pomalý jak balada.']
  },
  {
    id: 'myslivec', nazev: 'Myslivec', vaha: 1, muz: 0.95, vek: [40, 75], bar: 0.5, parta: [1, 2, 3], dalsiKolo: 0.55,
    piva: { r12: 4, k: 3, r10: 2, pu: 1 },
    styl: { trup: ['myslivecka', 'flanel'], spodek: ['kalhoty'], pokryvka: [['myslivecky', 0.85]], vlasy: ['kratke', 'pleš'],
      vousy: [['knir', 0.5], ['plnovous', 0.3]], bricho: 0.45, barvy: 'lesni' },
    pozdravy: ['Myslivosti zdar!', 'Dobrý večer.', 'Lovu zdar!', 'Zdravím, {j}.'],
    objednavky: ['{p} Na úspěšný hon – {o}.', '{p} {Dal|Dala} bych si {o}, ať se zahřeju.', '{p} {o}, a pro psa vodu.',
      '{p} Po naháňce {o}.', '{p} Pro mě {o}, prosím.'],
    dekuje: ['Lovu zdar a díky!', 'To bodne.', 'Děkuju, jak se patří.', 'Pěkně, pěkně.'],
    vola: ['Pane vrchní!', '{j}, ještě jedno!', 'Haló, tady myslivci!', 'Prosím!'],
    plati: ['Zaplatím, ráno je čekaná.', 'Kolik dělám?', 'Platíme, psi čekají.'],
    odchazi: ['Myslivosti zdar!', 'Dobrou noc.', 'Tak zase po honu.'],
    nastvany: ['Na čekané jsem {čekal|čekala} kratší dobu.', 'Jdu domů, tady se nic neuloví.', 'To je ostuda.'],
    ceka: ['Tady se čeká jak na divočáka.', 'Pane vrchní?', 'No tak…']
  },
  {
    id: 'seniorka', nazev: 'Paní důchodkyně', vaha: 1, muz: 0.15, vek: [62, 85], bar: 0.15, parta: [1, 2, 2], dalsiKolo: 0.35,
    piva: { k: 5, r10: 2, g10: 2 },
    styl: { trup: ['kardigan', 'kardigan', 'svetr'], spodek: ['sukne', 'kalhoty'], pokryvka: [['klobouk', 0.2]], vlasy: ['drdol', 'kratke', 'kudrny'],
      vousy: [], bryle: 0.7, sedive: true },
    pozdravy: ['Dobrý den, mladý muži.', 'Dobrý večer.', 'Pozdrav pánbůh.', 'Dobrý den, jak se máte?'],
    objednavky: ['{p} {Dal|Dala} bych si {o}, díky moc.', '{p} {Poprosil|Poprosila} bych {o}, doktor říkal, že tmavé je dobré na krev.',
      '{p} {o}, prosím, nebojte se, jsem {zvyklý|zvyklá}.', '{p} Tak mi dejte {o}, když je ta neděle.', '{p} {o}, prosím pěkně.'],
    dekuje: ['Děkuji, zlatíčko.', 'To je hodný chlapec.', 'Děkuji pěkně.', 'Pánbůh zaplať.'],
    vola: ['Mladý muži!', 'Prosím vás pěkně!', 'Haló, pane!', 'Pane vrchní, prosím.'],
    plati: ['Zaplatím, prosím, ať stihnu seriál.', 'Kolik jsem {dlužný|dlužná}?', 'Já bych {zaplatil|zaplatila}.'],
    odchazi: ['Na shledanou, chlapče.', 'Děkuju, hezký den.', 'S pánem bohem.'],
    nastvany: ['Za mých mladých let se obsluhovalo!', 'Tak to už ne.', 'Půjdu domů, mám tam kafe.'],
    ceka: ['Haló, mladý muži?', 'Asi mě přehlédl…', 'Já už jsem {starý|stará}, nemůžu tu čekat věčně.']
  },
  {
    id: 'hipster', nazev: 'Hipster', vaha: 2, muz: 0.6, vek: [22, 38], bar: 0.5, parta: [1, 2, 2], dalsiKolo: 0.4,
    piva: { rb: 5, pu: 3, k: 2, r12: 1 },
    styl: { trup: ['flanel', 'flanel', 'svetr'], spodek: ['dziny'], pokryvka: [['kulich', 0.5]], vlasy: ['drdol', 'pesinka', 'dlouhe', 'mikado'],
      vousy: [['plnovous', 0.7]], bryle: 0.6, batoh: 0.3 },
    pozdravy: ['Čau.', 'Ahoj, máte tady fajn vibe.', 'Zdravím.', 'Nazdar.'],
    objednavky: ['{p} Máte něco lokálního? Tak {o}.', '{p} {o}, ale v pěkné sklenici, prosím.', '{p} Dám si {o}, prý je to kraft… ne?',
      '{p} {o}, prosím. Musím si to vyfotit.', '{p} Dám si {o}. Nefiltrovaný nemáte, že?'],
    dekuje: ['Krásná hladinka, to dám na Insta.', 'Díky, autentický.', 'Super, díky.', 'Tohle má charakter.'],
    vola: ['Promiňte?', 'Ahoj, objednáme si?', 'Prosím tě!', 'Haló!'],
    plati: ['Dá se platit mobilem? Ne? Tak hotově.', 'Zaplatím, díky.', 'Účet, prosím.'],
    odchazi: ['Díky, ciao!', 'Měj se.', 'Super podnik.'],
    nastvany: ['To je dost toxický čekání.', 'Jdu do kavárny.', 'Tohle není můj vibe.'],
    ceka: ['Hm, asi tu je slow service.', 'Haló?', 'Čekám, ale v klidu…']
  },
  {
    id: 'kamaradky', nazev: 'Kamarádky', vaha: 2, muz: 0.0, vek: [20, 45], bar: 0.2, parta: [2, 2, 3, 3], dalsiKolo: 0.5,
    piva: { k: 3, r10: 2, g10: 2, pu: 2, rb: 1 },
    styl: { trup: ['halenka', 'saty', 'svetr', 'tricko'], spodek: ['dziny', 'sukne'], pokryvka: [], vlasy: ['dlouhe', 'culik', 'drdol', 'mikado', 'kudrny'],
      vousy: [], nausnice: 0.6, kabelka: 0.4 },
    pozdravy: ['Ahoj!', 'Čauky.', 'Dobrý večer!', 'Ahojky!', 'Nazdar!'],
    objednavky: ['{p} Holky, co si dáme? … Tak {o}!', '{p} Dáme si {o}, prosím.', '{p} {o}, máme dámskou jízdu!',
      '{p} Prosím {o}. A nějaké brambůrky… ne? Tak jen pivo.', '{p} Tak {o}, ať to pořádně oslavíme.'],
    dekuje: ['Díky, ty jsi zlatej!', 'Ty jo, hezky natočený!', 'Děkujem!', 'Super, díky!'],
    vola: ['Prosím tě!', 'Haló, objednáme!', 'Pane vrchní!', 'Promiň, můžem?'],
    plati: ['Zaplatíme, už musíme.', 'Platíme, prosím!', 'Kolik to dělá, holky platí dohromady.'],
    odchazi: ['Díky, ahoj!', 'Pa pa!', 'Čauky!'],
    nastvany: ['Tak to ne, jdem jinam.', 'To je teda obsluha…', 'Holky, jdeme.'],
    ceka: ['Asi nás nevidí…', 'Haló! Žízníme!', 'Neměli jsme jít radši do vinárny?']
  },
  {
    id: 'sedlak', nazev: 'Sedlák', vaha: 1, muz: 0.85, vek: [35, 70], bar: 0.55, parta: [1, 1, 2], dalsiKolo: 0.55,
    piva: { r10: 4, g10: 3, r12: 2, rb: 2 },
    styl: { trup: ['flanel', 'kosile', 'monterky'], spodek: ['kalhoty', 'monterky'], pokryvka: [['slamak', 0.45], ['bekovka', 0.25]], vlasy: ['kratke', 'pleš'],
      vousy: [['knir', 0.4], ['strniste', 0.3]], bricho: 0.4 },
    pozdravy: ['Pozdrav pánbůh.', 'Dobrej, {j}.', 'Nazdar.', 'Dobrý den.'],
    objednavky: ['{p} Mám za sebou senoseč, dej mi {o}.', '{p} {o}, ať mi vytrávní.', '{p} Kravky podojený, tak {o}.',
      '{p} {Dal|Dala} bych si {o}, ať se mi dobře spí.', '{p} {o}, prosím, a rychle, traktor stojí venku.'],
    dekuje: ['Díky, to bodne.', 'Zaplať pánbůh.', 'Dobrý, dobrý.', 'Takový pivo jinde nemaj.'],
    vola: ['{j}, ještě jedno!', 'Hospodskej!', 'Haló, tady sedlák!', 'Pane vrchní!'],
    plati: ['Zaplatím, ráno se dojí.', 'Kolik to dělá?', 'Platím, {ženská|chlap} čeká.'],
    odchazi: ['Pánbůh zaplať.', 'Tak zase příště.', 'Dobrou.'],
    nastvany: ['Na tohle nemám čas, seno čeká.', 'Pomalý jak traktor do kopce.', 'Jdu domů.'],
    ceka: ['Tady se čeká jak na déšť.', 'Tak co, {j}?', 'No tak…']
  }
);

/* ---------- Jména ---------- */
const JMENA_MUZI = ['Pepa', 'Franta', 'Jarda', 'Mirek', 'Honza', 'Zdeněk', 'Karel', 'Standa', 'Radek', 'Tomáš', 'Ondra', 'Libor', 'Vašek',
  'Lojza', 'Kuba', 'Bohouš', 'Ludva', 'Milan', 'Jirka', 'Petr', 'Martin', 'Lukáš', 'Pavel', 'Vojta', 'Dan', 'Michal', 'Zbyněk', 'Láďa',
  'Míra', 'Kamil', 'Tonda', 'Vláďa', 'Jindra', 'Ríša', 'Slávek', 'Oldřich'];
const JMENA_ZENY = ['Petra', 'Jana', 'Lenka', 'Míša', 'Bára', 'Alena', 'Věra', 'Kamila', 'Iveta', 'Marcela', 'Dáša', 'Štěpánka', 'Hanka',
  'Eva', 'Simona', 'Lucka', 'Klára', 'Zuzka', 'Markéta', 'Verča', 'Týna', 'Monika', 'Jarmila', 'Božena', 'Anička', 'Kačka'];
const JMENA_CIZINCI = ['John', 'Mike', 'Emma', 'Hans', 'Klaus', 'Greta', 'Sarah', 'Pierre', 'Marco', 'Kenji', 'Lars', 'Olivia'];
const PRIJMENI_TITULY = { seniorka: ['paní Nováková', 'paní Dvořáková', 'babička Věra', 'paní Jarmila', 'paní Božena'], byznys: ['pan inženýr', 'pan doktor', 'pan ředitel', 'paní inženýrka'],
  znalec: ['pan degustátor', 'pan recenzent', 'paní degustátorka', 'paní recenzentka', 'pan sládek v.v.'] };

/* ---------- Společné hlášky pro všechny ---------- */
const KONCE = ['', '', '', ' Díky!', ' Děkuju.', ' Na zdraví!', ' Ať to klouže.', ' 😄'];
const HLASKY_SPATNE = ['Tohle jsem {nechtěl|nechtěla}!', 'To není moje pivo.', 'Vedle, kamaráde.', 'Ne ne, já {chtěl|chtěla} něco jiného.', 'Spletls to, {j}.'];
const HLASKY_NIC_MOC = ['No… příště plnou míru, jo?', 'Hmm, to je samá pěna.', 'Tak jo… ale nic moc.', 'To je šnyt, ne hladinka.', 'Míra by mohla bejt lepší.'];
const HLASKY_DALSI_KOLO = ['Ještě jednou to samý!', 'To bylo dobrý, dáme ještě.', 'Další kolo!', 'Ještě jedno, ať nejsem na jednu nohu.',
  'Tak ještě jedno a dost.', 'Pivo je dobrý, dáme si další.'];
const HLASKY_ZAPLACENO = ['Tady máš, a drobný si nech.', 'Díky, bylo to fajn.', 'Sedí to. Díky!', 'Tady, a ještě něco navíc.', 'Díky za obsluhu!'];
const HLASKY_BEZ_DYSKA = ['Tady máš. Přesně.', 'Na dýško zapomeň.', 'No, tady máš, ale dýško nečekej.'];
/* =========================================================
   7) PANÁKY – deset lahví na zadním pultu, nalévá se po čárku
   x = poloha lahve ve stojanu, tvar = tvar lahve (j03b),
   pruhlednost = jak moc je pálenka v panákovce vidět (čirá ~ 0,2)
   barva = pálenka, lahev = barva skla,
   etiketa = [podklad, písmo, ozdoba], vzor = vlastní kresba na etiketě
   nazvy = jak panáka hosté řeknou, runda = „rundu …“ (2. pád množného čísla)
   ========================================================= */
const PANAKY = [
  {
    id: 'becher', akuzativ: 'Becherovku', nazev: 'Becherovka', kratce: 'Becherovka', cena: 55, tvar: 'placata', pruhlednost: 0.8,
    barva: [0.86, 0.66, 0.28], lahev: [0.16, 0.42, 0.24], etiketa: ['#f3e8c8', '#2e6b3a', '#c7a04a'], vzor: 'ramecek',
    popis: 'Bylinný likér z Karlových Varů podle receptury z roku 1807, 38 %.',
    nazvy: ['Becherovku', 'Becherovičku', 'jednu Becherovku', 'karlovarskou bylinku'], dve: ['dvě Becherovky'], tri: ['tři Becherovky'], runda: 'Becherovek'
  },
  {
    id: 'fernet', akuzativ: 'Fernet', nazev: 'Fernet', kratce: 'Fernet', cena: 50, tvar: 'vysoka', pruhlednost: 0.95,
    barva: [0.17, 0.07, 0.03], lahev: [0.2, 0.13, 0.08], etiketa: ['#efe2c0', '#7a1f1a', '#c7a04a'], vzor: 'pruhy',
    popis: 'Hořký bylinný likér – v hospodách hlavně Fernet Stock z Plzně-Božkova, 35 %.',
    nazvy: ['Fernet', 'Ferneta', 'jednoho Ferneta', 'hořkýho Ferneta'], dve: ['dva Fernety'], tri: ['tři Fernety'], runda: 'Fernetů'
  },
  {
    id: 'jager', akuzativ: 'Jägera', nazev: 'Jägermeister', kratce: 'Jäger', cena: 65, tvar: 'hranata', pruhlednost: 0.93,
    barva: [0.25, 0.09, 0.05], lahev: [0.1, 0.24, 0.13], etiketa: ['#efe6cf', '#2f4a2a', '#b8862b'], vzor: 'list',
    popis: 'Bylinný likér z 56 bylin a koření od firmy z německého Wolfenbüttelu, na trhu od roku 1935, 35 %. Pije se ledově vychlazený.',
    nazvy: ['Jägera', 'jednoho Jägera', 'Jägermeistera', 'ledovýho Jägera'], dve: ['dva Jägery', 'dvakrát Jägera'], tri: ['tři Jägery'], runda: 'Jägerů'
  },
  {
    id: 'slivovice', akuzativ: 'slivovici', nazev: 'Slivovice', kratce: 'Slivovice', cena: 65, tvar: 'kulata', pruhlednost: 0.22,
    barva: [0.97, 0.95, 0.86], lahev: [0.86, 0.9, 0.88], etiketa: ['#fbf3dd', '#4a2a6a', '#7a4a9a'], vzor: 'kruh',
    popis: 'Moravská pálenka ze švestek, obvykle 45–50 %.',
    nazvy: ['slivovici', 'slivku', 'švestkovou', 'jednu slivovici'], dve: ['dvě slivovice'], tri: ['tři slivovice'], runda: 'slivovic'
  },
  {
    id: 'tuzemak', akuzativ: 'tuzemák', nazev: 'Tuzemák', kratce: 'Tuzemák', cena: 45, tvar: 'kulata', pruhlednost: 0.85,
    barva: [0.64, 0.31, 0.08], lahev: [0.9, 0.86, 0.74], etiketa: ['#f5e2b0', '#8a4a12', '#c0392b'], vzor: 'ramecek',
    popis: 'Tuzemský rum – česká klasika z lihu s rumovým aroma, 37,5 %.',
    nazvy: ['tuzemák', 'jeden tuzemák', 'tuzemáka', 'českej rum'], dve: ['dva tuzemáky'], tri: ['tři tuzemáky'], runda: 'tuzemáků'
  },
  {
    id: 'rum', akuzativ: 'rum', nazev: 'Tmavý rum', kratce: 'Rum', cena: 60, tvar: 'baculata', pruhlednost: 0.86,
    barva: [0.5, 0.24, 0.07], lahev: [0.36, 0.22, 0.1], etiketa: ['#f2e3c2', '#5a2e12', '#c9a050'], vzor: 'vlna',
    popis: 'Pravý třtinový rum z Karibiku, zraje v dubových sudech, kolem 40 %.',
    nazvy: ['rum', 'tmavej rum', 'jeden rum', 'pravej rum'], dve: ['dva rumy'], tri: ['tři rumy'], runda: 'rumů'
  },
  {
    id: 'whisky', akuzativ: 'whisky', nazev: 'Whisky', kratce: 'Whisky', cena: 75, tvar: 'hranata', pruhlednost: 0.6,
    barva: [0.78, 0.48, 0.16], lahev: [0.86, 0.88, 0.88], etiketa: ['#201a16', '#ead9ab', '#b8862b'], vzor: 'kosoctverec',
    popis: 'Skotská whisky zraje nejméně tři roky v dubových sudech a má aspoň 40 %.',
    nazvy: ['whisky', 'jednu whisky', 'skotskou', 'whisky bez ledu'], dve: ['dvě whisky'], tri: ['tři whisky'], runda: 'whisky'
  },
  {
    id: 'tequila', akuzativ: 'tequilu', nazev: 'Tequila', kratce: 'Tequila', cena: 60, tvar: 'baculata', pruhlednost: 0.4,
    barva: [0.93, 0.82, 0.52], lahev: [0.84, 0.92, 0.88], etiketa: ['#f6eedc', '#1f6f5a', '#d4482f'], vzor: 'slunce',
    popis: 'Mexická pálenka z modré agáve, hlavně ze státu Jalisco, 35–55 % (obvykle kolem 38 %). Klasicky se solí a citronem.',
    nazvy: ['tequilu', 'jednu tequilu', 'tekilu', 'tequilu se solí'], dve: ['dvě tequily'], tri: ['tři tequily'], runda: 'tequil'
  },
  {
    id: 'zelena', akuzativ: 'zelenou', nazev: 'Zelená', kratce: 'Zelená', cena: 40, tvar: 'vysoka', pruhlednost: 0.7,
    barva: [0.2, 0.74, 0.32], lahev: [0.82, 0.9, 0.84], etiketa: ['#e8f5df', '#1f7a3a', '#9ccc65'], vzor: 'list',
    popis: 'Peprmintový likér, hospodská klasika, kolem 20 %.',
    nazvy: ['zelenou', 'peprmintku', 'jednu zelenou'], dve: ['dvě zelené'], tri: ['tři zelené'], runda: 'zelených'
  },
  {
    id: 'vodka', akuzativ: 'vodku', nazev: 'Vodka', kratce: 'Vodka', cena: 50, tvar: 'vysoka', pruhlednost: 0.18,
    barva: [0.95, 0.96, 0.99], lahev: [0.86, 0.9, 0.96], etiketa: ['#ffffff', '#1f3f7a', '#c0392b'], vzor: 'pruhy',
    popis: 'Čirá vodka, 37,5–40 %.',
    nazvy: ['vodku', 'jednu vodku', 'vodečku'], dve: ['dvě vodky'], tri: ['tři vodky'], runda: 'vodek'
  }
];
PANAKY.forEach((p, i) => {
  p.druh = 'panak';
  p.sklo = 'panak';
  p.odemknout = 0;
  p.x = 0.42 + i * 0.27;  // deset lahví vedle sebe po 27 cm
  p._barva = new Float32Array([...p.barva, 1]);
  p._tekutina = new Float32Array([...p.barva, p.pruhlednost]);
  p._lahev = new Float32Array([...p.lahev, 0.42]);
});

// U panáku se hodnotí čárka (cejch), ne pěna
const TEXTY_PANAK = {
  perfekt: { text: '🎯 Přesně po čárku!', kratce: '🎯' },
  dobre: { text: '👍 Skoro po čárku', kratce: '👍' },
  pena: { text: '😬 Přes čárku', kratce: '😬' },
  malo: { text: '😕 Pod čárku', kratce: '😕' }
};

// Kdo si dá k pivu panáka: sance = na osobu, runda = celá parta stejného (v dalším kole)
const PANAKY_HOSTU = {
  stamgast: { sance: 0.28, runda: 0.2, vahy: { tuzemak: 3, becher: 3, slivovice: 2, fernet: 2, rum: 1 } },
  delnik: { sance: 0.25, runda: 0.25, vahy: { tuzemak: 3, fernet: 3, vodka: 2, zelena: 1, rum: 1, jager: 1 } },
  student: { sance: 0.3, runda: 0.38, vahy: { jager: 4, zelena: 3, vodka: 3, tequila: 3, tuzemak: 1, becher: 1 } },
  turista: { sance: 0.35, runda: 0.15, vahy: { becher: 5, slivovice: 3, fernet: 1, jager: 1, whisky: 1 } },
  fanousek: { sance: 0.3, runda: 0.4, vahy: { jager: 3, fernet: 3, tuzemak: 2, vodka: 2, zelena: 1, rum: 1 } },
  byznys: { sance: 0.18, runda: 0.1, vahy: { whisky: 5, slivovice: 3, becher: 2, fernet: 1 } },
  rocker: { sance: 0.35, runda: 0.3, vahy: { whisky: 3, fernet: 3, vodka: 2, jager: 2, tuzemak: 1, tequila: 1 } },
  myslivec: { sance: 0.4, runda: 0.3, vahy: { slivovice: 5, jager: 3, becher: 2 } },
  seniorka: { sance: 0.2, runda: 0.05, vahy: { becher: 4, zelena: 2 } },
  hipster: { sance: 0.15, runda: 0.1, vahy: { whisky: 2, becher: 2, slivovice: 2, tequila: 1, fernet: 1 } },
  kamaradky: { sance: 0.32, runda: 0.38, vahy: { tequila: 3, zelena: 3, becher: 2, vodka: 2, jager: 1 } },
  sedlak: { sance: 0.3, runda: 0.2, vahy: { slivovice: 4, tuzemak: 3, rum: 1 } },
  znalec: { sance: 0, runda: 0, vahy: {} }
};

/* ---------- Pivní znalec – vzácný host, který hodnotí hladinku ---------- */
TYPY_HOSTU.push({
  id: 'znalec', nazev: 'Pivní znalec', znalec: true, vaha: 0.7, muz: 0.75, vek: [35, 70], bar: 0.75, parta: [1], dalsiKolo: 0.25,
  piva: { r10: 1, r12: 1, r15: 1, g10: 1, k: 1, pu: 1, rb: 1, ratar: 1, k11: 1, rbc: 1 },
  styl: { trup: ['saco', 'vesta'], spodek: ['kalhoty'], pokryvka: [['klobouk', 0.4]], vlasy: ['pesinka', 'pleš', 'kratke'],
    vousy: [['knir', 0.5], ['kozi', 0.2]], bryle: 0.8, kravata: 0.7 },
  pozdravy: ['Dobrý večer. {Přišel|Přišla} jsem na degustaci.', 'Zdravím. Prý tu točíte dobře.', 'Dobrý den. Uvidíme, jak tu čepujete.'],
  objednavky: ['{p} Načepujte mi {o}. Budu hodnotit hladinku.', '{p} {o}, prosím. A pořádnou hladinku, píšu recenze.', '{p} Dám si {o}. Pěna má být krémová a hustá.'],
  dekuje: ['Výborně! Krémová pěna, správná míra. Do průvodce to napíšu.', 'Excelentní hladinka. Tohle je řemeslo.', 'Bravo. Tady umí čepovat.'],
  vola: ['Pane výčepní!', 'Prosím vás!', 'Haló, degustace!'],
  plati: ['Zaplatím. Recenze bude… uvidíme.', 'Účet, prosím.', 'Zaplatím, děkuji.'],
  odchazi: ['Na shledanou, recenzi najdete na internetu.', 'Děkuji, sbohem.', 'Hezký večer.'],
  nastvany: ['Tohle do průvodce nenapíšu.', 'Nula hvězdiček za obsluhu.', 'Odcházím, takhle dlouho se na pivo nečeká.'],
  ceka: ['Čas je pro pivo důležitý…', 'Pivo má být čerstvé, ne já {starý|stará}.', 'Hm.']
});

/* ---------- Další hlášky ---------- */
const HLASKY_ZNALEC_SPATNE = ['Tohle není hladinka, to je šnyt.', 'Pod míru? To si zapíšu.', 'Pěna jak ze saponátu. Výtka.', 'To bych do průvodce nenapsal.'];
const HLASKY_RUNDA = ['Dáme rundu {r}!', 'Runda {r} pro celej stůl!', '{j}, rundu {r}, slavíme!', 'A teď rundu {r}, ať to stojí za to!', 'Rundu {r}, prosím, platím já!'];
const HLASKY_PRIPITEK = ['Na zdraví!', 'Tak na nás!', 'Zdravíčko!', 'Ať slouží!', 'Na zdraví, ať nám to klouže!', 'Na kamarády!', 'Na tebe, {j}!'];
const HLASKY_PANAK = ['Ááá, to je síla!', 'To bodlo!', 'Brrr, dobrý!', 'Na ex!', 'Tak tohle zahřeje.', 'To pálí!'];
const HLASKY_SMICH = ['Hahaha!', 'Haha, to je dobrý!', 'Tos přehnal!', 'Ne, fakt?', 'Hehe.', 'To ti nevěřím!'];
const HLASKY_GOL = ['GÓÓÓL!', 'Jóóó! Gól!', 'Ten tam spadl!', 'Do sítě!', 'Ano! Ano! Ano!', 'Krása, to je gól!'];
const HLASKY_GOL_SOUPER = ['To snad ne…', 'Ach jo, dostali jsme gól.', 'Ten brankář spí!', 'Rozhodčí je slepej!'];

/* =========================================================
   8) ÚKOLY – splň a dostaneš odměnu do kasy (odměny jsou dvojnásobné)
   hodnota(HRA) vrací, kolik už máš; cil = kolik je potřeba
   ========================================================= */
const UKOLY = [
  { id: 'prvni_pivo', ikona: '🍺', nazev: 'První pivo', popis: 'Natoč první pivo.', cil: 1, odmena: 40, hodnota: (H) => H.natoceno },
  { id: 'piva_25', ikona: '🍺', nazev: 'Výčepní v zácviku', popis: 'Natoč 25 piv.', cil: 25, odmena: 200, hodnota: (H) => H.natoceno },
  { id: 'piva_100', ikona: '🍻', nazev: 'Stálý výčepní', popis: 'Natoč 100 piv.', cil: 100, odmena: 600, hodnota: (H) => H.natoceno },
  { id: 'piva_300', ikona: '🏅', nazev: 'Mistr pípy', popis: 'Natoč 300 piv.', cil: 300, odmena: 1600, hodnota: (H) => H.natoceno },
  { id: 'piva_1000', ikona: '👑', nazev: 'Legenda výčepu', popis: 'Natoč 1 000 piv.', cil: 1000, odmena: 5000, hodnota: (H) => H.natoceno },
  { id: 'prvni_panak', ikona: '🥃', nazev: 'První panák', popis: 'Nalij prvního panáka.', cil: 1, odmena: 60, hodnota: (H) => H.panaku },
  { id: 'panaku_50', ikona: '🥃', nazev: 'Po čárku', popis: 'Nalij 50 panáků.', cil: 50, odmena: 500, hodnota: (H) => H.panaku },
  { id: 'panaky_vsechny', ikona: '🍾', nazev: 'Barman', popis: 'Nalij všech deset druhů panáků.', cil: 10, odmena: 600, hodnota: (H) => Object.keys(H.panakDruhy || {}).length },
  { id: 'serie_5', ikona: '🔥', nazev: 'Jistá ruka', popis: 'Natoč 5 perfektních hladinek v řadě.', cil: 5, odmena: 200, hodnota: (H) => H.nejSerie },
  { id: 'serie_15', ikona: '🔥', nazev: 'Zlatá ruka', popis: 'Natoč 15 perfektních hladinek v řadě.', cil: 15, odmena: 800, hodnota: (H) => H.nejSerie },
  { id: 'serie_30', ikona: '💎', nazev: 'Neomylný', popis: 'Natoč 30 perfektních hladinek v řadě.', cil: 30, odmena: 2000, hodnota: (H) => H.nejSerie },
  { id: 'hoste_20', ikona: '😊', nazev: 'Oblíbená hospoda', popis: 'Měj 20 spokojených hostů.', cil: 20, odmena: 300, hodnota: (H) => H.hostu },
  { id: 'hoste_100', ikona: '🎉', nazev: 'Plný lokál', popis: 'Měj 100 spokojených hostů.', cil: 100, odmena: 1200, hodnota: (H) => H.hostu },
  { id: 'umyto_50', ikona: '🧽', nazev: 'Pán dřezu', popis: 'Umyj 50 sklenic, panákovek a talířů.', cil: 50, odmena: 300, hodnota: (H) => H.umyto },
  { id: 'sud_1', ikona: '🛢️', nazev: 'Narážeč', popis: 'Naraz první nový sud.', cil: 1, odmena: 100, hodnota: (H) => H.vymenySudu },
  { id: 'sud_10', ikona: '🛢️', nazev: 'Sklepmistr', popis: 'Naraz 10 sudů.', cil: 10, odmena: 600, hodnota: (H) => H.vymenySudu },
  { id: 'kasa_25000', ikona: '💰', nazev: 'Plná kasa', popis: 'Měj v kase 25 000 Kč.', cil: 25000, odmena: 600, hodnota: (H) => H.penize },
  { id: 'kasa_100000', ikona: '💎', nazev: 'Boháč', popis: 'Měj v kase 100 000 Kč.', cil: 100000, odmena: 3000, hodnota: (H) => H.penize },
  { id: 'hvezdy_45', ikona: '⭐', nazev: 'Pět hvězd', popis: 'Dosáhni hodnocení hospody 4,5 ★.', cil: 4.5, odmena: 600, hodnota: (H) => Math.floor(H.hodnoceni * 10) / 10 },
  { id: 'vsechna_piva', ikona: '🚰', nazev: 'Plný výčep', popis: 'Měj na čepu všech 10 piv.', cil: 10, odmena: 1000, hodnota: () => PIVA.filter(jeNaCepu).length },
  { id: 'runda', ikona: '🥂', nazev: 'Runda pro všechny', popis: 'Dones partě objednanou rundu panáků.', cil: 1, odmena: 300, hodnota: (H) => H.rund },
  { id: 'znalec', ikona: '🎩', nazev: 'Uznání znalce', popis: 'Natoč pivnímu znalci perfektní hladinku.', cil: 1, odmena: 400, hodnota: (H) => H.znalcu },
  { id: 'hokej', ikona: '🏒', nazev: 'Hokejová noc', popis: 'Odbav celý hokejový zápas (potřebuješ televizi).', cil: 1, odmena: 500, hodnota: (H) => H.zapasu },
  { id: 'tac', ikona: '🍽️', nazev: 'Plný tác', popis: 'Nes najednou 4 nápoje nebo talíře.', cil: 4, odmena: 300, hodnota: (H) => H.nejvicNaTacu },
  { id: 'stoly_10', ikona: '🪑', nazev: 'Velký sál', popis: 'Měj v sále všech 10 stolů.', cil: 10, odmena: 2000, hodnota: () => pocetStolu() },
  { id: 'kuchyne', ikona: '🍳', nazev: 'Otevřeno i s kuchyní', popis: 'Otevři v knize kuchyni.', cil: 1, odmena: 600, hodnota: (H) => H.vylepseni.kuchyne || 0 },
  { id: 'jidlo_1', ikona: '🍽️', nazev: 'První talíř', popis: 'Dones hostovi první jídlo.', cil: 1, odmena: 100, hodnota: (H) => H.jidel || 0 },
  { id: 'jidla_50', ikona: '🍲', nazev: 'Kuchyně jede', popis: 'Vydej 50 jídel.', cil: 50, odmena: 1000, hodnota: (H) => H.jidel || 0 },
  { id: 'jidla_200', ikona: '👨‍🍳', nazev: 'Vyhlášená kuchyně', popis: 'Vydej 200 jídel.', cil: 200, odmena: 3000, hodnota: (H) => H.jidel || 0 },
  { id: 'svickova_20', ikona: '🥩', nazev: 'Jako od babičky', popis: 'Vydej 20 svíčkových.', cil: 20, odmena: 600, hodnota: (H) => (H.jidlaDruhy || {}).svickova || 0 },
  { id: 'jidla_vsechna', ikona: '📜', nazev: 'Ochutnávka', popis: 'Vydej všech osm jídel z lístku.', cil: 8, odmena: 1200, hodnota: (H) => Object.keys(H.jidlaDruhy || {}).length },
  { id: 'pepa', ikona: '🧑‍🍳', nazev: 'Šéf podniku', popis: 'Najmi prvního pomocníka.', cil: 1, odmena: 400, hodnota: () => pocetNajatych() },
  { id: 'personal_3', ikona: '👥', nazev: 'Parta za barem', popis: 'Najmi tři pomocníky.', cil: 3, odmena: 1000, hodnota: () => pocetNajatych() },
  { id: 'personal_6', ikona: '🏆', nazev: 'Plná posádka', popis: 'Najmi všech šest pomocníků.', cil: 6, odmena: 3000, hodnota: () => pocetNajatych() },
  { id: 'mourek', ikona: '🐈', nazev: 'Kamarád Mourka', popis: 'Pohlaď hospodského kocoura Mourka.', cil: 1, odmena: 100, hodnota: (H) => H.pohlazeni || 0 }
];
/* =========================================================
   7b) JÍDLA Z KUCHYNĚ (kuchyně se odemyká v knize)
   uroven = od které úrovně vylepšení „Větší nabídka jídel“ je na lístku
   doba = kolik sekund se vaří, nazvy/dve/tri = jak to hosté objednají
   ========================================================= */
const JIDLA = [
  {
    id: 'svickova', nazev: 'Svíčková na smetaně', kratce: 'Svíčková', cena: 219, doba: 22, uroven: 0, ikona: '🥩',
    omacka: [0.93, 0.66, 0.36], popis: 'Hovězí svíčková na smetaně s houskovým knedlíkem, brusinkami, citronem a šlehačkou.',
    nazvy: ['svíčkovou', 'jednu svíčkovou', 'svíčkovou s knedlíkem', 'svíčkovou na smetaně'], dve: ['dvakrát svíčkovou', 'dvě svíčkové'], tri: ['třikrát svíčkovou'],
    en: 'svíčková – beef in cream sauce', hlasky: ['Svíčková jako od babičky!', 'Tady se brusinky nešetří.', 'Šest knedlíků a mám po starostech.']
  },
  {
    id: 'gulas', nazev: 'Hovězí guláš', kratce: 'Guláš', cena: 189, doba: 18, uroven: 0, ikona: '🍲',
    omacka: [0.55, 0.2, 0.08], popis: 'Hovězí guláš na cibuli a paprice s houskovým knedlíkem.',
    nazvy: ['guláš', 'jeden guláš', 'guláš s knedlíkem', 'hovězí guláš'], dve: ['dvakrát guláš', 'dva guláše'], tri: ['třikrát guláš'],
    en: 'goulash with dumplings', hlasky: ['Pořádně pálivej, jak má bejt!', 'K tomu guláši pivo jak víno.', 'Tenhle guláš by se dal jíst lžící i bez knedlíků.']
  },
  {
    id: 'smazak', nazev: 'Smažený sýr', kratce: 'Smažák', cena: 179, doba: 26, uroven: 0, ikona: '🧀',
    omacka: [0.97, 0.95, 0.84], popis: 'Smažený eidam s hranolky a tatarskou omáčkou.',
    nazvy: ['smažák', 'smažený sýr', 'smažák s hranolkama', 'jeden smažák'], dve: ['dva smažáky', 'dvakrát smažák'], tri: ['tři smažáky'],
    en: 'fried cheese with fries', hlasky: ['Smažák s tatarkou, klasika!', 'Sýr se krásně táhne.', 'Hranolky křupou, paráda.']
  },
  {
    id: 'utopenec', nazev: 'Utopenec', kratce: 'Utopenec', cena: 89, doba: 7, uroven: 0, ikona: '🌭',
    omacka: [0.78, 0.55, 0.3], popis: 'Nakládaný špekáček s cibulí a feferonkou, k tomu chléb.',
    nazvy: ['utopence', 'jednoho utopence', 'utopence s chlebem'], dve: ['dva utopence'], tri: ['tři utopence'],
    en: 'pickled sausage', hlasky: ['Cibulka, pivo, utopenec – ráj.', 'Utopenec jak z pražský putyky!', 'Ten je pěkně uleželej.']
  },
  {
    id: 'rizek', nazev: 'Vepřový řízek', kratce: 'Řízek', cena: 199, doba: 30, uroven: 1, ikona: '🍖',
    omacka: [0.95, 0.88, 0.62], popis: 'Smažený vepřový řízek s bramborovým salátem a plátkem citronu.',
    nazvy: ['řízek', 'řízek se salátem', 'jeden řízek', 'smaženej řízek'], dve: ['dva řízky', 'dvakrát řízek'], tri: ['tři řízky'],
    en: 'schnitzel with potato salad', hlasky: ['Řízek přes celej talíř!', 'Ten bramborovej salát je jak na Vánoce.', 'Strouhanka drží, to je řemeslo.']
  },
  {
    id: 'pivnisyr', nazev: 'Pivní sýr', kratce: 'Pivní sýr', cena: 99, doba: 11, uroven: 1, ikona: '🧀',
    omacka: [0.96, 0.78, 0.4], popis: 'Pivní sýr s cibulí, hořčicí a máslem, k tomu chléb.',
    nazvy: ['pivní sýr', 'pivní sýr s chlebem', 'jeden pivní sýr'], dve: ['dva pivní sýry'], tri: ['tři pivní sýry'],
    en: 'beer cheese spread', hlasky: ['K pivu nic lepšího není.', 'Pivní sýr s cibulí, nádhera.', 'Teď mi bude pivo chutnat dvakrát.']
  },
  {
    id: 'topinky', nazev: 'Topinky s česnekem', kratce: 'Topinky', cena: 79, doba: 16, uroven: 2, ikona: '🍞',
    omacka: [0.8, 0.58, 0.28], popis: 'Tři topinky usmažené dozlatova a potřené česnekem.',
    nazvy: ['topinky', 'topinky s česnekem', 'porci topinek'], dve: ['dvakrát topinky', 'dvě porce topinek'], tri: ['třikrát topinky'],
    en: 'garlic toast', hlasky: ['Ten česnek je cítit přes celou hospodu!', 'Křupavý, jak to má bejt.', 'Na zítřejší poradu ideální…']
  },
  {
    id: 'hermelin', nazev: 'Nakládaný hermelín', kratce: 'Hermelín', cena: 109, doba: 7, uroven: 2, ikona: '🧀',
    omacka: [0.92, 0.72, 0.35], popis: 'Hermelín naložený v oleji s cibulí, feferonkou a kořením, k tomu chléb.',
    nazvy: ['nakládaný hermelín', 'hermelín', 'jeden hermelín'], dve: ['dva hermelíny'], tri: ['tři hermelíny'],
    en: 'pickled camembert', hlasky: ['S tou feferonkou to pálí!', 'Hermelín je pěkně uleželej.', 'Chleba do oleje a je mi hej.']
  }
];
JIDLA.forEach((j) => { j.druh = 'jidlo'; j._omacka = new Float32Array([...j.omacka, 1]); });

// Všechno, co se dá nalít (piva i panáky); jídla jsou zvlášť
const NAPOJE = [...PIVA, ...PANAKY];
const jePanak = (id) => PANAKY.some((p) => p.id === id);
const najdiJidlo = (id) => JIDLA.find((j) => j.id === id);

// Kdo si dá jídlo: sance = na osobu k první objednávce, svacina = v dalším kole, vahy = co má rád
const JIDLA_HOSTU = {
  stamgast: { sance: 0.3, svacina: 0.15, vahy: { utopenec: 4, gulas: 3, pivnisyr: 3, hermelin: 3, topinky: 2, svickova: 1 } },
  delnik: { sance: 0.5, svacina: 0.2, vahy: { gulas: 4, rizek: 3, smazak: 2, utopenec: 2, svickova: 2, topinky: 1 } },
  student: { sance: 0.35, svacina: 0.2, vahy: { smazak: 5, topinky: 3, rizek: 2, gulas: 1, utopenec: 1 } },
  turista: { sance: 0.6, svacina: 0.1, vahy: { svickova: 5, gulas: 4, rizek: 2, smazak: 1, hermelin: 1 } },
  fanousek: { sance: 0.3, svacina: 0.25, vahy: { utopenec: 3, hermelin: 3, topinky: 3, pivnisyr: 2, smazak: 2, gulas: 1 } },
  byznys: { sance: 0.5, svacina: 0.05, vahy: { svickova: 4, rizek: 3, gulas: 2 } },
  rocker: { sance: 0.3, svacina: 0.2, vahy: { gulas: 3, utopenec: 3, hermelin: 2, smazak: 2 } },
  myslivec: { sance: 0.5, svacina: 0.15, vahy: { gulas: 4, svickova: 3, utopenec: 2, hermelin: 1 } },
  seniorka: { sance: 0.45, svacina: 0.05, vahy: { svickova: 5, rizek: 2, gulas: 2 } },
  hipster: { sance: 0.4, svacina: 0.15, vahy: { hermelin: 3, pivnisyr: 3, smazak: 2, topinky: 1 } },
  kamaradky: { sance: 0.45, svacina: 0.2, vahy: { smazak: 3, topinky: 3, hermelin: 2, svickova: 2, rizek: 1 } },
  sedlak: { sance: 0.55, svacina: 0.1, vahy: { gulas: 4, svickova: 3, rizek: 3 } },
  znalec: { sance: 0.15, svacina: 0, vahy: { svickova: 2, gulas: 1 } }
};

/* ---------- Hlášky k jídlu ({jidlo} = co si objednávají) ---------- */
const JIDLO_K_OBJEDNAVCE = [' A k tomu {jidlo}.', ' A ještě {jidlo}, mám hlad jak vlk.', ' A k jídlu {jidlo}, prosím.', ' A přineste {jidlo}.',
  ' A kuchyně ještě vaří? Tak {jidlo}.', ' Mám hlad – {dal|dala} bych si {jidlo}.', ' A pro mě {jidlo}.', ' K tomu {jidlo}, ať to není jen na pivo.'];
const JIDLO_SVACINA = [' A k zakousnutí {jidlo}.', ' A ještě něco k pivu – {jidlo}.', ' Dáme si k tomu {jidlo}.', ' A když už jsme tady, tak {jidlo}.'];
const JIDLO_CIZINEC = [' And {jidlo}, please!', ' Und {jidlo}, bitte!', ' Also food: {jidlo}!'];
const JIDLO_DEKUJE = ['To voní!', 'Mňam, to je porce!', 'Jako od babičky.', 'Konečně, umírám hlady!', 'To vypadá skvěle.', 'Paráda, dobrou chuť!', 'Hmm, to je vůně.', 'Díky, to bude dobrota.'];
const JIDLO_DEKUJE_CIZINEC = ['Delicious!', 'Lecker!', 'Wow, dumplings!', 'Smells great!'];
const JIDLO_CEKA = ['Kde je to jídlo?', 'Kuchyně usnula?', 'Mám hlad jak vlk…', 'Jídlo bude dneska?', 'Snad se to teprve neloupe…', 'Žaludek mi kručí, {j}.'];
const JIDLO_NASTVANY = ['Tak to jídlo si nechte!', 'Na jídlo už nečekám, zrušte to.', 'Najím se doma.', 'Hladem tu umřu, zrušte to jídlo.'];
const JIDLO_STUDENE = ['Je to studený…', 'To jídlo dlouho čekalo, je vlažný.', 'Studená omáčka, no…'];
const JIDLO_JI = ['Výborný!', 'Tohle je poctivý jídlo.', 'Mňam.', 'To je dobrota.', 'Tady se vaří!', 'Kuchařce pochvalu!'];

/* =========================================================
   7c) PERSONÁL – šest pomocníků ve třech rolích, kupují se v knize
   id 'pomocnik' je Pepa z dřívějších verzí (uložená hra ho zná)
   ========================================================= */
const ROLE_PERSONALU = {
  sberac: { nazev: 'Sběrač sklenic', mnozne: 'Sběrači sklenic', ikona: '🧺', cena: 6000,
    popis: 'Sbírá prázdné sklenice, panákovky a talíře ze stolů i z pultu, nosí je do dřezu a umyje je.' },
  cisnik: { nazev: 'Číšník', mnozne: 'Číšníci', ikona: '🤵', cena: 8000,
    popis: 'Přijímá objednávky u stolů a předá je tobě i kuchyni. Roznáší jídlo z okénka a nápoje, které položíš na výdej na konci pultu.' },
  pokladni: { nazev: 'Pokladní', mnozne: 'Pokladní', ikona: '💶', cena: 7000,
    popis: 'Když host chce platit, dojde k němu, vybere peníze i s dýškem a dá je do kasy.' }
};
// vzhled: co se má na postavě přepsat (trup, spodek, vlasy, vousy, barvy, doplňky)
const PERSONAL = [
  { id: 'pomocnik', role: 'sberac', jmeno: 'Pepa', zena: false, vek: 44, popisek: 'Pepa je u nás nejdéle, zná každou sklenici jménem.',
    vzhled: { trup: 'kosile', spodek: 'kalhoty', styl: 'kratke', vousy: 'knir', zastera: '#6e1f17', barvy: { trup: '#f2f1ec', spodek: '#2b2b2e', vlasy: '#3d2616', boty: '#1c120b' } } },
  { id: 'sberac2', role: 'sberac', jmeno: 'Vlasta', zena: true, vek: 36, popisek: 'Vlasta uklidí stůl dřív, než si hosté stihnou obléct bundu.',
    vzhled: { trup: 'tricko', spodek: 'dziny', styl: 'culik', zastera: '#6e1f17', barvy: { trup: '#b5352f', spodek: '#2f4f7f', vlasy: '#a8461f', boty: '#222222' } } },
  { id: 'cisnik1', role: 'cisnik', jmeno: 'Honza', zena: false, vek: 27, popisek: 'Honza nosí čtyři půllitry v jedné ruce a ještě se usmívá.',
    vzhled: { trup: 'vesta', spodek: 'kalhoty', styl: 'pesinka', motylek: true, barvy: { trup: '#1d1d22', kosile: '#ffffff', spodek: '#1d1d22', vlasy: '#2b1a10', boty: '#111111' } } },
  { id: 'cisnik2', role: 'cisnik', jmeno: 'Klára', zena: true, vek: 24, popisek: 'Klára si pamatuje objednávku celého stolu i bez lístku.',
    vzhled: { trup: 'vesta', spodek: 'kalhoty', styl: 'drdol', motylek: true, barvy: { trup: '#1d1d22', kosile: '#ffffff', spodek: '#1d1d22', vlasy: '#5a3a1e', boty: '#111111' } } },
  { id: 'pokladni1', role: 'pokladni', jmeno: 'paní Jiřina', zena: true, vek: 58, popisek: 'Paní Jiřina spočítá útratu z hlavy rychleji než kalkulačka.',
    vzhled: { trup: 'kardigan', spodek: 'sukne', styl: 'mikado', bryle: true, ledvinka: true, barvy: { trup: '#7a2a2a', kosile: '#f5e9d6', spodek: '#2a2a2a', vlasy: '#bdbdbd', boty: '#3b2416' } } },
  { id: 'pokladni2', role: 'pokladni', jmeno: 'Lojza', zena: false, vek: 51, popisek: 'Lojza má číšnickou peněženku po dědovi a drobné vždycky přesně.',
    vzhled: { trup: 'vesta', spodek: 'kalhoty', styl: 'pleš', vousy: 'knir', ledvinka: true, barvy: { trup: '#2e4a3a', kosile: '#f5e9d6', spodek: '#2b2b2e', vlasy: '#7d7d7d', boty: '#1c120b' } } }
];
// Kuchařka přijde s kuchyní
const KUCHARKA = { id: 'kucharka', jmeno: 'kuchařka Jarmila', zena: true, vek: 52,
  vzhled: { trup: 'kosile', spodek: 'kalhoty', styl: 'drdol', zastera: '#f4f4f0', cepiceKuchare: true, barvy: { trup: '#fafaf7', spodek: '#3a3a40', vlasy: '#5a3a1e', boty: '#f0f0f0' } } };

const pocetNajatych = () => PERSONAL.filter((p) => HRA.vylepseni[p.id]).length;
// každý další pomocník je dražší (o 30 % ceny role za každého, koho už máš)
const cenaPomocnika = (p) => Math.round(ROLE_PERSONALU[p.role].cena * (1 + 0.3 * pocetNajatych()) / 100) * 100;

const HLASKY_PERSONALU = {
  objednavka: ['Dobrý den, co si dáte?', 'Copak to bude?', 'Prosím, poslouchám.', 'Tak co si dáme?'],
  zapsano: ['Hned to bude.', 'Zapsáno!', 'Výborná volba.', 'Za chvilku to nesu.'],
  nese: ['Prosím, tady to je.', 'Na zdraví!', 'Ať chutná!', 'Tady máte.'],
  jidlo: ['Dobrou chuť!', 'Pozor, talíř je horký.', 'Ať chutná!', 'Prosím, z kuchyně.'],
  plati: ['Děkujeme, na shledanou!', 'Sedí to, děkuji.', 'Přijďte zas!', 'Děkuji pěkně.'],
  sbira: ['Můžu už odnést?', 'Uklidím vám to.', 'Odnesu prázdné.']
};
/* =========================================================
   8) MATEMATIKA – matice 4×4 (po sloupcích, jako ve WebGL)
   ========================================================= */
const M4 = {
  jednotkova() {
    const m = new Float32Array(16);
    m[0] = m[5] = m[10] = m[15] = 1;
    return m;
  },
  // a · b
  krat(a, b) {
    const o = new Float32Array(16);
    for (let s = 0; s < 4; s++) {
      for (let r = 0; r < 4; r++) {
        o[s * 4 + r] = a[r] * b[s * 4] + a[4 + r] * b[s * 4 + 1] + a[8 + r] * b[s * 4 + 2] + a[12 + r] * b[s * 4 + 3];
      }
    }
    return o;
  },
  // vynásobí libovolný počet matic zleva doprava
  retez(...matice) {
    return matice.reduce((a, b) => M4.krat(a, b));
  },
  perspektiva(fovy, pomer, blizko, daleko) {
    const f = 1 / Math.tan(fovy / 2);
    const m = new Float32Array(16);
    m[0] = f / pomer;
    m[5] = f;
    m[10] = (daleko + blizko) / (blizko - daleko);
    m[11] = -1;
    m[14] = (2 * daleko * blizko) / (blizko - daleko);
    return m;
  },
  posun(x, y, z) {
    const m = M4.jednotkova();
    m[12] = x; m[13] = y; m[14] = z;
    return m;
  },
  meritko(x, y, z) {
    const m = M4.jednotkova();
    m[0] = x; m[5] = y; m[10] = z;
    return m;
  },
  rotX(a) {
    const m = M4.jednotkova();
    const c = Math.cos(a), s = Math.sin(a);
    m[5] = c; m[6] = s; m[9] = -s; m[10] = c;
    return m;
  },
  rotY(a) {
    const m = M4.jednotkova();
    const c = Math.cos(a), s = Math.sin(a);
    m[0] = c; m[2] = -s; m[8] = s; m[10] = c;
    return m;
  },
  rotZ(a) {
    const m = M4.jednotkova();
    const c = Math.cos(a), s = Math.sin(a);
    m[0] = c; m[1] = s; m[4] = -s; m[5] = c;
    return m;
  },
  // přenásobí bod [x, y, z, 1] maticí
  bod(m, x, y, z) {
    return [
      m[0] * x + m[4] * y + m[8] * z + m[12],
      m[1] * x + m[5] * y + m[9] * z + m[13],
      m[2] * x + m[6] * y + m[10] * z + m[14],
      m[3] * x + m[7] * y + m[11] * z + m[15]
    ];
  }
};

// Drobné pomocníky
const omez = (x, min, max) => Math.min(max, Math.max(min, x));
const lerp = (a, b, t) => a + (b - a) * t;
const nahodne = (pole) => pole[Math.floor(Math.random() * pole.length)];
const nahodneCislo = (a, b) => a + Math.random() * (b - a);
const vzdalenost = (x1, z1, x2, z2) => Math.hypot(x2 - x1, z2 - z1);

// Úhel mezi -π a π
function normalizujUhel(a) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

// [r, g, b] → Float32Array pro barvu v shaderu
function rgba(rgb, a = 1) { return new Float32Array([rgb[0], rgb[1], rgb[2], a]); }

// '#ff8800' → [1, 0.53, 0]
function hexNaRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

// Paprsek × koule: vrací vzdálenost k průsečíku nebo null
function paprsekKoule(o, d, stred, r) {
  const lx = stred[0] - o[0], ly = stred[1] - o[1], lz = stred[2] - o[2];
  const t = lx * d[0] + ly * d[1] + lz * d[2];
  if (t < 0) return null;
  const d2 = lx * lx + ly * ly + lz * lz - t * t;
  if (d2 > r * r) return null;
  return t - Math.sqrt(r * r - d2);
}

// Paprsek × kvádr (min, max): vrací vzdálenost nebo null
function paprsekKvadr(o, d, min, max) {
  let t0 = -Infinity, t1 = Infinity;
  for (let i = 0; i < 3; i++) {
    if (Math.abs(d[i]) < 1e-9) {
      if (o[i] < min[i] || o[i] > max[i]) return null;
    } else {
      let a = (min[i] - o[i]) / d[i];
      let b = (max[i] - o[i]) / d[i];
      if (a > b) [a, b] = [b, a];
      t0 = Math.max(t0, a);
      t1 = Math.min(t1, b);
      if (t0 > t1) return null;
    }
  }
  if (t1 < 0) return null;
  return Math.max(t0, 0);
}

// Malý pomocník na vytváření HTML prvků: h('p', {class: 'x'}, 'text')
function h(znacka, vlastnosti = {}, ...deti) {
  const prvek = document.createElement(znacka);
  for (const [klic, hodnota] of Object.entries(vlastnosti)) {
    if (hodnota === null || hodnota === undefined || hodnota === false) continue;
    if (klic === 'class') prvek.className = hodnota;
    else if (klic === 'style') prvek.style.cssText = hodnota;
    else if (klic.startsWith('on') && typeof hodnota === 'function') prvek.addEventListener(klic.slice(2), hodnota);
    else prvek.setAttribute(klic, hodnota === true ? '' : hodnota);
  }
  for (const dite of deti.flat()) {
    if (dite === null || dite === undefined || dite === false) continue;
    prvek.append(dite instanceof Node ? dite : document.createTextNode(String(dite)));
  }
  return prvek;
}
const $ = (id) => document.getElementById(id);
/* =========================================================
   9) WEBGL – plátno, shadery, sítě a kreslení
   Tři kvality grafiky:
   - vysoká: světlo po pixelech, skutečné měkké stíny od nábytku
     i od postav, odrazy okolí (podlaha, pult, sklo, chrom, nerez),
     plastické materiály (cihly, prkna, dlažba), zastínění koutů,
     záře kolem světel a vyhlazené hrany,
   - střední: totéž úsporněji (stíny jen od nábytku, jedna sonda
     odrazů, méně vzorků, menší rozlišení) – výchozí pro telefony,
   - nízká: světlo po vrcholech bez efektů – pro slabé telefony.
   Světla svítí jen ve své místnosti (sál, sklad, kuchyně), takže
   neprosvítají zdmi. Postavy mají „kosti“: jedna síť, 15 matic.
   ========================================================= */
const platno = $('platno');
const gl = platno.getContext('webgl', { antialias: true, alpha: false, preserveDrawingBuffer: false, powerPreference: 'high-performance' })
  || platno.getContext('experimental-webgl');
const rozsireni = {};
const POCET_KOSTI = 16;
const POCET_SVETEL = 16;
const STRIDE = 60; // 15 čísel na vrchol

// Co umí jednotlivé kvality (skutečné možnosti se ještě omezí podle prohlížeče)
const KVALITY = {
  vysoka: { pixely: true, stinMapa: 2048, dynStiny: true, pcss: true, vzorku: 28, sondy: 3, sondaVel: 256, relief: true, post: true, zare: 5, ao: 10, aoSila: 0.85 },
  stredni: { pixely: true, stinMapa: 1024, dynStiny: false, pcss: false, vzorku: 8, sondy: 1, sondaVel: 128, relief: true, post: true, zare: 4, ao: 6, aoSila: 0.7 },
  nizka: { pixely: false, stinMapa: 0, dynStiny: false, pcss: false, vzorku: 0, sondy: 0, sondaVel: 0, relief: false, post: false, zare: 0, ao: 0, aoSila: 0 }
};
let cfg = { ...KVALITY.vysoka };

// Stínová mapa se dívá shora na celou budovu i uličku před ní, lehce šikmo
// (jako by svítila světla u stropu); co je výš než „horni“ (lampy, trámy), stín nevrhá.
const STIN = { x0: -0.4, x1: 20.4, z0: -0.4, z1: 16.4, horni: 2.42, dolni: -0.2, sklonX: 0.08, sklonZ: 0.12, svetloY: 2.5 };
function maticeStinu() {
  const W = STIN.x1 - STIN.x0, Dz = STIN.z1 - STIN.z0, H = STIN.horni, R = STIN.horni - STIN.dolni;
  const m = new Float32Array(16);
  m[0] = 2 / W;
  m[4] = -STIN.sklonX * 2 / W;
  m[5] = -STIN.sklonZ * 2 / Dz;
  m[6] = -2 / R;
  m[9] = 2 / Dz;
  m[12] = 2 * (STIN.sklonX * H - STIN.x0) / W - 1;
  m[13] = 2 * (STIN.sklonZ * H - STIN.z0) / Dz - 1;
  m[14] = 2 * H / R - 1;
  m[15] = 1;
  return m;
}

// Jak se počítá, ve které místnosti bod leží (stejně v JS i v shaderu)
function glslMistnost() {
  const D = SVET.hloubka, s = SVET.sklad, k = SVET.kuchyne;
  const f = (x) => x.toFixed(3);
  return `
float mistnost(vec3 p) {
  if (p.z > ${f(D + 0.08)}) return 3.0;
  if (p.z < ${f(s.z1 + 0.08)} && p.x > ${f(SVET.prepazka + 0.08)} && p.x < ${f(k.x0 - 0.08)}) return 1.0;
  if (p.z < ${f(k.z1 + 0.08)} && p.x > ${f(k.x0 - 0.08)}) return 2.0;
  return 0.0;
}`;
}
function mistnostBodu(x, z) {
  const D = SVET.hloubka, s = SVET.sklad, k = SVET.kuchyne;
  if (z > D + 0.08) return 3;
  if (z < s.z1 + 0.08 && x > SVET.prepazka + 0.08 && x < k.x0 - 0.08) return 1;
  if (z < k.z1 + 0.08 && x > k.x0 - 0.08) return 2;
  return 0;
}

// Filmový tónový převod (ACES) + lehce sytější barvy – na konci každého shaderu.
// Záporná expozice = bez převodu (sondy odrazů si ukládají „surové“ světlo).
const GLSL_TON = `
vec3 tonuj(vec3 x) {
  if (uExpozice < 0.0) return clamp(x * -uExpozice, 0.0, 1.0);
  x *= uExpozice;
  vec3 c = clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0);
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  return mix(vec3(l), c, 1.1);
}`;

const GLSL_PRESNOST = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif`;

const fl = (x) => (Number.isInteger(x) ? x.toFixed(1) : String(x));

function shaderVrcholu(k) {
  return `
attribute vec3 aPoz;
attribute vec3 aNor;
attribute vec4 aBarva;
attribute vec2 aUv;
attribute float aKost;
attribute vec2 aDoplnek;
uniform mat4 uProj;
uniform mat4 uPohled;
uniform mat4 uKosti[${POCET_KOSTI}];
uniform vec4 uUvObdelnik;
${k.stiny ? 'uniform mat4 uStinMat;\nvarying vec3 vStinPoz;' : ''}
${k.pixely ? '' : `uniform vec4 uSvetla[${POCET_SVETEL}];
uniform vec4 uSvetlaB[${POCET_SVETEL}];
uniform vec3 uOkoli;
varying vec3 vSvetlo;
${glslMistnost()}`}
varying vec4 vBarva;
varying vec2 vUv;
varying vec2 vUvSurove;
varying float vHloubka;
varying vec3 vSvet;
varying vec3 vNormala;
varying vec2 vDoplnek;
void main() {
  mat4 m = uKosti[int(aKost + 0.5)];
  vec4 svet = m * vec4(aPoz, 1.0);
  vec3 n = normalize((m * vec4(aNor, 0.0)).xyz);
${k.pixely ? '' : `  vec3 svetlo = uOkoli * (0.68 + 0.32 * n.y);
  float mi = mistnost(svet.xyz);
  for (int i = 0; i < ${POCET_SVETEL}; i++) {
    vec4 L = uSvetla[i];
    if (abs(L.w - mi) < 0.5) {
      vec3 l = L.xyz - svet.xyz;
      float d2 = dot(l, l);
      float lambert = max(dot(n, l * inversesqrt(d2)), 0.0) * 0.8 + 0.2;
      svetlo += uSvetlaB[i].rgb * lambert / (1.0 + d2 * 0.5);
    }
  }
  vSvetlo = svetlo;`}
${k.stiny ? `  // bod pro stínovou mapu je kousek posunutý po normále (proti „stínovým pruhům“)
  vStinPoz = (uStinMat * vec4(svet.xyz + n * ${fl(k.stinPosun)}, 1.0)).xyz * 0.5 + 0.5;` : ''}
  vSvet = svet.xyz;
  vNormala = n;
  vBarva = aBarva;
  vDoplnek = aDoplnek;
  vUvSurove = aUv;
  vUv = uUvObdelnik.xy + aUv * uUvObdelnik.zw;
  vec4 pohled = uPohled * svet;
  vHloubka = -pohled.z;
  gl_Position = uProj * pohled;
}`;
}

function shaderPixelu(k) {
  const N = k.vzorku;
  return `${k.relief ? '#extension GL_OES_standard_derivatives : enable' : ''}
${GLSL_PRESNOST}
uniform sampler2D uTex;
uniform vec4 uTint;
uniform float uEmise;
uniform float uEfekt;
uniform float uCas;
uniform vec3 uMlhaBarva;
uniform float uMlha;
uniform float uLesk;
uniform vec3 uOko;
uniform float uExpozice;
uniform vec4 uMat;      // x = hloubka reliéfu (m), y = postava (světlý obrys), z = 1 → alfa nese masku záře, w = síla odrazů
uniform vec2 uTexel;    // velikost texelu textury (pro reliéf)
${k.pixely ? `uniform vec4 uSvetla[${POCET_SVETEL}];
uniform vec4 uSvetlaB[${POCET_SVETEL}];
uniform vec3 uOkoli;
${glslMistnost()}` : 'varying vec3 vSvetlo;'}
${k.stiny ? `uniform sampler2D uStinMapa;
uniform vec4 uStinInfo;  // x = velikost texelu mapy, y = síla stínů, z = posun hloubky, w = poloměr rozmazání (texely)
varying vec3 vStinPoz;` : ''}
${k.sondy ? `uniform samplerCube uEnv0;
${k.sondy > 1 ? 'uniform samplerCube uEnv1;\nuniform samplerCube uEnv2;' : ''}
uniform vec3 uSondaMin[${k.sondy}];
uniform vec3 uSondaMax[${k.sondy}];` : ''}
varying vec4 vBarva;
varying vec2 vUv;
varying vec2 vUvSurove;
varying float vHloubka;
varying vec3 vSvet;
varying vec3 vNormala;
varying vec2 vDoplnek;
${GLSL_TON}
${k.relief ? `
// Plastický povrch: výška je v alfa kanálu textury, normála se nakloní podle jejího spádu
vec3 relief(vec3 n, vec3 p, vec2 uv, float hloubka) {
  float h0 = texture2D(uTex, uv).a;
  float hx = texture2D(uTex, uv + vec2(uTexel.x, 0.0)).a;
  float hy = texture2D(uTex, uv + vec2(0.0, uTexel.y)).a;
  vec2 dh = vec2(hx - h0, hy - h0) / uTexel * hloubka;
  vec2 dx = dFdx(uv), dy = dFdy(uv);
  float dhx = dot(dh, dx), dhy = dot(dh, dy);
  vec3 px = dFdx(p), py = dFdy(p);
  vec3 r1 = cross(py, n), r2 = cross(n, px);
  float det = dot(px, r1);
  vec3 grad = sign(det) * (dhx * r1 + dhy * r2);
  return normalize(abs(det) * n - grad);
}` : ''}
${k.stiny ? `
float hloubkaMapy(vec2 uv) {
${k.hloubkovaTex ? '  return texture2D(uStinMapa, uv).r;' : `  vec4 c = texture2D(uStinMapa, uv);
  return dot(c, vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0));`}
}
// body na disku rozložené do spirály (Vogel)
vec2 disk(float i, float n, float rot) {
  float r = sqrt((i + 0.5) / n);
  float u = i * 2.39996323 + rot;
  return r * vec2(cos(u), sin(u));
}
// 1 = plně osvětleno, 0 = ve stínu; okraje stínu jsou měkké
float stinovani() {
  vec3 c = vStinPoz;
  if (c.x < 0.002 || c.x > 0.998 || c.y < 0.002 || c.y > 0.998 || c.z > 0.999) return 1.0;
  float z = c.z - uStinInfo.z;
  float rot = 6.2831853 * fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  float polomer = uStinInfo.w * uStinInfo.x;
${k.pcss ? `  // hledání překážek: čím dál je překážka od místa, kam stín padá, tím je stín měkčí
  float blok = 0.0, pocet = 0.0;
  for (int i = 0; i < 8; i++) {
    float d = hloubkaMapy(c.xy + disk(float(i), 8.0, rot) * uStinInfo.x * 14.0);
    if (d < z) { blok += d; pocet += 1.0; }
  }
  if (pocet < 0.5) return 1.0;
  blok /= pocet;
  float yPrek = ${fl(STIN.horni)} - blok * ${fl(STIN.horni - STIN.dolni)};
  float yBod = ${fl(STIN.horni)} - c.z * ${fl(STIN.horni - STIN.dolni)};
  float pol = (yPrek - yBod) * 0.22 / max(${fl(STIN.svetloY)} - yPrek, 0.3);
  polomer = clamp(pol / ${fl(STIN.x1 - STIN.x0)}, uStinInfo.x * 0.9, uStinInfo.x * 13.0);` : ''}
  float sv = 0.0;
  for (int i = 0; i < ${N}; i++) sv += step(z, hloubkaMapy(c.xy + disk(float(i), ${fl(N)}, rot) * polomer));
  return sv / ${fl(N)};
}` : ''}
${k.sondy ? `
// Odraz okolí: směr se „promítne“ do krabice místnosti, aby odraz seděl na místě
vec3 krabice(vec3 r, vec3 p, vec3 bmin, vec3 bmax) {
  vec3 rr = r + vec3(equal(r, vec3(0.0))) * 1e-4;
  vec3 t = max((bmax - p) / rr, (bmin - p) / rr);
  float d = max(min(min(t.x, t.y), t.z), 0.0);
  vec3 stred = vec3((bmin.x + bmax.x) * 0.5, 1.45, (bmin.z + bmax.z) * 0.5);
  // u stěn a stropu by se odraz „zasekl“ na jednom místě → plynule přejít na čistý směr
  return mix(r, normalize(p + r * d - stred), smoothstep(0.1, 0.8, d));
}
vec3 okoli(vec3 r, vec3 p, float mi, float bias) {
${k.sondy > 1 ? `  vec3 a = textureCube(uEnv0, krabice(r, p, uSondaMin[0], uSondaMax[0]), bias).rgb;
  vec3 b = textureCube(uEnv1, krabice(r, p, uSondaMin[1], uSondaMax[1]), bias).rgb;
  vec3 c = textureCube(uEnv2, krabice(r, p, uSondaMin[2], uSondaMax[2]), bias).rgb;
  return mi < 0.5 ? a : (mi < 1.5 ? b : (mi < 2.5 ? c : a * 0.5));` : `  vec3 a = textureCube(uEnv0, krabice(r, p, uSondaMin[0], uSondaMax[0]), bias).rgb;
  vec3 b = textureCube(uEnv0, r, bias).rgb * 0.55;
  return mi < 0.5 ? a : b;`}
}` : ''}
void main() {
  vec4 tex = texture2D(uTex, vUv);
  float texA = uMat.x > 0.0 ? 1.0 : tex.a;
  vec3 zaklad = tex.rgb * vBarva.rgb * uTint.rgb;
  float alfa = uTint.a * texA * vDoplnek.y;
  float alfa0 = alfa;
  float mlha = exp(-uMlha * vHloubka);
  if (uEfekt > 1.5) {
    // světelné efekty (kužel světla pod lampou, záře, prach, pára) – nesvítí se na ně
    if (uEfekt < 2.5) {
      vec3 v = normalize(uOko - vSvet);
      alfa *= pow(abs(dot(normalize(vNormala), v)), 1.4);
    }
    gl_FragColor = vec4(mix(uMlhaBarva, tonuj(zaklad), mlha), alfa);
    return;
  }
  float emise = max(vBarva.a, uEmise);
  float lesk = max(vDoplnek.x, uLesk);
  // kovy s odrazy okolí nepotřebují „svítit“ (na nízké kvalitě jim emise nahrazuje odlesky)
  float kov = smoothstep(0.62, 0.84, lesk) * step(0.97, alfa0) * step(0.001, uMat.w);
  emise *= 1.0 - kov * 0.85;
  if (uEfekt > 0.5) {
    // pivo: odspodu tmavší, nahoře světlejší a stoupají v něm bublinky
    vec2 g = vec2(vUvSurove.x * 26.0, vUvSurove.y * 7.0 - uCas * 1.7);
    vec2 c = fract(g) - 0.5;
    float h = fract(sin(dot(floor(g), vec2(12.9898, 78.233))) * 43758.5453);
    float bublina = smoothstep(0.13, 0.04, length(c + (vec2(h, fract(h * 7.0)) - 0.5) * 0.5)) * step(0.5, h);
    zaklad *= 0.78 + 0.42 * vUvSurove.y;
    zaklad += bublina * 0.28;
    emise = max(emise, 0.12);
  }
  vec3 n = normalize(vNormala);
  vec3 v = normalize(uOko - vSvet);
  float zarivost = 0.0;
${k.relief ? '  if (uMat.x > 0.0) n = relief(n, vSvet, vUv, uMat.x);' : ''}
${k.pixely ? `  float mi = mistnost(vSvet);
  float S = 1.0;
${k.stiny ? `  // stín shora dopadá na vodorovné plochy (podlaha, stoly, pulty, sedáky);
  // stěny a jiné svislé plochy svítí lampy zboku
  float vahaStinu = uStinInfo.y * smoothstep(0.3, 0.75, n.y);
  if (vahaStinu > 0.0) S = mix(1.0, stinovani(), vahaStinu);` : ''}
  vec3 svetlo = uOkoli * (0.68 + 0.32 * n.y) * mix(1.0, S, 0.6);
  vec3 odlesk = vec3(0.0);
  float mocnina = mix(16.0, 160.0, clamp(lesk, 0.0, 1.0));
  for (int i = 0; i < ${POCET_SVETEL}; i++) {
    vec4 L = uSvetla[i];
    if (abs(L.w - mi) < 0.5) {
      vec3 l = L.xyz - vSvet;
      float d2 = dot(l, l);
      vec3 ln = l * inversesqrt(d2);
      vec3 b = uSvetlaB[i].rgb / (1.0 + d2 * 0.5);
      float nl = dot(n, ln);
      svetlo += b * (max(nl, 0.0) * 0.8 + 0.2) * S;
      if (lesk > 0.01 && nl > 0.0) {
        vec3 hv = normalize(ln + v);
        odlesk += uSvetlaB[i].rgb / (1.0 + d2 * 0.25) * pow(max(dot(n, hv), 0.0), mocnina) * S;
      }
    }
  }
  if (uMat.y > 0.0) {
    // postavy: jemně prosvětlené okraje (aby se nerozpily v pozadí)
    float okrajP = pow(1.0 - max(dot(n, v), 0.0), 2.5);
    svetlo += okrajP * uMat.y * (svetlo * 0.55 + vec3(0.06, 0.045, 0.03));
  }
  vec3 barva = zaklad * mix(svetlo, vec3(1.15), emise);
  if (lesk > 0.01) {
    float okraj = pow(1.0 - abs(dot(n, v)), 3.0) * step(0.5, lesk);
    vec3 pridat = lesk * (odlesk * (0.6 + 0.9 * lesk) + okraj * vec3(0.2, 0.17, 0.13));
    barva += pridat;
    zarivost = max(dot(pridat, vec3(0.33)) - 0.55, 0.0);
    alfa = clamp(alfa + dot(pridat, vec3(0.33)) * 0.9, 0.0, 1.0);
  }
${k.sondy ? `  if (lesk > 0.04 && uMat.w > 0.0) {
    // odraz okolí: kovy (chrom, nerez) hlavně odráží, lak a sklo podle úhlu pohledu (Fresnel)
    vec3 r = reflect(-v, n);
    float drsnost = clamp(1.0 - lesk, 0.0, 1.0);
    // uMat.w nad 1 = broušený povrch (nerez, dlažba): rozmazanější odraz
    vec3 env = okoli(r, vSvet, mi, drsnost * 7.0 + max(uMat.w - 1.0, 0.0) * 4.0) * min(uMat.w, 1.0);
    float nv = max(dot(n, v), 0.0);
    float fres = mix(0.04, 0.85, kov) + (1.0 - mix(0.04, 0.85, kov)) * pow(1.0 - nv, 5.0) * (1.0 - drsnost * 0.6);
    // kov: víc kontrastu v odrazu (tmavé tmavší, světla zářivější), barva podle kovu (mosaz, chrom)
    vec3 envK = mix(vec3(dot(env, vec3(0.3, 0.59, 0.11))), env, 0.3);
    vec3 kovovy = envK * (0.35 + 2.1 * envK) * mix(vec3(1.0), zaklad, 0.55) * 1.3;
    barva = mix(barva, barva * 0.15 + kovovy, kov * 0.9);
    vec3 lak = env * fres * (1.0 - kov * 0.8) * (0.55 + lesk);
    barva += lak;
    alfa = clamp(alfa + dot(lak, vec3(0.33)) * 1.4, 0.0, 1.0);
  }` : ''}` : `  vec3 barva = zaklad * mix(vSvetlo, vec3(1.15), emise);
  if (lesk > 0.5) {
    float okraj = pow(1.0 - abs(dot(n, v)), 3.0);
    barva += okraj * vec3(0.2, 0.17, 0.13) * lesk;
    alfa = clamp(alfa + okraj * 0.3, 0.0, 1.0);
  }`}
  vec3 vysledek = mix(uMlhaBarva, tonuj(barva), mlha);
  // u neprůhledných věcí nese alfa „masku záře“: svítidla, neon a ostré odlesky
  float maska = clamp(smoothstep(0.55, 1.0, emise) + zarivost * 1.5, 0.0, 1.0) * mlha;
  gl_FragColor = vec4(vysledek, uMat.z > 0.5 ? maska : alfa);
}`;
}

// Stínový průchod: jen hloubka (postavy mají kosti stejně jako ve scéně)
function shaderStinuVrcholu() {
  return `
attribute vec3 aPoz;
attribute vec3 aNor;
attribute vec4 aBarva;
attribute vec2 aUv;
attribute float aKost;
attribute vec2 aDoplnek;
uniform mat4 uStinMat;
uniform mat4 uKosti[${POCET_KOSTI}];
varying vec3 vSvet;
void main() {
  vec4 svet = uKosti[int(aKost + 0.5)] * vec4(aPoz, 1.0);
  vSvet = svet.xyz;
  gl_Position = uStinMat * svet;
}`;
}
function shaderStinuPixelu(hloubkovaTex) {
  const k = SVET.kuchyne;
  return `${GLSL_PRESNOST}
varying vec3 vSvet;
void main() {
  // v kuchyni nevrhá stín digestoř ani nádobí zavěšené u stropu (svítí pod nimi zářivky)
  if (vSvet.y > 1.8 && vSvet.x > ${fl(k.x0 - 0.1)} && vSvet.z < ${fl(k.stena)}) discard;
${hloubkovaTex ? '  gl_FragColor = vec4(1.0);' : `  vec4 b = fract(gl_FragCoord.z * vec4(1.0, 255.0, 65025.0, 16581375.0));
  b -= b.yzww * vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0);
  gl_FragColor = b;`}
}`;
}

function zkompiluj(typ, zdroj) {
  const s = gl.createShader(typ);
  gl.shaderSource(s, zdroj);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('Shader: ' + gl.getShaderInfoLog(s));
  return s;
}

const ATRIBUTY = ['aPoz', 'aNor', 'aBarva', 'aUv', 'aKost', 'aDoplnek'];
const UNIFORMY = ['uProj', 'uPohled', 'uUvObdelnik', 'uTex', 'uTint', 'uEmise', 'uEfekt', 'uCas', 'uOkoli', 'uMlhaBarva', 'uMlha', 'uLesk', 'uOko', 'uExpozice',
  'uMat', 'uTexel', 'uStinMat', 'uStinMapa', 'uStinInfo', 'uEnv0', 'uEnv1', 'uEnv2'];
const programy = {};      // klíč podle vlastností → { program, loc }
let program = null;
let loc = {};
let kvalitaGrafiky = 'vysoka';
let programStinu = null;  // { program, loc } pro stínovou mapu

function sestavProgram(vs, fs, atributy = ATRIBUTY) {
  const p = gl.createProgram();
  gl.attachShader(p, zkompiluj(gl.VERTEX_SHADER, vs));
  gl.attachShader(p, zkompiluj(gl.FRAGMENT_SHADER, fs));
  // stejné pořadí atributů ve všech programech → stačí jedno nastavení ukazatelů
  atributy.forEach((n, i) => gl.bindAttribLocation(p, i, n));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('Program: ' + gl.getProgramInfoLog(p));
  return p;
}

function vytvorProgram(k) {
  const p = sestavProgram(shaderVrcholu(k), shaderPixelu(k));
  const l = {};
  ATRIBUTY.forEach((n, i) => { l[n] = i; });
  UNIFORMY.forEach((n) => { l[n] = gl.getUniformLocation(p, n); });
  l.uKosti = gl.getUniformLocation(p, 'uKosti[0]');
  l.uSvetla = gl.getUniformLocation(p, 'uSvetla[0]');
  l.uSvetlaB = gl.getUniformLocation(p, 'uSvetlaB[0]');
  l.uSondaMin = gl.getUniformLocation(p, 'uSondaMin[0]');
  l.uSondaMax = gl.getUniformLocation(p, 'uSondaMax[0]');
  gl.useProgram(p);
  gl.uniform1i(l.uTex, 0);
  gl.uniform1i(l.uStinMapa, 1);
  gl.uniform1i(l.uEnv0, 2);
  gl.uniform1i(l.uEnv1, 3);
  gl.uniform1i(l.uEnv2, 4);
  return { program: p, loc: l };
}

function vytvorProgramStinu(hloubkovaTex) {
  const p = sestavProgram(shaderStinuVrcholu(), shaderStinuPixelu(hloubkovaTex));
  return { program: p, loc: { uStinMat: gl.getUniformLocation(p, 'uStinMat'), uKosti: gl.getUniformLocation(p, 'uKosti[0]') } };
}

// Vlastnosti kvality po omezení podle prohlížeče
function vlastnostiKvality(nazev) {
  const k = { ...KVALITY[nazev] };
  if (!rozsireni.derivace) k.relief = false;
  k.stiny = k.stinMapa > 0;
  k.hloubkovaTex = Boolean(rozsireni.hloubka);
  k.stinPosun = k.stinMapa >= 2048 ? 0.014 : 0.024;
  if (!k.pixely) { k.stiny = false; k.sondy = 0; k.relief = false; }
  return k;
}
const klicProgramu = (k) => [k.pixely, k.stiny, k.pcss, k.vzorku, k.sondy, k.relief, k.hloubkovaTex].join('|');

// Přepne kvalitu grafiky: program, stíny, odrazy, postprocesing.
// Když slabá grafika některý shader neumí, zkusí se jednodušší varianta.
function pouzijKvalitu(kvalita) {
  const pokusy = kvalita === 'vysoka' ? ['vysoka', 'stredni', 'nizka'] : kvalita === 'stredni' ? ['stredni', 'nizka'] : ['nizka'];
  let posledniChyba = null;
  for (const nazev of pokusy) {
    const k = vlastnostiKvality(nazev);
    // u jednodušších pokusů postupně vypínej náročné věci
    const varianty = k.pixely ? [k, { ...k, sondy: Math.min(k.sondy, 1) }, { ...k, sondy: 0, relief: false }, { ...k, sondy: 0, relief: false, stiny: false }] : [k];
    for (const v of varianty) {
      const klic = klicProgramu(v);
      try {
        if (!programy[klic]) programy[klic] = vytvorProgram(v);
        if (v.stiny && !programStinu) programStinu = vytvorProgramStinu(v.hloubkovaTex);
        kvalitaGrafiky = nazev;
        cfg = v;
        program = programy[klic].program;
        loc = programy[klic].loc;
        gl.useProgram(program);
        zrusPamatovanyStav();
        if (svetla.length) nastavSvetla(svetla);
        if (typeof pripravRenderer === 'function') pripravRenderer();
        return;
      } catch (e) {
        posledniChyba = e;
        console.warn('Grafika: varianta', nazev, klic, 'nejde –', e.message);
      }
    }
  }
  throw posledniChyba || new Error('Žádný shader nejde zkompilovat');
}

function pripravGL() {
  rozsireni.uint = gl.getExtension('OES_element_index_uint');
  rozsireni.aniso = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
  rozsireni.derivace = gl.getExtension('OES_standard_derivatives');
  rozsireni.hloubka = gl.getExtension('WEBGL_depth_texture') || gl.getExtension('WEBKIT_WEBGL_depth_texture');
  rozsireni.pulFloat = gl.getExtension('OES_texture_half_float');
  rozsireni.pulFloatLin = gl.getExtension('OES_texture_half_float_linear');
  rozsireni.pulFloatBuf = gl.getExtension('EXT_color_buffer_half_float');
  ATRIBUTY.forEach((n, i) => gl.enableVertexAttribArray(i));
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  nastavProlnuti(null);
}

// Průhlednost: null = neprůhledné kreslení, 'alfa' = sklo, stíny, pára, 'pricitani' = záře a kužely světla.
// Alfa kanál cíle se při prolínání nemění – nese masku záře pro postprocesing.
let prolnuti = undefined;
function nastavProlnuti(typ) {
  if (prolnuti === typ) return;
  prolnuti = typ;
  if (!typ) {
    gl.disable(gl.BLEND);
  } else {
    gl.enable(gl.BLEND);
    if (typ === 'pricitani') gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ZERO, gl.ONE);
    else gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
  }
}

/* ---------- Skládání sítí: poloha, normála, barva+emise, uv, kost, lesk+průhlednost ---------- */
class Davka {
  constructor() { this.data = []; this.idx = []; this.n = 0; this.kost = 0; this.lesk = 0; this.alfa = 1; }
  vrchol(x, y, z, nx, ny, nz, barva, e, u, v) {
    this.data.push(x, y, z, nx, ny, nz, barva[0], barva[1], barva[2], e, u, v, this.kost, this.lesk, this.alfa);
    return this.n++;
  }
  ctyruhelnik(a, b, c, d) { this.idx.push(a, b, c, a, c, d); }
}

// Kvádr zadaný rohy (x0,y0,z0)–(x1,y1,z1). opt: uv (opakování textury na metr), e (emise), bez: ['dole', ...]
function kvadr(d, x0, y0, z0, x1, y1, z1, barva, opt = {}) {
  const u = opt.uv || 1;
  const e = opt.e || 0;
  const bez = opt.bez || [];
  const deleni = opt.deleni === undefined ? 0.5 : opt.deleni;
  const steny = [
    ['nahore', [0, 1, 0], [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], (p) => [p[0], -p[2]]],
    ['dole', [0, -1, 0], [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], (p) => [p[0], p[2]]],
    ['jih', [0, 0, 1], [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], (p) => [p[0], p[1]]],
    ['sever', [0, 0, -1], [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]], (p) => [-p[0], p[1]]],
    ['vychod', [1, 0, 0], [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], (p) => [-p[2], p[1]]],
    ['zapad', [-1, 0, 0], [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], (p) => [p[2], p[1]]]
  ];
  for (const [nazev, n, rohy, mapuj] of steny) {
    if (bez.includes(nazev)) continue;
    const [a, b, , c] = rohy;
    const ex = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const ey = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const nx = deleni ? Math.min(40, Math.max(1, Math.ceil(Math.hypot(...ex) / deleni))) : 1;
    const ny = deleni ? Math.min(40, Math.max(1, Math.ceil(Math.hypot(...ey) / deleni))) : 1;
    const zacatek = d.n;
    for (let j = 0; j <= ny; j++) {
      for (let i = 0; i <= nx; i++) {
        const p = [0, 1, 2].map((k) => a[k] + ex[k] * i / nx + ey[k] * j / ny);
        const [tu, tv] = opt.uvCele ? [i / nx, j / ny] : mapuj(p);
        d.vrchol(p[0], p[1], p[2], n[0], n[1], n[2], barva, e, opt.uvCele ? tu : tu * u, opt.uvCele ? tv : tv * u);
      }
    }
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const k = zacatek + j * (nx + 1) + i;
        d.ctyruhelnik(k, k + 1, k + nx + 2, k + nx + 1);
      }
    }
  }
}

// Kvádr se středem a rozměry (pro skládání postav a drobností)
function kostka(d, cx, cy, cz, sx, sy, sz, barva, opt = {}) {
  kvadr(d, cx - sx / 2, cy - sy / 2, cz - sz / 2, cx + sx / 2, cy + sy / 2, cz + sz / 2, barva, { deleni: 0, ...opt });
}

// Zaoblený kvádr (hlavy, trupy, ruce, boty, jídlo): střed, rozměry, poloměr zaoblení r
// kroky = kolik dílků má oblouk na každé hraně (1 = sražená hrana, 2 = hladší)
const OSY_STEN = [
  // [U, V, W] – dvě osy po stěně a normála (stejná orientace jako u kvadr)
  [[1, 0, 0], [0, 0, -1], [0, 1, 0]],
  [[1, 0, 0], [0, 0, 1], [0, -1, 0]],
  [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
  [[-1, 0, 0], [0, 1, 0], [0, 0, -1]],
  [[0, 0, -1], [0, 1, 0], [1, 0, 0]],
  [[0, 0, 1], [0, 1, 0], [-1, 0, 0]]
];
function zaoblenyKvadr(d, cx, cy, cz, sx, sy, sz, barva, r, kroky = 2, e = 0) {
  const pul = [sx / 2, sy / 2, sz / 2];
  r = Math.max(0.0005, Math.min(r, ...pul) * 0.999);
  const vnitrek = pul.map((h) => h - r);
  const t225 = Math.tan(Math.PI / 8);
  const radky = (h, i) => (kroky >= 2 ? [-h, -i - r * t225, -i, i, i + r * t225, h] : [-h, -i, i, h]);
  const absOsa = (v) => (v[0] ? 0 : v[1] ? 1 : 2);
  for (const [U, V, W] of OSY_STEN) {
    const au = absOsa(U), av = absOsa(V), aw = absOsa(W);
    const su = U[au], sv = V[av], sw = W[aw];
    const ru = radky(pul[au], vnitrek[au]), rv = radky(pul[av], vnitrek[av]);
    const zacatek = d.n;
    for (let j = 0; j < rv.length; j++) {
      for (let i = 0; i < ru.length; i++) {
        const p = [0, 0, 0];
        p[au] = ru[i] * su;
        p[av] = rv[j] * sv;
        p[aw] = pul[aw] * sw;
        const q = p.map((x, k) => omez(x, -vnitrek[k], vnitrek[k]));
        let s = [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
        const l = Math.hypot(...s);
        let poz = p;
        if (l > 1e-7) { s = s.map((x) => x / l); poz = q.map((x, k) => x + s[k] * r); } else s = W;
        d.vrchol(cx + poz[0], cy + poz[1], cz + poz[2], s[0], s[1], s[2], barva, e, i / (ru.length - 1), j / (rv.length - 1));
      }
    }
    const nx = ru.length;
    for (let j = 0; j < rv.length - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const k = zacatek + j * nx + i;
        d.ctyruhelnik(k, k + 1, k + nx + 1, k + nx);
      }
    }
  }
}

// Válec: střed podstavy (cx, y0, cz), poloměr r, výška v
function valec(d, cx, y0, cz, r, v, seg, barva, opt = {}) {
  soustruh(d, [[r, 0], [r, v]], seg, barva, { ...opt, posun: [cx, y0, cz], vicko: opt.horni !== false });
}

// Rotační těleso (soustruh): profil [[poloměr, výška], …] odspodu nahoru
// opt.hranaty = exponent „superelipsy“ (např. 6) → lahev se zaoblenými hranami čtvercového průřezu
function soustruh(d, profil, seg, barva, opt = {}) {
  const e = opt.e || 0;
  const [px, py, pz] = opt.posun || [0, 0, 0];
  const vyskaMax = Math.max(...profil.map((b) => b[1])) || 1;
  const tvarObvodu = (hr) => {
    const obvod = [];
    for (let i = 0; i <= seg; i++) {
      const uhel = (i / seg) * Math.PI * 2;
      let s = Math.sin(uhel), c = Math.cos(uhel), ns = s, nc = c;
      if (hr) {
        const mocnina = (x, m) => Math.sign(x) * Math.pow(Math.abs(x), m);
        ns = mocnina(s, 2 - 2 / hr);
        nc = mocnina(c, 2 - 2 / hr);
        s = mocnina(s, 2 / hr);
        c = mocnina(c, 2 / hr);
        const ln = Math.hypot(ns, nc) || 1;
        ns /= ln; nc /= ln;
      }
      obvod.push([s, c, ns, nc]);
    }
    return obvod;
  };
  const kulaty = tvarObvodu(0);
  const hranaty = opt.hranaty ? tvarObvodu(opt.hranaty) : kulaty;
  // hrdlo lahve zůstane kulaté (opt.hranatyDo = do jaké výšky je průřez hranatý)
  const obvodPro = (y) => (opt.hranaty && (opt.hranatyDo === undefined || y <= opt.hranatyDo) ? hranaty : kulaty);
  const radky = [];
  profil.forEach(([r, y], k) => {
    const obvod = obvodPro(y);
    // normála z okolních bodů profilu
    const a = profil[Math.max(0, k - 1)], b = profil[Math.min(profil.length - 1, k + 1)];
    let nr = b[1] - a[1], ny = -(b[0] - a[0]);
    const l = Math.hypot(nr, ny) || 1;
    nr /= l; ny /= l;
    if (opt.dovnitr) { nr = -nr; ny = -ny; }
    const radek = [];
    obvod.forEach(([s, c, ns, nc], i) => {
      radek.push(d.vrchol(px + s * r, py + y, pz + c * r, ns * nr, ny, nc * nr, opt.barvaRadku ? opt.barvaRadku(k) : barva, e, i / seg, y / vyskaMax));
    });
    radky.push(radek);
  });
  for (let k = 0; k < radky.length - 1; k++) {
    for (let i = 0; i < seg; i++) {
      const a = radky[k][i], b = radky[k][i + 1], c = radky[k + 1][i + 1], dd = radky[k + 1][i];
      if (opt.dovnitr) d.ctyruhelnik(a, dd, c, b); else d.ctyruhelnik(a, b, c, dd);
    }
  }
  const vicko = (r, y, ny) => {
    const stred = d.vrchol(px, py + y, pz, 0, ny, 0, barva, e, 0.5, 0.5);
    const okraj = d.n;
    obvodPro(y).forEach(([s, c]) => d.vrchol(px + s * r, py + y, pz + c * r, 0, ny, 0, barva, e, 0.5 + s / 2, 0.5 + c / 2));
    for (let i = 0; i < seg; i++) {
      if (ny > 0) d.idx.push(stred, okraj + i, okraj + i + 1); else d.idx.push(stred, okraj + i + 1, okraj + i);
    }
  };
  if (opt.vicko) { const [r, y] = profil[profil.length - 1]; vicko(r, y, 1); }
  if (opt.dno) { const [r, y] = profil[0]; vicko(r, y, -1); }
}

// Trubka podél lomené čáry (ucho sklenice, hadice k sudům, ohýbané židle)
function trubka(d, body, r, seg, barva, opt = {}) {
  const radky = [];
  body.forEach((b, k) => {
    const a = body[Math.max(0, k - 1)], c = body[Math.min(body.length - 1, k + 1)];
    let t = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const lt = Math.hypot(...t) || 1;
    t = t.map((x) => x / lt);
    // dva kolmé vektory k tečně
    const pom = Math.abs(t[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    let u = [t[1] * pom[2] - t[2] * pom[1], t[2] * pom[0] - t[0] * pom[2], t[0] * pom[1] - t[1] * pom[0]];
    const lu = Math.hypot(...u) || 1;
    u = u.map((x) => x / lu);
    const w = [t[1] * u[2] - t[2] * u[1], t[2] * u[0] - t[0] * u[2], t[0] * u[1] - t[1] * u[0]];
    const radek = [];
    for (let i = 0; i <= seg; i++) {
      const uhel = (i / seg) * Math.PI * 2;
      const n = [0, 1, 2].map((j) => u[j] * Math.cos(uhel) + w[j] * Math.sin(uhel));
      radek.push(d.vrchol(b[0] + n[0] * r, b[1] + n[1] * r, b[2] + n[2] * r, n[0], n[1], n[2], barva, opt.e || 0, i / seg, k / (body.length - 1)));
    }
    radky.push(radek);
  });
  for (let k = 0; k < radky.length - 1; k++) {
    for (let i = 0; i < seg; i++) d.ctyruhelnik(radky[k][i], radky[k + 1][i], radky[k + 1][i + 1], radky[k][i + 1]);
  }
}

// Obdélník s texturou z atlasu: rohy v pořadí levý dolní, pravý dolní, pravý horní, levý horní (při pohledu zepředu)
function obdelnik(d, rohy, uv, barva, e = 0) {
  const [p0, p1, , p3] = rohy;
  const ux = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
  const vy = [p3[0] - p0[0], p3[1] - p0[1], p3[2] - p0[2]];
  let n = [ux[1] * vy[2] - ux[2] * vy[1], ux[2] * vy[0] - ux[0] * vy[2], ux[0] * vy[1] - ux[1] * vy[0]];
  const l = Math.hypot(...n) || 1;
  n = n.map((x) => x / l);
  const [u0, v0, du, dv] = uv;
  const tc = [[u0, v0], [u0 + du, v0], [u0 + du, v0 + dv], [u0, v0 + dv]];
  const i = rohy.map((p, k) => d.vrchol(p[0], p[1], p[2], n[0], n[1], n[2], barva, e, tc[k][0], tc[k][1]));
  d.ctyruhelnik(i[0], i[1], i[2], i[3]);
}

function vytvorSit(davka) {
  const velky = davka.n > 65535;
  if (velky && !rozsireni.uint) throw new Error('Moc vrcholů v jedné síti');
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(davka.data), gl.STATIC_DRAW);
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, velky ? new Uint32Array(davka.idx) : new Uint16Array(davka.idx), gl.STATIC_DRAW);
  aktualniSit = null;
  return { vbo, ibo, pocet: davka.idx.length, typ: velky ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT };
}

function smazSit(sit) {
  if (!sit) return;
  gl.deleteBuffer(sit.vbo);
  gl.deleteBuffer(sit.ibo);
  if (aktualniSit === sit) aktualniSit = null;
}

// Síť, která se plní každý snímek znovu (částice, stíny postav): jen čtyřúhelníky
function vytvorDynamickouSit(maxKvadru) {
  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, maxKvadru * 4 * STRIDE, gl.DYNAMIC_DRAW);
  const idx = new Uint16Array(maxKvadru * 6);
  for (let i = 0; i < maxKvadru; i++) idx.set([i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3], i * 6);
  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
  aktualniSit = null;
  return { vbo, ibo, pocet: 0, typ: gl.UNSIGNED_SHORT, data: new Float32Array(maxKvadru * 4 * 15), max: maxKvadru, n: 0 };
}
// přidá do dynamické sítě čtyřúhelník (rohy v pořadí proti hodinkám), barva [r,g,b], alfa 0–1
function dynKvadr(sit, rohy, normala, barva, alfa, uv = [0, 0, 1, 1]) {
  if (sit.n >= sit.max) return;
  const o = sit.n * 60;
  const tc = [[uv[0], uv[1]], [uv[0] + uv[2], uv[1]], [uv[0] + uv[2], uv[1] + uv[3]], [uv[0], uv[1] + uv[3]]];
  const D = sit.data;
  for (let k = 0; k < 4; k++) {
    const j = o + k * 15, p = rohy[k];
    D[j] = p[0]; D[j + 1] = p[1]; D[j + 2] = p[2];
    D[j + 3] = normala[0]; D[j + 4] = normala[1]; D[j + 5] = normala[2];
    D[j + 6] = barva[0]; D[j + 7] = barva[1]; D[j + 8] = barva[2]; D[j + 9] = 1;
    D[j + 10] = tc[k][0]; D[j + 11] = tc[k][1];
    D[j + 12] = 0; D[j + 13] = 0; D[j + 14] = alfa;
  }
  sit.n++;
}
function nahrajDynamickou(sit) {
  gl.bindBuffer(gl.ARRAY_BUFFER, sit.vbo);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, sit.data.subarray(0, sit.n * 60));
  sit.pocet = sit.n * 6;
  aktualniSit = null;
}

// Jednotkové sítě pro pohyblivé věci
const SITE = {};
function vytvorZakladniSite() {
  const bila = [1, 1, 1];
  let d = new Davka();
  kvadr(d, -0.5, -0.5, -0.5, 0.5, 0.5, 0.5, bila, { uvCele: true, deleni: 0 });
  SITE.kostka = vytvorSit(d);
  d = new Davka();
  zaoblenyKvadr(d, 0, 0, 0, 1, 1, 1, bila, 0.18, 2);
  SITE.oblaKostka = vytvorSit(d);
  d = new Davka();
  valec(d, 0, 0, 0, 0.5, 1, 16, bila);
  SITE.valec = vytvorSit(d);
  d = new Davka();
  obdelnik(d, [[-0.5, -0.5, 0], [0.5, -0.5, 0], [0.5, 0.5, 0], [-0.5, 0.5, 0]], [0, 0, 1, 1], bila);
  SITE.ctverec = vytvorSit(d);
  // koule o poloměru 1
  d = new Davka();
  const oblouk = [];
  for (let i = 0; i <= 10; i++) { const a = (i / 10) * Math.PI; oblouk.push([Math.max(0.001, Math.sin(a)), -Math.cos(a)]); }
  soustruh(d, oblouk, 14, bila);
  SITE.koule = vytvorSit(d);
  // soustružená páka výčepního kohoutu (výška 0,18 m)
  d = new Davka();
  soustruh(d, [[0.011, 0], [0.014, 0.012], [0.017, 0.03], [0.021, 0.15], [0.019, 0.172], [0.012, 0.18]], 12, bila, { vicko: true });
  SITE.pakaSit = vytvorSit(d);
  vytvorSitSklenic();
  vytvorSitSudu();
  vytvorSiteJidel();
}

/* ---------- Kreslení ---------- */
const BILA4 = new Float32Array([1, 1, 1, 1]);
const UV_CELE = new Float32Array([0, 0, 1, 1]);
let aktualniSit = null;
let aktualniTextura = null;
let aktualniEfekt = -1;
let aktualniLesk = -1;
// Materiál pro další kreslení: reliéf (hloubka v m a velikost texelu), postava (světlý obrys), síla odrazů okolí
const material = { relief: 0, texel: null, postava: 0, odrazy: 1 };
const matStav = [0, 0, 0, 0];
let matPlatny = false;
let texelStav = null;

// Po přepnutí programu nebo framebufferu se musí všechno nastavit znovu
function zrusPamatovanyStav() {
  aktualniSit = null;
  aktualniTextura = null;
  aktualniEfekt = -1;
  aktualniLesk = -1;
  matPlatny = false;
  texelStav = null;
}

function navazSit(sit) {
  if (aktualniSit === sit) return;
  aktualniSit = sit;
  gl.bindBuffer(gl.ARRAY_BUFFER, sit.vbo);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sit.ibo);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, STRIDE, 0);
  gl.vertexAttribPointer(1, 3, gl.FLOAT, false, STRIDE, 12);
  gl.vertexAttribPointer(2, 4, gl.FLOAT, false, STRIDE, 24);
  gl.vertexAttribPointer(3, 2, gl.FLOAT, false, STRIDE, 40);
  gl.vertexAttribPointer(4, 1, gl.FLOAT, false, STRIDE, 48);
  gl.vertexAttribPointer(5, 2, gl.FLOAT, false, STRIDE, 52);
}

function navazTexturu(tex) {
  if (aktualniTextura !== tex) {
    gl.bindTexture(gl.TEXTURE_2D, tex);
    aktualniTextura = tex;
  }
}

function nastavEfekt(efekt) {
  if (aktualniEfekt !== efekt) {
    gl.uniform1f(loc.uEfekt, efekt);
    aktualniEfekt = efekt;
  }
}

function nastavLesk(lesk) {
  if (aktualniLesk !== lesk) {
    gl.uniform1f(loc.uLesk, lesk);
    aktualniLesk = lesk;
  }
}

function nastavMaterial() {
  const r = material.relief, p = material.postava, z = prolnuti ? 0 : 1, o = material.odrazy;
  if (!matPlatny || matStav[0] !== r || matStav[1] !== p || matStav[2] !== z || matStav[3] !== o) {
    matStav[0] = r; matStav[1] = p; matStav[2] = z; matStav[3] = o;
    gl.uniform4f(loc.uMat, r, p, z, o);
    matPlatny = true;
  }
  if (r && material.texel && texelStav !== material.texel) {
    gl.uniform2fv(loc.uTexel, material.texel);
    texelStav = material.texel;
  }
}

// lesk: 0 = matné, 1 = jako chrom (odlesky lamp); efekt: 1 = pivo s bublinkami, 2 = kužel světla, 3 = záře/částice
function kresli(sit, model, textura, tint, emise, uv, efekt = 0, lesk = 0) {
  if (!sit.pocet) return;
  navazSit(sit);
  navazTexturu(textura || textury.bila);
  nastavEfekt(efekt);
  nastavLesk(lesk);
  nastavMaterial();
  gl.uniformMatrix4fv(loc.uKosti, false, model);
  gl.uniform4fv(loc.uTint, tint || BILA4);
  gl.uniform1f(loc.uEmise, emise || 0);
  gl.uniform4fv(loc.uUvObdelnik, uv || UV_CELE);
  gl.drawElements(gl.TRIANGLES, sit.pocet, sit.typ, 0);
}

// Síť s kostmi: kosti = Float32Array(POCET_KOSTI * 16)
function kresliSKostmi(sit, kosti) {
  navazSit(sit);
  navazTexturu(textury.bila);
  nastavEfekt(0);
  nastavLesk(0);
  material.postava = 1;
  nastavMaterial();
  material.postava = 0;
  gl.uniformMatrix4fv(loc.uKosti, false, kosti);
  gl.uniform4fv(loc.uTint, BILA4);
  gl.uniform1f(loc.uEmise, 0);
  gl.uniform4fv(loc.uUvObdelnik, UV_CELE);
  gl.drawElements(gl.TRIANGLES, sit.pocet, sit.typ, 0);
}

// Do stínové mapy (jen hloubka)
function kresliDoStinu(sit, kosti) {
  if (!sit || !sit.pocet) return;
  navazSit(sit);
  gl.uniformMatrix4fv(programStinu.loc.uKosti, false, kosti);
  gl.drawElements(gl.TRIANGLES, sit.pocet, sit.typ, 0);
}

// Kostka se středem (x, y, z), rozměry (sx, sy, sz), volitelně natočená kolem Y
function kresliKostku(x, y, z, sx, sy, sz, barva, opt = {}) {
  let m = M4.posun(x, y, z);
  if (opt.rotY) m = M4.krat(m, M4.rotY(opt.rotY));
  m = M4.krat(m, M4.meritko(sx, sy, sz));
  kresli(opt.oble ? SITE.oblaKostka : SITE.kostka, m, opt.tex, barva, opt.e, null, 0, opt.lesk || 0);
}

// Světla: { poz, barva, sila, mistnost } → uniformy (vypnuté světlo má sílu 0)
function nastavSvetla(seznam) {
  const poz = new Float32Array(POCET_SVETEL * 4);
  const barvy = new Float32Array(POCET_SVETEL * 4);
  for (let i = 0; i < POCET_SVETEL; i++) poz[i * 4 + 3] = -9; // nepoužité světlo nesvítí nikde
  seznam.slice(0, POCET_SVETEL).forEach((s, i) => {
    poz.set([s.poz[0], s.poz[1], s.poz[2], s.mistnost || 0], i * 4);
    barvy.set([s.barva[0] * s.sila, s.barva[1] * s.sila, s.barva[2] * s.sila, 0], i * 4);
  });
  gl.uniform4fv(loc.uSvetla, poz);
  gl.uniform4fv(loc.uSvetlaB, barvy);
}
/* =========================================================
   10) SKLENICE A LAHVE – půllitr s uchem, válec, pohár, panákovka
   Sklo je průhledná „soustružená“ síť, uvnitř pivo s bublinkami
   a čepice pěny (u panáku průzračná pálenka po čárku).
   Rozměry jsou ve skutečných metrech.
   ========================================================= */
const TVARY_SKLENIC = {
  // vnější i vnitřní stěna v jednom profilu: zdola nahoru, přes okraj a zase dolů dovnitř
  pulitr: {
    profil: [[0.040, 0], [0.045, 0.006], [0.047, 0.03], [0.0475, 0.15], [0.047, 0.16], [0.0448, 0.1615], [0.0428, 0.158],
      [0.0428, 0.03], [0.036, 0.02], [0, 0.019]],
    dno: 0.02, vyska: 0.137, rDole: 0.0425, rNahore: 0.0425, ucho: true
  },
  valec: {
    profil: [[0.033, 0], [0.036, 0.005], [0.037, 0.02], [0.0445, 0.17], [0.0442, 0.177], [0.0425, 0.177], [0.0415, 0.174],
      [0.035, 0.022], [0.03, 0.013], [0, 0.012]],
    dno: 0.013, vyska: 0.158, rDole: 0.034, rNahore: 0.0412, ucho: false
  },
  pohar: {
    profil: [[0.032, 0], [0.033, 0.005], [0.012, 0.013], [0.011, 0.03], [0.03, 0.046], [0.045, 0.08], [0.0485, 0.13], [0.044, 0.165],
      [0.0432, 0.171], [0.0418, 0.17], [0.0425, 0.165], [0.0465, 0.13], [0.0435, 0.08], [0.029, 0.052], [0, 0.044]],
    dno: 0.045, vyska: 0.122, rDole: 0.02, rNahore: 0.043, ucho: false, misa: true
  },
  // panákovka 0,04 l se silným dnem a čárkou (cejchem)
  panak: {
    profil: [[0.019, 0], [0.0215, 0.004], [0.022, 0.016], [0.0245, 0.07], [0.0242, 0.074], [0.0228, 0.074], [0.022, 0.07],
      [0.0192, 0.02], [0.016, 0.0175], [0, 0.017]],
    dno: 0.018, vyska: 0.052, rDole: 0.0192, rNahore: 0.022, ucho: false, panak: true
  }
};
Object.values(TVARY_SKLENIC).forEach((t) => { t.vyskaSkla = Math.max(...t.profil.map((b) => b[1])); });

// Lahve s pálenkou (jen vnější tvar; splosteni = placatá lahev)
const TVARY_LAHVI = {
  vysoka: {
    profil: [[0.034, 0], [0.037, 0.008], [0.038, 0.2], [0.033, 0.232], [0.016, 0.26], [0.0125, 0.27], [0.0125, 0.31], [0.0145, 0.315], [0.0145, 0.322]],
    teloDo: 0.2, rTelo: 0.038, etiketaY: 0.05, etiketaV: 0.11
  },
  kulata: {
    profil: [[0.04, 0], [0.043, 0.01], [0.044, 0.15], [0.038, 0.19], [0.018, 0.22], [0.013, 0.232], [0.013, 0.27], [0.015, 0.275], [0.015, 0.28]],
    teloDo: 0.15, rTelo: 0.044, etiketaY: 0.035, etiketaV: 0.1
  },
  placata: {
    profil: [[0.042, 0], [0.045, 0.008], [0.046, 0.17], [0.043, 0.19], [0.03, 0.212], [0.014, 0.225], [0.0125, 0.232], [0.0125, 0.27], [0.0145, 0.275], [0.0145, 0.282]],
    teloDo: 0.17, rTelo: 0.046, etiketaY: 0.04, etiketaV: 0.11, splosteni: true
  },
  // hranatá lahev (zaoblený čtverec) – etiketa je rovná na přední stěně
  hranata: {
    profil: [[0.036, 0], [0.039, 0.008], [0.04, 0.17], [0.036, 0.192], [0.018, 0.212], [0.0135, 0.222], [0.0135, 0.268], [0.0155, 0.273], [0.0155, 0.28]],
    teloDo: 0.17, rTelo: 0.04, etiketaY: 0.045, etiketaV: 0.1, hranata: true
  },
  // baculatá nízká lahev s dlouhým hrdlem
  baculata: {
    profil: [[0.05, 0], [0.054, 0.008], [0.055, 0.12], [0.05, 0.148], [0.03, 0.172], [0.016, 0.188], [0.0135, 0.198], [0.0135, 0.262], [0.0155, 0.267], [0.0155, 0.274]],
    teloDo: 0.12, rTelo: 0.055, etiketaY: 0.025, etiketaV: 0.085
  }
};
Object.values(TVARY_LAHVI).forEach((t) => { t.vyska = Math.max(...t.profil.map((b) => b[1])); });

function vytvorSitSklenic() {
  const bila = [1, 1, 1];
  SITE.sklo = {};
  SITE.tekutina = {};
  Object.entries(TVARY_SKLENIC).forEach(([typ, t]) => {
    let d = new Davka();
    soustruh(d, t.profil, t.panak ? 14 : 18, bila, { dno: true });
    SITE.sklo[typ] = vytvorSit(d);
    // tekutina v jednotkové výšce (0–1), poloměr podle skla
    d = new Davka();
    if (t.misa) {
      soustruh(d, [[0.001, 0], [0.6, 0.07], [0.92, 0.32], [1, 0.68], [0.9, 1]], 16, bila, { vicko: true });
    } else {
      soustruh(d, [[t.rDole / t.rNahore, 0], [1, 1]], 16, bila, { vicko: true });
    }
    SITE.tekutina[typ] = vytvorSit(d);
  });
  // pěna s mírně vypouklou čepicí
  let d = new Davka();
  soustruh(d, [[1, 0], [1.01, 0.6], [0.94, 0.9], [0.7, 1.05], [0.35, 1.12], [0.001, 1.14]], 16, bila);
  SITE.pena = vytvorSit(d);
  // ucho půllitru
  d = new Davka();
  const body = [];
  for (let i = 0; i <= 12; i++) {
    const a = Math.PI / 2 - (i / 12) * Math.PI;
    body.push([0.045 + 0.038 * Math.cos(a), 0.085 + 0.052 * Math.sin(a), 0]);
  }
  trubka(d, body, 0.0085, 8, bila);
  SITE.ucho = vytvorSit(d);
  // čárka (cejch) na panákovce – tenký proužek kolem dokola
  d = new Davka();
  soustruh(d, [[1, 0], [1, 1]], 16, bila);
  SITE.cejch = vytvorSit(d);
  // lahve: sklo, pálenka uvnitř, pás etikety a nalévátko
  SITE.lahev = {};
  SITE.lahevTekutina = {};
  Object.entries(TVARY_LAHVI).forEach(([tvar, t]) => {
    const hrany = t.hranata ? { hranaty: 6, hranatyDo: t.teloDo + 0.025 } : {};
    d = new Davka();
    soustruh(d, t.profil, t.hranata ? 28 : 18, bila, { dno: true, vicko: true, ...hrany });
    SITE.lahev[tvar] = vytvorSit(d);
    d = new Davka();
    const vnitrek = t.profil.filter((b) => b[1] <= t.teloDo + 0.001).map(([r, y]) => [r * 0.9, Math.max(0.012, y * 0.98)]);
    soustruh(d, vnitrek, t.hranata ? 24 : 14, bila, { vicko: true, ...hrany });
    SITE.lahevTekutina[tvar] = vytvorSit(d);
  });
  d = new Davka();
  const seg = 8;
  for (let k = 0; k <= 1; k++) {
    for (let i = 0; i <= seg; i++) {
      const a = -0.8 + (i / seg) * 1.6;
      d.vrchol(Math.sin(a), k, Math.cos(a), Math.sin(a), 0, Math.cos(a), bila, 0, i / seg, k);
    }
  }
  for (let i = 0; i < seg; i++) d.ctyruhelnik(i, i + 1, seg + 2 + i, seg + 1 + i);
  SITE.pasEtikety = vytvorSit(d);
  d = new Davka();
  valec(d, 0, 0, 0, 0.0135, 0.022, 10, bila);
  trubka(d, [[0, 0.02, 0], [0, 0.034, 0.004], [0, 0.048, 0.014]], 0.0042, 6, bila);
  SITE.nalevatko = vytvorSit(d);
}

const SKLO_TINT = new Float32Array([0.9, 0.96, 1.0, 1]);
const SKLO_ZAKALENE = new Float32Array([0.85, 0.85, 0.8, 1]);
const PENA_BARVA = new Float32Array([1.0, 0.97, 0.9, 1]);
const PENA_TMAVA = new Float32Array([0.97, 0.91, 0.8, 1]);
const CEJCH_BARVA = new Float32Array([0.95, 0.95, 0.9, 0.85]);
const BAREVNY_CHROM = new Float32Array([0.82, 0.84, 0.87, 1]);
let pruhledne = []; // sklo se kreslí až nakonec (průhledně)

// Nápoj ve sklenici: plneni = výška vršku (u piva i s pěnou) v % vnitřku sklenice
function kresliSklenici(x, y, z, plneni, pivo, opt = {}) {
  const typ = opt.typ || (pivo ? pivo.sklo : 'pulitr');
  const t = TVARY_SKLENIC[typ];
  const otoc = opt.otoceni || 0;
  const zaklad = M4.retez(M4.posun(x, y, z), M4.rotY(otoc), opt.meritko ? M4.meritko(opt.meritko, opt.meritko, opt.meritko) : M4.jednotkova());
  const vrch = omez(plneni, 0, 100) / 100;
  if (t.panak) {
    // pálenka: průzračná, bez pěny; na skle je čárka 0,04 l
    if (pivo && vrch > 0.01) {
      const r = lerp(t.rDole, t.rNahore, vrch) * 0.985;
      pruhledne.push({ sit: SITE.tekutina.panak, m: M4.retez(zaklad, M4.posun(0, t.dno, 0), M4.meritko(r, t.vyska * vrch, r)), tex: textury.bila, tint: pivo._tekutina, emise: 0.18 });
    }
    const vc = t.dno + t.vyska * NASTAVENI.panak.cil / 100;
    const rc = lerp(t.rDole, t.rNahore, NASTAVENI.panak.cil / 100) + 0.0031;
    pruhledne.push({ sit: SITE.cejch, m: M4.retez(zaklad, M4.posun(0, vc, 0), M4.meritko(rc, 0.0016, rc)), tex: textury.bila, tint: CEJCH_BARVA, emise: 0.4 });
    pruhledne.push({ sit: SITE.sklo.panak, m: zaklad, zakalene: Boolean(opt.zbytek), hladke: true });
    return;
  }
  if (pivo && vrch > 0.01) {
    const pena = Math.min(vrch * 0.22, 0.18);
    const tekutina = Math.max(vrch - pena, 0);
    const r = t.rNahore * 0.985;
    if (tekutina > 0.005) {
      kresli(SITE.tekutina[typ], M4.retez(zaklad, M4.posun(0, t.dno, 0), M4.meritko(r, t.vyska * tekutina, r)), null, pivo._barva, 0, null, 1, 0.45);
    }
    if (pena > 0.005) {
      // poloměr pěny podle místa ve sklenici (u poháru se mísa zužuje)
      const rp = t.misa ? r * (0.9 + 0.1 * Math.sin(Math.min(1, tekutina) * Math.PI * 0.8)) : lerp(t.rDole, t.rNahore, tekutina) * 0.99;
      kresli(SITE.pena, M4.retez(zaklad, M4.posun(0, t.dno + t.vyska * tekutina, 0), M4.meritko(rp, t.vyska * pena, rp)),
        textury.pena, pivo.tmave ? PENA_TMAVA : PENA_BARVA);
    }
  }
  if (opt.zbytek) {
    kresli(SITE.pena, M4.retez(zaklad, M4.posun(0, t.dno, 0), M4.meritko(t.rDole * 0.95, 0.006, t.rDole * 0.95)), textury.pena, PENA_BARVA);
  }
  pruhledne.push({ sit: SITE.sklo[typ], m: zaklad, zakalene: Boolean(opt.zbytek), hladke: !t.ucho });
  if (t.ucho) pruhledne.push({ sit: SITE.ucho, m: zaklad, zakalene: Boolean(opt.zbytek) });
}

// Lahev s pálenkou; m = matice s počátkem uprostřed dna lahve
function kresliLahev(m, panak, sNalevatkem = true) {
  const t = TVARY_LAHVI[panak.tvar];
  const mm = t.splosteni ? M4.krat(m, M4.meritko(1.12, 1, 0.76)) : m;
  if (t.hranata) {
    // rovná etiketa na přední stěně hranaté lahve
    kresli(SITE.ctverec, M4.retez(mm, M4.posun(0, t.etiketaY + t.etiketaV / 2, t.rTelo * 1.006), M4.meritko(t.rTelo * 1.55, t.etiketaV, 1)),
      textury.atlas, null, 0.15, ATLAS['etiketa_' + panak.id], 0, 0.25);
  } else {
    kresli(SITE.pasEtikety, M4.retez(mm, M4.posun(0, t.etiketaY, 0), M4.meritko(t.rTelo * 1.012, t.etiketaV, t.rTelo * 1.012)),
      textury.atlas, null, 0.15, ATLAS['etiketa_' + panak.id], 0, 0.25);
  }
  if (sNalevatkem) kresli(SITE.nalevatko, M4.retez(mm, M4.posun(0, t.vyska, 0)), textury.chrom, BAREVNY_CHROM, 0.3, null, 0, 0.9);
  else kresli(SITE.valec, M4.retez(mm, M4.posun(0, t.vyska - 0.004, 0), M4.meritko(0.033, 0.022, 0.033)), null, rgba(panak.etiketa ? hexNaRgb(panak.etiketa[1]) : [0.2, 0.2, 0.2]), 0.1, null, 0, 0.4);
  pruhledne.push({ sit: SITE.lahevTekutina[panak.tvar], m: mm, tex: textury.bila, tint: panak._tekutina, emise: 0.14, lesk: 0 });
  pruhledne.push({ sit: SITE.lahev[panak.tvar], m: mm, tex: textury.skloHladke, tint: panak._lahev, emise: 0.22, lesk: 1 });
}

// Kde je špička nalévátka (odtud teče pálenka)
function spickaLahve(m, panak) {
  const t = TVARY_LAHVI[panak.tvar];
  return M4.bod(m, 0, t.vyska + 0.048, 0.014);
}

function kresliPruhledne() {
  if (!pruhledne.length) return;
  nastavProlnuti('alfa');
  gl.depthMask(false);
  pruhledne.forEach((p) => kresli(p.sit, p.m,
    p.tex || (p.hladke ? textury.skloHladke : textury.sklo),
    p.tint || (p.zakalene ? SKLO_ZAKALENE : SKLO_TINT),
    p.emise === undefined ? 0.25 : p.emise, null, 0,
    p.lesk === undefined ? 0.85 : p.lesk));
  gl.depthMask(true);
  nastavProlnuti(null);
  pruhledne = [];
}

// Nerezový sud (30 l) s žebry
function vytvorSitSudu() {
  const d = new Davka();
  soustruh(d, [[0.15, 0], [0.165, 0.01], [0.17, 0.03], [0.17, 0.1], [0.177, 0.11], [0.17, 0.12], [0.17, 0.46], [0.177, 0.47], [0.17, 0.48],
    [0.17, 0.55], [0.165, 0.572], [0.07, 0.58], [0.055, 0.6], [0.055, 0.62]], 18, [1, 1, 1], { vicko: true });
  SITE.sud = vytvorSit(d);
}
/* =========================================================
   10b) TALÍŘE A JÍDLA – každé jídlo má vlastní 3D talíř
   Talíř má poloměr 11,5 cm, jídlo leží na y ≈ 0,009 m.
   Skládá se ze zaoblených kvádrů, kotoučů a kapek (vše vlastní).
   ========================================================= */
function vytvorSiteJidel() {
  const bila = [1, 1, 1];
  // talíř s vínovým proužkem na okraji (glazura se leskne)
  let d = new Davka();
  d.lesk = 0.55;
  soustruh(d, [[0.001, 0], [0.06, 0], [0.068, 0.003], [0.08, 0.011], [0.108, 0.019], [0.117, 0.024], [0.114, 0.026], [0.104, 0.022],
    [0.08, 0.0155], [0.066, 0.0095], [0.001, 0.0095]], 24, [0.97, 0.96, 0.93]);
  soustruh(d, [[0.093, 0.0197], [0.101, 0.0219]], 24, [0.5, 0.1, 0.08]);
  SITE.talir = vytvorSit(d);

  // pomocníci na skládání jídla
  let seme = 7;
  const nah = () => { seme = (seme * 16807) % 2147483647; return (seme - 1) / 2147483646; };
  const kotouc = (x, y, z, r, v, barva, lesk = 0) => { d.lesk = lesk; valec(d, x, y, z, r, v, 16, barva); d.lesk = 0; };
  const kapka = (x, y, z, sx, sy, sz, barva, lesk = 0) => {
    d.lesk = lesk;
    zaoblenyKvadr(d, x, y, z, sx, sy, sz, barva, Math.min(sx, sy, sz) * 0.49, 2);
    d.lesk = 0;
  };
  const kus = (x, y, z, sx, sy, sz, barva, r = 0.003) => zaoblenyKvadr(d, x, y, z, sx, sy, sz, barva, r, 1);
  const knedliky = (x0, z0) => {
    for (let i = 0; i < 4; i++) {
      kus(x0, 0.019 + i * 0.002, z0 + i * 0.026, 0.05, 0.016, 0.036, [0.97, 0.94, 0.8], 0.006);
      // pár tmavších důlků (kůrka rohlíku v knedlíku)
      kus(x0 - 0.012 + (i % 2) * 0.02, 0.0275 + i * 0.002, z0 + i * 0.026 + 0.004, 0.008, 0.002, 0.008, [0.85, 0.72, 0.5], 0.001);
    }
  };
  const cibule = (x, y, z, r) => {
    const body = [];
    for (let i = 0; i <= 12; i++) { const u = (i / 12) * Math.PI * 2; body.push([x + Math.sin(u) * r, y, z + Math.cos(u) * r]); }
    trubka(d, body, 0.0025, 5, [0.96, 0.94, 0.86]);
  };
  const chleba = (x, z, n = 2) => {
    for (let i = 0; i < n; i++) {
      kus(x, 0.016 + i * 0.012, z + i * 0.012, 0.062, 0.012, 0.046, [0.6, 0.38, 0.18], 0.004);
      kus(x, 0.0222 + i * 0.012, z + i * 0.012, 0.054, 0.002, 0.038, [0.88, 0.76, 0.54], 0.001);
    }
  };
  const citron = (x, y, z) => { kotouc(x, y, z, 0.02, 0.004, [0.98, 0.9, 0.35], 0.3); kotouc(x, y + 0.004, z, 0.016, 0.0005, [1, 0.97, 0.7]); };

  const SLOZENI = {
    svickova() {
      kotouc(0.015, 0.009, 0, 0.074, 0.006, [0.93, 0.66, 0.36], 0.45);
      kus(0.025, 0.018, -0.02, 0.066, 0.009, 0.045, [0.5, 0.28, 0.16], 0.004);
      kus(0.03, 0.023, 0.012, 0.062, 0.009, 0.042, [0.55, 0.3, 0.18], 0.004);
      kotouc(0.02, 0.026, -0.005, 0.03, 0.004, [0.93, 0.66, 0.36], 0.45);
      knedliky(-0.06, -0.045);
      citron(0.045, 0.031, 0.04);
      kapka(0.045, 0.045, 0.04, 0.026, 0.022, 0.026, [1, 0.99, 0.95], 0.2);
      kapka(0.045, 0.058, 0.04, 0.016, 0.013, 0.016, [0.6, 0.05, 0.1], 0.5);
    },
    gulas() {
      kotouc(0.015, 0.009, 0, 0.072, 0.008, [0.55, 0.2, 0.08], 0.5);
      for (let i = 0; i < 7; i++) {
        const a = nah() * Math.PI * 2, r = 0.015 + nah() * 0.04;
        kus(0.02 + Math.sin(a) * r, 0.02, Math.cos(a) * r, 0.018, 0.014, 0.017, [0.4 + nah() * 0.06, 0.17, 0.08], 0.004);
      }
      cibule(0.03, 0.03, 0.02, 0.012);
      cibule(0.01, 0.031, -0.015, 0.01);
      cibule(0.045, 0.029, -0.01, 0.009);
      knedliky(-0.062, -0.045);
    },
    smazak() {
      kus(0.028, 0.021, -0.008, 0.085, 0.022, 0.058, [0.86, 0.6, 0.24], 0.01);
      kus(0.028, 0.0325, -0.008, 0.07, 0.002, 0.044, [0.92, 0.7, 0.3], 0.001);
      for (let i = 0; i < 14; i++) {
        const podel = i % 2 === 0;
        const x = -0.055 + nah() * 0.03, z = -0.035 + nah() * 0.06, y = 0.014 + Math.floor(i / 4) * 0.006;
        kus(x, y, z, podel ? 0.052 : 0.007, 0.007, podel ? 0.007 : 0.052, [0.98, 0.83 - nah() * 0.06, 0.42], 0.002);
      }
      kapka(0.05, 0.02, 0.047, 0.032, 0.016, 0.032, [0.97, 0.95, 0.84], 0.3);
      kus(0.075, 0.02, 0.02, 0.02, 0.012, 0.012, [0.98, 0.88, 0.3], 0.004);
    },
    utopenec() {
      kotouc(0.0, 0.009, 0, 0.062, 0.003, [0.78, 0.55, 0.3], 0.6);
      kus(0.01, 0.024, -0.02, 0.078, 0.025, 0.027, [0.85, 0.52, 0.45], 0.0125);
      kus(0.012, 0.024, 0.016, 0.076, 0.025, 0.027, [0.82, 0.5, 0.43], 0.0125);
      cibule(0.0, 0.039, -0.005, 0.014);
      cibule(0.025, 0.038, 0.01, 0.011);
      kus(0.04, 0.042, -0.002, 0.042, 0.011, 0.011, [0.82, 0.14, 0.08], 0.005);
      chleba(-0.06, 0.02);
    },
    rizek() {
      kus(0.018, 0.016, -0.004, 0.11, 0.013, 0.082, [0.8, 0.54, 0.24], 0.006);
      kus(0.018, 0.0228, -0.004, 0.096, 0.002, 0.07, [0.86, 0.62, 0.3], 0.001);
      citron(0.03, 0.024, -0.01);
      kapka(-0.058, 0.026, 0.032, 0.062, 0.032, 0.05, [0.96, 0.9, 0.66], 0.3);
      for (let i = 0; i < 8; i++) {
        const barva = i % 2 ? [0.95, 0.5, 0.15] : [0.35, 0.6, 0.2];
        kus(-0.075 + nah() * 0.035, 0.038 + nah() * 0.006, 0.015 + nah() * 0.035, 0.007, 0.006, 0.007, barva, 0.002);
      }
    },
    pivnisyr() {
      kapka(0.02, 0.026, 0, 0.07, 0.032, 0.056, [0.96, 0.78, 0.4], 0.25);
      for (let i = 0; i < 7; i++) kus(0.0 + nah() * 0.045, 0.043, -0.02 + nah() * 0.04, 0.009, 0.007, 0.009, [0.97, 0.96, 0.9], 0.002);
      kapka(0.06, 0.016, -0.04, 0.022, 0.008, 0.022, [0.9, 0.75, 0.1], 0.5);
      kus(0.06, 0.018, 0.035, 0.022, 0.016, 0.022, [0.98, 0.92, 0.6], 0.004);
      chleba(-0.06, -0.01);
    },
    topinky() {
      for (let i = 0; i < 3; i++) {
        kus(-0.03 + i * 0.03, 0.017 + i * 0.009, -0.025 + i * 0.022, 0.07, 0.012, 0.056, [0.82, 0.58, 0.26], 0.005);
        kus(-0.03 + i * 0.03, 0.0235 + i * 0.009, -0.025 + i * 0.022, 0.06, 0.002, 0.046, [0.9, 0.7, 0.36], 0.001);
      }
      kapka(0.06, 0.017, 0.05, 0.016, 0.013, 0.013, [0.97, 0.95, 0.88], 0.3);
      kapka(0.072, 0.016, 0.04, 0.014, 0.011, 0.012, [0.97, 0.95, 0.88], 0.3);
    },
    hermelin() {
      kotouc(0.0, 0.009, 0, 0.062, 0.003, [0.92, 0.72, 0.35], 0.7);
      kotouc(0.015, 0.012, -0.005, 0.042, 0.026, [0.97, 0.95, 0.88], 0.15);
      kotouc(0.015, 0.038, -0.005, 0.039, 0.002, [0.95, 0.88, 0.62], 0.4);
      for (let i = 0; i < 8; i++) kus(0.0 + nah() * 0.03, 0.041, -0.02 + nah() * 0.03, 0.006, 0.004, 0.006, [0.85, 0.2, 0.08], 0.0015);
      cibule(0.02, 0.043, 0.0, 0.012);
      kus(0.05, 0.02, 0.035, 0.04, 0.012, 0.012, [0.3, 0.6, 0.18], 0.005);
      chleba(-0.06, 0.0);
    }
  };
  SITE.jidlo = {};
  SITE.zbytky = {};
  JIDLA.forEach((j) => {
    d = new Davka();
    seme = 7 + j.id.length * 13;
    SLOZENI[j.id]();
    SITE.jidlo[j.id] = vytvorSit(d);
    // prázdný talíř: rozmazaná omáčka, drobky a příbor
    d = new Davka();
    seme = 3 + j.id.length;
    const smouha = j.omacka.map((c) => c * 0.85);
    kotouc(0.005, 0.0095, 0.005, 0.05, 0.0012, smouha, 0.5);
    kotouc(-0.025, 0.0095, -0.02, 0.022, 0.0013, smouha, 0.5);
    for (let i = 0; i < 5; i++) kus(-0.04 + nah() * 0.08, 0.0115, -0.04 + nah() * 0.08, 0.006, 0.003, 0.006, j.omacka.map((c) => c * 0.7), 0.001);
    d.lesk = 0.85;
    kus(0.045, 0.0115, 0.0, 0.009, 0.003, 0.12, [0.8, 0.82, 0.86], 0.0012);
    kus(0.065, 0.0115, 0.005, 0.013, 0.003, 0.12, [0.8, 0.82, 0.86], 0.0012);
    d.lesk = 0;
    SITE.zbytky[j.id] = vytvorSit(d);
  });
  // vidlička do ruky (hrot míří po +z)
  d = new Davka();
  d.lesk = 0.85;
  zaoblenyKvadr(d, 0, 0, -0.03, 0.01, 0.004, 0.09, [0.82, 0.84, 0.88], 0.0015, 1);
  [-0.0035, 0, 0.0035].forEach((x) => kostka(d, x, 0, 0.03, 0.0015, 0.003, 0.03, [0.82, 0.84, 0.88]));
  SITE.vidlicka = vytvorSit(d);
  d = new Davka();
  zaoblenyKvadr(d, 0, 0, 0, 1, 1, 1, bila, 0.25, 1);
  SITE.blok = vytvorSit(d);
}

// Talíř s jídlem: mnozstvi 1 = plný, 0 = dojedeno (jen zbytky); otoceni kolem svislé osy
function kresliTalir(x, y, z, jidloId, mnozstvi = 1, otoceni = 0, meritko = 1) {
  const zaklad = M4.retez(M4.posun(x, y, z), M4.rotY(otoceni), meritko !== 1 ? M4.meritko(meritko, meritko, meritko) : M4.jednotkova());
  kresli(SITE.talir, zaklad, null, null, 0.04, null, 0, 0.55);
  if (!jidloId) return;
  if (mnozstvi <= 0.02) { kresli(SITE.zbytky[jidloId], zaklad, null, null, 0.04); return; }
  // ubývající porce: jídlo se „slehne“ ke středu talíře
  const s = 0.5 + 0.5 * mnozstvi, sy = 0.35 + 0.65 * mnozstvi;
  kresli(SITE.jidlo[jidloId], M4.retez(zaklad, M4.posun(0, 0.009, 0), M4.meritko(s, sy, s), M4.posun(0, -0.009, 0)), null, null, 0.06);
}
/* =========================================================
   11) TEXTURY – všechno se kreslí za běhu na plátno (žádné obrázky)
   ========================================================= */
const textury = {};
const ATLAS = {}; // název → [u0, v0, du, dv]
const ATLAS_W = 1024, ATLAS_H = 4096; // atlas je vysoký 4096 px (cedule, štítky, etikety, kuchyně)
let atlasPlatno = null;

function noveplatno(sirka, vyska) {
  const c = document.createElement('canvas');
  c.width = sirka;
  c.height = vyska;
  // textury se kreslí jednou a některé se čtou zpátky (reliéf, sépie) → plátno v paměti
  c.getContext('2d', { willReadFrequently: true });
  return c;
}

function nahraj(canvas, opakovat, tex) {
  const t = tex || gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  aktualniTextura = t;
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  const mocnina = (x) => (x & (x - 1)) === 0;
  if (mocnina(canvas.width) && mocnina(canvas.height)) {
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    const obal = opakovat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, obal);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, obal);
    if (rozsireni.aniso) gl.texParameterf(gl.TEXTURE_2D, rozsireni.aniso.TEXTURE_MAX_ANISOTROPY_EXT, 8);
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  t._texel = new Float32Array([1 / canvas.width, 1 / canvas.height]);
  return t;
}

// Výška povrchu do alfa kanálu (pro plastický reliéf): f(r, g, b, x, y) → 0 (spára) … 1 (povrch).
// Vrací ImageData, které jde rovnou do textury (bez ztráty přesnosti barev).
function sReliefem(c, f, rozmazani = 1) {
  const w = c.width, hgt = c.height;
  const img = c.getContext('2d').getImageData(0, 0, w, hgt);
  const D = img.data;
  let v = new Float32Array(w * hgt);
  for (let y = 0; y < hgt; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      v[i] = omez(f(D[i * 4] / 255, D[i * 4 + 1] / 255, D[i * 4 + 2] / 255, x, y), 0, 1);
    }
  }
  // rozmazání s přetečením přes okraj (textury se opakují) → zkosené hrany spár
  for (let k = 0; k < rozmazani; k++) {
    const t = new Float32Array(w * hgt);
    for (let y = 0; y < hgt; y++) {
      for (let x = 0; x < w; x++) {
        let soucet = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) soucet += v[((y + dy + hgt) % hgt) * w + ((x + dx + w) % w)];
        }
        t[y * w + x] = soucet / 9;
      }
    }
    v = t;
  }
  for (let i = 0; i < w * hgt; i++) D[i * 4 + 3] = Math.round(140 + 115 * v[i]);
  return img;
}
const jasRGB = (r, g, b) => r * 0.3 + g * 0.59 + b * 0.11;
const krokHrany = (a, b, x) => { const t = omez((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// Šum pro „opotřebení“ povrchů
function sum(ctx, w, h, pocet, barvy, velikost = 2, x0 = 0, y0 = 0) {
  for (let i = 0; i < pocet; i++) {
    ctx.fillStyle = nahodne(barvy);
    ctx.fillRect(x0 + Math.random() * w, y0 + Math.random() * h, velikost, velikost);
  }
}

// Dřevo: let s vlnitými létami, tmavší pruhy a suky s kroužky
function kresliDrevo(ctx, x, y, w, h, svetla, tmava, pruhy = 14) {
  ctx.fillStyle = svetla;
  ctx.fillRect(x, y, w, h);
  // jemné podélné přechody barvy
  for (let i = 0; i < 6; i++) {
    const g = ctx.createLinearGradient(x, y, x, y + h);
    const a = 0.04 + Math.random() * 0.08;
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(Math.random(), `rgba(${Math.random() < 0.5 ? '255,230,200' : '40,20,8'},${a})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  }
  ctx.strokeStyle = tmava;
  for (let i = 0; i < pruhy * 2; i++) {
    ctx.globalAlpha = 0.06 + Math.random() * 0.2;
    ctx.lineWidth = 0.5 + Math.random() * 1.8;
    const y0 = y + Math.random() * h;
    const faze = Math.random() * 6, vlna = h * (0.006 + Math.random() * 0.014);
    ctx.beginPath();
    for (let px = 0; px <= w; px += 6) {
      const py = y0 + Math.sin(px / w * Math.PI * 2 * (1 + i % 3) + faze) * vlna + Math.sin(px * 0.05 + i) * 0.6;
      if (px === 0) ctx.moveTo(x + px, py); else ctx.lineTo(x + px, py);
    }
    ctx.stroke();
  }
  // suky
  for (let i = 0; i < 2; i++) {
    const sx = x + Math.random() * w, sy = y + Math.random() * h;
    const rx = 3 + Math.random() * 5, ry = 1.5 + Math.random() * 2;
    for (let k = 4; k >= 0; k--) {
      ctx.globalAlpha = 0.1 + (4 - k) * 0.05;
      ctx.strokeStyle = tmava;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(sx, sy, rx + k * 2.4, ry + k * 1.1, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = tmava;
    ctx.beginPath();
    ctx.ellipse(sx, sy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Měkké skvrny (oprýskaná omítka, zašlá místa)
function skvrny(ctx, w, h, pocet, barvy, rMin, rMax) {
  for (let i = 0; i < pocet; i++) {
    const x = Math.random() * w, y = Math.random() * h, r = rMin + Math.random() * (rMax - rMin);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, nahodne(barvy));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    // kreslí se i „přes okraj“, aby textura navazovala
    [[0, 0], [w, 0], [-w, 0], [0, h], [0, -h]].forEach(([ox, oy]) => ctx.fillRect(x - r + ox, y - r + oy, r * 2, r * 2));
  }
}

// Kruhový přechod do průhledna (záře lamp, prach, pára, stín)
function kruhovyPrechod(velikost, zastaveni) {
  const c = noveplatno(velikost, velikost);
  const x = c.getContext('2d');
  const g = x.createRadialGradient(velikost / 2, velikost / 2, 0, velikost / 2, velikost / 2, velikost / 2);
  zastaveni.forEach(([k, barva]) => g.addColorStop(k, barva));
  x.fillStyle = g;
  x.fillRect(0, 0, velikost, velikost);
  return c;
}

function textNaStred(ctx, text, x, y, font, barva, maxSirka) {
  ctx.font = font;
  ctx.fillStyle = barva;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y, maxSirka);
}

function oblast(nazev, x, y, w, hgt) {
  ATLAS[nazev] = new Float32Array([x / ATLAS_W, 1 - (y + hgt) / ATLAS_H, w / ATLAS_W, hgt / ATLAS_H]);
}

const rgbText = (b) => `rgb(${b.map((c) => Math.round(c * 255)).join(',')})`;

function vytvorTextury() {
  // bílá – pro jednobarevné věci
  let c = noveplatno(4, 4);
  let x = c.getContext('2d');
  x.fillStyle = '#fff';
  x.fillRect(0, 0, 4, 4);
  textury.bila = nahraj(c, true);

  // dřevo nábytku (512 px = 1 m)
  c = noveplatno(512, 512);
  x = c.getContext('2d');
  kresliDrevo(x, 0, 0, 512, 512, '#a0683c', '#4a2810', 40);
  sum(x, 512, 512, 1600, ['rgba(60,30,10,.18)', 'rgba(255,220,180,.08)']);
  textury.drevo = nahraj(sReliefem(c, (r, g, b) => 0.4 + krokHrany(0.15, 0.45, jasRGB(r, g, b)) * 0.6, 1), true);

  // podlaha z lakovaných prken (512 px = 2 m), prkna mají každé svůj odstín a spáry
  c = noveplatno(512, 512);
  x = c.getContext('2d');
  const tony = ['#8a5530', '#7b4a28', '#935b34', '#80502c', '#774626', '#8e5732', '#7f4e2b', '#966038'];
  for (let i = 0; i < 8; i++) {
    const posun = (i * 173) % 512;
    kresliDrevo(x, 0, i * 64, 512, 64, tony[i], '#3a1f0c', 7);
    // druhý kus prkna za spárou má trochu jiný odstín
    x.fillStyle = `rgba(${i % 2 ? '255,225,190' : '30,14,4'},.07)`;
    x.fillRect(posun, i * 64, 512 - posun, 64);
    const lesk = x.createLinearGradient(0, i * 64, 0, i * 64 + 64);
    lesk.addColorStop(0, 'rgba(255,235,200,.10)');
    lesk.addColorStop(0.35, 'rgba(255,235,200,0)');
    lesk.addColorStop(1, 'rgba(0,0,0,.12)');
    x.fillStyle = lesk;
    x.fillRect(0, i * 64, 512, 64);
    x.fillStyle = '#24130a';
    x.fillRect(0, i * 64, 512, 2);
    x.fillRect(posun, i * 64, 2, 64);
    x.fillStyle = 'rgba(20,10,4,.6)';
    [[posun + 8, 10], [posun + 8, 52], [posun - 8, 10], [posun - 8, 52]].forEach(([a, b]) => x.fillRect((a + 512) % 512, i * 64 + b, 3, 3));
  }
  // vyšlapaná místa
  skvrny(x, 512, 512, 6, ['rgba(255,220,170,.07)', 'rgba(40,20,8,.08)'], 60, 140);
  sum(x, 512, 512, 2200, ['rgba(30,15,5,.18)', 'rgba(255,230,190,.05)'], 2);
  textury.podlaha = nahraj(sReliefem(c, (r, g, b) => { const l = jasRGB(r, g, b); return krokHrany(0.1, 0.19, l) * (0.8 + 0.2 * krokHrany(0.18, 0.42, l)); }, 1), true);

  // omítka se skvrnami a jemnou zrnitostí (512 px = 2 m)
  c = noveplatno(512, 512);
  x = c.getContext('2d');
  x.fillStyle = '#dcc49c';
  x.fillRect(0, 0, 512, 512);
  skvrny(x, 512, 512, 26, ['rgba(150,110,60,.10)', 'rgba(255,245,225,.12)', 'rgba(120,90,50,.08)'], 30, 120);
  sum(x, 512, 512, 9000, ['rgba(120,90,50,.09)', 'rgba(255,250,235,.12)', 'rgba(90,60,30,.05)'], 2);
  // vlasové praskliny
  x.strokeStyle = 'rgba(110,80,45,.18)';
  x.lineWidth = 0.8;
  for (let i = 0; i < 5; i++) {
    let px = Math.random() * 512, py = Math.random() * 512;
    x.beginPath();
    x.moveTo(px, py);
    for (let k = 0; k < 8; k++) { px += (Math.random() - 0.5) * 18; py += Math.random() * 12; x.lineTo(px, py); }
    x.stroke();
  }
  textury.omitka = nahraj(sReliefem(c, (r, g, b) => krokHrany(0.55, 0.85, jasRGB(r, g, b)), 2), true);

  // cihly za pultem (256 px = 1 m): každá cihla má světlejší horní a tmavší spodní hranu
  c = noveplatno(256, 256);
  x = c.getContext('2d');
  x.fillStyle = '#5e4f40';
  x.fillRect(0, 0, 256, 256);
  sum(x, 256, 256, 1200, ['rgba(0,0,0,.25)', 'rgba(255,240,220,.12)'], 1);
  const cihly = ['#9c4a2c', '#8a3f25', '#a85633', '#7d3820', '#94492e', '#b0603a', '#86412a'];
  for (let r = 0; r < 8; r++) {
    for (let s = -1; s < 5; s++) {
      const bx = s * 64 + (r % 2) * 32 + 2, by = r * 32 + 2;
      x.fillStyle = nahodne(cihly);
      x.fillRect(bx, by, 60, 28);
      const g = x.createLinearGradient(0, by, 0, by + 28);
      g.addColorStop(0, 'rgba(255,210,170,.22)');
      g.addColorStop(0.25, 'rgba(255,210,170,0)');
      g.addColorStop(0.8, 'rgba(0,0,0,0)');
      g.addColorStop(1, 'rgba(0,0,0,.3)');
      x.fillStyle = g;
      x.fillRect(bx, by, 60, 28);
      // otlučené rohy a skvrny od sazí
      x.fillStyle = 'rgba(70,55,42,.9)';
      if (Math.random() < 0.3) x.fillRect(bx + (Math.random() < 0.5 ? 0 : 55), by + (Math.random() < 0.5 ? 0 : 24), 5, 4);
      x.fillStyle = `rgba(30,15,8,${(Math.random() * 0.15).toFixed(2)})`;
      x.fillRect(bx, by, 60, 28);
    }
  }
  sum(x, 256, 256, 2400, ['rgba(0,0,0,.14)', 'rgba(255,200,160,.08)'], 1.5);
  textury.cihly = nahraj(sReliefem(c, (r, g, b) => krokHrany(0.06, 0.16, r - g) * (0.82 + 0.18 * krokHrany(0.15, 0.45, r)), 1), true);

  // dlažba ve skladu (128 px = 0,5 m)
  c = noveplatno(128, 128);
  x = c.getContext('2d');
  x.fillStyle = '#4a4440';
  x.fillRect(0, 0, 128, 128);
  for (let r = 0; r < 4; r++) for (let s = 0; s < 4; s++) {
    x.fillStyle = nahodne(['#8a8278', '#837b72', '#918a80', '#7c756c']);
    x.fillRect(s * 32 + 1, r * 32 + 1, 30, 30);
  }
  sum(x, 128, 128, 400, ['rgba(0,0,0,.12)', 'rgba(255,255,255,.06)']);
  textury.dlazba = nahraj(sReliefem(c, (r, g, b, px, py) => (px % 32 === 0 || py % 32 === 0 ? 0 : 0.85 + 0.15 * jasRGB(r, g, b)), 1), true);

  // dlažba v kuchyni: terakotové dlaždice 25 cm (256 px = 1 m)
  c = noveplatno(256, 256);
  x = c.getContext('2d');
  x.fillStyle = '#5a3a2a';
  x.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 4; r++) for (let s = 0; s < 4; s++) {
    x.fillStyle = nahodne(['#9a4f32', '#a5573a', '#8f4a2f', '#ac5f3e', '#96502f']);
    x.fillRect(s * 64 + 2, r * 64 + 2, 60, 60);
    x.fillStyle = 'rgba(255,220,190,.08)';
    x.fillRect(s * 64 + 2, r * 64 + 2, 60, 6);
  }
  sum(x, 256, 256, 1500, ['rgba(0,0,0,.12)', 'rgba(255,230,210,.06)'], 1.5);
  textury.dlazbaK = nahraj(sReliefem(c, (r, g, b, px, py) => (px % 64 < 2 || px % 64 > 61 || py % 64 < 2 || py % 64 > 61 ? 0 : 0.8 + 0.2 * krokHrany(0.2, 0.5, jasRGB(r, g, b))), 1), true);

  // bílé kachličky v kuchyni 12,5 cm (256 px = 1 m)
  c = noveplatno(256, 256);
  x = c.getContext('2d');
  x.fillStyle = '#b9b9b2';
  x.fillRect(0, 0, 256, 256);
  for (let r = 0; r < 8; r++) for (let s = 0; s < 8; s++) {
    const g = x.createLinearGradient(s * 32, r * 32, s * 32 + 32, r * 32 + 32);
    g.addColorStop(0, '#fbfbf8');
    g.addColorStop(1, '#e7e7e1');
    x.fillStyle = g;
    x.fillRect(s * 32 + 1, r * 32 + 1, 30, 30);
  }
  sum(x, 256, 256, 300, ['rgba(0,0,0,.05)'], 1.5);
  textury.kachlicky = nahraj(sReliefem(c, (r, g, b, px, py) => (px % 32 === 0 || py % 32 === 0 ? 0 : 1), 1), true);

  // broušená nerez (vodorovné jemné rýhy)
  c = noveplatno(256, 256);
  x = c.getContext('2d');
  x.fillStyle = '#c6cad0';
  x.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 700; i++) {
    x.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,.18)' : 'rgba(60,65,72,.12)';
    x.fillRect(Math.random() * 256, Math.random() * 256, 20 + Math.random() * 120, 1);
  }
  skvrny(x, 256, 256, 6, ['rgba(255,255,255,.1)', 'rgba(80,85,95,.08)'], 30, 80);
  textury.nerez = nahraj(c, true);

  // kostkovaný ubrus s vazbou látky (128 px = 1 m → kostky po 6 cm)
  c = noveplatno(128, 128);
  x = c.getContext('2d');
  x.fillStyle = '#f4efe6';
  x.fillRect(0, 0, 128, 128);
  x.fillStyle = 'rgba(190,30,35,.55)';
  for (let i = 0; i < 16; i += 2) { x.fillRect(i * 8, 0, 8, 128); x.fillRect(0, i * 8, 128, 8); }
  x.fillStyle = 'rgba(160,20,25,.5)';
  for (let i = 0; i < 16; i += 2) for (let j = 0; j < 16; j += 2) x.fillRect(i * 8, j * 8, 8, 8);
  // vazba: střídavé světlé a tmavé nitě
  for (let i = 0; i < 128; i += 2) {
    x.fillStyle = 'rgba(255,255,255,.06)';
    x.fillRect(i, 0, 1, 128);
    x.fillStyle = 'rgba(0,0,0,.04)';
    x.fillRect(0, i, 128, 1);
  }
  textury.ubrus = nahraj(sReliefem(c, (r, g, b, px, py) => 0.5 + ((px + py) % 2) * 0.3 + (px % 8 === 0 || py % 8 === 0 ? -0.2 : 0), 0), true);

  // sklo: průhlednost v alfa kanálu (silné dno, odlesky, okraj; půllitr má navíc vybroušené důlky)
  const sklo = (dulky) => {
    const p = noveplatno(64, 128);
    const k = p.getContext('2d');
    k.fillStyle = 'rgba(255,255,255,0.2)';
    k.fillRect(0, 0, 64, 128);
    k.fillStyle = 'rgba(255,255,255,0.72)';
    k.fillRect(0, 112, 64, 16);                       // dno (dole na plátně = v ≈ 0)
    k.fillStyle = 'rgba(255,255,255,0.85)';
    k.fillRect(0, 0, 64, 3);                          // okraj
    if (dulky) {
      for (let r = 0; r < 4; r++) {
        for (let s = 0; s < 4; s++) {
          k.strokeStyle = 'rgba(255,255,255,0.35)';
          k.lineWidth = 1.5;
          k.beginPath();
          k.ellipse(8 + s * 16, 30 + r * 18, 5, 7, 0, 0, Math.PI * 2);
          k.stroke();
        }
      }
    }
    const g = k.createLinearGradient(0, 0, 64, 0);
    g.addColorStop(0.06, 'rgba(255,255,255,0)');
    g.addColorStop(0.12, 'rgba(255,255,255,0.75)');
    g.addColorStop(0.17, 'rgba(255,255,255,0)');
    g.addColorStop(0.58, 'rgba(255,255,255,0)');
    g.addColorStop(0.61, 'rgba(255,255,255,0.45)');
    g.addColorStop(0.64, 'rgba(255,255,255,0)');
    k.fillStyle = g;
    k.fillRect(0, 3, 64, 109);
    return nahraj(p, true);
  };
  textury.sklo = sklo(true);
  textury.skloHladke = sklo(false);

  // chrom a nerez: pruhy „odrazů“ kolem dokola (u = obvod válce)
  c = noveplatno(128, 16);
  x = c.getContext('2d');
  const odraz = x.createLinearGradient(0, 0, 128, 0);
  [[0, '#6c7179'], [0.08, '#d9dde3'], [0.13, '#ffffff'], [0.2, '#a3a9b1'], [0.33, '#474c54'], [0.45, '#8e949c'],
    [0.58, '#eef1f4'], [0.66, '#c3c8cf'], [0.8, '#5d626a'], [0.9, '#9aa0a8'], [1, '#6c7179']].forEach(([k, b]) => odraz.addColorStop(k, b));
  x.fillStyle = odraz;
  x.fillRect(0, 0, 128, 16);
  sum(x, 128, 16, 160, ['rgba(255,255,255,.08)', 'rgba(0,0,0,.06)'], 1);
  textury.chrom = nahraj(c, true);

  // pěna s bublinkami
  c = noveplatno(64, 64);
  x = c.getContext('2d');
  x.fillStyle = '#fbf6ea';
  x.fillRect(0, 0, 64, 64);
  for (let i = 0; i < 70; i++) {
    const r = 1 + Math.random() * 2.5;
    x.strokeStyle = Math.random() < 0.5 ? 'rgba(220,200,160,.55)' : 'rgba(255,255,255,.9)';
    x.lineWidth = 0.8;
    x.beginPath();
    x.arc(Math.random() * 64, Math.random() * 64, r, 0, Math.PI * 2);
    x.stroke();
  }
  textury.pena = nahraj(c, true);

  // měkký stín (kruhový přechod do průhledna) pod lidi a nábytek
  textury.stin = nahraj(kruhovyPrechod(64, [[0, 'rgba(0,0,0,0.62)'], [0.5, 'rgba(0,0,0,0.34)'], [1, 'rgba(0,0,0,0)']]), false);
  // záře kolem žárovek, prach ve světle a obláček páry
  textury.zare = nahraj(kruhovyPrechod(128, [[0, 'rgba(255,255,255,1)'], [0.08, 'rgba(255,255,255,0.85)'], [0.25, 'rgba(255,255,255,0.32)'],
    [0.5, 'rgba(255,255,255,0.1)'], [1, 'rgba(255,255,255,0)']]), false);
  textury.tecka = nahraj(kruhovyPrechod(32, [[0, 'rgba(255,255,255,1)'], [0.4, 'rgba(255,255,255,0.5)'], [1, 'rgba(255,255,255,0)']]), false);
  c = noveplatno(64, 64);
  x = c.getContext('2d');
  for (let i = 0; i < 9; i++) {
    const px = 20 + Math.random() * 24, py = 20 + Math.random() * 24, r = 10 + Math.random() * 12;
    const g = x.createRadialGradient(px, py, 0, px, py, r);
    g.addColorStop(0, 'rgba(255,255,255,0.35)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
  }
  textury.para = nahraj(c, false);

  atlasPlatno = vytvorAtlas();
  textury.atlas = nahraj(atlasPlatno, false);

  // televize (mění se za běhu)
  tvPlatno = noveplatno(256, 144);
  textury.tv = nahraj(tvPlatno, false);
}

/* ---------- Televize s hokejem ---------- */
let tvPlatno = null;
const tvHraci = Array.from({ length: 8 }, (_, i) => ({ x: Math.random() * 256, y: 30 + Math.random() * 90, vx: 0, vy: 0, tym: i % 2 }));
const tvPuk = { x: 128, y: 72, vx: 40, vy: 20 };
function aktualizujTV(dt) {
  const x = tvPlatno.getContext('2d');
  if (!hokej.bezi) {
    // mezi zápasy: studio s pozvánkou na další zápas
    const g = x.createLinearGradient(0, 0, 0, 144);
    g.addColorStop(0, '#16324f');
    g.addColorStop(1, '#0b1626');
    x.fillStyle = g;
    x.fillRect(0, 0, 256, 144);
    x.fillStyle = 'rgba(255,255,255,.08)';
    for (let i = 0; i < 6; i++) x.fillRect(i * 48 + ((casHry * 20) % 48), 0, 20, 144);
    textNaStred(x, 'HOKEJ', 128, 50, 'bold 34px Arial, sans-serif', '#ffffff');
    const min = Math.max(1, Math.ceil(hokej.za / 60));
    textNaStred(x, HRA.otevreno ? `další zápas za ${min} min` : 'až otevřeš hospodu', 128, 88, 'bold 16px Arial, sans-serif', '#f5c542');
    textNaStred(x, 'ČEŠI  ×  SOUPEŘ', 128, 118, 'bold 14px Arial, sans-serif', '#cfe3ff');
  } else {
    x.fillStyle = '#e8f3ff';
    x.fillRect(0, 0, 256, 144);
    x.strokeStyle = '#c0392b';
    x.lineWidth = 3;
    x.beginPath(); x.moveTo(128, 0); x.lineTo(128, 144); x.stroke();
    x.strokeStyle = '#1f4f8a';
    [80, 176].forEach((px) => { x.beginPath(); x.moveTo(px, 0); x.lineTo(px, 144); x.stroke(); });
    x.strokeStyle = '#c0392b';
    x.beginPath(); x.arc(128, 72, 18, 0, Math.PI * 2); x.stroke();
    tvPuk.x += tvPuk.vx * dt;
    tvPuk.y += tvPuk.vy * dt;
    if (tvPuk.y < 24 || tvPuk.y > 138) tvPuk.vy *= -1;
    if (tvPuk.x < 4 || tvPuk.x > 252) tvPuk.vx *= -1;
    if (Math.random() < 0.02) { tvPuk.vx = nahodneCislo(-70, 70); tvPuk.vy = nahodneCislo(-40, 40); }
    tvHraci.forEach((p) => {
      p.vx += ((tvPuk.x - p.x) * 0.6 - p.vx) * dt;
      p.vy += ((tvPuk.y - p.y) * 0.6 - p.vy) * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      x.fillStyle = p.tym ? '#c0392b' : '#1f4f8a';
      x.beginPath(); x.arc(p.x, p.y, 5, 0, Math.PI * 2); x.fill();
    });
    x.fillStyle = '#111';
    x.beginPath(); x.arc(tvPuk.x, tvPuk.y, 2.5, 0, Math.PI * 2); x.fill();
    x.fillStyle = 'rgba(0,0,0,.75)';
    x.fillRect(0, 0, 256, 20);
    textNaStred(x, `ČEŠI ${hokej.skore[0]} : ${hokej.skore[1]} SOUPEŘ   ·   ${hokej.tretina}. třetina`, 128, 11, 'bold 12px Arial, sans-serif', '#fff');
  }
  gl.bindTexture(gl.TEXTURE_2D, textury.tv);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, tvPlatno);
  aktualniTextura = textury.tv;
}
/* ---------- Atlas: cedule, obrázky, štítky (jedno velké plátno 1024 × 2048) ---------- */
const PISMO_KRIDA = '"Comic Sans MS", "Segoe Print", "Chalkboard SE", cursive';

// Tabule s nápoji: zelená křídová deska v dřevěném rámu
function kresliTabuli(x, x0, y0, nadpis, polozky, pozn) {
  x.fillStyle = '#5a3519';
  x.fillRect(x0, y0, 512, 448);
  x.fillStyle = '#1f2a22';
  x.fillRect(x0 + 14, y0 + 14, 484, 420);
  sum(x, 484, 420, 900, ['rgba(255,255,255,.04)', 'rgba(255,255,255,.025)'], 2, x0 + 14, y0 + 14);
  textNaStred(x, nadpis, x0 + 256, y0 + 52, `bold 40px ${PISMO_KRIDA}`, '#f5c542');
  x.strokeStyle = 'rgba(245,197,66,.5)';
  x.lineWidth = 2;
  x.beginPath(); x.moveTo(x0 + 120, y0 + 80); x.lineTo(x0 + 392, y0 + 80); x.stroke();
  const prostor = pozn ? 300 : 330;
  const radek = Math.min(40, prostor / Math.max(1, polozky.length));
  polozky.forEach((p, i) => {
    const y = y0 + 108 + i * radek;
    x.font = `bold ${Math.round(Math.min(26, radek * 0.68))}px ${PISMO_KRIDA}`;
    x.textBaseline = 'middle';
    x.fillStyle = p.tecka;
    x.textAlign = 'left';
    x.fillText('•', x0 + 34, y);
    x.fillStyle = '#f2ecd9';
    x.fillText(p.nazev, x0 + 56, y, 300);
    x.textAlign = 'right';
    x.fillText(p.cena, x0 + 478, y);
  });
  if (pozn) textNaStred(x, pozn, x0 + 256, y0 + 412, `italic 20px ${PISMO_KRIDA}`, 'rgba(242,236,217,.7)', 460);
}

function kresliMenu(x) {
  const piva = PIVA.filter(jeNaCepu).map((p) => ({ nazev: p.nazev, cena: p.cena + ' Kč', tecka: rgbText(p.packa.map((c) => Math.min(1, c + 0.45))) }));
  kresliTabuli(x, 0, 1024, 'NA ČEPU', piva, 'půllitr 0,5 l');
  const panaky = PANAKY.filter(jeNaCepu).map((p) => ({ nazev: p.nazev, cena: p.cena + ' Kč', tecka: rgbText(p.barva.map((c) => Math.min(1, c + 0.2))) }));
  kresliTabuli(x, 512, 1024, 'PANÁKY', panaky, 'nalévá se po čárku 0,04 l');
  // jídelní lístek na stěně u okénka kuchyně
  if (maKuchyni()) {
    const jidla = JIDLA.filter(jeNaListku).map((j) => ({ nazev: j.nazev, cena: j.cena + ' Kč', tecka: rgbText(j.omacka) }));
    kresliTabuli(x, 0, 2240, 'JÍDELNÍ LÍSTEK', jidla, 'Dobrou chuť přeje kuchařka Jarmila');
  } else {
    kresliTabuli(x, 0, 2240, 'KUCHYNĚ', [], '');
    textNaStred(x, 'Brzy otevřeme!', 256, 2240 + 170, `bold 46px ${PISMO_KRIDA}`, '#f2ecd9');
    textNaStred(x, 'svíčková · guláš · smažák', 256, 2240 + 250, `30px ${PISMO_KRIDA}`, 'rgba(242,236,217,.8)');
    textNaStred(x, 'řízek · utopenec · topinky', 256, 2240 + 300, `30px ${PISMO_KRIDA}`, 'rgba(242,236,217,.8)');
    textNaStred(x, '(kuchyni otevřeš v knize na pultu)', 256, 2240 + 390, `italic 22px ${PISMO_KRIDA}`, 'rgba(245,197,66,.85)');
  }
}

function prekresliMenu() {
  if (!atlasPlatno) return;
  kresliMenu(atlasPlatno.getContext('2d'));
  nahraj(atlasPlatno, false, textury.atlas);
}

function vytvorAtlas() {
  const c = noveplatno(ATLAS_W, ATLAS_H);
  const x = c.getContext('2d');
  x.fillStyle = '#fff';
  x.fillRect(0, 0, ATLAS_W, ATLAS_H);

  kresliMenu(x);
  oblast('menu', 0, 1024, 512, 448);
  oblast('menuPanaky', 512, 1024, 512, 448);
  oblast('jidelak', 0, 2240, 512, 448);

  // název hospody
  kresliDrevo(x, 512, 0, 512, 128, '#7b4a22', '#3a1d08', 10);
  x.strokeStyle = '#f5c542';
  x.lineWidth = 6;
  x.strokeRect(518, 6, 500, 116);
  textNaStred(x, 'U Hořkého kohoutu', 768, 66, 'bold 54px Georgia, serif', '#f5c542');
  oblast('nazev', 512, 0, 512, 128);

  // okno do noční ulice
  let g = x.createLinearGradient(0, 128, 0, 384);
  g.addColorStop(0, '#0d1630');
  g.addColorStop(0.6, '#24315a');
  g.addColorStop(1, '#3a2a30');
  x.fillStyle = g;
  x.fillRect(512, 128, 256, 256);
  x.fillStyle = '#141018';
  x.fillRect(512, 250, 110, 134);
  x.fillRect(640, 210, 128, 174);
  x.fillStyle = '#ffd27a';
  [[530, 270], [570, 270], [530, 320], [660, 230], [700, 230], [740, 280], [660, 330]].forEach(([a, b]) => x.fillRect(a, b, 22, 26));
  x.fillStyle = 'rgba(255,240,200,.9)';
  for (let i = 0; i < 18; i++) x.fillRect(512 + Math.random() * 256, 130 + Math.random() * 70, 2, 2);
  x.fillStyle = 'rgba(255,90,80,.9)';
  x.font = 'bold 30px Arial, sans-serif';
  x.textAlign = 'center';
  x.fillText('PIVO', 700, 200);
  oblast('okno', 512, 128, 256, 256);

  // obraz Beskyd
  g = x.createLinearGradient(0, 128, 0, 320);
  g.addColorStop(0, '#f6c773');
  g.addColorStop(0.5, '#e98b4a');
  g.addColorStop(1, '#7a5a8a');
  x.fillStyle = g;
  x.fillRect(768, 128, 256, 192);
  x.fillStyle = '#4b3a5a';
  x.beginPath();
  x.moveTo(768, 320); x.lineTo(768, 250); x.lineTo(810, 200); x.lineTo(850, 235); x.lineTo(900, 170);
  x.lineTo(950, 230); x.lineTo(990, 205); x.lineTo(1024, 240); x.lineTo(1024, 320);
  x.fill();
  x.fillStyle = '#2c2236';
  x.beginPath();
  x.moveTo(768, 320); x.lineTo(768, 280); x.lineTo(830, 255); x.lineTo(880, 285); x.lineTo(950, 260); x.lineTo(1024, 290); x.lineTo(1024, 320);
  x.fill();
  x.strokeStyle = '#8a5a2b';
  x.lineWidth = 12;
  x.strokeRect(774, 134, 244, 180);
  oblast('obraz', 768, 128, 256, 192);

  // terč na šipky
  ['#1b1b1b', '#e9dcc0', '#c0392b', '#e9dcc0', '#1e6b3a', '#c0392b'].forEach((barva, i) => {
    x.fillStyle = barva;
    x.beginPath();
    x.arc(64, 384, 62 - i * 10, 0, Math.PI * 2);
    x.fill();
  });
  oblast('terc', 0, 320, 128, 128);

  // ciferník hodin
  x.fillStyle = '#3a200f';
  x.beginPath(); x.arc(192, 384, 63, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#fdf6e3';
  x.beginPath(); x.arc(192, 384, 54, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#222';
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * Math.PI * 2;
    x.fillRect(192 + Math.sin(a) * 44 - 3, 384 - Math.cos(a) * 44 - 3, 6, 6);
  }
  oblast('hodiny', 128, 320, 128, 128);

  // cedulka na dveřích
  [['otevreno', 'OTEVŘENO', '#2e7d32', 320], ['zavreno', 'ZAVŘENO', '#b3261e', 416]].forEach(([nazev, text, barva, y]) => {
    x.fillStyle = '#f7ecd2';
    x.fillRect(256, y, 256, 96);
    x.strokeStyle = barva;
    x.lineWidth = 8;
    x.strokeRect(262, y + 6, 244, 84);
    textNaStred(x, text, 384, y + 50, 'bold 46px Arial, sans-serif', barva);
    oblast(nazev, 256, y, 256, 96);
  });

  // jukebox – přední panel
  g = x.createLinearGradient(768, 320, 896, 512);
  g.addColorStop(0, '#ff4fa3');
  g.addColorStop(0.5, '#ffd34f');
  g.addColorStop(1, '#4fd8ff');
  x.fillStyle = g;
  x.fillRect(768, 320, 128, 192);
  x.fillStyle = '#2a1408';
  x.fillRect(784, 372, 96, 70);
  x.fillStyle = '#f5c542';
  for (let i = 0; i < 4; i++) x.fillRect(790, 380 + i * 15, 84, 7);
  oblast('jukebox', 768, 320, 128, 192);

  // pivní tácek
  x.fillStyle = '#f3e6c8';
  x.beginPath(); x.arc(928, 352, 31, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#b3261e';
  x.beginPath(); x.arc(928, 352, 24, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#f5c542';
  x.beginPath(); x.arc(928, 352, 12, 0, Math.PI * 2); x.fill();
  oblast('tacek', 896, 320, 64, 64);

  // cedulka WC
  x.fillStyle = '#1f4f8a';
  x.fillRect(896, 384, 96, 64);
  textNaStred(x, 'WC', 944, 417, 'bold 38px Arial, sans-serif', '#fff');
  oblast('wc', 896, 384, 96, 64);

  // otevřená kniha
  x.fillStyle = '#5a1f12';
  x.fillRect(0, 448, 256, 160);
  x.fillStyle = '#f8efd8';
  x.fillRect(8, 456, 116, 144);
  x.fillRect(132, 456, 116, 144);
  textNaStred(x, 'KNIHA', 66, 496, 'bold 24px Georgia, serif', '#5a1f12');
  textNaStred(x, 'vylepšení', 66, 526, 'italic 20px Georgia, serif', '#5a1f12');
  x.fillStyle = '#c9b48a';
  for (let i = 0; i < 7; i++) x.fillRect(146, 476 + i * 17, 70 + (i % 3) * 10, 5);
  x.fillStyle = '#d9a21b';
  x.beginPath(); x.arc(66, 566, 14, 0, Math.PI * 2); x.fill();
  oblast('kniha', 0, 448, 256, 160);

  // cedulky dřez a sklad
  x.fillStyle = '#24150c';
  x.fillRect(512, 384, 224, 64);
  textNaStred(x, 'Dřez – mytí sklenic', 624, 417, 'bold 24px Arial, sans-serif', '#bfe3ff');
  oblast('cedulka-drez', 512, 384, 224, 64);
  x.fillStyle = '#24150c';
  x.fillRect(512, 448, 224, 64);
  textNaStred(x, 'SKLAD – sudy', 624, 481, 'bold 28px Arial, sans-serif', '#f5c542');
  oblast('sklad', 512, 448, 224, 64);

  // plakáty (jen text, žádná loga)
  x.fillStyle = '#5c1d0c';
  x.fillRect(256, 512, 192, 256);
  x.strokeStyle = '#f5c542';
  x.lineWidth = 8;
  x.strokeRect(264, 520, 176, 240);
  textNaStred(x, 'Pivo', 352, 580, 'bold 44px Georgia, serif', '#f5c542');
  textNaStred(x, 'z Beskyd', 352, 628, 'bold 34px Georgia, serif', '#f5c542');
  textNaStred(x, 'Nošovice', 352, 690, '22px Arial, sans-serif', '#fbefd8');
  textNaStred(x, 'od roku 1970', 352, 720, '20px Arial, sans-serif', '#fbefd8');
  oblast('plakat', 256, 512, 192, 256);
  x.fillStyle = '#1f3a2a';
  x.fillRect(448, 512, 192, 256);
  x.strokeStyle = '#e9dcc0';
  x.lineWidth = 6;
  x.strokeRect(456, 520, 176, 240);
  textNaStred(x, 'Na zdraví!', 544, 575, 'bold 32px Georgia, serif', '#f5c542');
  ['Hladinka', 'Šnyt', 'Mlíko'].forEach((t, i) => textNaStred(x, t, 544, 630 + i * 36, 'bold 24px Georgia, serif', '#e9dcc0'));
  oblast('plakat2', 448, 512, 192, 256);

  // štítky kohoutů a sudů (4 na řádek)
  PIVA.forEach((p, i) => {
    const sx = (i % 4) * 128;
    const sy = 1472 + Math.floor(i / 4) * 48;
    x.fillStyle = '#1c120b';
    x.fillRect(sx, sy, 128, 48);
    x.strokeStyle = rgbText(p.pruh.map((c) => Math.min(1, c + 0.25)));
    x.lineWidth = 6;
    x.strokeRect(sx + 3, sy + 3, 122, 42);
    textNaStred(x, p.kratce, sx + 64, sy + 25, 'bold 21px Arial, sans-serif', '#f5e6c0', 112);
    oblast('stitek_' + p.id, sx, sy, 128, 48);
    const kx = 512 + sx;
    x.fillStyle = '#f4ead2';
    x.fillRect(kx, sy, 128, 48);
    x.fillStyle = rgbText(p.pruh);
    x.fillRect(kx, sy, 128, 10);
    textNaStred(x, p.nazev, kx + 64, sy + 30, 'bold 19px Arial, sans-serif', '#24150c', 118);
    oblast('sud_' + p.id, kx, sy, 128, 48);
  });
  kresliAtlasV5(x);
  kresliAtlasV6(x);

  // neonový nápis PIVO s půllitrem (vlastní kresba)
  x.fillStyle = '#140b10';
  x.fillRect(576, 1712, 384, 128);
  x.save();
  x.lineJoin = 'round';
  x.lineCap = 'round';
  x.shadowColor = '#ff9a4a';
  x.shadowBlur = 16;
  x.strokeStyle = '#ffb36b';
  x.lineWidth = 7;
  x.font = 'bold 74px Arial Rounded MT Bold, Arial, sans-serif';
  x.textAlign = 'left';
  x.textBaseline = 'middle';
  x.strokeText('PIVO', 690, 1778);
  x.strokeStyle = '#fff1d6';
  x.lineWidth = 2.5;
  x.shadowBlur = 4;
  x.strokeText('PIVO', 690, 1778);
  // půllitr: obrys, ucho a pěna
  x.shadowColor = '#ffd84a';
  x.shadowBlur = 14;
  x.strokeStyle = '#ffd84a';
  x.lineWidth = 6;
  x.strokeRect(606, 1748, 50, 66);
  x.beginPath(); x.arc(660, 1781, 15, -Math.PI / 2, Math.PI / 2); x.stroke();
  x.strokeStyle = '#fffbe8';
  x.beginPath(); x.moveTo(606, 1744); x.quadraticCurveTo(618, 1728, 631, 1742); x.quadraticCurveTo(644, 1726, 656, 1744); x.stroke();
  x.restore();
  oblast('neon', 576, 1712, 384, 128);

  // ulice za dveřmi
  g = x.createLinearGradient(0, 768, 0, 1024);
  g.addColorStop(0, '#0a1128');
  g.addColorStop(1, '#2b2235');
  x.fillStyle = g;
  x.fillRect(0, 768, 512, 256);
  x.fillStyle = '#120e16';
  x.fillRect(0, 844, 200, 180);
  x.fillRect(240, 824, 272, 200);
  x.fillStyle = '#ffd27a';
  [[30, 864], [90, 864], [30, 924], [150, 924], [270, 854], [330, 854], [400, 904], [460, 854]].forEach(([a, b]) => x.fillRect(a, b, 26, 30));
  x.fillStyle = 'rgba(255,220,150,.35)';
  x.beginPath(); x.arc(220, 864, 60, 0, Math.PI * 2); x.fill();
  oblast('ulice', 0, 768, 512, 256);
  return c;
}

/* ---------- Atlas v5: etikety deseti lahví, čísla stolů, cedule kuchyně a výdeje ---------- */
// Vlastní ozdoba etikety (žádná loga – jen jednoduché tvary)
function vzorEtikety(x, vzor, ex, ey, barva, ozdoba) {
  const cx = ex + 48, cy = ey + 64;
  x.save();
  x.strokeStyle = barva;
  x.fillStyle = ozdoba;
  x.lineWidth = 2;
  switch (vzor) {
    case 'ramecek':
      x.strokeRect(ex + 10, ey + 32, 76, 64);
      x.strokeStyle = ozdoba;
      x.strokeRect(ex + 14, ey + 36, 68, 56);
      break;
    case 'pruhy':
      for (let i = -3; i < 6; i++) { x.beginPath(); x.moveTo(ex + i * 14, ey + 106); x.lineTo(ex + i * 14 + 22, ey + 84); x.lineWidth = 5; x.strokeStyle = ozdoba; x.stroke(); }
      break;
    case 'list':
      [[-1, 0.5], [1, -0.5]].forEach(([s, a]) => {
        x.beginPath();
        x.ellipse(cx + s * 24, cy + 28, 13, 6, a, 0, Math.PI * 2);
        x.fill();
        x.beginPath(); x.moveTo(cx + s * 24 - 11 * Math.cos(a), cy + 28 - 11 * Math.sin(a)); x.lineTo(cx + s * 24 + 11 * Math.cos(a), cy + 28 + 11 * Math.sin(a)); x.lineWidth = 1; x.stroke();
      });
      break;
    case 'kruh':
      x.beginPath(); x.arc(cx, cy + 26, 11, 0, Math.PI * 2); x.fill();
      x.beginPath(); x.moveTo(cx, cy + 15); x.quadraticCurveTo(cx + 4, cy + 8, cx + 9, cy + 7); x.lineWidth = 2; x.stroke();
      break;
    case 'vlna':
      x.strokeStyle = ozdoba;
      x.lineWidth = 3;
      [0, 7].forEach((dy) => {
        x.beginPath();
        for (let px = 0; px <= 96; px += 4) { const py = ey + 92 + dy + Math.sin(px / 9) * 3; if (px) x.lineTo(ex + px, py); else x.moveTo(ex + px, py); }
        x.stroke();
      });
      break;
    case 'kosoctverec':
      x.strokeStyle = ozdoba;
      x.beginPath(); x.moveTo(cx, ey + 30); x.lineTo(ex + 88, cy); x.lineTo(cx, ey + 98); x.lineTo(ex + 8, cy); x.closePath(); x.stroke();
      break;
    case 'slunce':
      x.beginPath(); x.arc(cx, cy + 26, 8, 0, Math.PI * 2); x.fill();
      for (let i = 0; i < 12; i++) {
        const u = (i / 12) * Math.PI * 2;
        x.beginPath(); x.moveTo(cx + Math.cos(u) * 11, cy + 26 + Math.sin(u) * 11); x.lineTo(cx + Math.cos(u) * 17, cy + 26 + Math.sin(u) * 17); x.strokeStyle = ozdoba; x.stroke();
      }
      break;
  }
  x.restore();
}

function kresliAtlasV5(x) {
  // etikety lahví s pálenkou (jen text, barvy a vlastní ozdoby, žádná loga)
  PANAKY.forEach((p, i) => {
    const ex = i * 96, ey = 2048;
    const [podklad, pismo, ozdoba] = p.etiketa;
    x.fillStyle = podklad;
    x.fillRect(ex, ey, 96, 128);
    x.fillStyle = pismo;
    x.fillRect(ex, ey, 96, 18);
    x.fillRect(ex, ey + 112, 96, 16);
    x.fillStyle = ozdoba;
    x.fillRect(ex, ey + 18, 96, 3);
    x.fillRect(ex, ey + 109, 96, 3);
    vzorEtikety(x, p.vzor, ex, ey, pismo, ozdoba);
    const dlouhy = p.nazev.length > 10;
    textNaStred(x, p.nazev, ex + 48, ey + 52, `bold ${dlouhy ? 15 : 19}px Georgia, serif`, pismo, 86);
    textNaStred(x, '0,7 l', ex + 48, ey + 76, 'italic 13px Georgia, serif', pismo, 80);
    oblast('etiketa_' + p.id, ex, ey, 96, 128);
  });
  // čísla stolů na stojánek (1–10)
  for (let i = 1; i <= 10; i++) {
    const cx = (i - 1) * 64, cy = 2176;
    x.fillStyle = '#f7ecd2';
    x.fillRect(cx, cy, 64, 64);
    x.strokeStyle = '#8a1f12';
    x.lineWidth = 5;
    x.strokeRect(cx + 4, cy + 4, 56, 56);
    textNaStred(x, String(i), cx + 32, cy + 35, `bold ${i > 9 ? 32 : 40}px Georgia, serif`, '#8a1f12');
    oblast('cislo_' + i, cx, cy, 64, 64);
  }
  // cedule nad výdejním okénkem
  x.fillStyle = '#24150c';
  x.fillRect(512, 2240, 512, 128);
  x.strokeStyle = '#f5c542';
  x.lineWidth = 6;
  x.strokeRect(520, 2248, 496, 112);
  textNaStred(x, 'VÝDEJ JÍDEL', 768, 2306, 'bold 54px Georgia, serif', '#f5c542', 480);
  oblast('vydejJidel', 512, 2240, 512, 128);
  // cedulka na dveře kuchyně
  x.fillStyle = '#f7ecd2';
  x.fillRect(512, 2368, 256, 96);
  x.strokeStyle = '#6e2414';
  x.lineWidth = 6;
  x.strokeRect(518, 2374, 244, 84);
  textNaStred(x, 'KUCHYNĚ', 640, 2418, 'bold 44px Georgia, serif', '#6e2414', 230);
  oblast('kuchyneDvere', 512, 2368, 256, 96);
  // výdej pro číšníky (na podložce na pultu)
  x.fillStyle = '#1b1b1d';
  x.fillRect(768, 2368, 256, 64);
  textNaStred(x, 'VÝDEJ', 896, 2401, 'bold 44px Arial, sans-serif', '#f5c542', 240);
  oblast('vydej', 768, 2368, 256, 64);
  // cedule na zatlučeném okénku
  kresliDrevo(x, 512, 2464, 512, 256, '#b98c5a', '#5a3a1a', 8);
  x.fillStyle = 'rgba(247,236,210,.95)';
  x.fillRect(536, 2484, 464, 216);
  x.strokeStyle = '#8a1f12';
  x.lineWidth = 6;
  x.strokeRect(544, 2492, 448, 200);
  textNaStred(x, 'KUCHYNĚ', 768, 2540, 'bold 50px Georgia, serif', '#8a1f12', 430);
  textNaStred(x, 'otevřeme brzy!', 768, 2600, 'italic 36px Georgia, serif', '#3d2414', 430);
  textNaStred(x, 'Otevřeš ji v knize na pultu (záložka Kuchyně)', 768, 2656, 'bold 21px Arial, sans-serif', '#3d2414', 430);
  oblast('kuchyneBrzy', 512, 2464, 512, 256);
  // cedulka POKLADNA
  x.fillStyle = '#24150c';
  x.fillRect(0, 2688, 256, 64);
  textNaStred(x, 'POKLADNA', 128, 2721, 'bold 36px Georgia, serif', '#f5c542', 240);
  oblast('pokladna', 0, 2688, 256, 64);
  // plakát na hokej
  const g = x.createLinearGradient(0, 2752, 0, 3008);
  g.addColorStop(0, '#16324f');
  g.addColorStop(1, '#0b1626');
  x.fillStyle = g;
  x.fillRect(256, 2752, 192, 256);
  x.strokeStyle = '#e8f3ff';
  x.lineWidth = 6;
  x.strokeRect(264, 2760, 176, 240);
  textNaStred(x, 'HOKEJ', 352, 2810, 'bold 44px Arial, sans-serif', '#ffffff');
  textNaStred(x, 'v televizi', 352, 2852, 'italic 22px Georgia, serif', '#f5c542');
  // dvě zkřížené hokejky a puk
  x.strokeStyle = '#d9b37a';
  x.lineWidth = 7;
  [[300, 2880, 400, 2960], [404, 2880, 304, 2960]].forEach(([a, b, c2, d2]) => { x.beginPath(); x.moveTo(a, b); x.lineTo(c2, d2); x.stroke(); });
  x.fillStyle = '#111';
  x.beginPath(); x.ellipse(352, 2975, 14, 6, 0, 0, Math.PI * 2); x.fill();
  oblast('plakatHokej', 256, 2752, 192, 256);
  // lístek s objednávkou do kuchyně
  x.fillStyle = '#fbf8ef';
  x.fillRect(448, 2752, 64, 96);
  x.fillStyle = '#c0392b';
  x.fillRect(448, 2752, 64, 10);
  x.fillStyle = 'rgba(40,40,60,.75)';
  for (let i = 0; i < 6; i++) x.fillRect(456, 2772 + i * 11, 30 + (i * 17) % 20, 3);
  oblast('listek', 448, 2752, 64, 96);
}

/* ---------- v6: obrazy na zdi (vše vlastní kresba) ---------- */
// Sépiová fotka: ztmavení do hněda, zrnitost, vybledlé okraje
function sepie(x, x0, y0, w, hgt) {
  const img = x.getImageData(x0, y0, w, hgt);
  const D = img.data;
  for (let i = 0; i < D.length; i += 4) {
    const l = (D[i] * 0.3 + D[i + 1] * 0.59 + D[i + 2] * 0.11) / 255;
    const sum = (Math.random() - 0.5) * 0.08;
    const px = (i / 4) % w, py = Math.floor(i / 4 / w);
    const okraj = Math.min(px, w - px, py, hgt - py) / 30;
    const k = omez(l + sum, 0, 1) * (0.78 + 0.22 * Math.min(1, okraj));
    D[i] = 40 + k * 205;
    D[i + 1] = 28 + k * 180;
    D[i + 2] = 18 + k * 140;
  }
  x.putImageData(img, x0, y0);
}

function kresliAtlasV6(x) {
  // 1) stará fotka hostince (sépie)
  let x0 = 0, y0 = 3072;
  let g = x.createLinearGradient(0, y0, 0, y0 + 192);
  g.addColorStop(0, '#d9d4c8');
  g.addColorStop(1, '#a9a297');
  x.fillStyle = g;
  x.fillRect(x0, y0, 256, 192);
  x.fillStyle = '#7d766c';
  x.fillRect(x0, y0 + 150, 256, 42);            // ulice
  x.fillStyle = '#b8b0a2';
  x.fillRect(x0 + 34, y0 + 52, 188, 104);       // fasáda
  x.fillStyle = '#5e574e';
  x.beginPath(); x.moveTo(x0 + 24, y0 + 56); x.lineTo(x0 + 128, y0 + 18); x.lineTo(x0 + 232, y0 + 56); x.fill(); // střecha
  x.fillStyle = '#40392f';
  [[48, 66], [82, 66], [150, 66], [184, 66]].forEach(([a, b]) => x.fillRect(x0 + a, y0 + b, 24, 26));
  [[48, 112], [184, 112]].forEach(([a, b]) => x.fillRect(x0 + a, y0 + b, 24, 30));
  x.fillStyle = '#2c2620';
  x.fillRect(x0 + 112, y0 + 104, 32, 52);       // dveře
  x.fillStyle = '#e6dfd2';
  x.fillRect(x0 + 82, y0 + 92, 92, 12);         // vývěsní štít
  textNaStred(x, 'HOSTINEC', x0 + 128, y0 + 98, 'bold 11px Georgia, serif', '#2c2620');
  // lidé před hospodou
  [[70, 1], [92, 0.9], [168, 1.05], [196, 0.95]].forEach(([a, v]) => {
    x.fillStyle = '#2f2a24';
    x.beginPath(); x.arc(x0 + a, y0 + 146 - 34 * v, 5 * v, 0, Math.PI * 2); x.fill();
    x.fillRect(x0 + a - 6 * v, y0 + 146 - 29 * v, 12 * v, 22 * v);
    x.fillRect(x0 + a - 5 * v, y0 + 146 - 8 * v, 4 * v, 10 * v);
    x.fillRect(x0 + a + 1 * v, y0 + 146 - 8 * v, 4 * v, 10 * v);
  });
  sepie(x, x0, y0, 256, 192);
  x.strokeStyle = '#efe7d6';
  x.lineWidth = 8;
  x.strokeRect(x0 + 4, y0 + 4, 248, 184);
  textNaStred(x, 'U Hořkého kohoutu · 1928', x0 + 128, y0 + 180, 'italic 10px Georgia, serif', '#5a4a38');
  oblast('fotoHospoda', x0, y0, 256, 192);

  // 2) fotka hokejového oddílu (černobílá, dresy bez log)
  x0 = 256;
  g = x.createLinearGradient(0, y0, 0, y0 + 192);
  g.addColorStop(0, '#cfd3d6');
  g.addColorStop(0.62, '#e8ebec');
  g.addColorStop(0.63, '#9aa0a4');
  g.addColorStop(1, '#d8dcde');
  x.fillStyle = g;
  x.fillRect(x0, y0, 256, 192);
  const hrac = (a, b, v, klece) => {
    x.fillStyle = '#e9e9e9';
    x.fillRect(a - 13 * v, b - 30 * v, 26 * v, 34 * v);           // dres
    x.fillStyle = '#454545';
    x.fillRect(a - 13 * v, b - 18 * v, 26 * v, 6 * v);            // pruh přes dres
    x.fillRect(a - 18 * v, b - 28 * v, 6 * v, 22 * v);            // rukávy
    x.fillRect(a + 12 * v, b - 28 * v, 6 * v, 22 * v);
    x.fillStyle = '#d7c3b0';
    x.beginPath(); x.arc(a, b - 38 * v, 8 * v, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#2a2a2a';
    x.beginPath(); x.arc(a, b - 41 * v, 8.5 * v, Math.PI, 0); x.fill(); // helma
    if (klece) { x.strokeStyle = '#2a2a2a'; x.lineWidth = 1; x.strokeRect(a - 6 * v, b - 40 * v, 12 * v, 8 * v); }
    x.fillStyle = '#303030';
    x.fillRect(a - 11 * v, b + 4 * v, 22 * v, 14 * v);            // kalhoty
  };
  for (let i = 0; i < 6; i++) hrac(x0 + 34 + i * 38, y0 + 96, 1, i % 2);
  for (let i = 0; i < 5; i++) hrac(x0 + 52 + i * 38, y0 + 140, 1.08, 0);
  x.strokeStyle = '#5a4630';
  x.lineWidth = 3;
  x.beginPath(); x.moveTo(x0 + 60, y0 + 172); x.lineTo(x0 + 196, y0 + 152); x.moveTo(x0 + 60, y0 + 152); x.lineTo(x0 + 196, y0 + 172); x.stroke();
  sepie(x, x0, y0, 256, 192);
  x.strokeStyle = '#f0ece2';
  x.lineWidth = 8;
  x.strokeRect(x0 + 4, y0 + 4, 248, 184);
  textNaStred(x, 'Hokejový oddíl štamgastů', x0 + 128, y0 + 180, 'italic 10px Georgia, serif', '#4a4036');
  oblast('fotoHokej', x0, y0, 256, 192);

  // 3) botanický obrázek chmele
  x0 = 512;
  x.fillStyle = '#f1e7cf';
  x.fillRect(x0, y0, 192, 256);
  skvrnyNa(x, x0, y0, 192, 256);
  x.strokeStyle = '#3e5e2a';
  x.lineWidth = 2.5;
  x.beginPath(); x.moveTo(x0 + 96, y0 + 30);
  for (let i = 0; i <= 10; i++) x.lineTo(x0 + 96 + Math.sin(i * 0.9) * 22, y0 + 30 + i * 18);
  x.stroke();
  const list = (a, b, r, uhel) => {
    x.save(); x.translate(a, b); x.rotate(uhel);
    x.fillStyle = '#5d8a3a';
    x.strokeStyle = '#2f4a1e';
    x.lineWidth = 1;
    x.beginPath();
    x.moveTo(0, 0);
    [[-r * 0.8, -r * 0.5], [-r * 0.35, -r * 1.1], [0, -r * 0.7], [r * 0.35, -r * 1.1], [r * 0.8, -r * 0.5]].forEach(([p, q], i) => {
      if (i % 2 === 0) x.quadraticCurveTo(p * 1.1, q * 0.5, p, q); else x.lineTo(p, q);
    });
    x.closePath(); x.fill(); x.stroke();
    x.beginPath(); x.moveTo(0, 0); x.lineTo(0, -r * 0.7); x.stroke();
    x.restore();
  };
  list(x0 + 60, y0 + 90, 26, -0.9);
  list(x0 + 136, y0 + 120, 24, 0.9);
  list(x0 + 70, y0 + 170, 22, -1.1);
  const sistice = (a, b, v) => {
    for (let r = 0; r < 5; r++) {
      for (let k = -1; k <= 1; k++) {
        x.fillStyle = r % 2 ? '#b9cf74' : '#a8c05f';
        x.strokeStyle = '#6b7f35';
        x.lineWidth = 0.8;
        x.beginPath();
        x.ellipse(a + k * 5 * v * (1 - r * 0.12), b + r * 7 * v, 5 * v, 5.5 * v, 0, 0, Math.PI * 2);
        x.fill(); x.stroke();
      }
    }
  };
  sistice(x0 + 116, y0 + 66, 1.1);
  sistice(x0 + 84, y0 + 128, 1);
  sistice(x0 + 122, y0 + 176, 0.9);
  textNaStred(x, 'Chmel otáčivý', x0 + 96, y0 + 228, 'italic bold 15px Georgia, serif', '#3a2a18');
  textNaStred(x, 'Humulus lupulus', x0 + 96, y0 + 245, 'italic 10px Georgia, serif', '#6a5638');
  x.strokeStyle = '#8a6a3a';
  x.lineWidth = 2;
  x.strokeRect(x0 + 8, y0 + 8, 176, 240);
  oblast('chmelObraz', x0, y0, 192, 256);

  // 4) dřevěná cedule „Stůl štamgastů“
  x0 = 704;
  kresliDrevo(x, x0, y0, 320, 128, '#6e4220', '#2e1606', 12);
  x.strokeStyle = '#c99a3a';
  x.lineWidth = 5;
  x.strokeRect(x0 + 6, y0 + 6, 308, 116);
  textNaStred(x, 'STŮL ŠTAMGASTŮ', x0 + 160, y0 + 46, 'bold 30px Georgia, serif', '#f5c542', 290);
  textNaStred(x, 'Pepa · Jarda · Franta · Mirek · Vlasta', x0 + 160, y0 + 88, 'italic 18px Georgia, serif', '#fbe7b8', 290);
  oblast('stamgasti', x0, y0, 320, 128);
}
// skvrny na starém papíře
function skvrnyNa(x, x0, y0, w, hgt) {
  for (let i = 0; i < 14; i++) {
    const a = x0 + Math.random() * w, b = y0 + Math.random() * hgt, r = 10 + Math.random() * 30;
    const g = x.createRadialGradient(a, b, 0, a, b, r);
    g.addColorStop(0, 'rgba(150,110,60,.12)');
    g.addColorStop(1, 'rgba(150,110,60,0)');
    x.fillStyle = g;
    x.fillRect(a - r, b - r, r * 2, r * 2);
  }
}
/* =========================================================
   15) SVĚT – hospoda, sklad, kuchyně, nábytek, světla, kolize
   Souřadnice v metrech: x na východ, y nahoru, z na jih (ke dveřím)
   Sál je 20 × 12,5 m: vlevo vzadu výčep, za ním sklad sudů a kuchyně.
   ========================================================= */
const SVET = {
  sirka: 20, hloubka: 12.5, vyska: 3.2,
  pult: { x0: 0, x1: 9.8, z0: 2.0, z1: 2.7, y: 1.1 },
  zadniPult: { x0: 0, x1: 9.8, z0: 0, z1: 0.6, y: 0.95 },
  prepazka: 11.0,                       // stěna mezi barem a skladem
  sklad: { x0: 11.15, x1: 14.0, z0: 0, z1: 2.6, dvereZ0: 0.75, dvereZ1: 1.75 },
  // kuchyně za sálem (odemyká se v knize): okénko a dveře jsou v její jižní stěně
  kuchyne: { x0: 14.15, x1: 20, z0: 0, z1: 3.45, stena: 3.6,
    okenko: { x0: 15.0, x1: 16.6, y0: 1.0, y1: 1.85 }, dvere: { x0: 18.55, x1: 19.45 } },
  dvere: { x0: 10.75, x1: 11.95, vyska: 2.2 },
  venku: { x: 11.35, z: 15.2 },          // tady se hosté objevují a mizí
  drez: { x: 8.2, z: 0.32 },
  regal: { x0: 4.85, x1: 6.65, z: 0.3 },
  kniha: { x: 8.85, z: 2.35 },
  vydej: { x0: 9.22, x1: 9.76, z0: 2.08, z1: 2.62 },   // sem pokládáš nápoje pro číšníky
  cedule: { x: 11.5, y: 1.45, z: 12.5 },
  kohoutZ: 2.17,
  vezZ: 2.34,
  stolicky: [1.3, 2.5, 5.05, 7.6, 8.5],
  stolickyZ: 3.15,
  // prvních 5 stolů je od začátku, dalších 5 přibude vylepšením
  stoly: [[5.6, 5.6], [2.3, 5.6], [8.7, 5.6], [5.6, 9.0], [2.3, 9.0], [8.7, 9.0], [14.0, 5.6], [17.4, 5.6], [14.0, 9.0], [17.4, 9.0]],
  // sudy ve skladu: 7 u severní stěny, další 3 u východní
  sudPoz: (i) => (i < 7 ? { x: 11.45 + i * 0.38, z: 0.38, stena: 'sever' } : { x: 13.66, z: 0.92 + (i - 7) * 0.38, stena: 'vychod' }),
  odkapavace: [[2.82, 4.38], [5.57, 7.13]],
  lahveZ: 0.2,                          // lahve s pálenkou ve stojanu na zadním pultu
  panakZ: 0.46,                         // kam se staví panákovka při nalévání
  regalPanaku: { x0: 3.08, x1: 3.8 },
  start: { x: 4.6, z: 1.15, yaw: Math.PI },
  okenkoStani: { x: 15.8, z: 4.0 },     // kde se u okénka stojí ze sálu
  okenkoKuchar: { x: 15.8, z: 2.95 },   // a kde stojí kuchařka
  okenkoY: 1.045,                        // výška police okénka
  vydejStani: { x: 9.5, z: 3.08 },
  pokladna: { x0: 12.75, x1: 13.85, z0: 11.2, z1: 11.6 },
  tvZ: 9.3, wcZ: 6.8, hodinyZ: 11.95, jukeboxZ: 7.65,
  okna: [[1.4, 3.0], [4.8, 6.4], [7.9, 9.5], [14.2, 15.8], [17.2, 18.8]]   // okna do ulice (x od–do), sklo 1,05–2,25 m
};
const POCET_STOLU_ZAKLAD = 5;

let staticke = [];      // [{ sit, tex, lesk }]
let stinySit = null;    // měkké stíny pod nábytkem (kreslí se průhledně)
let stinyDavka = null;
let aoSit = null;       // tmavé přechody u stěn a pod pulty („ambient occlusion“)
let aoDavka = null;
let kuzelySit = null;   // kužely světla pod lampami
// plocha stínu na podlaze (střed, rozměry)
function stinNaZemi(x, z, sx, sz, y = 0.003) {
  obdelnik(stinyDavka, [[x - sx / 2, y, z + sz / 2], [x + sx / 2, y, z + sz / 2], [x + sx / 2, y, z - sz / 2], [x - sx / 2, y, z - sz / 2]], [0, 0, 1, 1], [1, 1, 1]);
}
// tmavý pruh podél hrany: a–b je čára u zdi, n = směr od zdi (jednotkový, po podlaze), sirka v metrech
function aoPruh(a, b, n, sirka, sila = 0.42, y = 0.0025) {
  const d = aoDavka;
  d.alfa = sila;
  const i0 = d.vrchol(a[0], y, a[1], 0, 1, 0, [0, 0, 0], 0, 0, 0);
  const i1 = d.vrchol(b[0], y, b[1], 0, 1, 0, [0, 0, 0], 0, 1, 0);
  d.alfa = 0;
  const i2 = d.vrchol(b[0] + n[0] * sirka, y, b[1] + n[1] * sirka, 0, 1, 0, [0, 0, 0], 0, 1, 1);
  const i3 = d.vrchol(a[0] + n[0] * sirka, y, a[1] + n[1] * sirka, 0, 1, 0, [0, 0, 0], 0, 0, 1);
  d.alfa = 1;
  // pořadí vrcholů tak, aby byl pruh vidět shora
  if ((b[1] - a[1]) * n[0] - (b[0] - a[0]) * n[1] > 0) d.ctyruhelnik(i0, i1, i2, i3); else d.ctyruhelnik(i0, i3, i2, i1);
}
// svislý přechod na stěně u podlahy (zeď ve směru a–b, n = normála zdi do místnosti)
function aoStena(a, b, n, vyska = 0.45, sila = 0.3) {
  const d = aoDavka, o = 0.004;
  d.alfa = sila;
  const i0 = d.vrchol(a[0] + n[0] * o, 0, a[1] + n[1] * o, n[0], 0, n[1], [0, 0, 0], 0, 0, 0);
  const i1 = d.vrchol(b[0] + n[0] * o, 0, b[1] + n[1] * o, n[0], 0, n[1], [0, 0, 0], 0, 1, 0);
  d.alfa = 0;
  const i2 = d.vrchol(b[0] + n[0] * o, vyska, b[1] + n[1] * o, n[0], 0, n[1], [0, 0, 0], 0, 1, 1);
  const i3 = d.vrchol(a[0] + n[0] * o, vyska, a[1] + n[1] * o, n[0], 0, n[1], [0, 0, 0], 0, 0, 1);
  d.alfa = 1;
  // pořadí podle toho, kam zeď kouká (aby byl čtyřúhelník vidět zepředu)
  const kriz = (b[0] - a[0]) * n[1] - (b[1] - a[1]) * n[0];
  if (kriz > 0) d.ctyruhelnik(i0, i1, i2, i3); else d.ctyruhelnik(i0, i3, i2, i1);
}
let prekazky = [];      // kvádry pro hráče [x0, z0, x1, z1]
let sedadla = [];       // židle u stolů
let stolicky = [];      // barové stoličky
let svetla = [];
let svicky = [];        // svíčky na stolech (kde hoří plamínek)

function pocetStolu() { return Math.min(SVET.stoly.length, POCET_STOLU_ZAKLAD + (HRA.vylepseni.stul || 0)); }
const maKuchyni = () => Boolean(HRA.vylepseni.kuchyne);

/* ---------- Světla: 3 nad barem, sklad, 10 nad stoly, 2 v kuchyni (max. 16) ---------- */
function pripravSvetla() {
  const tepla = [1.0, 0.74, 0.44];
  svetla = [
    { poz: [2.4, 2.45, 2.3], barva: tepla, sila: 1.05, mistnost: 0, lampa: 'bar' },
    { poz: [5.5, 2.45, 2.3], barva: tepla, sila: 1.05, mistnost: 0, lampa: 'bar' },
    { poz: [8.6, 2.45, 2.3], barva: tepla, sila: 1.05, mistnost: 0, lampa: 'bar' },
    { poz: [12.6, 2.75, 1.25], barva: [1.0, 0.86, 0.62], sila: 1.0, mistnost: 1, lampa: 'sklad' }
  ];
  SVET.stoly.forEach(([x, z]) => svetla.push({ poz: [x, 2.5, z], barva: tepla, sila: 0.88, mistnost: 0, lampa: 'stul' }));
  const kuch = maKuchyni() ? 1.0 : 0;
  svetla.push({ poz: [16.2, 2.95, 1.6], barva: [1.0, 0.95, 0.86], sila: kuch, mistnost: 2, lampa: 'kuchyne' });
  svetla.push({ poz: [18.7, 2.95, 1.8], barva: [1.0, 0.95, 0.86], sila: kuch * 0.9, mistnost: 2, lampa: 'kuchyne' });
}

// Pseudonáhoda se semínkem – výzdoba vypadá pokaždé stejně
let stavSeminka = 1;
function seminko() {
  stavSeminka = (stavSeminka * 16807) % 2147483647;
  return (stavSeminka - 1) / 2147483646;
}
// náhodná položka podle semínka (s pojistkou)
const nahodneZ = (seznam, jinak) => seznam[Math.floor(seminko() * seznam.length)] || jinak;

const BARVY_SVETA = {
  drevo: [0.85, 0.7, 0.58], tmave: [0.55, 0.42, 0.34], obklad: [0.78, 0.6, 0.48],
  chrom: [0.82, 0.84, 0.87], kov: [0.55, 0.58, 0.6], bila: [1, 1, 1], ohyb: [0.42, 0.25, 0.15]
};
// jak moc se lesknou dávky (lakované dřevo, chrom…) – lesk se dá nastavit i po vrcholech (d.lesk)
const LESK_DAVEK = { chrom: 0.95, nerez: 0.7, kachlicky: 0.35, dlazbaK: 0.2 };

/* ---------- Stavba celé hospody (při startu a po vylepšení) ---------- */
function postavSvet() {
  stavSeminka = 20261027;
  staticke.forEach((s) => smazSit(s.sit));
  smazSit(stinySit);
  smazSit(aoSit);
  smazSit(kuzelySit);
  stinyDavka = new Davka();
  aoDavka = new Davka();
  prekazky = [];
  sedadla = [];
  stolicky = [];
  svicky = [];
  pripravSvetla();
  const d = { drevo: new Davka(), podlaha: new Davka(), omitka: new Davka(), cihly: new Davka(), atlas: new Davka(), bila: new Davka(),
    ubrus: new Davka(), dlazba: new Davka(), chrom: new Davka(), nerez: new Davka(), kachlicky: new Davka(), dlazbaK: new Davka() };
  postavMistnost(d);
  postavBar(d);
  postavSklad(d);
  postavKuchyni(d);
  for (let i = 0; i < SVET.stoly.length; i++) {
    if (i < pocetStolu()) postavStul(d, SVET.stoly[i][0], SVET.stoly[i][1], i);
    else postavVolnyStul(d, SVET.stoly[i][0], SVET.stoly[i][1]);
  }
  SVET.stolicky.forEach((x, i) => postavStolicku(d, x, SVET.stolickyZ, i));
  postavVyzdobu(d);
  staticke = Object.entries(d).filter(([, b]) => b.n > 0).map(([tex, b]) => ({ sit: vytvorSit(b), tex }));
  stinySit = stinyDavka.n ? vytvorSit(stinyDavka) : null;
  aoSit = aoDavka.n ? vytvorSit(aoDavka) : null;
  kuzelySit = postavKuzely();
  postavMrizku();
  if (program) nastavSvetla(svetla);
  oznacZmenuSveta();
}

function postavMistnost(d) {
  const W = SVET.sirka, D = SVET.hloubka, V = SVET.vyska;
  const B = BARVY_SVETA;
  const k = SVET.kuchyne, s = SVET.sklad, P = SVET.prepazka;
  // podlaha (lakovaná prkna se lesknou), strop, trámy
  d.podlaha.lesk = 0.32;
  kvadr(d.podlaha, 0, -0.1, 0, W, 0, D, [0.95, 0.9, 0.85], { uv: 0.5, bez: ['dole'] });
  d.podlaha.lesk = 0;
  kvadr(d.drevo, 0, V, 0, W, V + 0.1, D, [0.42, 0.32, 0.26], { uv: 0.5 });
  for (let z = 1.2; z < D; z += 2.2) kvadr(d.drevo, 0, V - 0.22, z, W, V, z + 0.24, [0.4, 0.3, 0.24], { uv: 1 });
  // stěny
  const stena = (x0, z0, x1, z1, y0 = 0, y1 = V, tex = d.omitka) => {
    kvadr(tex, x0, y0, z0, x1, y1, z1, [1, 1, 1], { uv: tex === d.cihly ? 1 : 0.5 });
    if (y0 === 0) prekazky.push([x0, z0, x1, z1]);
  };
  stena(-0.2, -0.2, 0, D + 0.2);
  stena(W, -0.2, W + 0.2, D + 0.2);
  stena(0, -0.2, W, 0);
  stena(0, D, SVET.dvere.x0, D + 0.15);
  stena(SVET.dvere.x1, D, W, D + 0.15);
  kvadr(d.omitka, SVET.dvere.x0, SVET.dvere.vyska, D, SVET.dvere.x1, V, D + 0.15, [1, 1, 1], { uv: 0.5 });
  prekazky.push([SVET.dvere.x0, D, SVET.dvere.x1, D + 0.15]); // hráč ven nesmí
  // dřevěný obklad dole po obvodu sálu
  const obklad = (x0, z0, x1, z1) => {
    kvadr(d.drevo, x0, 0, z0, x1, 1.0, z1, B.obklad, { uv: 1 });
    kvadr(d.drevo, Math.min(x0, x1) - 0.005, 1.0, Math.min(z0, z1) - 0.005, Math.max(x0, x1) + 0.005, 1.06, Math.max(z0, z1) + 0.005, B.tmave);
  };
  obklad(0, SVET.pult.z1, 0.04, D);
  obklad(W - 0.04, k.stena, W, D);
  obklad(0, D - 0.04, SVET.dvere.x0, D);
  obklad(SVET.dvere.x1, D - 0.04, W, D);
  obklad(P + 0.15, s.z1 + 0.15, k.x0 - 0.15, s.z1 + 0.19);
  obklad(k.x0 - 0.15, k.stena, k.dvere.x0, k.stena + 0.04);
  obklad(k.dvere.x1, k.stena, W - 0.04, k.stena + 0.04);
  // cihlová stěna za barem
  kvadr(d.cihly, 0, 0.95, 0, P, V, 0.03, [1, 1, 1], { uv: 1, bez: ['sever'] });

  // přepážka se vchodem do skladu a jižní stěna skladu
  stena(P, 0, P + 0.15, s.dvereZ0);
  stena(P, s.dvereZ1, P + 0.15, SVET.pult.z1 + 0.05);
  kvadr(d.omitka, P, 2.1, s.dvereZ0, P + 0.15, V, s.dvereZ1, [1, 1, 1], { uv: 0.5 });
  stena(P + 0.15, s.z1, k.x0 - 0.15, s.z1 + 0.15);
  [[s.dvereZ0 - 0.05, s.dvereZ0], [s.dvereZ1, s.dvereZ1 + 0.05]].forEach(([a, b]) => kvadr(d.drevo, P - 0.02, 0, a, P + 0.17, 2.15, b, B.tmave));
  kvadr(d.drevo, P - 0.02, 2.1, s.dvereZ0 - 0.05, P + 0.17, 2.16, s.dvereZ1 + 0.05, B.tmave);
  obdelnik(d.atlas, [[P - 0.005, 2.18, s.dvereZ1 - 0.05], [P - 0.005, 2.18, s.dvereZ0 + 0.05], [P - 0.005, 2.42, s.dvereZ0 + 0.05], [P - 0.005, 2.42, s.dvereZ1 - 0.05]], ATLAS.sklad, [1, 1, 1], 0.35);
  // stěna mezi skladem a kuchyní (až k jižní stěně kuchyně)
  stena(k.x0 - 0.15, 0, k.x0, k.stena);
  // jižní stěna kuchyně s okénkem a dveřmi
  const zk0 = k.z1, zk1 = k.stena, o = k.okenko, dv = k.dvere;
  stena(k.x0 - 0.15, zk0, o.x0, zk1);
  stena(o.x1, zk0, dv.x0, zk1);
  stena(dv.x1, zk0, W, zk1);
  kvadr(d.omitka, o.x0, 0, zk0, o.x1, o.y0, zk1, [1, 1, 1], { uv: 0.5 });
  prekazky.push([o.x0, zk0, o.x1, zk1]);
  kvadr(d.omitka, o.x0, o.y1, zk0, o.x1, V, zk1, [1, 1, 1], { uv: 0.5 });
  kvadr(d.omitka, dv.x0, 2.1, zk0, dv.x1, V, zk1, [1, 1, 1], { uv: 0.5 });
  // dřevěné zárubně okénka a dveří
  kvadr(d.drevo, o.x0 - 0.06, o.y0 - 0.04, zk1, o.x1 + 0.06, o.y0, zk1 + 0.03, B.tmave);
  kvadr(d.drevo, o.x0 - 0.06, o.y1, zk1, o.x1 + 0.06, o.y1 + 0.06, zk1 + 0.03, B.tmave);
  [[o.x0 - 0.06, o.x0], [o.x1, o.x1 + 0.06]].forEach(([a, b]) => kvadr(d.drevo, a, o.y0, zk1, b, o.y1, zk1 + 0.03, B.tmave));
  [[dv.x0 - 0.06, dv.x0], [dv.x1, dv.x1 + 0.06]].forEach(([a, b]) => kvadr(d.drevo, a, 0, zk1, b, 2.16, zk1 + 0.03, B.tmave));
  kvadr(d.drevo, dv.x0 - 0.06, 2.1, zk1, dv.x1 + 0.06, 2.16, zk1 + 0.03, B.tmave);

  // stmavení u paty stěn a pod pulty
  const pod = SVET.pult;
  aoPruh([0.04, pod.z1], [0.04, D - 0.04], [1, 0], 0.45);
  aoPruh([0.04, D - 0.04], [SVET.dvere.x0, D - 0.04], [0, -1], 0.45);
  aoPruh([SVET.dvere.x1, D - 0.04], [W - 0.04, D - 0.04], [0, -1], 0.45);
  aoPruh([W - 0.04, k.stena], [W - 0.04, D - 0.04], [-1, 0], 0.45);
  aoPruh([P + 0.15, s.z1 + 0.19], [k.x0 - 0.15, s.z1 + 0.19], [0, 1], 0.4);
  aoPruh([k.x0 - 0.15, k.stena + 0.04], [W - 0.04, k.stena + 0.04], [0, 1], 0.4);
  aoPruh([pod.x0, pod.z1 + 0.04], [pod.x1, pod.z1 + 0.04], [0, 1], 0.5, 0.5);
  aoPruh([pod.x0 + 0.04, pod.z0], [pod.x1, pod.z0], [0, -1], 0.45, 0.45);
  aoPruh([0.04, SVET.zadniPult.z1], [SVET.zadniPult.x1, SVET.zadniPult.z1], [0, 1], 0.45, 0.45);
  aoStena([0, D], [0, pod.z1], [1, 0]);
  aoStena([SVET.dvere.x0, D], [0, D], [0, -1]);
  aoStena([W, D], [SVET.dvere.x1, D], [0, -1]);
  aoStena([W, k.stena], [W, D], [-1, 0]);

  // dveře na WC ve východní stěně sálu
  const wc = SVET.wcZ;
  kvadr(d.drevo, W - 0.06, 0, wc - 0.5, W, 2.05, wc + 0.5, [0.7, 0.5, 0.36]);
  kvadr(d.bila, W - 0.09, 1.0, wc + 0.32, W - 0.06, 1.04, wc + 0.42, [0.85, 0.68, 0.25]);
  obdelnik(d.atlas, [[W - 0.065, 1.6, wc - 0.2], [W - 0.065, 1.6, wc + 0.2], [W - 0.065, 1.9, wc + 0.2], [W - 0.065, 1.9, wc - 0.2]], ATLAS.wc, [1, 1, 1], 0.2);
}

function postavBar(d) {
  const B = BARVY_SVETA;
  const p = SVET.pult;
  // výčepní pult: panely, lakovaná deska, mosazná tyč
  kvadr(d.drevo, p.x0, 0, p.z0 + 0.08, p.x1, p.y - 0.06, p.z1 - 0.06, B.drevo, { uv: 1 });
  for (let x = p.x0 + 0.6; x < p.x1; x += 1.2) kvadr(d.drevo, x - 0.02, 0.08, p.z1 - 0.06, x + 0.02, p.y - 0.1, p.z1 - 0.04, B.tmave);
  for (let x = p.x0 + 0.12; x < p.x1 - 0.5; x += 1.2) {
    // vložené rámečky panelů
    kvadr(d.drevo, x, 0.22, p.z1 - 0.06, x + 0.96, 0.25, p.z1 - 0.045, B.tmave);
    kvadr(d.drevo, x, p.y - 0.25, p.z1 - 0.06, x + 0.96, p.y - 0.22, p.z1 - 0.045, B.tmave);
  }
  kvadr(d.drevo, p.x0, 0, p.z1 - 0.06, p.x1, 0.08, p.z1 - 0.04, B.tmave);
  d.drevo.lesk = 0.55;
  kvadr(d.drevo, p.x0, p.y - 0.06, p.z0, p.x1 + 0.05, p.y, p.z1 + 0.04, B.tmave, { uv: 1 });
  d.drevo.lesk = 0;
  d.chrom.lesk = 0.8;
  valecVodorovne(d.chrom, p.x0, p.x1, 0.2, p.z1 + 0.14, 0.022, [1.0, 0.78, 0.36], 0.2);
  for (let x = p.x0 + 0.9; x < p.x1; x += 1.8) trubka(d.chrom, [[x, 0.2, p.z1 + 0.14], [x, 0.14, p.z1 + 0.09], [x, 0.12, p.z1 - 0.04]], 0.012, 8, [1.0, 0.78, 0.36]);
  d.chrom.lesk = 0;
  prekazky.push([p.x0, p.z0, p.x1 + 0.05, p.z1 + 0.04]);
  // dvě výčepní místa: nerezová vana s mřížkou
  SVET.odkapavace.forEach(([x0, x1]) => {
    kvadr(d.chrom, x0, p.y, 2.04, x1, p.y + 0.02, 2.4, B.kov, { e: 0.12, uvCele: true, deleni: 0 });
    for (let x = x0 + 0.03; x < x1 - 0.02; x += 0.045) kvadr(d.bila, x, p.y + 0.02, 2.07, x + 0.022, p.y + 0.024, 2.37, [0.36, 0.38, 0.41], { deleni: 0 });
  });
  // každé pivo má vlastní chromovaný kohout s „husím krkem“
  d.chrom.lesk = 0.9;
  PIVA.forEach((pivo) => {
    if (!jeNaCepu(pivo)) return;
    const kx = pivo.x, z = SVET.vezZ, kz = SVET.kohoutZ;
    const yHlava = p.y + 0.33;
    valec(d.chrom, kx, p.y, z, 0.042, 0.02, 16, B.chrom, { e: 0.28 });
    valec(d.chrom, kx, p.y + 0.02, z, 0.024, 0.29, 14, B.chrom, { e: 0.28 });
    valec(d.chrom, kx, p.y + 0.3, z, 0.032, 0.035, 14, B.chrom, { e: 0.28 });
    // oblouk ze sloupku k výtoku (půlkruh v rovině y–z)
    const rOblouk = (z - kz) / 2, zStred = z - rOblouk;
    const krk = [];
    for (let i = 0; i <= 10; i++) {
      const u = (i / 10) * Math.PI;
      krk.push([kx, yHlava + Math.sin(u) * rOblouk * 0.9, zStred + Math.cos(u) * rOblouk]);
    }
    trubka(d.chrom, krk, 0.014, 12, B.chrom, { e: 0.28 });
    valec(d.chrom, kx, yHlava - 0.065, kz, 0.012, 0.065, 12, B.chrom, { e: 0.28 });
    valec(d.chrom, kx, yHlava - 0.075, kz, 0.009, 0.012, 10, [0.3, 0.32, 0.35]);
  });
  d.chrom.lesk = 0;
  // kniha vylepšení na stojánku
  const k = SVET.kniha;
  kvadr(d.drevo, k.x - 0.28, p.y, k.z - 0.2, k.x + 0.28, p.y + 0.05, k.z + 0.2, B.tmave);
  obdelnik(d.atlas, [[k.x + 0.24, p.y + 0.06, k.z - 0.16], [k.x - 0.24, p.y + 0.06, k.z - 0.16],
    [k.x - 0.24, p.y + 0.13, k.z + 0.15], [k.x + 0.24, p.y + 0.13, k.z + 0.15]], ATLAS.kniha, [1, 1, 1], 0.3);
  // výdej pro číšníky: gumová podložka s nápisem a zvonek
  const v = SVET.vydej;
  kvadr(d.bila, v.x0, p.y, v.z0, v.x1, p.y + 0.006, v.z1, [0.13, 0.13, 0.14], { deleni: 0 });
  obdelnik(d.atlas, [[v.x0 + 0.03, p.y + 0.0065, v.z1 - 0.03], [v.x1 - 0.03, p.y + 0.0065, v.z1 - 0.03], [v.x1 - 0.03, p.y + 0.0065, v.z1 - 0.13], [v.x0 + 0.03, p.y + 0.0065, v.z1 - 0.13]], ATLAS.vydej, [1, 1, 1], 0.3);
  d.chrom.lesk = 0.9;
  soustruh(d.chrom, [[0.035, 0], [0.035, 0.008], [0.032, 0.02], [0.022, 0.04], [0.008, 0.05], [0.004, 0.062], [0.006, 0.066]], 14, [0.9, 0.75, 0.35], { posun: [v.x1 - 0.06, p.y + 0.006, v.z0 + 0.06], vicko: true });
  d.chrom.lesk = 0;
  // zadní pult s dřezem a regálem
  const z = SVET.zadniPult;
  kvadr(d.drevo, z.x0, 0, z.z0, z.x1, z.y - 0.05, z.z1 - 0.04, B.drevo);
  for (let x = z.x0 + 0.5; x < z.x1; x += 1.0) kvadr(d.drevo, x - 0.015, 0.06, z.z1 - 0.04, x + 0.015, z.y - 0.08, z.z1 - 0.025, B.tmave);
  d.drevo.lesk = 0.45;
  kvadr(d.drevo, z.x0, z.y - 0.05, z.z0, z.x1, z.y, z.z1, B.tmave);
  d.drevo.lesk = 0;
  prekazky.push([z.x0, z.z0, z.x1, z.z1]);
  const dr = SVET.drez;
  kvadr(d.chrom, dr.x - 0.42, z.y, dr.z - 0.22, dr.x + 0.42, z.y + 0.03, dr.z + 0.24, [0.85, 0.88, 0.92], { e: 0.15, uvCele: true, deleni: 0 });
  kvadr(d.bila, dr.x - 0.35, z.y + 0.03, dr.z - 0.16, dr.x + 0.35, z.y + 0.035, dr.z + 0.18, [0.3, 0.34, 0.38]);
  d.chrom.lesk = 0.9;
  valec(d.chrom, dr.x, z.y, dr.z - 0.2, 0.022, 0.3, 12, B.chrom, { e: 0.25 });
  const kohoutek = [];
  for (let i = 0; i <= 8; i++) {
    const u = (i / 8) * Math.PI;
    kohoutek.push([dr.x, z.y + 0.3 + Math.sin(u) * 0.08, dr.z - 0.12 + Math.cos(u) * -0.08]);
  }
  trubka(d.chrom, kohoutek, 0.014, 10, B.chrom, { e: 0.25 });
  // pákové kohoutky
  [-0.07, 0.07].forEach((dx) => valec(d.chrom, dr.x + dx, z.y, dr.z - 0.2, 0.014, 0.08, 8, B.chrom, { e: 0.25 }));
  d.chrom.lesk = 0;
  obdelnik(d.atlas, [[dr.x - 0.4, 1.08, 0.035], [dr.x + 0.4, 1.08, 0.035], [dr.x + 0.4, 1.32, 0.035], [dr.x - 0.4, 1.32, 0.035]], ATLAS['cedulka-drez'], [1, 1, 1], 0.4);
  kvadr(d.drevo, SVET.regal.x0, z.y, 0.06, SVET.regal.x1, z.y + 0.03, 0.54, [0.6, 0.45, 0.35]);
  // pokladna na konci zadního pultu (displej svítí)
  kvadr(d.bila, 9.25, z.y, 0.1, 9.68, z.y + 0.18, 0.5, [0.22, 0.22, 0.24]);
  kvadr(d.bila, 9.3, z.y + 0.18, 0.3, 9.62, z.y + 0.28, 0.4, [0.15, 0.4, 0.2], { e: 0.6 });
  // police s lahvemi a trofejemi (spodní polici vlevo mají lahve s pálenkou – kreslí se zvlášť)
  // tmavé sklo lahví (zelené, hnědé, jantarové, čiré…) a různé etikety
  const lahve = [[0.12, 0.34, 0.12], [0.34, 0.17, 0.06], [0.68, 0.42, 0.1], [0.12, 0.22, 0.09], [0.5, 0.08, 0.06], [0.78, 0.8, 0.76], [0.2, 0.32, 0.4]];
  const etikety = [[0.95, 0.92, 0.84], [0.9, 0.84, 0.64], [0.12, 0.12, 0.12], [0.8, 0.64, 0.2], [0.55, 0.12, 0.12], [0.97, 0.97, 0.95], [0.2, 0.3, 0.5]];
  [[2.4, 4.6], [6.9, 10.8]].forEach(([a, b]) => {
    [1.45, 1.95, 2.45].forEach((y) => {
      kvadr(d.drevo, a, y - 0.04, 0.03, b, y, 0.34, B.tmave);
      // konzoly pod policí
      [a + 0.15, b - 0.15].forEach((kx) => kvadr(d.drevo, kx - 0.02, y - 0.16, 0.03, kx + 0.02, y - 0.04, 0.3, B.tmave));
      // podsvícení: teplý LED pásek pod přední hranou police (lahve nad ním září)
      kvadr(d.bila, a + 0.03, y - 0.055, 0.285, b - 0.03, y - 0.04, 0.315, [1, 0.8, 0.5], { e: 1, deleni: 0 });
      if (a < 3 && y === 1.45) return;
      for (let lx = a + 0.12; lx < b - 0.08; lx += 0.17 + seminko() * 0.06) {
        if (y === 2.45 && lx > 9.0 && lx < 9.9) continue;
        const vy = 0.22 + seminko() * 0.12;
        const barva = lahve[Math.floor(seminko() * lahve.length)];
        d.bila.lesk = 0.6;
        soustruh(d.bila, [[0.038, 0], [0.04, 0.01], [0.04, vy * 0.68], [0.03, vy * 0.8], [0.014, vy * 0.9], [0.013, vy]], 10, barva, { posun: [lx, y, 0.18], vicko: true, e: 0.16 });
        d.bila.lesk = 0;
        valec(d.bila, lx, y + vy, 0.18, 0.015, 0.05, 6, nahodneZ(etikety, [0.85, 0.75, 0.3]));
        // etiketa
        valec(d.bila, lx, y + vy * 0.2, 0.18, 0.0405, vy * 0.28, 10, etikety[Math.floor(seminko() * etikety.length)], { horni: false, e: 0.08 });
      }
    });
  });
  [9.2, 9.65].forEach((x, i) => {
    valec(d.bila, x, 2.45, 0.18, 0.06 - i * 0.01, 0.04, 10, [0.85, 0.7, 0.25]);
    d.bila.lesk = 0.88;
    soustruh(d.bila, [[0.015, 0], [0.015, 0.08], [0.06, 0.12], [0.07, 0.2], [0.065, 0.22]], 12, [0.92, 0.75, 0.3], { posun: [x, 2.49, 0.18] });
    d.bila.lesk = 0;
  });
  // tabule s pivy (nad regálem) a s panáky (nad lahvemi)
  const tabule = (x0, x1, y0, y1, uv) => {
    kvadr(d.drevo, x0 - 0.04, y0 - 0.04, 0.03, x1 + 0.04, y1 + 0.04, 0.05, B.tmave, { deleni: 0 });
    obdelnik(d.atlas, [[x0, y0, 0.052], [x1, y0, 0.052], [x1, y1, 0.052], [x0, y1, 0.052]], uv, [1, 1, 1], 0.25);
  };
  tabule(4.905, 6.595, 1.2, 2.68, ATLAS.menu);
  tabule(0.42, 2.11, 1.38, 2.86, ATLAS.menuPanaky);
  // stojan na deset lahví s pálenkou: zadní lišta, přední lišta a přepážky mezi lahvemi
  const yZ = z.y;
  const x0L = PANAKY[0].x - 0.15, x1L = PANAKY[PANAKY.length - 1].x + 0.15;
  d.drevo.lesk = 0.35;
  kvadr(d.drevo, x0L, yZ, 0.05, x1L, yZ + 0.075, 0.085, [0.62, 0.42, 0.28]);
  kvadr(d.drevo, x0L, yZ, 0.315, x1L, yZ + 0.035, 0.335, [0.62, 0.42, 0.28]);
  for (let i = 0; i < PANAKY.length - 1; i++) {
    const xp = (PANAKY[i].x + PANAKY[i + 1].x) / 2;
    kvadr(d.drevo, xp - 0.008, yZ, 0.085, xp + 0.008, yZ + 0.05, 0.315, [0.55, 0.37, 0.24]);
  }
  [x0L, x1L - 0.016].forEach((xp) => kvadr(d.drevo, xp, yZ, 0.085, xp + 0.016, yZ + 0.06, 0.315, [0.55, 0.37, 0.24]));
  d.drevo.lesk = 0;
  // gumová rohož pod panákovky a prkénko na čisté panákovky
  kvadr(d.bila, x0L, yZ, 0.36, x1L, yZ + 0.006, 0.56, [0.12, 0.12, 0.13], { deleni: 0 });
  for (let rx = x0L + 0.04; rx < x1L - 0.03; rx += 0.06) kvadr(d.bila, rx, yZ + 0.006, 0.37, rx + 0.025, yZ + 0.009, 0.55, [0.2, 0.2, 0.22], { deleni: 0 });
  kvadr(d.drevo, SVET.regalPanaku.x0, yZ, 0.08, SVET.regalPanaku.x1, yZ + 0.02, 0.52, [0.62, 0.46, 0.34], { deleni: 0 });
  // pivní tácky na pultu před stoličkami
  SVET.stolicky.forEach((sx) => {
    const tz = 2.55, tx = sx + 0.16;
    obdelnik(d.atlas, [[tx - 0.055, p.y + 0.002, tz + 0.055], [tx + 0.055, p.y + 0.002, tz + 0.055], [tx + 0.055, p.y + 0.002, tz - 0.055], [tx - 0.055, p.y + 0.002, tz - 0.055]], ATLAS.tacek, [1, 1, 1]);
  });
  obdelnik(d.atlas, [[3.2, 2.72, 0.04], [7.8, 2.72, 0.04], [7.8, 3.12, 0.04], [3.2, 3.12, 0.04]], ATLAS.nazev, [1, 1, 1], 0.2);
}

// Vodorovný válec (tyč) podél osy x
function valecVodorovne(d, x0, x1, y, z, r, barva, e = 0) {
  const zac = d.n;
  const seg = 10;
  for (let i = 0; i <= seg; i++) {
    const a = (i / seg) * Math.PI * 2;
    const ny = Math.sin(a), nz = Math.cos(a);
    d.vrchol(x0, y + ny * r, z + nz * r, 0, ny, nz, barva, e, i / seg, 0);
    d.vrchol(x1, y + ny * r, z + nz * r, 0, ny, nz, barva, e, i / seg, 1);
  }
  for (let i = 0; i < seg; i++) {
    const a = zac + i * 2;
    d.ctyruhelnik(a, a + 1, a + 3, a + 2);
  }
}

// Kužely světla pod lampami nad barem a nad stoly (průsvitné, sčítají se)
function postavKuzely() {
  const d = new Davka();
  svetla.forEach((s) => {
    if (s.lampa !== 'bar' && s.lampa !== 'stul') return;
    const [lx, ly, lz] = s.poz;
    const dole = s.lampa === 'bar' ? SVET.pult.y + 0.02 : 0.77;
    const r0 = 0.19, r1 = s.lampa === 'bar' ? 0.75 : 0.95;
    const seg = 20;
    const zac = d.n;
    for (let k = 0; k <= 1; k++) {
      d.alfa = k ? 0 : 1;
      const y = k ? dole : ly - 0.02, r = k ? r1 : r0;
      for (let i = 0; i <= seg; i++) {
        const u = (i / seg) * Math.PI * 2;
        const sx = Math.sin(u), cz = Math.cos(u);
        d.vrchol(lx + sx * r, y, lz + cz * r, sx, 0.3, cz, [1, 0.86, 0.62], 1, i / seg, k);
      }
    }
    for (let i = 0; i < seg; i++) d.ctyruhelnik(zac + i, zac + i + 1, zac + seg + 2 + i, zac + seg + 1 + i);
  });
  d.alfa = 1;
  return d.n ? vytvorSit(d) : null;
}
function postavSklad(d) {
  const s = SVET.sklad;
  const V = SVET.vyska, E = s.x1; // východní stěna skladu (za ní je kuchyně)
  // podstavce pod sudy: u severní a u východní stěny
  kvadr(d.drevo, s.x0 + 0.05, 0, 0.1, s.x1 - 0.05, 0.12, 0.66, [0.6, 0.45, 0.35]);
  kvadr(d.drevo, E - 0.56, 0, 0.66, s.x1 - 0.05, 0.12, 1.9, [0.6, 0.45, 0.35]);
  prekazky.push([s.x0, 0, s.x1, 0.7]);
  prekazky.push([E - 0.6, 0.7, s.x1, 1.92]);
  PIVA.forEach((pivo, i) => {
    if (!jeNaCepu(pivo)) return;
    const { x, z, stena } = SVET.sudPoz(i);
    const yc = 0.12 + 0.66;  // výška spojky na sudu
    if (stena === 'sever') {
      obdelnik(d.atlas, [[x - 0.17, 1.0, 0.012], [x + 0.17, 1.0, 0.012], [x + 0.17, 1.13, 0.012], [x - 0.17, 1.13, 0.012]], ATLAS['sud_' + pivo.id], [1, 1, 1], 0.35);
      trubka(d.bila, [[x, yc, z], [x, yc + 0.2, z - 0.05], [x, 1.4, 0.08], [x, 2.6, 0.06], [x - 0.05, V, 0.06]], 0.013, 6, [0.55, 0.1, 0.08]);
    } else {
      obdelnik(d.atlas, [[E - 0.012, 1.0, z - 0.17], [E - 0.012, 1.0, z + 0.17], [E - 0.012, 1.13, z + 0.17], [E - 0.012, 1.13, z - 0.17]], ATLAS['sud_' + pivo.id], [1, 1, 1], 0.35);
      trubka(d.bila, [[x, yc, z], [x + 0.05, yc + 0.2, z], [E - 0.08, 1.4, z], [E - 0.06, 2.6, z], [E - 0.06, V, z - 0.05]], 0.013, 6, [0.55, 0.1, 0.08]);
    }
  });
  // paleta na plné náhradní sudy (u jižní stěny vlevo)
  kvadr(d.drevo, 11.22, 0, 1.88, 12.95, 0.13, s.z1 - 0.03, [0.78, 0.66, 0.48]);
  for (let x = 11.26; x < 12.9; x += 0.28) kvadr(d.drevo, x, 0.13, 1.9, x + 0.18, 0.14, s.z1 - 0.05, [0.82, 0.7, 0.52]);
  prekazky.push([s.x0, 1.85, 13.0, s.z1]);
  // roh na prázdné sudy (žlutá čára na podlaze)
  kvadr(d.bila, 13.05, 0.005, 1.98, s.x1 - 0.05, 0.008, 2.01, [0.95, 0.8, 0.1]);
  kvadr(d.bila, 13.05, 0.005, 1.98, 13.08, 0.008, s.z1 - 0.05, [0.95, 0.8, 0.1]);
  prekazky.push([13.0, 1.95, s.x1, s.z1]);
  // dlažba ve skladu
  kvadr(d.dlazba, s.x0, 0.002, s.z0, s.x1, 0.004, s.z1, [1, 1, 1], { uv: 2, bez: ['dole'] });
  // žárovka v kleci
  kvadr(d.bila, 12.5, 2.95, 1.15, 12.7, 3.2, 1.35, [0.3, 0.3, 0.3]);
  valec(d.bila, 12.6, 2.8, 1.25, 0.06, 0.12, 8, [1, 0.92, 0.7], { e: 1 });
  aoPruh([s.x0, 0.7], [E - 0.6, 0.7], [0, 1], 0.35, 0.35, 0.006);
}

/* ---------- Kuchyně: zavřená (zatlučené okénko), nebo plně vybavená ---------- */
function postavKuchyni(d) {
  const k = SVET.kuchyne, o = k.okenko, dv = k.dvere, W = SVET.sirka, V = SVET.vyska;
  const B = BARVY_SVETA;
  const zs = k.stena + 0.012;   // líc stěny do sálu
  // jídelní lístek na stěně v sále (mezi okénkem a dveřmi)
  kvadr(d.drevo, 16.91, 1.16, k.stena, 18.39, 2.44, k.stena + 0.03, B.tmave, { deleni: 0 });
  obdelnik(d.atlas, [[16.95, 1.2, k.stena + 0.032], [18.35, 1.2, k.stena + 0.032], [18.35, 2.4, k.stena + 0.032], [16.95, 2.4, k.stena + 0.032]], ATLAS.jidelak, [1, 1, 1], 0.25);
  if (!maKuchyni()) {
    // zatlučené okénko s cedulí a zamčené dveře
    for (let y = o.y0 + 0.02; y < o.y1 - 0.05; y += 0.17) kvadr(d.drevo, o.x0 - 0.04, y, k.z1 + 0.04, o.x1 + 0.04, y + 0.14, k.stena + 0.035, [0.62, 0.45, 0.3]);
    [o.x0 + 0.25, o.x1 - 0.25].forEach((x) => kvadr(d.drevo, x - 0.05, o.y0, k.stena + 0.035, x + 0.05, o.y1, k.stena + 0.055, [0.5, 0.36, 0.24]));
    obdelnik(d.atlas, [[o.x0 + 0.12, o.y0 + 0.12, k.stena + 0.06], [o.x1 - 0.12, o.y0 + 0.12, k.stena + 0.06], [o.x1 - 0.12, o.y1 - 0.08, k.stena + 0.06], [o.x0 + 0.12, o.y1 - 0.08, k.stena + 0.06]], ATLAS.kuchyneBrzy, [1, 1, 1], 0.35);
    kvadr(d.drevo, dv.x0, 0, k.z1 + 0.04, dv.x1, 2.1, k.stena - 0.02, [0.7, 0.5, 0.36]);
    kvadr(d.bila, dv.x1 - 0.12, 1.0, k.stena - 0.02, dv.x1 - 0.06, 1.04, k.stena + 0.03, [0.85, 0.68, 0.25]);
    obdelnik(d.atlas, [[dv.x0 + 0.13, 1.5, zs - 0.02], [dv.x1 - 0.13, 1.5, zs - 0.02], [dv.x1 - 0.13, 1.74, zs - 0.02], [dv.x0 + 0.13, 1.74, zs - 0.02]], ATLAS.kuchyneDvere, [1, 1, 1], 0.3);
    prekazky.push([dv.x0, k.z1, dv.x1, k.stena]);
    return;
  }
  // --- otevřená kuchyně ---
  // dlaždice na podlaze a kachličky na stěnách do výšky 1,6 m
  kvadr(d.dlazbaK, k.x0, 0.002, 0, W, 0.004, k.z1, [1, 1, 1], { uv: 1, bez: ['dole'] });
  d.kachlicky.lesk = 0.35;
  kvadr(d.kachlicky, k.x0, 0, 0, W, 1.6, 0.012, [1, 1, 1], { uv: 1, bez: ['sever'] });
  kvadr(d.kachlicky, W - 0.012, 0, 0, W, 1.6, k.z1, [1, 1, 1], { uv: 1, bez: ['vychod'] });
  kvadr(d.kachlicky, k.x0, 0, 0, k.x0 + 0.012, 1.6, k.z1, [1, 1, 1], { uv: 1, bez: ['zapad'] });
  [[k.x0, o.x0], [o.x1, dv.x0], [dv.x1, W]].forEach(([a, b]) => kvadr(d.kachlicky, a, 0, k.z1 - 0.012, b, 1.6, k.z1, [1, 1, 1], { uv: 1, bez: ['jih'] }));
  kvadr(d.kachlicky, o.x0, 0, k.z1 - 0.012, o.x1, o.y0, k.z1, [1, 1, 1], { uv: 1, bez: ['jih'] });
  d.kachlicky.lesk = 0;
  // lednice
  d.nerez.lesk = 0.7;
  kvadr(d.nerez, 14.25, 0, 0.05, 15.0, 1.95, 0.75, [0.92, 0.93, 0.95], { uv: 1 });
  kvadr(d.bila, 14.25, 1.32, 0.752, 15.0, 1.335, 0.756, [0.3, 0.32, 0.35]);
  d.chrom.lesk = 0.9;
  [0.6, 1.62].forEach((y) => kvadr(d.chrom, 14.9, y, 0.76, 14.93, y + 0.3, 0.79, B.chrom));
  d.chrom.lesk = 0;
  kvadr(d.bila, 14.35, 1.75, 0.756, 14.55, 1.82, 0.76, [0.2, 0.6, 0.9], { e: 0.8 });
  prekazky.push([14.2, 0, 15.05, 0.8]);
  // sporák (jeden, s vylepšením dva) s troubou, hořáky a hrnci
  const sporak = (x0, x1, i) => {
    kvadr(d.nerez, x0, 0, 0.05, x1, 0.88, 0.8, [0.88, 0.89, 0.91], { uv: 1 });
    kvadr(d.bila, x0, 0.88, 0.05, x1, 0.9, 0.8, [0.1, 0.1, 0.11]);
    kvadr(d.bila, x0 + 0.1, 0.18, 0.8, x1 - 0.1, 0.62, 0.805, [0.12, 0.12, 0.13]);
    kvadr(d.bila, x0 + 0.2, 0.28, 0.805, x1 - 0.2, 0.52, 0.808, [0.25, 0.18, 0.1], { e: 0.15 });
    d.chrom.lesk = 0.9;
    valecVodorovne(d.chrom, x0 + 0.14, x1 - 0.14, 0.67, 0.83, 0.012, B.chrom);
    d.chrom.lesk = 0;
    for (let j = 0; j < 5; j++) valec(d.bila, x0 + 0.2 + j * (x1 - x0 - 0.4) / 4, 0.78, 0.8, 0.022, 0.03, 8, [0.08, 0.08, 0.09]);
    const hx = [x0 + 0.38, x1 - 0.38];
    [[hx[0], 0.25], [hx[1], 0.25], [hx[0], 0.6], [hx[1], 0.6]].forEach(([hxx, hz]) => {
      valec(d.bila, hxx, 0.9, hz, 0.12, 0.012, 16, [0.05, 0.05, 0.06]);
      kvadr(d.bila, hxx - 0.13, 0.912, hz - 0.012, hxx + 0.13, 0.93, hz + 0.012, [0.16, 0.16, 0.17]);
      kvadr(d.bila, hxx - 0.012, 0.912, hz - 0.13, hxx + 0.012, 0.93, hz + 0.13, [0.16, 0.16, 0.17]);
    });
    d.nerez.lesk = 0.8;
    // velký hrnec s poklicí, pánev a kastrol
    soustruh(d.nerez, [[0.13, 0], [0.135, 0.01], [0.135, 0.22], [0.14, 0.225], [0.12, 0.23], [0.03, 0.25], [0.015, 0.27], [0.001, 0.27]], 18, [0.85, 0.86, 0.88], { posun: [hx[0], 0.93, 0.25] });
    soustruh(d.nerez, [[0.1, 0], [0.11, 0.01], [0.115, 0.05], [0.112, 0.055], [0.001, 0.055]], 16, [0.25, 0.25, 0.27], { posun: [hx[1], 0.93, 0.6] });
    trubka(d.bila, [[hx[1] + 0.11, 0.97, 0.6], [hx[1] + 0.3, 0.99, 0.62]], 0.012, 6, [0.08, 0.08, 0.08]);
    soustruh(d.nerez, [[0.09, 0], [0.095, 0.01], [0.095, 0.11], [0.1, 0.115], [0.001, 0.115]], 16, [0.85, 0.86, 0.88], { posun: [hx[1], 0.93, 0.25] });
    if (i === 0) soustruh(d.nerez, [[0.08, 0], [0.085, 0.01], [0.085, 0.13], [0.09, 0.135], [0.001, 0.135]], 14, [0.6, 0.25, 0.15], { posun: [hx[0], 0.93, 0.6] });
    d.nerez.lesk = 0.7;
    prekazky.push([x0 - 0.03, 0, x1 + 0.03, 0.85]);
  };
  sporak(15.9, 17.3, 0);
  const dva = Boolean(HRA.vylepseni.sporak2);
  if (dva) sporak(17.5, 18.9, 1);
  // digestoř nad sporáky a potrubí do stropu
  const hx1 = dva ? 19.0 : 17.4;
  kvadr(d.nerez, 15.8, 2.02, 0, hx1, 2.14, 0.98, [0.86, 0.87, 0.9], { uv: 1 });
  kvadr(d.nerez, 15.95, 2.14, 0, hx1 - 0.15, 2.5, 0.62, [0.84, 0.85, 0.88], { uv: 1 });
  kvadr(d.nerez, (15.8 + hx1) / 2 - 0.22, 2.5, 0, (15.8 + hx1) / 2 + 0.22, V, 0.36, [0.8, 0.81, 0.84], { uv: 1 });
  kvadr(d.bila, 15.85, 2.015, 0.05, hx1 - 0.05, 2.02, 0.93, [0.2, 0.2, 0.22]);
  // pracovní stůl (ostrůvek) s prkénkem, nožem, mísami a koši s pečivem
  kvadr(d.nerez, 15.6, 0.86, 1.85, 17.4, 0.9, 2.45, [0.9, 0.91, 0.93], { uv: 1 });
  kvadr(d.nerez, 15.66, 0.15, 1.9, 17.34, 0.18, 2.4, [0.8, 0.81, 0.84]);
  [[15.64, 1.88], [17.32, 1.88], [15.64, 2.38], [17.32, 2.38]].forEach(([x, z]) => kvadr(d.nerez, x, 0, z, x + 0.04, 0.86, z + 0.04, [0.75, 0.76, 0.8]));
  d.nerez.lesk = 0;
  kvadr(d.drevo, 16.2, 0.9, 1.95, 16.75, 0.93, 2.3, [0.85, 0.65, 0.45]);
  kvadr(d.bila, 16.3, 0.93, 2.1, 16.58, 0.935, 2.14, [0.82, 0.84, 0.86]);
  kvadr(d.bila, 16.58, 0.93, 2.095, 16.68, 0.94, 2.145, [0.12, 0.1, 0.08]);
  d.bila.lesk = 0.5;
  soustruh(d.bila, [[0.05, 0], [0.09, 0.03], [0.12, 0.08], [0.115, 0.08], [0.085, 0.032], [0.001, 0.005]], 16, [0.95, 0.94, 0.9], { posun: [15.95, 0.9, 2.15] });
  soustruh(d.bila, [[0.04, 0], [0.07, 0.03], [0.09, 0.06], [0.086, 0.06], [0.066, 0.032], [0.001, 0.005]], 14, [0.85, 0.35, 0.25], { posun: [17.05, 0.9, 2.05] });
  d.bila.lesk = 0;
  // stoh čistých talířů
  for (let i = 0; i < 6; i++) valec(d.bila, 17.15, 0.9 + i * 0.014, 2.3, 0.115, 0.012, 18, [0.97, 0.97, 0.95]);
  // koš s chlebem
  valec(d.drevo, 16.95, 0.9, 2.32, 0.1, 0.07, 12, [0.7, 0.5, 0.3]);
  zaoblenyKvadr(d.bila, 16.95, 1.0, 2.32, 0.16, 0.07, 0.1, [0.82, 0.58, 0.3], 0.03, 1);
  prekazky.push([15.55, 1.8, 17.45, 2.5]);
  // nádobí visí nad ostrůvkem na tyči
  d.chrom.lesk = 0.9;
  valecVodorovne(d.chrom, 15.7, 17.3, 2.22, 2.15, 0.012, B.chrom);
  [15.8, 17.2].forEach((x) => kvadr(d.chrom, x - 0.006, 2.22, 2.144, x + 0.006, V, 2.156, B.chrom));
  [15.95, 16.3, 16.65, 17.0].forEach((x, i) => {
    trubka(d.chrom, [[x, 2.21, 2.15], [x, 2.08, 2.15]], 0.006, 5, B.chrom);
    if (i % 2) soustruh(d.nerez, [[0.08, 0], [0.09, 0.01], [0.095, 0.05], [0.001, 0.05]], 14, [0.3, 0.3, 0.32], { posun: [x, 1.98, 2.15] });
    else kvadr(d.chrom, x - 0.03, 1.86, 2.14, x + 0.03, 2.08, 2.16, [0.8, 0.82, 0.85]);
  });
  d.chrom.lesk = 0;
  // myčka a dřez u východní stěny, nad nimi odkapávač s talíři
  d.nerez.lesk = 0.7;
  kvadr(d.nerez, 19.35, 0, 1.0, W - 0.02, 0.9, 2.3, [0.88, 0.89, 0.91], { uv: 1 });
  kvadr(d.bila, 19.45, 0.9, 1.15, W - 0.1, 0.905, 1.65, [0.3, 0.32, 0.36]);
  valec(d.nerez, W - 0.08, 0.9, 1.4, 0.016, 0.32, 10, [0.85, 0.86, 0.88]);
  trubka(d.nerez, [[W - 0.08, 1.22, 1.4], [W - 0.2, 1.3, 1.4], [W - 0.32, 1.22, 1.4]], 0.012, 8, [0.85, 0.86, 0.88]);
  kvadr(d.nerez, 19.5, 1.45, 1.75, W - 0.02, 1.48, 2.25, [0.8, 0.81, 0.84]);
  d.nerez.lesk = 0;
  for (let i = 0; i < 6; i++) valec(d.bila, 19.75, 1.48, 1.82 + i * 0.075, 0.1, 0.008, 14, [0.96, 0.96, 0.94]);
  prekazky.push([19.3, 0.95, W, 2.35]);
  // police s kořením a hrnci na západní stěně
  [1.45, 1.85].forEach((y, r) => {
    kvadr(d.drevo, k.x0, y - 0.03, 1.0, k.x0 + 0.28, y, 2.6, B.tmave);
    for (let z = 1.1; z < 2.5; z += 0.16) {
      const barva = [[0.75, 0.25, 0.15], [0.85, 0.7, 0.2], [0.35, 0.55, 0.25], [0.55, 0.35, 0.2]][Math.floor(seminko() * 4)];
      d.bila.lesk = 0.5;
      if (r === 0) valec(d.bila, k.x0 + 0.14, y, z, 0.04, 0.12, 10, [0.9, 0.92, 0.95]);
      else soustruh(d.bila, [[0.05, 0], [0.055, 0.12], [0.03, 0.15], [0.03, 0.17]], 10, barva, { posun: [k.x0 + 0.14, y, z], vicko: true });
      d.bila.lesk = 0;
      if (r === 0) valec(d.bila, k.x0 + 0.14, y + 0.02, z, 0.036, 0.07, 10, barva);
    }
  });
  // koš na odpadky
  valec(d.nerez, 15.2, 0, 2.9, 0.18, 0.62, 14, [0.7, 0.72, 0.75]);
  prekazky.push([15.0, 2.7, 15.4, 3.1]);
  // výdejní okénko: nerezová police skrz zeď, zvonek, tyčka na lístky a cedule nad okénkem
  d.nerez.lesk = 0.8;
  kvadr(d.nerez, o.x0, SVET.okenkoY - 0.025, k.z1 - 0.15, o.x1, SVET.okenkoY, k.stena + 0.25, [0.9, 0.91, 0.93], { uv: 1 });
  d.nerez.lesk = 0;
  prekazky.push([o.x0, k.z1 - 0.15, o.x1, k.z1]);
  prekazky.push([o.x0, k.stena, o.x1, k.stena + 0.25]);
  d.chrom.lesk = 0.9;
  soustruh(d.chrom, [[0.035, 0], [0.035, 0.008], [0.032, 0.02], [0.022, 0.04], [0.008, 0.05], [0.004, 0.062], [0.006, 0.066]], 14, [0.9, 0.75, 0.35], { posun: [o.x1 - 0.08, SVET.okenkoY, k.stena + 0.16], vicko: true });
  valecVodorovne(d.chrom, o.x0 + 0.05, o.x1 - 0.05, o.y1 + 0.1, zs + 0.04, 0.008, B.chrom);
  d.chrom.lesk = 0;
  obdelnik(d.atlas, [[o.x0 + 0.1, o.y1 + 0.2, zs], [o.x1 - 0.1, o.y1 + 0.2, zs], [o.x1 - 0.1, o.y1 + 0.5, zs], [o.x0 + 0.1, o.y1 + 0.5, zs]], ATLAS.vydejJidel, [1, 1, 1], 0.5);
  if (HRA.vylepseni.ohrivac) {
    // ohřívací lampy (svítí do červena)
    [o.x0 + 0.4, o.x1 - 0.4].forEach((x) => {
      soustruh(d.bila, [[0.09, 0], [0.07, 0.06], [0.03, 0.1], [0.01, 0.12]], 12, [0.25, 0.25, 0.27], { posun: [x, o.y1 - 0.18, (k.z1 + k.stena) / 2] });
      valec(d.bila, x, o.y1 - 0.2, (k.z1 + k.stena) / 2, 0.05, 0.03, 10, [1, 0.35, 0.12], { e: 1 });
    });
  }
  // dveře do kuchyně otevřené dovnitř, s kulatým okénkem
  kvadr(d.drevo, dv.x0 - 0.02, 0, k.z1 - 0.88, dv.x0 + 0.03, 2.08, k.z1 - 0.02, [0.7, 0.5, 0.36]);
  kvadr(d.bila, dv.x0 - 0.025, 1.35, k.z1 - 0.58, dv.x0 + 0.035, 1.6, k.z1 - 0.33, [0.3, 0.4, 0.45], { e: 0.2 });
  prekazky.push([dv.x0 - 0.05, k.z1 - 0.9, dv.x0 + 0.06, k.z1]);
  obdelnik(d.atlas, [[dv.x0 - 0.06, 2.2, zs], [dv.x1 + 0.06, 2.2, zs], [dv.x1 + 0.06, 2.42, zs], [dv.x0 - 0.06, 2.42, zs]], ATLAS.kuchyneDvere, [1, 1, 1], 0.3);
  // zářivky na stropě
  svetla.filter((s) => s.lampa === 'kuchyne').forEach((s) => {
    kvadr(d.bila, s.poz[0] - 0.62, V - 0.06, s.poz[2] - 0.12, s.poz[0] + 0.62, V, s.poz[2] + 0.12, [0.85, 0.86, 0.88]);
    kvadr(d.bila, s.poz[0] - 0.58, V - 0.075, s.poz[2] - 0.08, s.poz[0] + 0.58, V - 0.06, s.poz[2] + 0.08, [1, 1, 0.97], { e: 1 });
  });
  aoPruh([k.x0, 0.8], [W, 0.8], [0, 1], 0.4, 0.3, 0.006);
}

/* ---------- Stůl s kostkovaným ubrusem a čtyřmi ohýbanými židlemi ---------- */
function postavStul(d, tx, tz, index) {
  const B = BARVY_SVETA;
  kvadr(d.drevo, tx - 0.65, 0.71, tz - 0.4, tx + 0.65, 0.75, tz + 0.4, B.drevo);
  kvadr(d.ubrus, tx - 0.69, 0.62, tz - 0.44, tx + 0.69, 0.756, tz + 0.44, [1, 1, 1], { uv: 1, bez: ['dole'] });
  // soustružené nohy
  [[-0.55, -0.32], [0.55, -0.32], [-0.55, 0.32], [0.55, 0.32]].forEach(([a, b]) => {
    d.drevo.lesk = 0.3;
    soustruh(d.drevo, [[0.032, 0], [0.036, 0.04], [0.026, 0.1], [0.024, 0.3], [0.03, 0.42], [0.038, 0.5], [0.034, 0.56], [0.04, 0.62]], 10, [0.55, 0.38, 0.26], { posun: [tx + a, 0, tz + b] });
    d.drevo.lesk = 0;
  });
  prekazky.push([tx - 0.69, tz - 0.44, tx + 0.69, tz + 0.44]);
  stinNaZemi(tx, tz, 2.1, 1.5);
  // stojánek s číslem stolu (z obou stran), slánka, pepřenka a vázička s karafiátem
  kvadr(d.drevo, tx - 0.05, 0.756, tz - 0.015, tx + 0.05, 0.766, tz + 0.015, B.tmave, { deleni: 0 });
  const cislo = ATLAS['cislo_' + (index + 1)];
  obdelnik(d.atlas, [[tx - 0.045, 0.766, tz + 0.006], [tx + 0.045, 0.766, tz + 0.006], [tx + 0.045, 0.856, tz + 0.006], [tx - 0.045, 0.856, tz + 0.006]], cislo, [1, 1, 1], 0.2);
  obdelnik(d.atlas, [[tx + 0.045, 0.766, tz - 0.006], [tx - 0.045, 0.766, tz - 0.006], [tx - 0.045, 0.856, tz - 0.006], [tx + 0.045, 0.856, tz - 0.006]], cislo, [1, 1, 1], 0.2);
  d.bila.lesk = 0.6;
  [[-0.1, [0.95, 0.95, 0.93]], [-0.06, [0.25, 0.22, 0.2]]].forEach(([dx, barva]) => {
    soustruh(d.bila, [[0.012, 0], [0.014, 0.004], [0.014, 0.05], [0.01, 0.058], [0.001, 0.06]], 10, barva, { posun: [tx + dx, 0.756, tz + 0.02] });
  });
  soustruh(d.bila, [[0.02, 0], [0.026, 0.03], [0.018, 0.08], [0.014, 0.1], [0.018, 0.11]], 12, [0.55, 0.65, 0.8], { posun: [tx + 0.12, 0.756, tz - 0.02] });
  d.bila.lesk = 0;
  trubka(d.bila, [[tx + 0.12, 0.84, tz - 0.02], [tx + 0.125, 0.93, tz - 0.025]], 0.003, 4, [0.25, 0.5, 0.2]);
  zaoblenyKvadr(d.bila, tx + 0.125, 0.945, tz - 0.025, 0.035, 0.03, 0.035, [0.85, 0.12, 0.18], 0.014, 1);
  // svíčka v rudém skle (plamínek se kreslí za běhu)
  const sx = tx - 0.03, sz = tz - 0.1;
  d.bila.lesk = 0.55;
  soustruh(d.bila, [[0.028, 0], [0.033, 0.006], [0.036, 0.03], [0.034, 0.058], [0.031, 0.062]], 14, [0.62, 0.08, 0.07], { posun: [sx, 0.756, sz], e: 0.45 });
  d.bila.lesk = 0;
  valec(d.bila, sx, 0.756, sz, 0.024, 0.045, 10, [0.96, 0.93, 0.84], { e: 0.35 });
  trubka(d.bila, [[sx, 0.801, sz], [sx, 0.812, sz + 0.002]], 0.0015, 4, [0.1, 0.08, 0.06]);
  svicky.push({ x: sx, y: 0.816, z: sz, faze: index * 1.7 });
  [-1, 1].forEach((strana) => {
    [-0.35, 0.35].forEach((dx) => {
      const cx = tx + dx, cz = tz + strana * 0.78;
      postavZidli(d, cx, cz, strana);
      // sklenice vpravo od hosta, talíř před ním
      const sklo = { x: cx + strana * 0.16, y: 0.757, z: tz + strana * 0.28 };
      const talir = { x: cx - strana * 0.01, y: 0.757, z: tz + strana * 0.19 };
      obdelnik(d.atlas, [[sklo.x - 0.055, 0.758, sklo.z + 0.055], [sklo.x + 0.055, 0.758, sklo.z + 0.055], [sklo.x + 0.055, 0.758, sklo.z - 0.055], [sklo.x - 0.055, 0.758, sklo.z - 0.055]], ATLAS.tacek, [1, 1, 1]);
      sedadla.push({ x: cx, z: cz, natoceni: strana < 0 ? 0 : Math.PI, stul: index, typ: 'zidle', sklenice: sklo, talir, host: null,
        // kde stojí obsluha, když něco nese nebo vybírá (u čela stolu na straně hosta)
        obsluha: { x: tx + Math.sign(dx) * 1.0, z: tz + strana * 0.5 } });
    });
  });
}

// Stůl, který ještě není koupený: holá deska a na ní židle nohama vzhůru (jako po zavíračce)
function postavVolnyStul(d, tx, tz) {
  const B = BARVY_SVETA;
  d.drevo.lesk = 0.4;
  kvadr(d.drevo, tx - 0.65, 0.71, tz - 0.4, tx + 0.65, 0.75, tz + 0.4, B.drevo);
  d.drevo.lesk = 0;
  [[-0.55, -0.32], [0.55, -0.32], [-0.55, 0.32], [0.55, 0.32]].forEach(([a, b]) => {
    soustruh(d.drevo, [[0.032, 0], [0.036, 0.04], [0.026, 0.1], [0.024, 0.3], [0.03, 0.42], [0.038, 0.5], [0.034, 0.56], [0.04, 0.71]], 10, [0.55, 0.38, 0.26], { posun: [tx + a, 0, tz + b] });
  });
  // dvě židle převrácené na desce: sedák leží na desce, opěradlo visí přes delší hranu stolu
  // (síť židle se otočí o 180° kolem osy z, sedák 0,465 m → 0,75 m = deska)
  [[-0.3, -0.26, -1], [0.3, 0.26, 1]].forEach(([dx, dz, strana]) => {
    const t = { drevo: new Davka() };
    postavZidli(t, 0, 0, strana, true);
    const zac = d.drevo.n, v = t.drevo.data;
    d.drevo.lesk = 0.35;
    for (let i = 0; i < t.drevo.n; i++) {
      const o = i * 15;
      d.drevo.vrchol(tx + dx - v[o], 1.215 - v[o + 1], tz + dz + v[o + 2], -v[o + 3], -v[o + 4], v[o + 5], [v[o + 6], v[o + 7], v[o + 8]], 0, v[o + 10], v[o + 11]);
    }
    d.drevo.lesk = 0;
    t.drevo.idx.forEach((k) => d.drevo.idx.push(zac + k));
  });
  prekazky.push([tx - 0.69, tz - 0.5, tx + 0.69, tz + 0.5]);
  stinNaZemi(tx, tz, 1.9, 1.3);
}

// Ohýbaná „thonetka“: kulatý sedák, nohy z ohýbaného dřeva, opěradlo z oblouků
function postavZidli(d, cx, cz, strana, jenSit = false) {
  const f = -strana;             // směr ke stolu (podél z)
  const P = (lx, y, lz) => [cx + lx, y, cz + lz * f];
  const drevo = [0.4, 0.23, 0.14];
  d.drevo.lesk = 0.35;
  soustruh(d.drevo, [[0.001, 0.432], [0.18, 0.432], [0.195, 0.44], [0.2, 0.452], [0.193, 0.465], [0.001, 0.465]], 18, [0.5, 0.32, 0.2], { posun: [cx, 0, cz] });
  // přední nohy
  [-1, 1].forEach((s) => trubka(d.drevo, [P(s * 0.13, 0.44, 0.12), P(s * 0.15, 0.22, 0.14), P(s * 0.17, 0, 0.16)], 0.015, 7, drevo));
  // zadní nohy plynule přechází v opěradlo s obloukem nahoře
  const opera = [P(-0.155, 0, -0.17), P(-0.135, 0.22, -0.155), P(-0.13, 0.44, -0.14), P(-0.14, 0.66, -0.17), P(-0.14, 0.86, -0.2)];
  for (let i = 1; i < 10; i++) {
    const u = Math.PI - (i / 10) * Math.PI;
    opera.push(P(Math.cos(u) * 0.14, 0.86 + Math.sin(u) * 0.12, -0.2));
  }
  opera.push(P(0.14, 0.86, -0.2), P(0.14, 0.66, -0.17), P(0.13, 0.44, -0.14), P(0.135, 0.22, -0.155), P(0.155, 0, -0.17));
  trubka(d.drevo, opera, 0.016, 7, drevo);
  // vnitřní oblouk opěradla
  const vnitrni = [P(-0.085, 0.47, -0.15), P(-0.09, 0.62, -0.17), P(-0.09, 0.76, -0.19)];
  for (let i = 1; i < 8; i++) {
    const u = Math.PI - (i / 8) * Math.PI;
    vnitrni.push(P(Math.cos(u) * 0.09, 0.76 + Math.sin(u) * 0.08, -0.195));
  }
  vnitrni.push(P(0.09, 0.76, -0.19), P(0.09, 0.62, -0.17), P(0.085, 0.47, -0.15));
  trubka(d.drevo, vnitrni, 0.011, 6, drevo);
  // kruh mezi nohama
  const kruh = [];
  for (let i = 0; i <= 16; i++) { const u = (i / 16) * Math.PI * 2; kruh.push([cx + Math.sin(u) * 0.155, 0.2, cz + Math.cos(u) * 0.155]); }
  trubka(d.drevo, kruh, 0.009, 5, drevo);
  d.drevo.lesk = 0;
  if (jenSit) return;
  prekazky.push([cx - 0.2, cz - 0.2, cx + 0.2, cz + 0.2]);
  stinNaZemi(cx, cz, 0.62, 0.62, 0.0035);
}

function postavStolicku(d, x, z) {
  valec(d.bila, x, 0, z, 0.2, 0.025, 14, [0.18, 0.18, 0.2]);
  d.bila.lesk = 0.85;
  valec(d.bila, x, 0.025, z, 0.03, 0.68, 8, BARVY_SVETA.chrom);
  valec(d.bila, x, 0.3, z, 0.15, 0.02, 14, BARVY_SVETA.chrom);
  d.bila.lesk = 0;
  valec(d.drevo, x, 0.7, z, 0.19, 0.06, 14, BARVY_SVETA.tmave);
  d.bila.lesk = 0.25;
  soustruh(d.bila, [[0.18, 0], [0.185, 0.012], [0.175, 0.03], [0.001, 0.034]], 16, [0.55, 0.12, 0.1], { posun: [x, 0.76, z] });
  d.bila.lesk = 0;
  prekazky.push([x - 0.2, z - 0.2, x + 0.2, z + 0.2]);
  stinNaZemi(x, z, 0.6, 0.6);
  stolicky.push({ x, z, natoceni: Math.PI, typ: 'stolicka', sklenice: { x: x + 0.16, y: SVET.pult.y, z: 2.55 }, talir: { x: x - 0.03, y: SVET.pult.y, z: 2.4 },
    host: null, obsluha: { x: x + 0.5, z: 3.6 } });
}

function postavVyzdobu(d) {
  const W = SVET.sirka, D = SVET.hloubka, V = SVET.vyska;
  const B = BARVY_SVETA;
  // okna se záclonami a radiátory
  SVET.okna.forEach(([x0, x1]) => {
    const y0 = 1.05, y1 = 2.25, zz = D - 0.01;
    obdelnik(d.atlas, [[x1, y0, zz], [x0, y0, zz], [x0, y1, zz], [x1, y1, zz]], ATLAS.okno, [0.9, 0.9, 1], 0.75);
    const o = 0.06;
    kvadr(d.drevo, x0 - o, y0 - o, zz - 0.05, x1 + o, y0, zz, B.tmave);
    kvadr(d.drevo, x0 - o, y1, zz - 0.05, x1 + o, y1 + o, zz, B.tmave);
    kvadr(d.drevo, x0 - o, y0, zz - 0.05, x0, y1, zz, B.tmave);
    kvadr(d.drevo, x1, y0, zz - 0.05, x1 + o, y1, zz, B.tmave);
    kvadr(d.drevo, (x0 + x1) / 2 - 0.03, y0, zz - 0.05, (x0 + x1) / 2 + 0.03, y1, zz, B.tmave);
    kvadr(d.drevo, x0 - 0.1, y0 - 0.1, zz - 0.14, x1 + 0.1, y0 - 0.06, zz, B.tmave);   // parapet
    kvadr(d.ubrus, x0 - 0.3, 0.95, zz - 0.12, x0 + 0.08, 2.42, zz - 0.08, [1, 1, 1]);
    kvadr(d.ubrus, x1 - 0.08, 0.95, zz - 0.12, x1 + 0.3, 2.42, zz - 0.08, [1, 1, 1]);
    kvadr(d.ubrus, x0 - 0.3, 2.3, zz - 0.13, x1 + 0.3, 2.48, zz - 0.07, [1, 1, 1]);
    kvadr(d.bila, x0 + 0.1, 0.15, zz - 0.12, x1 - 0.1, 0.75, zz - 0.05, [0.92, 0.92, 0.9]);
    for (let x = x0 + 0.14; x < x1 - 0.12; x += 0.09) kvadr(d.bila, x, 0.17, zz - 0.13, x + 0.04, 0.73, zz - 0.12, [0.85, 0.85, 0.83]);
    // květináč na parapetu
    soustruh(d.bila, [[0.05, 0], [0.065, 0.1], [0.07, 0.11]], 10, [0.7, 0.36, 0.2], { posun: [(x0 + x1) / 2 + 0.35, y0 - 0.06, zz - 0.08], vicko: true });
    for (let i = 0; i < 4; i++) zaoblenyKvadr(d.bila, (x0 + x1) / 2 + 0.35 + Math.sin(i * 1.7) * 0.03, y0 + 0.08 + i * 0.03, zz - 0.08 + Math.cos(i * 1.7) * 0.02, 0.06, 0.04, 0.05, [0.2, 0.5 + i * 0.04, 0.22], 0.015, 1);
  });
  // chmelové girlandy pod trámy: provázek, šištice a listy (visí v obloucích)
  const girlanda = (z, x0, x1, oblouku) => {
    const delka = (x1 - x0) / oblouku;
    for (let o = 0; o < oblouku; o++) {
      const body = [];
      for (let i = 0; i <= 14; i++) {
        const t = i / 14;
        body.push([x0 + (o + t) * delka, V - 0.23 - Math.sin(t * Math.PI) * 0.3, z]);
      }
      trubka(d.bila, body, 0.004, 4, [0.42, 0.36, 0.24]);
      body.forEach(([x, y], i) => {
        if (i === 0 || i === body.length - 1) return;
        const r1 = seminko(), r2 = seminko(), r3 = seminko();
        // list (dva plátky do kříže)
        const lb = [0.16 + r1 * 0.08, 0.36 + r2 * 0.1, 0.12];
        kvadr(d.bila, x - 0.045, y - 0.008, z - 0.03 + (r3 - 0.5) * 0.03, x + 0.045, y - 0.003, z + 0.03 + (r3 - 0.5) * 0.03, lb, { deleni: 0 });
        kvadr(d.bila, x - 0.025, y - 0.03, z - 0.004, x + 0.025, y + 0.01, z + 0.004, tmavsi(lb, 0.85), { deleni: 0 });
        // šištice chmele: světle zelené, visí pod provázkem
        const sb = [0.56 + r2 * 0.12, 0.72 + r1 * 0.08, 0.3 + r3 * 0.1];
        zaoblenyKvadr(d.bila, x + (r1 - 0.5) * 0.04, y - 0.045 - r2 * 0.02, z + (r3 - 0.5) * 0.05, 0.034, 0.052, 0.034, sb, 0.013, 1);
        if (r3 > 0.45) zaoblenyKvadr(d.bila, x + (r2 - 0.5) * 0.06, y - 0.03, z + (r1 - 0.5) * 0.05, 0.028, 0.042, 0.028, svetlejsi(sb, 0.12), 0.011, 1);
      });
    }
  };
  girlanda(3.52, 0.3, 10.9, 4);
  girlanda(7.92, 0.3, 19.7, 6);
  girlanda(10.12, 0.3, 19.7, 6);

  // obrazy, plakáty, terč, hodiny
  obdelnik(d.atlas, [[0.05, 1.4, 6.0], [0.05, 1.4, 4.6], [0.05, 2.45, 4.6], [0.05, 2.45, 6.0]], ATLAS.obraz, [1, 1, 1], 0.15);
  obdelnik(d.atlas, [[0.05, 1.2, 10.5], [0.05, 1.2, 9.6], [0.05, 2.4, 9.6], [0.05, 2.4, 10.5]], ATLAS.plakat, [1, 1, 1], 0.15);
  obdelnik(d.atlas, [[0.05, 1.35, 3.95], [0.05, 1.35, 3.15], [0.05, 2.35, 3.15], [0.05, 2.35, 3.95]], ATLAS.plakat2, [1, 1, 1], 0.15);
  obdelnik(d.atlas, [[W - 0.05, 1.45, 10.8], [W - 0.05, 1.45, 11.4], [W - 0.05, 2.05, 11.4], [W - 0.05, 2.05, 10.8]], ATLAS.terc, [1, 1, 1], 0.1);
  obdelnik(d.atlas, [[W - 0.05, 2.2, SVET.hodinyZ - 0.25], [W - 0.05, 2.2, SVET.hodinyZ + 0.25], [W - 0.05, 2.7, SVET.hodinyZ + 0.25], [W - 0.05, 2.7, SVET.hodinyZ - 0.25]], ATLAS.hodiny, [1, 1, 1], 0.2);
  // plakát na hokej na stěně skladu (ze sálu)
  obdelnik(d.atlas, [[11.9, 1.25, SVET.sklad.z1 + 0.162], [12.8, 1.25, SVET.sklad.z1 + 0.162], [12.8, 2.45, SVET.sklad.z1 + 0.162], [11.9, 2.45, SVET.sklad.z1 + 0.162]], ATLAS.plakatHokej, [1, 1, 1], 0.15);
  // v6: další obrazy v rámech – stará fotka hospody, hokejový oddíl, chmel a cedule štamgastů
  // stena: 'z+' = obraz na stěně s líc do +z, 'z-' do −z, 'x-' do −x; a0–a1 = rozsah po stěně, lic = poloha líce stěny
  const ram = (stena, a0, a1, y0, y1, lic, uv) => {
    const t = 0.035, h = 0.035, B = [0.42, 0.26, 0.14];
    const smer = stena === 'z+' || stena === 'x+' ? 1 : -1;
    const p0 = lic, p1 = lic + smer * h;          // rám od zdi do místnosti
    const kv = (u0, v0, u1, v1) => {
      if (stena[0] === 'z') kvadr(d.drevo, u0, v0, Math.min(p0, p1), u1, v1, Math.max(p0, p1), B, { deleni: 0 });
      else kvadr(d.drevo, Math.min(p0, p1), v0, u0, Math.max(p0, p1), v1, u1, B, { deleni: 0 });
    };
    kv(a0 - t, y0 - t, a1 + t, y0);
    kv(a0 - t, y1, a1 + t, y1 + t);
    kv(a0 - t, y0, a0, y1);
    kv(a1, y0, a1 + t, y1);
    const q = lic + smer * 0.012;                 // obrázek kousek zapuštěný v rámu
    const P = (u, v) => (stena[0] === 'z' ? [u, v, q] : [q, v, u]);
    // pořadí rohů: vlevo dole, vpravo dole, vpravo nahoře, vlevo nahoře (při pohledu zepředu)
    const zleva = (stena === 'z+' || stena === 'x-') ? [a0, a1] : [a1, a0];
    obdelnik(d.atlas, [P(zleva[0], y0), P(zleva[1], y0), P(zleva[1], y1), P(zleva[0], y1)], uv, [1, 1, 1], 0.12);
  };
  ram('z-', 6.78, 7.52, 1.36, 1.92, D, ATLAS.fotoHospoda);
  ram('z+', 13.06, 13.86, 1.48, 2.08, SVET.sklad.z1 + 0.15, ATLAS.fotoHokej);
  ram('x-', 3.98, 4.56, 1.42, 2.2, W, ATLAS.chmelObraz);
  // západní stěna nad sudy: cedule štamgastů
  obdelnik(d.atlas, [[0.05, 1.98, 11.95], [0.05, 1.98, 10.85], [0.05, 2.42, 10.85], [0.05, 2.42, 11.95]], ATLAS.stamgasti, [1, 1, 1], 0.15);
  // jelení parohy na štítu (východní stěna)
  const zs = 5.0;
  kvadr(d.drevo, W - 0.04, 2.02, zs - 0.17, W, 2.46, zs + 0.17, B.tmave, { deleni: 0 });
  kvadr(d.bila, W - 0.1, 2.2, zs - 0.05, W - 0.04, 2.32, zs + 0.05, [0.86, 0.8, 0.68], { deleni: 0 });
  const kost = [0.86, 0.8, 0.68];
  [-1, 1].forEach((strana) => {
    const z = (dz) => zs + strana * dz;
    trubka(d.bila, [[W - 0.07, 2.3, z(0.04)], [W - 0.14, 2.4, z(0.13)], [W - 0.19, 2.57, z(0.22)], [W - 0.21, 2.76, z(0.26)]], 0.013, 6, kost, { e: 0.05 });
    trubka(d.bila, [[W - 0.16, 2.47, z(0.17)], [W - 0.25, 2.54, z(0.16)]], 0.009, 5, kost, { e: 0.05 });
    trubka(d.bila, [[W - 0.195, 2.64, z(0.235)], [W - 0.29, 2.72, z(0.22)]], 0.009, 5, kost, { e: 0.05 });
    trubka(d.bila, [[W - 0.2, 2.7, z(0.25)], [W - 0.18, 2.82, z(0.33)]], 0.008, 5, kost, { e: 0.05 });
  });
  // neon PIVO na západní stěně nad místem pro jukebox
  obdelnik(d.atlas, [[0.06, 1.85, SVET.jukeboxZ + 0.75], [0.06, 1.85, SVET.jukeboxZ - 0.75], [0.06, 2.35, SVET.jukeboxZ - 0.75], [0.06, 2.35, SVET.jukeboxZ + 0.75]], ATLAS.neon, [1, 1, 1], 1);
  // nástěnná světla (jen svítí, osvětlení dělají lampy)
  const svitidlo = (x, z, nx, nz) => {
    kvadr(d.drevo, x - 0.08, 1.75, z - 0.08, x + 0.08, 1.95, z + 0.08, B.tmave);
    kvadr(d.bila, x + nx * 0.08 - 0.06, 1.95, z + nz * 0.08 - 0.06, x + nx * 0.08 + 0.06, 2.1, z + nz * 0.08 + 0.06, [1, 0.85, 0.6], { e: 0.9 });
  };
  svitidlo(4.1, D - 0.08, 0, -1);
  svitidlo(13.0, D - 0.08, 0, -1);
  svitidlo(16.5, D - 0.08, 0, -1);
  svitidlo(0.08, 9.0, 1, 0);
  svitidlo(W - 0.08, 8.0, -1, 0);
  // věšák s kabáty u dveří
  const vx = 10.15, vz = 12.0;
  valec(d.bila, vx, 0, vz, 0.18, 0.03, 12, [0.2, 0.15, 0.12]);
  valec(d.drevo, vx, 0, vz, 0.025, 1.85, 8, B.tmave);
  zaoblenyKvadr(d.bila, vx - 0.02, 1.32, vz + 0.1, 0.26, 0.6, 0.12, [0.35, 0.3, 0.45], 0.04, 1);
  zaoblenyKvadr(d.bila, vx + 0.06, 1.34, vz - 0.08, 0.22, 0.56, 0.12, [0.55, 0.35, 0.2], 0.04, 1);
  prekazky.push([vx - 0.25, vz - 0.25, vx + 0.25, vz + 0.25]);
  // květiny
  [[14.6, 12.05], [0.45, 3.0], [19.5, 4.2]].forEach(([x, z]) => {
    soustruh(d.bila, [[0.13, 0], [0.18, 0.3], [0.19, 0.32]], 12, [0.7, 0.36, 0.2], { posun: [x, 0, z], vicko: true });
    for (let i = 0; i < 9; i++) {
      const a = i * 0.9, r = 0.05 + (i % 3) * 0.05;
      zaoblenyKvadr(d.bila, x + Math.sin(a) * r, 0.36 + i * 0.07, z + Math.cos(a) * r, 0.13, 0.11, 0.13, [0.18 + i * 0.02, 0.45 + i * 0.03, 0.18], 0.04, 1);
    }
    prekazky.push([x - 0.24, z - 0.24, x + 0.24, z + 0.24]);
    stinNaZemi(x, z, 0.7, 0.7);
  });
  // sudy v rohu
  const sudek = (x, y, z, b) => {
    soustruh(d.drevo, [[0.3, 0], [0.34, 0.2], [0.355, 0.425], [0.34, 0.65], [0.3, 0.85]], 16, b, { posun: [x, y, z], vicko: true });
    [0.08, 0.77].forEach((h) => valec(d.bila, x, y + h, z, h < 0.4 ? 0.315 : 0.315, 0.035, 16, [0.25, 0.25, 0.27], { horni: false }));
  };
  sudek(0.55, 0, D - 0.65, [0.75, 0.55, 0.4]);
  sudek(1.3, 0, D - 0.6, [0.72, 0.52, 0.38]);
  sudek(0.9, 0.85, D - 0.62, [0.78, 0.58, 0.42]);
  prekazky.push([0.15, D - 1.05, 1.7, D - 0.2]);
  stinNaZemi(0.95, D - 0.62, 1.9, 1.1);
  // pokladna u dveří (odsud pokladní vybírají)
  const pk = SVET.pokladna;
  kvadr(d.drevo, pk.x0, 0, pk.z0, pk.x1, 1.0, pk.z1, B.drevo, { uv: 1 });
  d.drevo.lesk = 0.5;
  kvadr(d.drevo, pk.x0 - 0.04, 1.0, pk.z0 - 0.04, pk.x1 + 0.04, 1.05, pk.z1 + 0.04, B.tmave);
  d.drevo.lesk = 0;
  kvadr(d.bila, pk.x0 + 0.3, 1.05, pk.z0 + 0.06, pk.x0 + 0.72, 1.2, pk.z1 - 0.06, [0.22, 0.22, 0.24]);
  kvadr(d.bila, pk.x0 + 0.36, 1.2, pk.z0 + 0.14, pk.x0 + 0.66, 1.29, pk.z0 + 0.22, [0.15, 0.4, 0.2], { e: 0.6 });
  obdelnik(d.atlas, [[pk.x1 - 0.12, 0.55, pk.z0 - 0.003], [pk.x0 + 0.12, 0.55, pk.z0 - 0.003], [pk.x0 + 0.12, 0.8, pk.z0 - 0.003], [pk.x1 - 0.12, 0.8, pk.z0 - 0.003]], ATLAS.pokladna, [1, 1, 1], 0.3);
  prekazky.push([pk.x0, pk.z0, pk.x1, pk.z1]);
  stinNaZemi((pk.x0 + pk.x1) / 2, (pk.z0 + pk.z1) / 2, 1.5, 0.8);
  // jukebox a televize (vylepšení)
  if (HRA.vylepseni.jukebox) {
    const jz = SVET.jukeboxZ;
    kvadr(d.drevo, 0, 0, jz - 0.4, 0.55, 1.45, jz + 0.4, [0.55, 0.3, 0.2]);
    obdelnik(d.atlas, [[0.56, 0.2, jz + 0.3], [0.56, 0.2, jz - 0.3], [0.56, 1.35, jz - 0.3], [0.56, 1.35, jz + 0.3]], ATLAS.jukebox, [1, 1, 1], 0.85);
    prekazky.push([0, jz - 0.4, 0.6, jz + 0.4]);
  }
  if (HRA.vylepseni.televize) kvadr(d.bila, W - 0.1, 1.75, SVET.tvZ - 0.75, W, 2.55, SVET.tvZ + 0.75, [0.08, 0.08, 0.09]);
  // lampy: šňůra, smaltované stínidlo s mosazným okrajem a žárovka
  svetla.forEach((sv) => {
    if (sv.lampa !== 'bar' && sv.lampa !== 'stul') return;
    const [lx, ly, lz] = sv.poz;
    kvadr(d.bila, lx - 0.006, ly + 0.2, lz - 0.006, lx + 0.006, V, lz + 0.006, [0.1, 0.1, 0.1]);
    d.bila.lesk = 0.3;
    soustruh(d.bila, [[0.245, 0], [0.235, 0.01], [0.2, 0.08], [0.12, 0.16], [0.045, 0.2], [0.03, 0.24]], 18, [0.2, 0.36, 0.26], { posun: [lx, ly, lz] });
    // vnitřek stínidla: profil zdola nahoru a o kousek menší, ať se nepere s vnější plochou
    soustruh(d.bila, [[0.222, 0.012], [0.19, 0.078], [0.114, 0.152], [0.028, 0.19]], 18, [0.95, 0.92, 0.85], { posun: [lx, ly, lz], dovnitr: true, e: 0.3 });
    d.bila.lesk = 0.8;
    valec(d.bila, lx, ly - 0.005, lz, 0.25, 0.012, 18, [0.85, 0.65, 0.28], { horni: false });
    d.bila.lesk = 0;
    soustruh(d.bila, [[0.001, -0.07], [0.04, -0.055], [0.055, -0.02], [0.035, 0.03], [0.02, 0.06]], 12, [1, 0.92, 0.7], { posun: [lx, ly + 0.05, lz], e: 1 });
  });
  // ulice za dveřmi
  const ux0 = SVET.dvere.x0 - 1.5, ux1 = SVET.dvere.x1 + 1.5;
  kvadr(d.bila, ux0, -0.1, D + 0.15, ux1, 0, D + 3.6, [0.16, 0.16, 0.18]);
  obdelnik(d.atlas, [[ux1 - 0.1, 0, D + 3.5], [ux0 + 0.1, 0, D + 3.5], [ux0 + 0.1, 3.2, D + 3.5], [ux1 - 0.1, 3.2, D + 3.5]], ATLAS.ulice, [0.8, 0.8, 0.9], 0.8);
  kvadr(d.bila, ux0 - 0.1, 0, D + 0.15, ux0, 3.2, D + 3.6, [0.12, 0.1, 0.12]);
  kvadr(d.bila, ux1, 0, D + 0.15, ux1 + 0.1, 3.2, D + 3.6, [0.12, 0.1, 0.12]);
  kvadr(d.drevo, SVET.dvere.x0 - 0.08, 0, D - 0.04, SVET.dvere.x0, SVET.dvere.vyska + 0.08, D + 0.19, B.tmave);
  kvadr(d.drevo, SVET.dvere.x1, 0, D - 0.04, SVET.dvere.x1 + 0.08, SVET.dvere.vyska + 0.08, D + 0.19, B.tmave);
  kvadr(d.drevo, SVET.dvere.x0, SVET.dvere.vyska, D - 0.04, SVET.dvere.x1, SVET.dvere.vyska + 0.08, D + 0.19, B.tmave);
  kvadr(d.bila, SVET.dvere.x0, 0.001, D - 0.9, SVET.dvere.x1, 0.012, D - 0.1, [0.35, 0.22, 0.14]); // rohožka
}

/* ---------- Mapa pro chůzi postav (mřížka 0,2 m) ---------- */
const MRIZKA = { bunka: 0.2, sirka: 103, hloubka: 82, data: null };
function postavMrizku() {
  const M = MRIZKA;
  const W = SVET.sirka, D = SVET.hloubka;
  M.data = new Uint8Array(M.sirka * M.hloubka);
  const okraj = 0.25; // poloměr postavy
  const zablokuj = (x0, z0, x1, z1) => {
    const a = Math.max(0, Math.floor((x0 - okraj) / M.bunka));
    const b = Math.min(M.sirka - 1, Math.floor((x1 + okraj) / M.bunka));
    const c = Math.max(0, Math.floor((z0 - okraj) / M.bunka));
    const e = Math.min(M.hloubka - 1, Math.floor((z1 + okraj) / M.bunka));
    for (let iz = c; iz <= e; iz++) for (let ix = a; ix <= b; ix++) M.data[iz * M.sirka + ix] = 1;
  };
  const kraj = M.hloubka * M.bunka;
  zablokuj(-1, -1, 0, kraj);
  zablokuj(W, -1, W + 1, kraj);
  zablokuj(-1, -1, W + 1, 0);
  // venku je jen ulička přede dveřmi
  zablokuj(-1, D, SVET.dvere.x0 - 1.4, kraj);
  zablokuj(SVET.dvere.x1 + 1.4, D, W + 1, kraj);
  zablokuj(-1, D + 3.4, W + 1, kraj);
  prekazky.forEach(([x0, z0, x1, z1]) => {
    const jeSedadlo = (x1 - x0) < 0.45 && (z1 - z0) < 0.45;
    const jeDvere = z0 === SVET.hloubka && x0 === SVET.dvere.x0;
    if (!jeSedadlo && !jeDvere) zablokuj(x0, z0, x1, z1);
  });
}
/* =========================================================
   12) HLEDÁNÍ CESTY – A* na mřížce, aby hosté obcházeli stoly
   ========================================================= */
function volnaBunka(ix, iz) {
  const M = MRIZKA;
  return ix >= 0 && iz >= 0 && ix < M.sirka && iz < M.hloubka && M.data[iz * M.sirka + ix] === 0;
}

function bunka(x, z) {
  return [Math.floor(x / MRIZKA.bunka), Math.floor(z / MRIZKA.bunka)];
}

// Najde nejbližší volnou buňku (když cíl leží těsně u překážky)
function nejblizsiVolna(ix, iz) {
  if (volnaBunka(ix, iz)) return [ix, iz];
  for (let r = 1; r < 12; r++) {
    for (let dz = -r; dz <= r; dz++) {
      for (let dx = -r; dx <= r; dx++) {
        if (Math.max(Math.abs(dx), Math.abs(dz)) !== r) continue;
        if (volnaBunka(ix + dx, iz + dz)) return [ix + dx, iz + dz];
      }
    }
  }
  return [ix, iz];
}

// Je mezi dvěma body volná přímka?
function volnyVyhled(x0, z0, x1, z1) {
  const kroky = Math.ceil(vzdalenost(x0, z0, x1, z1) / 0.08);
  for (let i = 1; i < kroky; i++) {
    const t = i / kroky;
    const [ix, iz] = bunka(lerp(x0, x1, t), lerp(z0, z1, t));
    if (!volnaBunka(ix, iz)) return false;
  }
  return true;
}

function najdiCestu(x0, z0, x1, z1) {
  const M = MRIZKA;
  const [sx, sz] = nejblizsiVolna(...bunka(x0, z0));
  const [cx, cz] = nejblizsiVolna(...bunka(x1, z1));
  const n = M.sirka * M.hloubka;
  const g = new Float32Array(n).fill(Infinity);
  const odkud = new Int32Array(n).fill(-1);
  const zavreno = new Uint8Array(n);
  const start = sz * M.sirka + sx;
  const cil = cz * M.sirka + cx;
  const heur = (i) => {
    const dx = Math.abs((i % M.sirka) - cx), dz = Math.abs(Math.floor(i / M.sirka) - cz);
    return Math.max(dx, dz) + 0.414 * Math.min(dx, dz);
  };
  // jednoduchá binární halda
  const halda = [];
  const vloz = (i, f) => {
    halda.push([f, i]);
    let k = halda.length - 1;
    while (k > 0) {
      const r = (k - 1) >> 1;
      if (halda[r][0] <= halda[k][0]) break;
      [halda[r], halda[k]] = [halda[k], halda[r]];
      k = r;
    }
  };
  const vyber = () => {
    const vrch = halda[0];
    const posl = halda.pop();
    if (halda.length) {
      halda[0] = posl;
      let k = 0;
      for (;;) {
        const l = k * 2 + 1, p = l + 1;
        let m = k;
        if (l < halda.length && halda[l][0] < halda[m][0]) m = l;
        if (p < halda.length && halda[p][0] < halda[m][0]) m = p;
        if (m === k) break;
        [halda[m], halda[k]] = [halda[k], halda[m]];
        k = m;
      }
    }
    return vrch[1];
  };
  g[start] = 0;
  vloz(start, heur(start));
  const smery = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.414], [1, -1, 1.414], [-1, 1, 1.414], [-1, -1, 1.414]];
  let nalezeno = false;
  while (halda.length) {
    const i = vyber();
    if (zavreno[i]) continue;
    zavreno[i] = 1;
    if (i === cil) { nalezeno = true; break; }
    const ix = i % M.sirka, iz = Math.floor(i / M.sirka);
    for (const [dx, dz, cena] of smery) {
      const nx = ix + dx, nz = iz + dz;
      if (!volnaBunka(nx, nz)) continue;
      if (dx && dz && (!volnaBunka(ix + dx, iz) || !volnaBunka(ix, iz + dz))) continue; // neřezat rohy
      const j = nz * M.sirka + nx;
      const ng = g[i] + cena;
      if (ng < g[j]) {
        g[j] = ng;
        odkud[j] = i;
        vloz(j, ng + heur(j));
      }
    }
  }
  if (!nalezeno) return [{ x: x1, z: z1 }];
  // poskládat body od konce
  const body = [];
  for (let i = cil; i !== -1; i = odkud[i]) {
    body.push({ x: (i % M.sirka + 0.5) * M.bunka, z: (Math.floor(i / M.sirka) + 0.5) * M.bunka });
  }
  body.reverse();
  body[body.length - 1] = { x: x1, z: z1 };
  // vyhladit: vynechat body, mezi kterými je volný výhled
  const hladka = [];
  let x = x0, z = z0, k = 0;
  while (k < body.length) {
    let dal = k;
    for (let j = body.length - 1; j > k; j--) {
      if (volnyVyhled(x, z, body[j].x, body[j].z)) { dal = j; break; }
    }
    hladka.push(body[dal]);
    x = body[dal].x;
    z = body[dal].z;
    k = dal + 1;
  }
  return hladka;
}
/* =========================================================
   13) POSTAVY – každý host je jedna síť poskládaná z kvádrů
   Kosti: 0 boky, 1 trup, 2 hlava, 3–4 levá ruka, 5–6 pravá ruka,
   7–8 levá noha, 9–10 pravá noha, 11 úsměv, 12 mračení, 13 pusa,
   14 víčka (mrkání), 15 klidné obočí. Hlavní díly jsou zaoblené kvádry.
   Model stojí na zemi a kouká na +z.
   ========================================================= */
const BARVY_POSTAV = {
  kuze: ['#f6d2b5', '#eec19f', '#e3b08a', '#d29a70', '#b07a52', '#8a5a3c', '#6b4430'],
  vlasy: ['#2b1a10', '#3d2616', '#5a3a1e', '#7a4f26', '#a8461f', '#c99a5a', '#e2c98e', '#1e1e1e'],
  sedive: ['#9a9a9a', '#bdbdbd', '#d8d8d8', '#eeeeee', '#7d7d7d'],
  trika: ['#2f6db5', '#b5352f', '#3f8f4a', '#d9a21b', '#6b4aa0', '#2a2a2a', '#e07b39', '#1f8a8a', '#8c2f5a', '#5d6d7e', '#ececec', '#7a5230', '#c94f7c', '#3a4a6b'],
  kosile: ['#ffffff', '#dbe7f5', '#f5e9d6', '#cfe3cf', '#e8d0d0', '#d9d9e8'],
  svetry: ['#7a2a2a', '#2e4a6b', '#4a5a3a', '#8a6a3a', '#5a3a5a', '#3a3a3a', '#a08060'],
  kalhoty: ['#2b3a55', '#3b2a1e', '#222222', '#4a4a4a', '#5a4632', '#6b6650'],
  dziny: ['#2f4f7f', '#3a5f94', '#26406a', '#4a6a9a'],
  boty: ['#1c120b', '#3b2416', '#f0f0f0', '#222222', '#5a3a22'],
  lesni: ['#3e5a2e', '#4f6b35', '#5a4a2a', '#3a4a2a'],
  dresy: ['#d22f27', '#1f4fa0', '#f2f2f2', '#1b7a3a', '#f0b000'],
  pestre: ['#ff6f61', '#ffb400', '#2ec4b6', '#e71d36', '#7bd389', '#f72585', '#4cc9f0'],
  cepice: ['#b3261e', '#1f4f8a', '#2e6b3a', '#d9a21b', '#222222', '#e07b39'],
  oci: ['#5a3a1e', '#2f5d8a', '#3f6b3a', '#6b6b6b', '#3a2a1a', '#4a6a8a']
};
const sance = (p) => Math.random() < p;
const nahodnaBarva = (seznam) => hexNaRgb(nahodne(seznam));
const tmavsi = (b, k = 0.75) => b.map((c) => c * k);
const svetlejsi = (b, k = 0.35) => b.map((c) => c + (1 - c) * k);
function vyberPokryvku(seznam) {
  for (const [nazev, p] of seznam || []) if (sance(p)) return nazev;
  return null;
}
function vyberVousy(seznam) {
  for (const [nazev, p] of seznam || []) if (sance(p)) return nazev;
  return null;
}

// Náhodný vzhled podle typu hosta (archetypu)
function novyVzhled(typ, zena) {
  const s = typ.styl || {};
  const vek = nahodneCislo(...(typ.vek || [20, 60]));
  const sedive = s.sedive || vek > 58 + Math.random() * 15;
  let trup = nahodne(s.trup || ['tricko']);
  let spodek = nahodne(s.spodek || ['kalhoty']);
  if (!zena && (trup === 'saty' || trup === 'halenka')) trup = 'tricko';
  if (!zena && spodek === 'sukne') spodek = 'kalhoty';
  if (trup === 'saty') spodek = 'sukne';
  const v = {
    typ: typ.id, zena, vek,
    vyska: (zena ? nahodneCislo(0.9, 1.0) : nahodneCislo(0.95, 1.08)) * (vek > 70 ? 0.97 : 1),
    sirka: zena ? nahodneCislo(0.85, 0.98) : nahodneCislo(0.92, 1.12),
    bricho: !zena && sance(s.bricho || 0.12) ? nahodneCislo(0.5, 1) : 0,
    kuze: nahodnaBarva(BARVY_POSTAV.kuze),
    vlasy: nahodnaBarva(sedive ? BARVY_POSTAV.sedive : BARVY_POSTAV.vlasy),
    styl: nahodne(s.vlasy || ['kratke']),
    vousy: zena ? null : vyberVousy(s.vousy),
    trup, spodek,
    pokryvka: vyberPokryvku(s.pokryvka),
    bryle: sance(s.bryle || 0.1),
    slunecni: sance(s.slunecni || 0),
    kravata: trup === 'saco' && sance(s.kravata || 0.5),
    sala: sance(s.sala || 0),
    batoh: sance(s.batoh || 0),
    fotak: sance(s.fotak || 0),
    nausnice: zena && sance(s.nausnice || 0.3),
    kabelka: zena && sance(s.kabelka || 0),
    ksiltDozadu: sance(0.3),
    oci: nahodnaBarva(BARVY_POSTAV.oci),
    rumenec: zena ? nahodneCislo(0.12, 0.3) : nahodneCislo(0, 0.12)
  };
  if (zena && ['pleš', 'cirak', 'jezek'].includes(v.styl)) v.styl = nahodne(['dlouhe', 'culik', 'drdol', 'mikado']);
  if (v.slunecni) v.bryle = false;
  // barvy oblečení podle druhu
  const b = {};
  const lesni = s.barvy === 'lesni';
  b.trup = nahodnaBarva(lesni ? BARVY_POSTAV.lesni : ({
    kosile: BARVY_POSTAV.kosile, svetr: BARVY_POSTAV.svetry, kardigan: BARVY_POSTAV.svetry, dres: BARVY_POSTAV.dresy,
    havajska: BARVY_POSTAV.pestre, halenka: BARVY_POSTAV.pestre, saty: BARVY_POSTAV.pestre, myslivecka: BARVY_POSTAV.lesni
  }[trup] || BARVY_POSTAV.trika));
  b.trup2 = nahodnaBarva(trup === 'havajska' ? BARVY_POSTAV.pestre : BARVY_POSTAV.trika);
  if (trup === 'saco') { b.trup = nahodnaBarva(['#2a2f3a', '#3a3a3a', '#1f2a44', '#4a3a2a']); b.kosile = nahodnaBarva(BARVY_POSTAV.kosile); }
  if (trup === 'kozenka') { b.trup = nahodnaBarva(['#1a1a1a', '#2b1d14', '#3a2a20']); b.kosile = nahodnaBarva(['#2a2a2a', '#7a2a2a', '#ececec']); }
  if (trup === 'vesta' || trup === 'kardigan') b.kosile = nahodnaBarva(BARVY_POSTAV.kosile);
  if (trup === 'monterky') { b.trup = nahodnaBarva(['#2f5aa0', '#e07b39', '#3a5a3a', '#5d6d7e']); b.kosile = nahodnaBarva(BARVY_POSTAV.trika); }
  b.spodek = spodek === 'monterky' ? b.trup : nahodnaBarva(spodek === 'dziny' ? BARVY_POSTAV.dziny : (spodek === 'sukne' ? [...BARVY_POSTAV.svetry, '#2a2a2a'] : BARVY_POSTAV.kalhoty));
  if (trup === 'saty') b.spodek = b.trup;
  if (trup === 'saco') b.spodek = b.trup;
  b.boty = nahodnaBarva(BARVY_POSTAV.boty);
  b.pokryvka = v.pokryvka === 'helma' ? nahodnaBarva(['#f2c200', '#f07a1a', '#f2f2f2']) :
    v.pokryvka === 'myslivecky' ? hexNaRgb('#3e5a2e') : v.pokryvka === 'slamak' ? hexNaRgb('#e3c27a') : nahodnaBarva(BARVY_POSTAV.cepice);
  b.doplnek = nahodnaBarva(BARVY_POSTAV.pestre);
  v.barvy = b;
  return v;
}

// Postaví síť postavy (v klidové poloze, vstoje)
function postavSitPostavy(v) {
  const d = new Davka();
  const b = v.barvy;
  const sw = v.sirka;
  const R = 0.27 * sw;              // ramena
  v.ramena = R;
  const kuze = v.kuze, kuzeT = tmavsi(kuze, 0.88);
  const vlasy = v.vlasy, vlasyT = tmavsi(vlasy, 0.8);
  const sedive = BARVY_POSTAV.sedive.some((h) => hexNaRgb(h).every((c, i) => Math.abs(c - vlasy[i]) < 0.01));
  const kroky = kvalitaGrafiky === 'nizka' ? 1 : 2;
  const box = (kost, cx, cy, cz, sx, sy, sz, barva) => { d.kost = kost; kostka(d, cx, cy, cz, sx, sy, sz, barva); };
  // zaoblený díl (hlava, trup, končetiny, vlasy)
  const obl = (kost, cx, cy, cz, sx, sy, sz, barva, r) => { d.kost = kost; zaoblenyKvadr(d, cx, cy, cz, sx, sy, sz, barva, r, kroky); };
  const tmava = [0.08, 0.06, 0.05], bila = [0.95, 0.95, 0.95];

  /* ----- nohy ----- */
  const kratke = v.spodek === 'kratasy', sukne = v.spodek === 'sukne';
  const nohavice = sukne ? (sance(0.5) ? kuze : tmavsi(b.spodek, 0.6)) : b.spodek;
  [[-1, 7, 8], [1, 9, 10]].forEach(([s, stehno, lytko]) => {
    const x = s * 0.1;
    obl(stehno, x, 0.65, 0, 0.15, 0.44, 0.17, nohavice, 0.06);
    obl(lytko, x, 0.25, 0, 0.135, 0.4, 0.15, kratke ? kuze : nohavice, 0.055);
    if (kratke) obl(lytko, x, 0.42, 0, 0.145, 0.08, 0.16, b.spodek, 0.03);
    // bota s podrážkou
    obl(lytko, x, 0.045, 0.035, 0.145, 0.075, 0.27, b.boty, 0.035);
    box(lytko, x, 0.008, 0.035, 0.15, 0.016, 0.275, tmavsi(b.boty, 0.5));
    if (v.spodek === 'dziny') box(stehno, x, 0.8, 0.087, 0.06, 0.06, 0.005, tmavsi(b.spodek, 0.85));
  });

  /* ----- boky a sukně ----- */
  obl(0, 0, 0.88, 0, 0.36 * sw, 0.17, 0.22, b.spodek, 0.06);
  box(0, 0, 0.955, 0, 0.37 * sw, 0.03, 0.226, sukne ? b.spodek : [0.15, 0.1, 0.07]);
  if (!sukne) box(0, 0, 0.955, 0.114, 0.04, 0.028, 0.006, [0.75, 0.62, 0.3]); // přezka opasku
  if (sukne) {
    obl(0, 0, 0.75, 0, 0.42 * sw, 0.16, 0.27, b.spodek, 0.05);
    obl(0, 0, 0.62, 0, 0.46 * sw, 0.16, 0.3, b.spodek, 0.05);
  }

  /* ----- trup podle oblečení ----- */
  const t = v.trup;
  const dlouheRukavy = !['tricko', 'havajska', 'dres', 'halenka', 'saty'].includes(t) || (t === 'halenka' && sance(0.4));
  const hlavniBarva = (t === 'saco' || t === 'kozenka' || t === 'vesta' || t === 'kardigan') ? b.kosile : b.trup;
  obl(1, 0, 1.2, 0, 0.42 * sw, 0.52, 0.24, hlavniBarva, 0.075);
  if (v.bricho) obl(1, 0, 1.07, 0.1 + 0.04 * v.bricho, 0.36 * sw, 0.26, 0.12 + 0.08 * v.bricho, hlavniBarva, 0.06);
  const predek = 0.121;
  if (t === 'kosile' || t === 'vesta') {
    box(1, -0.045, 1.43, predek, 0.07, 0.05, 0.01, svetlejsi(hlavniBarva, 0.5));
    box(1, 0.045, 1.43, predek, 0.07, 0.05, 0.01, svetlejsi(hlavniBarva, 0.5));
    box(1, 0, 1.18, predek, 0.015, 0.42, 0.01, tmavsi(hlavniBarva, 0.85));
    [1.05, 1.17, 1.29].forEach((y) => box(1, 0.012, y, predek + 0.004, 0.012, 0.012, 0.006, tmavsi(hlavniBarva, 0.7)));
  }
  if (t === 'vesta' || t === 'saco' || t === 'kozenka' || t === 'kardigan') {
    const kabat = b.trup;
    [-1, 1].forEach((s) => {
      box(1, s * 0.15 * sw, 1.18, 0.123, 0.12 * sw, 0.5, 0.012, kabat);
      box(1, s * 0.205 * sw, 1.2, 0, 0.022, 0.5, 0.25, kabat);
    });
    box(1, 0, 1.2, -0.123, 0.42 * sw, 0.5, 0.012, kabat);
    if (t === 'saco') [-1, 1].forEach((s) => box(1, s * 0.07, 1.36, 0.128, 0.05, 0.14, 0.008, tmavsi(kabat, 0.8)));
    if (t === 'kardigan' || t === 'vesta') [1.06, 1.16, 1.26].forEach((y) => box(1, 0.05, y, 0.131, 0.02, 0.02, 0.008, [0.85, 0.75, 0.4]));
  }
  if (v.kravata) {
    box(1, 0, 1.31, 0.129, 0.045, 0.24, 0.01, b.doplnek);
    box(1, 0, 1.425, 0.129, 0.05, 0.035, 0.012, tmavsi(b.doplnek, 0.8));
  }
  if (v.motylek) {
    [-1, 1].forEach((s) => box(1, s * 0.026, 1.44, 0.132, 0.04, 0.032, 0.012, [0.06, 0.06, 0.07]));
    box(1, 0, 1.44, 0.135, 0.016, 0.018, 0.014, [0.12, 0.12, 0.13]);
  }
  if (t === 'mikina') {
    obl(1, 0, 1.43, -0.13, 0.3 * sw, 0.14, 0.07, tmavsi(b.trup, 0.9), 0.03);
    box(1, 0, 1.05, 0.124, 0.26 * sw, 0.12, 0.012, tmavsi(b.trup, 0.88));
    [-0.04, 0.04].forEach((x) => box(1, x, 1.33, 0.125, 0.012, 0.12, 0.008, bila));
  }
  if (t === 'monterky') {
    box(1, 0, 1.12, 0.124, 0.3 * sw, 0.3, 0.012, b.trup);
    [-1, 1].forEach((s) => box(1, s * 0.11 * sw, 1.33, 0.124, 0.05, 0.22, 0.012, b.trup));
    box(1, 0, 1.15, 0.131, 0.1, 0.08, 0.006, tmavsi(b.trup, 0.8));
  }
  if (t === 'dres') {
    box(1, 0, 1.24, 0, 0.425 * sw, 0.07, 0.245, b.trup2);
    box(1, 0, 1.13, -0.124, 0.14, 0.14, 0.008, bila);
    box(1, 0, 1.06, 0, 0.425 * sw, 0.03, 0.245, b.trup2);
  }
  if (t === 'havajska') {
    for (let i = 0; i < 9; i++) {
      const barva = nahodnaBarva(BARVY_POSTAV.pestre);
      box(1, nahodneCislo(-0.15, 0.15) * sw, nahodneCislo(1.0, 1.4), 0.122, 0.05, 0.05, 0.008, barva);
      box(1, nahodneCislo(-0.15, 0.15) * sw, nahodneCislo(1.0, 1.4), -0.122, 0.05, 0.05, 0.008, barva);
    }
  }
  if (t === 'flanel') {
    const pruh = tmavsi(b.trup, 0.6);
    [1.03, 1.18, 1.33].forEach((y) => box(1, 0, y, 0, 0.425 * sw, 0.03, 0.245, pruh));
    [-0.12, 0, 0.12].forEach((x) => { box(1, x * sw, 1.2, 0.122, 0.025, 0.5, 0.006, pruh); box(1, x * sw, 1.2, -0.122, 0.025, 0.5, 0.006, pruh); });
  }
  if (t === 'svetr') {
    box(1, 0, 1.27, 0, 0.425 * sw, 0.06, 0.245, svetlejsi(b.trup, 0.4));
    obl(1, 0, 1.44, 0, 0.17, 0.06, 0.17, b.trup, 0.025);
  }
  if (t === 'halenka' || t === 'saty') box(1, 0, 1.41, 0.121, 0.1, 0.07, 0.008, kuze);
  if (t === 'myslivecka') {
    [-1, 1].forEach((s) => box(1, s * 0.1 * sw, 1.08, 0.124, 0.1, 0.09, 0.012, tmavsi(b.trup, 0.75)));
    box(1, 0, 1.43, 0.11, 0.2, 0.05, 0.04, tmavsi(b.trup, 0.7));
  }
  // kuchařský kabát: dvě řady knoflíků
  if (v.cepiceKuchare) [-0.06, 0.06].forEach((x) => [1.05, 1.17, 1.29].forEach((y) => box(1, x, y, 0.126, 0.016, 0.016, 0.006, [0.8, 0.8, 0.78])));
  // zástěra (personál): náprsenka na trupu a dlouhá část od pasu dolů
  if (v.zastera) {
    const z = v.zastera;
    box(1, 0, 1.22, 0.126 + (v.bricho ? 0.02 : 0), 0.28 * sw, 0.24, 0.01, z);
    [-1, 1].forEach((s) => box(1, s * 0.11 * sw, 1.4, 0.124, 0.02, 0.14, 0.008, z));
    box(0, 0, 0.94, 0.118, 0.38 * sw, 0.04, 0.012, tmavsi(z, 0.85));
    box(0, 0, 0.7, 0.122, 0.34 * sw, 0.46, 0.01, z);
    box(0, 0.04, 0.82, 0.128, 0.12, 0.08, 0.006, tmavsi(z, 0.8)); // kapsa
  }
  // číšnická peněženka na opasku
  if (v.ledvinka) {
    obl(0, 0.07, 0.9, 0.13, 0.15, 0.1, 0.05, [0.12, 0.09, 0.07], 0.015);
    box(0, 0.07, 0.93, 0.156, 0.13, 0.012, 0.004, [0.7, 0.6, 0.3]);
  }
  obl(1, 0, 1.48, 0, 0.12, 0.09, 0.12, kuze, 0.04); // krk

  /* ----- ruce ----- */
  const rukav = (t === 'vesta') ? b.kosile : b.trup;
  [[-1, 3, 4], [1, 5, 6]].forEach(([s, rameno, predlokti]) => {
    const x = s * R;
    obl(rameno, x, 1.255, 0, 0.115, 0.32, 0.125, dlouheRukavy ? rukav : kuze, 0.05);
    if (!dlouheRukavy) obl(rameno, x, 1.34, 0, 0.122, 0.14, 0.132, rukav, 0.05);
    obl(predlokti, x, 0.98, 0, 0.1, 0.28, 0.11, dlouheRukavy ? rukav : kuze, 0.045);
    if (dlouheRukavy) box(predlokti, x, 0.87, 0, 0.104, 0.025, 0.114, tmavsi(rukav, 0.85));
    obl(predlokti, x, 0.8, 0.012, 0.085, 0.11, 0.1, kuze, 0.035);
    obl(predlokti, x - s * 0.03, 0.82, 0.055, 0.03, 0.05, 0.03, kuzeT, 0.012); // palec
  });
  if (v.kabelka) obl(4, -R - 0.06, 0.98, 0, 0.04, 0.15, 0.2, b.doplnek, 0.015);

  /* ----- doplňky na trupu ----- */
  if (v.batoh) {
    obl(1, 0, 1.2, -0.18, 0.3 * sw, 0.38, 0.13, b.doplnek, 0.04);
    [-1, 1].forEach((s) => box(1, s * 0.12 * sw, 1.25, 0.123, 0.035, 0.32, 0.01, tmavsi(b.doplnek, 0.7)));
  }
  if (v.fotak) {
    obl(1, 0.06, 1.17, 0.14, 0.12, 0.08, 0.05, [0.1, 0.1, 0.1], 0.015);
    box(1, 0.06, 1.17, 0.17, 0.05, 0.05, 0.03, [0.2, 0.2, 0.22]);
    box(1, -0.06, 1.33, 0.124, 0.02, 0.28, 0.008, [0.1, 0.1, 0.1]);
  }
  if (v.sala) {
    obl(1, 0, 1.465, 0, 0.2, 0.06, 0.2, b.doplnek, 0.025);
    box(1, 0.06, 1.32, 0.128, 0.07, 0.24, 0.02, b.doplnek);
    box(1, 0.06, 1.25, 0.13, 0.072, 0.03, 0.022, bila);
  }

  /* ----- hlava: zaoblená, s ušima, nosem, očima (duhovka, zornice, odlesk) ----- */
  obl(2, 0, 1.6, 0, 0.25, 0.27, 0.25, kuze, 0.085);
  [-1, 1].forEach((s) => obl(2, s * 0.127, 1.6, -0.01, 0.03, 0.07, 0.05, kuzeT, 0.013));
  obl(2, 0, 1.585, 0.135, 0.042, 0.065, 0.045, kuzeT, 0.018);
  if (v.rumenec > 0.05) [-1, 1].forEach((s) => box(2, s * 0.068, 1.566, 0.121, 0.035, 0.022, 0.004, kuze.map((c, i) => lerp(c, [0.9, 0.45, 0.42][i], v.rumenec))));
  // oči: zaoblené bělmo, duhovka s tmavším okrajem, zornice, dva odlesky, linka řas a víčko
  [-1, 1].forEach((s) => {
    const ex = s * 0.056, ey = 1.624, dx = s * 0.002;
    obl(2, ex, ey, 0.1215, 0.058, 0.046, 0.016, [0.97, 0.96, 0.93], 0.012);
    obl(2, ex + dx, ey - 0.002, 0.1285, 0.034, 0.038, 0.006, tmavsi(v.oci, 0.55), 0.008);
    obl(2, ex + dx, ey - 0.002, 0.1305, 0.027, 0.031, 0.005, v.oci, 0.007);
    box(2, ex + dx, ey - 0.002, 0.1325, 0.013, 0.016, 0.003, tmava);
    box(2, ex + dx + 0.008, ey + 0.009, 0.1347, 0.008, 0.008, 0.002, [1, 1, 1]);
    box(2, ex + dx - 0.007, ey - 0.011, 0.1344, 0.004, 0.004, 0.002, [0.88, 0.9, 0.95]);
    box(2, ex, ey + 0.022, 0.1296, 0.062, 0.007, 0.006, v.zena ? [0.1, 0.06, 0.05] : tmavsi(kuze, 0.5));
    if (v.zena) box(2, ex + s * 0.033, ey + 0.026, 0.128, 0.012, 0.006, 0.006, [0.1, 0.06, 0.05]);
    // víčko: při mrknutí se roztáhne přes oko (kost 14)
    box(14, ex, ey + 0.0005, 0.1338, 0.063, 0.048, 0.006, kuzeT);
  });
  // obočí podle výrazu: klidné (kost 15), zvednuté při úsměvu (11), stažené při mračení (12)
  const oboci = sedive ? vlasy : vlasyT;
  [-1, 1].forEach((s) => {
    box(15, s * 0.036, 1.666, 0.1275, 0.036, 0.013, 0.012, oboci);
    box(15, s * 0.072, 1.6625, 0.1255, 0.034, 0.012, 0.012, oboci);
    box(11, s * 0.036, 1.672, 0.1275, 0.036, 0.013, 0.012, oboci);
    box(11, s * 0.073, 1.669, 0.1255, 0.034, 0.012, 0.012, oboci);
    box(12, s * 0.034, 1.657, 0.128, 0.036, 0.014, 0.012, oboci);
    box(12, s * 0.071, 1.665, 0.1255, 0.034, 0.012, 0.012, oboci);
  });
  // ústa: rty v barvě pleti do červena, uvnitř tmavě (při mluvení se otevírají)
  const zUst = v.vousy === 'plnovous' ? 0.137 : 0.129;
  const ret = kuze.map((c, i) => lerp(c, [0.72, 0.27, 0.25][i], v.zena ? 0.72 : 0.45));
  const vnitrek = [0.3, 0.07, 0.06];
  box(13, 0, 1.53, zUst - 0.001, 0.056, 0.01, 0.01, vnitrek);
  box(13, 0, 1.5375, zUst, 0.066, 0.007, 0.01, tmavsi(ret, 0.88));
  box(13, 0, 1.5225, zUst, 0.056, 0.008, 0.01, ret);
  // úsměv: širší, se zuby a koutky nahoru
  box(11, 0, 1.528, zUst - 0.001, 0.084, 0.016, 0.01, vnitrek);
  box(11, 0, 1.5325, zUst + 0.0005, 0.062, 0.006, 0.01, [0.96, 0.95, 0.9]);
  box(11, 0, 1.5175, zUst, 0.07, 0.008, 0.01, ret);
  [-1, 1].forEach((s) => box(11, s * 0.047, 1.538, zUst, 0.016, 0.022, 0.01, ret));
  // mračení: rty k sobě, koutky dolů
  box(12, 0, 1.531, zUst, 0.06, 0.012, 0.01, tmavsi(ret, 0.9));
  [-1, 1].forEach((s) => box(12, s * 0.036, 1.522, zUst, 0.018, 0.016, 0.01, tmavsi(ret, 0.9)));

  // vousy
  if (v.vousy === 'plnovous') {
    obl(2, 0, 1.505, 0.075, 0.255, 0.13, 0.11, vlasy, 0.04);
    [-1, 1].forEach((s) => box(2, s * 0.125, 1.58, 0.03, 0.02, 0.12, 0.13, vlasy));
  } else if (v.vousy === 'knir') {
    obl(2, 0, 1.553, 0.134, 0.11, 0.024, 0.022, vlasy, 0.01);
  } else if (v.vousy === 'kozi') {
    obl(2, 0, 1.49, 0.115, 0.07, 0.07, 0.04, vlasy, 0.018);
    box(2, 0, 1.553, 0.132, 0.09, 0.02, 0.02, vlasy);
  } else if (v.vousy === 'strniste') {
    box(2, 0, 1.51, 0.1265, 0.2, 0.1, 0.004, tmavsi(kuze, 0.78));
  }
  // brýle
  if (v.slunecni) {
    [-1, 1].forEach((s) => box(2, s * 0.058, 1.627, 0.142, 0.08, 0.05, 0.01, [0.05, 0.05, 0.06]));
    box(2, 0, 1.635, 0.142, 0.04, 0.012, 0.01, [0.05, 0.05, 0.06]);
  } else if (v.bryle) {
    const ram = v.zena ? b.doplnek : [0.12, 0.1, 0.1];
    [-1, 1].forEach((s) => {
      const x = s * 0.058;
      box(2, x, 1.652, 0.142, 0.08, 0.01, 0.008, ram);
      box(2, x, 1.602, 0.142, 0.08, 0.01, 0.008, ram);
      box(2, x - 0.037, 1.627, 0.142, 0.01, 0.05, 0.008, ram);
      box(2, x + 0.037, 1.627, 0.142, 0.01, 0.05, 0.008, ram);
    });
    box(2, 0, 1.64, 0.142, 0.03, 0.01, 0.008, ram);
  }
  if (v.nausnice) [-1, 1].forEach((s) => box(2, s * 0.133, 1.555, 0.0, 0.015, 0.03, 0.015, [0.95, 0.8, 0.3]));

  // vlasy (zaoblené „čepice“ z vlasů)
  const temeno = () => obl(2, 0, 1.735, -0.005, 0.272, 0.075, 0.272, vlasy, 0.035);
  const zatylek = (spodek = 1.58) => obl(2, 0, (1.74 + spodek) / 2, -0.124, 0.268, 1.74 - spodek, 0.045, vlasy, 0.02);
  const boky = () => [-1, 1].forEach((s) => obl(2, s * 0.128, 1.68, -0.03, 0.03, 0.11, 0.2, vlasy, 0.012));
  const kryteHlavou = v.pokryvka && v.pokryvka !== 'sluchatka';
  switch (v.styl) {
    case 'pleš':
      [-1, 1].forEach((s) => obl(2, s * 0.128, 1.62, -0.04, 0.03, 0.08, 0.17, vlasy, 0.012));
      obl(2, 0, 1.6, -0.126, 0.25, 0.1, 0.03, vlasy, 0.012);
      break;
    case 'dlouhe':
      temeno(); zatylek(1.42); boky();
      obl(2, 0, 1.5, -0.12, 0.28, 0.2, 0.05, vlasy, 0.02);
      [-1, 1].forEach((s) => obl(2, s * 0.135, 1.55, 0.03, 0.03, 0.26, 0.09, vlasy, 0.012));
      obl(2, 0, 1.712, 0.118, 0.26, 0.05, 0.035, vlasy, 0.015);
      break;
    case 'culik':
      temeno(); zatylek(); boky();
      obl(2, 0, 1.56, -0.17, 0.07, 0.22, 0.07, vlasy, 0.03);
      box(2, 0, 1.68, -0.15, 0.08, 0.03, 0.04, b.doplnek);
      break;
    case 'drdol':
      temeno(); zatylek(); boky();
      if (!kryteHlavou && !v.cepiceKuchare) obl(2, 0, 1.77, -0.09, 0.13, 0.11, 0.13, vlasy, 0.05);
      break;
    case 'kudrny':
      zatylek(1.55); boky();
      for (let i = 0; i < 9; i++) obl(2, -0.1 + (i % 3) * 0.1, 1.75 + (i % 2) * 0.02, -0.1 + Math.floor(i / 3) * 0.1, 0.12, 0.09, 0.12, vlasy, 0.04);
      break;
    case 'jezek':
      temeno(); zatylek(); boky();
      for (let i = 0; i < 8; i++) box(2, -0.09 + (i % 4) * 0.06, 1.79, -0.06 + Math.floor(i / 4) * 0.08, 0.03, 0.06, 0.03, vlasy);
      break;
    case 'pesinka':
      temeno(); zatylek(); boky();
      obl(2, -0.05, 1.77, 0.03, 0.17, 0.035, 0.2, vlasy, 0.015);
      break;
    case 'mikado':
      temeno(); zatylek(1.5);
      [-1, 1].forEach((s) => obl(2, s * 0.135, 1.6, -0.01, 0.035, 0.23, 0.25, vlasy, 0.015));
      obl(2, 0, 1.71, 0.12, 0.26, 0.055, 0.035, vlasy, 0.015);
      break;
    case 'cirak':
      [-1, 1].forEach((s) => box(2, s * 0.127, 1.62, -0.04, 0.012, 0.06, 0.15, vlasyT));
      obl(2, 0, 1.79, -0.02, 0.055, 0.13, 0.25, vlasy, 0.02);
      break;
    default:
      temeno(); zatylek(); boky();
  }

  // pokrývky hlavy
  const p = b.pokryvka;
  switch (v.pokryvka) {
    case 'ksiltovka':
      obl(2, 0, 1.765, -0.005, 0.282, 0.08, 0.282, p, 0.035);
      box(2, 0, 1.737, v.ksiltDozadu ? -0.19 : 0.19, 0.22, 0.015, 0.13, tmavsi(p, 0.8));
      break;
    case 'bekovka':
      obl(2, 0, 1.76, 0.01, 0.288, 0.06, 0.292, p, 0.025);
      box(2, 0, 1.74, 0.165, 0.24, 0.015, 0.06, tmavsi(p, 0.8));
      break;
    case 'klobouk':
      obl(2, 0, 1.75, 0, 0.42, 0.016, 0.42, [0.2, 0.15, 0.12], 0.006);
      obl(2, 0, 1.81, 0, 0.26, 0.11, 0.26, [0.2, 0.15, 0.12], 0.035);
      box(2, 0, 1.77, 0, 0.265, 0.025, 0.265, p);
      break;
    case 'myslivecky':
      obl(2, 0, 1.75, 0, 0.36, 0.016, 0.36, p, 0.006);
      obl(2, 0, 1.81, 0, 0.24, 0.12, 0.24, p, 0.035);
      box(2, 0, 1.77, 0, 0.245, 0.02, 0.245, [0.3, 0.2, 0.1]);
      box(2, 0.11, 1.88, -0.06, 0.015, 0.16, 0.03, [0.85, 0.85, 0.8]);
      break;
    case 'kulich':
      obl(2, 0, 1.76, -0.01, 0.288, 0.13, 0.288, p, 0.05);
      obl(2, 0, 1.71, -0.01, 0.292, 0.035, 0.292, svetlejsi(p, 0.3), 0.015);
      obl(2, 0, 1.84, -0.01, 0.075, 0.065, 0.075, svetlejsi(p, 0.5), 0.03);
      break;
    case 'slamak':
      obl(2, 0, 1.75, 0, 0.5, 0.016, 0.5, p, 0.006);
      obl(2, 0, 1.8, 0, 0.27, 0.1, 0.27, p, 0.03);
      box(2, 0, 1.765, 0, 0.275, 0.025, 0.275, [0.5, 0.15, 0.1]);
      break;
    case 'helma':
      obl(2, 0, 1.775, 0, 0.29, 0.11, 0.3, p, 0.05);
      obl(2, 0, 1.738, 0.04, 0.31, 0.016, 0.38, p, 0.006);
      box(2, 0, 1.83, 0, 0.04, 0.02, 0.3, tmavsi(p, 0.85));
      break;
    case 'sluchatka': {
      // oblouk přes hlavu, ramínka po stranách a mušle s barevným krytem
      const cerna = [0.1, 0.1, 0.12];
      obl(2, 0, 1.778, 0, 0.3, 0.026, 0.05, cerna, 0.012);
      [-1, 1].forEach((s) => {
        box(2, s * 0.153, 1.715, 0, 0.016, 0.11, 0.036, [0.55, 0.56, 0.6]);
        obl(2, s * 0.15, 1.618, 0, 0.05, 0.1, 0.1, cerna, 0.03);
        obl(2, s * 0.177, 1.618, 0, 0.02, 0.07, 0.07, b.doplnek, 0.0099);
      });
      break;
    }
  }
  // kuchařská čepice
  if (v.cepiceKuchare) {
    obl(2, 0, 1.76, 0, 0.27, 0.06, 0.27, [0.98, 0.98, 0.96], 0.02);
    obl(2, 0, 1.88, 0, 0.3, 0.2, 0.3, [0.99, 0.99, 0.98], 0.1);
  }
  return vytvorSit(d);
}
/* =========================================================
   14) ANIMACE POSTAV – chůze, sezení, pití, jídlo, mávání,
       nošení tácu, vaření, mrkání; postavy si uhýbají
   ========================================================= */
let poradiPostav = 0;
function novaPostava(x, z, vzhled) {
  return {
    x, z, natoceni: 0, vzhled, sit: postavSitPostavy(vzhled), poradi: ++poradiPostav,
    faze: Math.random() * 6, chuze: 0, sedi: 0, sedadloTyp: 'zidle',
    napiti: 0, drziPred: 0, mava: 0, rucePres: 0, mluvi: 0, kyvHlavou: 0, pripitek: 0, jasotDo: 0,
    ji: 0, podnos: 0, pracuje: 0, prace: null, mrkDo: 0, dalsiMrk: Math.random() * 4,
    vyraz: 'normal', hlavaOtoc: 0, cesta: [], rychlost: nahodneCislo(1.15, 1.45), cekaNaPruchod: 0, pruchodDo: 0,
    _kosti: new Float32Array(POCET_KOSTI * 16), _ruka: [x, 1, z], _levaRuka: [x, 1, z]
  };
}

function smazPostavu(p) {
  smazSit(p.sit);
  p.sit = null;
}

// Stojí někdo těsně před postavou ve směru chůze? (hráč, hosté, personál)
function nekdoVCeste(p, fx, fz) {
  if (casHry < p.pruchodDo) return null;
  const pred = (x, z) => {
    const ox = x - p.x, oz = z - p.z;
    const vpred = ox * fx + oz * fz;
    if (vpred < 0.05 || vpred > 0.62) return false;
    return Math.abs(ox * fz - oz * fx) < 0.36;
  };
  if (REZIM !== 'menu' && pred(hrac.x, hrac.z)) return hrac;
  for (const seznam of [hoste, personal]) {
    for (const o of seznam) {
      if (o === p || o.sedi > 0.5 || !o.sit) continue;
      // přednost má ten, kdo vznikl dřív (aby nečekali oba na sebe)
      if (o.cesta.length && o.poradi > p.poradi) continue;
      if (pred(o.x, o.z)) return o;
    }
  }
  return null;
}

// Posune postavu po její cestě; vrací true, když dorazila
function jdiPoCeste(p, dt) {
  if (!p.cesta.length) { p.chuze = Math.max(0, p.chuze - dt * 4); return true; }
  const cil = p.cesta[0];
  const dx = cil.x - p.x, dz = cil.z - p.z;
  const d = Math.hypot(dx, dz);
  let krok = p.rychlost * dt;
  if (d > 0.3) {
    const prekazi = nekdoVCeste(p, dx / d, dz / d);
    if (prekazi) {
      // zpomalit a zkusit ustoupit doprava; po chvíli projde i tak
      krok *= 0.2;
      p.cekaNaPruchod = (p.cekaNaPruchod || 0) + dt;
      const bx = p.x - (dz / d) * 0.35 * dt, bz = p.z + (dx / d) * 0.35 * dt;
      const [ix, iz] = bunka(bx, bz);
      if (volnaBunka(ix, iz)) { p.x = bx; p.z = bz; }
      if (p.cekaNaPruchod > 1.1) { p.pruchodDo = casHry + 1.6; p.cekaNaPruchod = 0; }
    } else {
      p.cekaNaPruchod = Math.max(0, p.cekaNaPruchod - dt);
    }
  }
  if (d <= krok) {
    p.x = cil.x;
    p.z = cil.z;
    p.cesta.shift();
  } else {
    p.x += (dx / d) * krok;
    p.z += (dz / d) * krok;
  }
  if (d > 0.01) p.natoceni += normalizujUhel(Math.atan2(dx, dz) - p.natoceni) * Math.min(1, dt * 10);
  p.chuze = Math.min(1, p.chuze + dt * 4);
  p.faze += dt * p.rychlost * 6.2 * (krok / Math.max(1e-6, p.rychlost * dt));
  return p.cesta.length === 0;
}

function otocK(p, uhel, dt) {
  p.natoceni += normalizujUhel(uhel - p.natoceni) * Math.min(1, dt * 6);
}

// Rotace kolem bodu (kloubu) v souřadnicích modelu
function kloub(rodic, x, y, z, ...rotace) {
  return M4.retez(rodic, M4.posun(x, y, z), ...rotace, M4.posun(-x, -y, -z));
}

function spocitejKosti(p, cas) {
  const v = p.vzhled;
  const R = v.ramena;
  const stolicka = p.sedadloTyp === 'stolicka';
  const sed = p.sedi;
  const kyv = Math.sin(p.faze) * 0.55 * p.chuze;
  const poskok = Math.abs(Math.sin(p.faze)) * 0.035 * p.chuze;
  const pokles = sed * (stolicka ? 0.04 : 0.33);
  const dych = Math.sin(cas * 1.7 + p.faze) * 0.012;
  // mrkání: jednou za pár sekund na desetinu sekundy
  if (cas > p.dalsiMrk) { p.mrkDo = cas + 0.13; p.dalsiMrk = cas + nahodneCislo(1.8, 5.5); }
  const mrk = cas < p.mrkDo ? 1 : 0.14;
  const B = [];
  // při chůzi se trochu předkloní a pohupuje v bocích
  B[0] = M4.retez(M4.posun(p.x, poskok, p.z), M4.rotY(p.natoceni), M4.rotZ(Math.sin(p.faze) * 0.03 * p.chuze), M4.meritko(v.vyska, v.vyska, v.vyska), M4.posun(0, -pokles, 0));
  B[1] = kloub(B[0], 0, 0.9, 0, M4.rotY(-Math.sin(p.faze) * 0.08 * p.chuze), M4.rotX(0.06 * p.chuze + sed * (stolicka ? 0.14 : 0.05) + dych + p.ji * 0.12));
  B[2] = kloub(B[1], 0, 1.5, 0, M4.rotY(p.hlavaOtoc), M4.rotX(p.kyvHlavou + Math.sin(cas * 11) * 0.03 * p.mluvi - p.ji * 0.08));
  // nohy
  [[-1, 7, 8], [1, 9, 10]].forEach(([s, stehno, lytko]) => {
    const uhel = lerp(kyv * s, stolicka ? -1.3 : -Math.PI / 2, sed);
    const koleno = lerp(Math.max(0, -Math.sin(p.faze) * s) * 0.7 * p.chuze, stolicka ? 1.05 : Math.PI / 2, sed);
    B[stehno] = kloub(B[0], s * 0.1, 0.86, 0, M4.rotX(uhel));
    B[lytko] = kloub(B[stehno], s * 0.1, 0.44, 0, M4.rotX(koleno));
  });
  // ruce
  const prace = p.pracuje;
  [[-1, 3, 4], [1, 5, 6]].forEach(([s, rameno, loket]) => {
    let a = kyv * s * 0.8 * (1 - p.podnos);
    let b = -0.12 - 0.25 * p.chuze;
    let ry = 0;
    let rz = s * 0.05;
    // vsedě se opírá o stůl nebo pult
    a = lerp(a, stolicka ? -0.55 : -0.35, sed);
    b = lerp(b, stolicka ? -1.25 : -1.15, sed);
    // založené ruce (netrpělivost)
    a = lerp(a, -0.38, p.rucePres);
    b = lerp(b, -1.9, p.rucePres);
    ry = lerp(ry, -s * 0.62, p.rucePres);
    // tác nebo peněženka před sebou v obou rukou
    a = lerp(a, -0.32, p.podnos);
    b = lerp(b, -1.32, p.podnos);
    ry = lerp(ry, -s * 0.18, p.podnos);
    if (s === 1) {
      a = lerp(a, -0.35, p.drziPred);
      b = lerp(b, -1.25, p.drziPred);
      a = lerp(a, -0.6, p.napiti);
      b = lerp(b, -2.2, p.napiti);
      ry = lerp(ry, -0.45, p.napiti);
      // vidlička k puse
      a = lerp(a, -0.72, p.ji);
      b = lerp(b, -1.95, p.ji);
      ry = lerp(ry, -0.4, p.ji);
      a = lerp(a, -1.35, p.pripitek);
      b = lerp(b, -0.55, p.pripitek);
      ry = lerp(ry, -0.3, p.pripitek);
      a = lerp(a, -2.85, p.mava);
      b = lerp(b, -0.35, p.mava);
      rz = lerp(rz, 0.18 + Math.sin(cas * 9) * 0.22, p.mava);
      // vaření: míchání v hrnci, krájení na prkénku
      if (p.prace === 'michani') { a = lerp(a, -0.55 + Math.sin(cas * 5) * 0.12, prace); b = lerp(b, -1.05, prace); rz = lerp(rz, Math.cos(cas * 5) * 0.2, prace); }
      if (p.prace === 'krajeni') { a = lerp(a, -0.5, prace); b = lerp(b, -1.25 + Math.max(0, Math.sin(cas * 13)) * 0.35, prace); }
    } else if (p.prace) {
      a = lerp(a, -0.45, prace);
      b = lerp(b, -1.1, prace);
    } else {
      // při řeči gestikuluje levou rukou
      const gesto = Math.min(1, p.mluvi * 1.4) * (1 - p.podnos) * (1 - p.rucePres) * (1 - p.drziPred);
      if (gesto > 0.01) {
        a = lerp(a, -0.55 + Math.sin(cas * 4.3 + p.faze) * 0.16, gesto * 0.7);
        b = lerp(b, -1.35 + Math.sin(cas * 6.1 + p.faze * 2) * 0.28, gesto * 0.7);
        ry = lerp(ry, 0.25 + Math.sin(cas * 3.1) * 0.12, gesto * 0.7);
      }
    }
    B[rameno] = kloub(B[1], s * R, 1.4, 0, M4.rotY(ry), M4.rotX(a), M4.rotZ(rz));
    B[loket] = kloub(B[rameno], s * R, 1.11, 0, M4.rotX(b));
  });
  // výraz obličeje: úsměv / mračení / obyčejná pusa (ta se při mluvení a žvýkání otevírá)
  const usta = (meritko, sy = meritko) => kloub(B[2], 0, 1.53, 0.13, M4.meritko(meritko, sy, meritko));
  B[11] = usta(p.vyraz === 'usmev' ? 1 : 0);
  B[12] = usta(p.vyraz === 'zamraceny' ? 1 : 0);
  B[13] = usta(p.vyraz === 'normal' ? 1 : 0, p.vyraz === 'normal' ? 1 + Math.abs(Math.sin(cas * 14)) * 1.6 * p.mluvi : 0);
  B[15] = usta(p.vyraz === 'normal' ? 1 : 0);
  B[14] = kloub(B[2], 0, 1.6485, 0.13, M4.meritko(1, mrk, 1));
  for (let i = 0; i < POCET_KOSTI; i++) p._kosti.set(B[i], i * 16);
  const ruka = M4.bod(B[6], R, 0.8, 0.05);
  p._ruka = [ruka[0], ruka[1], ruka[2]];
  const leva = M4.bod(B[4], -R, 0.8, 0.05);
  p._levaRuka = [leva[0], leva[1], leva[2]];
  // směr předloktí pravé ruky (kvůli vidličce)
  const loket = M4.bod(B[6], R, 1.11, 0);
  p._smerRuky = [ruka[0] - loket[0], ruka[1] - loket[1], ruka[2] - loket[2]];
}

// Kosti se počítají jednou za snímek (stínová mapa i scéna je pak sdílí)
function pripravKosti(p, cas) {
  if (p._snimek === rend.snimek) return;
  spocitejKosti(p, cas);
  p._snimek = rend.snimek;
}

function kresliPostavu(p, cas) {
  if (!p.sit) return;
  pripravKosti(p, cas);
  kresliSKostmi(p.sit, p._kosti);
}
/* =========================================================
   14) HRÁČ – chůze, rozhlížení, kolize a ovládání
   ========================================================= */
let REZIM = 'menu'; // 'menu' | 'hra' | 'pauza' | 'kniha'
const hrac = { x: SVET.start.x, z: SVET.start.z, yaw: SVET.start.yaw, pitch: -0.12, houpani: 0, jde: 0,
  vx: 0, vz: 0, cilYaw: SVET.start.yaw, cilPitch: -0.12, hledi: 0, nakloneni: 0, fovNavic: 0 };
const vstup = {
  klavesy: new Set(),
  joy: { id: null, sx: 0, sy: 0, x: 0, y: 0 },
  pohled: { id: null, lx: 0, ly: 0 },
  akceDrzena: false,
  dotykove: false,
  zamceno: false,
  zamerneOdemceno: false
};

function smerPohledu() {
  const cp = Math.cos(hrac.pitch);
  return [-Math.sin(hrac.yaw) * cp, Math.sin(hrac.pitch), -Math.cos(hrac.yaw) * cp];
}
function polohaOci() {
  return [hrac.x, NASTAVENI.vyskaOci + Math.sin(hrac.houpani * 2) * 0.025 * hrac.jde, hrac.z];
}

// Kruh hráče × kvádry nábytku a stěn
function vyresKolize(x, z) {
  const r = NASTAVENI.polomerHrace;
  for (let opak = 0; opak < 2; opak++) {
    for (const [x0, z0, x1, z1] of prekazky) {
      const cx = omez(x, x0, x1), cz = omez(z, z0, z1);
      const dx = x - cx, dz = z - cz;
      const d2 = dx * dx + dz * dz;
      if (d2 >= r * r) continue;
      if (d2 > 1e-8) {
        const d = Math.sqrt(d2);
        x = cx + (dx / d) * r;
        z = cz + (dz / d) * r;
      } else {
        const m = Math.min(x - x0, x1 - x, z - z0, z1 - z);
        if (m === x - x0) x = x0 - r; else if (m === x1 - x) x = x1 + r;
        else if (m === z - z0) z = z0 - r; else z = z1 + r;
      }
    }
  }
  return [omez(x, r, SVET.sirka - r), omez(z, r, SVET.hloubka - r)];
}

function aktualizujHrace(dt) {
  let dopredu = 0, doprava = 0;
  const k = vstup.klavesy;
  if (k.has('KeyW') || k.has('ArrowUp')) dopredu += 1;
  if (k.has('KeyS') || k.has('ArrowDown')) dopredu -= 1;
  if (k.has('KeyD') || k.has('ArrowRight')) doprava += 1;
  if (k.has('KeyA') || k.has('ArrowLeft')) doprava -= 1;
  if (vstup.joy.id !== null) {
    dopredu = -vstup.joy.y;
    doprava = vstup.joy.x;
  }
  const delka = Math.hypot(dopredu, doprava);
  if (delka > 1) { dopredu /= delka; doprava /= delka; }
  const bezi = k.has('ShiftLeft') || k.has('ShiftRight');
  const beh = bezi ? 1.35 : 1;
  const rychlost = NASTAVENI.rychlostChuze * (1 + 0.12 * (HRA.vylepseni.boty || 0)) * beh;
  // plynulé rozhlížení: myš a dotyk posouvají cíl, kamera ho rychle dožene
  if (hrac.hledi > 0) {
    hrac.hledi -= dt;
    const kk = hrac.hledi > 0 ? Math.min(1, dt * 26) : 1;
    hrac.yaw = normalizujUhel(hrac.yaw + normalizujUhel(hrac.cilYaw - hrac.yaw) * kk);
    hrac.pitch += (hrac.cilPitch - hrac.pitch) * kk;
  }
  const fx = -Math.sin(hrac.yaw), fz = -Math.cos(hrac.yaw);
  const px = Math.cos(hrac.yaw), pz = -Math.sin(hrac.yaw);
  // rozjezd a brzdění místo okamžité rychlosti
  const cilVx = (fx * dopredu + px * doprava) * rychlost, cilVz = (fz * dopredu + pz * doprava) * rychlost;
  const zrychleni = Math.min(1, dt * (delka > 0.05 ? 11 : 9));
  hrac.vx += (cilVx - hrac.vx) * zrychleni;
  hrac.vz += (cilVz - hrac.vz) * zrychleni;
  const pred = [hrac.x, hrac.z];
  [hrac.x, hrac.z] = vyresKolize(hrac.x + hrac.vx * dt, hrac.z + hrac.vz * dt);
  // když narazí do zdi, rychlost do zdi se ztratí
  if (dt > 0) { hrac.vx = (hrac.x - pred[0]) / dt * 0.6 + hrac.vx * 0.4; hrac.vz = (hrac.z - pred[1]) / dt * 0.6 + hrac.vz * 0.4; }
  const skutecna = Math.hypot(hrac.vx, hrac.vz);
  const jde = Math.min(1, skutecna / NASTAVENI.rychlostChuze);
  hrac.jde += (jde - hrac.jde) * Math.min(1, dt * 8);
  hrac.houpani += dt * 5.5 * jde * beh;
  // lehké naklonění při úkroku a širší záběr při běhu
  const bokem = (hrac.vx * px + hrac.vz * pz) / NASTAVENI.rychlostChuze;
  hrac.nakloneni += (-bokem * 0.014 - hrac.nakloneni) * Math.min(1, dt * 6);
  hrac.fovNavic += ((bezi && jde > 0.5 ? 0.06 : 0) - hrac.fovNavic) * Math.min(1, dt * 4);
  const faze = Math.floor(hrac.houpani / Math.PI);
  if (faze !== hrac.krokFaze) {
    hrac.krokFaze = faze;
    if (hrac.jde > 0.4) zvuk.krok(veSkladu() || vKuchyni());
  }
}

function otocPohled(dx, dy, citlivost) {
  if (hrac.hledi <= 0) { hrac.cilYaw = hrac.yaw; hrac.cilPitch = hrac.pitch; }
  hrac.cilYaw = normalizujUhel(hrac.cilYaw - dx * citlivost);
  hrac.cilPitch = omez(hrac.cilPitch - dy * citlivost, -1.35, 1.35);
  hrac.hledi = 0.25;
}

/* ---------- Klávesnice a myš ---------- */
function zamkniMys() {
  if (vstup.dotykove || REZIM !== 'hra' || document.pointerLockElement === platno) return;
  try {
    const slib = platno.requestPointerLock();
    if (slib && slib.catch) slib.catch(() => {});
  } catch (e) { /* některé prohlížeče zámek nepodporují */ }
}

function odemkniMys() {
  vstup.zamerneOdemceno = true;
  if (document.pointerLockElement) document.exitPointerLock();
}

function nastavOvladaniHrace() {
  document.addEventListener('keydown', (e) => {
    if (REZIM !== 'hra') return;
    vstup.klavesy.add(e.code);
    if ((e.code === 'KeyE' || e.code === 'Space') && !e.repeat) { e.preventDefault(); akceStisk(); }
    if (e.code === 'Space') e.preventDefault();
  });
  document.addEventListener('keyup', (e) => {
    vstup.klavesy.delete(e.code);
    if (e.code === 'KeyE' || e.code === 'Space') akceUvolni();
  });
  window.addEventListener('blur', () => { vstup.klavesy.clear(); akceUvolni(); });

  platno.addEventListener('mousedown', (e) => {
    if (REZIM !== 'hra' || vstup.dotykove) return;
    if (document.pointerLockElement !== platno) { zamkniMys(); return; }
    if (e.button === 0) akceStisk();
  });
  document.addEventListener('mouseup', (e) => { if (e.button === 0) akceUvolni(); });
  document.addEventListener('mousemove', (e) => {
    if (REZIM === 'hra' && document.pointerLockElement === platno) {
      otocPohled(e.movementX, e.movementY, 0.0022 * HRA.nastaveni.citlivost);
    }
  });
  document.addEventListener('pointerlockchange', () => {
    const zamceno = document.pointerLockElement === platno;
    vstup.zamceno = zamceno;
    if (!zamceno && REZIM === 'hra' && !vstup.zamerneOdemceno && !vstup.dotykove) zapauzuj();
    vstup.zamerneOdemceno = false;
  });

  /* ---------- Dotyk: joystick vlevo, rozhlížení vpravo ---------- */
  const zona = $('dotyk-zona');
  const joyKolo = $('joy');
  const joyPacka = $('joy-packa');
  zona.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' || REZIM !== 'hra') return;
    prepniNaDotyk();
    e.preventDefault();
    if (e.clientX < window.innerWidth * 0.45 && vstup.joy.id === null) {
      Object.assign(vstup.joy, { id: e.pointerId, sx: e.clientX, sy: e.clientY, x: 0, y: 0 });
      joyKolo.style.left = e.clientX + 'px';
      joyKolo.style.top = e.clientY + 'px';
      joyKolo.hidden = false;
      joyPacka.style.transform = 'translate(-50%, -50%)';
    } else if (vstup.pohled.id === null) {
      Object.assign(vstup.pohled, { id: e.pointerId, lx: e.clientX, ly: e.clientY });
    }
    try { zona.setPointerCapture(e.pointerId); } catch (chyba) { /* nevadí */ }
  });
  zona.addEventListener('pointermove', (e) => {
    if (e.pointerId === vstup.joy.id) {
      const max = 55;
      let dx = e.clientX - vstup.joy.sx, dy = e.clientY - vstup.joy.sy;
      const d = Math.hypot(dx, dy);
      if (d > max) { dx = dx / d * max; dy = dy / d * max; }
      vstup.joy.x = dx / max;
      vstup.joy.y = dy / max;
      joyPacka.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))`;
    } else if (e.pointerId === vstup.pohled.id) {
      otocPohled(e.clientX - vstup.pohled.lx, e.clientY - vstup.pohled.ly, 0.0055 * HRA.nastaveni.citlivost);
      vstup.pohled.lx = e.clientX;
      vstup.pohled.ly = e.clientY;
    }
  });
  const pust = (e) => {
    if (e.pointerId === vstup.joy.id) {
      vstup.joy.id = null;
      vstup.joy.x = vstup.joy.y = 0;
      joyKolo.hidden = true;
    }
    if (e.pointerId === vstup.pohled.id) vstup.pohled.id = null;
  };
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => zona.addEventListener(t, pust));

  const akce = $('btn-akce');
  akce.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    prepniNaDotyk();
    try { akce.setPointerCapture(e.pointerId); } catch (chyba) { /* nevadí */ }
    akce.classList.add('drzi');
    akceStisk();
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((t) => akce.addEventListener(t, () => {
    akce.classList.remove('drzi');
    akceUvolni();
  }));
  akce.addEventListener('contextmenu', (e) => e.preventDefault());
}

function prepniNaDotyk() {
  if (vstup.dotykove) return;
  vstup.dotykove = true;
  document.body.classList.add('dotykove');
  if (document.pointerLockElement) odemkniMys();
}
/* =========================================================
   16) HOSTÉ – chodí po partičkách (1–3 lidi)
   bar: sednou si na stoličku, objednají rovnou, platí hned
   stůl: zamávají, objednávku převezmeš (nebo číšník) u stolu,
         pití doneseš, jídlo přijde z kuchyně, na konci zavolají
         „Zaplatím!“ a vybereš peníze (nebo pokladní)
   ========================================================= */
const party = [];          // všechny partičky v hospodě
const hoste = [];          // všichni hosté (kvůli kreslení)
const spinave = [];        // prázdné sklenice a talíře { x, y, z, misto: {x, z}, pivo | talir }
let dalsiPartaZa = 3;
let poradiParty = 0;
let casHry = 0;            // sekundy od spuštění (pro animace a hlášky)

// Co už nedávno zaznělo – aby hosté neříkali pořád to samé
const nedavne = {};
function vyberNove(seznam, klic, pamet = 4) {
  if (!seznam || !seznam.length) return '';
  const historie = nedavne[klic] || (nedavne[klic] = []);
  let moznosti = seznam.filter((x) => !historie.includes(x));
  if (!moznosti.length) moznosti = seznam;
  const volba = nahodne(moznosti);
  historie.push(volba);
  while (historie.length > Math.max(0, Math.min(pamet, seznam.length - 1))) historie.shift();
  return volba;
}
const velke = (t) => t.charAt(0).toUpperCase() + t.slice(1);
function upravVetu(text) {
  return velke(text.replace(/\s+/g, ' ').trim()).replace(/([.!?] )(\p{Ll})/gu, (_, a, b) => a + b.toUpperCase());
}
// {j} = oslovení výčepního, {mužský|ženský} = tvar podle toho, kdo mluví
function vyplnText(text, typ, zena = false) {
  return upravVetu(text
    .replace(/\{j\}/g, () => vyberNove(OSLOVENI, 'osloveni', 3))
    .replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_, muz, zenskyTvar) => (zena ? zenskyTvar : muz)));
}

function vahovanyVyber(vahy) {
  const polozky = Object.entries(vahy).filter(([, v]) => v > 0);
  const soucet = polozky.reduce((s, [, v]) => s + v, 0);
  let r = Math.random() * soucet;
  for (const [klic, v] of polozky) { r -= v; if (r <= 0) return klic; }
  return polozky.length ? polozky[polozky.length - 1][0] : null;
}

function vyberTyp() {
  const vahy = {};
  // během hokeje chodí hlavně fanoušci
  TYPY_HOSTU.forEach((t) => { vahy[t.id] = t.vaha * (t.id === 'fanousek' ? (hokej.bezi ? 6 : HRA.vylepseni.televize ? 2 : 1) : 1); });
  const id = vahovanyVyber(vahy);
  return TYPY_HOSTU.find((t) => t.id === id) || TYPY_HOSTU[0];
}

// Jaké pivo si host dá (podle oblíbenosti, jen to, co je na čepu)
function vyberPivo(typ) {
  const vahy = {};
  PIVA.forEach((p) => { if (jeNaCepu(p)) vahy[p.id] = (typ.piva[p.id] || 0.4); });
  return vahovanyVyber(vahy);
}

// Jakého panáka si host dá (podle chuti typu hosta)
function vyberPanak(typ) {
  const pref = PANAKY_HOSTU[typ.id];
  if (!pref) return null;
  const vahy = {};
  PANAKY.forEach((p) => { if (jeNaCepu(p)) vahy[p.id] = pref.vahy[p.id] || 0.3; });
  return vahovanyVyber(vahy);
}

// Jaké jídlo si host dá (jen to, co je na lístku); svacina = něco malého k pivu
const LEHKA_JIDLA = ['utopenec', 'pivnisyr', 'hermelin', 'topinky'];
function vyberJidlo(typ, svacina) {
  const pref = JIDLA_HOSTU[typ.id] || { vahy: {} };
  const vahy = {};
  JIDLA.forEach((j) => {
    if (!jeNaListku(j)) return;
    if (svacina && !LEHKA_JIDLA.includes(j.id)) return;
    vahy[j.id] = pref.vahy[j.id] || 0.3;
  });
  return vahovanyVyber(vahy);
}

// Text objednávky: {r12: 2, k: 1} → „dvě Radegast dvanáctky a Kozla“
function popisObjednavky(pocty, cizinec) {
  const casti = Object.entries(pocty).map(([id, n]) => {
    const p = najdiPivo(id) || najdiJidlo(id);
    if (cizinec) return (n > 1 ? ['', 'one', 'two', 'three'][n] + ' ' : '') + (p.en || p.kratce);
    if (n === 1) return vyberNove(p.nazvy, 'nazev_' + id, 4);
    return vyberNove(n === 2 ? p.dve : p.tri, 'vic_' + id, 2);
  });
  if (!casti.length) return '';
  return casti.length > 1 ? casti.slice(0, -1).join(', ') + (cizinec ? ' and ' : ' a ') + casti[casti.length - 1] : casti[0];
}

function vytvorObjednavku(parta, dalsiKolo) {
  const typ = parta.typ;
  const pref = PANAKY_HOSTU[typ.id] || { sance: 0, runda: 0 };
  const clenove = dalsiKolo && parta.clenove.length > 1
    ? parta.clenove.filter(() => Math.random() < 0.8) : parta.clenove;
  const kdo = clenove.length ? clenove : [parta.clenove[0]];
  let polozky = [];
  parta.runda = null;
  // v dalším kole si parta občas dá rundu panáků (všichni stejného);
  // po vyhraném hokeji ji fanoušci chtějí skoro vždycky
  const sanceRundy = pref.runda * (parta.kolo > 2 ? 1.3 : 1) + (parta.slavi ? 0.6 : 0);
  if (dalsiKolo && parta.clenove.length > 1 && Math.random() < sanceRundy) {
    const runda = vyberPanak(typ);
    if (runda) {
      parta.runda = runda;
      polozky = parta.clenove.map((host) => ({ pivo: runda, komu: host, hotovo: false, kvalita: null }));
    }
  }
  parta.slavi = false;
  if (!parta.runda) {
    kdo.forEach((host) => {
      const panak = Math.random() < pref.sance * (dalsiKolo ? 1.25 : 1) ? vyberPanak(typ) : null;
      if (!panak || Math.random() > 0.15) {
        // při dalším kole často zůstanou u svého piva
        const minule = dalsiKolo && host.posledniPivo && Math.random() < 0.7 ? host.posledniPivo : vyberPivo(typ);
        polozky.push({ pivo: minule, komu: host, hotovo: false, kvalita: null });
      }
      if (panak) polozky.push({ pivo: panak, komu: host, hotovo: false, kvalita: null });
    });
  }
  // jídlo z kuchyně (když je otevřená): k první objednávce oběd, později něco k zakousnutí
  const jidla = [];
  if (maKuchyni()) {
    const pj = JIDLA_HOSTU[typ.id] || { sance: 0.3, svacina: 0.1 };
    parta.clenove.forEach((host) => {
      if (host.jidlo || parta.jidla.some((j) => j.komu === host && !['doruceno', 'zruseno'].includes(j.stav))) return;
      const sance = dalsiKolo ? pj.svacina : pj.sance;
      if (Math.random() >= sance) return;
      const id = vyberJidlo(typ, dalsiKolo);
      if (id) jidla.push({ id, komu: host });
    });
  }
  const pocty = {};
  polozky.forEach((p) => { pocty[p.pivo] = (pocty[p.pivo] || 0) + 1; });
  const o = popisObjednavky(pocty, typ.cizinec);
  let text;
  const stejne = dalsiKolo && polozky.every((p) => p.pivo === p.komu.posledniPivo);
  if (parta.runda) text = vyberNove(HLASKY_RUNDA, 'runda', 3).replace('{r}', najdiPivo(parta.runda).runda);
  else if (dalsiKolo && stejne && Math.random() < 0.5) text = vyberNove(HLASKY_DALSI_KOLO, 'dalsiKolo', 3);
  else if (dalsiKolo) text = vyberNove(['Ještě {o}, prosím.', 'Tak ještě {o}.', 'Další kolo: {o}!', '{o}, a pak už fakt půjdem.', 'Dáme si ještě {o}.'], 'kolo', 3).replace('{o}', o);
  else text = vyberNove(typ.objednavky, 'obj_' + typ.id, 3).replace('{p}', vyberNove(typ.pozdravy, 'pozdrav_' + typ.id, 3)).replace('{o}', o) + (jidla.length ? '' : vyberNove(KONCE, 'konec', 3));
  if (jidla.length) {
    const pj = {};
    jidla.forEach((j) => { pj[j.id] = (pj[j.id] || 0) + 1; });
    const vzor = typ.cizinec ? JIDLO_CIZINEC : dalsiKolo ? JIDLO_SVACINA : JIDLO_K_OBJEDNAVCE;
    text += vyberNove(vzor, 'jidloText', 3).replace('{jidlo}', popisObjednavky(pj, typ.cizinec));
  }
  parta.objednavka = polozky;
  parta.text = vyplnText(text, typ, kdo[0].vzhled.zena);
  parta.mluvci = kdo[0];
  parta.prevzato = true;
  // lístky s jídlem jdou rovnou do kuchyně
  jidla.forEach((j) => objednejJidlo(parta, j.komu, najdiJidlo(j.id)));
}

function jmenoHosta(typ, zena) {
  if (typ.cizinec) return vyberNove(JMENA_CIZINCI, 'jmenaCizinci', 6);
  const tituly = PRIJMENI_TITULY[typ.id];
  if (tituly && Math.random() < 0.5) {
    const vhodne = tituly.filter((t) => (zena ? /paní|babička|inženýrka/.test(t) : !/paní|babička|inženýrka/.test(t)));
    if (vhodne.length) return nahodne(vhodne);
  }
  return vyberNove(zena ? JMENA_ZENY : JMENA_MUZI, zena ? 'jmenaZeny' : 'jmenaMuzi', 16);
}

// k místu, kde stojí špinavá sklenice nebo talíř, si nikdo nesedne
const blizko = (a, b) => Math.abs(a.x - b.x) < 0.25 && Math.abs(a.z - b.z) < 0.25;
const spinaveU = (s) => spinave.some((g) => blizko(g, s.sklenice) || (s.talir && blizko(g, s.talir)));
let nemajiKamCas = -99;    // kdy naposled hosté odešli, protože bylo všude nasklenicováno
function volneStolicky() { return stolicky.filter((s) => !s.host && !spinaveU(s)); }

// Najde stůl s dost volnými místy (radši úplně volný)
function najdiStul(pocet) {
  const stoly = {};
  sedadla.forEach((s) => { if (!s.host && !spinaveU(s)) (stoly[s.stul] = stoly[s.stul] || []).push(s); });
  const vhodne = Object.values(stoly).filter((m) => m.length >= pocet);
  if (!vhodne.length) return null;
  const prazdne = vhodne.filter((m) => m.length === 4);
  const vyber = nahodne(prazdne.length ? prazdne : vhodne);
  return vyber.sort(() => Math.random() - 0.5).slice(0, pocet);
}

function intervalHostu() {
  let i = NASTAVENI.intervalHostu * Math.pow(0.85, HRA.vylepseni.reklama || 0);
  if (HRA.vylepseni.televize) i *= 0.85;
  if (maKuchyni()) i *= 0.9;
  i *= 1.5 - 0.12 * HRA.hodnoceni;
  // větší sál unese víc hostů: tlumení podle obsazenosti, ne podle počtu part
  const mist = sedadla.length + stolicky.length;
  const obsazeno = party.filter((p) => p.stav !== 'odchazi').reduce((s, p) => s + p.clenove.length, 0);
  i *= 0.75 + 2.2 * (obsazeno / Math.max(1, mist));
  i *= 1 + 0.12 * party.filter((p) => p.stav !== 'odchazi').length;
  if (hokej.bezi) i *= 0.5;
  return i * nahodneCislo(0.6, 1.3);
}

function trpelivostNasobic() { return HRA.vylepseni.jukebox ? 1.3 : 1; }
// větší objednávka = víc trpělivosti (každé další pivo +14 s)
const trpelivostNaPivo = (parta) => NASTAVENI.trpelivostPivo + 14 * Math.max(0, parta.objednavka.length - 1);

function prijdeParta() {
  const typ = vyberTyp();
  let pocet = nahodne(typ.parta || [1]);
  let mista = null, kde = 'stul';
  const stolickyVolne = volneStolicky();
  if (pocet === 1 && Math.random() < typ.bar && stolickyVolne.length) { mista = [nahodne(stolickyVolne)]; kde = 'bar'; }
  if (!mista) mista = najdiStul(pocet);
  if (!mista && pocet > 1) { pocet = 1; mista = najdiStul(1); }
  if (!mista && stolickyVolne.length) { mista = [nahodne(stolickyVolne)]; kde = 'bar'; pocet = 1; }
  if (!mista) {
    if ([...sedadla, ...stolicky].some((s) => !s.host && spinaveU(s))) nemajiKamCas = casHry;
    return false;
  }
  const parta = {
    id: ++poradiParty, typ, kde, clenove: [], stav: 'prichazi', objednavka: [], text: '', mluvci: null, prevzato: false,
    trpelivost: 1, maxTrpelivost: 1, utrata: 0, dysko: 0, kolo: 1, spokojenost: [], rekl: false, jidla: [], rezervace: null
  };
  for (let i = 0; i < pocet; i++) {
    const zena = Math.random() > typ.muz;
    const host = novaPostava(SVET.venku.x + nahodneCislo(-0.3, 0.3), SVET.venku.z + i * 0.6, novyVzhled(typ, zena));
    Object.assign(host, {
      parta, jmeno: jmenoHosta(typ, zena), misto: mista[i], piva: [], hlaska: null, natoceni: Math.PI,
      casDoNapiti: nahodneCislo(2, 4), napitiDo: 0, start: i * 0.7, posledniPivo: null, carky: 0, jidlo: null, dalsiSousto: 0
    });
    host.sedadloTyp = mista[i].typ;
    mista[i].host = host;
    host.cesta = najdiCestu(host.x, host.z, mista[i].x, mista[i].z);
    parta.clenove.push(host);
    hoste.push(host);
  }
  party.push(parta);
  zvuk.zvonek();
  return true;
}

function rekni(host, text, sekund = 3.2) {
  const typ = host.parta ? host.parta.typ : null;
  host.hlaska = { text: vyplnText(text, typ, host.vzhled.zena), do: casHry + sekund };
  host.mluvi = 1;
}

function nastavTrpelivost(parta, sekund) {
  parta.maxTrpelivost = sekund * trpelivostNasobic();
  parta.trpelivost = parta.maxTrpelivost;
}

const zbyvaDonest = (parta) => parta.objednavka.filter((p) => !p.hotovo);
const aktivniJidla = (parta) => parta.jidla.filter((j) => !['doruceno', 'zruseno'].includes(j.stav));

// Kde na stole (pultu) stojí i-tá sklenice hosta – vedle talíře, směrem od středu stolu
function poziceSklenice(misto, i) {
  const s = misto.sklenice;
  if (misto.typ === 'stolicka') return { x: s.x + i * 0.085, y: s.y, z: s.z };
  const smerX = Math.sign(s.x - misto.x) || 1, smerZ = Math.sign(misto.z - s.z) || 1;
  return { x: s.x + smerX * (i % 2) * 0.075, y: s.y, z: s.z - smerZ * Math.floor(i / 2) * 0.07 };
}
// Kam si dojít pro sklenici po hostovi (u baru zezadu za pultem)
function pristup(misto) {
  return misto.typ === 'stolicka' ? { x: misto.x, z: 1.55 } : { x: misto.x, z: misto.z };
}

function nasobicDyska() {
  return (1 + 0.25 * (HRA.vylepseni.usmev || 0)) * (HRA.vylepseni.televize ? 1.15 : 1) * (0.6 + 0.1 * HRA.hodnoceni);
}

function aktualizujHosty(dt) {
  if (HRA.otevreno) {
    dalsiPartaZa -= dt;
    if (dalsiPartaZa <= 0) dalsiPartaZa = prijdeParta() ? intervalHostu() : 3;
  }
  for (let i = party.length - 1; i >= 0; i--) {
    const parta = party[i];
    parta.clenove.forEach((h) => {
      if (h.hlaska && casHry > h.hlaska.do) h.hlaska = null;
      h.mluvi = Math.max(0, h.mluvi - dt * 0.7);
      const mavat = ((parta.stav === 'vola' || parta.stav === 'plati') && h === parta.mluvci) || casHry < (h.jasotDo || 0);
      h.mava += ((mavat ? 1 : 0) - h.mava) * Math.min(1, dt * 4);
      // vsedě sleduje hráče, když na něco čeká
      if (h.sedi > 0.9 && parta.stav !== 'pije') {
        const k = normalizujUhel(Math.atan2(hrac.x - h.x, hrac.z - h.z) - h.natoceni);
        h.hlavaOtoc += (omez(k, -1, 1) - h.hlavaOtoc) * Math.min(1, dt * 3);
      } else if (parta.stav === 'pije' && parta.clenove.length > 1 && h.mluvi > 0.3) {
        const druhy = parta.clenove.find((x) => x !== h);
        const k = normalizujUhel(Math.atan2(druhy.x - h.x, druhy.z - h.z) - h.natoceni);
        h.hlavaOtoc += (omez(k, -1.2, 1.2) - h.hlavaOtoc) * Math.min(1, dt * 3);
      } else {
        h.hlavaOtoc *= Math.max(0, 1 - dt * 2);
      }
    });
    hlidejJidla(parta);
    switch (parta.stav) {
      case 'prichazi': {
        let vsichni = true;
        parta.clenove.forEach((h) => {
          if (h.start > 0) { h.start -= dt; vsichni = false; return; }
          if (!jdiPoCeste(h, dt)) { vsichni = false; return; }
          h.x = h.misto.x;
          h.z = h.misto.z;
          otocK(h, h.misto.natoceni, dt);
          h.sedi = Math.min(1, h.sedi + dt * 2.5);
          if (h.sedi < 1) vsichni = false;
        });
        if (vsichni) {
          if (parta.kde === 'bar') {
            vytvorObjednavku(parta, false);
            parta.stav = 'ceka_pivo';
            nastavTrpelivost(parta, trpelivostNaPivo(parta));
            rekni(parta.mluvci, parta.text, 5);
          } else {
            parta.stav = 'vola';
            parta.mluvci = nahodne(parta.clenove);
            parta.text = vyplnText(vyberNove(parta.typ.vola, 'vola_' + parta.typ.id, 3), parta.typ, parta.mluvci.vzhled.zena);
            nastavTrpelivost(parta, NASTAVENI.trpelivostObjednavka);
          }
          parta.rekl = false;
        }
        break;
      }
      case 'vola':
      case 'ceka_pivo':
      case 'plati':
        cekani(parta, dt);
        break;
      case 'pije':
        aktualizujPiti(parta, dt);
        break;
      case 'odchazi': {
        let vsichni = true;
        parta.clenove.forEach((h) => {
          if (h.sedi > 0.02) { h.sedi = Math.max(0, h.sedi - dt * 3); vsichni = false; return; }
          if (!jdiPoCeste(h, dt)) vsichni = false;
        });
        if (vsichni) {
          parta.clenove.forEach((h) => {
            const j = hoste.indexOf(h);
            if (j >= 0) hoste.splice(j, 1);
            smazPostavu(h);
          });
          party.splice(i, 1);
        }
        break;
      }
    }
    // jídlo se jí i během čekání na další pivo
    if (parta.stav !== 'odchazi' && parta.stav !== 'prichazi') parta.clenove.forEach((h) => jez(h, dt));
  }
}

// Hlídá, jestli jídlo nečeká moc dlouho (host si postěžuje, pak ho zruší)
function hlidejJidla(parta) {
  if (!parta.jidla.length || parta.stav === 'odchazi') return;
  aktivniJidla(parta).forEach((j) => {
    if (j.stav === 'nese' && j.nosic && j.nosic !== 'hrac') return; // číšník už ho nese
    const cekal = casHry - j.objednano;
    if (cekal > j.trpelivost * 0.65 && !j.stezoval) {
      j.stezoval = true;
      rekni(j.komu, vyberNove(JIDLO_CEKA, 'jidloCeka', 3), 3);
    }
    if (cekal > j.trpelivost) {
      zrusJidlo(j);
      rekni(j.komu, vyberNove(JIDLO_NASTVANY, 'jidloNastvany', 3), 3.5);
      j.komu.vyraz = 'zamraceny';
      parta.spokojenost.push(0.1);
      HRA.hodnoceni = Math.max(1, HRA.hodnoceni - 0.12);
      zvuk.chyba();
    }
  });
}

// Host jí: sousto za soustem, mezi tím pije
function jez(h, dt) {
  const j = h.jidlo;
  if (!j || j.zbyva <= 0) { h.ji = Math.max(0, h.ji - dt * 4); return; }
  const pije = casHry < h.napitiDo || h.pripitek > 0.3;
  if (!pije && casHry >= h.dalsiSousto) {
    h.soustoDo = casHry + 1.1;
    h.dalsiSousto = casHry + nahodneCislo(2.2, 4.2);
  }
  const sousto = casHry < (h.soustoDo || 0);
  h.ji += ((sousto ? 1 : 0) - h.ji) * Math.min(1, dt * 5);
  if (!pije) j.zbyva = Math.max(0, j.zbyva - dt / j.doba);
  if (sousto && h.ji > 0.8) h.mluvi = Math.max(h.mluvi, 0.35); // žvýká
  if (!h.hlaska && Math.random() < dt * 0.02) rekni(h, vyberNove([...JIDLO_JI, ...najdiJidlo(j.id).hlasky], 'ji_' + j.id, 4), 2.6);
  if (j.zbyva <= 0) {
    // dojedeno – talíř zůstane na stole
    const t = h.misto.talir;
    spinave.push({ x: t.x, y: t.y, z: t.z, misto: pristup(h.misto), talir: j.id });
    h.jidlo = null;
    h.ji = 0;
    h.vyraz = 'usmev';
  }
}

function cekani(parta, dt) {
  parta.trpelivost -= dt;
  const pod = parta.trpelivost / parta.maxTrpelivost;
  if (pod < 0.35 && !parta.rekl) {
    parta.rekl = true;
    rekni(nahodne(parta.clenove), vyberNove(parta.typ.ceka, 'ceka_' + parta.typ.id, 3), 3.5);
  }
  parta.clenove.forEach((h) => {
    const zalozit = pod < 0.3 && (h !== parta.mluvci || pod < 0.12) && !h.jidlo;
    h.rucePres += ((zalozit ? 1 : 0) - h.rucePres) * Math.min(1, dt * 3);
    if (!h.hlaska || h.vyraz !== 'usmev') h.vyraz = pod < 0.4 ? 'zamraceny' : 'normal';
  });
  if (parta.trpelivost > 0) return;
  if (parta.stav === 'plati') {
    // nikdo nepřišel – nechají na stole přesně, bez dýška
    HRA.penize += parta.utrata;
    plovouciText(parta.mluvci.x, 2.0, parta.mluvci.z, `+${parta.utrata} Kč`, 'bez dýška');
    rekni(parta.mluvci, nahodne(HLASKY_BEZ_DYSKA), 3);
    parta.spokojenost.push(0.35);
    odejdiParta(parta, false);
  } else {
    rekni(parta.mluvci, vyberNove(parta.typ.nastvany, 'nastvany_' + parta.typ.id, 3), 3.5);
    HRA.odesli += parta.clenove.length;
    if (parta.utrata) HRA.penize += parta.utrata;
    zvuk.chyba();
    odejdiParta(parta, true);
  }
}

function aktualizujPiti(parta, dt) {
  let vsichniDopili = true;
  const pripitek = casHry < (parta.pripitekDo || 0);
  if (parta.cinkZa && casHry >= parta.cinkZa) {
    parta.cinkZa = 0;
    const m = parta.clenove[0];
    zvuk.cink(hlasitostU(m.x, m.z));
    setTimeout(() => zvuk.cink(hlasitostU(m.x, m.z) * 0.8), 90);
  }
  // hned po donesení a pak občas si parta přiťukne
  if (parta.pripitekZa && casHry >= parta.pripitekZa) { parta.pripitekZa = 0; zacniPripitek(parta); }
  else if (!pripitek && parta.clenove.length > 1 && Math.random() < dt * 0.012) zacniPripitek(parta);
  parta.clenove.forEach((h) => {
    h.drziPred = 0;
    h.rucePres = Math.max(0, h.rucePres - dt * 3);
    h.pripitek += ((pripitek && h.piva.some((p) => p.zbyva > 0) ? 1 : 0) - h.pripitek) * Math.min(1, dt * 5);
    if (h.jidlo) vsichniDopili = false;
    // napřed panák na ex, pak pivo
    const pivo = h.piva.find((p) => p.zbyva > 0 && jePanak(p.id)) || h.piva.find((p) => p.zbyva > 0);
    if (!pivo) {
      h.napiti = Math.max(0, h.napiti - dt * 4);
      h.kyvHlavou *= Math.max(0, 1 - dt * 4);
      if (h.napiti > 0.05) vsichniDopili = false;
      return;
    }
    vsichniDopili = false;
    if (pripitek) return;
    h.casDoNapiti -= dt;
    if (h.casDoNapiti <= 0 && h.ji < 0.2) {
      h.napitiDo = casHry + 1.5;
      h.casDoNapiti = nahodneCislo(3, 7);
      if (h.vyraz === 'zamraceny') h.vyraz = 'normal';
    }
    const pije = casHry < h.napitiDo;
    const panak = jePanak(pivo.id);
    h.napiti += ((pije ? 1 : 0) - h.napiti) * Math.min(1, dt * 5);
    h.kyvHlavou += ((pije ? (panak ? -0.42 : -0.14) : 0) - h.kyvHlavou) * Math.min(1, dt * 6);
    if (pije) {
      pivo.zbyva = Math.max(0, pivo.zbyva - dt / (pivo.doba * 0.27));
      if (panak && pivo.zbyva <= 0 && Math.random() < 0.6) { rekni(h, vyberNove(HLASKY_PANAK, 'panak', 3), 2); h.vyraz = 'usmev'; }
    }
    // partička si povídá a občas se zasměje
    if (!pije && parta.clenove.length > 1 && Math.random() < dt * 0.25) h.mluvi = 1;
    if (!pije && !h.hlaska && parta.clenove.length > 1 && Math.random() < dt * 0.015) { rekni(h, vyberNove(HLASKY_SMICH, 'smich', 3), 1.8); h.vyraz = 'usmev'; }
  });
  // na jídlo z kuchyně se čeká
  if (aktivniJidla(parta).length) vsichniDopili = false;
  if (!vsichniDopili) return;
  // prázdné sklenice zůstanou na stole (nebo na pultu)
  parta.clenove.forEach((h) => {
    h.piva.forEach((p, k) => {
      const s = poziceSklenice(h.misto, k);
      spinave.push({ x: s.x, y: s.y, z: s.z, misto: pristup(h.misto), pivo: p.id });
    });
    h.piva = [];
  });
  const sanceKolo = parta.typ.dalsiKolo * Math.pow(0.8, parta.kolo - 1);
  if (HRA.otevreno && parta.kolo < 4 && Math.random() < sanceKolo) {
    parta.kolo++;
    if (parta.kde === 'bar') {
      vytvorObjednavku(parta, true);
      parta.stav = 'ceka_pivo';
      nastavTrpelivost(parta, trpelivostNaPivo(parta));
      rekni(parta.mluvci, parta.text, 5);
    } else {
      parta.stav = 'vola';
      parta.prevzato = false;
      parta.mluvci = nahodne(parta.clenove);
      parta.text = vyplnText(vyberNove(parta.typ.vola, 'vola_' + parta.typ.id, 3), parta.typ, parta.mluvci.vzhled.zena);
      nastavTrpelivost(parta, NASTAVENI.trpelivostObjednavka);
    }
  } else if (parta.kde === 'bar') {
    rekni(parta.mluvci, vyberNove(parta.typ.odchazi, 'odchazi_' + parta.typ.id, 3), 3);
    odejdiParta(parta, false);
  } else {
    parta.stav = 'plati';
    parta.mluvci = nahodne(parta.clenove);
    parta.text = vyplnText(vyberNove(parta.typ.plati, 'plati_' + parta.typ.id, 3), parta.typ, parta.mluvci.vzhled.zena);
    nastavTrpelivost(parta, NASTAVENI.trpelivostPlaceni);
  }
  parta.rekl = false;
}

function odejdiParta(parta, nastvany) {
  parta.stav = 'odchazi';
  parta.rezervace = null;
  const prumer = parta.spokojenost.length ? parta.spokojenost.reduce((a, b) => a + b, 0) / parta.spokojenost.length : 0.6;
  const skore = nastvany ? 0 : prumer;
  HRA.hodnoceni = omez(HRA.hodnoceni * 0.85 + (1 + 4 * skore) * 0.15, 1, 5);
  if (!nastvany) HRA.hostu += parta.clenove.length;
  // jídlo, které ještě nedošlo, se zruší
  aktivniJidla(parta).forEach(zrusJidlo);
  parta.clenove.forEach((h, k) => {
    // nedopité pivo a nedojedené jídlo nechají na stole
    h.piva.forEach((p, k) => {
      const s = poziceSklenice(h.misto, k);
      spinave.push({ x: s.x, y: s.y, z: s.z, misto: pristup(h.misto), pivo: p.id, zbyva: p.zbyva });
    });
    h.piva = [];
    if (h.jidlo) {
      const t = h.misto.talir;
      spinave.push({ x: t.x, y: t.y, z: t.z, misto: pristup(h.misto), talir: h.jidlo.id, mnozstvi: h.jidlo.zbyva });
      h.jidlo = null;
    }
    h.ji = 0;
    if (h.misto) { h.misto.host = null; h.misto.carky = 0; }
    h.vyraz = nastvany ? 'zamraceny' : 'usmev';
    h.mava = 0;
    h.rucePres = 0;
    h.napiti = 0;
    h.start = k * 0.5;
    h.cesta = najdiCestu(h.misto ? h.misto.x : h.x, h.misto ? h.misto.z : h.z, SVET.venku.x, SVET.venku.z + 0.4);
    h.misto = null;
  });
  ulozHru();
}

/* ---------- Obsluha: totéž umí hráč i personál (kdo = pomocník, nebo null = hráč) ---------- */
function prevezmiObjednavku(parta, kdo) {
  vytvorObjednavku(parta, parta.kolo > 1);
  parta.stav = 'ceka_pivo';
  parta.rezervace = null;
  parta.spokojenost.push(0.9 + 0.1 * (parta.trpelivost / parta.maxTrpelivost));
  nastavTrpelivost(parta, trpelivostNaPivo(parta));
  rekni(parta.mluvci, parta.text, 6);
  parta.rekl = false;
  parta.zapsal = kdo ? kdo.def.jmeno : null;
  if (kdo) HRA.personalObjednavek = (HRA.personalObjednavek || 0) + 1;
  else zvuk.klik();
}

function vyberPenize(parta, kdo) {
  const celkem = parta.utrata + parta.dysko;
  HRA.penize += celkem;
  if (!kdo) HRA.navod.platil = true;
  else HRA.personalVybrano = (HRA.personalVybrano || 0) + celkem;
  const x = kdo ? kdo.x : parta.mluvci.x, z = kdo ? kdo.z : parta.mluvci.z;
  plovouciText(x, 2.0, z, `+${celkem} Kč`, parta.dysko ? `z toho dýško ${parta.dysko} Kč` : '');
  rekni(parta.mluvci, vyberNove(HLASKY_ZAPLACENO, 'zaplaceno', 3), 3);
  parta.spokojenost.push(0.8 + 0.2 * (parta.trpelivost / parta.maxTrpelivost));
  zvuk.kasa(kdo ? hlasitostU(x, z) : 1);
  odejdiParta(parta, false);
}

/* ---------- Co se stane, když hráč obslouží hosta ---------- */
function obsluzHosta(host) {
  const parta = host.parta;
  // jídlo pro tuhle partu má přednost
  const iJidla = ruce.piva.findIndex((x) => x.listek && x.listek.parta === parta && x.listek.stav === 'nese');
  if (iJidla >= 0 && ['ceka_pivo', 'pije', 'vola'].includes(parta.stav)) {
    const [it] = ruce.piva.splice(iJidla, 1);
    dorucJidlo(it.listek, null);
    return;
  }
  switch (parta.stav) {
    case 'vola':
      prevezmiObjednavku(parta, null);
      break;
    case 'ceka_pivo':
      podejPivoParte(parta, host);
      break;
    case 'plati':
      vyberPenize(parta, null);
      break;
    case 'pije':
      if (ruce.piva.some((x) => x.listek)) { rekni(host, vyberNove(['Tohle jsme si neobjednali.', 'To není naše jídlo, {j}.', 'Jídlo je pro jiný stůl.'], 'cizijidlo', 2), 2.5); zvuk.chyba(); break; }
      rekni(host, nahodne(['Na zdraví!', 'Díky, zatím dobrý.', 'Je to dobrý, {j}!', 'Hezky se tu sedí.']), 2.5);
      break;
  }
}

function podejPivoParte(parta, host) {
  const napoje = ruce.piva.filter((x) => !x.listek);
  const zbyva = zbyvaDonest(parta);
  const i = napoje.findIndex((n) => zbyva.some((p) => p.pivo === n.id));
  if (i < 0) {
    if (ruce.piva.length) {
      const chteji = [...new Set(zbyva.map((p) => najdiPivo(p.pivo).kratce))].join(' a ');
      rekni(host, vyberNove(HLASKY_SPATNE, 'spatne', 3) + ' Chceme ' + chteji + '.', 3.5);
      host.vyraz = 'zamraceny';
      zvuk.chyba();
    } else {
      rekni(parta.mluvci, parta.text, 4);
    }
    return;
  }
  const napoj = napoje[i];
  ruce.piva.splice(ruce.piva.indexOf(napoj), 1);
  dorucNapoj(parta, host, napoj, null);
}

// Doručí jeden nápoj partě (vrací false, když ho nikdo z party nechce)
function dorucNapoj(parta, host, napoj, kdo) {
  const zbyva = zbyvaDonest(parta).sort((a, b) => (a.komu === host ? -1 : 0) - (b.komu === host ? -1 : 0));
  const polozka = zbyva.find((p) => p.pivo === napoj.id);
  if (!polozka) return false;
  polozka.hotovo = true;
  polozka.kvalita = napoj.kvalita;
  const komu = polozka.komu;
  const panak = jePanak(napoj.id);
  komu.piva.push({ id: napoj.id, zbyva: 1, doba: panak ? 2.4 : nahodneCislo(...NASTAVENI.pitiZaPivo), plneni: napoj.plneni });
  if (!panak) komu.posledniPivo = napoj.id;
  HRA.obslouzeno++;
  const vyuzito = 1 - parta.trpelivost / parta.maxTrpelivost;
  const h = HODNOCENI[napoj.kvalita];
  parta.spokojenost.push(h.spokojenost * (1 - 0.4 * vyuzito));
  const p = najdiPivo(napoj.id);
  let dysko = Math.round((h.dysko + (vyuzito < 0.5 ? 5 : 0)) * nasobicDyska() * (panak ? 0.6 : 1));
  // pivní znalec: perfektní hladinka = velké dýško a lepší pověst hospody
  if (parta.typ.znalec && !panak) {
    if (napoj.kvalita === 'perfekt') {
      dysko += Math.round(40 * nasobicDyska());
      HRA.hodnoceni = Math.min(5, HRA.hodnoceni + 0.25);
      HRA.znalcu = (HRA.znalcu || 0) + 1;
      ukazToast('🎩 Pivní znalec je nadšený! Hodnocení hospody stoupá.', 3200);
    } else {
      HRA.hodnoceni = Math.max(1, HRA.hodnoceni - 0.2);
      ukazToast('🎩 Znalec si zapsal výtku – chtěl perfektní hladinku.', 3200);
    }
  }
  if (parta.kde === 'bar') {
    HRA.penize += p.cena + dysko;
    plovouciText(komu.x, 2.0, komu.z, `+${p.cena + dysko} Kč`, dysko ? `dýško ${dysko} Kč` : '');
    zvuk.kasa(kdo ? hlasitostU(komu.x, komu.z) : 1);
  } else {
    parta.utrata += p.cena;
    parta.dysko += dysko;
    komu.misto.carky = (komu.misto.carky || 0) + 1;
    zvuk.cink(kdo ? hlasitostU(komu.x, komu.z) : 1);
  }
  const dobre = napoj.kvalita === 'perfekt' || napoj.kvalita === 'dobre';
  const dekovani = dobre ? vyberNove(parta.typ.dekuje, 'dekuje_' + parta.typ.id, 3)
    : parta.typ.znalec && !panak ? vyberNove(HLASKY_ZNALEC_SPATNE, 'znalec', 3) : vyberNove(HLASKY_NIC_MOC, 'nicmoc', 3);
  rekni(komu, dekovani, 3);
  komu.vyraz = dobre ? 'usmev' : 'normal';
  if (!zbyvaDonest(parta).length) {
    parta.stav = 'pije';
    parta.rekl = false;
    parta.rezervace = null;
    parta.clenove.forEach((x) => { x.casDoNapiti = nahodneCislo(1, 3); x.rucePres = 0; });
    if (parta.runda) { HRA.rund = (HRA.rund || 0) + 1; parta.runda = null; }
    // všechno je na stole – přípitek
    if (parta.clenove.length > 1) parta.pripitekZa = casHry + 0.6;
  }
  ulozHru();
  return true;
}

// Doručí talíř z kuchyně hostovi, který si ho objednal
function dorucJidlo(listek, kdo) {
  const parta = listek.parta, komu = listek.komu, j = listek.jidlo;
  listek.stav = 'doruceno';
  listek.nosic = null;
  odeberZKuchyne(listek);
  const cekal = casHry - listek.objednano;
  const vyuzito = omez(cekal / listek.trpelivost, 0, 1);
  const studene = listek.studene;
  komu.jidlo = { id: j.id, zbyva: 1, doba: nahodneCislo(38, 62), studene };
  komu.dalsiSousto = casHry + 1.5;
  const spokojenost = (studene ? 0.45 : 1) * (1 - 0.45 * vyuzito);
  parta.spokojenost.push(spokojenost);
  let dysko = studene ? 0 : Math.round((8 + (vyuzito < 0.5 ? 8 : 0)) * nasobicDyska());
  HRA.jidel = (HRA.jidel || 0) + 1;
  HRA.jidlaDruhy = HRA.jidlaDruhy || {};
  HRA.jidlaDruhy[j.id] = (HRA.jidlaDruhy[j.id] || 0) + 1;
  if (parta.kde === 'bar') {
    HRA.penize += j.cena + dysko;
    plovouciText(komu.x, 2.0, komu.z, `+${j.cena + dysko} Kč`, dysko ? `dýško ${dysko} Kč` : '');
    zvuk.kasa(kdo ? hlasitostU(komu.x, komu.z) : 1);
  } else {
    parta.utrata += j.cena;
    parta.dysko += dysko;
    zvuk.talir(kdo ? hlasitostU(komu.x, komu.z) : 1);
  }
  const text = studene ? vyberNove(JIDLO_STUDENE, 'studene', 2)
    : parta.typ.cizinec ? vyberNove(JIDLO_DEKUJE_CIZINEC, 'dekujeJidloCiz', 2) : vyberNove(JIDLO_DEKUJE, 'dekujeJidlo', 4);
  rekni(komu, text, 3);
  komu.vyraz = studene ? 'normal' : 'usmev';
  // pára z horkého jídla
  if (!studene) komu.paraDo = casHry + 9;
  ulozHru();
}

/* ---------- Dveře se otevírají, když jimi někdo prochází ---------- */
const dvere = { uhel: 0 };
function aktualizujDvere(dt) {
  const dx = (SVET.dvere.x0 + SVET.dvere.x1) / 2;
  const blizko = hoste.some((x) => Math.abs(x.x - dx) < 1.2 && Math.abs(x.z - SVET.hloubka) < 1.3);
  dvere.uhel += ((blizko ? 1.45 : 0) - dvere.uhel) * Math.min(1, dt * 5);
}
/* =========================================================
   17) ČEPOVÁNÍ, SUDY, RUCE A VĚCI, NA KTERÉ SE DÁ SÁHNOUT
   ========================================================= */
const kohouty = PIVA.map((pivo) => ({ pivo, x: pivo.x, sklenice: null, packa: 0 }));
// piva: co neseš hostům [{ id, kvalita, plneni, listek? }] (listek = talíř z kuchyně)
// sklenice: prázdné nádobí (id nápoje, nebo 'talir:<id jídla>')
const ruce = { piva: [], sklenice: [] };
let cepuje = null;                         // kohout, u kterého právě teče pivo
let cil = null;                            // na co se hráč dívá
let cisteSklenice = NASTAVENI.cisteSklenice;
let narazeni = null;                       // výměna sudu, která právě probíhá
const dodavky = [];                        // objednané sudy na cestě { id, za }

const najdiPivo = (id) => NAPOJE.find((p) => p.id === id);
const jeTalir = (x) => typeof x === 'string' && x.startsWith('talir:');
const jeNaCepu = (p) => p.odemknout === 0 || (HRA.odemcena || []).includes(p.id);
const kapacitaRegalu = () => NASTAVENI.cisteSklenice + 6 * (HRA.vylepseni.sklenice || 0);
const kapacitaSudu = () => NASTAVENI.kapacitaSudu + 10 * (HRA.vylepseni.sudy || 0);
const unosnostPiv = () => NASTAVENI.unosnostPiv + 2 * (HRA.vylepseni.tac || 0);
const unosnostSklenic = () => NASTAVENI.unosnostSklenic + 3 * (HRA.vylepseni.tac || 0);
const zaPultem = () => hrac.z < SVET.pult.z0 && hrac.x < SVET.prepazka;
const veSkladu = () => hrac.x > SVET.prepazka + 0.1 && hrac.x < SVET.kuchyne.x0 - 0.1 && hrac.z < SVET.sklad.z1;
const vKuchyni = () => hrac.x > SVET.kuchyne.x0 && hrac.z < SVET.kuchyne.z1;
const sud = (id) => HRA.sudy[id] || (HRA.sudy[id] = { zbyva: kapacitaSudu(), zasoba: 1 });
const nesesJidlo = () => ruce.piva.some((x) => x.listek);

function tolerance() {
  const r = HRA.vylepseni.ruka || 0;
  return { perfekt: NASTAVENI.tolerancePerfekt + 0.8 * r, dobre: NASTAVENI.toleranceDobre + 0.6 * r };
}

/* ---------- Na co se hráč dívá ---------- */
function najdiCil() {
  const o = polohaOci();
  const d = smerPohledu();
  const kandidati = [];
  const zkus = (t, dosah, data) => { if (t !== null && t <= dosah) kandidati.push({ t, data }); };
  const P = SVET.pult.y;
  if (zaPultem()) {
    kohouty.forEach((k) => {
      if (jeNaCepu(k.pivo)) zkus(paprsekKvadr(o, d, [k.x - 0.13, P, 1.95], [k.x + 0.13, P + 0.58, 2.42]), NASTAVENI.dosah, { typ: 'kohout', kohout: k });
    });
    const dr = SVET.drez;
    zkus(paprsekKvadr(o, d, [dr.x - 0.45, 0.7, 0], [dr.x + 0.45, 1.35, 0.62]), NASTAVENI.dosah, { typ: 'drez' });
    const r = SVET.regal;
    zkus(paprsekKvadr(o, d, [r.x0, 0.95, 0.05], [r.x1, 1.25, 0.55]), NASTAVENI.dosah, { typ: 'regal' });
    lahve.forEach((l) => {
      if (jeNaCepu(l.panak)) zkus(paprsekKvadr(o, d, [l.x - 0.125, 0.95, 0.04], [l.x + 0.125, 1.4, 0.6]), NASTAVENI.dosah, { typ: 'lahev', lahev: l });
    });
    const rp = SVET.regalPanaku;
    zkus(paprsekKvadr(o, d, [rp.x0, 0.95, 0.06], [rp.x1, 1.12, 0.54]), NASTAVENI.dosah, { typ: 'regalPanaku' });
  }
  if (veSkladu() || (hrac.x > SVET.prepazka - 0.8 && hrac.z < SVET.sklad.z1 + 0.5)) {
    PIVA.forEach((p, i) => {
      if (!jeNaCepu(p)) return;
      const { x, z, stena } = SVET.sudPoz(i);
      const box = stena === 'sever' ? [[x - 0.18, 0.1, 0.15], [x + 0.18, 0.85, 0.62]] : [[x - 0.24, 0.1, z - 0.18], [x + 0.2, 0.85, z + 0.18]];
      zkus(paprsekKvadr(o, d, box[0], box[1]), NASTAVENI.dosah, { typ: 'sud', pivo: p });
    });
    zkus(paprsekKvadr(o, d, [11.2, 0, 1.85], [12.97, 1.2, SVET.sklad.z1]), NASTAVENI.dosah, { typ: 'paleta' });
  }
  // výdej pro číšníky na konci pultu (z obou stran)
  const v = SVET.vydej;
  zkus(paprsekKvadr(o, d, [v.x0, P - 0.04, v.z0], [v.x1, P + 0.26, v.z1]), NASTAVENI.dosah, { typ: 'vydej' });
  // výdejní okénko kuchyně a talíře na něm
  if (maKuchyni()) {
    const k = SVET.kuchyne, ok = k.okenko;
    zkus(paprsekKvadr(o, d, [ok.x0, SVET.okenkoY - 0.05, k.z1 - 0.15], [ok.x1, SVET.okenkoY + 0.3, k.stena + 0.26]), NASTAVENI.dosah + 0.2, { typ: 'okenko' });
    kuchyne.okenko.forEach((l) => {
      const p = polohaNaOkenku(l.slot);
      zkus(paprsekKoule(o, d, [p.x, p.y + 0.03, p.z], 0.12), NASTAVENI.dosah + 0.2, { typ: 'talirOkenko', listek: l });
    });
  }
  hoste.forEach((h) => {
    const s = h.parta.stav;
    if (h.sedi < 0.9 || !['vola', 'ceka_pivo', 'plati', 'pije'].includes(s)) return;
    const y0 = h.sedadloTyp === 'stolicka' ? 0.75 : 0.45;
    zkus(paprsekKvadr(o, d, [h.x - 0.3, y0, h.z - 0.3], [h.x + 0.3, y0 + 1.05, h.z + 0.3]), NASTAVENI.dosahHost, { typ: 'host', host: h });
  });
  [...personal, ...(kuchyne.kucharka ? [kuchyne.kucharka] : [])].forEach((a) => {
    zkus(paprsekKvadr(o, d, [a.x - 0.25, 0.3, a.z - 0.25], [a.x + 0.25, 1.85, a.z + 0.25]), 4, { typ: 'pomocnik', pomocnik: a });
  });
  spinave.forEach((s) => zkus(paprsekKoule(o, d, [s.x, s.y + (s.talir ? 0.03 : 0.09), s.z], s.talir ? 0.14 : 0.15), NASTAVENI.dosah, { typ: 'spinava', sklenice: s }));
  zkus(paprsekKvadr(o, d, [kocka.x - 0.24, 0, kocka.z - 0.24], [kocka.x + 0.24, 0.36, kocka.z + 0.24]), NASTAVENI.dosah, { typ: 'kocka' });
  const k = SVET.kniha;
  zkus(paprsekKvadr(o, d, [k.x - 0.28, P - 0.05, k.z - 0.22], [k.x + 0.28, P + 0.22, k.z + 0.22]), NASTAVENI.dosah, { typ: 'kniha' });
  const c = SVET.cedule;
  zkus(paprsekKvadr(o, d, [c.x - 0.3, c.y - 0.2, c.z - 0.12], [c.x + 0.3, c.y + 0.2, c.z + 0.06]), NASTAVENI.dosah, { typ: 'cedule' });
  if (!kandidati.length) return null;
  kandidati.sort((a, b) => a.t - b.t);
  const jeHost = (x) => x.data.typ === 'host';
  // s jídlem v ruce má přednost host z party, které jídlo patří
  if (nesesJidlo()) {
    const h = kandidati.find((x) => jeHost(x) && ruce.piva.some((p) => p.listek && p.listek.parta === x.data.host.parta));
    if (h) return h.data;
  }
  // s pivem v ruce má přednost host, který právě tohle pivo chce, se sklenicemi dřez
  if (ruce.piva.some((x) => !x.listek)) {
    const chce = (x) => jeHost(x) && x.data.host.parta.stav === 'ceka_pivo' && zbyvaDonest(x.data.host.parta).some((o2) => ruce.piva.some((p) => p.id === o2.pivo));
    // když míříš přímo na knihu, host za ní ji „nepřebije“ – jen když chce právě tohle pivo
    const naKnihu = kandidati[0].data.typ === 'kniha';
    const h = kandidati.find(chce) || (naKnihu ? null : kandidati.find((x) => jeHost(x) && x.data.host.parta.stav === 'ceka_pivo'));
    if (h) return h.data;
    const vy = kandidati.find((x) => x.data.typ === 'vydej');
    if (vy && pocetCisniku()) return vy.data;
  }
  if (ruce.sklenice.length || ruce.piva.length) {
    const drez = kandidati.find((x) => x.data.typ === 'drez');
    if (drez) return drez.data;
  }
  // host, u kterého teď není co dělat (pije, nebo čeká na pivo a ty žádné neneseš),
  // nepřekáží: když je hned za ním něco užitečného (jiný host, sklenice), vybere se to
  const prvni = kandidati[0];
  const nicNechce = (x) => jeHost(x) && (x.data.host.parta.stav === 'pije' || (x.data.host.parta.stav === 'ceka_pivo' && !ruce.piva.length));
  // kniha, regál, paleta a pomocníci mají přednost jen tehdy, když těsně za nimi není nic důležitějšího
  const vedlejsi = (x) => nicNechce(x) || ['kniha', 'regal', 'regalPanaku', 'paleta', 'kocka', 'pomocnik', 'okenko'].includes(x.data.typ);
  if (vedlejsi(prvni)) {
    const jiny = kandidati.find((x) => !vedlejsi(x) && x.t - prvni.t < (jeHost(prvni) || prvni.data.typ === 'pomocnik' ? 0.9 : 0.45));
    if (jiny) return jiny.data;
  }
  return prvni.data;
}

// Text výzvy dole uprostřed obrazovky
function popisCile(c) {
  if (!c) return '';
  switch (c.typ) {
    case 'kohout': {
      const p = c.kohout.pivo;
      if (cepuje === c.kohout) return `Čepuješ ${p.nazev}…`;
      if (ruce.sklenice.length) return '🧽 Nejdřív odnes prázdné nádobí do dřezu';
      if (!c.kohout.sklenice && ruce.piva.length >= unosnostPiv()) return '✋ Víc toho neuneseš – nejdřív roznes, co máš';
      if (!c.kohout.sklenice && sud(p.id).zbyva <= 0) return `🛢️ Sud ${p.nazev} je prázdný – narazi nový ve skladu`;
      if (!c.kohout.sklenice && cisteSklenice <= 0) return '🍺 Došly čisté sklenice! Posbírej prázdné po hostech';
      return `${c.kohout.sklenice ? 'Drž a dočepuj' : 'Drž a čepuj'} ${p.nazev} · v sudu ${sud(p.id).zbyva}`;
    }
    case 'host': {
      const h = c.host, parta = h.parta;
      const jidlo = ruce.piva.find((x) => x.listek && x.listek.parta === parta);
      if (jidlo) return `Podat ${jidlo.listek.jidlo.kratce} – ${jidlo.listek.komu.jmeno}`;
      if (parta.stav === 'vola') return `Převzít objednávku – ${h.jmeno}${parta.clenove.length > 1 ? ' a spol.' : ''}`;
      if (parta.stav === 'plati') return `Vybrat peníze – ${parta.utrata + parta.dysko} Kč`;
      const ceka = aktivniJidla(parta).filter((j) => j.komu === h);
      if (parta.stav === 'pije') return ceka.length ? `${h.jmeno} – čeká na ${ceka[0].jidlo.kratce}` : h.jidlo ? `${h.jmeno} – jí` : `${h.jmeno} – pije`;
      const zbyva = zbyvaDonest(parta).map((p) => najdiPivo(p.pivo).kratce);
      if (ruce.piva.some((p) => !p.listek && zbyvaDonest(parta).some((x) => x.pivo === p.id))) return `Podat pivo – ${h.jmeno}`;
      return `Chtějí: ${zbyva.join(', ')}`;
    }
    case 'spinava':
      if (ruce.piva.length) return '✋ Máš plné ruce';
      if (ruce.sklenice.length >= unosnostSklenic()) return '✋ Víc nádobí neuneseš';
      return c.sklenice.talir ? 'Sebrat prázdný talíř' : 'Sebrat prázdnou sklenici';
    case 'drez':
      if (ruce.sklenice.length) return `Umýt nádobí (${ruce.sklenice.length})`;
      if (ruce.piva.some((x) => x.listek && x.listek.stav === 'zruseno')) return 'Vyhodit jídlo, které už nikdo nechce';
      if (ruce.piva.some((x) => !x.listek)) return 'Vylít nápoj do dřezu';
      return 'Dřez – sem nos prázdné sklenice a talíře';
    case 'regal': return `Čisté sklenice: ${cisteSklenice} z ${kapacitaRegalu()}`;
    case 'regalPanaku': return `Čisté panákovky: ${cistePanakovky} z ${kapacitaPanakovek()}`;
    case 'lahev': {
      const l = c.lahev, p = l.panak;
      if (nalevaLahev === l) return `Naléváš ${p.akuzativ}…`;
      if (cepuje) return '';
      if (ruce.sklenice.length) return '🧽 Nejdřív odnes prázdné nádobí do dřezu';
      if (!l.sklenka && ruce.piva.length >= unosnostPiv()) return '✋ Víc neuneseš – nejdřív roznes, co máš';
      if (!l.sklenka && cistePanakovky <= 0) return '🥃 Došly čisté panákovky! Posbírej prázdné po hostech';
      return `${l.sklenka ? 'Drž a dolij' : 'Drž a nalij'} ${p.akuzativ} po čárku`;
    }
    case 'vydej': {
      const napoje = ruce.piva.filter((x) => !x.listek).length;
      if (!pocetCisniku()) return 'Výdej pro číšníky (najmeš je v knize)';
      if (napoje) return `Položit na výdej pro číšníky (${napoje})`;
      return vydej.length ? `Na výdeji: ${vydej.length} · vzít zpátky` : 'Výdej – sem polož nápoje pro číšníky';
    }
    case 'okenko': {
      const talire = ruce.sklenice.filter(jeTalir).length;
      if (talire) return `Vrátit ${talire} ${talire === 1 ? 'talíř' : talire < 5 ? 'talíře' : 'talířů'} do kuchyně`;
      if (ruce.piva.some((x) => x.listek && x.listek.stav === 'zruseno')) return 'Vrátit nechtěné jídlo do kuchyně';
      if (!kuchyne.okenko.length) return `🍳 Kuchyně: ${kuchyne.fronta.length ? `vaří se ${kuchyne.fronta.length}` : 'nic se nevaří'}`;
      const l = [...kuchyne.okenko].sort((a, b) => a.naOkenkuOd - b.naOkenkuOd)[0];
      return `Vzít z okénka: ${l.jidlo.kratce} → ${l.stul}`;
    }
    case 'talirOkenko': {
      const l = c.listek;
      if (ruce.sklenice.length) return '🧽 Nejdřív odnes prázdné nádobí';
      if (ruce.piva.length >= unosnostPiv()) return '✋ Víc toho neuneseš';
      return `Vzít ${l.jidlo.kratce} → ${l.stul}${l.studene ? ' (už chladne!)' : ''}`;
    }
    case 'pomocnik': {
      const a = c.pomocnik;
      const role = a.def.role ? ROLE_PERSONALU[a.def.role].nazev.toLowerCase() : 'kuchařka';
      return `${a.jmeno} (${role}) – ${a.status}`;
    }
    case 'kniha': return 'Otevřít knihu vylepšení';
    case 'kocka': return kocka.pohlazeno > 1 ? 'Mourek spokojeně přede' : (kocka.lehne > 0.6 ? 'Pohladit Mourka (spí)' : 'Pohladit kocoura Mourka');
    case 'cedule': return HRA.otevreno ? 'Otočit na ZAVŘENO (noví hosté nepřijdou)' : 'Otočit na OTEVŘENO';
    case 'sud': {
      const s = sud(c.pivo.id);
      if (narazeni && narazeni.pivo === c.pivo) return `Narážím sud ${c.pivo.nazev}…`;
      if (s.zbyva > 0) return `Sud ${c.pivo.nazev}: ${s.zbyva} z ${kapacitaSudu()} piv · zásoba ${s.zasoba}`;
      return s.zasoba > 0 ? `Drž a narazi nový sud ${c.pivo.nazev} (zásoba ${s.zasoba})` : `Žádný náhradní sud ${c.pivo.nazev} – objednej ho v knize`;
    }
    case 'paleta': {
      const zasoby = PIVA.filter(jeNaCepu).map((p) => `${p.kratce} ${sud(p.id).zasoba}`).join(' · ');
      return `Náhradní sudy: ${zasoby}`;
    }
    default: return '';
  }
}

/* ---------- Akce (E / levé tlačítko / tlačítko na mobilu) ---------- */
function akceStisk() {
  vstup.akceDrzena = true;
  if (REZIM !== 'hra' || !cil) return;
  switch (cil.typ) {
    case 'kohout': zacniCepovat(cil.kohout); break;
    case 'host': obsluzHosta(cil.host); break;
    case 'spinava': seberSklenici(cil.sklenice); break;
    case 'drez': pouzijDrez(); break;
    case 'regal': ukazToast(`V regálu je ${cisteSklenice} čistých sklenic z ${kapacitaRegalu()}.`); break;
    case 'regalPanaku': ukazToast(`Čistých panákovek je ${cistePanakovky} z ${kapacitaPanakovek()}.`); break;
    case 'lahev': zacniNalevat(cil.lahev); break;
    case 'vydej': pouzijVydej(); break;
    case 'okenko': pouzijOkenko(); break;
    case 'talirOkenko':
      if (ruce.sklenice.filter(jeTalir).length) pouzijOkenko(); else vezmiZOkenka(cil.listek);
      break;
    case 'pomocnik': {
      const a = cil.pomocnik;
      rekni(a, vyberNove(['Jo, šéfe!', 'Všechno v pohodě.', 'Makám, makám!', 'Dneska je tu narváno!', 'Klidně, zvládnem to.'], 'pomocnik', 3), 2.2);
      break;
    }
    case 'kniha': otevriKnihu(); break;
    case 'kocka': pohladKocku(); break;
    case 'sud': zacniNarazet(cil.pivo); break;
    case 'paleta': ukazToast('🛢️ Náhradní sudy objednáš v knize vylepšení (záložka Sklad).'); break;
    case 'cedule':
      HRA.otevreno = !HRA.otevreno;
      if (HRA.otevreno) { dalsiPartaZa = Math.min(dalsiPartaZa, 2.5); ukazToast('🔔 Otevřeno! Hosté se můžou hrnout dovnitř.'); }
      else ukazToast('🔒 Zavřeno – noví hosté nepřijdou. Kdo je uvnitř, ten dopije.');
      zvuk.klik();
      ulozHru();
      break;
  }
}

function akceUvolni() {
  vstup.akceDrzena = false;
  if (cepuje) dokonciCepovani();
  if (nalevaLahev) dokonciNalevani();
  narazeni = null;
}

// Okénko kuchyně: vrátit nádobí, vrátit nechtěné jídlo, nebo vzít hotový talíř
function pouzijOkenko() {
  const talire = ruce.sklenice.filter(jeTalir);
  if (talire.length) {
    ruce.sklenice = ruce.sklenice.filter((x) => !jeTalir(x));
    HRA.umyto += talire.length;
    ukazToast(`🍽️ Talíře vráceny do kuchyně (${talire.length}). Kuchařka je umyje.`);
    zvuk.talir(1);
    return;
  }
  if (vratJidloDoKuchyne()) return;
  vezmiZOkenka(null);
}

function zacniCepovat(k) {
  if (cepuje || nalevaLahev) return;
  if (ruce.sklenice.length) { ukazToast('🧽 S prázdným nádobím v ruce čepovat nejde.'); return; }
  if (!k.sklenice) {
    if (ruce.piva.length >= unosnostPiv()) { ukazToast(HRA.vylepseni.tac ? '✋ Víc toho neuneseš.' : '✋ Víc než dvě věci v rukou neuneseš. Kup si v knize tác!'); return; }
    const s = sud(k.pivo.id);
    if (s.zbyva <= 0) { ukazToast(`🛢️ Sud ${k.pivo.nazev} je prázdný! Jdi do skladu za barem a narazi nový.`); zvuk.prskani(); return; }
    if (cisteSklenice <= 0) { ukazToast('🍺 Došly čisté sklenice! Posbírej prázdné po hostech a umyj je v dřezu.'); return; }
    cisteSklenice--;
    s.zbyva--;
    k.sklenice = { plneni: 0, rychlost: nahodneCislo(0.9, 1.15) };
  }
  cepuje = k;
  zvuk.cepovani(true);
}

function aktualizujCepovani(dt) {
  kohouty.forEach((k) => { k.packa += ((cepuje === k ? 1 : 0) - k.packa) * Math.min(1, dt * 12); });
  aktualizujSudy(dt);
  if (!cepuje) return;
  const k = cepuje;
  if (vzdalenost(hrac.x, hrac.z, k.x, SVET.kohoutZ) > 2.2 || REZIM !== 'hra') { dokonciCepovani(); return; }
  k.sklenice.plneni += NASTAVENI.rychlostCepovani * k.sklenice.rychlost * (1 + 0.15 * (HRA.vylepseni.kohout || 0)) * dt;
  if (k.sklenice.plneni >= NASTAVENI.maxPreteceni) {
    cepuje = null;
    zvuk.cepovani(false);
    k.sklenice.plneni = 0;
    HRA.prelito++;
    ukazHodnoceni('💦 Přelité! Pivo teče po sklenici – zkus to znovu', 'spatne');
    zvuk.chyba();
  }
}

function dokonciCepovani() {
  const k = cepuje;
  cepuje = null;
  zvuk.cepovani(false);
  if (!k || !k.sklenice) return;
  const p = k.sklenice.plneni;
  if (p < NASTAVENI.minHotove) {
    if (p > 3) ukazHodnoceni('Ještě to není plné – drž a dočepuj', 'info');
    return;
  }
  const cilH = NASTAVENI.cilHladiny;
  const t = tolerance();
  let kvalita;
  if (Math.abs(p - cilH) <= t.perfekt) kvalita = 'perfekt';
  else if (Math.abs(p - cilH) <= t.dobre) kvalita = 'dobre';
  else kvalita = p > cilH ? 'pena' : 'malo';
  ruce.piva.push({ id: k.pivo.id, kvalita, plneni: p });
  HRA.nejvicNaTacu = Math.max(HRA.nejvicNaTacu || 0, ruce.piva.length);
  k.sklenice = null;
  HRA.natoceno++;
  if (kvalita === 'perfekt') {
    HRA.perfektnich++;
    HRA.serie++;
    HRA.nejSerie = Math.max(HRA.nejSerie, HRA.serie);
    if ([3, 5, 10, 15, 20, 30, 50, 75, 100].includes(HRA.serie)) {
      ukazToast(`🔥 ${HRA.serie} ${HRA.serie < 5 ? 'perfektní hladinky' : 'perfektních hladinek'} v řadě!`);
    }
  } else {
    HRA.serie = 0;
  }
  ukazHodnoceni(HODNOCENI[kvalita].text, HODNOCENI[kvalita].trida);
  zvuk.cink();
}

function seberSklenici(s) {
  if (ruce.piva.length) { ukazToast('✋ Nejdřív roznes, co neseš.'); return; }
  if (ruce.sklenice.length >= unosnostSklenic()) { ukazToast('✋ Víc nádobí neuneseš – odnes ho do dřezu.'); return; }
  const i = spinave.indexOf(s);
  if (i < 0) return;
  spinave.splice(i, 1);
  if (s.rez) s.rez = null;
  ruce.sklenice.push(s.talir ? 'talir:' + s.talir : (s.pivo || 'r10'));
  if (s.talir) zvuk.talir(1); else zvuk.cink();
}

function pouzijDrez() {
  if (ruce.sklenice.length) {
    const n = ruce.sklenice.length;
    const talire = ruce.sklenice.filter(jeTalir).length;
    const panaku = ruce.sklenice.filter(jePanak).length;
    const piv = n - panaku - talire;
    cisteSklenice += piv;
    cistePanakovky += panaku;
    HRA.umyto += n;
    const casti = [];
    if (piv) casti.push(`${piv} ${piv === 1 ? 'sklenice' : piv < 5 ? 'sklenice' : 'sklenic'}`);
    if (panaku) casti.push(`${panaku} ${panaku === 1 ? 'panákovka' : panaku < 5 ? 'panákovky' : 'panákovek'}`);
    if (talire) casti.push(`${talire} ${talire === 1 ? 'talíř' : talire < 5 ? 'talíře' : 'talířů'}`);
    ukazToast(`🧽 Umyto: ${casti.join(' a ')}. Čistých sklenic ${cisteSklenice}, panákovek ${cistePanakovky}.`);
    ruce.sklenice = [];
    zvuk.voda();
  } else if (vratJidloDoKuchyne()) {
    // nechtěné jídlo pryč
  } else if (ruce.piva.some((x) => !x.listek)) {
    const vylito = ruce.piva.find((x) => !x.listek);
    ruce.piva.splice(ruce.piva.indexOf(vylito), 1);
    if (jePanak(vylito.id)) cistePanakovky++; else cisteSklenice++;
    ukazToast(jePanak(vylito.id) ? '🚰 Panák vylitý, panákovka umytá.' : '🚰 Pivo vylito, sklenice umytá.');
    zvuk.voda();
  } else if (nesesJidlo()) {
    ukazToast('🍽️ Tohle jídlo na někoho čeká – dones ho ke stolu.');
  }
}

/* ---------- Sudy ve skladu ---------- */
function zacniNarazet(pivo) {
  const s = sud(pivo.id);
  if (s.zbyva > 0) { ukazToast(`🛢️ Sud ${pivo.nazev} ještě není prázdný (zbývá ${s.zbyva} piv).`); return; }
  if (s.zasoba <= 0) { ukazToast(`📖 Nemáš náhradní sud ${pivo.nazev}. Objednej ho v knize (záložka Sklad).`); return; }
  narazeni = { pivo, cas: 0 };
  zvuk.klik();
}

function aktualizujSudy(dt) {
  if (narazeni) {
    if (!vstup.akceDrzena || !cil || cil.typ !== 'sud' || cil.pivo !== narazeni.pivo) narazeni = null;
    else {
      narazeni.cas += dt;
      if (narazeni.cas >= 1.3) {
        const s = sud(narazeni.pivo.id);
        s.zbyva = kapacitaSudu();
        s.zasoba--;
        HRA.vymenySudu = (HRA.vymenySudu || 0) + 1;
        HRA.prazdneSudy = Math.min(12, (HRA.prazdneSudy || 0) + 1);
        ukazToast(`🛢️ Naraženo! ${narazeni.pivo.nazev} zase teče.`);
        zvuk.syk();
        narazeni = null;
        ulozHru();
      }
    }
  }
  // dovoz objednaných sudů
  for (let i = dodavky.length - 1; i >= 0; i--) {
    dodavky[i].za -= dt;
    if (dodavky[i].za <= 0) {
      const p = najdiPivo(dodavky[i].id);
      if (dodavky[i].platitPriDovozu) {
        if (HRA.penize < p.sud) { dodavky.splice(i, 1); ukazToast(`🚚 Pivovar přivezl ${p.nazev}, ale nemáš na zaplacení.`); continue; }
        HRA.penize -= p.sud;
      }
      sud(p.id).zasoba++;
      if (HRA.prazdneSudy) HRA.prazdneSudy--;
      dodavky.splice(i, 1);
      ukazToast(`🚚 Přivezli sud: ${p.nazev}. Najdeš ho ve skladu.`);
      zvuk.zvonek();
      ulozHru();
    }
  }
  // smlouva s pivovarem: když dojde zásoba, sám objedná
  if (HRA.vylepseni.smlouva) {
    PIVA.forEach((p) => {
      if (!jeNaCepu(p)) return;
      const s = sud(p.id);
      if (s.zasoba === 0 && s.zbyva <= 4 && !dodavky.some((x) => x.id === p.id)) dodavky.push({ id: p.id, za: NASTAVENI.dovozSudu, platitPriDovozu: true });
    });
  }
}

function objednejSud(pivo) {
  if (HRA.penize < pivo.sud) return false;
  HRA.penize -= pivo.sud;
  dodavky.push({ id: pivo.id, za: NASTAVENI.dovozSudu });
  ulozHru();
  return true;
}
/* =========================================================
   17b) PANÁKY, HOKEJ V TELEVIZI A ÚKOLY
   ========================================================= */
const lahve = PANAKY.map((panak) => ({ panak, x: panak.x, sklenka: null, naklon: 0 }));
let nalevaLahev = null;                     // lahev, ze které se právě nalévá
let cistePanakovky = NASTAVENI.cistePanakovky;
const kapacitaPanakovek = () => NASTAVENI.cistePanakovky + 6 * (HRA.vylepseni.panakovky || 0);
const rychlostPanaku = () => NASTAVENI.panak.rychlost * (1 - 0.2 * (HRA.vylepseni.odmerka || 0));
function tolerancePanaku() {
  const r = HRA.vylepseni.ruka || 0;
  return { perfekt: NASTAVENI.panak.perfekt + 0.5 * r, dobre: NASTAVENI.panak.dobre + 0.5 * r };
}

/* ---------- Nalévání panáku: drž akci, pusť na čárce ---------- */
function zacniNalevat(l) {
  if (nalevaLahev || cepuje) return;
  if (ruce.sklenice.length) { ukazToast('🧽 S prázdným nádobím v ruce nalévat nejde.'); return; }
  if (!l.sklenka) {
    if (ruce.piva.length >= unosnostPiv()) { ukazToast(HRA.vylepseni.tac ? '✋ Víc neuneseš.' : '✋ V rukou uneseš jen dvě věci. Kup si v knize tác!'); return; }
    if (cistePanakovky <= 0) { ukazToast('🥃 Došly čisté panákovky! Posbírej prázdné po hostech a umyj je v dřezu.'); return; }
    cistePanakovky--;
    l.sklenka = { plneni: 0 };
  }
  nalevaLahev = l;
}

function aktualizujNalevani(dt) {
  lahve.forEach((l) => { l.naklon += ((nalevaLahev === l ? 1 : 0) - l.naklon) * Math.min(1, dt * 8); });
  if (!nalevaLahev) { zvuk.nalevani(false); return; }
  const l = nalevaLahev;
  if (vzdalenost(hrac.x, hrac.z, l.x, SVET.lahveZ) > 2.2 || REZIM !== 'hra') { dokonciNalevani(); return; }
  if (l.naklon < 0.82) return; // lahev se teprve naklání
  zvuk.nalevani(true);
  l.sklenka.plneni += rychlostPanaku() * dt;
  if (l.sklenka.plneni >= NASTAVENI.panak.max) {
    nalevaLahev = null;
    zvuk.nalevani(false);
    l.sklenka.plneni = 0;
    HRA.prelito++;
    ukazHodnoceni('💦 Přelité přes okraj – nalij znovu', 'spatne');
    zvuk.chyba();
  }
}

function dokonciNalevani() {
  const l = nalevaLahev;
  nalevaLahev = null;
  zvuk.nalevani(false);
  if (!l || !l.sklenka) return;
  const p = l.sklenka.plneni;
  if (p < NASTAVENI.panak.min) {
    if (p > 3) ukazHodnoceni('Ještě to není po čárku – drž a dolij', 'info');
    return;
  }
  const cilP = NASTAVENI.panak.cil;
  const t = tolerancePanaku();
  let kvalita;
  if (Math.abs(p - cilP) <= t.perfekt) kvalita = 'perfekt';
  else if (Math.abs(p - cilP) <= t.dobre) kvalita = 'dobre';
  else kvalita = p > cilP ? 'pena' : 'malo';
  ruce.piva.push({ id: l.panak.id, kvalita, plneni: p });
  HRA.nejvicNaTacu = Math.max(HRA.nejvicNaTacu || 0, ruce.piva.length);
  l.sklenka = null;
  HRA.panaku = (HRA.panaku || 0) + 1;
  HRA.panakDruhy = HRA.panakDruhy || {};
  HRA.panakDruhy[l.panak.id] = (HRA.panakDruhy[l.panak.id] || 0) + 1;
  ukazHodnoceni(TEXTY_PANAK[kvalita].text, HODNOCENI[kvalita].trida);
  zvuk.cink();
}

// Kde je lahev (a jak je nakloněná) – kvůli kreslení i proudu pálenky
function maticeLahve(l) {
  const t = TVARY_LAHVI[l.panak.tvar];
  const uhel = 2.05 * l.naklon;
  const zdvih = (0.16 - t.vyska * Math.cos(2.05)) * l.naklon;
  const posun = (SVET.panakZ - SVET.lahveZ - (t.vyska + 0.04) * Math.sin(2.05)) * l.naklon;
  return M4.retez(M4.posun(l.x, SVET.zadniPult.y + zdvih, SVET.lahveZ + posun), M4.rotX(uhel));
}

/* ---------- Přípitek: parta si přiťukne ---------- */
function zacniPripitek(parta) {
  if (parta.clenove.length < 2) return;
  parta.pripitekDo = casHry + 1.9;
  parta.cinkZa = casHry + 0.95;
  const mluvci = nahodne(parta.clenove);
  rekni(mluvci, vyberNove(HLASKY_PRIPITEK, 'pripitek', 3), 2.4);
  parta.clenove.forEach((h) => { h.vyraz = 'usmev'; });
}

function hlasitostU(x, z) { return omez(1.6 / Math.max(0.5, vzdalenost(hrac.x, hrac.z, x, z)), 0.12, 1); }

/* ---------- Hokej v televizi (když si ji koupíš) ---------- */
const hokej = { bezi: false, za: 150, konec: 0, skore: [0, 0], dalsiGol: 0, tretina: 1 };
function aktualizujHokej(dt) {
  if (!HRA.vylepseni.televize || !HRA.otevreno) {
    if (hokej.bezi) { hokej.bezi = false; hokej.za = 200; }
    return;
  }
  if (!hokej.bezi) {
    hokej.za -= dt;
    if (hokej.za > 0) return;
    hokej.bezi = true;
    hokej.konec = casHry + 180;
    hokej.skore = [0, 0];
    hokej.dalsiGol = casHry + nahodneCislo(16, 32);
    ukazToast('🏒 V televizi začíná hokej! Fanoušci se hrnou do hospody.', 3500);
    zvuk.pistalka();
    dalsiPartaZa = Math.min(dalsiPartaZa, 1.5);
    if (tvPlatno) aktualizujTV(0);
    return;
  }
  hokej.tretina = Math.min(3, 1 + Math.floor((180 - (hokej.konec - casHry)) / 60));
  if (casHry >= hokej.dalsiGol && hokej.konec - casHry > 8) {
    golVTelevizi(Math.random() < 0.6);
    hokej.dalsiGol = casHry + nahodneCislo(22, 48);
  }
  if (casHry >= hokej.konec) {
    hokej.bezi = false;
    hokej.za = nahodneCislo(260, 380);
    HRA.zapasu = (HRA.zapasu || 0) + 1;
    const [a, b] = hokej.skore;
    zvuk.pistalka();
    if (a > b) {
      ukazToast(`🏒 Konec zápasu ${a}:${b} – naši vyhráli! Hosté slaví a dávají větší dýško.`, 4000);
      party.forEach((p) => { p.dysko += 10 * p.clenove.length; p.slavi = true; p.clenove.forEach((h) => { h.jasotDo = casHry + 2; h.vyraz = 'usmev'; }); });
      zvuk.jasot(true);
    } else if (a < b) {
      ukazToast(`🏒 Konec zápasu ${a}:${b}. Prohráli jsme… hosté to zapíjejí.`, 4000);
    } else {
      ukazToast(`🏒 Konec zápasu ${a}:${b}, remíza.`, 3500);
    }
    ulozHru();
  }
}

function golVTelevizi(nasi) {
  hokej.skore[nasi ? 0 : 1]++;
  if (tvPlatno && HRA.vylepseni.televize) aktualizujTV(0);
  const [a, b] = hokej.skore;
  ukazHodnoceni(nasi ? `🏒 GÓL! ${a}:${b}` : `🏒 Gól soupeře… ${a}:${b}`, nasi ? 'dobre' : 'stredni');
  zvuk.jasot(nasi);
  const fandi = hoste.filter((h) => h.sedi > 0.9 && h.parta && h.parta.stav !== 'odchazi')
    .sort((x, y) => (y.parta.typ.id === 'fanousek') - (x.parta.typ.id === 'fanousek')).slice(0, 5);
  fandi.forEach((h, i) => {
    if (i < 3) rekni(h, nahodne(nasi ? HLASKY_GOL : HLASKY_GOL_SOUPER), 2.2);
    if (nasi) { h.jasotDo = casHry + 1.6 + Math.random() * 0.6; h.vyraz = 'usmev'; } else h.vyraz = 'zamraceny';
  });
}

/* ---------- Úkoly s odměnou ---------- */
let casUkolu = 0;
function aktualizujUkoly(dt) {
  casUkolu += dt;
  if (casUkolu < 0.5) return;
  casUkolu = 0;
  const splnene = [];
  UKOLY.forEach((u) => {
    if (HRA.ukoly[u.id]) return;
    if (u.hodnota(HRA) >= u.cil) { HRA.ukoly[u.id] = true; splnene.push(u); }
  });
  if (!splnene.length) return;
  const odmena = splnene.reduce((s, u) => s + u.odmena, 0);
  HRA.penize += odmena;
  ukazToast(splnene.length === 1
    ? `🏆 Úkol splněn: ${splnene[0].nazev} (+${odmena} Kč)`
    : `🏆 Splněno ${splnene.length} úkolů: ${splnene.map((u) => u.nazev).join(', ')} (+${odmena} Kč)`, 3800);
  zvuk.fanfara();
  ulozHru();
}
/* =========================================================
   17c) HOSPODSKÁ KOČKA MOUREK
   Chodí po hospodě, spí u radiátoru nebo u sudů, občas přijde
   za výčepním. Dá se pohladit (a za odměnu přede).
   ========================================================= */
const MISTA_KOCKY = [
  { x: 2.05, z: 11.45, spi: true },  // u sudů v rohu
  { x: 19.4, z: 5.0, spi: true },    // pod parohy
  { x: 0.55, z: 5.3, spi: false },   // u obrazu
  { x: 10.4, z: 3.6, spi: false },   // u konce pultu
  { x: 5.6, z: 11.95, spi: true },   // pod oknem u radiátoru
  { x: 15.0, z: 11.95, spi: true },  // pod oknem v nové části sálu
  { x: 18.0, z: 11.95, spi: true },  // pod posledním oknem
  { x: 7.2, z: 1.25, spi: false },   // za pultem
  { x: 12.2, z: 4.2, spi: false }    // před skladem
];
const kocka = {
  x: 2.05, z: 11.45, natoceni: 0.7, stav: 'spi', cas: 25, cesta: [], cil: null,
  faze: 0, chuze: 0, lehne: 1, rychlost: 0.55, hlava: 0, pohlazeno: 0, cekaNaPruchod: 0, pruchodDo: 0, poradi: 0
};
const KOCKA_BARVA = rgba([0.47, 0.43, 0.39]);
const KOCKA_PRUH = rgba([0.27, 0.24, 0.22]);
const KOCKA_BRICHO = rgba([0.86, 0.82, 0.76]);
const KOCKA_OCI = rgba([0.55, 0.85, 0.3]);
const KOCKA_NOS = rgba([0.9, 0.55, 0.55]);

function aktualizujKocku(dt) {
  const k = kocka;
  k.cas -= dt;
  k.pohlazeno = Math.max(0, k.pohlazeno - dt);
  if (k.stav === 'jde') {
    k.lehne = Math.max(0, k.lehne - dt * 3);
    if (jdiPoCeste(k, dt)) {
      k.stav = k.cil.spi ? 'spi' : 'sedi';
      k.cas = k.cil.spi ? nahodneCislo(35, 80) : nahodneCislo(10, 25);
      if (k.cil.kHraci && vzdalenost(k.x, k.z, hrac.x, hrac.z) < 1.6) zvuk.mnau();
    }
  } else {
    k.chuze = Math.max(0, k.chuze - dt * 4);
    k.lehne += ((k.stav === 'spi' && !k.pohlazeno ? 1 : 0) - k.lehne) * Math.min(1, dt * 1.5);
    if (k.cas <= 0 && !k.pohlazeno) {
      // nové místo – občas přijde za výčepním, když je v sále
      const kHraci = Math.random() < 0.25 && !zaPultem() && !veSkladu();
      k.cil = kHraci ? { x: hrac.x + nahodneCislo(-0.5, 0.5), z: hrac.z + nahodneCislo(-0.5, 0.5), spi: false, kHraci: true } : nahodne(MISTA_KOCKY);
      k.cesta = najdiCestu(k.x, k.z, k.cil.x, k.cil.z);
      k.stav = 'jde';
    }
  }
  // když sedí a výčepní je blízko, kouká na něj
  const blizko = k.stav !== 'jde' && vzdalenost(k.x, k.z, hrac.x, hrac.z) < 3;
  const uhel = blizko ? omez(normalizujUhel(Math.atan2(hrac.x - k.x, hrac.z - k.z) - k.natoceni), -1, 1) : 0;
  k.hlava += (uhel * (1 - k.lehne) - k.hlava) * Math.min(1, dt * 3);
}

function pohladKocku() {
  const k = kocka;
  if (k.pohlazeno > 1) return;
  k.pohlazeno = 4.5;
  if (k.stav === 'jde') { k.cesta = []; }
  k.stav = 'sedi';
  k.cas = 10;
  k.natoceni = Math.atan2(hrac.x - k.x, hrac.z - k.z);
  zvuk.prede();
  plovouciText(k.x, 0.55, k.z, '❤️', 'předení');
  HRA.pohlazeni = (HRA.pohlazeni || 0) + 1;
}

function kresliKocku(cas) {
  const k = kocka;
  const lehne = k.lehne;
  const kyv = Math.sin(k.faze * 1.3) * k.chuze;
  const M = M4.retez(M4.posun(k.x, 0, k.z), M4.rotY(k.natoceni));
  // tělo, hlava, nohy a ocas jsou zaoblené (měkčí, „chlupatější“ tvar), drobnosti hranaté
  const dil = (x, y, z, sx, sy, sz, barva, ...rot) => kresli(SITE.oblaKostka, M4.retez(M, M4.posun(x, y, z), ...rot, M4.meritko(sx, sy, sz)), null, barva);
  const yTelo = lerp(0.15, 0.065, lehne) + Math.abs(kyv) * 0.006;
  // tělo, bříško a pruhy na zádech
  dil(0, yTelo, 0, 0.13, 0.11, 0.33, KOCKA_BARVA);
  dil(0, yTelo - 0.045, 0.02, 0.1, 0.03, 0.24, KOCKA_BRICHO);
  [-0.09, 0, 0.09].forEach((z) => dil(0, yTelo + 0.056, z, 0.135, 0.008, 0.035, KOCKA_PRUH));
  // nohy (vleže schované pod tělem)
  const delkaNohy = lerp(0.11, 0.02, lehne);
  [[-0.045, 0.11, 1], [0.045, 0.11, -1], [-0.045, -0.11, -1], [0.045, -0.11, 1]].forEach(([x, z, s]) => {
    dil(x, delkaNohy / 2, z, 0.035, delkaNohy, 0.035, KOCKA_BARVA, M4.rotX(kyv * 0.6 * s));
  });
  // hlava s ušima, očima a čumáčkem (kývne se k hráči)
  const yHlava = yTelo + lerp(0.09, 0.02, lehne);
  const H = M4.retez(M, M4.posun(0, yHlava, 0.2), M4.rotY(k.hlava));
  const hlava = (x, y, z, sx, sy, sz, barva) => kresli(SITE.kostka, M4.retez(H, M4.posun(x, y, z), M4.meritko(sx, sy, sz)), null, barva);
  kresli(SITE.oblaKostka, M4.retez(H, M4.meritko(0.115, 0.1, 0.105)), null, KOCKA_BARVA);
  kresli(SITE.oblaKostka, M4.retez(H, M4.posun(0, -0.022, 0.045), M4.meritko(0.06, 0.04, 0.03)), null, KOCKA_BRICHO);
  hlava(-0.033, 0.06, -0.01, 0.03, 0.04, 0.02, KOCKA_BARVA);
  hlava(0.033, 0.06, -0.01, 0.03, 0.04, 0.02, KOCKA_BARVA);
  const spi = lehne > 0.6 && !k.pohlazeno;
  const oci = spi ? KOCKA_PRUH : KOCKA_OCI;
  hlava(-0.025, 0.012, 0.0535, 0.022, spi ? 0.004 : 0.016, 0.004, oci);
  hlava(0.025, 0.012, 0.0535, 0.022, spi ? 0.004 : 0.016, 0.004, oci);
  hlava(0, -0.012, 0.0615, 0.014, 0.01, 0.004, KOCKA_NOS);
  // ocas: tři články, za chůze se houpe, vleže se stočí kolem těla
  let T = M4.retez(M, M4.posun(0, yTelo + 0.03, -0.16));
  for (let i = 0; i < 3; i++) {
    const vrteni = Math.sin(cas * 2.2 + i * 0.8) * (0.25 + 0.3 * k.chuze) * (1 - lehne * 0.7);
    T = M4.retez(T, M4.rotY(lerp(vrteni, 0.7, lehne)), M4.rotX(lerp(i === 0 ? -0.9 : -0.25, 0, lehne)));
    kresli(SITE.oblaKostka, M4.retez(T, M4.posun(0, 0, -0.045), M4.meritko(0.03, 0.03, 0.1)), null, i === 2 ? KOCKA_PRUH : KOCKA_BARVA);
    T = M4.retez(T, M4.posun(0, 0, -0.09));
  }
}
/* =========================================================
   17d) KUCHYNĚ – lístky, sporáky, kuchařka a výdejní okénko
   Objednané jídlo dostane lístek (j09). Kuchařka ho uvaří na
   volném sporáku, odnese na okénko a zazvoní. Odtamtud ho vezme
   hráč nebo číšník a donese ke stolu.
   Lístek: { jidlo, parta, komu, stav, objednano, zbyva, … }
   stav: fronta → vari → hotovo → okenko → nese → doruceno (nebo zruseno)
   ========================================================= */
const kuchyne = { fronta: [], okenko: [], sporaky: [null, null], kucharka: null, poradi: 0 };
const jeNaListku = (j) => j.uroven <= (HRA.vylepseni.nabidka || 0);
const pocetSporaku = () => (HRA.vylepseni.sporak2 ? 2 : 1);
const rychlostVareni = () => 1 + 0.25 * (HRA.vylepseni.rychlaKuchyne || 0); // +25 % rychlosti = o 20 % kratší vaření
const SPORAKY = [{ x: 16.6, z: 1.15, hrnec: [16.28, 1.2, 0.25] }, { x: 18.2, z: 1.15, hrnec: [17.88, 1.2, 0.25] }];
const KUCHYNE_MISTA = { lednice: { x: 14.62, z: 1.18, natoceni: Math.PI }, prkenko: { x: 16.47, z: 1.5, natoceni: 0 } };

function popisMistaHosta(host) {
  const m = host.misto;
  if (!m) return '';
  return m.typ === 'stolicka' ? 'bar' : `stůl ${m.stul + 1}`;
}

// Kde na okénku leží talíř (slot 0–5)
function polohaNaOkenku(slot) {
  const o = SVET.kuchyne.okenko;
  return { x: o.x0 + 0.17 + slot * 0.255, y: SVET.okenkoY, z: SVET.kuchyne.stena + 0.07 };
}

function objednejJidlo(parta, komu, jidlo) {
  const listek = {
    id: ++kuchyne.poradi, jidlo, parta, komu, stav: 'fronta', objednano: casHry, zbyva: jidlo.doba,
    trpelivost: (NASTAVENI.trpelivostJidlo + jidlo.doba * 1.6) * trpelivostNasobic() * (HRA.vylepseni.ohrivac ? 1.2 : 1),
    stul: popisMistaHosta(komu), slot: -1, naOkenkuOd: 0, studene: false, nosic: null, rez: null, stezoval: false
  };
  parta.jidla.push(listek);
  kuchyne.fronta.push(listek);
  return listek;
}

// Lístek přestane existovat v kuchyni (uvařeno a vydáno, nebo zrušeno)
function odeberZKuchyne(listek) {
  const i = kuchyne.fronta.indexOf(listek);
  if (i >= 0) kuchyne.fronta.splice(i, 1);
  const j = kuchyne.okenko.indexOf(listek);
  if (j >= 0) kuchyne.okenko.splice(j, 1);
  kuchyne.sporaky.forEach((l, k) => { if (l === listek) kuchyne.sporaky[k] = null; });
  if (kuchyne.kucharka) kuchyne.kucharka.nese = kuchyne.kucharka.nese.filter((x) => x !== listek);
  listek.slot = -1;
}

function zrusJidlo(listek) {
  if (listek.stav === 'doruceno') return;
  listek.stav = 'zruseno';
  listek.rez = null;
  odeberZKuchyne(listek);
}

function vytvorKucharku() {
  const def = KUCHARKA;
  const v = vzhledPodleDefinice(def);
  const k = novaPostava(KUCHYNE_MISTA.prkenko.x, KUCHYNE_MISTA.prkenko.z, v);
  Object.assign(k, { def, jmeno: def.jmeno, rychlost: 1.25, stav: 'stoji', nese: [], ukol: null, cekat: 0, natoceni: 0, status: 'čeká na objednávky' });
  return k;
}

function aktualizujKuchyni(dt) {
  if (!maKuchyni()) return;
  if (!kuchyne.kucharka) kuchyne.kucharka = vytvorKucharku();
  // sporáky: každý vaří jedno jídlo
  for (let i = 0; i < pocetSporaku(); i++) {
    if (!kuchyne.sporaky[i]) {
      const dalsi = kuchyne.fronta.find((l) => l.stav === 'fronta');
      if (dalsi) { dalsi.stav = 'vari'; dalsi.sporak = i; kuchyne.sporaky[i] = dalsi; kuchyne.kucharka.novyHrnec = true; }
    }
    const l = kuchyne.sporaky[i];
    if (l) {
      l.zbyva -= dt * rychlostVareni();
      if (l.zbyva <= 0) { l.stav = 'hotovo'; kuchyne.sporaky[i] = null; }
    }
  }
  // jídlo na okénku chladne (pokud nejsou ohřívací lampy)
  kuchyne.okenko.forEach((l) => { if (!HRA.vylepseni.ohrivac && casHry - l.naOkenkuOd > NASTAVENI.jidloChladne) l.studene = true; });
  aktualizujKucharku(dt);
  zvuk.kuchyne(kuchyne.sporaky.some(Boolean) ? omez(1.8 / Math.max(0.6, vzdalenost(hrac.x, hrac.z, 17, 1.2)), 0, 0.6) : 0);
}

function volnySlot() {
  for (let s = 0; s < NASTAVENI.kapacitaOkenka; s++) if (!kuchyne.okenko.some((l) => l.slot === s)) return s;
  return -1;
}

function aktualizujKucharku(dt) {
  const k = kuchyne.kucharka;
  if (k.hlaska && casHry > k.hlaska.do) k.hlaska = null;
  k.mluvi = Math.max(0, k.mluvi - dt);
  k.podnos += ((k.nese.length ? 1 : 0) - k.podnos) * Math.min(1, dt * 5);
  const hotova = kuchyne.fronta.filter((l) => l.stav === 'hotovo' && !k.nese.includes(l));
  // nový úkol, když nic nedělá
  if (!k.ukol) {
    if (k.nese.length) k.ukol = { kam: SVET.okenkoKuchar, natoceni: 0, co: 'okenko' };
    else if (hotova.length && volnySlot() >= 0) {
      const sp = SPORAKY[hotova[0].sporak || 0];
      k.ukol = { kam: sp, natoceni: Math.PI, co: 'vzit' };
    } else if (k.novyHrnec) {
      k.novyHrnec = false;
      k.dalsi = [{ kam: KUCHYNE_MISTA.prkenko, natoceni: 0, co: 'krajeni', cekat: 1.6 }];
      k.ukol = { kam: KUCHYNE_MISTA.lednice, natoceni: Math.PI, co: 'lednice', cekat: 0.7 };
    } else if (k.dalsi && k.dalsi.length) k.ukol = k.dalsi.shift();
    else {
      const vari = kuchyne.sporaky.findIndex(Boolean);
      k.ukol = vari >= 0 ? { kam: SPORAKY[vari], natoceni: Math.PI, co: 'michani', cekat: 2.5 }
        : { kam: KUCHYNE_MISTA.prkenko, natoceni: 0, co: kuchyne.fronta.length ? 'krajeni' : 'ceka', cekat: 2 };
    }
    k.cesta = najdiCestu(k.x, k.z, k.ukol.kam.x, k.ukol.kam.z);
    k.dorazila = false;
  }
  const u = k.ukol;
  if (!k.dorazila) {
    k.prace = null;
    k.pracuje = Math.max(0, k.pracuje - dt * 4);
    if (jdiPoCeste(k, dt)) { k.dorazila = true; k.cekat = u.cekat || 0; }
    return;
  }
  otocK(k, u.natoceni, dt);
  if (u.co === 'vzit') {
    // vezme z kastrolu hotová jídla (nejvýš dvě) a nese je na okénko
    hotova.slice(0, 2).forEach((l) => k.nese.push(l));
    k.ukol = null;
    return;
  }
  if (u.co === 'okenko') {
    k.nese.forEach((l) => {
      const slot = volnySlot();
      if (slot < 0 || l.stav !== 'hotovo') return;
      l.stav = 'okenko';
      l.slot = slot;
      l.naOkenkuOd = casHry;
      const i = kuchyne.fronta.indexOf(l);
      if (i >= 0) kuchyne.fronta.splice(i, 1);
      kuchyne.okenko.push(l);
      const p = polohaNaOkenku(slot);
      plovouciText(p.x, p.y + 0.35, p.z, `🔔 ${l.jidlo.kratce}`, l.stul);
    });
    if (k.nese.length) {
      zvuk.zvonekKuchyne(hlasitostU(SVET.okenkoStani.x, SVET.okenkoStani.z));
      rekni(k, vyberNove(['Jídlo na okénku!', 'Je to tam!', `${k.nese[0].jidlo.kratce} na ${k.nese[0].stul === 'bar' ? 'bar' : k.nese[0].stul.replace('stůl ', 'stůl č. ')}!`, 'Pozor, horký!'], 'kucharka', 3), 2.2);
    }
    k.nese = k.nese.filter((l) => l.stav === 'hotovo');
    k.ukol = null;
    return;
  }
  k.prace = u.co === 'michani' || u.co === 'krajeni' ? u.co : null;
  k.pracuje += ((k.prace ? 1 : 0) - k.pracuje) * Math.min(1, dt * 4);
  k.status = u.co === 'michani' ? 'vaří' : u.co === 'krajeni' ? 'krájí a chystá' : u.co === 'lednice' ? 'bere suroviny z lednice' : 'čeká na objednávky';
  k.cekat -= dt;
  // když je něco hotové, nečeká a jde to vydat
  if (k.cekat <= 0 || (hotova.length && u.co !== 'vzit')) k.ukol = null;
}

// Hráč vezme talíř z okénka (nejstarší, nebo ten, na který se dívá)
function vezmiZOkenka(listek) {
  if (!listek) listek = [...kuchyne.okenko].filter((l) => !l.rez).sort((a, b) => a.naOkenkuOd - b.naOkenkuOd)[0];
  if (!listek) { ukazToast('🔔 Na okénku zatím nic není – kuchařka zazvoní, až bude jídlo hotové.'); return; }
  if (ruce.sklenice.length) { ukazToast('🧽 S prázdným nádobím v ruce jídlo nevezmeš – nejdřív ho odnes.'); return; }
  if (ruce.piva.length >= unosnostPiv()) { ukazToast('✋ Víc toho neuneseš.'); return; }
  odeberZKuchyne(listek);
  listek.stav = 'nese';
  listek.nosic = 'hrac';
  listek.rez = null;
  ruce.piva.push({ id: listek.jidlo.id, listek, kvalita: 'perfekt', plneni: 100 });
  HRA.nejvicNaTacu = Math.max(HRA.nejvicNaTacu || 0, ruce.piva.length);
  zvuk.talir(1);
}

// Talíř, který už nikdo nechce, vrátí hráč do kuchyně (na okénko)
function vratJidloDoKuchyne() {
  const zrusena = ruce.piva.filter((x) => x.listek && x.listek.stav === 'zruseno');
  if (!zrusena.length) return false;
  ruce.piva = ruce.piva.filter((x) => !zrusena.includes(x));
  ukazToast(`🍽️ Vráceno do kuchyně: ${zrusena.map((x) => x.listek.jidlo.kratce).join(', ')}.`);
  zvuk.talir(1);
  return true;
}
/* =========================================================
   17e) PERSONÁL – sběrači sklenic, číšníci a pokladní
   Každý pomocník si vybírá práci podle priorit, práci si
   „rezervuje“ (aby dva nešli pro totéž) a nebere práci, kterou
   právě děláš ty (když stojíš u hosta nebo se na něj díváš).
   Když se zasekne, najde si novou cestu; když to nejde, posune se.
   ========================================================= */
const personal = [];
const vydej = [];          // nápoje na výdeji pro číšníky { id, kvalita, plneni, rez, slot }
const DOMOVY = {
  pomocnik: { x: 11.6, z: 3.2, natoceni: 0 },
  sberac2: { x: 12.3, z: 3.2, natoceni: 0 },
  cisnik1: { x: 10.35, z: 3.35, natoceni: 0.4 },
  cisnik2: { x: 14.6, z: 4.15, natoceni: 0.3 },
  pokladni1: { x: 13.05, z: 12.05, natoceni: Math.PI },
  pokladni2: { x: 13.6, z: 12.05, natoceni: Math.PI }
};
const MISTO_DREZU = { x: SVET.drez.x, z: 1.0, natoceni: Math.PI };

// Vzhled pomocníka (a kuchařky) podle definice v j01e
function vzhledPodleDefinice(def) {
  const z = def.vzhled;
  const typ = { id: 'personal', vek: [def.vek, def.vek], muz: def.zena ? 0 : 1, styl: { trup: [z.trup], spodek: [z.spodek], vlasy: [z.styl], vousy: [], pokryvka: [] } };
  const v = novyVzhled(typ, def.zena);
  Object.assign(v, {
    styl: z.styl, trup: z.trup, spodek: z.spodek, vousy: z.vousy || null, bryle: Boolean(z.bryle), slunecni: false, kravata: false,
    batoh: false, fotak: false, sala: false, kabelka: false, nausnice: false, pokryvka: null, bricho: 0, vyska: def.zena ? 0.96 : 1.02, sirka: def.zena ? 0.92 : 1.0,
    zastera: z.zastera ? hexNaRgb(z.zastera) : null, motylek: Boolean(z.motylek), ledvinka: Boolean(z.ledvinka), cepiceKuchare: Boolean(z.cepiceKuchare)
  });
  Object.entries(z.barvy || {}).forEach(([k, hex]) => { if (k === 'vlasy') v.vlasy = hexNaRgb(hex); else v.barvy[k] = hexNaRgb(hex); });
  return v;
}

function vytvorPomocnika(def) {
  const doma = DOMOVY[def.id];
  const a = novaPostava(doma.x, doma.z, vzhledPodleDefinice(def));
  Object.assign(a, { def, role: def.role, jmeno: def.jmeno, natoceni: doma.natoceni, rychlost: def.role === 'cisnik' ? 1.6 : 1.45,
    ukol: null, nese: [], status: 'právě přišel do práce', cekat: 0, zasek: { cas: 0, x: doma.x, z: doma.z, pokusu: 0 }, hlaska: null });
  return a;
}

// Najme pomocníka (z knihy)
function najmiPomocnika(def) {
  const cena = cenaPomocnika(def);
  if (HRA.vylepseni[def.id] || HRA.penize < cena) return false;
  HRA.penize -= cena;
  HRA.vylepseni[def.id] = 1;
  ulozHru();
  return true;
}

// Dělá to zrovna hráč? (stojí u toho, nebo se na to dívá)
function hracSeVenuje(x, z, parta) {
  if (REZIM === 'menu') return false;
  if (parta && cil && cil.typ === 'host' && cil.host.parta === parta) return true;
  return vzdalenost(hrac.x, hrac.z, x, z) < 1.9;
}

function uvolni(a) {
  const u = a.ukol;
  if (!u) return;
  if (u.parta && u.parta.rezervace === a) u.parta.rezervace = null;
  (u.cile || []).forEach((s) => { if (s.rez === a) s.rez = null; });
  (u.listky || []).forEach((l) => { if (l.rez === a) l.rez = null; });
  (u.napoje || []).forEach((n) => { if (n.rez === a) n.rez = null; });
  a.ukol = null;
}

function jdi(a, kam, ukol) {
  a.ukol = ukol;
  a.cesta = najdiCestu(a.x, a.z, kam.x, kam.z);
  a.ukol.kam = kam;
  a.dorazil = false;
  a.zasek = { cas: 0, x: a.x, z: a.z, pokusu: 0 };
}

const misto = (h) => (h && h.misto ? h.misto.obsluha || { x: h.x, z: h.z + 0.8 } : null);
const kdeSedi = (h) => (h && h.misto ? (h.misto.typ === 'stolicka' ? 'u baru' : `u stolu ${h.misto.stul + 1}`) : '');

/* ---------- Plánování práce podle role ---------- */
function naplanujSberace(a) {
  const kapacita = NASTAVENI.unosnostSberace;
  const volne = spinave.filter((s) => !s.rez && !hracSeVenuje(s.x, s.z));
  if (a.nese.length >= kapacita || (a.nese.length && !volne.length)) { jdi(a, MISTO_DREZU, { typ: 'myt' }); a.status = `nese ${a.nese.length} ${a.nese.length < 5 ? 'kusy' : 'kusů'} nádobí do dřezu`; return; }
  if (!volne.length) { jdi(a, DOMOVY[a.def.id], { typ: 'domu' }); a.status = 'odpočívá – všude je uklizeno'; return; }
  // nejdřív stoly, kde už nikdo nesedí (ať si mají kam sednout noví hosté), pak nejbližší
  const skore = (s) => vzdalenost(a.x, a.z, s.misto.x, s.misto.z) + (s.y > 1 ? 1.5 : 0) - ([...sedadla, ...stolicky].some((m) => !m.host && blizko(m.sklenice, s)) ? 2 : 0);
  const prvni = volne.reduce((x, y) => (skore(x) < skore(y) ? x : y));
  const cile = volne.filter((s) => vzdalenost(s.misto.x, s.misto.z, prvni.misto.x, prvni.misto.z) < 1.3).slice(0, kapacita - a.nese.length);
  cile.forEach((s) => { s.rez = a; });
  jdi(a, prvni.misto, { typ: 'sbirat', cile });
  a.status = prvni.y > 1 ? 'jde pro sklenice na bar' : `jde uklidit stůl ${stulUBodu(prvni)}`;
}

function stulUBodu(s) {
  const m = sedadla.find((x) => blizko(x.sklenice, s) || blizko(x.talir, s));
  return m ? m.stul + 1 : '';
}

// Co ještě chtějí partičky na čepu (bez toho, co už nese jiný číšník)
function potrebaNapoju() {
  const potreba = [];
  party.forEach((p) => {
    if (p.stav !== 'ceka_pivo') return;
    zbyvaDonest(p).forEach((x) => potreba.push({ parta: p, pivo: x.pivo, komu: x.komu }));
  });
  personal.forEach((o) => o.nese.forEach((n) => {
    if (!n.napoj) return;
    const i = potreba.findIndex((x) => x.parta === n.parta && x.pivo === n.napoj.id);
    if (i >= 0) potreba.splice(i, 1);
  }));
  return potreba;
}

function naplanujCisnika(a) {
  if (a.nese.length) { naplanujRoznaseni(a); return; }
  // 1) hotové jídlo na okénku (nejstarší první)
  const hracUOkenka = cil && (cil.typ === 'okenko' || cil.typ === 'talirOkenko');
  const talire = kuchyne.okenko.filter((l) => !l.rez && l.parta.stav !== 'odchazi').sort((x, y) => x.naOkenkuOd - y.naOkenkuOd);
  if (talire.length && !hracUOkenka) {
    const listky = [talire[0], ...talire.slice(1).filter((l) => l.parta === talire[0].parta)].slice(0, 2);
    listky.forEach((l) => { l.rez = a; });
    jdi(a, SVET.okenkoStani, { typ: 'okenko', listky });
    a.status = `jde k okénku pro ${listky.map((l) => l.jidlo.kratce).join(' a ')}`;
    return;
  }
  // 2) nápoje, které jsi položil na výdej
  const potreba = potrebaNapoju();
  const napoje = [];
  vydej.forEach((n) => {
    if (n.rez || napoje.length >= NASTAVENI.unosnostCisnika) return;
    const i = potreba.findIndex((x) => x.pivo === n.id);
    if (i < 0) return;
    n.rez = a;
    n.pro = potreba[i].parta;
    potreba.splice(i, 1);
    napoje.push(n);
  });
  if (napoje.length) {
    jdi(a, SVET.vydejStani, { typ: 'vydej', napoje });
    a.status = `jde na výdej pro ${napoje.length} ${napoje.length === 1 ? 'nápoj' : napoje.length < 5 ? 'nápoje' : 'nápojů'}`;
    return;
  }
  // 3) hosté u stolu chtějí objednat
  const vola = party.filter((p) => p.stav === 'vola' && p.kde === 'stul' && !p.rezervace && !hracSeVenuje(p.mluvci.x, p.mluvci.z, p))
    .sort((x, y) => x.trpelivost / x.maxTrpelivost - y.trpelivost / y.maxTrpelivost);
  if (vola.length) {
    const p = vola[0];
    p.rezervace = a;
    jdi(a, misto(p.mluvci), { typ: 'objednavka', parta: p });
    a.status = `jde pro objednávku ${kdeSedi(p.mluvci)}`;
    return;
  }
  jdi(a, DOMOVY[a.def.id], { typ: 'domu' });
  a.status = 'čeká na hosty';
}

function naplanujRoznaseni(a) {
  const it = a.nese[0];
  if (it.listek) {
    const l = it.listek;
    if (l.stav !== 'nese' || l.parta.stav === 'odchazi' || !l.komu.misto) { a.nese.shift(); if (l.stav === 'nese') zrusJidlo(l); naplanujCisnika(a); return; }
    jdi(a, misto(l.komu), { typ: 'roznaset' });
    a.status = `nese ${l.jidlo.kratce} ${kdeSedi(l.komu)}`;
    return;
  }
  // nápoj: komu ho dát (tomu, kdo ho pořád chce)
  const kandidati = [it.parta, ...party].filter((p, i, pole) => p && pole.indexOf(p) === i);
  for (const p of kandidati) {
    if (p.stav !== 'ceka_pivo') continue;
    const x = zbyvaDonest(p).find((o) => o.pivo === it.napoj.id);
    if (!x) continue;
    it.parta = p;
    it.komu = x.komu;
    jdi(a, misto(x.komu), { typ: 'roznaset' });
    a.status = `nese ${najdiPivo(it.napoj.id).kratce} ${kdeSedi(x.komu)}`;
    return;
  }
  // nikdo ho nechce – vrátí ho na výdej (nebo vylije)
  a.nese.shift();
  if (vydej.length < NASTAVENI.kapacitaVydeje) polozNaVydej(it.napoj);
  else cisteSklenice += jePanak(it.napoj.id) ? 0 : 1;
  if (a.nese.length) naplanujRoznaseni(a); else { jdi(a, DOMOVY[a.def.id], { typ: 'domu' }); a.status = 'čeká na hosty'; }
}

function naplanujPokladni(a) {
  const plati = party.filter((p) => p.stav === 'plati' && !p.rezervace && !hracSeVenuje(p.mluvci.x, p.mluvci.z, p))
    .sort((x, y) => x.trpelivost / x.maxTrpelivost - y.trpelivost / y.maxTrpelivost);
  if (plati.length) {
    const p = plati[0];
    p.rezervace = a;
    jdi(a, misto(p.mluvci), { typ: 'platba', parta: p });
    a.status = `jde vybrat ${p.utrata + p.dysko} Kč ${kdeSedi(p.mluvci)}`;
    return;
  }
  jdi(a, DOMOVY[a.def.id], { typ: 'domu' });
  a.status = 'čeká u pokladny';
}

function naplanuj(a) {
  if (a.role === 'sberac') naplanujSberace(a);
  else if (a.role === 'cisnik') naplanujCisnika(a);
  else naplanujPokladni(a);
}

/* ---------- Vykonání práce ---------- */
function rekniPersonal(a, druh) { rekni(a, vyberNove(HLASKY_PERSONALU[druh], 'pers_' + druh, 2), 2.2); }

// Má pomocník úkol zrušit? (cíl zmizel, nebo ho mezitím dělá hráč)
function ukolPlati(a) {
  const u = a.ukol;
  const hracBlizko = (x, z) => vzdalenost(hrac.x, hrac.z, x, z) < 1.4 && vzdalenost(a.x, a.z, x, z) > 2.2;
  switch (u.typ) {
    case 'sbirat': return u.cile.some((s) => spinave.includes(s));
    case 'objednavka': return u.parta.stav === 'vola' && !hracBlizko(u.parta.mluvci.x, u.parta.mluvci.z);
    case 'platba': return u.parta.stav === 'plati' && !hracBlizko(u.parta.mluvci.x, u.parta.mluvci.z);
    case 'okenko': return u.listky.some((l) => l.stav === 'okenko');
    case 'vydej': return u.napoje.some((n) => vydej.includes(n));
    default: return true;
  }
}

function aktualizujPomocnika(a, dt) {
  if (a.hlaska && casHry > a.hlaska.do) a.hlaska = null;
  a.mluvi = Math.max(0, a.mluvi - dt * 0.8);
  const naPodnosu = a.role === 'cisnik' && a.nese.length;
  a.podnos += ((naPodnosu || (a.ukol && a.ukol.typ === 'platba' && a.dorazil) ? 1 : 0) - a.podnos) * Math.min(1, dt * 5);
  a.drziPred += ((a.role === 'sberac' && a.nese.length ? 1 : 0) - a.drziPred) * Math.min(1, dt * 5);
  a.pracuje += ((a.prace ? 1 : 0) - a.pracuje) * Math.min(1, dt * 5);
  if (!a.ukol) naplanuj(a);
  if (!a.ukol) return;
  if (!ukolPlati(a)) { uvolni(a); return; }
  const u = a.ukol;
  if (!a.dorazil) {
    a.prace = null;
    if (jdiPoCeste(a, dt)) { a.dorazil = true; a.cekat = 0; a.x = u.kam.x; a.z = u.kam.z; }
    hlidejZaseknuti(a, dt);
    return;
  }
  // otočit se k cíli
  const naCo = u.typ === 'myt' ? { x: SVET.drez.x, z: 0 } : u.typ === 'okenko' ? { x: SVET.okenkoStani.x, z: 3 } : u.typ === 'vydej' ? { x: 9.5, z: 2.3 }
    : u.parta ? u.parta.mluvci : u.typ === 'roznaset' && a.nese[0] ? (a.nese[0].listek ? a.nese[0].listek.komu : a.nese[0].komu) : null;
  if (naCo) otocK(a, Math.atan2(naCo.x - a.x, naCo.z - a.z), dt);
  else if (u.typ === 'domu') otocK(a, u.kam.natoceni || 0, dt);
  a.cekat += dt;
  switch (u.typ) {
    case 'domu':
      a.prace = null;
      // doma se po chvíli zase rozhlédne po práci
      if (a.cekat > 0.8) a.ukol = null;
      break;
    case 'sbirat': {
      if (a.cekat < 0.35) break;
      const kapacita = NASTAVENI.unosnostSberace;
      for (let i = spinave.length - 1; i >= 0 && a.nese.length < kapacita; i--) {
        const s = spinave[i];
        if ((s.rez === a || (!s.rez && vzdalenost(s.misto.x, s.misto.z, a.x, a.z) < 1.3)) && vzdalenost(s.x, s.z, a.x, a.z) < 1.9) {
          a.nese.push(s.talir ? { talir: s.talir } : { pivo: s.pivo });
          spinave.splice(i, 1);
        }
      }
      if (Math.random() < 0.3) rekniPersonal(a, 'sbira');
      zvuk.cink(hlasitostU(a.x, a.z) * 0.6);
      a.ukol = null;
      break;
    }
    case 'myt': {
      a.prace = 'michani';
      if (a.cekat < 0.3 + 0.22 * a.nese.length) break;
      const sklenic = a.nese.filter((n) => n.pivo && !jePanak(n.pivo)).length;
      const panaku = a.nese.filter((n) => n.pivo && jePanak(n.pivo)).length;
      cisteSklenice = Math.min(kapacitaRegalu(), cisteSklenice + sklenic);
      cistePanakovky = Math.min(kapacitaPanakovek(), cistePanakovky + panaku);
      HRA.umyto += a.nese.length;
      HRA.personalSklenic = (HRA.personalSklenic || 0) + a.nese.length;
      zvuk.voda(hlasitostU(a.x, a.z));
      a.nese = [];
      a.prace = null;
      a.ukol = null;
      break;
    }
    case 'objednavka':
      if (a.cekat < 0.4) { if (a.cekat < dt * 1.5) rekniPersonal(a, 'objednavka'); break; }
      if (a.cekat < 1.6) break;
      prevezmiObjednavku(u.parta, a);
      setTimeout(() => rekniPersonal(a, 'zapsano'), 1200);
      a.ukol = null;
      break;
    case 'platba':
      if (a.cekat < 1.3) break;
      vyberPenize(u.parta, a);
      rekniPersonal(a, 'plati');
      a.ukol = null;
      break;
    case 'okenko':
      if (a.cekat < 0.4) break;
      u.listky.forEach((l) => {
        if (l.stav !== 'okenko' || l.rez !== a) return;
        odeberZKuchyne(l);
        l.stav = 'nese';
        l.nosic = a;
        l.rez = null;
        a.nese.push({ listek: l });
      });
      zvuk.talir(hlasitostU(a.x, a.z));
      a.ukol = null;
      break;
    case 'vydej':
      if (a.cekat < 0.4) break;
      u.napoje.forEach((n) => {
        const i = vydej.indexOf(n);
        if (i < 0 || n.rez !== a) return;
        vydej.splice(i, 1);
        a.nese.push({ napoj: { id: n.id, kvalita: n.kvalita, plneni: n.plneni }, parta: n.pro });
      });
      zvuk.cink(hlasitostU(a.x, a.z) * 0.7);
      a.ukol = null;
      break;
    case 'roznaset': {
      if (a.cekat < 0.5) break;
      const it = a.nese[0];
      if (!it) { a.ukol = null; break; }
      if (it.listek) {
        if (it.listek.stav === 'nese') { dorucJidlo(it.listek, a); rekniPersonal(a, 'jidlo'); }
        a.nese.shift();
      } else {
        const ok = it.parta && it.parta.stav === 'ceka_pivo' && dorucNapoj(it.parta, it.komu, it.napoj, a);
        if (ok) { a.nese.shift(); if (Math.random() < 0.5) rekniPersonal(a, 'nese'); }
      }
      a.ukol = null;
      break;
    }
  }
}

// Když se pomocník dlouho nehýbe, přepočítá cestu; když ani to nepomůže, posune se dál
let zaseknutiPersonalu = 0; // jen pro testy: kolikrát se musel někdo „posunout“
function hlidejZaseknuti(a, dt) {
  const z = a.zasek;
  z.cas += dt;
  if (z.cas < 2.5) return;
  if (vzdalenost(a.x, a.z, z.x, z.z) < 0.08 && a.cesta.length) {
    z.pokusu++;
    if (z.pokusu >= 2 && a.cesta.length) { const b = a.cesta.shift(); a.x = b.x; a.z = b.z; z.pokusu = 0; zaseknutiPersonalu++; }
    else a.cesta = najdiCestu(a.x, a.z, a.ukol.kam.x, a.ukol.kam.z);
  }
  z.cas = 0; z.x = a.x; z.z = a.z;
}

function aktualizujPersonal(dt) {
  PERSONAL.forEach((def) => {
    if (HRA.vylepseni[def.id] && !personal.some((a) => a.def === def)) personal.push(vytvorPomocnika(def));
  });
  personal.forEach((a) => aktualizujPomocnika(a, dt));
}

/* ---------- Výdej na konci pultu: sem pokládáš nápoje pro číšníky ---------- */
function polohaNaVydeji(slot) {
  const v = SVET.vydej;
  return { x: v.x0 + 0.08 + (slot % 4) * 0.115, y: SVET.pult.y + 0.006, z: v.z0 + 0.12 + Math.floor(slot / 4) * 0.13 };
}
function polozNaVydej(napoj) {
  for (let s = 0; s < NASTAVENI.kapacitaVydeje; s++) {
    if (!vydej.some((n) => n.slot === s)) { vydej.push({ id: napoj.id, kvalita: napoj.kvalita, plneni: napoj.plneni, rez: null, slot: s }); return true; }
  }
  return false;
}
const pocetCisniku = () => personal.filter((a) => a.role === 'cisnik').length;

function pouzijVydej() {
  const napoje = ruce.piva.filter((x) => !x.listek);
  if (napoje.length) {
    if (!pocetCisniku()) { ukazToast('🤵 Výdej je pro číšníky – najmi si je v knize (záložka Personál).'); return; }
    let polozeno = 0;
    napoje.forEach((n) => { if (polozNaVydej(n)) { ruce.piva.splice(ruce.piva.indexOf(n), 1); polozeno++; } });
    if (!polozeno) { ukazToast('✋ Výdej je plný – počkej, až číšníci nápoje rozeberou.'); return; }
    zvuk.cink();
    ukazToast(`🤵 Na výdeji: ${polozeno} ${polozeno === 1 ? 'nápoj' : polozeno < 5 ? 'nápoje' : 'nápojů'}. Číšníci je roznesou.`);
    return;
  }
  const volny = vydej.filter((n) => !n.rez);
  if (volny.length && !ruce.sklenice.length && ruce.piva.length < unosnostPiv()) {
    const n = volny[volny.length - 1];
    vydej.splice(vydej.indexOf(n), 1);
    ruce.piva.push({ id: n.id, kvalita: n.kvalita, plneni: n.plneni });
    zvuk.cink();
    return;
  }
  ukazToast(pocetCisniku() ? '🤵 Sem polož nápoje a číšníci je roznesou hostům.' : '🤵 Výdej je pro číšníky – najmi si je v knize (záložka Personál).');
}
/* =========================================================
   18) KRESLENÍ SNÍMKU
   ========================================================= */
const JEDNOTKOVA = M4.jednotkova();
let matProj = M4.jednotkova();
let matPohled = M4.jednotkova();
let matPP = M4.jednotkova();         // projekce × pohled (pro bubliny nad hlavami)
const NEREZ = new Float32Array([0.74, 0.77, 0.8, 1]);
const NEREZ_PRAZDNY = new Float32Array([0.55, 0.56, 0.58, 1]);
const CERNA = new Float32Array([0.08, 0.07, 0.07, 1]);
const CARKA = new Float32Array([0.15, 0.1, 0.2, 1]);
const KOV = new Float32Array([0.82, 0.84, 0.88, 1]);
const PENEZENKA = new Float32Array([0.12, 0.09, 0.07, 1]);
const STIN_AO = new Float32Array([0, 0, 0, 1]);
// se skutečným zastíněním koutů (SSAO) stačí namalované přechody slabší
const STIN_AO_SLABY = new Float32Array([0, 0, 0, 0.55]);

// Rozlišení se samo přizpůsobí výkonu zařízení (když se hra zadrhává, kreslí se v menším rozlišení)
const vykon = { skala: 1, soucet: 0, pocet: 0 };
function zmerVykon(dt) {
  vykon.soucet += dt;
  vykon.pocet++;
  if (vykon.pocet < 40) return;
  const prumer = vykon.soucet / vykon.pocet;
  if (prumer > 0.026 && vykon.skala > 0.5) vykon.skala = Math.max(0.5, vykon.skala * 0.85);
  else if (prumer < 0.0175 && vykon.skala < 1) vykon.skala = Math.min(1, vykon.skala * 1.08);
  // když se hra zadrhává i v nejmenším rozlišení, sama sníží kvalitu grafiky
  // (jen když si hráč kvalitu nevybral sám)
  if (prumer > 0.038 && vykon.skala <= 0.62 && REZIM === 'hra' && !HRA.nastaveni.kvalita && kvalitaGrafiky !== 'nizka') {
    vykon.pomalych = (vykon.pomalych || 0) + 1;
    if (vykon.pomalych >= 2) {
      const dalsi = kvalitaGrafiky === 'vysoka' ? 'stredni' : 'nizka';
      pouzijKvalitu(dalsi);
      vykon.skala = 0.8;
      vykon.pomalych = 0;
      aktualizujTlacitkoZvuku();
      ukazToast(`🎨 Hra se zadrhávala, grafika je teď ${NAZVY_KVALITY[dalsi]}. Změníš ji v pauze.`, 4200);
    }
  } else {
    vykon.pomalych = 0;
  }
  vykon.soucet = 0;
  vykon.pocet = 0;
}
// nejvyšší hustota pixelů podle kvality grafiky
function maxDpr() {
  const dotyk = vstup.dotykove;
  if (kvalitaGrafiky === 'nizka') return dotyk ? 0.85 : 1;
  if (kvalitaGrafiky === 'stredni') return dotyk ? 1.1 : 1.25;
  return dotyk ? 1.5 : 2;
}
function velikostPlatna() {
  const dpr = Math.min(window.devicePixelRatio || 1, maxDpr()) * vykon.skala;
  const w = Math.round(window.innerWidth * dpr), hgt = Math.round(window.innerHeight * dpr);
  if (platno.width !== w || platno.height !== hgt) { platno.width = w; platno.height = hgt; }
}

function kresliSud(x, z, y, pivo, prazdny, sCouplerem) {
  kresli(SITE.sud, M4.posun(x, y, z), textury.chrom, prazdny ? NEREZ_PRAZDNY : NEREZ, 0.22, null, 0, 0.75);
  if (pivo) kresli(SITE.valec, M4.krat(M4.posun(x, y + 0.24, z), M4.meritko(0.346, 0.09, 0.346)), null, pivo._pruh);
  if (sCouplerem) {
    kresliKostku(x, y + 0.66, z, 0.09, 0.06, 0.09, CERNA);
    kresliKostku(x + 0.05, y + 0.7, z, 0.1, 0.015, 0.02, CERNA);
  }
}

// Stoh prázdného nádobí v ruce (sklenice a talíře)
function kresliKomin(x, y, z, polozky, otoceni) {
  let vyska = 0;
  polozky.slice(0, 7).forEach((id, i) => {
    if (jeTalir(id)) { kresliTalir(x, y + vyska, z, id.slice(6), 0, otoceni, 0.85); vyska += 0.02; }
    else { kresliSklenici(x, y + vyska, z, 0, null, { typ: (najdiPivo(id) || PIVA[0]).sklo, zbytek: i === 0, otoceni }); vyska += 0.04; }
  });
}

function kresliSvet(cas) {
  const P = SVET.pult.y;
  // výčepní páky se štítky a sklenice pod kohouty
  const zOblouku = (SVET.vezZ + SVET.kohoutZ) / 2;
  kohouty.forEach((k) => {
    if (!jeNaCepu(k.pivo)) return;
    // páka na vršku oblouku: při čepování se překlopí k výčepnímu
    const zaklad = M4.retez(M4.posun(k.x, P + 0.415, zOblouku), M4.rotX(-0.6 * k.packa));
    kresli(SITE.valec, M4.retez(zaklad, M4.meritko(0.034, 0.03, 0.034)), textury.chrom, BAREVNY_CHROM, 0.3, null, 0, 0.9);
    kresli(SITE.pakaSit, M4.retez(zaklad, M4.posun(0, 0.025, 0)), null, k.pivo._packa, 0.08, null, 0, 0.4);
    kresli(SITE.koule, M4.retez(zaklad, M4.posun(0, 0.205, 0), M4.meritko(0.036, 0.036, 0.036)), null, k.pivo._pruh, 0.1, null, 0, 0.5);
    const stitek = ATLAS['stitek_' + k.pivo.id];
    kresli(SITE.ctverec, M4.retez(zaklad, M4.posun(0, 0.125, -0.0215), M4.rotY(Math.PI), M4.meritko(0.115, 0.043, 1)), textury.atlas, null, 0.5, stitek);
    kresli(SITE.ctverec, M4.retez(zaklad, M4.posun(0, 0.125, 0.0215), M4.meritko(0.115, 0.043, 1)), textury.atlas, null, 0.5, stitek);
    if (k.sklenice) kresliSklenici(k.x, P + 0.024, SVET.kohoutZ + 0.02, k.sklenice.plneni, k.pivo, { otoceni: Math.PI });
    const s = sud(k.pivo.id);
    if (s.zbyva <= 3) {
      // kontrolka nad pákou: dochází / prázdný sud
      const blik = s.zbyva <= 0 ? (Math.sin(cas * 8) > 0 ? 1 : 0.3) : 0.8;
      kresli(SITE.koule, M4.retez(M4.posun(k.x, P + 0.69, zOblouku), M4.meritko(0.022, 0.022, 0.022)), null, s.zbyva <= 0 ? rgba([1, 0.15, 0.1]) : rgba([1, 0.65, 0.1]), blik);
    }
  });
  // proud piva
  if (cepuje && cepuje.sklenice) {
    const k = cepuje;
    const t = TVARY_SKLENIC[k.pivo.sklo];
    const hladina = P + 0.024 + t.dno + omez(k.sklenice.plneni, 0, 100) / 100 * t.vyska;
    const horni = P + 0.258;
    const r = 0.0055 + Math.sin(cas * 40) * 0.001;
    kresli(SITE.valec, M4.krat(M4.posun(k.x, hladina, SVET.kohoutZ + 0.02), M4.meritko(r * 2, Math.max(0.01, horni - hladina), r * 2)), null, k.pivo._barva, 0.2, null, 1);
  }
  // lahve s pálenkou ve stojanu; při nalévání se lahev zvedne a nakloní nad panákovku
  const yZ = SVET.zadniPult.y;
  lahve.forEach((l) => {
    if (!jeNaCepu(l.panak)) return;
    const m = maticeLahve(l);
    kresliLahev(m, l.panak);
    if (l.sklenka) kresliSklenici(l.x, yZ + 0.006, SVET.panakZ, l.sklenka.plneni, l.panak);
    if (nalevaLahev === l && l.naklon > 0.82) {
      const spicka = spickaLahve(m, l.panak);
      const t = TVARY_SKLENIC.panak;
      const hladina = yZ + 0.006 + t.dno + omez(l.sklenka ? l.sklenka.plneni : 0, 0, 100) / 100 * t.vyska;
      const r = 0.0028 + Math.sin(cas * 50) * 0.0004;
      kresli(SITE.valec, M4.krat(M4.posun(l.x, hladina, SVET.panakZ), M4.meritko(r * 2, Math.max(0.005, spicka[1] - hladina), r * 2)), null, l.panak._barva, 0.25);
    }
  });
  // zásoba každého druhu na spodní polici vpravo od tabule
  PANAKY.forEach((p, i) => kresliLahev(M4.posun(2.58 + i * 0.2, 1.45, 0.17), p, false));
  const rp = SVET.regalPanaku;
  for (let i = 0; i < Math.min(cistePanakovky, 18); i++) {
    const sl = i % 6, ra = Math.floor(i / 6);
    pruhledne.push({ sit: SITE.sklo.panak, hladke: true, m: M4.retez(M4.posun(rp.x0 + 0.06 + sl * 0.12, yZ + 0.02 + TVARY_SKLENIC.panak.vyskaSkla, 0.15 + ra * 0.13), M4.rotX(Math.PI)) });
  }
  // čisté sklenice v regálu (dnem vzhůru)
  const reg = SVET.regal;
  for (let i = 0; i < Math.min(cisteSklenice, 36); i++) {
    const sl = i % 12, ra = Math.floor(i / 12);
    const typ = ['pulitr', 'valec', 'pulitr', 'pohar'][(sl + ra) % 4];
    const vyska = TVARY_SKLENIC[typ].vyskaSkla;
    pruhledne.push({ sit: SITE.sklo[typ], hladke: typ !== 'pulitr', m: M4.retez(M4.posun(reg.x0 + 0.09 + sl * 0.14, SVET.zadniPult.y + 0.033 + vyska, 0.14 + ra * 0.13), M4.rotX(Math.PI)) });
  }
  // nápoje na výdeji pro číšníky
  vydej.forEach((n) => {
    const p = polohaNaVydeji(n.slot);
    kresliSklenici(p.x, p.y, p.z, n.plneni || 90, najdiPivo(n.id), { otoceni: Math.PI });
  });
  // prázdné (nebo nedopité) sklenice a talíře po hostech
  spinave.forEach((s) => {
    if (s.talir) { kresliTalir(s.x, s.y, s.z, s.talir, s.mnozstvi || 0, 0.4); return; }
    const pivo = najdiPivo(s.pivo) || PIVA[0];
    kresliSklenici(s.x, s.y, s.z, s.zbyva ? s.zbyva * 90 : 0, s.zbyva ? pivo : null, { typ: pivo.sklo, zbytek: !s.zbyva, otoceni: 2.2 });
  });
  // čárky na tácku u stolů
  sedadla.forEach((s) => {
    for (let i = 0; i < Math.min(s.carky || 0, 8); i++) {
      kresliKostku(s.sklenice.x - 0.045 + i * 0.012, 0.7595, s.sklenice.z + (s.natoceni ? -0.035 : 0.035), 0.004, 0.0015, 0.035, CARKA);
    }
  });
  // sudy ve skladu
  PIVA.forEach((p, i) => {
    if (!jeNaCepu(p)) return;
    const s = sud(p.id);
    const poz = SVET.sudPoz(i);
    kresliSud(poz.x, poz.z, 0.12, p, s.zbyva <= 0, true);
    if (s.zbyva <= 3) {
      const blik = s.zbyva <= 0 ? (Math.sin(cas * 8) > 0 ? 1 : 0.3) : 0.8;
      kresli(SITE.koule, M4.retez(M4.posun(poz.x, 0.86, poz.z), M4.meritko(0.022, 0.022, 0.022)), null, s.zbyva <= 0 ? rgba([1, 0.15, 0.1]) : rgba([1, 0.65, 0.1]), blik);
    }
  });
  let slot = 0;
  PIVA.forEach((p) => {
    if (!jeNaCepu(p)) return;
    for (let j = 0; j < sud(p.id).zasoba && slot < 16; j++, slot++) {
      const vrstva = Math.floor(slot / 8), poz = slot % 8;
      kresliSud(11.42 + (poz % 4) * 0.4, 2.05 + Math.floor(poz / 4) * 0.36, 0.14 + vrstva * 0.62, p, false, false);
    }
  });
  for (let i = 0; i < Math.min(HRA.prazdneSudy || 0, 4); i++) kresliSud(13.3 + (i % 2) * 0.38, 2.3, 0.01 + Math.floor(i / 2) * 0.62, null, true, false);
  // dveře + cedulka
  const D = SVET.hloubka, dv = SVET.dvere;
  const dvereM = M4.retez(M4.posun(dv.x0, 0, D + 0.075), M4.rotY(dvere.uhel));
  kresli(SITE.kostka, M4.retez(dvereM, M4.posun((dv.x1 - dv.x0) / 2, dv.vyska / 2, 0), M4.meritko(dv.x1 - dv.x0 - 0.02, dv.vyska - 0.02, 0.06)), textury.drevo, rgba([0.75, 0.52, 0.36]));
  kresli(SITE.kostka, M4.retez(dvereM, M4.posun(1.05, 1.0, -0.05), M4.meritko(0.12, 0.03, 0.04)), null, rgba([0.85, 0.68, 0.25]), 0, null, 0, 0.8);
  kresli(SITE.ctverec, M4.retez(dvereM, M4.posun(SVET.cedule.x - dv.x0, SVET.cedule.y, -0.032), M4.rotY(Math.PI), M4.meritko(0.5, 0.19, 1)),
    textury.atlas, null, 0.3, HRA.otevreno ? ATLAS.otevreno : ATLAS.zavreno);
  // ručičky hodin podle skutečného času
  const ted = new Date();
  const ruc = (uhel, delka, tloustka) => kresli(SITE.kostka, M4.retez(M4.posun(SVET.sirka - 0.06, 2.45, SVET.hodinyZ), M4.rotX(uhel), M4.posun(0, delka / 2, 0), M4.meritko(0.01, delka, tloustka)), null, CERNA);
  ruc(((ted.getHours() % 12) + ted.getMinutes() / 60) / 12 * Math.PI * 2, 0.11, 0.022);
  ruc((ted.getMinutes() + ted.getSeconds() / 60) / 60 * Math.PI * 2, 0.17, 0.014);
  // televize a jukebox
  if (HRA.vylepseni.televize) kresli(SITE.ctverec, M4.retez(M4.posun(SVET.sirka - 0.105, 2.15, SVET.tvZ), M4.rotY(-Math.PI / 2), M4.meritko(1.42, 0.72, 1)), textury.tv, null, 0.9);
  if (HRA.vylepseni.jukebox) {
    const b = [0.5 + 0.5 * Math.sin(cas * 3), 0.5 + 0.5 * Math.sin(cas * 3 + 2), 0.5 + 0.5 * Math.sin(cas * 3 + 4)];
    kresli(SITE.kostka, M4.krat(M4.posun(0.29, 1.5, SVET.jukeboxZ), M4.meritko(0.5, 0.1, 0.78)), null, rgba(b), 1);
  }
  // kuchyně: talíře na okénku a lístky na tyčce
  if (maKuchyni()) {
    kuchyne.okenko.forEach((l) => { const p = polohaNaOkenku(l.slot); kresliTalir(p.x, p.y, p.z, l.jidlo.id, 1, 0.3 * l.slot); });
    const o = SVET.kuchyne.okenko, zs = SVET.kuchyne.stena + 0.012;
    const cekaji = [...kuchyne.fronta, ...kuchyne.okenko].slice(0, 7);
    cekaji.forEach((l, i) => {
      const x = o.x0 + 0.14 + i * 0.2, vari = l.stav === 'vari';
      kresli(SITE.ctverec, M4.retez(M4.posun(x, o.y1 + 0.02, zs + 0.045), M4.rotZ((i % 2 ? 0.05 : -0.04)), M4.meritko(0.075, 0.11, 1)), textury.atlas, vari ? rgba([1, 0.95, 0.8]) : null, 0.35, ATLAS.listek);
    });
  }
  // hosté, personál, kuchařka, kocour
  hoste.forEach((h) => kresliPostavu(h, cas));
  personal.forEach((a) => kresliPostavu(a, cas));
  if (kuchyne.kucharka) kresliPostavu(kuchyne.kucharka, cas);
  kresliKocku(cas);
  // co mají hosté před sebou: pivo, panák, talíř
  hoste.forEach((h) => {
    if (!h.misto) return;
    if (h.jidlo) {
      const t = h.misto.talir;
      kresliTalir(t.x, t.y, t.z, h.jidlo.id, h.jidlo.zbyva, h.natoceni);
      // vidlička v ruce při jídle
      if (h.ji > 0.05 && h._smerRuky) {
        const [sx, sy, sz] = h._smerRuky, l = Math.hypot(sx, sy, sz) || 1;
        const uhelY = Math.atan2(sx, sz), uhelX = -Math.asin(sy / l);
        kresli(SITE.vidlicka, M4.retez(M4.posun(...h._ruka), M4.rotY(uhelY), M4.rotX(uhelX)), null, KOV, 0, null, 0, 0.8);
      }
    }
    if (!h.piva.length) return;
    let aktivni = h.piva.findIndex((x) => x.zbyva > 0 && jePanak(x.id));
    if (aktivni < 0) aktivni = h.piva.findIndex((x) => x.zbyva > 0);
    h.piva.forEach((pv, i) => {
      const pivo = najdiPivo(pv.id);
      if (i === aktivni && (h.napiti > 0.4 || h.pripitek > 0.4)) {
        kresliSklenici(h._ruka[0], h._ruka[1] - 0.09, h._ruka[2], pv.zbyva * (pv.plneni || 90), pivo, { otoceni: h.natoceni });
        return;
      }
      const s = poziceSklenice(h.misto, i);
      kresliSklenici(s.x, s.y, s.z, pv.zbyva * (pv.plneni || 90), pivo, { zbytek: pv.zbyva <= 0, otoceni: h.natoceni - Math.PI / 2 });
    });
  });
  // co nese personál
  personal.forEach((a) => {
    if (!a.nese.length && !(a.role === 'pokladni' && a.podnos > 0.3)) return;
    const r = a._ruka, l = a._levaRuka;
    if (a.role === 'sberac') {
      kresliKomin(r[0], r[1] - 0.12, r[2], a.nese.map((n) => (n.talir ? 'talir:' + n.talir : n.pivo)), a.natoceni);
    } else if (a.role === 'cisnik') {
      // tác v obou rukou
      const cx = (r[0] + l[0]) / 2, cy = (r[1] + l[1]) / 2 - 0.035, cz = (r[2] + l[2]) / 2;
      kresli(SITE.valec, M4.retez(M4.posun(cx, cy, cz), M4.meritko(0.36, 0.012, 0.36)), textury.chrom, NEREZ, 0.2, null, 0, 0.7);
      a.nese.forEach((n, i) => {
        const u = a.natoceni + (i - (a.nese.length - 1) / 2) * 1.2;
        const px = cx + Math.sin(u) * 0.08 * (a.nese.length > 1 ? 1 : 0), pz = cz + Math.cos(u) * 0.08 * (a.nese.length > 1 ? 1 : 0);
        if (n.listek) kresliTalir(px, cy + 0.012, pz, n.listek.jidlo.id, 1, a.natoceni, 0.85);
        else kresliSklenici(px, cy + 0.012, pz, n.napoj.plneni || 90, najdiPivo(n.napoj.id), { otoceni: a.natoceni });
      });
    } else {
      // pokladní: peněženka v ruce
      kresli(SITE.kostka, M4.retez(M4.posun(r[0], r[1] - 0.02, r[2]), M4.rotY(a.natoceni), M4.meritko(0.11, 0.07, 0.03)), null, PENEZENKA, 0, null, 0, 0.3);
    }
  });
  // kuchařka nese talíře na okénko
  const k = kuchyne.kucharka;
  if (k && k.nese.length) {
    const r = k._ruka, l = k._levaRuka;
    k.nese.forEach((n, i) => { const p = i ? l : r; kresliTalir(p[0], p[1] - 0.05, p[2], n.jidlo.id, 1, k.natoceni, 0.9); });
  }
  // ukazatel cíle z návodu
  const ukaz = ukazatelNavodu();
  const vzdal = ukaz ? Math.hypot(ukaz[0] - hrac.x, ukaz[2] - hrac.z) : 0;
  if (ukaz && vzdal > 1.4) {
    const y = ukaz[1] + 0.2 + Math.sin(cas * 4) * 0.05;
    const s = omez(0.03 + vzdal * 0.012, 0.04, 0.12);
    kresli(SITE.kostka, M4.retez(M4.posun(ukaz[0], y, ukaz[2]), M4.rotY(cas * 2), M4.rotZ(Math.PI / 4), M4.rotX(Math.PI / 4), M4.meritko(s, s, s)), null, rgba([1, 0.8, 0.15]), 1);
  }
}

// Co držíš v rukou – kreslí se „před kamerou“
function kresliRuce() {
  if (!ruce.piva.length && !ruce.sklenice.length) return;
  // věci v rukou musí být vždy před vším ostatním: buď se smaže hloubka, nebo
  // (když se z hloubky počítá zastínění koutů) se nakreslí do úzkého pásma u kamery
  if (rend.aoSnimek) gl.depthRange(0, 0.002); else gl.clear(gl.DEPTH_BUFFER_BIT);
  const oko = polohaOci();
  const kyv = Math.sin(hrac.houpani) * 0.012 * hrac.jde;
  const kamera = M4.retez(M4.posun(oko[0], oko[1], oko[2]), M4.rotY(hrac.yaw), M4.rotX(hrac.pitch));
  const bod = (x, y, z) => M4.bod(kamera, x, y, z);
  const kuze = rgba([0.93, 0.76, 0.62]);
  const rukav = rgba([0.92, 0.9, 0.86]);
  // ruka s kouskem rukávu bílé košile; strana 1 = pravá, -1 = levá
  const ruka = (x, y, z, strana = 1) => {
    const m = M4.retez(kamera, M4.posun(x, y, z), M4.rotX(0.5), M4.rotY(-0.4 * strana));
    kresli(SITE.oblaKostka, M4.retez(m, M4.meritko(0.05, 0.055, 0.12)), null, kuze);
    kresli(SITE.oblaKostka, M4.retez(m, M4.posun(0, -0.005, 0.12), M4.meritko(0.075, 0.075, 0.15)), null, rukav);
  };
  const naTacu = HRA.vylepseni.tac && ruce.piva.length > 2;
  // na úzkém displeji (telefon na výšku) drž věci blíž středu, ať jsou vidět
  const bok = 0.2 * omez(platno.width / platno.height / 1.5, 0.45, 1);
  const vec = (pv, x, y, z) => {
    const p = bod(x, y, z);
    if (pv.listek) kresliTalir(p[0], p[1] + 0.02, p[2], pv.listek.jidlo.id, 1, hrac.yaw, 0.9);
    else kresliSklenici(p[0], p[1], p[2], pv.plneni || 90, najdiPivo(pv.id), { otoceni: hrac.yaw });
  };
  if (ruce.piva.length && !naTacu) {
    // v každé ruce jedna věc
    ruce.piva.forEach((pv, i) => {
      const strana = i === 0 ? 1 : -1;
      vec(pv, bok * strana, -0.27 + kyv, -0.44);
      ruka((bok + 0.085) * strana, -0.21 + kyv, -0.42, strana);
    });
  } else if (ruce.piva.length) {
    kresli(SITE.valec, M4.retez(kamera, M4.posun(0.1, -0.345 + kyv, -0.62), M4.meritko(0.42, 0.012, 0.32)), textury.chrom, rgba([0.75, 0.77, 0.8]), 0.2, null, 0, 0.6);
    ruce.piva.forEach((pv, i) => vec(pv, -0.005 + (i % 3) * 0.1, -0.339 + kyv, -0.57 - Math.floor(i / 3) * 0.1));
    ruka(0.3, -0.365 + kyv, -0.55);
  } else {
    // prázdné nádobí v komínku – napřed v pravé, pak v levé ruce
    const prava = ruce.sklenice.slice(0, 5), leva = ruce.sklenice.slice(5);
    const p1 = bod(bok, -0.31 + kyv, -0.46);
    kresliKomin(p1[0], p1[1], p1[2], prava, hrac.yaw);
    ruka(bok + 0.085, -0.25 + kyv, -0.44);
    if (leva.length) {
      const p2 = bod(-bok, -0.31 + kyv, -0.46);
      kresliKomin(p2[0], p2[1], p2[2], leva, hrac.yaw);
      ruka(-bok - 0.085, -0.25 + kyv, -0.44, -1);
    }
  }
  kresliPruhledne();
  gl.depthRange(0, 1);
}

// Jak hluboký je reliéf textur (v metrech): spáry mezi cihlami, prkny a dlaždicemi
const RELIEF_DAVEK = { podlaha: 0.0022, cihly: 0.0055, omitka: 0.0011, dlazba: 0.0018, dlazbaK: 0.0018, kachlicky: 0.0014, drevo: 0.0006, ubrus: 0.0004 };

// Broušené a matnější povrchy mají rozmazanější odraz okolí (1 = ostrý jako chrom)
const ROZMAZ_DAVEK = { nerez: 1.55, dlazbaK: 1.4, kachlicky: 1.25, podlaha: 1.15 };

// Statická scéna (stěny, nábytek, výzdoba) + tmavé kouty a stíny
function kresliStatiku(proSondu) {
  const odrazy = material.odrazy;
  staticke.forEach((s) => {
    const tex = textury[s.tex];
    material.relief = cfg.relief ? (RELIEF_DAVEK[s.tex] || 0) : 0;
    material.texel = tex._texel || null;
    material.odrazy = odrazy ? (ROZMAZ_DAVEK[s.tex] || 1) : 0;
    kresli(s.sit, JEDNOTKOVA, tex, null, 0, null, 0, LESK_DAVEK[s.tex] || 0);
  });
  material.relief = 0;
  material.odrazy = odrazy;
  // stíny pod nábytkem (jen když nejsou skutečné), tmavé kouty u stěn a stíny postav
  nastavProlnuti('alfa');
  gl.depthMask(false);
  if (stinySit && !stinyAktivni()) kresli(stinySit, JEDNOTKOVA, textury.stin, BILA4);
  if (aoSit) kresli(aoSit, JEDNOTKOVA, null, rend.aoSnimek && !proSondu ? STIN_AO_SLABY : STIN_AO);
  if (!proSondu) stinyPostav(!(stinyAktivni() && cfg.dynStiny));
  gl.depthMask(true);
  nastavProlnuti(null);
}

function vykresliSnimek(cas) {
  velikostPlatna();
  const pomer = platno.width / platno.height;
  const fov = omez(2 * Math.atan(Math.tan(Math.PI / 4) / pomer), 0.95, 1.72) + (REZIM === 'menu' ? 0 : hrac.fovNavic || 0);
  matProj = M4.perspektiva(fov, pomer, 0.04, 60);
  rend.kamera.tanY = Math.tan(fov / 2);
  rend.kamera.pomer = pomer;
  let oko, yaw, pitch, nakloneni = 0;
  if (REZIM === 'menu') {
    const t = cas * 0.06;
    oko = [10 + Math.sin(t) * 5.5, 2.1, 8.2 + Math.cos(t) * 1.6];
    yaw = Math.PI * 0.02 + Math.sin(t) * 0.45;
    pitch = -0.12;
  } else {
    oko = polohaOci();
    yaw = hrac.yaw;
    pitch = hrac.pitch;
    nakloneni = hrac.nakloneni || 0;
  }
  matPohled = M4.retez(M4.rotZ(-nakloneni), M4.rotX(-pitch), M4.rotY(-yaw), M4.posun(-oko[0], -oko[1], -oko[2]));
  matPP = M4.krat(matProj, matPohled);
  // stíny a odrazy (když je potřeba), pak scéna do textury nebo rovnou na plátno
  const cil = pripravSnimek(cas);
  gl.bindFramebuffer(gl.FRAMEBUFFER, cil);
  gl.viewport(0, 0, platno.width, platno.height);
  gl.clearColor(0.05, 0.035, 0.025, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(program);
  zrusPamatovanyStav();
  nastavSpolecne(matProj, matPohled, oko, cas);

  kresliStatiku(false);
  kresliSvet(cas);
  kresliPruhledne();
  kresliSvetelneEfekty(oko, cas);
  if (REZIM !== 'menu') kresliRuce();
  if (cil) postprocesing(cas);
}

// Kam na obrazovku padne bod ve světě (pro bubliny); null = za kamerou
function promitni(x, y, z) {
  const b = M4.bod(matPP, x, y, z);
  if (b[3] <= 0.05) return null;
  return { x: (b[0] / b[3] * 0.5 + 0.5) * window.innerWidth, y: (1 - (b[1] / b[3] * 0.5 + 0.5)) * window.innerHeight, hloubka: b[3] };
}
/* =========================================================
   18b) SVĚTELNÉ EFEKTY A ČÁSTICE
   - záře kolem žárovek, kužely světla pod lampami
   - prach poletující ve světle, pára z hrnců a horkých talířů
   - stíny postav vržené od nejbližších lamp (měkké, protáhlé)
   Všechno se skládá do „dynamických“ sítí z čtyřúhelníků.
   ========================================================= */
const castice = [];            // { x, y, z, vx, vy, vz, zivot, max, vel, rust, barva, alfa, typ, lampa }
const dyn = {};                // dynamické sítě: stiny, prach, zare, para
const PRACH_NA_LAMPU = 9;

function pripravEfekty() {
  dyn.stiny = vytvorDynamickouSit(640);
  dyn.prach = vytvorDynamickouSit(260);
  dyn.zare = vytvorDynamickouSit(110);
  dyn.para = vytvorDynamickouSit(320);
  dyn.dest = vytvorDynamickouSit(200);
}

// Počasí za okny: občas prší (déšť přijde a zase odejde, cyklus pár minut)
function silaDeste(cas) {
  return omez(Math.sin(cas / 95) * 1.6 + Math.sin(cas / 37) * 0.35 - 0.35, 0, 1);
}

// Déšť za okny: rychlé šikmé čárky venku a kapky stékající po skle
function kresliDest(cas) {
  const sila = silaDeste(cas);
  if (sila <= 0.02) return;
  const sit = dyn.dest;
  const z = SVET.hloubka - 0.016, y0 = 1.07, y1 = 2.23;
  // zatažená obloha: ztmavení oken (hvězdy zmizí v mracích)
  sit.n = 0;
  SVET.okna.forEach(([x0, x1]) => {
    dynKvadr(sit, [[x1, y0, z + 0.002], [x0, y0, z + 0.002], [x0, y1, z + 0.002], [x1, y1, z + 0.002]], [0, 0, -1], [0.1, 0.11, 0.15], 0.7 * sila);
  });
  nahrajDynamickou(sit);
  nastavProlnuti('alfa');
  kresli(sit, JEDNOTKOVA, textury.bila, BILA4, 1, null, 3);
  nastavProlnuti('pricitani');
  sit.n = 0;
  const hash = (i) => { const x = Math.sin(i * 127.1) * 43758.5453; return x - Math.floor(x); };
  SVET.okna.forEach(([x0, x1], o) => {
    const pocet = Math.round(16 * sila);
    for (let i = 0; i < pocet; i++) {
      const s = o * 40 + i;
      const rychlost = 1.6 + hash(s) * 0.9, delka = 0.07 + hash(s + 0.3) * 0.08;
      const t = (cas * rychlost / (y1 - y0) + hash(s + 0.7)) % 1;
      const y = y1 - t * (y1 - y0 + delka);
      const x = x0 + 0.05 + hash(s + 0.9) * (x1 - x0 - 0.1) + t * 0.06;
      const ya = Math.max(y0, y - delka), yb = Math.min(y1, y);
      if (yb - ya < 0.01) continue;
      const w = 0.0042;
      dynKvadr(sit, [[x + w, ya, z], [x - w, ya, z], [x - w + 0.012, yb, z], [x + w + 0.012, yb, z]], [0, 0, -1], [0.66, 0.76, 0.95], 0.55 * sila);
    }
    // kapky na skle: pomalu stékají a trochu kličkují
    for (let i = 0; i < 7; i++) {
      const s = o * 40 + 30 + i;
      const t = (cas * (0.025 + hash(s) * 0.04) + hash(s + 0.5)) % 1;
      const y = y1 - 0.03 - t * (y1 - y0 - 0.06);
      const x = x0 + 0.08 + hash(s + 0.2) * (x1 - x0 - 0.16) + Math.sin(cas * 0.8 + s) * 0.006;
      const r = 0.008 + hash(s + 0.1) * 0.006;
      dynKvadr(sit, [[x + r, y - r * 1.3, z - 0.002], [x - r, y - r * 1.3, z - 0.002], [x - r, y + r * 1.3, z - 0.002], [x + r, y + r * 1.3, z - 0.002]], [0, 0, -1], [0.8, 0.86, 1.0], 0.65 * sila);
    }
  });
  if (!sit.n) return;
  nahrajDynamickou(sit);
  kresli(sit, JEDNOTKOVA, textury.zare, BILA4, 1, null, 3);
}

function pridejCastici(c) { if (castice.length < 560) castice.push(c); }

// Kužel lampy: kde je, jak je široký (pro prach)
function kuzelLampy(s) {
  const dole = s.lampa === 'bar' ? SVET.pult.y + 0.05 : 0.8;
  return { x: s.poz[0], y0: s.poz[1] - 0.05, y1: dole, z: s.poz[2], r0: 0.18, r1: s.lampa === 'bar' ? 0.7 : 0.9 };
}

function aktualizujCastice(dt, oko) {
  if (kvalitaGrafiky === 'nizka') { castice.length = 0; return; }
  // prach ve světle: jen u lamp blízko kamery
  if (kvalitaGrafiky === 'vysoka') {
    const pocty = {};
    castice.forEach((c) => { if (c.typ === 'prach') pocty[c.lampa] = (pocty[c.lampa] || 0) + 1; });
    svetla.forEach((s, i) => {
      if (s.lampa !== 'bar' && s.lampa !== 'stul') return;
      if (vzdalenost(oko[0], oko[2], s.poz[0], s.poz[2]) > 8) return;
      if ((pocty[i] || 0) >= PRACH_NA_LAMPU || Math.random() > dt * 6) return;
      const k = kuzelLampy(s);
      const t = Math.random();
      const y = lerp(k.y0, k.y1, t * 0.85), r = lerp(k.r0, k.r1, t * 0.85) * Math.sqrt(Math.random());
      const u = Math.random() * Math.PI * 2;
      pridejCastici({ typ: 'prach', lampa: i, x: k.x + Math.sin(u) * r, y, z: k.z + Math.cos(u) * r, vx: 0, vy: 0, vz: 0,
        zivot: 0, max: nahodneCislo(5, 9), vel: nahodneCislo(0.006, 0.012), rust: 0, barva: [1, 0.86, 0.6], alfa: nahodneCislo(0.35, 0.7) });
    });
  }
  // pára z hrnců na sporáku (když se vaří), z talířů na okénku a z jídla na stole
  const para = (x, y, z, sila = 1) => {
    if (Math.random() > dt * 5 * sila) return;
    pridejCastici({ typ: 'para', x: x + nahodneCislo(-0.04, 0.04), y, z: z + nahodneCislo(-0.04, 0.04), vx: nahodneCislo(-0.03, 0.03), vy: nahodneCislo(0.18, 0.3), vz: nahodneCislo(-0.03, 0.03),
      zivot: 0, max: nahodneCislo(1.8, 2.8), vel: 0.05, rust: 0.09, barva: [0.95, 0.95, 0.95], alfa: 0.22 * Math.min(1, sila) });
  };
  if (maKuchyni()) {
    kuchyne.sporaky.forEach((l, i) => { if (l) para(...SPORAKY[i].hrnec, 1.4); });
    kuchyne.okenko.forEach((l) => { if (!l.studene) { const p = polohaNaOkenku(l.slot); para(p.x, p.y + 0.05, p.z, 0.35); } });
  }
  hoste.forEach((h) => { if (h.jidlo && casHry < (h.paraDo || 0) && h.misto) para(h.misto.talir.x, h.misto.talir.y + 0.05, h.misto.talir.z, 0.3); });
  for (let i = castice.length - 1; i >= 0; i--) {
    const c = castice[i];
    c.zivot += dt;
    if (c.zivot >= c.max) { castice.splice(i, 1); continue; }
    if (c.typ === 'prach') {
      // pomalé vznášení
      c.vx += nahodneCislo(-0.02, 0.02) * dt; c.vy += nahodneCislo(-0.02, 0.02) * dt; c.vz += nahodneCislo(-0.02, 0.02) * dt;
      c.vx *= 0.98; c.vy *= 0.98; c.vz *= 0.98;
    } else {
      c.vy *= 1 - dt * 0.3;
    }
    c.x += c.vx * dt; c.y += c.vy * dt; c.z += c.vz * dt;
    c.vel += c.rust * dt;
  }
}

// Vektory kamery doprava a nahoru (z pohledové matice)
function osyKamery() {
  const m = matPohled;
  return { prava: [m[0], m[4], m[8]], nahoru: [m[1], m[5], m[9]], dopredu: [-m[2], -m[6], -m[10]] };
}

function billboard(sit, x, y, z, vel, osy, barva, alfa, sx = 1, sy = 1) {
  const r = osy.prava, u = osy.nahoru;
  const rx = r[0] * vel * sx, ry = r[1] * vel * sx, rz = r[2] * vel * sx;
  const ux = u[0] * vel * sy, uy = u[1] * vel * sy, uz = u[2] * vel * sy;
  dynKvadr(sit, [[x - rx - ux, y - ry - uy, z - rz - uz], [x + rx - ux, y + ry - uy, z + rz - uz], [x + rx + ux, y + ry + uy, z + rz + uz], [x - rx + ux, y - ry + uy, z - rz + uz]],
    [-osy.dopredu[0], -osy.dopredu[1], -osy.dopredu[2]], barva, alfa);
}

// Měkký „kontaktní“ stín pod sklenicemi, talíři a panákovkami – ať nevypadají, že se vznáší
function kontaktniStiny(stin) {
  const P = SVET.pult.y;
  const pod = (x, y, z, r, alfa = 0.42) => stin(x, z, r * 2, r * 2, 1, 0, alfa, y + 0.0015);
  spinave.forEach((g) => pod(g.x, g.y, g.z, g.talir ? 0.13 : 0.055, g.talir ? 0.32 : 0.4));
  hoste.forEach((h) => {
    if (!h.misto) return;
    if (h.jidlo) pod(h.misto.talir.x, h.misto.talir.y, h.misto.talir.z, 0.135, 0.34);
    let aktivni = h.piva.findIndex((x) => x.zbyva > 0 && jePanak(x.id));
    if (aktivni < 0) aktivni = h.piva.findIndex((x) => x.zbyva > 0);
    h.piva.forEach((pv, i) => {
      if (i === aktivni && (h.napiti > 0.4 || h.pripitek > 0.4)) return;
      const sk = poziceSklenice(h.misto, i);
      pod(sk.x, sk.y, sk.z, jePanak(pv.id) ? 0.032 : 0.055);
    });
  });
  vydej.forEach((n) => { const v = polohaNaVydeji(n.slot); pod(v.x, v.y, v.z, 0.05); });
  if (maKuchyni()) kuchyne.okenko.forEach((l) => { const o = polohaNaOkenku(l.slot); pod(o.x, o.y, o.z, 0.13, 0.3); });
  kohouty.forEach((k) => { if (k.sklenice) pod(k.x, P + 0.024, SVET.kohoutZ + 0.02, 0.05); });
  lahve.forEach((l) => { if (l.sklenka) pod(l.x, SVET.zadniPult.y + 0.006, SVET.panakZ, 0.03); });
}

// Stíny postav od lamp: měkká skvrna pod nohama + protáhlé stíny od dvou nejsilnějších světel
// (když jsou skutečné stíny ze stínové mapy, kreslí se jen kontaktní stíny drobností)
function stinyPostav(sPostavami = true) {
  const sit = dyn.stiny;
  sit.n = 0;
  const postavy = [...hoste, ...personal, ...(kuchyne.kucharka ? [kuchyne.kucharka] : [])];
  const dva = kvalitaGrafiky !== 'nizka';
  const stin = (x, z, delka, sirka, ax, az, alfa, y = 0.006) => {
    const px = az, pz = -ax;
    const hx = ax * delka / 2, hz = az * delka / 2, wx = px * sirka / 2, wz = pz * sirka / 2;
    dynKvadr(sit, [[x - hx - wx, y, z - hz - wz], [x + hx - wx, y, z + hz - wz], [x + hx + wx, y, z + hz + wz], [x - hx + wx, y, z - hz + wz]], [0, 1, 0], [0, 0, 0], alfa);
  };
  kontaktniStiny(stin);
  if (!sPostavami) {
    if (sit.n) { nahrajDynamickou(sit); kresli(sit, JEDNOTKOVA, textury.stin, BILA4); }
    return;
  }
  postavy.forEach((p) => {
    if (!p.sit) return;
    const sedi = p.sedi > 0.5;
    stin(p.x, p.z, sedi ? 0.5 : 0.62, sedi ? 0.5 : 0.62, 1, 0, sedi ? 0.35 : 0.7);
    if (!dva) return;
    const mi = mistnostBodu(p.x, p.z);
    const vlivy = [];
    svetla.forEach((s) => {
      if (s.mistnost !== mi || s.sila <= 0) return;
      const dx = p.x - s.poz[0], dz = p.z - s.poz[2], dy = s.poz[1] - 1.0;
      const d2 = dx * dx + dz * dz + dy * dy;
      vlivy.push({ s, vliv: s.sila / (1 + d2 * 0.5), dx, dz, h: Math.hypot(dx, dz) });
    });
    vlivy.sort((a, b) => b.vliv - a.vliv);
    const soucet = vlivy.slice(0, 3).reduce((a, b) => a + b.vliv, 0) || 1;
    vlivy.slice(0, 2).forEach((v) => {
      if (v.h < 0.05) return;
      const ax = v.dx / v.h, az = v.dz / v.h;
      const delka = 0.5 + Math.min(1.6, v.h / Math.max(0.6, v.s.poz[1] - 0.2)) * 0.9;
      const alfa = 0.55 * (v.vliv / soucet) * (sedi ? 0.5 : 1);
      stin(p.x + ax * (delka / 2 - 0.12), p.z + az * (delka / 2 - 0.12), delka, 0.42, ax, az, alfa);
    });
  });
  stin(kocka.x, kocka.z, 0.42, 0.42, 1, 0, 0.6);
  nahrajDynamickou(sit);
  kresli(sit, JEDNOTKOVA, textury.stin, BILA4);
}

// Záře kolem žárovek a světelné kužely (sčítají se se scénou)
function kresliSvetelneEfekty(oko, cas) {
  const osy = osyKamery();
  nastavProlnuti('pricitani');
  gl.depthMask(false);
  if (kuzelySit && kvalitaGrafiky !== 'nizka') {
    gl.disable(gl.CULL_FACE);
    kresli(kuzelySit, JEDNOTKOVA, null, new Float32Array([1, 1, 1, 0.075]), 1, null, 2);
    gl.enable(gl.CULL_FACE);
  }
  // záře
  const z = dyn.zare;
  z.n = 0;
  svetla.forEach((s) => {
    if (s.sila <= 0) return;
    const [x, y, zz] = s.poz;
    const k = vzdalenost(oko[0], oko[2], x, zz);
    const dx = oko[0] - x, dy = oko[1] - y, dz = oko[2] - zz, l = Math.hypot(dx, dy, dz) || 1;
    // kousek ke kameře, ať záři neusekne stínidlo
    const o = Math.min(0.2, l * 0.3);
    const px = x + dx / l * o, py = y - 0.03 + dy / l * o, pz = zz + dz / l * o;
    if (s.lampa === 'kuchyne') billboard(z, px, 3.08, pz, 0.55, osy, [0.9, 0.95, 1], 0.28, 1.6, 0.5);
    else if (s.lampa === 'sklad') billboard(z, x, 2.82, zz, 0.4, osy, [1, 0.85, 0.55], 0.4);
    else billboard(z, px, py, pz, s.lampa === 'bar' ? 0.42 : 0.48, osy, [1, 0.8, 0.5], omez(0.25 + k * 0.04, 0.25, 0.55));
  });
  // ohřívací lampy u okénka svítí do červena
  if (maKuchyni() && HRA.vylepseni.ohrivac) {
    const ok = SVET.kuchyne.okenko, zs = (SVET.kuchyne.z1 + SVET.kuchyne.stena) / 2;
    [ok.x0 + 0.4, ok.x1 - 0.4].forEach((x) => billboard(z, x, ok.y1 - 0.22, zs + 0.1, 0.3, osy, [1, 0.4, 0.15], 0.5));
  }
  // plamínky svíček na stolech (mihotají se, každý jinak)
  svicky.forEach((sv) => {
    const m = 0.86 + 0.09 * Math.sin(cas * 13 + sv.faze) + 0.05 * Math.sin(cas * 29 + sv.faze * 3);
    billboard(z, sv.x, sv.y + 0.012 * m, sv.z, 0.012 * m, osy, [1, 0.6, 0.2], 0.95, 0.72, 1.7);
    billboard(z, sv.x, sv.y + 0.009, sv.z, 0.0065, osy, [1, 0.95, 0.75], 1, 0.7, 1.25);
    billboard(z, sv.x, sv.y + 0.02, sv.z, 0.1 * m, osy, [1, 0.5, 0.18], 0.13);
  });
  // neon a jukebox
  billboard(z, 0.2, 2.1, SVET.jukeboxZ, 0.75, osy, [1, 0.55, 0.25], 0.16 + Math.sin(cas * 3) * 0.02, 1.4, 0.6);
  if (HRA.vylepseni.televize) billboard(z, SVET.sirka - 0.3, 2.15, SVET.tvZ, 0.9, osy, [0.5, 0.7, 1], 0.12, 1.2, 0.7);
  nahrajDynamickou(z);
  kresli(z, JEDNOTKOVA, textury.zare, BILA4, 1, null, 3);
  kresliDest(cas);
  // prach ve světle
  if (castice.length) {
    const p = dyn.prach;
    p.n = 0;
    castice.forEach((c) => {
      if (c.typ !== 'prach') return;
      const t = c.zivot / c.max;
      const a = c.alfa * Math.min(1, t * 4) * Math.min(1, (1 - t) * 4) * (0.6 + 0.4 * Math.sin(cas * 2 + c.x * 7));
      billboard(p, c.x, c.y, c.z, c.vel, osy, c.barva, a);
    });
    nahrajDynamickou(p);
    kresli(p, JEDNOTKOVA, textury.tecka, BILA4, 1, null, 3);
  }
  // pára (normální průhlednost)
  nastavProlnuti('alfa');
  if (castice.length) {
    const p = dyn.para;
    p.n = 0;
    castice.forEach((c) => {
      if (c.typ !== 'para') return;
      const t = c.zivot / c.max;
      billboard(p, c.x, c.y, c.z, c.vel, osy, c.barva, c.alfa * Math.min(1, t * 5) * (1 - t));
    });
    if (p.n) {
      nahrajDynamickou(p);
      kresli(p, JEDNOTKOVA, textury.para, BILA4, 1, null, 3);
    }
  }
  gl.depthMask(true);
  nastavProlnuti(null);
}
/* =========================================================
   18c) VYKRESLOVACÍ CESTA
   1. stínová mapa: hloubka scény při pohledu shora – nábytek,
      pulty, sudy a (na vysoké kvalitě) i postavy vrhají měkké stíny,
   2. sondy odrazů: krychlové mapy sálu, skladu a kuchyně
      (podlaha, lakovaný pult, sklo, chrom a nerez se v nich zrcadlí),
   3. scéna se kreslí do textury (i s hloubkou),
   4. zastínění koutů (SSAO): z hloubky se pozná, kde se plochy
      stýkají (roh stěny a podlahy, nohy židlí, láhve v policích),
      a tam se jemně ztmaví,
   5. postprocesing: záře kolem světel (bloom), vyhlazení hran (FXAA),
      teplé barevné ladění, viněta a jemné filmové zrno.
   Na nízké kvalitě se kreslí rovnou na plátno bez efektů.
   ========================================================= */
const rend = {
  stinFbo: null, stinTex: null, stinBarva: null, stinVel: 0, stinHotovy: false, stinMat: null,
  sondy: [], sondaFbo: null, sondaHloubka: null, sondaVel: 0, sondyHotove: false, prazdnaKrychle: null,
  scena: null, zare: [], nahoru: [], postVbo: null, post: null, typZare: null, snimek: 0,
  ao: null, aoRozmaz: null, aoProgramy: {}, aoSnimek: false, kamera: { tanY: 1, pomer: 1, blizko: 0.04, daleko: 60 }
};
// Sondy odrazů: krabice místnosti (pro „promítnutí“ odrazu) – sál, sklad, kuchyně
const SONDY = [
  { min: [0, 0, 0], max: [20, 3.2, 12.5] },
  { min: [11.15, 0, 0], max: [14.0, 3.2, 2.6] },
  { min: [14.15, 0, 0], max: [20, 3.2, 3.45] }
];
const STRANY_KRYCHLE = [
  [[1, 0, 0], [0, -1, 0]], [[-1, 0, 0], [0, -1, 0]], [[0, 1, 0], [0, 0, 1]],
  [[0, -1, 0], [0, 0, -1]], [[0, 0, 1], [0, -1, 0]], [[0, 0, -1], [0, -1, 0]]
];

// Pohledová matice „oko se dívá směrem smer, nahoře je nahoru“
function maticePohledu(oko, smer, nahoru) {
  const f = smer;
  let s = [f[1] * nahoru[2] - f[2] * nahoru[1], f[2] * nahoru[0] - f[0] * nahoru[2], f[0] * nahoru[1] - f[1] * nahoru[0]];
  const ls = Math.hypot(...s) || 1;
  s = s.map((x) => x / ls);
  const u = [s[1] * f[2] - s[2] * f[1], s[2] * f[0] - s[0] * f[2], s[0] * f[1] - s[1] * f[0]];
  const m = new Float32Array(16);
  m[0] = s[0]; m[4] = s[1]; m[8] = s[2];
  m[1] = u[0]; m[5] = u[1]; m[9] = u[2];
  m[2] = -f[0]; m[6] = -f[1]; m[10] = -f[2];
  m[12] = -(s[0] * oko[0] + s[1] * oko[1] + s[2] * oko[2]);
  m[13] = -(u[0] * oko[0] + u[1] * oko[1] + u[2] * oko[2]);
  m[14] = f[0] * oko[0] + f[1] * oko[1] + f[2] * oko[2];
  m[15] = 1;
  return m;
}

function texturaCile(w, h, typ = gl.UNSIGNED_BYTE, filtr = gl.LINEAR) {
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, typ, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filtr);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filtr);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  aktualniTextura = null;
  return t;
}
function framebuffer(tex, hloubka) {
  const f = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, f);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
  if (hloubka && hloubka._textura) gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.TEXTURE_2D, hloubka, 0);
  else if (hloubka) gl.framebufferRenderbuffer(gl.FRAMEBUFFER, hloubka._priloha, gl.RENDERBUFFER, hloubka);
  const ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  if (!ok) gl.deleteFramebuffer(f);
  return ok ? f : null;
}
// Hloubka scény jako textura (24 bitů + stencil) – aby ji šlo číst při zastínění koutů
function hloubkovaTextura(w, h) {
  if (!rozsireni.hloubka || !rozsireni.hloubka.UNSIGNED_INT_24_8_WEBGL) return null;
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_STENCIL, w, h, 0, gl.DEPTH_STENCIL, rozsireni.hloubka.UNSIGNED_INT_24_8_WEBGL, null);
  nastavFiltrStinu();
  aktualniTextura = null;
  if (gl.getError() !== gl.NO_ERROR) { gl.deleteTexture(t); return null; }
  t._textura = true;
  return t;
}
// Hloubka pro scénu: 24 bitů (DEPTH_STENCIL), aby se blízké plochy (tabule na zdi) nepraly;
// jen pro stínovou mapu stačí 16 bitů
function hloubkovyBuffer(w, h, presna = true) {
  const r = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, r);
  if (presna) {
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL, w, h);
    r._priloha = gl.DEPTH_STENCIL_ATTACHMENT;
  } else {
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
    r._priloha = gl.DEPTH_ATTACHMENT;
  }
  return r;
}
function smazCil(c) {
  if (!c) return;
  if (c.fbo) gl.deleteFramebuffer(c.fbo);
  if (c.tex) gl.deleteTexture(c.tex);
  if (c.hloubka && c.hloubka._textura) gl.deleteTexture(c.hloubka);
  else if (c.hloubka) gl.deleteRenderbuffer(c.hloubka);
}

/* ---------- Programy postprocesingu ---------- */
const POST_VS = `
attribute vec2 aPoz;
varying vec2 vUv;
void main() { vUv = aPoz * 0.5 + 0.5; gl_Position = vec4(aPoz, 0.0, 1.0); }`;
const POST_JAS = `${GLSL_PRESNOST}
uniform sampler2D uZdroj;
uniform vec2 uTexel;
uniform vec4 uPrah;   // x = práh jasu, y = měkkost, z = síla masky záře
varying vec2 vUv;
vec3 jas(vec2 uv) {
  vec4 c = texture2D(uZdroj, uv);
  float l = max(max(c.r, c.g), c.b);
  float k = clamp(l - uPrah.x + uPrah.y, 0.0, 2.0 * uPrah.y);
  k = k * k / (4.0 * uPrah.y + 0.0001);
  float w = max(k, l - uPrah.x) / max(l, 0.0001);
  return c.rgb * (w + c.a * uPrah.z);
}
void main() {
  vec2 o = uTexel;
  vec3 s = jas(vUv + vec2(-o.x, -o.y)) + jas(vUv + vec2(o.x, -o.y)) + jas(vUv + vec2(-o.x, o.y)) + jas(vUv + vec2(o.x, o.y));
  gl_FragColor = vec4(s * 0.25, 1.0);
}`;
const POST_DOLU = `${GLSL_PRESNOST}
uniform sampler2D uZdroj;
uniform vec2 uTexel;
varying vec2 vUv;
void main() {
  vec2 o = uTexel;
  vec3 s = texture2D(uZdroj, vUv).rgb * 4.0;
  s += texture2D(uZdroj, vUv - o).rgb;
  s += texture2D(uZdroj, vUv + o).rgb;
  s += texture2D(uZdroj, vUv + vec2(o.x, -o.y)).rgb;
  s += texture2D(uZdroj, vUv - vec2(o.x, -o.y)).rgb;
  gl_FragColor = vec4(s * 0.125, 1.0);
}`;
const POST_NAHORU = `${GLSL_PRESNOST}
uniform sampler2D uZdroj;
uniform sampler2D uPridat;
uniform vec2 uTexel;
varying vec2 vUv;
void main() {
  vec2 o = uTexel;
  vec3 s = texture2D(uZdroj, vUv + vec2(-2.0 * o.x, 0.0)).rgb;
  s += texture2D(uZdroj, vUv + vec2(-o.x, o.y)).rgb * 2.0;
  s += texture2D(uZdroj, vUv + vec2(0.0, 2.0 * o.y)).rgb;
  s += texture2D(uZdroj, vUv + vec2(o.x, o.y)).rgb * 2.0;
  s += texture2D(uZdroj, vUv + vec2(2.0 * o.x, 0.0)).rgb;
  s += texture2D(uZdroj, vUv + vec2(o.x, -o.y)).rgb * 2.0;
  s += texture2D(uZdroj, vUv + vec2(0.0, -2.0 * o.y)).rgb;
  s += texture2D(uZdroj, vUv + vec2(-o.x, -o.y)).rgb * 2.0;
  gl_FragColor = vec4(s / 12.0 + texture2D(uPridat, vUv).rgb, 1.0);
}`;
// Vzdálenost bodu od kamery z hloubkové textury a jeho poloha v prostoru kamery
const GLSL_HLOUBKA = `
uniform sampler2D uHloubka;
uniform vec4 uKamera;   // x = tan(fov/2)·poměr stran, y = tan(fov/2), z = blízká, w = daleká rovina
uniform vec2 uHTexel;   // velikost texelu hloubkové textury
// střed texelu – poloha bodu se musí počítat přesně tam, odkud je jeho hloubka
vec2 stredTexelu(vec2 uv) { return (floor(uv / uHTexel) + 0.5) * uHTexel; }
float vzdalenostV(vec2 uv) {
  float d = texture2D(uHloubka, uv).r * 2.0 - 1.0;
  return 2.0 * uKamera.z * uKamera.w / (uKamera.w + uKamera.z - d * (uKamera.w - uKamera.z));
}
vec3 bodV(vec2 uv) {
  uv = stredTexelu(uv);
  float z = vzdalenostV(uv);
  return vec3((uv * 2.0 - 1.0) * uKamera.xy * z, -z);
}`;
// Zastínění koutů: kolem bodu se ve stejné vzdálenosti (v metrech) prozkoumá několik
// sousedních bodů – které leží „nad“ plochou, ty ji zastiňují (kout, záhyb, předmět u zdi)
function postAo(n) {
  return `${GLSL_PRESNOST}
${GLSL_HLOUBKA}
uniform vec4 uAo;       // x = poloměr (m), y = síla, z = posun proti samozastínění, w = největší poloměr (uv)
varying vec2 vUv;
void main() {
  vec2 uv0 = stredTexelu(vUv);
  float d0 = texture2D(uHloubka, uv0).r;
  // nic (pozadí) nebo věci v rukou těsně před kamerou se nezastiňují
  if (d0 > 0.99999 || d0 < 0.0025) { gl_FragColor = vec4(1.0); return; }
  vec3 p = bodV(uv0);
  // normála z hloubky: z každé strany se vezme bližší soused (na hranách předmětů)
  vec3 pr = bodV(uv0 + vec2(uHTexel.x, 0.0)), pl = bodV(uv0 - vec2(uHTexel.x, 0.0));
  vec3 pu = bodV(uv0 + vec2(0.0, uHTexel.y)), pd = bodV(uv0 - vec2(0.0, uHTexel.y));
  vec3 dx = abs(pr.z - p.z) < abs(p.z - pl.z) ? pr - p : p - pl;
  vec3 dy = abs(pu.z - p.z) < abs(p.z - pd.z) ? pu - p : p - pd;
  vec3 nor = normalize(cross(dx, dy));
  float z = -p.z;
  vec2 r = min(uAo.x / (2.0 * z * uKamera.xy), vec2(uAo.w));
  float rot = 6.2831853 * fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
  float R2 = uAo.x * uAo.x;
  float suma = 0.0;
  for (int i = 0; i < ${n}; i++) {
    float t = (float(i) + 0.5) / ${fl(n)};
    float u = float(i) * 2.39996323 + rot;
    vec3 v = bodV(uv0 + sqrt(t) * vec2(cos(u), sin(u)) * r) - p;
    float vv = dot(v, v);
    suma += max(dot(v, nor) * inversesqrt(vv + 1e-6) - uAo.z, 0.0) * max(1.0 - vv / R2, 0.0);
  }
  float ao = 1.0 - suma * uAo.y / ${fl(n)};
  // daleko už je kout malý na pár pixelů – zastínění se vytrácí
  ao = mix(clamp(ao, 0.0, 1.0), 1.0, smoothstep(14.0, 24.0, z));
  gl_FragColor = vec4(ao, ao, ao, 1.0);
}`;
}
// Rozmazání zastínění (zmizí zrnitost), ale jen mezi body v podobné vzdálenosti – nepřeteče přes hrany
const POST_AO_ROZMAZ = `${GLSL_PRESNOST}
${GLSL_HLOUBKA}
uniform sampler2D uAoSurove;
uniform vec2 uTexel;    // texel zastínění
varying vec2 vUv;
void main() {
  float z0 = vzdalenostV(stredTexelu(vUv));
  float tol = 0.04 + 0.025 * z0;
  float s = 0.0, w = 0.0;
  for (int y = 0; y < 4; y++) {
    for (int x = 0; x < 4; x++) {
      vec2 uv = vUv + (vec2(float(x), float(y)) - 1.5) * uTexel;
      float wi = max(1.0 - abs(vzdalenostV(stredTexelu(uv)) - z0) / tol, 0.0) + 0.001;
      s += texture2D(uAoSurove, uv).r * wi;
      w += wi;
    }
  }
  gl_FragColor = vec4(vec3(s / w), 1.0);
}`;
const POST_FINAL = `${GLSL_PRESNOST}
uniform sampler2D uScena;
uniform sampler2D uZare;
uniform sampler2D uAo;
uniform float uAoSila;
uniform vec2 uTexel;
uniform vec4 uPost;    // x = síla záře, y = viněta, z = zrno, w = čas
uniform float uPomer;
varying vec2 vUv;
// FXAA: vyhlazení zubatých hran podle jasu okolních pixelů
vec3 fxaa(vec2 uv) {
  vec2 p = uTexel;
  vec3 nw = texture2D(uScena, uv + vec2(-p.x, -p.y)).rgb;
  vec3 ne = texture2D(uScena, uv + vec2(p.x, -p.y)).rgb;
  vec3 sw = texture2D(uScena, uv + vec2(-p.x, p.y)).rgb;
  vec3 se = texture2D(uScena, uv + vec2(p.x, p.y)).rgb;
  vec3 m = texture2D(uScena, uv).rgb;
  vec3 L = vec3(0.299, 0.587, 0.114);
  float lnw = dot(nw, L), lne = dot(ne, L), lsw = dot(sw, L), lse = dot(se, L), lm = dot(m, L);
  float lmin = min(lm, min(min(lnw, lne), min(lsw, lse)));
  float lmax = max(lm, max(max(lnw, lne), max(lsw, lse)));
  vec2 dir = vec2(-((lnw + lne) - (lsw + lse)), (lnw + lsw) - (lne + lse));
  float red = max((lnw + lne + lsw + lse) * 0.03125, 0.0078125);
  float rcp = 1.0 / (min(abs(dir.x), abs(dir.y)) + red);
  dir = clamp(dir * rcp, vec2(-8.0), vec2(8.0)) * p;
  vec3 a = 0.5 * (texture2D(uScena, uv + dir * (1.0 / 3.0 - 0.5)).rgb + texture2D(uScena, uv + dir * (2.0 / 3.0 - 0.5)).rgb);
  vec3 b = a * 0.5 + 0.25 * (texture2D(uScena, uv - dir * 0.5).rgb + texture2D(uScena, uv + dir * 0.5).rgb);
  float lb = dot(b, L);
  return (lb < lmin || lb > lmax) ? a : b;
}
void main() {
  vec3 c = fxaa(vUv);
  // zastínění koutů (zářící věci – lampy, neon, odlesky – se neztmavují)
  float maska = clamp(texture2D(uScena, vUv).a * 1.6, 0.0, 1.0);
  c *= mix(1.0, texture2D(uAo, vUv).r, uAoSila * (1.0 - maska));
  c += texture2D(uZare, vUv).rgb * uPost.x;
  // jemná S-křivka a filmové ladění: světla teple medová, stíny lehce do chladna (víc hloubky)
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  c = mix(c, c * c * (3.0 - 2.0 * c), 0.2);
  c *= mix(vec3(0.93, 0.97, 1.05), vec3(1.04, 1.0, 0.93), smoothstep(0.05, 0.55, l));
  c = mix(vec3(dot(c, vec3(0.299, 0.587, 0.114))), c, 0.94);
  c += vec3(0.010, 0.010, 0.013) * (1.0 - l);
  // viněta
  vec2 d = vUv - 0.5;
  d.x *= uPomer;
  c *= 1.0 - uPost.y * smoothstep(0.38, 1.05, length(d));
  // filmové zrno a rozptyl proti pruhům v přechodech
  float n = fract(sin(dot(gl_FragCoord.xy + fract(uPost.w) * 61.7, vec2(12.9898, 78.233))) * 43758.5453);
  c += (n - 0.5) * uPost.z;
  gl_FragColor = vec4(c, 1.0);
}`;

function programPostu(fs, uniformy) {
  const p = sestavProgram(POST_VS, fs, ['aPoz']);
  const l = {};
  uniformy.forEach((n) => { l[n] = gl.getUniformLocation(p, n); });
  return { program: p, loc: l };
}

function pripravPost() {
  if (rend.post) return true;
  try {
    rend.post = {
      jas: programPostu(POST_JAS, ['uZdroj', 'uTexel', 'uPrah']),
      dolu: programPostu(POST_DOLU, ['uZdroj', 'uTexel']),
      nahoru: programPostu(POST_NAHORU, ['uZdroj', 'uPridat', 'uTexel']),
      final: programPostu(POST_FINAL, ['uScena', 'uZare', 'uAo', 'uAoSila', 'uTexel', 'uPost', 'uPomer'])
    };
  } catch (e) {
    console.warn('Postprocesing nejde:', e.message);
    rend.post = null;
    return false;
  }
  rend.postVbo = gl.createBuffer();
  rend.prazdna = texturaCile(1, 1);
  gl.bindBuffer(gl.ARRAY_BUFFER, rend.postVbo);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  // záře se počítá v polovičních číslech, když to grafika umí (hladší přechody)
  rend.typZare = gl.UNSIGNED_BYTE;
  if (rozsireni.pulFloat && rozsireni.pulFloatLin) {
    const t = texturaCile(4, 4, rozsireni.pulFloat.HALF_FLOAT_OES);
    const f = framebuffer(t, null);
    if (f) { rend.typZare = rozsireni.pulFloat.HALF_FLOAT_OES; gl.deleteFramebuffer(f); }
    gl.deleteTexture(t);
  }
  return true;
}

// Programy zastínění koutů (počet vzorků podle kvality); když nejdou, kouty se prostě neztmaví
function programyAo(n) {
  if (!n) return null;
  if (rend.aoProgramy[n] !== undefined) return rend.aoProgramy[n];
  // z hloubky se dá spočítat poloha bodu jen s přesnými čísly (highp) – jinak bez zastínění
  const presnost = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
  if (!presnost || presnost.precision < 16) { rend.aoProgramy[n] = null; return null; }
  try {
    if (!rend.aoRozmazProgram) rend.aoRozmazProgram = programPostu(POST_AO_ROZMAZ, ['uHloubka', 'uKamera', 'uHTexel', 'uAoSurove', 'uTexel']);
    rend.aoProgramy[n] = { ao: programPostu(postAo(n), ['uHloubka', 'uKamera', 'uHTexel', 'uAo']), rozmaz: rend.aoRozmazProgram };
  } catch (e) {
    console.warn('Zastínění koutů nejde:', e.message);
    rend.aoProgramy[n] = null;
  }
  return rend.aoProgramy[n];
}
// poloměr (m), síla, posun proti samozastínění, největší poloměr na obrazovce
const AO_NASTAVENI = [0.45, 3.6, 0.08, 0.1];
const aoAktivni = () => Boolean(cfg.ao && rend.scena && rend.ao && programyAo(cfg.ao));

// Textura scény, zastínění koutů a úrovně záře podle velikosti plátna
function pripravCile(w, h) {
  const chceAo = Boolean(cfg.ao && programyAo(cfg.ao));
  if (rend.scena && rend.scena.w === w && rend.scena.h === h && rend.zare.length === cfg.zare && rend.scena.chceAo === chceAo) return rend.cileOk;
  smazCil(rend.scena);
  rend.zare.forEach(smazCil);
  rend.nahoru.forEach(smazCil);
  smazCil(rend.ao);
  smazCil(rend.aoRozmaz);
  rend.ao = rend.aoRozmaz = null;
  rend.zare = [];
  rend.nahoru = [];
  const tex = texturaCile(w, h);
  // hloubka jako textura (z ní se počítá zastínění koutů), jinak obyčejný buffer
  let hloubka = chceAo ? hloubkovaTextura(w, h) : null;
  let fbo = hloubka ? framebuffer(tex, hloubka) : null;
  if (!fbo) {
    if (hloubka) gl.deleteTexture(hloubka);
    hloubka = hloubkovyBuffer(w, h);
    fbo = framebuffer(tex, hloubka);
  }
  if (!fbo) { gl.deleteTexture(tex); gl.deleteRenderbuffer(hloubka); rend.scena = null; rend.cileOk = false; return false; }
  rend.scena = { fbo, tex, hloubka, w, h, chceAo };
  if (hloubka._textura) {
    const aw = Math.max(1, Math.floor(w / 2)), ah = Math.max(1, Math.floor(h / 2));
    const t1 = texturaCile(aw, ah), t2 = texturaCile(aw, ah);
    rend.ao = { fbo: framebuffer(t1, null), tex: t1, w: aw, h: ah };
    rend.aoRozmaz = { fbo: framebuffer(t2, null), tex: t2, w: aw, h: ah };
    if (!rend.ao.fbo || !rend.aoRozmaz.fbo) {
      smazCil(rend.ao);
      smazCil(rend.aoRozmaz);
      rend.ao = rend.aoRozmaz = null;
    }
  }
  let sw = w, sh = h;
  for (let i = 0; i < cfg.zare; i++) {
    sw = Math.max(1, Math.floor(sw / 2));
    sh = Math.max(1, Math.floor(sh / 2));
    const t = texturaCile(sw, sh, rend.typZare);
    rend.zare.push({ fbo: framebuffer(t, null), tex: t, w: sw, h: sh });
    if (i < cfg.zare - 1) {
      const t2 = texturaCile(sw, sh, rend.typZare);
      rend.nahoru.push({ fbo: framebuffer(t2, null), tex: t2, w: sw, h: sh });
    }
  }
  rend.cileOk = rend.zare.every((z) => z.fbo) && rend.nahoru.every((z) => z.fbo);
  return rend.cileOk;
}

/* ---------- Stínová mapa ---------- */
function pripravStiny() {
  if (!cfg.stiny) return;
  if (rend.stinVel === cfg.stinMapa && rend.stinFbo) return;
  if (rend.stinFbo) gl.deleteFramebuffer(rend.stinFbo);
  if (rend.stinTex) gl.deleteTexture(rend.stinTex);
  if (rend.stinBarva) gl.deleteRenderbuffer(rend.stinBarva);
  rend.stinFbo = rend.stinTex = rend.stinBarva = null;
  const vel = cfg.stinMapa;
  const t = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, t);
  const f = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, f);
  let ok = false;
  if (cfg.hloubkovaTex) {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, vel, vel, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null);
    nastavFiltrStinu();
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, t, 0);
    ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    if (!ok) {
      // některé grafiky chtějí i barevnou přílohu
      rend.stinBarva = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, rend.stinBarva);
      gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA4, vel, vel);
      gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, rend.stinBarva);
      ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
    }
  } else {
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, vel, vel, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    nastavFiltrStinu();
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    rend.stinBarva = hloubkovyBuffer(vel, vel, false);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, rend.stinBarva);
    ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  aktualniTextura = null;
  if (!ok) {
    console.warn('Stínová mapa nejde – stíny budou jen naznačené');
    gl.deleteFramebuffer(f);
    gl.deleteTexture(t);
    cfg.stinyNejdou = true;
    return;
  }
  rend.stinFbo = f;
  rend.stinTex = t;
  rend.stinVel = vel;
  rend.stinMat = maticeStinu();
  rend.stinHotovy = false;
}
function nastavFiltrStinu() {
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
}
const stinyAktivni = () => Boolean(cfg.stiny && rend.stinFbo && !cfg.stinyNejdou);

function vykresliStinovouMapu(cas, sPostavami) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, rend.stinFbo);
  gl.viewport(0, 0, rend.stinVel, rend.stinVel);
  // stínová textura nesmí být navázaná, když se do ní kreslí
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.activeTexture(gl.TEXTURE0);
  gl.clearColor(1, 1, 1, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(programStinu.program);
  zrusPamatovanyStav();
  gl.uniformMatrix4fv(programStinu.loc.uStinMat, false, rend.stinMat);
  nastavProlnuti(null);
  gl.disable(gl.CULL_FACE);
  staticke.forEach((s) => kresliDoStinu(s.sit, JEDNOTKOVA));
  if (sPostavami) {
    [...hoste, ...personal, ...(kuchyne.kucharka ? [kuchyne.kucharka] : [])].forEach((p) => {
      if (!p.sit) return;
      pripravKosti(p, cas);
      kresliDoStinu(p.sit, p._kosti);
    });
    // kocour: tělo a hlava jako dva kvádry
    const k = kocka, yTelo = lerp(0.15, 0.065, k.lehne);
    const M = M4.retez(M4.posun(k.x, 0, k.z), M4.rotY(k.natoceni));
    kresliDoStinu(SITE.kostka, M4.retez(M, M4.posun(0, yTelo, 0), M4.meritko(0.13, 0.11, 0.33)));
    kresliDoStinu(SITE.kostka, M4.retez(M, M4.posun(0, yTelo + lerp(0.09, 0.02, k.lehne), 0.2), M4.meritko(0.11, 0.095, 0.1)));
  }
  // sudy ve skladu
  PIVA.forEach((p, i) => {
    if (!jeNaCepu(p)) return;
    const poz = SVET.sudPoz(i);
    kresliDoStinu(SITE.sud, M4.posun(poz.x, 0.12, poz.z));
  });
  gl.enable(gl.CULL_FACE);
  gl.useProgram(program);
  zrusPamatovanyStav();
}

/* ---------- Sondy odrazů ---------- */
function pripravSondy() {
  const pocet = cfg.sondy ? 3 : 0;
  const vel = cfg.sondaVel;
  if (!rend.prazdnaKrychle) {
    rend.prazdnaKrychle = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, rend.prazdnaKrychle);
    for (let f = 0; f < 6; f++) gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + f, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([20, 14, 10, 255]));
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }
  if (rend.sondy.length === pocet && rend.sondaVel === vel) return;
  rend.sondy.forEach((s) => gl.deleteTexture(s.tex));
  rend.sondy = [];
  if (rend.sondaFbo) { gl.deleteFramebuffer(rend.sondaFbo); gl.deleteRenderbuffer(rend.sondaHloubka); rend.sondaFbo = null; }
  rend.sondaVel = vel;
  if (!pocet) return;
  for (let i = 0; i < pocet; i++) {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, t);
    for (let f = 0; f < 6; f++) gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + f, 0, gl.RGBA, vel, vel, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    rend.sondy.push({ tex: t, ...SONDY[i] });
  }
  rend.sondaFbo = gl.createFramebuffer();
  rend.sondaHloubka = hloubkovyBuffer(vel, vel);
  rend.sondyHotove = false;
  aktualniTextura = null;
}
const sondyAktivni = () => Boolean(cfg.sondy && rend.sondy.length && rend.sondaFbo);

function navazKrychle(skutecne) {
  for (let i = 0; i < 3; i++) {
    gl.activeTexture(gl.TEXTURE2 + i);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, skutecne && rend.sondy[i] ? rend.sondy[i].tex : rend.prazdnaKrychle);
  }
  gl.activeTexture(gl.TEXTURE0);
}

function zachytSondy(cas) {
  const vel = rend.sondaVel;
  const proj = M4.perspektiva(Math.PI / 2, 1, 0.05, 40);
  navazKrychle(false);
  gl.bindFramebuffer(gl.FRAMEBUFFER, rend.sondaFbo);
  gl.framebufferRenderbuffer(gl.FRAMEBUFFER, rend.sondaHloubka._priloha, gl.RENDERBUFFER, rend.sondaHloubka);
  gl.viewport(0, 0, vel, vel);
  gl.useProgram(program);
  zrusPamatovanyStav();
  nastavSpolecne(proj, null, [0, 0, 0], cas, true);
  const pocet = cfg.sondy > 1 ? 3 : 1;
  for (let i = 0; i < pocet; i++) {
    const s = rend.sondy[i];
    const stred = [(s.min[0] + s.max[0]) / 2, 1.45, (s.min[2] + s.max[2]) / 2];
    for (let f = 0; f < 6; f++) {
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X + f, s.tex, 0);
      gl.clearColor(0.06, 0.04, 0.03, 1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      const [smer, nahoru] = STRANY_KRYCHLE[f];
      gl.uniformMatrix4fv(loc.uPohled, false, maticePohledu(stred, smer, nahoru));
      gl.uniform3f(loc.uOko, stred[0], stred[1], stred[2]);
      kresliStatiku(true);
    }
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, s.tex);
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  }
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  aktualniTextura = null;
  rend.sondyHotove = true;
}

/* ---------- Společné uniformy hlavního programu ---------- */
function nastavSpolecne(proj, pohled, oko, cas, proSondu = false) {
  gl.uniformMatrix4fv(loc.uProj, false, proj);
  if (pohled) gl.uniformMatrix4fv(loc.uPohled, false, pohled);
  gl.uniform3f(loc.uOkoli, ...OKOLI);
  gl.uniform3f(loc.uMlhaBarva, 0.05, 0.035, 0.025);
  gl.uniform1f(loc.uMlha, 0.016);
  gl.uniform1f(loc.uCas, cas % 1000);
  gl.uniform3f(loc.uOko, oko[0], oko[1], oko[2]);
  gl.uniform1f(loc.uExpozice, proSondu ? -1 : EXPOZICE);
  nastavSvetla(svetla);
  if (cfg.stiny) {
    const aktivni = stinyAktivni() && rend.stinHotovy;
    gl.uniformMatrix4fv(loc.uStinMat, false, rend.stinMat || JEDNOTKOVA);
    const vel = rend.stinVel || 1024;
    gl.uniform4f(loc.uStinInfo, 1 / vel, aktivni ? 0.92 : 0, vel >= 2048 ? 0.0016 : 0.0026, vel >= 2048 ? 3 : 3.2);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, aktivni ? rend.stinTex : null);
    gl.activeTexture(gl.TEXTURE0);
  }
  if (cfg.sondy) {
    const s = rend.sondy.length ? rend.sondy : SONDY;
    const min = new Float32Array(cfg.sondy * 3), max = new Float32Array(cfg.sondy * 3);
    for (let i = 0; i < cfg.sondy; i++) { min.set(s[i].min, i * 3); max.set(s[i].max, i * 3); }
    gl.uniform3fv(loc.uSondaMin, min);
    gl.uniform3fv(loc.uSondaMax, max);
    navazKrychle(!proSondu && sondyAktivni() && rend.sondyHotove);
  }
  material.odrazy = proSondu || !sondyAktivni() || !rend.sondyHotove ? 0 : 1;
  aktualniTextura = null;
}
const OKOLI = [0.3, 0.235, 0.185];
const EXPOZICE = 1.3;

// Stav světa se změnil (nové stoly, kuchyně) → stíny a odrazy se spočítají znovu
function oznacZmenuSveta() {
  rend.stinHotovy = false;
  rend.sondyHotove = false;
}

// Volá se při přepnutí kvality grafiky
function pripravRenderer() {
  cfg.stinyNejdou = false;
  if (cfg.stiny) pripravStiny();
  pripravSondy();
  if (cfg.post && !pripravPost()) cfg.post = false;
  if (!cfg.post) {
    smazCil(rend.scena);
    rend.zare.forEach(smazCil);
    rend.nahoru.forEach(smazCil);
    smazCil(rend.ao);
    smazCil(rend.aoRozmaz);
    rend.scena = rend.ao = rend.aoRozmaz = null;
    rend.zare = [];
    rend.nahoru = [];
  }
  oznacZmenuSveta();
}

/* ---------- Postprocesing ---------- */
function kresliPres(cil, w, h) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, cil);
  gl.viewport(0, 0, w, h);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}
function textura(jednotka, tex) {
  gl.activeTexture(gl.TEXTURE0 + jednotka);
  gl.bindTexture(gl.TEXTURE_2D, tex);
}
// Zastínění koutů z hloubky scény → vrátí rozmazanou texturu (nebo null)
function zastineniKoutu() {
  const A = programyAo(cfg.ao), sc = rend.scena, k = rend.kamera;
  if (!A || !rend.ao) return null;
  const kam = [k.tanY * k.pomer, k.tanY, k.blizko, k.daleko];
  // 1) surové zastínění v poloviční velikosti
  gl.useProgram(A.ao.program);
  gl.uniform1i(A.ao.loc.uHloubka, 0);
  gl.uniform4f(A.ao.loc.uKamera, ...kam);
  gl.uniform2f(A.ao.loc.uHTexel, 1 / sc.w, 1 / sc.h);
  gl.uniform4f(A.ao.loc.uAo, ...AO_NASTAVENI);
  textura(0, sc.hloubka);
  kresliPres(rend.ao.fbo, rend.ao.w, rend.ao.h);
  // 2) rozmazat, ale jen mezi body v podobné hloubce
  gl.useProgram(A.rozmaz.program);
  gl.uniform1i(A.rozmaz.loc.uHloubka, 0);
  gl.uniform1i(A.rozmaz.loc.uAoSurove, 1);
  gl.uniform4f(A.rozmaz.loc.uKamera, ...kam);
  gl.uniform2f(A.rozmaz.loc.uHTexel, 1 / sc.w, 1 / sc.h);
  gl.uniform2f(A.rozmaz.loc.uTexel, 1 / rend.ao.w, 1 / rend.ao.h);
  textura(1, rend.ao.tex);
  kresliPres(rend.aoRozmaz.fbo, rend.aoRozmaz.w, rend.aoRozmaz.h);
  // hloubková textura nesmí zůstat navázaná (příští snímek se do ní kreslí)
  textura(1, null);
  textura(0, null);
  return rend.aoRozmaz.tex;
}

function postprocesing(cas) {
  const P = rend.post, sc = rend.scena;
  nastavProlnuti(null);
  gl.disable(gl.DEPTH_TEST);
  gl.bindBuffer(gl.ARRAY_BUFFER, rend.postVbo);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const aoTex = rend.aoSnimek ? zastineniKoutu() : null;
  // 1) jasné části scény do poloviční velikosti
  gl.useProgram(P.jas.program);
  gl.uniform1i(P.jas.loc.uZdroj, 0);
  gl.uniform2f(P.jas.loc.uTexel, 1 / sc.w, 1 / sc.h);
  gl.uniform4f(P.jas.loc.uPrah, 0.8, 0.22, 1.35, 0);
  textura(0, sc.tex);
  kresliPres(rend.zare[0].fbo, rend.zare[0].w, rend.zare[0].h);
  // 2) dál zmenšovat a rozmazávat
  gl.useProgram(P.dolu.program);
  gl.uniform1i(P.dolu.loc.uZdroj, 0);
  for (let i = 1; i < rend.zare.length; i++) {
    const z = rend.zare[i - 1];
    gl.uniform2f(P.dolu.loc.uTexel, 1 / z.w, 1 / z.h);
    textura(0, z.tex);
    kresliPres(rend.zare[i].fbo, rend.zare[i].w, rend.zare[i].h);
  }
  // 3) zpátky nahoru a sčítat úrovně
  gl.useProgram(P.nahoru.program);
  gl.uniform1i(P.nahoru.loc.uZdroj, 0);
  gl.uniform1i(P.nahoru.loc.uPridat, 1);
  let zdroj = rend.zare[rend.zare.length - 1];
  for (let i = rend.zare.length - 2; i >= 0; i--) {
    const cil = rend.nahoru[i];
    gl.uniform2f(P.nahoru.loc.uTexel, 0.5 / zdroj.w, 0.5 / zdroj.h);
    textura(0, zdroj.tex);
    textura(1, rend.zare[i].tex);
    kresliPres(cil.fbo, cil.w, cil.h);
    zdroj = cil;
  }
  // 4) výsledek na plátno: vyhlazení, záře, ladění, viněta, zrno
  gl.useProgram(P.final.program);
  gl.uniform1i(P.final.loc.uScena, 0);
  gl.uniform1i(P.final.loc.uZare, 1);
  gl.uniform1i(P.final.loc.uAo, 2);
  gl.uniform1f(P.final.loc.uAoSila, aoTex ? cfg.aoSila : 0);
  gl.uniform2f(P.final.loc.uTexel, 1 / sc.w, 1 / sc.h);
  gl.uniform4f(P.final.loc.uPost, 0.62 / rend.zare.length, REZIM === 'menu' ? 0.42 : 0.32, cfg.pcss ? 0.02 : 0.014, cas);
  gl.uniform1f(P.final.loc.uPomer, sc.w / sc.h);
  textura(0, sc.tex);
  textura(1, zdroj.tex);
  textura(2, aoTex || rend.prazdna);
  kresliPres(null, platno.width, platno.height);
  textura(2, null);
  textura(1, null);
  gl.activeTexture(gl.TEXTURE0);
  gl.enable(gl.DEPTH_TEST);
  gl.useProgram(program);
  zrusPamatovanyStav();
}

/* ---------- Jeden snímek ---------- */
// Připraví stíny a odrazy (když je potřeba) a vrátí, kam se má kreslit scéna
function pripravSnimek(cas) {
  rend.snimek++;
  if (stinyAktivni() && (cfg.dynStiny || !rend.stinHotovy)) {
    vykresliStinovouMapu(cas, cfg.dynStiny);
    rend.stinHotovy = true;
  }
  if (sondyAktivni() && !rend.sondyHotove) zachytSondy(cas);
  if (cfg.post && rend.post && pripravCile(platno.width, platno.height)) {
    rend.aoSnimek = aoAktivni();
    return rend.scena.fbo;
  }
  rend.aoSnimek = false;
  return null;
}
/* =========================================================
   19) ULOŽENÍ POSTUPU (localStorage)
   ========================================================= */
function vychoziHra() {
  return {
    penize: NASTAVENI.startovniPenize, natoceno: 0, obslouzeno: 0, hostu: 0, perfektnich: 0, prelito: 0, odesli: 0, umyto: 0, serie: 0, nejSerie: 0,
    panaku: 0, vymenySudu: 0, rund: 0, znalcu: 0, zapasu: 0, nejvicNaTacu: 0, pohlazeni: 0, ukoly: {},
    jidel: 0, jidlaDruhy: {}, panakDruhy: {}, personalSklenic: 0, personalObjednavek: 0, personalVybrano: 0,
    hodnoceni: 3.5, vylepseni: {}, odemcena: [], sudy: {}, prazdneSudy: 0,
    nastaveni: { citlivost: 1, zvuk: true, hudba: true, kvalita: null }, navod: { kniha: false }, otevreno: false
  };
}
function nactiHru() {
  const v = vychoziHra();
  try {
    const data = JSON.parse(localStorage.getItem(NASTAVENI.klicUlozeni));
    if (data && typeof data === 'object') {
      return { ...v, ...data, vylepseni: { ...(data.vylepseni || {}) }, sudy: { ...(data.sudy || {}) }, odemcena: [...(data.odemcena || [])], ukoly: { ...(data.ukoly || {}) },
        jidlaDruhy: { ...(data.jidlaDruhy || {}) }, panakDruhy: { ...(data.panakDruhy || {}) },
        nastaveni: { ...v.nastaveni, ...(data.nastaveni || {}) }, navod: { ...v.navod, ...(data.navod || {}) }, otevreno: false };
    }
  } catch (e) { /* bez uložení se hraje od začátku */ }
  return v;
}
const HRA = nactiHru();
function ulozHru() {
  try { localStorage.setItem(NASTAVENI.klicUlozeni, JSON.stringify({ ...HRA, otevreno: false, dodavky })); } catch (e) { /* nevadí */ }
}

/* =========================================================
   20) ZVUKY – syntetizované přes WebAudio, žádné soubory
   ========================================================= */
// Vlastní jednoduchá melodie pro jukebox (MIDI čísla not, 0 = pauza)
const HUDBA = {
  tempo: 126,
  melodie: [76, 79, 76, 72, 74, 76, 77, 76, 74, 71, 74, 79, 77, 74, 71, 67,
    71, 74, 77, 74, 79, 77, 74, 71, 72, 76, 79, 76, 72, 0, 72, 0,
    81, 79, 77, 76, 77, 76, 74, 72, 74, 77, 74, 71, 67, 71, 74, 77,
    76, 74, 72, 74, 76, 79, 76, 72, 74, 71, 67, 71, 72, 0, 0, 0],
  akordy: [
    { basa: [48, 55], tony: [60, 64, 67] }, { basa: [43, 50], tony: [59, 62, 65] },
    { basa: [43, 50], tony: [59, 62, 67] }, { basa: [48, 55], tony: [60, 64, 67] },
    { basa: [53, 48], tony: [60, 65, 69] }, { basa: [43, 50], tony: [59, 62, 65] },
    { basa: [48, 55], tony: [60, 64, 67] }, { basa: [43, 50], tony: [59, 62, 67] }
  ]
};

const zvuk = {
  ctx: null, hlavni: null, sum: null, cep: null, nal: null, ruch: null,
  start() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.hlavni = this.ctx.createGain();
    this.hlavni.gain.value = HRA.nastaveni.zvuk ? 0.5 : 0;
    this.hlavni.connect(this.ctx.destination);
    const delka = this.ctx.sampleRate * 1.5;
    this.sum = this.ctx.createBuffer(1, delka, this.ctx.sampleRate);
    const d = this.sum.getChannelData(0);
    for (let i = 0; i < delka; i++) d[i] = Math.random() * 2 - 1;
  },
  nastavHlasitost() { if (this.hlavni) this.hlavni.gain.value = HRA.nastaveni.zvuk ? 0.5 : 0; },
  ton(f, delka, typ = 'sine', hlas = 0.3, zpozdeni = 0, f2 = null, vystup = null) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + zpozdeni;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = typ;
    o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + delka);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(hlas, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + delka);
    o.connect(g); g.connect(vystup || this.hlavni);
    o.start(t); o.stop(t + delka + 0.05);
  },
  sumik(delka, frekvence, hlas = 0.2, q = 1) {
    if (!this.ctx) return null;
    const s = this.ctx.createBufferSource();
    s.buffer = this.sum;
    s.loop = true;
    const f = this.ctx.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = frekvence;
    f.Q.value = q;
    const g = this.ctx.createGain();
    g.gain.value = hlas;
    s.connect(f); f.connect(g); g.connect(this.hlavni);
    s.start();
    if (delka) {
      g.gain.setValueAtTime(hlas, this.ctx.currentTime + delka * 0.6);
      g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + delka);
      s.stop(this.ctx.currentTime + delka + 0.05);
    }
    return { s, g, f };
  },
  zvonek() { this.ton(1320, 0.5, 'sine', 0.18); this.ton(990, 0.7, 'sine', 0.16, 0.22); },
  cink(hlas = 1) { this.ton(2200, 0.18, 'sine', 0.12 * hlas); this.ton(3300, 0.12, 'sine', 0.06 * hlas, 0.02); },
  krok(dlazba) { this.sumik(0.09, dlazba ? 1500 : 380, dlazba ? 0.05 : 0.08, 1.6); },
  prede() { for (let i = 0; i < 6; i++) this.ton(46 + (i % 2) * 4, 0.28, 'sawtooth', 0.03, i * 0.26, 40); },
  mnau() { this.ton(700, 0.35, 'triangle', 0.06, 0, 520); this.ton(950, 0.12, 'sine', 0.03, 0.02, 760); },
  pistalka() { this.ton(2600, 0.5, 'square', 0.04); this.ton(2760, 0.5, 'sine', 0.06); },
  fanfara() { [523, 659, 784, 1047].forEach((f, i) => this.ton(f, i === 3 ? 0.55 : 0.22, 'triangle', 0.12, i * 0.11)); },
  // dav v televizi i v hospodě: šum, který se nadme a zase opadne
  jasot(nasi) {
    if (!this.ctx) return;
    const s = this.sumik(0, nasi ? 950 : 480, 0.0001, 0.6);
    if (!s) return;
    const t = this.ctx.currentTime;
    s.g.gain.setValueAtTime(0.0001, t);
    s.g.gain.exponentialRampToValueAtTime(nasi ? 0.32 : 0.1, t + 0.25);
    s.g.gain.exponentialRampToValueAtTime(0.0001, t + (nasi ? 2.2 : 1.2));
    s.s.stop(t + 2.4);
    if (nasi) this.ton(330, 0.6, 'sawtooth', 0.025, 0.1, 440);
  },
  // bublání pálenky z nalévátka
  nalevani(zapnout) {
    if (!this.ctx) return;
    if (zapnout && !this.nal) {
      const s = this.sumik(0, 560, 0.1, 2.5);
      if (!s) return;
      const lfo = this.ctx.createOscillator();
      const lg = this.ctx.createGain();
      lfo.frequency.value = 12;
      lg.gain.value = 0.08;
      lfo.connect(lg); lg.connect(s.g.gain);
      lfo.start();
      s.lfo = lfo;
      this.nal = s;
    } else if (!zapnout && this.nal) {
      const c = this.nal;
      this.nal = null;
      c.g.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.04);
      setTimeout(() => { try { c.s.stop(); c.lfo.stop(); } catch (e) { /* už stojí */ } }, 250);
    }
  },
  // tichý hovor hostů – čím víc lidí, tím hlasitější
  ruchHospody(pocetHostu) {
    if (!this.ctx) return;
    if (!this.ruch) {
      const s = this.sumik(0, 420, 0.0001, 0.8);
      if (!s) return;
      const lfo = this.ctx.createOscillator();
      const lg = this.ctx.createGain();
      lfo.frequency.value = 0.6;
      lg.gain.value = 130;
      lfo.connect(lg); lg.connect(s.f.frequency);
      lfo.start();
      this.ruch = s;
    }
    const cil = REZIM === 'hra' ? Math.min(0.085, pocetHostu * 0.01) : 0;
    this.ruch.g.gain.setTargetAtTime(Math.max(0.0001, cil), this.ctx.currentTime, 0.6);
  },
  // jukebox: jednoduchá veselá melodie (vlastní), plánuje se kousek dopředu
  hudbaKrok: 0, hudbaCas: 0, hudbaVystup: null,
  hudba(hrat) {
    if (!this.ctx) return;
    if (!this.hudbaVystup) {
      this.hudbaVystup = this.ctx.createGain();
      this.hudbaVystup.gain.value = 0.9;
      this.hudbaVystup.connect(this.hlavni);
    }
    if (!hrat) { this.hudbaCas = 0; return; }
    const ted = this.ctx.currentTime;
    if (this.hudbaCas < ted) this.hudbaCas = ted + 0.05;
    while (this.hudbaCas < ted + 0.35) {
      this.hrajKrok(this.hudbaKrok, this.hudbaCas - ted);
      this.hudbaKrok = (this.hudbaKrok + 1) % HUDBA.melodie.length;
      this.hudbaCas += 60 / HUDBA.tempo / 2;
    }
  },
  hrajKrok(i, za) {
    const f = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const akord = HUDBA.akordy[Math.floor(i / 8) % HUDBA.akordy.length];
    const n = HUDBA.melodie[i];
    const v = this.hudbaVystup;
    if (n) this.ton(f(n), 0.2, 'triangle', 0.045, za, null, v);
    if (i % 4 === 0) this.ton(f(akord.basa[0]), 0.22, 'sine', 0.085, za, null, v);
    if (i % 4 === 2) this.ton(f(akord.basa[1]), 0.22, 'sine', 0.075, za, null, v);
    if (i % 2 === 1) akord.tony.forEach((m) => this.ton(f(m), 0.1, 'square', 0.01, za, null, v));
  },
  kasa(hlas = 1) { this.ton(1600, 0.25, 'triangle', 0.15 * hlas); this.ton(2400, 0.35, 'sine', 0.13 * hlas, 0.08); },
  talir(hlas = 1) { this.ton(1250, 0.12, 'triangle', 0.09 * hlas); this.ton(2900, 0.08, 'sine', 0.05 * hlas, 0.015); },
  // zvonek na okénku kuchyně (cink!)
  zvonekKuchyne(hlas = 1) { this.ton(2637, 0.9, 'sine', 0.16 * hlas); this.ton(5274, 0.4, 'sine', 0.05 * hlas); this.ton(3951, 0.6, 'sine', 0.04 * hlas, 0.01); },
  // syčení pánví v kuchyni – čím blíž, tím hlasitější
  kuch: null,
  kuchyne(hlas) {
    if (!this.ctx) return;
    if (!this.kuch) {
      const s = this.sumik(0, 3200, 0.0001, 0.7);
      if (!s) return;
      this.kuch = s;
    }
    const cil = REZIM === 'hra' ? hlas * 0.06 : 0;
    this.kuch.g.gain.setTargetAtTime(Math.max(0.0001, cil), this.ctx.currentTime, 0.3);
  },
  // déšť za okny: tiché šumění (sílí a slábne s počasím)
  destZvuk: null,
  dest(sila) {
    if (!this.ctx) return;
    if (!this.destZvuk) {
      const s = this.sumik(0, 2400, 0.0001, 0.45);
      if (!s) return;
      this.destZvuk = s;
    }
    this.destZvuk.g.gain.setTargetAtTime(Math.max(0.0001, sila * 0.03), this.ctx.currentTime, 1.5);
  },
  klik() { this.ton(800, 0.06, 'square', 0.06); },
  chyba() { this.ton(180, 0.25, 'sawtooth', 0.1, 0, 120); },
  voda(hlas = 1) { this.sumik(0.7, 1200, 0.25 * hlas, 0.7); },
  syk() { this.sumik(0.6, 3500, 0.22, 0.5); this.ton(140, 0.3, 'square', 0.05); },
  prskani() { for (let i = 0; i < 4; i++) setTimeout(() => this.sumik(0.12, 900, 0.25, 1), i * 120); },
  cepovani(zapnout) {
    if (!this.ctx) return;
    if (zapnout && !this.cep) {
      this.cep = this.sumik(0, 700, 0.16, 1.4);
      if (this.cep) {
        const lfo = this.ctx.createOscillator();
        const lg = this.ctx.createGain();
        lfo.frequency.value = 7;
        lg.gain.value = 180;
        lfo.connect(lg); lg.connect(this.cep.f.frequency);
        lfo.start();
        this.cep.lfo = lfo;
      }
    } else if (!zapnout && this.cep) {
      const c = this.cep;
      this.cep = null;
      c.g.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.05);
      setTimeout(() => { try { c.s.stop(); c.lfo.stop(); } catch (e) { /* už stojí */ } }, 300);
    }
  }
};

/* =========================================================
   21) HUD – peníze, hodnocení, objednávky, sudy, bubliny
   ========================================================= */
const ui = {};
let casToastu = null;
function ukazToast(text, ms = 2800) {
  ui.toast.textContent = text;
  ui.toast.classList.add('viditelny');
  clearTimeout(casToastu);
  casToastu = setTimeout(() => ui.toast.classList.remove('viditelny'), ms);
}

let casHodnoceni = null;
function ukazHodnoceni(text, trida) {
  ui.hodnoceni.textContent = text;
  ui.hodnoceni.className = 'hodnoceni viditelne ' + (trida || '');
  clearTimeout(casHodnoceni);
  casHodnoceni = setTimeout(() => ui.hodnoceni.classList.remove('viditelne'), 2200);
}

const plovouci = [];
function plovouciText(x, y, z, text, maly = '') {
  const prvek = h('div', { class: 'plovouci' }, text, maly ? h('small', {}, maly) : null);
  ui.plovouci.append(prvek);
  plovouci.push({ x, y, z, prvek, zacatek: casHry });
}

const ceskaMena = (n) => Math.round(n).toLocaleString('cs-CZ') + ' Kč';
const hvezdy = (n) => '★★★★★'.slice(0, Math.round(n)) + '☆☆☆☆☆'.slice(0, 5 - Math.round(n));

// Peníze v HUD: při příjmu poskočí a ukáže „+X Kč“, při útratě krátce zčervenají
let zobrazenePenize = null;
function animujPenize() {
  if (zobrazenePenize === null || REZIM === 'menu') { zobrazenePenize = HRA.penize; return; }
  const rozdil = Math.round(HRA.penize - zobrazenePenize);
  if (!rozdil) return;
  zobrazenePenize = HRA.penize;
  const radek = ui.penize.parentElement;
  radek.classList.remove('pribyva', 'ubyva');
  void radek.offsetWidth; // restart animace
  radek.classList.add(rozdil > 0 ? 'pribyva' : 'ubyva');
  if (rozdil > 0 && radek.querySelectorAll('.penize-plus').length < 3) {
    const stitek = h('span', { class: 'penize-plus', 'aria-hidden': 'true' }, '+' + ceskaMena(rozdil));
    radek.append(stitek);
    setTimeout(() => stitek.remove(), 1300);
  }
}

function aktualizujHUD() {
  nastavText(ui.penize, String(ceskaMena(HRA.penize)));
  animujPenize();
  nastavText(ui.piva, String(HRA.natoceno));
  nastavText(ui.hvezdy, String(hvezdy(HRA.hodnoceni)));
  nastavText(ui.hvezdyCislo, String(HRA.hodnoceni.toFixed(1)));
  nastavText(ui.stav, String(HRA.otevreno ? 'OTEVŘENO' : 'ZAVŘENO'));
  ui.stav.classList.toggle('zavreno', !HRA.otevreno);
  nastavText(ui.sklenice, String(`${cisteSklenice} / ${kapacitaRegalu()}`));
  nastavText(ui.panakovky, String(`${cistePanakovky} / ${kapacitaPanakovek()}`));
  ui.skleniceBox.classList.toggle('malo', cisteSklenice <= 2);
  ui.panakovkyBox.classList.toggle('malo', cistePanakovky <= 1);
  // výzva u zaměřovače
  const text = popisCile(cil);
  ui.vyzva.hidden = !text;
  if (text) nastavText(ui.vyzvaText, String(text));
  ui.prubeh.hidden = !narazeni;
  if (narazeni) ui.prubehPln.style.width = Math.min(100, narazeni.cas / 1.3 * 100) + '%';
  ui.zamerovac.classList.toggle('na-cili', Boolean(cil));
  ui.akce.classList.toggle('aktivni', Boolean(cil));
  nastavText(ui.akceText, String(cil ? ({ kohout: 'Čepovat', lahev: 'Nalít', host: 'Obsloužit', spinava: 'Sebrat', drez: 'Umýt', kniha: 'Kniha', cedule: 'Otočit', regal: 'Regál',
    regalPanaku: 'Panákovky', sud: 'Narazit', paleta: 'Sudy', kocka: 'Pohladit', vydej: 'Výdej', okenko: 'Okénko', talirOkenko: 'Vzít', pomocnik: 'Mluvit' })[cil.typ] : 'Akce'));
  // co neseš
  if (ruce.piva.length) {
    ui.ruce.hidden = false;
    nastavText(ui.ruce, String((nesesJidlo() ? '🍽️ Neseš: ' : '🍺 Neseš: ') + ruce.piva.map((p) => (p.listek
      ? `${p.listek.jidlo.kratce} → ${p.listek.stav === 'zruseno' ? 'už nikdo (vrať do kuchyně)' : p.listek.stul}`
      : najdiPivo(p.id).kratce + ' ' + (jePanak(p.id) ? TEXTY_PANAK : HODNOCENI)[p.kvalita].kratce)).join(', ')));
  } else if (ruce.sklenice.length) {
    ui.ruce.hidden = false;
    const talire = ruce.sklenice.filter(jeTalir).length;
    nastavText(ui.ruce, String(`${talire ? '🍽️' : '🥛'} Prázdné nádobí: ${ruce.sklenice.length} / ${unosnostSklenic()} – odnes ho do dřezu${talire ? ' (talíře i do kuchyně)' : ''}`));
  } else {
    ui.ruce.hidden = true;
  }
  // sudy, které docházejí
  const varovani = PIVA.filter((p) => jeNaCepu(p) && sud(p.id).zbyva <= 3).map((p) => {
    const s = sud(p.id);
    return { text: s.zbyva <= 0 ? `🛢️ ${p.kratce}: prázdný sud!` : `🛢️ ${p.kratce}: zbývá ${s.zbyva}`, prazdny: s.zbyva <= 0, bezZasoby: s.zasoba <= 0 };
  });
  const hokejText = hokej.bezi ? `🏒 Hokej ${hokej.skore[0]} : ${hokej.skore[1]} · ${hokej.tretina}. třetina` : '';
  const klicSudu = JSON.stringify(varovani) + dodavky.length + hokejText;
  if (ui.sudy._klic !== klicSudu) {
    ui.sudy._klic = klicSudu;
    ui.sudy.replaceChildren(...(hokejText ? [h('div', { class: 'sud-varovani hokej' }, hokejText)] : []),
      ...varovani.map((v) => h('div', { class: 'sud-varovani' + (v.prazdny ? ' prazdny' : '') }, v.text, v.bezZasoby ? h('small', {}, 'žádná zásoba – objednej v knize') : null)),
      ...(dodavky.length ? [h('div', { class: 'sud-varovani dovoz' }, `🚚 Veze se ${dodavky.length} ${dodavky.length === 1 ? 'sud' : dodavky.length < 5 ? 'sudy' : 'sudů'}`)] : []));
  }
  // cíl z návodu
  const cilNavodu = textNavodu();
  ui.cil.hidden = !cilNavodu;
  if (cilNavodu) nastavText(ui.cil, String(cilNavodu));
  aktualizujMericko();
  aktualizujObjednavky();
  aktualizujKuchynskyPanel();
}

// Lístky z kuchyně (co se vaří, co čeká na okénku)
function aktualizujKuchynskyPanel() {
  const listky = maKuchyni() ? party.flatMap((p) => aktivniJidla(p)).sort((a, b) => a.objednano - b.objednano) : [];
  ui.kuchyne.hidden = !listky.length;
  if (!listky.length) return;
  const ikona = { fronta: '⏳', vari: '🔥', hotovo: '🍽️', okenko: '🔔', nese: '🚶' };
  const text = { fronta: 'čeká na sporák', vari: 'vaří se', hotovo: 'kuchařka ho nese', okenko: 'NA OKÉNKU', nese: 'nese se' };
  const klic = listky.slice(0, 5).map((l) => l.id + l.stav + Math.round(l.zbyva) + (l.studene ? 's' : '')).join('|') + listky.length;
  if (ui.kuchyne._klic === klic) return;
  ui.kuchyne._klic = klic;
  ui.kuchyne.replaceChildren(h('b', {}, `🍳 Kuchyně · ${listky.length} ${listky.length === 1 ? 'jídlo' : listky.length < 5 ? 'jídla' : 'jídel'}`),
    ...listky.slice(0, 5).map((l) => h('div', { class: 'kuch-listek stav-' + l.stav + (l.studene ? ' studene' : '') },
      `${ikona[l.stav]} ${l.jidlo.kratce} · ${l.stul}`,
      h('small', {}, l.stav === 'vari' ? `${text.vari} · ještě ${Math.max(1, Math.ceil(l.zbyva / rychlostVareni()))} s` : l.studene ? 'chladne!' : text[l.stav]))));
}

function aktualizujMericko() {
  // panák: měřidlo ukazuje panákovku s čárkou
  const l = nalevaLahev || (cil && cil.typ === 'lahev' && cil.lahev.sklenka ? cil.lahev : null);
  if (l && l.sklenka) {
    ui.mericko.hidden = false;
    ui.mericko.classList.add('panak');
    const p = l.sklenka.plneni;
    ui.mPivo.style.height = omez(p, 0, 100) + '%';
    ui.mPivo.style.background = `rgba(${l.panak.barva.map((c) => Math.round(c * 255)).join(',')},${Math.max(0.45, l.panak.pruhlednost)})`;
    ui.mPena.style.height = '0%';
    const t = tolerancePanaku(), c = NASTAVENI.panak.cil;
    ui.mPerfekt.style.bottom = (c - t.perfekt) + '%';
    ui.mPerfekt.style.height = 2 * t.perfekt + '%';
    ui.mDobre.style.bottom = (c - t.dobre) + '%';
    ui.mDobre.style.height = 2 * t.dobre + '%';
    nastavText(ui.mPopis, l.panak.nazev);
    ui.mericko.classList.toggle('preteka', p > 92);
    return;
  }
  ui.mericko.classList.remove('panak');
  const k = cepuje || (cil && cil.typ === 'kohout' && cil.kohout.sklenice ? cil.kohout : null);
  ui.mericko.hidden = !k || !k.sklenice;
  if (ui.mericko.hidden) return;
  const p = k.sklenice.plneni;
  const vrch = omez(p, 0, 100);
  const pena = Math.min(vrch * 0.22, 18);
  ui.mPivo.style.height = Math.max(vrch - pena, 0) + '%';
  ui.mPivo.style.background = rgbText(k.pivo.barva);
  ui.mPena.style.bottom = Math.max(vrch - pena, 0) + '%';
  ui.mPena.style.height = pena + '%';
  const t = tolerance();
  ui.mPerfekt.style.bottom = (NASTAVENI.cilHladiny - t.perfekt) + '%';
  ui.mPerfekt.style.height = 2 * t.perfekt + '%';
  ui.mDobre.style.bottom = (NASTAVENI.cilHladiny - t.dobre) + '%';
  ui.mDobre.style.height = 2 * t.dobre + '%';
  nastavText(ui.mPopis, k.pivo.kratce);
  ui.mericko.classList.toggle('preteka', p > 97);
}

const IKONY_STAVU = { vola: '✋', ceka_pivo: '🍺', plati: '💰' };
function popisMista(parta) {
  if (parta.kde === 'bar') return 'Bar';
  const m = parta.clenove[0].misto;
  return m ? `Stůl ${m.stul + 1}` : 'Stůl';
}
function cipyObjednavky(parta) {
  const pocty = {};
  parta.objednavka.forEach((p) => {
    const k = p.pivo;
    pocty[k] = pocty[k] || { celkem: 0, hotovo: 0 };
    pocty[k].celkem++;
    if (p.hotovo) pocty[k].hotovo++;
  });
  const napoje = Object.entries(pocty).map(([id, n]) => `${n.hotovo === n.celkem ? '✓ ' : ''}${jePanak(id) ? '🥃 ' : ''}${najdiPivo(id).kratce}${n.celkem > 1 ? ' ×' + n.celkem : ''}`);
  const jidla = aktivniJidla(parta).map((j) => `🍽️ ${j.jidlo.kratce}`);
  return [...napoje, ...jidla].join(' · ');
}

// Seznam partiček, které něco chtějí
const objednavkyPrvky = new Map();
function aktualizujObjednavky() {
  const chteji = party.filter((p) => IKONY_STAVU[p.stav]);
  const ids = new Set(chteji.map((p) => p.id));
  for (const [id, prvek] of objednavkyPrvky) {
    if (!ids.has(id)) { prvek.remove(); objednavkyPrvky.delete(id); }
  }
  chteji.forEach((parta) => {
    let prvek = objednavkyPrvky.get(parta.id);
    if (!prvek) {
      prvek = h('div', { class: 'listek' }, h('b'), h('span', { class: 'listek-piva' }), h('div', { class: 'trpelivost' }, h('div', { class: 'trpelivost-pln' })));
      ui.objednavky.append(prvek);
      objednavkyPrvky.set(parta.id, prvek);
    }
    const jmeno = parta.mluvci ? parta.mluvci.jmeno : parta.clenove[0].jmeno;
    nastavText(prvek.children[0], `${IKONY_STAVU[parta.stav]} ${popisMista(parta)} · ${jmeno}${parta.clenove.length > 1 ? ' +' + (parta.clenove.length - 1) : ''}`);
    const kdoJde = parta.rezervace ? ` · jde ${parta.rezervace.jmeno}` : '';
    nastavText(prvek.children[1], parta.stav === 'vola' ? 'chce objednat' + kdoJde : parta.stav === 'plati' ? `chce platit · ${parta.utrata + parta.dysko} Kč${kdoJde}` : cipyObjednavky(parta) + (parta.zapsal ? ` · 📝 ${parta.zapsal}` : ''));
    const pod = omez(parta.trpelivost / parta.maxTrpelivost, 0, 1);
    const bar = prvek.children[2].firstChild;
    bar.style.width = pod * 100 + '%';
    bar.className = 'trpelivost-pln' + (pod < 0.3 ? ' kriticka' : pod < 0.6 ? ' stredni' : '');
    prvek.className = 'listek stav-' + parta.stav;
  });
}

// Bubliny nad hlavami
const bublinyPrvky = new Map();
function textBubliny(h) {
  if (h.hlaska) return { text: h.hlaska.text, cipy: '' };
  const parta = h.parta;
  if (!parta) return null;
  if (h !== parta.mluvci) return null;
  if (parta.stav === 'vola') return { text: parta.text, cipy: '✋ chce objednat' };
  if (parta.stav === 'ceka_pivo') return { text: parta.text, cipy: '🍺 ' + cipyObjednavky(parta) };
  if (parta.stav === 'plati') return { text: parta.text, cipy: `💰 ${parta.utrata + parta.dysko} Kč` };
  return null;
}
function nastavText(prvek, text) { if (prvek.textContent !== text) prvek.textContent = text; }

function aktualizujBubliny() {
  const zobrazit = new Set();
  const polozky = [];
  [...hoste, ...personal, ...(kuchyne.kucharka ? [kuchyne.kucharka] : [])].forEach((host) => {
    const b = textBubliny(host);
    if (!b) return;
    const vyska = (host.sedi > 0.5 ? (host.sedadloTyp === 'stolicka' ? 1.95 : 1.65) : 2.0) * host.vzhled.vyska;
    const bod = promitni(host.x, vyska, host.z);
    if (!bod || bod.x < -100 || bod.x > window.innerWidth + 100 || bod.y < -60 || bod.hloubka > 13) return;
    const stav = host.parta ? host.parta.stav : 'personal';
    const zadost = host.parta && host === host.parta.mluvci && ['vola', 'ceka_pivo', 'plati'].includes(stav);
    // obyčejné povídání u vzdálených stolů nezobrazuj, ať obrazovka nezahltí
    if (!zadost && bod.hloubka > 7.5) return;
    zobrazit.add(host);
    let prvek = bublinyPrvky.get(host);
    if (!prvek) {
      prvek = h('div', { class: 'bublina' + (host.parta ? '' : ' personal') }, h('b'), h('span'), h('div', { class: 'cipy' }));
      ui.bubliny.append(prvek);
      bublinyPrvky.set(host, prvek);
    }
    nastavText(prvek.children[0], host.jmeno);
    nastavText(prvek.children[1], b.text);
    nastavText(prvek.children[2], b.cipy);
    prvek.children[2].hidden = !b.cipy;
    prvek.classList.toggle('vola', stav === 'vola' || stav === 'plati');
    const meritko = omez(2.6 / bod.hloubka, 0.55, 1.1);
    polozky.push({ prvek, x: bod.x, y: bod.y, meritko, hloubka: bod.hloubka, priorita: stav === 'vola' || stav === 'plati' ? 0 : zadost ? 1 : 2 });
  });
  for (const [klic, prvek] of bublinyPrvky) {
    if (!zobrazit.has(klic)) { prvek.remove(); bublinyPrvky.delete(klic); }
  }
  // rozmístění: důležité a blízké bubliny první, další se odsunou, aby se nepřekrývaly
  polozky.sort((a, b) => a.priorita - b.priorita || a.hloubka - b.hloubka);
  const W = window.innerWidth, H = window.innerHeight;
  const levy = ui.hudVlevo.getBoundingClientRect();
  const pravy = ui.hudVpravo.getBoundingClientRect();
  const obsazeno = [];
  const prekryv = (x0, y0, x1, y1) => obsazeno.find((r) => x0 < r.x1 && x1 > r.x0 && y0 < r.y1 && y1 > r.y0);
  polozky.forEach((p) => {
    const w = p.prvek.offsetWidth * p.meritko, v = p.prvek.offsetHeight * p.meritko;
    let x = omez(p.x, w / 2 + 6, W - w / 2 - 6);
    let y = omez(p.y, v + 8, H - 8);
    // nezalézt pod panely HUD
    if (y - v < levy.bottom + 4 && x - w / 2 < levy.right + 6) x = levy.right + 6 + w / 2;
    if (y - v < pravy.bottom + 4 && x + w / 2 > pravy.left - 6) x = Math.min(x, pravy.left - 6 - w / 2);
    for (let pokus = 0; pokus < 8; pokus++) {
      const r = prekryv(x - w / 2, y - v, x + w / 2, y);
      if (!r) break;
      y = r.y0 - 6 >= v + 8 ? r.y0 - 6 : r.y1 + 6 + v;
    }
    obsazeno.push({ x0: x - w / 2, x1: x + w / 2, y0: y - v, y1: y });
    p.prvek.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -100%) scale(${p.meritko.toFixed(3)})`;
    p.prvek.style.zIndex = String(1000 - Math.round(p.hloubka * 10));
  });
  for (let i = plovouci.length - 1; i >= 0; i--) {
    const f = plovouci[i];
    const t = casHry - f.zacatek;
    if (t > 1.8) { f.prvek.remove(); plovouci.splice(i, 1); continue; }
    const bod = promitni(f.x, f.y + t * 0.35, f.z);
    if (!bod || bod.x < 20 || bod.x > window.innerWidth - 20 || bod.y < 20 || bod.y > window.innerHeight - 20) { f.prvek.style.opacity = 0; continue; }
    f.prvek.style.opacity = String(Math.min(1, (1.8 - t) * 2));
    f.prvek.style.transform = `translate(${bod.x}px, ${bod.y}px) translate(-50%, -50%)`;
  }
}

/* ---------- Návod: co má hráč zrovna udělat ---------- */

function textNavodu() {
  if (!HRA.otevreno) return party.length ? '🔒 Zavřeno – hosté dopíjejí. Otevřeš cedulkou na dveřích.' : NAVOD.otevrit;
  const prazdny = PIVA.find((p) => jeNaCepu(p) && sud(p.id).zbyva <= 0);
  if (prazdny && party.some((pa) => pa.stav === 'ceka_pivo' && zbyvaDonest(pa).some((x) => x.pivo === prazdny.id))) {
    return sud(prazdny.id).zasoba > 0 ? `🛢️ Došel sud ${prazdny.nazev}! Jdi do skladu za barem a narazi nový` : `📖 Došel ${prazdny.nazev} a nemáš zásobu – objednej sud v knize (Sklad)`;
  }
  // jídlo v ruce má přednost (i kdyby hráč koupil kuchyni ještě před prvním hostem)
  const nechtene = ruce.piva.some((x) => x.listek && x.listek.stav === 'zruseno');
  if (nechtene) return '🍽️ Tohle jídlo už nikdo nechce – vrať ho do kuchyně (okénko) nebo vyhoď v dřezu';
  if (nesesJidlo() && (!HRA.jidel || HRA.obslouzeno === 0)) return NAVOD.nesJidlo;
  if (HRA.obslouzeno === 0) {
    if (cepuje) return '🎯 Pusť, až bude vršek pěny v zelené zóně';
    if (nalevaLahev) return '🎯 Pusť, až bude hladina na čárce (v zelené zóně)';
    const vola = party.find((p) => p.stav === 'vola');
    const ceka = party.find((p) => p.stav === 'ceka_pivo');
    if (ceka) {
      const zbyva = zbyvaDonest(ceka).filter((x) => !ruce.piva.some((p) => p.id === x.pivo));
      if (ruce.piva.length && (!zbyva.length || ruce.piva.length >= unosnostPiv())) return jePanak(ruce.piva[0].id) ? '🎯 Máš panáka! Dones ho hostovi a podej mu ho' : NAVOD.podej;
      const dalsi = zbyva[0] || zbyvaDonest(ceka)[0];
      if (!zaPultem()) return ceka.kde === 'bar' ? NAVOD.bar : '🎯 Objednávku máš – jdi za pult a připrav ji';
      return jePanak(dalsi.pivo) ? NAVOD.panak : NAVOD.cepuj;
    }
    if (vola) return NAVOD.vola;
    if (ruce.piva.length) return '🍺 Neseš nápoj, ale zatím ho nikdo nechce – počkej na hosty (nebo ho vylij v dřezu)';
    return NAVOD.cekej;
  }
  // jídlo z kuchyně
  if (maKuchyni() && !HRA.jidel) {
    if (kuchyne.okenko.length && !pocetCisniku()) return NAVOD.okenko;
    if (party.some((p) => aktivniJidla(p).length) && !ruce.piva.length) return NAVOD.jidlo;
  }
  if (kuchyne.okenko.some((l) => l.studene) && !pocetCisniku() && !nesesJidlo()) return '🔔 Na okénku chladne jídlo – rychle ho roznes!';
  if (party.some((p) => p.stav === 'plati') && !HRA.navod.platil && !personal.some((a) => a.role === 'pokladni')) return NAVOD.plati;
  const chcePanaka = party.some((pa) => pa.stav === 'ceka_pivo' && zbyvaDonest(pa).some((x) => jePanak(x.pivo)));
  if (nalevaLahev && HRA.panaku < 3) return '🎯 Pusť, až bude hladina na čárce (v zelené zóně)';
  if (chcePanaka && !HRA.panaku && !ruce.piva.some((p) => jePanak(p.id))) return NAVOD.panak;
  if (chcePanaka && cistePanakovky === 0 && !lahve.some((l) => l.sklenka) && !ruce.piva.some((p) => jePanak(p.id))) return '🥃 Došly čisté panákovky! Posbírej prázdné po hostech a umyj je v dřezu';
  if (casHry - nemajiKamCas < 8) return '🧽 Noví hosté nemají kam si sednout – ukliď prázdné sklenice ze stolů a z pultu';
  if (cisteSklenice === 0 && !ruce.sklenice.length && spinave.length) return '🍺 Došly čisté sklenice! Posbírej prázdné po hostech a umyj je v dřezu';
  if (ruce.sklenice.length >= unosnostSklenic()) return '🧽 Máš plné ruce nádobí – odnes ho do dřezu za pultem';
  if (!HRA.navod.kniha && HRA.penize >= 150) return NAVOD.kniha;
  if (!HRA.umyto && spinave.length && !personal.some((a) => a.role === 'sberac')) return NAVOD.sklenice;
  if (!maKuchyni() && !HRA.navod.kuchyneTip && HRA.penize >= 8000 && HRA.obslouzeno >= 3) return NAVOD.kuchyne;
  if (!pocetNajatych() && !HRA.navod.personalTip && HRA.penize >= 6000 && HRA.obslouzeno >= 8) return NAVOD.personal;
  return '';
}

// Kam ukazuje žlutý kosočtverec
function ukazatelNavodu() {
  if (REZIM === 'menu') return null;
  if (!HRA.otevreno && !party.length) return [SVET.cedule.x, SVET.cedule.y + 0.05, SVET.cedule.z - 0.15];
  const prazdny = PIVA.findIndex((p) => jeNaCepu(p) && sud(p.id).zbyva <= 0 && sud(p.id).zasoba > 0);
  if (prazdny >= 0 && party.some((pa) => pa.stav === 'ceka_pivo' && zbyvaDonest(pa).some((x) => x.pivo === PIVA[prazdny].id))) {
    const poz = SVET.sudPoz(prazdny);
    return veSkladu() ? [poz.x, 0.95, poz.z] : [SVET.prepazka, 2.1, (SVET.sklad.dvereZ0 + SVET.sklad.dvereZ1) / 2];
  }
  // kde se nápoj připravuje: u kohoutu, nebo u lahve
  const kdePripravit = (id) => {
    if (!zaPultem()) return [SVET.pult.x1 + 0.6, 1.6, 2.35];
    if (jePanak(id)) { const l = lahve.find((x) => x.panak.id === id); return [l.x, SVET.zadniPult.y + 0.45, SVET.lahveZ]; }
    const k = kohouty.find((x) => x.pivo.id === id);
    return [k.x, SVET.pult.y + 0.72, SVET.kohoutZ];
  };
  if (HRA.obslouzeno === 0) {
    const vola = party.find((p) => p.stav === 'vola');
    const ceka = party.find((p) => p.stav === 'ceka_pivo');
    if (ceka) {
      const zbyva = zbyvaDonest(ceka).filter((x) => !ruce.piva.some((p) => p.id === x.pivo));
      if (ruce.piva.length && (!zbyva.length || ruce.piva.length >= unosnostPiv())) return [ceka.mluvci.x, 1.9, ceka.mluvci.z];
      return kdePripravit((zbyva[0] || zbyvaDonest(ceka)[0]).pivo);
    }
    if (vola) return [vola.mluvci.x, 1.9, vola.mluvci.z];
    return null;
  }
  // první jídlo: ukázat okénko, pak hosta
  if (maKuchyni() && !HRA.jidel) {
    const jidlo = ruce.piva.find((x) => x.listek && x.listek.stav === 'nese');
    if (jidlo) return [jidlo.listek.komu.x, 1.9, jidlo.listek.komu.z];
    if (kuchyne.okenko.length && !pocetCisniku()) { const p = polohaNaOkenku(kuchyne.okenko[0].slot); return [p.x, p.y + 0.25, p.z]; }
  }
  const panakova = party.find((pa) => pa.stav === 'ceka_pivo' && zbyvaDonest(pa).some((x) => jePanak(x.pivo)));
  if (panakova && !HRA.panaku && !ruce.piva.some((p) => jePanak(p.id))) return kdePripravit(zbyvaDonest(panakova).find((x) => jePanak(x.pivo)).pivo);
  if (ruce.sklenice.length) return [SVET.drez.x, 1.25, SVET.drez.z];
  if (ruce.piva.some((x) => x.listek && x.listek.stav === 'zruseno') && maKuchyni()) { const o = SVET.okenkoStani; return [o.x, 1.35, o.z - 0.35]; }
  if (!HRA.navod.kniha && HRA.penize >= 150) return [SVET.kniha.x, SVET.pult.y + 0.3, SVET.kniha.z];
  if ((!HRA.umyto || cisteSklenice === 0 || casHry - nemajiKamCas < 8) && spinave.length && !personal.some((a) => a.role === 'sberac')) {
    const s = spinave.reduce((a, b) => (vzdalenost(hrac.x, hrac.z, a.x, a.z) < vzdalenost(hrac.x, hrac.z, b.x, b.z) ? a : b));
    return [s.x, s.y + 0.2, s.z];
  }
  return null;
}
/* =========================================================
   22) KNIHA VYLEPŠENÍ (výčep, hospoda, kuchyně, personál, sklad)
   ========================================================= */
let zalozka = 'vycep';

function otevriKnihu() {
  akceUvolni();
  REZIM = 'kniha';
  HRA.navod.kniha = true;
  odemkniMys();
  vykresliKnihu();
  $('kniha').hidden = false;
  zvuk.klik();
}

function zavriKnihu() {
  $('kniha').hidden = true;
  REZIM = 'hra';
  zamkniMys();
}

function urovenVylepseni(v) { return HRA.vylepseni[v.id] || 0; }

function tlacitkoKoupit(cena, akce, hotovo, textHotovo = '✔ Hotovo', textKoupit = 'Koupit') {
  if (hotovo) return h('button', { type: 'button', class: 'btn-kniha hotovo', disabled: true }, textHotovo);
  if (HRA.penize < cena) return h('button', { type: 'button', class: 'btn-kniha', disabled: true }, `${ceskaMena(cena)} · chybí ${ceskaMena(cena - HRA.penize)}`);
  return h('button', { type: 'button', class: 'btn-kniha koupit', onclick: akce }, `${textKoupit} za ${ceskaMena(cena)}`);
}

function kartaVylepseni(v) {
  const uroven = urovenVylepseni(v);
  const max = v.ceny.length;
  const tecky = h('div', { class: 'tecky', 'aria-label': `Úroveň ${uroven} z ${max}` },
    Array.from({ length: max }, (_, i) => h('span', { class: i < uroven ? 'plna' : null })));
  const chybi = v.potreba && !HRA.vylepseni[v.potreba];
  return h('div', { class: 'vylepseni' + (uroven >= max ? ' plne' : '') + (chybi ? ' zamcene' : '') },
    h('div', { class: 'vyl-ikona', 'aria-hidden': 'true' }, v.ikona),
    h('div', { class: 'vyl-text' }, h('h4', {}, v.nazev), h('p', {}, v.popis), max > 1 ? tecky : null),
    chybi ? h('button', { type: 'button', class: 'btn-kniha', disabled: true }, '🔒 Nejdřív otevři kuchyni')
      : tlacitkoKoupit(v.ceny[uroven], () => kupVylepseni(v), uroven >= max));
}

const vzorekPiva = (p) => h('span', { class: 'vzorek', style: `--b: ${rgbText(p.barva)}` });

function radekSudu(p) {
  const s = sud(p.id);
  const naCeste = dodavky.filter((d) => d.id === p.id).length;
  const stav = s.zbyva <= 0 ? 'prázdný!' : `${s.zbyva} / ${kapacitaSudu()} piv`;
  return h('div', { class: 'sud-radek' + (s.zbyva <= 0 ? ' prazdny' : '') },
    vzorekPiva(p),
    h('div', { class: 'sud-text' },
      h('h4', {}, p.nazev),
      h('p', {}, `Naražený sud: ${stav} · zásoba: ${s.zasoba}${naCeste ? ` · veze se: ${naCeste}` : ''}`)),
    HRA.penize >= p.sud
      ? h('button', { type: 'button', class: 'btn-kniha koupit', onclick: () => { if (objednejSud(p)) { zvuk.kasa(); ukazToast(`🚚 Objednáno: ${p.nazev}. Přivezou ho za chvíli.`); vykresliKnihu(); } } }, `Objednat sud · ${ceskaMena(p.sud)}`)
      : h('button', { type: 'button', class: 'btn-kniha', disabled: true }, `Sud ${ceskaMena(p.sud)} · chybí ${ceskaMena(p.sud - HRA.penize)}`));
}

function kartaNovehoPiva(p) {
  return h('div', { class: 'vylepseni' },
    h('div', { class: 'vyl-ikona', 'aria-hidden': 'true' }, vzorekPiva(p)),
    h('div', { class: 'vyl-text' }, h('h4', {}, `Nový kohout: ${p.nazev}`), h('p', {}, p.popis), h('p', { class: 'poznamka' }, `Cena piva ${p.cena} Kč, sud ${p.sud} Kč. Dostaneš první dva sudy.`)),
    tlacitkoKoupit(p.odemknout, () => odemkniPivo(p), false));
}

// Karta pomocníka: kdo to je, co právě dělá, nebo kolik stojí
function kartaPomocnika(def) {
  const role = ROLE_PERSONALU[def.role];
  const najaty = Boolean(HRA.vylepseni[def.id]);
  const agent = personal.find((a) => a.def === def);
  return h('div', { class: 'vylepseni pomocnik-karta' + (najaty ? ' plne' : '') },
    h('div', { class: 'vyl-ikona', 'aria-hidden': 'true' }, role.ikona),
    h('div', { class: 'vyl-text' },
      h('h4', {}, `${def.jmeno} · ${role.nazev.toLowerCase()}`),
      h('p', {}, def.popisek),
      najaty ? h('p', { class: 'pomocnik-stav', 'data-pomocnik': def.id }, `▶ Teď: ${agent ? agent.status : 'přichází do práce'}`) : null),
    najaty ? h('button', { type: 'button', class: 'btn-kniha hotovo', disabled: true }, '✔ Pracuje u nás')
      : tlacitkoKoupit(cenaPomocnika(def), () => {
        if (!najmiPomocnika(def)) return;
        zvuk.kasa();
        HRA.navod.personalTip = true;
        ukazToast(`👋 ${def.jmeno} nastupuje jako ${role.nazev.toLowerCase()}!`);
        vykresliKnihu();
      }, false, '', 'Najmout'));
}

function vykresliKnihu() {
  $('kniha-penize').textContent = ceskaMena(HRA.penize);
  document.querySelectorAll('.zalozka').forEach((z) => {
    z.classList.toggle('aktivni', z.dataset.kat === zalozka);
    z.setAttribute('aria-pressed', String(z.dataset.kat === zalozka));
  });
  // na úzkém displeji ať je vybraná záložka vidět
  const aktivni = document.querySelector('.zalozka.aktivni');
  const lista = aktivni && aktivni.parentElement;
  if (lista && lista.scrollWidth > lista.clientWidth) {
    lista.scrollLeft = Math.max(0, aktivni.offsetLeft - (lista.clientWidth - aktivni.offsetWidth) / 2);
  }
  const leva = $('kniha-leva');
  const prava = $('kniha-prava');
  if (zalozka === 'zaznamy') {
    const nej = Object.entries(HRA.jidlaDruhy || {}).sort((a, b) => b[1] - a[1])[0];
    const radky = [
      ['🍺 Natočeno piv', HRA.natoceno], ['🥃 Nalito panáků', HRA.panaku], ['🍽️ Vydaná jídla', HRA.jidel || 0],
      ['🥩 Nejoblíbenější jídlo', nej ? `${najdiJidlo(nej[0]).kratce} (${nej[1]}×)` : '–'], ['🙋 Doneseno nápojů', HRA.obslouzeno], ['😊 Spokojení hosté', HRA.hostu],
      ['⭐ Hodnocení hospody', `${HRA.hodnoceni.toFixed(1)} z 5`], ['🌟 Perfektní hladinky', HRA.perfektnich], ['🔥 Nejdelší série', HRA.nejSerie],
      ['🛢️ Naražené sudy', HRA.vymenySudu], ['🏒 Odbavené zápasy', HRA.zapasu], ['💦 Přelité', HRA.prelito], ['😤 Naštvaní hosté', HRA.odesli],
      ['🧽 Umyté nádobí', HRA.umyto], ['👥 Personál', `${pocetNajatych()} z ${PERSONAL.length}`], ['🧺 Personál posbíral', HRA.personalSklenic || 0],
      ['📝 Personál přijal objednávek', HRA.personalObjednavek || 0], ['💶 Personál vybral', ceskaMena(HRA.personalVybrano || 0)],
      ['🏆 Splněné úkoly', `${UKOLY.filter((u) => HRA.ukoly[u.id]).length} z ${UKOLY.length}`], ['💰 V kase', ceskaMena(HRA.penize)]
    ];
    leva.replaceChildren(h('h2', {}, 'Záznamy hospody'),
      h('table', { class: 'zaznamy' }, h('tbody', {}, radky.map(([a, b]) => h('tr', {}, h('th', { scope: 'row' }, a), h('td', {}, String(b)))))),
      h('p', { class: 'poznamka' }, 'Hodnocení stoupá, když točíš pěkné hladinky, jídlo nosíš teplé a hosté nečekají dlouho. Čím víc hvězd, tím víc hostů a větší dýško.'));
    prava.replaceChildren(h('h2', {}, 'Nápojový a jídelní lístek'),
      h('h3', { class: 'listek-nadpis' }, '🍺 Piva'),
      ...PIVA.map((p) => h('div', { class: 'pivo-radek' + (jeNaCepu(p) ? '' : ' zamcene') }, vzorekPiva(p),
        h('div', {}, h('h4', {}, `${p.nazev} · ${p.cena} Kč${jeNaCepu(p) ? '' : ' · 🔒 v knize (Sklad)'}`), h('p', {}, p.popis)))),
      h('p', { class: 'poznamka' }, 'Stupně (10°, 12°, 15°) neudávají alkohol, ale extrakt původní mladiny. Desítka je výčepní pivo, dvanáctka ležák a patnáctka speciál.'),
      h('h3', { class: 'listek-nadpis' }, '🥃 Panáky (0,04 l)'),
      ...PANAKY.map((p) => h('div', { class: 'pivo-radek' }, h('span', { class: 'vzorek panak', style: `--b: ${rgbText(p.barva)}` }),
        h('div', {}, h('h4', {}, `${p.nazev} · ${p.cena} Kč`), h('p', {}, p.popis)))),
      h('h3', { class: 'listek-nadpis' }, '🍽️ Z kuchyně'),
      ...JIDLA.map((j) => h('div', { class: 'pivo-radek' + (maKuchyni() && jeNaListku(j) ? '' : ' zamcene') }, h('span', { class: 'vzorek-jidlo', 'aria-hidden': 'true' }, j.ikona),
        h('div', {}, h('h4', {}, `${j.nazev} · ${j.cena} Kč${maKuchyni() && jeNaListku(j) ? '' : ' · 🔒'}`), h('p', {}, j.popis)))),
      h('p', { class: 'pripominka' }, '🍺 Ve hře pivo čepuješ, nepiješ. Ve skutečnosti pij s rozumem, prokládej pivo vodou a jídlem a po alkoholu nikdy za volant.'));
    return;
  }
  if (zalozka === 'ukoly') {
    const karta = (u) => {
      const hotovo = Boolean(HRA.ukoly[u.id]);
      const ma = Math.min(u.cil, u.hodnota(HRA));
      return h('div', { class: 'ukol' + (hotovo ? ' hotovo' : '') },
        h('div', { class: 'vyl-ikona', 'aria-hidden': 'true' }, u.ikona),
        h('div', { class: 'vyl-text' }, h('h4', {}, u.nazev), h('p', {}, u.popis),
          hotovo ? h('p', { class: 'ukol-stav' }, `✔ Splněno · odměna ${ceskaMena(u.odmena)}`)
            : h('div', { class: 'ukol-prubeh' }, h('div', { class: 'ukol-pln', style: `width: ${Math.round(ma / u.cil * 100)}%` }),
              h('span', {}, `${u.cil % 1 ? ma.toFixed(1).replace('.', ',') : Math.floor(ma).toLocaleString('cs-CZ')} / ${u.cil.toLocaleString('cs-CZ')} · odměna ${ceskaMena(u.odmena)}`))));
    };
    const pul = Math.ceil(UKOLY.length / 2);
    leva.replaceChildren(h('h2', {}, 'Úkoly'), h('p', { class: 'poznamka' }, `Splněno ${UKOLY.filter((u) => HRA.ukoly[u.id]).length} z ${UKOLY.length}. Odměna přijde rovnou do kasy.`), ...UKOLY.slice(0, pul).map(karta));
    prava.replaceChildren(...UKOLY.slice(pul).map(karta));
    return;
  }
  if (zalozka === 'sklad') {
    leva.replaceChildren(h('h2', {}, 'Sklad sudů'),
      h('p', { class: 'poznamka' }, 'Když sud dojde, jdi do skladu za barem a narazi nový. Náhradní sudy tady objednáš – přivezou je za chvíli. Lahve s pálenkou nedocházejí.'),
      ...PIVA.filter(jeNaCepu).map(radekSudu));
    const zamcena = PIVA.filter((p) => !jeNaCepu(p));
    prava.replaceChildren(h('h2', {}, 'Nová piva a sklad'),
      ...zamcena.map(kartaNovehoPiva),
      ...VYLEPSENI.filter((v) => v.kat === 'sklad').map(kartaVylepseni));
    return;
  }
  if (zalozka === 'personal') {
    HRA.navod.personalTip = true;
    const skupina = (role) => [h('h3', { class: 'listek-nadpis' }, `${ROLE_PERSONALU[role].ikona} ${ROLE_PERSONALU[role].mnozne}`),
      h('p', { class: 'poznamka' }, ROLE_PERSONALU[role].popis), ...PERSONAL.filter((p) => p.role === role).map(kartaPomocnika)];
    leva.replaceChildren(h('h2', {}, 'Personál'),
      h('p', { class: 'poznamka' }, `Máš ${pocetNajatych()} z ${PERSONAL.length} pomocníků. Každý další je o něco dražší. Pomocníci neberou práci, kterou zrovna děláš ty – když stojíš u hosta, nechají ho tobě.`),
      ...skupina('sberac'), ...skupina('pokladni'));
    prava.replaceChildren(...skupina('cisnik'),
      h('p', { class: 'poznamka' }, '💡 Číšníkům nos nápoje na výdej – tmavou podložku na konci pultu u knihy. Sami je roznesou ke stolům i na bar. Jídlo berou rovnou z okénka kuchyně.'));
    return;
  }
  if (zalozka === 'kuchyne') {
    HRA.navod.kuchyneTip = true;
    const seznam = VYLEPSENI.filter((v) => v.kat === 'kuchyne');
    const otevrena = maKuchyni();
    const listek = JIDLA.map((j) => h('div', { class: 'pivo-radek' + (otevrena && jeNaListku(j) ? '' : ' zamcene') },
      h('span', { class: 'vzorek-jidlo', 'aria-hidden': 'true' }, j.ikona),
      h('div', {}, h('h4', {}, `${j.nazev} · ${j.cena} Kč`), h('p', {}, `${j.popis} Vaří se ${j.doba} s.${jeNaListku(j) ? '' : ' (přibude s větší nabídkou)'}`))));
    leva.replaceChildren(h('h2', {}, 'Kuchyně'),
      h('p', { class: 'poznamka' }, otevrena
        ? `Kuchařka Jarmila vaří na ${pocetSporaku() === 2 ? 'dvou sporácích' : 'jednom sporáku'}. Vydáno jídel: ${HRA.jidel || 0}. Hotové jídlo zazvoní na okénku – vezmi ho a dones ke stolu, dokud je teplé.`
        : 'Kuchyně za sálem je zatím zatlučená. Když ji otevřeš, hosté si k pivu objednají i svíčkovou, guláš nebo smažák. Jídlo je dražší než pivo, takže se vyplatí.'),
      ...seznam.slice(0, 2).map(kartaVylepseni));
    prava.replaceChildren(...seznam.slice(2).map(kartaVylepseni), h('h3', { class: 'listek-nadpis' }, '🍽️ Jídelní lístek'), ...listek);
    return;
  }
  const seznam = VYLEPSENI.filter((v) => v.kat === zalozka);
  const pul = Math.ceil(seznam.length / 2);
  const nadpis = zalozka === 'vycep' ? 'Za pultem' : 'Hospoda';
  const uvod = zalozka === 'vycep' ? 'Lepší kohouty, jistější ruka, tác a panákovky – ať stihneš víc.' : `Sál má místo pro 10 stolů (teď ${pocetStolu()}). Víc stolů, hudba z jukeboxu a hokej v televizi přitáhnou víc hostů.`;
  leva.replaceChildren(h('h2', {}, nadpis), h('p', { class: 'poznamka' }, uvod), ...seznam.slice(0, pul).map(kartaVylepseni));
  prava.replaceChildren(...seznam.slice(pul).map(kartaVylepseni));
}

function kupVylepseni(v) {
  const uroven = urovenVylepseni(v);
  const cena = v.ceny[uroven];
  if (cena === undefined || HRA.penize < cena) return;
  if (v.potreba && !HRA.vylepseni[v.potreba]) return;
  HRA.penize -= cena;
  HRA.vylepseni[v.id] = uroven + 1;
  HRA.navod.kniha = true;
  if (v.id === 'sklenice') cisteSklenice += 6;
  if (v.id === 'panakovky') cistePanakovky += 6;
  if (['stul', 'jukebox', 'televize', 'kuchyne', 'sporak2', 'ohrivac'].includes(v.id)) prestavHospodu();
  if (v.id === 'kuchyne' || v.id === 'nabidka') prekresliMenu();
  ulozHru();
  zvuk.kasa();
  vykresliKnihu();
  ukazToast(v.id === 'kuchyne' ? '🍳 Kuchyně je otevřená! Kuchařka Jarmila už krájí cibuli.' : `✅ ${v.nazev}${v.ceny.length > 1 ? ' – úroveň ' + (uroven + 1) : ''}`);
}

function odemkniPivo(p) {
  if (jeNaCepu(p) || HRA.penize < p.odemknout) return;
  HRA.penize -= p.odemknout;
  HRA.odemcena.push(p.id);
  HRA.sudy[p.id] = { zbyva: kapacitaSudu(), zasoba: 1 };
  prestavHospodu();
  prekresliMenu();
  ulozHru();
  zvuk.kasa();
  vykresliKnihu();
  ukazToast(`🍺 Nový kohout: ${p.nazev}! Hosté si ho začnou objednávat.`);
}

// Po vylepšení se hospoda postaví znovu; hosté si ponechají svá místa
function prestavHospodu() {
  const stara = [...sedadla, ...stolicky];
  postavSvet();
  const nova = [...sedadla, ...stolicky];
  stara.forEach((s) => {
    if (!s.host && !s.carky) return;
    const n = nova.find((x) => x.typ === s.typ && Math.abs(x.x - s.x) < 0.01 && Math.abs(x.z - s.z) < 0.01);
    if (!n) return;
    n.carky = s.carky;
    if (s.host) { n.host = s.host; s.host.misto = n; }
  });
}

/* =========================================================
   23) MENU, PAUZA, NÁPOVĚDA, NASTAVENÍ GRAFIKY
   ========================================================= */
function zacniHru() {
  zvuk.start();
  REZIM = 'hra';
  $('menu').hidden = true;
  $('hud').hidden = false;
  zamkniMys();
  if (!HRA.natoceno) {
    setTimeout(() => ukazToast(vstup.dotykove
      ? '👆 Vlevo palcem chodíš, vpravo se rozhlížíš. Velké tlačítko = akce.'
      : '⌨️ WASD chůze, myš rozhlížení, E nebo levé tlačítko = akce, Shift = běh.', 5000), 400);
  }
}

function zapauzuj() {
  if (REZIM !== 'hra') return;
  akceUvolni();
  REZIM = 'pauza';
  $('pauza').hidden = false;
  odemkniMys();
}

function pokracuj() {
  $('pauza').hidden = true;
  REZIM = 'hra';
  zamkniMys();
}

function otevriNapovedu() { $('napoveda').hidden = false; }
function zavriNapovedu() { $('napoveda').hidden = true; }

const NAZVY_KVALITY = { vysoka: 'vysoká', stredni: 'střední', nizka: 'nízká' };
function aktualizujTlacitkoZvuku() {
  $('btn-zvuk').textContent = HRA.nastaveni.zvuk ? '🔊' : '🔇';
  $('btn-zvuk-pauza').textContent = HRA.nastaveni.zvuk ? '🔊 Zvuk zapnutý' : '🔇 Zvuk vypnutý';
  $('btn-hudba').textContent = HRA.nastaveni.hudba ? '🎵 Hudba z jukeboxu: zapnutá' : '🎵 Hudba z jukeboxu: vypnutá';
  $('btn-kvalita').textContent = `🎨 Grafika: ${NAZVY_KVALITY[kvalitaGrafiky]}`;
}

function prepniZvuk() {
  HRA.nastaveni.zvuk = !HRA.nastaveni.zvuk;
  zvuk.start();
  zvuk.nastavHlasitost();
  aktualizujTlacitkoZvuku();
  ulozHru();
}

// Vysoká → střední → nízká → vysoká
function prepniKvalitu() {
  const poradi = ['vysoka', 'stredni', 'nizka'];
  const dalsi = poradi[(poradi.indexOf(kvalitaGrafiky) + 1) % poradi.length];
  HRA.nastaveni.kvalita = dalsi;
  pouzijKvalitu(dalsi);
  vykon.skala = 1;
  aktualizujTlacitkoZvuku();
  ulozHru();
  ukazToast({ vysoka: '🎨 Vysoká grafika: měkké stíny i od lidí, odrazy, ztmavené kouty, záře světel, plastické zdi a podlaha.', stredni: '🎨 Střední grafika: stíny od nábytku, odrazy, kouty a záře – úsporněji, pro telefony.', nizka: '🎨 Nízká grafika: nejrychlejší, bez stínů a odrazů, pro slabé telefony.' }[kvalitaGrafiky], 3600);
}

function pripravUI() {
  ['toast', 'hodnoceni', 'plovouci', 'bubliny', 'objednavky', 'zamerovac', 'mericko'].forEach((id) => { ui[id] = $(id); });
  Object.assign(ui, {
    penize: $('hud-penize'), piva: $('hud-piva'), stav: $('hud-stav'), sklenice: $('hud-sklenice'), skleniceBox: $('hud-sklenice-box'),
    panakovky: $('hud-panakovky'), panakovkyBox: $('hud-panakovky-box'), kuchyne: $('hud-kuchyne'),
    hvezdy: $('hud-hvezdy'), hvezdyCislo: $('hud-hvezdy-cislo'), sudy: $('hud-sudy'),
    vyzva: $('vyzva'), vyzvaText: $('vyzva-text'), prubeh: $('prubeh'), prubehPln: $('prubeh-pln'),
    akce: $('btn-akce'), akceText: $('btn-akce-text'), ruce: $('ruce-info'), cil: $('hud-cil'),
    hudVlevo: document.querySelector('.hud-vlevo'), hudVpravo: document.querySelector('.hud-vpravo'),
    mPivo: $('m-pivo'), mPena: $('m-pena'), mPerfekt: $('m-perfekt'), mDobre: $('m-dobre'), mPopis: $('m-popis')
  });
  if (HRA.natoceno) {
    $('menu-info').textContent = `Vítej zpátky! Natočeno ${HRA.natoceno} piv, v kase ${ceskaMena(HRA.penize)}, hodnocení ${HRA.hodnoceni.toFixed(1)} ★.`;
    $('btn-hrat').textContent = '🍺 Pokračovat v hospodě';
  }
  $('btn-hrat').addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') prepniNaDotyk(); });
  $('btn-hrat').addEventListener('click', zacniHru);
  $('btn-napoveda-menu').addEventListener('click', otevriNapovedu);
  $('btn-pauza').addEventListener('click', zapauzuj);
  $('btn-pokracovat').addEventListener('click', pokracuj);
  $('btn-napoveda').addEventListener('click', otevriNapovedu);
  $('btn-reset').addEventListener('click', () => { $('potvrzeni').hidden = false; });
  $('btn-reset-ne').addEventListener('click', () => { $('potvrzeni').hidden = true; });
  $('btn-reset-ano').addEventListener('click', () => {
    try { localStorage.removeItem(NASTAVENI.klicUlozeni); } catch (e) { /* nevadí */ }
    location.reload();
  });
  const citlivost = $('citlivost');
  citlivost.value = HRA.nastaveni.citlivost;
  citlivost.addEventListener('input', () => { HRA.nastaveni.citlivost = Number(citlivost.value); ulozHru(); });
  $('btn-zvuk').addEventListener('click', prepniZvuk);
  $('btn-zvuk-pauza').addEventListener('click', prepniZvuk);
  $('btn-hudba').addEventListener('click', () => { HRA.nastaveni.hudba = !HRA.nastaveni.hudba; aktualizujTlacitkoZvuku(); ulozHru(); });
  $('btn-kvalita').addEventListener('click', prepniKvalitu);
  aktualizujTlacitkoZvuku();
  const cela = $('btn-cela');
  if (!document.fullscreenEnabled) cela.hidden = true;
  cela.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen().catch(() => {});
  });
  $('btn-zavrit-knihu').addEventListener('click', zavriKnihu);
  document.querySelectorAll('.zalozka').forEach((z) => z.addEventListener('click', () => {
    zalozka = z.dataset.kat;
    zvuk.klik();
    vykresliKnihu();
  }));
  $('btn-zavrit-napovedu').addEventListener('click', zavriNapovedu);
  document.addEventListener('keydown', (e) => {
    if (e.code !== 'Escape') return;
    if (!$('napoveda').hidden) zavriNapovedu();
    else if (!$('potvrzeni').hidden) $('potvrzeni').hidden = true;
    else if (REZIM === 'kniha') zavriKnihu();
    else if (REZIM === 'hra' && vstup.dotykove) zapauzuj();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { zapauzuj(); ulozHru(); } });
  window.addEventListener('pagehide', ulozHru);
  // personál v knize: stav se mění, tak se karta jednou za chvíli překreslí
  setInterval(() => {
    if (REZIM !== 'kniha' || zalozka !== 'personal') return;
    document.querySelectorAll('[data-pomocnik]').forEach((p) => {
      const a = personal.find((x) => x.def.id === p.dataset.pomocnik);
      if (a) nastavText(p, `▶ Teď: ${a.status}`);
    });
  }, 500);
}
/* =========================================================
   24) START A HLAVNÍ SMYČKA
   ========================================================= */
let posledniCas = 0;
let casTV = 0;
let casUlozeni = 0;
let samaSimulace = true; // testy si můžou simulaci krokovat samy

// Jeden krok hry (pohyb, hosté, čepování, kuchyně, personál…)
function krokSimulace(dt) {
  casHry += dt;
  aktualizujHrace(dt);
  aktualizujHosty(dt);
  aktualizujCepovani(dt);
  aktualizujNalevani(dt);
  aktualizujKuchyni(dt);
  aktualizujPersonal(dt);
  aktualizujDvere(dt);
  aktualizujHokej(dt);
  aktualizujKocku(dt);
  aktualizujUkoly(dt);
  aktualizujCastice(dt, REZIM === 'menu' ? [10, 2, 8] : polohaOci());
  cil = najdiCil();
  casUlozeni += dt;
  if (casUlozeni > 15) { casUlozeni = 0; ulozHru(); }
}

function smycka(ms) {
  const t = ms / 1000;
  const dt = Math.min(0.05, Math.max(0, t - posledniCas)) || 0.016;
  posledniCas = t;
  if (REZIM === 'hra' && samaSimulace) krokSimulace(dt);
  if (REZIM === 'menu') aktualizujCastice(dt, [10, 2, 8]);
  if (HRA.vylepseni.televize && REZIM !== 'pauza') {
    casTV += dt;
    if (casTV > 0.1) { aktualizujTV(casTV); casTV = 0; }
  }
  zmerVykon(dt);
  vykresliSnimek(t);
  // zvuky prostředí: hovor hostů a hudba z jukeboxu
  zvuk.ruchHospody(hoste.length);
  zvuk.dest(REZIM === 'hra' ? silaDeste(t) : 0);
  zvuk.hudba(REZIM === 'hra' && HRA.vylepseni.jukebox && HRA.nastaveni.hudba && HRA.nastaveni.zvuk);
  if (REZIM !== 'hra') zvuk.kuchyne(0);
  if (REZIM !== 'menu') {
    aktualizujHUD();
    aktualizujBubliny();
    $('klikni').hidden = !(REZIM === 'hra' && !vstup.dotykove && !vstup.zamceno);
  }
  requestAnimationFrame(smycka);
}

// Výchozí kvalita grafiky: telefony a tablety střední, počítače vysoká,
// softwarové vykreslování (bez grafické karty) nízká. Když se hra zadrhává, sníží se sama.
function vychoziKvalita() {
  if (HRA.nastaveni.kvalita) return HRA.nastaveni.kvalita;
  try {
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    const nazev = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
    if (/swiftshader|llvmpipe|software|basic render/i.test(nazev)) return 'nizka';
  } catch (e) { /* nevadí */ }
  const dotyk = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  return dotyk ? 'stredni' : 'vysoka';
}

function init() {
  if (!gl) {
    $('menu-info').textContent = '😢 Tenhle prohlížeč neumí WebGL, takže 3D hospoda nepůjde spustit. Zkus aktuální Chrome, Edge, Firefox nebo Safari.';
    $('btn-hrat').disabled = true;
    return;
  }
  pripravGL();
  pouzijKvalitu(vychoziKvalita());
  vytvorZakladniSite();
  vytvorTextury();
  postavSvet();
  pripravEfekty();
  cisteSklenice = kapacitaRegalu();
  cistePanakovky = kapacitaPanakovek();
  // sudy, které byly při minulé hře na cestě
  if (Array.isArray(HRA.dodavky)) HRA.dodavky.forEach((d) => { if (d && najdiPivo(d.id)) dodavky.push({ id: d.id, za: Math.min(d.za || 0, NASTAVENI.dovozSudu), platitPriDovozu: Boolean(d.platitPriDovozu) }); });
  delete HRA.dodavky;
  pripravUI();
  nastavOvladaniHrace();
  platno.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') prepniNaDotyk(); });
  requestAnimationFrame(smycka);
}

init();
