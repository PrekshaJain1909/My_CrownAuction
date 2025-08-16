const redis = require('redis');
require('dotenv').config();

const client = redis.createClient( {
    url: process.env.REDIS_URL
});

client.on('error', (err) => {
    console.err('Redis Client Error:', err);
});

client.on('connect', () => {
    console.log('COnnected to Redis');
});

const connectRedis = async () => {
    try {
        await client.connect();
    }
    catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
};

module.exports = {client, connectRedis};