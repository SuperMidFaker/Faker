import { messages } from '../models/messages.db';

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
	/*
		from:
			from.tenant_id,
			from.login_id,
			from.name,
		to:
			to.tenant_id,
			to.login_ids:[]
		msg:
			msg.content: '',
			msg.logo: '',
			msg.url: ''
		
	*/
}
function sendMessage(from, to, msg) {
	if (!from) {
		throw new Error('params [from] was lost!');
	}
	if (!to) {
		throw new Error('params [to] was lost!');
	}
	if (!to.login_ids) {
		throw new Error('params [to] was incorrect! need [to.login_ids]');
	}
	if(!msg) {
		throw new Error('params [msg] was lost!');
	}
	let data = {
		tenant_id: to.tenant_id,
		from_tenant_id: from.tenant_id,
		from_login_id: from.login_id,
		from_name: from.name,
    content: msg.content,
    logo: msg.logo,
    url: msg.url,
	}
	SocketIO.Instance().of('/').to(String(to.tenant_id)).emit('message',data);
	for (let i = 0; i < to.login_ids.length; i++) {
		recordMessage({...data, login_id: to.login_ids[i], status: 0, time: new Date()});
	}
}
function recordMessage(data) {
	messages.create(data)
}
export { SocketIO, sendMessage};