import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Table, Button, Select, Tag } from 'antd';
import { loadBusinessModels, addModel, deleteModel, addModelNode, deleteModelNode,
  deleteBusinessModel, addBusinessModel, updateBusinessModel } from 'common/reducers/crmCustomers';
import { format } from 'client/common/i18n/helpers';
import messages from './message.i18n';

const formatMsg = format(messages);
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    businessModels: state.crmCustomers.businessModels,
    businessModelsLoaded: state.crmCustomers.businessModelsLoaded,
  }), { loadBusinessModels, addModel, deleteModel, addModelNode, deleteModelNode,
    deleteBusinessModel, addBusinessModel, updateBusinessModel }
)

export default class FlowRulesPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    customer: PropTypes.object.isRequired,
    businessModels: PropTypes.array.isRequired,
    businessModelsLoaded: PropTypes.bool.isRequired,
    loadBusinessModels: PropTypes.func.isRequired,
    addModel: PropTypes.func.isRequired,
    deleteModel: PropTypes.func.isRequired,
    addModelNode: PropTypes.func.isRequired,
    deleteModelNode: PropTypes.func.isRequired,
    deleteBusinessModel: PropTypes.func.isRequired,
    addBusinessModel: PropTypes.func.isRequired,
    updateBusinessModel: PropTypes.func.isRequired,
  }
  state = {
    editIndex: -1,
    selectValue: '',
  }
  componentDidMount() {
    this.handleTableLoad();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.customer.id !== this.props.customer.id || !nextProps.businessModelsLoaded) {
      this.handleTableLoad(nextProps.customer.id);
      this.setState({
        editIndex: -1,
      });
    }
  }
  handleTableLoad = (partnerId) => {
    const { customer, tenantId } = this.props;
    if (partnerId || customer.id) {
      this.props.loadBusinessModels({
        partnerId: partnerId || customer.id,
        tenantId,
      });
    }
  }
  msg = key => formatMsg(this.props.intl, key)
  handleSave = (model) => {
    this.setState({
      editIndex: -1,
    });
    const { customer, tenantId } = this.props;
    const { id: partnerId } = customer;
    if (model.id > 0) {
      this.props.updateBusinessModel(model.id, model.model);
    } else {
      this.props.addBusinessModel(tenantId, partnerId, model.model);
    }
  }
  handleDeleteModel = (id, index) => {
    if (id) {
      this.props.deleteBusinessModel(id);
    } else {
      this.props.deleteModel(index);
      if (this.state.editIndex >= 0) {
        this.setState({
          editIndex: this.state.editIndex - 1,
        });
      }
    }
  }
  handleEdit = (editIndex) => {
    this.setState({
      editIndex,
    });
  }
  handleAddModel = () => {
    this.props.addModel({
      model: '',
      id: -1 * this.props.businessModels.length,
    });
    this.setState({
      editIndex: this.props.businessModels.length,
    });
  }
  handleModelChange = (index, value) => {
    this.props.addModelNode(index, value);
    this.setState({ selectValue: '' });
  }
  handleDeleteModelNode = (index, position) => {
    this.props.deleteModelNode(index, position);
  }
  renderModel = (array, rowIndex) => {
    const { editIndex } = this.state;
    return array.map((item, i) => {
      let color = '';
      let text = '';
      if (item === 'clearance') {
        color = '#26A69A';
        text = '清关';
      } else if (item === 'transport') {
        color = '#42A5F5';
        text = '运输';
      }
      let closable = false;
      if (rowIndex === editIndex) {
        closable = true;
      }
      return (<Tag key={i} color={color} closable={closable} onClose={(e) => { e.preventDefault(); this.handleDeleteModelNode(rowIndex, i); }}>{text}</Tag>);
    });
  }
  render() {
    const { businessModels } = this.props;
    const { editIndex, selectValue } = this.state;
    const columns = [{
      title: '业务模式',
      dataIndex: 'model',
      key: 'model',
      render: (o, record, index) => {
        let array = [];
        if (o !== '') {
          array = o.split(',');
        }
        if (index === editIndex) {
          return (
            <div>
              <span>{this.renderModel(array, index)}</span>
              <Select value={selectValue} style={{ marginLeft: 15, width: 100 }} onChange={value => this.handleModelChange(index, value)}>
                <Option value="clearance">清关</Option>
                <Option value="transport">运输</Option>
              </Select>
            </div>
          );
        }
        return <div>{this.renderModel(array, index)}</div>;
      },
    }, {
      title: '操作',
      dataIndex: 'id',
      render: (o, record, index) => {
        if (index === editIndex) {
          return (
            <a onClick={() => this.handleSave(record)}>
            保存
            </a>
          );
        } else {
          return (
            <div>
              <a onClick={() => this.handleEdit(index)}>
              修改
              </a>
              <span className="ant-divider" />
              <a onClick={() => this.handleDeleteModel(o, index)}>
              删除
              </a>
            </div>
          );
        }
      },
    }];
    return (
      <div>
        <Table dataSource={businessModels} columns={columns} rowKey="id" pagination={false}
          footer={() => <Button type="primary" onClick={this.handleAddModel}>添加</Button>}
        />
      </div>
    );
  }
}
