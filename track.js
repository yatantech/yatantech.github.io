/* Visit and tap counts with GoatCounter (https://www.goatcounter.com): no cookies, no personal data.
   Each app's bio link adds ?ref=tiktok / ?ref=instagram / ?ref=youtube, so we can see which app sent the visitor.
   Events: open/<game>, play-browser/<game>, play-app-store/<game>, play-google-play/<game>,
   android-start/<game>, android-join-group/<game>, android-become-tester/<game>; each ends in /<source>. */
(function () {
  var KEY = "yt-src", src = "";
  function load() { try { return sessionStorage.getItem(KEY); } catch (e) { return null; } }
  function keep(v) { try { sessionStorage.setItem(KEY, v); } catch (e) {} }
  var q = new URLSearchParams(location.search);
  src = (q.get("ref") || q.get("utm_source") || "").toLowerCase().replace(/[^a-z0-9.-]/g, "").slice(0, 30);
  if (!src) src = load() || "";
  if (!src) {
    var ua = navigator.userAgent || "", r = "";
    try { r = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : ""; } catch (e) {}
    if (/Instagram/.test(ua) || /instagram\.com$/.test(r)) src = "instagram";
    else if (/Musical_ly|BytedanceWebview|TikTok/.test(ua) || /tiktok\.com$/.test(r)) src = "tiktok";
    else if (/youtube\.com$|youtu\.be$/.test(r)) src = "youtube";
    else if (r && r !== location.hostname) src = r.slice(0, 40);
    else src = "direct";
  }
  keep(src);
  window.YT_SRC = src;

  var page = location.pathname.split("/")[1] || "home";
  var queue = [];
  function send(o) { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count(o); else queue.push(o); }
  window.goatcounter = { no_onload: true, endpoint: "https://yatantech.goatcounter.com/count" };
  var s = document.createElement("script");
  s.async = true; s.src = "https://gc.zgo.at/count.js";
  s.setAttribute("data-goatcounter", "https://yatantech.goatcounter.com/count");
  s.onload = function () { while (queue.length) window.goatcounter.count(queue.shift()); };
  (document.head || document.documentElement).appendChild(s);

  send({ path: location.pathname, referrer: src });

  document.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a") : null;
    if (!a) return;
    var h = a.getAttribute("href") || "", kind = null, game = page;
    if (a.classList.contains("game")) { kind = "open"; game = h.replace(/[^a-z0-9-]/g, ""); }
    else if (/playgama\.ai/.test(h)) kind = "play-browser";
    else if (/apps\.apple\.com/.test(h)) kind = "play-app-store";
    else if (/play\.google\.com\/store/.test(h)) kind = "play-google-play";
    else if (/play\.google\.com\/apps\/testing/.test(h)) kind = "android-become-tester";
    else if (/groups\.google\.com/.test(h)) kind = "android-join-group";
    else if (h === "#steps" || /^intent:/.test(h)) kind = "android-start";
    if (!kind) return;
    send({ path: kind + "/" + game + "/" + src, title: kind + " " + game + " from " + src, event: true });
  }, true);
})();
