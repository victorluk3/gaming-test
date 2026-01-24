// ==================== CLASE SPRITE ====================
class Sprite {
    constructor(x, y, width, height, imageSrc = null) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.image = null;
        this.isLoaded = false;

        // Propiedades de animación
        this.animationFrames = []; // Array de {sx, sy, w, h}
        this.currentFrame = 0;
        this.frameIndex = 0;
        this.frameSpeed = 6; // Frames para mostrar cada frame de animación
        this.isAnimating = false;

        // Cargar imagen si se proporciona
        if (imageSrc) {
            this.loadImage(imageSrc);
        }
    }

    loadImage(imageSrc) {
        this.image = new Image();
        this.image.onload = () => {
            this.isLoaded = true;
        };
        this.image.onerror = () => {
            console.error('Error cargando imagen:', imageSrc);
            this.isLoaded = false;
        };
        this.image.src = imageSrc;
    }

    addAnimationFrame(sx, sy, w, h) {
        this.animationFrames.push({ sx, sy, w, h });
    }

    playAnimation(loop = true) {
        this.isAnimating = true;
        this.frameIndex = 0;
        this.currentFrame = 0;
        this.loopAnimation = loop;
    }

    stopAnimation() {
        this.isAnimating = false;
        this.frameIndex = 0;
        this.currentFrame = 0;
    }

    update() {
        if (this.isAnimating && this.animationFrames.length > 0) {
            this.currentFrame++;
            if (this.currentFrame >= this.frameSpeed) {
                this.currentFrame = 0;
                this.frameIndex++;
                if (this.frameIndex >= this.animationFrames.length) {
                    if (this.loopAnimation) {
                        this.frameIndex = 0;
                    } else {
                        this.isAnimating = false;
                        this.frameIndex = this.animationFrames.length - 1;
                    }
                }
            }
        }
    }

    draw(ctx) {
        if (this.animationFrames.length > 0 && this.isLoaded) {
            // Dibujar frame de animación
            const frame = this.animationFrames[this.frameIndex];
            ctx.drawImage(
                this.image,
                frame.sx, frame.sy, frame.w, frame.h,
                this.x, this.y, this.width, this.height
            );
        } else if (this.isLoaded) {
            // Dibujar imagen completa
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        } else {
            // Dibujar placeholder si no hay imagen
            ctx.fillStyle = '#888';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.strokeStyle = '#FFF';
            ctx.lineWidth = 2;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
    }
}
