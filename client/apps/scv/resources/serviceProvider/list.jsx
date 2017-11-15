import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Button, Layout, Popconfirm } from 'antd';
import connectFetch from 'client/common/decorators/connect-fetch';
import { loadPartners, openSpModal, changePartnerStatus, deletePartner } from 'common/reducers/partner';
import Table from 'client/components/remoteAntTable';
import connectNav from 'client/common/decorators/connect-nav';
import ScvResourceWrapper from '../wrapper';
import SpModal from './spModal';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { PARTNER_ROLES } from 'common/constants';
import { formatMsg } from '../message.i18n';

const Content = Layout.Content;

function fetchData({ dispatch, state }) {
  return dispatch(loadPartners({
    tenantId: state.account.tenantId,
    role: PARTNER_ROLES.SUP,
  }));
}

@connectFetch()(fetchData)
@injectIntl
@connect(
  state => ({
    loaded: state.partner.loaded,
    partners: state.partner.partners,
    tenantId: state.account.tenantId,
  }),
  { openSpModal, loadPartners, changePartnerStatus, deletePartner }
)
@connectNav({
  depth: 2,
  moduleName: 'scv',
})
export default class ScvServiceProviderList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
  }
  componentWillReceiveProps(nextProps) {
    if (!nextProps.loaded) {
      this.props.loadPartners({
        tenantId: nextProps.tenantId,
        role: PARTNER_ROLES.SUP,
      });
    }
  }
  msg = formatMsg(this.props.intl);
  handleSpEdit = (partner) => {
    this.props.openSpModal(partner, 'edit');
  }
  handleAddSp = () => {
    this.props.openSpModal({ }, 'add');
  }
  handleSpDisable = (row) => {
    this.props.changePartnerStatus(row.id, 0, PARTNER_ROLES.SUP, row.business_type);
  }
  handleSpDelete = (row) => {
    this.props.deletePartner(row.id, PARTNER_ROLES.SUP, row.business_type);
  }
  handleSpEnable = (row) => {
    this.props.changePartnerStatus(row.id, 1, PARTNER_ROLES.SUP, row.business_type);
  }
  handleSpReload = () => {
    this.props.loadPartners({
      tenantId: this.props.tenantId,
      role: PARTNER_ROLES.SUP,
    });
  }
  columns = [{
    title: '服务商名称',
    dataIndex: 'name',
    width: 200,
  }, {
    title: '统一社会信用代码',
    dataIndex: 'partner_unique_code',
    width: 200,
  }, {
    title: '海关编码',
    dataIndex: 'customs_code',
    width: 150,
  }, {
    title: '联系人',
    dataIndex: 'contact',
    width: 200,
  }, {
    title: '业务类型',
    dataIndex: 'business_type',
    width: 300,
    render: (bt) => {
      const bss = bt.split(',');
      const names = [];
      for (let i = 0; i < bss.length; i++) {
        switch (bss[i]) {
          case 'clearance':
            names.push('清关');
            break;
          case 'transport':
            names.push('运输');
            break;
          default: break;
        }
      }
      return `${names.join('/')}服务商`;
    },
  }, {
    title: '操作',
    dataIndex: 'status',
    render: (_, record) => {
      if (record.status === 1) {
        return (
          <PrivilegeCover module="corp" feature="partners" action="edit">
            <span>
              <a onClick={() => this.handleSpEdit(record)}>修改</a>
              <span className="ant-divider" />
              <a onClick={() => this.handleSpDisable(record)}>停用</a>
            </span>
          </PrivilegeCover>
        );
      } else {
        return (
          <span>
            <PrivilegeCover module="corp" feature="partners" action="delete">
              <Popconfirm title="确定要删除吗？" onConfirm={() => this.handleSpDelete(record)}>
                <a>删除</a>
              </Popconfirm>
            </PrivilegeCover>
            <span className="ant-divider" />
            <PrivilegeCover module="corp" feature="partners" action="edit">
              <a onClick={() => this.handleSpEnable(record)}>启用</a>
            </PrivilegeCover>
          </span>);
      }
    },
  }]
  render() {
    const { loading, partners } = this.props;
    return (
      <ScvResourceWrapper menuKey="serviceprovider">
        <Content className="nav-content">
          <div className="toolbar">
            <Button type="primary" icon="plus" onClick={this.handleAddSp}>
              添加服务商
            </Button>
          </div>
          <div className="panel-body table-panel table-fixed-layout">
            <Table columns={this.columns} dataSource={partners} loading={loading} scroll={{ x: 1200 }} />
          </div>
        </Content>
        <SpModal reload={this.handleSpReload} />
      </ScvResourceWrapper>
    );
  }
}
