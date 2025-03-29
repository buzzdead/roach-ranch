// src/components/ResourcesUI.jsx
import React, { useEffect, useState } from 'react';
import { useShallow } from 'zustand/shallow';
import { useGameStore } from '../../store/gameStore';

const ResourcesUI = () => {
  const resources = useGameStore(useShallow((state) => state.player.resources));
  const totalLoot = useGameStore(useShallow((state) => state.player.totalLoot));

  // Animation state for resource changes
  const [animatedResources, setAnimatedResources] = useState({});

  // Update animation when resources change
  useEffect(() => {
    setAnimatedResources(resources);
  }, [resources]);

  return (
    <div
      className="resources-ui"
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(5px)',
        padding: '10px 15px',
        borderRadius: '8px',
        borderLeft: '3px solid #1e90ff',
        color: 'white',
        fontFamily: '"Segoe UI", Roboto, sans-serif',
        fontSize: '14px',
        userSelect: 'none',
        zIndex: 1000,
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        minWidth: '120px',
        textAlign: 'right',
        transition: 'all 0.2s ease-out',
      }}
    >
      <h3
        style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: '#1e90ff',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          paddingBottom: '5px',
        }}
      >
        Inventory
      </h3>

      <div>
        {Object.entries(resources).map(([type, amount]) => (
          <div
            key={type}
            style={{
              margin: '5px 0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontWeight: '400',
                color: 'rgba(255,255,255,0.8)',
                textTransform: 'capitalize',
              }}
            >
              {type}
            </span>
            <span
              style={{
                fontWeight: '600',
                marginLeft: '15px',
                color: '#fff',
                background: 'rgba(30, 144, 255, 0.2)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              {amount}
            </span>
          </div>
        ))}

        {/* Score section */}
        <div
          style={{
            marginTop: '10px',
            paddingTop: '10px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span
            style={{
              fontWeight: '500',
              color: '#ffcc00',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Score
          </span>
          <span
            style={{
              fontWeight: '700',
              marginLeft: '15px',
              color: '#ffcc00',
              background: 'rgba(255, 204, 0, 0.2)',
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            {totalLoot}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ResourcesUI;
