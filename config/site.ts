export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Eric Wu | Chengxiang Wu - Software Engineer at AWS",
  description:
    "Personal website of Eric Wu (Chengxiang Wu), SDE II at AWS building agentic systems and generative UI. Projects, writing, and experiments.",
  url: "https://ericwu.me",
  keywords: [
    "Eric Wu",
    "Chengxiang Wu",
    "Software Engineer",
    "SDE II",
    "AWS",
    "AWS FinOps Agent",
    "Amazon Q",
    "Generative UI",
    "Agentic Systems",
    "PackBook",
    "Portfolio",
    "Blog",
    "UCLA",
    "Purdue",
  ],
  author: "Eric Wu",
  location: "Seattle, WA",
  email: "cxwu00@gmail.com",
  links: {
    github: "https://github.com/itsEricWu",
    linkedin: "https://www.linkedin.com/in/chengxiang-wu/",
    email: "mailto:cxwu00@gmail.com",
  },
};

export const notionBlogConfig = {
  blogParentId: "657c8581-4fda-455d-b940-a8fdbf47fd3f",
};

export type Project = {
  id: string;
  name: string;
  kicker: string;
  blurb: string;
  href: string;
  linkLabel: string;
};

export const projects = {
  finops: {
    id: "finops",
    name: "AWS FinOps Agent",
    kicker: "Shipped at AWS · Public preview",
    blurb:
      "Always-on cost expertise for every engineer: investigates anomalies, answers cost questions, and files the fix.",
    href: "https://aws.amazon.com/finops-agent/",
    linkLabel: "aws.amazon.com/finops-agent",
  },
  artifacts: {
    id: "artifacts",
    name: "Amazon Q artifacts",
    kicker: "Shipped at AWS · Generative UI",
    blurb:
      "Amazon Q answers with live tables, charts, and dashboards you can sort, filter, and page through.",
    href: "https://docs.aws.amazon.com/amazonq/latest/qdeveloper-ug/chat-artifacts.html",
    linkLabel: "docs.aws.amazon.com",
  },
  packbook: {
    id: "packbook",
    name: "PackBook",
    kicker: "Side project · iOS",
    blurb: "Snap your gear, pack it for any trip, and share it as a page.",
    href: "https://www.packbook.co/",
    linkLabel: "packbook.co",
  },
  secondself: {
    id: "secondself",
    name: "SecondSelf",
    kicker: "Side project",
    blurb: "A social network run by AI agents.",
    href: "https://secondself.us/",
    linkLabel: "secondself.us",
  },
  webagent: {
    id: "webagent",
    name: "Web Agent",
    kicker: "Project · SimpleGen",
    blurb: "An AI agent that researches and drafts influencer outreach.",
    href: "https://www.simplegen.ai/",
    linkLabel: "simplegen.ai",
  },
  chatbot: {
    id: "chatbot",
    name: "AI Chatbot",
    kicker: "Project · SimpleGen",
    blurb: "A collection of persona chatbots.",
    href: "https://beta.simplegen.ai/",
    linkLabel: "beta.simplegen.ai",
  },
  paper: {
    id: "paper",
    name: "DT-VAEGAN",
    kicker: "Research · AAAI 2024",
    blurb:
      "Cumulative Difference Learning VAE for time series with temporally correlated inflow and outflow.",
    href: "https://ojs.aaai.org/index.php/AAAI/article/view/29266",
    linkLabel: "ojs.aaai.org",
  },
} satisfies Record<string, Project>;
