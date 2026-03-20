/**
 * Test Tree Redemption
 * Tests the tree redemption endpoint with proper location field
 */

const axios = require('axios');

const API_BASE = 'http://localhost:8000';

async function testTreeRedemption() {
    try {
        console.log('🧪 Testing Tree Redemption...\n');

        // Test data
        const registrationId = 'CHD-ML-20260304-000001'; // Update with actual registration ID
        const tier = 'SAPLING'; // 500 credits

        console.log(`📋 Test Parameters:`);
        console.log(`   Registration ID: ${registrationId}`);
        console.log(`   Tier: ${tier}`);
        console.log(`   Location: India\n`);

        // Step 1: Check current credits
        console.log('1️⃣ Checking current credits...');
        const creditsResponse = await axios.get(`${API_BASE}/go-green/credits/${registrationId}`);
        const currentCredits = creditsResponse.data.data.credits.current;
        console.log(`   ✅ Current credits: ${currentCredits}\n`);

        if (currentCredits < 500) {
            console.log('❌ Insufficient credits. Need at least 500 credits for SAPLING tier.');
            console.log(`   Awarding 600 credits for testing...\n`);

            // Award credits
            await axios.post(`${API_BASE}/go-green/credits/award`, {
                registrationId,
                amount: 600,
                type: 'BONUS',
                description: 'Test credits for tree redemption',
            });

            console.log('   ✅ Credits awarded!\n');
        }

        // Step 2: Get tree options
        console.log('2️⃣ Fetching tree options...');
        const optionsResponse = await axios.get(`${API_BASE}/go-green/tree/options?registrationId=${registrationId}`);
        console.log(`   ✅ Available trees: ${optionsResponse.data.data.availableTrees.length}\n`);

        // Step 3: Redeem tree
        console.log('3️⃣ Redeeming tree...');
        const redeemResponse = await axios.post(`${API_BASE}/go-green/tree/redeem`, {
            registrationId,
            tier,
            location: 'India',
            dedicateTo: 'Test Child',
        });

        if (redeemResponse.data.success) {
            console.log('   ✅ Tree redeemed successfully!\n');
            console.log('📊 Redemption Details:');
            console.log(`   Tree ID: ${redeemResponse.data.data.treeId}`);
            console.log(`   Credits Used: ${redeemResponse.data.data.creditsUsed}`);
            console.log(`   Remaining Credits: ${redeemResponse.data.data.remainingCredits}`);
            console.log(`   Location: ${redeemResponse.data.data.treeDetails.location}`);
            console.log(`   CO₂ Offset: ${redeemResponse.data.data.treeDetails.co2OffsetKg} kg/year`);
            console.log(`   Message: ${redeemResponse.data.data.message}\n`);
        }

        // Step 4: Verify credits deducted
        console.log('4️⃣ Verifying credit deduction...');
        const newCreditsResponse = await axios.get(`${API_BASE}/go-green/credits/${registrationId}`);
        const newCredits = newCreditsResponse.data.data.credits.current;
        console.log(`   ✅ New credit balance: ${newCredits}\n`);

        console.log('✅ All tests passed!\n');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
        if (error.response?.data) {
            console.error('Error details:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testTreeRedemption();
