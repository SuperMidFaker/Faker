import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Button, Icon, Layout, notification, List, Card } from 'antd';
import { PARTNER_ROLES } from 'common/constants';
import { loadPartners } from 'common/reducers/partner';
import { loadAdaptors, loadAdaptor, showAdaptorDetailModal, delAdaptor, showAdaptorModal } from 'common/reducers/saasLineFileAdaptor';
import ExcelUploader from 'client/components/ExcelUploader';
import PageHeader from 'client/components/PageHeader';
import PageHint from 'client/components/PageHint';
import RowAction from 'client/components/RowAction';
import { intlShape, injectIntl } from 'react-intl';
import { format } from 'client/common/i18n/helpers';
import AdaptorModal from './modal/adaptorModal';
import AdaptorDetailModal from './modal/adaptorDetailModal';
import HubSiderMenu from '../menu';
import messages from './message.i18n';

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
    pageSize: state.saasLineFileAdaptor.adaptors.pageSize,
    current: state.saasLineFileAdaptor.adaptors.current,
  }),
  {
    showAdaptorModal, loadAdaptors, loadPartners, loadAdaptor, showAdaptorDetailModal, delAdaptor,
  }
)

export default class ApiAuthList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentWillMount() {
    this.props.loadAdaptors('', '', '', this.props.pageSize, 1);
    this.props.loadPartners({
      role: PARTNER_ROLES.CUS,
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
  handleDel = (record) => {
    this.props.delAdaptor(record.code).then((result) => {
      if (result.error) {
        notification.error({ description: result.error.message });
      } else {
        this.handleReload();
      }
    });
  }
  handleUploaded = () => {
    this.handleReload();
  }
  handleAddWarehouse = () => {
    this.props.showAdaptorModal();
  }
  handleReload = () => {
    const { pageSize, current } = this.props;
    this.props.loadAdaptors('', '', '', pageSize, current);
  }
  render() {
    const { adaptors } = this.props;
    const pagination = {
      pageSize: adaptors.pageSize,
      current: adaptors.current,
      total: adaptors.total,
      showTotal: total => `共 ${total} 条`,
      onChange: (page, pageSize) => {
        this.props.loadAdaptors('', '', '', pageSize, page);
      },
    };
    return (
      <Layout>
        <HubSiderMenu currentKey="adapter" />
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  <Icon type="usb" /> 数据适配
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
          <Content className="page-content layout-fixed-width" key="main">
            <Card bodyStyle={{ padding: 16 }} >
              <List
                dataSource={this.props.adaptors.data}
                pagination={pagination}
                renderItem={(item) => {
                  let action = null;
                  if (item.active) {
                    action = <RowAction onClick={this.handleEditBtnClick} icon="edit" label="修改" row={item} />;
                  } else {
                    action = (<ExcelUploader
                      endpoint={`${API_ROOTS.default}v1/saas/line/file/upload/example`}
                      formData={{ data: JSON.stringify({ code: item.code }) }}
                      onUploaded={this.handleUploaded}
                    >
                      <RowAction icon="cloud-upload-o" tooltip="上传只有两行示例内容的Excel文件" />
                    </ExcelUploader>);
                  }
                  return (<List.Item
                    key={item.code}
                    actions={[
                      action,
                      <RowAction danger confirm="确定删除？" onConfirm={this.handleDel} icon="delete" row={item} />,
                    ]}
                  >
                    <List.Item.Meta
                      title={item.name}
                      description={item.biz_model}
                    />
                    <div>stratLine: {item.start_line}</div>
                  </List.Item>);
}}
              />
            </Card>
          </Content>
          <AdaptorModal />
          <AdaptorDetailModal />
        </Layout>
      </Layout>
    );
  }
}
