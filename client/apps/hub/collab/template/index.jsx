import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Breadcrumb, Button, Card, Icon, Layout, List } from 'antd';
import PageHeader from 'client/components/PageHeader';
import SearchBox from 'client/components/SearchBox';
import { intlShape, injectIntl } from 'react-intl';
import { toggleTemplateModal, loadTemplates, deleteTemplate } from 'common/reducers/template';
import RowAction from 'client/components/RowAction';
import HubSiderMenu from '../../menu';
import CreateModal from './modal/createModal';
import { formatMsg } from '../message.i18n';

const { Content } = Layout;

@injectIntl
@connect(
  state => ({
    templates: state.template.templates,
    pageSize: state.template.templates.pageSize,
    current: state.template.templates.current,
    filter: state.template.filter,
  }),
  { toggleTemplateModal, loadTemplates, deleteTemplate }
)
export default class NoticeTemplateList extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  componentDidMount() {
    this.props.loadTemplates({
      pageSize: this.props.pageSize,
      current: 1,
      filter: JSON.stringify({}),
    });
  }
  msg = formatMsg(this.props.intl);
  toggleTemplateModal = () => {
    this.props.toggleTemplateModal(true);
  }
  handleSearch = (value) => {
    const filter = { ...this.props.filter, searchText: value };
    this.props.loadTemplates({
      pageSize: this.props.pageSize,
      current: 1,
      filter: JSON.stringify(filter),
    });
  }
  handleReload = () => {
    const { filter } = this.props;
    this.props.loadTemplates({
      pageSize: this.props.pageSize,
      current: this.props.current,
      filter: JSON.stringify(filter),
    });
  }
  handleClick = (row) => {
    this.props.toggleTemplateModal(true, row);
  }
  handleDel = (row) => {
    this.props.deleteTemplate(row.id).then((result) => {
      if (!result.error) {
        this.handleReload();
      }
    });
  }
  render() {
    const { templates, filter } = this.props;
    const pagination = {
      hideOnSinglePage: true,
      pageSize: Number(templates.pageSize),
      current: Number(templates.current),
      total: templates.total,
      showTotal: total => `共 ${total} 条`,
      onChange: (page, pageSize) => {
        this.props.loadTemplates({
          pageSize,
          current: page,
          filter: JSON.stringify(filter),
        });
      },
    };
    return (
      <Layout>
        <HubSiderMenu currentKey="template" />
        <Layout>
          <PageHeader>
            <PageHeader.Title>
              <Breadcrumb>
                <Breadcrumb.Item>
                  <Icon type="notification" /> {this.msg('templates')}
                </Breadcrumb.Item>
              </Breadcrumb>
            </PageHeader.Title>
            <PageHeader.Actions>
              <Button type="primary" icon="plus" onClick={this.toggleTemplateModal}>
                {this.msg('create')}
              </Button>
            </PageHeader.Actions>
          </PageHeader>
          <Content className="page-content layout-fixed-width">
            <Card bodyStyle={{ padding: 16 }} >
              <List
                dataSource={this.props.templates.data}
                header={<SearchBox placeholder={this.msg('searchTip')} onSearch={this.handleSearch} />}
                pagination={pagination}
                renderItem={item => (
                  <List.Item
                    key={item.id}
                    actions={[
                      <RowAction size="default" onClick={() => this.handleClick(item)} icon="setting" label={this.msg('config')} />,
                      <RowAction danger size="default" icon="delete" confirm="确定删除?" onConfirm={this.handleDel} row={item} />,
                  ]}
                  >
                    <List.Item.Meta
                      title={item.name}
                      description={item.title}
                    />
                  </List.Item>
                  )}
              />
            </Card>
            <CreateModal reload={this.handleReload} />
          </Content>
        </Layout>
      </Layout>
    );
  }
}
