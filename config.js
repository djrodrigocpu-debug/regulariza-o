/* ============================================================
   CONFIGURAÇÃO — Regularização Veicular
   Este é o ÚNICO arquivo a editar. Depois de preencher, envie a
   alteração ao GitHub e aguarde: o Vercel roda o build sozinho e
   aplica os dados no site. Não é preciso abrir terminal nem rodar
   comando algum.

   Enquanto um campo estiver vazio, o elemento que depende dele
   simplesmente não aparece — de propósito: é melhor não ter botão
   do que ter botão que não funciona. Nenhuma mensagem técnica é
   exibida ao visitante; avisos de campo vazio saem apenas no
   console do build e no console do navegador (para o desenvolvedor).
============================================================ */
window.CONFIG = {

  /* WhatsApp, só dígitos: 55 + DDD + número (12 ou 13 dígitos ao
     todo). Vazio = nenhum botão de WhatsApp aparece e o formulário
     fica oculto. */
  whatsapp: "5541988797835",

  /* Telefone como deve aparecer na tela, com DDD entre parênteses.
     Vazio = nenhum telefone é exibido. */
  telefoneExibicao: "(41) 98879-7835",

  /* E-mail de contato. Vazio = nenhum e-mail é exibido. */
  email: "contato@rodrigosouzafilho.adv.br",

  /* Domínio final deste site, sem https:// e sem barra.
     Vazio = o site publica sem canonical/og:url. */
  dominio: "carrosantigos.rodrigosouzafilho.adv.br",

  /* ---- Ligação entre os dois sites ----
     Endereço COMPLETO (com https://) do outro site depois de
     publicado no Vercel. Enquanto estiver vazio, o link "Outra
     área de atuação" não aparece no rodapé. */
  urlDireitoSaude: "https://saude.rodrigosouzafilho.adv.br",
  urlRegularizacaoVeicular: "",

  /* ---- Site institucional ----
     Endereço COMPLETO (com https://) do site principal. Enquanto
     estiver vazio, o link "Site institucional" não aparece no rodapé. */
  urlInstitucional: "https://www.rodrigosouzafilho.adv.br",

  /* ---- Google Ads ----
     ID da conta, no formato AW- seguido dos dígitos da conta.
     Vazio = nenhuma conversão é enviada. */
  googleAdsConversionId: "",

  /* Rótulos de conversão (Google Ads > Objetivos > Conversões).
     Sem ID + rótulo, nada é disparado. */
  googleAdsConversionLabelWhatsapp: "",
  googleAdsConversionLabelFormulario: "",

  /* ---- Google Tag Manager ----
     No formato GTM- seguido do código do contêiner.
     Vazio = o GTM nem chega a ser carregado. */
  googleTagManagerId: "GTM-KL4XQVMT"
};

/* Dados desta página — não precisa mexer. */
window.PAGINA = {
  tipo: "veicular",
  mensagemWhatsapp: "Olá, Dr. Rodrigo. Vim pelo site de Regularização de Carros Antigos. Tenho um veículo antigo com pendência de documentação ou de cadastro e gostaria de solicitar a análise do caso."
};
