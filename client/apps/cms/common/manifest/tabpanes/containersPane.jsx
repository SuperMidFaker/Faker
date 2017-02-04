import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Table, Input, message } from 'antd';
import { loadContainers, saveContainer, delContainer } from 'common/reducers/cmsManifest';

function ColumnInput(props) {
  const { inEdit, record, field, onChange } = props;
  function handleChange(ev) {
    if (onChange) {
      onChange(record, field, ev.target.value);
    }
  }
  return inEdit ? <Input value={record[field] || ''} onChange={handleChange} />
    : <span>{record[field] || ''}</span>;
}
ColumnInput.propTypes = {
  inEdit: PropTypes.bool,
  record: PropTypes.object.isRequired,
  field: PropTypes.string.isRequired,
  onChange: PropTypes.func,
};

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    loginId: state.account.loginId,
    tabKey: state.cmsManifest.tabKey,
    head: state.cmsManifest.entryHead,
    containers: state.cmsManifest.containers,
  }),
  { loadContainers, saveContainer, delContainer }
)
export default class ContainersPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    containers: PropTypes.array,
  }
  state = {
    datas: [],
  };
  componentDidMount() {
    this.props.loadContainers(this.props.head.entry_id);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.head !== nextProps.head ||
      (this.props.tabKey !== nextProps.tabKey && nextProps.tabKey === 'container')) {
      this.props.loadContainers(nextProps.head.entry_id);
    }
    if (this.props.containers !== nextProps.containers) {
      this.setState({ datas: nextProps.containers });
    }
  }
  handleEditChange = (record, field, value) => {
    record[field] = value; // eslint-disable-line no-param-reassign
    this.forceUpdate();
  }
  handleAdd = () => {
    const { head } = this.props;
    const addOne = {
      delg_no: head.delg_no,
      entry_id: head.entry_id,
      creater_login_id: this.props.loginId,
      container_id: '',
      container_wt: null,
      container_spec: '',
      container_qty: null,
    };
    const data = this.state.datas;
    data.push(addOne);
    this.setState({ datas: data });
  }
  handleSave = (record) => {
    this.props.saveContainer(record).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          message.info('保存成功', 5);
        }
      }
    );
  }
  handleDelete = (record, index) => {
    this.props.delContainer(record.id).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        const datas = [...this.state.datas];
        datas.splice(index, 1);
        this.setState({ datas });
      }
    });
  }

  render() {
    const columns = [{
      title: '箱号',
      dataIndex: 'container_id',
      width: 100,
      render: (o, record) =>
        <ColumnInput field="container_id" inEdit={!record.id} record={record}
          onChange={this.handleEditChange}
        />,
    }, {
      title: '自重',
      dataIndex: 'container_wt',
      width: 100,
      render: (o, record) =>
        <ColumnInput field="container_wt" inEdit={!record.id} record={record}
          onChange={this.handleEditChange}
        />,
    }, {
      title: '规格',
      dataIndex: 'container_spec',
      width: 100,
      render: (o, record) =>
        <ColumnInput field="container_spec" inEdit={!record.id} record={record}
          onChange={this.handleEditChange}
        />,
    }, {
      title: '数量',
      dataIndex: 'container_qty',
      width: 100,
      render: (o, record) =>
        <ColumnInput field="container_qty" inEdit={!record.id} record={record}
          onChange={this.handleEditChange}
        />,
    }, {
      width: 40,
      render: (o, record, index) => {
        if (record.id) {
          return <Button type="ghost" shape="circle" onClick={() => this.handleDelete(record, index)} icon="delete" />;
        } else {
          return <Button type="primary" shape="circle" onClick={() => this.handleSave(record)} icon="save" />;
        }
      },
    }];
    return (
      <Table pagination={false} columns={columns} dataSource={this.state.datas}
        footer={() => <Button type="dashed" onClick={this.handleAdd} icon="plus" style={{ width: '100%' }}>添加</Button>}
      />
    );
  }
}
