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
  rolik.addEventListener("stalled", function () { if (!rolik.paused) pokazatZanovo(); });
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

  // iOS сбрасывает скорость при новой загрузке, поэтому храним её сами.
  var skorost = 1;
  function primenitSkorost() { rolik.playbackRate = skorost; }
  rolik.addEventListener("loadedmetadata", primenitSkorost);
  rolik.addEventListener("play", primenitSkorost);

  function otmetit(gruppa, vybrannaya) {
    gruppa.forEach(function (k) { k.setAttribute("aria-pressed", String(k === vybrannaya)); });
  }

  var knopkiSkorosti = [].slice.call(panel.querySelectorAll("[data-skorost]"));
  panel.addEventListener("click", function (sobytie) {
    var b = sobytie.target.closest("button");
    if (!b) return;
    if (b.hasAttribute("data-skorost")) {
      skorost = parseFloat(b.getAttribute("data-skorost"));
      primenitSkorost();
      otmetit(knopkiSkorosti, b);
      return;
    }
    var d = b.getAttribute("data-deystvie");
    if (d === "snachala") {
      rolik.currentTime = 0;
      var igra = rolik.play();
      if (igra && igra.catch) igra.catch(function () {});
    } else if (d === "krug") {
      rolik.loop = !rolik.loop;
      b.setAttribute("aria-pressed", String(rolik.loop));
    }
  });

  // «Мой голос» и соседний голос: то же место в музыке, те же ноты.
  var zvuchit = document.querySelector(".zvuchit");
  if (zvuchit) {
    zvuchit.hidden = false;
    var knopkiGolosa = [].slice.call(zvuchit.querySelectorAll("[data-rolik]"));
    var sohranit = document.querySelector(".sohranit");
    zvuchit.addEventListener("click", function (sobytie) {
      var b = sobytie.target.closest("[data-rolik]");
      if (!b || b.getAttribute("aria-pressed") === "true") return;
      var bylo = rolik.currentTime;
      var dlitBylo = rolik.duration;
      var igralo = !rolik.paused;
      var adres = "../video/" + b.getAttribute("data-rolik");
      otmetit(knopkiGolosa, b);
      var kadr = b.getAttribute("data-kadr");
      if (kadr) rolik.poster = "../video/" + kadr;
      rolik.src = adres;
      if (sohranit) {
        sohranit.href = adres;
        sohranit.setAttribute("download", b.getAttribute("data-imya"));
      }
      rolik.addEventListener("loadedmetadata", function vernut() {
        rolik.removeEventListener("loadedmetadata", vernut);
        // Записи голосов иногда разной длины, поэтому место считаем в долях.
        if (bylo && dlitBylo) rolik.currentTime = bylo / dlitBylo * rolik.duration;
        if (igralo) {
          var igra = rolik.play();
          if (igra && igra.catch) igra.catch(function () {});
        }
      });
    });
  }
})();
