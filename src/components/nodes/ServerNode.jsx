import { Handle, Position } from 'reactflow';

function ServerNode({ data }) {
    return (
        <div className="p-3 bg-gray-100 border-2 border-gray-300 rounded-md shadow-md w-40">
            <div className="font-bold text-center border-b border-gray-300 pb-1 mb-1">Server</div>
            <div className="text-sm text-center">{data.label}</div>
            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}

export default ServerNode;