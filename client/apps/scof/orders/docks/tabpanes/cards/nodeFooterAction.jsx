import React from 'react';
import { Button, Tooltip } from 'antd';

export default function FlowNodeFooterAction(props) {
  const { node, manualEnterFlowInstance } = props;
  function handleNodeEnterTrigger(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    manualEnterFlowInstance(node.uuid, node.kind);
  }
  if (node.multi_bizobj && node.in_degree === 0 && node.out_degree > 0 && node.primary) {
    return (
      <ul className="ant-card-actions">
        <li style={{ width: '100%' }}>
          <Tooltip title="触发节点进入" key="enter">
            <Button icon="plus" onClick={handleNodeEnterTrigger} />
          </Tooltip>
        </li>
      </ul>
    );
  }
  return null;
}
