/**
 * Tests for useProjetPermissions hook
 *
 * To run these tests, install vitest:
 * npm install --save-dev vitest @testing-library/react @testing-library/react-hooks
 *
 * Then add to package.json scripts:
 * "test": "vitest"
 */

import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useProjetPermissions } from '../useProjetPermissions';

describe('useProjetPermissions', () => {
  const mockProjet = {
    id: 1,
    titre: 'Test Project',
    created_by: 2,
    chef_projet: 3,
    pole: 1,
  };

  it('should return no permissions for null user', () => {
    const { result } = renderHook(() => useProjetPermissions(null, mockProjet));

    expect(result.current.canChangeStatut).toBe(false);
    expect(result.current.canManageMembres).toBe(false);
    expect(result.current.canEditProjet).toBe(false);
    expect(result.current.canDeleteProjet).toBe(false);
  });

  it('should grant all permissions to super_admin', () => {
    const superAdmin = { id: 1, role: 'super_admin' };
    const { result } = renderHook(() => useProjetPermissions(superAdmin, mockProjet));

    expect(result.current.canChangeStatut).toBe(true);
    expect(result.current.canManageMembres).toBe(true);
    expect(result.current.canEditProjet).toBe(true);
    expect(result.current.canDeleteProjet).toBe(true);
    expect(result.current.isSuperAdmin).toBe(true);
  });

  it('should grant permissions to admin', () => {
    const admin = { id: 1, role: 'admin' };
    const { result } = renderHook(() => useProjetPermissions(admin, mockProjet));

    expect(result.current.canChangeStatut).toBe(true);
    expect(result.current.canManageMembres).toBe(true);
    expect(result.current.canEditProjet).toBe(true);
    expect(result.current.canDeleteProjet).toBe(false); // Only super_admin can delete
    expect(result.current.isAdmin).toBe(true);
  });

  it('should grant permissions to project creator', () => {
    const creator = { id: 2, role: 'membre' };
    const { result } = renderHook(() => useProjetPermissions(creator, mockProjet));

    expect(result.current.canChangeStatut).toBe(true);
    expect(result.current.canEditProjet).toBe(true);
    expect(result.current.isCreator).toBe(true);
  });

  it('should grant limited permissions to chef_projet', () => {
    const chefProjet = { id: 3, role: 'membre' };
    const { result } = renderHook(() => useProjetPermissions(chefProjet, mockProjet));

    expect(result.current.canChangeStatut).toBe(true);
    expect(result.current.canManageMembres).toBe(true);
    expect(result.current.canEditProjet).toBe(false); // Chef projet cannot edit, only manage
    expect(result.current.isChefProjet).toBe(true);
    expect(result.current.availableStatuts).toEqual(['en_revision', 'termine', 'annule']);
  });

  it('should grant permissions to chef_pole for their pole projects', () => {
    const chefPole = { id: 4, role: 'chef_pole', pole: 1 };
    const { result } = renderHook(() => useProjetPermissions(chefPole, mockProjet));

    expect(result.current.canChangeStatut).toBe(true);
    expect(result.current.canManageMembres).toBe(true);
    expect(result.current.canEditProjet).toBe(true);
    expect(result.current.isChefPole).toBe(true);
  });

  it('should deny permissions to regular member', () => {
    const member = { id: 5, role: 'membre' };
    const { result } = renderHook(() => useProjetPermissions(member, mockProjet));

    expect(result.current.canChangeStatut).toBe(false);
    expect(result.current.canManageMembres).toBe(false);
    expect(result.current.canEditProjet).toBe(false);
    expect(result.current.canDeleteProjet).toBe(false);
  });
});
