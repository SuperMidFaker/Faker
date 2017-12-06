import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Popover, Tree, Button, Icon } from 'antd';

const TreeNode = Tree.TreeNode;

export default class DeclTreePopover extends Component {
  static propTypes = {
    entries: PropTypes.array.isRequired,
    ciqs: PropTypes.array,
    billSeqNo: PropTypes.string,
    ieType: PropTypes.string,
    selectedKeys: PropTypes.array,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  handleSelect = (selectedKeys) => {
    const { ietype, billSeqNo } = this.props;
    if (selectedKeys[0].indexOf('0-0-0-') !== -1) {
      const pathname = `/clearance/${ietype}/cusdecl/${billSeqNo}/${selectedKeys[0].slice(6)}`;
      this.context.router.push({ pathname });
    } else if (selectedKeys[0].indexOf('0-0-1-') !== -1) {
      const type = ietype === 'import' ? 'in' : 'out';
      const pathname = `/clearance/ciqdecl/${type}/${selectedKeys[0].slice(6)}`;
      this.context.router.push({ pathname });
    } else if (selectedKeys[0] === '0-0') {
      const pathname = `/clearance/${ietype}/manifest/view/${billSeqNo}`;
      this.context.router.push({ pathname });
    }
  }
  render() {
    const { entries, ciqs, selectedKeys } = this.props;
    const popoverContent = (
      <Tree
        showLine
        defaultExpandedKeys={['0-0-0']}
        onSelect={this.handleSelect}
        selectedKeys={selectedKeys}
      >
        <TreeNode title={<a role="presentation"><Icon type="file-text" /> 申报清单</a>} key="0-0">
          {entries.length > 0 && (
          <TreeNode title="报关单" key="0-0-0" selectable={false}>
            {entries.map(bme => <TreeNode title={<a role="presentation">{bme.entry_id || bme.pre_entry_seq_no}</a>} key={`0-0-0-${bme.pre_entry_seq_no}`} />)}
          </TreeNode>
      )}
          {ciqs.length > 0 && (
          <TreeNode title="报检单" key="0-0-1" selectable={false}>
            {ciqs.map(ciq => <TreeNode title={<a role="presentation">{ciq.pre_entry_seq_no}</a>} key={`0-0-1-${ciq.pre_entry_seq_no}`} />)}
          </TreeNode>
      )}
        </TreeNode>
      </Tree>
    );
    return (
      <Popover content={popoverContent}>
        <Button ><Icon type="link" />转至<Icon type="down" /></Button>
      </Popover>
    );
  }
}
