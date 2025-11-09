
import React from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface VideoPlayerProps {
  onBack: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ onBack }) => {
  return (
    <div className="w-full h-full flex items-center justify-center bg-black/80 relative">
      <button onClick={onBack} className="absolute top-6 right-6 text-white bg-black/50 rounded-full p-3 hover:bg-black/70 transition-colors z-20">
        <CloseIcon />
      </button>
      <div className="w-full max-w-4xl aspect-video bg-black shadow-2xl rounded-lg overflow-hidden">
        <iframe 
            className="w-full h-full" 
            src="https://www.youtube.com/embed/w4B4b5ztcaA?autoplay=1&rel=0" 
            title="Pearson PTE Academic" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default VideoPlayer;
