import React, { useState } from 'react';
import Game from './components/Game';
import CategoryMenu from './components/CategoryMenu';
import './App.css';

function App() {
  const [selectedCategory, setSelectedCategory] = useState<{ catId: string; name: string } | null>(null);

  return (
    <div className="App">
      {selectedCategory ? (
        <Game categoryId={selectedCategory.catId} categoryName={selectedCategory.name} onBack={() => setSelectedCategory(null)} />
      ) : (
        <CategoryMenu onSelectCategory={(catId, name) => setSelectedCategory({ catId, name })} />
      )}
    </div>
  );
}

export default App;
