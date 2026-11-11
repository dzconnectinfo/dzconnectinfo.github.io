/* Script commun à toutes les pages du site DZ Connect.
 *
 * Liens Google Play : chaque lien <a data-play> est réécrit selon le téléphone du visiteur.
 *  - Sur Android, il devient un lien « intent » qui ouvre directement l'appli Play Store, même depuis
 *    le navigateur intégré de TikTok, Instagram ou Facebook (qui sinon affichent la page web de Play).
 *  - Ailleurs (ordinateur, iPhone), il reste l'adresse https classique de Google Play.
 * La source du visiteur (?src=tiktok dans l'adresse de la page, ou data-src="…" sur le lien) est
 * transmise à Google Play (utm_source) : la Play Console montre ainsi combien d'installations viennent
 * de chaque réseau (Statistiques → Acquisition).
 */
(function () {
  var PKG = 'com.dzconnect.app';
  var SOURCES = ['tiktok', 'instagram', 'facebook', 'whatsapp', 'site', 'qr'];
  var ua = navigator.userAgent || '';

  var DZ = window.DZ = {
    android: /Android/i.test(ua),
    iphone: /iPhone|iPad|iPod/i.test(ua),
    // Navigateur intégré d'une appli de réseau social (repéré par son nom dans l'identifiant du navigateur).
    inApp: /Instagram/i.test(ua) ? 'Instagram'
         : /FBAN|FBAV|FB_IAB|FBIOS/i.test(ua) ? 'Facebook'
         : /musical_ly|Bytedance|TikTok|trill/i.test(ua) ? 'TikTok'
         : /WhatsApp/i.test(ua) ? 'WhatsApp'
         : null
  };

  /** Source du visiteur : ?src=… de l'adresse, sinon le réseau détecté, sinon « site ». */
  DZ.source = function (fallback) {
    var s = (new URLSearchParams(location.search).get('src') || '').toLowerCase();
    if (SOURCES.indexOf(s) >= 0) return s;
    if (DZ.inApp) return DZ.inApp.toLowerCase();
    return fallback || 'site';
  };

  DZ.playWebUrl = function (src) {
    var ref = encodeURIComponent('utm_source=' + src + '&utm_medium=web');
    return 'https://play.google.com/store/apps/details?id=' + PKG + '&referrer=' + ref;
  };

  DZ.playUrl = function (src) {
    var web = DZ.playWebUrl(src);
    if (!DZ.android) return web;
    var ref = encodeURIComponent('utm_source=' + src + '&utm_medium=web');
    return 'intent://details?id=' + PKG + '&referrer=' + ref +
      '#Intent;scheme=market;package=com.android.vending;S.browser_fallback_url=' +
      encodeURIComponent(web) + ';end';
  };

  function init() {
    var links = document.querySelectorAll('a[data-play]');
    for (var i = 0; i < links.length; i++) {
      links[i].href = DZ.playUrl(DZ.source(links[i].getAttribute('data-src')));
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
