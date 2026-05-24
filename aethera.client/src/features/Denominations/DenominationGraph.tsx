import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import type { Denomination } from '../../api/types/types';
import styles from './DenominationGraph.module.css';

type GraphNode = {
  id: string;
  entityId?: string | null;
  name?: string | null;
  description?: string | null;
  religion?: Denomination['religion'] | string;
  leaderId?: string | null;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
};

type GraphLink = {
  sourceId: string;
  targetId: string;
  value?: number | null;
  context?: string | null;
};

type GraphProps = {
  nodes: GraphNode[];
  links?: GraphLink[];
  selectedId?: string | null;
  height?: number;
  className?: string;
  onNodeClick?: (node: GraphNode) => void;
  showLinks?: boolean;
};

type Point = { x: number; y: number };
type SimulationGraphNode = d3.SimulationNodeDatum & GraphNode;

const NODE_WIDTH = 186;
const NODE_HEIGHT = 88;

const religionPalette: Record<string, string> = {
  Sun: '#f3b35f',
  Moon: '#95cdf2',
  Heathen: '#d4c7ad',
  Unknown: '#7f8aa1',
};

const religionAnchors: Record<string, Point> = {
  Sun: { x: 0.22, y: 0.36 },
  Moon: { x: 0.5, y: 0.2 },
  Heathen: { x: 0.78, y: 0.36 },
  Unknown: { x: 0.5, y: 0.55 },
};

function getReligionAnchor(religion?: string | null, width = 1, height = 1) {
  const key = religion && religion in religionAnchors ? religion : 'Unknown';
  const anchor = religionAnchors[key];
  return { x: anchor.x * width, y: anchor.y * height };
}

function getReligionColor(religion?: string | null) {
  const key = religion && religion in religionPalette ? religion : 'Unknown';
  return religionPalette[key];
}

function shorten(text: string | null | undefined, max = 58) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function clampRelationValue(value?: number | null) {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return Math.max(-100, Math.min(100, numeric));
}

function describeRelationBand(value: number) {
  if (value <= -75) return 'Sworn enemies';
  if (value <= -40) return 'Hostile';
  if (value <= -10) return 'Tense';
  if (value < 10) return 'Neutral';
  if (value < 40) return 'Cautious cooperation';
  if (value < 75) return 'Allies';
  return 'Unshakable alliance';
}

function getRelationStroke(value: number) {
  if (value === 0) {
    return 'rgba(188, 198, 214, 0.62)';
  }

  const intensity = Math.abs(value) / 100;
  const alpha = 0.35 + intensity * 0.6;

  if (value > 0) {
    return `rgba(88, 214, 141, ${alpha})`;
  }

  return `rgba(233, 86, 86, ${alpha})`;
}

export function DenominationGraph({
  nodes,
  links = [],
  selectedId,
  height = 560,
  className,
  onNodeClick,
  showLinks = true,
}: GraphProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const simulationRef = useRef<d3.Simulation<d3.SimulationNodeDatum, undefined> | null>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const zoomTransformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const simulationNodesRef = useRef<Map<string, SimulationGraphNode>>(new Map());
  const [positions, setPositions] = useState<Record<string, Point>>({});
  const [zoomTransform, setZoomTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity);
  const fitAppliedRef = useRef(false);
  const userInteractedRef = useRef(false);

  const width = 1000;
  const nodeNameById = useMemo(() => {
    const entries = nodes.map((node) => [node.id, shorten(node.name, 48) || 'Unnamed denomination'] as const);
    return new Map<string, string>(entries);
  }, [nodes]);

  const linkData = useMemo(() => {
    if (!showLinks) return [] as Array<{ source: string; target: string; value: number; context?: string | null }>;
    return links
      .filter((link) => link.sourceId && link.targetId)
      .map((link) => ({
        source: link.sourceId,
        target: link.targetId,
        value: link.value ?? 1,
        context: link.context,
      }));
  }, [links, showLinks]);

  useEffect(() => {
    fitAppliedRef.current = false;
    userInteractedRef.current = false;
    zoomTransformRef.current = d3.zoomIdentity;
    setZoomTransform(d3.zoomIdentity);
    setPositions({});
  }, [nodes, height]);

  useEffect(() => {
    if (!svgRef.current) return;

    const selection = d3.select(svgRef.current);
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.35, 2.8])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        userInteractedRef.current = true;
        zoomTransformRef.current = event.transform;
        setZoomTransform(event.transform);
      });

    zoomRef.current = zoom;
    selection.call(zoom as any).on('dblclick.zoom', null);

    return () => {
      selection.on('.zoom', null);
    };
  }, []);

  useEffect(() => {
    if (!nodes.length) return;

    const nodeCopies: SimulationGraphNode[] = nodes.map((node, index) => ({
      ...node,
      x: width * 0.5 + (index % 5) * 12,
      y: height * 0.5 + (index % 7) * 8,
    }));

    simulationNodesRef.current = new Map(nodeCopies.map((node) => [String(node.id), node]));

    const simulation = d3
      .forceSimulation(nodeCopies)
      .alpha(0.9)
      .alphaDecay(0.04)
      .force('charge', d3.forceManyBody().strength(-135))
      .force('collision', d3.forceCollide(NODE_WIDTH * 0.56))
      .force(
        'x',
        d3
          .forceX((node: d3.SimulationNodeDatum & { religion?: string | null }) => getReligionAnchor(node.religion, width, height).x)
          .strength(0.12)
      )
      .force(
        'y',
        d3
          .forceY((node: d3.SimulationNodeDatum & { religion?: string | null }) => getReligionAnchor(node.religion, width, height).y)
          .strength(0.12)
      );

    if (linkData.length > 0) {
      simulation.force(
        'link',
        d3
          .forceLink(linkData as unknown as d3.SimulationLinkDatum<d3.SimulationNodeDatum>[]) 
          .id((node: d3.SimulationNodeDatum & { id?: string | number }) => String(node.id ?? ''))
          .distance(165)
          .strength(0.03)
      );
    }

    simulation.on('tick', () => {
      const nextPositions: Record<string, Point> = {};

      nodeCopies.forEach((node) => {
        nextPositions[String(node.id)] = {
          x: node.x ?? width * 0.5,
          y: node.y ?? height * 0.5,
        };
      });

      setPositions(nextPositions);
    });

    simulationRef.current = simulation as unknown as d3.Simulation<d3.SimulationNodeDatum, undefined>;

    return () => {
      simulation.stop();
      simulationRef.current = null;
      simulationNodesRef.current = new Map();
    };
  }, [height, nodes, width]);

  useEffect(() => {
    if (!svgRef.current || !zoomRef.current || fitAppliedRef.current || userInteractedRef.current) {
      return;
    }

    const values = Object.values(positions);
    if (values.length === 0) return;

    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    values.forEach((point) => {
      minX = Math.min(minX, point.x - NODE_WIDTH / 2);
      minY = Math.min(minY, point.y - NODE_HEIGHT / 2);
      maxX = Math.max(maxX, point.x + NODE_WIDTH / 2);
      maxY = Math.max(maxY, point.y + NODE_HEIGHT / 2);
    });

    const graphWidth = Math.max(maxX - minX, 1);
    const graphHeight = Math.max(maxY - minY, 1);
    const scale = Math.min(width / (graphWidth + 160), height / (graphHeight + 120), 1.05);
    const translateX = width / 2 - ((minX + maxX) / 2) * scale;
    const translateY = height / 2 - ((minY + maxY) / 2) * scale;
    const nextTransform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);

    d3.select(svgRef.current)
      .transition()
      .duration(550)
      .call(zoomRef.current.transform as any, nextTransform);

    fitAppliedRef.current = true;
  }, [height, positions, width]);

  useEffect(() => {
    if (!svgRef.current || !simulationRef.current) return;

    const drag = d3
      .drag<SVGGElement, unknown>()
      .clickDistance(3)
      .on('start', function (event: d3.D3DragEvent<SVGGElement, unknown, unknown>) {
        const nodeId = this.dataset.nodeId;
        if (!nodeId) return;
        const node = simulationNodesRef.current.get(nodeId);
        if (!node) return;

        userInteractedRef.current = true;
        if (!event.active) {
          simulationRef.current?.alphaTarget(0.35).restart();
        }
        node.fx = node.x ?? width * 0.5;
        node.fy = node.y ?? height * 0.5;
      })
      .on('drag', function (event: d3.D3DragEvent<SVGGElement, unknown, unknown>) {
        const nodeId = this.dataset.nodeId;
        if (!nodeId) return;
        const node = simulationNodesRef.current.get(nodeId);
        if (!node) return;

        const scale = Math.max(zoomTransformRef.current.k, 0.0001);
        node.fx = (node.fx ?? node.x ?? width * 0.5) + event.dx / scale;
        node.fy = (node.fy ?? node.y ?? height * 0.5) + event.dy / scale;
        simulationRef.current?.alphaTarget(0.12).restart();
      })
      .on('end', function (event: d3.D3DragEvent<SVGGElement, unknown, unknown>) {
        const nodeId = this.dataset.nodeId;
        if (!nodeId) return;
        const node = simulationNodesRef.current.get(nodeId);
        if (!node) return;

        if (!event.active) {
          simulationRef.current?.alphaTarget(0);
        }
        node.fx = null;
        node.fy = null;
      });

    d3.select(svgRef.current)
      .selectAll<SVGGElement, unknown>('[data-node-id]')
      .call(drag as any);
  }, [height, nodes, width]);

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`}>
      <svg
        ref={svgRef}
        className={styles.svg}
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Denomination relations graph"
      >
        <defs>
          <filter id="denomination-card-shadow" x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="rgba(0, 0, 0, 0.35)" />
          </filter>
        </defs>

        <rect className={styles.background} width={width} height={height} rx={28} />

        <g transform={`translate(${zoomTransform.x}, ${zoomTransform.y}) scale(${zoomTransform.k})`}>
          <g className={styles.anchorLayer}>
            {(['Sun', 'Moon', 'Heathen'] as const).map((religion) => {
              const anchor = getReligionAnchor(religion, width, height);
              return (
                <g key={religion} transform={`translate(${anchor.x}, ${anchor.y})`}>
                  <circle className={`${styles.anchorHalo} ${styles[religion.toLowerCase()]}`} r={92} />
                  <text className={styles.anchorLabel} y={-108} textAnchor="middle">
                    {religion}
                  </text>
                </g>
              );
            })}
          </g>

          {showLinks &&
            linkData.map((link) => {
              const source = positions[String(link.source)];
              const target = positions[String(link.target)];
              if (!source || !target) return null;

              const relationValue = clampRelationValue(link.value);
              const magnitude = relationValue === 0 ? 2 : 1.4 + (Math.abs(relationValue) / 100) * 3.6;
              const selected = selectedId && (String(link.source) === selectedId || String(link.target) === selectedId);
              const stroke = getRelationStroke(relationValue);
              const strokeDasharray = relationValue === 0 ? '8 8' : undefined;
              const sourceName = nodeNameById.get(String(link.source)) ?? 'Unknown denomination';
              const targetName = nodeNameById.get(String(link.target)) ?? 'Unknown denomination';
              const relationBand = describeRelationBand(relationValue);
              const relationText = `${sourceName} -> ${targetName}: ${relationBand} (${relationValue})`;
              const tooltip = link.context ? `${relationText}. ${link.context}` : relationText;

              return (
                <g key={`${link.source}-${link.target}`}>
                  <line
                    className={`${styles.link} ${selected ? styles.linkSelected : ''}`}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={stroke}
                    strokeWidth={magnitude}
                    strokeDasharray={strokeDasharray}
                  />
                  <title>{tooltip}</title>
                </g>
              );
            })}

          {nodes.map((node) => {
            const nodeId = node.id;
            const position = positions[nodeId] ?? {
              x: width * 0.5,
              y: height * 0.5,
            };
            const isSelected = selectedId === nodeId;
            const color = getReligionColor(node.religion);

            return (
              <g
                key={nodeId}
                data-node-id={nodeId}
                className={styles.nodeGroup}
                transform={`translate(${position.x - NODE_WIDTH / 2}, ${position.y - NODE_HEIGHT / 2})`}
                onClick={() => onNodeClick?.(node)}
              >
                <rect
                  className={`${styles.nodeCard} ${isSelected ? styles.nodeCardSelected : ''}`}
                  width={NODE_WIDTH}
                  height={NODE_HEIGHT}
                  rx={20}
                  filter="url(#denomination-card-shadow)"
                />
                <rect className={styles.nodeAccent} width={NODE_WIDTH} height={7} rx={20} fill={color} />
                <rect className={styles.religionPill} x={14} y={16} width={84} height={22} rx={11} fill={color} opacity={0.18} />
                <text className={styles.religionText} x={56} y={31} textAnchor="middle">
                  {node.religion ?? 'Unknown'}
                </text>
                <text className={styles.nodeTitle} x={16} y={57}>
                  {shorten(node.name, 38) || 'Unnamed denomination'}
                </text>
                <text className={styles.nodeDescription} x={16} y={76}>
                  {shorten(node.description, 54) || 'No description yet'}
                </text>
                {node.leaderId ? <circle className={styles.leaderDot} cx={NODE_WIDTH - 18} cy={23} r={5} /> : null}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

export default DenominationGraph;