// Настройка Холста
let canvas = document.getElementById('canvas')
let ctx = canvas.getContext('2d')
// Получаем ширину и высоту элемента canvas
let width = canvas.width
let height = canvas.height
// Вычисляем ширину и высоту в ячейках
let blockSize = 10
let widthInBlocks = width / blockSize
let heightInBlocks = height / blockSize
// Устанавливаем счёт  0
let score = 0
//  Рисуем рамку
let drawBorder = function () {
    ctx.fillStyle = 'Gray'
    ctx.fillRect(0, 0, width, blockSize)
    ctx.fillRect(0, height - blockSize, width, blockSize)
    ctx.fillRect(0, 0, blockSize, height)
    ctx.fillRect(width - blockSize, 0, blockSize, height)
}

//  Выводим счёт игры в левом верхнем углу
let drawScore = function () {
    ctx.font = '20px Courier'
    ctx.fillStyle = 'Black'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillText('Счёт ' + score + ' Скорость ' + animationTime, width / 2, height - 30)
}
// Функция перезапуск игры нажать F5
let gameAgain = function () {
    ctx.font = '25px Courier'
    ctx.fillStyle = 'Black'
    ctx.textBaseline = 'bottom'
    ctx.fillText('Нажми F5 чтобы начать заново', width / 2, height / 2)
}
//   Функция GameOver отменяет timeout и печатаем сообщение Конец игры
let gameOver = function () {
    clearTimeout(timeoutId)
    gameAgain()
    ctx.font = '60px Courier'
    ctx.fillStyle = 'Red'
    ctx.fillText('Game Over', width / 2, height - 300)
}
//   Рисуем окружность(Используя функцию из главы 14)
let circle = function (x, y, radius, fillCircle) {
    ctx.beginPath()
    ctx.arc(x, y, radius, Math.PI * 2, false)
    if (fillCircle) {
        ctx.fill()
    } else {
        ctx.stroke()
    }
}

//   Создаём конструктор Block(ячейка)
let Block = function (col, row) {
    this.col = col
    this.row = row
}
//   Рисуем квадрат в позиции ячейки
Block.prototype.drawSquare = function (color) {
    let x = this.col * blockSize
    let y = this.row * blockSize
    ctx.fillStyle = color
    ctx.fillRect(x, y, blockSize, blockSize)
}

//   Рисуем круг в позиции ячейки
Block.prototype.drawCircle = function (color) {
    let centerX = this.col * blockSize + blockSize / 2
    let centerY = this.row * blockSize + blockSize / 2
    ctx.fillStyle = color
    circle(centerX, centerY, blockSize / 2, true)
}
// Проверяем, находится ли эта ячейка в той же позиции что и ячейка OtherBlock
Block.prototype.equal = function (otherBlock) {
    return this.col === otherBlock.col && this.row === otherBlock.row
}

//   Задаем конструктор Snake(змейка)
let Snake = function () {
    this.segments = [
        new Block(7, 2),
        new Block(6, 2),
        new Block(5, 2),
        new Block(4, 2),
        new Block(3, 2),
        new Block(2, 2),
        new Block(1, 2)
    ]
    this.direction = 'right'
    this.nextDirection = 'right'
}
//   Рисуем квадратик для каждого элемента змейки
Snake.prototype.draw = function () {
    this.segments[0].drawSquare('Black')
    let isEvenSegment = false
    for (let i = 1; i < this.segments.length; i++) {
        if (isEvenSegment) {
            this.segments[i].drawSquare('LimeGreen')
        } else {
            this.segments[i].drawSquare('Yellow')
        }
        isEvenSegment = !isEvenSegment
    }
}
//Функция пауза , где показывает в центре слово "ПАУЗА"
let gamePause = function () {
    ctx.font = '40px Courier'
    ctx.fillStyle = 'Black'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('ПАУЗА', width / 2, height / 2)
}

//   Создаем новую голову и добавляем ее к началу змейки, чтобы передвинуть змейку в текущем направлении
Snake.prototype.move = function () {
    let head = this.segments[0]
    let newHead
    this.direction = this.nextDirection
    if (this.direction === 'right') {
        newHead = new Block(head.col + 1, head.row)
    } else if (this.direction === 'down') {
        newHead = new Block(head.col, head.row + 1)
    } else if (this.direction === 'left') {
        newHead = new Block(head.col - 1, head.row)
    } else if (this.direction === 'up') {
        newHead = new Block(head.col, head.row - 1)
    } else if (this.direction === 'pause') {
        gamePause()
        return
    }
    if (this.checkCollision(newHead)) {
        gameOver()
        return
    }
    this.segments.unshift(newHead)
    if (newHead.equal(apple.position)) {
        score++
        animationTime -= 5
        apple.move()
    } else {
        this.segments.pop()
    }
}

// Проверяем, не столкнулась ли змейка со стеной или собственным телом
Snake.prototype.checkCollision = function (head) {
    let leftCollision = (head.col === 0)
    let topCollision = (head.row === 0)
    let rightCollision = (head.col === widthInBlocks - 1)
    let bottomCollision = (head.row === heightInBlocks - 1)
    let wallCollision = leftCollision || topCollision || rightCollision || bottomCollision
    let selfCollision = false
    for (i = 0; i < this.segments.length; i++) {
        if (head.equal(this.segments[i])) {
            selfCollision = true
        }
    }
    return wallCollision || selfCollision

}
// Задаем следующее движение змейки на основе нажатой клавиши
Snake.prototype.setDirection = function (newDirection) {
    if (this.direction === 'up' && newDirection === 'down') {
        return
    } else if (this.direction === 'right' && newDirection === 'left') {
        return
    } else if (this.direction === 'down' && newDirection === 'up') {
        return
    } else if (this.direction === 'left' && newDirection === 'right') {
        return
    }
    this.nextDirection = newDirection
}
// Задаем конструктор Apple(яблоко)
let Apple = function () {
    this.position = new Block(10, 2)
}
// Рисуем кружок в позиции яблока
Apple.prototype.draw = function () {
    this.position.drawCircle('Red')
}
// Перемещаем яблоко в случайную позицию
Apple.prototype.move = function () {


    let randomCol = Math.floor(Math.random() * (widthInBlocks - 2)) + 1
    let randomRow = Math.floor(Math.random() * (heightInBlocks - 2)) + 1
    this.position = new Block(randomCol, randomRow)
    for (let i = 0; i < snake.segments.length; i++) {
        if (this.position.equal(snake.segments[i])) {
            apple.move()
        }
    }
}

// Создаем объект - змейку и объект - яблоко
let snake = new Snake()
let apple = new Apple()



//скорость анимации + функция timeout
let animationTime = 200
let timeoutId
let timeoutIdFunction = function () {
    timeoutId = setTimeout(gameLoop, animationTime)
}
//зацикливания таймаута
let gameLoop = function () {
    timeoutIdFunction()
    ctx.clearRect(0, 0, width, height)
    drawScore()
    drawBorder()
    snake.move()
    snake.draw()
    apple.draw()
}
gameLoop()


// Преобразуем коды клавиш направления
let directions = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    32: 'pause',
    49: '1',
    13: 'enter'
}
// Задаем обработчик события keydown(клавиши - стрелки)
$('body').keydown(function (event) {
    let newDirection = directions[event.keyCode]
    if (newDirection !== undefined) {
        snake.setDirection(newDirection)
    }
})