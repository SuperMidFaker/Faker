import { messages } from '../models/messages.db';
import { TenantUser } from '../models/tenant-user.db';
import { Tenant } from '../models/tenant.db';
import { WeixinUser } from '../models/weixin.db';
import { WELOGIX_LOGO_URL } from 'common/constants';
import * as Wexin from '../util/weixin-template-message';
import moment from 'moment';

class SocketIO {
	                    static initialize(io) {
		                    if (!this.instance) {
			                    this.instance = io;
		}
		                    this.instance.on('connection', (socket) => {
			                    socket.on('room', (data) => {
				                    socket.join(String(data.tenantId));
			});
		});
	}
	                    static Instance() {
		                    return this.instance;
	}
}

function * sendMessage(from, to, msg) {
	                    if (!from) {
		                    throw new Error('params [from] was lost!');
	}
	                    if (!to) {
		                    throw new Error('params [to] was lost!');
	}
	                    if (!msg) {
		                    throw new Error('params [msg] was lost!');
	}
	                    if (to.tenant_id && to.tenant_id !== -1)
	{
		                    let data = {
			                    tenant_id: to.tenant_id,
			                    from_tenant_id: from.tenant_id,
			                    from_login_id: from.login_id,
			                    from_name: from.name,
			                    title: msg.title,
	                        content: msg.content,
	                        logo: msg.logo,
	                        url: msg.url,
		};
		                    SocketIO.Instance().of('/').to(String(to.tenant_id)).emit('message', data);
		                    const result = yield TenantUser.findAll({
	                        raw: true,
	                        where: {
	                          $and: [
		                          {
		      	                                        $or: [
		      		                    {
		      			                                        tenant_id: to.tenant_id,
		      		                    },
		      	],
		                          }, {
		      	                    $or: [
		      		                    {
		      			                                        user_type: 'manager',
		      		                    }, {
		      			                    user_type: 'owner',
		      		},
		      	],
		      },
	      ],
	    },
	  });
	                      const promises = [];
	                      const loginIds = [];
		                    result.forEach((item) => {
			                    const rec = { ...data, login_id: item.login_id, status: 0, time: new Date() };
			                    promises.push(messages.create(rec));
			                    loginIds.push(item.login_id);
		});

		                    const wus = yield WeixinUser.findAll({
	                        raw: true,
	                        where: {
	                          login_id: {
	      	                    $in: loginIds,
	      },
	    },
	                        attributes: ['login_id', 'openid'],
	  });
	                      wus.forEach((item) => {
	  	                    const ship = {
	  		                    ...item,
	  		                    ...msg,
	  		                    first: msg.title,
	  		                    remark: msg.remark || msg.content,
	  		                    url: `${msg.wxUrl}${msg.shipmt_no}/sp`,
	  	};
			                    promises.push(Wexin.sendNewShipMessage(ship));
		});

		                    return yield promises;
	}
}

function msg(status) {
	                    switch (status)
	{
		                    case 1:
		                                        return '待接单';
		                    case 2:
		                                        return '待分配';
		                    case 3:
		                                        return '已分配';
		                    case 4:
		                                        return '待交货';
		                    case 5:
		                                        return '待回单';
		                    case 6:
		                                        return '回单已提交';
		                    case 7:
		                                        return '回单已接受';
		                    default:
		                                        return '';
	}
}

function sendNewShipMessage(ship) {
	                    return sendMessage({
  tenant_id: ship.tenant_id,
  login_id: ship.login_id,
  name: ship.name,
}, {
  namespace: '/',
  tenant_id: ship.to_tenant_id,
}, {
  ...ship,
  logo: ship.logo || WELOGIX_LOGO_URL,
  url: '/transport/dispatch',
  wxUrl: '/weixin/tms/detail/',
  time: moment(new Date()).format('YYYY-MM-DD HH:mm'),
  status: msg(ship.status),
});
}
export { SocketIO, sendMessage, sendNewShipMessage };
