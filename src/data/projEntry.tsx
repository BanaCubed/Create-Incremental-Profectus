import Board from "features/boards/Board.vue";
import CircleProgress from "features/boards/CircleProgress.vue";
import SVGNode from "features/boards/SVGNode.vue";
import SquareProgress from "features/boards/SquareProgress.vue";
import {
    NodePosition,
    makeDraggable,
    placeInAvailableSpace,
    setupActions,
    setupDraggableNode,
    setupSelectable,
    setupUniqueIds
} from "features/boards/board";
import { jsx } from "features/feature";
import { createResource } from "features/resources/resource";
import { createUpgrade } from "features/upgrades/upgrade";
import type { BaseLayer, GenericLayer } from "game/layers";
import { createLayer } from "game/layers";
import { Persistent, persistent } from "game/persistence";
import type { Player } from "game/player";
import { createCostRequirement } from "game/requirements";
import { render } from "util/vue";
import { ComponentPublicInstance, computed, ref, watch } from "vue";
import "./common.css";

/**
 * @hidden
 */
export const main = createLayer("main", function (this: BaseLayer) {
    type ANode = NodePosition & { id: number; links: number[]; type: "anode" };
    type BNode = NodePosition & { id: number; links: number[]; type: "bnode" };
    type CNode = typeof cNode & { position: Persistent<NodePosition> };
    type NodeTypes = ANode | BNode;

    const board = ref<ComponentPublicInstance<typeof Board>>();

    const { select, deselect, selected } = setupSelectable<number>();
    const {
        select: selectAction,
        deselect: deselectAction,
        selected: selectedAction
    } = setupSelectable<number>();

    watch(selected, selected => {
        if (selected == null) {
            deselectAction();
        }
    });

    const {
        startDrag,
        endDrag,
        drag,
        nodeBeingDragged,
        hasDragged,
        receivingNodes,
        receivingNode,
        dragDelta
    } = setupDraggableNode<number | "cnode">({
        board,
        getPosition(id) {
            return nodesById.value[id] ?? (cNode as CNode).position.value;
        },
        setPosition(id, position) {
            const node = nodesById.value[id] ?? (cNode as CNode).position.value;
            node.x = position.x;
            node.y = position.y;
        }
    });

    // a nodes can be slotted into b nodes to draw a branch between them, with limited connections
    // a nodes can be selected and have an action to spawn a b node, and vice versa
    // Newly spawned nodes should find a safe spot to spawn, and display a link to their creator
    // a nodes use all the stuff circles used to have, and b diamonds
    // c node also exists but is a single Upgrade element that cannot be selected, but can be dragged
    // d nodes are a performance test - 1000 simple nodes that have no interactions
    // Make all nodes animate in (decorator? `fadeIn(feature)?)
    const nodes = persistent<(ANode | BNode)[]>([{ id: 0, x: 0, y: 0, links: [], type: "anode" }]);
    const nodesById = computed<Record<string, NodeTypes>>(() =>
        nodes.value.reduce((acc, curr) => ({ ...acc, [curr.id]: curr }), {})
    );
    function mouseDownNode(e: MouseEvent | TouchEvent, node: NodeTypes) {
        if (nodeBeingDragged.value == null) {
            startDrag(e, node.id);
        }
        deselect();
    }
    function mouseUpNode(e: MouseEvent | TouchEvent, node: NodeTypes) {
        if (!hasDragged.value) {
            endDrag();
            if (typeof node.id === "number") {
                select(node.id);
            }
            e.stopPropagation();
        }
    }
    function getTranslateString(node: NodePosition, isDragging: boolean) {
        let x = node.x;
        let y = node.y;
        if (isDragging) {
            x += dragDelta.value.x;
            y += dragDelta.value.y;
        }
        return ` translate(${x}px,${y}px)`;
    }
    function getRotateString(rotation: number) {
        return ` rotate(${rotation}deg) `;
    }
    function getScaleString(nodeOrBool: NodeTypes | boolean) {
        const isSelected =
            typeof nodeOrBool === "boolean" ? nodeOrBool : selected.value === nodeOrBool.id;
        return isSelected ? " scale(1.2)" : "";
    }
    function getOpacityString(node: NodeTypes) {
        const isDragging = selected.value !== node.id && nodeBeingDragged.value === node.id;
        if (isDragging) {
            return "; opacity: 0.5;";
        }
        return "";
    }

    const renderANode = function (node: ANode) {
        return (
            <SVGNode
                style={`transform: ${getTranslateString(
                    node,
                    selected.value === node.id && nodeBeingDragged.value === node.id
                )}${getOpacityString(node)}`}
                onMouseDown={e => mouseDownNode(e, node)}
                onMouseUp={e => mouseUpNode(e, node)}
            >
                <g style={`transform: ${getScaleString(node)}`}>
                    {receivingNodes.value.includes(node.id) && (
                        <circle
                            r="58"
                            fill="var(--background)"
                            stroke={receivingNode.value === node.id ? "#0F0" : "#0F03"}
                            stroke-width="2"
                        />
                    )}
                    <CircleProgress r={54.5} progress={0.5} stroke="var(--accent2)" />
                    <circle
                        r="50"
                        fill="var(--raised-background)"
                        stroke="var(--outline)"
                        stroke-width="4"
                    />
                </g>
                {selected.value === node.id && selectedAction.value === 0 && (
                    <text y="140" fill="var(--foreground)" class="node-text">
                        Spawn B Node
                    </text>
                )}
                <text fill="var(--foreground)" class="node-text">
                    A
                </text>
            </SVGNode>
        );
    };
    const aActions = setupActions({
        node: () => nodesById.value[selected.value ?? ""],
        shouldShowActions: node => node.type === "anode",
        actions(node) {
            return [
                p => (
                    <g
                        style={`transform: ${getTranslateString(
                            p,
                            selectedAction.value === 0
                        )}${getScaleString(selectedAction.value === 0)}`}
                        onClick={() => {
                            if (selectedAction.value === 0) {
                                spawnBNode(node as ANode);
                            } else {
                                selectAction(0);
                            }
                        }}
                    >
                        <circle fill="black" r="20"></circle>
                        <text fill="white" class="material-icons" x="-12" y="12">
                            add
                        </text>
                    </g>
                )
            ];
        },
        distance: 100
    });
    const sqrtTwo = Math.sqrt(2);
    const renderBNode = function (node: BNode) {
        return (
            <SVGNode
                style={`transform: ${getTranslateString(
                    node,
                    selected.value === node.id && nodeBeingDragged.value === node.id
                )}${getOpacityString(node)}`}
                onMouseDown={e => mouseDownNode(e, node)}
                onMouseUp={e => mouseUpNode(e, node)}
            >
                <g style={`transform: ${getScaleString(node)}${getRotateString(45)}`}>
                    {receivingNodes.value.includes(node.id) && (
                        <rect
                            width={50 * sqrtTwo + 16}
                            height={50 * sqrtTwo + 16}
                            style={`translate(${(-50 * sqrtTwo + 16) / 2}, ${
                                (-50 * sqrtTwo + 16) / 2
                            })`}
                            fill="var(--background)"
                            stroke={receivingNode.value === node.id ? "#0F0" : "#0F03"}
                            stroke-width="2"
                        />
                    )}
                    <SquareProgress
                        size={50 * sqrtTwo + 9}
                        progress={0.5}
                        stroke="var(--accent2)"
                    />
                    <rect
                        width={50 * sqrtTwo}
                        height={50 * sqrtTwo}
                        style={`transform: translate(${(-50 * sqrtTwo) / 2}px, ${
                            (-50 * sqrtTwo) / 2
                        }px)`}
                        fill="var(--raised-background)"
                        stroke="var(--outline)"
                        stroke-width="4"
                    />
                </g>
                {selected.value === node.id && selectedAction.value === 0 && (
                    <text y="140" fill="var(--foreground)" class="node-text">
                        Spawn A Node
                    </text>
                )}
                <text fill="var(--foreground)" class="node-text">
                    B
                </text>
            </SVGNode>
        );
    };
    const bActions = setupActions({
        node: () => nodesById.value[selected.value ?? ""],
        shouldShowActions: node => node.type === "bnode",
        actions(node) {
            return [
                p => (
                    <g
                        style={`transform: ${getTranslateString(
                            p,
                            selectedAction.value === 0
                        )}${getScaleString(selectedAction.value === 0)}`}
                        onClick={() => {
                            if (selectedAction.value === 0) {
                                spawnANode(node as BNode);
                            } else {
                                selectAction(0);
                            }
                        }}
                    >
                        <circle fill="white" r="20"></circle>
                        <text fill="black" class="material-icons" x="-12" y="12">
                            add
                        </text>
                    </g>
                )
            ];
        },
        distance: 100
    });
    function spawnANode(parent: ANode | BNode) {
        const node: ANode = {
            x: parent.x,
            y: parent.y,
            type: "anode",
            links: [parent.id],
            id: nextId.value
        };
        placeInAvailableSpace(node, nodes.value);
        nodes.value.push(node);
    }
    function spawnBNode(parent: ANode | BNode) {
        const node: BNode = {
            x: parent.x,
            y: parent.y,
            type: "bnode",
            links: [parent.id],
            id: nextId.value
        };
        placeInAvailableSpace(node, nodes.value);
        nodes.value.push(node);
    }

    const points = createResource(10);
    const cNode = createUpgrade(() => ({
        display: "<h1>C</h1>",
        // Purposefully not using noPersist
        requirements: createCostRequirement(() => ({ cost: 10, resource: points })),
        style: {
            x: "100px",
            y: "100px"
        }
    }));
    makeDraggable(cNode, {
        id: "cnode",
        endDrag,
        startDrag,
        hasDragged,
        nodeBeingDragged,
        dragDelta,
        onMouseUp() {
            if (!hasDragged.value) {
                cNode.purchase();
            }
        }
    });

    // const dNodes;

    const links = jsx(() => (
        <>
            {nodes.value
                .reduce(
                    (acc, curr) => [
                        ...acc,
                        ...curr.links.map(l => ({ from: curr, to: nodesById.value[l] }))
                    ],
                    [] as { from: NodeTypes; to: NodeTypes }[]
                )
                .map(link => (
                    <line
                        stroke="white"
                        stroke-width={4}
                        x1={
                            nodeBeingDragged.value === link.from.id
                                ? dragDelta.value.x + link.from.x
                                : link.from.x
                        }
                        y1={
                            nodeBeingDragged.value === link.from.id
                                ? dragDelta.value.y + link.from.y
                                : link.from.y
                        }
                        x2={
                            nodeBeingDragged.value === link.to.id
                                ? dragDelta.value.x + link.to.x
                                : link.to.x
                        }
                        y2={
                            nodeBeingDragged.value === link.to.id
                                ? dragDelta.value.y + link.to.y
                                : link.to.y
                        }
                    />
                ))}
        </>
    ));

    const nextId = setupUniqueIds(() => nodes.value);

    function filterNodes(n: number | "cnode") {
        return n !== nodeBeingDragged.value && n !== selected.value;
    }

    function renderNodeById(id: number | "cnode" | undefined) {
        if (id == null) {
            return undefined;
        }
        return renderNode(nodesById.value[id] ?? cNode);
    }

    function renderNode(node: NodeTypes | typeof cNode) {
        if (node.type === "anode") {
            return renderANode(node);
        } else if (node.type === "bnode") {
            return renderBNode(node);
        } else {
            return render(node);
        }
    }

    return {
        name: "Tree",
        color: "var(--accent1)",
        display: jsx(() => (
            <>
                <Board
                    onDrag={drag}
                    onMouseDown={deselect}
                    onMouseUp={endDrag}
                    onMouseLeave={endDrag}
                    ref={board}
                >
                    <SVGNode>{links()}</SVGNode>
                    {nodes.value.filter(n => filterNodes(n.id)).map(renderNode)}
                    {filterNodes("cnode") && render(cNode)}
                    <SVGNode>
                        {aActions()}
                        {bActions()}
                    </SVGNode>
                    {renderNodeById(selected.value)}
                    {renderNodeById(nodeBeingDragged.value)}
                </Board>
            </>
        )),
        boardNodes: nodes,
        cNode,
        selected: persistent(selected)
    };
});

/**
 * Given a player save data object being loaded, return a list of layers that should currently be enabled.
 * If your project does not use dynamic layers, this should just return all layers.
 */
export const getInitialLayers = (
    /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
    player: Partial<Player>
): Array<GenericLayer> => [main];

/**
 * A computed ref whose value is true whenever the game is over.
 */
export const hasWon = computed(() => {
    return false;
});

/**
 * Given a player save data object being loaded with a different version, update the save data object to match the structure of the current version.
 * @param oldVersion The version of the save being loaded in
 * @param player The save data being loaded in
 */
/* eslint-disable @typescript-eslint/no-unused-vars */
export function fixOldSave(
    oldVersion: string | undefined,
    player: Partial<Player>
    // eslint-disable-next-line @typescript-eslint/no-empty-function
): void {}
/* eslint-enable @typescript-eslint/no-unused-vars */
