import React from "react";
import { useFSRoute } from "nextra/hooks";

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
  main: function Main({ children }: { children: React.ReactNode }) {
    const route = useFSRoute();
    const isHomePage = route === "/" || route === "/en" || route === "/ko";
    
    return (
      <div className={isHomePage ? "homepage-full-width" : ""}>
        {children}
      </div>
    );
  },
  search: {
    placeholder: "Search documentation...",
  },
};

export default config;

