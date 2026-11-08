// Вся логика сайта. Без этого файла ролики и ноты всё равно работают.
(function () {
  var KLYUCH = "pevchie-golos";

  function zapisat(znachenie) {
    try { localStorage.setItem(KLYUCH, znachenie); } catch (e) {}
  }
  function prochitat() {
    try { return localStorage.getItem(KLYUCH); } catch (e) { return null; }
  }

  // Запоминаем голос и показываем его на главной.
  var shapka = document.querySelector("[data-zapomnit]");
  if (shapka) zapisat(shapka.getAttribute("data-zapomnit"));

  var proshlyy = prochitat();
  if (proshlyy) {
    var knopka = document.querySelector('.golos[data-golos="' + proshlyy + '"] em');
    if (knopka) knopka.hidden = false;
  }

  var rolik = document.getElementById("rolik");
  var panel = document.querySelector(".upravlenie");
  if (!rolik || !panel) return;
  panel.hidden = false;

  // Пропал интернет: показываем одну понятную кнопку.
  var zanovo = document.querySelector(".perezagruzit");
  var mesto = 0;
  function pokazatZanovo() { if (zanovo) zanovo.hidden = false; }
  rolik.addEventListener("error", pokazatZanovo);
  rolik.addEventListener("stalled", pokazatZanovo);
  rolik.addEventListener("timeupdate", function () { if (rolik.currentTime) mesto = rolik.currentTime; });
  rolik.addEventListener("playing", function () { if (zanovo) zanovo.hidden = true; });
  if (zanovo) {
    zanovo.addEventListener("click", function () {
      zanovo.hidden = true;
      rolik.load();
      rolik.addEventListener("loadedmetadata", function vernut() {
        rolik.removeEventListener("loadedmetadata", vernut);
        if (mesto) rolik.currentTime = mesto;
        var igra = rolik.play();
        if (igra && igra.catch) igra.catch(function () {});
      });
    });
  }

  var SKOROST_MEDLENNO = 0.75;

  // iOS сбрасывает скорость при новой загрузке, поэтому храним её сами.
  var skorost = 1;
  function primenitSkorost() { rolik.playbackRate = skorost; }
  rolik.addEventListener("loadedmetadata", primenitSkorost);
  rolik.addEventListener("play", primenitSkorost);

  panel.addEventListener("click", function (sobytie) {
    var b = sobytie.target.closest("button");
    if (!b) return;
    var d = b.getAttribute("data-deystvie");
    if (d === "snachala") {
      rolik.currentTime = 0;
      var igra = rolik.play();
      if (igra && igra.catch) igra.catch(function () {});
    } else if (d === "medlennee") {
      var vkl = skorost === 1;
      skorost = vkl ? SKOROST_MEDLENNO : 1;
      primenitSkorost();
      b.setAttribute("aria-pressed", String(vkl));
    } else if (d === "krug") {
      rolik.loop = !rolik.loop;
      b.setAttribute("aria-pressed", String(rolik.loop));
    }
  });
})();
