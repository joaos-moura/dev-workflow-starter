# dev-workflow-starter — Guia de design

Claro, minimalista, técnico (refs: Linear, Vercel, Stripe). Fundo branco, uma cor de destaque, bordas finas em vez de sombras.

## Tipografia
- Sans: Inter → system-ui (fallback). Mono: JetBrains Mono → ui-monospace.
- Escala (desktop / mobile): H1 64/40 px, peso 650, tracking -0.035em, line-height 1.05 · H2 40/30 px, peso 620, -0.025em · Lead 19/17 px · Corpo 16 px / 1.6 · Card 14.5 px · Eyebrow mono 12 px uppercase +0.08em · Nota 13.5 px.

## Paleta
| Token | Hex | Uso |
|---|---|---|
| bg | #FFFFFF | fundo |
| bg2 | #F7F8FA | seções alternadas, code block |
| line | #E6E8EC | bordas, divisores |
| ink | #0B0D12 | títulos, botão primário |
| ink2 | #4A5160 | texto |
| ink3 | #8A919E | legendas, setas |
| accent | #4F46E5 | eyebrow, ícones, nó OIDC |
| accent-soft | #EEF0FF | pill, fundo de ícone, gradiente do hero |
| ok / ok-soft | #0E9F6E / #E8F7F1 | coluna "Depois" |
| warn / warn-soft | #D9480F / #FFF1EA | coluna "Antes" |

## Grid e espaçamento
- Container 1120 px, padding lateral 24 px. Base 4/8 px.
- Seções: 88 px vertical (64 no mobile), divididas por borda 1 px; fundo alternado branco/bg2.
- Cards em 3 colunas (gap 16); comparação e "Como usar" em 2 colunas. Abaixo de 860 px tudo vira 1 coluna.
- Raios: 8 px (botões), 12 px (cards), 16 px (diagrama).

## Componentes
- **Nav**: sticky, 60 px, branco 85% + blur, borda inferior; logo + 5 âncoras + botão secundário pequeno. Links somem no mobile.
- **Hero**: centralizado, pill de contexto, H1, lead, 2 CTAs; gradiente radial accent-soft sutil no topo.
- **Botões**: 40 px, raio 8. Primário = fundo ink, texto branco; secundário = branco com borda line.
- **Cards**: branco, borda 1 px, padding 24, ícone 32 px com sigla mono sobre accent-soft. Variante de estatística com número 44 px.
- **Diagrama**: fluxo Backstage (borda ink, porta de entrada) → GitHub → Actions → OIDC → conta AWS Dev; pulso animado (ponto accent de 6 px percorrendo cada seta, 1.8 s em loop; vertical no mobile). Nós (cards pequenos) ligados por setas CSS de 1 px; OIDC destacado em accent; conta AWS Dev como contêiner tracejado agrupando Terraform e S3+Lambda. Horizontal no desktop, vertical no mobile.
- **Antes/depois**: duas colunas; marcadores ✕ (warn) e ✓ (ok) em círculos suaves; selo de tempo mono no rodapé ("dias" vs "minutos").
- **Code block**: fundo bg2 (nunca escuro), barra de título com rótulo, mono 13.5 px; comentários ink3, variáveis accent, strings ok. Inline code com borda.
- **Passos**: lista numerada com círculo mono 28 px, título em negrito + descrição.
- **Demo do portal (seção 03, logo após a Solução)**: duas janelas lado a lado (empilhadas no mobile), raio 16, sombra leve. Esquerda: formulário "Backstage · Criar serviço" com Nome do serviço, Tipo de serviço e Time; digitação animada (70 ms/caractere, campo focado com borda accent + halo accent-soft + cursor piscando), ponteiro desliza até "Criar" e o botão pulsa em accent. Direita, "em background": 5 passos (Repositório criado → Pipeline configurada → Role OIDC criada → Infra Dev provisionada → Registrado no catálogo), cada um com spinner accent por 650 ms e depois ✓ em verde ok-soft; ao final, a faixa verde "Serviço no ar em Dev". Ciclo de ~12 s, em loop enquanto a seção está visível (IntersectionObserver, limiar 40%); com `prefers-reduced-motion` mostra direto o estado final, sem animação.

## Seções adicionais (ordem final)
01 Desafio · 02 Solução · 03 Portal · 04 Padrão 360° · 05 Arquitetura · 06 Contas por ambiente · 07 Caminho feliz · 08 Pipeline · 09 Radar · 10 Hoje x Futuro · 11 Como usar. Fundo alternado branco/bg2.
- **Padrão 360°**: grade 5×2 de camadas (número mono accent, título, 1 linha), mais 4 cards de princípios (Autonomia, Qualidade, Integração, IA com guardrails). Mobile: 2 colunas / 1 coluna.
- **Contas por ambiente**: 4 cartões (Dev em accent-soft, HML, PRD, Shared tracejado = opcional) e uma faixa "AWS SSO · papéis por repositório · sem usuário IAM".
- **Caminho feliz**: 4 passos com filete accent de 2 px no topo e numeração mono 01–04.
- **Radar**: círculo de 380 px (300 px no mobile) com 3 anéis (adotar/avaliar/segurar); blips verde = adotar, accent = avaliar, contorno warn = segurar. Na entrada, blips surgem um a um (scale com overshoot, 110 ms de atraso entre eles) e uma varredura cônica gira em 6 s. Ao lado, as 3 listas; "na versão empresa" em legenda ink3.
- **Hoje x Futuro**: tabela Camada | Hoje (starter) | Futuro (padrão). 13 camadas; as marcadas com * (todas exceto Cloud e Trabalho, que seguem iguais) mudam no alvo e têm linha accent-soft, * accent e coluna Futuro em ink/500. Entrada: linhas deslizam da esquerda com stagger de 60 ms.

## Movimento
- **Hero**: grid de 48 px em linhas claras (#E6E8EC), com máscara radial, deslizando em 12 s; mancha de gradiente índigo/ciano a 10–16% flutuando em 9 s. Sempre claro.
- **Reveal on scroll**: títulos, subtítulos e blocos entram com opacity 0→1 e translateY 16→0 em 600 ms (IntersectionObserver, limiar 15%, uma vez só). A classe de estado é `.vis`; `.in` está reservada para os inputs do portal.
- **Contadores**: as estatísticas do desafio contam de 0 até o valor ao entrar na tela.
- **Pipeline**: duas trilhas acima do comparativo. Antes: um token warn anda até "HML · fila", treme e para (4 s em loop); o resto fica a 40%. Depois: o token verde percorre PR → CI + plan → Preview → Merge → Dev sem parar (3 s em loop).
- **prefers-reduced-motion**: desliga todas as animações e transições; tudo aparece no estado final (formulário preenchido, passos ✓, blips visíveis, tokens parados no destino, linhas da tabela visíveis).
