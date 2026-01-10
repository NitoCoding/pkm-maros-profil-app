// pkm-maros-profil-app\src\libs\utils\responseTransform.ts
import { encodeId } from './hashids';

/**
 * Transform a single object by encoding its 'id' field
 * @param item - Object with an 'id' field
 * @returns New object with encoded 'id'
 */
export function transformId<T extends { id: number | string }>(item: T): T {
  return {
    ...item,
    id: encodeId(item.id),
  };
}

/**
 * Transform an array of objects by encoding their 'id' fields
 * @param items - Array of objects with 'id' fields
 * @returns New array with encoded 'id' fields
 */
export function transformIds<T extends { id: number | string }>(items: T[]): T[] {
  return items.map(item => transformId(item));
}

/**
 * Transform paginated response by encoding IDs in data array
 * @param response - Paginated response object with data array
 * @returns New paginated response with encoded IDs
 */
export function transformPaginatedResponse<T extends { id: number | string }>(
  response: {
    data: T[];
    total?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
    hasMore?: boolean;
    nextCursor?: string | null;
  }
): typeof response {
  return {
    ...response,
    data: transformIds(response.data),
    // Also encode nextCursor if it exists and is numeric
    nextCursor: response.nextCursor ? encodeId(response.nextCursor) : null,
  };
}

/**
 * Transform nested relations by encoding their IDs
 * @param item - Main object
 * @param relations - Array of relation field names to transform
 * @returns New object with encoded IDs in main object and relations
 */
export function transformWithRelations<T extends Record<string, any>>(
  item: T,
  relations: (keyof T)[]
): T {
  const transformed = { ...item } as any;

  // Transform main ID if exists
  if ('id' in transformed) {
    transformed.id = encodeId(transformed.id as number | string);
  }

  // Transform relation IDs
  for (const relation of relations) {
    const relationValue = transformed[relation];
    if (Array.isArray(relationValue)) {
      transformed[relation] = transformIds(relationValue) as T[typeof relation];
    } else if (relationValue && typeof relationValue === 'object' && 'id' in relationValue) {
      transformed[relation] = transformId(relationValue) as T[typeof relation];
    }
  }

  return transformed;
}

/**
 * Safely transform response - handles null/undefined
 * @param data - Data to transform (object, array, or paginated response)
 * @returns Transformed data or original if null/undefined
 */
export function safeTransform<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }

  if (Array.isArray(data)) {
    return (data.length > 0 && 'id' in data[0] ? transformIds(data as any[]) : data) as T;
  }

  if (typeof data === 'object' && 'data' in (data as any)) {
    // Looks like a paginated response
    return transformPaginatedResponse(data as any) as T;
  }

  if ('id' in (data as any)) {
    return transformId(data as any) as T;
  }

  return data;
}
