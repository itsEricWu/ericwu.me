import React from "react";
import {
  IoDocumentText,
  IoLogoGithub,
  IoLogoLinkedin,
  IoMail,
} from "react-icons/io5";

import { Dock, DockIcon } from "@/components/dock";
import { siteConfig } from "@/config/site";

export type IconProps = React.HTMLAttributes<SVGElement>;

interface DockDemoProps {
  resumeUrl: string;
}

export function DockDemo({ resumeUrl }: DockDemoProps) {
  return (
    <button className="self-end" onMouseDown={(e) => e.stopPropagation()}>
      <Dock>
        <DockIcon tooltip="Resume" url={resumeUrl}>
          <IoDocumentText className="h-5 w-5" />
        </DockIcon>
        <DockIcon tooltip="GitHub" url={siteConfig.links.github}>
          <IoLogoGithub className="h-5 w-5" />
        </DockIcon>
        <DockIcon tooltip="LinkedIn" url={siteConfig.links.linkedin}>
          <IoLogoLinkedin className="h-5 w-5" />
        </DockIcon>
        <DockIcon tooltip="Email" url={siteConfig.links.email}>
          <IoMail className="h-5 w-5" />
        </DockIcon>
      </Dock>
    </button>
  );
}
