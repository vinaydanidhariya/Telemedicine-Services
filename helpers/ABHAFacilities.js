const axios = require("axios");

const getCredentials = async () => {
	return new Promise(async (resolve, reject) => {
		try {
			const url = "https://dev.abdm.gov.in/gateway/v0.5/sessions";
			const data = {
				clientId: "SBX_004126",
				clientSecret: "4edfab4d-1077-4d72-a213-d2d58e9ecb77",
			};

			const response = await axios.post(url, data, {
				headers: {
					"Content-Type": "application/json",
				},
			});
			resolve({ type: "success", data: response.data });
		} catch (error) {
			console.log(error);
			resolve({ type: "error", message: error.message });
		}
	});
};

const updateURL = async () => {
	try {
		const credentials = await getCredentials();
		const myURL = "https://grown-labrador-severely.ngrok-free.app";
		const url = "https://dev.abdm.gov.in/devservice/v1/bridges";
		const data = {
			url: myURL,
		};

		const response = await axios.patch(url, data, {
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${credentials.accessToken}`,
			},
		});
		console.log("URL Updated");
		console.log(response.data.data);
	} catch (error) {
		console.log("Error in updating URL");
		console.log(error);
	}
};

module.exports = {
	getCredentials,
	updateURL,
};
