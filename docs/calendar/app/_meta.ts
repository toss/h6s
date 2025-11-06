import type { MetaRecord } from "nextra";

const meta: MetaRecord = {
  index: {
    title: "Home",
    display: "hidden",
  },
  "---": {
    type: "separator",
    title: "Documentation",
  },
  guide: {
    title: "Guide",
  },
  examples: {
    title: "Examples",
  },
  "---api": {
    type: "separator",
    title: "API",
  },
  api: {
    title: "API Reference",
  },
};

export default meta;
