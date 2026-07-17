/* ============================================================
   app.js — melhoria progressiva.

   Nada de essencial depende deste arquivo. Se ele não carregar:
   - o conteúdo continua visível (o CSS só esconde para animar
     quando <html> tem a classe "js");
   - os botões de WhatsApp continuam funcionando, porque o link
     real está no href (escrito por aplicar-config.js).

   O que ele faz:
   1. consentimento de cookies (nada de medição antes)
   2. Google Tag Manager, só depois do "aceitar"
   3. captura de origem da campanha (utm_*, gclid, gbraid, wbraid)
   4. personaliza a mensagem do WhatsApp com a origem
   5. eventos de medição no dataLayer
   6. formulário de triagem -> mensagem pronta no WhatsApp
   7. barra fixa, animação de entrada, sombra do cabeçalho

   Configuração: config.js. Nada de dado de contato aqui.
============================================================ */
(function () {
  "use strict";

  var C = window.CONFIG || {};
  var P = window.PAGINA || {};
  var doc = document;

  window.dataLayer = window.dataLayer || [];

  /* ============================================================
     1. CONSENTIMENTO
     ============================================================ */
  var CHAVE_CONSENT = "rsf_consentimento_v1";
  var consent = null;
  try { consent = JSON.parse(localStorage.getItem(CHAVE_CONSENT) || "null"); } catch (e) { consent = null; }

  function podeMedir() { return !!(consent && consent.medicao); }

  var banner = doc.getElementById("cookies");
  var opcoes = doc.getElementById("cookiesOpcoes");
  var ckMedicao = doc.getElementById("ckMedicao");
  var btnSalvar = doc.getElementById("ckSalvar");

  function abrirBanner(comOpcoes) {
    if (!banner) return;
    banner.hidden = false;
    if (comOpcoes) mostrarOpcoes(true);
    if (ckMedicao) ckMedicao.checked = podeMedir();
  }

  function fecharBanner() { if (banner) banner.hidden = true; }

  function mostrarOpcoes(mostrar) {
    if (opcoes) opcoes.hidden = !mostrar;
    if (btnSalvar) btnSalvar.hidden = !mostrar;
  }

  function gravarConsent(medicao) {
    consent = { v: 1, medicao: !!medicao, data: new Date().toISOString() };
    try { localStorage.setItem(CHAVE_CONSENT, JSON.stringify(consent)); } catch (e) {}
    fecharBanner();
    if (medicao) carregarGTM();
  }

  if (banner) {
    if (!consent) abrirBanner(false);
    liga("ckAceitar", function () { gravarConsent(true); });
    liga("ckRecusar", function () { gravarConsent(false); });
    liga("ckConfigurar", function () { mostrarOpcoes(opcoes ? opcoes.hidden : true); });
    liga("ckSalvar", function () { gravarConsent(ckMedicao && ckMedicao.checked); });
  }
  liga("refazerCookies", function () { abrirBanner(true); });

  function liga(id, fn) {
    var el = doc.getElementById(id);
    if (el) el.addEventListener("click", fn);
  }

  /* ============================================================
     2. GOOGLE TAG MANAGER — só com consentimento E id configurado
     ============================================================ */
  var gtmCarregado = false;
  function carregarGTM() {
    var id = (C.googleTagManagerId || "").trim();
    if (gtmCarregado || !id || !podeMedir()) return;
    gtmCarregado = true;
    window.dataLayer.push({ "gtm.start": new Date().getTime(), event: "gtm.js" });
    var s = doc.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(id);
    doc.head.appendChild(s);
  }
  if (podeMedir()) carregarGTM();

  /* ============================================================
     3. ORIGEM DA CAMPANHA
     Só dados de campanha são guardados. O que a pessoa escreve
     no formulário nunca é gravado em lugar nenhum.
     ============================================================ */
  var CHAVE_CAMPANHA = "rsf_campanha_v1";
  var CAMPOS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
                "gclid", "gbraid", "wbraid"];
  var NOVENTA_DIAS = 90 * 24 * 60 * 60 * 1000;

  function lerCampanha() {
    var url = new URLSearchParams(location.search);
    var achou = {}, tem = false;
    CAMPOS.forEach(function (k) {
      var v = url.get(k);
      if (v) { achou[k] = v.slice(0, 200); tem = true; }
    });

    if (tem) {
      achou.ts = Date.now();
      guardar(sessionStorage, achou);
      guardar(localStorage, achou);
      return achou;
    }
    return recuperar(sessionStorage) || recuperar(localStorage) || {};
  }

  function guardar(store, dados) {
    try { store.setItem(CHAVE_CAMPANHA, JSON.stringify(dados)); } catch (e) {}
  }

  function recuperar(store) {
    try {
      var d = JSON.parse(store.getItem(CHAVE_CAMPANHA) || "null");
      if (!d) return null;
      if (d.ts && Date.now() - d.ts > NOVENTA_DIAS) { store.removeItem(CHAVE_CAMPANHA); return null; }
      return d;
    } catch (e) { return null; }
  }

  var campanha = lerCampanha();

  function origemLegivel() {
    var partes = [];
    var fonte = campanha.utm_source || (campanha.gclid || campanha.gbraid || campanha.wbraid ? "Google Ads" : "");
    if (fonte) partes.push("Origem: " + fonte);
    if (campanha.utm_campaign) partes.push("Campanha: " + campanha.utm_campaign);
    if (campanha.utm_term) partes.push("Termo: " + campanha.utm_term);
    if (campanha.utm_content) partes.push("Anúncio: " + campanha.utm_content);
    return partes.length ? partes.join(" | ") : "";
  }

  function dadosCampanha() {
    var d = {};
    CAMPOS.forEach(function (k) { if (campanha[k]) d[k] = campanha[k]; });
    return d;
  }

  /* ============================================================
     4. MEDIÇÃO
     ============================================================ */
  function evento(nome, extra) {
    if (!podeMedir()) return;
    var dados = { event: nome, page_type: P.tipo || "" };
    var camp = dadosCampanha();
    for (var k in camp) if (camp.hasOwnProperty(k)) dados[k] = camp[k];
    if (extra) for (var j in extra) if (extra.hasOwnProperty(j)) dados[j] = extra[j];
    window.dataLayer.push(dados);
  }

  /* Conversão do Google Ads: só com ID + rótulo + consentimento. */
  function dispararConversaoAds(rotulo) {
    var id = (C.googleAdsConversionId || "").trim();
    if (!id || !rotulo || !podeMedir()) return;
    if (typeof window.gtag !== "function") {
      window.gtag = function () { window.dataLayer.push(arguments); };
    }
    window.gtag("event", "conversion", { send_to: id + "/" + rotulo });
  }

  /* ============================================================
     5. WHATSAPP — reforça o href com a origem da campanha
     ============================================================ */
  function montarLink(msg) {
    var numero = (C.whatsapp || "").trim();
    if (!numero) return null;
    var origem = origemLegivel();
    var texto = origem ? msg + "\n\n[" + origem + "]" : msg;
    return "https://wa.me/" + numero + "?text=" + encodeURIComponent(texto);
  }

  var botoes = doc.querySelectorAll("[data-zap]");
  Array.prototype.forEach.call(botoes, function (a) {
    var link = montarLink(a.getAttribute("data-msg") || P.mensagemWhatsapp || "");
    if (link) a.setAttribute("href", link);      // href já era válido; aqui só ganha a origem
    a.addEventListener("click", function () {
      evento("whatsapp_click", { button_location: a.getAttribute("data-local") || "" });
      dispararConversaoAds((C.googleAdsConversionLabelWhatsapp || "").trim());
    });
  });

  Array.prototype.forEach.call(doc.querySelectorAll("[data-fone]"), function (a) {
    a.addEventListener("click", function () {
      evento("phone_click", { button_location: a.getAttribute("data-local") || "" });
    });
  });

  /* ============================================================
     6. FORMULÁRIO DE TRIAGEM
     Não envia nada para servidor: monta a mensagem e abre o WhatsApp.
     ============================================================ */
  var form = doc.getElementById("formContato");
  if (form) {
    var erro = doc.getElementById("formErro");

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();

      /* armadilha para robô: campo escondido preenchido = ignora em silêncio */
      var mel = form.querySelector('[name="empresa"]');
      if (mel && mel.value) return;

      var nome = valor("nome"), cidade = valor("cidade");
      var assunto = valor("assunto"), texto = valor("mensagem");

      var faltando = [];
      if (!nome) faltando.push("seu nome");
      if (!cidade) faltando.push("sua cidade");
      if (!assunto) faltando.push("o tipo de problema");
      if (!texto) faltando.push("uma descrição da situação");

      if (faltando.length) {
        if (erro) erro.textContent = "Falta preencher: " + faltando.join(", ") + ".";
        var primeiro = form.querySelector("[required]:invalid, [required][value='']");
        if (primeiro && primeiro.focus) primeiro.focus();
        return;
      }
      if (erro) erro.textContent = "";

      var msg = "Olá, Dr. Rodrigo. Meu nome é " + nome + ", de " + cidade + ".\n\n" +
                "Assunto: " + assunto + "\n\n" + texto;
      var link = montarLink(msg);
      if (!link) {
        if (erro) erro.textContent = "O WhatsApp ainda não foi configurado neste site.";
        return;
      }

      evento("lead_form_submit", { assunto: assunto, button_location: "contato" });
      dispararConversaoAds((C.googleAdsConversionLabelFormulario || "").trim());

      registrarLead({ nome: nome, cidade: cidade, assunto: assunto, campanha: dadosCampanha() });

      window.open(link, "_blank", "noopener");
      /* a página de obrigado explica que ainda falta tocar em enviar */
      setTimeout(function () { location.href = "obrigado.html"; }, 250);
    });

    function valor(campo) {
      var el = form.querySelector('[name="' + campo + '"]');
      return el && el.value ? el.value.trim() : "";
    }
  }

  /* ============================================================
     7. registrarLead — ponto de extensão isolado
     Hoje não faz nada: não existe servidor, e o site não guarda
     nada do que a pessoa escreve. Se um dia houver CRM, é aqui
     que a chamada entra — e a política de privacidade muda junto.
     ============================================================ */
  async function registrarLead(dados) {
    return { enviado: false, motivo: "sem_backend", dados: dados };
  }
  window.registrarLead = registrarLead;

  /* ============================================================
     8. FAQ e rolagem
     ============================================================ */
  Array.prototype.forEach.call(doc.querySelectorAll(".faq details"), function (d) {
    d.addEventListener("toggle", function () {
      if (!d.open) return;
      var s = d.querySelector("summary");
      var titulo = s ? s.textContent.replace(/\+$/, "").trim() : "";
      evento("faq_open", { faq_pergunta: titulo });
    });
  });

  var marcas = { 50: false, 90: false };
  var checando = false;
  window.addEventListener("scroll", function () {
    if (checando) return;
    checando = true;
    requestAnimationFrame(function () {
      var alt = doc.body.scrollHeight - window.innerHeight;
      var pct = alt > 0 ? (window.scrollY / alt) * 100 : 0;
      if (!marcas[50] && pct >= 50) { marcas[50] = true; evento("scroll_50"); }
      if (!marcas[90] && pct >= 90) { marcas[90] = true; evento("scroll_90"); }
      checando = false;
    });
  }, { passive: true });

  /* ============================================================
     9. Cabeçalho, barra fixa e animação de entrada
     ============================================================ */
  var topo = doc.getElementById("topo");
  if (topo) {
    var sombra = function () { topo.classList.toggle("rolou", window.scrollY > 8); };
    sombra();
    window.addEventListener("scroll", sombra, { passive: true });
  }

  /* a barra some quando o contato final aparece: dois CTAs iguais na tela
     ao mesmo tempo só atrapalham */
  var barra = doc.getElementById("barraZap");
  var contatoFinal = doc.getElementById("contato-final");
  if (barra && contatoFinal && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entradas) {
      barra.classList.toggle("recolhida", entradas[0].isIntersecting);
    }, { threshold: 0.15 }).observe(contatoFinal);
  }

  var animaveis = doc.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("visivel"); obs.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
    Array.prototype.forEach.call(animaveis, function (el) { obs.observe(el); });
  } else {
    Array.prototype.forEach.call(animaveis, function (el) { el.classList.add("visivel"); });
  }

  var ano = doc.getElementById("ano");
  if (ano) ano.textContent = new Date().getFullYear();
})();
