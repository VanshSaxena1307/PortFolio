import { CaseStudy } from '../types';

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'case-pulse-grid',
    title: 'Pulse Grid: High-Throughput Event Streaming',
    subtitle: 'Distributed Event Routing & Telemetry Fabric',
    role: 'Lead Systems Architect',
    timeline: '2024',
    problem: 'Legacy webhook ingestion and message routing suffered from queue contention and unpredictable spikes under heavy load.',
    solution: 'Engineered a partitioned ingestion worker pool with memory-efficient ring buffers and decoupled async dispatch.',
    architectureNotes: [
      'Partition-aware hashing for ordered processing',
      'Optimistic concurrency control with Redis-backed deduplication',
      'Observability exporter pushing OpenTelemetry metrics',
    ],
    metrics: [
      { label: 'Throughput', value: '45k events/sec' },
      { label: 'P99 Latency', value: '< 12ms' },
      { label: 'Availability', value: '99.98%' },
    ],
    technologies: ['Go', 'Kafka', 'Redis', 'Docker', 'Prometheus'],
    districtId: 'backend-foundry',
  },
  {
    id: 'case-synthetix',
    title: 'Synthetix: Autonomous Multi-Agent Workflows',
    subtitle: 'Goal-driven Agent System with Memory & Tool Reflection',
    role: 'AI / Full Stack Engineer',
    timeline: '2024',
    problem: 'Single-prompt LLM tasks failed when attempting multi-step research, code verification, and tool invocation loops.',
    solution: 'Designed an autonomous multi-agent state graph with explicit planning phases, tool validation, and short/long-term memory.',
    architectureNotes: [
      'Directed acyclic state graph for agent turn orchestrations',
      'Safe sandbox tool executor with timeout guards',
      'Hierarchical context distillation to minimize token overhead',
    ],
    metrics: [
      { label: 'Task Success Rate', value: '89.4%' },
      { label: 'Token Efficiency', value: '+34%' },
      { label: 'Avg Steps / Task', value: '7.2' },
    ],
    technologies: ['TypeScript', 'Python', 'Gemini API', 'ChromaDB'],
    districtId: 'ai-lab',
  },
  {
    id: 'case-canvas-matrix',
    title: 'Canvas Matrix: Real-time 3D Engine for Web',
    subtitle: 'Interactive Hardware-Accelerated Spatial Environment',
    role: 'Creative Developer',
    timeline: '2023 - 2024',
    problem: 'Complex 3D scenes on mobile devices caused severe thermal throttling and frame drops.',
    solution: 'Built custom low-poly instanced mesh batches, dynamic level-of-detail (LOD) shaders, and custom camera culling.',
    architectureNotes: [
      'Instanced buffer geometries reducing draw calls by 80%',
      'Custom vertex shaders for procedural kinetic animation',
      'Dynamic frame pacing adapting to device refresh rate',
    ],
    metrics: [
      { label: 'Frame Rate', value: 'Solid 60 FPS' },
      { label: 'Draw Calls', value: 'Reduced by 80%' },
      { label: 'Load Time', value: '< 1.4s' },
    ],
    technologies: ['Three.js', 'WebGL', 'GLSL', 'React', 'Vite'],
    districtId: 'frontend-plaza',
  },
];
