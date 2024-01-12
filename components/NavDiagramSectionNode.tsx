import Link from "next/link"
import React, { memo } from "react"
import { Handle, Position } from "reactflow"
import { NodeData } from "./NavDiagram"
import { basePath } from "lib/basePath"

type NodeProps = {
  data: NodeData
}

function NavDiagramSectionNode({ data }: NodeProps) {
  return (
    <a href={`${basePath}/material/${data.theme.repo}/${data.theme.id}/${data.course?.id}/${data.section?.id}`}>
      <div
        className={`px-1 py-1 h-full w-full border border-gray-200 rounded-lg shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-600`}
      >
        <div className="flex grow justify-between h-full">
          <div className="self-start text-xs font-extrabold">{data.label}</div>
          <div className="self-end justify-self-end">
            {data.section?.tags.map((tag, i) => (
              <div key={i} className="px-2 pb-1 text-[9px] bg-indigo-500 rounded-lg">
                {tag}
              </div>
            ))}
          </div>
        </div>

        <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
        <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
      </div>
    </a>
  )
}

export default memo(NavDiagramSectionNode)
