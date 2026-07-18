/* ============================================================
   app.js — melhoria progressiva.

   Nada de essencial depende deste arquivo. Se ele não carregar:
   - o conteúdo continua visível (o CSS só esconde para animar
     quando <html> tem a classe "js", e o próprio HTML remove a
     classe se este arquivo não confirmar que rodou);
   - os botões de WhatsApp continuam funcionando, porque o link
     real está no href (escrito no build por aplicar-config.js).

   O que ele faz:
   1. consentimento de cookies (nada de medição antes)
   2. Google Tag Manager, só depois do "aceitar"
   3. origem da campanha (utm_*, gclid, gbraid, wbraid):
      - SEM consentimento: só memória + sessionStorage (a visita)
      - COM consentimento de medição: localStorage por até 90 dias,
        com data da coleta registrada e limpeza do que expirou
      - se recusar: o que houver em localStorage é apagado
   4. personaliza a mensagem do WhatsApp com a origem
   5. eventos de medição no dataLayer (só com consentimento)
   6. formulário de triagem -> mensagem pronta no WhatsApp,
      com validação acessível (aria-invalid, foco, role=alert)
   7. barra fixa, animação de entrada, sombra do cabeçalho

   O que a pessoa escreve no formulário NUNCA é gravado — nem em
   localStorage, nem em sessionStorage, nem em cookie, nem em
   servidor. A mensagem só existe no link que abre o WhatsApp.

   Configuração: config.js. Nada de dado de contato aqui.
============================================================ */
(function () {
  "use strict";

  /* Confirma para o HTML que o script rodou. Se esta linha nunca
     executar (arquivo bloqueado, erro de rede), o failsafe do
     <head> remove a classe "js" e todo o conteúdo fica visível. */
  window.__rsfOk = true;

  var C = window.CONFIG || {};
  var P = window.PAGINA || {};
  var doc = document;

  window.dataLayer = window.dataLayer || [];

  /* ------------------------------------------------------------
     Aviso técnico — só no console, nunca na página (o visitante
     não tem nada a fazer com isso; o desenvolvedor tem).
  ------------------------------------------------------------ */
  (function avisosDev() {
    var faltando = [];
    if (!(C.whatsapp || "").trim()) faltando.push("whatsapp (nenhum botão de WhatsApp é exibido)");
    if (!(C.telefoneExibicao || "").trim()) faltando.push("telefoneExibicao");
    if (!(C.email || "").trim()) faltando.push("email");
    if (!(C.dominio || "").trim()) faltando.push("dominio (sem canonical/og:url)");
    if (!(C.googleTagManagerId || "").trim()) faltando.push("googleTagManagerId (GTM não carrega)");
    if (!(C.googleAdsConversionId || "").trim()) faltando.push("googleAdsConversionId (sem conversões no Ads)");
    if (faltando.length && window.console && console.warn) {
      console.warn("[config.js] Campos ainda vazios: " + faltando.join(", ") +
        ". Preencha em config.js e publique — o Vercel aplica no build.");
    }
  })();

  /* ============================================================
     1. CONSENTIMENTO
     A escolha fica em localStorage por ser estritamente necessária
     (lembrar a decisão evita perguntar de novo a cada página) e
     expira em 12 meses, como diz a política de privacidade.
     ============================================================ */
  var CHAVE_CONSENT = "rsf_consentimento_v1";
  var DOZE_MESES = 365 * 24 * 60 * 60 * 1000;
  var consent = null;
  try {
    consent = JSON.parse(localStorage.getItem(CHAVE_CONSENT) || "null");
    if (consent && consent.data && (Date.now() - new Date(consent.data).getTime() > DOZE_MESES)) {
      localStorage.removeItem(CHAVE_CONSENT);
      consent = null; /* expirou: pergunta de novo */
    }
  } catch (e) { consent = null; }

  function podeMedir() { return !!(consent && consent.medicao); }

  /* IDs exclusivos: o banner é #cookiesBanner; a âncora #cookies da
     política de privacidade é outro elemento, em outra função. */
  var banner = doc.getElementById("cookiesBanner");
  var opcoes = doc.getElementById("cookiesOpcoes");
  var ckMedicao = doc.getElementById("ckMedicao");
  var btnSalvar = doc.getElementById("ckSalvar");

  function abrirBanner(comOpcoes) {
    if (!banner) return;
    banner.hidden = false;
    mostrarOpcoes(!!comOpcoes);
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
    if (medicao) {
      persistirCampanha();  /* agora pode ir para o localStorage */
      carregarGTM();
    } else {
      limparCampanhaPersistida();  /* recusa: nada persistente de atribuição */
    }
  }

  if (banner) {
    if (!consent) abrirBanner(false);
    liga("ckAceitar", function () { gravarConsent(true); });
    liga("ckRecusar", function () { gravarConsent(false); });
    liga("ckConfigurar", function () { mostrarOpcoes(opcoes ? opcoes.hidden : true); });
    liga("ckSalvar", function () { gravarConsent(ckMedicao && ckMedicao.checked); });
  }
  /* "Rever preferências de cookies" — presente em index.html,
     privacidade.html e obrigado.html; reabre o painel completo. */
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
     Regra de armazenamento:
       antes do consentimento  -> memória + sessionStorage
       consentimento aceito    -> também localStorage (até 90 dias,
                                  com a data da coleta em "ts")
       consentimento recusado  -> localStorage é limpo
     O conteúdo do formulário nunca passa por aqui.
     ============================================================ */
  var CHAVE_CAMPANHA = "rsf_campanha_v1";
  var CAMPOS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term",
                "gclid", "gbraid", "wbraid"];
  var NOVENTA_DIAS = 90 * 24 * 60 * 60 * 1000;

  function guardar(store, dados) {
    try { store.setItem(CHAVE_CAMPANHA, JSON.stringify(dados)); } catch (e) {}
  }

  function recuperar(store) {
    try {
      var d = JSON.parse(store.getItem(CHAVE_CAMPANHA) || "null");
      if (!d) return null;
      /* elimina dado expirado (ou antigo sem data de coleta) */
      if (!d.ts || Date.now() - d.ts > NOVENTA_DIAS) { store.removeItem(CHAVE_CAMPANHA); return null; }
      return d;
    } catch (e) { return null; }
  }

  function lerCampanha() {
    var url = new URLSearchParams(location.search);
    var achou = {}, tem = false;
    CAMPOS.forEach(function (k) {
      var v = url.get(k);
      if (v) { achou[k] = v.slice(0, 200); tem = true; }
    });

    if (tem) {
      achou.ts = Date.now();               /* data da coleta */
      guardar(sessionStorage, achou);      /* sempre permitido: dura a visita */
      if (podeMedir()) guardar(localStorage, achou);  /* persiste SÓ com consentimento */
      return achou;
    }
    return recuperar(sessionStorage) || (podeMedir() ? recuperar(localStorage) : null) || {};
  }

  /* chamada quando o visitante ACEITA: migra a origem da visita
     atual (se houver) para o armazenamento de 90 dias */
  function persistirCampanha() {
    var atual = recuperar(sessionStorage) || campanha;
    if (atual && atual.ts) guardar(localStorage, atual);
  }

  /* chamada quando o visitante RECUSA */
  function limparCampanhaPersistida() {
    try { localStorage.removeItem(CHAVE_CAMPANHA); } catch (e) {}
  }

  /* higiene: se em algum momento houve persistência e o
     consentimento não existe mais, remove o que sobrou */
  if (!podeMedir()) limparCampanhaPersistida();

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
     4. MEDIÇÃO — todos os eventos levam page_type, button_location
     (quando faz sentido) e os parâmetros de campanha disponíveis.
     Nada é enviado sem consentimento.
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
     5. WHATSAPP — reforça o href com a origem da campanha.
     O link base já vem escrito no HTML pelo build; aqui ele só
     ganha a etiqueta de origem (texto que a própria pessoa vê e
     pode apagar antes de enviar).
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
    if (link) a.setAttribute("href", link);      /* href já era válido; aqui só ganha a origem */
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
     Não envia nada para servidor: monta a mensagem e abre o
     WhatsApp. Validação acessível:
       - mensagem de erro ganha a classe .aparece (fica visível)
       - o parágrafo tem role="alert" e aria-live="polite"
       - campo inválido recebe aria-invalid="true"
       - o foco vai para o primeiro campo inválido
       - o erro do campo some assim que ele é corrigido
     ============================================================ */
  var form = doc.getElementById("formContato");
  if (form) {
    var erro = doc.getElementById("formErro");
    var OBRIGATORIOS = ["nome", "cidade", "estado", "marca", "modelo", "ano",
                        "aquisicao", "inventario", "finalidade", "mensagem"];
    var ROTULOS = { nome: "seu nome completo", cidade: "sua cidade", estado: "o estado",
                    marca: "a marca do veículo", modelo: "o modelo do veículo",
                    ano: "o ano aproximado", aquisicao: "a forma de aquisição",
                    inventario: "se o veículo vem de inventário",
                    finalidade: "a finalidade pretendida", mensagem: "o histórico do veículo" };

    function campo(nome) { return form.querySelector('[name="' + nome + '"]'); }
    function valor(nome) {
      var el = campo(nome);
      return el && el.value ? el.value.trim() : "";
    }

    function mostrarErro(texto) {
      if (!erro) return;
      erro.textContent = texto;
      erro.classList.add("aparece");
    }
    function limparErroGeral() {
      if (!erro) return;
      erro.textContent = "";
      erro.classList.remove("aparece");
    }
    function invalidar(el) {
      if (el) el.setAttribute("aria-invalid", "true");
    }
    function revalidar(el) {
      if (!el) return;
      if (el.value && el.value.trim()) {
        el.removeAttribute("aria-invalid");
        /* quando o último inválido é corrigido, a mensagem sai */
        if (!form.querySelector('[aria-invalid="true"]')) limparErroGeral();
      }
    }

    OBRIGATORIOS.forEach(function (nome) {
      var el = campo(nome);
      if (!el) return;
      el.addEventListener("input", function () { revalidar(el); });
      el.addEventListener("change", function () { revalidar(el); });
    });

    form.addEventListener("submit", function (ev) {
      ev.preventDefault();

      /* armadilha para robô: campo escondido preenchido = ignora em silêncio */
      var mel = form.querySelector('[name="empresa"]');
      if (mel && mel.value) return;

      var faltando = [], primeiroInvalido = null;
      OBRIGATORIOS.forEach(function (nome) {
        var el = campo(nome);
        if (!valor(nome)) {
          faltando.push(ROTULOS[nome]);
          invalidar(el);
          if (!primeiroInvalido) primeiroInvalido = el;
        } else if (el) {
          el.removeAttribute("aria-invalid");
        }
      });

      if (faltando.length) {
        mostrarErro("Falta preencher: " + faltando.join(", ") + ".");
        if (primeiroInvalido && primeiroInvalido.focus) primeiroInvalido.focus();
        return;
      }
      limparErroGeral();

      /* monta a ficha de triagem; campos opcionais vazios não entram */
      function linha(rotulo, nomeCampo) {
        var v = valor(nomeCampo);
        return v ? rotulo + ": " + v + "\n" : "";
      }
      var msg =
        "Olá, Dr. Rodrigo. Vim pelo site de Regularização de Carros Antigos e gostaria de solicitar a análise do meu caso.\n\n" +
        "• Contato\n" +
        linha("Nome", "nome") +
        linha("Telefone", "telefone") +
        linha("E-mail", "email") +
        "Cidade/UF: " + valor("cidade") + "/" + valor("estado") + "\n" +
        "\n• Veículo\n" +
        "Marca e modelo: " + valor("marca") + " " + valor("modelo") + "\n" +
        linha("Ano aproximado", "ano") +
        linha("Placa", "placa") +
        linha("Chassi", "chassi") +
        linha("Motor", "motor") +
        "\n• Histórico e situação\n" +
        linha("Forma de aquisição", "aquisicao") +
        linha("Proveniente de inventário", "inventario") +
        linha("Antigo proprietário", "antigoDono") +
        linha("Documento disponível", "documento") +
        linha("Situação no Detran", "situacao") +
        linha("Aparece no Renavam", "renavam") +
        linha("Negativa formal do Detran", "negativa") +
        "\n• Finalidade\n" + valor("finalidade") + "\n" +
        "\n• Histórico do veículo\n" + valor("mensagem");
      var link = montarLink(msg);
      if (!link) {
        /* situação rara (HTML gerado com WhatsApp, config esvaziado
           sem novo build): mensagem neutra, sem jargão técnico */
        mostrarErro("Não foi possível preparar a mensagem agora. Tente pelo botão de WhatsApp da página.");
        return;
      }

      evento("lead_form_submit", { finalidade: valor("finalidade"), aquisicao: valor("aquisicao"), button_location: "contato" });
      dispararConversaoAds((C.googleAdsConversionLabelFormulario || "").trim());

      registrarLead({ nome: valor("nome"), cidade: valor("cidade"), estado: valor("estado"), finalidade: valor("finalidade"), campanha: dadosCampanha() });

      window.open(link, "_blank", "noopener");
      /* a página de obrigado explica que ainda falta tocar em enviar */
      setTimeout(function () { location.href = "obrigado.html"; }, 250);
    });
  }

  /* ============================================================
     7. registrarLead — ponto de extensão isolado
     Hoje não faz nada: não existe servidor, e o site não guarda
     nada do que a pessoa escreve (nem em localStorage, nem em
     sessionStorage). Se um dia houver CRM, é aqui que a chamada
     entra — e a política de privacidade muda junto.
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
