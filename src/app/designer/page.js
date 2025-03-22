'use client';

import { useState, useCallback, useRef } from 'react';
import ReactFlow, {
    addEdge,
    Background,
    Controls,
    MiniMap,
    Panel,
    useNodesState,
    useEdgesState,
    MarkerType
} from 'reactflow';
import { toPng } from 'html-to-image';
import 'reactflow/dist/style.css';

import ServerNode from '@/components/nodes/ServerNode';
import DatabaseNode from '@/components/nodes/DatabaseNode';
import ClientNode from '@/components/nodes/ClientNode';

import {
    RectangleNode,
    CircleNode,
    OvalNode,
    LineNode,
    ArrowNode
} from '@/components/nodes/shapes';

// import ShapeToolbar from '@/components/designer/ShapeToolbar';
import VerticalShapeToolbar from "@/components/designer/VerticalShapeToolbar";

const nodeTypes = {
    server: ServerNode,
    database: DatabaseNode,
    client: ClientNode,
    rectangle: RectangleNode,
    circle: CircleNode,
    oval: OvalNode,
    line: LineNode,
    arrow: ArrowNode,
};

const initialEdges = [
    { id: 'e1-2', source: '1', target: '2', markerEnd: { type: MarkerType.Arrow } },
    { id: 'e2-3', source: '2', target: '3', markerEnd: { type: MarkerType.Arrow } },
];

export default function SystemDesignApp() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [nodeName, setNodeName] = useState('');
    const [selectedShape, setSelectedShape] = useState(null);
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [nodeToEdit, setNodeToEdit] = useState(null);
    const [editLabel, setEditLabel] = useState('');
    const [isNewNode, setIsNewNode] = useState(false);


    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge({
            ...params,
            markerEnd: { type: MarkerType.Arrow },
            style: { strokeWidth: 2 }
        }, eds)),
        [setEdges]
    );


    const onShapeSelect = useCallback((shapeType) => {
        setSelectedShape(shapeType);
    }, []);

    const onPaneClick = useCallback(
        (event) => {
            if (!selectedShape || !reactFlowInstance) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            // Create default data based on shape type
            let nodeData = { label: nodeName || `New ${selectedShape}` };

            // Add shape-specific properties
            switch (selectedShape) {
                case 'rectangle':
                    nodeData = { ...nodeData, width: 150, height: 75, backgroundColor: '#ffffff' };
                    break;
                case 'circle':
                    nodeData = { ...nodeData, size: 100, backgroundColor: '#ffffff' };
                    break;
                case 'oval':
                    nodeData = { ...nodeData, width: 150, height: 75, backgroundColor: '#ffffff' };
                    break;
                case 'line':
                    nodeData = { ...nodeData, length: 150, backgroundColor: '#000000' };
                    break;
                case 'arrow':
                    nodeData = { ...nodeData, length: 150, backgroundColor: '#000000' };
                    break;
                default:
                    break;
            }

            const newNodeId = `node_${Date.now()}`;

            const newNode = {
                id: newNodeId,
                type: selectedShape,
                position,
                data: nodeData,
            };

            setNodes((nds) => nds.concat(newNode));

            // Set this node for editing immediately if no name was provided
            if (!nodeName) {
                setNodeToEdit(newNodeId);
                setEditLabel(nodeData.label);
                setIsNewNode(true);
            }

            setNodeName('');
            // Keep the selected shape active for multiple additions
        },
        [nodeName, reactFlowInstance, selectedShape, setNodes]
    );

    // const onPaneClick = useCallback(
    //     (event) => {
    //         if (!selectedShape || !reactFlowInstance) {
    //             return;
    //         }
    //
    //         const position = reactFlowInstance.screenToFlowPosition({
    //             x: event.clientX,
    //             y: event.clientY,
    //         });
    //
    //
    //         let nodeData = { label: nodeName || `New ${selectedShape}` };
    //
    //         // Add shape-specific properties
    //         switch (selectedShape) {
    //             case 'rectangle':
    //                 nodeData = { ...nodeData, width: 150, height: 75, backgroundColor: '#ffffff' };
    //                 break;
    //             case 'circle':
    //                 nodeData = { ...nodeData, size: 100, backgroundColor: '#ffffff' };
    //                 break;
    //             case 'oval':
    //                 nodeData = { ...nodeData, width: 150, height: 75, backgroundColor: '#ffffff' };
    //                 break;
    //             case 'line':
    //                 nodeData = { ...nodeData, length: 150, backgroundColor: '#000000' };
    //                 break;
    //             case 'arrow':
    //                 nodeData = { ...nodeData, length: 150, backgroundColor: '#000000' };
    //                 break;
    //             default:
    //                 break;
    //         }
    //
    //         const newNode = {
    //             id: `node_${Date.now()}`,
    //             type: selectedShape,
    //             position,
    //             data: nodeData,
    //         };
    //
    //         setNodes((nds) => nds.concat(newNode));
    //         setNodeName('');
    //         setSelectedShape(null)
    //         // Keep the selected shape active for multiple additions
    //     },
    //     [nodeName, reactFlowInstance, selectedShape, setNodes]
    // );


    const saveDiagram = useCallback(() => {
        if (reactFlowInstance) {
            const flow = reactFlowInstance.toObject();
            localStorage.setItem('systemDesignFlow', JSON.stringify(flow));
            alert('Diagram saved to local storage');
        }
    }, [reactFlowInstance]);


    const loadDiagram = useCallback(() => {
        const savedFlow = localStorage.getItem('systemDesignFlow');
        if (savedFlow) {
            const flow = JSON.parse(savedFlow);
            setNodes(flow.nodes || []);
            setEdges(flow.edges || []);
            alert('Diagram loaded from local storage');
        }
    }, [setNodes, setEdges]);

    const exportAsImage = useCallback(() => {
        if (!reactFlowInstance || !reactFlowWrapper.current) return;

        // Use html-to-image to capture the ReactFlow canvas
        toPng(reactFlowWrapper.current.querySelector('.react-flow'), {
            backgroundColor: '#ffffff',
            quality: 1,
            width: reactFlowWrapper.current.offsetWidth,
            height: reactFlowWrapper.current.offsetHeight,
        }).then((dataUrl) => {
            const link = document.createElement('a');
            link.download = 'system-design.png';
            link.href = dataUrl;
            link.click();
        });
    }, [reactFlowInstance]);


    const onNodeDoubleClick = useCallback((event, node) => {
        event.preventDefault();
        setNodeToEdit(node.id);
        setEditLabel(node.data.label);
        setIsNewNode(false);
    }, []);

    const handleUpdateLabel = useCallback(() => {
        if (nodeToEdit) {
            setNodes((nds) =>
                nds.map((node) => {
                    if (node.id === nodeToEdit) {
                        return {
                            ...node,
                            data: {
                                ...node.data,
                                label: editLabel
                            }
                        };
                    }
                    return node;
                })
            );
            setNodeToEdit(null);
            setIsNewNode(false);
        }
    }, [nodeToEdit, editLabel, setNodes]);

    const handleCancelEdit = useCallback(() => {
        // If it's a new node and the user cancels, we might want to remove it
        if (isNewNode) {
            setNodes((nds) => nds.filter(node => node.id !== nodeToEdit));
        }
        setNodeToEdit(null);
        setIsNewNode(false);
    }, [isNewNode, nodeToEdit, setNodes]);


    return (
        <div
            style={{ width: '100vw', height: '100vh' }}
            ref={reactFlowWrapper}
            className="relative"
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onInit={setReactFlowInstance}
                onNodeDoubleClick={onNodeDoubleClick}
                onPaneClick={onPaneClick}
                fitView
                attributionPosition="bottom-left"
                deleteKeyCode={['Backspace', 'Delete']}
            >
                <Controls />
                <MiniMap />
                <Background />


                <Panel position="top-left" className="p-4 bg-white rounded shadow-md flex flex-col gap-4">
                    <h3 className="text-lg font-bold">System Design Tool</h3>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm">Component Name</label>
                        <input
                            type="text"
                            value={nodeName}
                            onChange={(e) => setNodeName(e.target.value)}
                            placeholder="Component name"
                            className="p-2 border rounded"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={saveDiagram}
                            className="p-2 bg-green-500 text-white rounded flex-1"
                        >
                            Save
                        </button>
                        <button
                            onClick={loadDiagram}
                            className="p-2 bg-orange-500 text-white rounded flex-1"
                        >
                            Load
                        </button>
                    </div>

                    <button
                        onClick={exportAsImage}
                        className="p-2 bg-blue-500 text-white rounded"
                    >
                        Export as Image
                    </button>
                </Panel>
                <Panel position="top-center" className="mt-2">
                    <VerticalShapeToolbar onShapeSelect={onShapeSelect} />
                    {nodeToEdit && (
                        <Panel position="top-center" className="p-4 bg-white rounded shadow-md z-50">
                            <div className="flex flex-col gap-2">
                                <h4>{isNewNode ? "Set Node Label" : "Edit Node Label"}</h4>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={editLabel}
                                        onChange={(e) => setEditLabel(e.target.value)}
                                        className="p-2 border rounded"
                                        autoFocus
                                        onKeyPress={(e) => e.key === 'Enter' && handleUpdateLabel()}
                                    />
                                    <button
                                        onClick={handleUpdateLabel}
                                        className="p-2 bg-blue-500 text-white rounded"
                                    >
                                        {isNewNode ? "Set Label" : "Update"}
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="p-2 bg-gray-300 rounded"
                                    >
                                        {isNewNode ? "Remove" : "Cancel"}
                                    </button>
                                </div>
                            </div>
                        </Panel>
                    )}
                </Panel>
                {selectedShape && (
                    <Panel position="bottom-center" className="p-2 mb-2 bg-white rounded shadow-md">
                        <div className="flex items-center gap-2">
                            <span>Selected: {selectedShape}</span>
                            <button
                                onClick={() => setSelectedShape(null)}
                                className="px-2 py-1 bg-gray-200 rounded text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </Panel>
                )}
            </ReactFlow>
        </div>
    );
}