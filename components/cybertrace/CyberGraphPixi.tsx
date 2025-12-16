import React, { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { ParseResult, GraphNode, GraphLink } from "./types";
import { getEdgeColor } from "./colorUtils";

interface Props {
  data: ParseResult;
}

const CyberGraphPixi: React.FC<Props> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // 存储图形对象的引用
  const nodeGraphicsRef = useRef<Map<string, PIXI.Container>>(new Map());
  const linkGraphicsRef = useRef<Map<string, { line: PIXI.Graphics; bulge: PIXI.Graphics; animating: boolean }>>(new Map());
  const nodePositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());
  const mainContainerRef = useRef<PIXI.Container | null>(null);
  const selectedNodeRef = useRef<GraphNode | null>(null);
  
  // 同步selectedNode到ref
  useEffect(() => {
    selectedNodeRef.current = selectedNode;
  }, [selectedNode]);

  // Handle Resize
  useEffect(() => {
    if (!containerRef.current) return;
    const updateDims = () => {
      setDimensions({
        width: containerRef.current?.clientWidth || 800,
        height: containerRef.current?.clientHeight || 600,
      });
    };
    window.addEventListener("resize", updateDims);
    updateDims();
    return () => window.removeEventListener("resize", updateDims);
  }, []);

  // Initialize PixiJS and render graph
  useEffect(() => {
    if (!containerRef.current || dimensions.width === 0 || data.nodes.length === 0) return;

    // 清理旧的应用
    if (appRef.current) {
      appRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
      appRef.current = null;
    }

    nodeGraphicsRef.current.clear();
    linkGraphicsRef.current.clear();

    // 创建 PixiJS 应用
    const app = new PIXI.Application();
    
    (async () => {
      await app.init({
        width: dimensions.width,
        height: dimensions.height,
        background: 0x0a0a0a,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (!containerRef.current) return;
      
      containerRef.current.appendChild(app.canvas);
      appRef.current = app;

      // 创建主容器
      const mainContainer = new PIXI.Container();
      app.stage.addChild(mainContainer);
      mainContainerRef.current = mainContainer;

      // 背景网格容器
      const bgContainer = new PIXI.Container();
      mainContainer.addChild(bgContainer);

      // 链接容器
      const linkContainer = new PIXI.Container();
      mainContainer.addChild(linkContainer);

      // 节点容器
      const nodeContainer = new PIXI.Container();
      mainContainer.addChild(nodeContainer);

      // 标签容器
      const labelContainer = new PIXI.Container();
      mainContainer.addChild(labelContainer);

      // 绘制背景六边形网格
      const drawBackgroundGrid = () => {
        const hexRadius = 15;
        const hexWidth = hexRadius * 2;
        const hexHeight = Math.sqrt(3) * hexRadius;
        
        for (let y = -hexHeight; y < dimensions.height + hexHeight; y += hexHeight * 0.75) {
          for (let x = -hexWidth; x < dimensions.width + hexWidth; x += hexWidth * 1.5) {
            const offsetX = (Math.floor(y / (hexHeight * 0.75)) % 2) * hexWidth * 0.75;
            const graphics = new PIXI.Graphics();
            graphics.rect(0, 0, 1, 1);
            graphics.stroke({ width: 1, color: 0x1a1a1a, alpha: 0.5 });
            
            // 绘制六边形
            graphics.moveTo(hexRadius - 1, 0);
            for (let i = 1; i <= 6; i++) {
              const angle = (Math.PI / 3) * i;
              graphics.lineTo((hexRadius - 1) * Math.cos(angle), (hexRadius - 1) * Math.sin(angle));
            }
            graphics.stroke({ width: 1, color: 0x1a1a1a, alpha: 0.5 });
            
            graphics.x = x + offsetX;
            graphics.y = y;
            bgContainer.addChild(graphics);
          }
        }
      };

      drawBackgroundGrid();

      // 构建树形布局
      const buildTreeLayout = () => {
        const visited = new Set<string>();
        const allTreeRoots: any[] = [];
        const adjacencyMap = new Map<string, Set<string>>();
        
        data.nodes.forEach(n => adjacencyMap.set(n.id, new Set()));
        data.links.forEach(link => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          adjacencyMap.get(sourceId)?.add(targetId);
        });

        const unvisitedNodes = [...data.nodes];
        
        while (unvisitedNodes.length > 0) {
          const nextRoot = unvisitedNodes.find(n => !visited.has(n.id));
          if (!nextRoot) break;
          
          const treeRoot: any = { ...nextRoot, children: [], depth: 0 };
          allTreeRoots.push(treeRoot);
          
          const queue: any[] = [treeRoot];
          visited.add(nextRoot.id);

          while (queue.length > 0) {
            const current = queue.shift()!;
            const neighbors = adjacencyMap.get(current.id) || new Set();
            
            neighbors.forEach(neighborId => {
              if (!visited.has(neighborId)) {
                visited.add(neighborId);
                const neighborNode = data.nodes.find(n => n.id === neighborId);
                if (neighborNode) {
                  const childNode: any = { 
                    ...neighborNode, 
                    children: [], 
                    depth: (current.depth || 0) + 1 
                  };
                  current.children!.push(childNode);
                  queue.push(childNode);
                }
              }
            });
          }
        }

        return allTreeRoots;
      };

      // 计算节点位置 - 模拟D3 tree layout
      const calculatePositions = () => {
        const nodePositions = new Map<string, { x: number; y: number }>();
        const allTreeRoots = buildTreeLayout();
        
        const treeHeight = dimensions.height - 100;
        const treeWidth = dimensions.width - 400;
        
        let currentYOffset = 50;
        
        allTreeRoots.forEach((treeRoot) => {
          // 计算树的节点数（用于分配Y空间）
          const countNodes = (node: any): number => {
            if (!node.children || node.children.length === 0) return 1;
            return node.children.reduce((sum: number, child: any) => sum + countNodes(child), 0);
          };
          
          const totalLeaves = countNodes(treeRoot);
          
          // 为每个节点分配Y位置（模拟D3的separation）
          const assignYPositions = (node: any, minY: number, maxY: number): void => {
            if (!node.children || node.children.length === 0) {
              node.y = (minY + maxY) / 2;
              return;
            }
            
            const childLeaves = node.children.map((c: any) => countNodes(c));
            const totalChildLeaves = childLeaves.reduce((a: number, b: number) => a + b, 0);
            
            let currentMin = minY;
            node.children.forEach((child: any, i: number) => {
              const childHeight = (maxY - minY) * (childLeaves[i] / totalChildLeaves);
              assignYPositions(child, currentMin, currentMin + childHeight);
              currentMin += childHeight;
            });
            
            // 父节点位于子节点的中间
            const firstChild = node.children[0];
            const lastChild = node.children[node.children.length - 1];
            node.y = (firstChild.y + lastChild.y) / 2;
          };
          
          assignYPositions(treeRoot, 0, treeHeight);
          
          // 计算实际位置
          const assignPositions = (node: any, depth: number) => {
            const x = depth * 250 + 150;
            const y = node.y + currentYOffset;
            nodePositions.set(node.id, { x, y });
            
            if (node.children) {
              node.children.forEach((child: any) => {
                assignPositions(child, depth + 1);
              });
            }
          };
          
          assignPositions(treeRoot, 0);
          
          // 计算这棵树的实际高度
          const treeNodes = Array.from(nodePositions.entries())
            .filter(([id]) => {
              const findNode = (n: any): boolean => {
                if (n.id === id) return true;
                if (n.children) {
                  return n.children.some((c: any) => findNode(c));
                }
                return false;
              };
              return findNode(treeRoot);
            })
            .map(([_, pos]) => pos.y);
          
          if (treeNodes.length > 0) {
            const maxY = Math.max(...treeNodes);
            const minY = Math.min(...treeNodes);
            currentYOffset = maxY + 100;
          }
        });
        
        return nodePositions;
      };

      const nodePositions = calculatePositions();
      nodePositionsRef.current = nodePositions;

      // 绘制六边形辅助函数
      const drawHexagon = (graphics: PIXI.Graphics, x: number, y: number, radius: number) => {
        graphics.moveTo(x + radius, y);
        for (let i = 1; i <= 6; i++) {
          const angle = (Math.PI / 3) * i;
          graphics.lineTo(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
        }
      };

      // 绘制链接和鼓包动画
      const drawLinks = () => {
        data.links.forEach((link) => {
          const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
          const targetId = typeof link.target === 'object' ? link.target.id : link.target;
          const sourcePos = nodePositions.get(sourceId);
          const targetPos = nodePositions.get(targetId);
          
          if (!sourcePos || !targetPos) return;
          
          const lineGraphics = new PIXI.Graphics();
          const color = parseInt(getEdgeColor(link.asset).replace('#', ''), 16);
          // 线条粗细计算：和原版SVG一致
          const width = Math.min(Math.sqrt(link.value) + 1, 5);
          
          // 绘制二次贝塞尔曲线（控制点Y坐标保持在source的Y位置）
          const dx = targetPos.x - sourcePos.x;
          const controlX = sourcePos.x + dx / 2;
          const controlY = sourcePos.y; // 关键：控制点Y保持在起点Y
          
          // 先绘制线条
          lineGraphics.moveTo(sourcePos.x, sourcePos.y);
          lineGraphics.quadraticCurveTo(controlX, controlY, targetPos.x, targetPos.y);
          lineGraphics.stroke({ width, color, alpha: 0.5 });
          
          // 绘制箭头 - 计算曲线终点的切线方向
          // 对于二次贝塞尔曲线，终点的切线方向是从控制点指向终点
          const angle = Math.atan2(targetPos.y - controlY, targetPos.x - controlX);
          const arrowSize = 10; // 增大箭头，更明显
          
          // 绘制实心三角形箭头
          lineGraphics.beginPath();
          lineGraphics.moveTo(targetPos.x, targetPos.y);
          lineGraphics.lineTo(
            targetPos.x - arrowSize * Math.cos(angle - Math.PI / 6),
            targetPos.y - arrowSize * Math.sin(angle - Math.PI / 6)
          );
          lineGraphics.lineTo(
            targetPos.x - arrowSize * Math.cos(angle + Math.PI / 6),
            targetPos.y - arrowSize * Math.sin(angle + Math.PI / 6)
          );
          lineGraphics.closePath();
          lineGraphics.fill({ color, alpha: 0.8 }); // 箭头更不透明
          
          linkContainer.addChild(lineGraphics);
          
          // 创建鼓包动画
          const bulgeGraphics = new PIXI.Graphics();
          bulgeGraphics.alpha = 0;
          linkContainer.addChild(bulgeGraphics);
          
          const key = `${sourceId}-${targetId}-${link.asset}`;
          linkGraphicsRef.current.set(key, { 
            line: lineGraphics, 
            bulge: bulgeGraphics,
            animating: false
          });
          
          // 鼓包动画函数
          let animationFrameId: number | null = null;
          let timeoutId: number | null = null;
          
          const animateBulge = () => {
            const linkRef = linkGraphicsRef.current.get(key);
            if (!linkRef || linkRef.animating || !bulgeGraphics.context) return;
            
            linkRef.animating = true;
            
            try {
              bulgeGraphics.clear();
              bulgeGraphics.alpha = 0;
            } catch (e) {
              linkRef.animating = false;
              return;
            }
            
            let progress = 0;
            const duration = 2000 + Math.random() * 1000;
            const startTime = Date.now();
            
            const animate = () => {
              const linkRef = linkGraphicsRef.current.get(key);
              if (!linkRef || !bulgeGraphics.context) {
                if (linkRef) linkRef.animating = false;
                return;
              }
              
              const elapsed = Date.now() - startTime;
              progress = Math.min(elapsed / duration, 1);
              
              try {
                bulgeGraphics.clear();
                
                if (progress < 0.1) {
                  bulgeGraphics.alpha = progress / 0.1 * 0.6;
                } else if (progress > 0.9) {
                  bulgeGraphics.alpha = (1 - progress) / 0.1 * 0.6;
                } else {
                  bulgeGraphics.alpha = 0.6;
                }
                
                // 计算贝塞尔曲线上的点
                const t1 = Math.max(0, progress - 0.05);
                const t2 = Math.min(1, progress + 0.05);
                
                const getPointOnCurve = (t: number) => {
                  const x = (1 - t) * (1 - t) * sourcePos.x + 2 * (1 - t) * t * controlX + t * t * targetPos.x;
                  const y = (1 - t) * (1 - t) * sourcePos.y + 2 * (1 - t) * t * controlY + t * t * targetPos.y;
                  return { x, y };
                };
                
                const p1 = getPointOnCurve(t1);
                const p2 = getPointOnCurve(t2);
                
                bulgeGraphics.moveTo(p1.x, p1.y);
                bulgeGraphics.lineTo(p2.x, p2.y);
                bulgeGraphics.stroke({ width: 8, color, alpha: 1, cap: 'round' });
                
                if (progress < 1 && linkRef.animating) {
                  animationFrameId = requestAnimationFrame(animate);
                } else {
                  bulgeGraphics.alpha = 0;
                  linkRef.animating = false;
                  timeoutId = window.setTimeout(animateBulge, Math.random() * 3000 + 1000);
                }
              } catch (e) {
                if (linkRef) linkRef.animating = false;
              }
            };
            
            animate();
          };
          
          // 随机延迟启动动画
          setTimeout(animateBulge, Math.random() * 2000);
        });
      };

      drawLinks();

      // 绘制节点
      const drawNodes = () => {
        data.nodes.forEach((node) => {
          const pos = nodePositions.get(node.id);
          if (!pos) return;
          
          const nodeGroup = new PIXI.Container();
          nodeGroup.x = pos.x;
          nodeGroup.y = pos.y;
          
          const size = Math.max(15, Math.min(35, Math.sqrt(node.value) * 5));
          const nodeSize = node.isMixer ? size * 1.5 : size;
          
          // 节点颜色
          let fillColor = 0x000000;
          let strokeColor = 0x4b5563;
          
          // 检查是否是 MAJOR HUB（橙色）
          const isMajorHub = node.mixerName === 'MAJOR HUB';
          
          if (node.group === "mixer") {
            if (isMajorHub) {
              fillColor = 0xc2410c; // 橙色深色
              strokeColor = 0xf97316; // 橙色亮色
            } else {
              fillColor = 0x581c87; // 紫色深色
              strokeColor = 0xa855f7; // 紫色亮色
            }
          } else if (node.group === "attacker") {
            fillColor = 0x7f1d1d;
            strokeColor = 0xef4444;
          } else if (node.group === "victim") {
            fillColor = 0x0891b2;
            strokeColor = 0x06b6d4;
          }
          
          // 绘制外框（如果是特殊节点）- 带虚线动画
          if (node.isMixer || node.isBinance) {
            const frameColor = node.isBinance ? 0xf59e0b : isMajorHub ? 0xf97316 : 0xa855f7;
            const frame = new PIXI.Graphics();
            
            const dashLength = 5;
            const gapLength = 5;
            const x = -60, y = -70, w = 120, h = 120, r = 8;
            
            // 简化的虚线绘制 - 使用setLineDash
            let dashOffset = 0;
            
            const drawDashedRect = () => {
              if (!frame.context) return;
              try {
                frame.clear();
                
                // 设置虚线样式
                frame.setStrokeStyle({
                  width: 3,
                  color: frameColor,
                  alpha: 1,
                });
                
                // 绘制圆角矩形路径
                frame.roundRect(x, y, w, h, r);
                
                // 手动绘制虚线效果
                const perimeter = 2 * (w + h) - 8 * r + 2 * Math.PI * r;
                const totalDash = dashLength + gapLength;
                const numSegments = Math.ceil(perimeter / totalDash);
                
                // 绘制四条边的虚线
                const drawDashedLine = (x1: number, y1: number, x2: number, y2: number) => {
                  const dx = x2 - x1;
                  const dy = y2 - y1;
                  const length = Math.sqrt(dx * dx + dy * dy);
                  const angle = Math.atan2(dy, dx);
                  
                  let currentDist = -dashOffset;
                  let isDash = true;
                  
                  while (currentDist < length) {
                    const segmentLength = isDash ? dashLength : gapLength;
                    const startDist = Math.max(0, currentDist);
                    const endDist = Math.min(length, currentDist + segmentLength);
                    
                    if (isDash && endDist > startDist) {
                      const startX = x1 + Math.cos(angle) * startDist;
                      const startY = y1 + Math.sin(angle) * startDist;
                      const endX = x1 + Math.cos(angle) * endDist;
                      const endY = y1 + Math.sin(angle) * endDist;
                      
                      frame.moveTo(startX, startY);
                      frame.lineTo(endX, endY);
                    }
                    
                    currentDist += segmentLength;
                    isDash = !isDash;
                  }
                };
                
                // 绘制四条边
                drawDashedLine(x + r, y, x + w - r, y); // 顶部
                drawDashedLine(x + w, y + r, x + w, y + h - r); // 右侧
                drawDashedLine(x + w - r, y + h, x + r, y + h); // 底部
                drawDashedLine(x, y + h - r, x, y + r); // 左侧
                
                // 绘制四个圆角
                const drawDashedArc = (cx: number, cy: number, radius: number, startAngle: number, endAngle: number) => {
                  const arcLength = radius * (endAngle - startAngle);
                  let currentDist = -dashOffset;
                  let isDash = true;
                  
                  while (currentDist < arcLength) {
                    const segmentLength = isDash ? dashLength : gapLength;
                    const startDist = Math.max(0, currentDist);
                    const endDist = Math.min(arcLength, currentDist + segmentLength);
                    
                    if (isDash && endDist > startDist) {
                      const startAngleRad = startAngle + startDist / radius;
                      const endAngleRad = startAngle + endDist / radius;
                      
                      for (let a = startAngleRad; a < endAngleRad; a += 0.1) {
                        const px = cx + radius * Math.cos(a);
                        const py = cy + radius * Math.sin(a);
                        if (a === startAngleRad) {
                          frame.moveTo(px, py);
                        } else {
                          frame.lineTo(px, py);
                        }
                      }
                    }
                    
                    currentDist += segmentLength;
                    isDash = !isDash;
                  }
                };
                
                drawDashedArc(x + w - r, y + r, r, -Math.PI/2, 0); // 右上
                drawDashedArc(x + w - r, y + h - r, r, 0, Math.PI/2); // 右下
                drawDashedArc(x + r, y + h - r, r, Math.PI/2, Math.PI); // 左下
                drawDashedArc(x + r, y + r, r, Math.PI, Math.PI * 1.5); // 左上
                
                frame.stroke();
              } catch (e) {
                // 忽略错误
              }
            };
            
            drawDashedRect();
            nodeGroup.addChild(frame);
            
            // 添加虚线动画
            const animateDash = () => {
              dashOffset = (dashOffset + 0.3) % (dashLength + gapLength);
              drawDashedRect();
            };
            
            // 使用ticker添加动画
            if (appRef.current) {
              appRef.current.ticker.add(animateDash);
            }
          }
          
          // 绘制六边形
          const hexGraphics = new PIXI.Graphics();
          drawHexagon(hexGraphics, 0, 0, nodeSize);
          hexGraphics.fill({ color: fillColor, alpha: 1 });
          hexGraphics.stroke({ width: node.isMixer ? 3 : 2, color: strokeColor, alpha: 1 });
          nodeGroup.addChild(hexGraphics);
          
          // 添加标签
          if (node.isMixer || node.isBinance) {
            const labelBg = new PIXI.Graphics();
            const bgColor = node.isBinance ? 0xf59e0b : isMajorHub ? 0xf97316 : 0xa855f7;
            labelBg.roundRect(-55, -65, 110, 20, 4);
            labelBg.fill({ color: bgColor, alpha: 1 });
            nodeGroup.addChild(labelBg);
            
            const labelText = new PIXI.Text({
              text: node.mixerName || (node.isBinance ? 'BINANCE' : 'MIXER'),
              style: {
                fontFamily: 'monospace',
                fontSize: 10,
                fontWeight: 'bold',
                fill: 0xffffff,
              }
            });
            labelText.anchor.set(0.5);
            labelText.y = -55;
            nodeGroup.addChild(labelText);
          }
          
          // 节点 ID 文本
          const idText = new PIXI.Text({
            text: node.id.substring(0, 6),
            style: {
              fontFamily: 'monospace',
              fontSize: 8,
              fill: 0xffffff,
            }
          });
          idText.anchor.set(0.5);
          nodeGroup.addChild(idText);
          
          // 交互
          nodeGroup.eventMode = 'static';
          nodeGroup.cursor = 'grab';
          nodeGroup.hitArea = new PIXI.Circle(0, 0, nodeSize + 10);
          
          nodeGroup.on('pointerover', () => setHoveredNode(node));
          nodeGroup.on('pointerout', () => setHoveredNode(null));
          
          // 使用闭包保存拖拽状态
          let dragState = {
            isDragging: false,
            hasMoved: false,
            offset: { x: 0, y: 0 }
          };
          
          nodeGroup.on('pointerdown', (e) => {
            e.stopPropagation();
            dragState.isDragging = true;
            dragState.hasMoved = false;
            nodeGroup.cursor = 'grabbing';
            
            const globalPos = e.global;
            const localPos = mainContainer.toLocal(globalPos);
            dragState.offset.x = localPos.x - pos.x;
            dragState.offset.y = localPos.y - pos.y;
            
            // 全局监听移动和释放
            const onMove = (e: any) => {
              if (dragState.isDragging) {
                dragState.hasMoved = true;
                const globalPos = e.global;
                const localPos = mainContainer.toLocal(globalPos);
                pos.x = localPos.x - dragState.offset.x;
                pos.y = localPos.y - dragState.offset.y;
                nodeGroup.x = pos.x;
                nodeGroup.y = pos.y;
                updateConnectedLinks(node.id);
              }
            };
            
            const onUp = (e: any) => {
              if (dragState.isDragging) {
                dragState.isDragging = false;
                nodeGroup.cursor = 'grab';
                
                if (!dragState.hasMoved) {
                  setSelectedNode(node);
                }
                
                app.stage.off('pointermove', onMove);
                app.stage.off('pointerup', onUp);
                app.stage.off('pointerupoutside', onUp);
              }
            };
            
            app.stage.on('pointermove', onMove);
            app.stage.on('pointerup', onUp);
            app.stage.on('pointerupoutside', onUp);
          });
          
          nodeContainer.addChild(nodeGroup);
          nodeGraphicsRef.current.set(node.id, nodeGroup);
        });
      };
      
      // 更新连接的链接 - 需要保持选中状态的颜色
      const updateConnectedLinks = (nodeId: string) => {
        linkGraphicsRef.current.forEach((linkRef, key) => {
          const parts = key.split('-');
          const sourceId = parts[0];
          const targetId = parts[1];
          
          if (sourceId === nodeId || targetId === nodeId) {
            const sourcePos = nodePositions.get(sourceId);
            const targetPos = nodePositions.get(targetId);
            
            if (sourcePos && targetPos) {
              const dx = targetPos.x - sourcePos.x;
              const controlX = sourcePos.x + dx / 2;
              const controlY = sourcePos.y;
              
              const link = data.links.find(l => {
                const lSourceId = typeof l.source === 'object' ? l.source.id : l.source;
                const lTargetId = typeof l.target === 'object' ? l.target.id : l.target;
                return lSourceId === sourceId && lTargetId === targetId;
              });
              
              if (link) {
                try { linkRef.line.clear(); } catch(e) { return; }
                
                // 检查当前选中状态，决定颜色和粗细（使用ref获取最新状态）
                const currentSelected = selectedNodeRef.current;
                const isRelated = currentSelected && (sourceId === currentSelected.id || targetId === currentSelected.id);
                
                let color: number;
                let width: number;
                let alpha: number;
                
                if (!currentSelected) {
                  // 未选中：币种颜色
                  color = parseInt(getEdgeColor(link.asset).replace('#', ''), 16);
                  width = Math.min(Math.sqrt(link.value) + 1, 5);
                  alpha = 0.5;
                } else if (isRelated) {
                  // 选中相关：红绿色，线条更粗
                  const isIncoming = targetId === currentSelected.id;
                  color = isIncoming ? 0x10b981 : 0xef4444;
                  width = Math.min(Math.sqrt(link.value) + 2, 7);
                  alpha = 0.9;
                } else {
                  // 选中但不相关：币种颜色但降低透明度
                  color = parseInt(getEdgeColor(link.asset).replace('#', ''), 16);
                  width = Math.min(Math.sqrt(link.value) + 1, 5);
                  alpha = 0.15;
                }
                
                linkRef.line.moveTo(sourcePos.x, sourcePos.y);
                linkRef.line.quadraticCurveTo(controlX, controlY, targetPos.x, targetPos.y);
                linkRef.line.stroke({ width, color, alpha });
                
                // 箭头
                const angle = Math.atan2(targetPos.y - controlY, targetPos.x - controlX);
                const arrowSize = 8 + width * 0.5;
                linkRef.line.beginPath();
                linkRef.line.moveTo(targetPos.x, targetPos.y);
                linkRef.line.lineTo(
                  targetPos.x - arrowSize * Math.cos(angle - Math.PI / 6),
                  targetPos.y - arrowSize * Math.sin(angle - Math.PI / 6)
                );
                linkRef.line.lineTo(
                  targetPos.x - arrowSize * Math.cos(angle + Math.PI / 6),
                  targetPos.y - arrowSize * Math.sin(angle + Math.PI / 6)
                );
                linkRef.line.closePath();
                linkRef.line.fill({ color, alpha: Math.min(alpha * 1.5, 1) }); // 箭头更明显
              }
            }
          }
        });
      };

      drawNodes();

      // 缩放和拖拽画布
      let isDraggingCanvas = false;
      let dragStart = { x: 0, y: 0 };
      
      // 鼠标滚轮缩放
      app.canvas.addEventListener('wheel', (e: WheelEvent) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        const newScale = Math.max(0.1, Math.min(4, mainContainer.scale.x * delta));
        mainContainer.scale.set(newScale);
      });
      
      // 画布拖拽和点击空白取消选中
      app.stage.eventMode = 'static';
      app.stage.hitArea = app.screen;
      
      let canvasClickStart = { x: 0, y: 0 };
      let canvasHasMoved = false;
      
      app.stage.on('pointerdown', (e) => {
        // 只有点击空白区域才拖拽画布
        if (e.target === app.stage) {
          isDraggingCanvas = true;
          canvasHasMoved = false;
          canvasClickStart = { x: e.global.x, y: e.global.y };
          dragStart = { x: e.global.x - mainContainer.x, y: e.global.y - mainContainer.y };
        }
      });
      
      app.stage.on('pointermove', (e) => {
        if (isDraggingCanvas) {
          const dx = e.global.x - canvasClickStart.x;
          const dy = e.global.y - canvasClickStart.y;
          if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            canvasHasMoved = true;
          }
          mainContainer.x = e.global.x - dragStart.x;
          mainContainer.y = e.global.y - dragStart.y;
        }
      });
      
      app.stage.on('pointerup', (e) => {
        if (isDraggingCanvas) {
          // 如果没有移动，说明是点击，取消选中
          if (!canvasHasMoved && e.target === app.stage) {
            setSelectedNode(null);
          }
          isDraggingCanvas = false;
        }
      });
      
      app.stage.on('pointerupoutside', () => {
        isDraggingCanvas = false;
      });
    })();

    return () => {
      // 清理所有动画
      linkGraphicsRef.current.forEach((linkRef) => {
        linkRef.animating = false; // 停止鼓包动画
      });
      
      if (appRef.current) {
        appRef.current.destroy(true, { children: true, texture: true, baseTexture: true });
        appRef.current = null;
      }
    };
  }, [data, dimensions]);

  // 更新选中状态 - 带平滑动画
  useEffect(() => {
    if (!appRef.current) return;
    
    const duration = 300; // 动画持续时间（毫秒）
    const startTime = Date.now();
    let animationFrameId: number | null = null;
    
    // 存储每条线的起始和目标状态
    const linkStates = new Map<string, {
      startWidth: number;
      startAlpha: number;
      startColor: number;
      targetWidth: number;
      targetAlpha: number;
      targetColor: number;
    }>();
    
    // 计算每条线的目标状态
    linkGraphicsRef.current.forEach((linkRef, key) => {
      const parts = key.split('-');
      const sourceId = parts[0];
      const targetId = parts[1];
      
      const link = data.links.find(l => {
        const lSourceId = typeof l.source === 'object' ? l.source.id : l.source;
        const lTargetId = typeof l.target === 'object' ? l.target.id : l.target;
        return lSourceId === sourceId && lTargetId === targetId;
      });
      
      if (!link) return;
      
      const isRelated = selectedNode && (sourceId === selectedNode.id || targetId === selectedNode.id);
      
      // 获取当前状态（从graphics对象读取）
      const currentAlpha = linkRef.line.alpha || 0.5;
      // 估算当前宽度（无法直接读取，使用默认值）
      const currentWidth = Math.min(Math.sqrt(link.value) + 1, 5);
      const currentColor = parseInt(getEdgeColor(link.asset).replace('#', ''), 16);
      
      let targetWidth: number;
      let targetAlpha: number;
      let targetColor: number;
      
      if (!selectedNode) {
        targetColor = parseInt(getEdgeColor(link.asset).replace('#', ''), 16);
        targetWidth = Math.min(Math.sqrt(link.value) + 1, 5);
        targetAlpha = 0.5;
      } else if (isRelated) {
        const isIncoming = targetId === selectedNode.id;
        targetColor = isIncoming ? 0x10b981 : 0xef4444;
        targetWidth = Math.min(Math.sqrt(link.value) + 2, 7);
        targetAlpha = 0.9;
      } else {
        targetColor = parseInt(getEdgeColor(link.asset).replace('#', ''), 16);
        targetWidth = Math.min(Math.sqrt(link.value) + 1, 5);
        targetAlpha = 0.15;
      }
      
      linkStates.set(key, {
        startWidth: currentWidth,
        startAlpha: currentAlpha,
        startColor: currentColor,
        targetWidth,
        targetAlpha,
        targetColor,
      });
    });
    
    // 动画循环
    const animate = () => {
      if (!appRef.current) return; // 检查app是否还存在
      
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // 使用缓动函数（ease-out）
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      linkGraphicsRef.current.forEach((linkRef, key) => {
        if (!linkRef.line.context) return; // 检查graphics是否已销毁
        const parts = key.split('-');
        const sourceId = parts[0];
        const targetId = parts[1];
        
        const sourcePos = nodePositionsRef.current.get(sourceId);
        const targetPos = nodePositionsRef.current.get(targetId);
        
        if (!sourcePos || !targetPos) return;
        
        const state = linkStates.get(key);
        if (!state) return;
        
        // 插值计算当前值
        const currentWidth = state.startWidth + (state.targetWidth - state.startWidth) * easeProgress;
        const currentAlpha = state.startAlpha + (state.targetAlpha - state.startAlpha) * easeProgress;
        
        // 颜色插值
        const startR = (state.startColor >> 16) & 0xff;
        const startG = (state.startColor >> 8) & 0xff;
        const startB = state.startColor & 0xff;
        const targetR = (state.targetColor >> 16) & 0xff;
        const targetG = (state.targetColor >> 8) & 0xff;
        const targetB = state.targetColor & 0xff;
        
        const currentR = Math.round(startR + (targetR - startR) * easeProgress);
        const currentG = Math.round(startG + (targetG - startG) * easeProgress);
        const currentB = Math.round(startB + (targetB - startB) * easeProgress);
        const currentColor = (currentR << 16) | (currentG << 8) | currentB;
        
        // 重绘线条
        const dx = targetPos.x - sourcePos.x;
        const controlX = sourcePos.x + dx / 2;
        const controlY = sourcePos.y;
        
        try { linkRef.line.clear(); } catch(e) { return; }
        linkRef.line.moveTo(sourcePos.x, sourcePos.y);
        linkRef.line.quadraticCurveTo(controlX, controlY, targetPos.x, targetPos.y);
        linkRef.line.stroke({ width: currentWidth, color: currentColor, alpha: currentAlpha });
        
        // 箭头 - 大小随线条粗细动画变化
        const angle = Math.atan2(targetPos.y - controlY, targetPos.x - controlX);
        const arrowSize = 8 + currentWidth * 0.5; // 箭头大小随线条粗细变化
        linkRef.line.beginPath();
        linkRef.line.moveTo(targetPos.x, targetPos.y);
        linkRef.line.lineTo(
          targetPos.x - arrowSize * Math.cos(angle - Math.PI / 6),
          targetPos.y - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        linkRef.line.lineTo(
          targetPos.x - arrowSize * Math.cos(angle + Math.PI / 6),
          targetPos.y - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        linkRef.line.closePath();
        linkRef.line.fill({ color: currentColor, alpha: Math.min(currentAlpha * 1.5, 1) }); // 箭头更明显
      });
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
    
    // 清理函数
    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [selectedNode, data.links]);

  const getNodeTransactions = (node: GraphNode) => {
    return data.links.filter((l) => {
      const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
      const targetId = typeof l.target === 'object' ? l.target.id : l.target;
      return sourceId === node.id || targetId === node.id;
    });
  };

  // 计算节点的总交易量（以 USD 计）
  const calculateTotalVolumeUSD = (node: GraphNode) => {
    const transactions = getNodeTransactions(node);
    const exchangeRates: { [key: string]: number } = {
      'USDT': 1,
      'USDC': 1,
      'DAI': 1,
      'ETH': 3000,
      'WETH': 3000,
      'BTC': 60000,
      'WBTC': 60000,
    };
    
    let totalUSD = 0;
    transactions.forEach(link => {
      const asset = link.asset || 'ETH';
      const rate = exchangeRates[asset] || 1;
      totalUSD += link.value * rate;
    });
    
    return totalUSD;
  };

  return (
    <div ref={containerRef} className="w-full h-full relative bg-gray-950 overflow-hidden">
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle at center, #ef4444 0%, transparent 60%)",
          mixBlendMode: "color-dodge",
        }}
      />

      {/* 动态图例 - 显示当前数据中使用的资产/方法 */}
      <div className="absolute bottom-4 left-4 bg-black/80 border border-gray-700 p-3 rounded text-xs font-mono z-40">
        <div className="text-gray-400 mb-2 text-[10px]">LEGEND</div>
        <div className="flex flex-wrap gap-2 max-w-md">
          {Array.from(new Set(data.links.map(l => l.asset))).map((asset: string) => {
            const color = getEdgeColor(asset);
            return (
              <div key={asset} className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }}></div>
                <span className="text-gray-300 text-[10px]">{asset}</span>
              </div>
            );
          })}
        </div>
      </div>

      {hoveredNode && !selectedNode && (
        <div className="absolute top-4 left-4 bg-black/90 border border-red-500 p-3 rounded text-xs font-mono max-w-sm pointer-events-none shadow-[0_0_15px_rgba(239,68,68,0.5)] z-40">
          <h3 className="text-red-400 font-bold mb-1">ID: {hoveredNode.id.substring(0, 8)}...</h3>
          <div className="text-gray-400">CLICK TO INSPECT</div>
        </div>
      )}

      <div
        className={`absolute top-0 right-0 bottom-0 w-96 bg-black/85 border-l border-red-900/50 backdrop-blur-md p-6 transform transition-transform duration-300 z-50 flex flex-col font-mono overflow-hidden ${
          selectedNode ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {selectedNode && (
          <>
            <div className="flex justify-between items-start mb-6 border-b border-red-900/30 pb-4">
              <div>
                <h2 className="text-xl font-bold text-cyan-400 font-['Rajdhani']">TARGET_ANALYSIS</h2>
                <div className="text-[10px] text-gray-500 mt-1">HEX_ID: {selectedNode.index} // LAYER_2</div>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-red-500 hover:text-white transition-colors">
                [X]
              </button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-2 hide-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 tracking-widest">IDENTITY_MATRIX</label>
                <div className="bg-red-900/10 border border-red-900/30 p-3 rounded break-all">
                  <div className="text-xs text-gray-300 mb-1">WALLET_ADDRESS</div>
                  <div className="text-sm font-bold text-white font-mono">{selectedNode.id}</div>
                  {selectedNode.mixerName && (
                    <div className={`mt-2 inline-block px-2 py-1 ${selectedNode.mixerName === 'MAJOR HUB' ? 'bg-orange-900/50 border-orange-500 text-orange-300' : 'bg-purple-900/50 border-purple-500 text-purple-300'} border rounded text-xs font-bold animate-pulse`}>
                      {selectedNode.mixerName === 'MAJOR HUB' ? '🔶' : '🔷'} {selectedNode.mixerName}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-red-900/10 border border-red-900/30 p-3 rounded">
                    <div className="text-[10px] text-gray-500">THREAT_TYPE</div>
                    <div className={`text-lg font-bold ${selectedNode.group === "attacker" ? "text-red-500 animate-pulse" : selectedNode.mixerName === 'MAJOR HUB' ? "text-orange-400 animate-pulse" : selectedNode.mixerName ? "text-purple-400 animate-pulse" : "text-emerald-400"}`}>
                      {selectedNode.group.toUpperCase()}
                    </div>
                  </div>
                  <div className="bg-red-900/10 border border-red-900/30 p-3 rounded">
                    <div className="text-[10px] text-gray-500">RISK_SCORE</div>
                    <div className="text-lg font-bold text-white">{(selectedNode.value * 1.5).toFixed(0)}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 tracking-widest">NETWORK_TELEMETRY</label>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-black border border-gray-800 p-2">
                    <div className="text-xs text-gray-500">LINKS</div>
                    <div className="text-cyan-400 font-bold">{selectedNode.connectionCount}</div>
                  </div>
                  <div className="bg-black border border-gray-800 p-2 col-span-2">
                    <div className="text-xs text-gray-500">TOTAL_VOLUME</div>
                    <div className="text-cyan-400 font-bold">${calculateTotalVolumeUSD(selectedNode).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 tracking-widest">TRANSACTION_LOG</label>
                <div className="space-y-2 max-h-64 overflow-y-auto hide-scrollbar">
                  {getNodeTransactions(selectedNode).map((link, i) => {
                    const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                    const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                    const isIncoming = targetId === selectedNode.id;
                    const otherAddress = isIncoming ? sourceId : targetId;
                    const assetColor = getEdgeColor(link.asset);
                    
                    return (
                      <div
                        key={i}
                        className="p-2 border-l-2 text-xs"
                        style={{ 
                          borderLeftColor: assetColor,
                          backgroundColor: `${assetColor}15`
                        }}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={isIncoming ? "text-emerald-400" : "text-red-400"}>
                            {isIncoming ? "← IN" : "→ OUT"}
                          </span>
                          <div className="flex items-center gap-2">
                            <span 
                              className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                              style={{ backgroundColor: assetColor, color: '#fff' }}
                            >
                              {link.asset}
                            </span>
                            <span className="text-white font-bold">{link.value.toFixed(3)}</span>
                          </div>
                        </div>
                        <div className="text-gray-500 truncate text-[10px]">
                          {isIncoming ? `FROM: ${otherAddress.slice(0, 10)}...${otherAddress.slice(-6)}` : `TO: ${otherAddress.slice(0, 10)}...${otherAddress.slice(-6)}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CyberGraphPixi;
