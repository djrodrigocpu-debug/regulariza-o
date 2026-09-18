# Fluxo de janelas — Claude Code

A decisão final é sempre sua. Cada janela é uma sessão do Claude Code aberta na
pasta deste repositório; o que muda é o modelo e o esforço.

| Janela | Modelo | Papel |
|---|---|---|
| A — Arquiteto | Sonnet 5, em modo plano | Propõe a mudança nos `modelos/` e no `config.js` |
| B — Contraditor | Opus 5 | Questiona: fere o Provimento 205/2021? promete resultado? é seguro em LGPD? |
| C — Executor | Sonnet 5, esforço `medium` | Implementa. Pode recusar. Valida o JSON-LD |
| D — Auditor | Fable 5.1, esforço `high` | Confere 205/2021, LGPD, nome proibido, JSON-LD e CSP |

## Abrir cada janela

Sempre a partir da pasta deste repositório:

```bash
claude --model claude-sonnet-5
```

```bash
claude --model claude-opus-5
```

```bash
claude --model claude-sonnet-5 --effort medium
```

```bash
claude --model claude-fable-5-1 --effort high
```

## Dentro da sessão

Dá para trocar sem reabrir a janela:

```
/model opus
/model sonnet
/model fable
/effort medium
/effort high
```

`Shift+Tab` alterna o modo plano, em que o Claude propõe sem editar arquivo.

## Ordem de trabalho

1. A propõe.
2. B contesta.
3. Você decide.
4. C implementa só o que você aprovou.
5. D audita.
6. Você autoriza o commit, depois o envio, depois a publicação — cada um é uma
   autorização separada.
