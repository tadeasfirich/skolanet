# Změny

## 1.3.0 – 2026-11-12
### Přidáno
- **Žádosti vyřízené rolí**: když správce přidá člověka do role (nebo do role přidá oprávnění) a ten člověk má ve frontě žádost o totéž oprávnění, žádost se sama označí jako vyřízená („samo – už má přes roli“). Totéž platí, když mu oprávnění správce přidělí ručně.
- Správce ve frontě vidí: „Díky rolím se samo vyřídilo N žádostí“ a kolik práce to ušetřilo.
- Projektor, nová sekce **Úspora díky rolím**: kolik žádostí role vyřídily samy, kolik jich vůbec nemuselo vzniknout, kolik času to ušetřilo správcům a kolik uživatelům. Rozpad podle role ve hře (žák, rodič, učitel) i podle vytvořené role.
- Výpočet: počet žádostí × průměrný čas ručně vyřízené žádosti z dané hodiny (správce: od „Vyřídit“ do rozhodnutí; uživatel: čekání v 1. kole). Když data chybí, použije se odhad 30 s / 90 s a je to tak označené.
- Na kartě Řízení hry přibyla dlaždice s úsporou.

## 1.2.0 – 2026-11-11
### Přidáno – opora pro škodiče (po zpětné vazbě z hodiny)
Škodič teď uspěje sám, bez nápadné pomoci učitele. „Moje poznámky“ mají čtyři záložky:
- **Plán**: osm kroků v pořadí. Vždy je vidět jen jeden krok „TEĎ“ s návodem 1–2–3, tlačítkem „Jdi tam“ (otevře správné místo, u opravy známky rovnou předvybere pětku) a nápovědou po stupních. Když se nedá pokračovat, plán řekne proč a co dělat mezitím.
- **Pátrání**: šest míst ve škole (koš u kopírky, monitor v kabinetu, chodba, školní web…). Stopy se samy zapisují do zápisníku. Heslo k test.7x je slovo z hádanky + číslo z lístečku.
- **Výmluvník**: škodič vybere učitele, oprávnění, výmluvu a triky (spěch, pochvala). Výmluvník napíše žádost a ukáže, co uvidí správce. Vedle je tahák „Proč to může projít“ (sociální inženýrství) a přehled odeslaných převleků s radou, co zkusit po zamítnutí.
- **Účet test.7x**: zápisník je hned vedle přihlášení. Nápovědy přibývají s každým špatným pokusem.
- **Tvoje stopy v záznamu**: škodič vidí, kolik podezřelých stop po sobě nechal.
- Klávesa **Esc** = rychle schovat poznámky.
- Detektivka v reflexi ukáže, kde škodič heslo našel. Námět k diskusi: hesla na lístečcích.

### Změněno
- Heslo k test.7x je pro každou hru jiné (např. vltava2026, ferda123, bajtek7). Učitel ho vidí na kartě Hráči a práva.
- Heslo se přijme i s velkými písmeny, háčky a mezerou.
- Správci dostanou upozornění až po 4 špatných pokusech (dřív po 3).

## 1.1.0 – 2026-10-15
### Přidáno
- Po založení hry se rovnou otevře karta s kódem hry a tlačítkem **Vytisknout kartičky**. Tiskne se přímo ze stránky (žádné vyskakovací okno), 8 kartiček na A4 v designu Tadeáš.
- Kartičky jsou rozdělené na **■ PŘIDĚLÍ UČITEL** (správci, škodič) a **● LOS** (ostatní role) a na každé je jednou větou, kdo hráč je.
- **Dvojice**: u každé role lze nastavit, kolik míst hrají dva žáci u jednoho počítače. Dvojice dostane dvě kartičky a v aplikaci pokyn „jeden kliká, druhý radí, po zastavení se vyměňte“.
- **Škodič** (tajný hráč, navenek žák) se 6 misemi, přihlášením do zapomenutého účtu `test.7x`, bezpečnostním upozorněním pro správce, blokací účtu a sekcí **Detektivka** v reflexi.
- **Pokus přidělit si oprávnění sám**: každý hráč (kromě správce) si to může zkusit. Systém vždy odmítne a vysvětlí proč. Je to první úkol checklistu. Počet pokusů se ukáže v zastavení.
- Stopky fáze v pohledu učitele s plánovanou délkou podle přípravy hodiny (4 / 10 / 5 / 7 / 12 min).
- Nápověda „Udělej / Řekni / Žáci mají odejít s“ u každé fáze na kartě Řízení hry.
- Projektor: sekce **Shrnutí** (4 věty na závěr hodiny) a **Detektivka**.
- Pokus smazat záznam aktivit (vždy odmítnut a sám se zapíše).
- Výběr oprávnění je rozdělený do skupin (Hodnocení, Absence…).

### Změněno
- Vzhled podle „Design by Tadeáš“: jedna akcentní barva (kobalt), mono popisky, role rozlišené tvarem (● žák, ○ rodič, ■ učitel, ◆ správce), čárkovaná linka = zamčeno.
- Písmo Carlito / Calibri místo Google Fonts (o jednu blokovanou adresu ve škole méně).
- Úkol učitele „Odpověz na zprávu od rodiče“ nahrazen úkolem „Napiš rodiči zprávu“ (dřív ho mohla splnit jen třídní učitelka).
- Úkol správce „Ke každému zamítnutí napiš důvod“ nahrazen úkolem „Zamítni žádost, která je zbytečná nebo nebezpečná – a napiš proč“.
- Úvod pro hráče: tři očíslované kroky místo odstavce.

### Opraveno
- Stránka se každé 3 s celá překreslovala, takže se občas ztratilo kliknutí. Teď se překresluje jen při změně dat a časy tikají samy.

## 1.0.0 – 2026-09-25
- První verze pro GitHub Pages + Firebase Cloud Firestore.
- Role žák / rodič / učitel / správce, 17 oprávnění, checklisty s úkoly-pastmi.
- Fáze 0–4 řízené učitelem, projektor, reflexe, srovnání se skutečností.
- Zámek žádosti pro dva správce řešený transakcí v databázi.
- Záznam (log) jen pro přidávání, chráněný pravidly Firestore.
- Export záznamu a matice práv do CSV, kartičky k tisku.
- Testovací režim `#test` (každá záložka = jiný hráč).
