# ŠkolaNet Libčice

Výuková simulace školního informačního systému pro hodinu informatiky v 7. ročníku.
Žáci hrají role (žák, rodič, učitel, správce) a o každé oprávnění musí požádat správce.
Sami si tak vyzkouší, co znamená „zakázáno je všechno, co není povoleno“, že si oprávnění **nemůžou změnit sami**, co jsou nejmenší potřebná práva, proč se práva přidělují rolím a k čemu je záznam aktivit.
Volitelně hraje i tajný **škodič**, který zkouší, jestli má třída systém nastavený dobře.

Všechny osoby a data v aplikaci jsou smyšlené.

| Soubor | K čemu je |
|---|---|
| `index.html` | vzhled aplikace |
| `app.js` | logika aplikace |
| `firebase-config.js` | **tvoje** nastavení Firebase (vyplníš v kroku 1.5) |
| `firestore.rules` | pravidla databáze: kdo smí co číst a zapisovat (vložíš v kroku 1.3) |
| `CHANGELOG.md` | seznam verzí |

Aplikace běží na **GitHub Pages** (zdarma, s historií verzí). Data ukládá do **Firebase Cloud Firestore** (zdarma v tarifu Spark).
Počítej zhruba se 30–40 minutami na první nastavení. Pak už jen zakládáš hry.

---

## 1. Firebase: databáze

Firebase má anglické rozhraní. Pokud ho máš česky, názvy tlačítek jsou v závorce.

### 1.1 Založ projekt
1. Otevři **https://console.firebase.google.com** a přihlas se Google účtem (klidně školním).
2. Klikni **Create a project** (Vytvořit projekt).
3. Název: `skolanet-libcice` → **Continue**.
4. Google Analytics **vypni** (nepotřebuješ) → **Create project** → počkej → **Continue**.

### 1.2 Vytvoř databázi Firestore
1. V levém menu **Build → Firestore Database** (Sestavení → Firestore Database).
2. **Create database**.
3. Pokud se ptá na edici, nech **Standard edition**.
4. Location (umístění): vyber **eur3 (europe-west)**, případně jiné evropské. **Tohle už nejde změnit.**
5. Security rules: zvol **Start in production mode** → **Create**.

### 1.3 Vlož pravidla databáze
1. Ve Firestore Database přepni nahoře na kartu **Rules** (Pravidla).
2. Smaž všechno, co tam je, a vlož **celý obsah souboru `firestore.rules`** z tohoto repozitáře.
3. Klikni **Publish** (Publikovat).

### 1.4 Zapni anonymní přihlášení
Žáci nemají účty. Aplikace je přihlásí anonymně, aby do databáze nemohl zapisovat kdokoli z internetu.
1. Levé menu **Build → Authentication** → **Get started**.
2. Karta **Sign-in method** → v seznamu poskytovatelů klikni **Anonymous**.
3. Přepni **Enable** → **Save**.

### 1.5 Získej nastavení pro web
1. Vlevo nahoře klikni na **ozubené kolečko → Project settings** (Nastavení projektu).
2. Dole v části **Your apps** klikni na ikonu **`</>`** (Web).
3. App nickname: `skolanet` → políčko *Firebase Hosting* **nezaškrtávej** → **Register app**.
4. Zobrazí se kód s `const firebaseConfig = { ... }`. Zkopíruj hodnoty `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`.
5. Vlož je do souboru `firebase-config.js` místo textů `VLOZ_...` (uvozovky nech). Stačí to udělat až na GitHubu v kroku 2.4.

> Tyhle hodnoty nejsou tajné heslo. Google počítá s tím, že budou veřejně na webu. Data chrání pravidla z kroku 1.3 a anonymní přihlášení z kroku 1.4.

---

## 2. GitHub: stránka a verze

### 2.1 Vytvoř repozitář
1. Přihlas se na **https://github.com** (nebo si zdarma založ účet).
2. Vpravo nahoře **+ → New repository**.
3. Repository name: `skolanet`.
4. Zvol **Public**. GitHub Pages je zdarma jen pro veřejné repozitáře. Nic tajného v nich není.
5. **Create repository**.

### 2.2 Nahraj soubory
1. Na stránce nového repozitáře klikni na odkaz **uploading an existing file**.
2. Přetáhni do okna **všech 5 souborů**: `index.html`, `app.js`, `firebase-config.js`, `firestore.rules`, `README.md` (a `CHANGELOG.md`).
3. Dole do „Commit changes“ napiš např. `Verze 1.0.0` → **Commit changes**.

### 2.3 Zapni GitHub Pages
1. V repozitáři **Settings** (nahoře vpravo) → v levém menu **Pages**.
2. Build and deployment → Source: **Deploy from a branch**.
3. Branch: **main**, složka **/ (root)** → **Save**.
4. Počkej 1–2 minuty a obnov stránku. Nahoře se objeví adresa, např. `https://TVUJUCET.github.io/skolanet/`. **To je odkaz pro žáky.**

### 2.4 Doplň nastavení Firebase
1. V repozitáři klikni na soubor `firebase-config.js` → ikona **tužky** (Edit this file).
2. Nahraď texty `VLOZ_...` hodnotami z kroku 1.5.
3. **Commit changes…** → zpráva `Nastavení Firebase` → **Commit changes**.
4. Za minutu se změna projeví na stránce.

### 2.5 Povol ve Firebase adresu stránky
1. Firebase konzole → **Authentication** → karta **Settings** → **Authorized domains**.
2. **Add domain** → napiš `TVUJUCET.github.io` (bez https a bez /skolanet) → **Add**.

Hotovo. Otevři odkaz z kroku 2.3. Dole na přihlašovací obrazovce musí být napsáno **„verze 1.1.0 · Firebase“**.
Když aplikace hlásí chybu, řekne ti, který krok chybí.

---

## 3. Vyzkoušej to, než půjdeš do třídy

**A) Na jednom počítači (rychlý test)**
1. Otevři odkaz s `#test` na konci: `https://TVUJUCET.github.io/skolanet/#test`.
   V testovacím režimu si každá záložka pamatuje vlastního hráče.
2. Záložka 1: *Jsem učitel* → Nová hra → PIN → **Založit hru**. Poznamenej si kód hry. Na kartě *Řízení hry* přepni fázi na **1 · Kolo 1**.
3. Záložka 2 (stejný odkaz s `#test`): přihlas se jako **S1** (správce).
4. Záložka 3: přihlas se jako **Z1** (žák) → Hodnocení → Požádat správce → napiš větu → Odeslat.
5. Záložka 2: Správa aplikace → Fronta → **Vyřídit** → **Schválit**.
6. Záložka 3: do 2–3 sekund se odemknou známky a v checklistu se odškrtne první úkol.

**B) Na dvou počítačích ve třídě (ostrý test)**
1. Na žákovském PC otevři odkaz **bez `#test`** přes Veyon: *Otevřít webovou stránku*.
2. Zkontroluj, že se stránka otevře **bez přihlašování** a dole je „· Firebase“.
3. Zopakuj kroky 3–6 z testu A, správce na tvém PC a žák na žákovském.
4. Vyzkoušej výpadek: na žákovském PC na chvíli odpoj síť. Nahoře se objeví „Spojení se ztratilo, zkouším znovu…“. Po připojení hláška zmizí a nic se neztratí.
5. Pokud školní síť něco blokuje, správce sítě musí povolit:
   `www.gstatic.com`, `firestore.googleapis.com`, `identitytoolkit.googleapis.com`, `securetoken.googleapis.com`, `TVUJUCET.github.io`
   (Od verze 1.1 aplikace nepotřebuje Google Fonts. Používá písmo Calibri, které je na školních Windows.)

Po testu hru smaž: *Řízení hry → Ukončit a smazat hru*.

---

## 4. V hodině

Podrobný průběh hodiny (EUR, 45 minut) je v samostatné přípravě. Tady jen technika.

**Den předem**
1. *Jsem učitel* → **Nová hra**. Nastav počty rolí. Výchozí nastavení je pro 16 žáků:
   2 správci (každý ve dvojici = 4 žáci), 3 učitelé, 4 rodiče, 4 žáci, 1 škodič.
   Tabulka ti hned ukáže, kolik žáků je potřeba.
2. Zadej PIN → **Založit hru a vytisknout kartičky**. Otevře se karta *Kartičky* s velkým kódem hry.
3. **Vytisknout kartičky** → tiskne se rovnou ze stránky, 8 kartiček na A4. Rozstříhej.
4. Roztřiď kartičky podle značky v rohu:
   - **■ PŘIDĚLÍ UČITEL**: správci (a jejich dvojice) a škodič. Vybereš je ty.
   - **● LOS**: všechno ostatní. Dej do obálky, žáci si losují u dveří.

**Na začátku hodiny**
1. **Veyon:** označ všechny počítače → *Otevřít webovou stránku* → odkaz z kroku 2.3 (bez `#test`).
2. **Fáze** přepínáš na kartě *Řízení hry*. U každé fáze vidíš, co udělat, co říct a kolik minut fáze podle plánu má. Nahoře běží stopky fáze. Když plán přetáhneš, zežloutnou.
3. **Projektor:** karta *Projektor*. Obsah se mění podle fáze. V reflexi postupně: Srovnání kol → Matice → Srovnej se skutečností → Nebezpečná práva → Detektivka → Shrnutí.
4. **Na konci:** stáhni *záznam* a *matici práv* (CSV) → *Ukončit a smazat hru*.

**Škodič**
- Navenek je to obyčejný žák (má kód jako ostatní žáci, např. Z5). V menu má navíc položku *Moje poznámky* s šesti tajnými misemi.
- Mise: vydávat se za někoho jiného, získat zbytečné oprávnění, opravit si známku, přihlásit se do zapomenutého účtu `test.7x`, podívat se na cizí známky, smazat záznam.
- Heslo k účtu `test.7x` je jedno z nejčastějších hesel (najdeš ho v `app.js` v konstantě `TEST_PASS`). Škodič dostává postupně nápovědy. Každý neúspěšný pokus vidí správci jako bezpečnostní upozornění a můžou účet zablokovat.
- Kdo je škodič, vidíš ty na kartě *Hráči a práva*. Na projektoru se ukáže až po kliknutí *Odhalit škodiče*.
- Škodiče lze při zakládání hry vypnout.

**Dvojice**
- Dvojice = dva žáci u jednoho počítače se stejným kódem. Vytisknou se dvě kartičky „DVOJICE 1/2“ a „2/2“.
- Žáci ve dvojici vidí nahoře pruh „jeden kliká, druhý radí“ a v zastavení výzvu, ať se vymění.

## 5. Verzování (aby ses z toho nezbláznil)

- **Každá změna na GitHubu = commit.** Seznam změn najdeš v repozitáři pod odkazem **Commits** (ikona hodin nad seznamem souborů).
- **Úprava souboru:** otevři soubor → tužka → uprav → *Commit changes*. Do zprávy napiš, co jsi změnil.
- **Nová verze od Clauda:** nahraj nové `app.js` / `index.html` přes **Add file → Upload files**. Stejnojmenné soubory se přepíšou a v historii zůstane i stará verze. **`firebase-config.js` nepřepisuj**, jinak přijdeš o své nastavení.
- **Pojmenuj funkční verzi:** vpravo *Releases → Create a new release* → tag `v1.0.0` → *Publish release*. Kdykoli se k ní vrátíš.
- **Vrácení zpět:** otevři starý commit → *Browse files* → stáhni si starou verzi souboru a nahraj ji znovu. Pohodlnější je aplikace **GitHub Desktop** (Historie → pravé tlačítko → *Revert changes in commit*).
- Číslo verze je v `app.js` na řádku `const APP_VERSION='1.1.0'` a ukazuje se dole na přihlašovací obrazovce. Podle něj poznáš, že žáci vidí novou verzi. Pokud ji nevidí, dej **Ctrl+F5**.

---

## 6. Limity a známá omezení

- **Tarif Spark (zdarma):** 50 000 čtení a 20 000 zápisů denně. Jedna hodina se 16 žáky spotřebuje zhruba 1 000 zápisů a 10–20 tisíc čtení. Na dvě až tři hodiny denně to stačí. Přes limit se nic neúčtuje, databáze jen do půlnoci (tichomořského času) přestane zapisovat.
- **Zabezpečení je školní, ne bankovní.** Kdo zná odkaz a kód hry, může do hry zapisovat. PIN chrání jen pohled učitele v aplikaci, databázi ne. Pro simulaci ve třídě to stačí (a pro budoucí roli „škodiče“ je to dobré téma k diskusi).
- **Anonymní účty:** Firebase si pamatuje anonymní přihlášení. Starých anonymních uživatelů se nemusíš bát, nic nestojí.
- **Soubor otevřený z disku (`file://`) Firebase nepovolí.** Testuj vždy na adrese GitHub Pages.
- Bez vyplněného `firebase-config.js` aplikace poběží v **režimu jednoho počítače**. Data se pak ukládají jen v prohlížeči.

## Datový model (pro zvědavé)

Vše pod `games/{KÓD}` (hry se nemíchají):
`requests` (žádosti) · `grants` (práva přidělená jednotlivě) · `roles` (role s právy a členy) · `players` (připojení a checklist) · `edits` (změny školních dat) · `messages` (zprávy) · `log` (záznam: jen přibývá, měnit ho nejde, viz `firestore.rules`).
Škodič je v soupisce hry označený `skodic:true`, jeho mise jsou v `players/{kód}.mise`, za koho se vydával je v žádosti v poli `claimedAs`.
Testovací účet `test.7x` není hráč: jeho stav je v dokumentu hry (`hasTest`, `testBlocked`, `testFails`).
**Pravidla databáze (`firestore.rules`) se ve verzi 1.1 nemění.** Není potřeba je znovu vkládat.
