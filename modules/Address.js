const axios = require('axios');

// Fetch latitude and longitude for an address from google maps API
const getLatLong = async (address) => {
    const apiKey = ''; // Replace with your own Google Maps API key
    const addressString = `${address.address_line_one}, ${address.city}, ${address.state} ${address.zip_code}`;

    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: {
                address: addressString,
                key: apiKey
            }
        });
        const result = response.data.results[0];

        if (result) {
            const { lat, lng } = result.geometry.location;
            return { latitude: lat, longitude: lng };
        } else {
            throw new Error(`No geolocation result for address: ${addressString}`);
        }
    } catch (error) {
        // console.error(`Error getting geolocation for address: ${addressString}`);
        throw error;
    }
};

const getCachedAddress = async (address) => {
	try {
		const { db } = LOCATEMEAPP;
		const collection = db.collection('address');
		const result = await collection.findOne(address, {_id: false});
		return result
	} catch (error) {
		// console.error('Error checking address:', error);
		throw error;
	}
}

// Validate the address
function validateAddress(address) {
	const requiredAttributes = ['address_line_one', 'city', 'state', 'zip_code'];
	const missingAttributes = requiredAttributes.filter(attr => !(attr in address) || !address[attr]);
	return missingAttributes;
}

function combineAddresses(addresses) {
	const { cached, enriched } = addresses;
	const removeIdField = address => {
        const { _id, ...rest } = address;
        return rest;
    }
    return [
		...enriched.filter(e => e !== null).map(removeIdField), 
		...cached.filter(c => c !== null).map(removeIdField)
	];
}

const generateErrorMessage = missingAttributes => {
	return `Address is missing required attributes: ${missingAttributes.join(', ')}`;
};

const enrichAddresses = async (req, res, next) => {
	const { body: inputAddress } = req;

	if (!inputAddress || !inputAddress.length) {
		return next(new Error('No input address found'));
	}

	try {
		const cachedAddresses = [];
		const nonCachedAddresses = [];

		for (let address of inputAddress) {
			const missingAttributes = validateAddress(address);

			if (missingAttributes.length > 0) {
				throw new Error(generateErrorMessage(missingAttributes));
			}

			const cachedAddress = await getCachedAddress(address);

			if (cachedAddress) {
				const { latitude, longitude } = cachedAddress;
				cachedAddresses.push({ ...address, latitude, longitude });
			} else {
				nonCachedAddresses.push(address);
			}
		}

		let enrichedAddresses = [];

		if (nonCachedAddresses.length > 0) {
			enrichedAddresses = await Promise.all(
				nonCachedAddresses.map(async (address) => {
					const { latitude, longitude } = await getLatLong(address);
					return { ...address, latitude, longitude };
				})
			);
		}

		console.log(cachedAddresses.length, 'addresses cached');
		console.log(enrichedAddresses.length, 'addresses enriched');

		req.model.data = {
			cached: cachedAddresses,
			enriched: enrichedAddresses
		};

		next();

	} catch (error) {
		// console.log('Error enriching addresses:', error.stack);
		next(error);
	}
};

const cacheAddresses = async (req, res, next) => {
	const { model: { data: addresses } } = req;
	const { enriched } = addresses;
	if (!enriched || !enriched.length) {
		req.model.data = combineAddresses(addresses);
		return next();
	}
	try {
		const { db } = LOCATEMEAPP;
		const collection = db.collection('address');
		const result = await collection.insertMany([...enriched]);
		req.model.data = combineAddresses(addresses);
		console.log('Addresses stored', JSON.stringify(result));
		return next();
	} catch (error) {
		// console.error('Error storing addresses:');
		// console.error(error);
		return next(error);
	}
}

module.exports = {
	enrichAddresses,
	cacheAddresses,
	getLatLong,
	getCachedAddress,
	validateAddress,
	combineAddresses,
	generateErrorMessage
};