/**
 * Complete setup script - Seeds templates AND activates services for all users
 * Run this once to set up everything
 */

require('dotenv').config();

const API_BASE = process.env.APP_BASE_URL || 'http://localhost:8000';

async function setupEverything() {
    console.log('🚀 WombTo18 - Complete Setup');
    console.log('='.repeat(70));
    console.log('This will:');
    console.log('1. Seed milestone templates (if not already done)');
    console.log('2. Activate services for all existing users');
    console.log('='.repeat(70));
    console.log('');

    try {
        // Step 1: Check if backend is running
        console.log('📡 Step 1: Checking backend server...');
        try {
            const healthCheck = await fetch(`${API_BASE}/registration/test-mode`);
            if (!healthCheck.ok) {
                throw new Error('Backend not responding');
            }
            console.log('✅ Backend server is running\n');
        } catch (error) {
            console.error('❌ Backend server is not running!');
            console.error('');
            console.error('Please start the backend server first:');
            console.error('  cd backend');
            console.error('  npm run start:dev');
            console.error('');
            console.error('Then run this script again.');
            process.exit(1);
        }

        // Step 2: Seed milestone templates
        console.log('📚 Step 2: Seeding milestone templates...');
        console.log('This ensures development milestones can be created for all age groups.');
        console.log('');

        try {
            // Import and run the seeding logic
            const { exec } = require('child_process');
            const { promisify } = require('util');
            const execAsync = promisify(exec);

            const { stdout, stderr } = await execAsync('node seed-milestone-templates.js', {
                cwd: __dirname,
            });

            console.log(stdout);
            if (stderr && !stderr.includes('DeprecationWarning')) {
                console.error(stderr);
            }

            console.log('✅ Milestone templates seeded successfully\n');
        } catch (error) {
            console.warn('⚠️  Milestone template seeding had issues (may already be seeded)');
            console.warn(`   ${error.message}\n`);
            console.log('Continuing with service activation...\n');
        }

        // Step 3: Activate services for all users
        console.log('🔧 Step 3: Activating services for all users...');
        console.log('This will set up vaccination milestones, development milestones,');
        console.log('reminders, and tree planting for all completed registrations.');
        console.log('');

        const response = await fetch(`${API_BASE}/registration/activate-all-incomplete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const result = await response.json();

        console.log('='.repeat(70));
        console.log('📊 ACTIVATION RESULT');
        console.log('='.repeat(70));
        console.log(`Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
        console.log(`Message: ${result.message}`);
        console.log('='.repeat(70));

        if (result.activatedRegistrations && result.activatedRegistrations.length > 0) {
            console.log('');
            console.log('✅ Services activated for:');
            result.activatedRegistrations.forEach((regId, index) => {
                console.log(`   ${index + 1}. ${regId}`);
            });
        } else {
            console.log('');
            console.log('ℹ️  No registrations needed activation (all already have services)');
        }

        if (result.errors && result.errors.length > 0) {
            console.log('');
            console.log('⚠️  Errors encountered:');
            result.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }

        console.log('');
        console.log('='.repeat(70));
        console.log('🎉 SETUP COMPLETE!');
        console.log('='.repeat(70));
        console.log('');
        console.log('Next steps:');
        console.log('1. Open dashboard: http://localhost:3000/dashboard/milestones');
        console.log('2. Login with your credentials');
        console.log('3. Verify milestones are loaded for all age groups');
        console.log('4. Check that no "No templates found" errors appear');
        console.log('');
        console.log('For new registrations, services will activate automatically!');
        console.log('');

    } catch (error) {
        console.error('');
        console.error('❌ Setup failed:');
        console.error(error.message);
        console.error('');
        console.error('Troubleshooting:');
        console.error('1. Make sure backend is running: npm run start:dev');
        console.error('2. Check MongoDB connection in .env file');
        console.error('3. See backend/AUTO_ACTIVATE_SERVICES_GUIDE.md for help');
        console.error('');
        process.exit(1);
    }
}

// Run the complete setup
setupEverything();
