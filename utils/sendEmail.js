import nodemailer from 'nodemailer';

const sendEmail = async(to, subject, text) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail', //or we can use another SMTP provider
        auth: {
            user: 'abnowellah@gmail.com',
            pass: 'cgdncccqvwevwhje',
        },

    });
    const mailOptions = {
        from: "abnowellah@gmail.com",
        to: user.email,
        subject: 'verify your Email',
        text,
    };
    try {
        console.log('Sending Email..');
        await transporter.sendMail(mailOptions);
        console.log('Email sent.');

    } catch (error) {
        console.error('Error sending email:', error);
    }
   
};

export default sendEmail;