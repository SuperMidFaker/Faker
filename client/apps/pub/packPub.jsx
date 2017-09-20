import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Layout } from 'antd';
import PubHeaderBar from 'client/components/pubHeaderBar';
import { setNavTitle } from 'common/reducers/navbar';

const { Header, Content } = Layout;

@connect()
export default class PubPack extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    children: PropTypes.object.isRequired,
  }
  componentWillMount() {
    this.props.dispatch(setNavTitle({
      depth: 1,
    }));
  }
  render() {
    return (
      <Layout className="welo-layout-wrapper">
        <Header>
          <PubHeaderBar title="运单查询" />
        </Header>
        <Layout>
          <Content>
            {this.props.children}
          </Content>
        </Layout>
      </Layout>
    );
  }
}
