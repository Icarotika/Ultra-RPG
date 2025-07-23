// Game Configuration - Easy to modify and expand
const GAME_CONFIG = {
  // Enemy types - Easy to add new enemies
  enemies: {
    goblin: {
      name: "Goblin",
      sprite: "👹",
      hp: 40,
      attack: 15,
      defense: 5,
      exp: 25,
      gold: 10,
    },
    orc: {
      name: "Orc",
      sprite: "🧌",
      hp: 60,
      attack: 20,
      defense: 8,
      exp: 40,
      gold: 20,
    },
    skeleton: {
      name: "Esqueleto",
      sprite: "💀",
      hp: 50,
      attack: 18,
      defense: 6,
      exp: 30,
      gold: 15,
    },
    dragon: {
      name: "Dragão Ancião",
      sprite: "🐉",
      hp: 200,
      attack: 40,
      defense: 20,
      exp: 200,
      gold: 100,
      isBoss: true,
    },
  },

  // Items - Easy to add new items
  items: {
    sword: {
      name: "Espada de Ferro",
      type: "weapon",
      attack: 10,
      price: 50,
      sprite: "⚔️",
    },
    shield: {
      name: "Escudo de Madeira",
      type: "armor",
      defense: 8,
      price: 40,
      sprite: "🛡️",
    },
    potion: {
      name: "Poção de Vida",
      type: "consumable",
      heal: 50,
      price: 20,
      sprite: "🧪",
    },
    magicSword: {
      name: "Espada Mágica",
      type: "weapon",
      attack: 20,
      price: 150,
      sprite: "🗡️",
    },
    plateArmor: {
      name: "Armadura de Placas",
      type: "armor",
      defense: 15,
      price: 120,
      sprite: "🛡️",
    },
  },
}

// Player class
class Player {
  constructor() {
    this.level = 1
    this.hp = 100
    this.maxHp = 100
    this.mp = 50
    this.maxMp = 50
    this.attack = 20
    this.defense = 10
    this.exp = 0
    this.expToNext = 100
    this.gold = 50
    this.inventory = []
    this.equippedWeapon = null
    this.equippedArmor = null
  }

  levelUp() {
    this.level++
    this.maxHp += 20
    this.maxMp += 10
    this.attack += 5
    this.defense += 3
    this.hp = this.maxHp // Full heal on level up
    this.mp = this.maxMp
    this.exp = 0
    this.expToNext = Math.floor(this.expToNext * 1.5)

    showLevelUpModal()
    updatePlayerDisplay()
    addLog(`🎉 Level Up! Você agora é nível ${this.level}!`)
  }

  gainExp(amount) {
    this.exp += amount
    if (this.exp >= this.expToNext) {
      this.levelUp()
    }
    updatePlayerDisplay()
  }

  takeDamage(damage) {
    const totalDefense = this.defense + (this.equippedArmor ? this.equippedArmor.defense : 0)
    const actualDamage = Math.max(1, damage - totalDefense)
    this.hp = Math.max(0, this.hp - actualDamage)
    updatePlayerDisplay()
    return actualDamage
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount)
    updatePlayerDisplay()
  }

  getTotalAttack() {
    return this.attack + (this.equippedWeapon ? this.equippedWeapon.attack : 0)
  }

  equipItem(item) {
    if (item.type === "weapon") {
      this.equippedWeapon = item
    } else if (item.type === "armor") {
      this.equippedArmor = item
    }
    updatePlayerDisplay()
    updateInventoryDisplay()
  }

  useItem(item, index) {
    if (item.type === "consumable") {
      if (item.heal) {
        this.heal(item.heal)
        addLog(`💚 Você usou ${item.name} e recuperou ${item.heal} HP!`)
      }
      this.inventory.splice(index, 1)
      updateInventoryDisplay()
    } else {
      this.equipItem(item)
      addLog(`⚡ Você equipou ${item.name}!`)
    }
  }
}

// Enemy class
class Enemy {
  constructor(type) {
    const config = GAME_CONFIG.enemies[type]
    this.name = config.name
    this.sprite = config.sprite
    this.hp = config.hp
    this.maxHp = config.hp
    this.attack = config.attack
    this.defense = config.defense
    this.exp = config.exp
    this.gold = config.gold
    this.isBoss = config.isBoss || false
  }

  takeDamage(damage) {
    const actualDamage = Math.max(1, damage - this.defense)
    this.hp = Math.max(0, this.hp - actualDamage)
    updateEnemyDisplay()
    return actualDamage
  }

  attack() {
    return Math.floor(Math.random() * this.attack) + Math.floor(this.attack * 0.5)
  }
}

// Game state
let player = new Player()
let currentEnemy = null
let inBattle = false
let bossDefeated = false

// DOM elements
const elements = {
  playerLevel: document.getElementById("player-level"),
  playerHp: document.getElementById("player-hp"),
  playerMaxHp: document.getElementById("player-max-hp"),
  playerMp: document.getElementById("player-mp"),
  playerMaxMp: document.getElementById("player-max-mp"),
  playerExp: document.getElementById("player-exp"),
  playerExpNext: document.getElementById("player-exp-next"),
  playerAttack: document.getElementById("player-attack"),
  playerDefense: document.getElementById("player-defense"),
  hpBar: document.getElementById("hp-bar"),
  mpBar: document.getElementById("mp-bar"),
  expBar: document.getElementById("exp-bar"),

  enemyPanel: document.getElementById("enemy-panel"),
  enemyName: document.getElementById("enemy-name"),
  enemySprite: document.getElementById("enemy-sprite"),
  enemyHp: document.getElementById("enemy-hp"),
  enemyMaxHp: document.getElementById("enemy-max-hp"),
  enemyHpBar: document.getElementById("enemy-hp-bar"),

  battleActions: document.getElementById("battle-actions"),
  exploration: document.getElementById("exploration"),
  exploreBtn: document.getElementById("explore-btn"),
  bossBtn: document.getElementById("boss-btn"),

  attackBtn: document.getElementById("attack-btn"),
  magicBtn: document.getElementById("magic-btn"),
  healBtn: document.getElementById("heal-btn"),
  runBtn: document.getElementById("run-btn"),

  inventoryGrid: document.getElementById("inventory-grid"),
  shopBtn: document.getElementById("shop-btn"),
  shopModal: document.getElementById("shop-modal"),
  shopItems: document.getElementById("shop-items"),
  closeShop: document.getElementById("close-shop"),

  levelupModal: document.getElementById("levelup-modal"),
  levelupText: document.getElementById("levelup-text"),
  closeLevelup: document.getElementById("close-levelup"),

  logContent: document.getElementById("log-content"),
}

// Initialize game
function initGame() {
  updatePlayerDisplay()
  updateInventoryDisplay()
  setupEventListeners()
  setupShop()
  addLog("🌟 Bem-vindo ao RPG Adventure! Clique em 'Explorar' para começar sua jornada.")
}

// Event listeners
function setupEventListeners() {
  elements.exploreBtn.addEventListener("click", explore)
  elements.bossBtn.addEventListener("click", fightBoss)
  elements.attackBtn.addEventListener("click", playerAttack)
  elements.magicBtn.addEventListener("click", playerMagic)
  elements.healBtn.addEventListener("click", playerHeal)
  elements.runBtn.addEventListener("click", runFromBattle)
  elements.shopBtn.addEventListener("click", openShop)
  elements.closeShop.addEventListener("click", closeShop)
  elements.closeLevelup.addEventListener("click", closeLevelUpModal)
}

// Update displays
function updatePlayerDisplay() {
  elements.playerLevel.textContent = player.level
  elements.playerHp.textContent = player.hp
  elements.playerMaxHp.textContent = player.maxHp
  elements.playerMp.textContent = player.mp
  elements.playerMaxMp.textContent = player.maxMp
  elements.playerExp.textContent = player.exp
  elements.playerExpNext.textContent = player.expToNext

  const totalAttack = player.getTotalAttack()
  const totalDefense = player.defense + (player.equippedArmor ? player.equippedArmor.defense : 0)
  elements.playerAttack.textContent = totalAttack
  elements.playerDefense.textContent = totalDefense

  // Update bars
  elements.hpBar.style.width = `${(player.hp / player.maxHp) * 100}%`
  elements.mpBar.style.width = `${(player.mp / player.maxMp) * 100}%`
  elements.expBar.style.width = `${(player.exp / player.expToNext) * 100}%`

  // Update button states
  elements.magicBtn.disabled = player.mp < 10
  elements.healBtn.disabled = player.mp < 15
}

function updateEnemyDisplay() {
  if (!currentEnemy) return

  elements.enemyName.textContent = currentEnemy.name
  elements.enemySprite.textContent = currentEnemy.sprite
  elements.enemyHp.textContent = currentEnemy.hp
  elements.enemyMaxHp.textContent = currentEnemy.maxHp
  elements.enemyHpBar.style.width = `${(currentEnemy.hp / currentEnemy.maxHp) * 100}%`
}

function updateInventoryDisplay() {
  elements.inventoryGrid.innerHTML = ""

  player.inventory.forEach((item, index) => {
    const itemDiv = document.createElement("div")
    itemDiv.className = "inventory-item"

    const isEquipped = item === player.equippedWeapon || item === player.equippedArmor
    if (isEquipped) {
      itemDiv.classList.add("equipped")
    }

    itemDiv.innerHTML = `
            <div style="font-size: 24px;">${item.sprite}</div>
            <div style="font-size: 12px;">${item.name}</div>
            ${isEquipped ? '<div style="font-size: 10px; color: #00ff00;">Equipado</div>' : ""}
        `

    itemDiv.addEventListener("click", () => player.useItem(item, index))
    elements.inventoryGrid.appendChild(itemDiv)
  })
}

// Exploration and combat
function explore() {
  const enemyTypes = Object.keys(GAME_CONFIG.enemies).filter((type) => !GAME_CONFIG.enemies[type].isBoss)
  const randomEnemy = enemyTypes[Math.floor(Math.random() * enemyTypes.length)]

  if (Math.random() < 0.7) {
    // 70% chance to find enemy
    startBattle(randomEnemy)
  } else {
    // Find item or gold
    if (Math.random() < 0.6) {
      const goldFound = Math.floor(Math.random() * 20) + 5
      player.gold += goldFound
      addLog(`💰 Você encontrou ${goldFound} moedas de ouro!`)
    } else {
      const itemTypes = Object.keys(GAME_CONFIG.items)
      const randomItem = itemTypes[Math.floor(Math.random() * itemTypes.length)]
      const item = { ...GAME_CONFIG.items[randomItem] }
      player.inventory.push(item)
      addLog(`🎁 Você encontrou um(a) ${item.name}!`)
      updateInventoryDisplay()
    }
  }

  // Show boss button after level 3
  if (player.level >= 3 && !bossDefeated) {
    elements.bossBtn.style.display = "block"
  }
}

function fightBoss() {
  startBattle("dragon")
}

function startBattle(enemyType) {
  currentEnemy = new Enemy(enemyType)
  inBattle = true

  elements.exploration.style.display = "none"
  elements.enemyPanel.style.display = "block"
  elements.battleActions.style.display = "grid"

  updateEnemyDisplay()
  addLog(`⚔️ Um ${currentEnemy.name} apareceu! A batalha começou!`)
}

function endBattle(victory) {
  inBattle = false

  elements.exploration.style.display = "block"
  elements.enemyPanel.style.display = "none"
  elements.battleActions.style.display = "none"

  if (victory) {
    player.gainExp(currentEnemy.exp)
    player.gold += currentEnemy.gold
    addLog(`🎉 Você derrotou o ${currentEnemy.name}! Ganhou ${currentEnemy.exp} EXP e ${currentEnemy.gold} moedas!`)

    if (currentEnemy.isBoss) {
      bossDefeated = true
      elements.bossBtn.style.display = "none"
      addLog(`👑 Parabéns! Você derrotou o chefão e completou o jogo!`)
    }
  }

  currentEnemy = null
}

// Battle actions
function playerAttack() {
  if (!inBattle || !currentEnemy) return

  const damage = Math.floor(Math.random() * player.getTotalAttack()) + Math.floor(player.getTotalAttack() * 0.5)
  const actualDamage = currentEnemy.takeDamage(damage)
  addLog(`⚔️ Você atacou o ${currentEnemy.name} causando ${actualDamage} de dano!`)

  if (currentEnemy.hp <= 0) {
    endBattle(true)
    return
  }

  enemyTurn()
}

function playerMagic() {
  if (!inBattle || !currentEnemy || player.mp < 10) return

  player.mp -= 10
  const damage = Math.floor(Math.random() * (player.getTotalAttack() * 1.5)) + Math.floor(player.getTotalAttack() * 0.8)
  const actualDamage = currentEnemy.takeDamage(damage)
  addLog(`✨ Você lançou uma magia no ${currentEnemy.name} causando ${actualDamage} de dano!`)

  updatePlayerDisplay()

  if (currentEnemy.hp <= 0) {
    endBattle(true)
    return
  }

  enemyTurn()
}

function playerHeal() {
  if (!inBattle || player.mp < 15) return

  player.mp -= 15
  const healAmount = Math.floor(Math.random() * 30) + 20
  player.heal(healAmount)
  addLog(`💚 Você se curou em ${healAmount} HP!`)

  updatePlayerDisplay()
  enemyTurn()
}

function runFromBattle() {
  if (!inBattle) return

  if (currentEnemy.isBoss) {
    addLog(`🏃 Você não pode fugir do chefão!`)
    enemyTurn()
    return
  }

  if (Math.random() < 0.7) {
    addLog(`🏃 Você fugiu da batalha!`)
    endBattle(false)
  } else {
    addLog(`🏃 Você não conseguiu fugir!`)
    enemyTurn()
  }
}

function enemyTurn() {
  if (!inBattle || !currentEnemy) return

  setTimeout(() => {
    const damage = currentEnemy.attack()
    const actualDamage = player.takeDamage(damage)
    addLog(`👹 ${currentEnemy.name} atacou você causando ${actualDamage} de dano!`)

    if (player.hp <= 0) {
      addLog(`💀 Você foi derrotado! Game Over!`)
      // Reset game
      setTimeout(() => {
        player = new Player()
        bossDefeated = false
        endBattle(false)
        updatePlayerDisplay()
        updateInventoryDisplay()
        addLog(`🔄 Você renasceu! Continue sua aventura.`)
      }, 2000)
    }
  }, 1000)
}

// Shop system
function setupShop() {
  const shopItemsArray = Object.entries(GAME_CONFIG.items)

  shopItemsArray.forEach(([key, item]) => {
    const itemDiv = document.createElement("div")
    itemDiv.className = "shop-item"
    itemDiv.innerHTML = `
            <div style="font-size: 24px;">${item.sprite}</div>
            <div style="font-size: 14px; margin: 5px 0;">${item.name}</div>
            <div style="font-size: 12px; color: #ffd700;">${item.price} moedas</div>
        `

    itemDiv.addEventListener("click", () => buyItem(item))
    elements.shopItems.appendChild(itemDiv)
  })
}

function buyItem(item) {
  if (player.gold >= item.price) {
    player.gold -= item.price
    player.inventory.push({ ...item })
    addLog(`🛒 Você comprou ${item.name} por ${item.price} moedas!`)
    updateInventoryDisplay()
  } else {
    addLog(`💸 Você não tem moedas suficientes para comprar ${item.name}!`)
  }
}

function openShop() {
  elements.shopModal.style.display = "flex"
}

function closeShop() {
  elements.shopModal.style.display = "none"
}

// Modals
function showLevelUpModal() {
  elements.levelupText.textContent = `Você subiu para o nível ${player.level}!`
  elements.levelupModal.style.display = "flex"
}

function closeLevelUpModal() {
  elements.levelupModal.style.display = "none"
}

// Logging system
function addLog(message) {
  const p = document.createElement("p")
  p.textContent = message
  elements.logContent.appendChild(p)
  elements.logContent.scrollTop = elements.logContent.scrollHeight
}

// Start the game
initGame()
