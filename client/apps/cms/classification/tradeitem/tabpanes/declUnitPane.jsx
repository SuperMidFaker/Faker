import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Table, message, Input } from 'antd';
import { loadDeclunits, saveDeclunit, delDeclunit } from 'common/reducers/cmsTradeitem';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';

const formatMsg = format(messages);

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
    declunits: state.cmsTradeitem.declunits,
  }),
  { loadDeclunits, saveDeclunit, delDeclunit }
)
export default class DeclUnitPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    declunits: PropTypes.array,
  }
  state = {
    datas: [],
  };
  componentDidMount() {
    this.props.loadDeclunits(this.props.tenantId);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.declunits !== nextProps.declunits) {
      this.setState({ datas: nextProps.declunits });
    }
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleEditChange = (record, field, value) => {
    record[field] = value; // eslint-disable-line no-param-reassign
    this.forceUpdate();
  }
  handleAdd = () => {
    const addOne = {
      tenant_id: this.props.tenantId,
      unit_code: '',
      unit_name: '',
      creater_login_id: this.props.loginId,
    };
    const data = this.state.datas;
    data.push(addOne);
    this.setState({ datas: data });
  }
  handleSave = (record) => {
    this.props.saveDeclunit(record).then(
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
    this.props.delDeclunit(record.id).then((result) => {
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
      title: this.msg('declunitName'),
      dataIndex: 'unit_name',
      render: (o, record) =>
        <ColumnInput field="unit_name" inEdit={!record.id} record={record}
          onChange={this.handleEditChange}
        />,
    }, {
      title: this.msg('declunitCode'),
      dataIndex: 'unit_code',
      render: (o, record) =>
        <ColumnInput field="unit_code" inEdit={!record.id} record={record}
          onChange={this.handleEditChange}
        />,
    }, {
      width: 60,
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
        footer={() => <Button type="dashed" onClick={this.handleAdd} icon="plus" style={{ width: '100%' }}>{this.msg('add')}</Button>}
      />
    );
  }
}
