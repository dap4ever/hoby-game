# Acampamento do Último Refúgio

Protótipo inicial de um RPG de sobrevivência com acampamento autônomo.

## Ideia do jogo

- Você controla apenas um personagem.
- O mundo tem recursos, sobreviventes e saqueadores.
- Os sobreviventes recrutados trabalham sozinhos no acampamento conforme profissão.
- Em vez de construir tudo manualmente, você emite ordens de alto nível e o grupo executa.

## O que já existe neste protótipo

- mapa top-down em `canvas`
- exploração com `WASD`
- coleta com `E`
- recrutamento de NPCs com profissões
- combate simples com `Espaço`
- acampamento que evolui por construções
- simulação automática de recursos, moral, defesa e crescimento da comunidade

## Como rodar

```bash
npm install
npm run dev
```

## Estratégia para gráficos

Para não travar o projeto por falta de arte, este protótipo usa gráficos temporários desenhados por código:

- círculos e blocos com cores por profissão
- barracas e fogueira desenhadas no `canvas`
- construções representadas por formas simples

### Caminho recomendado

1. **Protótipo jogável**
   - manter tudo em formas simples
   - validar mecânicas de exploração, recrutamento e automação

2. **Pacote visual básico**
   - criar ícones próprios para recursos e profissões
   - trocar construções por silhuetas simples

3. **Arte final**
   - sprites por profissão
   - variações visuais para cada fase do acampamento
   - tileset do mundo e objetos interativos

## Próximos passos bons

- adicionar inventário e loot equipado
- colocar clima, fome e doenças
- dar rotinas mais avançadas aos NPCs
- criar mapa com regiões e postos abandonados
- separar companheiros de campo e trabalhadores fixos