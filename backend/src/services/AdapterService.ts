import { db } from '../db/client';
import { adapters, type Adapter, type NewAdapter } from '../db/schema/adapters';
import { eq } from 'drizzle-orm';

export class AdapterService {
  // Save a new adapter
  async createAdapter(data: Omit<NewAdapter, 'id' | 'createdAt' | 'updatedAt'>): Promise<Adapter> {
    const [adapter] = await db.insert(adapters).values(data).returning();
    return adapter;
  }

  // Get one adapter by ID
  async getAdapter(id: string): Promise<Adapter | undefined> {
    return await db.query.adapters.findFirst({
      where: eq(adapters.id, id)
    });
  }

  // Get all adapters for a user
  async listAdapters(userId: string): Promise<Adapter[]> {
    return await db.query.adapters.findMany({
      where: eq(adapters.userId, userId),
      orderBy: (adapters, { desc }) => [desc(adapters.createdAt)]
    });
  }
}