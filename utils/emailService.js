const sgMail = require('@sendgrid/mail');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, subject, html, attachments = []) => {
    try {
        const msg = {
            to,
            from: process.env.FROM_EMAIL,
            subject,
            html,
            attachments
        };

        await sgMail.send(msg);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

const generateInvoice = async (auction, winner, seller) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        const filename = `invoice-${auction.id}.pdf`;
        const filepath = path.join(__dirname, '../temp', filename);

        // Ensure temp directory exists
        const tempDir = path.dirname(filepath);
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        doc.pipe(fs.createWriteStream(filepath));

        // Invoice Header
        doc.fontSize(20).text('AUCTION INVOICE', 50, 50);
        doc.fontSize(12).text(`Invoice Date: ${new Date().toLocaleDateString()}`, 50, 80);
        doc.text(`Auction ID: ${auction.id}`, 50, 100);

        // Seller Information
        doc.fontSize(14).text('Seller Information:', 50, 140);
        doc.fontSize(12).text(`Name: ${seller.username}`, 50, 160);
        doc.text(`Email: ${seller.email}`, 50, 180);

        // Buyer Information
        doc.fontSize(14).text('Buyer Information:', 50, 220);
        doc.fontSize(12).text(`Name: ${winner.username}`, 50, 240);
        doc.text(`Email: ${winner.email}`, 50, 260);

        // Item Information
        doc.fontSize(14).text('Item Details:', 50, 300);
        doc.fontSize(12).text(`Item: ${auction.itemName}`, 50, 320);
        doc.text(`Description: ${auction.description}`, 50, 340);
        doc.text(`Starting Price: $${auction.startingPrice}`, 50, 360);
        doc.text(`Final Price: $${auction.finalPrice}`, 50, 380);

        // Payment Information
        doc.fontSize(14).text('Payment Summary:', 50, 420);
        doc.fontSize(12).text(`Amount Due: $${auction.finalPrice}`, 50, 440);
        doc.text('Payment Status: Pending', 50, 460);

        // Footer
        doc.fontSize(10).text('Thank you for using our auction platform!', 50, 520);
        doc.text('This is an automatically generated invoice.', 50, 540);

        doc.end();

        doc.on('end', () => {
            resolve(filepath);
        });

        doc.on('error', (error) => {
            reject(error);
        });
    });
};

const sendAuctionEndNotification = async (auction, winner, seller) => {
    try {
        // Generate invoice
        const invoicePath = await generateInvoice(auction, winner, seller);
        const invoiceContent = fs.readFileSync(invoicePath);

        const attachment = {
            content: invoiceContent.toString('base64'),
            filename: `invoice-${auction.id}.pdf`,
            type: 'application/pdf',
            disposition: 'attachment'
        };

        // Send email to winner
        const winnerHtml = `
            <h2>Congratulations! You won the auction!</h2>
            <p>Dear ${winner.username},</p>
            <p>You have successfully won the auction for <strong>${auction.itemName}</strong>.</p>
            <p><strong>Final Price:</strong> $${auction.finalPrice}</p>
            <p>Please find the invoice attached.</p>
            <p>The seller will contact you soon for payment and delivery details.</p>
            <p>Thank you for using our auction platform!</p>
        `;

        await sendEmail(winner.email, 'Auction Won = Invoice Attached', winnerHtml, [attachment]);

        // Send email to seller
        const sellerHtml = `
            <h2>Your auction has ended successfully!</h2>
            <p>Dear ${seller.username},</p>
            <p>Your auction for <strong>${auction.itemName}</strong> has ended.</p>
            <p><strong>Winner:</strong> ${winner.username}</p>
            <p><strong>Final Price:</strong> $${auction.finalPrice}</p>
            <p>Please find the invoice attached.</p>
            <p>Contact the winner for payment and delivery arrangements.</p>
            <p>Thank you for using our auction platform!</p>
        `;

        await sendEmail(seller.email, 'Auction Ended = Invoice Attached', sellerHtml, [attachment]);

        // Clean up temporary file
        fs.unlinkSync(invoicePath);

    } catch (error) {
        console.error('Error sending auction end notification:', error);
        throw error;
    }
};

const sendBidNotification = async (auction, bidder, seller, bidAmount) => {
    try {
        // Notify seller
        const sellerHtml = `
            <h2>New Bid on Your Auction!</h2>
            <p>Dear ${seller.username},</p>
            <p>A new bid has been placed on your auction for <strong>${auction.itemName}</strong>.</p>
            <p><strong>New Bid Amount:</strong> $${bidAmount}</p>
            <p><strong>Bidder:</strong> ${bidder.username}</p>
            <p>View your auction to see all current bids.</p>
        `;

        await sendEmail(seller.email, 'New Bid on Your Auction', sellerHtml);

    } catch (error) {
        console.error('Error sending bid notification:', error);
        throw error;
    }
};

const sendCounterOfferNotification = async (auction, winner, seller, counterAmount) => {
    try {
        const html = `
            <h2>Counter Offer Received</h2>
            <p>Dear ${winner.username},</p>
            <p>The seller has made a counter offer for the auction: <strong>${auction.itemName}</strong></p>
            <p><strong>Your Winning Bid:</strong> $${auction.finalPrice}</p>
            <p><strong>Counter Offer Amount:</strong> $${counterAmount}</p>
            <p>Please log in to your account to accept or reject this counter offer.</p>
            <p>Thank you for using our auction platform!</p>
        `;

        await sendEmail(winner.email, 'Counter Offer Received', html);

    } catch (error) {
        console.error('Error sending counter offer notification:', error);
        throw error;
    }
};

module.exports = {
    sendEmail,
    generateInvoice,
    sendAuctionEndNotification,
    sendBidNotification,
    sendCounterOfferNotification
};
