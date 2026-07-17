#!/usr/bin/env node
/* ============================================================
   aplicar-config.js — escreve os dados de config.js dentro do HTML.

   Uso:  node aplicar-config.js

   Por que existe: um botão de WhatsApp precisa funcionar mesmo que o
   JavaScript não carregue. Este script coloca o link real no href.
   Pode rodar quantas vezes quiser: os modelos ficam em .modelos/ e a
   página é sempre remontada a partir deles.
============================================================ */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const PAGINAS = ["index.html", "obrigado.html", "privacidade.html"];
const MODELOS = path.join(__dirname, ".modelos");

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
    if (dom.includes("/")) erros.push('dominio: sem barras. Ex.: "exemplo.adv.br".');
    if (/seu-?dominio|exemplo\.com/i.test(dom)) erros.push('dominio: "' + dom + '" parece um domínio de exemplo.');
  }
  const em = (cfg.email || "").trim();
  if (em) {
    if (!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(em)) erros.push('email: "' + em + '" não parece um e-mail válido.');
    if (/seudominio|exemplo\.com/i.test(em)) erros.push('email: "' + em + '" parece um e-mail de exemplo.');
  }
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

/* mesmo motor de tokens do gerador */
function resolver(txt, cfg) {
  const tem = {
    whatsapp: !!(cfg.whatsapp || "").trim(),
    telefone: !!(cfg.telefoneExibicao || "").trim(),
    email: !!(cfg.email || "").trim(),
    dominio: !!(cfg.dominio || "").trim()
  };
  for (const chave of Object.keys(tem)) {
    txt = txt.replace(new RegExp("<!--SE:" + chave + "-->([\\s\\S]*?)<!--/SE-->", "g"), tem[chave] ? "$1" : "");
    txt = txt.replace(new RegExp("<!--SENAO:" + chave + "-->([\\s\\S]*?)<!--/SENAO-->", "g"), tem[chave] ? "" : "$1");
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
  return txt;
}

function principal() {
  const cfg = lerConfig();
  const erros = validar(cfg);
  if (erros.length) {
    console.error("\n  Configuração com problema — nada foi alterado:\n");
    erros.forEach(function (e) { console.error("   • " + e); });
    console.error("");
    process.exit(1);
  }
  if (!fs.existsSync(MODELOS)) {
    console.error("\n  Pasta .modelos/ não encontrada. Ela vem junto no ZIP e é necessária.\n");
    process.exit(1);
  }

  console.log("");
  PAGINAS.forEach(function (nome) {
    const modelo = path.join(MODELOS, nome);
    if (!fs.existsSync(modelo)) return;
    fs.writeFileSync(path.join(__dirname, nome), resolver(fs.readFileSync(modelo, "utf8"), cfg), "utf8");
    console.log("  ok  " + nome);
  });

  const faltando = [];
  if (!(cfg.whatsapp || "").trim()) faltando.push("whatsapp — sem ele, NENHUM botão de WhatsApp aparece");
  if (!(cfg.telefoneExibicao || "").trim()) faltando.push("telefoneExibicao — nenhum telefone é exibido");
  if (!(cfg.email || "").trim()) faltando.push("email — nenhum e-mail é exibido");
  if (!(cfg.dominio || "").trim()) faltando.push("dominio — sem canonical nem og:url (prejudica o SEO)");
  if (!(cfg.googleTagManagerId || "").trim()) faltando.push("googleTagManagerId — o GTM não carrega");
  if (!(cfg.googleAdsConversionId || "").trim()) faltando.push("googleAdsConversionId — nenhuma conversão vai ao Ads");
  if (!(cfg.googleAdsConversionLabelWhatsapp || "").trim()) faltando.push("googleAdsConversionLabelWhatsapp");
  if (!(cfg.googleAdsConversionLabelFormulario || "").trim()) faltando.push("googleAdsConversionLabelFormulario");

  if (faltando.length) {
    console.log("\n  Ainda vazio em config.js:");
    faltando.forEach(function (f) { console.log("   • " + f); });
  } else {
    console.log("\n  Tudo preenchido.");
  }
  console.log("");
}

principal();
