require('./env_config');

module.exports = {
    /* App info */
    APP_NAME: 'VKOYS-VTTT-api',
    /* Server configuration */
    PORT: process.env.PORT,
    MONGODB_URI: process.env.MONGODB_URI
}