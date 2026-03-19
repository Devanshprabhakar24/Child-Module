/**
 * Script to automatically activate services for all completed registrations
 * This will:
 * 1. Find all registrations with payment status = COMPLETED
 * 2. Check if they have vaccination milestones
 * 3. If missing, activate all services:
 *    - Vaccination milestones
 *    - Development milestones
 *    - Reminders
 *    - Tree planting (if not already done)
 */

require('dotenv').config();
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;
const API_BASE = process.env.APP_BASE_URL || 'http://localhost:8000';

async function activateAllServices() {
    try {
        console.log('🚀 Starting automatic service activation for all users...\n');
        console.log('🔌 Connecting to MongoDB Atlas...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB Atlas\n');

        // Get all completed registrations
        const ChildRegistration = mongoose.model('ChildRegistration', new mongoose.Schema({}, { strict: false, collection: 'child_registrations' }));
        const Milestone = mongoose.model('Milestone', new mongoose.Schema({}, { strict: false, collection: 'milestones' }));

        const completedRegistrations = await ChildRegistration.find({
            paymentStatus: 'COMPLETED'
        }).lean();

        console.log(`📋 Found ${completedRegistrations.length} completed registration(s)\n`);

        if (completedRegistrations.length === 0) {
            console.log('ℹ️  No completed registrations found. Nothing to activate.');
            return;
        }

        let activatedCount = 0;
        let alreadyActiveCount = 0;
        let errorCount = 0;

        for (const registration of completedRegistrations) {
            console.log(`\n${'='.repeat(70)}`);
            console.log(`🔍 Checking: ${registration.childName} (${registration.registrationId})`);
            console.log(`${'='.repeat(70)}`);

            try {
                // Check if vaccination milestones exist
                const existingMilestones = await Milestone.find({
                    registrationId: registration.registrationId
                }).lean();

                if (existingMilestones && existingMilestones.length > 0) {
                    console.log(`✓ Already has ${existingMilestones.length} milestones - services active`);
                    alreadyActiveCount++;
                    continue;
                }

                console.log(`⚠️  No milestones found - activating services...`);

                // Import required services
                const { NestFactory } = require('@nestjs/core');
                const { AppModule } = require('./dist/app.module');

                // Create NestJS application context
                const app = await NestFactory.createApplicationContext(AppModule, {
                    logger: ['error', 'warn'],
                });

                const registrationService = app.get('RegistrationService');
                const goGreenService = app.get('GoGreenService');
                const dashboardService = app.get('DashboardService');
                const remindersService = app.get('RemindersService');
                const cmsService = app.get('CmsService');

                // 1. Check/Plant tree
                console.log('🌳 Checking tree status...');
                let plantedTree = null;
                try {
                    const existingTree = await goGreenService.getTreeByRegistrationId(registration.registrationId);
                    if (existingTree) {
                        plantedTree = existingTree;
                        console.log(`   ✓ Tree already exists: ${existingTree.treeId}`);
                    } else {
                        plantedTree = await goGreenService.plantTree({
                            registrationId: registration.registrationId,
                            childName: registration.childName,
                            motherName: registration.motherName,
                            location: registration.state,
                            plantingPartner: 'WombTo18 Green Initiative (Auto-Activation)',
                        });
                        console.log(`   ✓ Tree planted: ${plantedTree.treeId}`);
                    }
                } catch (treeError) {
                    console.log(`   ⚠️  Tree planting skipped: ${treeError.message}`);
                }

                // 2. Seed vaccination milestones
                console.log('💉 Seeding vaccination milestones...');
                const vaccinationMilestones = await dashboardService.seedVaccinationMilestones(
                    registration.registrationId,
                    registration.dateOfBirth,
                );
                console.log(`   ✓ Created ${vaccinationMilestones.length} vaccination milestones`);

                // 3. Seed development milestones
                console.log('🧠 Seeding development milestones...');
                const dashboardAgeGroup = dashboardService.getChildAgeGroup(registration.dateOfBirth);
                const templates = await cmsService.getMilestoneTemplatesByAgeGroup(dashboardAgeGroup);

                if (templates && templates.length > 0) {
                    const developmentMilestones = await dashboardService.seedDevelopmentMilestones(
                        registration.registrationId,
                        dashboardAgeGroup,
                        templates
                    );
                    console.log(`   ✓ Created ${developmentMilestones.length} development milestones`);
                } else {
                    console.log(`   ⚠️  No milestone templates found for age group: ${dashboardAgeGroup}`);
                }

                // 4. Schedule reminders
                console.log('🔔 Setting up reminders...');
                const { ReminderChannel } = require('./dist/libs/shared/src/dto/reminder.dto');
                const reminderCount = await remindersService.seedRemindersForRegistration(
                    registration.registrationId,
                    [ReminderChannel.SMS, ReminderChannel.WHATSAPP],
                );
                console.log(`   ✓ Scheduled ${reminderCount} reminders`);

                console.log(`\n✅ Services activated successfully for ${registration.childName}!`);
                activatedCount++;

                await app.close();

            } catch (error) {
                console.error(`\n❌ Error activating services for ${registration.registrationId}:`);
                console.error(`   ${error.message}`);
                errorCount++;
            }
        }

        console.log(`\n${'='.repeat(70)}`);
        console.log('📊 ACTIVATION SUMMARY');
        console.log(`${'='.repeat(70)}`);
        console.log(`Total registrations checked: ${completedRegistrations.length}`);
        console.log(`✅ Services activated: ${activatedCount}`);
        console.log(`✓ Already active: ${alreadyActiveCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log(`${'='.repeat(70)}\n`);

        if (activatedCount > 0) {
            console.log('🎉 Service activation completed successfully!');
        } else if (alreadyActiveCount === completedRegistrations.length) {
            console.log('✓ All registrations already have services activated.');
        }

    } catch (error) {
        console.error('\n💥 CRITICAL ERROR:');
        console.error(error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

// Run the script
activateAllServices();
