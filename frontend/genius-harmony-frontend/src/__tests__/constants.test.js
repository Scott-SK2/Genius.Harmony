/**
 * Tests for constants
 *
 * To run these tests, install vitest:
 * npm install --save-dev vitest
 *
 * Then add to package.json scripts:
 * "test": "vitest"
 */

import { describe, it, expect } from 'vitest';
import {
  TYPE_LABELS,
  STATUT_LABELS,
  TACHE_STATUT_LABELS,
  TACHE_PRIORITE_LABELS,
  STATUT_COLORS,
  PRIORITE_COLORS,
} from '../constants';

describe('Constants', () => {
  describe('TYPE_LABELS', () => {
    it('should have all project types', () => {
      expect(TYPE_LABELS).toHaveProperty('film');
      expect(TYPE_LABELS).toHaveProperty('court_metrage');
      expect(TYPE_LABELS).toHaveProperty('web_serie');
      expect(TYPE_LABELS).toHaveProperty('event');
      expect(TYPE_LABELS).toHaveProperty('musique');
      expect(TYPE_LABELS).toHaveProperty('autre');
    });

    it('should have proper labels', () => {
      expect(TYPE_LABELS.film).toBe('Film');
      expect(TYPE_LABELS.court_metrage).toBe('Court métrage');
    });
  });

  describe('STATUT_LABELS', () => {
    it('should have all project statuses', () => {
      expect(STATUT_LABELS).toHaveProperty('brouillon');
      expect(STATUT_LABELS).toHaveProperty('en_attente');
      expect(STATUT_LABELS).toHaveProperty('en_cours');
      expect(STATUT_LABELS).toHaveProperty('en_revision');
      expect(STATUT_LABELS).toHaveProperty('termine');
      expect(STATUT_LABELS).toHaveProperty('annule');
    });

    it('should have corresponding colors', () => {
      Object.keys(STATUT_LABELS).forEach(key => {
        expect(STATUT_COLORS).toHaveProperty(key);
        expect(STATUT_COLORS[key]).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });

  describe('TACHE_STATUT_LABELS', () => {
    it('should have all task statuses', () => {
      expect(TACHE_STATUT_LABELS).toHaveProperty('a_faire');
      expect(TACHE_STATUT_LABELS).toHaveProperty('en_cours');
      expect(TACHE_STATUT_LABELS).toHaveProperty('termine');
    });
  });

  describe('TACHE_PRIORITE_LABELS', () => {
    it('should have all priority levels', () => {
      expect(TACHE_PRIORITE_LABELS).toHaveProperty('basse');
      expect(TACHE_PRIORITE_LABELS).toHaveProperty('normale');
      expect(TACHE_PRIORITE_LABELS).toHaveProperty('haute');
      expect(TACHE_PRIORITE_LABELS).toHaveProperty('urgente');
    });

    it('should have corresponding colors', () => {
      Object.keys(TACHE_PRIORITE_LABELS).forEach(key => {
        expect(PRIORITE_COLORS).toHaveProperty(key);
        expect(PRIORITE_COLORS[key]).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });
  });
});
