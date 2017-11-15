import React from 'react';
import { Card, Spin } from 'antd';
import './index.less';


const ChartCard = ({
  loading = false, contentHeight, title, action, total, footer, canvas, children, ...rest
}) => {
  const content = (
    <div className="welo-chart-card">
      <div className="meta">
        <span className="title">{title}</span>
        <span className="action">{action}</span>
      </div>
      {
        // eslint-disable-next-line
        total && <p className="total" dangerouslySetInnerHTML={{ __html: total }} />
      }
      <div className="content" style={{ height: contentHeight || 'auto' }}>
        <div className={contentHeight && 'content-fixed'} style={canvas && { position: 'absolute', top: (-contentHeight / 2) }}>
          {children}
        </div>
      </div>
      {
        footer && (
          <div className="footer">
            {footer}
          </div>
        )
      }
    </div>
  );

  return (
    <Card
      bodyStyle={{ padding: '20px 24px 8px 24px' }}
      {...rest}
    >
      {<Spin spinning={loading}>{content}</Spin>}
    </Card>
  );
};

export default ChartCard;
