# Prompt Mestre - Acampamento do Último Refúgio

Use este prompt como referência principal para manter coerência de design, narrativa e implementação.

## Contexto do projeto

Você está criando um jogo 2D top-down de sobrevivência com foco em liderança de comunidade.

Premissa central:
- Existe apenas 1 personagem jogável: o líder (jogador).
- O jogador explora o mundo, coleta recursos, recruta sobreviventes e define prioridades.
- O acampamento não é uma base pronta; ele começa improvisado com barracas e evolui por fases.
- Os NPCs devem ter utilidade real e agir de forma autônoma.

## Visão de gameplay

O jogo é um híbrido de:
- RPG de exploração
- sobrevivência
- gerenciamento indireto de acampamento

A fantasia do jogador é:
- ser a pessoa que sai para campo,
- volta com recursos e novos sobreviventes,
- e transforma um acampamento frágil em uma comunidade funcional.

## Pilares de design

1. Protagonismo do jogador
- Apenas o líder é controlado diretamente.
- Exploração e combate são ações do jogador.

2. Comunidade viva
- NPCs têm profissão e papel funcional.
- O acampamento reage automaticamente a ameaças e ordens.

3. Gestão indireta
- O jogador decide o que priorizar.
- NPCs decidem como executar com base em função e contexto.

4. Progressão orgânica
- Começa com barracas e fogueira.
- Evolui para acampamento organizado e estruturas especializadas.

## Estado atual do protótipo (já implementado)

### Estrutura e tecnologia
- Projeto web com Vite, JavaScript e canvas 2D.
- Sem dependência de assets externos obrigatórios para jogar.
- Visual inicial feito com arte desenhada por código.

### Loop jogável atual
- Explorar com movimento top-down.
- Coletar recursos no mapa.
- Recrutar NPCs encontrados no mundo.
- Enfrentar saqueadores.
- Emitir ordens de construção para o acampamento.
- Receber efeitos automáticos da comunidade (produção, defesa, consumo, moral).

### Controles atuais
- WASD: mover personagem.
- E: interagir, coletar e recrutar.
- Espaço: ataque corpo a corpo simples.
- F: alternar entre escolta de campo e foco total em defesa da base.
- 1/2/3: alteração de prioridade geral (placeholder de prioridade).

### Sistemas atuais
- Mundo com recursos espalhados: comida, madeira, sucata e remédios.
- Recrutamento de sobreviventes com profissões.
- Ataques de saqueadores em ondas periódicas.
- Construções por ordem de alto nível, com custo e requisito de profissão.
- Simulação automática de produção e consumo de recursos.
- Crescimento da comunidade com nascimento de crianças em condições favoráveis.
- Defesa automática do acampamento por NPCs defensores (policial, bombeiro, engenheiro fora de escolta).
- Redução de perdas durante invasão quando há defensores e torre de vigia.

### Profissões presentes
- Engenheiro
- Bombeiro
- Policial
- Médico
- Catador
- Agricultor

### Construções presentes
- Depósito improvisado
- Tenda médica
- Torre de vigia
- Oficina de campo

### Estágios de progresso do acampamento
- Acampamento improvisado
- Acampamento organizado
- Posto fortificado
- Vila sobrevivente

## Diretrizes de IA dos NPCs

Objetivo do comportamento NPC:
- evitar sensação de NPC inútil,
- tornar cada profissão relevante,
- permitir que o jogador influencie sem microgerenciar.

Regras base:
- Se escolta estiver desligada: NPCs permanecem no acampamento e priorizam defesa/rotina.
- Se escolta estiver ligada: somente um grupo pequeno acompanha o jogador.
- Defensores no acampamento devem responder automaticamente a ataque de saqueadores.
- Profissões de suporte devem contribuir para estabilidade (cura, construção, coleta, produção).

## Diretrizes visuais 2D

Objetivo visual da fase atual:
- legibilidade alta,
- baixo custo de produção,
- fácil substituição futura por arte final.

Implementado:
- chão em tiles desenhados por código,
- props de cenário (árvores, sucata, arbustos),
- personagens e entidades em estilo sprite simplificado por formas geométricas,
- sombras simples e marcadores visuais.

Próxima evolução visual sugerida:
- animações curtas de caminhada (2 a 4 frames lógicos),
- diferenciação visual mais clara por profissão,
- variação de aparência do acampamento por estágio,
- mini tileset procedural para estrada/lama/grama.

## Requisitos para próximas features

Quando adicionar sistemas novos, manter:
- arquitetura simples e arquivos pequenos,
- prototipagem rápida antes de polimento pesado,
- zero dependências desnecessárias,
- gameplay antes de arte final,
- placeholders fáceis de trocar por assets próprios depois.

## Próximas prioridades recomendadas

1. IA de trabalho fora de combate
- NPCs coletando recursos próximos automaticamente.
- Engenheiros reparando e acelerando construção.

2. Profundidade de sobrevivência
- inventário e equipamentos,
- fome/doença/clima,
- eventos de crise no acampamento.

3. Estrutura de progressão
- papéis de criança para adulto,
- treinamento para classe/função,
- melhorias permanentes de acampamento.

4. Combate e ameaça
- variação de inimigos,
- sistema de alerta e defesa por postos,
- diferença real entre defender e sair para expedição.

## Prompt curto explicativo

Acampamento do Último Refúgio é um jogo 2D top-down de sobrevivência e gestão indireta de comunidade. O jogador controla apenas o líder, responsável por explorar o mapa, coletar recursos, recrutar sobreviventes e enfrentar saqueadores. O acampamento começa improvisado com barracas e evolui por estágios conforme ordens de construção e disponibilidade de profissionais. Os NPCs possuem profissões e atuam de forma autônoma, com foco em utilidade prática na rotina, produção e defesa da base. O protótipo atual utiliza JavaScript com Vite e renderização em canvas 2D, com visual procedural desenhado por código para prototipagem rápida, boa legibilidade e fácil substituição futura por assets próprios.
