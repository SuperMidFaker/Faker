import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Icon, Table, Button, Popconfirm, message } from 'antd';
import NavLink from 'client/components/nav-link';
import { loadPartners } from 'common/reducers/partner';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import AddTemplateModal from './modal/addTemplateModal';
import { loadBillemplates, deleteTemplate, toggleBillTempModal } from 'common/reducers/cmsManifest';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES, CMS_BILL_TEMPLATE_PERMISSION } from 'common/constants';

const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    billtemplates: state.cmsManifest.billtemplates,
  }),
  { loadPartners, loadBillemplates, deleteTemplate, toggleBillTempModal }
)

export default class Templates extends React.Component {
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
  }
  msg = key => formatMsg(this.props.intl, key);
  handleEdit = (record) => {
    this.context.router.push(`/clearance/${this.props.ietype}/manifest/billtemplates/edit/${record.id}`);
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
            return <NavLink to={`/clearance/${this.props.ietype}/manifest/billtemplates/view/${record.id}`}>{this.msg('view')}</NavLink>;
          }
          return '';
        },
      },
    ];
    return (
      <div>
        <div className="toolbar">
          <Button type="primary" size="large" onClick={this.handleAddBtnClicked} icon="plus-circle-o">新增模板</Button>
        </div>
        <div className="panel-body table-panel">
          <Table size="middle" columns={columns} dataSource={this.props.billtemplates} rowKey="id" />
        </div>
        <AddTemplateModal ietype={this.props.ietype} />
      </div>
    );
  }
}
