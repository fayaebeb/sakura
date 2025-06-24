import React from "react";

export default function PetalParticles() {
  const petals = Array.from({ length: 20 });
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {petals.map((_, i) => (
        <span key={i}
              className="absolute w-3 h-3 bg-pink-300 rounded-full opacity-60 animate-[spin_18s_linear_infinite]"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * -20}%`,
                animationDelay: `${Math.random() * 10}s`,
                animationDuration: `${16 + Math.random() * 8}s`,
                filter: `blur(${Math.random()}px)`,
              }}/>
      ))}
    </div>
  );
}
