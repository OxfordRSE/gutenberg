import React from 'react';

type ExternalLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

const ExternalLink = ({ href, children, className }: ExternalLinkProps) => {
  const linkClassName = `text-blue-500 hover:text-blue-700 ${className || ''}`;
  return (
    <a href={href} className={linkClassName} target="_blank" rel="noreferrer">
      {children}
    </a>
  );
};

export default ExternalLink;