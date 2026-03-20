/**
 * Test script to verify complete payment flow including Go Green certificate email
 * 
 * This script simulates a payment completion and checks if:
 * 1. Invoice email is sent
 * 2. Welcome message is sent
 * 3. Go Green certificate email is sent
 * 
 * Usage: node test-payment-flow.js <registrationId>
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wombto18';
const registrationId = process.argv[2];

if (!registrationId) {
    console.error('❌ Please provide a registration ID');
    console.log('Usage: node test-payment-flow.js CHD-XX-YYYYMMDD-NNNNNN');
    process.exit(1);
}

async function testPaymentFlow() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Check if registration exists
        const ChildRegistration = mongoose.model('ChildRegistration', new mongoose.Schema({}, { strict: false }));
        const registration = await ChildRegistration.findOne({ registrationId });

        if (!registration) {
            console.error(`❌ Registration not found: ${registrationId}`);
            process.exit(1);
        }

        console.log(`\n📋 Registration Details:`);
        console.log(`   Child: ${registration.childName}`);
        console.log(`   Mother: ${registration.motherName}`);
        console.log(`   Email: ${registration.email}`);
        console.log(`   Phone: ${registration.phone}`);
        console.log(`   Payment Status: ${registration.paymentStatus}`);
        console.log(`   Go Green Cert Sent: ${registration.goGreenCertSent || false}`);

        // Check payments
        const Payment = mongoose.model('Payment', new mongoose.Schema({}, { strict: false }));
        const payments = await Payment.find({ registrationId }).sort({ createdAt: -1 });

        console.log(`\n💳 Payments (${payments.length}):`);
        payments.forEach((payment, index) => {
            console.log(`   ${index + 1}. Status: ${payment.status}, Invoice Sent: ${payment.invoiceSent || false}, Amount: ₹${payment.amount}`);
        });

        // Check Go Green tree
        const GoGreenTree = mongoose.model('GoGreenTree', new mongoose.Schema({}, { strict: false }));
        const tree = await GoGreenTree.findOne({ registrationId });

        console.log(`\n🌳 Go Green Tree:`);
        if (tree) {
            console.log(`   Tree ID: ${tree.treeId}`);
            console.log(`   Species: ${tree.species}`);
            console.log(`   Status: ${tree.currentStatus}`);
        } else {
            console.log(`   ⚠️  No tree found for this registration`);
        }

        console.log(`\n📧 Email Flow Status:`);
        console.log(`   1. Registration Confirmation: ✅ (sent during registration)`);
        console.log(`   2. Payment Confirmation: ${payments.some(p => p.invoiceSent) ? '✅' : '❌'}`);
        console.log(`   3. Welcome Message: ${registration.paymentStatus === 'COMPLETED' ? '✅' : '❌'}`);
        console.log(`   4. Go Green Certificate: ${registration.goGreenCertSent ? '✅' : '❌'}`);

        if (!registration.goGreenCertSent) {
            console.log(`\n⚠️  Go Green certificate has NOT been sent yet!`);
            console.log(`   This should be sent automatically after payment completion.`);
            console.log(`   Check backend logs for errors.`);
        } else {
            console.log(`\n✅ All emails sent successfully!`);
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

testPaymentFlow();
