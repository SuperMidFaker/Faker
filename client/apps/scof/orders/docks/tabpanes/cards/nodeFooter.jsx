import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Steps } from 'antd';
import { loadOrderNodesTriggers } from 'common/reducers/sofOrders';

const { Step } = Steps;

@connect(
  () => ({}),
  {
    loadOrderNodesTriggers,
  }
)
export default class FlowNodeFooter extends React.PureComponent {
  static propTypes = {
    node: PropTypes.shape({
      uuid: PropTypes.string,
      biz_no: PropTypes.string,
    }),
    bizObjects: PropTypes.arrayOf(PropTypes.string),
    triggerMap: PropTypes.shape({}),
    stepDesc: PropTypes.arrayOf(PropTypes.string),
  }
  state = {
    trigger: -1,
  }
  componentDidMount() {
    const { node: { uuid, biz_no: bizno }, bizObjects } = this.props;
    if (bizno) {
      this.props.loadOrderNodesTriggers(uuid, bizObjects, bizno).then((result) => {
        if (!result.data) return;
        this.setState({
          trigger: this.props.triggerMap[result.data.trigger_name],
        });
      });
    }
  }
  render() {
    const { trigger } = this.state;
    const { stepDesc } = this.props;
    return (
      <Steps current={trigger} progressDot>
        { stepDesc.map(std => <Step title={std} key={std} />) }
      </Steps>
    );
  }
}
