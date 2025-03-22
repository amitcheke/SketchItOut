
import { Handle, Position } from 'reactflow';

function ClientNode({ data }) {
    return (
        <div className="p-3 bg-green-50 border-2 border-green-300 rounded-md shadow-md w-40">
            <div className="font-bold text-center border-b border-green-300 pb-1 mb-1">Client</div>
            <div className="text-sm text-center">{data.label}</div>
            <Handle type="source" position={Position.Bottom} />
        </div>
    );
}

export default ClientNode;