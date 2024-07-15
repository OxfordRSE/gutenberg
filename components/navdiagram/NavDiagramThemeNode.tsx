import Link from "next/link"
import React, { memo } from "react"
import { Handle, Position } from "reactflow"
import { NodeData } from "./NavDiagram"
import { basePath } from "lib/basePath"

type NodeProps = {
  data: NodeData
}

function NavDiagramThemeNode({ data }: NodeProps) {
  return (
    <div
      className={`px-4 py-2 h-full w-full border border-gray-200 rounded-lg shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-600`}
    >
      <Link href={`/material/${data.theme.repo}/${data.theme.id}`}>
        <div className="text-center text-3xl font-extrabold">{data.label}</div>
      </Link>

      <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
    </div>
  )
}

export default memo(NavDiagramThemeNode)
