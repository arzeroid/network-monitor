import * as ping from 'ping';
import devices from './devices';
import env from './env';
import axios, { AxiosInstance } from 'axios';

const axiosInstance: AxiosInstance = axios.create({
	headers: {
		'Connection': 'keep-alive',
		'Accept-Encoding': 'gzip, deflate, br'
	}
});

function main() {
	const promises: Array<Promise<string>> = [];
	Object.keys(devices).forEach(function (name) {
		const promise: Promise<string> = ping.promise.probe(devices[name]).then((response: ping.PingResponse) => {
			if(!response.alive){
				return `${name} is down`;
			}
		}).catch((reason) => {
			return JSON.stringify(reason);
		});

		promises.push(promise);
	});

	Promise.all(promises).then((data: Array<string>) => {
		data = data.filter(item => item !== undefined);
		console.log(data);
		axiosInstance.post(env.ALIVE_URL, {
			userId: env.LINE_USER_ID,
			data: data
		})
		.then(response => console.log(response.data))
		.catch(error => {
			if(error.isAxiosError) {
				console.log(error.response.data);
			}
			else {
				console.log(error);
			}
		});
	})

	setTimeout(main, parseInt(env.WAIT_TIMEOUT_MIN) * 60000);
}

main()