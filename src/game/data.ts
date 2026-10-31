import type { BackgroundId, Effects, FocusDef, GameEvent, PartyId, RegionDef } from "./types";

export const START_DATE = "2000-01-01";
export const END_DATE = "2004-12-31";
export const MAJORITY = 101;
export const DEBT_BRAKE = 0.55;

export const PARTIES: Record<PartyId, { name: string; short: string; color: string }> = {
  cssd: { name: "Česká strana sociálně demokratická", short: "ČSSD", color: "var(--party-cssd)" },
  ods: { name: "Občanská demokratická strana", short: "ODS", color: "var(--party-ods)" },
  kscm: { name: "Komunistická strana Čech a Moravy", short: "KSČM", color: "var(--party-kscm)" },
  kdu: { name: "KDU-ČSL", short: "KDU-ČSL", color: "var(--party-kdu)" },
  us: { name: "Unie svobody – DEU", short: "US-DEU", color: "var(--party-us)" },
};
export const PARTY_IDS = Object.keys(PARTIES) as PartyId[];

export const POSITIONS = [
  { title: "Řadový poslanec", seniority: 0, pp: 0, needsGov: false },
  { title: "Předseda výboru", seniority: 20, pp: 40, needsGov: false },
  { title: "Ministr", seniority: 40, pp: 90, needsGov: true },
  { title: "Předseda strany", seniority: 60, pp: 140, needsGov: false },
  { title: "Premiér", seniority: 75, pp: 200, needsGov: true },
];

export const BACKGROUNDS: Record<
  BackgroundId,
  { name: string; desc: string; stats: Partial<Record<"charisma" | "intrigue" | "economy" | "integrity", number>>; account: number; blackFund: number; seniority: number; heat: number }
> = {
  dravec: {
    name: "Dravec z 90. let",
    desc: "Privatizace, kontakty na kmotry, černé peníze. Rychlý start, vysoké riziko kauz.",
    stats: { intrigue: 15, economy: 5, integrity: -20 },
    account: 3,
    blackFund: 8,
    seniority: 5,
    heat: 15,
  },
  pravnik: {
    name: "Právník / Akademik",
    desc: "Bonus k legislativě a čistému štítu. V zákulisí působí jako ztracené dítě.",
    stats: { economy: 10, integrity: 20, intrigue: -10 },
    account: 1.5,
    blackFund: 0,
    seniority: 5,
    heat: 0,
  },
  patriot: {
    name: "Regionální patriot / Starosta",
    desc: "Silná podpora v domovském kraji, v Praze vás nikdo nezná.",
    stats: { charisma: 10, integrity: 5 },
    account: 1,
    blackFund: 1,
    seniority: 8,
    heat: 3,
  },
  aparatcik: {
    name: "Stranický aparátčík",
    desc: "Rychlý růst seniority, ale bez předsedy jste nikdo.",
    stats: { intrigue: 5, charisma: -5 },
    account: 0.8,
    blackFund: 1,
    seniority: 18,
    heat: 5,
  },
};

const s = (cssd: number, ods: number, kscm: number, kdu: number, us: number) => ({ cssd, ods, kscm, kdu, us });

export const REGIONS: RegionDef[] = [
  { id: "pha", name: "Hlavní město Praha", short: "PHA", col: 2, row: 1, pop: 1.18, unemployment: 3.6, gdpIdx: 210, boss: "Ing. Tomáš „Developer“ Kalous", support: s(20, 38, 9, 6, 17), infra: ["Metro D", "Letiště"] },
  { id: "stc", name: "Středočeský", short: "STČ", col: 1, row: 1, pop: 1.12, unemployment: 7.1, gdpIdx: 85, boss: "JUDr. Pavel Mrázek", support: s(28, 30, 15, 8, 9), infra: ["D1", "Škoda MB"] },
  { id: "jc", name: "Jihočeský", short: "JHČ", col: 1, row: 2, pop: 0.63, unemployment: 6.2, gdpIdx: 87, boss: "Václav Hrubeš", support: s(29, 27, 15, 12, 7), infra: ["Temelín"] },
  { id: "plz", name: "Plzeňský", short: "PLZ", col: 0, row: 2, pop: 0.55, unemployment: 6.4, gdpIdx: 92, boss: "Ing. Jiří Šrámek", support: s(30, 30, 15, 8, 8), infra: ["Škoda Plzeň", "D5"] },
  { id: "kv", name: "Karlovarský", short: "KVK", col: 0, row: 1, pop: 0.3, unemployment: 9.5, gdpIdx: 79, boss: "Rudolf „Lázně“ Ondráček", support: s(30, 26, 20, 5, 7), infra: ["Doly Sokolov"] },
  { id: "ust", name: "Ústecký", short: "ÚST", col: 1, row: 0, pop: 0.82, unemployment: 15.8, gdpIdx: 80, boss: "Miroslav Bárta", support: s(33, 20, 25, 5, 5), infra: ["Doly Most", "Chemopetrol"] },
  { id: "lib", name: "Liberecký", short: "LBK", col: 2, row: 0, pop: 0.43, unemployment: 6.9, gdpIdx: 84, boss: "Petr Skála", support: s(28, 29, 16, 6, 10), infra: ["Textilní závody"] },
  { id: "kh", name: "Královéhradecký", short: "HKK", col: 3, row: 0, pop: 0.55, unemployment: 6.5, gdpIdx: 88, boss: "MUDr. Karel Vondra", support: s(28, 29, 14, 11, 9), infra: ["D11"] },
  { id: "par", name: "Pardubický", short: "PAK", col: 3, row: 1, pop: 0.51, unemployment: 7.8, gdpIdx: 83, boss: "Ing. Oldřich Paleček", support: s(30, 27, 15, 12, 7), infra: ["Synthesia"] },
  { id: "vys", name: "Vysočina", short: "VYS", col: 2, row: 2, pop: 0.52, unemployment: 7.0, gdpIdx: 81, boss: "František Novotný", support: s(29, 23, 15, 18, 6), infra: ["Dukovany"] },
  { id: "jm", name: "Jihomoravský", short: "JHM", col: 3, row: 2, pop: 1.13, unemployment: 9.3, gdpIdx: 90, boss: "Mgr. Robert „Brno“ Šťastný", support: s(30, 24, 13, 17, 8), infra: ["Brněnské výstaviště", "D2"] },
  { id: "olo", name: "Olomoucký", short: "OLK", col: 4, row: 1, pop: 0.64, unemployment: 11.5, gdpIdx: 77, boss: "Zdeněk Hanák", support: s(32, 21, 18, 15, 6), infra: ["Moravia Steel"] },
  { id: "zl", name: "Zlínský", short: "ZLK", col: 4, row: 2, pop: 0.6, unemployment: 8.1, gdpIdx: 82, boss: "Ing. Libor Kubík", support: s(28, 24, 13, 20, 7), infra: ["Barum", "Baťovy závody"] },
  { id: "ms", name: "Moravskoslezský", short: "MSK", col: 5, row: 1, pop: 1.28, unemployment: 15.1, gdpIdx: 85, boss: "Antonín „Ocel“ Pražák", support: s(36, 19, 22, 9, 5), infra: ["Vítkovice", "OKD", "Nová huť"] },
];

// ---- Focus trees ----
export const FOCUSES: FocusDef[] = [
  // Personal
  { id: "frakce", tree: "personal", title: "Budování frakce", desc: "Obědy v Parlamentní restauraci, sliby a láhve slivovice. Získáte věrné poslance.", days: 35, x: 1, y: 0, effects: { seniority: 10, pp: 15 } },
  { id: "media", tree: "personal", title: "Mediální krytí", desc: "Přátelský šéfredaktor bulváru a inzerce pro jeho vydavatelství.", days: 56, x: 0, y: 1, requires: ["frakce"], effects: { heat: -15, account: -1, charisma: 5 } },
  { id: "cez", tree: "personal", title: "Dozorčí rada ČEZ", desc: "Křeslo v dozorčí radě polostátního giganta. Odměny, informace, zakázky.", days: 70, x: 1, y: 1, requires: ["frakce"], effects: { account: 2, heat: 10, flag: "cez", seniority: 5 } },
  { id: "cepro", tree: "personal", title: "Kontakty v Čepro", desc: "Nafta, sklady a „technické ztráty“. Černý fond poroste každý měsíc.", days: 56, x: 2, y: 1, requires: ["frakce"], effects: { heat: 15, integrity: -10, flag: "cepro" } },
  { id: "puc", tree: "personal", title: "Příprava vnitrostranického puče", desc: "Spočítat hlasy, rozdat sliby, počkat na slabou chvíli předsedy.", days: 70, x: 1, y: 2, requires: ["media", "cez"], effects: { flag: "puc_ready", unity: -10 } },
  // National
  { id: "opozicni", tree: "national", title: "Opoziční smlouva", desc: "Velké strany si rozdělí moc. Stabilita za cenu legitimity.", days: 35, x: 1, y: 0, effects: { unity: 10, peace: -6, flag: "opozicni" } },
  { id: "sanace", tree: "national", title: "Sanace bankovního sektoru", desc: "Stát převezme špatné úvěry. Konsolidační agentura zaplatí – a vy taky.", days: 56, x: 0, y: 1, requires: ["opozicni"], effects: { debt: 120, rating: 1, growth: 0.5 }, lagged: { days: 365, effects: { debt: 60 }, text: "Konsolidační agentura odhalila další skryté ztráty: +60 mld. dluhu." } },
  { id: "eu", tree: "national", title: "Přístupová jednání s EU", desc: "Harmonizace legislativy a cesta do Bruselu.", days: 70, x: 1, y: 1, requires: ["opozicni"], vote: { name: "Zákon o harmonizaci s acquis", stance: { cssd: 0.6, ods: 0.25, kscm: -0.6, kdu: 0.7, us: 0.8 } }, effects: { growth: 0.8, peace: 4, flag: "eu" }, failEffects: { peace: -4, pp: -30 } },
  { id: "gripeny", tree: "national", title: "Nákup nadzvukových stíhaček", desc: "Tendr na Gripeny. Lobbisté britské BAE už rezervovali stoly.", days: 56, x: 2, y: 1, requires: ["opozicni"], vote: { name: "Zákon o pořízení letounů", stance: { cssd: 0.4, ods: 0.1, kscm: -0.7, kdu: -0.1, us: -0.5 } }, effects: { debt: 60, blackFund: 5, heat: 15, rating: -1 }, failEffects: { pp: -25, unity: -5 } },
  { id: "reforma", tree: "national", title: "Reforma veřejných financí", desc: "Škrty, vyšší DPH, nespokojené odbory. Bez ní přijde dluhová past.", days: 70, x: 1, y: 2, requires: ["sanace", "eu"], vote: { name: "Zákon o stabilizaci veřejných rozpočtů", stance: { cssd: 0.2, ods: 0.3, kscm: -0.8, kdu: 0.2, us: 0.6 } }, effects: { revenue: 30, spending: -15, peace: -10 }, failEffects: { rating: -1, pp: -40 } },
];

export const focusById = (id: string) => FOCUSES.find((f) => f.id === id)!;

// ---- Events ----
const E = (e: Effects) => e;

export const EVENTS: GameEvent[] = [
  {
    id: "ipb",
    title: "Pád Investiční a poštovní banky",
    date: "2000-06-16",
    text: "V pátek ráno obsadila policie centrálu IPB. Klienti stojí fronty před pobočkami, Nomura hrozí arbitráží. Ministr financí čeká na pokyn.",
    options: [
      { label: "Podpořit nucenou správu a prodej ČSOB", effects: E({ debt: 160, peace: 5, rating: -1 }), lagged: { days: 900, effects: { debt: 40, pp: -20 }, text: "Arbitráž s Nomurou: stát platí další miliardy." } },
      { label: "Nechat banku padnout – trh si poradí", effects: E({ peace: -15, growth: -1, support: { ods: 2, cssd: -3 } }) },
      { label: "Prodat informace o transakcích novinářům", effects: E({ blackFund: 3, heat: 12, pp: 10 }), requires: { intrigue: 40 } },
    ],
  },
  {
    id: "tv_krize",
    title: "Televizní krize",
    date: "2000-12-23",
    text: "Redaktoři ČT obsadili zpravodajskou dispečink a odmítají nového ředitele Hodače. Na Václavském náměstí stojí desetitisíce lidí.",
    options: [
      { label: "Postavit se za stávkující redaktory", effects: E({ peace: 6, pp: -15, charisma: 3, support: { us: 2, kdu: 2 } }) },
      { label: "Hájit Radu ČT a „zákonný postup“", effects: E({ peace: -10, unity: 6, support: { us: -1 } }) },
      { label: "Mlčet a počkat, kdo vyhraje", effects: E({ pp: 5 }) },
    ],
  },
  {
    id: "volby2002",
    title: "Volby do Poslanecké sněmovny 2002",
    date: "2002-06-15",
    text: "Volební místnosti se zavřely. Okrsky sčítají hlasy a rozhoduje se o rozdělení 200 křesel.",
    options: [{ label: "Sledovat výsledky", effects: E({}), special: "election" }],
  },
  {
    id: "povodne",
    title: "Povodně 2002",
    date: "2002-08-12",
    text: "Vltava zaplavila Karlín, Labe stoupá. Starostové žádají okamžitou pomoc a armádu.",
    options: [
      { label: "Mimořádný rozpočet na obnovu", effects: E({ debt: 35, peace: 10, pp: -10 }) },
      { label: "Pomoc jen z rezerv – žádné nové dluhy", effects: E({ peace: -8, rating: 1 }) },
      { label: "Rozdělit zakázky na obnovu „svým“ firmám", effects: E({ debt: 35, blackFund: 6, heat: 18, peace: 6 }) },
    ],
  },
  {
    id: "prezident2003",
    title: "Volba prezidenta 2003",
    date: "2003-02-28",
    text: "Třetí kolo tajné volby. Václav Klaus potřebuje hlasy i z vlády. Na záchodcích Rudolfina se šeptá o nabídkách.",
    options: [
      { label: "Hlasovat podle stranické linie", effects: E({ unity: 8, seniority: 3 }) },
      { label: "Tajně podpořit Klause za protislužbu", effects: E({ blackFund: 2, unity: -10, pp: 25, heat: 5 }) },
      { label: "Odhalit kupčení s hlasy novinářům", effects: E({ charisma: 5, unity: -12, heat: -5, pp: 10 }) },
    ],
  },
  {
    id: "eu_ref",
    title: "Referendum o vstupu do EU",
    date: "2003-06-13",
    text: "Dva dny hlasování. Euroskeptici varují před Bruselem, vláda platí kampaň „Ano“.",
    options: [
      { label: "Jezdit po krajích a agitovat pro vstup", effects: E({ charisma: 3, account: -0.5, peace: 4, flag: "eu_yes" }) },
      { label: "Opatrně kritizovat „Brusel“ kvůli voličům", effects: E({ support: { kscm: 1, ods: 1 }, unity: -4 }) },
    ],
  },
  {
    id: "eu_vstup",
    title: "Česko vstupuje do Evropské unie",
    date: "2004-05-01",
    text: "Ohňostroj nad Prahou. Fondy, volný trh, ale i nové kontroly OLAF.",
    options: [{ label: "Připít na Evropu", effects: E({ growth: 1, peace: 5, heat: 3 }) }],
  },
  // Random pool
  {
    id: "obalka",
    title: "Obálka od kmotra",
    random: true,
    text: "Regionální podnikatel vás zve na rybaření. Mezi návnadou leží obálka a prosba o „drobnou“ změnu územního plánu.",
    options: [
      { label: "Vzít obálku", effects: E({ blackFund: 3, heat: 10, integrity: -5 }) },
      { label: "Vzít polovinu a slíbit „pokusit se“", effects: E({ blackFund: 1.5, heat: 5 }) },
      { label: "Odmítnout", effects: E({ integrity: 3 }) },
    ],
  },
  {
    id: "novinar",
    title: "Investigativní novinář",
    random: true,
    condition: { heatMin: 30 },
    text: "Reportér Respektu se ptá na vaše vazby na firmu z Kypru. Má výpis z účtu.",
    options: [
      { label: "Zaplatit mlčení", effects: E({ blackFund: -2, heat: -5 }), requires: { blackFund: 2 } },
      { label: "Pohrozit žalobou", effects: E({ heat: 5, charisma: -2 }) },
      { label: "Obětovat asistenta", effects: E({ heat: -10, unity: -5, seniority: -3 }) },
    ],
  },
  {
    id: "stavka",
    title: "Generální stávka odborů",
    random: true,
    condition: { peaceMax: 40 },
    text: "ČMKOS vyhlásila stávku. Tramvaje stojí, nemocnice jedou v nouzovém režimu.",
    options: [
      { label: "Ustoupit odborům", effects: E({ peace: 12, spending: 10 }) },
      { label: "Vydržet", effects: E({ peace: -8, unity: 4, pp: -10 }) },
    ],
  },
  {
    id: "rebel",
    title: "Poslanecká rebelie",
    random: true,
    condition: { unityMax: 40 },
    text: "Tři koaliční poslanci hrozí, že nebudou hlasovat pro rozpočet, pokud nedostanou dotace pro své okresy.",
    options: [
      { label: "Koupit je dotacemi", effects: E({ spending: 6, unity: 10 }) },
      { label: "Pohrozit vyškrtnutím z kandidátky", effects: E({ unity: 4, pp: -15 }) },
    ],
  },
  {
    id: "sponzor",
    title: "Štědrý sponzor",
    random: true,
    text: "Stavební firma nabízí dar na volební kampaň. Oficiálně, přes účet strany.",
    options: [
      { label: "Přijmout a odvést straně", effects: E({ seniority: 5, account: 0.5 }) },
      { label: "Přijmout na osobní kampaň", effects: E({ account: 2, heat: 3 }) },
    ],
  },
  {
    id: "toskansko",
    title: "Fotky z Toskánska",
    random: true,
    condition: { intrigueMin: 35 },
    text: "Váš člověk vyfotil ministra na dovolené s lobbistou. Fotky jsou ostré.",
    options: [
      { label: "Založit do složky", effects: E({ kompromat: 1, heat: 3 }) },
      { label: "Pustit do médií", effects: E({ pp: 20, unity: -6, charisma: 2 }) },
    ],
  },
];

export const eventById = (id: string) => EVENTS.find((e) => e.id === id)!;
