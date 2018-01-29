import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Icon, Table, Select, message } from 'antd';
import { loadBillTemplateUsers, addBillTemplateUser, deleteBillTemplateUser } from 'common/reducers/cmsManifest';
import { loadPartners } from 'common/reducers/partner';

import { formatMsg } from '../../../message.i18n';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';

const role = PARTNER_ROLES.SUP;
const businessType = PARTNER_BUSINESSE_TYPES.clearance;

const { Option } = Select;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    loginId: state.account.loginId,
    templateUsers: state.cmsManifest.templateUsers,
  }),
  {
    loadPartners, loadBillTemplateUsers, addBillTemplateUser, deleteBillTemplateUser,
  }
)
export default class TemplateUsersPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantName: PropTypes.string.isRequired,
    tenantId: PropTypes.number.isRequired,
    template: PropTypes.object.isRequired,
    templateUsers: PropTypes.array.isRequired,
    operation: PropTypes.string.isRequired,
  }
  state = {
    datas: [],
    brokers: [],
  };
  componentDidMount() {
    this.props.loadBillTemplateUsers(this.props.template.id);
    this.props.loadPartners({
      tenantId: this.props.tenantId,
      role,
      businessType,
    }).then((result) => {
      this.setState({ brokers: result.data.filter(item => item.partner_tenant_id !== -1 && item.status === 1) });
    });
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      datas: nextProps.templateUsers,
    });
  }
  msg = formatMsg(this.props.intl)
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
    this.props.addBillTemplateUser(record).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        message.info('保存成功', 5);
        this.props.loadBillTemplateUsers(this.props.template.id);
      }
    });
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
    const { brokers, datas } = this.state;
    const { operation } = this.props;
    let newBrokers = brokers;
    for (let i = 0; i < datas.length; i++) {
      const data = datas[i];
      newBrokers = newBrokers.filter(ct => ct.partner_tenant_id !== data.tenant_id);
    }
    const columns = [{
      dataIndex: 'tenant_name',
      render: (o, record) => {
        if (!record.id) {
          return (
            <Select onChange={value => this.handleTradeSel(record, value)} style={{ width: '100%' }}>
              {
                newBrokers.map(opt => <Option value={opt.partner_tenant_id} key={opt.name}>{opt.name}</Option>)
              }
            </Select>
          );
        }
        return record.tenant_name;
      },
    }];
    if (operation === 'edit') {
      columns.push({
        width: 70,
        render: (o, record, index) => {
          if (record.tenant_id === this.props.tenantId) {
            return '';
          }
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
        },
      });
    }
    return (
      <Table
        size="middle"
        showHeader={false}
        pagination={false}
        columns={columns}
        dataSource={this.state.datas}
        footer={operation === 'edit' ? () => <Button type="dashed" onClick={this.handleAdd} icon="plus" style={{ width: '100%' }} /> : null}
      />
    );
  }
}
