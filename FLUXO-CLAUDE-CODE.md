# Fluxo de Três Janelas — Claude Code

## Quick Start

Abra **três terminais na mesma pasta do projeto**.

### Janela A: Planejamento (Opus 5)
\\\ash
claude --model claude-opus-5
# Shift+Tab → plan mode
\\\

### Janela B: Execução (Sonnet 5)
\\\ash
claude --model claude-sonnet-5 --effort medium
\\\

### Janela C: Auditoria (Fable 5)
\\\ash
claude --model claude-fable-5 --effort ultracode
\\\

## Dentro da sessão

\\\
/model opus        /model sonnet      /model fable
/effort medium     /effort ultracode  /effort low
\\\

## Resumo

| Modelo | Esforço | Quando | Por quê |
|--------|---------|--------|--------|
| Opus 5 | plan mode | Planejamento | Pensa fundo, vê arquivos reais |
| Sonnet 5 | medium | Execução | Balanceado, economiza token |
| Fable 5 | ultracode | Auditoria | Máximo raciocínio + workflows |
