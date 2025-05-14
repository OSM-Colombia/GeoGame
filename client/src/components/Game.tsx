import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { startGame, submitAnswer } from '../store/gameSlice';
import { RootState } from '../store';
import { useTranslation } from 'react-i18next';
import 'leaflet/dist/leaflet.css';
import '../styles/Game.css';

// Configuración del ícono de Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

interface MapEventsProps {
  onMapClick: (lat: number, lng: number) => void;
  disabled?: boolean;
}

const MapEvents: React.FC<MapEventsProps> = ({ onMapClick, disabled }) => {
  useMapEvents({
    click: (e) => {
      if (!disabled) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

interface GameProps {
  categoryId: string;
  categoryName: string;
  onBack: () => void;
  // (agrega más props si es necesario)
}

const Game: React.FC<GameProps> = (props) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const {
    currentGame,
    questions,
    currentQuestion,
    score,
    isPlaying,
    isGameOver,
    currentCategory
  } = useSelector((state: RootState) => state.game);
  
  const [selectedAnswer, setSelectedAnswer] = useState<any>(null);
  const [currentAnswerText, setCurrentAnswerText] = useState<string>(''); // Para preguntas de texto
  const [startTime, setStartTime] = useState<number>(0);
  const [hintsUsed, setHintsUsed] = useState<string[]>([]);
  const [finalScore, setFinalScore] = useState<number>(0);
  const { categoryId, categoryName, onBack } = props;
  const [totalTime, setTotalTime] = useState<number>(0);
  const [currentQuestionAttempts, setCurrentQuestionAttempts] = useState<number>(0);

  const currentQuestionObject = questions && currentQuestion !== null && currentQuestion < questions.length ? questions[currentQuestion] : null;

  useEffect(() => {
    // Iniciar juego, cargar categoría y preguntas etc.
    // dispatch(fetchCategoryDetails(categoryId)); // Ejemplo
    // dispatch(startGameAction({ categoryId })); // Ejemplo de acción para iniciar
    setStartTime(Date.now());
    setSelectedAnswer(null);
    setCurrentAnswerText('');
    setHintsUsed([]);
    setCurrentQuestionAttempts(0);
  }, [isPlaying, currentQuestion, categoryId, dispatch]);

  useEffect(() => {
    if (isGameOver && currentGame) {
      setFinalScore(score); // score ya debería ser el final del store
      setTotalTime(Math.floor((Date.now() - (currentGame.startTime || startTime)) / 1000));
    }
  }, [isGameOver, score, currentGame, startTime]);

  const handleStartGame = async () => {
    // Esta lógica probablemente se mueva a un thunk/action de Redux
    // Por ahora, asumimos que las preguntas se cargan al seleccionar categoría
    // y el juego "comienza" cuando isPlaying es true y currentQuestion (índice) es 0.
    dispatch(startGame({ categoryId, questions: [] /* Cargar preguntas aquí o en una acción */ }));
    setCurrentQuestionAttempts(0);
  };

  const handleMapClick = (lat: number, lng: number) => {
    if (currentQuestionObject?.type === 'position') {
      setSelectedAnswer({ lat, lng });
      // Para preguntas de posición, los intentos no se suelen contar de la misma manera
    }
  };

  const handleMultipleChoice = (index: number) => {
    if (currentQuestionObject?.type === 'multiple') {
      setSelectedAnswer(index);
      setCurrentQuestionAttempts(prev => prev + 1); // Incrementar en cada selección
    }
  };

  const handleTextAnswerChange = (text: string) => {
    if (currentQuestionObject?.type === 'text') {
      setCurrentAnswerText(text);
      // Los intentos para texto se manejan diferente (basado en Levenshtein al enviar)
      // Podríamos contar los envíos si permitimos reenviar, pero el modelo actual es un solo envío.
      // Si quisiéramos contar "intentos" como cada vez que el usuario cambia el texto ANTES de enviar,
      // podríamos hacerlo, pero no es lo estándar para la penalización por Levenshtein.
      // setCurrentQuestionAttempts(prev => prev + 1); // Opcional: si cada cambio cuenta como intento
    }
  };

  const handleUseHint = () => {
    if (currentQuestionObject && currentQuestionObject.hints && currentQuestionObject.hints.length > hintsUsed.length) {
      // Lógica para seleccionar la siguiente pista no usada
      const nextHint = currentQuestionObject.hints[hintsUsed.length];
      if (nextHint) {
        setHintsUsed(prev => [...prev, nextHint._id]);
        // El backend aplicará la penalización basada en hintsUsed.length o los IDs
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestionObject) {
        alert(t('noQuestionLoaded')); // O un error más descriptivo
        return;
    }
    if (!currentGame?.id) {
        console.error("Game ID is missing");
        return;
    }

    let answerPayload = currentQuestionObject.type === 'text' ? currentAnswerText : selectedAnswer;

    const payload = {
      gameId: currentGame.id,
      questionId: currentQuestionObject._id, // Usar el _id de la pregunta del tipo Question
      answer: answerPayload,
      timeTaken: Math.floor((Date.now() - startTime) / 1000), // Tiempo por pregunta
      hintsUsed: hintsUsed.map(id => ({ hintId: id, penalty: 0 /* El backend calcula la penalización */ })),
      attempts: currentQuestionObject.type === 'multiple' ? currentQuestionAttempts : 1 // Enviar intentos para opción múltiple
    };

    // Reiniciar startTime para la siguiente pregunta DESPUÉS de enviar la actual
    setStartTime(Date.now());

    try {
      // Reemplazar con dispatch(submitAnswerAction(payload));
      const response = await fetch('http://localhost:5000/api/game/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error submitting answer');
      
      dispatch(submitAnswer(data)); // El reducer actualizará score, currentQuestionIndex, isGameOver etc.
      
      // Resetear para la siguiente pregunta (si el juego no ha terminado)
      if (!data.isGameOver) {
          setSelectedAnswer(null);
          setCurrentAnswerText('');
          setHintsUsed([]);
          setCurrentQuestionAttempts(0);
      }

    } catch (error) {
      console.error('Error submitting answer:', error);
      alert(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  if (isGameOver) {
    return (
      <div className="game-container game-over-container">
        <h2>{t('gameOverTitle')}</h2>
        <p>{t('finalScore', { score: finalScore })}</p>
        <p>{t('totalTime', { time: totalTime })} segundos</p>
        {/* Aquí iría SocialShareButtons y el botón para volver */} 
        <button onClick={onBack} className="button-secondary">{t('backToCategories')}</button>
      </div>
    );
  }

  if (!isPlaying || !currentQuestionObject) {
    return (
      <div className="game-container">
        {/* Podría ser un loader o la pantalla de inicio de categoría */} 
        <h1>{categoryName || t('loading')}</h1>
        <p>{t('getReady')}</p>
        <button onClick={handleStartGame} className="start-button">
          {currentCategory ? t('startGame') : t('loading')}
        </button>
        <button onClick={onBack} className="button-secondary" style={{marginTop: '10px'}}>{t('back')}</button>
      </div>
    );
  }
  
  // Lógica para mostrar la pregunta actual (renderQuestion)
  // ...

  // Ejemplo de cómo se vería la sección de renderizado de pregunta (simplificado):
  const renderCurrentQuestion = () => {
    if (!currentQuestionObject) return <p>{t('loadingQuestion')}</p>;

    return (
        <div>
            <h2>{currentQuestionObject.title}</h2>
            <p>{currentQuestionObject.description}</p>
            {currentQuestionObject.image && <img src={currentQuestionObject.image} alt={currentQuestionObject.title} className="question-image" />}

            {currentQuestionObject.type === 'position' && (
                <MapContainer center={[0,0]} zoom={2} style={{ height: '400px' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapEvents onMapClick={handleMapClick} disabled={!!selectedAnswer} />
                    {selectedAnswer && <Marker position={[selectedAnswer.lat, selectedAnswer.lng]} />} 
                </MapContainer>
            )}

            {currentQuestionObject.type === 'multiple' && currentQuestionObject.options && (
                <div className="options-container">
                    {currentQuestionObject.options.map((option, index) => (
                        <button 
                            key={index}
                            onClick={() => handleMultipleChoice(index)} 
                            className={`option-button ${selectedAnswer === index ? 'selected' : ''}`}
                            disabled={selectedAnswer !== null && selectedAnswer !== index} // Opcional: deshabilitar otras opciones una vez seleccionada una antes de enviar
                        >
                            {option.text}
                        </button>
                    ))}
                </div>
            )}

            {currentQuestionObject.type === 'text' && (
                <input 
                    type="text" 
                    value={currentAnswerText} 
                    onChange={(e) => handleTextAnswerChange(e.target.value)} 
                    placeholder={t('enterAnswer')} 
                    className="text-input"
                />
            )}
            
            {/* Pistas */}
            {currentQuestionObject.hints && currentQuestionObject.hints.length > 0 && hintsUsed.length < currentQuestionObject.hints.length && (
                <button onClick={handleUseHint} className="hint-button">{t('useHint')}</button>
            )}
            {hintsUsed.map(hintId => {
                const hint = currentQuestionObject.hints.find(h => h._id === hintId);
                return hint ? <p key={hintId} className="hint-text"><em>{t('hint')}: {hint.text} (-{hint.penalty} {t('points')})</em></p> : null;
            })}

            <button 
                onClick={handleSubmitAnswer} 
                className="submit-button" 
                disabled={ 
                    (currentQuestionObject.type !== 'text' && selectedAnswer === null) || 
                    (currentQuestionObject.type === 'text' && currentAnswerText.trim() === '')
                }
            >
                {t('submitAnswer')}
            </button>
        </div>
    );
  };

  return (
    <div className="game-container">
        <h1>{currentCategory?.name || categoryName}</h1>
        <div className="game-info">
            <p>{t('score')}: {score}</p>
            <p>{t('question')} {currentQuestion !== null ? currentQuestion + 1 : 0} / {questions.length}</p>
        </div>
        {renderCurrentQuestion()}
        <button onClick={onBack} className="button-secondary button-quit-game">{t('quitGame')}</button>
    </div>
  );

};

export default Game; 