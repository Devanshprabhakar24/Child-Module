/**
 * Test Script: Send Complete Vaccination Schedule Email with PDF
 * 
 * This script sends a complete vaccination schedule with all vaccines and dates
 * Includes a professional PDF attachment
 * 
 * Usage: node test-send-vaccine-schedule.js
 */

const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function generateVaccinationSchedulePDF(childData, vaccineSchedule) {
    console.log('📄 Generating PDF...\n');

    const pdfHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Arial', sans-serif; 
          padding: 40px;
          color: #1f2937;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #10b981;
        }
        .logo {
          font-size: 32px;
          font-weight: bold;
          color: #10b981;
          margin-bottom: 5px;
        }
        .subtitle {
          font-size: 14px;
          color: #6b7280;
        }
        .title {
          font-size: 24px;
          font-weight: bold;
          color: #1f2937;
          margin: 20px 0 10px 0;
        }
        .info-section {
          background: #f3f4f6;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #10b981;
        }
        .info-row {
          display: flex;
          margin: 8px 0;
          font-size: 14px;
        }
        .info-label {
          font-weight: bold;
          width: 150px;
          color: #374151;
        }
        .info-value {
          color: #1f2937;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        thead {
          background: #10b981;
          color: white;
        }
        th {
          padding: 12px 8px;
          text-align: left;
          font-weight: bold;
          font-size: 13px;
        }
        td {
          padding: 10px 8px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 12px;
        }
        tr:nth-child(even) {
          background: #f9fafb;
        }
        .status-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: bold;
          color: white;
          display: inline-block;
        }
        .status-done { background: #10b981; }
        .status-due { background: #f59e0b; }
        .status-upcoming { background: #3b82f6; }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          font-size: 11px;
          color: #6b7280;
        }
        .notes {
          background: #e0f2fe;
          border-left: 4px solid #3b82f6;
          padding: 15px;
          margin: 20px 0;
          border-radius: 4px;
        }
        .notes-title {
          font-weight: bold;
          margin-bottom: 10px;
          color: #1e40af;
        }
        .notes ul {
          margin-left: 20px;
          font-size: 12px;
          line-height: 1.6;
        }
        .notes li {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">WombTo18</div>
        <div class="subtitle">Your Child's Health Partner</div>
      </div>

      <div class="title">💉 Complete Vaccination Schedule</div>

      <div class="info-section">
        <div class="info-row">
          <span class="info-label">👶 Child Name:</span>
          <span class="info-value">${childData.childName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">🎂 Date of Birth:</span>
          <span class="info-value">${childData.dateOfBirth}</span>
        </div>
        <div class="info-row">
          <span class="info-label">🆔 Registration ID:</span>
          <span class="info-value">${childData.registrationId}</span>
        </div>
        <div class="info-row">
          <span class="info-label">👨‍👩‍👧 Parent Name:</span>
          <span class="info-value">${childData.parentName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">💉 Total Vaccines:</span>
          <span class="info-value">${vaccineSchedule.length}</span>
        </div>
        <div class="info-row">
          <span class="info-label">📅 Generated On:</span>
          <span class="info-value">${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th style="width: 5%;">#</th>
            <th style="width: 35%;">Vaccine Name</th>
            <th style="width: 20%; text-align: center;">Age Group</th>
            <th style="width: 20%; text-align: center;">Due Date</th>
            <th style="width: 20%; text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${vaccineSchedule.map((vaccine, index) => {
        let statusClass = '';
        let statusText = '';

        if (vaccine.status === 'completed') {
            statusClass = 'status-done';
            statusText = '✅ Done';
        } else if (vaccine.status === 'due') {
            statusClass = 'status-due';
            statusText = '⏰ Due';
        } else {
            statusClass = 'status-upcoming';
            statusText = '📅 Upcoming';
        }

        return `
              <tr>
                <td>${index + 1}</td>
                <td>${vaccine.name}</td>
                <td style="text-align: center;">${vaccine.ageGroup}</td>
                <td style="text-align: center;">${vaccine.dueDate}</td>
                <td style="text-align: center;">
                  <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
              </tr>
            `;
    }).join('')}
        </tbody>
      </table>

      <div class="notes">
        <div class="notes-title">📌 Important Notes:</div>
        <ul>
          <li>Please consult your pediatrician before any vaccination</li>
          <li>Maintain proper gap between doses as recommended</li>
          <li>Keep vaccination records updated in your dashboard</li>
          <li>You'll receive email reminders before each due date</li>
          <li>Bring this schedule during doctor visits for reference</li>
        </ul>
      </div>

      <div class="footer">
        <p><strong>WombTo18</strong> - Building a healthier and greener future for your child 🌿</p>
        <p style="margin-top: 5px;">📧 support@wombto18.com | 🌐 www.wombto18.com</p>
        <p style="margin-top: 5px;">© 2026 WombTo18. All rights reserved.</p>
      </div>
    </body>
    </html>
    `;

    // Generate PDF using Puppeteer
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(pdfHTML, { waitUntil: 'networkidle0' });

    const pdfPath = path.join(__dirname, 'vaccination-schedule.pdf');
    await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        margin: {
            top: '20px',
            right: '20px',
            bottom: '20px',
            left: '20px'
        }
    });

    await browser.close();

    console.log(`✅ PDF generated: ${pdfPath}\n`);
    return pdfPath;
}

async function sendVaccinationScheduleEmail() {
    console.log('📧 ========================================');
    console.log('📧 SENDING VACCINATION SCHEDULE EMAIL');
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
        dateOfBirth: '15 March 2024',
        registrationId: 'CHD-TEST-20260320-000001',
    };

    // Complete vaccination schedule
    const vaccineSchedule = [
        { name: 'BCG', ageGroup: 'At Birth', dueDate: '15 March 2024', status: 'completed' },
        { name: 'Hepatitis B - Birth Dose', ageGroup: 'At Birth', dueDate: '15 March 2024', status: 'completed' },
        { name: 'OPV-0', ageGroup: 'At Birth', dueDate: '15 March 2024', status: 'completed' },
        { name: 'Hepatitis B-1', ageGroup: '6 Weeks', dueDate: '26 April 2024', status: 'completed' },
        { name: 'DTaP-1', ageGroup: '6 Weeks', dueDate: '26 April 2024', status: 'completed' },
        { name: 'IPV-1', ageGroup: '6 Weeks', dueDate: '26 April 2024', status: 'completed' },
        { name: 'Hib-1', ageGroup: '6 Weeks', dueDate: '26 April 2024', status: 'completed' },
        { name: 'PCV-1', ageGroup: '6 Weeks', dueDate: '26 April 2024', status: 'completed' },
        { name: 'Rotavirus-1', ageGroup: '6 Weeks', dueDate: '26 April 2024', status: 'completed' },
        { name: 'DTaP-2', ageGroup: '10 Weeks', dueDate: '24 May 2024', status: 'completed' },
        { name: 'IPV-2', ageGroup: '10 Weeks', dueDate: '24 May 2024', status: 'completed' },
        { name: 'Hib-2', ageGroup: '10 Weeks', dueDate: '24 May 2024', status: 'completed' },
        { name: 'PCV-2', ageGroup: '10 Weeks', dueDate: '24 May 2024', status: 'completed' },
        { name: 'Rotavirus-2', ageGroup: '10 Weeks', dueDate: '24 May 2024', status: 'completed' },
        { name: 'DTaP-3', ageGroup: '14 Weeks', dueDate: '21 June 2024', status: 'due' },
        { name: 'IPV-3', ageGroup: '14 Weeks', dueDate: '21 June 2024', status: 'due' },
        { name: 'Hib-3', ageGroup: '14 Weeks', dueDate: '21 June 2024', status: 'due' },
        { name: 'PCV-3', ageGroup: '14 Weeks', dueDate: '21 June 2024', status: 'due' },
        { name: 'Rotavirus-3', ageGroup: '14 Weeks', dueDate: '21 June 2024', status: 'due' },
        { name: 'Hepatitis B-2', ageGroup: '6 Months', dueDate: '15 September 2024', status: 'upcoming' },
        { name: 'OPV-1', ageGroup: '6 Months', dueDate: '15 September 2024', status: 'upcoming' },
        { name: 'Influenza-1', ageGroup: '6 Months', dueDate: '15 September 2024', status: 'upcoming' },
        { name: 'Typhoid Conjugate', ageGroup: '9 Months', dueDate: '15 December 2024', status: 'upcoming' },
        { name: 'MMR-1', ageGroup: '9 Months', dueDate: '15 December 2024', status: 'upcoming' },
        { name: 'Hepatitis A-1', ageGroup: '12 Months', dueDate: '15 March 2025', status: 'upcoming' },
        { name: 'Varicella-1', ageGroup: '15 Months', dueDate: '15 June 2025', status: 'upcoming' },
        { name: 'PCV Booster', ageGroup: '15 Months', dueDate: '15 June 2025', status: 'upcoming' },
        { name: 'MMR-2', ageGroup: '15 Months', dueDate: '15 June 2025', status: 'upcoming' },
    ];

    console.log('📧 Test Email Details:');
    console.log(`   To: ${testData.to}`);
    console.log(`   Parent: ${testData.parentName}`);
    console.log(`   Child: ${testData.childName}`);
    console.log(`   DOB: ${testData.dateOfBirth}`);
    console.log(`   Total Vaccines: ${vaccineSchedule.length}\n`);

    // Generate PDF
    const pdfPath = await generateVaccinationSchedulePDF(testData, vaccineSchedule);

    // Generate vaccine table HTML with Done/Due/Upcoming status
    const vaccineTableRows = vaccineSchedule.map(vaccine => {
        let statusBadge = '';
        let statusColor = '';

        if (vaccine.status === 'completed') {
            statusBadge = '✅ Done';
            statusColor = '#10b981';
        } else if (vaccine.status === 'due') {
            statusBadge = '⏰ Due';
            statusColor = '#f59e0b';
        } else {
            statusBadge = '📅 Upcoming';
            statusColor = '#3b82f6';
        }

        return `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 12px 8px; text-align: left;">${vaccine.name}</td>
        <td style="padding: 12px 8px; text-align: center;">${vaccine.ageGroup}</td>
        <td style="padding: 12px 8px; text-align: center;">${vaccine.dueDate}</td>
        <td style="padding: 12px 8px; text-align: center;">
          <span style="background: ${statusColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold;">
            ${statusBadge}
          </span>
        </td>
      </tr>
    `;
    }).join('');

    // Email HTML template
    const emailHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .table-container { background: white; border-radius: 8px; overflow: hidden; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        table { width: 100%; border-collapse: collapse; }
        th { background: #10b981; color: white; padding: 12px 8px; text-align: left; font-weight: bold; }
        td { padding: 12px 8px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; padding: 20px; }
        .legend { display: flex; justify-content: center; gap: 20px; margin: 20px 0; flex-wrap: wrap; }
        .legend-item { display: flex; align-items: center; gap: 8px; }
        @media only screen and (max-width: 600px) {
          .container { padding: 10px; }
          .content { padding: 15px; }
          table { font-size: 12px; }
          th, td { padding: 8px 4px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💉 Complete Vaccination Schedule</h1>
          <p style="margin: 5px 0 0 0; font-size: 16px;">WombTo18 Health Platform</p>
        </div>
        <div class="content">
          <h2>Hello ${testData.parentName},</h2>
          <p>Here is the complete vaccination schedule for <strong>${testData.childName}</strong>.</p>
          
          <div class="info-box">
            <strong>👶 Child Name:</strong> ${testData.childName}<br>
            <strong>🎂 Date of Birth:</strong> ${testData.dateOfBirth}<br>
            <strong>🆔 Registration ID:</strong> ${testData.registrationId}<br>
            <strong>💉 Total Vaccines:</strong> ${vaccineSchedule.length}
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Vaccine Name</th>
                  <th style="text-align: center;">Age Group</th>
                  <th style="text-align: center;">Due Date</th>
                  <th style="text-align: center;">Status</th>
                </tr>
              </thead>
              <tbody>
                ${vaccineTableRows}
              </tbody>
            </table>
          </div>

          <div style="background: #e0f2fe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <strong>📌 Important Notes:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Please consult your pediatrician before any vaccination</li>
              <li>Maintain proper gap between doses as recommended</li>
              <li>Keep vaccination records updated in your dashboard</li>
              <li>You'll receive email reminders before each due date</li>
            </ul>
          </div>

          <center>
            <a href="https://wombto18.com/dashboard" class="button">Access Your Dashboard</a>
          </center>

          <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
            You can track and update vaccination status anytime in your WombTo18 dashboard. 
            We'll send you timely reminders for upcoming vaccinations.
          </p>
        </div>
        <div class="footer">
          <p><strong>WombTo18</strong> - Your Child's Health Partner</p>
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
        subject: `📅 ${testData.childName}'s Complete Vaccination Schedule - WombTo18`,
        text: `Complete Vaccination Schedule for ${testData.childName}. Total ${vaccineSchedule.length} vaccines. Please check your email for the detailed schedule.`,
        html: emailHTML,
        attachments: [
            {
                filename: `${testData.childName.replace(/\s+/g, '_')}_Vaccination_Schedule.pdf`,
                path: pdfPath,
                contentType: 'application/pdf'
            }
        ]
    };

    try {
        console.log('📧 Sending email with PDF attachment...\n');
        const info = await transporter.sendMail(mailOptions);

        console.log('✅ ========================================');
        console.log('✅ EMAIL SENT SUCCESSFULLY!');
        console.log('✅ ========================================');
        console.log(`✅ Message ID: ${info.messageId}`);
        console.log(`✅ Response: ${info.response}`);
        console.log(`✅ To: ${testData.to}`);
        console.log(`✅ Subject: ${mailOptions.subject}`);
        console.log(`✅ Total Vaccines in Schedule: ${vaccineSchedule.length}`);
        console.log(`✅ PDF Attached: ${mailOptions.attachments[0].filename}`);
        console.log('✅ ========================================\n');

        console.log('📬 Please check your email inbox at: dev24prabhakar@gmail.com');
        console.log('📬 The email contains a complete vaccination schedule table');
        console.log('📬 PDF attachment included for download and printing');
        console.log('📬 Also check spam/junk folder if not in inbox\n');

        // Clean up PDF file
        if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
            console.log('🗑️  Temporary PDF file cleaned up\n');
        }

    } catch (error) {
        console.error('❌ ========================================');
        console.error('❌ FAILED TO SEND EMAIL');
        console.error('❌ ========================================');
        console.error(`❌ Error: ${error.message}`);
        if (error.stack) {
            console.error(`❌ Stack: ${error.stack}`);
        }
        console.error('❌ ========================================\n');

        // Clean up PDF file even on error
        if (fs.existsSync(pdfPath)) {
            fs.unlinkSync(pdfPath);
        }
    }
}

// Run the test
sendVaccinationScheduleEmail();
