const CAMP_STAGES = [
  'Acampamento improvisado',
  'Acampamento organizado',
  'Posto fortificado',
  'Vila sobrevivente',
]

const BUILD_OPTIONS = [
  {
    key: 'storage',
    name: 'Depósito improvisado',
    description: 'Aumenta a capacidade e acelera a coleta.',
    cost: { wood: 8, scrap: 6 },
    requiredProfession: 'Engenheiro',
    defense: 0,
    morale: 2,
  },
  {
    key: 'clinic',
    name: 'Tenda médica',
    description: 'Reduz perdas e melhora a moral.',
    cost: { wood: 6, scrap: 4, meds: 4 },
    requiredProfession: 'Médico',
    defense: 0,
    morale: 6,
  },
  {
    key: 'watchtower',
    name: 'Torre de vigia',
    description: 'Melhora a defesa contra saqueadores.',
    cost: { wood: 10, scrap: 8 },
    requiredProfession: 'Policial',
    defense: 8,
    morale: 1,
  },
  {
    key: 'workshop',
    name: 'Oficina de campo',
    description: 'Libera reparos e acelera construções futuras.',
    cost: { wood: 8, scrap: 10 },
    requiredProfession: 'Engenheiro',
    defense: 2,
    morale: 3,
  },
]

const NAMES = ['Lia', 'Caio', 'Maya', 'Davi', 'Nina', 'Otto', 'Yara', 'Cleo', 'Ivo', 'Sora']
const PROFESSIONS = ['Engenheiro', 'Bombeiro', 'Policial', 'Médico', 'Catador', 'Agricultor']

const ROLE_COLORS = {
  Engenheiro: '#f0c15d',
  Bombeiro: '#ff7d66',
  Policial: '#66a3ff',
  Médico: '#72d9be',
  Catador: '#c6c96b',
  Agricultor: '#8fda70',
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

function distance(a, b) {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.hypot(dx, dy)
}

function randomItem(list) {
  return list[Math.floor(Math.random() * list.length)]
}

function makeSurvivor(index, profession = randomItem(PROFESSIONS)) {
  return {
    id: `survivor-${index}-${profession}`,
    name: randomItem(NAMES),
    profession,
    level: 1,
    mood: Math.floor(randomBetween(55, 86)),
    following: ['Policial', 'Bombeiro'].includes(profession),
  }
}

function makeNode(index, type, x, y) {
  const config = {
    wood: { color: '#7b5e3e', label: 'Madeira', resource: 'wood', amount: 4 },
    food: { color: '#69b95e', label: 'Comida', resource: 'food', amount: 3 },
    scrap: { color: '#93a1a8', label: 'Sucata', resource: 'scrap', amount: 4 },
    meds: { color: '#72d9be', label: 'Remédios', resource: 'meds', amount: 2 },
  }[type]

  return {
    id: `node-${index}`,
    x,
    y,
    radius: 18,
    type,
    ...config,
  }
}

function makeRecruit(index, x, y) {
  const profession = randomItem(PROFESSIONS)
  return {
    id: `recruit-${index}`,
    x,
    y,
    radius: 15,
    profession,
    name: randomItem(NAMES),
    mood: Math.floor(randomBetween(45, 90)),
  }
}

function makeRaider(index, x, y) {
  return {
    id: `raider-${index}`,
    x,
    y,
    radius: 14,
    hp: 3,
    speed: randomBetween(28, 42),
    wanderAngle: randomBetween(0, Math.PI * 2),
  }
}

export function createCampGame(elements) {
  const game = new SurvivalCampGame(elements)
  game.start()
  return game
}

class SurvivalCampGame {
  constructor(elements) {
    this.canvas = elements.canvas
    this.ctx = this.canvas.getContext('2d')
    this.ui = elements

    this.world = { width: 1800, height: 1400 }
    this.camp = { x: 900, y: 700, radius: 140 }
    this.keys = new Set()
    this.lastTime = 0
    this.attackCooldown = 0
    this.interactCooldown = 0
    this.campTick = 0
    this.dayTimer = 0
    this.raidTimer = 28
    this.buildProgress = 0
    this.currentOrder = null
    this.structures = []
    this.children = 0

    this.resources = {
      food: 18,
      wood: 14,
      scrap: 9,
      meds: 3,
    }

    this.player = {
      x: 900,
      y: 860,
      radius: 16,
      speed: 180,
      hp: 10,
      maxHp: 10,
    }

    this.survivors = [
      makeSurvivor(1, 'Engenheiro'),
      makeSurvivor(2, 'Policial'),
      makeSurvivor(3, 'Catador'),
      makeSurvivor(4, 'Agricultor'),
    ]

    this.nodes = [
      makeNode(1, 'wood', 610, 930),
      makeNode(2, 'food', 1120, 980),
      makeNode(3, 'scrap', 1260, 540),
      makeNode(4, 'meds', 560, 510),
      makeNode(5, 'wood', 1350, 830),
      makeNode(6, 'scrap', 780, 310),
    ]

    this.recruits = [
      makeRecruit(1, 430, 780),
      makeRecruit(2, 1430, 700),
      makeRecruit(3, 1010, 250),
    ]

    this.raiders = [makeRaider(1, 280, 250), makeRaider(2, 1520, 1110)]
    this.logs = []

    this.setupInputs()
    this.setupButtons()
    this.pushLog('Seu grupo montou uma fogueira e duas barracas. O resto depende de você.')
    this.renderUI()
  }

  setupInputs() {
    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase()
      this.keys.add(key)

      if (key === 'e') {
        this.tryInteract()
      }

      if (event.code === 'Space') {
        event.preventDefault()
        this.tryAttack()
      }

      if (['1', '2', '3'].includes(key)) {
        const priorityMap = { '1': 'food', '2': 'defense', '3': 'build' }
        this.pushLog(`Prioridade alterada para ${priorityMap[key]}.`)
      }
    })

    window.addEventListener('keyup', (event) => {
      this.keys.delete(event.key.toLowerCase())
    })
  }

  setupButtons() {
    this.ui.buildActions.innerHTML = ''

    BUILD_OPTIONS.forEach((option) => {
      const button = document.createElement('button')
      button.className = 'build-button'
      button.innerHTML = `
        <strong>${option.name}</strong>
        <small>${option.description}</small>
        <small>${this.formatCost(option.cost)}</small>
      `
      button.addEventListener('click', () => {
        this.currentOrder = option.key
        this.buildProgress = 0
        this.highlightOrder()
        this.pushLog(`Ordem emitida: ${option.name}. Os especialistas vão começar quando houver recursos.`)
        this.renderUI()
      })
      button.dataset.key = option.key
      this.ui.buildActions.appendChild(button)
    })
  }

  highlightOrder() {
    for (const button of this.ui.buildActions.querySelectorAll('.build-button')) {
      button.classList.toggle('active', button.dataset.key === this.currentOrder)
    }
  }

  start() {
    requestAnimationFrame((time) => this.loop(time))
  }

  loop(time) {
    const delta = Math.min((time - this.lastTime) / 1000 || 0, 0.033)
    this.lastTime = time

    this.update(delta)
    this.draw()
    requestAnimationFrame((next) => this.loop(next))
  }

  update(delta) {
    this.attackCooldown = Math.max(0, this.attackCooldown - delta)
    this.interactCooldown = Math.max(0, this.interactCooldown - delta)
    this.raidTimer -= delta
    this.dayTimer += delta
    this.campTick += delta

    this.movePlayer(delta)
    this.updateRaiders(delta)

    if (this.campTick >= 4) {
      this.campTick = 0
      this.simulateCamp()
    }

    if (this.dayTimer >= 22) {
      this.dayTimer = 0
      this.advanceDay()
    }

    if (this.raidTimer <= 0) {
      this.spawnRaid()
      this.raidTimer = randomBetween(24, 38)
    }

    this.renderUI()
  }

  movePlayer(delta) {
    let dx = 0
    let dy = 0

    if (this.keys.has('w')) dy -= 1
    if (this.keys.has('s')) dy += 1
    if (this.keys.has('a')) dx -= 1
    if (this.keys.has('d')) dx += 1

    if (dx !== 0 || dy !== 0) {
      const length = Math.hypot(dx, dy)
      dx /= length
      dy /= length

      this.player.x = clamp(this.player.x + dx * this.player.speed * delta, 50, this.world.width - 50)
      this.player.y = clamp(this.player.y + dy * this.player.speed * delta, 50, this.world.height - 50)
    }
  }

  updateRaiders(delta) {
    for (const raider of this.raiders) {
      const target = distance(raider, this.player) < 180 ? this.player : this.camp
      const angle = Math.atan2(target.y - raider.y, target.x - raider.x)

      if (distance(raider, target) > 38) {
        raider.x += Math.cos(angle) * raider.speed * delta
        raider.y += Math.sin(angle) * raider.speed * delta
      }

      if (distance(raider, this.player) < 28 && this.attackCooldown <= 0.15) {
        this.player.hp = clamp(this.player.hp - delta * 0.8, 0, this.player.maxHp)
      }

      if (distance(raider, this.camp) < this.camp.radius - 18) {
        this.resources.food = Math.max(0, this.resources.food - delta * 0.2)
        this.resources.scrap = Math.max(0, this.resources.scrap - delta * 0.12)
      }
    }
  }

  tryInteract() {
    if (this.interactCooldown > 0) return
    this.interactCooldown = 0.25

    const nearbyNode = this.nodes.find((node) => distance(node, this.player) <= 34)
    if (nearbyNode) {
      this.resources[nearbyNode.resource] += nearbyNode.amount
      this.pushLog(`Você coletou ${nearbyNode.amount} de ${nearbyNode.label.toLowerCase()}.`)
      this.nodes = this.nodes.filter((node) => node.id !== nearbyNode.id)
      this.spawnReplacementNode()
      return
    }

    const nearbyRecruit = this.recruits.find((recruit) => distance(recruit, this.player) <= 34)
    if (nearbyRecruit) {
      const survivor = {
        id: nearbyRecruit.id,
        name: nearbyRecruit.name,
        profession: nearbyRecruit.profession,
        level: 1,
        mood: nearbyRecruit.mood,
        following: ['Policial', 'Bombeiro', 'Médico'].includes(nearbyRecruit.profession),
      }
      this.survivors.push(survivor)
      this.recruits = this.recruits.filter((recruit) => recruit.id !== nearbyRecruit.id)
      this.spawnReplacementRecruit()
      this.pushLog(`${survivor.name} se juntou ao acampamento como ${survivor.profession.toLowerCase()}.`)
      return
    }

    if (distance(this.player, this.camp) <= this.camp.radius) {
      this.pushLog('Você reuniu o grupo em volta da fogueira e revisou as prioridades do acampamento.')
    }
  }

  tryAttack() {
    if (this.attackCooldown > 0) return
    this.attackCooldown = 0.6

    const target = this.raiders.find((raider) => distance(raider, this.player) <= 48)
    if (!target) return

    target.hp -= 1
    const followerBonus = this.survivors.filter((survivor) => survivor.following).length >= 2 ? 1 : 0
    target.hp -= followerBonus

    if (target.hp <= 0) {
      this.raiders = this.raiders.filter((raider) => raider.id !== target.id)
      this.resources.scrap += 3
      this.resources.food += 1
      this.pushLog('Um saqueador caiu. O grupo recuperou sucata e comida.')
    }
  }

  simulateCamp() {
    const gatherers = this.countProfession('Catador')
    const farmers = this.countProfession('Agricultor')
    const engineers = this.countProfession('Engenheiro')
    const medics = this.countProfession('Médico')
    const police = this.countProfession('Policial')

    this.resources.food += 1 + farmers
    this.resources.wood += 1 + Math.ceil(gatherers / 2)
    this.resources.scrap += gatherers
    this.resources.meds += medics > 0 ? 0.5 : 0

    if (this.currentOrder) {
      const option = BUILD_OPTIONS.find((item) => item.key === this.currentOrder)
      const hasSpecialist = this.countProfession(option.requiredProfession) > 0
      const hasCost = Object.entries(option.cost).every(([key, value]) => this.resources[key] >= value)

      if (hasSpecialist && hasCost) {
        Object.entries(option.cost).forEach(([key, value]) => {
          this.resources[key] -= value * 0.1
        })
        this.buildProgress += 18 + engineers * 8 + police * 2

        if (this.buildProgress >= 100) {
          this.finishConstruction(option)
        }
      }
    }

    const foodConsumption = this.survivors.length * 0.6 + this.children * 0.3
    this.resources.food = Math.max(0, this.resources.food - foodConsumption)
  }

  finishConstruction(option) {
    this.structures.push(option.key)
    this.currentOrder = null
    this.buildProgress = 0
    this.resources.food = clamp(this.resources.food + option.morale * 0.4, 0, 999)
    this.pushLog(`${option.name} concluído. O acampamento ficou mais estável.`)
    this.highlightOrder()
  }

  advanceDay() {
    if (this.resources.food > this.population * 2 && this.children < 4) {
      this.children += 1
      this.pushLog('Uma nova criança nasceu no acampamento. O futuro da comunidade ganhou força.')
    }

    if (this.player.hp < this.player.maxHp) {
      const healAmount = this.countProfession('Médico') > 0 ? 2 : 1
      this.player.hp = clamp(this.player.hp + healAmount, 0, this.player.maxHp)
    }

    if (this.resources.food <= 3) {
      this.pushLog('A comida está acabando. Explore mais ou foque em agricultores.')
    }
  }

  spawnRaid() {
    const side = Math.floor(Math.random() * 4)
    let x = 80
    let y = 80

    if (side === 0) {
      x = randomBetween(80, this.world.width - 80)
      y = 80
    } else if (side === 1) {
      x = this.world.width - 80
      y = randomBetween(80, this.world.height - 80)
    } else if (side === 2) {
      x = randomBetween(80, this.world.width - 80)
      y = this.world.height - 80
    } else {
      x = 80
      y = randomBetween(80, this.world.height - 80)
    }

    const id = this.raiders.length + Date.now()
    this.raiders.push(makeRaider(id, x, y))
    this.pushLog('Batedores avistaram saqueadores se aproximando do acampamento.')
  }

  spawnReplacementNode() {
    const types = ['wood', 'food', 'scrap', 'meds']
    const type = randomItem(types)
    const id = this.nodes.length + Date.now()
    this.nodes.push(
      makeNode(
        id,
        type,
        randomBetween(120, this.world.width - 120),
        randomBetween(120, this.world.height - 120),
      ),
    )
  }

  spawnReplacementRecruit() {
    const id = this.recruits.length + Date.now()
    this.recruits.push(
      makeRecruit(
        id,
        randomBetween(120, this.world.width - 120),
        randomBetween(120, this.world.height - 120),
      ),
    )
  }

  countProfession(profession) {
    return this.survivors.filter((survivor) => survivor.profession === profession).length
  }

  get defense() {
    return 4 + this.countProfession('Policial') * 3 + (this.structures.includes('watchtower') ? 8 : 0)
  }

  get morale() {
    return clamp(
      48 +
        this.structures.length * 6 +
        this.countProfession('Médico') * 3 +
        this.countProfession('Bombeiro') * 2 +
        (this.resources.food > 10 ? 6 : -4),
      0,
      100,
    )
  }

  get population() {
    return this.survivors.length + this.children + 1
  }

  get campStage() {
    const stageIndex = Math.min(CAMP_STAGES.length - 1, Math.floor(this.structures.length / 1.5))
    return CAMP_STAGES[stageIndex]
  }

  formatCost(cost) {
    return Object.entries(cost)
      .map(([key, value]) => `${value} ${key}`)
      .join(' · ')
  }

  pushLog(message) {
    this.logs.unshift({ id: Date.now() + Math.random(), message })
    this.logs = this.logs.slice(0, 8)
  }

  renderUI() {
    this.ui.stageLabel.textContent = this.campStage
    this.ui.populationLabel.textContent = `${this.population} pessoas`
    this.ui.defenseLabel.textContent = `${this.defense}`
    this.ui.moraleLabel.textContent = `${this.morale}%`

    this.ui.resourceList.innerHTML = Object.entries(this.resources)
      .map(
        ([key, value]) => `
          <div class="resource-item">
            <strong>${this.labelForResource(key)}</strong>
            <span>${Math.floor(value)}</span>
          </div>
        `,
      )
      .join('')

    this.ui.survivorList.innerHTML = this.survivors
      .map(
        (survivor) => `
          <div class="survivor-item">
            <div class="survivor-header">
              <strong>${survivor.name}</strong>
              <span class="profession-badge">${survivor.profession}</span>
            </div>
            <div class="survivor-meta">Humor ${survivor.mood}% · ${survivor.following ? 'segue você em campo' : 'atua no acampamento'}</div>
          </div>
        `,
      )
      .join('')

    this.ui.eventLog.innerHTML = this.logs
      .map(
        (entry) => `
          <div class="log-entry">
            <span>${entry.message}</span>
          </div>
        `,
      )
      .join('')

    this.highlightOrder()
  }

  labelForResource(key) {
    return {
      food: 'Comida',
      wood: 'Madeira',
      scrap: 'Sucata',
      meds: 'Remédios',
    }[key]
  }

  draw() {
    const ctx = this.ctx
    const camera = this.getCamera()

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.drawGround(ctx, camera)
    this.drawCamp(ctx, camera)

    for (const node of this.nodes) {
      this.drawCircle(ctx, node, camera, node.radius, node.color)
    }

    for (const recruit of this.recruits) {
      this.drawCircle(ctx, recruit, camera, recruit.radius, ROLE_COLORS[recruit.profession])
      this.drawMarker(ctx, recruit, camera, '+')
    }

    for (const raider of this.raiders) {
      this.drawCircle(ctx, raider, camera, raider.radius, '#d75c5c')
      this.drawMarker(ctx, raider, camera, '!')
    }

    this.drawFollowers(ctx, camera)
    this.drawPlayer(ctx, camera)
    this.drawOverlay(ctx)
  }

  getCamera() {
    return {
      x: clamp(this.player.x - this.canvas.width / 2, 0, this.world.width - this.canvas.width),
      y: clamp(this.player.y - this.canvas.height / 2, 0, this.world.height - this.canvas.height),
    }
  }

  drawGround(ctx, camera) {
    ctx.fillStyle = '#243229'
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1

    for (let x = -camera.x % 80; x < this.canvas.width; x += 80) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, this.canvas.height)
      ctx.stroke()
    }

    for (let y = -camera.y % 80; y < this.canvas.height; y += 80) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(this.canvas.width, y)
      ctx.stroke()
    }
  }

  drawCamp(ctx, camera) {
    const screenX = this.camp.x - camera.x
    const screenY = this.camp.y - camera.y

    ctx.fillStyle = 'rgba(111, 176, 123, 0.16)'
    ctx.beginPath()
    ctx.arc(screenX, screenY, this.camp.radius, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'rgba(131, 216, 141, 0.35)'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(screenX, screenY, this.camp.radius, 0, Math.PI * 2)
    ctx.stroke()

    ctx.fillStyle = '#6b4e35'
    ctx.fillRect(screenX - 24, screenY - 20, 48, 36)
    ctx.fillStyle = '#f59e58'
    ctx.beginPath()
    ctx.arc(screenX, screenY - 6, 10, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#d3c28b'
    ctx.beginPath()
    ctx.moveTo(screenX - 70, screenY + 10)
    ctx.lineTo(screenX - 40, screenY - 25)
    ctx.lineTo(screenX - 10, screenY + 10)
    ctx.closePath()
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(screenX + 10, screenY + 18)
    ctx.lineTo(screenX + 40, screenY - 22)
    ctx.lineTo(screenX + 72, screenY + 18)
    ctx.closePath()
    ctx.fill()

    this.drawStructures(ctx, camera)
  }

  drawStructures(ctx, camera) {
    const offsets = {
      storage: [-110, -72, '#7b5e3e'],
      clinic: [110, -70, '#72d9be'],
      watchtower: [0, -118, '#66a3ff'],
      workshop: [118, 58, '#f0c15d'],
    }

    for (const structure of this.structures) {
      const [offsetX, offsetY, color] = offsets[structure]
      const x = this.camp.x + offsetX - camera.x
      const y = this.camp.y + offsetY - camera.y
      ctx.fillStyle = color
      ctx.fillRect(x - 18, y - 18, 36, 36)
      ctx.strokeStyle = 'rgba(0,0,0,0.25)'
      ctx.strokeRect(x - 18, y - 18, 36, 36)
    }
  }

  drawFollowers(ctx, camera) {
    const followers = this.survivors.filter((survivor) => survivor.following).slice(0, 3)

    followers.forEach((survivor, index) => {
      const angle = index * 2.2 + 0.6
      const x = this.player.x + Math.cos(angle) * 34
      const y = this.player.y + Math.sin(angle) * 34
      this.drawCircle(ctx, { x, y }, camera, 10, ROLE_COLORS[survivor.profession])
    })
  }

  drawPlayer(ctx, camera) {
    const x = this.player.x - camera.x
    const y = this.player.y - camera.y

    ctx.fillStyle = '#f5f3d0'
    ctx.beginPath()
    ctx.arc(x, y, this.player.radius, 0, Math.PI * 2)
    ctx.fill()

    ctx.strokeStyle = 'rgba(0,0,0,0.35)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y, this.player.radius, 0, Math.PI * 2)
    ctx.stroke()
  }

  drawCircle(ctx, entity, camera, radius, color) {
    const x = entity.x - camera.x
    const y = entity.y - camera.y
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
  }

  drawMarker(ctx, entity, camera, text) {
    const x = entity.x - camera.x
    const y = entity.y - camera.y - 18
    ctx.fillStyle = '#f8fbf7'
    ctx.font = 'bold 16px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(text, x, y)
  }

  drawOverlay(ctx) {
    ctx.fillStyle = 'rgba(7, 12, 9, 0.58)'
    ctx.fillRect(14, 14, 292, 94)
    ctx.strokeStyle = 'rgba(131, 216, 141, 0.25)'
    ctx.strokeRect(14, 14, 292, 94)

    ctx.fillStyle = '#eff6ee'
    ctx.font = 'bold 18px sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText('Explore, recrute e emita ordens', 26, 40)

    ctx.fillStyle = '#a8bbad'
    ctx.font = '14px sans-serif'
    ctx.fillText('E perto de recursos / pessoas · Espaço para atacar', 26, 66)
    ctx.fillText(`Vida ${Math.ceil(this.player.hp)}/${this.player.maxHp} · Construções ${this.structures.length}`, 26, 88)

    if (this.currentOrder) {
      const option = BUILD_OPTIONS.find((item) => item.key === this.currentOrder)
      ctx.fillText(`Ordem atual: ${option.name} (${Math.floor(this.buildProgress)}%)`, 26, 108)
    }
  }
}