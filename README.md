# Regularização Veicular — Rodrigo Souza Filho (OAB/PR 95.516)

Landing page estática para campanha de Google Ads. Sem framework, sem build,
sem dependência externa. É HTML, CSS e um arquivo de JavaScript.

---

## 1. O que fazer antes de publicar (5 minutos)

### Passo 1 — preencher `config.js`

É o **único** arquivo com dados de contato. Abra e preencha:

```js
whatsapp: "5541988887777",        // 55 + DDD + número, só dígitos
telefoneExibicao: "(41) 98888-7777",
email: "contato@exemplo.adv.br",
dominio: "exemplo.adv.br",        // sem https://, sem barra
```

### Passo 2 — rodar o script

```bash
node aplicar-config.js
```

O script grava os dados **dentro do HTML**. Isso é o que faz o botão de
WhatsApp funcionar mesmo se o JavaScript não carregar — e é por isso que
ele é obrigatório.

> **Enquanto o `whatsapp` estiver vazio, nenhum botão de WhatsApp aparece
> no site.** É de propósito: um botão que não funciona custa mais caro que
> botão nenhum, ainda mais em página paga por clique. Um aviso visível na
> página avisa o que falta. O aviso some quando você rodar o script.

O script recusa dados que parecem errados: número com quantidade estranha de
dígitos, domínio com `https://`, e-mail malformado, ID de Ads fora do padrão.

### Passo 3 — publicar

```bash
npx vercel --prod
```

Ou arraste a pasta em vercel.com/new. O `vercel.json` já traz os cabeçalhos
de segurança e o cache das fontes.

---

## 2. Google Ads e Tag Manager

Preencha em `config.js` e rode `node aplicar-config.js` de novo:

```js
googleTagManagerId: "GTM-XXXXXXX",
googleAdsConversionId: "AW-XXXXXXXXX",
googleAdsConversionLabelWhatsapp: "...",   // Ads > Objetivos > Conversões
googleAdsConversionLabelFormulario: "...",
```

Regras que o código respeita sozinho:

- Vazio = **não carrega nada**. Sem GTM, sem gtag, sem requisição ao Google.
- Nenhuma tag carrega **antes do consentimento** de cookies.
- Conversão do Ads só dispara com **ID + rótulo** preenchidos. Nunca há ID de
  exemplo no código.

### Eventos enviados ao `dataLayer`

| Evento | Quando | Campos extras |
|---|---|---|
| `whatsapp_click` | clique em qualquer botão de WhatsApp | `button_location` |
| `phone_click` | clique no telefone | `button_location` |
| `lead_form_submit` | envio do formulário de triagem | `assunto` |
| `faq_open` | abertura de uma pergunta | `faq_pergunta` |
| `scroll_50` / `scroll_90` | metade / fim da página | — |

Todos levam junto: `page_type` (`veicular`), `utm_source`, `utm_medium`,
`utm_campaign`, `utm_content`, `utm_term`, `gclid`.

`button_location` assume: `cabecalho`, `hero`, `contato`, `barra_fixa`,
`flutuante`, `obrigado`.

### Rastreamento de campanha

Ao chegar pelo anúncio, o site guarda `utm_*`, `gclid`, `gbraid` e `wbraid`
(sessionStorage + localStorage, 90 dias) e embute uma linha discreta na
mensagem do WhatsApp:

```
Origem: Google Ads | Campanha: saude-liminar | Termo: plano negou cirurgia
```

Assim você sabe qual anúncio trouxe a pessoa, sem depender de o cliente contar.
**Só dados de campanha são guardados** — nunca o que a pessoa escreveu.

---

## 3. Conversão offline (o que fazer com o lead depois)

O Google Ads otimiza pelo que você mede. Se você medir só "clicou no
WhatsApp", ele traz gente que clica — não gente que contrata. O caminho é
importar conversões offline. Isto aqui **não** é um CRM: é o funil mínimo
para o Ads aprender.

Guarde numa planilha, a cada lead:

| Coluna | Exemplo |
|---|---|
| `gclid` | vem na mensagem do WhatsApp (linha "Origem") |
| `data_hora` | 2026-07-16 14:32 |
| `estagio` | `lead_recebido` |

Estágios, em ordem:

1. `lead_recebido` — chegou mensagem
2. `lead_invalido` — engano, spam, outra área · `lead_sem_resposta` — sumiu
3. `caso_potencialmente_viavel` — vale analisar
4. `consulta_realizada` — conversou de fato
5. `contrato_assinado` — virou cliente

Depois, em **Google Ads > Objetivos > Conversões > Importar**, suba a planilha
com `gclid` + estágio. Comece importando `caso_potencialmente_viavel` e
`contrato_assinado`. Em poucas semanas o Ads passa a procurar quem se parece
com quem assinou, não com quem só clicou.

---

## 4. Arquivos

```
regularizacao-veicular/
├── index.html          página principal
├── obrigado.html       confirmação (noindex) — não conta conversão sozinha
├── privacidade.html    política de privacidade + preferências de cookies
├── config.js           ← o único arquivo a editar
├── aplicar-config.js   grava config.js dentro do HTML (node aplicar-config.js)
├── vercel.json         cabeçalhos de segurança e cache
├── .modelos/           modelos com marcações; o script lê daqui. Não apague.
└── assets/
    ├── estilo.css      identidade visual
    ├── app.js          consentimento, medição, campanha, formulário
    ├── favicon.svg     monograma RSF
    └── fontes/         Newsreader + Albert Sans (auto-hospedadas)
```

### Trocar a foto

Em `index.html`, procure por `foto-reservada`. O comentário logo acima traz o
código pronto para colar no lugar. Arquivo sugerido:
`assets/rodrigo-souza-filho.webp`, 720x900 px, até 120 KB.

---

## 5. Limites que o código respeita (e por quê)

Provimento nº 205/2021 e Código de Ética da OAB. O site **não** tem, e não
deve ganhar:

- promessa de resultado ou de prazo
- número de casos, anos de atuação, taxa de êxito
- depoimento de cliente, nota, estrela, avaliação
- valor de honorário, desconto, "primeira consulta grátis"
- contador regressivo, "últimas vagas", urgência artificial
- comparação com outros advogados

Se for acrescentar texto novo, o teste é simples: *isso informa ou isso
vende?* Informar pode.

---

## 6. Outra área

Este projeto tem um irmão: **Direito à Saúde**, com a mesma identidade visual e a mesma estrutura. As duas pastas são independentes: cada uma tem o seu `config.js` e pode ser publicada em um domínio (ou subdomínio) diferente.

---

## 7. Manutenção

- **Trocar telefone/e-mail:** só em `config.js` + `node aplicar-config.js`.
- **Trocar texto:** edite `.modelos/index.html` e rode o script de novo.
  (Editar só `index.html` funciona, mas a mudança some no próximo `node
  aplicar-config.js`, porque a página é remontada a partir do modelo.)
- **Novas landing pages por termo** (ex.: "cirurgia negada", "transferência
  negada"): copie a pasta, troque `<h1>`, `<title>`, a `mensagemWhatsapp` em
  `config.js` e os cards. A estrutura foi feita para isso.
