import React, { useRef, useEffect } from 'react';
import type { ConversationState } from '../types';

interface AudioVisualizerProps {
  conversationState: ConversationState;
}

const getPoint = (angle: number, radius: number) => {
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    return `${x},${y}`;
};

const createPath = (points: number, radius: number) => {
    let d = `M ${radius},0 `;
    for(let i=1; i<=points; i++) {
        const angle = (i/points) * Math.PI * 2;
        d += `L ${getPoint(angle, radius)} `;
    }
    d += 'Z';
    return d;
};


export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ conversationState }) => {
  const pathsRef = useRef<SVGPathElement[]>([]);
  
  const baseRadius = 100;
  const points = 32;

  useEffect(() => {
    if (pathsRef.current.length > 0) {
        pathsRef.current[0].setAttribute('d', createPath(points, baseRadius));
        pathsRef.current[1].setAttribute('d', createPath(points, baseRadius));
        pathsRef.current[2].setAttribute('d', createPath(points, baseRadius));
    }
  }, []);
  
  const getStateClasses = () => {
      switch (conversationState) {
          case 'speaking':
              return 'scale-110 animate-speak-pulse'; // Pulse for speaking
          case 'connecting':
              return 'scale-95 opacity-70 animate-pulse'; // Standard pulse for connecting
          case 'idle':
          default:
              return 'scale-100 opacity-80'; // Calm and stable when idle
      }
  }

  return (
    <div className={`relative w-72 h-72 flex items-center justify-center transition-all duration-700 ease-in-out ${getStateClasses()}`}>
        <svg viewBox="-150 -150 300 300" className="w-full h-full transform-gpu absolute">
            <defs>
                <filter id="gooey">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
                    <feBlend in="SourceGraphic" in2="goo" />
                </filter>
            </defs>
        </svg>

        <svg viewBox="-150 -150 300 300" className="w-full h-full transform-gpu" style={{ filter: 'url(#gooey)'}}>
           <g className="transition-transform duration-300 ease-out">
             <path 
                ref={el => { if (el) pathsRef.current[0] = el;}}
                fill="#00a9e0" // PEARSON_SKY_BLUE
                opacity="1"
            />
             <path 
                ref={el => { if (el) pathsRef.current[1] = el;}}
                fill="#0056a0" // A slightly darker blue
                opacity="0.7"
                className="transform scale-95"
            />
             <path 
                ref={el => { if (el) pathsRef.current[2] = el;}}
                fill="#002f6c" // PEARSON_BLUE
                opacity="0.5"
                className="transform scale-90"
            />
           </g>
        </svg>
        <style>{`
            @keyframes speak-pulse {
              0%, 100% { transform: scale(1.0); }
              50% { transform: scale(1.05); }
            }
            .animate-speak-pulse {
                animation: speak-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
            }
        `}</style>
    </div>
  );
};