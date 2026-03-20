/**
 * Test Script: Send Vaccination Reminder Email
 * 
 * This script sends a test vaccination reminder email to verify email functionality
 * 
 * Usage: node test-send-vaccine-reminder.js
 */

const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendTestVaccinationReminder() {
    console.log('📧 ========================================');
    console.log('📧 SENDING TEST VACCINATION REMINDER EMAIL');
    console.log('📧 ========================================\n');

    // Email configuration from .env
    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465');
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

    console.log('📧 SMTP Configuration:');
    console.log(`   Host: ${SMTP_HOST}`);
    console.log(`   Port: ${SMTP_PORT}`);
    console.log(`   User: ${SMTP_USER}`);
    console.log(`   From: ${SMTP_FROM}\n`);

    // Create transporter
    const transporter = nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });

    // Test data
    const testData = {
        to: 'dev24prabhakar@gmail.com',
        parentName: 'Prabhakar',
        childName: 'Test Child',
        vaccineName: 'BCG',
        dueDate: '25 March 2026',
        prefix: 'Upcoming',
    };

    console.log('📧 Test Email Details:');
    console.log(`   To: ${testData.to}`);
    console.log(`   Parent: ${testData.parentName}`);
    console.log(`   Child: ${testData.childName}`);
    console.log(`   Vaccine: ${testData.vaccineName}`);
    console.log(`   Due Date: ${testData.dueDate}`);
    console.log(`   Status: ${testData.prefix}\n`);

    // Email HTML template
    const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💉 Vaccination Reminder</h1>
        </div>
        <div class="content">
          <h2>Hello ${testData.parentName},</h2>
          <div class="alert-box">
            <strong>${testData.prefix}:</strong> ${testData.childName}'s <strong>${testData.vaccineName}</strong> vaccination<br>
            <strong>Due Date:</strong> ${testData.dueDate}
          </div>
          <p>Please schedule an appointment with your pediatrician to ensure ${testData.childName} receives this important vaccination on time.</p>
          <p>You can mark this as completed in your WombTo18 dashboard once done.</p>
          <center>
            <a href="https://wombto18.com/dashboard" class="button">Access Dashboard</a>
          </center>
        </div>
        <div class="footer">
          <p>© 2026 WombTo18. All rights reserved.</p>
          <p>📧 support@wombto18.com | 🌐 www.wombto18.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

    // Email options
    const mailOptions = {
        from: SMTP_FROM,
        to: testData.to,
        subject: `WombTo18 - Vaccination ${testData.prefix}: ${testData.vaccineName}`,
        text: `${testData.prefix}: ${testData.childName}'s ${testData.vaccineName} vaccination is due on ${testData.dueDate}. Please visit your doctor.`,
        html: emailHTML,
    };

    try {
        console.log('📧 Sending email...\n');
        const info = await transporter.sendMail(mailOptions);

        console.log('✅ ========================================');
        console.log('✅ EMAIL SENT SUCCESSFULLY!');
        console.log('✅ ========================================');
        console.log(`✅ Message ID: ${info.messageId}`);
        console.log(`✅ Response: ${info.response}`);
        console.log(`✅ To: ${testData.to}`);
        console.log(`✅ Subject: ${mailOptions.subject}`);
        console.log('✅ ========================================\n');

        console.log('📬 Please check your email inbox at: dev24prabhakar@gmail.com');
        console.log('📬 Also check spam/junk folder if not in inbox\n');

    } catch (error) {
        console.error('❌ ========================================');
        console.error('❌ FAILED TO SEND EMAIL');
        console.error('❌ ========================================');
        console.error(`❌ Error: ${error.message}`);
        if (error.stack) {
            console.error(`❌ Stack: ${error.stack}`);
        }
        console.error('❌ ========================================\n');

        console.log('🔧 Troubleshooting:');
        console.log('   1. Check SMTP credentials in .env file');
        console.log('   2. Verify SMTP_HOST and SMTP_PORT are correct');
        console.log('   3. Ensure Gmail "App Password" is used (not regular password)');
        console.log('   4. Check if "Less secure app access" is enabled (if needed)');
        console.log('   5. Verify internet connection\n');
    }
}

// Run the test
sendTestVaccinationReminder();
