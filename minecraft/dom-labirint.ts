// =====================================================
//  ИГРА «ВЗРЫВНОЙ ДОМ-ЛАБИРИНТ» — Minecraft Education (MakeCode, JavaScript)
//  Команды в чате:  build — построить дом,  start — начать игру
// =====================================================

const N = 11        // размер этажа (11 x 11 блоков)
const H = 4         // высота этажа: пол + 3 блока воздуха
const FLOORS = 5    // количество этажей

let ox = 0          // угол дома (координаты мира)
let oy = 0
let oz = 0
let built = false
let playing = false
let mazes: string[][] = []

// Карты этажей:
//  # — стена (обсидиан)   . — проход   S — старт этажа
//  U — изумрудный лифт на следующий этаж   T — ловушка с динамитом
//  F — финиш (золотой блок)
function loadMazes() {
    mazes = [
        [
            "###########",
            "#S..#.....#",
            "###.#.###.#",
            "#...#...#.#",
            "#.#####.#.#",
            "#.#T....#.#",
            "#.#####.#.#",
            "#.......#.#",
            "#######.#.#",
            "#T......#U#",
            "###########"
        ],
        [
            "###########",
            "#.....#..T#",
            "#.###.#.###",
            "#.#S#...#U#",
            "#.#.#####.#",
            "#...#.....#",
            "###.#.###.#",
            "#T#...#...#",
            "#.#####.###",
            "#.........#",
            "###########"
        ],
        [
            "###########",
            "#U#.......#",
            "#.#.#####.#",
            "#.#.#T..#.#",
            "#.#.###.#.#",
            "#...#...#.#",
            "#####.###.#",
            "#T....#...#",
            "#.#####.#.#",
            "#...S...#T#",
            "###########"
        ],
        [
            "###########",
            "#...#.....#",
            "#.#.#.###.#",
            "#.#...#T#.#",
            "#.#####.#.#",
            "#.....#...#",
            "#T###.###.#",
            "#.#...#...#",
            "#.#.###.###",
            "#.#S..#..U#",
            "###########"
        ],
        [
            "###########",
            "#S#...#...#",
            "#.#.#.#.#.#",
            "#...#...#.#",
            "#####.###.#",
            "#T..#.#...#",
            "#.#.#.#.###",
            "#.#...#...#",
            "#.#####.#.#",
            "#.......#F#",
            "###########"
        ]
    ]
}

// ---------- PIXEL ART ----------
// Y — жёлтый, R — красный, K — чёрный, . — пусто
const WIN_PIC = [
    "Y.YYYYY.Y",
    "Y.YYYYY.Y",
    ".YYYYYYY.",
    "..YYYYY..",
    "...YYY...",
    "....Y....",
    "....Y....",
    "..YYYYY..",
    "..KKKKK.."
]
const LOSE_PIC = [
    "R.......R",
    ".R.....R.",
    "..R...R..",
    "...R.R...",
    "....R....",
    "...R.R...",
    "..R...R..",
    ".R.....R.",
    "R.......R"
]

// Рисует картинку на крыше дома
function drawPicture(pic: string[]) {
    let x0 = ox + 1
    let y0 = oy + FLOORS * H + 1
    let z0 = oz + 6
    for (let row = 0; row < pic.length; row++) {
        for (let col = 0; col < pic[row].length; col++) {
            let ch = pic[row].charAt(col)
            let b = AIR
            if (ch == "Y") b = YELLOW_WOOL
            if (ch == "R") b = RED_WOOL
            if (ch == "K") b = BLACK_WOOL
            blocks.place(b, world(x0 + col, y0 + pic.length - 1 - row, z0))
        }
    }
}

// ---------- СТРОИТЕЛЬСТВО ----------
function buildFloor(f: number) {
    let y = oy + f * H
    let m = mazes[f]
    // пол из обсидиана
    blocks.fill(OBSIDIAN, world(ox, y, oz), world(ox + N - 1, y, oz + N - 1), FillOperation.Replace)
    for (let z = 0; z < N; z++) {
        for (let x = 0; x < N; x++) {
            let ch = m[z].charAt(x)
            if (ch == "#") {
                blocks.fill(OBSIDIAN, world(ox + x, y + 1, oz + z), world(ox + x, y + H - 1, oz + z), FillOperation.Replace)
            } else if (ch == "U") {
                blocks.place(EMERALD_BLOCK, world(ox + x, y, oz + z))
            } else if (ch == "F") {
                blocks.place(GOLD_BLOCK, world(ox + x, y, oz + z))
            }
        }
    }
}

function buildHouse() {
    let p = player.position()
    ox = p.getValue(Axis.X) + 3
    oy = p.getValue(Axis.Y) - 1
    oz = p.getValue(Axis.Z) + 3
    loadMazes()
    // расчищаем место
    blocks.fill(AIR, world(ox, oy, oz), world(ox + N - 1, oy + FLOORS * H + 12, oz + N - 1), FillOperation.Replace)
    for (let f = 0; f < FLOORS; f++) {
        buildFloor(f)
    }
    // крыша
    blocks.fill(OBSIDIAN, world(ox, oy + FLOORS * H, oz), world(ox + N - 1, oy + FLOORS * H, oz + N - 1), FillOperation.Replace)
    built = true
    player.say("Дом построен! Напиши start")
}

// ---------- ИГРА ----------
function teleportToStart(f: number) {
    for (let z = 0; z < N; z++) {
        for (let x = 0; x < N; x++) {
            if (mazes[f][z].charAt(x) == "S") {
                player.teleport(world(ox + x, oy + f * H + 1, oz + z))
            }
        }
    }
}

function removeTrap(f: number, x: number, z: number) {
    let row = mazes[f][z]
    mazes[f][z] = row.substr(0, x) + "." + row.substr(x + 1)
}

function boom(f: number, x: number, z: number) {
    removeTrap(f, x, z)
    player.say("§cБУМ! Это ловушка!")
    player.execute("effect @s slowness 5 255 true")
    player.execute("summon tnt ~ ~ ~")
    loops.pause(4000)
    if (playing) {
        lose()
    }
}

function nextFloor(f: number) {
    player.say("§aЭтаж " + (f + 2) + "!")
    teleportToStart(f + 1)
}

function win() {
    playing = false
    player.execute("title @s title §6ПОБЕДА!")
    player.execute("gamemode creative @s")
    drawPicture(WIN_PIC)
    player.teleport(world(ox + 5, oy + FLOORS * H + 1, oz + 1))
}

function lose() {
    playing = false
    player.execute("title @s title §cПРОИГРЫШ")
    player.execute("gamemode creative @s")
    drawPicture(LOSE_PIC)
    player.teleport(world(ox + 5, oy + FLOORS * H + 1, oz + 1))
}

function startGame() {
    if (!built) {
        player.say("Сначала напиши build")
        return
    }
    loadMazes()   // ловушки снова заряжены
    player.execute("gamerule tntexplodes true")
    player.execute("difficulty peaceful")
    player.execute("gamemode adventure @s")
    player.execute("effect @s night_vision 99999 0 true")
    player.execute("effect @s instant_health 1 10 true")
    teleportToStart(0)
    playing = true
    player.execute("title @s title Доберись до 5 этажа!")
}

// Каждый момент проверяем, на какой клетке стоит игрок
loops.forever(function () {
    if (!playing) return
    let p = player.position()
    let x = p.getValue(Axis.X) - ox
    let z = p.getValue(Axis.Z) - oz
    let f = Math.floor((p.getValue(Axis.Y) - oy - 1) / H)
    if (f < 0 || f >= FLOORS || x < 0 || x >= N || z < 0 || z >= N) return
    let ch = mazes[f][z].charAt(x)
    if (ch == "T") {
        boom(f, x, z)
    } else if (ch == "U") {
        nextFloor(f)
    } else if (ch == "F") {
        win()
    }
})

player.onDied(function () {
    if (playing) lose()
})

player.onChat("build", function () {
    buildHouse()
})

player.onChat("start", function () {
    startGame()
})
