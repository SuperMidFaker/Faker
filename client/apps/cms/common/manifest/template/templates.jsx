import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Table, Button, message } from 'antd';
import RowAction from 'client/components/RowAction';
import { loadPartners } from 'common/reducers/partner';
import { loadBillemplates, deleteTemplate, toggleBillTempModal } from 'common/reducers/cmsManifest';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES, CMS_BILL_TEMPLATE_PERMISSION } from 'common/constants';
import AddTemplateModal from './modal/addTemplateModal';
import { formatMsg } from '../../message.i18n';


@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    billtemplates: state.cmsManifest.billtemplates,
  }),
  {
    loadPartners, loadBillemplates, deleteTemplate, toggleBillTempModal,
  }
)

export default class ManifestTemplateList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    billtemplates: PropTypes.arrayOf(PropTypes.shape({ template_name: PropTypes.string })),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentDidMount() {
    this.props.loadBillemplates({ tenantId: this.props.tenantId, ietype: this.props.ietype });
    this.props.loadPartners({
      role: PARTNER_ROLES.CUS,
      businessType: PARTNER_BUSINESSE_TYPES.clearance,
    });
  }
  msg = formatMsg(this.props.intl)
  handleDetail = (record) => {
    const ietype = record.i_e_type === 0 ? 'import' : 'export';
    this.context.router.push(`/clearance/${ietype}/manifest/rules/view/${record.id}`);
  }
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
    this.props.toggleBillTempModal(true, 'add');
  }
  render() {
    const columns = [
      {
        title: '模板名称',
        dataIndex: 'template_name',
        key: 'template_name',
        width: 150,
      }, {
        title: '关联客户',
        dataIndex: 'customer_name',
        key: 'customer_name',
      }, {
        title: '操作',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (_, record) => {
          if (record.permission === CMS_BILL_TEMPLATE_PERMISSION.edit) {
            return (
              <span>
                <RowAction onClick={this.handleEdit} icon="edit" row={record} />
                <RowAction confirm="确定删除？" onConfirm={() => this.handleDelete(record)} icon="delete" />
              </span>);
          } else if (record.permission === CMS_BILL_TEMPLATE_PERMISSION.view) {
            return <RowAction onClick={this.handleDetail} icon="eye-o" row={record} />;
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
