import { Course, Section, Theme } from "lib/material"
import Link from "next/link"
import React, { memo } from "react"
import { Handle, Position, Node } from "reactflow"
import { NodeData } from "./NavDiagram"
import { basePath } from "lib/basePath"

type NodeProps = {
  data: NodeData
}

function NavDiagramCourseNode({ data }: NodeProps) {
  const containerBgStyle = data.external ? "" : "hover:bg-gray-100 dark:bg-gray-700 dark:hover:bg-gray-600"
  return (
    <div
      className={`px-4 py-2 h-full w-full border border-gray-200 rounded-lg shadow-md dark:border-gray-600 ${containerBgStyle}`}
    >
      <a href={`${basePath}/material/${data.theme.repo}/${data.theme.id}/${data.course?.id}`}>
        <div className="text-center text-l font-extrabold">{data.label}</div>
        {data.external && <div className="text-center">Theme: {data.theme.name}</div>}
      </a>

      <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
      <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
    </div>
  )
}

export default memo(NavDiagramCourseNode)
