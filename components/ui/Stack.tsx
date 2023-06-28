import React, { ReactNode } from 'react';

interface StackProps {
  spacing?: number;
  children: ReactNode;
}

function Stack({ spacing = 4, children }: StackProps) {
  return (
    <div className={`flex flex-col space-y-${spacing}`}>
      {children}
    </div>
  );
}

export default Stack;