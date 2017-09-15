const { User } = require('./../db/models/user');
const { Booking } = require('./../db/models/booking');
const { Ticket } = require('./../db/models/ticket');
const { Player } = require('./../db/models/player');

const { GAMES } = require('./games');

const ACTIONS = {
    USER_LOGIN: {
        name: 'USER_LOGIN',
        desc: 'Người dùng đăng nhập'
    },
    BOOKING_CHECKIN: {
        name: 'BOOKING_CHECKIN',
        desc: 'Check-in cho người đã đặt vé trước',
        log: (_booking) => { _booking },
        getResponse: async (log) => {
            let booking = await Booking.findById(log._booking);
            return [
                `Mã đặt vé: ${booking.bookingCode}`,
                `Người đặt: ${booking.name}`,
                `Số lượng vé: ${booking.numberOfTickets}`
            ];
        }
    },
    ADD_NEW_PLAYER: {
        name: 'ADD_NEW_PLAYER',
        desc: 'Thêm người chơi mới',
        log: (_player, _ticket) => { _player, _ticket },
        getResponse: async (log) => {
            let player = await Player.findById(log._player);
            let ticket = await Ticket.findById(log._ticket);
            return [
                `Người chơi: ${player.name} (ID: ${player._id})`,
                `Mã vé: ${ticket.serialNumber} ${ ticket.blocked ? '(Hiện tại đã khóa)' : '' }`
            ];
        }
    },
    ADD_NEW_PLAYER_WITH_BOOKING: {
        name: 'ADD_NEW_PLAYER_WITH_BOOKING',
        desc: 'Thêm người chơi mới và liên kết người chơi với booking',
        log: (_player, _ticket, _booking) => { _player, _ticket, _booking },
        getResponse: async (log) => {
            let player = await Player.findById(log._player);
            let ticket = await Ticket.findById(log._ticket);
            let booking = await Booking.findById(log._booking);
            return [
                `Người chơi: ${player.name} (ID: ${player._id})`,
                `Mã vé: ${ticket.serialNumber} ${ ticket.blocked ? '(Hiện tại đã khóa)' : '' }`,
                `Mã đặt vé: ${booking.bookingCode}`,
                `Người đặt: ${booking.name}`
            ];
        }
    },
    ADD_GAME_CREDIT: {
        name: 'ADD_GAME_CREDIT',
        desc: 'Thêm lượt chơi mới cho người chơi',
        log: (_player, _ticket, credits) => { _player, _ticket, credits },
        getResponse: async (log) => {
            let player = await Player.findById(log._player);
            let ticket = await Ticket.findById(log._ticket);
            return [
                `Người chơi: ${player.name} (ID: ${player._id})`,
                `Mã vé: ${ticket.serialNumber} ${ ticket.blocked ? '(Hiện tại đã khóa)' : '' }`,
                `Lượt chơi đã nạp: ${log.credits}`
            ];
        }
    },
    ADD_FOOD_CREDIT: {
        name: 'ADD_FOOD_CREDIT',
        desc: 'Thêm 1 lượt thực phẩm cho người chơi',
        log: (_player, _ticket) => { _player, _ticket },
        getResponse: async (log) => {
            let player = await Player.findById(log._player);
            let ticket = await Ticket.findById(log._ticket);
            return [
                `Người chơi: ${player.name} (ID: ${player._id})`,
                `Mã vé: ${ticket.serialNumber} ${ ticket.blocked ? '(Hiện tại đã khóa)' : '' }`
            ];
        }
    },
    CHARGE_GAME_CREDIT: {
        name: 'CHARGE_GAME_CREDIT',
        desc: 'Lấy 1 lượt chơi từ người chơi',
        log: (_player, _ticket, game) => { _player, _ticket, game },
        getResponse: async (log) => {
            let player = await Player.findById(log._player);
            let ticket = await Ticket.findById(log._ticket);
            return [
                `Người chơi: ${player.name} (ID: ${player._id})`,
                `Mã vé: ${ticket.serialNumber} ${ ticket.blocked ? '(Hiện tại đã khóa)' : '' }`,
                `Trạm: ${GAMES[log.game]} (${log.game})`
            ];
        }
    },
    CHARGE_FOOD_CREDIT: {
        name: 'CHARGE_GAME_CREDIT',
        desc: 'Lấy 1 lượt thực phẩm từ người chơi',
        log: (_player, _ticket) => { _player, _ticket },
        getResponse: async (log) => {
            let player = await Player.findById(log._player);
            let ticket = await Ticket.findById(log._ticket);
            return [
                `Người chơi: ${player.name} (ID: ${player._id})`,
                `Mã vé: ${ticket.serialNumber} ${ ticket.blocked ? '(Hiện tại đã khóa)' : '' }`
            ];
        }
    },
    TRANSFER_CREDIT: {
        name: 'TRANSFER_CREDIT',
        desc: 'Chuyển đổi lượt chơi giữa 2 người chơi',
        log: (_player1, _ticket1, _player2, _ticket2, credits) => { _player1, _ticket1, _player2, _ticket2, credits },
        getResponse: async (log) => {
            let player1 = await Player.findById(log._player1);
            let ticket1 = await Ticket.findById(log._ticket1);
            let player2 = await Player.findById(log._player2);
            let ticket2 = await Ticket.findById(log._ticket2);
            return [
                `Người chuyển: ${player1.name} (ID: ${player1._id})`,
                `Mã vé người chuyển: ${ticket1.serialNumber} ${ ticket1.blocked ? '(Hiện tại đã khóa)' : '' }`
                `Người nhận: ${player2.name} (ID: ${player2._id})`,
                `Mã vé người nhận: ${ticket2.serialNumber} ${ ticket2.blocked ? '(Hiện tại đã khóa)' : '' }`,
                `Số lượt đã chuyển: ${log.credits}`
            ];
        }
    }
};

module.exports = { ACTIONS };