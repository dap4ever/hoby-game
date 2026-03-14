import './style.css'
import { createCampGame } from './survival-game.js'

document.querySelector('#app').innerHTML = `
  <div class="shell">
    <aside class="sidebar left-panel">
      <div class="panel hero-panel">
        <p class="eyebrow">Protótipo</p>
        <h1>Acampamento do Último Refúgio</h1>
        <p class="panel-copy">
          Você é o único personagem jogável. Explore, recrute sobreviventes e dê ordens para o acampamento crescer sozinho.
        </p>
      </div>

      <div class="panel">
        <h2>Controles</h2>
        <ul class="compact-list">
          <li><strong>WASD</strong> para mover</li>
          <li><strong>E</strong> para coletar e recrutar</li>
          <li><strong>Espaço</strong> para atacar</li>
          <li><strong>1 / 2 / 3</strong> para trocar prioridade</li>
        </ul>
      </div>

      <div class="panel">
        <h2>Ordens do acampamento</h2>
        <div id="build-actions" class="actions"></div>
      </div>
    </aside>

    <main class="game-column">
      <section class="stats-grid">
        <article class="stat-card"><span>Fase</span><strong id="camp-stage">-</strong></article>
        <article class="stat-card"><span>População</span><strong id="camp-population">-</strong></article>
        <article class="stat-card"><span>Defesa</span><strong id="camp-defense">-</strong></article>
        <article class="stat-card"><span>Moral</span><strong id="camp-morale">-</strong></article>
      </section>

      <section class="canvas-panel panel">
        <canvas id="game-canvas" width="960" height="600" aria-label="Protótipo do jogo"></canvas>
      </section>

      <section class="hud-row">
        <article class="panel resource-panel">
          <h2>Recursos</h2>
          <div id="resource-list" class="resource-list"></div>
        </article>

        <article class="panel log-panel">
          <h2>Ocorrências</h2>
          <div id="event-log" class="event-log"></div>
        </article>
      </section>
    </main>

    <aside class="sidebar right-panel">
      <div class="panel">
        <h2>Moradores</h2>
        <div id="survivor-list" class="survivor-list"></div>
      </div>

      <div class="panel">
        <h2>Como vamos fazer os gráficos</h2>
        <ul class="compact-list small">
          <li>Agora: formas geométricas e cores por profissão</li>
          <li>Depois: ícones simples para construções</li>
          <li>Mais tarde: sprites próprios por fase do acampamento</li>
        </ul>
      </div>
    </aside>
  </div>
`

createCampGame({
  canvas: document.querySelector('#game-canvas'),
  stageLabel: document.querySelector('#camp-stage'),
  populationLabel: document.querySelector('#camp-population'),
  defenseLabel: document.querySelector('#camp-defense'),
  moraleLabel: document.querySelector('#camp-morale'),
  resourceList: document.querySelector('#resource-list'),
  survivorList: document.querySelector('#survivor-list'),
  buildActions: document.querySelector('#build-actions'),
  eventLog: document.querySelector('#event-log'),
})
