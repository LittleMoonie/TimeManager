import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  backendSidebar: [
    {
      type: 'category',
      label: 'API Overview',
      link: {
        type: 'doc',
        id: 'index', // Links to content/backend/index.md
      },
      items: [
        'architecture', // content/backend/architecture.md (new, comprehensive)
        'endpoints',    // content/backend/endpoints.md
        'authentication', // content/backend/authentication.md
        'openapi-automation', // content/backend/openapi-automation.md
        'versioning',   // content/backend/versioning.md
      ],
    },
    {
      type: 'category',
      label: 'Backend Core Concepts',
      items: [
        'cache-queues-realtime', // content/backend/cache-queues-realtime.md
        'company-rbac-spec', // content/backend/company-rbac-spec.md
        'database', // content/backend/database.md
      ],
    },
  ],
};

export default sidebars;