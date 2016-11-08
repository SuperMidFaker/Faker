import React, { Component, PropTypes } from 'react';
import { Table, Button, Popconfirm } from 'antd';
import QueueAnim from 'rc-queue-anim';
import moment from 'moment';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import CarrierModal from '../modals/carrierModal';
import { mapPartnerships } from '../util/dataMapping';

const rowSelection = {
  onSelect() {},
};

export default class DriverList extends Component {
  static propTyps = {
    dataSource: PropTypes.array,
    onAddBtnClicked: PropTypes.func.isRequired,
    onStopBtnClick: PropTypes.func.isRequired,
    onDeleteBtnClick: PropTypes.func.isRequired,
    onResumeBtnClick: PropTypes.func.isRequired,
    onEditBtnClick: PropTypes.func.isRequired,
  }

  renderEditAndStopOperations = (itemInfo) => {
    const { id, name, partnerCode } = itemInfo;
    return (
      <PrivilegeCover module="corp" feature="partners" action="edit">
        <span>
          <a onClick={() => this.props.onEditBtnClick(id, name, partnerCode)}>修改</a>
          <span className="ant-divider" />
          <a onClick={() => this.props.onStopBtnClick(id)}>停用</a>
        </span>
      </PrivilegeCover>
    );
  }

  renderDeleteAndResumeOperations = (itemInfo) => {
    const { id } = itemInfo;
    return (
      <span>
        <PrivilegeCover module="corp" feature="partners" action="delete">
          <Popconfirm title="确定要删除吗？" onConfirm={() => this.props.onDeleteBtnClick(id)}>
            <a>删除</a>
          </Popconfirm>
        </PrivilegeCover>
        <span className="ant-divider" />
        <PrivilegeCover module="corp" feature="partners" action="edit">
          <a onClick={() => this.props.onResumeBtnClick(id)}>启用</a>
        </PrivilegeCover>
      </span>
    );
  }
  render() {
    const { dataSource, onAddBtnClicked } = this.props;

    const columns = [
      {
        title: '供应商名称',
        dataIndex: 'name',
        key: 'name',
      }, {
        title: '供应商代码',
        dataIndex: 'partnerCode',
        key: 'partnerCode',
      }, {
        title: '供应商类型',
        dataIndex: 'partnerships',
        key: 'partnerships',
        render(_, record) {
          return (
            <span>{mapPartnerships(record.partnerships)}</span>
        ); },
      }, {
        title: '创建日期',
        dataIndex: 'created_date',
        key: 'created_date',
        render(o) {
          return moment(o).format('YYYY/MM/DD HH:mm');
        },
      }, {
        title: '操作',
        dataIndex: 'status',
        key: 'status',
        render: (_, record, index) => {
          if (record.status === 1) {
            return this.renderEditAndStopOperations(record, index);
          } else {
            return this.renderDeleteAndResumeOperations(record);
          }
        },
      },
    ];
    return (
      <QueueAnim type={['bottom', 'up']}>
        <header className="top-bar" key="header">
          <span>供应商管理</span>
        </header>
        <div className="main-content" key="main">
          <div className="page-body">
            <div className="panel-header">
              <PrivilegeCover module="transport" feature="resources" action="create">
                <Button type="primary" onClick={onAddBtnClicked} icon="plus-circle-o">新增供应商</Button>
              </PrivilegeCover>
            </div>
            <div className="panel-body table-panel">
              <Table dataSource={dataSource} columns={columns} rowSelection={rowSelection} />
            </div>
            <CarrierModal />
          </div>
        </div>
      </QueueAnim>
    );
  }
}
