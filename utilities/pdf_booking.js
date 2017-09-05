const PDFDocument = require('pdfkit');
const fs = require('fs');
const qr = require('qr-image');
const { removeVNMarks } = require('./../utilities/utils');

const createPDFBooking = (res, name, email, tel, numberOfTickets, bookingCode) => {
    const size = 'a4';

    console.log(`Đang xuất ra PDF theo khổ ${size.toUpperCase()}...`)

    // Setup document
    const doc = new PDFDocument({ size });
    // Setup output stream
    let nameWithoutMarks = removeVNMarks(name).split(' ').join('_').toUpperCase();
    //console.log(`Xuất ra tại: bookings/${bookingCode}-${nameWithoutMarks}.pdf`);
    res.setHeader('Content-disposition', 'inline; filename="' + bookingCode + '-' + nameWithoutMarks + '.pdf"');
    res.setHeader('Content-type', 'application/pdf');
    let stream = doc.pipe(res);

    // Font registration
    doc.registerFont('VKOYS', 'fonts/Asap/Asap-Regular.ttf');
    doc.registerFont('VTTT-title', 'fonts/Pacifico/Pacifico-Regular.ttf');
    doc.registerFont('document-bold', 'fonts/FiraSans/FiraSans-Bold.ttf');
    doc.registerFont('document-italic', 'fonts/FiraSans/FiraSans-italic.ttf');
    doc.registerFont('document', 'fonts/FiraSans/FiraSans-Regular.ttf');
    doc.registerFont('code', 'fonts/ShareTechMono/ShareTechMono-Regular.ttf');

    doc.image('images/vkoys_logo.jpg', 50, 150, {
        fit: [500, 500]
     });

    // Group name
    doc.font('VKOYS')
    .fontSize(15)
    .text('HỘI SINH VIÊN CÔNG GIÁO VIỆT NAM TẠI PHẦN LAN',{
        align: 'center'
    });

    // Event Title
    doc.font('VTTT-title')
    .fontSize(50)
    .text('Vầng trăng tuổi thơ',{
        align: 'center'
    });

    doc.fontSize(14).moveDown();

    // Doc Title
    doc.font('document-bold')
    .fontSize(18)
    .text('THƯ XÁC NHẬN ĐẶT VÉ CHƯƠNG TRÌNH',{
        align: 'center'
    });

    doc.moveDown();

    // Customer info
    doc
    .fontSize(12)
    .font('document-bold')
    .text('Họ tên: ', { continued: true })
    .font('document')
    .text(name.toUpperCase());

    if (email) {
        doc
        .font('document-bold')
        .text('Email: ', { continued: true })
        .font('document')
        .text(email);
    } else if (tel) {
        let formattedTel = [tel.slice(0, 3), " ", tel.slice(3,6), " ", tel.slice(6)].join('');
        doc
        .font('document-bold')
        .text('SĐT: ', { continued: true })
        .font('document')
        .text(formattedTel);
    } else {
        doc
        .font('document-italic')
        .text('Không có thông tin liên lạc');
    }
    
    doc
    .font('document-bold')
    .text('Số lượng vé: ', { continued: true })
    .font('document')
    .text(numberOfTickets);

    doc.moveDown();

    // Main content
    doc
    .font('document')
    .text('Ban Tổ Chức xin xác nhận đã đặt vé tham gia chương trình Đêm hội Trung Thu ', { continued: true })
    .font('document-bold')
    .text('Vầng Trăng Tuổi Thơ ', { continued: true })
    .font('document')
    .text('tại địa điểm và thời gian sau:')
    .moveDown()
    .font('document-bold')
    .text('GIÁO XỨ THÁNH MARIA', { align: 'center' })
    .font('document')
    .text('Mäntytie 2, 00270 Helsinki', { align: 'center' })
    .font('document-italic')
    .text('16.09.2017 · 18.00-21.00', { align: 'center' })
    .moveDown()
    .font('document')
    .text('Xin vui lòng xuất trình thư này tại quầy vé để được đổi lấy vé tham dự.')
    .moveDown()
    .text('Mọi thắc mắc xin liên hệ với Ban Tổ Chức (', { continued: true }) 
    .font('document-bold')
    .text('SĐT: 046 840 9470', { continued: true })
    .font('document')
    .text(') để biết thêm chi tiết.')
    .moveDown(2)

    let date = new Date();
    let month = date.getMonth() + 1;
    doc
    .text('Helsinki, ' + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()) + '.' + (month < 10 ? "0" + month : month) + '.' + date.getFullYear(), {
        align: 'right'
    })
    .text('BAN TỔ CHỨC', { 
        align: 'right'
    })
    .moveDown(2)

    // Booking code
    doc
    .font('document-bold')
    .fontSize(19)
    .text('MÃ XÁC NHẬN', 300, 620)

    let qrBookingCode;
    // QR Code
    if (bookingCode !== '00000000' && bookingCode.length === 8) {
        qrBookingCode = qr.imageSync('VKOYS_VTTT_BOOKING_' + bookingCode, { type: 'png' });        
    } else {
        qrBookingCode = qr.imageSync('THIS_IS_SAMPLE_CODE_' + bookingCode, { type: 'png' });
    }
    
    // Output QR Code
    doc.image(qrBookingCode, 100, 550)
    .rect(100, 550, 185, 185)
    .stroke();

    // Output booking code
    doc.font('code')
    .fontSize(40)
    .text(bookingCode, 297, 638);
    
    // Copyright notice footer
    doc
    .font('VKOYS')
    .fontSize(9)
    .text('© VKOYS ' + date.getFullYear(), 270, 755);

    //doc.image('images/vkoys_logo.png', 50, 10);

    // Finalize PDF file
    doc.end();
    console.log('Đã hoàn tất!')
}

module.exports = { createPDFBooking };