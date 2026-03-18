/**
 * Test script to check if credits were awarded
 * Run with: npx ts-node test-credits.ts
 */

import * as mongoose from 'mongoose';

interface CreditTransaction {
  registrationId: string;
  amount: number;
  type: string;
  description: string;
  balanceAfter: number;
  metadata?: any;
  createdAt: Date;
}

const creditTransactionSchema = new mongoose.Schema({
  registrationId: String,
  amount: Number,
  type: String,
  description: String,
  balanceAfter: Number,
  metadata: Object,
  createdAt: Date,
});

const CreditTransaction = mongoose.model<CreditTransaction>('CreditTransaction', creditTransactionSchema);

async function testCredits() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/wombto18';
  
  try {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Replace with your actual registration ID
    const registrationId = 'CHD-KL-20260306-000001'; // CHANGE THIS
    
    console.log(`🔍 Searching for credits for: ${registrationId}\n`);
    
    const transactions = await CreditTransaction.find({ registrationId })
      .sort({ createdAt: -1 })
      .limit(10);
    
    if (transactions.length === 0) {
      console.log('❌ NO CREDITS FOUND!');
      console.log('\nThis means the vaccination.completed event was NOT emitted.');
      console.log('\nSolutions:');
      console.log('1. Restart the backend: npm run start:dev');
      console.log('2. Mark a vaccine as complete in Admin panel');
      console.log('3. Check backend logs for event emission');
    } else {
      console.log('✅ CREDITS FOUND!\n');
      console.log(`Found ${transactions.length} transaction(s):\n`);
      
      let totalCredits = 0;
      transactions.forEach((tx: any, i: number) => {
        console.log(`${i + 1}. ${tx.description}`);
        console.log(`   Amount: ${tx.amount > 0 ? '+' : ''}${tx.amount}`);
        console.log(`   Balance After: ${tx.balanceAfter}`);
        console.log(`   Type: ${tx.type}`);
        console.log(`   Date: ${new Date(tx.createdAt).toLocaleString()}`);
        console.log('');
        totalCredits += tx.amount;
      });
      
      console.log(`\n📊 Total Credits: ${totalCredits}`);
      console.log(`\n✅ Backend is working correctly!`);
      console.log(`\nIf UI still shows 0, try:`);
      console.log(`1. Refresh the Go Green page (Ctrl+R)`);
      console.log(`2. Clear browser cache`);
      console.log(`3. Check CreditWidget API endpoint in browser DevTools`);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
  }
}

testCredits();
