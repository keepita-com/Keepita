import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface AnimatedBackgroundProps {
  className?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const orbsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let particles: any[] = [];
    let particleCount = 0;
    let connectionDistance = 0;
    const mouseRadius = 150;
    let mouseX = 0;
    let mouseY = 0;

    const resize = () => {
      if (!containerRef.current || !canvas || !ctx) return;
      const devicePixelRatio = window.devicePixelRatio || 1;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);

      particleCount = Math.min(60, Math.floor((width * height) / 15000));
      connectionDistance = Math.min(200, width * 0.2);

      // Re-initialize particles on resize
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(createParticle());
      }
    };

    function getRandomParticleColor() {
      const colors = [
        "rgba(59, 130, 246, 0.7)", // Blue
        "rgba(99, 102, 241, 0.7)", // Indigo
        "rgba(139, 92, 246, 0.7)", // Purple
        "rgba(79, 70, 229, 0.7)", // Medium Blue
        "rgba(16, 185, 129, 0.7)", // Emerald (rare)
      ];

      const rand = Math.random();
      if (rand < 0.4) return colors[0];
      if (rand < 0.7) return colors[1];
      if (rand < 0.9) return colors[2];
      if (rand < 0.97) return colors[3];
      return colors[4];
    }

    function createParticle(): any {
      if (!canvas) return;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const x = Math.random() * width;
      const y = Math.random() * height;
      const baseRadius = Math.random() * 2.5 + 0.5;
      const radius = baseRadius;
      const color = getRandomParticleColor();
      const speedX = (Math.random() * 0.6 - 0.3) * (width / 1920);
      const speedY = (Math.random() * 0.6 - 0.3) * (height / 1080);
      const maxLife = Math.random() * 100 + 150;
      const glowing = Math.random() > 0.85;
      const glowIntensity = Math.random() * 0.5 + 0.5;

      return {
        x,
        y,
        radius,
        baseRadius,
        color,
        speedX,
        speedY,
        life: 0,
        maxLife,
        glowing,
        glowIntensity,
        lastPos: { x, y },
        update() {
          this.lastPos = { x: this.x, y: this.y };
          this.x += this.speedX;
          this.y += this.speedY;
          this.life++;

          const dx = mouseX - this.x;
          const dy = mouseY - this.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouseRadius) {
            const force = (1 - distance / mouseRadius) * 0.05;
            this.x -= dx * force;
            this.y -= dy * force;
            this.radius =
              this.baseRadius * (1.5 + (mouseRadius - distance) / mouseRadius);
          } else {
            if (this.radius > this.baseRadius) {
              this.radius = Math.max(this.baseRadius, this.radius * 0.98);
            }
          }

          if (this.glowing) {
            const pulse = Math.sin(this.life * 0.05) * 0.5 + 0.5;
            this.radius = this.baseRadius * (1 + pulse * 0.5);
          }

          if (this.life > this.maxLife) {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.lastPos = { x: this.x, y: this.y };
            this.life = 0;
            this.maxLife = Math.random() * 100 + 150;
          }

          if (this.x < 0) {
            this.x = 0;
            this.speedX *= -0.9;
          } else if (this.x > width) {
            this.x = width;
            this.speedX *= -0.9;
          }

          if (this.y < 0) {
            this.y = 0;
            this.speedY *= -0.9;
          } else if (this.y > height) {
            this.y = height;
            this.speedY *= -0.9;
          }
        },
        draw() {
          if (!ctx) return;

          if (this.glowing) {
            const gradient = ctx.createRadialGradient(
              this.x,
              this.y,
              0,
              this.x,
              this.y,
              this.radius * (4 + this.glowIntensity * 3)
            );

            const alpha = 0.8 - (this.life / this.maxLife) * 0.5;
            gradient.addColorStop(0, this.color.replace("0.7", String(alpha)));
            gradient.addColorStop(
              0.5,
              this.color.replace("0.7", String(alpha * 0.3))
            );
            gradient.addColorStop(1, this.color.replace("0.7", "0"));

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(
              this.x,
              this.y,
              this.radius * (4 + this.glowIntensity * 2),
              0,
              Math.PI * 2
            );
            ctx.fill();
          }

          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fill();
        },
      };
    }

    function connectParticles() {
      if (!ctx) return;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < connectionDistance) {
            const opacity = 1 - distance / connectionDistance;

            ctx.strokeStyle = `rgba(59, 130, 246, ${opacity * 0.2})`;
            ctx.lineWidth =
              Math.min(particles[i].radius, particles[j].radius) *
              0.5 *
              opacity;

            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }

      connectParticles();
      animationRef.current = requestAnimationFrame(animate);
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
    };

    canvas.addEventListener("mousemove", handleMouseMove);

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(containerRef.current);

    animate();

    return () => {
      // Cleanup
      resizeObserver.disconnect();
      canvas.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!orbsRef.current) return;

    const orbs = orbsRef.current.children;

    for (let i = 0; i < orbs.length; i++) {
      const orb = orbs[i] as HTMLElement;
      const delay = i * 0.3;

      gsap.fromTo(
        orb,
        {
          opacity: 0,
          scale: 0.5,
        },
        {
          opacity: 0.8,
          scale: 1,
          duration: 2,
          delay,
        }
      );

      gsap.to(orb, {
        y: "random(-30, 30)",
        x: "random(-30, 30)",
        rotation: "random(-15, 15)",
        duration: "random(8, 15)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: delay,
      });
    }
  }, []);

  useEffect(() => {
    if (!gridRef.current) return;

    gsap.fromTo(
      gridRef.current,
      {
        opacity: 0,
        scale: 0.9,
      },
      {
        opacity: 0.15,
        scale: 1,
        duration: 2,
        ease: "power2.out",
      }
    );

    gsap.to(gridRef.current, {
      rotation: 5,
      duration: 30,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950"
    >
      <div
        ref={gridRef}
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99, 102, 241, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.2) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          backgroundPosition: "-1px -1px",
        }}
      ></div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0"
        style={{ filter: "blur(0.5px)" }}
      />

      <div
        className="absolute -top-[20%] -left-[20%] w-[70%] h-[70%] rounded-full bg-blue-900/10 blur-[120px]"
        style={{ transform: "translate3d(0, 0, 0)" }}
      />
      <div
        className="absolute -bottom-[20%] -right-[20%] w-[70%] h-[70%] rounded-full bg-indigo-900/10 blur-[120px]"
        style={{ transform: "translate3d(0, 0, 0)" }}
      />

      <div
        ref={orbsRef}
        className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
      >
        <div className="absolute top-[15%] left-[10%] w-[300px] h-[300px] rounded-full bg-gradient-to-r from-blue-500/5 to-indigo-700/5 blur-xl"></div>
        <div className="absolute bottom-[25%] right-[10%] w-[250px] h-[250px] rounded-full bg-gradient-to-r from-indigo-600/5 to-purple-700/5 blur-xl"></div>
        <div className="absolute top-[50%] right-[20%] w-[200px] h-[200px] rounded-full bg-gradient-to-r from-blue-400/5 to-blue-600/5 blur-xl"></div>
      </div>
    </div>
  );
};

export default AnimatedBackground;
