# Regularização Judicial de Carros Antigos — Rodrigo Souza Filho (OAB/PR 95.516)

Landing page estática para campanha de Google Ads, posicionada na especialidade
principal do escritório: **regularização judicial de carros antigos, clássicos,
históricos e de coleção** — veículos sem documentos, provenientes de inventário
ou não localizados nas bases do DETRAN, BIN e RENAVAM. HTML, CSS e um arquivo de
JavaScript — sem framework. **Você nunca precisa abrir terminal**: o Vercel
executa o build sozinho a cada alteração enviada ao GitHub.

---

## Como publicar uma alteração (o único fluxo que você precisa saber)

1. Abra o arquivo **`config.js`** (no site do GitHub mesmo: clique no arquivo
   e depois no lápis de editar).
2. Preencha o campo desejado **entre as aspas** e salve (botão *Commit changes*).
3. Aguarde 1–2 minutos: o Vercel percebe a mudança, roda o build e publica.

Nada além disso. Sem `node`, sem `npm`, sem comando manual.

## Onde inserir cada dado (tudo em `config.js`)

| O que | Campo em `config.js` | Formato |
|---|---|---|
| WhatsApp | `whatsapp` | 55 + DDD + número, só dígitos (12 ou 13 no total) |
| Telefone exibido | `telefoneExibicao` | como deve aparecer na tela, com DDD |
| E-mail | `email` | endereço completo |
| Domínio deste site | `dominio` | sem `https://` e sem barra |
| URL do site de Direito à Saúde | `urlDireitoSaude` | endereço completo, com `https://` |
| URL do site de Regularização Veicular | `urlRegularizacaoVeicular` | endereço completo, com `https://` |
| Google Tag Manager | `googleTagManagerId` | começa com `GTM-` |
| Google Ads (conta) | `googleAdsConversionId` | começa com `AW-` |
| Rótulo de conversão (WhatsApp) | `googleAdsConversionLabelWhatsapp` | rótulo gerado no Google Ads |
| Rótulo de conversão (formulário) | `googleAdsConversionLabelFormulario` | rótulo gerado no Google Ads |

**Enquanto um campo estiver vazio, o elemento que depende dele não aparece**
— sem botão quebrado e sem mensagem técnica para o visitante:

- `whatsapp` vazio → nenhum botão de WhatsApp, nenhuma barra fixa, nenhum
  botão flutuante e o formulário inteiro fica oculto (a única ação dele é
  abrir o WhatsApp).
- `urlDireitoSaude` / `urlRegularizacaoVeicular` vazios → o rodapé não mostra
  o link "Outra área de atuação".
- `googleTagManagerId` / `googleAdsConversionId` vazios → nenhum script do
  Google é carregado.

Os avisos de "campo vazio" existem, mas **só para o desenvolvedor**: no log de
build do Vercel e no console do navegador (F12).

## Primeira publicação (uma vez só)

1. Crie um repositório no GitHub e envie os arquivos deste projeto
   (pode ser por *Add file → Upload files*, arrastando a pasta inteira).
2. Em [vercel.com](https://vercel.com), *Add New → Project*, escolha o
   repositório e clique em *Deploy*. O `vercel.json` já traz toda a
   configuração (build automático e pasta de publicação `public/`).
3. Depois de o outro site também estar no ar, copie a URL dele para o campo
   correspondente em `config.js` — nos **dois** projetos — para o link
   "Outra área de atuação" aparecer nos rodapés.

## Como o projeto se organiza

| Arquivo/pasta | Papel |
|---|---|
| `config.js` | **o único arquivo que você edita** |
| `modelos/` | modelos das páginas; o build monta o site a partir deles |
| `aplicar-config.js` | o script de build (o Vercel roda; você não precisa) |
| `index.html`, `privacidade.html`, `obrigado.html` | páginas geradas — não edite: o build sobrescreve |
| `public/` | criada pelo build; é o que o Vercel publica |
| `assets/` | CSS, JavaScript, fontes e favicon |

Quer conferir localmente antes de publicar? Opcional: `npm run build` na
pasta do projeto e abra o `index.html`. Mas o fluxo normal dispensa isso.

## Conformidade que o build garante

- Sem promessa de resultado nos textos (Provimento 205/2021 OAB); ressalvas
  de análise individual nas páginas.
- Nenhum rastreador (GTM/Ads) carrega antes do consentimento; parâmetros de
  campanha só persistem em `localStorage` **após** o aceite, por até 90 dias,
  com data de coleta; recusa apaga o que houver.
- O que o visitante escreve no formulário **nunca** é gravado — nem no
  navegador, nem em servidor. Os campos de placa, chassi e motor da ficha de
  triagem são opcionais e entram apenas na mensagem que o próprio visitante
  envia pelo WhatsApp.
- Aviso obrigatório junto ao formulário: o envio das informações não cria
  automaticamente relação advogado-cliente nem representa garantia de
  viabilidade ou resultado.
- Conteúdo integral visível com JavaScript desativado.
