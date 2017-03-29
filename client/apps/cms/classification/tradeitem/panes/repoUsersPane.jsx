import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Icon, Table, Select, message } from 'antd';
import { loadRepoUsers, addRepoUser, deleteRepoUser } from 'common/reducers/cmsTradeitem';
import { loadPartners } from 'common/reducers/partner';
import { format } from 'client/common/i18n/helpers';
import messages from '../../message.i18n';
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
    tabKey: state.cmsTradeitem.tabKey,
    repoId: state.cmsTradeitem.repoId,
    repoUsers: state.cmsTradeitem.repoUsers,
  }),
  { loadPartners, loadRepoUsers, addRepoUser, deleteRepoUser }
)
export default class CopCodesPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantName: PropTypes.number.isRequired,
    tenantId: PropTypes.number.isRequired,
    repoUsers: PropTypes.array,
    repoId: PropTypes.number,
    owner: PropTypes.object.isRequired,
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
      this.setState({ brokers: result.data });
    });
    this.props.loadRepoUsers(this.props.tenantId, this.props.repoId);
  }
  componentWillReceiveProps(nextProps) {
    if (this.props.repoId !== nextProps.repoId ||
      (this.props.tabKey !== nextProps.tabKey && nextProps.tabKey === 'copCodes')) {
      this.props.loadRepoUsers(nextProps.tenantId, nextProps.repoId);
    }
    if (this.props.repoUsers !== nextProps.repoUsers) {
      this.setState({ datas: nextProps.repoUsers });
    }
  }
  msg = (descriptor, values) => formatMsg(this.props.intl, descriptor, values)
  handleAdd = () => {
    const addOne = {
      repoId: this.props.repoId,
      partnerTenantId: -1,
      name: '',
    };
    const data = this.state.datas;
    data.push(addOne);
    this.setState({ datas: data });
  }
  handleSave = (record) => {
    this.props.addRepoUser(record.repoId, record.partnerTenantId).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message);
        } else {
          message.info('保存成功', 5);
          this.props.loadRepoUsers(this.props.tenantId, this.props.repoId);
        }
      }
    );
  }
  handleDelete = (record, index) => {
    this.props.deleteRepoUser(record.id).then((result) => {
      if (result.error) {
        message.error(result.error.message);
      } else {
        const datas = [...this.state.datas];
        datas.splice(index, 1);
        this.setState({ datas });
      }
    });
  }
  handleTradeSel = (record, value) => {
    record.tenant_id = value; // eslint-disable-line no-param-reassign
    record.partnerTenantId = value; // eslint-disable-line no-param-reassign
    const rels = this.state.brokers.find(tr => tr.partner_tenant_id === value);
    if (rels) {
      record.name = rels.name; // eslint-disable-line no-param-reassign
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
    const columns = [{
      title: this.msg('tradeName'),
      dataIndex: 'name',
      width: 160,
      render: (o, record) => {
        if (!record.id) {
          return (
            <Select value={record.tenant_id || ''} onChange={value => this.handleTradeSel(record, value)} style={{ width: '100%' }}>
              {
                brokers.map((opt, idx) => <Option value={opt.partner_tenant_id} key={`${opt.name}${idx}`}>{opt.name}</Option>)
              }
            </Select>
          );
        } else {
          return <span>{record.tenant_id === this.props.tenantId ? this.props.tenantName : record.name}</span>;
        }
      },
    }, {
      width: 70,
      render: (o, record, index) => {
        if (record.tenant_id !== this.props.tenantId) {
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
        } else {
          return '';
        }
      },
    }];
    return (
      <Table size="middle" pagination={false} columns={columns} dataSource={this.state.datas}
        footer={() => <Button type="dashed" onClick={this.handleAdd} icon="plus" style={{ width: '100%' }}>{this.msg('add')}</Button>}
      />
    );
  }
}
