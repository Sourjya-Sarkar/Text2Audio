// src/components/ParticlesBackground.jsx
import React from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';

const ParticlesBackground = () => {
  const particlesInit = async (engine) => {
    await loadSlim(engine); // use loadSlim for a lightweight, compatible setup
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: false },
        background: { color: { value: '#000000' } },
        particles: {
          number: { value: 50 },
          size: { value: { min: 1, max: 3 } },
          color: { value: '#00B5D8' },
          move: { enable: true, speed: 0.5 },
          opacity: { value: 0.3 },
        },
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0,
        width: '100vw',
        height: '100vh',
      }}
    />
  );
};

export default ParticlesBackground;
