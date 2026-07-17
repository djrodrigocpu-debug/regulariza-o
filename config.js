/* ============================================================
   CONFIGURAÇÃO — Regularização Veicular
   Este é o ÚNICO arquivo a editar. Depois de preencher, rode na
   pasta do projeto:

       node aplicar-config.js

   O script escreve os dados dentro do HTML, para que os botões
   funcionem mesmo se o JavaScript falhar. Enquanto o WhatsApp
   estiver vazio, os botões não aparecem — de propósito: é melhor
   não ter botão do que ter botão que não funciona.
============================================================ */
window.CONFIG = {

  /* WhatsApp, só dígitos: 55 + DDD + número. Ex.: "5541988887777" */
  whatsapp: "",

  /* Telefone como deve aparecer na tela. Ex.: "(41) 98888-7777"
     Vazio = nenhum telefone é exibido. */
  telefoneExibicao: "",

  /* E-mail de contato. Ex.: "contato@exemplo.adv.br" */
  email: "",

  /* Domínio final, sem https:// e sem barra. Ex.: "exemplo.adv.br" */
  dominio: "",

  /* ---- Google Ads ----
     ID da conta, formato "AW-XXXXXXXXX". */
  googleAdsConversionId: "",

  /* Rótulos de conversão (Google Ads > Objetivos > Conversões).
     Formato: "abcDEfgh12IjKlMn". Sem ID + rótulo, nada é disparado. */
  googleAdsConversionLabelWhatsapp: "",
  googleAdsConversionLabelFormulario: "",

  /* ---- Google Tag Manager ----
     Formato "GTM-XXXXXXX". Vazio = o GTM nem chega a ser carregado. */
  googleTagManagerId: ""
};

/* Dados desta página — não precisa mexer. */
window.PAGINA = {
  tipo: "veicular",
  mensagemWhatsapp: "Olá, Dr. Rodrigo. Vim pelo site de Regularização Veicular. Meu veículo está com uma pendência no Detran/PR e gostaria de saber quais documentos são necessários para analisar o caso."
};
