import type { MetaRecord } from "nextra";

const meta: MetaRecord = {
  index: {
    theme: {
      layout: "full",
      copyPage: false,
      sidebar: false,
      toc: false,
      pagination: false,
      breadcrumb: false,
      timestamp: false,
    },
  },
  docs: {
    title: "문서",
    type: "page",
  },
  "api-docs": {
    title: "API",
    type: "page",
  },
};

export default meta;
