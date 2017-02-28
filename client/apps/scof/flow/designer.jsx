import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { intlShape, injectIntl } from 'react-intl';
import { Breadcrumb, Button, Card, Form, Row, Col, Layout } from 'antd';
import connectNav from 'client/common/decorators/connect-nav';
import { format } from 'client/common/i18n/helpers';
import FlowNodeForm from './forms/flowNodeForm';
import BizObjCMSForm from './forms/bizObjCMSForm';
import messages from './message.i18n';

const formatMsg = format(messages);
const { Header, Content, Sider } = Layout;

@injectIntl
@connect(
  state => ({
    tenantId: state.account.tenantId,
  }),
)
@connectNav({
  depth: 2,
  moduleName: 'scof',
})
@Form.create()
export default class FlowDesigner extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    tenantId: PropTypes.number.isRequired,
    form: PropTypes.object.isRequired,
    submitting: PropTypes.bool,
  }
  static contextTypes = {
    router: PropTypes.object.isRequired,
  }
  state = {
    selectedRowKeys: [],
    searchInput: '',
    collapsed: false,
  }
  componentDidMount() {
    const data = {
      nodes: [
        {
          x: 440,
          y: 210,
          id: 'node1',
        },
        {
          x: 570,
          y: 170,
          id: 'node2',
        },
      ],
      edges: [
        {
          source: 'node1',
          id: 'edge1',
          target: 'node2',
        },
      ],
    };
      // 第四步：配置G6画布
    const graph = new window.G6.Graph({
      id: 'flowchart',      // 容器ID
      width: 1200,    // 画布宽
      height: 360,   // 画布高
      grid: {
        forceAlign: true, // 是否支持网格对齐
        cell: 10,          // 网格大小
      },
    });
      // 第五步：载入数据
    graph.source(data.nodes, data.edges);
      // 第六步：渲染关系图
    graph.render();
  }
  msg = key => formatMsg(this.props.intl, key);

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }
  handleStatusChange = (ev) => {
    if (ev.target.value === this.props.listFilter.status) {

    }
  }
  handleSaveBtnClick = () => {

  }
  render() {
    const { form, submitting } = this.props;
    return (
      <Layout>
        <Sider width={280} className="menu-sider" key="sider" trigger={null}
          collapsible
          collapsed={this.state.collapsed}
          collapsedWidth={0}
        >
          <div className="top-bar">
            <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('flow')}
              </Breadcrumb.Item>
            </Breadcrumb>
            <div className="pull-right">
              <Button type="primary" size="large" icon="plus-circle-o" ghost>
                {this.msg('add')}
              </Button>
            </div>
          </div>
        </Sider>
        <Layout>
          <Header className="top-bar">
            { this.state.collapsed && <Breadcrumb>
              <Breadcrumb.Item>
                {this.msg('flow')}
              </Breadcrumb.Item>
              <Breadcrumb.Item>
                流程名称
              </Breadcrumb.Item>
            </Breadcrumb>}
            <Button size="large"
              className={this.state.collapsed ? '' : 'btn-toggle-on'}
              icon={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
            />
            <div className="top-bar-tools">
              <Button size="large" type="primary" icon="save" loading={submitting} onClick={this.handleSaveBtnClick}>
                {this.msg('save')}
              </Button>
            </div>
          </Header>
          <Content className="main-content" key="main" >
            <Row gutter={16}>
              <Col sm={24} md={16}>
                <Card title={this.msg('flowChart')} bodyStyle={{ padding: 0, height: 360 }} >
                  <div id="flowchart" />
                </Card>
                <FlowNodeForm form={form} />
              </Col>
              <Col sm={24} md={8}>
                <BizObjCMSForm form={form} />
              </Col>
            </Row>
          </Content>
        </Layout>
      </Layout>
    );
  }
}
