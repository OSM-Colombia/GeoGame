import React, { useEffect, useState } from 'react';
import { getBestScores } from '../services/osmAuth';
import { fetchCategories } from '../services/categoryService';
import { Category } from '../types';

interface CategoryMenuProps {
  onSelectCategory: (catId: string, categoryName: string) => void;
}

const CategoryMenu: React.FC<CategoryMenuProps> = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [bestScores, setBestScores] = useState<Record<string, { score?: number, time?: number, date?: string }>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const cats = await fetchCategories();
        setCategories(cats);
      } catch (err) {
        setError('No se pudieron cargar las categorías.');
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  useEffect(() => {
    const fetchScores = async () => {
      if (categories.length === 0) return;
      setLoading(true);
      setError(null);
      try {
        const scores = await getBestScores(categories.map(c => c.id));
        setBestScores(scores);
      } catch (err) {
        setError('No se pudieron cargar los puntajes de OSM.');
      } finally {
        setLoading(false);
      }
    };
    fetchScores();
  }, [categories]);

  return (
    <div className="category-menu">
      <h1>GeoGame</h1>
      <h2>Categorías</h2>
      {loading && <p>Cargando categorías y puntajes...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {categories.map(cat => (
          <li key={cat.id} style={{ marginBottom: '1em' }}>
            <button onClick={() => onSelectCategory(cat.id, cat.name)}>
              {cat.name}
            </button>
            <div style={{ fontSize: '0.9em', marginTop: '0.2em' }}>
              <strong>Mejor puntaje:</strong> {bestScores[cat.id]?.score ?? '-'}<br />
              <strong>Tiempo:</strong> {bestScores[cat.id]?.time ?? '-'}<br />
              <strong>Fecha:</strong> {bestScores[cat.id]?.date ? new Date(bestScores[cat.id]!.date!).toLocaleString() : '-'}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryMenu; 