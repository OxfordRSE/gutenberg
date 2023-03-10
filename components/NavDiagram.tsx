import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react'
import ReactFlow, { Background, Controls, Node, Edge, FitViewOptions, applyNodeChanges } from 'reactflow';

import 'reactflow/dist/style.css';
import NavDiagramSectionNode from './NavDiagramSectionNode';
import NavDiagramCourseNode from './NavDiagramCourseNode';
import NavDiagramThemeNode from './NavDiagramThemeNode';

export type NodeData = {
  label: string,
  width: number,
  height: number,
  theme: Theme,
  course?: Course,
  section?: Section,
  external: boolean,
};

type CustomNode = Node<NodeData>;

const nodeTypes = {
  theme: NavDiagramThemeNode,
  course: NavDiagramCourseNode,
  section: NavDiagramSectionNode,
};

import ELK, {ElkNode } from 'elkjs/lib/elk.bundled.js'
const elk = new ELK()
import { Course, Theme, Material, Section } from 'lib/material'
import CourseComponent from 'pages/material/[themeId]/[courseId]';
import { ElkExtendedEdge } from 'elkjs';


const layoutOptions = { 
  'elk.algorithm': 'layered',
  'elk.nodePlacement.strategy': 'NETWORK_SIMPLEX',
  'elk.direction': 'DOWN',
  'elk.alignment': 'CENTER',
  'elk.contentAlignment': 'H_CENTER',
  'elk.spacing.nodeNode': '20',
  'elk.nodeLabels.placement': "INSIDE V_TOP H_CENTER",
  'elk.nodeSize.minimum': '(300, 100)',
  'elk.nodeSize.constraints': 'MINIMUM_SIZE',
  'elk.layered.spacing.nodeNodeBetweenLayers': '20',
  'elk.aspectRatio': '1.7',
};

const layoutOptionsTheme = { 
  'elk.algorithm': 'layered',
  'elk.nodePlacement.strategy': 'NETWORK_SIMPLEX',
  'elk.direction': 'DOWN',
  'elk.spacing.nodeNode': '20',
  'elk.nodeLabels.placement': "INSIDE V_TOP H_CENTER",
  'elk.nodeSize.minimum': '(400, 100)',
  'elk.nodeSize.constraints': 'MINIMUM_SIZE',
  'elk.layered.spacing.nodeNodeBetweenLayers': '20',
  'elk.aspectRatio': '1.7',
};

const padding = "[top=50.0,left=12.0,bottom=12.0,right=12.0]";

const labels = [{width: 200, height: 70}];
const labelsTheme = [{width: 200, height: 90}];

function generate_section_edges(section: Section) {
  const course = `${section.theme}.${section.course}`;
  // only create edges for this course
  const edges: Edge[] = section.dependsOn
    .filter(dep => dep.startsWith(course))
    .map(dep => {
      console.log('create dep for', section.id, '->', dep)
      const source = dep + '.md'; 
      const target = `${section.theme}.${section.course}.${section.file}`;
      return (
        { id: `e${source}-${target}`, source, target, zIndex: 3 }
      )
    });
  return edges;
}

function generate_course_edges_elk(course: Course) {
  let edges: ElkExtendedEdge[] = [];
  console.log('generate_course_edges_elk', course)
  for (const section of course.sections) {
    // only create edges for this course
    edges = edges.concat(section.dependsOn
      .filter(dep => dep.startsWith(`${section.theme}.${course.id}`))
      .map(dep => {
      console.log('create dep', dep)
      const source = dep + '.md'; 
      const target = `${section.theme}.${course.id}.${section.file}`;
      return (
        { id: `e${source}-${target}`, sources: [source], targets: [target] }
      )
   }));
  }
  if (!edges) {
    return undefined
  }
  return edges;
}

function generate_course_edges(course: Course) {
  let edges: Edge[] = course.dependsOn.map(dep => {
    const source = dep; 
    const target = `${course.theme}.${course.id}`;
    return (
      { id: `e${source}-${target}`, source, target, zIndex: 3 }
    )
   });
  edges = edges.concat(...course.sections.map(generate_section_edges));
  return edges;
}

function generate_course_nodes_elk(course: Course) {
  const nodes: ElkNode[] = course.sections.map(section => (
    { 
      id: `${section.theme}.${course.id}.${section.file}`, 
      width: 150, 
      height: 60,
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
      type: 'section',
      parentNode: graph.id == 'root' ? undefined : `${section.theme}.${course.id}`, 
      layoutOptions,
      zIndex: 2, 
      data: { 
        label: section.name,  
        width: graph.children?.[i].width,
        height: graph.children?.[i].height,
        theme: section.theme,
        course: course,
        section: section,
      }, 
      position: { x: graph.children?.[i].x || 0, y: graph.children?.[i].y || 0},
      style: {
          width: graph.children?.[i].width,
          height: graph.children?.[i].height,
      },
    }
  ))
  return nodes;
}

function generate_theme_edges(theme: Theme) {
  let edges: Edge[] = [];
  edges = edges.concat(...theme.courses.map(generate_course_edges));
  return edges;
}

function generate_theme_edges_elk(theme: Theme) {
  let edges: ElkExtendedEdge[] = [];
  for (const course of theme.courses) {
    edges = edges.concat(course.dependsOn.map(dep => {
      const source = dep; 
      const target = `${course.theme}.${course.id}`;
      return (
        { id: `e${source}-${target}`, sources: [source], targets: [target] }
      )
   }));
  }
  if (edges.length == 0) {
    return undefined 
  }
  return edges;
}

function generate_theme_nodes_elk(theme: Theme, includeExternalDeps: boolean = false) {
  let nodes: ElkNode[] = theme.courses.map(course => (
    { 
      id: `${theme.id}.${course.id}`, 
      width: 150, 
      height: 1,
      labels,
      layoutOptions,
      children: generate_course_nodes_elk(course),
      edges: generate_course_edges_elk(course),
    }
  ));
  if (includeExternalDeps) {
    const nodeDeps: ElkNode[] = theme.courses.map(course => (
      course.dependsOn
      .filter(dep => !dep.startsWith(theme.id))
      .map(dep => (
        { 
          id: dep, 
          width: 150, 
          height: 1,
          labels,
          layoutOptions,
          children: [],
          edges: [],
        }
      ))
    )).flat();
    nodes = nodes.concat(nodeDeps);
  }
  
  if (nodes.length == 0) {
    return undefined 
  }
  return nodes;
}

function generate_theme_nodes(material: Material, theme: Theme, graph: ElkNode, includeExternalDeps: boolean = false) {
  const nCourses = theme.courses.length;
  let nodes: Node[] = theme.courses.map((course, i) => (
    { 
      id: `${theme.id}.${course.id}`, 
      type: 'course',
      parentNode: graph.id == 'root' ? undefined : theme.id, 
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
    }
  ))
  nodes = nodes.concat(...theme.courses.map((course, i) => {
    if (graph.children?.[i]) {
      return generate_course_nodes(course, graph.children?.[i])
    } else {
      return []
    }
  }));
  if (includeExternalDeps) {
    let index = nCourses;
    const nodeDeps: Node[] = theme.courses.map(course => (
      course.dependsOn
      .filter(dep => !dep.startsWith(theme.id))
      .map(dep => {
        const materialId = dep.split('.')[0];
        const courseId = dep.split('.')[1];
        console.log('trying to find ', materialId, ' course with id ', dep, ' material is ', material);
        let depCourseData = material.themes.find(t => t.id == materialId)?.courses.find(c => c.id == courseId);
        if (!depCourseData) {
          depCourseData = course;
        }
        const depCourse = { 
          id: dep, 
          type: 'course',
          parentNode: graph.id == 'root' ? undefined : theme.id, 
          zIndex: 1, 
          data: { 
            label: depCourseData.name,
            width: graph.children?.[index].width,
            height: graph.children?.[index].height,
            theme: theme,
            course: depCourseData,
            external: true,
          }, 
          position: { x: graph.children?.[index].x || 0, y: graph.children?.[index].y || 0 },
          style: {
              width: graph.children?.[index].width,
              height: graph.children?.[index].height,
          },
        };
        index += 1;
        return depCourse;
      })
    )).flat();
    nodes = nodes.concat(nodeDeps);
  }
  console.log('generate_theme_nodes', theme, graph, nodes)
  return nodes;
}

function generate_material_edges(material: Material) {
  let edges: Edge[] = [];
  edges = edges.concat(...material.themes.map(generate_theme_edges));
  return edges;
}

function generate_material_nodes(material: Material, graph: ElkNode) {
  let nodes: Node[] = material.themes.map((theme, i) => (
    { 
      id: theme.id, 
      type: 'theme',
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
    }
  ));
  nodes = nodes.concat(...material.themes.map((theme, i) => {
    if (graph.children?.[i]) {
      return generate_theme_nodes(material, theme, graph.children?.[i]);
    } else {
      console.log('WARNING, graph does not map')
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
      layoutOptions: layoutOptionsTheme,
      labels: labelsTheme,
      children: generate_theme_nodes_elk(theme),
      edges: generate_theme_edges_elk(theme),
    }
  ));
  return nodes;
}

interface NavDiagramProps {
  material: Material,
  theme?: Theme,
  course?: Course,
}

const NavDiagram: React.FC<NavDiagramProps> = ({ material, theme, course }) => {
  const defaultNodes: Node[] = [];
  const [nodes, setNodes] = useState(defaultNodes);
  const onNodesChange = useCallback( (changes) => {
    console.log('onNodesChange', changes)
    setNodes((nds) => applyNodeChanges(changes, nds))
  }, []);

  const stringifyMaterial = JSON.stringify(material);
  const edges = useMemo(() => {
    if (course) {
      return generate_course_edges(course)
    } else if (theme) {
      return generate_theme_edges(theme)
    } else {
      return generate_material_edges(material)
    }
  }, [stringifyMaterial]);
  useEffect(() => {
      let children = null;
      let edges = undefined;
      if (course) {
        children = generate_course_nodes_elk(course)
        edges = generate_course_edges_elk(course)
      } else if (theme) {
        children = generate_theme_nodes_elk(theme, true)
        edges = generate_theme_edges_elk(theme)
      } else {
        children = generate_material_nodes_elk(material)
      }
      const graph: ElkNode = {
        id: "root",
        layoutOptions,
        children,
        edges,
      }
      console.log(graph)
      elk.layout(graph).then(graph => {
        let nodes: Node[] = [];
        if (course) {
          nodes = generate_course_nodes(course, graph);
        } else if (theme) {
          nodes = generate_theme_nodes(material, theme, graph, true);
        } else {
          nodes = generate_material_nodes(material, graph);
        }
        setNodes(nodes);
      })

    }, [stringifyMaterial]);
  const fitViewOptions: FitViewOptions = {
    padding: 0.2,
  };
  if (!nodes) {
    return <div>Generating diagram...</div>
  }
  console.log(nodes, edges)
  const style = course ? 
    { aspectRatio : '12 / 9', width: '50%' } : 
    theme ? 
      { aspectRatio : '14 / 9', width: '70%' } :
      { aspectRatio : '16 / 9', width: '100%' };
  return (
    <div className="flex justify-center mb-5" >
    <div style={style} className="border border-gray-200 rounded-lg shadow-md dark:border-gray-700">
      <ReactFlow 
        nodes={nodes} edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        fitView
        fitViewOptions={fitViewOptions}
      >
      </ReactFlow>
    </div>
    </div>
  )
}

export default NavDiagram; 
