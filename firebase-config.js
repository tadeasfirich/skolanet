/*
  Nastavení Firebase pro ŠkolaNet Libčice.

  Hodnoty zkopíruj z konzole Firebase:
  ozubené kolečko → Project settings → General → Your apps → SDK setup and configuration → Config

  Tyhle údaje NEJSOU tajné heslo – Google je počítá s tím, že budou veřejně na webu.
  Data chrání pravidla v souboru firestore.rules a anonymní přihlášení.

  Dokud tu jsou texty VLOZ_..., aplikace poběží jen v „režimu jednoho počítače“.
*/
window.SKOLANET_FIREBASE = {
  apiKey: "AIzaSyATUOo0btmcskjb_kHVtNAQfmJM7HIX324",
  authDomain: "skolanet-libcice.firebaseapp.com",
  projectId: "skolanet-libcice",
  storageBucket: "skolanet-libcice.firebasestorage.app",
  messagingSenderId: "452072040792",
  appId: "1:452072040792:web:6da03a92f1bcfcdf015d2d"
};