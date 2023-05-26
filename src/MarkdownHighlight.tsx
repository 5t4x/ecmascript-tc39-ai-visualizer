"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import * as prismThemes from "react-syntax-highlighter/dist/esm/styles/prism";

export default function MarkdownHighlight({
  language,
  children,
}: {
  language: string;
  children: string;
}) {
  return (
    <SyntaxHighlighter
      style={prismThemes.materialLight}
      language={language}
      PreTag="div"
    >
      {children}
    </SyntaxHighlighter>
  );
}
