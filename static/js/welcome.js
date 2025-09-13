// ===== GROCERY MANAGEMENT SYSTEM - WELCOME PAGE INTERACTIONS =====

/**
 * Particle System - Creates floating particles for background animation
 */
class ParticleSystem {
    constructor(containerId, particleCount = 50) {
        this.container = document.getElementById(containerId);
        this.particleCount = particleCount;
        this.particles = [];
        this.init();
    }

    init() {
        if (!this.container) return;

        for (let i = 0; i < this.particleCount; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Random positioning and timing
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 10) + 's';

        this.container.appendChild(particle);
        this.particles.push(particle);
    }

    destroy() {
        this.particles.forEach(particle => particle.remove());
        this.particles = [];
    }
}

/**
 * 3D Card Tilt Effect - Makes the welcome card follow mouse movement
 */
class CardTiltEffect {
    constructor(cardSelector) {
        this.card = document.querySelector(cardSelector);
        this.isEnabled = true;
        this.sensitivity = 5;
        this.init();
    }

    init() {
        if (!this.card) return;

        // Mouse move handler
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);

        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseleave', this.handleMouseLeave);

        // Disable on mobile for performance
        if (window.innerWidth <= 768) {
            this.isEnabled = false;
        }

        // Re-check on resize
        window.addEventListener('resize', () => {
            this.isEnabled = window.innerWidth > 768;
        });
    }

    handleMouseMove(e) {
        if (!this.isEnabled || !this.card) return;

        const rect = this.card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const rotateX = (y / rect.height) * this.sensitivity;
        const rotateY = -(x / rect.width) * this.sensitivity;

        this.card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    }

    handleMouseLeave() {
        if (!this.card) return;
        this.card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    }

    destroy() {
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseleave', this.handleMouseLeave);
    }
}

/**
 * Button Ripple Effect - Adds material design ripple effect to buttons
 */
class RippleEffect {
    constructor(buttonSelector) {
        this.buttons = document.querySelectorAll(buttonSelector);
        this.init();
    }

    init() {
        this.buttons.forEach(button => {
            button.addEventListener('click', this.createRipple.bind(this));
        });

        // Add ripple animation CSS if not already present
        this.injectRippleCSS();
    }

    createRipple(e) {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        // Create ripple element
        const ripple = document.createElement('span');
        ripple.className = 'ripple-element';
        
        ripple-element {
    position: absolute;
    border-radius: 50%;
    background-color: rgba(255, 255, 255, 0.7);
    transform: scale(0);
    animation: ripple 0.6s linear;
}

@keyframes ripple {
    to {
        transform: scale(1);
        opacity: 0;
    }
}
