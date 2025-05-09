import axios from 'axios';
import { Question } from '../types';

export class OverpassService {
  private endpoint = 'https://overpass-api.de/api/interpreter';

  async query(query: string): Promise<any> {
    try {
      const response = await axios.post(this.endpoint, query, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Overpass API error:', error);
      throw error;
    }
  }

  async getMonuments(country: string): Promise<any> {
    const query = `
      [out:json][timeout:25];
      area["name"="${country}"]->.searchArea;
      (
        node["historic"="monument"](area.searchArea);
        way["historic"="monument"](area.searchArea);
        relation["historic"="monument"](area.searchArea);
      );
      out body;
      >;
      out skel qt;
    `;
    return this.query(query);
  }

  async getCities(country: string): Promise<any> {
    const query = `
      [out:json][timeout:25];
      area["name"="${country}"]->.searchArea;
      (
        node["place"="city"](area.searchArea);
        way["place"="city"](area.searchArea);
        relation["place"="city"](area.searchArea);
      );
      out body;
      >;
      out skel qt;
    `;
    return this.query(query);
  }

  convertToQuestion(osmData: any, type: 'position' | 'multiple' | 'text'): Question {
    // Implementar lógica de conversión de datos OSM a preguntas
    return {
      id: Math.random().toString(36).substr(2, 9),
      type,
      title: '',
      answer: null,
      source: 'OSM',
      difficulty: 'easy'
    };
  }
} 