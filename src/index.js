// main function
addEventListener('fetch', (event) => {
	event.respondWith(handleRequest(event.request));
});

// getting IP address for testing.
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
	// Checking user-agent
	const userAgent = request.headers.get('user-agent');
	// If Groundwire permitting access to balance (basic security)
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
