import React, { Component, PropTypes } from 'react';
import { Table, Radio, Button } from 'ant-ui';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

const rowSelection = {
  onSelect() {}
};

export default class AcceptanceList extends Component {
  static contextTypes = {
    router: PropTypes.object.isRequired
  }
  columns = [
    {
      title: '报关委托号',
      dataIndex: 'id'
    },
    {
      title: '委托客户'
    },
    {
      title: '委托日期'
    },
    {
      title: '合同号'
    },
    {
      title: '提运单号'
    },
    {
      title: '发票号'
    },
    {
      title: '航名航次'
    },
    {
      title: '企业内部编号'
    },
    {
      title: '件数'
    },
    {
      title: '来源'
    },
    {
      title: '接单时间'
    },
    {
      title: '操作'
    }
  ]
  handleCreateBtnClick = () => {
    this.context.router.push('/import/accept/create');
  }
  render() {
    const dataSource = [{id: 1, key: 1}];
    return (
      <div className="main-content">
        <div className="page-header">
          <div className="tools">
            <Button type="primary" size="large" onClick={this.handleCreateBtnClick} icon="plus-circle-o">新建报关委托</Button>
          </div>
          <RadioGroup defaultValue={0} size="large">
            <RadioButton value={0}>待接单</RadioButton>
            <RadioButton value={1}>已接单</RadioButton>
          </RadioGroup>
        </div>
        <div className="page-body">
          <Table columns={this.columns} dataSource={dataSource} rowSelection={rowSelection}/>
        </div>
      </div>
    );
  }
}
