import type { MetaRecord } from "nextra";

const meta: MetaRecord = {
  index: {
    theme: {
      layout: 'full',
      copyPage: false,
      sidebar: false,
      toc: false,
      pagination: false,
      breadcrumb: false,
    }
  },
  docs: {
    title: "Documentation",
    type: "page",
  },
  "api-docs": {
    title: "API",
    type: "page",
  },
};

export default meta;
