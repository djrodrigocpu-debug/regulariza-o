# CLAUDE.md — Sites Dr. Rodrigo Souza Filho (advocacia)

## Contexto

3 sites: Institucional, Saúde, Carros (OAB/PR 95.516).

## Arquitetura compartilhada

**Edite \modelos/\ — NUNCA saída gerada.**

## Restrições fixas

1. **Sem backend** (LGPD).
2. **Provimento 205/2021** (sóbrio, sem promessa).
3. **Nenhuma promessa de resultado**.
4. **Nome proibido**.
5. **Fontes self-hosted**.

---

## FLUXO DE 5 JANELAS

### Você → Autoridade final (205/2021)

### Janela A: Sonnet Arquiteto

Institucional: \cd C:\Users\Asus\Documents\GitHub\rodrigosouzafilho-adv-br && claude --model claude-sonnet-5\
Saúde: \cd C:\Users\Asus\Documents\GitHub\direito-a-saude && claude --model claude-sonnet-5\
Carros: \cd C:\Users\Asus\Documents\GitHub\regulariza-o && claude --model claude-sonnet-5\

Propõe nos \modelos/\. Respekta 205/2021.

### Janela B: Opus 5 Contraditor

Institucional: \cd C:\Users\Asus\Documents\GitHub\rodrigosouzafilho-adv-br && claude --model claude-opus-5\
Saúde: \cd C:\Users\Asus\Documents\GitHub\direito-a-saude && claude --model claude-opus-5\
Carros: \cd C:\Users\Asus\Documents\GitHub\regulariza-o && claude --model claude-opus-5\

Questiona: viola 205/2021? Promete resultado? LGPD safe?

### Janela C: Sonnet Executor

Institucional: \cd C:\Users\Asus\Documents\GitHub\rodrigosouzafilho-adv-br && claude --model claude-sonnet-5 --effort medium\
Saúde: \cd C:\Users\Asus\Documents\GitHub\direito-a-saude && claude --model claude-sonnet-5 --effort medium\
Carros: \cd C:\Users\Asus\Documents\GitHub\regulariza-o && claude --model claude-sonnet-5 --effort medium\

Implementa. Pode recusar. Valida JSON-LD.

### Janela D: Fable Auditor

Institucional: \cd C:\Users\Asus\Documents\GitHub\rodrigosouzafilho-adv-br && claude --model claude-fable-5 --effort ultracode\
Saúde: \cd C:\Users\Asus\Documents\GitHub\direito-a-saude && claude --model claude-fable-5 --effort ultracode\
Carros: \cd C:\Users\Asus\Documents\GitHub\regulariza-o && claude --model claude-fable-5 --effort ultracode\

Verifica: 205/2021 OK? LGPD? Nome proibido? JSON-LD? CSP?

---

## Como trabalhar

Português. Passe 205/2021 antes. Markdown único colável.
