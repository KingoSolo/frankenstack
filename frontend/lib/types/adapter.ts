import type { Protocol } from './protocol';

// How the user wants to input their config
export type InputMethod = 'documentation' | 'natural-language';

// The configuration data
export interface AdapterConfig {
  inputMethod: InputMethod;
  sourceProtocol: Protocol;
  targetProtocol: Protocol;
  
  // For documentation mode
  sourceEndpoint?: string;
  targetEndpoint?: string;
  
  // For natural language mode
  description?: string;
  
  // Optional: example payload
  examplePayload?: string;
}

// The adapter object returned from backend
export interface Adapter {
  id: string;
  userId: string;
  sourceProtocol: Protocol;
  targetProtocol: Protocol;
  code: string;
  config: AdapterConfig;
  createdAt: string;
  updatedAt: string;
}