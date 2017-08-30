// Configure environments
const ENV = process.env.NODE_ENV || 'development';

if (ENV === 'development') {
    process.env.PORT = 7805;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/VKOYS-VTTT';
} else {
    process.env.PORT = 7805;
    process.env.MONGODB_URI = 'mongodb://localhost:27017/VKOYS-VTTT-Test';
}