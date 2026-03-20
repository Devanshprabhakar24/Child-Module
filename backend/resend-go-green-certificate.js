/**
 * Script to resend Go Green certificate for existing registrations
 * Usage: node resend-go-green-certificate.js <registrationId>
 */

require('dotenv').config();
const axios = require('axios');

async function resendCertificate() {
    try {
        const registrationId = process.argv[2];

        if (!registrationId) {
            console.error('❌ Please provide a registration ID');
            console.log('Usage: node resend-go-green-certificate.js <registrationId>');
            process.exit(1);
        }

        console.log(`🔄 Resending Go Green certificate for ${registrationId}...`);

        // Get registration details from API
        const regResponse = await axios.get(`http://localhost:8000/registration/${registrationId}`);

        if (!regResponse.data.success) {
            console.error(`❌ Registration not found: ${registrationId}`);
            process.exit(1);
        }

        const registration = regResponse.data.data;
        console.log(`📋 Found registration:`);
        console.log(`   Child: ${registration.childName}`);
        console.log(`   Mother: ${registration.motherName}`);
        console.log(`   Email: ${registration.email}`);
        console.log(`   Phone: ${registration.phone}`);
        console.log('');

        // Get tree details
        let treeId = `TREE-${new Date().getFullYear()}-PENDING`;
        try {
            const treeResponse = await axios.get(`http://localhost:8000/go-green/tree/${registrationId}`);
            if (treeResponse.data.success && treeResponse.data.data) {
                treeId = treeResponse.data.data.treeId;
            }
        } catch (error) {
            console.log('⚠️  No tree found, using pending tree ID');
        }

        console.log(`🌳 Tree ID: ${treeId}\n`);

        // Send the certificate
        const response = await axios.post('http://localhost:8000/registration/test-send-certificate', {
            registrationId: registration.registrationId,
            email: registration.email,
            phone: registration.phone,
            parentName: registration.motherName,
            childName: registration.childName,
            state: registration.state,
            dateOfBirth: new Date(registration.dateOfBirth).toISOString().split('T')[0],
            treeId,
        });

        if (response.data.success) {
            console.log('✅ Go Green certificate sent successfully!');
            console.log(`   Email: ${registration.email}`);
            console.log(`   Registration: ${registrationId}`);
        } else {
            console.error('❌ Failed to send certificate:', response.data.message);
        }

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        process.exit(1);
    }
}

resendCertificate();
