/**
 * Volunteer Service
 *
 * Mock service for volunteer search.
 * Backend endpoint doesn't exist yet - will be replaced with middleware.invoke() call later.
 */

import { Volunteer, VolunteerStatus, VolunteerGender } from '@iris/domain';

// Mock volunteer data for development
const MOCK_VOLUNTEERS: Volunteer[] = [
  {
    id: '1',
    name: 'Ana Silva',
    email: 'ana.silva@example.com',
    birthDate: new Date('1985-03-15'),
    gender: VolunteerGender.FEMALE,
    phone: '+55 11 98765-4321',
    status: VolunteerStatus.ACTIVE,
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '2',
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@example.com',
    birthDate: new Date('1978-07-22'),
    gender: VolunteerGender.MALE,
    phone: '+55 11 98765-1234',
    status: VolunteerStatus.ACTIVE,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: '3',
    name: 'Maria Santos',
    email: 'maria.santos@example.com',
    birthDate: new Date('1992-11-08'),
    gender: VolunteerGender.FEMALE,
    phone: '+55 11 98765-5678',
    status: VolunteerStatus.ACTIVE,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '4',
    name: 'João Ferreira',
    email: 'joao.ferreira@example.com',
    birthDate: new Date('1980-05-30'),
    gender: VolunteerGender.MALE,
    phone: '+55 11 98765-9012',
    status: VolunteerStatus.ACTIVE,
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18'),
  },
  {
    id: '5',
    name: 'Patricia Costa',
    email: 'patricia.costa@example.com',
    birthDate: new Date('1995-09-14'),
    gender: VolunteerGender.FEMALE,
    phone: '+55 11 98765-3456',
    status: VolunteerStatus.ACTIVE,
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '6',
    name: 'Roberto Lima',
    email: 'roberto.lima@example.com',
    birthDate: new Date('1988-12-01'),
    gender: VolunteerGender.MALE,
    phone: '+55 11 98765-7890',
    status: VolunteerStatus.ACTIVE,
    createdAt: new Date('2024-01-22'),
    updatedAt: new Date('2024-01-22'),
  },
  {
    id: '7',
    name: 'Fernanda Souza',
    email: 'fernanda.souza@example.com',
    birthDate: new Date('1983-06-25'),
    gender: VolunteerGender.FEMALE,
    phone: '+55 11 98765-2345',
    status: VolunteerStatus.ACTIVE,
    createdAt: new Date('2024-01-25'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: '8',
    name: 'Eduardo Alves',
    email: 'eduardo.alves@example.com',
    birthDate: new Date('1990-04-17'),
    gender: VolunteerGender.MALE,
    phone: '+55 11 98765-6789',
    status: VolunteerStatus.ACTIVE,
    createdAt: new Date('2024-01-28'),
    updatedAt: new Date('2024-01-28'),
  },
];

interface SearchResult {
  items: Volunteer[];
  totalCount: number;
}

class VolunteerService {
  /**
   * Search volunteers by name or email.
   * Mock implementation - will be replaced with middleware API call.
   */
  async search(query: string, page: number = 0, pageSize: number = 20): Promise<SearchResult> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const normalizedQuery = query.toLowerCase().trim();

    if (!normalizedQuery) {
      // Return all volunteers if no query
      const start = page * pageSize;
      const end = start + pageSize;
      return {
        items: MOCK_VOLUNTEERS.slice(start, end),
        totalCount: MOCK_VOLUNTEERS.length,
      };
    }

    // Filter volunteers by name or email
    const filtered = MOCK_VOLUNTEERS.filter(
      (volunteer) =>
        volunteer.name.toLowerCase().includes(normalizedQuery) ||
        volunteer.email.toLowerCase().includes(normalizedQuery)
    );

    // Apply pagination
    const start = page * pageSize;
    const end = start + pageSize;

    return {
      items: filtered.slice(start, end),
      totalCount: filtered.length,
    };
  }

  /**
   * Get volunteer by ID.
   * Mock implementation - will be replaced with middleware API call.
   */
  async getById(id: string): Promise<Volunteer | null> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 200));

    return MOCK_VOLUNTEERS.find((v) => v.id === id) ?? null;
  }
}

export const volunteerService = new VolunteerService();
