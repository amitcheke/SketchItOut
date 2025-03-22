import { Handle, Position } from 'reactflow';

function DatabaseNode({ data }) {
    return (
        <div className="p-3 bg-blue-50 border-2 border-blue-300 rounded-md shadow-md w-40">
            <div className="font-bold text-center border-b border-blue-300 pb-1 mb-1">Database</div>
            <div className="text-sm text-center">{data.label}</div>
            <Handle type="target" position={Position.Top} />
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}

export default DatabaseNode;