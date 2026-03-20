/**
 * Test script to send Go Green certificate email
 * Usage: node test-go-green-email.js <registrationId>
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function sendGoGreenCertificate() {
    try {
        const registrationId = process.argv[2] || 'CHD-ML-20260306-000001';

        console.log('🔌 Connecting to MongoDB...');
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wombto18';
        await mongoose.connect(mongoUri);
        console.log('✅ Connected to MongoDB\n');

        // Get registration details
        const ChildRegistration = mongoose.model(
            'ChildRegistration',
            new mongoose.Schema({}, { strict: false }),
            'child_registrations'
        );

        const registration = await ChildRegistration.findOne({ registrationId });
        if (!registration) {
            console.error(`❌ Registration not found: ${registrationId}`);
            process.exit(1);
        }

        console.log(`📋 Found registration:`);
        console.log(`   Child: ${registration.childName}`);
        console.log(`   Mother: ${registration.motherName}`);
        console.log(`   Email: ${registration.email}`);
        console.log(`   Phone: ${registration.phone}`);
        console.log('');

        // Get tree details
        const GoGreenTree = mongoose.model(
            'GoGreenTree',
            new mongoose.Schema({}, { strict: false }),
            'go_green_trees'
        );

        const tree = await GoGreenTree.findOne({ registrationId });
        const treeId = tree?.treeId || `TREE-${new Date().getFullYear()}-PENDING`;

        console.log(`🌳 Tree ID: ${treeId}\n`);

        // Send the email using fetch to the backend API
        const response = await fetch('http://localhost:8000/registration/test-send-certificate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                registrationId,
                email: registration.email,
                phone: registration.phone,
                parentName: registration.motherName,
                childName: registration.childName,
                state: registration.state,
                dateOfBirth: registration.dateOfBirth.toISOString().split('T')[0],
                treeId,
            }),
        });

        if (response.ok) {
            const result = await response.json();
            console.log('✅ Go Green certificate email sent successfully!');
            console.log(result);
        } else {
            const error = await response.json();
            console.error('❌ Failed to send certificate:', error);
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

sendGoGreenCertificate();
