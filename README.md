# Direito à Saúde — Rodrigo Souza Filho (OAB/PR 95.516)

Landing page estática para campanha de Google Ads. HTML, CSS e um arquivo de
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
| `config.js` | **o único arquivo que você edita** — todos os dados de contato ficam só aqui |
| `modelos/` | modelos das páginas; o build monta o site a partir deles |
| `aplicar-config.js` | o script de build (o Vercel roda; você não precisa) |
| `index.html`, `cancelamento-plano-saude-empresarial.html`, `privacidade.html`, `obrigado.html` | páginas geradas — não edite: o build sobrescreve |
| `public/` | criada pelo build; é o que o Vercel publica (inclui `robots.txt` e `sitemap.xml`) |
| `assets/` | CSS, JavaScript, fontes, favicon e imagens de Open Graph |

## Páginas e URLs limpas

O site tem quatro páginas, todas geradas a partir de `modelos/`:

- `/` — página inicial (Direito à Saúde em geral, com a seção de destaque
  sobre cancelamento de plano empresarial familiar);
- `/cancelamento-plano-saude-empresarial` — página específica sobre o
  cancelamento de planos empresariais pequenos durante tratamento;
- `/privacidade` e `/obrigado` — páginas de apoio (não indexáveis).

O `vercel.json` usa `cleanUrls`, então **as URLs públicas não têm `.html`**
e todos os links internos, canonicals e `og:url` já são gerados assim.
Nunca insira dados de contato diretamente nos HTML: use apenas `config.js`.

## robots.txt e sitemap.xml

O build gera os dois automaticamente dentro de `public/`:

- `robots.txt` sempre existe (`User-agent: * / Allow: /`). A linha
  `Sitemap:` só entra quando o campo `dominio` está preenchido.
- `sitemap.xml` só é criado quando há domínio configurado, e lista apenas
  as páginas indexáveis (`/` e `/cancelamento-plano-saude-empresarial`).
  `/obrigado` e `/privacidade` ficam de fora por serem `noindex`.

## Como conferir o build

Opcional — o fluxo normal dispensa isso, pois o Vercel roda tudo sozinho:

1. `npm run build` na pasta do projeto (só precisa do Node 18+, sem instalar nada);
2. confira no terminal os `ok` de cada página e os avisos de campos vazios;
3. o resultado publicável fica em `public/`. Como os links usam URLs limpas
   (`/privacidade`, `/obrigado`), abrir o arquivo direto no navegador
   (file://) não resolve os links entre páginas — para navegar localmente,
   sirva a pasta com um servidor estático (ex.: `npx serve public`).

## Conformidade que o build garante

- Sem promessa de resultado nos textos (Provimento 205/2021 OAB); ressalvas
  de análise individual nas páginas.
- Nenhum rastreador (GTM/Ads) carrega antes do consentimento; parâmetros de
  campanha só persistem em `localStorage` **após** o aceite, por até 90 dias,
  com data de coleta; recusa apaga o que houver.
- O que o visitante escreve no formulário **nunca** é gravado — nem no
  navegador, nem em servidor.
- Conteúdo integral visível com JavaScript desativado.
