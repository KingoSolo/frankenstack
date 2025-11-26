// The 5 protocols we support
export type Protocol = 'REST' | 'GraphQL' | 'gRPC' | 'SOAP' | 'WebSocket';

// Information about each protocol
export interface ProtocolInfo {
  id: Protocol;
  name: string;
  description: string;
  icon: string; // We'll use emoji for now
  color: string; // Tailwind color class
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

// All protocol metadata
export const PROTOCOLS: Record<Protocol, ProtocolInfo> = {
  REST: {
    id: 'REST',
    name: 'REST',
    description: 'Traditional JSON APIs',
    icon: '🌐',
    color: 'from-blue-500 to-cyan-500',
    difficulty: 'Easy'
  },
  GraphQL: {
    id: 'GraphQL',
    name: 'GraphQL',
    description: 'Flexible query language',
    icon: '⚡',
    color: 'from-pink-500 to-purple-500',
    difficulty: 'Medium'
  },
  gRPC: {
    id: 'gRPC',
    name: 'gRPC',
    description: 'High-performance RPC',
    icon: '🚀',
    color: 'from-green-500 to-teal-500',
    difficulty: 'Hard'
  },
  SOAP: {
    id: 'SOAP',
    name: 'SOAP',
    description: 'Legacy XML protocol',
    icon: '📜',
    color: 'from-orange-500 to-red-500',
    difficulty: 'Hard'
  },
  WebSocket: {
    id: 'WebSocket',
    name: 'WebSocket',
    description: 'Real-time two-way',
    icon: '💬',
    color: 'from-yellow-500 to-orange-500',
    difficulty: 'Medium'
  }
};