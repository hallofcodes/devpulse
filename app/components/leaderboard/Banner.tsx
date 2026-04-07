import React, { useMemo } from "react";
import Image from "next/image";

export default function Banner({ name, imageUrl }: { name: string, imageUrl?: string }) {
  const gradient = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c1 = `hsl(${Math.abs(hash) % 360}, 70%, 40%)`;
    const c2 = `hsl(${(Math.abs(hash) + 60) % 360}, 80%, 30%)`;
    const c3 = `hsl(${(Math.abs(hash) + 120) % 360}, 60%, 20%)`;
    
    return `linear-gradient(135deg, ${c1}, ${c2}, ${c3})`;
  }, [name]);

  return (
    <div className="w-full relative sm:rounded-2xl md:rounded-3xl overflow-hidden h-40 sm:h-56 md:h-72 shadow-2xl border-t border-b sm:border border-white/5 bg-[#121226]">
      {imageUrl ? (
        <Image 
          src={imageUrl} 
          alt={`${name} banner`}
          fill
          className="object-cover opacity-80"
          priority
        />
      ) : (
        <div 
          className="absolute inset-0 opacity-80"
          style={{ background: gradient }}
        />
      )}
      {/* Decorative patterns */}
      <div className="absolute inset-0 mix-blend-overlay opacity-30" style={{
         backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.2) 1px, transparent 0)",
         backgroundSize: "32px 32px"
      }} />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#0a0a1a] to-transparent opacity-80" />
    </div>
  );
}
