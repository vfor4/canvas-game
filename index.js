const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const score_span = document.querySelector('#scoreEl')
const startGame_btn = document.querySelector('#startGameBtn')
const modelEl_div = document.querySelector('#modelEl')
const bigScoreEl_h1 = document.querySelector('#bigScoreEl')
console.log(modelEl_div);


canvas.width = innerWidth
canvas.height = innerHeight

class Player {
    constructor(x, y, radius, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

const friction = 0.991
class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= friction
        this.velocity.y *= friction
        this.x += this.velocity.x
        this.y += this.velocity.y
        this.alpha -= 0.01;
    }
}

const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 10, 'white')
let projectiles = []
let enemies = []
let particles = []
let score
function init(){
    player = new Player(x, y, 10, 'white')
    projectiles = []
    enemies = []
    particles = []
    score = 0
    score_span.innerHTML = score
}


function spawEnemies() {
    setInterval(() => {
        let x = 0
        let y = 0
        let flag = Math.floor(Math.random() * 4)
        switch (flag) {
            case 0:
                x = Math.random() * canvas.width
                break;
            case 1:
                x = Math.random() * canvas.width
                y = canvas.height + 1
                break;
            case 2:
                y = Math.random() * canvas.height
                break;
            case 3:
                x = canvas.width + 1
                y = Math.random() * canvas.height
                break;
        }
        const radius = Math.random() * 26 + 8;
        const color = `hsl(${Math.random() * 360}, 50%,50%)`
        const angle = Math.atan2(
            canvas.height / 2 - y,
            canvas.width / 2 - x
        )

        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }

        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 1000)
}

addEventListener('click', (event) => {
    const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2
    )

    const velocity = {
        x: Math.cos(angle) * 10,
        y: Math.sin(angle) * 10
    }

    const projectile = new Projectile(
        canvas.width / 2,
        canvas.height / 2,
        5,
        'yellow',
        velocity)

    projectiles.push(projectile);
})

let animationId

function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgb(0,0,0,0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)

    player.draw()
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
            particle.update()
        }
    })
    projectiles.forEach(
        (projectile, index) => {
            projectile.update()
            if (projectile.x - projectile.radius < 0 ||
                projectile.x - projectile.radius > canvas.width ||
                projectile.y - projectile.radius < 0 ||
                projectile.y - projectile.radius > canvas.height) {
                projectiles.splice(index, 1)
            }
        }
    )

    enemies.forEach(
        (enemy, index) => {
            enemy.update()

            const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
            // end game
            if (dist - player.radius - enemy.radius < 1) {
                cancelAnimationFrame(animationId)
                modelEl_div.style.display = 'flex';
                bigScoreEl_h1.innerHTML=score;
            }

            // projectile touch enemy
            projectiles.forEach((projectile, projectileIndex) => {
                const dist = Math.hypot(enemy.x - projectile.x, enemy.y - projectile.y);

                if (dist - enemy.radius - projectile.radius < 1) {

                    // create explosions
                    for (let index = 0; index < enemy.radius; index++) {
                        particles.push(new Particle(projectile.x, projectile.y, Math.random() * 3, enemy.color,
                            {
                                x: (Math.random() - 0.5) * (Math.random() * 8),
                                y: (Math.random() - 0.5) * (Math.random() * 8)
                            }))

                    }
                    if (enemy.radius - 10 > 10) {
                        score += 100;
                        gsap.to(enemy, {
                            radius: enemy.radius - 10
                        })
                        setTimeout(() => {
                            projectiles.splice(projectileIndex, 1)
                        }, 0);
                    } else {
                        score += 200;
                        setTimeout(() => {
                            enemies.splice(index, 1)
                            projectiles.splice(projectileIndex, 1)
                        }, 0);
                    }
                    score_span.innerHTML = score
                }
            })
        }
    )
}


startGame_btn.addEventListener('click', () => {
    init()
    animate()
    spawEnemies()
    modelEl_div.style.display = 'none';
})
