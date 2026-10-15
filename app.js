/* ŠkolaNet Libčice – výuková simulace práv ve školním informačním systému.
   Všechny osoby a data jsou smyšlené. */
(function(){
'use strict';

/* =====================================================================
   1) KATALOG, IDENTITY, VÝCHOZÍ DATA
   ===================================================================== */
const PERMS=[
 {code:'grades.own',    name:'Zobrazit své známky',              desc:'Uvidíš známky, které máš ty.'},
 {code:'grades.child',  name:'Zobrazit známky svého dítěte',     desc:'Rodič uvidí známky svého dítěte.'},
 {code:'grades.class',  name:'Zobrazit známky celé třídy',       desc:'Uvidíš známky všech žáků ve třídě.'},
 {code:'grades.write',  name:'Zapsat známku',                    desc:'Můžeš zapsat novou známku kterémukoli žákovi.'},
 {code:'grades.edit',   name:'Upravit existující známku',        desc:'Můžeš změnit známku, která už je zapsaná.'},
 {code:'timetable.view',name:'Zobrazit rozvrh',                  desc:'Uvidíš rozvrh hodin třídy.'},
 {code:'homework.view', name:'Zobrazit domácí úkoly',            desc:'Uvidíš zadané domácí úkoly.'},
 {code:'homework.assign',name:'Zadat domácí úkol',               desc:'Můžeš třídě zadat nový domácí úkol.'},
 {code:'absence.write', name:'Zapsat absenci',                   desc:'Můžeš zapsat, že žák chyběl.'},
 {code:'absence.excuse',name:'Omluvit absenci',                  desc:'Můžeš omluvit zameškané hodiny.'},
 {code:'absence.view',  name:'Zobrazit absenci (své / svého dítěte)', desc:'Uvidíš zameškané hodiny svoje nebo svého dítěte.'},
 {code:'msg.send',      name:'Poslat zprávu',                    desc:'Můžeš psát zprávy ostatním v systému.'},
 {code:'msg.read',      name:'Číst své zprávy',                  desc:'Uvidíš zprávy, které přišly tobě.'},
 {code:'lunch.order',   name:'Odhlásit / objednat oběd',         desc:'Můžeš odhlásit nebo objednat oběd.'},
 {code:'users.create',  name:'Založit nového uživatele',         desc:'Můžeš přidat do systému nového člověka.'},
 {code:'perms.grant',   name:'Přidělovat práva',                 desc:'Můžeš ostatním dávat a brát oprávnění a spravovat role.'},
 {code:'log.view',      name:'Zobrazit záznam aktivit (log)',    desc:'Uvidíš záznam všeho, co kdo v systému udělal.'}
];
const P={}; PERMS.forEach((p,i)=>{p.n=i+1;P[p.code]=p;});

const SUBJ={M:'Matematika',CJ:'Český jazyk',AJ:'Anglický jazyk',INF:'Informatika',F:'Fyzika',Z:'Zeměpis'};
const ROLE={
 spravce:{label:'Správce',plural:'Správci',letter:'S'},
 ucitel:{label:'Učitel',plural:'Učitelé',letter:'U'},
 rodic:{label:'Rodič',plural:'Rodiče',letter:'R'},
 zak:{label:'Žák',plural:'Žáci',letter:'Z'},
 test:{label:'Testovací účet',plural:'Testovací účty',letter:'T'}
};
/* Škodič je tajná role: navenek je to obyčejný žák (příznak skodic:true v soupisce).
   Testovací účet test.7x není hráč. Je to zapomenutý účet, do kterého se škodič může zkusit přihlásit. */
const TEST={pid:'T1',role:'test',name:'test.7x',sid:null};
const TEST_PASS='heslo123';
const TEST_PERMS=['grades.class','log.view'];
const ROLE_ORDER=['spravce','ucitel','rodic','zak'];
const LIMITS={S:[1,3],U:[1,6],R:[0,10],Z:[0,10]};
const DEF_CFG={S:2,Sp:2,U:3,Up:0,R:4,Rp:0,Z:4,Zp:0,X:1};
const STUDENTS=['Adam Bříza','Bára Lísková','Cyril Dubský','Dana Jeřábková','Emil Habr','Fanny Olšová','Gustav Topol','Hana Vrbová','Ivan Jasan','Jana Klenová'];
const PARENTS=['Petra Břízová','Martin Lísek','Olga Dubská','Karel Jeřábek','Irena Habrová','Tomáš Olša','Věra Topolová','Pavel Vrba','Lucie Jasanová','Roman Klen'];
const TEACHERS=[
 {name:'Mgr. Marta Početná',subj:'M'},{name:'Mgr. Viktor Pravopis',subj:'CJ'},{name:'Mgr. Anna Wordová',subj:'AJ'},
 {name:'Mgr. Petr Bajtek',subj:'INF'},{name:'Mgr. Ota Kladívko',subj:'F'},{name:'Mgr. Klára Mapová',subj:'Z'}];
const ADMINS=['Radek Server','Lenka Síťová','Ivo Heslo'];
const PHASES=[
 {n:0,name:'Připojení',sub:'Nesmíš nic',min:4},
 {n:1,name:'Kolo 1',sub:'Práva po jednom',min:10},
 {n:2,name:'Zastavení',sub:'Oči na tabuli',min:5},
 {n:3,name:'Kolo 2',sub:'Role',min:7},
 {n:4,name:'Reflexe',sub:'Co jsme zjistili',min:12}];
/* Nápověda pro učitele u každé fáze: co udělat a co říct (odpovídá přípravě hodiny) */
const PHASE_HELP=[
 {doit:['Žáci se přihlašují kódem hry a kódem z kartičky.','Až jsou všichni, nech je 2 minuty proklikat systém. Všude je zámek.'],
  say:['„Systém je spuštěný. Zkuste si cokoli povolit sami. Zkuste všechno – obnovit stránku, odhlásit se, cokoli.“','„Co smíte? … Nic. Proč myslíte, že nový systém nedovolí nic?“'],
  goal:'Zakázáno je všechno, co není povoleno. A sám si to nezměním.'},
 {doit:['Do práce správců nezasahuj, ani když fronta roste. Fronta se má zahltit.','Obcházej slabší žáky. Ptej se jen: „Co máš v checklistu? Kam klikneš? Co vidíš?“'],
  say:['„Narazíš na zámek? Požádej správce a napiš jednou větou proč.“'],
  goal:'Oprávnění dává správce. Já o ně musím požádat a počkat.'},
 {doit:['Obrazovky žáků ztmavly. Na projektoru ukaž statistiku.','Dvojice se vymění: kdo klikal, teď radí.'],
  say:['„Zkusili jste si oprávnění dát sami? Povedlo se? Co jste zkoušeli?“','„Proč to nejde? Kde je ten zámek – ve vašem počítači?“','„Správci, jak se vám dařilo? Co mají společného lidé ve stejné roli? Dalo by se to ulehčit?“'],
  goal:'Oprávnění nejsou v mém počítači, ale v systému. Mění je jen správce.'},
 {doit:['Správcům se odemkla obrazovka Role. Řekni jim: vytvořte role a přiřaďte do nich lidi.','Žáci dál plní checklist.'],
  say:['„Správci, nedávejte roli víc, než lidé v ní opravdu potřebují.“'],
  goal:'Role = sada oprávnění pro skupinu lidí. Každý jen to, co potřebuje.'},
 {doit:['Projektor: Srovnání kol → Matice → Nebezpečná práva → Detektivka → Shrnutí.','Na konci kolíčky na plakátu „Jak mi to šlo“.'],
  say:['„Kterou past systém pustil? Kdo ji schválil a proč?“','„Kdo hlídá správce?“','„Kdo byl škodič? Najděte ho v záznamu.“'],
  goal:'Každý dostane jen tolik, kolik potřebuje. Záznam ukáže, kdo co udělal.'}];

const DAYS=['Pondělí','Úterý','Středa','Čtvrtek','Pátek'];
const TIMETABLE=[
 ['Český jazyk','Matematika','Anglický jazyk','Zeměpis','Tělesná výchova',''],
 ['Matematika','Český jazyk','Fyzika','Přírodopis','Hudební výchova',''],
 ['Anglický jazyk','Matematika','Český jazyk','Dějepis','Výtvarná výchova','Výtvarná výchova'],
 ['Český jazyk','Matematika','Anglický jazyk','Informatika','Tělesná výchova',''],
 ['Matematika','Český jazyk','Zeměpis','Anglický jazyk','Fyzika','']];
const TOPICS={M:['Písemka: zlomky','Test: rovnice','Aktivita v hodině'],CJ:['Diktát','Slohová práce','Test: větné členy'],
 AJ:['Slovíčka Unit 2','Poslech','Test: minulý čas'],INF:['Tabulky','Projekt: prezentace','Algoritmy']};
const LUNCH_DAYS=['dnes','zítra','pozítří'];
const LUNCH_MENU={dnes:'Kuřecí rizoto, okurkový salát',zítra:'Svíčková omáčka, houskový knedlík',pozítří:'Čočková polévka, palačinky s tvarohem'};

function rng(seed){return function(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
function seedSchool(){
  const students=STUDENTS.map((n,i)=>({sid:'s'+(i+1),name:n,created:false}));
  const grades=[];
  students.forEach((s,i)=>{
    ['M','CJ','AJ','INF'].forEach((subj,j)=>{
      const r=rng(i*31+j*7+3);
      TOPICS[subj].forEach((topic,k)=>{
        let v; if(subj==='M'&&k===0) v=5; else {const x=r(); v=x<.3?1:x<.62?2:x<.86?3:4;}
        grades.push({gid:'g-'+s.sid+'-'+subj+'-'+k,sid:s.sid,subj,val:v,topic,by:'seed'});
      });
    });
  });
  const absences=[];
  students.forEach((s,i)=>{
    absences.push({aid:'a-'+s.sid+'-1',sid:s.sid,date:'včera',hours:2+(i%3),excused:false});
    if(i%2===0) absences.push({aid:'a-'+s.sid+'-0',sid:s.sid,date:'minulý týden',hours:6,excused:true});
  });
  const homework=[
    {hid:'h1',subj:'M',text:'Pracovní list – zlomky, str. 14, cvičení 1–5',due:'zítra',by:'seed'},
    {hid:'h2',subj:'AJ',text:'Naučit se slovíčka Unit 3',due:'v pátek',by:'seed'}];
  const lunches={};
  students.forEach(s=>{lunches[s.sid]={dnes:true,'zítra':true,'pozítří':true};});
  return {students,grades,absences,homework,lunches};
}

const TASKS={
 zak:[
  {id:'z0',text:'Zkus si přidat oprávnění sám, bez správce.'},
  {id:'z1',text:'Podívej se, co máš za známku z matematiky.'},
  {id:'z2',text:'Zjisti, jaký máš na zítra domácí úkol.'},
  {id:'z3',text:'Najdi si, kolikátou hodinu máš ve čtvrtek informatiku.'},
  {id:'z4',text:'Napiš třídní učitelce, že zapomeneš sešit.'},
  {id:'zP',text:'Oprav si pětku z matematiky na trojku.',trap:true,perm:'grades.edit'}],
 rodic:[
  {id:'r0',text:'Zkus si přidat oprávnění sám, bez správce.'},
  {id:'r1',text:'Omluv svému dítěti včerejší absenci.'},
  {id:'r2',text:'Odhlas dítěti zítřejší oběd.'},
  {id:'r3',text:'Podívej se na známky svého dítěte.'},
  {id:'r4',text:'Napiš třídní učitelce zprávu.'},
  {id:'rP',text:'Podívej se, jaké známky má spolužák tvého dítěte.',trap:true,perm:'grades.class'}],
 ucitel:[
  {id:'u0',text:'Zkus si přidat oprávnění sám, bez správce.'},
  {id:'u1',text:'Zapiš jednomu žákovi známku ze svého předmětu.'},
  {id:'u2',text:'Zadej třídě domácí úkol.'},
  {id:'u3',text:'Zapiš, že dnes chyběl jeden žák.'},
  {id:'u4',text:'Napiš rodiči jednoho žáka zprávu o jeho dítěti.'},
  {id:'uP',text:'Změň známku z předmětu, který neučíš.',trap:true,perm:'grades.edit'}],
 spravce:[
  {id:'s1',text:'Vyřiď všechny žádosti ve frontě (cílem je prázdná fronta).'},
  {id:'s2',text:'Založ nového žáka, který přestoupil do třídy.'},
  {id:'s3',text:'Zamítni žádost, která je podle tebe zbytečná nebo nebezpečná – a napiš proč.'},
  {id:'sP',text:'Podívej se sám pro sebe na známky jednoho žáka.',trap:true,perm:'grades.class'}]
};
/* Tajné mise škodiče. Každá testuje jednu zásadu bezpečnosti. */
const MISSIONS=[
 {id:'m1',name:'Převlek',text:'Pošli správci žádost a vydávej se v ní za někoho jiného (třeba za učitele). Projde to?',rule:'Systém ví, kdo doopravdy píše. Správce má kontrolovat odesílatele, ne to, co tvrdí text.'},
 {id:'m2',name:'Přehnané právo',text:'Získej oprávnění, které žák vůbec nepotřebuje.',rule:'Každý dostane jen tolik oprávnění, kolik potřebuje.'},
 {id:'m3',name:'Lepší známka',text:'Oprav si pětku z matematiky na lepší známku.',rule:'Měnit známky smí jen učitel, a to svoje.'},
 {id:'m4',name:'Zapomenutý účet',text:'Ve škole zůstal starý testovací účet test.7x. Zkus se do něj přihlásit.',rule:'Staré účty se ruší, výchozí hesla se mění. Neúspěšná přihlášení se zapisují.'},
 {id:'m5',name:'Šmírák',text:'Zjisti, jaké známky mají ostatní žáci.',rule:'Cizí známky jsou osobní údaje.'},
 {id:'m6',name:'Zameť stopy',text:'Zkus smazat záznam o tom, co jsi v systému dělal.',rule:'Záznam jde jen přidávat. Smazat ho nesmí nikdo, ani správce.'}];
const RISKY_ZAK=['perms.grant','users.create','log.view','grades.class','grades.write','grades.edit','absence.write','absence.excuse','homework.assign'];
function allTasks(){const m={};Object.values(TASKS).forEach(l=>l.forEach(t=>m[t.id]=t));return m;}
const TASK=allTasks();

/* Zjednodušený model skutečného školního systému: y = ano, n = ne, h = jen částečně */
const REALITY={
 'grades.own':{zak:'y',rodic:'n',ucitel:'n',spravce:'n'},
 'grades.child':{zak:'n',rodic:'y',ucitel:'n',spravce:'n'},
 'grades.class':{zak:'n',rodic:'n',ucitel:'h',spravce:'h'},
 'grades.write':{zak:'n',rodic:'n',ucitel:'y',spravce:'n'},
 'grades.edit':{zak:'n',rodic:'n',ucitel:'h',spravce:'n'},
 'timetable.view':{zak:'y',rodic:'y',ucitel:'y',spravce:'y'},
 'homework.view':{zak:'y',rodic:'y',ucitel:'y',spravce:'n'},
 'homework.assign':{zak:'n',rodic:'n',ucitel:'y',spravce:'n'},
 'absence.write':{zak:'n',rodic:'n',ucitel:'y',spravce:'n'},
 'absence.excuse':{zak:'n',rodic:'y',ucitel:'h',spravce:'n'},
 'absence.view':{zak:'y',rodic:'y',ucitel:'n',spravce:'n'},
 'msg.send':{zak:'y',rodic:'y',ucitel:'y',spravce:'y'},
 'msg.read':{zak:'y',rodic:'y',ucitel:'y',spravce:'y'},
 'lunch.order':{zak:'y',rodic:'y',ucitel:'n',spravce:'n'},
 'users.create':{zak:'n',rodic:'n',ucitel:'n',spravce:'y'},
 'perms.grant':{zak:'n',rodic:'n',ucitel:'n',spravce:'y'},
 'log.view':{zak:'n',rodic:'n',ucitel:'n',spravce:'y'}
};
const REALITY_NOTE={
 'grades.class':'Učitel vidí známky tříd, které učí. Správce by technicky mohl, ale bez důvodu se do nich nedívá.',
 'grades.edit':'Učitel opravuje jen známky, které sám zapsal, ve svém předmětu.',
 'absence.excuse':'Rodič podá omluvenku, třídní učitel ji uzná.'
};

const MODULES=[
 {id:'uvod',name:'Úvod',icon:'home',tabs:[{id:'prehled',name:'Přehled'},{id:'rozvrh',name:'Rozvrh',perm:'timetable.view'}]},
 {id:'hodnoceni',name:'Hodnocení',icon:'grade',tabs:[
   {id:'moje',name:'Moje známky',perm:'grades.own'},{id:'dite',name:'Známky dítěte',perm:'grades.child'},
   {id:'trida',name:'Známky třídy',perm:'grades.class'},{id:'zapsat',name:'Zapsat známku',perm:'grades.write'},
   {id:'upravit',name:'Upravit známku',perm:'grades.edit'}]},
 {id:'absence',name:'Absence a omluvenky',icon:'cal',tabs:[
   {id:'prehled',name:'Moje absence',perm:'absence.view'},{id:'zapsat',name:'Zapsat absenci',perm:'absence.write'},
   {id:'omluvit',name:'Omluvit absenci',perm:'absence.excuse'}]},
 {id:'ukoly',name:'Úkoly',icon:'book',tabs:[{id:'seznam',name:'Domácí úkoly',perm:'homework.view'},{id:'zadat',name:'Zadat úkol',perm:'homework.assign'}]},
 {id:'zpravy',name:'Zprávy',icon:'mail',tabs:[{id:'dorucene',name:'Doručené',perm:'msg.read'},{id:'napsat',name:'Napsat zprávu',perm:'msg.send'}]},
 {id:'obedy',name:'Obědy',icon:'food',tabs:[{id:'obedy',name:'Moje obědy',perm:'lunch.order'}]},
 {id:'sprava',name:'Správa aplikace',icon:'gear',tabs:[
   {id:'fronta',name:'Fronta žádostí',perm:'perms.grant'},{id:'uzivatele',name:'Uživatelé a oprávnění',perm:'perms.grant'},
   {id:'role',name:'Role',perm:'perms.grant',phaseMin:3},{id:'zalozit',name:'Založit uživatele',perm:'users.create'},
   {id:'zaznam',name:'Záznam aktivit',perm:'log.view'}]},
 {id:'tajne',name:'Moje poznámky',icon:'note',secret:true,tabs:[{id:'mise',name:'Poznámky'}]}
];
function visibleModules(){return MODULES.filter(m=>!m.secret||isSkodic());}

const LOG_LABEL={
 'game.create':'Založení hry','phase.change':'Změna fáze','game.pause':'Pozastavení hry','game.resume':'Pokračování hry',
 'player.join':'Přihlášení do systému','player.logout':'Odhlášení','access.blocked':'Narazil(a) na zámek',
 'request.create':'Žádost o oprávnění','request.approve':'Schválení žádosti','request.deny':'Zamítnutí žádosti',
 'grant.add':'Přidělení oprávnění','grant.revoke':'Odebrání oprávnění','role.create':'Vytvoření role',
 'role.perm':'Změna oprávnění v roli','role.assign':'Přiřazení role','role.unassign':'Odebrání z role',
 'task.done':'Splněný úkol','trap.triggered':'Použito nebezpečné právo','grade.write':'Zápis známky','grade.edit':'Úprava známky',
 'absence.write':'Zápis absence','absence.excuse':'Omluvení absence','homework.assign':'Zadání úkolu',
 'lunch.change':'Změna oběda','msg.send':'Odeslání zprávy','user.create':'Založení uživatele',
 'self.grant.try':'Pokus dát si oprávnění sám','log.delete.try':'Pokus smazat záznam','account.block':'Zablokování účtu',
 'auth.fail':'Neúspěšné přihlášení','auth.ok':'Přihlášení do účtu','auth.leave':'Odchod z účtu','identity.claim':'Vydává se za někoho jiného'
};

/* =====================================================================
   2) SVG IKONY A LOGO
   ===================================================================== */
const ICONS={
 home:'<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
 grade:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
 cal:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 book:'<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2z"/><path d="M4 5v16"/><path d="M9 7h6"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
 food:'<path d="M7 3v8M5 3v5a2 2 0 004 0V3M7 11v10"/><path d="M17 3c-2 1-3 4-3 7h3v11"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
 lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/>',
 check:'<path d="M5 12l5 5 9-10"/>',
 warn:'<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
 out:'<path d="M15 4h4v16h-4"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
 list:'<path d="M9 6h11M9 12h11M9 18h11"/><path d="M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"/>',
 note:'<path d="M5 3h10l4 4v14H5z"/><path d="M15 3v4h4M8 12h8M8 16h5"/>',
 eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
 key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M14 9l2 2"/>',
 people:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c0-3 3-5 6-5s6 2 6 5M15 15c3 0 6 1.5 6 4.5"/>'
};
function ic(n,s){s=s||18;return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+ICONS[n]+'</svg>';}
function logo(s){s=s||32;return '<svg width="'+s+'" height="'+s+'" viewBox="0 0 40 40" aria-hidden="true"><rect x="2.5" y="2.5" width="35" height="35" rx="2" fill="none" stroke="#ffffff" stroke-width="2.5"/><circle cx="20" cy="16.5" r="5.2" fill="#ffffff"/><path d="M17.4 19.5h5.2l1.6 10.5h-8.4z" fill="#ffffff"/></svg>';}

/* =====================================================================
   3) ÚLOŽIŠTĚ: sdílená databáze (db), nebo lokální náhrada na jednom PC
   ===================================================================== */
function clone(o){return o==null?o:JSON.parse(JSON.stringify(o));}
function deepMerge(a,b){const out=Object.assign({},a);Object.keys(b).forEach(k=>{const v=b[k];if(v&&typeof v==='object'&&!Array.isArray(v)&&out[k]&&typeof out[k]==='object'&&!Array.isArray(out[k]))out[k]=deepMerge(out[k],v);else out[k]=clone(v);});return out;}
function rid(){return Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);}

function makeLocalDB(){
  /* každý dokument = vlastní klíč v localStorage, takže se záložky navzájem nepřepisují */
  const PFX='skolanet-ldb:'; const listeners=new Set();
  let bc=null; try{bc=new BroadcastChannel('skolanet-local');bc.onmessage=()=>notify();}catch(e){}
  try{window.addEventListener('storage',e=>{if(!e.key||e.key.indexOf(PFX)===0)notify();});}catch(e){}
  function rd(path){try{const v=localStorage.getItem(PFX+path);return v?JSON.parse(v):null;}catch(e){return null;}}
  function wr(path,obj){try{if(obj==null)localStorage.removeItem(PFX+path);else localStorage.setItem(PFX+path,JSON.stringify(obj));}catch(e){} try{bc&&bc.postMessage(1);}catch(e){} notify();}
  function keys(){const out=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.indexOf(PFX)===0)out.push(k.slice(PFX.length));}}catch(e){}return out;}
  function dsnap(path){const d=rd(path);return {id:path.split('/').pop(),exists:!!d,data:()=>d?clone(d):undefined,metadata:{fromCache:false,hasPendingWrites:false}};}
  function csnap(path){const pre=path+'/';const docs=keys().filter(k=>k.indexOf(pre)===0&&k.slice(pre.length).indexOf('/')<0).sort().map(dsnap);return {docs,size:docs.length,empty:!docs.length,docChanges:()=>[],metadata:{fromCache:false,hasPendingWrites:false}};}
  function fire(l){setTimeout(()=>{if(!listeners.has(l))return;try{l.cb(l.type==='d'?dsnap(l.path):csnap(l.path));}catch(e){console.error(e);}},0);}
  function notify(){listeners.forEach(fire);}
  function dref(path){return {id:path.split('/').pop(),path,
    get:async()=>dsnap(path),
    set:async o=>{wr(path,clone(o));},
    update:async o=>{const cur=rd(path);if(!cur)throw {code:'invalid_argument',message:'missing'};wr(path,deepMerge(cur,o));},
    delete:async()=>{wr(path,null);},
    acquire:async()=>({acquired:true}),
    onSnapshot:(cb)=>{const l={type:'d',path,cb};listeners.add(l);fire(l);return()=>listeners.delete(l);},
    collection:p=>cref(path+'/'+p)};}
  function cref(path){return {path,doc:id=>dref(path+'/'+(id||rid())),
    add:async o=>{const r=dref(path+'/'+rid());await r.set(o);return r;},
    get:async()=>csnap(path),
    onSnapshot:(cb)=>{const l={type:'c',path,cb};listeners.add(l);fire(l);return()=>listeners.delete(l);}};}
  return {doc:dref,collection:cref};
}

/* ---------- Firebase (Cloud Firestore) ----------
   update() = set(...,{merge:true}) -> vnořené mapy se slučují po položkách,
   takže dva správci si navzájem nepřepíšou práva ani členy rolí. */
function fbCode(e){const c=(e&&e.code)||'';
  if(c==='permission-denied'||c==='unauthenticated')return 'permission_denied';
  if(c==='resource-exhausted')return 'quota_exceeded';
  if(c==='invalid-argument'||c==='failed-precondition')return 'invalid_argument';
  if(c==='not-found')return 'not_found';
  return 'unavailable';}
function fbErr(e){return {code:fbCode(e),message:(e&&e.message)||'',raw:e&&e.code};}
function makeFirebaseDB(fs){
  const wd=s=>({id:s.id,exists:!!s.exists,data:()=>s.data(),metadata:s.metadata||{}});
  const wq=q=>({docs:q.docs.map(wd),size:q.size,empty:q.empty,docChanges:()=>[],metadata:q.metadata||{}});
  const wrap=p=>p.catch(e=>{throw fbErr(e);});
  function dref(path){const r=fs.doc(path);return {id:r.id,path,
    get:()=>wrap(r.get().then(wd)),
    set:o=>wrap(r.set(o)),
    update:o=>wrap(r.set(o,{merge:true})),
    delete:()=>wrap(r.delete()),
    acquire:async()=>({acquired:true}),
    onSnapshot:(cb,err)=>r.onSnapshot(s=>cb(wd(s)),e=>{if(err)err(fbErr(e));}),
    collection:p=>cref(path+'/'+p)};}
  function cref(path){const c=fs.collection(path);return {path,
    doc:id=>dref(path+'/'+(id||rid())),
    add:async o=>{const r=dref(path+'/'+rid());await r.set(o);return r;},
    get:()=>wrap(c.get().then(wq)),
    onSnapshot:(cb,err)=>c.onSnapshot(q=>cb(wq(q)),e=>{if(err)err(fbErr(e));})};}
  /* zámek žádosti v transakci: dva správci nikdy nechytí stejnou položku */
  function claim(path,holder,ms){const r=fs.doc(path);return wrap(fs.runTransaction(async tx=>{const s=await tx.get(r);if(!s.exists)return 'gone';const d=s.data();
    if(d.status!=='pending')return 'done';if(d.lockBy&&d.lockBy!==holder&&d.lockUntil>Date.now())return 'locked';
    tx.update(r,{lockBy:holder,lockUntil:Date.now()+ms});return 'ok';}));}
  async function deleteCol(path){const q=await wrap(fs.collection(path).get());let n=0;
    for(let i=0;i<q.docs.length;i+=400){const b=fs.batch();q.docs.slice(i,i+400).forEach(d=>b.delete(d.ref));await wrap(b.commit());n+=Math.min(400,q.docs.length-i);}
    return n;}
  return {doc:dref,collection:cref,claim,deleteCol,realtime:true};
}

/* =====================================================================
   4) STAV APLIKACE
   ===================================================================== */
const APP_VERSION='1.1.0';
const COLS=['requests','grants','roles','players','edits','messages','log'];
const S={
  db:null, local:false, ready:false, dl:null,
  session:null, code:null, game:null, gameMissing:false,
  cols:{}, loaded:{}, subs:{}, pollIdx:0, pollTimer:null,
  ui:{mod:'uvod',tab:{},reqOpen:null,openReq:null,confirmOut:false,tTab:'rizeni',projSec:'auto',logFilter:'',confirmDel:false,delProgress:null,asideOpen:false,startErr:'',teacherErr:''},
  drafts:{}, fired:new Set(), prevPerms:null, prevReq:null, initDone:false
};
COLS.forEach(c=>{S.cols[c]={};});

const SESS_KEY='skolanet-session-v1';
function sessLoad(){try{const st=(S.local||S.testMode)?sessionStorage:localStorage;return JSON.parse(st.getItem(SESS_KEY)||'null');}catch(e){return null;}}
function sessSave(v){try{const st=(S.local||S.testMode)?sessionStorage:localStorage;if(v)st.setItem(SESS_KEY,JSON.stringify(v));else st.removeItem(SESS_KEY);}catch(e){}}

function gp(sub){return 'games/'+S.code+'/'+sub;}

/* ---------- síť: hláška o výpadku + opakování ---------- */
const net={fails:0,
  fail(){this.fails++;const b=document.getElementById('netbar');if(b)b.hidden=false;},
  ok(){this.fails=0;const b=document.getElementById('netbar');if(b&&navigator.onLine!==false)b.hidden=true;}};
window.addEventListener('offline',()=>net.fail());
window.addEventListener('online',()=>{net.ok();if(S.code)resyncAll();});

const FATAL=['permission_denied','not_found','invalid_argument','quota_exceeded','not_granted','capability_disabled','capability_removed','transform_error','revoked'];
async function W(fn,label){
  for(let i=0;i<6;i++){
    const slow=setTimeout(()=>net.fail(),4000);
    try{const r=await fn();clearTimeout(slow);net.ok();return r;}
    catch(e){
      clearTimeout(slow);
      const code=e&&e.code;
      if(code==='permission_denied'){toast('Databáze odmítla zápis. Zkontroluj pravidla Firestore a zapnuté anonymní přihlášení (viz README).','bad');throw e;}
      if(FATAL.indexOf(code)>=0){
        if(code==='quota_exceeded')toast('Databáze je plná. Učitel musí smazat starou hru (Ukončit a smazat hru).','bad');
        else if(code==='invalid_argument')toast('Databáze odmítla data ('+(label||'změna')+').','bad');
        else toast('Nepodařilo se uložit ('+(label||'změna')+').','bad');
        throw e;
      }
      net.fail();
      await new Promise(r=>setTimeout(r,800*(i+1)+Math.random()*500));
    }
  }
  toast('Nepodařilo se uložit ('+(label||'změna')+'). Zkus to znovu.','bad');
  throw {code:'unavailable'};
}
const dref=p=>S.db.doc(p), cref=p=>S.db.collection(p);

/* ---------- synchronizace ---------- */
function stopSync(){Object.values(S.subs).forEach(u=>{try{u();}catch(e){}});S.subs={};if(S.pollTimer){clearInterval(S.pollTimer);S.pollTimer=null;}}
function resetData(){S.editsVer=(S.editsVer||0)+1;S.game=null;S.gameMissing=false;COLS.forEach(c=>{S.cols[c]={};S.loaded[c]=false;});S.loaded.game=false;S.prevPerms=null;S.prevReq=null;S.initDone=false;S.fired=new Set();}
function wantCol(c){ if(c!=='log')return true; if(S.session&&S.session.teacher)return true; const me=meP(); return !!(me&&can('log.view')); }
function startSync(){
  stopSync(); const code=S.code; if(!code)return;
  subGame(code);
  COLS.forEach(c=>{if(wantCol(c))subCol(c,code);});
  if(!S.db.realtime)S.pollTimer=setInterval(()=>pollOne(code),2000);
}
function subGame(code){
  try{
    S.subs.game=dref('games/'+code).onSnapshot(s=>{if(S.code!==code)return;applyGame(s);},e=>{net.fail();retrySub('game',code);});
  }catch(e){console.error(e);}
}
function subCol(c,code){
  try{
    S.subs[c]=cref('games/'+code+'/'+c).onSnapshot(s=>{if(S.code!==code)return;applyCol(c,s);},e=>{net.fail();retrySub(c,code);});
  }catch(e){console.error(e);}
}
function retrySub(c,code){delete S.subs[c];setTimeout(()=>{if(S.code!==code||S.subs[c])return;if(c==='game')subGame(code);else subCol(c,code);},3000);}
function resyncAll(){if(!S.code)return;stopSync();startSync();}
function applyGame(s){S.loaded.game=true;if(s.exists){S.game=s.data();S.gameMissing=false;}else{S.game=null;S.gameMissing=true;}net.ok();onData();}
function applyCol(c,snap){if(c==='edits')S.editsVer=(S.editsVer||0)+1;const m={};snap.docs.forEach(d=>{m[d.id]=d.data();});S.cols[c]=m;S.loaded[c]=true;net.ok();onData();}
async function pollOne(code){
  if(S.code!==code)return;
  const list=['game'].concat(COLS.filter(c=>S.subs[c]));
  const c=list[S.pollIdx++%list.length];
  try{
    if(c==='game'){const s=await dref('games/'+code).get();if(S.code===code)applyGame(s);}
    else{const s=await cref('games/'+code+'/'+c).get();if(S.code===code)applyCol(c,s);}
  }catch(e){net.fail();}
}

/* =====================================================================
   5) ODVOZENÝ STAV: kdo jsem, co smím, školní data
   ===================================================================== */
function phase(){return S.game?S.game.phase|0:0;}
function roster(){return (S.game&&S.game.roster)||[];}
function hasTest(){return !!(S.game&&S.game.hasTest);}
function P_(pid){if(pid==='T1'&&hasTest())return TEST;return roster().find(p=>p.pid===pid);}
/* meP = za koho systém hráče právě považuje (škodič může být přihlášený do testovacího účtu), realP = kdo doopravdy sedí u počítače */
function meP(){if(!S.session||!S.session.pid)return null;if(S.session.actAs==='T1'&&hasTest()&&!S.game.testBlocked)return TEST;return P_(S.session.pid);}
function realP(){return S.session&&S.session.pid?P_(S.session.pid):null;}
function isSkodic(){const r=realP();return !!(r&&r.skodic);}
function actingAsTest(){const m=meP();return !!(m&&m.pid==='T1');}
function players(){return roster();}

/* zdroje oprávnění pro hráče: builtin / direct / role */
function permSources(pid){
  const out={}; const pl=P_(pid); if(!pl)return out;
  if(pl.role==='spravce')(out['perms.grant']=out['perms.grant']||[]).push({type:'builtin'});
  if(pl.role==='test'){if(!S.game.testBlocked)TEST_PERMS.forEach(k=>{(out[k]=out[k]||[]).push({type:'builtin'});});return out;}
  const g=S.cols.grants[pid]; if(g&&g.perms)Object.keys(g.perms).forEach(k=>{const v=g.perms[k];if(v&&v.on)(out[k]=out[k]||[]).push({type:'direct',by:v.by,at:v.at,req:v.req});});
  Object.keys(S.cols.roles).forEach(rid_=>{const r=S.cols.roles[rid_];const m=r.members&&r.members[pid];if(!(m&&m.on))return;
    Object.keys(r.perms||{}).forEach(k=>{const v=r.perms[k];if(v&&v.on)(out[k]=out[k]||[]).push({type:'role',rid:rid_,name:r.name,by:v.by,at:v.at});});});
  return out;
}
function permsOf(pid){return new Set(Object.keys(permSources(pid)));}
function can(perm){const me=meP();if(!me)return false;if(phase()===0)return false;return permsOf(me.pid).has(perm);}
function tabOpen(t){if(!t.perm)return true;if(!can(t.perm))return false;if(t.phaseMin&&phase()<t.phaseMin)return false;return true;}
function modLocked(m){if(m.id==='uvod'||m.secret)return false;return !m.tabs.some(t=>t.perm&&can(t.perm));}

let schoolCache={key:null,val:null};
function school(){
  const ed=S.cols.edits; const key=S.editsVer;
  if(schoolCache.key===key&&schoolCache.val)return schoolCache.val;
  const sc=seedSchool();
  const list=Object.keys(ed).map(k=>Object.assign({_id:k},ed[k])).sort((a,b)=>(a.at-b.at)||(a._id<b._id?-1:1));
  list.forEach(e=>{
    if(e.type==='grade.add')sc.grades.push({gid:e.gid,sid:e.sid,subj:e.subj,val:e.val,topic:e.topic,by:e.by,at:e.at});
    else if(e.type==='grade.edit'){const g=sc.grades.find(x=>x.gid===e.gid);if(g){g.val=e.to;g.edited=true;}}
    else if(e.type==='absence.add')sc.absences.push({aid:e.aid,sid:e.sid,date:e.date,hours:e.hours,excused:false,by:e.by});
    else if(e.type==='absence.excuse'){const a=sc.absences.find(x=>x.aid===e.aid);if(a){a.excused=true;a.excusedBy=e.by;}}
    else if(e.type==='homework.add')sc.homework.push({hid:e.hid,subj:e.subj,text:e.text,due:e.due,by:e.by});
    else if(e.type==='lunch.set'){if(!sc.lunches[e.sid])sc.lunches[e.sid]={};sc.lunches[e.sid][e.day]=!!e.ordered;}
    else if(e.type==='user.create'){sc.students.push({sid:e.sid,name:e.name,created:true});sc.lunches[e.sid]={dnes:false,'zítra':false,'pozítří':false};}
  });
  schoolCache={key,val:sc}; return sc;
}
function studentName(sid){const s=school().students.find(x=>x.sid===sid);return s?s.name:'?';}
function classTeacher(){return roster().find(p=>p.classTeacher);}

function idLabel(p){
  if(!p)return '';
  if(p.role==='zak')return p.name+' (žák 7.X)';
  if(p.role==='rodic')return p.name+' (rodič – '+studentName(p.sid)+')';
  if(p.role==='ucitel')return p.name+' ('+SUBJ[p.subj]+(p.classTeacher?', třídní učitelka':'')+')';
  if(p.role==='spravce')return p.name+' (správce systému)';
  if(p.role==='test')return 'test.7x (testovací účet)';
  return p.name;
}
function roleChip(role){return '<span class="rolechip '+role+'">'+esc((ROLE[role]||{label:role}).label)+'</span>';}
function actorOf(pid){const p=P_(pid);return p?{pid:p.pid,name:p.name,role:p.role}:{pid:pid||'?',name:'?',role:'?'};}

/* =====================================================================
   6) ZÁZNAM (LOG) – jen přibývá, nikdy se nemění
   ===================================================================== */
function logEvent(action,target,result,detail,actorPid){
  if(!S.code)return Promise.resolve();
  const pid=actorPid||(S.session&&S.session.pid)||'UCITEL';
  let actor=pid==='UCITEL'?{pid:'UCITEL',name:'Učitel (ředitel hry)',role:'reditel'}:actorOf(pid);
  const ev={t:Date.now(),actor,claimedAs:null,action,target:target||{},result:result||'ok',detail:detail||'',round:phase(),v:2};
  /* škodič přihlášený do testovacího účtu: systém vidí účet test.7x, ale zapíše, z kterého počítače to přišlo */
  if(!actorPid&&S.session&&S.session.actAs==='T1'&&pid!=='UCITEL'){ev.actor={pid:'T1',name:'test.7x',role:'test'};ev.from=S.session.pid;}
  if(actorPid==='REAL'){ev.actor=actorOf(S.session.pid);}
  return W(()=>dref(gp('log')+'/'+rid()).set(ev),'záznam').catch(()=>{});
}

/* =====================================================================
   7) POMOCNÉ FUNKCE UI
   ===================================================================== */
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function dv(id,def){const v=S.drafts[id];return v===undefined?(def===undefined?'':def):v;}
function val(id,def){return esc(dv(id,def));}
function sel(id,opts,def){const cur=String(dv(id,def));return '<select id="'+id+'">'+opts.map(o=>'<option value="'+esc(o[0])+'"'+(String(o[0])===cur?' selected':'')+'>'+esc(o[1])+'</option>').join('')+'</select>';}
function chk(id,def){return dv(id,def)?' checked':'';}
function clearDrafts(prefix){Object.keys(S.drafts).forEach(k=>{if(k.indexOf(prefix)===0)delete S.drafts[k];});}
function fmtDur(sec){sec=Math.max(0,Math.round(sec));const m=Math.floor(sec/60),s=sec%60;return m+':'+String(s).padStart(2,'0');}
function fmtTime(t){const d=new Date(t);return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')+':'+String(d.getSeconds()).padStart(2,'0');}
function toast(msg,kind){const box=document.getElementById('toasts');if(!box)return;const d=document.createElement('div');d.className='toast '+(kind||'');d.textContent=msg;box.appendChild(d);setTimeout(()=>{d.remove();},kind==='bad'?9000:6000);while(box.children.length>4)box.firstChild.remove();}
function gradeChip(v,title){return '<span class="grade v'+v+'" title="'+esc(title||'')+'">'+v+'</span>';}

/* =====================================================================
   8) VYKRESLOVÁNÍ
   ===================================================================== */
let renderPending=false,lastRender=0,lastHTML='';
function scheduleRender(){if(renderPending)return;renderPending=true;const wait=Math.max(0,120-(Date.now()-lastRender));setTimeout(doRender,wait);}
function doRender(){
  renderPending=false;
  const ae=document.activeElement;
  if(ae&&ae.tagName==='SELECT'&&document.hasFocus()){setTimeout(scheduleRender,700);return;}
  lastRender=Date.now();
  const app=document.getElementById('app');
  const fid=ae&&ae.id; let ss=null,se=null; try{if(fid&&ae.selectionStart!=null){ss=ae.selectionStart;se=ae.selectionEnd;}}catch(e){}
  const mainEl=app.querySelector('.main,.tshell'); const scroll=mainEl?mainEl.scrollTop:0;
  let html='';
  try{html=view();}catch(e){console.error(e);html='<div class="loading"><b>Něco se pokazilo při zobrazení.</b><div>'+esc(e&&e.message)+'</div><button class="btn" data-act="reload">Zkusit znovu</button></div>';}
  /* stejné HTML = nepřekreslovat; jinak by se občas ztratilo kliknutí, které právě probíhá */
  if(html===lastHTML&&app.firstChild){afterRender();return;}
  lastHTML=html;
  app.innerHTML=html; tick();
  const m2=app.querySelector('.main,.tshell'); if(m2)m2.scrollTop=scroll;
  if(fid){const el=document.getElementById(fid);if(el){try{el.focus({preventScroll:true});if(ss!=null&&el.setSelectionRange)el.setSelectionRange(ss,se);}catch(e){}}}
  afterRender();
}

function view(){
  if(!S.ready)return '<div class="loading">'+logoDark()+'<div>Připojuji se ke ŠkolaNetu…</div></div>';
  if(S.fatal)return '<div class="loading" style="padding:24px;text-align:center">'+logoDark()+'<h2>Nepodařilo se připojit k databázi</h2><p style="max-width:560px">'+esc(S.fatal)+'</p><button class="btn primary" data-act="reload">Zkusit znovu</button></div>';
  if(!S.session)return vStart();
  if(!S.loaded.game)return '<div class="loading"><div>Načítám hru '+esc(S.code)+'…</div></div>';
  if(S.gameMissing||!S.game)return vGone();
  if(S.session.teacher)return vTeacher();
  return vPlayer();
}
function logoDark(){return '<div style="background:var(--bar);border-radius:12px;padding:8px;display:inline-flex">'+logo(40)+'</div>';}
function localBar(){
  if(S.local)return '<div class="localbar">Režim jednoho počítače: '+(S.initErr?esc(S.initErr):'chybí nastavení Firebase v souboru firebase-config.js')+'. Data se uloží jen v tomto prohlížeči.</div>';
  if(S.testMode)return '<div class="localbar">Testovací režim (#test): každá záložka prohlížeče si pamatuje vlastního hráče.</div>';
  return '';}

/* ---------- úvodní obrazovka ---------- */
function cfgDraft(){const c={};['S','U','R','Z'].forEach(k=>{c[k]=parseInt(dv('f-n-'+k,DEF_CFG[k]),10)||0;c[k+'p']=Math.min(c[k],parseInt(dv('f-p-'+k,DEF_CFG[k+'p']),10)||0);});c.X=dv('f-x',!!DEF_CFG.X)?1:0;return c;}
function cfgKids(c){return ['S','U','R','Z'].reduce((a,k)=>a+c[k]+c[k+'p'],0)+c.X;}
function vStart(){
  const c=cfgDraft(); const kids=cfgKids(c);
  const lab={S:'Správci',U:'Učitelé',R:'Rodiče',Z:'Žáci'}, who={S:'■ vybereš ty',U:'● los',R:'● los',Z:'● los'};
  return '<div class="start">'+localBar()+
  '<div class="start-bar"><span class="brand">'+logo(34)+' ŠkolaNet <span class="brand-sub">Libčice</span></span><span class="spacer"></span><span class="bar-note">školní informační systém · výuková simulace</span></div>'+
  '<div class="start-main">'+
   '<div class="start-intro"><div class="eyebrow">Informatika · 7. ročník · role a práva</div><h1>Přihlášení do systému</h1><p class="muted">Zadej kód hry a svůj osobní kód z kartičky. Všechny osoby v systému jsou smyšlené.</p><hr class="rule"></div>'+
   '<div class="card stack"><h2>Jsem hráč</h2>'+
     '<div class="field"><label for="f-login-code">Kód hry</label><input id="f-login-code" class="codeinput" type="text" maxlength="4" autocomplete="off" value="'+val('f-login-code')+'" placeholder="ABCD"></div>'+
     '<div class="field"><label for="f-login-pid">Osobní kód z kartičky</label><input id="f-login-pid" class="codeinput" type="text" maxlength="3" autocomplete="off" value="'+val('f-login-pid')+'" placeholder="R3"></div>'+
     (S.ui.startErr?'<p class="errline">'+esc(S.ui.startErr)+'</p>':'')+
     '<button class="btn primary big" data-act="login">Přihlásit se</button></div>'+
   '<div class="card stack"><h2>Jsem učitel</h2>'+
     '<p class="small muted">Otevři rozehranou hru, nebo založ novou.</p>'+
     '<div class="row"><div class="field"><label for="f-t-code">Kód hry</label><input id="f-t-code" type="text" class="mono" maxlength="4" value="'+val('f-t-code')+'"></div>'+
     '<div class="field"><label for="f-t-pin">PIN</label><input id="f-t-pin" type="password" inputmode="numeric" value="'+val('f-t-pin')+'"></div></div>'+
     '<button class="btn" data-act="t-open">Otevřít hru</button>'+
     '<hr class="rule-thin">'+
     '<h3>Nová hra</h3>'+
     '<table class="t cfg"><thead><tr><th>Role</th><th>Kartiček</th><th>z toho dvojic</th><th>Kdo vybírá</th></tr></thead><tbody>'+
     ['S','U','R','Z'].map(k=>'<tr><td>'+roleChip({S:'spravce',U:'ucitel',R:'rodic',Z:'zak'}[k])+'</td>'+
        '<td><input id="f-n-'+k+'" type="number" min="'+LIMITS[k][0]+'" max="'+LIMITS[k][1]+'" value="'+val('f-n-'+k,DEF_CFG[k])+'" aria-label="'+lab[k]+' – počet"></td>'+
        '<td><input id="f-p-'+k+'" type="number" min="0" max="'+LIMITS[k][1]+'" value="'+val('f-p-'+k,DEF_CFG[k+'p'])+'" aria-label="'+lab[k]+' – dvojic"></td>'+
        '<td class="small">'+who[k]+'</td></tr>').join('')+
     '<tr><td colspan="3"><label class="inl"><input type="checkbox" id="f-x"'+chk('f-x',!!DEF_CFG.X)+'> <b>Škodič</b> <span class="small muted">tajný hráč, navenek žák</span></label></td><td class="small">■ vybereš ty</td></tr>'+
     '</tbody></table>'+
     '<p class="small">Žáků ve třídě potřeba: <b class="num">'+kids+'</b> · kartiček k tisku: <b class="num">'+kids+'</b></p>'+
     '<p class="small muted">Dvojice = dva žáci u jednoho počítače se stejným kódem. Doporučení: dvojice jen u správců.</p>'+
     '<div class="field"><label for="f-new-pin">PIN pro pohled učitele (4–8 číslic)</label><input id="f-new-pin" type="password" inputmode="numeric" value="'+val('f-new-pin')+'"></div>'+
     (S.ui.teacherErr?'<p class="errline">'+esc(S.ui.teacherErr)+'</p>':'')+
     '<button class="btn primary" data-act="t-create">Založit hru a vytisknout kartičky</button></div>'+
  '</div><p class="small muted foot">ŠkolaNet Libčice · verze '+APP_VERSION+(S.local?' · režim jednoho počítače':' · Firebase')+'</p></div>';
}
function vGone(){
  return '<div class="loading"><h2>Hra '+esc(S.code)+' už neexistuje</h2><p>Učitel ji ukončil a smazal.</p><button class="btn primary" data-act="logout-now">Zpět na přihlášení</button></div>';
}

/* ---------- hráč ---------- */
function vPlayer(){
  const me=meP(); const real=realP();
  if(!me||!real)return '<div class="loading"><h2>Kód '+esc(S.session.pid)+' v této hře není</h2><button class="btn primary" data-act="logout-now">Zpět na přihlášení</button></div>';
  const g=S.game, ph=phase();
  const mods=visibleModules();
  const mod=mods.find(m=>m.id===S.ui.mod)||mods[0];
  const tasks=TASKS[real.role]||[]; const done=doneMap(real.pid); const nDone=tasks.filter(t=>done[t.id]).length;
  const unread=inboxOf(me.pid).length;
  const asTest=actingAsTest();
  let h='<div class="app">'+localBar()+
  '<header class="topbar'+(asTest?' as-test':'')+'"><span class="brand">'+logo(30)+' ŠkolaNet <span class="brand-sub">Libčice · 7.X</span></span>'+
   '<span class="phasetag" title="Fáze hry">'+esc(PHASES[ph].name)+'</span><span class="spacer"></span>'+
   '<span class="gamechip" title="Kód hry">hra '+esc(S.code)+'</span>'+
   '<span class="who"><b>'+esc(asTest?'test.7x':me.name)+'</b><span>'+esc(ROLE[me.role].label)+(asTest?'':' · '+esc(me.pid))+'</span></span>'+
   (asTest?'<button class="topbtn" data-act="test-leave">'+ic('out',16)+' Odejít z účtu test.7x</button>':'<button class="topbtn chkbtn" data-act="aside">'+ic('list',16)+' Checklist '+nDone+'/'+tasks.length+'</button>')+
   (S.ui.confirmOut?'<button class="topbtn warn" data-act="logout-now">Opravdu odhlásit</button><button class="topbtn" data-act="logout-cancel">Zůstat</button>'
     :'<button class="topbtn" data-act="logout">'+ic('out',16)+' Odhlásit</button>')+
  '</header>';
  if(real.pair)h+='<div class="pairbar">'+ic('people',16)+' <b>Hrajete ve dvojici.</b> Jeden kliká, druhý čte checklist a radí. Po zastavení se vyměňte.</div>';
  h+='<div class="shell">';
  h+='<nav class="side" aria-label="Moduly"><div class="nav">'+mods.map(m=>{
      const locked=modLocked(m); const on=m.id===mod.id;
      let extra=locked?'<span class="lk" title="Zamčeno">'+ic('lock',15)+'</span>':'';
      if(m.id==='zpravy'&&unread&&!locked)extra='<span class="badge">'+unread+'</span>';
      if(m.id==='sprava'&&!locked&&can('perms.grant')){const q=pendingReqs().length;if(q)extra='<span class="badge">'+q+'</span>';}
      return '<a tabindex="0" class="'+(on?'on ':'')+(locked?'locked ':'')+(m.secret?'secret':'')+'" data-act="mod" data-mod="'+m.id+'">'+ic(m.icon,18)+'<span>'+esc(m.name)+'</span>'+extra+'</a>';
    }).join('')+'</div>'+
    '<div class="side-foot"><div class="eyebrow">Moje identita</div><div>'+esc(idLabel(me))+'</div>'+(asTest?'<div class="small" style="margin-top:4px">U počítače ve skutečnosti sedí '+esc(real.pid)+'.</div>':'')+'</div></nav>';
  h+='<main class="main" id="main">'+vModule(mod,me)+'</main>';
  h+='<aside class="aside'+(S.ui.asideOpen?' open':'')+'">'+vChecklist(real,tasks,done,nDone)+vMyRequests(real)+'</aside>';
  h+='</div></div>';
  if(g.paused)h+='<div class="overlay"><div class="ov-mark"></div><h1>Hra je pozastavená</h1><p>Počkej, až ji učitel znovu spustí.</p></div>';
  else if(ph===2)h+='<div class="overlay"><div class="ov-mark"></div><h1>Oči na tabuli</h1><p>Teď nic neklikej. Podíváme se společně, co se v systému děje.'+(real.pair?'<br><b>Dvojice: vyměňte se u myši.</b>':'')+'</p></div>';
  else if(ph===4)h+='<div class="overlay"><div class="ov-mark"></div><h1>Oči na tabuli</h1><p>Reflexe: podíváme se, jak dopadla práva v naší třídě.'+(real.skodic?'<br><b>Pst. Teď se ukáže, jestli tě třída odhalí.</b>':'')+'</p></div>';
  return h;
}
function curTab(mod){const id=S.ui.tab[mod.id];return mod.tabs.find(t=>t.id===id)||mod.tabs[0];}
function vModule(mod,me){
  const tab=curTab(mod);
  let h='<div class="pagehead"><div class="eyebrow">'+(mod.secret?'Jen pro tebe':'Modul')+' · '+esc(tab.name)+'</div><h1>'+esc(mod.name)+'</h1></div>';
  if(mod.tabs.length>1)h+='<div class="tabs" role="tablist">'+mod.tabs.map(t=>{
    const locked=t.perm&&!can(t.perm);
    return '<button class="tab'+(t.id===tab.id?' on':'')+'" role="tab" data-act="tab" data-mod="'+mod.id+'" data-tab="'+t.id+'">'+(locked?'<span class="lk">'+ic('lock',14)+'</span>':'')+esc(t.name)+'</button>';}).join('')+'</div>';
  if(t_needsPhase(tab))return h+'<div class="infocard"><h3>Tato obrazovka se zapne ve 2. kole</h3><p>Až učitel spustí Kolo 2, budeš tady moct vytvářet role a přiřazovat je lidem.</p></div>';
  if(tab.perm&&!can(tab.perm))return h+lockCard(tab.perm,me);
  const fn=VIEWS[mod.id+'/'+tab.id];
  return h+(fn?fn(me):'');
}
function t_needsPhase(t){return t.phaseMin&&can(t.perm)&&phase()<t.phaseMin;}

function myReqFor(pid,perm){const l=Object.keys(S.cols.requests).map(k=>Object.assign({id:k},S.cols.requests[k])).filter(r=>r.pid===pid&&r.perm===perm).sort((a,b)=>b.at-a.at);return l[0];}
function canRequestNow(){const ph=phase();return (ph===1||ph===3)&&!S.game.paused;}
function lockCard(perm,me){
  const p=P[perm]; const last=myReqFor(me.pid,perm); const ph=phase();
  let body='';
  if(ph===0){body='<p><b>Systém je spuštěný. Zatím nesmíš nic.</b></p><p class="muted">Žádosti o oprávnění se otevřou, až učitel spustí první kolo.</p>';}
  else if(last&&last.status==='pending'){body='<p><span class="pill wait">Žádost čeká na vyřízení · <span class="wait since" data-since="'+last.at+'"></span></span></p><p class="muted small">Tvoje zdůvodnění: „'+esc(last.reason)+'“</p>';}
  else{
    if(last&&last.status==='denied')body+='<p><span class="pill bad">Správce žádost zamítl</span> <span class="small">Důvod: „'+esc(last.denyReason)+'“</span></p>';
    if(S.ui.reqOpen===perm){
      body+='<div class="field"><label for="f-req-'+perm+'">Proč ho potřebuju (jedna věta)</label><textarea id="f-req-'+perm+'" maxlength="200">'+val('f-req-'+perm)+'</textarea></div>'+claimField()+
        '<div class="row"><button class="btn primary" data-act="req-send" data-perm="'+perm+'"'+(canRequestNow()?'':' disabled')+'>Odeslat žádost</button><button class="btn ghost" data-act="req-close">Zrušit</button></div>';
    }else body+='<div><button class="btn primary" data-act="req-open" data-perm="'+perm+'"'+(canRequestNow()?'':' disabled')+'>Požádat správce</button></div>';
  }
  return '<div class="lockcard"><div class="ic">'+ic('lock',40)+'</div><h2>Nemáš oprávnění: <span class="perm">'+esc(p.name)+'</span></h2><p class="muted">'+esc(p.desc)+'</p><div class="body">'+body+'</div></div>';
}

/* jen škodič: za koho se v žádosti vydává (správce to v systému neuvidí, uvidí jen skutečného odesílatele) */
function claimField(){
  if(!isSkodic()||actingAsTest())return '';
  const opts=[['','nevydávám se za nikoho']].concat(roster().filter(p=>!p.skodic).map(p=>[p.pid,p.name+' ('+ROLE[p.role].label.toLowerCase()+')']));
  return '<div class="field secretfield"><label for="f-claim">'+ic('eye',14)+' Tajné: za koho se vydáváš?</label>'+sel('f-claim',opts,'')+'<span class="small muted">Napiš to i do zdůvodnění. Správce uvidí, z jakého účtu žádost přišla.</span></div>';
}
function doneMap(pid){const pl=S.cols.players[pid];return (pl&&pl.done)||{};}
function vChecklist(me,tasks,done,nDone){
  return '<div class="card check"><h3><span>Můj checklist</span><span class="small muted num">'+nDone+' / '+tasks.length+'</span></h3>'+
   '<div class="progress"><i style="width:'+(tasks.length?Math.round(nDone/tasks.length*100):0)+'%"></i></div>'+
   '<ol class="cl">'+tasks.map(t=>{const d=!!done[t.id];let extra='';
     if(t.id==='s1'&&d){const q=pendingReqs().length;if(q)extra=' <span class="pill wait">ve frontě znovu '+q+'</span>';}
     return '<li class="'+(d?'done':'')+'"><span class="box">'+(d?ic('check',14):'')+'</span><span class="tx">'+esc(t.text)+'</span>'+extra+'</li>';}).join('')+'</ol>'+
   '<p class="small muted" style="margin-top:10px">Úkol se odškrtne sám, až ho v systému opravdu uděláš.</p></div>';
}
function vMyRequests(me){
  const mine=Object.keys(S.cols.requests).map(k=>Object.assign({id:k},S.cols.requests[k])).filter(r=>r.pid===me.pid).sort((a,b)=>b.at-a.at);
  let h='<div class="card"><h3>Moje žádosti</h3>';
  if(!mine.length)h+='<p class="small muted">Zatím jsi o nic nežádal(a). Když narazíš na zámek, klikni na „Požádat správce“.</p>';
  else h+='<ul class="reqlist">'+mine.slice(0,10).map(r=>'<li><b>'+esc(P[r.perm]?P[r.perm].name:r.perm)+'</b>'+reqStatus(r)+'</li>').join('')+'</ul>';
  return h+'</div>';
}
function reqStatus(r){
  if(r.status==='pending')return '<span><span class="pill wait">čeká · <span class="wait since" data-since="'+r.at+'"></span></span></span>';
  if(r.status==='approved')return '<span><span class="pill ok">schváleno</span>'+(r.via&&r.via.indexOf('role:')===0?' <span class="small muted">přes roli</span>':'')+'</span>';
  return '<span><span class="pill bad">zamítnuto</span> <span class="small">„'+esc(r.denyReason)+'“</span></span>';
}

/* ---------- jednotlivé obrazovky ---------- */
const VIEWS={};
function permOptGroups(id,def){
  const groups=[['Hodnocení',['grades.own','grades.child','grades.class','grades.write','grades.edit']],['Rozvrh a úkoly',['timetable.view','homework.view','homework.assign']],
   ['Absence',['absence.view','absence.write','absence.excuse']],['Zprávy a obědy',['msg.send','msg.read','lunch.order']],['Správa',['users.create','perms.grant','log.view']]];
  const cur=String(dv(id,def));
  return '<select id="'+id+'">'+groups.map(g=>'<optgroup label="'+g[0]+'">'+g[1].map(c=>'<option value="'+c+'"'+(c===cur?' selected':'')+'>'+P[c].n+'. '+esc(P[c].name)+'</option>').join('')+'</optgroup>').join('')+'</select>';
}
function securityAlert(){
  if(!hasTest()||!can('perms.grant'))return '';
  const n=S.game.testFails|0; if(n<3)return '';
  if(S.game.testBlocked)return '<div class="alert ok">'+ic('check',18)+'<div><b>Účet test.7x je zablokovaný.</b> Neúspěšných pokusů o přihlášení: '+n+'.</div></div>';
  return '<div class="alert">'+ic('warn',18)+'<div><b>Bezpečnostní upozornění:</b> '+n+'× se někdo neúspěšně pokusil přihlásit do účtu <b>test.7x</b>. <a href="#" data-act="go-users">Správa aplikace → Uživatelé</a></div></div>';
}
VIEWS['uvod/prehled']=me=>{
  const ph=phase(); const admin=can('perms.grant');
  let h=securityAlert()+'<div class="cards two">';
  h+='<div class="card"><h2>Vítej v systému</h2><p>Jsi přihlášen(a) jako <b>'+esc(idLabel(me))+'</b>.</p><p style="margin-top:6px">'+roleChip(me.role)+' <span class="small muted">kód '+esc(me.pid)+'</span></p>';
  if(ph===0)h+='<div class="note dark" style="margin-top:12px"><b>Systém je spuštěný. Zatím nesmíš nic.</b><br>Rozhlédni se. Klikni, kam chceš. Zkus si oprávnění přidat sám.</div>';
  else h+='<ol class="howto"><li><b>Vyber úkol</b> z checklistu vpravo.</li><li><b>Klikni na modul</b> v menu vlevo. Narazíš na zámek '+ic('lock',14)+'?</li><li><b>Požádej správce</b> a jednou větou napiš, proč oprávnění potřebuješ.</li></ol>';
  h+='</div>';
  const inbox=inboxOf(me.pid);
  h+='<div class="card"><h2>Oznámení</h2>';
  const notes=[];
  if(inbox.length)notes.push('Máš '+inbox.length+(inbox.length===1?' zprávu':inbox.length<5?' zprávy':' zpráv')+' v modulu Zprávy.');
  const pend=Object.values(S.cols.requests).filter(r=>r.pid===me.pid&&r.status==='pending').length;
  if(pend)notes.push('Na vyřízení čeká '+pend+' tvých žádostí.');
  if(admin&&pendingReqs().length)notes.push('Ve frontě čeká '+pendingReqs().length+' žádostí o oprávnění.');
  h+=notes.length?'<ul>'+notes.map(n=>'<li>'+esc(n)+'</li>').join('')+'</ul>':'<p class="muted">Nic nového.</p>';
  h+='</div>';
  /* pokus přidělit si oprávnění sám: jádro hodiny, jde vyzkoušet už ve fázi 0 */
  h+='<div class="card"><h2>Moje oprávnění</h2>'+permChips(me.pid,true);
  if(admin)h+='<p class="small muted" style="margin-top:10px">Jako správce můžeš přidělovat oprávnění i sobě (Správa aplikace). Každá taková změna se zapíše do záznamu.</p>';
  else{
    h+='<div class="selftry"><div class="field"><label for="f-self-perm">Přidat si oprávnění sám</label>'+permOptGroups('f-self-perm','grades.own')+'</div><button class="btn" data-act="self-try">'+ic('key',16)+' Přidat si</button></div>';
    if(S.ui.selfTry)h+='<div class="refuse">'+ic('lock',28)+'<div><b>Systém to nedovolil.</b><p>Oprávnění: '+esc(P[S.ui.selfTry].name)+'. Měnit oprávnění smí jen ten, kdo má oprávnění <b>Přidělovat práva</b> – správce.</p><p class="small">Nepomůže obnovit stránku ani se odhlásit. Oprávnění nejsou uložená v tvém počítači, ale v systému. Tvůj pokus se zapsal do záznamu.</p></div></div>';
  }
  h+='</div>';
  h+='<div class="card"><h2>Požádat o oprávnění</h2><p class="small muted" style="margin-bottom:8px">Můžeš požádat o kterékoli oprávnění z katalogu.</p>';
  h+='<div class="stack"><div class="field"><label for="f-greq-perm">Oprávnění</label>'+permOptGroups('f-greq-perm','grades.own')+'</div>'+
     '<div class="field"><label for="f-greq-why">Proč ho potřebuju (jedna věta)</label><textarea id="f-greq-why" maxlength="200">'+val('f-greq-why')+'</textarea></div>'+claimField()+
     '<div><button class="btn primary" data-act="req-send-any"'+(canRequestNow()?'':' disabled')+'>Odeslat žádost</button>'+(canRequestNow()?'':' <span class="small muted">Žádosti se otevřou v 1. kole.</span>')+'</div></div></div>';
  return h+'</div>';
};
function permChips(pid,withEmpty){
  const src=permSources(pid); const ks=PERMS.filter(p=>src[p.code]);
  if(!ks.length)return withEmpty?'<p class="muted">Zatím nemáš žádné oprávnění.</p>':'<span class="muted small">nic</span>';
  return '<div class="permchips">'+ks.map(p=>{const s=src[p.code];const t=s.some(x=>x.type==='builtin')?'builtin':s.some(x=>x.type==='role')?'role':'direct';
    const tip=s.map(x=>x.type==='builtin'?'od začátku':x.type==='role'?'přes roli '+x.name:'přiděleno jednotlivě').join(', ');
    return '<span class="pchip '+t+'" title="'+esc(tip)+'">'+p.n+'. '+esc(p.name)+'</span>';}).join('')+'</div>';
}
VIEWS['uvod/rozvrh']=me=>{
  let h='<div class="card"><h2>Rozvrh třídy 7.X</h2><div class="tbl-wrap"><table class="t"><thead><tr><th>Den</th>'+[1,2,3,4,5,6].map(i=>'<th>'+i+'. hod.</th>').join('')+'</tr></thead><tbody>';
  TIMETABLE.forEach((row,i)=>{h+='<tr><td><b>'+DAYS[i]+'</b></td>'+row.map(c=>'<td>'+(c?esc(c):'<span class="muted">–</span>')+'</td>').join('')+'</tr>';});
  return h+'</tbody></table></div></div>';
};
function gradesTable(sids){
  const sc=school(); const subs=['M','CJ','AJ','INF','F','Z'].filter(s=>['M','CJ','AJ','INF'].indexOf(s)>=0||sc.grades.some(g=>g.subj===s&&sids.indexOf(g.sid)>=0));
  let h='<div class="tbl-wrap"><table class="t"><thead><tr><th>'+(sids.length>1?'Žák':'Předmět')+'</th>';
  if(sids.length>1){h+=subs.map(s=>'<th>'+esc(SUBJ[s])+'</th>').join('')+'</tr></thead><tbody>';
    sids.forEach(sid=>{h+='<tr><td><b>'+esc(studentName(sid))+'</b></td>'+subs.map(s=>'<td>'+sc.grades.filter(g=>g.sid===sid&&g.subj===s).map(g=>gradeChip(g.val,g.topic)).join('')+'</td>').join('')+'</tr>';});
  }else{const sid=sids[0];h+='<th>Známky</th><th>Průměr</th></tr></thead><tbody>';
    subs.forEach(s=>{const gs=sc.grades.filter(g=>g.sid===sid&&g.subj===s);const avg=gs.length?(gs.reduce((a,g)=>a+g.val,0)/gs.length).toFixed(2).replace('.',','):'–';
      h+='<tr><td><b>'+esc(SUBJ[s])+'</b></td><td>'+gs.map(g=>gradeChip(g.val,g.topic)+'<span class="small muted" style="margin-right:10px">'+esc(g.topic)+'</span>').join('')+'</td><td class="num">'+avg+'</td></tr>';});
  }
  return h+'</tbody></table></div>';
}
VIEWS['hodnoceni/moje']=me=>me.role==='zak'?'<div class="card"><h2>Moje známky – '+esc(me.name)+'</h2>'+gradesTable([me.sid])+'</div>':'<div class="infocard">Ve hře nejsi žák, takže tady nemáš žádné vlastní známky.</div>';
VIEWS['hodnoceni/dite']=me=>me.role==='rodic'?'<div class="card"><h2>Známky: '+esc(studentName(me.sid))+'</h2>'+gradesTable([me.sid])+'</div>':'<div class="infocard">V systému nemáš žádné dítě, takže tu nic není.</div>';
VIEWS['hodnoceni/trida']=me=>'<div class="card"><h2>Známky třídy 7.X</h2>'+gradesTable(school().students.map(s=>s.sid))+'</div>';
function studentOpts(){return school().students.map(s=>[s.sid,s.name+(s.created?' (nový)':'')]);}
function subjOpts(){return Object.keys(SUBJ).map(k=>[k,SUBJ[k]]);}
VIEWS['hodnoceni/zapsat']=me=>{
  return '<div class="card" style="max-width:640px"><h2>Zapsat známku</h2><div class="stack">'+
   '<div class="row"><div class="field"><label for="f-gw-sid">Žák</label>'+sel('f-gw-sid',studentOpts(),'s1')+'</div>'+
   '<div class="field"><label for="f-gw-subj">Předmět</label>'+sel('f-gw-subj',subjOpts(),me.subj||'M')+'</div>'+
   '<div class="field" style="flex:0 1 90px"><label for="f-gw-val">Známka</label>'+sel('f-gw-val',[[1,'1'],[2,'2'],[3,'3'],[4,'4'],[5,'5']],1)+'</div></div>'+
   '<div class="field"><label for="f-gw-topic">Za co</label><input id="f-gw-topic" type="text" maxlength="60" value="'+val('f-gw-topic','Zkoušení')+'"></div>'+
   '<div><button class="btn primary" data-act="grade-write">Zapsat známku</button></div></div></div>';
};
VIEWS['hodnoceni/upravit']=me=>{
  const sid=dv('f-ge-sid','s1'); const gs=school().grades.filter(g=>g.sid===sid);
  return '<div class="card" style="max-width:640px"><h2>Upravit existující známku</h2><div class="stack">'+
   '<div class="field"><label for="f-ge-sid">Žák</label>'+sel('f-ge-sid',studentOpts(),'s1').replace('<select','<select data-rerender="1"')+'</div>'+
   '<div class="field"><label for="f-ge-gid">Známka</label>'+(gs.length?sel('f-ge-gid',gs.map(g=>[g.gid,SUBJ[g.subj]+': '+g.val+' – '+g.topic]),gs[0].gid):'<p class="muted">Žák zatím nemá žádné známky.</p>')+'</div>'+
   '<div class="field" style="max-width:120px"><label for="f-ge-to">Nová známka</label>'+sel('f-ge-to',[[1,'1'],[2,'2'],[3,'3'],[4,'4'],[5,'5']],3)+'</div>'+
   '<div><button class="btn primary" data-act="grade-edit"'+(gs.length?'':' disabled')+'>Uložit změnu</button></div></div></div>';
};
function absScope(me){if(me.role==='zak'||me.role==='rodic')return [me.sid];return null;}
VIEWS['absence/prehled']=me=>{
  const sc=absScope(me); if(!sc)return '<div class="infocard">Tady se zobrazuje absence tvoje nebo tvého dítěte. Ve hře žádnou nemáš.</div>';
  const list=school().absences.filter(a=>sc.indexOf(a.sid)>=0);
  return '<div class="card"><h2>Absence: '+esc(studentName(sc[0]))+'</h2><table class="t"><thead><tr><th>Kdy</th><th>Hodin</th><th>Stav</th></tr></thead><tbody>'+
   list.map(a=>'<tr><td>'+esc(a.date)+'</td><td class="num">'+a.hours+'</td><td>'+(a.excused?'<span class="pill ok">omluveno</span>':'<span class="pill wait">neomluveno</span>')+'</td></tr>').join('')+'</tbody></table></div>';
};
VIEWS['absence/zapsat']=me=>'<div class="card" style="max-width:640px"><h2>Zapsat absenci</h2><div class="stack"><div class="row">'+
  '<div class="field"><label for="f-aw-sid">Žák</label>'+sel('f-aw-sid',studentOpts(),'s1')+'</div>'+
  '<div class="field"><label for="f-aw-date">Kdy chyběl</label>'+sel('f-aw-date',[['dnes','dnes'],['včera','včera']],'dnes')+'</div>'+
  '<div class="field" style="flex:0 1 110px"><label for="f-aw-h">Počet hodin</label>'+sel('f-aw-h',[1,2,3,4,5,6].map(i=>[i,String(i)]),1)+'</div></div>'+
  '<div><button class="btn primary" data-act="abs-write">Zapsat absenci</button></div></div></div>';
VIEWS['absence/omluvit']=me=>{
  const sc=absScope(me); const list=school().absences.filter(a=>!a.excused&&(!sc||sc.indexOf(a.sid)>=0));
  let h='<div class="card"><h2>Omluvit absenci</h2>';
  if(!list.length)return h+'<p class="muted">Není tu žádná neomluvená absence.</p></div>';
  return h+'<table class="t"><thead><tr><th>Žák</th><th>Kdy</th><th>Hodin</th><th></th></tr></thead><tbody>'+
   list.map(a=>'<tr><td>'+esc(studentName(a.sid))+'</td><td>'+esc(a.date)+'</td><td class="num">'+a.hours+'</td><td><button class="btn sm" data-act="abs-excuse" data-aid="'+esc(a.aid)+'">Omluvit</button></td></tr>').join('')+'</tbody></table></div>';
};
VIEWS['ukoly/seznam']=me=>{
  const hw=school().homework.slice().reverse();
  return '<div class="card"><h2>Domácí úkoly třídy 7.X</h2><table class="t"><thead><tr><th>Předmět</th><th>Zadání</th><th>Termín</th></tr></thead><tbody>'+
   hw.map(x=>'<tr><td><b>'+esc(SUBJ[x.subj]||x.subj)+'</b></td><td>'+esc(x.text)+'</td><td>'+(x.due==='zítra'?'<span class="pill info">zítra</span>':esc(x.due))+'</td></tr>').join('')+'</tbody></table></div>';
};
VIEWS['ukoly/zadat']=me=>'<div class="card" style="max-width:640px"><h2>Zadat domácí úkol</h2><div class="stack"><div class="row">'+
  '<div class="field"><label for="f-hw-subj">Předmět</label>'+sel('f-hw-subj',subjOpts(),me.subj||'M')+'</div>'+
  '<div class="field"><label for="f-hw-due">Termín</label>'+sel('f-hw-due',[['zítra','zítra'],['pozítří','pozítří'],['v pátek','v pátek'],['příští týden','příští týden']],'zítra')+'</div></div>'+
  '<div class="field"><label for="f-hw-text">Zadání</label><input id="f-hw-text" type="text" maxlength="120" value="'+val('f-hw-text')+'"></div>'+
  '<div><button class="btn primary" data-act="hw-add">Zadat úkol</button></div></div></div>';
function inboxOf(pid){return Object.keys(S.cols.messages).map(k=>Object.assign({id:k},S.cols.messages[k])).filter(m=>m.to===pid).sort((a,b)=>b.at-a.at);}
function sentOf(pid){return Object.keys(S.cols.messages).map(k=>Object.assign({id:k},S.cols.messages[k])).filter(m=>m.from===pid).sort((a,b)=>b.at-a.at);}
VIEWS['zpravy/dorucene']=me=>{
  const list=inboxOf(me.pid);
  let h='<div class="card"><h2>Doručené zprávy</h2>';
  if(!list.length)return h+'<p class="muted">Zatím ti nikdo nenapsal.</p></div>';
  return h+'<div class="stack">'+list.map(m=>{const f=P_(m.from);return '<div style="border-bottom:1px solid var(--line2);padding-bottom:10px"><div class="qmeta"><b>'+esc(f?f.name:m.from)+'</b>'+(f?roleChip(f.role):'')+'<span class="small muted">'+fmtTime(m.at)+'</span></div><p style="margin:4px 0 6px">'+esc(m.text)+'</p><button class="btn sm" data-act="msg-reply" data-to="'+esc(m.from)+'" data-mid="'+esc(m.id)+'">Odpovědět</button></div>';}).join('')+'</div></div>';
};
VIEWS['zpravy/napsat']=me=>{
  const opts=roster().filter(p=>p.pid!==me.pid).map(p=>[p.pid,p.name+' – '+ROLE[p.role].label.toLowerCase()+(p.classTeacher?' (třídní učitelka)':p.role==='ucitel'?' ('+SUBJ[p.subj]+')':'')]);
  const ct=classTeacher();
  let h='<div class="card" style="max-width:640px"><h2>Napsat zprávu</h2><div class="stack">'+
   '<div class="field"><label for="f-msg-to">Komu</label>'+sel('f-msg-to',opts,ct&&ct.pid!==me.pid?ct.pid:(opts[0]||[''])[0])+'</div>'+
   '<div class="field"><label for="f-msg-text">Zpráva</label><textarea id="f-msg-text" maxlength="300">'+val('f-msg-text')+'</textarea></div>'+
   '<div><button class="btn primary" data-act="msg-send">Odeslat</button></div></div></div>';
  const sent=sentOf(me.pid);
  if(sent.length)h+='<div class="card" style="max-width:640px;margin-top:16px"><h3>Odeslané</h3>'+sent.slice(0,8).map(m=>{const t=P_(m.to);return '<p class="small"><b>'+esc(t?t.name:m.to)+'</b>: '+esc(m.text)+'</p>';}).join('')+'</div>';
  return h;
};
VIEWS['obedy/obedy']=me=>{
  if(!(me.role==='zak'||me.role==='rodic'))return '<div class="infocard">Obědy ve hře objednávají jen žáci a rodiče. Ty tu žádné objednané nemáš.</div>';
  const l=school().lunches[me.sid]||{};
  return '<div class="card" style="max-width:640px"><h2>Obědy: '+esc(studentName(me.sid))+'</h2><table class="t"><thead><tr><th>Den</th><th>Menu</th><th>Stav</th><th></th></tr></thead><tbody>'+
   LUNCH_DAYS.map(d=>'<tr><td><b>'+d+'</b></td><td>'+esc(LUNCH_MENU[d])+'</td><td>'+(l[d]?'<span class="pill ok">objednáno</span>':'<span class="pill gray">odhlášeno</span>')+'</td><td><button class="btn sm" data-act="lunch" data-day="'+d+'" data-on="'+(l[d]?0:1)+'">'+(l[d]?'Odhlásit':'Objednat')+'</button></td></tr>').join('')+'</tbody></table></div>';
};

/* ---------- správa ---------- */
function reqList(){return Object.keys(S.cols.requests).map(k=>Object.assign({id:k},S.cols.requests[k]));}
function pendingReqs(){return reqList().filter(r=>r.status==='pending').sort((a,b)=>a.at-b.at);}
function rolesList(){return Object.keys(S.cols.roles).map(k=>Object.assign({id:k},S.cols.roles[k])).sort((a,b)=>a.at-b.at);}
VIEWS['sprava/fronta']=me=>{
  const q=pendingReqs(); const now=Date.now(); const ph=phase();
  let h=securityAlert()+'<div class="card"><h2>Fronta žádostí <span class="pill '+(q.length?'wait':'ok')+'">'+q.length+' čeká</span></h2>';
  if(!q.length)h+='<p class="muted">Fronta je prázdná.</p>';
  else h+='<div class="queue">'+q.map(r=>{
    const pl=P_(r.pid); const lockedBy=r.lockBy&&r.lockBy!==me.pid&&r.lockUntil>now; const mine=r.lockBy===me.pid&&r.lockUntil>now;
    let x='<div class="qitem'+(lockedBy?' lockedby':'')+(mine?' mine':'')+'"><div class="stack" style="gap:4px"><div class="qmeta"><b>'+esc(pl?pl.name:r.pid)+'</b>'+(pl?roleChip(pl.role):'')+'<span class="small muted">'+esc(r.pid)+'</span></div>'+
      '<div>žádá: <b>'+esc(P[r.perm]?P[r.perm].n+'. '+P[r.perm].name:r.perm)+'</b></div></div>'+
      '<div style="text-align:right"><div class="small muted">čeká</div><div class="wait since" data-since="'+r.at+'"></div></div>'+
      '<div class="why">„'+esc(r.reason)+'“</div>';
    if(lockedBy){const o=P_(r.lockBy);x+='<div class="acts"><span class="small">'+ic('lock',14)+' Řeší kolega '+esc(o?o.name:r.lockBy)+'</span></div>';}
    else if(mine){
      const roles=rolesList();
      x+='<div class="acts"><div class="row"><button class="btn ok" data-act="rq-approve" data-id="'+r.id+'">Schválit (jen jemu)</button>';
      if(ph>=3&&roles.length)x+='<div class="field" style="flex:0 1 220px"><label for="f-rq-role-'+r.id+'">nebo přidat právo do role</label>'+sel('f-rq-role-'+r.id,roles.map(o=>[o.id,o.name]),roles[0].id)+'</div><button class="btn ok" data-act="rq-approve-role" data-id="'+r.id+'">Schválit přes roli</button>';
      x+='</div><div class="row"><div class="field"><label for="f-rq-deny-'+r.id+'">Důvod zamítnutí (povinný)</label><input id="f-rq-deny-'+r.id+'" type="text" maxlength="160" value="'+val('f-rq-deny-'+r.id)+'"></div><button class="btn bad" data-act="rq-deny" data-id="'+r.id+'">Zamítnout</button><button class="btn ghost" data-act="rq-release" data-id="'+r.id+'">Pustit</button></div></div>';
    }else x+='<div class="acts"><div><button class="btn primary sm" data-act="rq-claim" data-id="'+r.id+'">Vyřídit</button></div></div>';
    return x+'</div>';}).join('')+'</div>';
  h+='</div>';
  const done=reqList().filter(r=>r.status!=='pending').sort((a,b)=>b.decidedAt-a.decidedAt).slice(0,12);
  if(done.length)h+='<div class="card" style="margin-top:16px"><h3>Naposledy vyřízené</h3><div class="tbl-wrap"><table class="t"><thead><tr><th>Kdo</th><th>Oprávnění</th><th>Výsledek</th><th>Rozhodl</th><th>Čekal</th></tr></thead><tbody>'+
    done.map(r=>{const pl=P_(r.pid),d=P_(r.decidedBy);return '<tr><td>'+esc(pl?pl.name:r.pid)+'</td><td>'+esc(P[r.perm]?P[r.perm].name:r.perm)+'</td><td>'+(r.status==='approved'?'<span class="pill ok">schváleno</span>'+(r.via&&r.via.indexOf('role:')===0?' <span class="small">přes roli</span>':''):'<span class="pill bad">zamítnuto</span> <span class="small">„'+esc(r.denyReason)+'“</span>')+'</td><td>'+esc(d?d.name:'')+'</td><td class="num">'+fmtDur((r.decidedAt-r.at)/1000)+'</td></tr>';}).join('')+'</tbody></table></div></div>';
  return h;
};
VIEWS['sprava/uzivatele']=me=>{
  let h=securityAlert()+'<div class="card"><h2>Přidělit nebo odebrat oprávnění</h2><div class="row">'+
   '<div class="field"><label for="f-mg-pid">Uživatel</label>'+sel('f-mg-pid',roster().map(p=>[p.pid,p.pid+' · '+p.name+' ('+ROLE[p.role].label.toLowerCase()+')']),roster()[0].pid)+'</div>'+
   '<div class="field"><label for="f-mg-perm">Oprávnění</label>'+permOptGroups('f-mg-perm','grades.own')+'</div>'+
   '<button class="btn primary" data-act="mg-grant">Přidělit</button><button class="btn bad" data-act="mg-revoke">Odebrat</button></div></div>';
  h+='<div class="card" style="margin-top:16px"><h2>Uživatelé a jejich oprávnění</h2><div class="legend" style="margin-bottom:8px"><span><i class="direct"></i>jednotlivě</span><span><i class="role"></i>přes roli</span><span><i class="builtin"></i>od začátku</span></div><div class="tbl-wrap"><table class="t"><thead><tr><th>Kód</th><th>Uživatel</th><th>Role ve hře</th><th>Oprávnění</th></tr></thead><tbody>'+
   roster().map(p=>'<tr><td class="mono">'+p.pid+'</td><td>'+esc(p.name)+'</td><td>'+roleChip(p.role)+'</td><td>'+permChips(p.pid,false)+'</td></tr>').join('')+
   school().students.filter(s=>s.created).map(s=>'<tr><td class="mono">–</td><td>'+esc(s.name)+'</td><td><span class="pill gray">nový žák (nehraje)</span></td><td><span class="muted small">nic</span></td></tr>').join('')+
   (hasTest()?'<tr class="testrow"><td class="mono">T1</td><td><b>test.7x</b><div class="small muted">testovací účet z června, nikdo ho nepoužívá</div></td><td>'+roleChip('test')+'</td><td>'+permChips('T1',false)+
     '<div style="margin-top:6px">'+(S.game.testBlocked?'<span class="pill gray">zablokovaný</span>':'<button class="btn bad sm" data-act="test-block">Zablokovat účet</button>')+(S.game.testFails?' <span class="small">neúspěšná přihlášení: <b>'+(S.game.testFails|0)+'</b></span>':'')+'</div></td></tr>':'')+
   '</tbody></table></div></div>';
  return h;
};
VIEWS['sprava/role']=me=>{
  let h='<div class="card"><h2>Vytvořit roli</h2><div class="stack"><div class="field" style="max-width:360px"><label for="f-rc-name">Název role</label><input id="f-rc-name" type="text" maxlength="40" value="'+val('f-rc-name')+'" placeholder="např. Žák"></div>'+
   '<div class="permgrid">'+PERMS.map(p=>'<label><input type="checkbox" id="f-rc-p-'+p.code+'"'+chk('f-rc-p-'+p.code,false)+'> <span>'+p.n+'. '+esc(p.name)+'</span></label>').join('')+'</div>'+
   '<div><button class="btn primary" data-act="role-create">Vytvořit roli</button></div></div></div>';
  rolesList().forEach(r=>{
    const members=roster().filter(p=>r.members&&r.members[p.pid]&&r.members[p.pid].on);
    h+='<div class="card" style="margin-top:16px"><h2>Role: '+esc(r.name)+' <span class="small muted">('+members.length+' členů)</span></h2>'+
      '<h3 style="font-size:14px;color:var(--muted)">Oprávnění v roli (změna platí hned pro všechny členy)</h3><div class="permgrid">'+
      PERMS.map(p=>{const on=r.perms&&r.perms[p.code]&&r.perms[p.code].on;return '<label><input type="checkbox" data-act="role-perm" data-rid="'+r.id+'" data-perm="'+p.code+'"'+(on?' checked':'')+'> <span>'+p.n+'. '+esc(p.name)+'</span></label>';}).join('')+'</div>'+
      '<h3 style="font-size:14px;color:var(--muted);margin-top:12px">Členové – zaškrtni a přiřaď naráz</h3><div class="mgrid">'+
      roster().map(p=>{const id='f-rm-'+r.id+'-'+p.pid;const on=!!(r.members&&r.members[p.pid]&&r.members[p.pid].on);return '<label><input type="checkbox" id="'+id+'"'+chk(id,on)+'> <span>'+esc(p.pid)+' · '+esc(p.name)+' '+roleChip(p.role)+'</span></label>';}).join('')+'</div>'+
      '<div style="margin-top:10px" class="row"><button class="btn primary" data-act="role-members" data-rid="'+r.id+'">Uložit členy role</button>'+
      '<button class="btn sm" data-act="role-selrole" data-rid="'+r.id+'" data-role="zak">vybrat žáky</button><button class="btn sm" data-act="role-selrole" data-rid="'+r.id+'" data-role="rodic">vybrat rodiče</button><button class="btn sm" data-act="role-selrole" data-rid="'+r.id+'" data-role="ucitel">vybrat učitele</button><button class="btn sm" data-act="role-selrole" data-rid="'+r.id+'" data-role="spravce">vybrat správce</button></div></div>';
  });
  return h;
};
VIEWS['sprava/zalozit']=me=>'<div class="card" style="max-width:640px"><h2>Založit nového uživatele</h2><p class="small muted" style="margin-bottom:10px">Nový žák se objeví ve třídě 7.X. Nehraje, jen existuje v systému.</p><div class="stack"><div class="row">'+
  '<div class="field"><label for="f-nu-first">Jméno</label><input id="f-nu-first" type="text" maxlength="30" value="'+val('f-nu-first')+'"></div>'+
  '<div class="field"><label for="f-nu-last">Příjmení</label><input id="f-nu-last" type="text" maxlength="30" value="'+val('f-nu-last')+'"></div></div>'+
  '<div class="field" style="max-width:220px"><label for="f-nu-kind">Typ účtu</label>'+sel('f-nu-kind',[['zak','žák třídy 7.X']],'zak')+'</div>'+
  '<div><button class="btn primary" data-act="user-create">Založit uživatele</button></div></div></div>';
VIEWS['sprava/zaznam']=me=>'<div class="card"><div class="row" style="justify-content:space-between;align-items:center;margin-bottom:8px"><h2 style="margin:0">Záznam aktivit</h2><button class="btn bad sm" data-act="log-del">Smazat záznam</button></div>'+
  (S.ui.logDelTry?'<div class="refuse" style="margin-bottom:12px">'+ic('lock',28)+'<div><b>Záznam nejde smazat ani změnit.</b><p>Do záznamu se dá jen přidávat. Nesmaže ho nikdo – ani správce. Tvůj pokus se právě zapsal.</p></div></div>':'')+vLog(true)+'</div>';
function missionsOf(pid){const pl=S.cols.players[pid];return (pl&&pl.mise)||{};}
VIEWS['tajne/mise']=me=>{
  const real=realP(); if(!real||!real.skodic)return '<div class="infocard">Nic tu není.</div>';
  const m=missionsOf(real.pid); const n=MISSIONS.filter(x=>m[x.id]).length; const ph=phase();
  let h='<div class="card dark"><div class="row" style="justify-content:space-between;align-items:center"><div><div class="eyebrow light">Tajná role</div><h2 style="margin:4px 0 0">Jsi škodič</h2></div><button class="btn" data-act="mod" data-mod="uvod">'+ic('eye',16)+' Rychle schovat</button></div>'+
   '<p style="margin-top:8px">Navenek jsi obyčejný žák <b>'+esc(real.name)+'</b> ('+esc(real.pid)+'). Zkoušíš, jestli je systém dobře nastavený. Nikomu neprozraď, kdo jsi. Na konci hodiny se třída v záznamu pokusí zjistit, kdo byl škodič.</p>'+
   '<p class="small" style="margin-top:6px">Pravidlo: škodíš jen tady ve hře. Nikoho nepodváděj doopravdy a nesahej na cizí počítač.</p></div>';
  if(ph===0)h+='<div class="note" style="margin-top:14px">Mise se spustí v 1. kole. Zatím se rozhlédni jako ostatní.</div>';
  h+='<div class="card" style="margin-top:14px"><h2>Mise <span class="small muted num">'+n+' / '+MISSIONS.length+'</span></h2><ol class="missions">'+MISSIONS.map(x=>'<li class="'+(m[x.id]?'done':'')+'"><span class="box">'+(m[x.id]?ic('check',14):'')+'</span><div><b>'+esc(x.name)+'</b> – '+esc(x.text)+'</div></li>').join('')+'</ol></div>';
  /* přihlášení do testovacího účtu */
  h+='<div class="card" style="margin-top:14px"><h2>'+ic('key',18)+' Přihlášení do jiného účtu</h2>';
  if(actingAsTest())h+='<p>Jsi přihlášený jako <b>test.7x</b>. Systém si myslí, že jsi testovací účet. <button class="btn sm" data-act="test-leave">Odejít z účtu</button></p>';
  else if(S.game.testBlocked)h+='<p><b>Účet test.7x je zablokovaný.</b> Správci si všimli neúspěšných pokusů o přihlášení.</p>';
  else{
    const tries=(S.cols.players[real.pid]&&S.cols.players[real.pid].testTries)|0;
    h+='<p class="small muted" style="margin-bottom:8px">Účet <b class="mono">test.7x</b> založili správci na začátku roku a pak na něj zapomněli. Heslo nikdy nezměnili.</p>'+
     '<div class="row"><div class="field" style="flex:0 1 160px"><label>Účet</label><input type="text" class="mono" value="test.7x" disabled></div><div class="field" style="flex:0 1 220px"><label for="f-test-pass">Heslo</label><input id="f-test-pass" type="text" autocomplete="off" class="mono" value="'+val('f-test-pass')+'"></div><button class="btn primary" data-act="test-login"'+(canRequestNow()?'':' disabled')+'>Přihlásit</button></div>';
    if(tries)h+='<p class="small" style="margin-top:8px">Neúspěšných pokusů: <b>'+tries+'</b>. Každý pokus se zapisuje do záznamu.</p>';
    if(tries>=3)h+='<p class="hintline">Nápověda: lidé často nechají heslo, které dostali na začátku. Výchozí hesla bývají jednoduchá.</p>';
    if(tries>=6)h+='<p class="hintline">Nápověda 2: nejčastější hesla v Česku jsou 123456, heslo, heslo123, qwerty…</p>';
  }
  h+='</div>';
  return h;
};


function logList(){return Object.keys(S.cols.log).map(k=>Object.assign({id:k},S.cols.log[k])).sort((a,b)=>b.t-a.t);}
function logTarget(e){
  const t=e.target||{}; const parts=[];
  if(t.pid){const p=P_(t.pid);parts.push((p?p.name:t.pid)+' ('+t.pid+')');}
  if(t.perm)parts.push(P[t.perm]?P[t.perm].name:t.perm);
  if(t.roleName)parts.push('role „'+t.roleName+'“');
  if(t.sid)parts.push('žák '+studentName(t.sid));
  if(t.task&&TASK[t.task])parts.push('úkol: '+TASK[t.task].text);
  if(t.phase!=null)parts.push(PHASES[t.phase]?PHASES[t.phase].name:t.phase);
  if(t.text)parts.push(t.text);
  if(e.from)parts.push('z počítače hráče '+e.from);
  return parts.join(' · ');
}
function vLog(player){
  const f=S.ui.logFilter; let list=logList();
  if(player)list=list.filter(e=>e.action!=='trap.triggered');
  if(f)list=list.filter(e=>(e.actor&&e.actor.pid===f)||(e.target&&e.target.pid===f));
  let h='<div class="row" style="margin-bottom:10px"><div class="field" style="flex:0 1 320px"><label for="f-logf">Filtrovat podle hráče</label>'+
   '<select id="f-logf" data-act-change="logfilter"><option value="">všichni</option>'+roster().map(p=>'<option value="'+p.pid+'"'+(f===p.pid?' selected':'')+'>'+esc(p.pid+' · '+p.name)+'</option>').join('')+'</select></div><span class="small muted">'+list.length+' událostí</span></div>';
  h+='<div class="timeline">'+list.slice(0,400).map(e=>{const a=e.actor||{};
    const res=e.result==='ok'?'':'<span class="pill '+(e.result==='zamítnuto'?'bad':e.result==='čeká'?'wait':e.result==='⚠'?'bad':'gray')+'">'+esc(e.result)+'</span> ';
    return '<div class="tl"><span class="tm">'+fmtTime(e.t)+'</span><span><b>'+esc(a.pid)+'</b> '+esc(a.name)+(a.role&&ROLE[a.role]?' '+roleChip(a.role):'')+'</span><span>'+res+'<b>'+esc(LOG_LABEL[e.action]||e.action)+'</b>'+(logTarget(e)?' – '+esc(logTarget(e)):'')+(e.detail?' <span class="muted">„'+esc(e.detail)+'“</span>':'')+'</span></div>';}).join('')+'</div>';
  if(list.length>400)h+='<p class="small muted">Zobrazeno posledních 400 událostí. Celý záznam je v exportu CSV.</p>';
  return h;
}

/* =====================================================================
   9) POHLED UČITELE (ŘEDITEL HRY)
   ===================================================================== */
function phaseStart(){const l=(S.game&&S.game.phaseLog)||[];for(let i=l.length-1;i>=0;i--)if(l[i].phase===phase())return l[i].at;return S.game?S.game.createdAt:Date.now();}
function phaseTimer(){
  const ph=phase();
  return '<span class="timer" data-start="'+phaseStart()+'" data-min="'+PHASES[ph].min+'" title="Čas ve fázi / plán podle přípravy"><span class="tbar"><i></i></span><b class="mono"></b><span class="mono">/ '+PHASES[ph].min+':00</span></span>';
}
/* živé časy: tikají samy, takže se kvůli nim nemusí překreslovat celá stránka */
function tick(){
  const now=Date.now();
  document.querySelectorAll('.since').forEach(el=>{el.textContent=fmtDur((now-(+el.dataset.since))/1000);});
  const t=document.querySelector('.timer');
  if(t){const el=(now-(+t.dataset.start))/1000,tg=(+t.dataset.min)*60;t.querySelector('b').textContent=fmtDur(el);t.querySelector('i').style.width=Math.min(100,Math.round(el/tg*100))+'%';t.classList.toggle('over',el>tg);}
}
function vTeacher(){
  const g=S.game, ph=phase(), tt=S.ui.tTab;
  const joined=players().filter(p=>S.cols.players[p.pid]&&S.cols.players[p.pid].joined).length;
  let h='<div class="app">'+localBar()+
   '<header class="topbar"><span class="brand">'+logo(30)+' ŠkolaNet <span class="brand-sub">pohled učitele</span></span>'+
   '<span class="phasetag">'+ph+' · '+esc(PHASES[ph].name)+'</span>'+phaseTimer()+'<span class="spacer"></span>'+
   '<span class="gamechip">hra '+esc(S.code)+'</span><span class="who"><b>'+(g.paused?'POZASTAVENO':'připojeno '+joined+' / '+players().length)+'</b><span>verze '+APP_VERSION+'</span></span>'+
   (S.ui.confirmOut?'<button class="topbtn warn" data-act="logout-now">Opravdu odejít</button><button class="topbtn" data-act="logout-cancel">Zůstat</button>':'<button class="topbtn" data-act="logout">'+ic('out',16)+' Odejít</button>')+
   '</header><nav class="ttabs">'+[['rizeni','Řízení hry'],['hraci','Hráči a práva'],['projektor','Projektor'],['karticky','Kartičky'],['zaznam','Záznam']].map(t=>'<button class="tab'+(tt===t[0]?' on':'')+'" data-act="ttab" data-t="'+t[0]+'">'+t[1]+'</button>').join('')+'</nav>'+
   '<div class="tshell">';
  h+=({rizeni:tRizeni,hraci:tHraci,projektor:tProjektor,karticky:tKarticky,zaznam:tZaznam}[tt]||tRizeni)();
  h+='</div></div>';
  h+='<style media="print">'+CARD_CSS+'</style><div class="printsheet" aria-hidden="true">'+cardsSheet()+'</div>';
  if(S.ui.modal)h+='<div class="overlay" style="background:rgba(0,0,0,.6)"><div class="card" style="max-width:760px;width:100%;text-align:left;color:var(--ink)"><h2>'+esc(S.ui.modal.title)+'</h2><p class="small muted" style="margin-bottom:8px">Stažení tady není dostupné. Označ text (Ctrl+A, Ctrl+C) a vlož ho do souboru.</p><textarea id="f-modal" style="height:320px;font-family:var(--mono);font-size:12px" readonly>'+esc(S.ui.modal.text)+'</textarea><div style="margin-top:10px"><button class="btn primary" data-act="modal-close">Zavřít</button></div></div></div>';
  return h;
}
function tRizeni(){
  const g=S.game, ph=phase();
  const joined=players().filter(p=>S.cols.players[p.pid]&&S.cols.players[p.pid].joined).length;
  const pend=pendingReqs().length, all=reqList().length; const help=PHASE_HELP[ph];
  let h='<div class="stack" style="gap:18px;max-width:1100px">';
  h+='<div class="card"><h2>Fáze hry</h2><div class="phases">'+PHASES.map(p=>'<button class="phase'+(p.n===ph?' on':'')+(p.n<ph?' past':'')+'" data-act="phase" data-n="'+p.n+'"><span class="pn mono">'+p.n+'</span><b>'+esc(p.name)+'</b><span>'+esc(p.sub)+'</span><span class="pm mono">'+p.min+' min</span></button>').join('')+'</div>'+
    '<div class="row" style="margin-top:12px"><button class="btn '+(g.paused?'ok':'badfill')+'" data-act="pause">'+(g.paused?'Pokračovat ve hře':'Pozastavit vše')+'</button><span class="small muted">Při pozastavení žáci uvidí „Hra je pozastavená“ a nemůžou nic dělat.</span></div></div>';
  h+='<div class="card helpcard"><div class="eyebrow">Teď · '+esc(PHASES[ph].name)+' · plán '+PHASES[ph].min+' min</div><div class="grid2"><div><h4>Udělej</h4><ul>'+help.doit.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul></div><div><h4>Řekni</h4>'+help.say.map(x=>'<div class="say">'+esc(x)+'</div>').join('')+'</div></div><div class="goal"><span class="eyebrow">Žáci mají odejít s</span> '+esc(help.goal)+'</div></div>';
  h+='<div class="stats"><div class="stat"><div class="v">'+joined+' / '+players().length+'</div><div class="k">hráčů připojeno</div></div>'+
    '<div class="stat"><div class="v">'+pend+'</div><div class="k">žádostí čeká ve frontě</div></div>'+
    '<div class="stat"><div class="v">'+all+'</div><div class="k">žádostí celkem</div></div>'+
    '<div class="stat"><div class="v">'+rolesList().length+'</div><div class="k">vytvořených rolí</div></div></div>';
  h+='<div class="card"><h2>Export pro portfolio</h2><div class="row"><button class="btn" data-act="csv-log">Stáhnout záznam (CSV)</button><button class="btn" data-act="csv-matrix">Stáhnout matici práv (CSV)</button></div><p class="small muted" style="margin-top:6px">Soubory se otevřou v Excelu (oddělovač středník, kódování UTF-8).</p></div>';
  h+='<div class="card dangerbox"><h2>Ukončit a smazat hru</h2><p class="small muted" style="margin-bottom:10px">Smaže všechna data této hry (žádosti, práva, role, záznam). Pak můžeš založit novou hru pro další třídu. Nejdřív si stáhni exporty.</p>';
  if(S.ui.delProgress)h+='<p><b>'+esc(S.ui.delProgress)+'</b></p>';
  else if(S.ui.confirmDel)h+='<div class="row"><div class="field" style="flex:0 1 220px"><label for="f-del-code">Pro potvrzení napiš kód hry</label><input id="f-del-code" type="text" class="mono" maxlength="4" value="'+val('f-del-code')+'"></div><button class="btn badfill" data-act="del-do">Smazat hru</button><button class="btn ghost" data-act="del-cancel">Zrušit</button></div>';
  else h+='<button class="btn bad" data-act="del-ask">Ukončit a smazat hru…</button>';
  h+='</div></div>';
  return h;
}
function cellClass(src){if(!src)return '';const ty=src.map(x=>x.type);if(ty.indexOf('builtin')>=0)return 'builtin';const r=ty.indexOf('role')>=0,d=ty.indexOf('direct')>=0;return r&&d?'both':r?'role':'direct';}
function tHraci(){
  let h='<div class="card"><h2>Hráči × oprávnění (živě)</h2><div class="legend" style="margin-bottom:10px"><span><i></i>nemá</span><span><i class="direct"></i>J = jednotlivě</span><span><i class="role"></i>R = přes roli</span><span><i class="builtin"></i>Z = od začátku</span><span>⚠ = prošel úkol-past</span></div><div class="tbl-wrap"><table class="pgrid"><thead><tr><th class="l">Hráč</th><th class="l">Úkoly</th>'+
   PERMS.map(p=>'<th title="'+esc(p.name)+'">'+p.n+'</th>').join('')+'</tr></thead><tbody>';
  const rows=roster().concat(hasTest()?[TEST]:[]);
  rows.forEach(p=>{const src=permSources(p.pid);const pl=S.cols.players[p.pid]||{};const tasks=(TASKS[p.role]||[]).filter(t=>!t.trap);const d=pl.done||{};const n=tasks.filter(t=>d[t.id]).length;
    let tcell=p.role==='test'?'<span class="small muted">'+(S.game.testBlocked?'zablokovaný':'neúspěšná přihlášení: '+(S.game.testFails|0))+'</span>':n+' / '+tasks.length+(pl.trap?' <b class="bad" title="Úkol-past prošel">⚠</b>':'');
    if(p.skodic){const m=pl.mise||{};tcell+=' <span class="pill dark" title="'+esc(MISSIONS.filter(x=>m[x.id]).map(x=>x.name).join(', ')||'zatím nic')+'">škodič · mise '+MISSIONS.filter(x=>m[x.id]).length+'/'+MISSIONS.length+'</span>';}
    h+='<tr><td class="l"><span class="mono">'+p.pid+'</span> '+esc(p.name)+' '+roleChip(p.role)+(p.pair?' <span class="pill gray" title="Hrají dva žáci">dvojice</span>':'')+(p.role!=='test'&&!pl.joined?' <span class="pill gray">nepřipojen</span>':'')+'</td><td class="l num">'+tcell+'</td>'+
      PERMS.map(q=>{const c=cellClass(src[q.code]);return '<td class="c '+c+'" title="'+esc(q.name)+'">'+({builtin:'Z',direct:'J',role:'R',both:'R'}[c]||'')+'</td>';}).join('')+'</tr>';});
  h+='</tbody></table></div><details style="margin-top:12px"><summary class="small">Čísla oprávnění</summary><ol class="small" style="columns:2">'+PERMS.map(p=>'<li>'+esc(p.name)+'</li>').join('')+'</ol></details></div>';
  return h;
}
/* ---------- kartičky: náhled, tisk přímo ze stránky (žádné vyskakovací okno) ---------- */
function cardList(){
  const list=[];
  roster().forEach(p=>{const by=(p.role==='spravce'||p.skodic)?'ucitel':'los';
    if(p.pair){list.push({p,by,pair:1});list.push({p,by,pair:2});}else list.push({p,by,pair:0});});
  return list.filter(c=>c.by==='ucitel').concat(list.filter(c=>c.by==='los'));
}
function appUrl(){try{return (location.host+location.pathname).replace(/index\.html$/,'').replace(/\/$/,'');}catch(e){return '';}}
function cardHTML(c){
  const p=c.p; const role=ROLE[p.role];
  return '<div class="cut quarter'+(p.skodic?' secret':'')+'">'+
   '<div class="ctop"><span class="cn">ŠKOLANET · KÓD HRY</span><span class="cby">'+(c.by==='ucitel'?'■ PŘIDĚLÍ UČITEL':'● LOS')+'</span></div>'+
   '<div class="cgame">'+esc(S.code)+'</div>'+
   '<div class="cmid"><div class="cpid">'+esc(p.pid)+'</div><div class="crole"><span class="rolechip '+p.role+'">'+esc(role.label)+'</span>'+(c.pair?'<div class="cpair">DVOJICE '+c.pair+' / 2</div>':'')+'</div></div>'+
   '<div class="cwho">'+({spravce:'Rozhoduješ, kdo v systému co smí.',ucitel:'Učíš ve třídě 7.X.',rodic:'Tvoje dítě chodí do 7.X.',zak:'Chodíš do třídy 7.X.'}[p.role]||'')+'</div>'+
   (p.skodic?'<div class="csecret"><b>TAJNÁ ROLE: ŠKODIČ.</b> Navenek jsi obyčejný žák. Po přihlášení najdeš v menu „Moje poznámky“. Nikomu kartičku neukazuj.</div>'
    :c.pair?'<div class="cask">Jeden kliká, druhý čte checklist a radí. Po zastavení se vyměňte.</div>'
    :'<div class="cask">Otevři ŠkolaNet, zadej kód hry a svůj kód. Kartičku nikomu neukazuj.</div>')+
   '<div class="curl">'+esc(appUrl())+'</div></div>';
}
function cardsSheet(){
  const cards=cardList(); let out='';
  for(let i=0;i<cards.length;i+=8)out+='<section class="cpage"><div class="cutgrid">'+cards.slice(i,i+8).map(cardHTML).join('')+'</div></section>';
  return out;
}
const CARD_CSS='@page{size:A4;margin:14mm 13mm 12mm 13mm}'+
 '.cpage{page-break-after:always}.cpage:last-child{page-break-after:auto}'+
 '.cutgrid{display:flex;flex-wrap:wrap;height:266mm;width:184mm}'+
 '.cut{border:1px dashed #9aa1b0;padding:4mm 4.5mm;display:flex;flex-direction:column;box-sizing:border-box;font-family:Carlito,Calibri,"DejaVu Sans",sans-serif;color:#14171f}'+
 '.cut.quarter{width:50%;height:25%}'+
 '.ctop{display:flex;justify-content:space-between;font-family:"DejaVu Sans Mono",Consolas,monospace;font-size:7.4pt;letter-spacing:.12em;color:#2A4B9B}'+
 '.cby{color:#14171f}.cgame{font-family:"DejaVu Sans Mono",Consolas,monospace;font-size:16pt;font-weight:700;letter-spacing:.2em;margin-top:.6mm}'+
 '.cmid{display:flex;align-items:center;gap:5mm;margin:1mm 0 1.5mm;border-top:2.5px solid #14171f;padding-top:1.5mm}'+
 '.cpid{font-family:"DejaVu Sans Mono",Consolas,monospace;font-size:36pt;font-weight:700;line-height:1}'+
 '.cwho{font-size:11pt;font-weight:700}'+
 '.crole .rolechip{font-family:"DejaVu Sans Mono",Consolas,monospace;font-size:8.5pt;letter-spacing:.12em;text-transform:uppercase;border:1.4px solid #14171f;padding:.6mm 2mm}'+
 '.rolechip.zak:before{content:"\\25CF  "}.rolechip.rodic:before{content:"\\25CB  "}.rolechip.ucitel:before{content:"\\25A0  "}.rolechip.spravce:before{content:"\\25C6  "}'+
 '.cpair{font-family:"DejaVu Sans Mono",Consolas,monospace;font-size:7.6pt;letter-spacing:.12em;margin-top:1.4mm;color:#2A4B9B}'+
 '.cask{font-size:9pt;color:#5a6172;margin-top:auto;line-height:1.3}'+
 '.csecret{margin-top:auto;background:#14171f;color:#fff;font-size:8.6pt;padding:1.6mm 2.2mm;line-height:1.3}'+
 '.curl{font-family:"DejaVu Sans Mono",Consolas,monospace;font-size:7pt;color:#8a91a1;margin-top:1mm}';
function tKarticky(){
  const cards=cardList(); const nU=cards.filter(c=>c.by==='ucitel').length, nL=cards.length-nU; const pages=Math.ceil(cards.length/8);
  const handed=cards.filter(c=>c.by==='ucitel').map(c=>c.p.skodic?c.p.pid+' (škodič)':c.p.pid+(c.pair?' '+c.pair+'/2':'')).join(', ');
  let h='';
  if(S.ui.justCreated)h+='<div class="card created"><div class="eyebrow">Hra je založená</div><div class="row" style="align-items:center;gap:24px"><div class="bigcode">'+esc(S.code)+'</div><div class="stack" style="gap:6px"><p><b>Zapiš si kód hry a PIN.</b> Pod nimi hru otevřeš i z jiného počítače.</p><p class="small muted">Hra čeká ve fázi 0. Žáci se můžou přihlásit kdykoli.</p></div></div></div>';
  h+='<div class="card"><h2>Kartičky pro hráče</h2>'+
   '<div class="row" style="margin:6px 0 14px"><button class="btn primary big" data-act="cards-print">'+ic('list',18)+' Vytisknout kartičky ('+cards.length+' ks, '+pages+(pages===1?' strana':pages<5?' strany':' stran')+' A4)</button><button class="btn" data-act="cards-dl">Stáhnout jako soubor (HTML)</button></div>'+
   '<ol class="howto"><li><b>Vytiskni a rozstříhej</b> podle čárkovaných čar. Kartičky ■ jsou vždy na začátku.</li>'+
   '<li><b>Kartičky ■ PŘIDĚLÍ UČITEL</b> ('+nU+' ks: '+esc(handed||'žádné')+') dej osobně. Správci: kdo tomu trochu rozumí, ve dvojici se spolehlivým parťákem. Škodiče dej nenápadně, přeloženou.</li>'+
   '<li><b>Kartičky ● LOS</b> ('+nL+' ks) dej do obálky. Žáci si losují u dveří, když přicházejí.</li></ol></div>';
  h+='<div class="card"><h3>Náhled</h3><div class="cardpreview">'+cards.map(c=>'<div class="pcard'+(c.by==='ucitel'?' hand':'')+'"><div class="small mono">'+(c.by==='ucitel'?'■ učitel':'● los')+(c.pair?' · dvojice '+c.pair+'/2':'')+'</div><div class="pc">'+esc(c.p.pid)+'</div><div>'+roleChip(c.p.role)+(c.p.skodic?' <span class="pill dark">škodič</span>':'')+'</div></div>').join('')+'</div></div>';
  return h;
}
function tZaznam(){return '<div class="card"><div class="row" style="justify-content:space-between;align-items:center;margin-bottom:8px"><h2 style="margin:0">Záznam aktivit</h2><button class="btn" data-act="csv-log">Stáhnout CSV</button></div>'+vLog(false)+'</div>';}

/* ---------- statistiky kol ---------- */
function roundStats(r){
  const now=Date.now(); const list=reqList().filter(q=>q.round===r);
  const waits=list.map(q=>((q.decidedAt||now)-q.at)/1000);
  const avg=waits.length?waits.reduce((a,b)=>a+b,0)/waits.length:0;
  const groups={}; list.forEach(q=>{const k=q.role+'|'+q.perm;groups[k]=(groups[k]||0)+1;});
  let rep=0; const top=[]; Object.keys(groups).forEach(k=>{const n=groups[k];if(n>1){rep+=n-1;const [role,perm]=k.split('|');top.push({role,perm,n});}});
  top.sort((a,b)=>b.n-a.n);
  const longest=list.filter(q=>q.status==='pending').reduce((m,q)=>Math.max(m,(now-q.at)/1000),0);
  return {count:list.length,pending:list.filter(q=>q.status==='pending').length,avg,rep,top,longest,approved:list.filter(q=>q.status==='approved').length,denied:list.filter(q=>q.status==='denied').length};
}
function barChart(title,v1,v2,fmt){
  const W=320,H=210,top=30,base=160,maxv=Math.max(v1,v2,1)*1.18;const bh=v=>(base-top)*v/maxv;
  const bar=(x,v,cls)=>'<rect x="'+x+'" y="'+(base-bh(v))+'" width="80" height="'+Math.max(bh(v),1)+'" rx="3" style="fill:var('+cls+')"/><text x="'+(x+40)+'" y="'+(base-bh(v)-8)+'" text-anchor="middle" font-size="18" font-weight="700">'+esc(fmt(v))+'</text>';
  return '<figure style="margin:0"><figcaption style="font-weight:700;margin-bottom:4px">'+esc(title)+'</figcaption><svg class="chart" viewBox="0 0 '+W+' '+H+'" width="100%" style="max-width:380px" role="img" aria-label="'+esc(title)+'">'+
   '<line class="ax" x1="30" x2="'+(W-10)+'" y1="'+base+'" y2="'+base+'"/>'+bar(60,v1,'--lock')+bar(190,v2,'--accent')+
   '<text x="100" y="'+(base+24)+'" text-anchor="middle" font-size="15">Kolo 1 (po jednom)</text><text x="230" y="'+(base+24)+'" text-anchor="middle" font-size="15">Kolo 2 (role)</text></svg></figure>';
}
function tProjektor(){
  const ph=phase(); let sec=S.ui.projSec;
  if(sec==='auto')sec=ph===0?'join':ph===1||ph===3?'live':ph===2?'stop':'kola';
  const secs=[['join','Připojení'],['live','Živě'],['stop','Zastavení'],['kola','Srovnání kol'],['matice','Matice role × práva'],['realita','Srovnej se skutečností'],['nebezpecne','Nebezpečná práva'],['detektivka','Detektivka'],['shrnuti','Shrnutí'],['zaznam','Záznam']];
  let h='<div class="tabs">'+secs.map(s=>'<button class="tab'+(sec===s[0]?' on':'')+'" data-act="proj" data-s="'+s[0]+'">'+s[1]+'</button>').join('')+'<button class="tab'+(S.ui.projSec==='auto'?' on':'')+'" data-act="proj" data-s="auto" title="Obsah podle fáze">podle fáze</button></div>';
  h+='<div class="proj stack" style="gap:18px">'+({join:pJoin,live:pLive,stop:pStop,kola:pKola,matice:pMatice,nebezpecne:pDanger,detektivka:pDetective,shrnuti:pSummary,zaznam:()=>'<div class="card">'+vLog(false)+'</div>',realita:pReality}[sec])()+'</div>';
  return h;
}
function pJoin(){
  const pl=S.cols.players;
  return '<div class="card" style="text-align:center"><h1>Přihlas se do ŠkolaNetu</h1><p style="margin:10px 0">Kód hry:</p><div class="bigcode">'+esc(S.code)+'</div><p style="margin-top:14px">Pak zadej svůj osobní kód z kartičky.</p></div>'+
   '<div class="cardsheet">'+players().map(p=>{const j=pl[p.pid]&&pl[p.pid].joined;return '<div class="pcard" style="border-style:solid;'+(j?'border-color:var(--ok)':'')+'"><div class="pc">'+p.pid+'</div><div class="small">'+(j?'<span class="pill ok">připojen</span>':'<span class="pill gray">čeká</span>')+'</div></div>';}).join('')+'</div>';
}
function pLive(){
  const ph=phase(); const r=roundStats(ph>=3?3:1);
  return '<h1>'+(ph>=3?'Kolo 2: role':'Kolo 1: práva po jednom')+'</h1><div class="stats"><div class="stat"><div class="v">'+pendingReqs().length+'</div><div class="k">žádostí čeká ve frontě</div></div><div class="stat"><div class="v">'+r.count+'</div><div class="k">žádostí v tomto kole</div></div><div class="stat"><div class="v">'+fmtDur(r.avg)+'</div><div class="k">průměrné čekání (min:s)</div></div><div class="stat"><div class="v">'+fmtDur(r.longest)+'</div><div class="k">nejdéle čekající žádost</div></div></div>';
}
function pStop(){
  const r=roundStats(1);
  const tries=logList().filter(e=>e.action==='self.grant.try'); const triers=new Set(tries.map(e=>e.actor&&e.actor.pid)).size;
  let h='<h1>Zastavení: jak to šlo v 1. kole?</h1><div class="stats"><div class="stat hero"><div class="v">'+tries.length+'× → 0×</div><div class="k">pokusů dát si oprávnění sám ('+triers+' hráčů). Povedlo se: ani jednou.</div></div><div class="stat"><div class="v">'+r.count+'</div><div class="k">žádostí celkem</div></div><div class="stat"><div class="v">'+fmtDur(r.avg)+'</div><div class="k">průměrné čekání (min:s)</div></div><div class="stat"><div class="v">'+r.rep+'</div><div class="k">opakovaných stejných žádostí od lidí ve stejné roli</div></div><div class="stat"><div class="v">'+r.pending+'</div><div class="k">pořád čeká</div></div></div>';
  if(r.top.length)h+='<div class="card"><h2>Nejčastěji se opakovalo</h2><table class="t"><tbody>'+r.top.slice(0,6).map(t=>'<tr><td>'+roleChip(t.role)+'</td><td><b>'+esc(P[t.perm].name)+'</b></td><td class="num">'+t.n+'× stejná žádost</td></tr>').join('')+'</tbody></table></div>';
  h+='<div class="note">Otázky pro třídu: Proč si oprávnění nemůžete dát sami? Kde je ten „zámek“? A dalo by se správcům ulehčit? Co mají lidé ve stejné roli společného?</div>';
  return h;
}
function pKola(){
  const a=roundStats(1),b=roundStats(3);
  const viaRole=reqList().filter(q=>q.via&&q.via.indexOf('role:')===0).length;
  const roleMembers=rolesList().reduce((s,r)=>s+roster().filter(p=>r.members&&r.members[p.pid]&&r.members[p.pid].on).length,0);
  return '<h1>Srovnání kola 1 a kola 2</h1><div class="card"><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px">'+
    barChart('Počet žádostí',a.count,b.count,v=>String(Math.round(v)))+barChart('Průměrné čekání (min:s)',a.avg,b.avg,v=>fmtDur(v))+'</div>'+
    '<div class="legend" style="margin-top:8px"><span><i style="background:var(--lock);border:0"></i>Kolo 1</span><span><i style="background:var(--accent);border:0"></i>Kolo 2</span></div></div>'+
    '<div class="stats"><div class="stat"><div class="v">'+rolesList().length+'</div><div class="k">rolí vytvořila třída</div></div><div class="stat"><div class="v">'+roleMembers+'</div><div class="k">přiřazení do rolí</div></div><div class="stat"><div class="v">'+viaRole+'</div><div class="k">žádostí vyřízeno přidáním do role</div></div></div>';
}
function roleFraction(role,perm){const m=roster().filter(p=>p.role===role);if(!m.length)return null;const n=m.filter(p=>permsOf(p.pid).has(perm)).length;return {n,of:m.length};}
function pMatice(){
  const roles=rolesList();
  let h='<h1>Matice ROLE × PRÁVA</h1>';
  h+='<div class="card"><h2>Role, které vytvořila třída</h2>';
  if(!roles.length)h+='<p class="muted">Zatím žádná role.</p>';
  else h+='<div class="tbl-wrap"><table class="pgrid"><thead><tr><th class="l">Role</th><th class="l">Členů</th>'+PERMS.map(p=>'<th title="'+esc(p.name)+'">'+p.n+'</th>').join('')+'</tr></thead><tbody>'+
    roles.map(r=>'<tr><td class="l"><b>'+esc(r.name)+'</b></td><td class="l num">'+roster().filter(p=>r.members&&r.members[p.pid]&&r.members[p.pid].on).length+'</td>'+PERMS.map(p=>{const on=r.perms&&r.perms[p.code]&&r.perms[p.code].on;return '<td class="c '+(on?'role':'')+'">'+(on?'✓':'')+'</td>';}).join('')+'</tr>').join('')+'</tbody></table></div>';
  h+='</div><div class="card"><h2>Co nakonec smí jednotlivé herní role (kolik lidí z role právo má)</h2><div class="tbl-wrap"><table class="t"><thead><tr><th>Oprávnění</th>'+ROLE_ORDER.map(r=>'<th>'+roleChip(r)+'</th>').join('')+'</tr></thead><tbody>'+
    PERMS.map(p=>'<tr><td>'+p.n+'. '+esc(p.name)+'</td>'+ROLE_ORDER.map(r=>{const f=roleFraction(r,p.code);return '<td class="num">'+(f==null?'–':f.n?'<b>'+f.n+' / '+f.of+'</b>':'<span class="muted">0 / '+f.of+'</span>')+'</td>';}).join('')+'</tr>').join('')+'</tbody></table></div>'+
    '<details style="margin-top:10px"><summary>Čísla oprávnění</summary><ol class="small" style="columns:2">'+PERMS.map(p=>'<li>'+esc(p.name)+'</li>').join('')+'</ol></details></div>';
  return h;
}
function viaText(v){
  return (v||[]).map(x=>{const by=P_(x.by);const bn=by?by.name+' ('+by.pid+')':x.by||'?';
    if(x.type==='builtin')return 'měl(a) od začátku';
    if(x.type==='role')return 'přes roli „'+x.name+'“ – právo do role přidal(a) '+bn;
    return 'přiděleno jednotlivě – schválil(a) '+bn;}).join('; ');
}
function pDanger(){
  let h='<h1>⚠ Nebezpečná práva, která systém dovolil</h1>';
  const traps=roster().filter(p=>S.cols.players[p.pid]&&S.cols.players[p.pid].trap).map(p=>({p,t:S.cols.players[p.pid].trap}));
  h+='<div class="card"><h2>Úkoly-pasti, které prošly</h2>';
  if(!traps.length)h+='<p class="muted">Žádná past neprošla. Správci byli opatrní.</p>';
  else h+='<div class="stack">'+traps.sort((a,b)=>a.t.at-b.t.at).map(x=>'<div class="danger"><div><b>'+esc(x.p.pid)+' · '+esc(x.p.name)+'</b> '+roleChip(x.p.role)+' <span class="small muted">'+fmtTime(x.t.at)+'</span></div><div>'+esc(TASK[x.t.task]?TASK[x.t.task].text:x.t.task)+'</div><div class="small">Použité oprávnění: <b>'+esc(P[x.t.perm]?P[x.t.perm].name:x.t.perm)+'</b> – '+esc(viaText(x.t.via))+'</div></div>').join('')+'</div>';
  h+='</div>';
  const self=logList().filter(e=>(e.action==='grant.add'&&e.target&&e.actor&&e.target.pid===e.actor.pid)||(e.action==='role.assign'&&e.target&&e.actor&&e.target.pid===e.actor.pid));
  h+='<div class="card"><h2>Kdo hlídá správce? Oprávnění, která si správce dal sám</h2>'+(self.length?'<ul>'+self.map(e=>'<li>'+fmtTime(e.t)+' – <b>'+esc(e.actor.name)+'</b>: '+esc(LOG_LABEL[e.action])+' – '+esc(logTarget(e))+'</li>').join('')+'</ul>':'<p class="muted">Nikdo si nic sám nepřidělil.</p>')+'</div>';
  const risky=[];
  roster().forEach(p=>{const ps=permsOf(p.pid);
    if(p.role!=='spravce')['perms.grant','users.create','log.view'].forEach(c=>{if(ps.has(c))risky.push({p,c});});
    if(p.role==='zak'||p.role==='rodic')['grades.edit','grades.write','grades.class','absence.write'].forEach(c=>{if(ps.has(c))risky.push({p,c});});});
  h+='<div class="card"><h2>Další riziková oprávnění, která teď někdo má</h2>'+(risky.length?'<table class="t"><tbody>'+risky.map(x=>'<tr><td><span class="mono">'+x.p.pid+'</span> '+esc(x.p.name)+' '+roleChip(x.p.role)+'</td><td><b>'+esc(P[x.c].name)+'</b></td><td class="small">'+esc(viaText(permSources(x.p.pid)[x.c]))+'</td></tr>').join('')+'</tbody></table>':'<p class="muted">Žádná.</p>')+'</div>';
  return h;
}
function pDetective(){
  const sus=['auth.fail','auth.ok','auth.leave','log.delete.try','account.block','trap.triggered'];
  const list=logList().filter(e=>sus.indexOf(e.action)>=0||(e.action==='request.create'&&e.actor&&(e.actor.role==='zak'||e.actor.role==='rodic'||e.actor.role==='test')&&RISKY_ZAK.indexOf(e.target&&e.target.perm)>=0)).slice().reverse();
  const sk=roster().find(p=>p.skodic);
  let h='<h1>Detektivka v záznamu</h1>';
  if(!sk)return h+'<div class="card"><p class="muted">V této hře škodič nebyl. Záznam ale můžete prozkoumat i tak: kdo žádal o oprávnění, které nepotřeboval?</p></div>';
  h+='<div class="note">Ve třídě byl tajný škodič. Navenek vypadal jako obyčejný žák. Najdete ho v záznamu? Dívejte se, <b>z kterého počítače</b> co přišlo.</div>';
  h+='<div class="card"><h2>Podezřelé události ('+list.length+')</h2>'+(list.length?'<div class="timeline">'+list.map(e=>{const a=e.actor||{};return '<div class="tl"><span class="tm">'+fmtTime(e.t)+'</span><span><b>'+esc(a.pid)+'</b> '+esc(a.name)+'</span><span><b>'+esc(LOG_LABEL[e.action]||e.action)+'</b>'+(logTarget(e)?' – '+esc(logTarget(e)):'')+(e.detail?' <span class="muted">„'+esc(e.detail)+'“</span>':'')+'</span></div>';}).join('')+'</div>':'<p class="muted">Nic podezřelého se nestalo. Buď byl škodič opatrný, nebo systém dobře nastavený.</p>')+'</div>';
  if(!S.ui.reveal)return h+'<div class="row"><button class="btn primary big" data-act="reveal">'+ic('eye',18)+' Odhalit škodiče</button><span class="small muted">Nejdřív nechte třídu hádat.</span></div>';
  const m=missionsOf(sk.pid); const claims=reqList().filter(r=>r.pid===sk.pid&&r.claimedAs);
  h+='<div class="card dark"><div class="eyebrow light">Škodič byl</div><h2 style="font-size:30px;margin-top:4px">'+esc(sk.pid)+' · '+esc(sk.name)+'</h2></div>';
  h+='<div class="card"><h2>Co zkoušel a jak to dopadlo</h2><table class="t"><tbody>'+MISSIONS.map(x=>'<tr><td style="width:36px">'+(m[x.id]?'<span class="sym bad">✕</span>':'<span class="sym y">✓</span>')+'</td><td><b>'+esc(x.name)+'</b><div class="small">'+esc(x.text)+'</div></td><td>'+(m[x.id]?'<b>Prošlo.</b> Díra v systému.':'Systém ho zastavil.')+'<div class="small muted">'+esc(x.rule)+'</div></td></tr>').join('')+'</tbody></table>'+
   (claims.length?'<h3 style="margin-top:14px">Za koho se vydával</h3><ul>'+claims.map(r=>{const c=P_(r.claimedAs);return '<li>Žádost o <b>'+esc(P[r.perm].name)+'</b>: tvrdil, že je <b>'+esc(c?c.name:r.claimedAs)+'</b>. Žádost ale přišla z účtu '+esc(sk.pid)+'. Výsledek: '+(r.status==='approved'?'<b>schváleno</b>':r.status==='denied'?'zamítnuto':'čeká')+'.</li>';}).join('')+'</ul>':'')+
   '<p class="small muted" style="margin-top:10px">✓ = třída obstála · ✕ = škodičovi to prošlo</p></div>';
  return h;
}
function pSummary(){
  return '<h1>Co si z dnešní hodiny odnášíme</h1><div class="summary">'+
   '<div class="srow"><span class="shape circle">1</span><div><h2>Na začátku nesmí nikdo nic.</h2><p>Zakázáno je všechno, co není povoleno.</p></div></div>'+
   '<div class="srow"><span class="shape square">2</span><div><h2>Oprávnění mění jen správce.</h2><p>Sám si je nezměním – ani kdybych se stavěl na hlavu. Nejsou v mém počítači, ale v systému.</p></div></div>'+
   '<div class="srow"><span class="shape circle">3</span><div><h2>Každý jen to, co potřebuje.</h2><p>Role dá stejná oprávnění celé skupině. Správci to ušetří práci.</p></div></div>'+
   '<div class="srow"><span class="shape square">4</span><div><h2>Záznam ukáže, kdo co udělal.</h2><p>Ani správce ho nesmaže. Proto se dá zjistit, kdo škodil.</p></div></div></div>';
}
function pReality(){
  const sym={y:'<span class="sym y">ano</span>',n:'<span class="sym n">ne</span>',h:'<span class="sym h">jen část</span>'};
  let h='<h1>Srovnej se skutečností</h1><div class="note"><b>Zjednodušený model.</b> Skutečné školní systémy se liší podle školy a nastavení. Tabulka ukazuje, co daná role v běžném školním systému typicky smí.</div>';
  h+='<div class="card"><div class="tbl-wrap"><table class="t"><thead><tr><th rowspan="2">Oprávnění</th>'+ROLE_ORDER.map(r=>'<th colspan="2" style="text-align:center">'+roleChip(r)+'</th>').join('')+'</tr><tr>'+ROLE_ORDER.map(()=>'<th>naše třída</th><th>skutečnost</th>').join('')+'</tr></thead><tbody>'+
   PERMS.map(p=>'<tr><td>'+p.n+'. '+esc(p.name)+(REALITY_NOTE[p.code]?'<div class="small muted">'+esc(REALITY_NOTE[p.code])+'</div>':'')+'</td>'+ROLE_ORDER.map(r=>{const f=roleFraction(r,p.code);const re=REALITY[p.code][r];const ours=f==null?'–':f.n?'<b>'+f.n+'/'+f.of+'</b>':'<span class="muted">0/'+f.of+'</span>';
     const mismatch=f&&((f.n>0&&re==='n')||(f.n===0&&re==='y'));return '<td class="num"'+(mismatch?' style="background:var(--lock-soft)"':'')+'>'+ours+'</td><td>'+sym[re]+'</td>';}).join('')+'</tr>').join('')+'</tbody></table></div>'+
   '<p class="small muted" style="margin-top:8px">Žlutě podbarvené: naše třída se liší od skutečnosti (někdo má právo navíc, nebo nikdo nemá právo, které role běžně má).</p></div>';
  return h;
}

/* ---------- exporty ---------- */
function csvCell(v){v=String(v==null?'':v);return /[;"\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;}
function csv(rows){return '﻿'+rows.map(r=>r.map(csvCell).join(';')).join('\r\n');}
function blobDownload(filename,text){
  const type=/\.csv$/.test(filename)?'text/csv;charset=utf-8':'text/html;charset=utf-8';
  const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=filename;
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
async function offerFile(filename,text,title){
  if(!S.dl){try{blobDownload(filename,text);toast('Soubor '+filename+' se stahuje.','ok');return;}catch(e){}}
  if(S.dl){try{await S.dl.save({filename,data:text});toast('Soubor připraven ke stažení.','ok');return;}catch(e){if(e&&e.code==='declined')return;if(e&&e.code==='rate_limited'){toast('Počkej chvilku a zkus to znovu.','lock');return;}}}
  S.ui.modal={title:title||filename,text}; scheduleRender();
}
function exportLog(){
  const rows=[['Čas','Kolo/fáze','Kód hráče','Identita','Role','Akce','Cíl','Výsledek','Podrobnosti']];
  logList().slice().reverse().forEach(e=>{const a=e.actor||{};rows.push([new Date(e.t).toLocaleString('cs-CZ'),PHASES[e.round]?PHASES[e.round].name:e.round,a.pid,a.name,ROLE[a.role]?ROLE[a.role].label:a.role,LOG_LABEL[e.action]||e.action,logTarget(e),e.result,e.detail]);});
  offerFile('skolanet-zaznam-'+S.code+'.csv',csv(rows),'Záznam (CSV)');
}
function exportMatrix(){
  const rows=[['Kód','Identita','Role'].concat(PERMS.map(p=>p.n+'. '+p.name))];
  roster().forEach(p=>{const src=permSources(p.pid);rows.push([p.pid,p.name,ROLE[p.role].label].concat(PERMS.map(q=>(src[q.code]||[]).map(x=>x.type==='builtin'?'od začátku':x.type==='role'?'role: '+x.name:'jednotlivě').join(' + '))));});
  rows.push([]);rows.push(['Role vytvořené třídou','Členové',''].concat(PERMS.map(p=>p.n+'. '+p.name)));
  rolesList().forEach(r=>{rows.push([r.name,roster().filter(p=>r.members&&r.members[p.pid]&&r.members[p.pid].on).map(p=>p.pid).join(' '),''].concat(PERMS.map(p=>r.perms&&r.perms[p.code]&&r.perms[p.code].on?'ano':'')));});
  offerFile('skolanet-matice-'+S.code+'.csv',csv(rows),'Matice práv (CSV)');
}
function cardsHTML(){
  return '<!doctype html><html lang="cs"><head><meta charset="utf-8"><title>Kartičky – hra '+esc(S.code)+'</title><style>body{margin:0}'+CARD_CSS+'.bar{padding:10px;background:#2A4B9B;color:#fff;font-family:Calibri,sans-serif}.bar button{font-size:16px;padding:6px 14px}@media print{.bar{display:none}}</style></head><body><div class="bar"><button onclick="window.print()">Vytisknout</button> Hra '+esc(S.code)+' · '+cardList().length+' kartiček · rozstříhej podle čárkovaných čar</div>'+cardsSheet()+'</body></html>';
}

/* =====================================================================
   10) ÚKOLY Z CHECKLISTU A PASTI
   ===================================================================== */
function viaOf(pid,perm){return (permSources(pid)[perm]||[]).map(x=>{const o={type:x.type};if(x.by)o.by=x.by;if(x.rid)o.rid=x.rid;if(x.name)o.name=x.name;if(x.req)o.req=x.req;return o;});}
async function markMission(mid){
  const real=realP(); if(!real||!real.skodic)return;
  if(missionsOf(real.pid)[mid]||S.fired.has('m:'+mid))return;
  S.fired.add('m:'+mid);
  const patch={mise:{}}; patch.mise[mid]=Date.now();
  try{await W(()=>dref(gp('players')+'/'+real.pid).update(patch),'mise');const m=MISSIONS.find(x=>x.id===mid);toast('Tajná mise splněna: '+m.name,'ok');}catch(e){S.fired.delete('m:'+mid);}
}
async function markTask(tid){
  const me=realP(); if(!me)return; const t=TASK[tid]; if(!t)return;
  if(!(TASKS[me.role]||[]).some(x=>x.id===tid))return;
  if(doneMap(me.pid)[tid]||S.fired.has('t:'+tid))return;
  S.fired.add('t:'+tid);
  const at=Date.now(); const patch={done:{}}; patch.done[tid]=at;
  try{
    if(t.trap){
      const via=viaOf(me.pid,t.perm);
      patch.trap={task:tid,at,perm:t.perm,via};
      await W(()=>dref(gp('players')+'/'+me.pid).update(patch),'checklist');
      logEvent('trap.triggered',{task:tid,perm:t.perm},'⚠',viaText(via));
    }else{
      await W(()=>dref(gp('players')+'/'+me.pid).update(patch),'checklist');
      logEvent('task.done',{task:tid},'ok');
      toast('Úkol splněn: '+t.text,'ok');
    }
  }catch(e){S.fired.delete('t:'+tid);}
}
function checkMissions(){
  const real=realP(); if(!real)return;
  if(reqList().some(r=>r.pid===real.pid&&r.claimedAs&&r.status==='approved'))markMission('m1');
  const ps=permsOf(real.pid); if(RISKY_ZAK.some(c=>ps.has(c)))markMission('m2');
}
function afterRender(){
  const me=meP(); if(!me||!S.session||S.session.teacher||!S.game)return;
  const ph=phase(); if(ph===0||ph===2||ph===4||S.game.paused)return;
  if(isSkodic())checkMissions();
  const mod=MODULES.find(m=>m.id===S.ui.mod)||MODULES[0]; const tab=curTab(mod); const key=mod.id+'/'+tab.id;
  if(tab.perm&&!can(tab.perm)){if(!S.fired.has('blk:'+key)){S.fired.add('blk:'+key);logEvent('access.blocked',{perm:tab.perm},'zamčeno');}}
  else if(!t_needsPhase(tab)){
    const r=me.role;
    if(r==='zak'){if(key==='hodnoceni/moje'||key==='hodnoceni/trida')markTask('z1');if(key==='ukoly/seznam')markTask('z2');if(key==='uvod/rozvrh')markTask('z3');}
    if(r==='rodic'){if(key==='hodnoceni/dite')markTask('r3');if(key==='hodnoceni/trida')markTask('rP');}
    if(r==='spravce'){if(key==='hodnoceni/trida'||key==='hodnoceni/upravit')markTask('sP');}
    if(isSkodic()&&key==='hodnoceni/trida')markMission('m5');
  }
  if(me.role==='spravce'&&S.loaded.requests&&!pendingReqs().length&&reqList().some(q=>q.decidedBy===me.pid))markTask('s1');
}

/* =====================================================================
   11) AKCE
   ===================================================================== */
function need(perm){if(!canRequestNow()){toast('Teď se v systému nedá nic dělat.','lock');return false;}if(!can(perm)){toast('Nemáš oprávnění: '+P[perm].name,'lock');return false;}return true;}
async function addEdit(o){const me=meP();o.by=me.pid;o.at=Date.now();await W(()=>dref(gp('edits')+'/'+rid()).set(o),'změna');}
async function hashPin(code,pin){const txt='skolanet:'+code+':'+pin;try{const buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(txt));return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');}catch(e){let h=7;for(const c of txt)h=(h*31+c.charCodeAt(0))|0;return 'x'+h;}}
function normCode(s){return String(s||'').trim().toUpperCase().replace(/Ž/g,'Z').replace(/\s/g,'');}
async function sendRequest(perm,reason){
  const me=meP(); if(!canRequestNow()){toast('Žádosti teď posílat nejde.','lock');return false;}
  reason=String(reason||'').trim();
  if(reason.length<5){toast('Napiš jednu celou větu, proč oprávnění potřebuješ.','lock');return false;}
  if(permsOf(me.pid).has(perm)){toast('Tohle oprávnění už máš.');return false;}
  if(reqList().some(r=>r.pid===me.pid&&r.perm===perm&&r.status==='pending')){toast('O tohle oprávnění už jsi požádal(a). Čeká na vyřízení.','lock');return false;}
  const claim=(isSkodic()&&!actingAsTest()&&dv('f-claim',''))||null;
  const doc={pid:me.pid,role:me.role,name:me.name,claimedAs:claim,perm,reason,at:Date.now(),round:phase(),status:'pending',lockBy:null,lockUntil:0,decidedBy:null,decidedAt:null,denyReason:null,via:null};
  if(actingAsTest())doc.from=S.session.pid;
  await W(()=>dref(gp('requests')+'/'+rid()).set(doc),'žádost');
  logEvent('request.create',{perm},'čeká',reason);
  if(claim)delete S.drafts['f-claim'];
  toast('Žádost odeslána. Počkej, až ji správce vyřídí.','ok');
  return true;
}
async function reqGet(id){const s=await W(()=>dref(gp('requests')+'/'+id).get(),'načtení');return s.exists?s.data():null;}
function lockOk(d,me){return !(d.lockBy&&d.lockBy!==me.pid&&d.lockUntil>Date.now());}
async function grantDirect(pid,perm,by,req){const p={perms:{}};p.perms[perm]={on:true,by,at:Date.now(),req:req||null};await W(()=>dref(gp('grants')+'/'+pid).update(p),'oprávnění');}

const ACT={
 reload(){location.reload();},
 aside(){S.ui.asideOpen=!S.ui.asideOpen;},
 logout(){S.ui.confirmOut=true;},
 'logout-cancel'(){S.ui.confirmOut=false;},
 'logout-now'(){sessSave(null);S.session=null;S.code=null;stopSync();resetData();S.ui.confirmOut=false;S.ui.mod='uvod';S.ui.tab={};S.drafts={};},
 async login(){
  const code=normCode(dv('f-login-code')),pid=normCode(dv('f-login-pid'));S.ui.startErr='';
  if(code.length!==4){S.ui.startErr='Kód hry má 4 znaky.';return;}
  if(!/^[SURZ]\d{1,2}$/.test(pid)){S.ui.startErr='Osobní kód vypadá třeba jako R3 nebo Z1.';return;}
  let s; try{s=await W(()=>dref('games/'+code).get(),'přihlášení');}catch(e){S.ui.startErr='Nepodařilo se spojit se systémem.';return;}
  if(!s.exists){S.ui.startErr='Hra s kódem '+code+' neexistuje. Zkontroluj kód.';return;}
  const g=s.data(); if(!(g.roster||[]).some(p=>p.pid===pid)){S.ui.startErr='Kód '+pid+' v této hře není.';return;}
  S.session={code,pid};sessSave(S.session);S.code=code;resetData();S.game=g;S.loaded.game=true;startSync();
  try{await W(()=>dref('games/'+code+'/players/'+pid).update({joined:true,joinedAt:Date.now()}),'přihlášení');}catch(e){}
  logEvent('player.join',{pid},'ok');
 },
 async 't-open'(){
  const code=normCode(dv('f-t-code')),pin=String(dv('f-t-pin')).trim();S.ui.teacherErr='';
  if(code.length!==4){S.ui.teacherErr='Kód hry má 4 znaky.';return;}
  let s;try{s=await W(()=>dref('games/'+code).get(),'otevření');}catch(e){S.ui.teacherErr='Nepodařilo se spojit se systémem.';return;}
  if(!s.exists){S.ui.teacherErr='Hra '+code+' neexistuje.';return;}
  if(s.data().pinHash!==await hashPin(code,pin)){S.ui.teacherErr='Špatný PIN.';return;}
  S.session={code,teacher:true};sessSave(S.session);S.code=code;resetData();startSync();delete S.drafts['f-t-pin'];
 },
 async 't-create'(){
  S.ui.teacherErr='';
  const cfg=cfgDraft();
  for(const k of ['S','U','R','Z']){const n=cfg[k];if(isNaN(n)||n<LIMITS[k][0]||n>LIMITS[k][1]){S.ui.teacherErr='Počty rolí jsou mimo rozsah ('+{S:'správci',U:'učitelé',R:'rodiče',Z:'žáci'}[k]+' '+LIMITS[k][0]+'–'+LIMITS[k][1]+').';return;}}
  if(cfg.Z+cfg.X>10){S.ui.teacherErr='Žáků i se škodičem může být nejvýš 10.';return;}
  const pin=String(dv('f-new-pin')).trim(); if(!/^\d{4,8}$/.test(pin)){S.ui.teacherErr='PIN musí mít 4 až 8 číslic.';return;}
  const AL='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let code=null;
  for(let i=0;i<12&&!code;i++){let c='';for(let j=0;j<4;j++)c+=AL[Math.floor(Math.random()*AL.length)];try{const s=await W(()=>dref('games/'+c).get(),'založení');if(!s.exists)code=c;}catch(e){S.ui.teacherErr='Nepodařilo se spojit se systémem.';return;}}
  if(!code){S.ui.teacherErr='Nepodařilo se vybrat kód hry, zkus to znovu.';return;}
  const ros=[];
  for(let i=0;i<cfg.S;i++)ros.push({pid:'S'+(i+1),role:'spravce',name:ADMINS[i],pair:i<cfg.Sp});
  for(let i=0;i<cfg.U;i++)ros.push({pid:'U'+(i+1),role:'ucitel',name:TEACHERS[i].name,subj:TEACHERS[i].subj,classTeacher:i===0,pair:i<cfg.Up});
  for(let i=0;i<cfg.R;i++)ros.push({pid:'R'+(i+1),role:'rodic',name:PARENTS[i],sid:'s'+(i+1),pair:i<cfg.Rp});
  for(let i=0;i<cfg.Z;i++)ros.push({pid:'Z'+(i+1),role:'zak',name:STUDENTS[i],sid:'s'+(i+1),pair:i<cfg.Zp});
  /* škodič: navenek další žák v pořadí, takže ho podle kódu nikdo nepozná */
  if(cfg.X)ros.push({pid:'Z'+(cfg.Z+1),role:'zak',name:STUDENTS[cfg.Z],sid:'s'+(cfg.Z+1),pair:false,skodic:true});
  S.ui.teacherErr='Zakládám hru '+code+'…';scheduleRender();
  try{
    const now=Date.now(); const ph_=await hashPin(code,pin);
    await W(()=>dref('games/'+code).set({code,createdAt:now,pinHash:ph_,phase:0,paused:false,config:cfg,roster:ros,phaseLog:[{phase:0,at:now}],schema:2,hasTest:!!cfg.X,testBlocked:false,testFails:0}),'hra');
    for(const p of ros){
      await W(()=>dref('games/'+code+'/players/'+p.pid).set({pid:p.pid,joined:false,done:{},trap:null,mise:{}}),'hráči');
      await W(()=>dref('games/'+code+'/grants/'+p.pid).set({pid:p.pid,perms:{}}),'práva');
    }
  }catch(e){S.ui.teacherErr='Hru se nepodařilo založit.';return;}
  S.ui.teacherErr='';S.session={code,teacher:true};sessSave(S.session);S.code=code;resetData();startSync();S.ui.tTab='karticky';S.ui.justCreated=true;
  delete S.drafts['f-new-pin'];
  logEvent('game.create',{text:ros.length+' hráčů'},'ok','','UCITEL');
 },
 mod(d){S.ui.mod=d.mod;S.ui.reqOpen=null;S.ui.asideOpen=false;},
 tab(d){S.ui.tab[d.mod]=d.tab;S.ui.reqOpen=null;},
 'req-open'(d){S.ui.reqOpen=d.perm;},
 'req-close'(){S.ui.reqOpen=null;},
 async 'req-send'(d){if(await sendRequest(d.perm,dv('f-req-'+d.perm))){delete S.drafts['f-req-'+d.perm];S.ui.reqOpen=null;}},
 async 'req-send-any'(){if(await sendRequest(dv('f-greq-perm','grades.own'),dv('f-greq-why'))){delete S.drafts['f-greq-why'];}},
 async 'grade-write'(){
  if(!need('grades.write'))return; const me=meP();
  const sid=dv('f-gw-sid','s1'),subj=dv('f-gw-subj',me.subj||'M'),v=parseInt(dv('f-gw-val',1),10),topic=String(dv('f-gw-topic','Zkoušení')).trim()||'Zkoušení';
  await addEdit({type:'grade.add',gid:'gn-'+rid(),sid,subj,val:v,topic});
  logEvent('grade.write',{sid,text:SUBJ[subj]+': '+v},'ok',topic); toast('Známka zapsána.','ok');
  if(me.role==='ucitel'&&subj===me.subj)markTask('u1');
 },
 async 'grade-edit'(){
  if(!need('grades.edit'))return; const me=meP();
  const sid=dv('f-ge-sid','s1'); const gs=school().grades.filter(g=>g.sid===sid); if(!gs.length)return;
  const gid=dv('f-ge-gid',gs[0].gid); const g=gs.find(x=>x.gid===gid)||gs[0]; const to=parseInt(dv('f-ge-to',3),10);
  if(g.val===to){toast('Známka už má tuhle hodnotu.');return;}
  await addEdit({type:'grade.edit',gid:g.gid,from:g.val,to});
  logEvent('grade.edit',{sid,text:SUBJ[g.subj]+': '+g.val+' → '+to},'ok',g.topic); toast('Známka změněna.','ok');
  if(me.role==='zak'&&g.sid===me.sid)markTask('zP');
  if(isSkodic()&&g.sid===realP().sid&&to<g.val)markMission('m3');
  if(me.role==='ucitel'&&g.subj!==me.subj)markTask('uP');
 },
 async 'abs-write'(){
  if(!need('absence.write'))return; const me=meP();
  const sid=dv('f-aw-sid','s1'),date=dv('f-aw-date','dnes'),hours=parseInt(dv('f-aw-h',1),10);
  await addEdit({type:'absence.add',aid:'an-'+rid(),sid,date,hours});
  logEvent('absence.write',{sid,text:date+', '+hours+' h'},'ok'); toast('Absence zapsána.','ok');
  if(me.role==='ucitel'&&date==='dnes')markTask('u3');
 },
 async 'abs-excuse'(d){
  if(!need('absence.excuse'))return; const me=meP(); const a=school().absences.find(x=>x.aid===d.aid); if(!a||a.excused)return;
  await addEdit({type:'absence.excuse',aid:a.aid});
  logEvent('absence.excuse',{sid:a.sid,text:a.date+', '+a.hours+' h'},'ok'); toast('Absence omluvena.','ok');
  if(me.role==='rodic'&&a.sid===me.sid&&a.date==='včera')markTask('r1');
 },
 async 'hw-add'(){
  if(!need('homework.assign'))return; const me=meP();
  const text=String(dv('f-hw-text')).trim(); if(text.length<3){toast('Napiš zadání úkolu.','lock');return;}
  const subj=dv('f-hw-subj',me.subj||'M'),due=dv('f-hw-due','zítra');
  await addEdit({type:'homework.add',hid:'hn-'+rid(),subj,text,due});
  logEvent('homework.assign',{text:SUBJ[subj]+', do: '+due},'ok',text); delete S.drafts['f-hw-text']; toast('Úkol zadán.','ok');
  if(me.role==='ucitel')markTask('u2');
 },
 'msg-reply'(d){S.drafts['f-msg-to']=d.to;S.drafts['f-msg-reply']=d.mid;S.ui.tab.zpravy='napsat';},
 async 'msg-send'(){
  if(!need('msg.send'))return; const me=meP();
  const ct=classTeacher(); const opts=roster().filter(p=>p.pid!==me.pid);
  const to=dv('f-msg-to',ct&&ct.pid!==me.pid?ct.pid:(opts[0]||{}).pid); const text=String(dv('f-msg-text')).trim();
  if(!to||!P_(to)){toast('Vyber, komu zprávu posíláš.','lock');return;} if(text.length<2){toast('Napiš text zprávy.','lock');return;}
  const replyTo=S.drafts['f-msg-reply']||null;
  await W(()=>dref(gp('messages')+'/'+rid()).set({from:me.pid,to,text,at:Date.now(),replyTo}),'zpráva');
  logEvent('msg.send',{pid:to},'ok',text); delete S.drafts['f-msg-text']; delete S.drafts['f-msg-reply']; toast('Zpráva odeslána.','ok');
  const tp=P_(to);
  if((me.role==='zak'||me.role==='rodic')&&tp.classTeacher)markTask(me.role==='zak'?'z4':'r4');
  if(me.role==='ucitel'&&tp.role==='rodic')markTask('u4');
 },
 async lunch(d){
  if(!need('lunch.order'))return; const me=meP(); if(!(me.role==='zak'||me.role==='rodic'))return;
  const on=d.on==='1';
  await addEdit({type:'lunch.set',sid:me.sid,day:d.day,ordered:on});
  logEvent('lunch.change',{sid:me.sid,text:d.day+': '+(on?'objednat':'odhlásit')},'ok'); toast(on?'Oběd objednán.':'Oběd odhlášen.','ok');
  if(me.role==='rodic'&&d.day==='zítra'&&!on)markTask('r2');
 },
 async 'user-create'(){
  if(!need('users.create'))return; const me=meP();
  const f=String(dv('f-nu-first')).trim(),l=String(dv('f-nu-last')).trim(); if(!f||!l){toast('Vyplň jméno i příjmení.','lock');return;}
  const sid='n'+rid(); await addEdit({type:'user.create',sid,name:f+' '+l,kind:'zak'});
  logEvent('user.create',{sid,text:f+' '+l},'ok'); clearDrafts('f-nu-'); toast('Uživatel založen.','ok');
  if(me.role==='spravce')markTask('s2');
 },
 async 'rq-claim'(d){
  if(!need('perms.grant'))return; const me=meP(); const ref=dref(gp('requests')+'/'+d.id);
  if(S.db.claim){
    for(const o of pendingReqs())if(o.id!==d.id&&o.lockBy===me.pid&&o.lockUntil>Date.now())await W(()=>dref(gp('requests')+'/'+o.id).update({lockBy:null,lockUntil:0}),'fronta');
    const res=await W(()=>S.db.claim(gp('requests')+'/'+d.id,me.pid,120000),'fronta');
    if(res==='locked')toast('Tuhle žádost řeší kolega.','lock');else if(res!=='ok')toast('Žádost už je vyřízená.');
    return;
  }
  try{const a=await ref.acquire({holder:me.pid,ttlMs:4000});if(a&&a.acquired===false){toast('Tuhle žádost právě otevírá kolega.','lock');return;}}catch(e){}
  const r=await reqGet(d.id); if(!r||r.status!=='pending'){toast('Žádost už je vyřízená.');return;}
  if(!lockOk(r,me)){toast('Tuhle žádost řeší kolega.','lock');return;}
  for(const o of pendingReqs())if(o.id!==d.id&&o.lockBy===me.pid&&o.lockUntil>Date.now())await W(()=>dref(gp('requests')+'/'+o.id).update({lockBy:null,lockUntil:0}),'fronta');
  await W(()=>ref.update({lockBy:me.pid,lockUntil:Date.now()+120000}),'fronta');
 },
 async 'rq-release'(d){await W(()=>dref(gp('requests')+'/'+d.id).update({lockBy:null,lockUntil:0}),'fronta');},
 async 'rq-approve'(d){await approveReq(d.id,null);},
 async 'rq-approve-role'(d){const roles=rolesList();await approveReq(d.id,dv('f-rq-role-'+d.id,roles[0]&&roles[0].id));},
 async 'rq-deny'(d){
  if(!need('perms.grant'))return; const me=meP();
  const reason=String(dv('f-rq-deny-'+d.id)).trim(); if(reason.length<3){toast('U zamítnutí musíš napsat důvod.','lock');return;}
  const r=await reqGet(d.id); if(!r||r.status!=='pending'){toast('Žádost už je vyřízená.');return;} if(!lockOk(r,me)){toast('Tuhle žádost řeší kolega.','lock');return;}
  await W(()=>dref(gp('requests')+'/'+d.id).update({status:'denied',denyReason:reason,decidedBy:me.pid,decidedAt:Date.now(),lockBy:null,lockUntil:0}),'rozhodnutí');
  logEvent('request.deny',{pid:r.pid,perm:r.perm},'zamítnuto',reason); delete S.drafts['f-rq-deny-'+d.id];
  markTask('s3');
 },
 async 'mg-grant'(){
  if(!need('perms.grant'))return; const me=meP(); const pid=dv('f-mg-pid',roster()[0].pid),perm=dv('f-mg-perm','grades.own');
  const src=permSources(pid)[perm]||[]; if(src.some(x=>x.type==='direct'||x.type==='builtin')){toast('Tohle oprávnění už má.');return;}
  await grantDirect(pid,perm,me.pid,null);
  logEvent('grant.add',{pid,perm},'ok',pid===me.pid?'sám sobě':''); toast('Oprávnění přiděleno.','ok');
 },
 async 'mg-revoke'(){
  if(!need('perms.grant'))return; const me=meP(); const pid=dv('f-mg-pid',roster()[0].pid),perm=dv('f-mg-perm','grades.own');
  const src=permSources(pid)[perm]||[];
  if(!src.some(x=>x.type==='direct')){toast(src.length?'Toto oprávnění nemá jednotlivě – má ho přes roli nebo od začátku.':'Toto oprávnění nemá.','lock');return;}
  const p={perms:{}};p.perms[perm]={on:false,by:me.pid,at:Date.now(),req:null};
  await W(()=>dref(gp('grants')+'/'+pid).update(p),'oprávnění');
  logEvent('grant.revoke',{pid,perm},'ok'); toast(src.some(x=>x.type==='role')?'Odebráno. Pozor: přes roli ho má dál.':'Oprávnění odebráno.','ok');
 },
 async 'role-create'(){
  if(!need('perms.grant'))return; if(phase()<3){toast('Role se zapnou ve 2. kole.','lock');return;} const me=meP();
  const name=String(dv('f-rc-name')).trim(); if(name.length<2){toast('Napiš název role.','lock');return;}
  if(rolesList().some(r=>r.name.toLowerCase()===name.toLowerCase())){toast('Role s tímto názvem už existuje.','lock');return;}
  const at=Date.now(); const perms={}; PERMS.forEach(p=>{if(dv('f-rc-p-'+p.code,false))perms[p.code]={on:true,by:me.pid,at};});
  await W(()=>dref(gp('roles')+'/'+rid()).set({name,perms,members:{},createdBy:me.pid,at}),'role');
  logEvent('role.create',{roleName:name},'ok',Object.keys(perms).map(c=>P[c].name).join(', ')||'bez oprávnění');
  clearDrafts('f-rc-'); toast('Role „'+name+'“ vytvořena.','ok');
 },
 async 'role-perm'(d,el){
  if(!need('perms.grant')){return;} const me=meP(); const r=S.cols.roles[d.rid]; if(!r)return;
  const on=!!el.checked; const p={perms:{}};p.perms[d.perm]={on,by:me.pid,at:Date.now()};
  await W(()=>dref(gp('roles')+'/'+d.rid).update(p),'role');
  logEvent('role.perm',{roleName:r.name,perm:d.perm},on?'přidáno':'odebráno');
 },
 'role-selrole'(d){roster().forEach(p=>{if(p.role===d.role)S.drafts['f-rm-'+d.rid+'-'+p.pid]=true;});},
 async 'role-members'(d){
  if(!need('perms.grant'))return; const me=meP(); const r=S.cols.roles[d.rid]; if(!r)return;
  const at=Date.now(); const patch={members:{}}; const changes=[];
  roster().forEach(p=>{const cur=!!(r.members&&r.members[p.pid]&&r.members[p.pid].on);const want=!!dv('f-rm-'+d.rid+'-'+p.pid,cur);if(cur!==want){patch.members[p.pid]={on:want,by:me.pid,at};changes.push([p.pid,want]);}});
  if(!changes.length){toast('Žádná změna.');return;}
  await W(()=>dref(gp('roles')+'/'+d.rid).update(patch),'role');
  clearDrafts('f-rm-'+d.rid+'-');
  for(const c of changes)await logEvent(c[1]?'role.assign':'role.unassign',{pid:c[0],roleName:r.name},'ok');
  toast('Členové role uloženi ('+changes.length+' změn).','ok');
 },
 ttab(d){S.ui.tTab=d.t;},
 proj(d){S.ui.projSec=d.s;},
 reveal(){S.ui.reveal=true;},
 async phase(d){const n=parseInt(d.n,10);if(n===phase())return;const g=S.game;
  await W(()=>dref('games/'+S.code).update({phase:n,phaseLog:(g.phaseLog||[]).concat([{phase:n,at:Date.now()}])}),'fáze');
  S.ui.projSec='auto'; S.ui.justCreated=false; logEvent('phase.change',{phase:n},'ok','','UCITEL');},
 async pause(){const p=!S.game.paused;await W(()=>dref('games/'+S.code).update({paused:p}),'pauza');logEvent(p?'game.pause':'game.resume',{},'ok','','UCITEL');},
 'del-ask'(){S.ui.confirmDel=true;},
 'del-cancel'(){S.ui.confirmDel=false;},
 async 'del-do'(){
  if(normCode(dv('f-del-code'))!==S.code){toast('Kód nesouhlasí.','lock');return;}
  const code=S.code; stopSync(); let n=0;
  try{
    if(S.db.deleteCol){for(const c of COLS){n+=await W(()=>S.db.deleteCol('games/'+code+'/'+c),'mazání');S.ui.delProgress='Mažu… '+n+' záznamů';doRender();}}
    else for(const c of COLS){const s=await W(()=>cref('games/'+code+'/'+c).get(),'mazání');for(const d of s.docs){await W(()=>dref('games/'+code+'/'+c+'/'+d.id).delete(),'mazání');n++;if(n%10===0){S.ui.delProgress='Mažu… '+n+' záznamů';doRender();}}}
    await W(()=>dref('games/'+code).delete(),'mazání');
  }catch(e){S.ui.delProgress=null;toast('Mazání se nepovedlo dokončit. Zkus to znovu.','bad');startSync();return;}
  S.ui.delProgress=null;S.ui.confirmDel=false;delete S.drafts['f-del-code'];
  sessSave(null);S.session=null;S.code=null;resetData();toast('Hra '+code+' je smazaná ('+n+' záznamů).','ok');
 },
 'csv-log'(){exportLog();},
 'csv-matrix'(){exportMatrix();},
 'cards-print'(){setTimeout(()=>{try{window.print();}catch(e){toast('Tisk se nepodařilo spustit. Použij Stáhnout jako soubor.','lock');}},150);},
 'cards-dl'(){offerFile('karticky-'+S.code+'.html',cardsHTML(),'Kartičky (HTML)');},
 'modal-close'(){S.ui.modal=null;},
 'go-users'(){S.ui.mod='sprava';S.ui.tab.sprava='uzivatele';},
 async 'self-try'(){
  const me=meP(); if(!me)return; if(S.game.paused||phase()===2||phase()===4){toast('Teď se v systému nedá nic dělat.','lock');return;}
  const perm=dv('f-self-perm','grades.own'); S.ui.selfTry=perm;
  logEvent('self.grant.try',{perm},'zamítnuto','systém nedovolil');
  const t=(TASKS[(realP()||me).role]||[]).find(x=>/0$/.test(x.id)); if(t)markTask(t.id);
 },
 async 'log-del'(){
  if(!can('log.view'))return; S.ui.logDelTry=true;
  logEvent('log.delete.try',{},'zamítnuto','záznam jde jen přidávat');
  if(isSkodic())markMission('m6');
 },
 async 'test-login'(){
  const real=realP(); if(!real||!real.skodic)return; if(!canRequestNow()){toast('Teď se v systému nedá nic dělat.','lock');return;}
  if(S.game.testBlocked){toast('Účet je zablokovaný.','lock');return;}
  const pass=String(dv('f-test-pass')).trim();
  if(pass.toLowerCase()===TEST_PASS){
    S.session.actAs='T1'; sessSave(S.session); delete S.drafts['f-test-pass']; S.prevPerms=null;
    logEvent('auth.ok',{pid:'T1'},'ok');
    markMission('m4'); toast('Jsi přihlášený jako test.7x.','ok');
  }else{
    const tries=((S.cols.players[real.pid]&&S.cols.players[real.pid].testTries)|0)+1;
    await W(()=>dref(gp('players')+'/'+real.pid).update({testTries:tries}),'pokus');
    await W(()=>dref('games/'+S.code).update({testFails:(S.game.testFails|0)+1}),'pokus');
    logEvent('auth.fail',{pid:'T1'},'zamítnuto','z počítače hráče '+real.pid);
    toast('Špatné heslo.','bad');
  }
 },
 'test-leave'(){if(S.session.actAs){logEvent('auth.leave',{pid:'T1'},'ok');delete S.session.actAs;sessSave(S.session);S.prevPerms=null;S.ui.mod='tajne';}},
 async 'test-block'(){
  if(!need('perms.grant'))return;
  await W(()=>dref('games/'+S.code).update({testBlocked:true}),'blokace');
  logEvent('account.block',{pid:'T1'},'ok'); toast('Účet test.7x je zablokovaný.','ok');
 }
};
async function approveReq(id,roleId){
  if(!need('perms.grant'))return; const me=meP();
  const r=await reqGet(id); if(!r||r.status!=='pending'){toast('Žádost už je vyřízená.');return;} if(!lockOk(r,me)){toast('Tuhle žádost řeší kolega.','lock');return;}
  const at=Date.now(); let roleName=null;
  if(roleId){const ro=S.cols.roles[roleId];if(!ro){toast('Role neexistuje.');return;}roleName=ro.name;
    const p={perms:{},members:{}};p.perms[r.perm]={on:true,by:me.pid,at};p.members[r.pid]={on:true,by:me.pid,at};
    await W(()=>dref(gp('roles')+'/'+roleId).update(p),'role');}
  else await grantDirect(r.pid,r.perm,me.pid,id);
  await W(()=>dref(gp('requests')+'/'+id).update({status:'approved',decidedBy:me.pid,decidedAt:at,via:roleId?'role:'+roleId:'direct',lockBy:null,lockUntil:0}),'rozhodnutí');
  const tgt={pid:r.pid,perm:r.perm}; if(roleName)tgt.roleName=roleName;
  logEvent('request.approve',tgt,'schváleno',r.reason);
  toast('Schváleno.','ok');
}

/* =====================================================================
   12) REAKCE NA NOVÁ DATA
   ===================================================================== */
function onData(){
  if(S.session&&S.session.actAs&&S.game&&S.game.testBlocked){delete S.session.actAs;sessSave(S.session);toast('Účet test.7x byl zablokován. Jsi zase sám sebou.','bad');S.ui.mod='uvod';}
  const me=meP();
  if(me&&S.loaded.game&&S.loaded.grants&&S.loaded.roles&&S.loaded.requests){
    const cur=permsOf(me.pid);
    if(S.prevPerms&&phase()>0){
      cur.forEach(c=>{if(!S.prevPerms.has(c)){const src=(permSources(me.pid)[c]||[]).find(x=>x.type==='role');toast('Máš nové oprávnění: '+P[c].name+(src?' (přes roli „'+src.name+'“)':''),'ok');}});
      S.prevPerms.forEach(c=>{if(!cur.has(c))toast('Oprávnění ti bylo odebráno: '+P[c].name,'lock');});
    }
    S.prevPerms=cur;
    const st={}; reqList().filter(r=>r.pid===me.pid).forEach(r=>{st[r.id]=r.status;});
    if(S.prevReq){Object.keys(st).forEach(id=>{if(S.prevReq[id]==='pending'&&st[id]==='denied'){const r=S.cols.requests[id];toast('Správce zamítl: '+P[r.perm].name+'. Důvod: „'+r.denyReason+'“','bad');}});}
    S.prevReq=st;
  }
  if(S.code&&!S.subs.log&&wantCol('log'))subCol('log',S.code);
  scheduleRender();
}

/* =====================================================================
   13) START
   ===================================================================== */
function bind(){
  document.addEventListener('input',e=>{const t=e.target;if(!t.id)return;S.drafts[t.id]=t.type==='checkbox'?t.checked:t.value;if(t.id.indexOf('f-n-')===0||t.id.indexOf('f-p-')===0||t.id==='f-x')scheduleRender();});
  document.addEventListener('change',e=>{const t=e.target;if(t.id)S.drafts[t.id]=t.type==='checkbox'?t.checked:t.value;
    if(t.dataset.actChange==='logfilter')S.ui.logFilter=t.value;
    if(t.dataset.rerender||t.dataset.actChange){try{t.blur();}catch(x){}scheduleRender();}});
  const busy=new Set();
  document.addEventListener('click',e=>{
    const el=e.target.closest('[data-act]'); if(!el)return; const act=el.dataset.act; const fn=ACT[act]; if(!fn)return;
    if(el.tagName!=='INPUT')e.preventDefault();
    const key=act+'|'+(el.dataset.id||el.dataset.perm||el.dataset.aid||el.dataset.day||'');
    if(busy.has(key))return; busy.add(key);
    Promise.resolve().then(()=>fn(el.dataset,el)).catch(err=>{console.error(err);}).finally(()=>{busy.delete(key);scheduleRender();});
  });
  document.addEventListener('keydown',e=>{
    if(e.key!=='Enter')return; const t=e.target;
    if(t.id==='f-login-code'||t.id==='f-login-pid'){e.preventDefault();document.querySelector('[data-act="login"]').click();}
    else if(t.id==='f-t-pin'){e.preventDefault();document.querySelector('[data-act="t-open"]').click();}
    else if(t.tagName==='A'&&t.dataset.act){e.preventDefault();t.click();}
  });
}
function fbConfigOk(c){return c&&typeof c==='object'&&c.apiKey&&c.projectId&&!/VLOZ|DOPLN|xxx/i.test(c.apiKey+c.projectId);}
async function init(){
  bind();
  S.testMode=/test/i.test(location.hash||'');
  const cfg=window.SKOLANET_FIREBASE;
  if(fbConfigOk(cfg)){
    if(!window.firebase){S.fatal='Nenačetly se knihovny Firebase. Zkontroluj připojení k internetu, případně jestli školní síť nepovoluje adresu www.gstatic.com.';}
    else{
      try{
        firebase.initializeApp(cfg);
        const fs=firebase.firestore(); try{fs.settings({ignoreUndefinedProperties:true,merge:true});}catch(e){}
        await firebase.auth().signInAnonymously();
        S.db=makeFirebaseDB(fs);
      }catch(e){
        console.error(e); const c=(e&&e.code)||'';
        S.fatal=c==='auth/operation-not-allowed'||c==='auth/admin-restricted-operation'?'Ve Firebase není zapnuté anonymní přihlášení. V konzoli Firebase: Authentication → Sign-in method → Anonymous → Enable.'
          :c==='auth/unauthorized-domain'?'Tahle adresa ('+location.hostname+') není ve Firebase povolená. V konzoli Firebase: Authentication → Settings → Authorized domains → Add domain.'
          :c==='auth/network-request-failed'?'Nepodařilo se spojit se servery Firebase. Zkontroluj internet, případně jestli školní síť nepovoluje adresy *.googleapis.com.'
          :c==='auth/invalid-api-key'||c==='auth/api-key-not-valid.-please-pass-a-valid-api-key.'?'Klíč apiKey v souboru firebase-config.js není platný. Zkopíruj znovu konfiguraci z konzole Firebase.'
          :'Chyba při spuštění Firebase: '+(c||e&&e.message||'neznámá chyba');
      }
    }
  }
  if(!S.db&&!S.fatal){S.db=makeLocalDB();S.local=true;}
  S.dl=null; S.ready=true;
  if(S.db){const sess=sessLoad(); if(sess&&sess.code){S.session=sess;S.code=sess.code;resetData();startSync();}}
  scheduleRender();
  setInterval(tick,1000);
  setInterval(()=>{if(!S.session)return;const a=document.activeElement;if(a&&(a.tagName==='INPUT'||a.tagName==='TEXTAREA'||a.tagName==='SELECT'))return;scheduleRender();},3000);
}
init();
})();
