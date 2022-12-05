import React, { useRef, useState, useEffect, useMemo } from 'react'
import ReactFlow, { Background, Controls, Node, Edge, FitViewOptions } from 'reactflow';
import 'reactflow/dist/style.css';
import ELK, {ElkNode } from 'elkjs/lib/elk.bundled.js'
const elk = new ELK()
import { Course, Theme, Material, Section } from 'lib/material'
import CourseComponent from 'pages/material/[themeId]/[courseId]';
import { ElkExtendedEdge } from 'elkjs';


function generate_section_edges(section: Section) {
  const edges: Edge[] = section.dependsOn.map(dep => {
    const source = dep; 
    const target = `${section.theme}.${section.course}.${section.file}`;
    return (
      { id: `$e${source}-${target}`, source, target }
    )
   });
  return edges;
}

function generate_course_edges_elk(course: Course) {
  const edges: ElkExtendedEdge[] = [];
  for (const section of course.sections) {
    edges.concat(course.dependsOn.map(dep => {
      const source = dep; 
      const target = `${section.theme}.${course.id}.${section.file}`;
      return (
        { id: `$e${source}-${target}`, sources: [source], targets: [target] }
      )
   }));
  }
  if (!edges) {
    return undefined
  }
  return edges;
}

function generate_course_edges(course: Course) {
  const edges: Edge[] = course.dependsOn.map(dep => {
    const source = dep; 
    const target = `${course.theme}.${course.id}`;
    return (
      { id: `$e${source}-${target}`, source, target }
    )
   });
  edges.concat(...course.sections.map(generate_section_edges));
  return edges;
}

function generate_course_nodes_elk(course: Course) {
  const nodes: ElkNode[] = course.sections.map(section => (
    { 
      id: `${section.theme}.${course.id}.${section.file}`, 
      width: 1, 
      height: 1,
    }
  ));
  if (nodes.length == 0) {
    return undefined 
  }
  return nodes;
}

function generate_course_nodes(course: Course, graph: ElkNode) {
  let nodes: Node[] = course.sections.map((section, i) => (
    { 
      id: `${section.theme}.${course.id}.${section.file}`, 
      parentNode: `${section.theme}.${course.id}`, 
      data: { label: section.name }, 
      position: { x: graph.children?.[i].x || 0, y: graph.children?.[i].y || 0},
    }
  ))
  return nodes;
}

function generate_theme_edges(theme: Theme) {
  const edges: Edge[] = [];
  edges.concat(...theme.courses.map(generate_course_edges));
  return edges;
}

function generate_theme_edges_elk(theme: Theme) {
  const edges: ElkExtendedEdge[] = [];
  for (const course of theme.courses) {
    edges.concat(course.dependsOn.map(dep => {
      const source = dep; 
      const target = `${course.theme}.${course.id}`;
      return (
        { id: `$e${source}-${target}`, sources: [source], targets: [target] }
      )
   }));
  }
  if (edges.length == 0) {
    return undefined 
  }
  return edges;
}

function generate_theme_nodes_elk(theme: Theme) {
  const nodes: ElkNode[] = theme.courses.map(course => (
    { 
      id: `${theme.id}.${course.id}`, 
      width: 1, 
      height: 1,
      children: generate_course_nodes_elk(course),
      edges: generate_course_edges_elk(course),
    }
  ));
  if (nodes.length == 0) {
    return undefined 
  }
  return nodes;
}

function generate_theme_nodes(theme: Theme, graph: ElkNode) {
  let nodes: Node[] = theme.courses.map((course, i) => (
    { 
      id: `${theme.id}.${course.id}`, 
      parentNode: theme.id, 
      data: { label: theme.name }, 
      position: { x: graph.children?.[i].x || 0, y: graph.children?.[i].y || 0 },
    }
  ))
  nodes.concat(...theme.courses.map((course, i) => {
    if (graph.children?.[i]) {
      return generate_course_nodes(course, graph.children?.[i])
    } else {
      return []
    }
  }));
  return nodes;
}

function generate_material_edges(material: Material) {
  let edges: Edge[] = [];
  edges.concat(...material.themes.map(generate_theme_edges));
  return edges;
}

function generate_material_nodes(material: Material, graph: ElkNode) {
  let nodes: Node[] = material.themes.map((theme, i) => (
    { 
      id: theme.id, 
      data: { label: theme.name }, 
      position: { x: graph.children?.[i].x || 0, y: graph.children?.[i].y || 0 } }
  ));
  nodes.concat(...material.themes.map((theme, i) => {
    if (graph.children?.[i]) {
      return generate_theme_nodes(theme, graph.children?.[i]);
    } else {
      return [];
    }
  }));
  return nodes;
}

function generate_material_nodes_elk(material: Material) {
  const nodes: ElkNode[] = material.themes.map(theme => (
    { 
      id: theme.id, 
      width: 1, 
      height: 1,
      children: generate_theme_nodes_elk(theme),
      edges: generate_theme_edges_elk(theme),
    }
  ));
  return nodes;
}

interface NavDiagramProps {
  material: Material,
  theme: Theme | null,
  course: Course | null,
}

const NavDiagram: React.FC<NavDiagramProps> = ({ material, theme, course }) => {
  const [nodes, setNodes] = useState(null);
  const stringifyMaterial = JSON.stringify(material);
  const edges = useMemo(() => {
    return generate_material_edges(material)
  }, [stringifyMaterial]);
  useEffect(() => {
      const graph: ElkNode = {
        id: "root",
        layoutOptions: { 
          'elk.algorithm': 'layered',
          'elk.nodePlacement.strategy': 'NETWORK_SIMPLEX',
          'elk.direction': 'DOWN',
          'elk.spacing.nodeNode': '20',
          'elk.layered.spacing.nodeNodeBetweenLayers': '90',
          'elk.aspectRatio': '1.0',
        },
        children: generate_material_nodes_elk(material),
      }
      console.log(graph)
      elk.layout(graph).then(graph => {
        const nodes: Node[] = generate_material_nodes(material, graph);
        setNodes(nodes)
      })

    }, [stringifyMaterial]);
  const fitViewOptions: FitViewOptions = {
    padding: 0.2,
  };
  if (!nodes) {
    return <div>Generating diagram...</div>
  }
  console.log(nodes, edges)
  return (
    <div style={{ height: '30vh', width: '100%' }}>
      <ReactFlow 
        nodes={nodes} edges={edges}
        fitView
        fitViewOptions={fitViewOptions}
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  )
}

export default NavDiagram; 
