import React, { ReactNode } from 'react';

interface StackProps {
  spacing?: number;
  children: ReactNode;
  direction?: 'row' | 'col' | undefined;
  className?: React.ComponentProps<'div'>['className'];
}

function Stack({ spacing = 4, children, direction, className }: StackProps) {
  if (direction === undefined) {
    direction = 'col';
  }
  const axis = direction === 'col' ? 'y' : 'x';
  return (
    <div className={`flex flex-${direction} space-${axis}-${spacing} ${className}`}>
      {children}
    </div>
  );
}

export default Stack;