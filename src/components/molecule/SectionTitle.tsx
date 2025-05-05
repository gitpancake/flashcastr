import React from "react";

type SectionTitleProps = {
  children: React.ReactNode;
};

export default function SectionTitle({ children }: SectionTitleProps) {
  return <div className="font-invader text-white tracking-widest uppercase text-base mb-2">{children}</div>;
}
