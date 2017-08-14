import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Icon, Table, Button, Popconfirm, Tag, message } from 'antd';
import NavLink from 'client/components/NavLink';
import { loadPartners } from 'common/reducers/partner';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import AddTemplateModal from './modal/addTemplateModal';
import { loadBillemplates, deleteTemplate, toggleBillTempModal } from 'common/reducers/cmsManifest';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES, CMS_BILL_TEMPLATE_PERMISSION } from 'common/constants';
import { loadCustomers } from 'common/reducers/crmCustomers';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    billtemplates: state.cmsManifest.billtemplates,
  }),
  { loadPartners, loadBillemplates, deleteTemplate, toggleBillTempModal, loadCustomers }
)

export default class ManifestTemplateList extends React.Component {
  static PropTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    billtemplates: PropTypes.array,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentWillMount() {
    this.props.loadBillemplates({ tenantId: this.props.tenantId, ietype: this.props.ietype });
    this.props.loadCustomers(this.props.tenantId);
  }
  msg = key => formatMsg(this.props.intl, key);
  handleEdit = (record) => {
    const ietype = record.i_e_type === 0 ? 'import' : 'export';
    this.context.router.push(`/clearance/${ietype}/manifest/rules/edit/${record.id}`);
  }
  handleDelete = (record) => {
    this.props.deleteTemplate(record.id).then((result) => {
      if (result.error) {
        message.error(result.error.message, 10);
      } else {
        const ietype = record.i_e_type === 0 ? 'import' : 'export';
        this.props.loadBillemplates({ tenantId: this.props.tenantId, ietype });
      }
    });
  }
  handleAddBtnClicked = () => {
    this.props.loadPartners({
      tenantId: this.props.tenantId,
      role: PARTNER_ROLES.CUS,
      businessType: PARTNER_BUSINESSE_TYPES.clearance,
    });
    this.props.toggleBillTempModal(true, 'add');
  }
  render() {
    const columns = [
      {
        title: '模板名称',
        dataIndex: 'template_name',
        key: 'template_name',
        width: 120,
      }, {
        title: '类型',
        dataIndex: 'i_e_type',
        key: 'i_e_type',
        width: 40,
        render: o => <Tag>{o === 0 ? '进口' : '出口'}</Tag>,
      }, {
        title: '关联客户',
        dataIndex: 'customer_name',
        key: 'customer_name',
      }, {
        title: '操作',
        dataIndex: 'status',
        key: 'status',
        width: 60,
        render: (_, record) => {
          const ietype = record.i_e_type === 0 ? 'import' : 'export';
          if (record.permission === CMS_BILL_TEMPLATE_PERMISSION.edit) {
            return (
              <span>
                <a onClick={() => this.handleEdit(record)}><Icon type="edit" /></a>
                <span className="ant-divider" />
                <Popconfirm title="确定要删除吗？" onConfirm={() => this.handleDelete(record)}>
                  <a><Icon type="delete" /></a>
                </Popconfirm>
              </span>);
          } else if (record.permission === CMS_BILL_TEMPLATE_PERMISSION.view) {
            return <NavLink to={`/clearance/${ietype}/manifest/rules/view/${record.id}`}>{this.msg('view')}</NavLink>;
          }
          return '';
        },
      },
    ];
    return (
      <div>
        <div className="toolbar">
          <Button type="primary" onClick={this.handleAddBtnClicked} icon="plus-circle-o">新增</Button>
        </div>
        <div className="panel-body table-panel table-fixed-layout">
          <Table size="middle" columns={columns} dataSource={this.props.billtemplates} rowKey="id" />
        </div>
        <AddTemplateModal ietype={this.props.ietype} />
      </div>
    );
  }
}
