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
  unosnostPiv: 2,          // kolik piv uneseš v rukou (bez tácu)
  unosnostSklenic: 4,      // kolik prázdných sklenic uneseš najednou
  pitiZaPivo: [26, 40],    // jak dlouho host pije jedno pivo (s)
  kapacitaSudu: 20,        // kolik piv je v jednom sudu
  dovozSudu: 15,           // za kolik sekund přivezou objednané sudy
  klicUlozeni: 'hospodaRadegast3D.v3'
};

/* =========================================================
   2) PIVA NA ČEPU
   vez = výčepní věž (A vlevo, B vpravo), sklo = tvar sklenice
   odemknout = cena nového kohoutu v knize (0 = je na čepu od začátku)
   nazvy = jak pivu hosté říkají; dve/tri = jak řeknou víc kusů
   ========================================================= */
const PIVA = [
  {
    id: 'r10', nazev: 'Radegast 10', kratce: 'Radegast 10', typ: 'výčepní, hořké', cena: 42, sud: 480, odemknout: 0,
    vez: 'A', x: 4.2, sklo: 'pulitr', barva: [0.93, 0.62, 0.12], packa: [0.75, 0.12, 0.1], pruh: [0.72, 0.1, 0.1],
    popis: 'Rázná desítka z Nošovic: lehčí výčepní pivo, ale pořádně hořké (kolem 30 IBU).',
    nazvy: ['Radegast desítku', 'desítku z Radegastu', 'Ráznou desítku', 'hořkou desítku z Nošovic', 'desítku Radegast', 'Radegast deset'],
    dve: ['dvě Radegast desítky', 'dvakrát Radegast desítku'], tri: ['tři Radegast desítky']
  },
  {
    id: 'r12', nazev: 'Radegast 12', kratce: 'Radegast 12', typ: 'ležák, hořký', cena: 54, sud: 620, odemknout: 0,
    vez: 'A', x: 3.9, sklo: 'pulitr', barva: [0.86, 0.52, 0.08], packa: [0.55, 0.08, 0.08], pruh: [0.55, 0.06, 0.06],
    popis: 'Ryze hořká dvanáctka: světlý ležák s plnou hořkou chutí (kolem 36 IBU, 5,1 %).',
    nazvy: ['Radegast dvanáctku', 'Ryze hořkou', 'hořkou dvanáctku z Nošovic', 'dvanáctku Radegast', 'Radegast dvanáct', 'dvanáctku od Radegastu'],
    dve: ['dvě Radegast dvanáctky', 'dvakrát Ryze hořkou'], tri: ['tři Radegast dvanáctky']
  },
  {
    id: 'r15', nazev: 'Radegast 15', kratce: 'Radegast 15', typ: 'speciál, silné', cena: 69, sud: 820, odemknout: 900,
    vez: 'A', x: 3.6, sklo: 'pulitr', barva: [0.68, 0.34, 0.07], packa: [0.25, 0.05, 0.05], pruh: [0.2, 0.05, 0.05],
    popis: 'Silná patnáctka – Radegast vaří patnáctky jako limitované edice (třeba polotmavá Drsná 15 má 6,4 %).',
    nazvy: ['patnáctku', 'Radegast patnáctku', 'něco silnýho', 'to nejsilnější, co máte', 'speciál od Radegastu'],
    dve: ['dvě patnáctky', 'dvakrát patnáctku'], tri: ['tři patnáctky']
  },
  {
    id: 'g10', nazev: 'Gambrinus 10', kratce: 'Gambrinus', typ: 'výčepní', cena: 44, sud: 500, odemknout: 0,
    vez: 'B', x: 6.75, sklo: 'valec', barva: [0.95, 0.68, 0.18], packa: [0.12, 0.45, 0.2], pruh: [0.1, 0.45, 0.2],
    popis: 'Gambrinus Originál 10 z Plzně – nejoblíbenější desítka v Česku, 4,3 % alkoholu.',
    nazvy: ['Gambrinusa', 'Gambáče', 'Gambrinus desítku', 'jednoho Gambáče', 'desítku Gambrinus', 'zelenou desítku'],
    dve: ['dva Gambrinusy', 'dva Gambáče'], tri: ['tři Gambrinusy', 'tři Gambáče']
  },
  {
    id: 'k', nazev: 'Kozel Černý', kratce: 'Kozel černý', typ: 'tmavé', cena: 46, sud: 520, odemknout: 0, tmave: true,
    vez: 'B', x: 6.45, sklo: 'pohar', barva: [0.24, 0.1, 0.04], packa: [0.2, 0.12, 0.08], pruh: [0.75, 0.6, 0.25],
    popis: 'Tmavé pivo z Velkých Popovic, kde se Kozel vaří od roku 1874. Jemně nasládlé, 3,8 %.',
    nazvy: ['Kozla', 'černýho Kozla', 'tmavýho Kozla', 'něco tmavýho', 'jedno tmavý', 'tmavé pivo'],
    dve: ['dva Kozly', 'dvě tmavý', 'dva černý Kozly'], tri: ['tři Kozly', 'tři tmavý']
  },
  {
    id: 'pu', nazev: 'Pilsner Urquell', kratce: 'Plzeň', typ: 'ležák', cena: 62, sud: 720, odemknout: 450,
    vez: 'B', x: 6.15, sklo: 'pulitr', barva: [0.94, 0.66, 0.15], packa: [0.75, 0.6, 0.2], pruh: [0.08, 0.35, 0.15],
    popis: 'Plzeňský Prazdroj: první světlý ležák na světě, uvařil ho Josef Groll v roce 1842. Žatecký chmel, 4,4 %.',
    nazvy: ['Plzeň', 'Prazdroj', 'Plzničku', 'Pilsner', 'plzeňskou dvanáctku', 'Urquell'],
    dve: ['dvě Plzně', 'dvakrát Plzeň', 'dva Prazdroje'], tri: ['tři Plzně', 'tři Prazdroje']
  },
  {
    id: 'rb', nazev: 'Rebel 12', kratce: 'Rebel', typ: 'ležák', cena: 52, sud: 600, odemknout: 400,
    vez: 'B', x: 5.85, sklo: 'pulitr', barva: [0.9, 0.6, 0.13], packa: [0.15, 0.25, 0.55], pruh: [0.15, 0.25, 0.55],
    popis: 'Havlíčkobrodský Rebel Originál 12 – světlý ležák z Havlíčkova Brodu, 4,8 %.',
    nazvy: ['Rebela', 'Rebel dvanáctku', 'něco z Brodu', 'Havlíčkobrodskýho Rebela', 'jednoho Rebela', 'brodskou dvanáctku'],
    dve: ['dva Rebely', 'dvakrát Rebela'], tri: ['tři Rebely']
  }
];
PIVA.forEach((p) => {
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
   4) KNIHA VYLEPŠENÍ
   kat: 'vycep' = za pultem, 'hospoda' = hospoda a hosté, 'sklad' = sudy
   ========================================================= */
const VYLEPSENI = [
  { id: 'kohout', kat: 'vycep', ikona: '🚰', nazev: 'Rychlejší kohouty', ceny: [250, 600, 1200], popis: 'Pivo teče o 15 % rychleji za každou úroveň.' },
  { id: 'ruka', kat: 'vycep', ikona: '✋', nazev: 'Jistá ruka', ceny: [300, 700, 1400], popis: 'Zelená zóna perfektní hladinky se rozšíří.' },
  { id: 'sklenice', kat: 'vycep', ikona: '🍺', nazev: 'Víc sklenic', ceny: [150, 400, 800], popis: '+6 čistých sklenic do regálu za úroveň.' },
  { id: 'tac', kat: 'vycep', ikona: '🍽️', nazev: 'Tác', ceny: [400, 1100], popis: 'Na tác se vejdou 4, pak 6 piv. Uneseš i víc prázdných sklenic.' },
  { id: 'boty', kat: 'vycep', ikona: '👟', nazev: 'Pohodlné boty', ceny: [200, 500, 1000], popis: 'Chodíš o 12 % rychleji za úroveň.' },
  { id: 'usmev', kat: 'vycep', ikona: '😊', nazev: 'Úsměv za pípou', ceny: [350, 900], popis: 'Hosté dávají o 25 % větší dýško za úroveň.' },
  { id: 'stul', kat: 'hospoda', ikona: '🪑', nazev: 'Nový stůl', ceny: [600, 1300, 2500], popis: 'Přibude stůl s kostkovaným ubrusem a čtyřmi židlemi.' },
  { id: 'reklama', kat: 'hospoda', ikona: '🪧', nazev: 'Cedule u silnice', ceny: [500, 1200], popis: 'Hosté chodí častěji (o 15 % za úroveň).' },
  { id: 'jukebox', kat: 'hospoda', ikona: '🎵', nazev: 'Jukebox', ceny: [900], popis: 'Hraje k pivu – hosté vydrží čekat o 30 % déle.' },
  { id: 'televize', kat: 'hospoda', ikona: '📺', nazev: 'Televize s hokejem', ceny: [1500], popis: 'Na hokej chodí víc lidí a dávají větší dýško.' },
  { id: 'pomocnik', kat: 'hospoda', ikona: '🧑‍🍳', nazev: 'Pomocník Pepa', ceny: [3500], popis: 'Pepa sám sbírá prázdné sklenice ze stolů i z pultu a myje je.' },
  { id: 'sudy', kat: 'sklad', ikona: '🛢️', nazev: 'Větší sudy', ceny: [700, 1600], popis: 'Do sudu se vejde o 10 piv víc (30, pak 40).' },
  { id: 'smlouva', kat: 'sklad', ikona: '📜', nazev: 'Smlouva s pivovarem', ceny: [2000], popis: 'Když dojde zásoba, pivovar sám přiveze nový sud (zaplatíš ho při dovozu).' }
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
  sud: '🎯 Došel sud! Jdi do skladu za barem a narazi nový'
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
const PRIJMENI_TITULY = { seniorka: ['paní Nováková', 'paní Dvořáková', 'babička Věra', 'paní Jarmila', 'paní Božena'], byznys: ['pan inženýr', 'pan doktor', 'pan ředitel', 'paní inženýrka'] };

/* ---------- Společné hlášky pro všechny ---------- */
const KONCE = ['', '', '', ' Díky!', ' Děkuju.', ' Na zdraví!', ' Ať to klouže.', ' 😄'];
const HLASKY_SPATNE = ['Tohle jsem {nechtěl|nechtěla}!', 'To není moje pivo.', 'Vedle, kamaráde.', 'Ne ne, já {chtěl|chtěla} něco jiného.', 'Spletls to, {j}.'];
const HLASKY_NIC_MOC = ['No… příště plnou míru, jo?', 'Hmm, to je samá pěna.', 'Tak jo… ale nic moc.', 'To je šnyt, ne hladinka.', 'Míra by mohla bejt lepší.'];
const HLASKY_DALSI_KOLO = ['Ještě jednou to samý!', 'To bylo dobrý, dáme ještě.', 'Další kolo!', 'Ještě jedno, ať nejsem na jednu nohu.',
  'Tak ještě jedno a dost.', 'Pivo je dobrý, dáme si další.'];
const HLASKY_ZAPLACENO = ['Tady máš, a drobný si nech.', 'Díky, bylo to fajn.', 'Sedí to. Díky!', 'Tady, a ještě něco navíc.', 'Díky za obsluhu!'];
const HLASKY_BEZ_DYSKA = ['Tady máš. Přesně.', 'Na dýško zapomeň.', 'No, tady máš, ale dýško nečekej.'];
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
   Osvětlení se počítá ve vrcholech (velké plochy jsou rozdělené
   na dílky) – hra tak běží plynule i na slabších telefonech.
   Postavy mají „kosti“: jedna síť, 14 matic → plynulá animace.
   ========================================================= */
const platno = $('platno');
const gl = platno.getContext('webgl', { antialias: true, alpha: false, preserveDrawingBuffer: false })
  || platno.getContext('experimental-webgl');
const rozsireni = {};
const POCET_KOSTI = 14;

const SHADER_VRCHOLY = `
attribute vec3 aPoz;
attribute vec3 aNor;
attribute vec4 aBarva;
attribute vec2 aUv;
attribute float aKost;
uniform mat4 uProj;
uniform mat4 uPohled;
uniform mat4 uKosti[${POCET_KOSTI}];
uniform vec4 uUvObdelnik;
uniform vec3 uSvetloPoz[8];
uniform vec3 uSvetloBarva[8];
uniform vec3 uOkoli;
varying vec3 vSvetlo;
varying vec4 vBarva;
varying vec2 vUv;
varying vec2 vUvSurove;
varying float vHloubka;
void main() {
  mat4 m = uKosti[int(aKost + 0.5)];
  vec4 svet = m * vec4(aPoz, 1.0);
  vec3 n = normalize((m * vec4(aNor, 0.0)).xyz);
  vec3 svetlo = uOkoli * (0.68 + 0.32 * n.y);
  for (int i = 0; i < 8; i++) {
    vec3 l = uSvetloPoz[i] - svet.xyz;
    float d2 = dot(l, l);
    float lambert = max(dot(n, l * inversesqrt(d2)), 0.0) * 0.78 + 0.22;
    svetlo += uSvetloBarva[i] * lambert / (1.0 + d2 * 0.5);
  }
  vSvetlo = svetlo;
  vBarva = aBarva;
  vUvSurove = aUv;
  vUv = uUvObdelnik.xy + aUv * uUvObdelnik.zw;
  vec4 pohled = uPohled * svet;
  vHloubka = -pohled.z;
  gl_Position = uProj * pohled;
}`;

const SHADER_PIXELY = `
precision mediump float;
uniform sampler2D uTex;
uniform vec4 uTint;
uniform float uEmise;
uniform float uEfekt;
uniform float uCas;
uniform vec3 uMlhaBarva;
uniform float uMlha;
varying vec3 vSvetlo;
varying vec4 vBarva;
varying vec2 vUv;
varying vec2 vUvSurove;
varying float vHloubka;
void main() {
  vec4 tex = texture2D(uTex, vUv);
  vec3 zaklad = tex.rgb * vBarva.rgb * uTint.rgb;
  float emise = max(vBarva.a, uEmise);
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
  vec3 barva = zaklad * mix(vSvetlo, vec3(1.15), emise);
  float mlha = exp(-uMlha * vHloubka);
  barva = mix(uMlhaBarva, barva, mlha);
  gl_FragColor = vec4(barva, uTint.a * tex.a);
}`;

function zkompiluj(typ, zdroj) {
  const s = gl.createShader(typ);
  gl.shaderSource(s, zdroj);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('Shader: ' + gl.getShaderInfoLog(s));
  return s;
}

let program = null;
const loc = {};
const ATRIBUTY = ['aPoz', 'aNor', 'aBarva', 'aUv', 'aKost'];
function pripravGL() {
  rozsireni.uint = gl.getExtension('OES_element_index_uint');
  rozsireni.aniso = gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
  program = gl.createProgram();
  gl.attachShader(program, zkompiluj(gl.VERTEX_SHADER, SHADER_VRCHOLY));
  gl.attachShader(program, zkompiluj(gl.FRAGMENT_SHADER, SHADER_PIXELY));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Program: ' + gl.getProgramInfoLog(program));
  gl.useProgram(program);
  ATRIBUTY.forEach((n) => { loc[n] = gl.getAttribLocation(program, n); gl.enableVertexAttribArray(loc[n]); });
  ['uProj', 'uPohled', 'uUvObdelnik', 'uTex', 'uTint', 'uEmise', 'uEfekt', 'uCas', 'uOkoli', 'uMlhaBarva', 'uMlha']
    .forEach((n) => { loc[n] = gl.getUniformLocation(program, n); });
  loc.uKosti = gl.getUniformLocation(program, 'uKosti[0]');
  loc.uSvetloPoz = gl.getUniformLocation(program, 'uSvetloPoz[0]');
  loc.uSvetloBarva = gl.getUniformLocation(program, 'uSvetloBarva[0]');
  gl.uniform1i(loc.uTex, 0);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
}

/* ---------- Skládání sítí: poloha, normála, barva+emise, uv, kost ---------- */
class Davka {
  constructor() { this.data = []; this.idx = []; this.n = 0; this.kost = 0; }
  vrchol(x, y, z, nx, ny, nz, barva, e, u, v) {
    this.data.push(x, y, z, nx, ny, nz, barva[0], barva[1], barva[2], e, u, v, this.kost);
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

// Válec: střed podstavy (cx, y0, cz), poloměr r, výška v
function valec(d, cx, y0, cz, r, v, seg, barva, opt = {}) {
  soustruh(d, [[r, 0], [r, v]], seg, barva, { ...opt, posun: [cx, y0, cz], vicko: opt.horni !== false });
}

// Rotační těleso (soustruh): profil [[poloměr, výška], …] odspodu nahoru
function soustruh(d, profil, seg, barva, opt = {}) {
  const e = opt.e || 0;
  const [px, py, pz] = opt.posun || [0, 0, 0];
  const vyskaMax = Math.max(...profil.map((b) => b[1])) || 1;
  const radky = [];
  profil.forEach(([r, y], k) => {
    // normála z okolních bodů profilu
    const a = profil[Math.max(0, k - 1)], b = profil[Math.min(profil.length - 1, k + 1)];
    let nr = b[1] - a[1], ny = -(b[0] - a[0]);
    const l = Math.hypot(nr, ny) || 1;
    nr /= l; ny /= l;
    if (opt.dovnitr) { nr = -nr; ny = -ny; }
    const radek = [];
    for (let i = 0; i <= seg; i++) {
      const uhel = (i / seg) * Math.PI * 2;
      const s = Math.sin(uhel), c = Math.cos(uhel);
      radek.push(d.vrchol(px + s * r, py + y, pz + c * r, s * nr, ny, c * nr, opt.barvaRadku ? opt.barvaRadku(k) : barva, e, i / seg, y / vyskaMax));
    }
    radky.push(radek);
  });
  for (let k = 0; k < radky.length - 1; k++) {
    for (let i = 0; i < seg; i++) {
      const a = radky[k][i], b = radky[k][i + 1], c = radky[k + 1][i + 1], dd = radky[k + 1][i];
      if (opt.dovnitr) d.ctyruhelnik(a, dd, c, b); else d.ctyruhelnik(a, b, c, dd);
    }
  }
  if (opt.vicko) {
    const [r, y] = profil[profil.length - 1];
    const stred = d.vrchol(px, py + y, pz, 0, 1, 0, barva, e, 0.5, 0.5);
    const okraj = d.n;
    for (let i = 0; i <= seg; i++) {
      const uhel = (i / seg) * Math.PI * 2;
      d.vrchol(px + Math.sin(uhel) * r, py + y, pz + Math.cos(uhel) * r, 0, 1, 0, barva, e, 0.5 + Math.sin(uhel) / 2, 0.5 + Math.cos(uhel) / 2);
    }
    for (let i = 0; i < seg; i++) d.idx.push(stred, okraj + i, okraj + i + 1);
  }
  if (opt.dno) {
    const [r, y] = profil[0];
    const stred = d.vrchol(px, py + y, pz, 0, -1, 0, barva, e, 0.5, 0.5);
    const okraj = d.n;
    for (let i = 0; i <= seg; i++) {
      const uhel = (i / seg) * Math.PI * 2;
      d.vrchol(px + Math.sin(uhel) * r, py + y, pz + Math.cos(uhel) * r, 0, -1, 0, barva, e, 0.5 + Math.sin(uhel) / 2, 0.5 + Math.cos(uhel) / 2);
    }
    for (let i = 0; i < seg; i++) d.idx.push(stred, okraj + i + 1, okraj + i);
  }
}

// Trubka podél lomené čáry (ucho sklenice, hadice k sudům)
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

const STRIDE = 52;
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

// Jednotkové sítě pro pohyblivé věci
const SITE = {};
function vytvorZakladniSite() {
  const bila = [1, 1, 1];
  let d = new Davka();
  kvadr(d, -0.5, -0.5, -0.5, 0.5, 0.5, 0.5, bila, { uvCele: true, deleni: 0 });
  SITE.kostka = vytvorSit(d);
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
}

/* ---------- Kreslení ---------- */
const BILA4 = new Float32Array([1, 1, 1, 1]);
const UV_CELE = new Float32Array([0, 0, 1, 1]);
let aktualniSit = null;
let aktualniTextura = null;
let pocetKresleni = 0;
let aktualniEfekt = -1;

function navazSit(sit) {
  if (aktualniSit === sit) return;
  aktualniSit = sit;
  gl.bindBuffer(gl.ARRAY_BUFFER, sit.vbo);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sit.ibo);
  gl.vertexAttribPointer(loc.aPoz, 3, gl.FLOAT, false, STRIDE, 0);
  gl.vertexAttribPointer(loc.aNor, 3, gl.FLOAT, false, STRIDE, 12);
  gl.vertexAttribPointer(loc.aBarva, 4, gl.FLOAT, false, STRIDE, 24);
  gl.vertexAttribPointer(loc.aUv, 2, gl.FLOAT, false, STRIDE, 40);
  gl.vertexAttribPointer(loc.aKost, 1, gl.FLOAT, false, STRIDE, 48);
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

function kresli(sit, model, textura, tint, emise, uv, efekt = 0) {
  navazSit(sit);
  navazTexturu(textura || textury.bila);
  nastavEfekt(efekt);
  gl.uniformMatrix4fv(loc.uKosti, false, model);
  gl.uniform4fv(loc.uTint, tint || BILA4);
  gl.uniform1f(loc.uEmise, emise || 0);
  gl.uniform4fv(loc.uUvObdelnik, uv || UV_CELE);
  gl.drawElements(gl.TRIANGLES, sit.pocet, sit.typ, 0);
  pocetKresleni++;
}

// Síť s kostmi: kosti = Float32Array(POCET_KOSTI * 16)
function kresliSKostmi(sit, kosti) {
  navazSit(sit);
  navazTexturu(textury.bila);
  nastavEfekt(0);
  gl.uniformMatrix4fv(loc.uKosti, false, kosti);
  gl.uniform4fv(loc.uTint, BILA4);
  gl.uniform1f(loc.uEmise, 0);
  gl.uniform4fv(loc.uUvObdelnik, UV_CELE);
  gl.drawElements(gl.TRIANGLES, sit.pocet, sit.typ, 0);
  pocetKresleni++;
}

// Kostka se středem (x, y, z), rozměry (sx, sy, sz), volitelně natočená kolem Y
function kresliKostku(x, y, z, sx, sy, sz, barva, opt = {}) {
  let m = M4.posun(x, y, z);
  if (opt.rotY) m = M4.krat(m, M4.rotY(opt.rotY));
  m = M4.krat(m, M4.meritko(sx, sy, sz));
  kresli(SITE.kostka, m, opt.tex, barva, opt.e);
}

function nastavSvetla(svetla) {
  const poz = new Float32Array(24);
  const barvy = new Float32Array(24);
  svetla.slice(0, 8).forEach((s, i) => {
    poz.set(s.poz, i * 3);
    barvy.set(s.barva.map((c) => c * s.sila), i * 3);
  });
  gl.uniform3fv(loc.uSvetloPoz, poz);
  gl.uniform3fv(loc.uSvetloBarva, barvy);
}
/* =========================================================
   10) SKLENICE – tři tvary (půllitr s uchem, válec, pohár)
   Sklo je průhledná „soustružená“ síť, uvnitř pivo s bublinkami
   a čepice pěny. Rozměry jsou ve skutečných metrech.
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
  }
};

Object.values(TVARY_SKLENIC).forEach((t) => { t.vyskaSkla = Math.max(...t.profil.map((b) => b[1])); });

function vytvorSitSklenic() {
  const bila = [1, 1, 1];
  SITE.sklo = {};
  SITE.tekutina = {};
  Object.entries(TVARY_SKLENIC).forEach(([typ, t]) => {
    let d = new Davka();
    soustruh(d, t.profil, 18, bila, { dno: true });
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
}

const SKLO_TINT = new Float32Array([0.9, 0.96, 1.0, 1]);
const SKLO_ZAKALENE = new Float32Array([0.85, 0.85, 0.8, 1]);
const PENA_BARVA = new Float32Array([1.0, 0.97, 0.9, 1]);
const PENA_TMAVA = new Float32Array([0.97, 0.91, 0.8, 1]);
let pruhledne = []; // sklo se kreslí až nakonec (průhledně)

// Pivo ve sklenici: plneni = výška vršku pěny v % vnitřku sklenice
function kresliSklenici(x, y, z, plneni, pivo, opt = {}) {
  const typ = opt.typ || (pivo ? pivo.sklo : 'pulitr');
  const t = TVARY_SKLENIC[typ];
  const otoc = opt.otoceni || 0;
  const zaklad = M4.retez(M4.posun(x, y, z), M4.rotY(otoc), opt.meritko ? M4.meritko(opt.meritko, opt.meritko, opt.meritko) : M4.jednotkova());
  const vrch = omez(plneni, 0, 100) / 100;
  if (pivo && vrch > 0.01) {
    const pena = Math.min(vrch * 0.22, 0.18);
    const tekutina = Math.max(vrch - pena, 0);
    const r = t.rNahore * 0.985;
    if (tekutina > 0.005) {
      kresli(SITE.tekutina[typ], M4.retez(zaklad, M4.posun(0, t.dno, 0), M4.meritko(r, t.vyska * tekutina, r)), null, pivo._barva, 0, null, 1);
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

function kresliPruhledne() {
  if (!pruhledne.length) return;
  gl.enable(gl.BLEND);
  gl.depthMask(false);
  pruhledne.forEach((p) => kresli(p.sit, p.m, p.hladke ? textury.skloHladke : textury.sklo, p.zakalene ? SKLO_ZAKALENE : SKLO_TINT, 0.25));
  gl.depthMask(true);
  gl.disable(gl.BLEND);
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
   11) TEXTURY – všechno se kreslí za běhu na plátno (žádné obrázky)
   ========================================================= */
const textury = {};
const ATLAS = {}; // název → [u0, v0, du, dv]
const ATLAS_VELIKOST = 1024;
let atlasPlatno = null;

function noveplatno(sirka, vyska) {
  const c = document.createElement('canvas');
  c.width = sirka;
  c.height = vyska;
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
    if (rozsireni.aniso) gl.texParameterf(gl.TEXTURE_2D, rozsireni.aniso.TEXTURE_MAX_ANISOTROPY_EXT, 4);
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  return t;
}

// Šum pro „opotřebení“ povrchů
function sum(ctx, w, h, pocet, barvy, velikost = 2, x0 = 0, y0 = 0) {
  for (let i = 0; i < pocet; i++) {
    ctx.fillStyle = nahodne(barvy);
    ctx.fillRect(x0 + Math.random() * w, y0 + Math.random() * h, velikost, velikost);
  }
}

function kresliDrevo(ctx, x, y, w, h, svetla, tmava, pruhy = 14) {
  ctx.fillStyle = svetla;
  ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = tmava;
  for (let i = 0; i < pruhy; i++) {
    ctx.globalAlpha = 0.12 + Math.random() * 0.2;
    ctx.lineWidth = 0.8 + Math.random() * 2;
    const y0 = y + Math.random() * h;
    const faze = Math.random() * 6;
    ctx.beginPath();
    for (let px = 0; px <= w; px += 8) {
      const py = y0 + Math.sin(px / w * Math.PI * 2 * (1 + i % 2) + faze) * h * 0.012;
      if (px === 0) ctx.moveTo(x + px, py); else ctx.lineTo(x + px, py);
    }
    ctx.stroke();
  }
  // suky
  for (let i = 0; i < 2; i++) {
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = tmava;
    ctx.beginPath();
    ctx.ellipse(x + Math.random() * w, y + Math.random() * h, 3 + Math.random() * 4, 2 + Math.random() * 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function textNaStred(ctx, text, x, y, font, barva, maxSirka) {
  ctx.font = font;
  ctx.fillStyle = barva;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y, maxSirka);
}

function oblast(nazev, x, y, w, hgt) {
  ATLAS[nazev] = new Float32Array([x / ATLAS_VELIKOST, 1 - (y + hgt) / ATLAS_VELIKOST, w / ATLAS_VELIKOST, hgt / ATLAS_VELIKOST]);
}

const rgbText = (b) => `rgb(${b.map((c) => Math.round(c * 255)).join(',')})`;

function vytvorTextury() {
  // bílá – pro jednobarevné věci
  let c = noveplatno(4, 4);
  let x = c.getContext('2d');
  x.fillStyle = '#fff';
  x.fillRect(0, 0, 4, 4);
  textury.bila = nahraj(c, true);

  // dřevo nábytku
  c = noveplatno(256, 256);
  x = c.getContext('2d');
  kresliDrevo(x, 0, 0, 256, 256, '#a0683c', '#4a2810', 46);
  sum(x, 256, 256, 500, ['rgba(60,30,10,.2)', 'rgba(255,220,180,.1)']);
  textury.drevo = nahraj(c, true);

  // podlaha z lakovaných prken (512 px = 2 m)
  c = noveplatno(512, 512);
  x = c.getContext('2d');
  const tony = ['#8a5530', '#7b4a28', '#935b34', '#80502c', '#774626', '#8e5732', '#7f4e2b', '#966038'];
  for (let i = 0; i < 8; i++) {
    const posun = (i * 173) % 512;
    kresliDrevo(x, 0, i * 64, 512, 64, tony[i], '#3a1f0c', 8);
    x.fillStyle = 'rgba(255,235,200,.06)';
    x.fillRect(0, i * 64 + 4, 512, 10);
    x.fillStyle = '#2a1607';
    x.fillRect(0, i * 64, 512, 2);
    x.fillRect(posun, i * 64, 2, 64);
    x.fillStyle = 'rgba(20,10,4,.55)';
    [[posun + 8, 10], [posun + 8, 52], [posun - 8, 10], [posun - 8, 52]].forEach(([a, b]) => x.fillRect((a + 512) % 512, i * 64 + b, 3, 3));
  }
  sum(x, 512, 512, 900, ['rgba(30,15,5,.2)', 'rgba(255,230,190,.06)'], 3);
  textury.podlaha = nahraj(c, true);

  // omítka
  c = noveplatno(256, 256);
  x = c.getContext('2d');
  x.fillStyle = '#dcc49c';
  x.fillRect(0, 0, 256, 256);
  sum(x, 256, 256, 3200, ['rgba(120,90,50,.10)', 'rgba(255,250,235,.14)', 'rgba(90,60,30,.06)'], 3);
  textury.omitka = nahraj(c, true);

  // cihly za pultem (256 px = 1 m)
  c = noveplatno(256, 256);
  x = c.getContext('2d');
  x.fillStyle = '#6b5a48';
  x.fillRect(0, 0, 256, 256);
  const cihly = ['#9c4a2c', '#8a3f25', '#a85633', '#7d3820', '#94492e', '#b0603a'];
  for (let r = 0; r < 8; r++) {
    for (let s = -1; s < 5; s++) {
      x.fillStyle = nahodne(cihly);
      x.fillRect(s * 64 + (r % 2) * 32 + 2, r * 32 + 2, 60, 28);
      x.fillStyle = 'rgba(255,200,160,.08)';
      x.fillRect(s * 64 + (r % 2) * 32 + 2, r * 32 + 2, 60, 5);
    }
  }
  sum(x, 256, 256, 1500, ['rgba(0,0,0,.15)', 'rgba(255,200,160,.10)']);
  textury.cihly = nahraj(c, true);

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
  textury.dlazba = nahraj(c, true);

  // kostkovaný ubrus (64 px = 1 m → kostky po 6 cm)
  c = noveplatno(64, 64);
  x = c.getContext('2d');
  x.fillStyle = '#f4efe6';
  x.fillRect(0, 0, 64, 64);
  x.fillStyle = 'rgba(190,30,35,.55)';
  for (let i = 0; i < 16; i += 2) { x.fillRect(i * 4, 0, 4, 64); x.fillRect(0, i * 4, 64, 4); }
  x.fillStyle = 'rgba(160,20,25,.5)';
  for (let i = 0; i < 16; i += 2) for (let j = 0; j < 16; j += 2) x.fillRect(i * 4, j * 4, 4, 4);
  textury.ubrus = nahraj(c, true);

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
const tvSkore = [2, 1];
function aktualizujTV(dt) {
  const x = tvPlatno.getContext('2d');
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
  if (tvPuk.x < 4 || tvPuk.x > 252) {
    if (Math.abs(tvPuk.y - 80) < 18) tvSkore[tvPuk.x < 128 ? 1 : 0]++;
    tvPuk.vx *= -1;
  }
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
  textNaStred(x, `HOKEJ  ${tvSkore[0]} : ${tvSkore[1]}`, 128, 11, 'bold 14px Arial, sans-serif', '#fff');
  gl.bindTexture(gl.TEXTURE_2D, textury.tv);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, tvPlatno);
  aktualniTextura = textury.tv;
}
/* ---------- Atlas: cedule, obrázky, štítky (jedno velké plátno) ---------- */
function kresliMenu(x) {
  x.fillStyle = '#5a3519';
  x.fillRect(0, 0, 512, 320);
  x.fillStyle = '#1f2a22';
  x.fillRect(14, 14, 484, 292);
  sum(x, 484, 292, 700, ['rgba(255,255,255,.04)'], 2, 14, 14);
  textNaStred(x, 'NA ČEPU', 256, 48, 'bold 40px "Comic Sans MS", "Segoe Print", cursive', '#f5c542');
  const naCepu = PIVA.filter(jeNaCepu);
  const radek = Math.min(36, 240 / Math.max(1, naCepu.length));
  naCepu.forEach((p, i) => {
    const y = 96 + i * radek;
    x.font = `bold ${Math.round(radek * 0.72)}px "Comic Sans MS", "Segoe Print", cursive`;
    x.textBaseline = 'middle';
    x.fillStyle = rgbText(p.packa.map((c) => Math.min(1, c + 0.45)));
    x.textAlign = 'left';
    x.fillText('•', 36, y);
    x.fillStyle = '#f2ecd9';
    x.fillText(p.nazev, 56, y, 300);
    x.textAlign = 'right';
    x.fillText(p.cena + ' Kč', 474, y);
  });
}

function prekresliMenu() {
  if (!atlasPlatno) return;
  kresliMenu(atlasPlatno.getContext('2d'));
  nahraj(atlasPlatno, false, textury.atlas);
}

function vytvorAtlas() {
  const c = noveplatno(ATLAS_VELIKOST, ATLAS_VELIKOST);
  const x = c.getContext('2d');
  x.fillStyle = '#fff';
  x.fillRect(0, 0, ATLAS_VELIKOST, ATLAS_VELIKOST);

  kresliMenu(x);
  oblast('menu', 0, 0, 512, 320);

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

  // štítky kohoutů a sudů
  PIVA.forEach((p, i) => {
    const sx = 640 + (i % 3) * 128;
    let sy = 512 + Math.floor(i / 3) * 48;
    x.fillStyle = '#1c120b';
    x.fillRect(sx, sy, 128, 48);
    x.strokeStyle = rgbText(p.pruh.map((c) => Math.min(1, c + 0.25)));
    x.lineWidth = 6;
    x.strokeRect(sx + 3, sy + 3, 122, 42);
    textNaStred(x, p.kratce, sx + 64, sy + 25, 'bold 21px Arial, sans-serif', '#f5e6c0', 112);
    oblast('stitek_' + p.id, sx, sy, 128, 48);
    sy = 672 + Math.floor(i / 3) * 48;
    x.fillStyle = '#f4ead2';
    x.fillRect(sx, sy, 128, 48);
    x.fillStyle = rgbText(p.pruh);
    x.fillRect(sx, sy, 128, 10);
    textNaStred(x, p.nazev, sx + 64, sy + 30, 'bold 19px Arial, sans-serif', '#24150c', 118);
    oblast('sud_' + p.id, sx, sy, 128, 48);
  });

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
/* =========================================================
   15) SVĚT – hospoda, sklad, nábytek, světla, kolize, mapa chůze
   Souřadnice v metrech: x na východ, y nahoru, z na jih (ke dveřím)
   ========================================================= */
const SVET = {
  sirka: 14, hloubka: 10, vyska: 3.2,
  pult: { x0: 0, x1: 9.8, z0: 2.0, z1: 2.7, y: 1.1 },
  zadniPult: { x0: 0, x1: 9.8, z0: 0, z1: 0.6, y: 0.95 },
  prepazka: 11.0,                       // stěna mezi barem a skladem
  sklad: { x0: 11.15, x1: 14, z0: 0, z1: 2.6, dvereZ0: 0.75, dvereZ1: 1.75 },
  dvere: { x0: 11.8, x1: 13.0, vyska: 2.2 },
  venku: { x: 12.4, z: 12.6 },          // tady se hosté objevují a mizí
  drez: { x: 8.2, z: 0.32 },
  regal: { x0: 4.85, x1: 6.65, z: 0.3 },
  kniha: { x: 9.0, z: 2.35 },
  cedule: { x: 12.55, y: 1.45, z: 10.0 },
  kohoutZ: 2.17,
  vezZ: 2.34,
  stolicky: [1.3, 2.5, 5.05, 7.6, 8.5],
  stolickyZ: 3.15,
  stoly: [[2.6, 5.6], [6.2, 5.6], [9.6, 5.6], [2.6, 8.4], [6.2, 8.4], [9.4, 8.4]],
  sudX: (i) => 11.45 + i * 0.38,
  sudZ: 0.38,
  start: { x: 4.6, z: 1.15, yaw: Math.PI },
  pomocnikDoma: { x: 10.4, z: 1.2 }
};

let staticke = [];      // [{ sit, tex }]
let prekazky = [];      // kvádry pro hráče [x0, z0, x1, z1]
let sedadla = [];       // židle u stolů
let stolicky = [];      // barové stoličky
let svetla = [];

function pocetStolu() { return 3 + (HRA.vylepseni.stul || 0); }

/* ---------- Světla (8 lamp) ---------- */
function pripravSvetla() {
  const tepla = [1.0, 0.74, 0.44];
  svetla = [
    { poz: [3.0, 2.45, 2.3], barva: tepla, sila: 1.2 },
    { poz: [7.2, 2.45, 2.3], barva: tepla, sila: 1.2 },
    { poz: [12.6, 2.75, 1.25], barva: [1.0, 0.86, 0.62], sila: 1.0 },
    { poz: [2.6, 2.5, 5.6], barva: tepla, sila: 1.0 },
    { poz: [6.2, 2.5, 5.6], barva: tepla, sila: 1.0 },
    { poz: [9.6, 2.5, 5.6], barva: tepla, sila: 1.0 },
    { poz: [4.4, 2.5, 8.4], barva: tepla, sila: 1.0 },
    { poz: [10.8, 2.5, 8.4], barva: tepla, sila: 0.95 }
  ];
}

// Pseudonáhoda se semínkem – výzdoba vypadá pokaždé stejně
let stavSeminka = 1;
function seminko() {
  stavSeminka = (stavSeminka * 16807) % 2147483647;
  return (stavSeminka - 1) / 2147483646;
}

const BARVY_SVETA = {
  drevo: [0.85, 0.7, 0.58], tmave: [0.55, 0.42, 0.34], obklad: [0.78, 0.6, 0.48],
  chrom: [0.82, 0.84, 0.87], kov: [0.55, 0.58, 0.6], bila: [1, 1, 1]
};

/* ---------- Stavba celé hospody (při startu a po vylepšení) ---------- */
function postavSvet() {
  stavSeminka = 20261024;
  staticke.forEach((s) => smazSit(s.sit));
  prekazky = [];
  sedadla = [];
  stolicky = [];
  const d = { drevo: new Davka(), podlaha: new Davka(), omitka: new Davka(), cihly: new Davka(), atlas: new Davka(), bila: new Davka(), ubrus: new Davka(), dlazba: new Davka(), chrom: new Davka() };
  postavMistnost(d);
  postavBar(d);
  postavSklad(d);
  for (let i = 0; i < pocetStolu(); i++) postavStul(d, SVET.stoly[i][0], SVET.stoly[i][1], i);
  SVET.stolicky.forEach((x, i) => postavStolicku(d, x, SVET.stolickyZ, i));
  postavVyzdobu(d);
  staticke = Object.entries(d).filter(([, b]) => b.n > 0).map(([tex, b]) => ({ sit: vytvorSit(b), tex }));
  postavMrizku();
}

function postavMistnost(d) {
  const W = SVET.sirka, D = SVET.hloubka, V = SVET.vyska;
  const B = BARVY_SVETA;
  // podlaha (ve skladu dlažba), strop, trámy
  kvadr(d.podlaha, 0, -0.1, 0, W, 0, D, [0.95, 0.9, 0.85], { uv: 0.5, bez: ['dole'] });
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
  obklad(W - 0.04, SVET.sklad.z1 + 0.15, W, D);
  obklad(0, D - 0.04, SVET.dvere.x0, D);
  obklad(SVET.dvere.x1, D - 0.04, W, D);
  // cihlová stěna za barem
  kvadr(d.cihly, 0, 0.95, 0, SVET.prepazka, V, 0.03, [1, 1, 1], { uv: 1, bez: ['sever'] });

  // přepážka se vchodem do skladu a jižní stěna skladu
  const s = SVET.sklad;
  const P = SVET.prepazka;
  stena(P, 0, P + 0.15, s.dvereZ0);
  stena(P, s.dvereZ1, P + 0.15, SVET.pult.z1 + 0.05);
  kvadr(d.omitka, P, 2.1, s.dvereZ0, P + 0.15, V, s.dvereZ1, [1, 1, 1], { uv: 0.5 });
  stena(P + 0.15, s.z1, W, s.z1 + 0.15);
  [[s.dvereZ0 - 0.05, s.dvereZ0], [s.dvereZ1, s.dvereZ1 + 0.05]].forEach(([a, b]) => kvadr(d.drevo, P - 0.02, 0, a, P + 0.17, 2.15, b, B.tmave));
  kvadr(d.drevo, P - 0.02, 2.1, s.dvereZ0 - 0.05, P + 0.17, 2.16, s.dvereZ1 + 0.05, B.tmave);
  obdelnik(d.atlas, [[P - 0.005, 2.18, s.dvereZ1 - 0.05], [P - 0.005, 2.18, s.dvereZ0 + 0.05], [P - 0.005, 2.42, s.dvereZ0 + 0.05], [P - 0.005, 2.42, s.dvereZ1 - 0.05]], ATLAS.sklad, [1, 1, 1], 0.35);
  // dlažba ve skladu
  kvadr(d.dlazba, s.x0, 0.002, s.z0, s.x1, 0.004, s.z1, [1, 1, 1], { uv: 2, bez: ['dole'] });
  // dveře na WC ve východní stěně sálu
  kvadr(d.drevo, W - 0.06, 0, 3.3, W, 2.05, 4.3, [0.7, 0.5, 0.36]);
  kvadr(d.bila, W - 0.09, 1.0, 4.12, W - 0.06, 1.04, 4.22, [0.85, 0.68, 0.25]);
  obdelnik(d.atlas, [[W - 0.065, 1.6, 3.6], [W - 0.065, 1.6, 4.0], [W - 0.065, 1.9, 4.0], [W - 0.065, 1.9, 3.6]], ATLAS.wc, [1, 1, 1], 0.2);
}

function postavBar(d) {
  const B = BARVY_SVETA;
  const p = SVET.pult;
  // výčepní pult: panely, deska, mosazná tyč
  kvadr(d.drevo, p.x0, 0, p.z0 + 0.08, p.x1, p.y - 0.06, p.z1 - 0.06, B.drevo, { uv: 1 });
  for (let x = p.x0 + 0.6; x < p.x1; x += 1.2) kvadr(d.drevo, x - 0.02, 0.08, p.z1 - 0.06, x + 0.02, p.y - 0.1, p.z1 - 0.04, B.tmave);
  kvadr(d.drevo, p.x0, 0, p.z1 - 0.06, p.x1, 0.08, p.z1 - 0.04, B.tmave);
  kvadr(d.drevo, p.x0, p.y - 0.06, p.z0, p.x1 + 0.05, p.y, p.z1 + 0.04, B.tmave, { uv: 1 });
  valecVodorovne(d.chrom, p.x0, p.x1, 0.2, p.z1 + 0.14, 0.022, [1.0, 0.78, 0.36], 0.2);
  prekazky.push([p.x0, p.z0, p.x1 + 0.05, p.z1 + 0.04]);
  // dvě výčepní místa: nerezová vana s mřížkou
  [[3.42, 4.38], [5.7, 6.9]].forEach(([x0, x1]) => {
    kvadr(d.chrom, x0, p.y, 2.04, x1, p.y + 0.02, 2.4, B.kov, { e: 0.12, uvCele: true, deleni: 0 });
    for (let x = x0 + 0.03; x < x1 - 0.02; x += 0.045) kvadr(d.bila, x, p.y + 0.02, 2.07, x + 0.022, p.y + 0.024, 2.37, [0.36, 0.38, 0.41], { deleni: 0 });
  });
  // každé pivo má vlastní chromovaný kohout s „husím krkem“
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
  // kniha vylepšení na stojánku, pokladna
  const k = SVET.kniha;
  kvadr(d.drevo, k.x - 0.28, p.y, k.z - 0.2, k.x + 0.28, p.y + 0.05, k.z + 0.2, B.tmave);
  obdelnik(d.atlas, [[k.x + 0.24, p.y + 0.06, k.z - 0.16], [k.x - 0.24, p.y + 0.06, k.z - 0.16],
    [k.x - 0.24, p.y + 0.13, k.z + 0.15], [k.x + 0.24, p.y + 0.13, k.z + 0.15]], ATLAS.kniha, [1, 1, 1], 0.3);
  kvadr(d.bila, 9.35, p.y, 2.15, 9.75, p.y + 0.2, 2.55, [0.22, 0.22, 0.24]);
  kvadr(d.bila, 9.4, p.y + 0.2, 2.2, 9.7, p.y + 0.3, 2.3, [0.15, 0.4, 0.2], { e: 0.6 });
  // zadní pult s dřezem a regálem
  const z = SVET.zadniPult;
  kvadr(d.drevo, z.x0, 0, z.z0, z.x1, z.y - 0.05, z.z1 - 0.04, B.drevo);
  kvadr(d.drevo, z.x0, z.y - 0.05, z.z0, z.x1, z.y, z.z1, B.tmave);
  prekazky.push([z.x0, z.z0, z.x1, z.z1]);
  const dr = SVET.drez;
  kvadr(d.chrom, dr.x - 0.42, z.y, dr.z - 0.22, dr.x + 0.42, z.y + 0.03, dr.z + 0.24, [0.85, 0.88, 0.92], { e: 0.15, uvCele: true, deleni: 0 });
  kvadr(d.bila, dr.x - 0.35, z.y + 0.03, dr.z - 0.16, dr.x + 0.35, z.y + 0.035, dr.z + 0.18, [0.3, 0.34, 0.38]);
  valec(d.chrom, dr.x, z.y, dr.z - 0.2, 0.022, 0.3, 12, B.chrom, { e: 0.25 });
  const kohoutek = [];
  for (let i = 0; i <= 8; i++) {
    const u = (i / 8) * Math.PI;
    kohoutek.push([dr.x, z.y + 0.3 + Math.sin(u) * 0.08, dr.z - 0.12 + Math.cos(u) * -0.08]);
  }
  trubka(d.chrom, kohoutek, 0.014, 10, B.chrom, { e: 0.25 });
  // pákové kohoutky
  [-0.07, 0.07].forEach((dx) => valec(d.chrom, dr.x + dx, z.y, dr.z - 0.2, 0.014, 0.08, 8, B.chrom, { e: 0.25 }));
  obdelnik(d.atlas, [[dr.x - 0.4, 1.08, 0.035], [dr.x + 0.4, 1.08, 0.035], [dr.x + 0.4, 1.32, 0.035], [dr.x - 0.4, 1.32, 0.035]], ATLAS['cedulka-drez'], [1, 1, 1], 0.4);
  kvadr(d.drevo, SVET.regal.x0, z.y, 0.06, SVET.regal.x1, z.y + 0.03, 0.54, [0.6, 0.45, 0.35]);
  // police s lahvemi a trofejemi
  const lahve = [[0.18, 0.4, 0.16], [0.42, 0.25, 0.1], [0.75, 0.6, 0.2], [0.2, 0.3, 0.12], [0.55, 0.12, 0.1], [0.85, 0.85, 0.8]];
  [[0.25, 4.6], [6.9, 10.8]].forEach(([a, b]) => {
    [1.45, 1.95, 2.45].forEach((y) => {
      kvadr(d.drevo, a, y - 0.04, 0.03, b, y, 0.34, B.tmave);
      for (let lx = a + 0.12; lx < b - 0.08; lx += 0.17 + seminko() * 0.06) {
        if (y === 2.45 && lx > 9.0 && lx < 9.9) continue;
        const v = 0.22 + seminko() * 0.12;
        valec(d.bila, lx, y, 0.18, 0.04, v, 8, lahve[Math.floor(seminko() * lahve.length)]);
        valec(d.bila, lx, y + v, 0.18, 0.015, 0.07, 6, [0.85, 0.75, 0.3]);
      }
    });
  });
  [9.2, 9.65].forEach((x, i) => {
    valec(d.bila, x, 2.45, 0.18, 0.06 - i * 0.01, 0.04, 10, [0.85, 0.7, 0.25]);
    soustruh(d.bila, [[0.015, 0], [0.015, 0.08], [0.06, 0.12], [0.07, 0.2], [0.065, 0.22]], 12, [0.92, 0.75, 0.3], { posun: [x, 2.49, 0.18] });
  });
  obdelnik(d.atlas, [[4.7, 1.42, 0.04], [6.8, 1.42, 0.04], [6.8, 2.68, 0.04], [4.7, 2.68, 0.04]], ATLAS.menu, [1, 1, 1], 0.25);
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
function postavSklad(d) {
  const s = SVET.sklad;
  const B = BARVY_SVETA;
  // podstavec pod sudy, hadice ke kohoutům, cedulky
  kvadr(d.drevo, s.x0 + 0.05, 0, 0.1, s.x1 - 0.05, 0.12, 0.66, [0.6, 0.45, 0.35]);
  prekazky.push([s.x0, 0, s.x1, 0.7]);
  PIVA.forEach((pivo, i) => {
    if (!jeNaCepu(pivo)) return;
    const x = SVET.sudX(i);
    obdelnik(d.atlas, [[x - 0.17, 1.0, 0.012], [x + 0.17, 1.0, 0.012], [x + 0.17, 1.13, 0.012], [x - 0.17, 1.13, 0.012]], ATLAS['sud_' + pivo.id], [1, 1, 1], 0.35);
    trubka(d.bila, [[x, 0.76, SVET.sudZ], [x, 0.95, SVET.sudZ - 0.05], [x, 1.4, 0.08], [x, 2.6, 0.06], [x - 0.05, 3.0, 0.06]], 0.013, 6, [0.55, 0.1, 0.08]);
  });
  // paleta na plné sudy
  kvadr(d.drevo, 12.25, 0, 1.85, s.x1 - 0.05, 0.13, s.z1 - 0.05, [0.78, 0.66, 0.48]);
  for (let x = 12.3; x < s.x1 - 0.1; x += 0.28) kvadr(d.drevo, x, 0.13, 1.88, x + 0.18, 0.14, s.z1 - 0.08, [0.82, 0.7, 0.52]);
  prekazky.push([12.2, 1.8, s.x1, s.z1]);
  // roh na prázdné sudy (žlutá čára na podlaze)
  kvadr(d.bila, s.x0 + 0.05, 0.005, 1.95, 12.2, 0.008, 1.98, [0.95, 0.8, 0.1]);
  kvadr(d.bila, 12.17, 0.005, 1.95, 12.2, 0.008, s.z1 - 0.05, [0.95, 0.8, 0.1]);
  prekazky.push([s.x0, 1.95, 12.2, s.z1]);
  // regál s kartony
  kvadr(d.drevo, 13.6, 0, 0.8, s.x1, 1.85, 1.75, [0.5, 0.38, 0.3], { bez: ['vychod'] });
  [0.45, 1.0, 1.55].forEach((y) => {
    for (let z = 0.85; z < 1.65; z += 0.3) kvadr(d.bila, 13.65, y, z, 13.95, y + 0.24 + seminko() * 0.1, z + 0.26, [0.72 + seminko() * 0.1, 0.55, 0.35]);
  });
  prekazky.push([13.55, 0.75, s.x1, 1.8]);
  // žárovka v kleci
  kvadr(d.bila, 12.5, 2.95, 1.15, 12.7, 3.2, 1.35, [0.3, 0.3, 0.3]);
  valec(d.bila, 12.6, 2.8, 1.25, 0.06, 0.12, 8, [1, 0.92, 0.7], { e: 1 });
  void B;
}

function postavStul(d, tx, tz, index) {
  const B = BARVY_SVETA;
  kvadr(d.drevo, tx - 0.65, 0.71, tz - 0.4, tx + 0.65, 0.75, tz + 0.4, B.drevo);
  kvadr(d.ubrus, tx - 0.69, 0.62, tz - 0.44, tx + 0.69, 0.756, tz + 0.44, [1, 1, 1], { uv: 1, bez: ['dole'] });
  [[-0.55, -0.32], [0.55, -0.32], [-0.55, 0.32], [0.55, 0.32]].forEach(([a, b]) => {
    kvadr(d.drevo, tx + a - 0.035, 0, tz + b - 0.035, tx + a + 0.035, 0.71, tz + b + 0.035, [0.6, 0.45, 0.35]);
  });
  prekazky.push([tx - 0.69, tz - 0.44, tx + 0.69, tz + 0.44]);
  [-1, 1].forEach((strana) => {
    [-0.35, 0.35].forEach((dx) => {
      const cx = tx + dx, cz = tz + strana * 0.78;
      postavZidli(d, cx, cz, strana);
      const sklo = { x: cx, y: 0.757, z: tz + strana * 0.22 };
      obdelnik(d.atlas, [[cx - 0.06, 0.758, sklo.z + 0.06], [cx + 0.06, 0.758, sklo.z + 0.06], [cx + 0.06, 0.758, sklo.z - 0.06], [cx - 0.06, 0.758, sklo.z - 0.06]], ATLAS.tacek, [1, 1, 1]);
      sedadla.push({ x: cx, z: cz, natoceni: strana < 0 ? 0 : Math.PI, stul: index, typ: 'zidle', sklenice: sklo, host: null });
    });
  });
}

function postavZidli(d, cx, cz, strana) {
  const sedak = [0.72, 0.53, 0.4], noha = [0.55, 0.4, 0.3];
  kvadr(d.drevo, cx - 0.2, 0.42, cz - 0.2, cx + 0.2, 0.47, cz + 0.2, sedak);
  [[-0.16, -0.16], [0.16, -0.16], [-0.16, 0.16], [0.16, 0.16]].forEach(([a, b]) => {
    kvadr(d.drevo, cx + a - 0.02, 0, cz + b - 0.02, cx + a + 0.02, 0.42, cz + b + 0.02, noha);
  });
  const oz = cz + strana * 0.18;
  [-0.17, 0.17].forEach((a) => kvadr(d.drevo, cx + a - 0.02, 0.47, oz - 0.02, cx + a + 0.02, 0.98, oz + 0.02, noha));
  kvadr(d.drevo, cx - 0.2, 0.9, oz - 0.025, cx + 0.2, 0.98, oz + 0.025, sedak);
  kvadr(d.drevo, cx - 0.17, 0.68, oz - 0.015, cx + 0.17, 0.74, oz + 0.015, sedak);
  prekazky.push([cx - 0.2, cz - 0.2, cx + 0.2, cz + 0.2]);
}

function postavStolicku(d, x, z) {
  valec(d.bila, x, 0, z, 0.2, 0.025, 14, [0.18, 0.18, 0.2]);
  valec(d.bila, x, 0.025, z, 0.03, 0.68, 8, BARVY_SVETA.chrom);
  valec(d.bila, x, 0.3, z, 0.15, 0.02, 14, BARVY_SVETA.chrom);
  valec(d.drevo, x, 0.7, z, 0.19, 0.06, 14, BARVY_SVETA.tmave);
  valec(d.bila, x, 0.76, z, 0.18, 0.025, 14, [0.55, 0.12, 0.1]);
  prekazky.push([x - 0.2, z - 0.2, x + 0.2, z + 0.2]);
  stolicky.push({ x, z, natoceni: Math.PI, typ: 'stolicka', sklenice: { x, y: SVET.pult.y, z: 2.55 }, host: null });
}

function postavVyzdobu(d) {
  const W = SVET.sirka, D = SVET.hloubka, V = SVET.vyska;
  const B = BARVY_SVETA;
  // okna se záclonami a radiátory
  [[1.8, 3.4], [5.4, 7.0], [8.6, 10.2]].forEach(([x0, x1]) => {
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
  });
  // obrazy, plakáty, terč, hodiny
  obdelnik(d.atlas, [[0.05, 1.4, 5.6], [0.05, 1.4, 4.2], [0.05, 2.45, 4.2], [0.05, 2.45, 5.6]], ATLAS.obraz, [1, 1, 1], 0.15);
  obdelnik(d.atlas, [[0.05, 1.2, 9.3], [0.05, 1.2, 8.4], [0.05, 2.4, 8.4], [0.05, 2.4, 9.3]], ATLAS.plakat, [1, 1, 1], 0.15);
  obdelnik(d.atlas, [[0.05, 1.35, 3.95], [0.05, 1.35, 3.15], [0.05, 2.35, 3.15], [0.05, 2.35, 3.95]], ATLAS.plakat2, [1, 1, 1], 0.15);
  obdelnik(d.atlas, [[W - 0.05, 1.45, 7.6], [W - 0.05, 1.45, 8.2], [W - 0.05, 2.05, 8.2], [W - 0.05, 2.05, 7.6]], ATLAS.terc, [1, 1, 1], 0.1);
  obdelnik(d.atlas, [[W - 0.05, 2.2, 9.0], [W - 0.05, 2.2, 9.5], [W - 0.05, 2.7, 9.5], [W - 0.05, 2.7, 9.0]], ATLAS.hodiny, [1, 1, 1], 0.2);
  // nástěnná světla
  const svitidlo = (x, z, nx, nz) => {
    kvadr(d.drevo, x - 0.08 - Math.abs(nz) * 0.0, 1.75, z - 0.08, x + 0.08, 1.95, z + 0.08, B.tmave);
    kvadr(d.bila, x + nx * 0.08 - 0.06, 1.95, z + nz * 0.08 - 0.06, x + nx * 0.08 + 0.06, 2.1, z + nz * 0.08 + 0.06, [1, 0.85, 0.6], { e: 0.9 });
  };
  svitidlo(4.5, D - 0.08, 0, -1);
  svitidlo(7.8, D - 0.08, 0, -1);
  svitidlo(0.08, 7.95, 1, 0);
  svitidlo(W - 0.08, 7.0, -1, 0);
  // věšák s kabáty u dveří
  valec(d.bila, 13.55, 0, 9.45, 0.18, 0.03, 12, [0.2, 0.15, 0.12]);
  valec(d.drevo, 13.55, 0, 9.45, 0.025, 1.85, 8, B.tmave);
  kvadr(d.bila, 13.45, 1.0, 9.55, 13.7, 1.62, 9.65, [0.35, 0.3, 0.45]);
  kvadr(d.bila, 13.4, 1.05, 9.3, 13.62, 1.6, 9.4, [0.55, 0.35, 0.2]);
  prekazky.push([13.3, 9.2, 13.8, 9.7]);
  // květiny
  [[11.4, 9.55], [0.45, 3.0]].forEach(([x, z]) => {
    soustruh(d.bila, [[0.13, 0], [0.18, 0.3], [0.19, 0.32]], 12, [0.7, 0.36, 0.2], { posun: [x, 0, z], vicko: true });
    for (let i = 0; i < 7; i++) {
      const a = i * 0.9, r = 0.05 + (i % 3) * 0.05;
      kvadr(d.bila, x + Math.sin(a) * r - 0.06, 0.3 + i * 0.07, z + Math.cos(a) * r - 0.06, x + Math.sin(a) * r + 0.06, 0.42 + i * 0.07, z + Math.cos(a) * r + 0.06, [0.18 + i * 0.02, 0.45 + i * 0.03, 0.18]);
    }
    prekazky.push([x - 0.24, z - 0.24, x + 0.24, z + 0.24]);
  });
  // sudy v rohu
  valec(d.drevo, 0.55, 0, 9.35, 0.34, 0.85, 14, [0.75, 0.55, 0.4]);
  valec(d.drevo, 1.3, 0, 9.4, 0.34, 0.85, 14, [0.72, 0.52, 0.38]);
  valec(d.drevo, 0.9, 0.85, 9.38, 0.34, 0.85, 14, [0.78, 0.58, 0.42]);
  prekazky.push([0.15, 8.95, 1.7, 9.8]);
  // jukebox a televize (vylepšení)
  if (HRA.vylepseni.jukebox) {
    kvadr(d.drevo, 0, 0, 6.6, 0.55, 1.45, 7.4, [0.55, 0.3, 0.2]);
    obdelnik(d.atlas, [[0.56, 0.2, 7.3], [0.56, 0.2, 6.7], [0.56, 1.35, 6.7], [0.56, 1.35, 7.3]], ATLAS.jukebox, [1, 1, 1], 0.85);
    prekazky.push([0, 6.6, 0.6, 7.4]);
  }
  if (HRA.vylepseni.televize) kvadr(d.bila, W - 0.1, 1.75, 5.25, W, 2.55, 6.75, [0.08, 0.08, 0.09]);
  // lampy
  svetla.forEach((sv, i) => {
    if (i === 2) return;
    const [lx, ly, lz] = sv.poz;
    kvadr(d.bila, lx - 0.01, ly + 0.1, lz - 0.01, lx + 0.01, V, lz + 0.01, [0.1, 0.1, 0.1]);
    soustruh(d.bila, [[0.24, 0], [0.2, 0.08], [0.12, 0.16], [0.03, 0.2]], 16, [0.22, 0.35, 0.26], { posun: [lx, ly, lz] });
    valec(d.bila, lx, ly - 0.02, lz, 0.07, 0.06, 10, [1, 0.92, 0.7], { e: 1 });
  });
  // ulice za dveřmi
  kvadr(d.bila, 10.4, -0.1, D + 0.15, 14.6, 0, 13.6, [0.16, 0.16, 0.18]);
  obdelnik(d.atlas, [[14.5, 0, 13.5], [10.5, 0, 13.5], [10.5, 3.2, 13.5], [14.5, 3.2, 13.5]], ATLAS.ulice, [0.8, 0.8, 0.9], 0.8);
  kvadr(d.bila, 10.3, 0, D + 0.15, 10.4, 3.2, 13.6, [0.12, 0.1, 0.12]);
  kvadr(d.bila, 14.6, 0, D + 0.15, 14.7, 3.2, 13.6, [0.12, 0.1, 0.12]);
  kvadr(d.drevo, SVET.dvere.x0 - 0.08, 0, D - 0.04, SVET.dvere.x0, SVET.dvere.vyska + 0.08, D + 0.19, B.tmave);
  kvadr(d.drevo, SVET.dvere.x1, 0, D - 0.04, SVET.dvere.x1 + 0.08, SVET.dvere.vyska + 0.08, D + 0.19, B.tmave);
  kvadr(d.drevo, SVET.dvere.x0, SVET.dvere.vyska, D - 0.04, SVET.dvere.x1, SVET.dvere.vyska + 0.08, D + 0.19, B.tmave);
  kvadr(d.bila, SVET.dvere.x0, 0.001, D - 0.9, SVET.dvere.x1, 0.012, D - 0.1, [0.35, 0.22, 0.14]); // rohožka
}

/* ---------- Mapa pro chůzi hostů (mřížka 0,2 m) ---------- */
const MRIZKA = { bunka: 0.2, sirka: 72, hloubka: 68, data: null };
function postavMrizku() {
  const M = MRIZKA;
  M.data = new Uint8Array(M.sirka * M.hloubka);
  const okraj = 0.25; // poloměr hosta
  const zablokuj = (x0, z0, x1, z1) => {
    const a = Math.max(0, Math.floor((x0 - okraj) / M.bunka));
    const b = Math.min(M.sirka - 1, Math.floor((x1 + okraj) / M.bunka));
    const c = Math.max(0, Math.floor((z0 - okraj) / M.bunka));
    const e = Math.min(M.hloubka - 1, Math.floor((z1 + okraj) / M.bunka));
    for (let iz = c; iz <= e; iz++) for (let ix = a; ix <= b; ix++) M.data[iz * M.sirka + ix] = 1;
  };
  zablokuj(-1, -1, 0, 14);
  zablokuj(14, -1, 15, 14);
  zablokuj(-1, -1, 15, 0);
  zablokuj(-1, SVET.hloubka, 10.5, 14);
  zablokuj(14.3, SVET.hloubka, 15, 14);
  zablokuj(-1, 13.3, 15, 14);
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
   7–8 levá noha, 9–10 pravá noha, 11 úsměv, 12 mračení, 13 pusa
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
  cepice: ['#b3261e', '#1f4f8a', '#2e6b3a', '#d9a21b', '#222222', '#e07b39']
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
    ksiltDozadu: sance(0.3)
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
  const box = (kost, cx, cy, cz, sx, sy, sz, barva) => { d.kost = kost; kostka(d, cx, cy, cz, sx, sy, sz, barva); };
  const tmava = [0.08, 0.06, 0.05], bila = [0.95, 0.95, 0.95];

  /* ----- nohy ----- */
  const kratke = v.spodek === 'kratasy', sukne = v.spodek === 'sukne';
  const nohavice = sukne ? (sance(0.5) ? kuze : tmavsi(b.spodek, 0.6)) : b.spodek;
  [[-1, 7, 8], [1, 9, 10]].forEach(([s, stehno, lytko]) => {
    const x = s * 0.1;
    box(stehno, x, 0.65, 0, 0.15, 0.42, 0.17, nohavice);
    box(lytko, x, 0.25, 0, 0.14, 0.38, 0.16, kratke ? kuze : nohavice);
    if (kratke) box(lytko, x, 0.4, 0, 0.145, 0.08, 0.165, b.spodek);
    box(lytko, x, 0.035, 0.035, 0.15, 0.07, 0.27, b.boty);
    if (v.spodek === 'dziny') box(stehno, x + s * 0.0, 0.8, 0.087, 0.06, 0.06, 0.005, tmavsi(b.spodek, 0.85));
  });

  /* ----- boky a sukně ----- */
  box(0, 0, 0.88, 0, 0.36 * sw, 0.16, 0.22, sukne ? b.spodek : b.spodek);
  box(0, 0, 0.955, 0, 0.37 * sw, 0.03, 0.225, sukne ? b.spodek : [0.15, 0.1, 0.07]);
  if (sukne) {
    box(0, 0, 0.75, 0, 0.42 * sw, 0.14, 0.27, b.spodek);
    box(0, 0, 0.62, 0, 0.46 * sw, 0.14, 0.3, b.spodek);
  }

  /* ----- trup podle oblečení ----- */
  const t = v.trup;
  const dlouheRukavy = !['tricko', 'havajska', 'dres', 'halenka', 'saty'].includes(t) || (t === 'halenka' && sance(0.4));
  const hlavniBarva = (t === 'saco' || t === 'kozenka' || t === 'vesta' || t === 'kardigan') ? b.kosile : b.trup;
  box(1, 0, 1.2, 0, 0.42 * sw, 0.5, 0.24, hlavniBarva);
  if (v.bricho) box(1, 0, 1.07, 0.1 + 0.04 * v.bricho, 0.36 * sw, 0.24, 0.1 + 0.08 * v.bricho, hlavniBarva);
  const predek = 0.121 + (v.bricho ? 0.0 : 0);
  if (t === 'kosile' || t === 'vesta') {
    box(1, -0.045, 1.43, predek, 0.07, 0.05, 0.01, svetlejsi(hlavniBarva, 0.5));
    box(1, 0.045, 1.43, predek, 0.07, 0.05, 0.01, svetlejsi(hlavniBarva, 0.5));
    box(1, 0, 1.18, predek, 0.015, 0.42, 0.01, tmavsi(hlavniBarva, 0.85));
  }
  if (t === 'vesta' || t === 'saco' || t === 'kozenka' || t === 'kardigan') {
    const kabat = b.trup;
    [-1, 1].forEach((s) => {
      box(1, s * 0.15 * sw, 1.18, 0.123, 0.12 * sw, 0.5, 0.012, kabat);
      box(1, s * 0.205 * sw, 1.2, 0, 0.022, 0.5, 0.25, kabat);
    });
    box(1, 0, 1.2, -0.123, 0.42 * sw, 0.5, 0.012, kabat);
    if (t === 'saco') [-1, 1].forEach((s) => box(1, s * 0.07, 1.36, 0.128, 0.05, 0.14, 0.008, tmavsi(kabat, 0.8)));
    if (t === 'kardigan') [1.1, 1.2, 1.3].forEach((y) => box(1, 0.05, y, 0.131, 0.02, 0.02, 0.008, [0.85, 0.75, 0.4]));
  }
  if (v.kravata) {
    box(1, 0, 1.31, 0.129, 0.045, 0.24, 0.01, b.doplnek);
    box(1, 0, 1.425, 0.129, 0.05, 0.035, 0.012, tmavsi(b.doplnek, 0.8));
  }
  if (t === 'mikina') {
    box(1, 0, 1.43, -0.13, 0.3 * sw, 0.14, 0.06, tmavsi(b.trup, 0.9));
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
      box(1, nahodneCislo(-0.17, 0.17) * sw, nahodneCislo(1.0, 1.42), 0.122, 0.05, 0.05, 0.008, barva);
      box(1, nahodneCislo(-0.17, 0.17) * sw, nahodneCislo(1.0, 1.42), -0.122, 0.05, 0.05, 0.008, barva);
    }
  }
  if (t === 'flanel') {
    const pruh = tmavsi(b.trup, 0.6);
    [1.03, 1.18, 1.33].forEach((y) => box(1, 0, y, 0, 0.425 * sw, 0.03, 0.245, pruh));
    [-0.12, 0, 0.12].forEach((x) => { box(1, x * sw, 1.2, 0.122, 0.025, 0.5, 0.006, pruh); box(1, x * sw, 1.2, -0.122, 0.025, 0.5, 0.006, pruh); });
  }
  if (t === 'svetr') {
    box(1, 0, 1.27, 0, 0.425 * sw, 0.06, 0.245, svetlejsi(b.trup, 0.4));
    box(1, 0, 1.44, 0, 0.16, 0.05, 0.16, b.trup);
  }
  if (t === 'halenka' || t === 'saty') box(1, 0, 1.41, 0.121, 0.1, 0.07, 0.008, kuze);
  if (t === 'myslivecka') {
    [-1, 1].forEach((s) => box(1, s * 0.1 * sw, 1.08, 0.124, 0.1, 0.09, 0.012, tmavsi(b.trup, 0.75)));
    box(1, 0, 1.43, 0.11, 0.2, 0.05, 0.04, tmavsi(b.trup, 0.7));
  }
  box(1, 0, 1.475, 0, 0.12, 0.08, 0.12, kuze); // krk

  /* ----- ruce ----- */
  const rukav = (t === 'vesta') ? b.kosile : b.trup;
  [[-1, 3, 4], [1, 5, 6]].forEach(([s, rameno, predlokti]) => {
    const x = s * R;
    box(rameno, x, 1.255, 0, 0.11, 0.3, 0.12, dlouheRukavy ? rukav : kuze);
    if (!dlouheRukavy) box(rameno, x, 1.34, 0, 0.115, 0.13, 0.125, rukav);
    box(predlokti, x, 0.98, 0, 0.1, 0.26, 0.11, dlouheRukavy ? rukav : kuze);
    if (dlouheRukavy) box(predlokti, x, 0.87, 0, 0.104, 0.025, 0.114, tmavsi(rukav, 0.85));
    box(predlokti, x, 0.81, 0.01, 0.09, 0.1, 0.1, kuze);
  });
  if (v.kabelka) box(4, -R - 0.06, 0.98, 0, 0.04, 0.15, 0.2, b.doplnek);

  /* ----- doplňky na trupu ----- */
  if (v.batoh) {
    box(1, 0, 1.2, -0.18, 0.3 * sw, 0.38, 0.12, b.doplnek);
    [-1, 1].forEach((s) => box(1, s * 0.12 * sw, 1.25, 0.123, 0.035, 0.32, 0.01, tmavsi(b.doplnek, 0.7)));
  }
  if (v.fotak) {
    box(1, 0.06, 1.17, 0.14, 0.12, 0.08, 0.05, [0.1, 0.1, 0.1]);
    box(1, 0.06, 1.17, 0.17, 0.05, 0.05, 0.03, [0.2, 0.2, 0.22]);
    box(1, -0.06, 1.33, 0.124, 0.02, 0.28, 0.008, [0.1, 0.1, 0.1]);
  }
  if (v.sala) {
    box(1, 0, 1.465, 0, 0.2, 0.06, 0.2, b.doplnek);
    box(1, 0.06, 1.32, 0.128, 0.07, 0.24, 0.02, b.doplnek);
    box(1, 0.06, 1.25, 0.13, 0.072, 0.03, 0.022, bila);
  }

  /* ----- hlava ----- */
  box(2, 0, 1.6, 0, 0.25, 0.27, 0.25, kuze);
  [-1, 1].forEach((s) => box(2, s * 0.13, 1.6, -0.01, 0.025, 0.07, 0.05, kuzeT));
  box(2, 0, 1.585, 0.14, 0.04, 0.06, 0.04, kuzeT);
  [-1, 1].forEach((s) => {
    box(2, s * 0.055, 1.625, 0.127, 0.055, 0.045, 0.01, bila);
    box(2, s * 0.055, 1.62, 0.133, 0.028, 0.035, 0.008, tmava);
    box(2, s * 0.055, 1.668, 0.128, 0.07, 0.016, 0.012, vlasyT);
  });
  const zUst = v.vousy === 'plnovous' ? 0.137 : 0.129;
  box(13, 0, 1.53, zUst, 0.07, 0.016, 0.01, [0.45, 0.14, 0.1]);
  box(11, 0, 1.528, zUst, 0.1, 0.018, 0.01, [0.45, 0.14, 0.1]);
  [-1, 1].forEach((s) => box(11, s * 0.05, 1.538, zUst, 0.02, 0.022, 0.01, [0.45, 0.14, 0.1]));
  box(12, 0, 1.53, zUst, 0.07, 0.016, 0.01, [0.45, 0.14, 0.1]);
  [-1, 1].forEach((s) => box(12, s * 0.04, 1.52, zUst, 0.02, 0.02, 0.01, [0.45, 0.14, 0.1]));

  // vousy
  if (v.vousy === 'plnovous') {
    box(2, 0, 1.505, 0.075, 0.255, 0.13, 0.11, vlasy);
    [-1, 1].forEach((s) => box(2, s * 0.125, 1.58, 0.03, 0.02, 0.12, 0.13, vlasy));
  } else if (v.vousy === 'knir') {
    box(2, 0, 1.553, 0.132, 0.11, 0.024, 0.022, vlasy);
  } else if (v.vousy === 'kozi') {
    box(2, 0, 1.49, 0.115, 0.07, 0.07, 0.04, vlasy);
    box(2, 0, 1.553, 0.132, 0.09, 0.02, 0.02, vlasy);
  } else if (v.vousy === 'strniste') {
    box(2, 0, 1.51, 0.1265, 0.23, 0.1, 0.004, tmavsi(kuze, 0.78));
  }
  // brýle
  if (v.slunecni) {
    [-1, 1].forEach((s) => box(2, s * 0.058, 1.627, 0.138, 0.08, 0.05, 0.01, [0.05, 0.05, 0.06]));
    box(2, 0, 1.635, 0.138, 0.04, 0.012, 0.01, [0.05, 0.05, 0.06]);
  } else if (v.bryle) {
    const ram = v.zena ? b.doplnek : [0.12, 0.1, 0.1];
    [-1, 1].forEach((s) => {
      const x = s * 0.058;
      box(2, x, 1.652, 0.138, 0.08, 0.01, 0.008, ram);
      box(2, x, 1.602, 0.138, 0.08, 0.01, 0.008, ram);
      box(2, x - 0.037, 1.627, 0.138, 0.01, 0.05, 0.008, ram);
      box(2, x + 0.037, 1.627, 0.138, 0.01, 0.05, 0.008, ram);
    });
    box(2, 0, 1.64, 0.138, 0.03, 0.01, 0.008, ram);
  }
  if (v.nausnice) [-1, 1].forEach((s) => box(2, s * 0.133, 1.555, 0.0, 0.015, 0.03, 0.015, [0.95, 0.8, 0.3]));

  // vlasy
  const temeno = () => box(2, 0, 1.745, -0.005, 0.27, 0.05, 0.27, vlasy);
  const zatylek = (spodek = 1.58) => box(2, 0, (1.74 + spodek) / 2, -0.13, 0.27, 1.74 - spodek, 0.03, vlasy);
  const boky = () => [-1, 1].forEach((s) => box(2, s * 0.13, 1.68, -0.03, 0.02, 0.1, 0.2, vlasy));
  const kryteHlavou = v.pokryvka && v.pokryvka !== 'sluchatka';
  switch (v.styl) {
    case 'pleš':
      [-1, 1].forEach((s) => box(2, s * 0.13, 1.62, -0.04, 0.02, 0.08, 0.17, vlasy));
      box(2, 0, 1.6, -0.13, 0.26, 0.1, 0.02, vlasy);
      break;
    case 'dlouhe':
      temeno(); zatylek(1.42); boky();
      box(2, 0, 1.5, -0.12, 0.28, 0.2, 0.05, vlasy);
      [-1, 1].forEach((s) => box(2, s * 0.135, 1.55, 0.03, 0.025, 0.26, 0.09, vlasy));
      box(2, 0, 1.715, 0.12, 0.26, 0.045, 0.03, vlasy);
      break;
    case 'culik':
      temeno(); zatylek(); boky();
      box(2, 0, 1.56, -0.17, 0.07, 0.22, 0.07, vlasy);
      box(2, 0, 1.68, -0.15, 0.08, 0.03, 0.04, b.doplnek);
      break;
    case 'drdol':
      temeno(); zatylek(); boky();
      if (!kryteHlavou) box(2, 0, 1.77, -0.09, 0.12, 0.1, 0.12, vlasy);
      break;
    case 'kudrny':
      zatylek(1.55); boky();
      for (let i = 0; i < 9; i++) box(2, -0.1 + (i % 3) * 0.1, 1.75 + (i % 2) * 0.02, -0.1 + Math.floor(i / 3) * 0.1, 0.11, 0.08, 0.11, vlasy);
      break;
    case 'jezek':
      temeno(); zatylek(); boky();
      for (let i = 0; i < 8; i++) box(2, -0.09 + (i % 4) * 0.06, 1.79, -0.06 + Math.floor(i / 4) * 0.08, 0.03, 0.06, 0.03, vlasy);
      break;
    case 'pesinka':
      temeno(); zatylek(); boky();
      box(2, -0.05, 1.77, 0.03, 0.17, 0.03, 0.2, vlasy);
      break;
    case 'mikado':
      temeno(); zatylek(1.5);
      [-1, 1].forEach((s) => box(2, s * 0.137, 1.6, -0.01, 0.03, 0.22, 0.24, vlasy));
      box(2, 0, 1.712, 0.122, 0.26, 0.05, 0.03, vlasy);
      break;
    case 'cirak':
      [-1, 1].forEach((s) => box(2, s * 0.13, 1.62, -0.04, 0.012, 0.06, 0.15, vlasyT));
      box(2, 0, 1.79, -0.02, 0.05, 0.12, 0.25, vlasy);
      break;
    default:
      temeno(); zatylek(); boky();
  }

  // pokrývky hlavy
  const p = b.pokryvka;
  switch (v.pokryvka) {
    case 'ksiltovka':
      box(2, 0, 1.765, -0.005, 0.28, 0.07, 0.28, p);
      box(2, 0, 1.737, v.ksiltDozadu ? -0.19 : 0.19, 0.22, 0.015, 0.13, tmavsi(p, 0.8));
      break;
    case 'bekovka':
      box(2, 0, 1.76, 0.01, 0.285, 0.05, 0.29, p);
      box(2, 0, 1.74, 0.165, 0.24, 0.015, 0.06, tmavsi(p, 0.8));
      break;
    case 'klobouk':
      box(2, 0, 1.75, 0, 0.42, 0.015, 0.42, [0.2, 0.15, 0.12]);
      box(2, 0, 1.81, 0, 0.26, 0.11, 0.26, [0.2, 0.15, 0.12]);
      box(2, 0, 1.77, 0, 0.265, 0.025, 0.265, p);
      break;
    case 'myslivecky':
      box(2, 0, 1.75, 0, 0.36, 0.015, 0.36, p);
      box(2, 0, 1.81, 0, 0.24, 0.12, 0.24, p);
      box(2, 0, 1.77, 0, 0.245, 0.02, 0.245, [0.3, 0.2, 0.1]);
      box(2, 0.11, 1.88, -0.06, 0.015, 0.16, 0.03, [0.85, 0.85, 0.8]);
      break;
    case 'kulich':
      box(2, 0, 1.76, -0.01, 0.285, 0.12, 0.285, p);
      box(2, 0, 1.71, -0.01, 0.29, 0.03, 0.29, svetlejsi(p, 0.3));
      box(2, 0, 1.84, -0.01, 0.07, 0.06, 0.07, svetlejsi(p, 0.5));
      break;
    case 'slamak':
      box(2, 0, 1.75, 0, 0.5, 0.015, 0.5, p);
      box(2, 0, 1.8, 0, 0.27, 0.1, 0.27, p);
      box(2, 0, 1.765, 0, 0.275, 0.025, 0.275, [0.5, 0.15, 0.1]);
      break;
    case 'helma':
      box(2, 0, 1.775, 0, 0.29, 0.1, 0.3, p);
      box(2, 0, 1.738, 0.04, 0.31, 0.015, 0.38, p);
      box(2, 0, 1.83, 0, 0.04, 0.02, 0.3, tmavsi(p, 0.85));
      break;
    case 'sluchatka':
      box(2, 0, 1.765, 0, 0.29, 0.02, 0.05, [0.12, 0.12, 0.14]);
      [-1, 1].forEach((s) => box(2, s * 0.145, 1.62, 0, 0.045, 0.085, 0.085, b.doplnek));
      break;
  }
  return vytvorSit(d);
}
/* =========================================================
   14) ANIMACE POSTAV – chůze, sezení, pití, mávání, založené ruce
   ========================================================= */
function novaPostava(x, z, vzhled) {
  return {
    x, z, natoceni: 0, vzhled, sit: postavSitPostavy(vzhled),
    faze: Math.random() * 6, chuze: 0, sedi: 0, sedadloTyp: 'zidle',
    napiti: 0, drziPred: 0, mava: 0, rucePres: 0, mluvi: 0, kyvHlavou: 0,
    vyraz: 'normal', hlavaOtoc: 0, cesta: [], rychlost: nahodneCislo(1.15, 1.45),
    _kosti: new Float32Array(POCET_KOSTI * 16), _ruka: [x, 1, z]
  };
}

function smazPostavu(p) {
  smazSit(p.sit);
  p.sit = null;
}

// Posune postavu po její cestě; vrací true, když dorazila
function jdiPoCeste(p, dt) {
  if (!p.cesta.length) { p.chuze = Math.max(0, p.chuze - dt * 4); return true; }
  const cil = p.cesta[0];
  const dx = cil.x - p.x, dz = cil.z - p.z;
  const d = Math.hypot(dx, dz);
  const krok = p.rychlost * dt;
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
  p.faze += dt * p.rychlost * 6.2;
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
  const B = [];
  B[0] = M4.retez(M4.posun(p.x, poskok, p.z), M4.rotY(p.natoceni), M4.meritko(v.vyska, v.vyska, v.vyska), M4.posun(0, -pokles, 0));
  B[1] = kloub(B[0], 0, 0.9, 0, M4.rotX(0.05 * p.chuze + sed * (stolicka ? 0.14 : 0.05) + dych));
  B[2] = kloub(B[1], 0, 1.5, 0, M4.rotY(p.hlavaOtoc), M4.rotX(p.kyvHlavou + Math.sin(cas * 11) * 0.03 * p.mluvi));
  // nohy
  [[-1, 7, 8], [1, 9, 10]].forEach(([s, stehno, lytko]) => {
    const uhel = lerp(kyv * s, stolicka ? -1.3 : -Math.PI / 2, sed);
    const koleno = lerp(Math.max(0, -Math.sin(p.faze) * s) * 0.7 * p.chuze, stolicka ? 1.05 : Math.PI / 2, sed);
    B[stehno] = kloub(B[0], s * 0.1, 0.86, 0, M4.rotX(uhel));
    B[lytko] = kloub(B[stehno], s * 0.1, 0.44, 0, M4.rotX(koleno));
  });
  // ruce
  [[-1, 3, 4], [1, 5, 6]].forEach(([s, rameno, loket]) => {
    let a = kyv * s * 0.8;
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
    if (s === 1) {
      a = lerp(a, -0.35, p.drziPred);
      b = lerp(b, -1.25, p.drziPred);
      a = lerp(a, -0.6, p.napiti);
      b = lerp(b, -2.2, p.napiti);
      ry = lerp(ry, -0.45, p.napiti);
      a = lerp(a, -2.85, p.mava);
      b = lerp(b, -0.35, p.mava);
      rz = lerp(rz, 0.18 + Math.sin(cas * 9) * 0.22, p.mava);
    }
    B[rameno] = kloub(B[1], s * R, 1.4, 0, M4.rotY(ry), M4.rotX(a), M4.rotZ(rz));
    B[loket] = kloub(B[rameno], s * R, 1.11, 0, M4.rotX(b));
  });
  // výraz obličeje: úsměv / mračení / obyčejná pusa (ta se při mluvení otevírá)
  const usta = (meritko, sy = meritko) => kloub(B[2], 0, 1.53, 0.13, M4.meritko(meritko, sy, meritko));
  B[11] = usta(p.vyraz === 'usmev' ? 1 : 0);
  B[12] = usta(p.vyraz === 'zamraceny' ? 1 : 0);
  B[13] = usta(p.vyraz === 'normal' ? 1 : 0, p.vyraz === 'normal' ? 1 + Math.abs(Math.sin(cas * 14)) * 1.6 * p.mluvi : 0);
  for (let i = 0; i < POCET_KOSTI; i++) p._kosti.set(B[i], i * 16);
  const ruka = M4.bod(B[6], R, 0.8, 0.05);
  p._ruka = [ruka[0], ruka[1], ruka[2]];
}

function kresliPostavu(p, cas) {
  if (!p.sit) return;
  spocitejKosti(p, cas);
  kresliSKostmi(p.sit, p._kosti);
}

// Tmavá skvrna pod postavou (kreslí se průhledně)
const STIN = new Float32Array([0, 0, 0, 0.3]);
function kresliStin(x, z, r) {
  kresli(SITE.valec, M4.krat(M4.posun(x, 0.004, z), M4.meritko(r * 2, 0.002, r * 2)), null, STIN);
}
/* =========================================================
   14) HRÁČ – chůze, rozhlížení, kolize a ovládání
   ========================================================= */
let REZIM = 'menu'; // 'menu' | 'hra' | 'pauza' | 'kniha'
const hrac = { x: SVET.start.x, z: SVET.start.z, yaw: SVET.start.yaw, pitch: -0.12, houpani: 0, jde: 0 };
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
  const beh = k.has('ShiftLeft') || k.has('ShiftRight') ? 1.35 : 1;
  const rychlost = NASTAVENI.rychlostChuze * (1 + 0.12 * (HRA.vylepseni.boty || 0)) * beh;
  const fx = -Math.sin(hrac.yaw), fz = -Math.cos(hrac.yaw);
  const px = Math.cos(hrac.yaw), pz = -Math.sin(hrac.yaw);
  const dx = (fx * dopredu + px * doprava) * rychlost * dt;
  const dz = (fz * dopredu + pz * doprava) * rychlost * dt;
  [hrac.x, hrac.z] = vyresKolize(hrac.x + dx, hrac.z + dz);
  const jde = Math.min(1, Math.hypot(dopredu, doprava));
  hrac.jde += (jde - hrac.jde) * Math.min(1, dt * 8);
  hrac.houpani += dt * 5.5 * jde * beh;
}

function otocPohled(dx, dy, citlivost) {
  hrac.yaw = normalizujUhel(hrac.yaw - dx * citlivost);
  hrac.pitch = omez(hrac.pitch - dy * citlivost, -1.35, 1.35);
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
   stůl: zamávají, objednávku převezmeš u stolu, pivo doneseš,
         na konci zavolají „Zaplatím!“ a vybereš peníze
   ========================================================= */
const party = [];          // všechny partičky v hospodě
const hoste = [];          // všichni hosté (kvůli kreslení)
const spinave = [];        // prázdné sklenice { x, y, z, misto: {x, z}, pivo }
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
  let soucet = polozky.reduce((s, [, v]) => s + v, 0);
  let r = Math.random() * soucet;
  for (const [klic, v] of polozky) { r -= v; if (r <= 0) return klic; }
  return polozky.length ? polozky[polozky.length - 1][0] : null;
}

function vyberTyp() {
  const vahy = {};
  TYPY_HOSTU.forEach((t) => { vahy[t.id] = t.vaha * (t.id === 'fanousek' && HRA.vylepseni.televize ? 2 : 1); });
  const id = vahovanyVyber(vahy);
  return TYPY_HOSTU.find((t) => t.id === id) || TYPY_HOSTU[0];
}

// Jaké pivo si host dá (podle oblíbenosti, jen to, co je na čepu)
function vyberPivo(typ) {
  const vahy = {};
  PIVA.forEach((p) => { if (jeNaCepu(p)) vahy[p.id] = (typ.piva[p.id] || 0.4); });
  return vahovanyVyber(vahy);
}

// Text objednávky: {r12: 2, k: 1} → „dvě Radegast dvanáctky a Kozla“
function popisObjednavky(pocty, cizinec) {
  const casti = Object.entries(pocty).map(([id, n]) => {
    const p = najdiPivo(id);
    if (cizinec) return (n > 1 ? ['', 'one', 'two', 'three'][n] + ' ' : '') + p.kratce;
    if (n === 1) return vyberNove(p.nazvy, 'nazev_' + id, 4);
    return vyberNove(n === 2 ? p.dve : p.tri, 'vic_' + id, 2);
  });
  return casti.length > 1 ? casti.slice(0, -1).join(', ') + (cizinec ? ' and ' : ' a ') + casti[casti.length - 1] : casti[0];
}

function vytvorObjednavku(parta, dalsiKolo) {
  const typ = parta.typ;
  const clenove = dalsiKolo && parta.clenove.length > 1
    ? parta.clenove.filter(() => Math.random() < 0.8) : parta.clenove;
  const kdo = clenove.length ? clenove : [parta.clenove[0]];
  const polozky = kdo.map((host) => {
    // při dalším kole často zůstanou u svého piva
    const minule = dalsiKolo && host.posledniPivo && Math.random() < 0.7 ? host.posledniPivo : vyberPivo(typ);
    return { pivo: minule, komu: host, hotovo: false, kvalita: null };
  });
  const pocty = {};
  polozky.forEach((p) => { pocty[p.pivo] = (pocty[p.pivo] || 0) + 1; });
  const o = popisObjednavky(pocty, typ.cizinec);
  let text;
  const stejne = dalsiKolo && polozky.every((p) => p.pivo === p.komu.posledniPivo);
  if (dalsiKolo && stejne && Math.random() < 0.5) text = vyberNove(HLASKY_DALSI_KOLO, 'dalsiKolo', 3);
  else if (dalsiKolo) text = vyberNove(['Ještě {o}, prosím.', 'Tak ještě {o}.', 'Další kolo: {o}!', '{o}, a pak už fakt půjdem.', 'Dáme si ještě {o}.'], 'kolo', 3).replace('{o}', o);
  else text = vyberNove(typ.objednavky, 'obj_' + typ.id, 3).replace('{p}', vyberNove(typ.pozdravy, 'pozdrav_' + typ.id, 3)).replace('{o}', o) + vyberNove(KONCE, 'konec', 3);
  parta.objednavka = polozky;
  parta.text = vyplnText(text, typ, kdo[0].vzhled.zena);
  parta.mluvci = kdo[0];
  parta.prevzato = true;
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

// k místu, kde stojí špinavá sklenice, si nikdo nesedne
const spinaveU = (s) => spinave.some((g) => Math.abs(g.x - s.sklenice.x) < 0.25 && Math.abs(g.z - s.sklenice.z) < 0.25);
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
  i *= 1.5 - 0.12 * HRA.hodnoceni;
  i *= 1 + 0.3 * party.filter((p) => p.stav !== 'odchazi').length;
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
    trpelivost: 1, maxTrpelivost: 1, utrata: 0, dysko: 0, kolo: 1, spokojenost: [], rekl: false
  };
  for (let i = 0; i < pocet; i++) {
    const zena = Math.random() > typ.muz;
    const host = novaPostava(SVET.venku.x + nahodneCislo(-0.3, 0.3), SVET.venku.z + i * 0.6, novyVzhled(typ, zena));
    Object.assign(host, {
      parta, jmeno: jmenoHosta(typ, zena), misto: mista[i], piva: [], hlaska: null, natoceni: Math.PI,
      casDoNapiti: nahodneCislo(2, 4), napitiDo: 0, start: i * 0.7, posledniPivo: null, carky: 0
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
  host.hlaska = { text: vyplnText(text, host.parta.typ, host.vzhled.zena), do: casHry + sekund };
  host.mluvi = 1;
}

function nastavTrpelivost(parta, sekund) {
  parta.maxTrpelivost = sekund * trpelivostNasobic();
  parta.trpelivost = parta.maxTrpelivost;
}

const zbyvaDonest = (parta) => parta.objednavka.filter((p) => !p.hotovo);
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
      const mavat = (parta.stav === 'vola' || parta.stav === 'plati') && h === parta.mluvci;
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
          zkontrolujNavod();
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
    const zalozit = pod < 0.3 && (h !== parta.mluvci || pod < 0.12);
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
  parta.clenove.forEach((h) => {
    h.drziPred = 0;
    h.rucePres = Math.max(0, h.rucePres - dt * 3);
    const pivo = h.piva.find((p) => p.zbyva > 0);
    if (!pivo) {
      h.napiti = Math.max(0, h.napiti - dt * 4);
      if (h.napiti > 0.05) vsichniDopili = false;
      return;
    }
    vsichniDopili = false;
    h.casDoNapiti -= dt;
    if (h.casDoNapiti <= 0) {
      h.napitiDo = casHry + 1.5;
      h.casDoNapiti = nahodneCislo(3, 7);
      if (h.vyraz === 'zamraceny') h.vyraz = 'normal';
    }
    const pije = casHry < h.napitiDo;
    h.napiti += ((pije ? 1 : 0) - h.napiti) * Math.min(1, dt * 5);
    if (pije) pivo.zbyva = Math.max(0, pivo.zbyva - dt / (pivo.doba * 0.27));
    // partička si povídá
    if (!pije && parta.clenove.length > 1 && Math.random() < dt * 0.25) h.mluvi = 1;
  });
  if (!vsichniDopili) return;
  // prázdné sklenice zůstanou na stole (nebo na pultu)
  parta.clenove.forEach((h) => {
    h.piva.forEach((p, k) => {
      const s = h.misto.sklenice;
      spinave.push({ x: s.x + k * 0.11, y: s.y, z: s.z + (h.misto.typ === 'stolicka' ? 0 : k * 0.04), misto: pristup(h.misto), pivo: p.id });
    });
    h.piva = [];
  });
  zkontrolujNavod();
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
  const prumer = parta.spokojenost.length ? parta.spokojenost.reduce((a, b) => a + b, 0) / parta.spokojenost.length : 0.6;
  const skore = nastvany ? 0 : prumer;
  HRA.hodnoceni = omez(HRA.hodnoceni * 0.85 + (1 + 4 * skore) * 0.15, 1, 5);
  if (!nastvany) HRA.hostu += parta.clenove.length;
  parta.clenove.forEach((h, k) => {
    // nedopité pivo nechají na stole
    h.piva.forEach((p) => {
      const s = h.misto.sklenice;
      spinave.push({ x: s.x + 0.05, y: s.y, z: s.z, misto: pristup(h.misto), pivo: p.id, zbyva: p.zbyva });
    });
    h.piva = [];
    if (h.misto) { h.misto.host = null; h.misto.carky = 0; }
    h.vyraz = nastvany ? 'zamraceny' : 'usmev';
    h.mava = 0;
    h.rucePres = 0;
    h.napiti = 0;
    h.start = k * 0.5;
    h.cesta = najdiCestu(h.misto ? h.misto.x : h.x, h.misto ? h.misto.z : h.z, SVET.venku.x, SVET.venku.z + 0.4);
    h.misto = null;
  });
  zkontrolujNavod();
  ulozHru();
}

/* ---------- Co se stane, když hráč obslouží hosta ---------- */
function obsluzHosta(host) {
  const parta = host.parta;
  switch (parta.stav) {
    case 'vola':
      vytvorObjednavku(parta, parta.kolo > 1);
      parta.stav = 'ceka_pivo';
      parta.spokojenost.push(0.9 + 0.1 * (parta.trpelivost / parta.maxTrpelivost));
      nastavTrpelivost(parta, trpelivostNaPivo(parta));
      rekni(parta.mluvci, parta.text, 6);
      parta.rekl = false;
      zvuk.klik();
      zkontrolujNavod();
      break;
    case 'ceka_pivo':
      podejPivoParte(parta, host);
      break;
    case 'plati': {
      const celkem = parta.utrata + parta.dysko;
      HRA.penize += celkem;
      HRA.navod.platil = true;
      plovouciText(host.x, 2.0, host.z, `+${celkem} Kč`, parta.dysko ? `z toho dýško ${parta.dysko} Kč` : '');
      rekni(parta.mluvci, vyberNove(HLASKY_ZAPLACENO, 'zaplaceno', 3), 3);
      parta.spokojenost.push(0.8 + 0.2 * (parta.trpelivost / parta.maxTrpelivost));
      zvuk.kasa();
      odejdiParta(parta, false);
      break;
    }
    case 'pije':
      rekni(host, nahodne(['Na zdraví!', 'Díky, zatím dobrý.', 'Je to dobrý, {j}!', 'Hezky se tu sedí.']), 2.5);
      break;
  }
}

function podejPivoParte(parta, host) {
  const zbyva = zbyvaDonest(parta).sort((a, b) => (a.komu === host ? -1 : 0) - (b.komu === host ? -1 : 0));
  let polozka = null, iPiva = -1;
  for (const p of zbyva) {
    iPiva = ruce.piva.findIndex((x) => x.id === p.pivo);
    if (iPiva >= 0) { polozka = p; break; }
  }
  if (!polozka) {
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
  const [pivo] = ruce.piva.splice(iPiva, 1);
  polozka.hotovo = true;
  polozka.kvalita = pivo.kvalita;
  const komu = polozka.komu;
  komu.piva.push({ id: pivo.id, zbyva: 1, doba: nahodneCislo(...NASTAVENI.pitiZaPivo), plneni: pivo.plneni });
  komu.posledniPivo = pivo.id;
  HRA.obslouzeno++;
  const vyuzito = 1 - parta.trpelivost / parta.maxTrpelivost;
  const h = HODNOCENI[pivo.kvalita];
  parta.spokojenost.push(h.spokojenost * (1 - 0.4 * vyuzito));
  const p = najdiPivo(pivo.id);
  const dysko = Math.round((h.dysko + (vyuzito < 0.5 ? 5 : 0)) * nasobicDyska());
  if (parta.kde === 'bar') {
    HRA.penize += p.cena + dysko;
    plovouciText(komu.x, 2.0, komu.z, `+${p.cena + dysko} Kč`, dysko ? `dýško ${dysko} Kč` : '');
    zvuk.kasa();
  } else {
    parta.utrata += p.cena;
    parta.dysko += dysko;
    komu.misto.carky = (komu.misto.carky || 0) + 1;
    zvuk.cink();
  }
  const dekovani = pivo.kvalita === 'perfekt' || pivo.kvalita === 'dobre'
    ? vyberNove(parta.typ.dekuje, 'dekuje_' + parta.typ.id, 3) : vyberNove(HLASKY_NIC_MOC, 'nicmoc', 3);
  rekni(komu, dekovani, 3);
  komu.vyraz = pivo.kvalita === 'perfekt' || pivo.kvalita === 'dobre' ? 'usmev' : 'normal';
  if (!zbyvaDonest(parta).length) {
    parta.stav = 'pije';
    parta.rekl = false;
    parta.clenove.forEach((x) => { x.casDoNapiti = nahodneCislo(1, 3); x.rucePres = 0; });
  }
  zkontrolujNavod();
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
const ruce = { piva: [], sklenice: [] };  // piva: [{ id, kvalita, plneni }], sklenice: id piv prázdných sklenic
let cepuje = null;                         // kohout, u kterého právě teče pivo
let cil = null;                            // na co se hráč dívá
let cisteSklenice = NASTAVENI.cisteSklenice;
let pomocnik = null;
let narazeni = null;                       // výměna sudu, která právě probíhá
const dodavky = [];                        // objednané sudy na cestě { id, za }

const najdiPivo = (id) => PIVA.find((p) => p.id === id);
const jeNaCepu = (p) => p.odemknout === 0 || (HRA.odemcena || []).includes(p.id);
const kapacitaRegalu = () => NASTAVENI.cisteSklenice + 6 * (HRA.vylepseni.sklenice || 0);
const kapacitaSudu = () => NASTAVENI.kapacitaSudu + 10 * (HRA.vylepseni.sudy || 0);
const unosnostPiv = () => NASTAVENI.unosnostPiv + 2 * (HRA.vylepseni.tac || 0);
const unosnostSklenic = () => NASTAVENI.unosnostSklenic + 3 * (HRA.vylepseni.tac || 0);
const zaPultem = () => hrac.z < SVET.pult.z0 && hrac.x < SVET.prepazka;
const veSkladu = () => hrac.x > SVET.prepazka + 0.1 && hrac.z < SVET.sklad.z1;
const sud = (id) => HRA.sudy[id] || (HRA.sudy[id] = { zbyva: kapacitaSudu(), zasoba: 1 });

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
  }
  if (veSkladu() || hrac.x > SVET.prepazka - 0.8) {
    PIVA.forEach((p, i) => {
      if (!jeNaCepu(p)) return;
      const x = SVET.sudX(i);
      zkus(paprsekKvadr(o, d, [x - 0.18, 0.1, 0.15], [x + 0.18, 0.85, 0.62]), NASTAVENI.dosah, { typ: 'sud', pivo: p });
    });
    zkus(paprsekKvadr(o, d, [12.25, 0, 1.85], [SVET.sklad.x1, 1.2, SVET.sklad.z1]), NASTAVENI.dosah, { typ: 'paleta' });
  }
  hoste.forEach((h) => {
    const s = h.parta.stav;
    if (h.sedi < 0.9 || !['vola', 'ceka_pivo', 'plati', 'pije'].includes(s)) return;
    const y0 = h.sedadloTyp === 'stolicka' ? 0.75 : 0.45;
    zkus(paprsekKvadr(o, d, [h.x - 0.3, y0, h.z - 0.3], [h.x + 0.3, y0 + 1.05, h.z + 0.3]), NASTAVENI.dosahHost, { typ: 'host', host: h });
  });
  spinave.forEach((s) => zkus(paprsekKoule(o, d, [s.x, s.y + 0.09, s.z], 0.15), NASTAVENI.dosah, { typ: 'spinava', sklenice: s }));
  const k = SVET.kniha;
  zkus(paprsekKvadr(o, d, [k.x - 0.28, P - 0.05, k.z - 0.22], [k.x + 0.28, P + 0.22, k.z + 0.22]), NASTAVENI.dosah, { typ: 'kniha' });
  const c = SVET.cedule;
  zkus(paprsekKvadr(o, d, [c.x - 0.3, c.y - 0.2, c.z - 0.12], [c.x + 0.3, c.y + 0.2, c.z + 0.06]), NASTAVENI.dosah, { typ: 'cedule' });
  if (!kandidati.length) return null;
  kandidati.sort((a, b) => a.t - b.t);
  const jeHost = (x) => x.data.typ === 'host';
  // s pivem v ruce má přednost host, který právě tohle pivo chce, se sklenicemi dřez
  if (ruce.piva.length) {
    const chce = (x) => jeHost(x) && x.data.host.parta.stav === 'ceka_pivo' && zbyvaDonest(x.data.host.parta).some((o) => ruce.piva.some((p) => p.id === o.pivo));
    const h = kandidati.find(chce) || kandidati.find((x) => jeHost(x) && x.data.host.parta.stav === 'ceka_pivo');
    if (h) return h.data;
  }
  if (ruce.sklenice.length || ruce.piva.length) {
    const drez = kandidati.find((x) => x.data.typ === 'drez');
    if (drez) return drez.data;
  }
  // host, u kterého teď není co dělat (pije, nebo čeká na pivo a ty žádné neneseš),
  // nepřekáží: když je hned za ním něco užitečného (jiný host, sklenice), vybere se to
  const prvni = kandidati[0];
  const nicNechce = (x) => jeHost(x) && (x.data.host.parta.stav === 'pije' || (x.data.host.parta.stav === 'ceka_pivo' && !ruce.piva.length));
  // kniha, regál a paleta mají přednost jen tehdy, když těsně za nimi není nic důležitějšího
  const vedlejsi = (x) => nicNechce(x) || ['kniha', 'regal', 'paleta'].includes(x.data.typ);
  if (vedlejsi(prvni)) {
    const jiny = kandidati.find((x) => !vedlejsi(x) && x.t - prvni.t < (jeHost(prvni) ? 0.9 : 0.45));
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
      if (ruce.sklenice.length) return '🧽 Nejdřív odnes prázdné sklenice do dřezu';
      if (!c.kohout.sklenice && ruce.piva.length >= unosnostPiv()) return '✋ Víc piv neuneseš – nejdřív je roznes';
      if (!c.kohout.sklenice && sud(p.id).zbyva <= 0) return `🛢️ Sud ${p.nazev} je prázdný – narazi nový ve skladu`;
      if (!c.kohout.sklenice && cisteSklenice <= 0) return '🍺 Došly čisté sklenice! Posbírej prázdné po hostech';
      return `${c.kohout.sklenice ? 'Drž a dočepuj' : 'Drž a čepuj'} ${p.nazev} · v sudu ${sud(p.id).zbyva}`;
    }
    case 'host': {
      const h = c.host, parta = h.parta;
      if (parta.stav === 'vola') return `Převzít objednávku – ${h.jmeno}${parta.clenove.length > 1 ? ' a spol.' : ''}`;
      if (parta.stav === 'plati') return `Vybrat peníze – ${parta.utrata + parta.dysko} Kč`;
      if (parta.stav === 'pije') return `${h.jmeno} – pije`;
      const zbyva = zbyvaDonest(parta).map((p) => najdiPivo(p.pivo).kratce);
      if (ruce.piva.some((p) => zbyvaDonest(parta).some((x) => x.pivo === p.id))) return `Podat pivo – ${h.jmeno}`;
      return `Chtějí: ${zbyva.join(', ')}`;
    }
    case 'spinava':
      if (ruce.piva.length) return '✋ Máš plné ruce piva';
      if (ruce.sklenice.length >= unosnostSklenic()) return '✋ Víc sklenic neuneseš';
      return 'Sebrat prázdnou sklenici';
    case 'drez':
      if (ruce.sklenice.length) return `Umýt sklenice (${ruce.sklenice.length})`;
      if (ruce.piva.length) return 'Vylít pivo do dřezu';
      return 'Dřez – sem nos prázdné sklenice';
    case 'regal': return `Čisté sklenice: ${cisteSklenice} z ${kapacitaRegalu()}`;
    case 'kniha': return 'Otevřít knihu vylepšení';
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
    case 'kniha': otevriKnihu(); break;
    case 'sud': zacniNarazet(cil.pivo); break;
    case 'paleta': ukazToast('🛢️ Náhradní sudy objednáš v knize vylepšení (záložka Sklad).'); break;
    case 'cedule':
      HRA.otevreno = !HRA.otevreno;
      if (HRA.otevreno) { dalsiPartaZa = Math.min(dalsiPartaZa, 2.5); ukazToast('🔔 Otevřeno! Hosté se můžou hrnout dovnitř.'); }
      else ukazToast('🔒 Zavřeno – noví hosté nepřijdou. Kdo je uvnitř, ten dopije.');
      zvuk.klik();
      zkontrolujNavod();
      ulozHru();
      break;
  }
}

function akceUvolni() {
  vstup.akceDrzena = false;
  if (cepuje) dokonciCepovani();
  narazeni = null;
}

function zacniCepovat(k) {
  if (cepuje) return;
  if (ruce.sklenice.length) { ukazToast('🧽 S prázdnými sklenicemi v ruce čepovat nejde.'); return; }
  if (!k.sklenice) {
    if (ruce.piva.length >= unosnostPiv()) { ukazToast(HRA.vylepseni.tac ? '✋ Víc piv neuneseš.' : '✋ Víc než dvě piva v rukou neuneseš. Kup si v knize tác!'); return; }
    const s = sud(k.pivo.id);
    if (s.zbyva <= 0) { ukazToast(`🛢️ Sud ${k.pivo.nazev} je prázdný! Jdi do skladu za barem a narazi nový.`); zvuk.prskani(); return; }
    if (cisteSklenice <= 0) { ukazToast('🍺 Došly čisté sklenice! Posbírej prázdné po hostech a umyj je v dřezu.'); return; }
    cisteSklenice--;
    s.zbyva--;
    k.sklenice = { plneni: 0, rychlost: nahodneCislo(0.9, 1.15) };
  }
  cepuje = k;
  zvuk.cepovani(true);
  zkontrolujNavod();
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
  zkontrolujNavod();
}

function seberSklenici(s) {
  if (ruce.piva.length) { ukazToast('✋ Nejdřív roznes piva, co neseš.'); return; }
  if (ruce.sklenice.length >= unosnostSklenic()) { ukazToast('✋ Víc sklenic neuneseš – odnes je do dřezu.'); return; }
  const i = spinave.indexOf(s);
  if (i < 0) return;
  spinave.splice(i, 1);
  ruce.sklenice.push(s.pivo || 'r10');
  zvuk.cink();
}

function pouzijDrez() {
  if (ruce.sklenice.length) {
    const n = ruce.sklenice.length;
    cisteSklenice += n;
    HRA.umyto += n;
    ukazToast(`🧽 Umyto: ${n} ${n < 5 ? 'sklenice' : 'sklenic'}. V regálu je teď ${cisteSklenice} čistých.`);
    ruce.sklenice = [];
    zvuk.voda();
    zkontrolujNavod();
  } else if (ruce.piva.length) {
    ruce.piva.shift();
    cisteSklenice++;
    ukazToast('🚰 Pivo vylito, sklenice umytá.');
    zvuk.voda();
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
        HRA.prazdneSudy = Math.min(12, (HRA.prazdneSudy || 0) + 1);
        ukazToast(`🛢️ Naraženo! ${narazeni.pivo.nazev} zase teče.`);
        zvuk.syk();
        narazeni = null;
        zkontrolujNavod();
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

/* ---------- Pomocník Pepa (vylepšení) – sbírá a myje sklenice ---------- */
function aktualizujPomocnika(dt) {
  if (!HRA.vylepseni.pomocnik) return;
  if (!pomocnik) {
    const typ = { id: 'pomocnik', vek: [35, 45], muz: 1, styl: { trup: ['kosile'], spodek: ['kalhoty'], vlasy: ['kratke'], vousy: [['knir', 1]] } };
    const v = novyVzhled(typ, false);
    v.barvy.trup = [0.95, 0.95, 0.93];
    pomocnik = novaPostava(SVET.pomocnikDoma.x, SVET.pomocnikDoma.z, v);
    Object.assign(pomocnik, { stav: 'doma', nese: 0, cilSklenice: null, cekani: 0, rychlost: 1.4, natoceni: Math.PI, jmeno: 'Pepa' });
  }
  const p = pomocnik;
  p.drziPred = p.nese ? 1 : 0;
  switch (p.stav) {
    case 'doma':
      jdiPoCeste(p, dt);
      p.cekani -= dt;
      if (p.cekani > 0) break;
      if (spinave.length && p.nese < 6) {
        p.cilSklenice = spinave.reduce((a, b) => (vzdalenost(p.x, p.z, a.x, a.z) < vzdalenost(p.x, p.z, b.x, b.z) ? a : b));
        p.cesta = najdiCestu(p.x, p.z, p.cilSklenice.misto.x, p.cilSklenice.misto.z);
        p.stav = 'jde';
      } else if (p.nese) {
        p.cesta = najdiCestu(p.x, p.z, SVET.drez.x, 1.0);
        p.stav = 'nese';
      } else {
        p.cekani = 1;
      }
      break;
    case 'jde':
      if (!spinave.includes(p.cilSklenice)) { p.stav = 'doma'; p.cekani = 0.3; break; }
      if (jdiPoCeste(p, dt)) {
        for (let i = spinave.length - 1; i >= 0 && p.nese < 6; i--) {
          if (vzdalenost(spinave[i].x, spinave[i].z, p.x, p.z) < 1.2) { spinave.splice(i, 1); p.nese++; }
        }
        p.stav = 'doma';
        p.cekani = 0.4;
      }
      break;
    case 'nese':
      if (jdiPoCeste(p, dt)) {
        cisteSklenice += p.nese;
        p.nese = 0;
        zvuk.voda();
        p.cesta = najdiCestu(p.x, p.z, SVET.pomocnikDoma.x, SVET.pomocnikDoma.z);
        p.stav = 'doma';
        p.cekani = 1.5;
      }
      break;
  }
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

// Rozlišení se samo přizpůsobí výkonu zařízení (když se hra zadrhává, kreslí se v menším rozlišení)
const vykon = { skala: 1, soucet: 0, pocet: 0 };
function zmerVykon(dt) {
  vykon.soucet += dt;
  vykon.pocet++;
  if (vykon.pocet < 40) return;
  const prumer = vykon.soucet / vykon.pocet;
  if (prumer > 0.026 && vykon.skala > 0.5) vykon.skala = Math.max(0.5, vykon.skala * 0.85);
  else if (prumer < 0.0175 && vykon.skala < 1) vykon.skala = Math.min(1, vykon.skala * 1.08);
  vykon.soucet = 0;
  vykon.pocet = 0;
}
function velikostPlatna() {
  const dpr = Math.min(window.devicePixelRatio || 1, vstup.dotykove ? 1.5 : 2) * vykon.skala;
  const w = Math.round(window.innerWidth * dpr), hgt = Math.round(window.innerHeight * dpr);
  if (platno.width !== w || platno.height !== hgt) { platno.width = w; platno.height = hgt; }
}

function kresliSud(x, z, y, pivo, prazdny, sCouplerem) {
  kresli(SITE.sud, M4.posun(x, y, z), textury.chrom, prazdny ? NEREZ_PRAZDNY : NEREZ, 0.22);
  if (pivo) kresli(SITE.valec, M4.krat(M4.posun(x, y + 0.24, z), M4.meritko(0.346, 0.09, 0.346)), null, pivo._pruh);
  if (sCouplerem) {
    kresliKostku(x, y + 0.66, z, 0.09, 0.06, 0.09, CERNA);
    kresliKostku(x + 0.05, y + 0.7, z, 0.1, 0.015, 0.02, CERNA);
  }
}

function kresliSvet(cas) {
  const P = SVET.pult.y;
  // výčepní páky se štítky a sklenice pod kohouty
  const zOblouku = (SVET.vezZ + SVET.kohoutZ) / 2;
  kohouty.forEach((k) => {
    if (!jeNaCepu(k.pivo)) return;
    // páka na vršku oblouku: při čepování se překlopí k výčepnímu
    const zaklad = M4.retez(M4.posun(k.x, P + 0.415, zOblouku), M4.rotX(-0.6 * k.packa));
    kresli(SITE.valec, M4.retez(zaklad, M4.meritko(0.034, 0.03, 0.034)), textury.chrom, rgba(BARVY_SVETA.chrom), 0.3);
    kresli(SITE.pakaSit, M4.retez(zaklad, M4.posun(0, 0.025, 0)), null, k.pivo._packa, 0.08);
    kresli(SITE.koule, M4.retez(zaklad, M4.posun(0, 0.205, 0), M4.meritko(0.036, 0.036, 0.036)), null, k.pivo._pruh, 0.1);
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
  // čisté sklenice v regálu (dnem vzhůru)
  const reg = SVET.regal;
  for (let i = 0; i < Math.min(cisteSklenice, 36); i++) {
    const sl = i % 12, ra = Math.floor(i / 12);
    const typ = ['pulitr', 'valec', 'pulitr', 'pohar'][(sl + ra) % 4];
    const vyska = TVARY_SKLENIC[typ].vyskaSkla;
    pruhledne.push({ sit: SITE.sklo[typ], hladke: typ !== 'pulitr', m: M4.retez(M4.posun(reg.x0 + 0.09 + sl * 0.14, SVET.zadniPult.y + 0.033 + vyska, 0.14 + ra * 0.13), M4.rotX(Math.PI)) });
  }
  // prázdné (nebo nedopité) sklenice po hostech
  spinave.forEach((s) => {
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
    kresliSud(SVET.sudX(i), SVET.sudZ, 0.12, p, s.zbyva <= 0, true);
    if (s.zbyva <= 3) {
      const blik = s.zbyva <= 0 ? (Math.sin(cas * 8) > 0 ? 1 : 0.3) : 0.8;
      kresli(SITE.koule, M4.retez(M4.posun(SVET.sudX(i), 0.86, SVET.sudZ), M4.meritko(0.022, 0.022, 0.022)), null, s.zbyva <= 0 ? rgba([1, 0.15, 0.1]) : rgba([1, 0.65, 0.1]), blik);
    }
  });
  let slot = 0;
  PIVA.forEach((p) => {
    if (!jeNaCepu(p)) return;
    for (let j = 0; j < sud(p.id).zasoba && slot < 16; j++, slot++) {
      const vrstva = Math.floor(slot / 8), poz = slot % 8;
      kresliSud(12.45 + (poz % 4) * 0.4, 2.02 + Math.floor(poz / 4) * 0.36, 0.14 + vrstva * 0.62, p, false, false);
    }
  });
  for (let i = 0; i < Math.min(HRA.prazdneSudy || 0, 6); i++) kresliSud(11.38 + (i % 3) * 0.36, 2.15 + Math.floor(i / 3) * 0.3, 0.01, null, true, false);
  // dveře + cedulka
  const D = SVET.hloubka, dv = SVET.dvere;
  const dvereM = M4.retez(M4.posun(dv.x0, 0, D + 0.075), M4.rotY(dvere.uhel));
  kresli(SITE.kostka, M4.retez(dvereM, M4.posun((dv.x1 - dv.x0) / 2, dv.vyska / 2, 0), M4.meritko(dv.x1 - dv.x0 - 0.02, dv.vyska - 0.02, 0.06)), textury.drevo, rgba([0.75, 0.52, 0.36]));
  kresli(SITE.kostka, M4.retez(dvereM, M4.posun(1.05, 1.0, -0.05), M4.meritko(0.12, 0.03, 0.04)), null, rgba([0.85, 0.68, 0.25]));
  kresli(SITE.ctverec, M4.retez(dvereM, M4.posun(SVET.cedule.x - dv.x0, SVET.cedule.y, -0.032), M4.rotY(Math.PI), M4.meritko(0.5, 0.19, 1)),
    textury.atlas, null, 0.3, HRA.otevreno ? ATLAS.otevreno : ATLAS.zavreno);
  // ručičky hodin podle skutečného času
  const ted = new Date();
  const ruc = (uhel, delka, tloustka) => kresli(SITE.kostka, M4.retez(M4.posun(SVET.sirka - 0.06, 2.45, 9.25), M4.rotX(uhel), M4.posun(0, delka / 2, 0), M4.meritko(0.01, delka, tloustka)), null, CERNA);
  ruc(((ted.getHours() % 12) + ted.getMinutes() / 60) / 12 * Math.PI * 2, 0.11, 0.022);
  ruc((ted.getMinutes() + ted.getSeconds() / 60) / 60 * Math.PI * 2, 0.17, 0.014);
  // televize a jukebox
  if (HRA.vylepseni.televize) kresli(SITE.ctverec, M4.retez(M4.posun(SVET.sirka - 0.105, 2.15, 6.0), M4.rotY(-Math.PI / 2), M4.meritko(1.42, 0.72, 1)), textury.tv, null, 0.9);
  if (HRA.vylepseni.jukebox) {
    const b = [0.5 + 0.5 * Math.sin(cas * 3), 0.5 + 0.5 * Math.sin(cas * 3 + 2), 0.5 + 0.5 * Math.sin(cas * 3 + 4)];
    kresli(SITE.kostka, M4.krat(M4.posun(0.29, 1.5, 7.0), M4.meritko(0.5, 0.1, 0.78)), null, rgba(b), 1);
  }
  // hosté, jejich piva a pomocník
  hoste.forEach((h) => kresliPostavu(h, cas));
  if (pomocnik) kresliPostavu(pomocnik, cas);
  hoste.forEach((h) => {
    if (!h.piva.length || !h.misto) return;
    const aktivni = h.piva.findIndex((x) => x.zbyva > 0);
    h.piva.forEach((pv, i) => {
      const pivo = najdiPivo(pv.id);
      if (i === aktivni && h.napiti > 0.4) {
        kresliSklenici(h._ruka[0], h._ruka[1] - 0.09, h._ruka[2], pv.zbyva * (pv.plneni || 90), pivo, { otoceni: h.natoceni });
        return;
      }
      const s = h.misto.sklenice;
      kresliSklenici(s.x + i * 0.11, s.y, s.z, pv.zbyva * (pv.plneni || 90), pivo, { zbytek: pv.zbyva <= 0, otoceni: h.natoceni - Math.PI / 2 });
    });
  });
  if (pomocnik && pomocnik.nese) {
    for (let i = 0; i < Math.min(pomocnik.nese, 4); i++) kresliSklenici(pomocnik._ruka[0], pomocnik._ruka[1] - 0.09 + i * 0.05, pomocnik._ruka[2], 0, null, { zbytek: i === 0 });
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
  gl.clear(gl.DEPTH_BUFFER_BIT);
  const oko = polohaOci();
  const kyv = Math.sin(hrac.houpani) * 0.012 * hrac.jde;
  const kamera = M4.retez(M4.posun(oko[0], oko[1], oko[2]), M4.rotY(hrac.yaw), M4.rotX(hrac.pitch));
  const bod = (x, y, z) => M4.bod(kamera, x, y, z);
  const kuze = rgba([0.93, 0.76, 0.62]);
  const rukav = rgba([0.92, 0.9, 0.86]);
  // ruka s kouskem rukávu bílé košile; strana 1 = pravá, -1 = levá
  const ruka = (x, y, z, strana = 1) => {
    const m = M4.retez(kamera, M4.posun(x, y, z), M4.rotX(0.5), M4.rotY(-0.4 * strana));
    kresli(SITE.kostka, M4.retez(m, M4.meritko(0.045, 0.05, 0.12)), null, kuze);
    kresli(SITE.kostka, M4.retez(m, M4.posun(0, -0.005, 0.12), M4.meritko(0.07, 0.07, 0.14)), null, rukav);
  };
  const naTacu = HRA.vylepseni.tac && ruce.piva.length > 2;
  // na úzkém displeji (telefon na výšku) drž věci blíž středu, ať jsou vidět
  const bok = 0.2 * omez(platno.width / platno.height / 1.5, 0.45, 1);
  if (ruce.piva.length && !naTacu) {
    // v každé ruce jeden půllitr
    ruce.piva.forEach((pv, i) => {
      const strana = i === 0 ? 1 : -1;
      const p = bod(bok * strana, -0.27 + kyv, -0.44);
      kresliSklenici(p[0], p[1], p[2], pv.plneni || 90, najdiPivo(pv.id), { otoceni: hrac.yaw });
      ruka((bok + 0.085) * strana, -0.21 + kyv, -0.42, strana);
    });
  } else if (ruce.piva.length) {
    kresli(SITE.valec, M4.retez(kamera, M4.posun(0.1, -0.345 + kyv, -0.62), M4.meritko(0.42, 0.012, 0.32)), textury.chrom, rgba([0.75, 0.77, 0.8]), 0.2);
    ruce.piva.forEach((pv, i) => {
      const p = bod(-0.005 + (i % 3) * 0.1, -0.339 + kyv, -0.57 - Math.floor(i / 3) * 0.1);
      kresliSklenici(p[0], p[1], p[2], pv.plneni || 90, najdiPivo(pv.id), { otoceni: hrac.yaw });
    });
    ruka(0.3, -0.365 + kyv, -0.55);
  } else {
    // prázdné sklenice v komínku – napřed v pravé, pak v levé ruce
    ruce.sklenice.forEach((id, i) => {
      const strana = i < 5 ? 1 : -1;
      const p = bod(bok * strana, -0.31 + kyv + (i % 5) * 0.035, -0.46);
      kresliSklenici(p[0], p[1], p[2], 0, null, { typ: (najdiPivo(id) || PIVA[0]).sklo, zbytek: i % 5 === 0, otoceni: hrac.yaw });
    });
    ruka(bok + 0.085, -0.25 + kyv, -0.44);
    if (ruce.sklenice.length > 5) ruka(-bok - 0.085, -0.25 + kyv, -0.44, -1);
  }
  kresliPruhledne();
}

function vykresliSnimek(cas) {
  velikostPlatna();
  gl.viewport(0, 0, platno.width, platno.height);
  gl.clearColor(0.07, 0.045, 0.03, 1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  aktualniSit = null;
  aktualniTextura = null;
  aktualniEfekt = -1;
  pocetKresleni = 0;
  const pomer = platno.width / platno.height;
  const fov = omez(2 * Math.atan(Math.tan(Math.PI / 4) / pomer), 0.95, 1.72);
  matProj = M4.perspektiva(fov, pomer, 0.04, 60);
  let oko, yaw, pitch;
  if (REZIM === 'menu') {
    const t = cas * 0.07;
    oko = [7 + Math.sin(t) * 3.2, 2.0, 7.2 + Math.cos(t) * 0.9];
    yaw = Math.PI * 0.02 + Math.sin(t) * 0.35;
    pitch = -0.12;
  } else {
    oko = polohaOci();
    yaw = hrac.yaw;
    pitch = hrac.pitch;
  }
  matPohled = M4.retez(M4.rotX(-pitch), M4.rotY(-yaw), M4.posun(-oko[0], -oko[1], -oko[2]));
  matPP = M4.krat(matProj, matPohled);
  gl.uniformMatrix4fv(loc.uProj, false, matProj);
  gl.uniformMatrix4fv(loc.uPohled, false, matPohled);
  gl.uniform3f(loc.uOkoli, 0.36, 0.28, 0.22);
  gl.uniform3f(loc.uMlhaBarva, 0.07, 0.045, 0.03);
  gl.uniform1f(loc.uMlha, 0.03);
  gl.uniform1f(loc.uCas, cas % 1000);
  nastavSvetla(svetla);

  staticke.forEach((s) => kresli(s.sit, JEDNOTKOVA, textury[s.tex]));
  // stíny pod lidmi
  gl.enable(gl.BLEND);
  gl.depthMask(false);
  hoste.forEach((x) => { if (x.sedi < 0.5) kresliStin(x.x, x.z, 0.26); });
  if (pomocnik) kresliStin(pomocnik.x, pomocnik.z, 0.26);
  gl.depthMask(true);
  gl.disable(gl.BLEND);

  kresliSvet(cas);
  kresliPruhledne();
  if (REZIM !== 'menu') kresliRuce();
}

// Kam na obrazovku padne bod ve světě (pro bubliny); null = za kamerou
function promitni(x, y, z) {
  const b = M4.bod(matPP, x, y, z);
  if (b[3] <= 0.05) return null;
  return { x: (b[0] / b[3] * 0.5 + 0.5) * window.innerWidth, y: (1 - (b[1] / b[3] * 0.5 + 0.5)) * window.innerHeight, hloubka: b[3] };
}
/* =========================================================
   19) ULOŽENÍ POSTUPU (localStorage)
   ========================================================= */
function vychoziHra() {
  return {
    penize: 0, natoceno: 0, obslouzeno: 0, hostu: 0, perfektnich: 0, prelito: 0, odesli: 0, umyto: 0, serie: 0, nejSerie: 0,
    hodnoceni: 3.5, vylepseni: {}, odemcena: [], sudy: {}, prazdneSudy: 0,
    nastaveni: { citlivost: 1, zvuk: true }, navod: { kniha: false }, otevreno: false
  };
}
function nactiHru() {
  const v = vychoziHra();
  try {
    const data = JSON.parse(localStorage.getItem(NASTAVENI.klicUlozeni));
    if (data && typeof data === 'object') {
      return { ...v, ...data, vylepseni: { ...(data.vylepseni || {}) }, sudy: { ...(data.sudy || {}) }, odemcena: [...(data.odemcena || [])],
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
const zvuk = {
  ctx: null, hlavni: null, sum: null, cep: null,
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
  ton(f, delka, typ = 'sine', hlas = 0.3, zpozdeni = 0, f2 = null) {
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
    o.connect(g); g.connect(this.hlavni);
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
  cink() { this.ton(2200, 0.18, 'sine', 0.12); this.ton(3300, 0.12, 'sine', 0.06, 0.02); },
  kasa() { this.ton(1600, 0.25, 'triangle', 0.15); this.ton(2400, 0.35, 'sine', 0.13, 0.08); },
  klik() { this.ton(800, 0.06, 'square', 0.06); },
  chyba() { this.ton(180, 0.25, 'sawtooth', 0.1, 0, 120); },
  voda() { this.sumik(0.7, 1200, 0.25, 0.7); },
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

function aktualizujHUD() {
  nastavText(ui.penize, String(ceskaMena(HRA.penize)));
  nastavText(ui.piva, String(HRA.natoceno));
  nastavText(ui.hvezdy, String(hvezdy(HRA.hodnoceni)));
  nastavText(ui.hvezdyCislo, String(HRA.hodnoceni.toFixed(1)));
  nastavText(ui.stav, String(HRA.otevreno ? 'OTEVŘENO' : 'ZAVŘENO'));
  ui.stav.classList.toggle('zavreno', !HRA.otevreno);
  nastavText(ui.sklenice, String(`${cisteSklenice} / ${kapacitaRegalu()}`));
  ui.skleniceBox.classList.toggle('malo', cisteSklenice <= 2);
  // výzva u zaměřovače
  const text = popisCile(cil);
  ui.vyzva.hidden = !text;
  if (text) nastavText(ui.vyzvaText, String(text));
  ui.prubeh.hidden = !narazeni;
  if (narazeni) ui.prubehPln.style.width = Math.min(100, narazeni.cas / 1.3 * 100) + '%';
  ui.zamerovac.classList.toggle('na-cili', Boolean(cil));
  ui.akce.classList.toggle('aktivni', Boolean(cil));
  nastavText(ui.akceText, String(cil ? ({ kohout: 'Čepovat', host: 'Obsloužit', spinava: 'Sebrat', drez: 'Umýt', kniha: 'Kniha', cedule: 'Otočit', regal: 'Regál', sud: 'Narazit', paleta: 'Sudy' })[cil.typ] : 'Akce'));
  // co neseš
  if (ruce.piva.length) {
    ui.ruce.hidden = false;
    nastavText(ui.ruce, String('🍺 Neseš: ' + ruce.piva.map((p) => najdiPivo(p.id).kratce + ' ' + HODNOCENI[p.kvalita].kratce).join(', ')));
  } else if (ruce.sklenice.length) {
    ui.ruce.hidden = false;
    nastavText(ui.ruce, String(`🥛 Prázdné sklenice: ${ruce.sklenice.length} / ${unosnostSklenic()} – odnes je do dřezu`));
  } else {
    ui.ruce.hidden = true;
  }
  // sudy, které docházejí
  const varovani = PIVA.filter((p) => jeNaCepu(p) && sud(p.id).zbyva <= 3).map((p) => {
    const s = sud(p.id);
    return { text: s.zbyva <= 0 ? `🛢️ ${p.kratce}: prázdný sud!` : `🛢️ ${p.kratce}: zbývá ${s.zbyva}`, prazdny: s.zbyva <= 0, bezZasoby: s.zasoba <= 0 };
  });
  const klicSudu = JSON.stringify(varovani) + dodavky.length;
  if (ui.sudy._klic !== klicSudu) {
    ui.sudy._klic = klicSudu;
    ui.sudy.replaceChildren(...varovani.map((v) => h('div', { class: 'sud-varovani' + (v.prazdny ? ' prazdny' : '') }, v.text, v.bezZasoby ? h('small', {}, 'žádná zásoba – objednej v knize') : null)),
      ...(dodavky.length ? [h('div', { class: 'sud-varovani dovoz' }, `🚚 Veze se ${dodavky.length} ${dodavky.length === 1 ? 'sud' : dodavky.length < 5 ? 'sudy' : 'sudů'}`)] : []));
  }
  // cíl z návodu
  const cilNavodu = textNavodu();
  ui.cil.hidden = !cilNavodu;
  if (cilNavodu) nastavText(ui.cil, String(cilNavodu));
  aktualizujMericko();
  aktualizujObjednavky();
}

function aktualizujMericko() {
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
  return Object.entries(pocty).map(([id, n]) => `${n.hotovo === n.celkem ? '✓ ' : ''}${najdiPivo(id).kratce}${n.celkem > 1 ? ' ×' + n.celkem : ''}`).join(' · ');
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
    nastavText(prvek.children[1], parta.stav === 'vola' ? 'chce objednat' : parta.stav === 'plati' ? `chce platit · ${parta.utrata + parta.dysko} Kč` : cipyObjednavky(parta));
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
  hoste.forEach((host) => {
    const b = textBubliny(host);
    if (!b) return;
    const vyska = (host.sedi > 0.5 ? (host.sedadloTyp === 'stolicka' ? 1.95 : 1.65) : 2.0) * host.vzhled.vyska;
    const bod = promitni(host.x, vyska, host.z);
    if (!bod || bod.x < -100 || bod.x > window.innerWidth + 100 || bod.y < -60 || bod.hloubka > 13) return;
    const stav = host.parta.stav;
    const zadost = host === host.parta.mluvci && ['vola', 'ceka_pivo', 'plati'].includes(stav);
    // obyčejné povídání u vzdálených stolů nezobrazuj, ať obrazovka nezahltí
    if (!zadost && bod.hloubka > 7.5) return;
    zobrazit.add(host);
    let prvek = bublinyPrvky.get(host);
    if (!prvek) {
      prvek = h('div', { class: 'bublina' }, h('b'), h('span'), h('div', { class: 'cipy' }));
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
function zkontrolujNavod() { /* stav návodu se počítá průběžně v textNavodu() */ }

function textNavodu() {
  if (!HRA.otevreno) return party.length ? '🔒 Zavřeno – hosté dopíjejí. Otevřeš cedulkou na dveřích.' : NAVOD.otevrit;
  const prazdny = PIVA.find((p) => jeNaCepu(p) && sud(p.id).zbyva <= 0);
  if (prazdny && party.some((pa) => pa.stav === 'ceka_pivo' && zbyvaDonest(pa).some((x) => x.pivo === prazdny.id))) {
    return sud(prazdny.id).zasoba > 0 ? `🛢️ Došel sud ${prazdny.nazev}! Jdi do skladu za barem a narazi nový` : `📖 Došel ${prazdny.nazev} a nemáš zásobu – objednej sud v knize (Sklad)`;
  }
  if (HRA.obslouzeno === 0) {
    if (ruce.piva.length) return NAVOD.podej;
    if (cepuje) return '🎯 Pusť, až bude vršek pěny v zelené zóně';
    const vola = party.find((p) => p.stav === 'vola');
    const ceka = party.find((p) => p.stav === 'ceka_pivo');
    if (ceka) return zaPultem() ? NAVOD.cepuj : (ceka.kde === 'bar' ? NAVOD.bar : '🎯 Objednávku máš – jdi za pult a načepuj');
    if (vola) return NAVOD.vola;
    return NAVOD.cekej;
  }
  if (party.some((p) => p.stav === 'plati') && !HRA.navod.platil) return NAVOD.plati;
  if (casHry - nemajiKamCas < 8) return '🧽 Noví hosté nemají kam si sednout – ukliď prázdné sklenice ze stolů a z pultu';
  if (cisteSklenice === 0 && !ruce.sklenice.length && (spinave.length || !pomocnik)) return '🍺 Došly čisté sklenice! Posbírej prázdné po hostech a umyj je v dřezu';
  if (ruce.sklenice.length >= unosnostSklenic()) return '🧽 Máš plné ruce sklenic – odnes je do dřezu za pultem';
  if (!HRA.navod.kniha && HRA.penize >= 150) return NAVOD.kniha;
  if (!HRA.umyto && spinave.length && !pomocnik) return NAVOD.sklenice;
  return '';
}

// Kam ukazuje žlutý kosočtverec
function ukazatelNavodu() {
  if (REZIM === 'menu') return null;
  if (!HRA.otevreno && !party.length) return [SVET.cedule.x, SVET.cedule.y + 0.05, SVET.cedule.z - 0.15];
  const prazdny = PIVA.findIndex((p) => jeNaCepu(p) && sud(p.id).zbyva <= 0 && sud(p.id).zasoba > 0);
  if (prazdny >= 0 && party.some((pa) => pa.stav === 'ceka_pivo' && zbyvaDonest(pa).some((x) => x.pivo === PIVA[prazdny].id))) {
    return veSkladu() ? [SVET.sudX(prazdny), 0.95, SVET.sudZ] : [SVET.prepazka, 2.1, (SVET.sklad.dvereZ0 + SVET.sklad.dvereZ1) / 2];
  }
  if (HRA.obslouzeno === 0) {
    const vola = party.find((p) => p.stav === 'vola');
    const ceka = party.find((p) => p.stav === 'ceka_pivo');
    if (ceka && ruce.piva.length) return [ceka.mluvci.x, 1.9, ceka.mluvci.z];
    if (ceka) {
      if (!zaPultem()) return [SVET.pult.x1 + 0.6, 1.6, 2.35];
      const k = kohouty.find((x) => x.pivo.id === zbyvaDonest(ceka)[0].pivo);
      return [k.x, SVET.pult.y + 0.62, SVET.kohoutZ];
    }
    if (vola) return [vola.mluvci.x, 1.9, vola.mluvci.z];
    return null;
  }
  if (ruce.sklenice.length) return [SVET.drez.x, 1.25, SVET.drez.z];
  if (!HRA.navod.kniha && HRA.penize >= 150) return [SVET.kniha.x, SVET.pult.y + 0.3, SVET.kniha.z];
  if ((!HRA.umyto || cisteSklenice === 0 || casHry - nemajiKamCas < 8) && spinave.length && !pomocnik) {
    const s = spinave.reduce((a, b) => (vzdalenost(hrac.x, hrac.z, a.x, a.z) < vzdalenost(hrac.x, hrac.z, b.x, b.z) ? a : b));
    return [s.x, s.y + 0.2, s.z];
  }
  return null;
}
/* =========================================================
   22) KNIHA VYLEPŠENÍ (a objednávky sudů)
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

function tlacitkoKoupit(cena, akce, hotovo, textHotovo = '✔ Hotovo') {
  if (hotovo) return h('button', { type: 'button', class: 'btn-kniha hotovo', disabled: true }, textHotovo);
  if (HRA.penize < cena) return h('button', { type: 'button', class: 'btn-kniha', disabled: true }, `${ceskaMena(cena)} · chybí ${ceskaMena(cena - HRA.penize)}`);
  return h('button', { type: 'button', class: 'btn-kniha koupit', onclick: akce }, `Koupit za ${ceskaMena(cena)}`);
}

function kartaVylepseni(v) {
  const uroven = urovenVylepseni(v);
  const max = v.ceny.length;
  const tecky = h('div', { class: 'tecky', 'aria-label': `Úroveň ${uroven} z ${max}` },
    Array.from({ length: max }, (_, i) => h('span', { class: i < uroven ? 'plna' : null })));
  return h('div', { class: 'vylepseni' + (uroven >= max ? ' plne' : '') },
    h('div', { class: 'vyl-ikona', 'aria-hidden': 'true' }, v.ikona),
    h('div', { class: 'vyl-text' }, h('h4', {}, v.nazev), h('p', {}, v.popis), tecky),
    tlacitkoKoupit(v.ceny[uroven], () => kupVylepseni(v), uroven >= max));
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

function vykresliKnihu() {
  $('kniha-penize').textContent = ceskaMena(HRA.penize);
  document.querySelectorAll('.zalozka').forEach((z) => z.classList.toggle('aktivni', z.dataset.kat === zalozka));
  const leva = $('kniha-leva');
  const prava = $('kniha-prava');
  if (zalozka === 'zaznamy') {
    const radky = [
      ['🍺 Natočeno piv', HRA.natoceno], ['🙋 Obslouženo piv', HRA.obslouzeno], ['😊 Spokojení hosté', HRA.hostu],
      ['⭐ Hodnocení hospody', `${HRA.hodnoceni.toFixed(1)} z 5`], ['🌟 Perfektní hladinky', HRA.perfektnich], ['🔥 Nejdelší série', HRA.nejSerie],
      ['💦 Přelitá piva', HRA.prelito], ['😤 Naštvaní hosté', HRA.odesli], ['🧽 Umyté sklenice', HRA.umyto], ['💰 V kase', ceskaMena(HRA.penize)]
    ];
    leva.replaceChildren(h('h2', {}, 'Záznamy hospody'),
      h('table', { class: 'zaznamy' }, h('tbody', {}, radky.map(([a, b]) => h('tr', {}, h('th', { scope: 'row' }, a), h('td', {}, String(b)))))),
      h('p', { class: 'poznamka' }, 'Hodnocení stoupá, když točíš pěkné hladinky a hosté nečekají dlouho. Čím víc hvězd, tím víc hostů a větší dýško.'));
    prava.replaceChildren(h('h2', {}, 'Na čepu'),
      ...PIVA.map((p) => h('div', { class: 'pivo-radek' + (jeNaCepu(p) ? '' : ' zamcene') }, vzorekPiva(p),
        h('div', {}, h('h4', {}, `${p.nazev} · ${p.cena} Kč${jeNaCepu(p) ? '' : ' · 🔒'}`), h('p', {}, p.popis)))),
      h('p', { class: 'poznamka' }, 'Stupně (10°, 12°, 15°) neudávají alkohol, ale extrakt původní mladiny. Desítka je výčepní pivo, dvanáctka ležák a patnáctka speciál.'),
      h('p', { class: 'pripominka' }, '🍺 Ve hře pivo čepuješ, nepiješ. Ve skutečnosti pij s rozumem, prokládej pivo vodou a po alkoholu nikdy za volant.'));
    return;
  }
  if (zalozka === 'sklad') {
    leva.replaceChildren(h('h2', {}, 'Sklad sudů'),
      h('p', { class: 'poznamka' }, 'Když sud dojde, jdi do skladu za barem a narazi nový. Náhradní sudy tady objednáš – přivezou je za chvíli.'),
      ...PIVA.filter(jeNaCepu).map(radekSudu));
    const zamcena = PIVA.filter((p) => !jeNaCepu(p));
    prava.replaceChildren(h('h2', {}, 'Nová piva a sklad'),
      ...zamcena.map(kartaNovehoPiva),
      ...VYLEPSENI.filter((v) => v.kat === 'sklad').map(kartaVylepseni));
    return;
  }
  const seznam = VYLEPSENI.filter((v) => v.kat === zalozka);
  const pul = Math.ceil(seznam.length / 2);
  const nadpis = zalozka === 'vycep' ? 'Za pultem' : 'Hospoda';
  const uvod = zalozka === 'vycep' ? 'Lepší kohouty, jistější ruka a tác – ať stihneš víc piv.' : 'Víc stolů, hudba a hokej přitáhnou víc hostů.';
  leva.replaceChildren(h('h2', {}, nadpis), h('p', { class: 'poznamka' }, uvod), ...seznam.slice(0, pul).map(kartaVylepseni));
  prava.replaceChildren(...seznam.slice(pul).map(kartaVylepseni));
}

function kupVylepseni(v) {
  const uroven = urovenVylepseni(v);
  const cena = v.ceny[uroven];
  if (cena === undefined || HRA.penize < cena) return;
  HRA.penize -= cena;
  HRA.vylepseni[v.id] = uroven + 1;
  HRA.navod.kniha = true;
  if (v.id === 'sklenice') cisteSklenice += 6;
  if (['stul', 'jukebox', 'televize'].includes(v.id)) prestavHospodu();
  ulozHru();
  zvuk.kasa();
  vykresliKnihu();
  ukazToast(`✅ ${v.nazev}${v.ceny.length > 1 ? ' – úroveň ' + (uroven + 1) : ''}`);
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
   23) MENU, PAUZA, NÁPOVĚDA
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

function aktualizujTlacitkoZvuku() {
  $('btn-zvuk').textContent = HRA.nastaveni.zvuk ? '🔊' : '🔇';
  $('btn-zvuk-pauza').textContent = HRA.nastaveni.zvuk ? '🔊 Zvuk zapnutý' : '🔇 Zvuk vypnutý';
}

function prepniZvuk() {
  HRA.nastaveni.zvuk = !HRA.nastaveni.zvuk;
  zvuk.start();
  zvuk.nastavHlasitost();
  aktualizujTlacitkoZvuku();
  ulozHru();
}

function pripravUI() {
  ['toast', 'hodnoceni', 'plovouci', 'bubliny', 'objednavky', 'zamerovac', 'mericko'].forEach((id) => { ui[id] = $(id); });
  Object.assign(ui, {
    penize: $('hud-penize'), piva: $('hud-piva'), stav: $('hud-stav'), sklenice: $('hud-sklenice'), skleniceBox: $('hud-sklenice-box'),
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
}
/* =========================================================
   23) START A HLAVNÍ SMYČKA
   ========================================================= */
let posledniCas = 0;
let casTV = 0;
let casUlozeni = 0;
let samaSimulace = true; // testy si můžou simulaci krokovat samy

// Jeden krok hry (pohyb, hosté, čepování…)
function krokSimulace(dt) {
  casHry += dt;
  aktualizujHrace(dt);
  aktualizujHosty(dt);
  aktualizujCepovani(dt);
  aktualizujPomocnika(dt);
  aktualizujDvere(dt);
  cil = najdiCil();
  casUlozeni += dt;
  if (casUlozeni > 15) { casUlozeni = 0; ulozHru(); }
}

function smycka(ms) {
  const t = ms / 1000;
  const dt = Math.min(0.05, Math.max(0, t - posledniCas)) || 0.016;
  posledniCas = t;
  if (REZIM === 'hra' && samaSimulace) krokSimulace(dt);
  if (HRA.vylepseni.televize && REZIM !== 'pauza') {
    casTV += dt;
    if (casTV > 0.1) { aktualizujTV(casTV); casTV = 0; }
  }
  zmerVykon(dt);
  vykresliSnimek(t);
  if (REZIM !== 'menu') {
    aktualizujHUD();
    aktualizujBubliny();
    $('klikni').hidden = !(REZIM === 'hra' && !vstup.dotykove && !vstup.zamceno);
  }
  requestAnimationFrame(smycka);
}

function init() {
  if (!gl) {
    $('menu-info').textContent = '😢 Tenhle prohlížeč neumí WebGL, takže 3D hospoda nepůjde spustit. Zkus aktuální Chrome, Edge, Firefox nebo Safari.';
    $('btn-hrat').disabled = true;
    return;
  }
  pripravGL();
  vytvorZakladniSite();
  vytvorTextury();
  pripravSvetla();
  postavSvet();
  cisteSklenice = kapacitaRegalu();
  // sudy, které byly při minulé hře na cestě
  if (Array.isArray(HRA.dodavky)) HRA.dodavky.forEach((d) => { if (d && najdiPivo(d.id)) dodavky.push({ id: d.id, za: Math.min(d.za || 0, NASTAVENI.dovozSudu), platitPriDovozu: Boolean(d.platitPriDovozu) }); });
  delete HRA.dodavky;
  pripravUI();
  nastavOvladaniHrace();
  platno.addEventListener('pointerdown', (e) => { if (e.pointerType === 'touch') prepniNaDotyk(); });
  requestAnimationFrame(smycka);
}

init();
