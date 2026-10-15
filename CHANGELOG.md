# Změny

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
