import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Table, Button, Layout, Tag, message } from 'antd';
import NavLink from 'client/components/NavLink';
import RowAction from 'client/components/RowAction';
import { loadBillemplates, deleteTemplate, toggleBillTempModal, showManifestRulesCloneModal } from 'common/reducers/cmsManifest';
import { CMS_BILL_TEMPLATE_PERMISSION } from 'common/constants';

import AddManifestRuleModal from '../modal/addManifestRuleModal';
import ManifestRuleCloneModal from '../modal/manifestRuleCloneModal';
import { formatMsg } from '../../message.i18n';

const { Content } = Layout;


@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    billtemplates: state.cmsManifest.billtemplates,
    customer: state.cmsResources.customer,
  }),
  {
    loadBillemplates,
    deleteTemplate,
    toggleBillTempModal,
    showManifestRulesCloneModal,
  }
)

export default class ManifestRulesPane extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    billtemplates: PropTypes.arrayOf(PropTypes.shape({ template_name: PropTypes.string })),
    customer: PropTypes.shape({ id: PropTypes.number }),
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentWillMount() {
    this.props.loadBillemplates({ tenantId: this.props.tenantId, ietype: this.props.ietype });
  }
  msg = formatMsg(this.props.intl)
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
  handleClone = (record) => {
    this.props.showManifestRulesCloneModal(record.id, record.i_e_type);
  }
  render() {
    const columns = [
      {
        title: '规则名称',
        dataIndex: 'template_name',
        key: 'template_name',

      }, {
        title: '类型',
        dataIndex: 'i_e_type',
        key: 'i_e_type',
        width: 100,
        render: o => <Tag>{o === 0 ? '进口' : '出口'}</Tag>,
      }, {
        title: '最后更新时间',
        dataIndex: 'modify_date',
        key: 'modify_date',
        width: 120,
        render: date => (date ? moment(date).format('MM.DD HH:mm') : '-'),
      }, {
        title: '修改人',
        dataIndex: 'modify_name',
        key: 'modify_name',
        width: 100,
      }, {
        title: '创建日期',
        dataIndex: 'created_date',
        key: 'created_date',
        width: 120,
        render(o) {
          return moment(o).format('YYYY/MM/DD');
        },
      }, {
        title: '创建人',
        dataIndex: 'creater_name',
        key: 'creater_name',
        width: 100,
      }, {
        title: '操作',
        key: 'OP_COL',
        width: 160,
        render: (_, record) => {
          const ietype = record.i_e_type === 0 ? 'import' : 'export';
          if (record.permission === CMS_BILL_TEMPLATE_PERMISSION.edit) {
            return (
              <span>
                <RowAction onClick={this.handleEdit} icon="edit" label={this.msg('modify')} row={record} />
                <RowAction onClick={this.handleClone} icon="copy" tooltip={this.msg('clone')} row={record} />
                <RowAction confirm="确定删除？" onConfirm={this.handleDelete} icon="delete" tooltip={this.msg('delete')} row={record} />
              </span>);
          } else if (record.permission === CMS_BILL_TEMPLATE_PERMISSION.view) {
            return <NavLink to={`/clearance/${ietype}/manifest/rules/view/${record.id}`}>{this.msg('view')}</NavLink>;
          }
          return '';
        },
      },
    ];
    const datas = this.props.billtemplates.filter(tp => tp.customer_partner_id ===
      this.props.customer.id);
    return (
      <Content>
        <div className="toolbar">
          <Button type="primary" onClick={this.handleAddBtnClicked} icon="plus-circle-o">新增</Button>
        </div>
        <div className="panel-body table-panel table-fixed-layout">
          <Table size="middle" columns={columns} dataSource={datas} rowKey="id" />
        </div>
        <AddManifestRuleModal customer={this.props.customer} />
        <ManifestRuleCloneModal />
      </Content>
    );
  }
}
