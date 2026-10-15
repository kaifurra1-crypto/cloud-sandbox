// ИГРА «ВЗРЫВНОЙ ДОМ-ЛАБИРИНТ» — Minecraft Education, MakeCode
// Вставь этот код во вкладку JavaScript, потом нажми «Блоки».
// Команды в чате: build — построить дом, start — начать игру.
//
// Карты этажей:
//   # — стена (обсидиан)   . — проход   S — старт этажа
//   U — лифт на следующий этаж (изумруд)   T — ловушка с динамитом
//   F — финиш (золото)
let домX = 0
let домY = 0
let домZ = 0
let этаж = 0
let карта: string[] = []
let символ = ""
let клеткаX = 0
let клеткаZ = 0
let игра = false
let построен = false

function загрузитьКарту() {
    if (этаж == 0) {
        карта = [
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
        ]
    } else if (этаж == 1) {
        карта = [
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
        ]
    } else if (этаж == 2) {
        карта = [
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
        ]
    } else if (этаж == 3) {
        карта = [
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
        ]
    } else {
        карта = [
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
    }
}

function построитьЭтаж() {
    загрузитьКарту()
    blocks.fill(OBSIDIAN, world(домX, домY + этаж * 4, домZ), world(домX + 10, домY + этаж * 4, домZ + 10), FillOperation.Replace)
    for (let строка = 0; строка <= 10; строка++) {
        for (let столбец = 0; столбец <= 10; столбец++) {
            символ = карта[строка].charAt(столбец)
            if (символ == "#") {
                blocks.fill(OBSIDIAN, world(домX + столбец, домY + этаж * 4 + 1, домZ + строка), world(домX + столбец, домY + этаж * 4 + 3, домZ + строка), FillOperation.Replace)
            } else if (символ == "U") {
                blocks.place(EMERALD_BLOCK, world(домX + столбец, домY + этаж * 4, домZ + строка))
            } else if (символ == "F") {
                blocks.place(GOLD_BLOCK, world(домX + столбец, домY + этаж * 4, домZ + строка))
            }
        }
    }
}

function построитьДом() {
    домX = player.position().getValue(Axis.X) + 3
    домY = player.position().getValue(Axis.Y) - 1
    домZ = player.position().getValue(Axis.Z) + 3
    blocks.fill(AIR, world(домX, домY, домZ), world(домX + 10, домY + 24, домZ + 10), FillOperation.Replace)
    for (let номер = 0; номер <= 4; номер++) {
        этаж = номер
        построитьЭтаж()
    }
    // крыша
    blocks.fill(OBSIDIAN, world(домX, домY + 20, домZ), world(домX + 10, домY + 20, домZ + 10), FillOperation.Replace)
    построен = true
    player.say("Дом построен! Напиши start")
}

function телепортНаСтарт() {
    for (let строка = 0; строка <= 10; строка++) {
        for (let столбец = 0; столбец <= 10; столбец++) {
            if (карта[строка].charAt(столбец) == "S") {
                player.teleport(world(домX + столбец, домY + этаж * 4 + 1, домZ + строка))
            }
        }
    }
}

function следующийЭтаж() {
    этаж += 1
    загрузитьКарту()
    телепортНаСтарт()
    player.say("Этаж " + (этаж + 1) + "!")
}

function взрыв() {
    игра = false
    player.say("БУМ! Это была ловушка!")
    player.execute("effect @s slowness 5 255 true")
    player.execute("summon tnt ~ ~ ~")
    loops.pause(4000)
    проигрыш()
}

function победа() {
    игра = false
    player.execute("title @s title ПОБЕДА!")
    player.execute("gamemode creative @s")
    player.teleport(world(домX + 5, домY + 21, домZ + 5))
}

function проигрыш() {
    игра = false
    player.execute("title @s title ПРОИГРЫШ")
    player.execute("gamemode creative @s")
    player.teleport(world(домX + 5, домY + 21, домZ + 5))
}

function начатьИгру() {
    этаж = 0
    загрузитьКарту()
    player.execute("gamerule tntexplodes true")
    player.execute("difficulty peaceful")
    player.execute("gamemode adventure @s")
    player.execute("effect @s night_vision 99999 0 true")
    телепортНаСтарт()
    игра = true
    player.execute("title @s title Доберись до 5 этажа!")
}

player.onChat("build", function () {
    построитьДом()
})

player.onChat("start", function () {
    if (построен) {
        начатьИгру()
    } else {
        player.say("Сначала напиши build")
    }
})

player.onDied(function () {
    if (игра) {
        проигрыш()
    }
})

// Всё время проверяем, на какой клетке стоит игрок
loops.forever(function () {
    if (игра) {
        клеткаX = player.position().getValue(Axis.X) - домX
        клеткаZ = player.position().getValue(Axis.Z) - домZ
        if (клеткаX >= 0 && клеткаX <= 10 && клеткаZ >= 0 && клеткаZ <= 10) {
            символ = карта[клеткаZ].charAt(клеткаX)
            if (символ == "T") {
                взрыв()
            } else if (символ == "U") {
                следующийЭтаж()
            } else if (символ == "F") {
                победа()
            }
        }
    }
})
