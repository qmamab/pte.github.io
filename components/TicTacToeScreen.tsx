import React, { useState, useEffect } from 'react';
import Confetti from './Confetti';

interface TicTacToeScreenProps {
    onGameEnd: () => void;
}

type Player = 'X' | 'O' | null;
const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6],             // diagonals
];

const TicTacToeScreen: React.FC<TicTacToeScreenProps> = ({ onGameEnd }) => {
    const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
    const [isPlayerTurn, setIsPlayerTurn] = useState(true);
    const [winner, setWinner] = useState<Player>(null);
    const [isDraw, setIsDraw] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);

    const checkWinner = (currentBoard: Player[]): Player => {
        for (const combination of WINNING_COMBINATIONS) {
            const [a, b, c] = combination;
            if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
                return currentBoard[a];
            }
        }
        return null;
    };
    
    useEffect(() => {
        if (winner || isDraw) {
            if (winner === 'X') {
                setShowCelebration(true);
            }
            const timer = setTimeout(() => {
                onGameEnd();
            }, 4000); // Wait 4 seconds before ending
            return () => clearTimeout(timer);
        }

        if (!isPlayerTurn) {
            const timer = setTimeout(() => {
                aiMove();
            }, 500); // AI "thinks" for 0.5s
            return () => clearTimeout(timer);
        }
    }, [isPlayerTurn, winner, isDraw, onGameEnd]);

    const handlePlayerMove = (index: number) => {
        if (board[index] || winner || !isPlayerTurn) return;

        const newBoard = [...board];
        newBoard[index] = 'X';
        setBoard(newBoard);

        const newWinner = checkWinner(newBoard);
        if (newWinner) {
            setWinner(newWinner);
        } else if (!newBoard.includes(null)) {
            setIsDraw(true);
        } else {
            setIsPlayerTurn(false);
        }
    };

    const aiMove = () => {
        let bestMove = -1;
        const newBoard = [...board];

        // 1. Check if AI can win
        for(let i=0; i<9; i++){
            if(!newBoard[i]){
                newBoard[i] = 'O';
                if(checkWinner(newBoard) === 'O'){
                    bestMove = i;
                    break;
                }
                newBoard[i] = null;
            }
        }

        // 2. Check if player can win and block
        if(bestMove === -1){
            for(let i=0; i<9; i++){
                if(!newBoard[i]){
                    newBoard[i] = 'X';
                    if(checkWinner(newBoard) === 'X'){
                        bestMove = i;
                        newBoard[i] = null; // revert check
                        break;
                    }
                    newBoard[i] = null;
                }
            }
        }

        // 3. Take center if available
        if(bestMove === -1 && !newBoard[4]){
            bestMove = 4;
        }

        // 4. Take a random available corner
        if(bestMove === -1){
            const corners = [0, 2, 6, 8].filter(i => !newBoard[i]);
            if(corners.length > 0){
                bestMove = corners[Math.floor(Math.random() * corners.length)];
            }
        }

        // 5. Take any remaining spot
        if(bestMove === -1){
            const available = board.map((v, i) => v === null ? i : -1).filter(i => i !== -1);
            bestMove = available[Math.floor(Math.random() * available.length)];
        }
        
        if (bestMove !== -1) {
            newBoard[bestMove] = 'O';
            setBoard(newBoard);
            const newWinner = checkWinner(newBoard);
            if (newWinner) {
                setWinner(newWinner);
            } else if (!newBoard.includes(null)) {
                setIsDraw(true);
            } else {
                setIsPlayerTurn(true);
            }
        }
    };
    
    const getStatusMessage = () => {
        if (winner === 'X') return 'You Win!';
        if (winner === 'O') return 'PTEBot Wins!';
        if (isDraw) return "It's a Draw!";
        return isPlayerTurn ? "Your Turn (X)" : "PTEBot's Turn (O)";
    };

    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white relative">
            {showCelebration && <Confetti />}
            <h1 className="text-5xl font-bold mb-4">Tic-Tac-Toe</h1>
            <p className="text-2xl mb-8 h-8">{getStatusMessage()}</p>
            <div className="grid grid-cols-3 gap-4">
                {board.map((value, index) => (
                    <button 
                        key={index}
                        className="w-24 h-24 md:w-32 md:h-32 bg-sky-800 rounded-lg text-6xl font-bold flex items-center justify-center transition-colors hover:bg-sky-700 disabled:cursor-not-allowed"
                        onClick={() => handlePlayerMove(index)}
                        disabled={!!value || !!winner || !isPlayerTurn}
                    >
                        {value}
                    </button>
                ))}
            </div>
            {showCelebration && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-40">
                    <div className="bg-white text-gray-900 p-8 rounded-xl shadow-2xl text-center">
                        <h2 className="text-4xl font-bold text-sky-600 mb-2">Congratulations!</h2>
                        <p className="text-xl">You've won a Pearson PTE stress ball!</p>
                        <p className="text-lg mt-4">Please collect your prize below.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicTacToeScreen;
