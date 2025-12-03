import { db } from '../db/client';
import { adapters, type Adapter, type NewAdapter } from '../db/schema/adapters';
import { eq } from 'drizzle-orm';
import { KiroService } from './KiroService';

export class AdapterService {
  private kiroService: KiroService;

  constructor() {
    this.kiroService = new KiroService();
  }

  /**
   * Generate adapter code using Kiro AI (MINIMAL + DYNAMIC)
   */
  private async generateAdapterCode(
    sourceProtocol: string,
    targetProtocol: string,
    config: any
  ): Promise<string> {
    console.log('🔥 Calling Kiro AI for dynamic adapter generation...');

    try {
      const description = config.description || '';
      const sourceEndpoint = config.sourceEndpoint || '';
      const targetEndpoint = config.targetEndpoint || '';
      const examplePayload = config.examplePayload || '';

      // Generate code from Kiro (ONLY the code)
      const generatedCode = await this.kiroService.generateAdapterCode(
        sourceProtocol,
        targetProtocol,
        description,
        sourceEndpoint,
        targetEndpoint,
        examplePayload
      );

      // Return ONLY the AI-generated code — no headers, no metadata
      return generatedCode.trim();

    } catch (error) {
      console.error('❌ Kiro generation failed:', error);
      console.log('⚠️ Falling back to minimal template...');
      return this.generateFallbackAdapter(sourceProtocol, targetProtocol);
    }
  }

  /**
   * Minimal fallback adapter if generation fails
   */
  private generateFallbackAdapter(source: string, target: string): string {
    return `
export async function ${source}To${target}Adapter(payload) {
  return {
    success: false,
    error: "AI generation unavailable. Please try again later."
  };
}
    `.trim();
  }

  /**
   * Create adapter and store generated code
   */
  async createAdapter(data: Omit<NewAdapter, 'id' | 'createdAt' | 'updatedAt'>): Promise<Adapter> {
    console.log('🚀 Creating new adapter...');
    console.log('Protocols:', data.sourceProtocol, '→', data.targetProtocol);

    // Generate clean dynamic code
    const generatedCode = await this.generateAdapterCode(
      data.sourceProtocol,
      data.targetProtocol,
      data.config
    );

    console.log('📝 Final generated code length:', generatedCode.length, 'characters');

    // Save into database
    const [adapter] = await db.insert(adapters).values({
      ...data,
      code: generatedCode
    }).returning();

    console.log('✅ Adapter saved:', adapter.id);
    return adapter;
  }

  /**
   * Fetch single adapter
   */
  async getAdapter(id: string): Promise<Adapter | undefined> {
    return await db.query.adapters.findFirst({
      where: eq(adapters.id, id)
    });
  }

  /**
   * Fetch all adapters for a user
   */
  async listAdapters(userId: string): Promise<Adapter[]> {
    return await db.query.adapters.findMany({
      where: eq(adapters.userId, userId),
      orderBy: (adapters, { desc }) => [desc(adapters.createdAt)]
    });
  }
}
