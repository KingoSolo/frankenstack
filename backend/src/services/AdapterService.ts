import { KiroService } from "./KiroService";

export class AdapterService {
  private kiroService: KiroService;

  constructor() {
    this.kiroService = new KiroService();
  }

  async createAdapter(data: {
    userId: string;
    sourceProtocol: string;
    targetProtocol: string;
    description: string;
    payload: any;
    targetEndpoint: string;
  }) {
    const { description, payload } = data;

    // Generate adapter code dynamically using KiroService
    const generatedCode = this.kiroService.generateAdapterCode(description, payload);

    // Here you would save to DB if needed
    const adapter = {
      id: Math.random().toString(36).substring(2, 9),
      ...data,
      code: generatedCode,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log("✅ Adapter created:", adapter.id);

    return adapter;
  }

  async listAdapters(userId: string) {
    // Placeholder: return a demo array
    return [
      { id: "abc123", userId, sourceProtocol: "REST", targetProtocol: "GraphQL", createdAt: new Date() }
    ];
  }
}
