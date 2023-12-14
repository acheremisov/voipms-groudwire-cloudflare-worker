/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

// export default {
// 	async fetch(request, env, ctx) {
// 		return new Response(handleRequest(request));
// 	},
// };

addEventListener('fetch', (event) => {
	event.respondWith(handleRequest(event.request));
});

async function getMyIpAddress() {
	try {
		const response = await fetch('http://ifconfig.me');
		ipAddress = await response.text();
		return ipAddress.trim(); // Trim any whitespace from the response
	} catch (error) {
		console.error('Error fetching IP address:', error);
		return null;
	}
}

async function getBalance(API_USERNAME, API_PASSWORD) {
	const METHOD = 'getBalance';
	// converting to URI component to handle special characters
	API_USERNAME = encodeURIComponent(API_USERNAME);

	const voipMsApiURL = `https://voip.ms/api/v1/rest.php?content_type=json&api_username=${API_USERNAME}&api_password=${API_PASSWORD}&method=${METHOD}`;

	const response = await fetch(voipMsApiURL);
	const data = await response.json();
	if (data.status === 'success') {
		const balance = parseFloat(data.balance.current_balance).toFixed(2);
		return balance;
	} else {
		if (data.status === 'ip_not_enabled') {
			const ip = await getMyIpAddress();
			throw new Error(`IP is not permitted from VOIP.MS side. [Source IP: ${ip}]`);
		} else {
			throw new Error(`${data.message} (${data.status})`);
		}
	}
}

async function handleRequest(request) {
	//Check my IP adress

	const userAgent = request.headers.get('user-agent');

	if (userAgent && userAgent.includes('Groundwire/')) {
		// if (userAgent && userAgent.includes('')) {
		try {
			const balance = await getBalance(VOIP_USERNAME, VOIP_PASSWORD);
			const objBalance = {
				balanceString: `${CURRENCY} ${balance}`,
				balance,
				CURRENCY,
			};

			return new Response(JSON.stringify(objBalance), {
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (error) {
			return new Response(`Error fetching balance. ${error}`, { status: 500 });
		}
	} else {
		console.log('userAgent', userAgent);
		return new Response('Not Found', { status: 404 });
	}
}
