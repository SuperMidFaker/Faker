import React, { PropTypes } from 'react';
import { intlShape, injectIntl } from 'react-intl';
import { Steps } from 'antd';
import './orders.less';

const Step = Steps.Step;

@injectIntl
export default class progressColumn extends React.Component {
  static propTypes = {
    intl: intlShape.isRequired,
    order: PropTypes.object.isRequired,
  }

  render() {
    const { order } = this.props;
    if (order) {
      return (
        <div className="order-progress">
          <Steps size="small" current={1}>
            <Step title="进境清关" description={<span><div className="mdc-text-grey table-font-small">开始：03.23</div><div className="mdc-text-grey table-font-small">放行：03.24</div></span>} />
            <Step title="区内短驳" description={<span><div className="mdc-text-grey table-font-small">开始：03.24 10:25</div><div className="table-font-small">提货：03.24 14:23</div></span>} />
            <Step title="Waiting" />
          </Steps>
        </div>
      );
    } else {
      return <div />;
    }
  }
}
