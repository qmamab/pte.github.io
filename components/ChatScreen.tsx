import React, { useState, useEffect, useRef, useCallback } from 'react';
import { decode, decodeAudioData } from '../utils/audioUtils';
import { VideoIcon } from './icons/VideoIcon';
import { EndCallIcon } from './icons/EndCallIcon';
import { AudioVisualizer } from './AudioVisualizer';
import type { ConversationState } from '../types';

interface ChatScreenProps {
  onShowVideo: () => void;
  onEndSession: () => void;
  audioData: string;
  outputAudioContext: AudioContext;
  onStartGame: () => void;
}

const ChatScreen: React.FC<ChatScreenProps> = ({ onShowVideo, onEndSession, audioData, outputAudioContext, onStartGame }) => {
  const [conversationState, setConversationState] = useState<ConversationState>('speaking');
  const [showPostPresentationOptions, setShowPostPresentationOptions] = useState(false);

  const inactivityTimeoutRef = useRef<number | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const resetInactivityTimeout = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    inactivityTimeoutRef.current = window.setTimeout(() => {
      onEndSession();
    }, 20000); // 20 seconds of inactivity
  }, [onEndSession]);

  const playAudio = useCallback(async (base64EncodedAudioString: string) => {
    try {
      const audioBuffer = await decodeAudioData(decode(base64EncodedAudioString), outputAudioContext, 24000, 1);
      const source = outputAudioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(outputAudioContext.destination);
      
      source.addEventListener('ended', () => {
        setConversationState('idle');
        setShowPostPresentationOptions(true);
        resetInactivityTimeout();
        audioSourceRef.current = null;
      });
      
      source.start();
      audioSourceRef.current = source;
    } catch (error) {
        console.error("Error playing audio:", error);
        onEndSession(); // Go back to welcome screen if audio fails to play
    }
  }, [outputAudioContext, resetInactivityTimeout, onEndSession]);
  
  useEffect(() => {
    playAudio(audioData);

    return () => {
      if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
        audioSourceRef.current.disconnect();
      }
    };
  }, [audioData, playAudio]);


  const getStatusText = () => {
    switch(conversationState) {
        case 'speaking': return 'PTEBot is Presenting...';
        case 'idle': return 'What would you like to do next?';
        case 'connecting':
        default: return 'Loading Presentation...';
    }
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative p-6 bg-gradient-to-br from-gray-900 via-[#001e44] to-black animate-gradient-xy">
       <style>{`
            @keyframes gradient-xy {
                0%, 100% { background-size: 400% 400%; background-position: 10% 0%; }
                50% { background-size: 400% 400%; background-position: 91% 100%; }
            }
            .animate-gradient-xy { animation: gradient-xy 15s ease infinite; }

            @keyframes fade-in {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        `}</style>

      <div className="absolute top-6 left-6 z-10">
          <button onClick={onEndSession} className="text-white hover:text-red-500 transition-colors p-3 rounded-full hover:bg-white/10">
              <EndCallIcon />
          </button>
      </div>
      <div className="absolute top-6 right-6 z-10">
          <button onClick={onShowVideo} className="text-white hover:text-sky-400 transition-colors p-3 rounded-full hover:bg-white/10">
              <VideoIcon />
          </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center w-full">
         <AudioVisualizer conversationState={conversationState} />
         <p className="text-white/70 mt-8 text-2xl font-medium tracking-wide capitalize h-8">
           {getStatusText()}
         </p>
      </div>
      
      {showPostPresentationOptions && (
        <div className="absolute bottom-16 left-0 right-0 flex justify-center items-center gap-8 animate-fade-in">
            <button
                onClick={() => {
                    if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
                    onStartGame();
                }}
                className="bg-sky-500/90 text-white text-2xl font-medium tracking-wider px-10 py-5 rounded-full shadow-lg hover:bg-sky-500 transition-transform hover:scale-105"
            >
                Play Tic-Tac-Toe
            </button>
            <button
                onClick={() => {
                    if (inactivityTimeoutRef.current) clearTimeout(inactivityTimeoutRef.current);
                    onShowVideo();
                }}
                className="bg-white/90 text-sky-800 text-2xl font-medium tracking-wider px-10 py-5 rounded-full shadow-lg hover:bg-white transition-transform hover:scale-105"
            >
                Watch Promo Video
            </button>
        </div>
      )}
    </div>
  );
};

export default ChatScreen;