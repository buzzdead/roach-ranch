// src/MainMenu.jsx
import React from 'react';

const MainMenu = ({ onStartGame }) => {
  const menuStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999
  };
  
  const contentStyle = {
    textAlign: 'center',
    color: '#ff9c50',
    maxWidth: '600px',
    padding: '30px',
    backgroundColor: 'rgba(20, 20, 20, 0.8)',
    borderRadius: '10px',
    boxShadow: '0 0 20px rgba(255, 108, 48, 0.5)'
  };

  const bannerStyle = {
    maxWidth: '100%',
    height: '20vh',
  };
  
  const titleStyle = {
    fontSize: '42px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#ff6830'
  };
  
  const controlsContainerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '30px',
    marginBottom: '30px',
    textAlign: 'left'
  };
  
  const controlsColumnStyle = {
    flex: '1',
    padding: '0 15px'
  };
  
  const controlRowStyle = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '15px'
  };
  
  const keyStyle = {
    display: 'inline-block',
    padding: '8px 12px',
    backgroundColor: '#333',
    borderRadius: '5px',
    color: 'white',
    fontWeight: 'bold',
    minWidth: '20px',
    textAlign: 'center',
    marginRight: '15px',
    boxShadow: '0 3px 0 #222'
  };
  
  const buttonStyle = {
    backgroundColor: '#ff6830',
    color: 'white',
    border: 'none',
    padding: '15px 30px',
    fontSize: '20px',
    fontWeight: 'bold',
    borderRadius: '5px',
    cursor: 'pointer',
    marginBottom: '20px',
    boxShadow: '0 4px 0 #c04b20',
    transition: 'all 0.2s ease'
  };
  
  const buttonHoverStyle = {
    backgroundColor: '#ff824d',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 0 #c04b20'
  };
  
  const [isHovering, setIsHovering] = React.useState(false);
  
  return (
    <div style={menuStyle}>
      <div style={contentStyle}>
      <img src="/banner.webp" style={bannerStyle} alt="Ranch Horror" />
        <h1 style={titleStyle}>RANCH HORROR</h1>
        <p>Survive the night at the abandoned ranch. Beware of mutants.</p>
        
        <div style={controlsContainerStyle}>
          <div style={controlsColumnStyle}>
            <h3>Movement</h3>
            <div style={controlRowStyle}>
              <span style={keyStyle}>W</span>
              <span>Move Forward</span>
            </div>
            <div style={controlRowStyle}>
              <span style={keyStyle}>S</span>
              <span>Move Backward</span>
            </div>
            <div style={controlRowStyle}>
              <span style={keyStyle}>A</span>
              <span>Move Left</span>
            </div>
            <div style={controlRowStyle}>
              <span style={keyStyle}>D</span>
              <span>Move Right</span>
            </div>
            <div style={controlRowStyle}>
              <span style={keyStyle}>SPACE</span>
              <span>Jump</span>
            </div>
          </div>
          
          <div style={controlsColumnStyle}>
            <h3>Actions</h3>
            <div style={controlRowStyle}>
              <span style={keyStyle}>RMB</span>
              <span>Aim Weapon</span>
            </div>
            <div style={controlRowStyle}>
              <span style={keyStyle}>LMB</span>
              <span>Fire Weapon (while aiming)</span>
            </div>
            <div style={controlRowStyle}>
              <span style={keyStyle}>MOUSE</span>
              <span>Look Around</span>
            </div>
          </div>
        </div>
        <button 
          style={{
            ...buttonStyle,
            ...(isHovering ? buttonHoverStyle : {})
          }}
          onClick={onStartGame}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          START GAME
        </button>
        <p>Click to lock cursor. Press ESC to unlock cursor.</p>
        
       
      </div>
    </div>
  );
};

export default MainMenu;