export const projects = [
  {
    index: '01',
    title: 'Pictor Network',
    label: 'Decentralized 3D rendering + on-demand GPU compute for AI',
    href: 'https://pictor.network/',
    challenge: 'Unify community GPUs and professional render farms for 3D rendering, while providing cost-effective, on-demand GPU capacity for AI workloads.',
    role: 'I owned the full-stack product and AWS infrastructure, from the web client and Electron worker app to render orchestration, GPU provisioning, cost tracking, observability, and notifications.',
    architecture: 'React powers the web client, while Laravel and NestJS orchestrate jobs, workers, GPU instances, and AWS resources. PostgreSQL persists operational state, object storage handles assets and outputs, real-time services stream job updates, and Aptos supports on-chain settlement.',
    outcome: {
      value: '02',
      label: 'Core GPU workflows unified on one platform',
      note: 'Distributed 3D rendering · On-demand AI compute',
    },
    tags: ['React + Electron', 'Laravel + NestJS', 'PostgreSQL', 'AWS Infrastructure', 'Aptos'],
  },
  {
    index: '02',
    title: 'Blender Agent',
    label: 'Desktop AI agent for creating and editing Blender scenes',
    href: 'https://blender-agent.com/',
    challenge: '3D artists lose time switching between Blender, scripts, and disconnected AI tools. The challenge was turning natural-language intent into reliable, visible actions inside an existing scene.',
    role: 'I owned the full-stack product, customizing OpenWork into a Blender-focused desktop agent. I built the Next.js platform, Railway infrastructure, Blender integration, reusable skills, and external 3D provider integrations.',
    architecture: 'A customized OpenWork client runs agent sessions and Blender actions through a local MCP connector. One Railway-hosted Next.js service powers the homepage and backend, handling authentication, subscriptions, quotas, model routing, and Tripo; PostgreSQL persists product data.',
    outcome: {
      value: 'E2E',
      label: 'From natural-language prompts to editable Blender scenes',
      note: 'Plan · Execute · Refine',
    },
    tags: ['Next.js', 'PostgreSQL', 'OpenWork Desktop', 'Blender MCP', 'Railway + Tripo'],
  },
]

export const experience = [
  {
    period: '12.2025 — NOW',
    company: 'Pictor Lab',
    role: 'Fullstack Developer',
    detail: 'Own the full-stack product and cloud infrastructure for Pictor Network and Blender Agent, covering decentralized render orchestration, multi-provider GPU rental, Aptos-connected payments, and AI-assisted Blender workflows.',
    tags: ['React + Electron', 'Laravel + NestJS', 'Next.js', 'AWS', 'Aptos'],
  },
  {
    period: '09.2024 — 11.2025',
    company: 'Irender',
    role: 'Fullstack Developer',
    detail: 'Built the Rynus Mini App with React.js, C#, and SQL Server, then moved to Pictor and helped develop the product before it spun out as an independent company.',
    tags: ['React.js', 'C#', 'SQL Server'],
  },
  {
    period: '05.2024 — 08.2024',
    company: 'Kite Learning',
    role: 'Fullstack Developer',
    detail: 'Built a React.js and Laravel learning platform with a Flutter mobile app, backed by MySQL and AWS infrastructure, including OpenAI-powered evaluation and personalized learning paths.',
    tags: ['React.js', 'Laravel', 'Flutter', 'MySQL', 'AWS'],
  },
  {
    period: '05.2023 — 04.2024',
    company: 'WEGOTT',
    role: 'Fullstack Developer',
    detail: 'Built Remote Workstation, a Laravel and Vue.js platform for provisioning Alibaba Cloud GPU instances, backed by MySQL. Earned an Alibaba Cloud certification while delivering the project.',
    tags: ['Laravel', 'Vue.js', 'MySQL', 'Alibaba Cloud'],
  },
  {
    period: '08.2020 — 04.2023',
    company: '3S Cloud Render Farm',
    role: 'Fullstack Developer',
    detail: 'Built AWS-based rendering management systems, job scheduling, resource allocation, and monitoring dashboards.',
    tags: ['Laravel', 'Vue.js', 'Electron.js', 'MySQL', 'AWS'],
  },
  {
    period: '11.2019 — 05.2020',
    company: 'Supperender Farm',
    role: 'Web Developer',
    detail: 'Developed production web modules with Laravel and Vue.js across backend and frontend surfaces.',
    tags: ['Laravel', 'Vue.js', 'MySQL'],
  },
]

export const skillGroups = [
  { label: 'Backend', scope: 'Systems / APIs', values: ['Laravel', 'Node.js', 'Express', 'NestJS', 'REST API', 'WebSocket', 'Queue systems'] },
  { label: 'Frontend', scope: 'Product surfaces', values: ['Vue.js', 'React.js', 'Next.js', 'Electron.js', 'JavaScript ES6+', 'HTML', 'CSS', 'Flutter'] },
  { label: 'Data', scope: 'State / pipelines', values: ['MySQL', 'PostgreSQL', 'Redis', 'Real-time tracking', 'AI datasets'] },
  { label: 'Cloud & Ops', scope: 'Runtime / delivery', values: ['AWS EC2', 'AWS S3', 'Networking', 'Auto-scaling', 'Docker', 'Linux', 'CI/CD'] },
]
