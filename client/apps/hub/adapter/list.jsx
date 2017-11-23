import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Button, Icon, Layout, Tooltip, Popconfirm, notification } from 'antd';
import DataTable from 'client/components/DataTable';
import PageHeader from 'client/components/PageHeader';
import PageHint from 'client/components/PageHint';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import AdaptorModal from './modal/adaptorModal';
import AdaptorDetailModal from './modal/adaptorDetailModal';
import ExcelUploader from 'client/components/ExcelUploader';
import { PrivilegeCover } from 'client/common/decorators/withPrivilege';
import { loadAdaptors, loadAdaptor, showAdaptorDetailModal, delAdaptor, showAdaptorModal } from 'common/reducers/saasLineFileAdaptor';
import { loadPartners } from 'common/reducers/partner';
import messages from './message.i18n';
import { PARTNER_ROLES, PARTNER_BUSINESSE_TYPES } from 'common/constants';

const formatMsg = format(messages);
const { Content } = Layout;

@injectIntl
@connect(
  state => ({
    profile: state.account.profile,
    role: state.account.role_name,
    tenantId: state.account.tenantId,
    parentTenantId: state.account.parentTenantId,
    code: state.account.code,
    adaptors: state.saasLineFileAdaptor.adaptors,
    customers: state.partner.partners,
  }),
  { showAdaptorModal, loadAdaptors, loadPartners, loadAdaptor, showAdaptorDetailModal, delAdaptor }
)

export default class ApiAuthList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,

  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    avatar: '',
  }
  componentWillMount() {
    this.props.loadAdaptors();
    this.props.loadPartners({
      role: PARTNER_ROLES.CUS,
      businessType: PARTNER_BUSINESSE_TYPES.clearance,
    });
  }
  msg = (key, values) => formatMsg(this.props.intl, key, values);
  handleCancel = () => {
    this.context.router.goBack();
  }
  handleEditBtnClick = (edit) => {
    this.props.showAdaptorDetailModal();
    this.props.loadAdaptor(edit.code);
  }
  handleDel = (code) => {
    this.props.delAdaptor(code).then((result) => {
      if (result.error) {
        notification.error({ description: result.error.message });
      } else {
        this.props.loadAdaptors();
      }
    });
  }
  handleUploaded = () => {
    this.props.loadAdaptors();
  }
  columns = [{
    title: this.msg('适配器名称'),
    dataIndex: 'name',
    width: 200,
  }, {
    title: this.msg('适配对象'),
    width: 200,
    dataIndex: 'biz_model',
  }, {
    title: this.msg('scope'),
    dataIndex: 'owner_partner_id',
    render: (o) => {
      if (o) {
        return this.props.customers.find(cus => cus.id === o).name;
      } else {
        return '全局';
      }
    },
  }, {
    title: this.msg('opColumn'),
    width: 100,
    render: (_, record) => {
      let editDiv = null;
      if (record.active) {
        editDiv = (<PrivilegeCover module="clearance" feature="resources" action="edit">
          <Button icon="edit" onClick={() => this.handleEditBtnClick(record)} />
        </PrivilegeCover>);
      } else {
        editDiv = (<ExcelUploader endpoint={`${API_ROOTS.default}v1/saas/line/file/upload/example`}
          formData={{ data: JSON.stringify({ code: record.code }) }} onUploaded={this.handleUploaded}
        >
          <Tooltip title="上传只有两行示例内容的Excel文件"><Button icon="cloud-upload-o" /></Tooltip>
        </ExcelUploader>);
      }
      return (<span>
        {editDiv}
        <span className="ant-divider" />
        <PrivilegeCover module="clearance" feature="resources" action="delete">
          <Popconfirm title="确定要删除吗？" onConfirm={() => this.handleDel(record.code)}>
            <Button icon="delete" />
          </Popconfirm>
        </PrivilegeCover>
      </span>
      );
    },
  }];

  handleAddWarehouse = () => {
    this.props.showAdaptorModal();
  }
  render() {
    return (
      <div>
        <PageHeader>
          <PageHeader.Title>
            <Breadcrumb>
              <Breadcrumb.Item>
                <Icon type="api" /> 数据适配
              </Breadcrumb.Item>
            </Breadcrumb>
          </PageHeader.Title>
          <PageHeader.Actions>
            <PageHint />
            <Button type="primary" icon="plus" onClick={this.handleAddWarehouse}>
              {this.msg('create')}
            </Button>
          </PageHeader.Actions>
        </PageHeader>
        <Content className="page-content" key="main">
          <DataTable
            columns={this.columns} dataSource={this.props.adaptors} rowKey="id"
            locale={{ emptyText: '没有当前状态的ASN' }}
          />
        </Content>
        <AdaptorModal />
        <AdaptorDetailModal />
      </div>
    );
  }
}
