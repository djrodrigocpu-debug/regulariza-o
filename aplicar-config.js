#!/usr/bin/env node
/* ============================================================
   aplicar-config.js — escreve os dados de config.js dentro do HTML.

   VOCÊ NÃO PRECISA RODAR ESTE ARQUIVO.
   O Vercel executa "npm run build" (que chama este script) a cada
   publicação no GitHub. O fluxo é: editar config.js -> enviar ao
   GitHub -> aguardar o Vercel publicar. Só isso.

   (Rodar "node aplicar-config.js" localmente continua possível,
   para quem quiser conferir o resultado antes de publicar.)

   O que ele faz:
   1. lê config.js e valida os dados (dado errado interrompe o
      build com mensagem clara; dado VAZIO é permitido — o elemento
      correspondente simplesmente não aparece no site);
   2. remonta index.html, privacidade.html e obrigado.html a partir
      de modelos/ (por isso os HTML da raiz não devem ser editados
      à mão: qualquer build os sobrescreve);
   3. grava o resultado na raiz (para conferência local) e em
      public/ (a pasta que o Vercel publica), junto com assets/ e
      config.js.

   Condicionais nos modelos (fechamento leva o nome da chave, o que
   permite blocos aninhados de chaves diferentes):
       <!--SE:whatsapp--> ... <!--/SE:whatsapp-->
       <!--SENAO:email--> ... <!--/SENAO:email-->
   Chaves: whatsapp, telefone, email, dominio, urlOutro.
============================================================ */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const PAGINAS = ["index.html", "privacidade.html", "obrigado.html"];
const MODELOS = path.join(__dirname, "modelos");
const PUBLICO = path.join(__dirname, "public");

/* Qual campo de config.js guarda o endereço do OUTRO site.
   Neste projeto (Regularização Veicular), o outro site é o de
   Direito à Saúde. */
const CHAVE_URL_OUTRO = "urlDireitoSaude";

function lerConfig() {
  const src = fs.readFileSync(path.join(__dirname, "config.js"), "utf8");
  const janela = {};
  vm.createContext(janela);
  vm.runInContext(src.replace(/window\./g, "this."), janela);
  return janela.CONFIG || {};
}

function validar(cfg) {
  const erros = [];
  const wa = (cfg.whatsapp || "").trim();
  if (wa) {
    if (!/^\d+$/.test(wa)) erros.push('whatsapp: use só dígitos (sem +, espaço, parêntese ou traço).');
    else if (wa.length < 12 || wa.length > 13) erros.push('whatsapp: "' + wa + '" tem ' + wa.length + ' dígitos; o esperado é 12 ou 13 (55 + DDD + número).');
    else if (!wa.startsWith("55")) erros.push('whatsapp: deve começar com 55 (código do Brasil).');
    else if (wa.includes("999999999") || /^55(\d)\1{8,}$/.test(wa)) erros.push('whatsapp: "' + wa + '" parece um número de exemplo.');
  }
  const dom = (cfg.dominio || "").trim();
  if (dom) {
    if (/^https?:\/\//i.test(dom)) erros.push('dominio: tire o "https://", informe só o domínio.');
    if (dom.includes("/")) erros.push('dominio: sem barras. Informe só o domínio, na forma nomedosite.com.br.');
    if (/seu-?dominio|exemplo\./i.test(dom)) erros.push('dominio: "' + dom + '" parece um domínio de exemplo.');
  }
  const em = (cfg.email || "").trim();
  if (em) {
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(em)) erros.push('email: "' + em + '" não parece um e-mail válido.');
    if (/seu-?dominio|exemplo\./i.test(em)) erros.push('email: "' + em + '" parece um e-mail de exemplo.');
  }
  ["urlDireitoSaude", "urlRegularizacaoVeicular"].forEach(function (chave) {
    const u = (cfg[chave] || "").trim();
    if (!u) return;
    if (!/^https:\/\/[^\s"'<>]+$/i.test(u)) erros.push(chave + ': use o endereço completo, começando com https:// e sem espaços.');
    if (/seu-?dominio|exemplo\./i.test(u)) erros.push(chave + ': "' + u + '" parece um endereço de exemplo.');
  });
  const ads = (cfg.googleAdsConversionId || "").trim();
  if (ads && !/^AW-\d{9,12}$/.test(ads)) erros.push('googleAdsConversionId: "' + ads + '" deveria ser AW- seguido de 9 a 12 dígitos.');
  const gtm = (cfg.googleTagManagerId || "").trim();
  if (gtm && !/^GTM-[A-Z0-9]{6,9}$/.test(gtm)) erros.push('googleTagManagerId: "' + gtm + '" deveria ser GTM- seguido de 6 a 9 caracteres.');
  return erros;
}

function decodeEntidades(s) {
  return s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
          .replace(/&quot;/g, '"').replace(/&#39;/g, "'");
}

function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }

/* motor de tokens: condicionais com fechamento nomeado + substituições */
function resolver(txt, cfg) {
  const urlOutro = (cfg[CHAVE_URL_OUTRO] || "").trim().replace(/\/+$/, "");
  const tem = {
    whatsapp: !!(cfg.whatsapp || "").trim(),
    telefone: !!(cfg.telefoneExibicao || "").trim(),
    email: !!(cfg.email || "").trim(),
    dominio: !!(cfg.dominio || "").trim(),
    urlOutro: !!urlOutro
  };
  for (const chave of Object.keys(tem)) {
    const k = escapeRegExp(chave);
    txt = txt.replace(new RegExp("<!--SE:" + k + "-->([\\s\\S]*?)<!--/SE:" + k + "-->", "g"), tem[chave] ? "$1" : "");
    txt = txt.replace(new RegExp("<!--SENAO:" + k + "-->([\\s\\S]*?)<!--/SENAO:" + k + "-->", "g"), tem[chave] ? "" : "$1");
  }
  if (tem.whatsapp) {
    txt = txt.replace(/__WA:([\s\S]*?)__/g, function (m, msg) {
      return "https://wa.me/" + cfg.whatsapp.trim() + "?text=" + encodeURIComponent(decodeEntidades(msg));
    });
  }
  if (tem.telefone) {
    const dig = cfg.telefoneExibicao.replace(/\D/g, "");
    txt = txt.split("__TEL__").join("tel:+55" + dig).split("__TEL_TXT__").join(cfg.telefoneExibicao.trim());
  }
  if (tem.email) {
    txt = txt.split("__EMAIL_LINK__").join("mailto:" + cfg.email.trim()).split("__EMAIL__").join(cfg.email.trim());
  }
  if (tem.dominio) {
    txt = txt.split("__URL__").join("https://" + cfg.dominio.trim().replace(/\/+$/, ""));
  }
  if (tem.urlOutro) {
    txt = txt.split("__URL_OUTRO__").join(urlOutro);
  }
  return txt;
}

/* nenhum marcador pode sobrar no HTML publicado */
function conferirSobras(nome, txt) {
  const sobras = txt.match(/<!--\/?(?:SE|SENAO):[a-zA-Z]+-->|__(?:WA:|TEL__|TEL_TXT__|EMAIL__|EMAIL_LINK__|URL__|URL_OUTRO__)/g);
  if (sobras) {
    console.error("  ATENÇÃO em " + nome + ": marcadores não resolvidos: " + Array.from(new Set(sobras)).join(", "));
    return false;
  }
  return true;
}

function copiarParaPublico() {
  fs.rmSync(PUBLICO, { recursive: true, force: true });
  fs.mkdirSync(PUBLICO, { recursive: true });
  fs.cpSync(path.join(__dirname, "assets"), path.join(PUBLICO, "assets"), { recursive: true });
  fs.copyFileSync(path.join(__dirname, "config.js"), path.join(PUBLICO, "config.js"));
}

function principal() {
  const cfg = lerConfig();
  const erros = validar(cfg);
  if (erros.length) {
    console.error("\n  Configuração com problema — nada foi publicado:\n");
    erros.forEach(function (e) { console.error("   • " + e); });
    console.error("");
    process.exit(1);
  }
  if (!fs.existsSync(MODELOS)) {
    console.error("\n  Pasta modelos/ não encontrada. Ela faz parte do projeto e é necessária para o build.\n");
    process.exit(1);
  }

  copiarParaPublico();

  console.log("");
  let tudoOk = true;
  PAGINAS.forEach(function (nome) {
    const modelo = path.join(MODELOS, nome);
    if (!fs.existsSync(modelo)) { console.error("  FALTA modelo: " + nome); tudoOk = false; return; }
    const html = resolver(fs.readFileSync(modelo, "utf8"), cfg);
    if (!conferirSobras(nome, html)) tudoOk = false;
    fs.writeFileSync(path.join(__dirname, nome), html, "utf8");      /* raiz: conferência local  */
    fs.writeFileSync(path.join(PUBLICO, nome), html, "utf8");        /* public/: o que o Vercel publica */
    console.log("  ok  " + nome);
  });
  if (!tudoOk) process.exit(1);

  /* Aviso para o DESENVOLVEDOR (console do build). O visitante do
     site nunca vê mensagem de configuração pendente: os elementos
     que dependem de dado vazio simplesmente não são gerados. */
  const faltando = [];
  if (!(cfg.whatsapp || "").trim()) faltando.push("whatsapp — sem ele, NENHUM botão de WhatsApp aparece e o formulário fica oculto");
  if (!(cfg.telefoneExibicao || "").trim()) faltando.push("telefoneExibicao — nenhum telefone é exibido");
  if (!(cfg.email || "").trim()) faltando.push("email — nenhum e-mail é exibido");
  if (!(cfg.dominio || "").trim()) faltando.push("dominio — sem canonical nem og:url (prejudica o SEO)");
  if (!(cfg[CHAVE_URL_OUTRO] || "").trim()) faltando.push(CHAVE_URL_OUTRO + " — o rodapé não mostra o link para a outra área");
  if (!(cfg.googleTagManagerId || "").trim()) faltando.push("googleTagManagerId — o GTM não carrega");
  if (!(cfg.googleAdsConversionId || "").trim()) faltando.push("googleAdsConversionId — nenhuma conversão vai ao Ads");
  if (!(cfg.googleAdsConversionLabelWhatsapp || "").trim()) faltando.push("googleAdsConversionLabelWhatsapp");
  if (!(cfg.googleAdsConversionLabelFormulario || "").trim()) faltando.push("googleAdsConversionLabelFormulario");

  if (faltando.length) {
    console.log("\n  Ainda vazio em config.js (o site publica normalmente, sem esses elementos):");
    faltando.forEach(function (f) { console.log("   • " + f); });
  } else {
    console.log("\n  Tudo preenchido.");
  }
  console.log("\n  Publicação pronta em public/.\n");
}

principal();
