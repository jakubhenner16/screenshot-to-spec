# Česká politická grand-strategie 2000+ — v1 (hratelné jádro)

## Cíl v1
Hratelná kampaň od 1. 1. 2000 do konce éry 2000–2004, kde rozhodnutí mění provázané ukazatele se zpožděnými dopady. Hry se ukládají k uživatelskému účtu v cloudu. Funguje na mobilu i počítači. Tmavý strategický vzhled (HOI4: tmavé panely, mosazné akcenty, mapa).

## Obrazovky
1. **Úvod** – název hry, přihlášení / registrace, seznam uložených her.
2. **Tvorba postavy** – jméno, strana (ČSSD, ODS, KSČM, KDU-ČSL, US-DEU), domovský kraj, jeden ze 4 původů (Dravec z 90. let, Právník/Akademik, Regionální patriot, Stranický aparátčík) a rozdělení bodů do 4 statistik (Charisma, Intriky, Ekonomika, Čistý štít).
3. **Hlavní herní obrazovka**
   - Horní lišta: datum, pauza / rychlosti 1–3, Politický kapitál, osobní účet, černý fond, Seniorita, pozice.
   - Mapa ČR se 14 kraji (barvy dle volebních preferencí / nezaměstnanosti / HDP), detail kraje s Kmotrem a infrastrukturními sloty.
   - Panely (na mobilu jako spodní záložky): Stát (rozpočet, dluh/HDP, deficit, smír, koaliční jednota), Sněmovna, Focusy, Složky, Postava, Deník událostí.
4. **Sněmovna** – 200 křesel v půlkruhu, frakce, návrh zákona z parametrů (sazby, škrty, výjimky), předpověď hlasování, lobbování za PP, kompromat na poslance, hlasování.
5. **Focus tree** – osobní strom (frakce, dozorčí rady ČEZ/Čepro/Unipetrol, mediální krytí, příprava puče) a národní strom éry 2000–2004 (Opoziční smlouva, sanace IPB, Televizní krize, vstup do EU, Gripeny). Focusy 35/56/70 dní, po dokončení hlasování nebo systémová změna.
6. **Události** – modální okna s historickými a náhodnými eventy, 2–3 volby s okamžitými i zpožděnými dopady.

## Herní systémy v1
- **Čas**: denní tik; týdenní a měsíční přepočet ekonomiky.
- **Ekonomika**: rozpočet, mandatorní výdaje, deficit, dluh/HDP, rating; dluhová brzda nad 55 %.
- **Zpožděné následky**: fronta efektů naplánovaných na budoucí datum.
- **Kariéra**: povýšení Řadový poslanec → Předseda výboru → Ministr → Předseda strany → Premiér podle seniority a událostí; přeběhnutí do jiné strany (debuff Přeběhlík).
- **Policejní pozornost**: skrytý ukazatel rostoucí s korupcí; při překročení prahů vyšetřování a žádost o vydání.
- **Volby 2002**: přepočet křesel podle krajských preferencí.

## Odloženo na další verze
Stranický sjezd, obstrukce u pultíku, TV debaty, volba prezidenta, zakládání vlastního hnutí, éry 2004+.

## Technické detaily
- Lovable Cloud: přihlášení e-mailem, tabulka profilů a tabulka uložených her (stav hry jako JSON, vlastník podle uživatele, RLS jen pro vlastníka).
- Herní engine jako čisté TypeScript moduly (`src/game/`): stav, tik, ekonomika, sněmovna, focusy, eventy, efekty; data (kraje, strany, focusy, eventy) jako typované datové soubory.
- Stav přes Zustand; autosave do cloudu každý herní měsíc a ručně.
- Mapa krajů jako zjednodušené SVG.
- Testy (vitest) pro klíčová pravidla: dluhová brzda 55 %, délky focusů, většina 101 hlasů, zpožděné efekty.
- Fonty: výrazný serifový nadpis + kondenzovaný sans; barvy přes tokeny ve styles.css.
