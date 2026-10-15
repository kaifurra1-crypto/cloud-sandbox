let начало: Position = null
let высота = 0

// Строит один этаж с лабиринтом и динамитом
function этаж() {
    // пол
    blocks.fill(OBSIDIAN, positions.add(начало, pos(0, высота, 0)), positions.add(начало, pos(10, высота, 10)), FillOperation.Replace)
    // стены лабиринта
    blocks.fill(OBSIDIAN, positions.add(начало, pos(1, высота + 1, 3)), positions.add(начало, pos(8, высота + 4, 3)), FillOperation.Replace)
    blocks.fill(OBSIDIAN, positions.add(начало, pos(2, высота + 1, 6)), positions.add(начало, pos(9, высота + 4, 6)), FillOperation.Replace)
    // динамит в полу
    blocks.place(TNT, positions.add(начало, pos(4, высота, 1)))
    blocks.place(TNT, positions.add(начало, pos(7, высота, 2)))
    blocks.place(TNT, positions.add(начало, pos(6, высота, 4)))
    blocks.place(TNT, positions.add(начало, pos(3, высота, 5)))
    blocks.place(TNT, positions.add(начало, pos(6, высота, 7)))
    blocks.place(TNT, positions.add(начало, pos(4, высота, 8)))
    blocks.place(TNT, positions.add(начало, pos(6, высота, 9)))
    // лифт на следующий этаж
    blocks.place(EMERALD_BLOCK, positions.add(начало, pos(9, высота, 9)))
}

// Строит весь дом из 5 этажей
function построитьДом() {
    начало = positions.add(player.position(), pos(2, -1, 2))
    blocks.fill(OBSIDIAN, начало, positions.add(начало, pos(10, 25, 10)), FillOperation.Hollow)
    высота = 0
    for (let index = 0; index < 5; index++) {
        этаж()
        высота += 5
    }
    // финиш на 5 этаже
    blocks.place(GOLD_BLOCK, positions.add(начало, pos(9, 20, 9)))
}

function победа() {
    player.execute("title @s title ПОБЕДА!")
    player.teleport(positions.add(начало, pos(-3, 1, 5)))
}

function проигрыш() {
    player.execute("effect @s slowness 5 255 true")
    player.execute("summon tnt")
    loops.pause(4000)
    player.execute("title @s title БУМ! Ты проиграл")
    player.teleport(positions.add(начало, pos(-3, 1, 5)))
}

player.onChat("go", function () {
    построитьДом()
    player.execute("gamemode adventure")
    player.execute("gamerule domobspawning false")
    player.execute("effect @s night_vision 99999 0 true")
    player.teleport(positions.add(начало, pos(1, 1, 1)))
})

loops.forever(function () {
    if (blocks.testForBlock(TNT, pos(0, -1, 0))) {
        проигрыш()
    }
    if (blocks.testForBlock(EMERALD_BLOCK, pos(0, -1, 0))) {
        player.teleport(pos(-8, 5, -8))
    }
    if (blocks.testForBlock(GOLD_BLOCK, pos(0, -1, 0))) {
        победа()
    }
})
