import { useFSRoute } from "nextra/hooks";
import React from "react";

const config = {
  logo: () => <strong>@h6s/calendar</strong>,
  project: {
    link: "https://github.com/toss/h6s",
  },
  docsRepositoryBase: "https://github.com/toss/h6s/tree/main/docs/calendar",
  footer: {
    text: `MIT ${new Date().getFullYear()} © h6s`,
  },
  sidebar: {
    defaultMenuCollapseLevel: 1,
    toggleButton: false,
  },
  search: {
    placeholder: "Search documentation...",
  },
};

export default config;
