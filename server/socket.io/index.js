import { messages } from '../models/messages.db';
import { TenantUser } from '../models/tenant-user.db';

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
/*
		from:
			from.tenant_id,
			from.login_id,
			from.name,
		to:
			to.tenant_id,
		msg:
			msg.content: '',
			msg.logo: '',
			msg.url: ''
		
	*/
function * sendMessage(from, to, msg) {
	if (!from) {
		throw new Error('params [from] was lost!');
	}
	if (!to) {
		throw new Error('params [to] was lost!');
	}
	if(!msg) {
		throw new Error('params [msg] was lost!');
	}
	let data = {
		tenant_id: to.tenant_id,
		from_tenant_id: from.tenant_id,
		from_login_id: from.login_id,
		from_name: from.name,
		title: msg.title,
    content: msg.content,
    logo: msg.logo,
    url: msg.url,
	}
	SocketIO.Instance().of('/').to(String(to.tenant_id)).emit('message',data);
	const result = yield TenantUser.findAll({
    raw: true,
    where:{
      $and: [
	      {
	      	$or: [
	      		{
	      			parent_tenant_id: to.tenant_id,
	      		},
	      		{
	      			parent_tenant_id: 0,
	      		}
	      	]
	      },
	      {
	      	$or: [
	      		{
	      			user_type: 'manager',
	      		},
	      		{
	      			user_type: 'owner',
	      		}
	      	]
	      }
      ]
    }
  });
  const promises = [];
	for (let i = 0; i < result.length; i++) {
		const rec = {...data, login_id: result[i].login_id, status: 0, time: new Date()};
		promises.push(messages.create(rec));
		
	}
	return yield promises;
}
export { SocketIO, sendMessage};