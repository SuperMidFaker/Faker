import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Icon, Radio, Table, Select, message } from 'antd';
import { loadRepoUsers, addRepoUser, deleteRepoUser } from 'common/reducers/cmsTradeitem';
import { loadPartners } from 'common/reducers/partner';
import { formatMsg } from '../../message.i18n';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES, CMS_TRADE_REPO_PERMISSION } from 'common/constants';

const role = PARTNER_ROLES.SUP;
const businessType = PARTNER_BUSINESSE_TYPES.clearance;

const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    tenantName: state.account.tenantName,
    loginId: state.account.loginId,
    repoUsers: state.cmsTradeitem.repoUsers,
  }),
  { loadPartners, loadRepoUsers, addRepoUser, deleteRepoUser }
)
export default class RepoUsersCard extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantName: PropTypes.string.isRequired,
    tenantId: PropTypes.number.isRequired,
    repoUsers: PropTypes.arrayOf(PropTypes.shape({ name: PropTypes.string.isRequired })),
    repo: PropTypes.shape({ id: PropTypes.number.isRequired }).isRequired,
  }
  state = {
    repoUserList: [],
    brokers: [],
    addOne: {},
  };
  componentDidMount() {
    this.props.loadPartners({ role, businessType }).then((result) => {
      this.setState({ brokers: result.data.filter(item => item.partner_tenant_id !== -1 && item.status === 1) });
    });
    if (this.props.repo.id) {
      this.props.loadRepoUsers(this.props.repo.id);
    }
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.repo && nextProps.repo.id && nextProps.repo.id !== this.props.repo.id) {
      this.props.loadRepoUsers(nextProps.repo.id);
    }
    if (this.props.repoUsers !== nextProps.repoUsers) {
      this.setState({ repoUserList: nextProps.repoUsers });
    }
  }
  msg = formatMsg(this.props.intl)
  handleAdd = () => {
    const addOne = {
      partnerTenantId: -1,
      name: '',
      permission: CMS_TRADE_REPO_PERMISSION.view,
    };
    const data = this.state.repoUserList;
    data.push(addOne);
    this.setState({ repoUserList: data, addOne });
  }
  handleSave = (record) => {
    this.props.addRepoUser(this.props.tenantId, this.props.repo.id, record.partnerTenantId, record.name).then(
      (result) => {
        if (result.error) {
          message.error(result.error.message, 10);
        } else {
          message.info('保存成功', 5);
          this.props.loadRepoUsers(this.props.repo.id);
        }
      }
    );
  }
  handleDelete = (record, index) => {
    this.props.deleteRepoUser(record.id).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        const repoUserList = [...this.state.repoUserList];
        repoUserList.splice(index, 1);
        this.setState({ repoUserList });
      }
    });
  }
  handleTradeSel = (partnerTenantId) => {
    const addOne = { ...this.state.addOne };
    addOne.tenant_id = partnerTenantId;
    addOne.partnerTenantId = partnerTenantId;
    const broker = this.state.brokers.find(tr => tr.partner_tenant_id === partnerTenantId);
    if (broker) {
      addOne.name = broker.name;
    }
    const repoUserList = [...this.state.repoUserList];
    repoUserList[repoUserList.length - 1] = addOne;
    this.setState({ repoUserList, addOne });
  }
  handlePermission = (ev) => {
    const addOne = { ...this.state.addOne };
    addOne.permission = ev.target.value;
    const repoUserList = [...this.state.repoUserList];
    repoUserList[repoUserList.length - 1] = addOne;
    this.setState({ repoUserList, addOne });
  }
  handleAddCancel = (index) => {
    const repoUserList = [...this.state.repoUserList];
    repoUserList.splice(index, 1);
    this.setState({ repoUserList });
  }
  render() {
    const { brokers, repoUserList } = this.state;
    const columns = [{
      title: this.msg('authUserName'),
      dataIndex: 'name',
      width: 200,
      render: (o, record) => {
        if (!record.id) {
          return (
            <Select value={record.tenant_id || ''} onChange={this.handleTradeSel} style={{ width: '100%' }}>
              {
                brokers.map(opt => <Option value={opt.partner_tenant_id} key={opt.name}>{opt.name}</Option>)
              }
            </Select>
          );
        } else {
          return record.name;
        }
      },
    }, {
      title: '权限',
      dataIndex: 'permission',
      width: 120,
      render: (perm, record) =>
          (<RadioGroup value={perm} disabled={record.id} onChange={this.handlePermission}>
            <RadioButton value={CMS_TRADE_REPO_PERMISSION.edit}>编辑</RadioButton>
            <RadioButton value={CMS_TRADE_REPO_PERMISSION.view}>只读</RadioButton>
          </RadioGroup>),
    }, {
      width: 60,
      render: (o, record, index) => {
        let ruAction = <a onClick={() => this.handleDelete(record, index)}><Icon type="delete" /></a>;
        if (!record.id) {
          ruAction = (
            <span>
              <a onClick={() => this.handleSave(record)}><Icon type="save" /></a>
              <a onClick={() => this.handleAddCancel(index)}><Icon type="close" /></a>
            </span>
            );
        }
        return (<div className="editable-row-operations">
          {ruAction}
        </div>);
      },
    }];
    return (
      <Table size="middle" pagination={false} columns={columns} dataSource={repoUserList} rowKey="id"
        footer={() => <Button type="dashed" onClick={this.handleAdd} icon="plus" style={{ width: '100%' }}>新增</Button>}
      />
    );
  }
}
