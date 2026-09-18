# CLAUDE.md — Regularização de carros antigos

Site de **Rodrigo Augusto Wagner de Souza Filho**, OAB/PR 95.516, Curitiba/PR.
Monograma RAWSF. Repositório `regulariza-o`, publicado em https://carrosantigos.rodrigosouzafilho.adv.br pela Vercel.

Os três sites do escritório:

| Site | Repositório | Endereço publicado |
|---|---|---|
| Institucional | `rodrigosouzafilho-adv-br` | https://www.rodrigosouzafilho.adv.br |
| Direito à Saúde | `direito-a-saude` | https://saude.rodrigosouzafilho.adv.br |
| Carros antigos | `regulariza-o` | https://carrosantigos.rodrigosouzafilho.adv.br |

## Regra de ouro

Editar **somente** `config.js` e `modelos/`. O build regenera os HTML da raiz e
de `public/`:

```bash
node aplicar-config.js
```

A Vercel roda esse mesmo comando a cada envio para `main` e publica `public/`.
Nunca editar os HTML da raiz nem de `public/`: o build sobrescreve os dois.

O build também injeta `?v=<hash>` nos links de `assets/estilo.css` e
`assets/app.js`, para o navegador de quem já visitou buscar a versão nova. Nos
modelos o link fica limpo (`assets/estilo.css`); nunca fixar `?v=` à mão.

## Restrições fixas

1. **Sem backend**: site 100% estático.
2. **Provimento 205/2021 da OAB**: informativo e sóbrio. Sem promessa de
   resultado ou de prazo, sem "consulta grátis", sem depoimento e sem número de
   êxito. Ressalvas negativas ficam no rodapé; no corpo, linguagem positiva.
3. **LGPD**: nada do Google carrega antes do consentimento; fontes
   auto-hospedadas em `assets/fontes/` (nunca Google Fonts); o formulário não
   envia nada a servidor.
4. **Nome proibido**: o nome do projeto musical do dono não pode aparecer em
   arquivo gerado.
5. **Sem `Co-Authored-By`** nem atribuição a IA nos commits.

## Antes de mexer

- `git fetch` e conferir se a cópia local está atrás do GitHub antes de ler ou
  editar: o dono trabalha em mais de uma sessão ao mesmo tempo.
- A decisão é sempre do dono. Planejar não autoriza implementar; implementar não
  autoriza commit, envio, publicação nem etiqueta.
- Toda verificação vem classificada: REAL REMOTO, REAL LOCAL, DEMONSTRATIVO ou
  SOMENTE ESTRUTURAL. Não afirmar que algo está no ar sem medir o que está no ar.

## Como trabalhar

Em português, em mensagens curtas. O fluxo de janelas por modelo está em
`FLUXO-CLAUDE-CODE.md`.
