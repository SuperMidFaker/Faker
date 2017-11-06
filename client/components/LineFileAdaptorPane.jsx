import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { notification, Table, Button, Layout, Popconfirm, Form, Input, Select, Tooltip, Modal } from 'antd';
import { loadAdaptors, addAdaptor, loadAdaptor, updateColumnField, delAdaptor } from 'common/reducers/saasLineFileAdaptor';
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

@connect(state => ({
  loadingAdaptors: state.saasLineFileAdaptor.loadingAdaptors,
  adaptors: state.saasLineFileAdaptor.adaptors,
  loadingAdaptor: state.saasLineFileAdaptor.loadingAdaptor,
  adaptor: state.saasLineFileAdaptor.adaptor,
}), { loadAdaptors, addAdaptor, loadAdaptor, updateColumnField, delAdaptor })
export default class LineFileAdaptorPane extends Component {
  static propTyps = {
    owner: PropTypes.shape({ id: PropTypes.number, partner_tenant_id: PropTypes.number }).isRequired,
    impModels: PropTypes.arrayOf(Object.keys(LINE_FILE_ADAPTOR_MODELS)),
    adaptor: PropTypes.shape({ name: PropTypes.string.isRequired,
      columns: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number.isRequired,
        desc1: PropTypes.string.isRequired,
      })),
    }),
  }
  state = {
    newAdaptor: { visible: false },
    editAdaptor: false,
    lineColumns: [],
    lineData: [],
  }
  componentDidMount() {
    this.handleReload(this.props.owner.id);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.owner !== nextProps.owner) {
      this.handleReload(nextProps.owner.id);
    }
    if (this.props.adaptor.columns !== nextProps.adaptor.columns) {
      const lineColumns = [{
        dataIndex: 'keyall',
        width: 100,
        fixed: 'left',
      }];
      const lineData = [{
        keyall: '示例1',
      }, {
        keyall: '示例2',
      }, {
        keyall: '导入字段',
      }];
      let scrollX = 100;
      nextProps.adaptor.columns.forEach((col, index) => {
        const dataIndex = `key${index}`;
        lineColumns.push({
          title: `列${index}`,
          dataIndex,
          width: 200,
          render: (value, row) => {
            if (row.editable) {
              return (
                <EditableCell value={value} cellTrigger type="select"
                  options={LINE_FILE_ADAPTOR_MODELS[nextProps.adaptor.biz_model].columns.map(acol => ({ key: acol.field, text: acol.label }))}
                  onSave={field => this.handleFieldMap(col.id, field)}
                />);
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
    this.props.loadAdaptors(ownerPid, this.props.impModels.map(impm => impm.key));
  }
  handleFieldMap = (columnId, field) => {
    this.props.updateColumnField(columnId, field);
  }
  handleAddBtnClick = () => {
    this.setState({ newAdaptor: { visible: true } });
  }
  handleAddAdaptor = () => {
    const newAdaptor = this.state.newAdaptor;
    const owner = this.props.owner;
    this.props.addAdaptor({ code: uuidWithoutDash(),
      name: newAdaptor.name,
      model: newAdaptor.biz_model,
      ownerPid: owner.id,
      ownerTid: owner.partner_tenant_id,
    }).then((result) => {
      if (result.error) {
        notification.error({ description: result.error.message });
      } else {
        this.setState({ newAdaptor: { visible: false } });
        this.handleReload(owner.id);
      }
    });
  }
  handleUploaded = (resp) => {
    const owner = this.props.owner;
    this.setState({ editAdaptor: true });
    this.props.loadAdaptor(resp.code);
    this.handleReload(owner.id);
  }
  handleEditBtnClick = (edit) => {
    this.setState({ editAdaptor: true });
    this.props.loadAdaptor(edit.code);
  }
  handleNewAdaptorCancel = () => {
    this.setState({ newAdaptor: { visible: false } });
  }
  handleEditCancel = () => {
    this.setState({ editAdaptor: false });
  }
  handleAdaptorNameChange = (ev) => {
    const newAdaptor = { ...this.state.newAdaptor };
    newAdaptor.name = ev.target.value;
    this.setState({ newAdaptor });
  }
  handleAdaptorModelChange = (value) => {
    const newAdaptor = { ...this.state.newAdaptor };
    newAdaptor.biz_model = value;
    this.setState({ newAdaptor });
  }
  handleDel = (code) => {
    this.props.delAdaptor(code).then((result) => {
      if (result.error) {
        notification.error({ description: result.error.message });
      } else {
        this.handleReload(this.props.owner.id);
      }
    });
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
      let editDiv = null;
      if (record.example_file) {
        editDiv = (<PrivilegeCover module="clearance" feature="resources" action="edit">
          <Button icon="edit" onClick={() => this.handleEditBtnClick(record)} />
        </PrivilegeCover>);
      } else {
        editDiv = (<ExcelUploader endpoint={`${API_ROOTS.default}v1/saas/line/file/upload/example`}
          formData={{ data: JSON.stringify({ code: record.code }) }} onUploaded={this.handleUploaded}
        >
          <Tooltip title="上传只有一个sheet页两行的示例Excel文件"><Button icon="cloud-upload-o" /></Tooltip>
        </ExcelUploader>);
      }
      return (<span>
        {editDiv}
        <span className="ant-divider" />
        <PrivilegeCover module="clearance" feature="resources" action="delete">
          <Popconfirm title="确定要删除吗？" onConfirm={() => this.handleDel(record.code)}>
            <Button icon="delete" />
          </Popconfirm>
        </PrivilegeCover>
      </span>
      );
    },
  }];
  render() {
    const { impModels, adaptors, adaptor, loadingAdaptors, loadingAdaptor } = this.props;
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
              <Input value={newAdaptor.name} onChange={this.handleAdaptorNameChange} />
            </FormItem>
            <FormItem label="导入对象" required {...formItemLayout}>
              <Select value={newAdaptor.biz_model} onChange={this.handleAdaptorModelChange}>
                {impModels.map(mod => <Option key={mod.key} value={mod.key}>{mod.name}</Option>)}
              </Select>
            </FormItem>
          </Form>
        </Modal>
        <Modal maskClosable={false} title={adaptor.name} width="100%" wrapClassName="fullscreen-modal"
          footer={null} onCancel={this.handleEditCancel} visible={editAdaptor}
        >
          <Table dataSource={lineData} columns={lineColumns} loadingAdaptor={loadingAdaptor}
            scroll={{ x: scrollX, y: 600 }} pagination={false}
          />
        </Modal>
      </Content>
    );
  }
}

