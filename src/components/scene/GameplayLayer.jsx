// components/scene/GameplayLayer.jsx
import React from 'react';
import Player from '../entities/player/Player';
import Game from '../Game';
import EnemiesContainer from '../Enemies';
import Loot from '../Loot';

const GameplayLayer = () => {
  return (
    <>
      <Player />
      <EnemiesContainer />
      <Loot />
      <Game />
    </>
  );
};

export default GameplayLayer;