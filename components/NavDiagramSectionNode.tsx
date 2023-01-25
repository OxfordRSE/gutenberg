import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { NodeData } from './NavDiagram';

type NodeProps = {
  data: NodeData,
}

function NavDiagramSectionNode({ data }: NodeProps) {
  return (
    <a href={`/material/${data.theme}/${data.course?.id}/${data.section?.id}`} >
    <div className={`px-4 py-2 h-full w-full border border-gray-200 rounded-lg shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-600`}>
      <div className="flex">
        <div className="ml-2">
          <div className="mb-2 text-xl font-extrabold">{data.label}</div>
        </div>
      </div>
      <div className="flex justify-start">
        {data.section?.tags.map((tag, i) => (
            <div key={i} className="px-2 pb-1 bg-indigo-500 rounded-lg">{tag}</div>
        ))}
      </div>

      <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
    </div>
    </a>
  );
}

export default memo(NavDiagramSectionNode);