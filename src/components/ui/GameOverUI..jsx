// components/ui/GameOver.jsx
import React, { useState, useEffect } from "react";
import { useShallow } from "zustand/shallow";
import { useGameEffectsStore } from "../../store/gameEffectsStore";
import "./gameover.css";
import { createUser, updateUserScore, getUserById, getAllUsers } from "../../drizzleFunctions"

const GameOver = () => {
  const { gameOver, waveLevel, totalLoot, setGameActive, setControlsEnabled } = useGameEffectsStore(
    useShallow((state) => ({
      gameOver: state.gameOver,
      waveLevel: state.waveLevel,
      totalLoot: state.player.totalLoot,
      setGameActive: state.setGameActive,
      setControlsEnabled: state.setControlsEnabled
    }))
  );

  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(null);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);

  // Calculate score based on wave level
  useEffect(() => {
    if (gameOver) {
      setControlsEnabled(false)
      document.exitPointerLock();
      setScore(totalLoot);
      
      // Check for existing user ID in cookies
      const savedUserId = getCookie("userId");
      if (savedUserId) {
        setUserId(savedUserId);
        getUserById(savedUserId).then(user => {
          if (user && user.length > 0) {
            setUserName(user[0].name);
          }
        }).catch(err => {
          console.error("Error fetching user:", err);
        });
      }
    }
  }, [gameOver, waveLevel, totalLoot]);

  // Helper function to get cookie
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  // Helper function to set cookie
  const setCookie = (name, value, days) => {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value};${expires};path=/`;
  };

  const fetchLeaderboard = async () => {
    setIsLoadingLeaderboard(true);
    try {
      const users = await getAllUsers();
      // Sort by score in descending order
      const sortedUsers = users.sort((a, b) => b.score - a.score);
      setLeaderboard(sortedUsers);
      setShowLeaderboard(true);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      setMessage("Failed to load leaderboard");
    } finally {
      setIsLoadingLeaderboard(false);
    }
  };

  const handleSubmitScore = async () => {
    if (!userName.trim()) {
      setMessage("Please enter a name");
      return;
    }

    setIsSubmitting(true);
    try {
      if (userId) {
        // Update existing user score if higher
        const user = await getUserById(userId);
        if (user && user.length > 0 && score > user[0].score) {
          await updateUserScore(userId, score);
          setMessage("Score updated successfully!");
          fetchLeaderboard();
        } else {
          setMessage("Your previous score was higher!");
          fetchLeaderboard();
        }
      } else {
        // Create new user
        const newUser = await createUser({ name: userName, score });
        if (newUser && newUser.length > 0) {
          setUserId(newUser[0].id);
          setCookie("userId", newUser[0].id, 30); // Store for 30 days
          setMessage("Score submitted successfully!");
          fetchLeaderboard();
        }
      }
    } catch (error) {
      console.error("Error submitting score:", error);
      setMessage("Error submitting score. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePlayAgain = () => {
    setGameActive(false)
  };

  if (!gameOver) return null;

  return (
    <div className="game-over-overlay">
      <div className="game-over-container">
        <h1>Game Over</h1>
        <div className="score-info">
          <p>Waves Survived: <span className="highlight">{waveLevel - 1}</span></p>
          <p>Final Score: <span className="highlight">{score}</span></p>
        </div>
        
        {!showLeaderboard ? (
          <div className="user-form">
            {userId ? (
              <div className="welcome-back">
                <p>Welcome back, {userName}!</p>
                <button 
                  onClick={handleSubmitScore} 
                  disabled={isSubmitting}
                  className="submit-button"
                >
                  {isSubmitting ? "Updating..." : "Update Score"}
                </button>
              </div>
            ) : (
              <div className="register-form">
                <h3>Register Your Score</h3>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="name-input"
                />
                <button 
                  onClick={handleSubmitScore} 
                  disabled={isSubmitting}
                  className="submit-button"
                >
                  {isSubmitting ? "Submitting..." : "Submit Score"}
                </button>
              </div>
            )}
            
            {message && <p className="message">{message}</p>}
          </div>
        ) : (
          <div className="leaderboard">
            <h2>Top Survivors</h2>
            {isLoadingLeaderboard ? (
              <p>Loading leaderboard...</p>
            ) : (
              <div className="leaderboard-list">
                <div className="leaderboard-header">
                  <span className="rank">Rank</span>
                  <span className="name">Name</span>
                  <span className="score">Score</span>
                </div>
                {leaderboard.map((user, index) => (
                  <div 
                    key={user.id} 
                    className={`leaderboard-item ${user.id === parseInt(userId) ? 'current-user' : ''}`}
                  >
                    <span className="rank">{index + 1}</span>
                    <span className="name">{user.name}</span>
                    <span className="score">{user.score}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        <div className="game-actions">
          {showLeaderboard ? (
            <>
              <button onClick={() => setShowLeaderboard(false)} className="back-button">
                Back
              </button>
              <button onClick={handlePlayAgain} className="play-again-button">
                Play Again
              </button>
            </>
          ) : (
            <button onClick={handlePlayAgain} className="play-again-button">
              Play Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameOver;