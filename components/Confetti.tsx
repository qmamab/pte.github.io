import React from 'react';

interface ConfettiProps {
  count?: number;
}

const Confetti: React.FC<ConfettiProps> = ({ count = 100 }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const style: React.CSSProperties = {
          left: `${Math.random() * 100}%`,
          animationDuration: `${Math.random() * 3 + 2}s`,
          animationDelay: `${Math.random() * 2}s`,
          backgroundColor: ['#00a9e0', '#ffffff', '#f0ad4e', '#5cb85c'][Math.floor(Math.random() * 4)],
        };
        return <div key={i} className="confetti-piece" style={style}></div>;
      })}
      <style>{`
        .confetti-piece {
          position: absolute;
          width: 10px;
          height: 30px;
          opacity: 0;
          top: -50px;
          animation-name: drop;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }

        @keyframes drop {
          0% {
            transform: translateY(0) rotateZ(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotateZ(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Confetti;
