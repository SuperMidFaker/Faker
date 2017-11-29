import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import moment from 'moment';
import { Icon, Table, Button, Layout, Popconfirm, Tag, message } from 'antd';
import NavLink from 'client/components/NavLink';
import { loadPartners } from 'common/reducers/partner';
import { format } from 'client/common/i18n/helpers';
import messages from '../message.i18n';
import AddManifestRuleModal from '../modal/addManifestRuleModal';
import ManifestRuleCloneModal from '../modal/manifestRuleCloneModal';
import { loadBillemplates, deleteTemplate, toggleBillTempModal, showManifestRulesCloneModal } from 'common/reducers/cmsManifest';
import { CMS_BILL_TEMPLATE_PERMISSION } from 'common/constants';

const { Content } = Layout;
const formatMsg = format(messages);

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
    billtemplates: state.cmsManifest.billtemplates,
    customer: state.cmsResources.customer,
  }),
  { loadPartners, loadBillemplates, deleteTemplate, toggleBillTempModal, showManifestRulesCloneModal }
)

export default class ManifestRulesPane extends React.Component {
  static PropTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    billtemplates: PropTypes.array,
    customer: PropTypes.object,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentWillMount() {
    this.props.loadBillemplates({ tenantId: this.props.tenantId, ietype: this.props.ietype });
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
        width: 200,
        render: o => <Tag>{o === 0 ? '进口' : '出口'}</Tag>,
      }, {
        title: '修改人',
        dataIndex: 'modify_name',
        key: 'modify_name',
      }, {
        title: '最后更新时间',
        dataIndex: 'modify_date',
        key: 'modify_date',
        render: date => date ? moment(date).format('MM.DD HH:mm') : '-',
      }, {
        title: '操作',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (_, record) => {
          const ietype = record.i_e_type === 0 ? 'import' : 'export';
          if (record.permission === CMS_BILL_TEMPLATE_PERMISSION.edit) {
            return (
              <span>
                <a onClick={() => this.handleEdit(record)}><Icon type="edit" /></a>
                <span className="ant-divider" />
                <a onClick={() => this.handleClone(record)}><Icon type="copy" /></a>
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
    const datas = this.props.billtemplates.filter(tp => tp.customer_partner_id === this.props.customer.id);
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
