import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { startGame, submitAnswer, endGame } from '../store/gameSlice';
import { RootState } from '../store';
import 'leaflet/dist/leaflet.css';
import '../styles/Game.css';

// Componente para manejar eventos del mapa
const MapEvents: React.FC<{ onMapClick: (lat: number, lng: number) => void }> = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const Game: React.FC = () => {
  const dispatch = useDispatch();
  const { currentGame, questions, currentQuestion, score, isPlaying } = useSelector(
    (state: RootState) => state.game
  );
  const [selectedPosition, setSelectedPosition] = useState<[number, number] | null>(null);
  const [startTime, setStartTime] = useState<number>(0);

  useEffect(() => {
    if (isPlaying) {
      setStartTime(Date.now());
    }
  }, [isPlaying]);

  const handleStartGame = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/game/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ categoryId: 'default' })
      });
      const data = await response.json();
      dispatch(startGame(data));
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedPosition([lat, lng]);
  };

  const handleSubmitAnswer = async () => {
    if (selectedPosition) {
      try {
        const response = await fetch('http://localhost:5000/api/game/answer', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            questionId: questions[currentQuestion].id,
            answer: selectedPosition,
            time: Date.now() - startTime
          })
        });
        const data = await response.json();
        dispatch(submitAnswer(data));
        setSelectedPosition(null);
      } catch (error) {
        console.error('Error submitting answer:', error);
      }
    }
  };

  if (!isPlaying) {
    return (
      <div className="game-container">
        <h1>GeoGame</h1>
        <button onClick={handleStartGame} className="start-button">
          Start Game
        </button>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className="game-header">
        <h2>Question {currentQuestion + 1} of {questions.length}</h2>
        <p>Score: {score}</p>
      </div>
      
      <MapContainer
        center={[0, 0]}
        zoom={2}
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapEvents onMapClick={handleMapClick} />
        {selectedPosition && (
          <Marker position={selectedPosition}>
            <Popup>Your selection</Popup>
          </Marker>
        )}
      </MapContainer>

      <button
        onClick={handleSubmitAnswer}
        disabled={!selectedPosition}
        className="submit-button"
      >
        Submit Answer
      </button>
    </div>
  );
};

export default Game; 