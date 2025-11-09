import React, { useState, useRef, useCallback } from 'react';
import ChatScreen from './components/ChatScreen';
import VideoPlayer from './components/VideoPlayer';
import TicTacToeScreen from './components/TicTacToeScreen';
import type { AppState } from './types';
import { generatePresentationAudio } from './services/geminiService';
import { PRESENTATION_SCRIPT } from './constants';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('welcome');
  const [isConnecting, setIsConnecting] = useState(false);
  const [presentationAudio, setPresentationAudio] = useState<string | null>(null);
  
  const outputAudioContextRef = useRef<AudioContext | null>(null);

  const handleStart = async () => {
    if (isConnecting) return;
    setIsConnecting(true);
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      await audioContext.resume();
      outputAudioContextRef.current = audioContext;

      const audioData = await generatePresentationAudio(PRESENTATION_SCRIPT);
      setPresentationAudio(audioData);
      setAppState('chat');
    } catch (error) {
      console.error("Failed to start presentation:", error);
      alert("An error occurred while preparing the presentation. Please try again.");
    } finally {
      setIsConnecting(false);
    }
  };

  const resetToWelcome = useCallback(async () => {
    setPresentationAudio(null);
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }
    setAppState('welcome');
  }, []);

  const handleStartGame = () => {
    setAppState('tictactoe');
  };

  const renderContent = () => {
    switch (appState) {
      case 'chat':
        if (!presentationAudio || !outputAudioContextRef.current) {
          setAppState('welcome'); 
          return null;
        }
        return <ChatScreen 
          onShowVideo={() => setAppState('video')} 
          onEndSession={resetToWelcome}
          audioData={presentationAudio}
          outputAudioContext={outputAudioContextRef.current} 
          onStartGame={handleStartGame}
        />;
      case 'video':
        return <VideoPlayer onBack={() => setAppState('chat')} />;
      case 'tictactoe':
        return <TicTacToeScreen onGameEnd={resetToWelcome} />;
      case 'welcome':
      default:
        return (
          <div 
            className="w-full h-full cursor-pointer relative overflow-hidden bg-gray-900 flex flex-col items-center p-8"
            onClick={!isConnecting ? handleStart : undefined}
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-[#001e44] via-[#002f6c] to-black animate-gradient-xy"></div>
      
            {/* Main Content */}
            <div className="relative z-10 flex flex-col items-center text-center w-full h-full">
              
              {/* This container grows to fill available space and centers its content */}
              <div className="flex-grow flex flex-col items-center justify-center">
                {/* Pearson Branding */}
                <div className="mb-4">
                  <p className="text-4xl text-white font-light tracking-wider pearson-text-3d">
                    <span className="font-bold">PEARSON</span>
                  </p>
                </div>
      
                {/* Big "PTE" Headline with Gradient */}
                <h1 className="text-9xl md:text-[200px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-200 to-sky-500 animate-text-shine pte-headline-3d" style={{ lineHeight: '1' }}>
                  PTE
                </h1>
      
                {/* Subtitle */}
                <p className="text-2xl md:text-3xl text-white/80 mt-6 font-light tracking-wide subtitle-3d">
                    Pearson Test of English
                </p>
              </div>
      
              {/* This container holds the button at the bottom */}
              <div className="flex-shrink-0 w-full flex justify-center py-8">
                <div className="bg-sky-500/80 text-white text-3xl font-medium tracking-wider px-12 py-6 rounded-full shadow-lg animate-pulse button-3d">
                  {isConnecting ? 'Initializing...' : 'Tap Anywhere to Start'}
                </div>
              </div>
      
            </div>
      
            <style>{`
              @keyframes gradient-xy {
                  0%, 100% { background-size: 200% 200%; background-position: 10% 0%; }
                  50% { background-size: 200% 200%; background-position: 91% 100%; }
              }
              .animate-gradient-xy { animation: gradient-xy 15s ease infinite; }
      
              @keyframes text-shine {
                0% { background-position: 200% center; }
                100% { background-position: -200% center; }
              }
              .animate-text-shine {
                background-size: 200% auto;
                animation: text-shine 5s linear infinite;
              }
      
              .pte-headline-3d {
                text-shadow: 0 8px 25px rgba(0, 169, 224, 0.5);
              }
              .pearson-text-3d, .subtitle-3d {
                text-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
              }
              .button-3d {
                box-shadow: 0 0 25px rgba(0, 169, 224, 0.7), 0 5px 15px rgba(0,0,0,0.3);
              }
            `}</style>
          </div>
        );
    }
  };

  return (
    <div className="w-screen h-screen bg-gray-900 antialiased overflow-hidden">
      {renderContent()}
    </div>
  );
};

export default App;