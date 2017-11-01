import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { notification, Table, Button, Layout, Popconfirm, Form, Input, Select, Tooltip, Modal } from 'antd';
import { connect } from 'react-redux';
import { loadAdaptors, addAdaptor, delAdaptors } from 'common/reducers/saasLineFileAdaptor';
import EditableCell from 'client/components/EditableCell';
import ExcelUploader from 'client/components/ExcelUploader';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { uuidWithoutDash } from 'client/common/uuid';
import { LINE_FILE_ADAPTOR_MODELS } from 'common/constants';

const { Content } = Layout;
const FormItem = Form.Item;
const Option = Select.Option;
const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
};
const impModels = [LINE_FILE_ADAPTOR_MODELS.CMS_MANIFEST_BODY];

@connect(state => ({
  loadingAdaptors: state.saasLineFileAdaptor.loadingAdaptors,
  adaptors: state.saasLineFileAdaptor.adaptors,
  loadingAdaptor: state.saasLineFileAdaptor.loadingAdaptor,
  adaptor: state.saasLineFileAdaptor.adaptor,
  customer: state.cmsResources.customer,
}), { loadAdaptors, addAdaptor, delAdaptors })
export default class ImportAdaptorPane extends Component {
  static propTyps = {
    customer: PropTypes.object.isRequired,
  }
  state = {
    newAdapator: { visible: false },
    editAdaptor: false,
    lineColumns: [],
    lineData: [],
  }
  componentDidMount() {
    this.handleReload(this.props.customer.id);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.customer !== nextProps.customer) {
      this.handleReload(nextProps.customer.id);
    }
    if (this.props.adaptor.columns !== nextProps.adaptor.columns) {
      const lineColumns = [{
        title: '汇总',
        dataIndex: 'keyall',
        width: 200,
        fixed: 'left',
      }];
      const lineData = [{
        keyall: '示例1',
      }, {
        keyall: '示例2',
      }, {
        keyall: '导入字段',
      }];
      let scrollX = 200;
      nextProps.adaptor.columns.forEach((col, index) => {
        const dataIndex = `key${index}`;
        lineColumns.push({
          title: `列${index}`,
          dataIndex,
          width: 200,
          render: (value, row) => {
            if (row.editable) {
              return <EditableCell value={value} />;
            } else {
              return value;
            }
          },
        });
        lineData[0][dataIndex] = col.desc1;
        lineData[1][dataIndex] = col.desc2;
        lineData[2][dataIndex] = col.field;
        lineData[2].editable = true;
        scrollX += 200;
      });
      this.setState({ lineColumns, lineData, scrollX });
    }
  }
  handleReload = (ownerPid) => {
    this.props.loadAdaptors(ownerPid, impModels.mp(impm => impm.key));
  }
  handleAddBtnClick = () => {
    this.setState({ newAdapator: { visible: true } });
  }
  handleAddAdaptor = () => {
    const newAdaptor = this.state.newAdaptor;
    this.props.addAdaptor({ code: uuidWithoutDash(), name: newAdaptor.name, model: newAdaptor.biz_model, owner: '' }).then((result) => {
      if (result.error) {
        notification.error({ description: result.error.message });
      } else {
        this.setState({ newAdapator: { visible: false } });
        this.handleReload(this.props.customer.id);
      }
    });
  }
  handleUploaded = (resp) => {
    this.setState({ editAdaptor: true });
    this.props.loadAdaptor(resp.code);
  }
  handleEditBtnClick = (edit) => {
    this.setState({ editAdaptor: true });
    this.props.loadAdaptor(edit.code);
  }
  handleNewAdaptorCancel = () => {
    this.setState({ newAdapator: { visible: false } });
  }
  handleEditCancel = () => {
    this.setState({ editAdaptor: true });
  }
  adaptorColumns = [{
    title: '名称',
    dataIndex: 'name',
    width: 200,
  }, {
    title: '导入模板对象',
    dataIndex: 'biz_model',
    width: 180,
    render: model => model && LINE_FILE_ADAPTOR_MODELS[model].name,
  }, {
    title: '操作',
    width: 120,
    render: (_, record) => {
      const { owner } = this.props;
      let editDiv = null;
      if (record.example_file) {
        editDiv = (<PrivilegeCover module="clearance" feature="resources" action="edit">
          <a onClick={() => this.handleEditBtnClick(record)}>修改</a>
        </PrivilegeCover>);
      } else {
        editDiv = (<ExcelUploader endpoint={`${API_ROOTS.default}v1/saas/line/file/upload/example`}
          formData={{ data: JSON.stringify({ owner }) }} onUploaded={this.handleUploaded}
        >
          <Tooltip title="上传只有一个sheet页两行的示例Excel文件"><Button icon="cloud-upload-o" /></Tooltip>
        </ExcelUploader>);
      }
      return (<span>
        {editDiv}
        <span className="ant-divider" />
        <PrivilegeCover module="clearance" feature="resources" action="delete">
          <Popconfirm title="确定要删除吗？" onConfirm={() => this.props.delAdaptor(record.code)}>
            <Button icon="delete" />
          </Popconfirm>
        </PrivilegeCover>
      </span>
      );
    },
  }];
  render() {
    const { adaptors, adaptor, loadingAdaptors, loadingAdaptor } = this.props;
    const { newAdaptor, editAdaptor, lineColumns, lineData, scrollX } = this.state;
    return (
      <Content>
        <div className="toolbar">
          <PrivilegeCover module="clearance" feature="resources" action="create">
            <Button type="primary" onClick={this.handleAddBtnClick} icon="plus-circle-o">新增</Button>
          </PrivilegeCover>
        </div>
        <div className="panel-body table-panel table-fixed-layout">
          <Table dataSource={adaptors} columns={this.adaptorColumns} rowKey="code" loading={loadingAdaptors} />
        </div>
        <Modal maskClosable={false} title="新增适配器" onOk={this.handleAddAdaptor}
          onCancel={this.handleNewAdaptorCancel} visible={newAdaptor.visible}
        >
          <Form layout="horizontal">
            <FormItem label="名称" required {...formItemLayout}>
              <Input value={newAdaptor.name} onChange={e => this.setState({ name: e.target.value })} />
            </FormItem>
            <FormItem label="导入对象" required {...formItemLayout}>
              <Select value={newAdaptor.biz_model} onChange={e => this.setState({ code: e.target.value })}>
                {impModels.map(mod => <Option key={mod.key} value={mod.key}>{mod.name}</Option>)}
              </Select>
            </FormItem>
          </Form>
        </Modal>
        <Modal maskClosable={false} title={adaptor.name} onOk={this.handleEditCancel} onCancel={this.handleEditCancel} visible={editAdaptor}>
          <Table dataSource={lineData} columns={lineColumns} loadingAdaptor={loadingAdaptor} scroll={{ x: scrollX, y: 600 }} />
        </Modal>
      </Content>

    );
  }
}
