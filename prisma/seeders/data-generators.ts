/**
 * Utility functions for generating realistic dummy data
 */

export function generateEmail(
  firstName: string,
  lastName: string,
  domain: string
): string {
  const cleanFirst = firstName.toLowerCase().replace(/\s+/g, '');
  const cleanLast = lastName.toLowerCase().replace(/\s+/g, '');
  return `${cleanFirst}.${cleanLast}@${domain}`;
}

export function generatePhoneNumber(): string {
  const areaCode = Math.floor(Math.random() * 900) + 100;
  const prefix = Math.floor(Math.random() * 900) + 100;
  const lineNumber = Math.floor(Math.random() * 9000) + 1000;
  return `+1${areaCode}${prefix}${lineNumber}`;
}

export function generateRepoUrl(projectName: string): string {
  const cleanName = projectName.toLowerCase().replace(/\s+/g, '-');
  return `https://github.com/hack4impact/${cleanName}`;
}

export function generatePermissions(roleType: string): object {
  const basePermissions = {
    canViewDashboard: true,
    canEditProfile: true,
  };

  switch (roleType) {
    case 'CHAPTER_MEMBER':
      return {
        ...basePermissions,
        canViewChapter: true,
        canEditChapter: false,
        canManageProjects: false,
        canManageVolunteers: false,
      };
    case 'CHAPTER_LEADERSHIP':
      return {
        ...basePermissions,
        canViewChapter: true,
        canEditChapter: true,
        canManageProjects: true,
        canManageVolunteers: true,
        canApproveBudgets: false,
      };
    case 'OPERATIONS_MEMBER':
      return {
        ...basePermissions,
        canViewAllChapters: true,
        canEditOperations: true,
        canManageSponsors: false,
        canViewReports: true,
      };
    case 'NATIONAL_LEADERSHIP':
      return {
        ...basePermissions,
        canViewAllChapters: true,
        canEditAllChapters: true,
        canManageProjects: true,
        canManageVolunteers: true,
        canApproveBudgets: true,
        canManageSponsors: true,
        canViewReports: true,
        canManageRoles: true,
      };
    default:
      return basePermissions;
  }
}

export function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
}

export function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function randomBoolean(probability: number = 0.5): boolean {
  return Math.random() < probability;
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
