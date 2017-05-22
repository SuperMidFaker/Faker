import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Icon, Table, Select, message } from 'antd';
import { loadBillTemplateUsers, addBillTemplateUser, deleteBillTemplateUser } from 'common/reducers/cmsManifest';
import { loadPartners } from 'common/reducers/partner';
import { format } from 'client/common/i18n/helpers';
import messages from 'client/apps/cms/message.i18n';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';
const role = PARTNER_ROLES.SUP;
const businessType = PARTNER_BUSINESSE_TYPES.clearance;

const formatMsg = format(messages);
const Option = Select.Option;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    loginId: state.account.loginId,
    billTemplateUsers: state.cmsManifest.billTemplateUsers,
  }),
  { loadPartners, loadBillTemplateUsers, addBillTemplateUser, deleteBillTemplateUser }
)
export default class BillTemplateUsersPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantName: PropTypes.string.isRequired,
    tenantId: PropTypes.number.isRequired,
    template: PropTypes.object.isRequired,
    billTemplateUsers: PropTypes.array.isRequired,
    operation: PropTypes.string.isRequired,
  }
  state = {
    datas: [],
    brokers: [],
  };
  componentDidMount() {
    this.props.loadPartners({
      tenantId: this.props.tenantId,
      role,
      businessType,
    }).then((result) => {
      this.setState({ brokers: result.data.filter(item => item.partner_tenant_id !== -1) });
    });
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      datas: nextProps.billTemplateUsers,
    });
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleAdd = () => {
    const addOne = {
      template_id: this.props.template.id,
      tenant_id: null,
      tenant_name: '',
    };
    const data = this.state.datas;
    data.push(addOne);
    this.setState({ datas: data });
  }
  handleSave = (record) => {
    this.props.addBillTemplateUser(record).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          message.info('保存成功', 5);
          this.props.loadBillTemplateUsers(this.props.template.id);
        }
      }
    );
  }
  handleDelete = (record, index) => {
    this.props.deleteBillTemplateUser(record.id).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        const datas = [...this.state.datas];
        datas.splice(index, 1);
        this.setState({ datas });
      }
    });
  }
  handleTradeSel = (record, value) => {
    record.tenant_id = value; // eslint-disable-line no-param-reassign
    const rels = this.state.brokers.find(tr => tr.partner_tenant_id === value);
    if (rels) {
      record.tenant_name = rels.name; // eslint-disable-line no-param-reassign
    }
    this.forceUpdate();
  }
  editDone = (index) => {
    const datas = [...this.state.datas];
    datas.splice(index, 1);
    this.setState({ datas });
  }
  render() {
    const { brokers } = this.state;
    const { operation } = this.props;
    const columns = [{
      title: this.msg('tenantName'),
      dataIndex: 'tenant_name',
      width: 160,
      render: (o, record) => {
        if (!record.id) {
          return (
            <Select value={record.tenant_id || ''} onChange={value => this.handleTradeSel(record, value)} style={{ width: '100%' }}>
              {
                brokers.map(opt => <Option value={opt.partner_tenant_id} key={opt.name}>{opt.name}</Option>)
              }
            </Select>
          );
        } else {
          return record.tenant_name;
        }
      },
    }];
    if (operation === 'edit') {
      columns.push({
        width: 70,
        render: (o, record, index) => {
          if (record.tenant_id === this.props.tenantId) {
            return '';
          } else {
            return (
              <div className="editable-row-operations">{
                (record.id) ?
                  <span>
                    <a onClick={() => this.handleDelete(record, index)}><Icon type="delete" /></a>
                  </span>
                :
                  <span>
                    <a onClick={() => this.handleSave(record)}><Icon type="save" /></a>
                    <span className="ant-divider" />
                    <a onClick={() => this.editDone(index)}><Icon type="close" /></a>
                  </span>
                }
              </div>);
          }
        },
      });
    }
    return (
      <Table size="middle" pagination={false} columns={columns} dataSource={this.state.datas}
        footer={operation === 'edit' ? () => <Button type="dashed" onClick={this.handleAdd} icon="plus" style={{ width: '100%' }}>{this.msg('add')}</Button> : null}
      />
    );
  }
}
