import axios from 'axios';
import { Question, Position } from '../types';

interface OverpassResponse {
  elements: Array<{
    type: string;
    id: number;
    lat?: number;
    lon?: number;
    tags?: Record<string, string>;
    members?: Array<{
      type: string;
      ref: number;
      role: string;
    }>;
    geometry?: Array<{
      lat: number;
      lon: number;
    }>;
  }>;
}

export class OverpassService {
  private endpoint = 'https://overpass-api.de/api/interpreter';
  private timeout = 25000; // 25 segundos

  async query(query: string): Promise<OverpassResponse> {
    try {
      const response = await axios.post<OverpassResponse>(this.endpoint, query, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        timeout: this.timeout
      });
      return response.data;
    } catch (error) {
      console.error('Overpass API error:', error);
      throw new Error('Error al consultar Overpass API');
    }
  }

  async validateAreaQuery(query: string): Promise<boolean> {
    try {
      // Añadir out meta para obtener información completa
      const fullQuery = `${query}out meta;`;
      const response = await this.query(fullQuery);

      // Verificar que hay elementos en la respuesta
      if (!response.elements || response.elements.length === 0) {
        return false;
      }

      // Para relaciones (países), verificar que tiene miembros
      const relation = response.elements.find(e => e.type === 'relation');
      if (relation) {
        if (!relation.members || relation.members.length === 0) {
          return false;
        }
        // Verificar que tiene tags necesarios
        if (!relation.tags || !relation.tags.boundary || !relation.tags['admin_level']) {
          return false;
        }
      }

      // Para nodos o ways, verificar que tienen coordenadas
      const nodeOrWay = response.elements.find(e => e.type === 'node' || e.type === 'way');
      if (nodeOrWay) {
        if (nodeOrWay.type === 'node' && (!nodeOrWay.lat || !nodeOrWay.lon)) {
          return false;
        }
        if (nodeOrWay.type === 'way' && (!nodeOrWay.geometry || nodeOrWay.geometry.length === 0)) {
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error validating area query:', error);
      return false;
    }
  }

  async getAreaCenter(query: string): Promise<Position | null> {
    try {
      const response = await this.query(query);
      
      // Para relaciones (países)
      const relation = response.elements.find(e => e.type === 'relation');
      if (relation && relation.members) {
        // Calcular el centro aproximado usando los miembros
        const memberCoords = relation.members
          .filter(m => m.type === 'node')
          .map(m => {
            const node = response.elements.find(e => e.type === 'node' && e.id === m.ref);
            return node ? { lat: node.lat!, lon: node.lon! } : null;
          })
          .filter((coord): coord is { lat: number; lon: number } => coord !== null);

        if (memberCoords.length > 0) {
          const center = memberCoords.reduce(
            (acc, coord) => ({
              lat: acc.lat + coord.lat / memberCoords.length,
              lon: acc.lon + coord.lon / memberCoords.length
            }),
            { lat: 0, lon: 0 }
          );

          return {
            lat: center.lat,
            lng: center.lon,
            radius: 50000 // Radio por defecto de 50km
          };
        }
      }

      // Para nodos o ways
      const nodeOrWay = response.elements.find(e => e.type === 'node' || e.type === 'way');
      if (nodeOrWay) {
        if (nodeOrWay.type === 'node' && nodeOrWay.lat && nodeOrWay.lon) {
          return {
            lat: nodeOrWay.lat,
            lng: nodeOrWay.lon,
            radius: 50000
          };
        }
        if (nodeOrWay.type === 'way' && nodeOrWay.geometry && nodeOrWay.geometry.length > 0) {
          const center = nodeOrWay.geometry.reduce(
            (acc, point) => ({
              lat: acc.lat + point.lat / nodeOrWay.geometry!.length,
              lon: acc.lon + point.lon / nodeOrWay.geometry!.length
            }),
            { lat: 0, lon: 0 }
          );

          return {
            lat: center.lat,
            lng: center.lon,
            radius: 50000
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting area center:', error);
      return null;
    }
  }

  async validateAndGetArea(query: string): Promise<{ isValid: boolean; center: Position | undefined }> {
    const isValid = await this.validateAreaQuery(query);
    if (!isValid) {
      return { isValid: false, center: undefined };
    }

    const center = await this.getAreaCenter(query);
    return {
      isValid: true,
      center: center || undefined
    };
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
    const question = {
      _id: Math.random().toString(36).substr(2, 9),
      type,
      title: '',
      description: '',
      answer: {
        position: undefined,
        text: undefined,
        multipleChoice: undefined
      },
      source: 'OSM',
      difficulty: 'easy' as const,
      duration: 30,
      hints: [],
      osmTags: [],
      toObject() {
        return { ...this };
      }
    };
    return question;
  }
} 