import React, { PropTypes } from 'react';
import { Table, Button, Radio } from 'ant-ui';
import { Link } from 'react-router';
import { nodeTypes } from '../utils/dataMapping';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

const rowSelection = {
  onSelect() {

  }
};

export default function NodeList(props) {
  const { onDeleteBtnClick, dataSource, visible, nodeType, onRadioButtonChange, onAddNoteBtnClick } = props;
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: '外部代码',
      dataIndex: 'node_code',
      key: 'node_code'
    },
    {
      title: '关联方',
      dataIndex: 'ref_partner_name',
      key: 'ref_partner_name'
    },
    {
      title: '省/城市/县区',
      dataIndex: 'region',
      key: 'region'
    },
    {
      title: '地址/坐标',
      dataIndex: 'addr',
      key: 'addr'
    },
    {
      title: '联系人',
      dataIndex: 'contact',
      key: 'contact'
    },
    {
      title: '联系电话',
      dataIndex: 'mobile',
      key: 'mobile'
    },
    {
      title: '联系邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '围栏及范围',
      dataIndex: 'geo_longitude',
      key: 'geo_longitude'
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark'
    },
    {
      title: '操作',
      dataIndex: 'operations',
      key: 'operations',
      render: (_, record) => {
        return (
          <span>
            <Link to={`/transport/resources/edit_node/${record.node_id}`}>修改</Link>
            <span className="ant-divider"></span>
            <a onClick={() => onDeleteBtnClick(record.node_id)} style={{color: 'red'}}>
              删除
            </a>
          </span>
        );
      }
    }
  ];
  if (visible) {
    return (
      <div className="main-content">
        <div className="page-header">
          <RadioGroup defaultValue={nodeType} size="large" onChange={(e) => onRadioButtonChange(e.target.value)}>
            <RadioButton value={0}>发货地</RadioButton>
            <RadioButton value={1}>收货地</RadioButton>
            <RadioButton value={2}>中转地</RadioButton>
          </RadioGroup>
        </div>
        <div className="page-body">
          <div className="panel-body body-responsive" style={{padding: 20}}>
            <Button size="large" type="primary" style={{marginBottom: 16}} onClick={onAddNoteBtnClick}>新建{nodeTypes[nodeType]}</Button>
            <Table rowSelection={rowSelection} columns={columns} dataSource={dataSource}/>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div></div>
    );
  }
}

NodeList.propsTypes = {
  dataSource: PropTypes.array.isRequired,
  visible: PropTypes.bool.isRequired,             // 组件是否可见
  nodeType: PropTypes.number.isRequired,          // 当前选中的node类型
  onDeleteBtnClick: PropTypes.func.isRequired,    // 删除按钮点击时触发的回调函数
  onRadioButtonChange: PropTypes.func.isRequired, // radio button改变时触发的回调函数
  onAddNoteBtnClick: PropTypes.func.isRequired,   // 新建按钮点击后执行的回调函数
};
