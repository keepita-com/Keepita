import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Renderer, Camera, Geometry, Program, Mesh } from "ogl";

interface AnimatedBackgroundProps {
  className?: string;
}

const hexToRgb = (hex: string): [number, number, number] => {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const int = parseInt(hex, 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  return [r, g, b];
};

const vertex = `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;
  
  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;
  
  varying vec4 vRandom;
  varying vec3 vColor;
  
  void main() {
    vRandom = random;
    vColor = color;
    
    vec3 pos = position * uSpread;
    pos.z *= 10.0;
    
    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;
    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);
    
    vec4 mvPos = viewMatrix * mPos;

    if (uSizeRandomness == 0.0) {
      gl_PointSize = uBaseSize;
    } else {
      gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
    }
    
    gl_Position = projectionMatrix * mvPos;
  }
`;

const fragment = `
  precision highp float;
  
  uniform float uTime;
  uniform float uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;
  
  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));
    
    if(uAlphaParticles < 0.5) {
      if(d > 0.5) {
        discard;
      }
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
    } else {
      float circle = smoothstep(0.5, 0.4, d) * 0.8;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
    }
  }
`;

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const orbsRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const config = {
      particleCount: 600,
      particleSpread: 15,
      speed: 0.1,
      particleColors: ["#3b82f6", "#6366f1", "#8b5cf6", "#4f46e5"],
      alphaParticles: true,
      particleBaseSize: 120,
      sizeRandomness: 1,
      cameraDistance: 20,
      disableRotation: false,
    };

    const renderer = new Renderer({ depth: false, alpha: true });
    const gl = renderer.gl;
    container.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 0);

    const camera = new Camera(gl, { fov: 15 });
    camera.position.set(0, 0, config.cameraDistance);

    const resize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
    };

    resize();
    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(container);

    const count = config.particleCount;
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count * 4);
    const colors = new Float32Array(count * 3);
    const palette = config.particleColors;

    for (let i = 0; i < count; i++) {
      let x: number, y: number, z: number, len: number;
      do {
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = Math.random() * 2 - 1;
        len = x * x + y * y + z * z;
      } while (len > 1 || len === 0);

      const r = Math.cbrt(Math.random());
      positions.set([x * r, y * r, z * r], i * 3);
      randoms.set(
        [Math.random(), Math.random(), Math.random(), Math.random()],
        i * 4
      );

      const col = hexToRgb(palette[Math.floor(Math.random() * palette.length)]);
      colors.set(col, i * 3);
    }

    const geometry = new Geometry(gl, {
      position: { size: 3, data: positions },
      random: { size: 4, data: randoms },
      color: { size: 3, data: colors },
    });

    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        uTime: { value: 0 },
        uSpread: { value: config.particleSpread },
        uBaseSize: { value: config.particleBaseSize },
        uSizeRandomness: { value: config.sizeRandomness },
        uAlphaParticles: { value: config.alphaParticles ? 1 : 0 },
      },
      transparent: true,
      depthTest: false,
    });

    const particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });

    let animationFrameId: number;
    let lastTime = performance.now();
    let elapsed = 0;

    const update = (t: number) => {
      animationFrameId = requestAnimationFrame(update);
      const delta = t - lastTime;
      lastTime = t;
      elapsed += delta * config.speed;

      program.uniforms.uTime.value = elapsed * 0.001;

      particles.position.x = 0;
      particles.position.y = 0;

      if (!config.disableRotation) {
        particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
        particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
        particles.rotation.z += 0.01 * config.speed;
      }

      renderer.render({ scene: particles, camera });
    };

    animationFrameId = requestAnimationFrame(update);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (container.contains(gl.canvas)) {
        container.removeChild(gl.canvas);
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
        { opacity: 0, scale: 0.5 },
        { opacity: 0.8, scale: 1, duration: 2, delay }
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
      { opacity: 0, scale: 0.9 },
      { opacity: 0.15, scale: 1, duration: 2, ease: "power2.out" }
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
      className={`absolute inset-0 overflow-hidden bg-gradient-to-b from-gray-900 to-gray-950 ${
        className || ""
      }`}
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
      />

      <div
        ref={canvasContainerRef}
        className="absolute inset-0 w-full h-full z-10"
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
