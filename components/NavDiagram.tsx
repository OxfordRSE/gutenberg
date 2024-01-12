import React, { useRef, useState, useEffect, useMemo, useCallback } from "react"
import ReactFlow, { Background, Controls, Node, Edge, FitViewOptions, applyNodeChanges, NodeChange } from "reactflow"

import "reactflow/dist/style.css"
import NavDiagramSectionNode from "./NavDiagramSectionNode"
import NavDiagramCourseNode from "./NavDiagramCourseNode"
import NavDiagramThemeNode from "./NavDiagramThemeNode"

import { Excludes } from "lib/material"

export type NodeData = {
  label: string
  width: number
  height: number
  theme: Theme
  course?: Course
  section?: Section
  external: boolean
}

type CustomNode = Node<NodeData>

const nodeTypes = {
  theme: NavDiagramThemeNode,
  course: NavDiagramCourseNode,
  section: NavDiagramSectionNode,
}

import ELK, { ElkNode } from "elkjs/lib/elk.bundled.js"
const elk = new ELK()
import { Course, Theme, Material, Section } from "lib/material"
import CourseComponent from "pages/material/[repoId]/[themeId]/[courseId]"
import { ElkExtendedEdge } from "elkjs"

const layoutOptions = {
  "elk.algorithm": "layered",
  "elk.nodePlacement.strategy": "NETWORK_SIMPLEX",
  "elk.direction": "DOWN",
  "elk.alignment": "CENTER",
  "elk.contentAlignment": "H_CENTER",
  "elk.spacing.nodeNode": "20",
  "elk.nodeLabels.placement": "INSIDE V_TOP H_CENTER",
  "elk.nodeSize.minimum": "(300, 100)",
  "elk.nodeSize.constraints": "MINIMUM_SIZE",
  "elk.layered.spacing.nodeNodeBetweenLayers": "20",
  "elk.aspectRatio": "1.7",
  "elk.zoomToFit": "true",
}

const layoutOptionsTheme = {
  "elk.algorithm": "layered",
  "elk.nodePlacement.strategy": "NETWORK_SIMPLEX",
  "elk.direction": "DOWN",
  "elk.spacing.nodeNode": "20",
  "elk.nodeLabels.placement": "INSIDE V_TOP H_CENTER",
  "elk.nodeSize.minimum": "(400, 100)",
  "elk.nodeSize.constraints": "MINIMUM_SIZE",
  "elk.layered.spacing.nodeNodeBetweenLayers": "20",
  "elk.aspectRatio": "1.7",
  "elk.zoomToFit": "true",
}

const padding = "[top=50.0,left=12.0,bottom=12.0,right=12.0]"

const labels = [{ width: 200, height: 70 }]
const labelsTheme = [{ width: 200, height: 90 }]

function generate_section_edges(section: Section, excludes: Excludes) {
  const course = `${section.theme}.${section.course}`
  // only create edges for this course
  const edges: Edge[] = section.dependsOn
    .filter((dep) => dep.startsWith(course))
    .map((dep) => {
      const source = dep + ".md"
      const target = `${section.theme}.${section.course}.${section.file}`
      return { id: `e${source}-${target}`, source, target, zIndex: 3 }
    })
  return edges
}

function generate_course_edges_elk(course: Course, excludes: Excludes) {
  let edges: ElkExtendedEdge[] = []
  const sections = course.sections.filter((section) => !excludes.sections.includes(section.file))
  for (const section of sections) {
    // only create edges for this course
    edges = edges.concat(
      section.dependsOn
        .filter((dep) => dep.startsWith(`${section.theme}.${course.id}`))
        .map((dep) => {
          const source = dep + ".md"
          const target = `${section.theme}.${course.id}.${section.file}`
          return { id: `e${source}-${target}`, sources: [source], targets: [target] }
        })
    )
  }
  if (!edges) {
    return undefined
  }
  return edges
}

function generate_course_edges(course: Course, excludes: Excludes) {
  if (excludes.courses.includes(course.id)) {
    return []
  }
  let edges: Edge[] = course.dependsOn
    .filter((dep) => !excludes.courses.includes(dep))
    .map((dep) => {
      const source = dep
      const target = `${course.theme}.${course.id}`
      return { id: `e${source}-${target}`, source, target, zIndex: 3 }
    })
  edges = edges.concat(...course.sections.map((section) => generate_section_edges(section, excludes)))
  return edges
}

function generate_course_nodes_elk(course: Course, excludes: Excludes) {
  const sections = course.sections.filter((section) => !excludes.sections.includes(section.file.split(".")[0]))
  const nodes: ElkNode[] = sections.map((section) => ({
    id: `${section.theme}.${course.id}.${section.file}`,
    width: 150,
    height: 60,
  }))
  if (nodes.length == 0) {
    return undefined
  }
  return nodes
}

function generate_course_nodes(course: Course, theme: Theme, graph: ElkNode, excludes: Excludes) {
  const sections = course.sections.filter((section) => !excludes.sections.includes(section.file.split(".")[0]))
  let nodes: Node[] = sections.map((section, i) => ({
    id: `${section.theme}.${course.id}.${section.file}`,
    type: "section",
    parentNode: graph.id == "root" ? undefined : `${section.theme}.${course.id}`,
    layoutOptions,
    zIndex: 2,
    data: {
      label: section.name,
      width: graph.children?.[i].width,
      height: graph.children?.[i].height,
      theme: theme,
      course: course,
      section: section,
    },
    position: { x: graph.children?.[i].x || 0, y: graph.children?.[i].y || 0 },
    style: {
      width: graph.children?.[i].width,
      height: graph.children?.[i].height,
    },
  }))
  nodes
    .filter((node) => !excludes.sections.includes(node.id.split(".")[2]))
    .filter((node) => !excludes.courses.includes(node.id.split(".")[1]))
    .filter((node) => !excludes.themes.includes(node.id.split(".")[0]))
  return nodes
}

function generate_theme_edges(theme: Theme, excludes: Excludes) {
  const courses = theme.courses.filter((course) => !excludes.courses.includes(course.id))
  let edges: Edge[] = []
  edges = edges.concat(...courses.map((course) => generate_course_edges(course, excludes)))
  return edges
}

function generate_theme_edges_elk(theme: Theme, excludes: Excludes) {
  let edges: ElkExtendedEdge[] = []
  const courses = theme.courses.filter((course) => !excludes.courses.includes(course.id))
  for (const course of courses) {
    const depends = course.dependsOn
      .filter((dep) => !excludes.courses.includes(dep.split(".")[1]))
      .filter((dep) => !excludes.themes.includes(dep.split(".")[0]))
    edges = edges.concat(
      depends.map((dep) => {
        const source = dep
        const target = `${course.theme}.${course.id}`
        return { id: `e${source}-${target}`, sources: [source], targets: [target] }
      })
    )
  }
  if (edges.length == 0) {
    return undefined
  }
  return edges
}

function generate_theme_nodes_elk(theme: Theme, includeExternalDeps: boolean = false, excludes: Excludes) {
  if (excludes.themes.includes(theme.id)) {
    return undefined
  }
  const courses = theme.courses.filter((course) => !excludes.courses.includes(course.id))
  let nodes: ElkNode[] = courses.map((course) => ({
    id: `${theme.id}.${course.id}`,
    width: 150,
    height: 1,
    labels,
    layoutOptions,
    children: generate_course_nodes_elk(course, excludes),
    edges: generate_course_edges_elk(course, excludes),
  }))
  if (includeExternalDeps) {
    const nodeDeps: ElkNode[] = courses
      .map((course) =>
        course.dependsOn
          .filter((dep) => !dep.startsWith(theme.id))
          .filter((dep) => !excludes.themes.includes(dep.split(".")[0]))
          .map((dep) => ({
            id: dep,
            width: 150,
            height: 1,
            labels,
            layoutOptions,
            children: [],
            edges: [],
          }))
      )
      .flat()
    nodes = nodes.concat(nodeDeps)
  }

  if (nodes.length == 0) {
    return undefined
  }
  return nodes
}

function generate_theme_nodes(
  material: Material,
  theme: Theme,
  graph: ElkNode,
  includeExternalDeps: boolean = false,
  excludes: Excludes
) {
  const nCourses = theme.courses.length
  const courses = theme.courses.filter((course) => !excludes.courses.includes(course.id))
  let nodes: Node[] = courses.map((course, i) => ({
    id: `${theme.id}.${course.id}`,
    type: "course",
    parentNode: graph.id == "root" ? undefined : theme.id,
    zIndex: 1,
    data: {
      label: course.name,
      width: graph.children?.[i].width,
      height: graph.children?.[i].height,
      theme: theme,
      course: course,
      external: false,
    },
    position: { x: graph.children?.[i].x || 0, y: graph.children?.[i].y || 0 },
    style: {
      width: graph.children?.[i].width,
      height: graph.children?.[i].height,
    },
  }))
  nodes = nodes.concat(
    ...theme.courses.map((course, i) => {
      if (graph.children?.[i]) {
        return generate_course_nodes(course, theme, graph.children?.[i], excludes)
      } else {
        return []
      }
    })
  )
  if (includeExternalDeps) {
    let index = nCourses
    const nodeDeps: Node[] = theme.courses
      .map((course) =>
        course.dependsOn
          .filter((dep) => !dep.startsWith(theme.id))
          .filter((dep) => !excludes.themes.includes(dep.split(".")[0]))
          .map((dep) => {
            const materialId = dep.split(".")[0]
            const courseId = dep.split(".")[1]
            let depCourseData = material.themes.find((t) => t.id == materialId)?.courses.find((c) => c.id == courseId)
            if (!depCourseData) {
              depCourseData = course
            }
            const depTheme = material.themes.find((t) => t.id == depCourseData?.theme && t.repo == theme.repo)
            const depCourse = {
              id: dep,
              type: "course",
              parentNode: graph.id == "root" ? undefined : theme.id,
              zIndex: 1,
              data: {
                label: depCourseData.name,
                width: graph.children?.[index].width,
                height: graph.children?.[index].height,
                theme: depTheme,
                course: depCourseData,
                external: true,
              },
              position: { x: graph.children?.[index].x || 0, y: graph.children?.[index].y || 0 },
              style: {
                width: graph.children?.[index].width,
                height: graph.children?.[index].height,
              },
            }
            index += 1
            return depCourse
          })
      )
      .flat()
    nodes = nodes.concat(nodeDeps)
  }
  return nodes
}

function generate_material_edges(material: Material, excludes: Excludes) {
  const themes = material.themes.filter((theme) => !excludes.themes.includes(theme.id))
  let edges: Edge[] = []
  edges = edges.concat(...themes.map((theme) => generate_theme_edges(theme, excludes)))
  return edges
}

function generate_material_nodes(material: Material, graph: ElkNode, excludes: Excludes) {
  const themes = material.themes.filter((theme) => !excludes.themes.includes(theme.id))
  let nodes: Node[] = themes.map((theme, i) => ({
    id: theme.id,
    type: "theme",
    data: {
      label: theme.name,
      width: graph.children?.[i].width,
      height: graph.children?.[i].height,
      theme: theme,
    },
    zIndex: 0,
    position: { x: graph.children?.[i].x || 0, y: graph.children?.[i].y || 0 },
    style: {
      width: graph.children?.[i].width,
      height: graph.children?.[i].height,
    },
  }))
  return nodes
}

function generate_material_nodes_elk(
  material: Material,
  excludes: Excludes = { themes: [], courses: [], sections: [] }
) {
  const themes = material.themes.filter((theme) => !excludes.themes.includes(theme.id))
  const nodes: ElkNode[] = themes.map((theme) => ({
    id: theme.id,
    width: 1,
    height: 1,
    layoutOptions: layoutOptionsTheme,
    labels: labelsTheme,
    children: generate_theme_nodes_elk(theme, false, excludes ? excludes : blankExcludes),
    edges: generate_theme_edges_elk(theme, excludes ? excludes : blankExcludes),
  }))
  return nodes
}

interface NavDiagramProps {
  material: Material
  theme?: Theme
  course?: Course
  excludes?: Excludes
}

const blankExcludes: Excludes = { themes: [], courses: [], sections: [] }

const NavDiagram: React.FC<NavDiagramProps> = ({ material, theme, course, excludes }) => {
  const defaultNodes: Node[] = []
  const [nodes, setNodes] = useState(defaultNodes)
  const onNodesChange = useCallback((changes: NodeChange[]) => {
    setNodes((nds) => applyNodeChanges(changes, nds))
  }, [])

  const stringifyMaterial = JSON.stringify(material)
  const edges = useMemo(() => {
    if (course) {
      return generate_course_edges(course, excludes ? excludes : blankExcludes)
    } else if (theme) {
      return generate_theme_edges(theme, excludes ? excludes : blankExcludes)
    } else {
      return generate_material_edges(material, excludes ? excludes : blankExcludes)
    }
  }, [course, material, theme])
  useEffect(() => {
    let children = null
    let edges = undefined
    if (course) {
      children = generate_course_nodes_elk(course, excludes ?? blankExcludes)
      edges = generate_course_edges_elk(course, excludes ?? blankExcludes)
    } else if (theme) {
      children = generate_theme_nodes_elk(theme, true, excludes ? excludes : blankExcludes)
      edges = generate_theme_edges_elk(theme, excludes ? excludes : blankExcludes)
    } else {
      children = generate_material_nodes_elk(material, excludes ? excludes : blankExcludes)
    }
    const graph: ElkNode = {
      id: "root",
      layoutOptions,
      children,
      edges,
    }
    elk.layout(graph).then((graph) => {
      let nodes: Node[] = []
      if (course && theme) {
        nodes = generate_course_nodes(course, theme, graph, excludes ? excludes : blankExcludes)
      } else if (theme) {
        nodes = generate_theme_nodes(material, theme, graph, true, excludes ? excludes : blankExcludes)
      } else {
        nodes = generate_material_nodes(material, graph, excludes ? excludes : blankExcludes)
      }
      setNodes(nodes)
    })
  }, [stringifyMaterial, course, material, theme])
  const fitViewOptions: FitViewOptions = {
    padding: 0.15,
  }
  if (!nodes) {
    return <div>Generating diagram...</div>
  }
  const style = course
    ? { aspectRatio: "12 / 9", width: "50%" }
    : theme
      ? { aspectRatio: "14 / 9", width: "70%" }
      : { aspectRatio: "16 / 9", width: "100%" }
  return (
    <div className="flex justify-center mb-5">
      <div style={style} className="border border-gray-200 rounded-lg shadow-md dark:border-gray-700">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          onNodesChange={onNodesChange}
          minZoom={0.2}
          maxZoom={2}
          fitView
          fitViewOptions={fitViewOptions}
        ></ReactFlow>
      </div>
    </div>
  )
}

export default NavDiagram
