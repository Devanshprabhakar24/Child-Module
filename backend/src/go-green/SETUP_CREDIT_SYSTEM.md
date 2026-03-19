# 🌱 Go Green Credit System - Backend Setup Guide

## Overview

The Go Green Credit System gamifies child health milestones by rewarding parents with credits for completing vaccinations, uploading health records, and engaging with the platform. Credits can be redeemed to plant trees in their child's name.

---

## 📁 New Files Created

### Schemas
- `src/go-green/schemas/credit-transaction.schema.ts` - Credit transaction records
- `src/go-green/schemas/tier-config.schema.ts` - Tier configuration reference data
- `src/go-green/schemas/go-green-tree.schema.ts` - Updated with credit fields

### DTOs
- `src/go-green/dto/credit.dto.ts` - Data transfer objects for credit operations

### Services
- `src/go-green/go-green.service.ts` - Complete credit management service
- `src/go-green/credit-award.listener.ts` - Event listeners for auto-awarding credits

### Controllers
- `src/go-green/go-green.controller.ts` - REST API endpoints

### Utilities
- `src/go-green/seed-tiers.ts` - Database seeder for tier configurations

### Module
- `src/go-green/go-green.module.ts` - Updated with new schemas and listeners

---

## 🚀 Setup Instructions

### Step 1: Install Dependencies

Ensure you have the required dependencies:

```bash
cd backend
npm install @nestjs/event-emitter
npm install class-validator class-transformer
```

### Step 2: Update app.module.ts

Add EventEmitter to your main app module:

```typescript
// src/app.module.ts
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    // ... other imports
    GoGreenModule,
  ],
})
export class AppModule {}
```

### Step 3: Seed Tier Configurations

Run the seeder to populate tier data:

```bash
# Option 1: Using ts-node
cd backend
npx ts-node src/go-green/seed-tiers.ts

# Option 2: Using npm script (add to package.json)
npm run seed:tiers
```

Expected output:
```
✅ Connected to MongoDB
📋 Cleared existing tier configurations
✅ Created tier: SEEDLING (🌱) - 0-499 credits
✅ Created tier: SAPLING (🌿) - 500-999 credits
✅ Created tier: YOUNG (🌳) - 1000-1999 credits
✅ Created tier: MATURE (🌲) - 2000-3499 credits
✅ Created tier: GUARDIAN (🌴) - 3500-4999 credits
✅ Created tier: FOREST (🏆) - 5000+ credits

✨ Tier configuration seeding completed successfully!
```

### Step 4: Update Vaccination Service

To enable automatic credit awards, update your vaccination service to emit events:

```typescript
// src/dashboard/vaccinations/vaccinations.service.ts
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class VaccinationsService {
  constructor(
    @InjectModel(Milestone.name)
    private readonly milestoneModel: Model<Milestone>,
    private eventEmitter: EventEmitter2,
  ) {}

  async updateMilestoneStatus(
    milestoneId: string,
    status: string,
    completedDate?: Date,
  ) {
    const milestone = await this.milestoneModel.findByIdAndUpdate(
      milestoneId,
      { status, completedDate },
      { new: true },
    );

    // Emit event when vaccine is completed
    if (status === 'COMPLETED') {
      this.eventEmitter.emit('vaccination.completed', {
        registrationId: milestone.registrationId,
        milestoneId: milestone._id.toString(),
        vaccineName: milestone.vaccineName || milestone.title,
        sequenceNumber: this.getVaccineSequence(milestone.vaccineName),
        completedDate: completedDate || new Date(),
      });
    }

    return milestone;
  }

  private getVaccineSequence(vaccineName: string): number {
    // Implement sequence logic (same as in go-green service)
    const vaccineMap: Record<string, number> = {
      'BCG': 1,
      'OPV-0': 1,
      'HepB': 1,
      'OPV-1': 2,
      // ... etc
    };
    
    for (const [key, sequence] of Object.entries(vaccineMap)) {
      if (vaccineName.toUpperCase().includes(key)) {
        return sequence;
      }
    }
    return 1;
  }
}
```

### Step 5: Update Health Records Service

Similarly, update health records service:

```typescript
// src/health-records/health-records.service.ts
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class HealthRecordsService {
  constructor(
    @InjectModel(HealthRecord.name)
    private readonly healthRecordModel: Model<HealthRecord>,
    private eventEmitter: EventEmitter2,
  ) {}

  async uploadHealthRecord(data: CreateHealthRecordDto) {
    const record = await this.healthRecordModel.create(data);

    // Emit event for credit award
    this.eventEmitter.emit('health-record.uploaded', {
      registrationId: data.registrationId,
      recordId: record._id.toString(),
      category: data.category,
    });

    return record;
  }
}
```

### Step 6: Update Registration Service

Add credit fields to registration schema:

```typescript
// src/registration/schemas/registration.schema.ts

@Schema({ timestamps: true })
export class Registration {
  // ... existing fields

  @Prop({ type: Object, default: {
    total: 0,
    current: 0,
    level: 'SEEDLING',
    nextTreeAt: 500,
    treesPlanted: 0,
    co2Offset: 0,
  }})
  goGreenCredits!: {
    total: number;
    current: number;
    level: string;
    nextTreeAt: number;
    treesPlanted: number;
    co2Offset: number;
    lastCreditDate?: Date;
  };
}
```

---

## 🔌 API Endpoints

### Credit Management

#### GET `/go-green/credits/:registrationId`
Get credit balance, level, and transaction history

**Response:**
```json
{
  "success": true,
  "data": {
    "registrationId": "CHD-KL-20260306-000001",
    "credits": {
      "total": 750,
      "current": 250,
      "level": "SAPLING",
      "nextTreeAt": 750,
      "treesPlanted": 1,
      "co2Offset": 15,
      "lastCreditDate": "2026-03-15T10:30:00Z"
    },
    "tier": {
      "current": "SAPLING",
      "next": "YOUNG",
      "progress": 75,
      "creditsForNextTier": 250
    },
    "transactions": [...]
  }
}
```

#### POST `/go-green/credits/award`
Award credits manually (admin only)

**Request:**
```json
{
  "registrationId": "CHD-KL-20260306-000001",
  "amount": 100,
  "type": "VACCINATION",
  "description": "6-week vaccines completed",
  "metadata": {
    "vaccineId": "vac_789",
    "vaccineName": "OPV-1",
    "sequenceNumber": 2
  }
}
```

#### GET `/go-green/credits/:registrationId/history`
Get detailed transaction history with pagination

**Query Parameters:**
- `limit` (default: 50)
- `offset` (default: 0)
- `type` (optional filter)

### Tree Redemption

#### GET `/go-green/tree/options?registrationId=xxx`
Get available tree options for redemption

**Response:**
```json
{
  "success": true,
  "data": {
    "currentCredits": 750,
    "availableTrees": [
      {
        "tier": "SAPLING",
        "treeType": "Neem (Azadirachta indica)",
        "creditsRequired": 500,
        "co2Absorption": 15,
        "certificate": "BRONZE",
        "canRedeem": true,
        "creditsNeeded": 0
      },
      {
        "tier": "YOUNG",
        "treeType": "Peepal (Ficus religiosa)",
        "creditsRequired": 1000,
        "co2Absorption": 30,
        "certificate": "SILVER",
        "canRedeem": false,
        "creditsNeeded": 250
      }
    ]
  }
}
```

#### POST `/go-green/tree/redeem`
Exchange credits for tree planting

**Request:**
```json
{
  "registrationId": "CHD-KL-20260306-000001",
  "tier": "SAPLING",
  "treeSpecies": "Neem",
  "dedicateTo": "Arjun Kumar"
}
```

### Reference Data

#### GET `/go-green/levels`
Get all tier configurations

#### GET `/go-green/config`
Get credit earning rates

---

## 🧪 Testing

### Test Credit Award

```bash
curl -X POST http://localhost:3000/go-green/credits/award \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "registrationId": "CHD-KL-20260306-000001",
    "amount": 100,
    "type": "VACCINATION",
    "description": "Test vaccine",
    "metadata": { "test": true }
  }'
```

### Test Get Credits

```bash
curl http://localhost:3000/go-green/credits/CHD-KL-20260306-000001 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test Tree Redemption

```bash
curl -X POST http://localhost:3000/go-green/tree/redeem \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "registrationId": "CHD-KL-20260306-000001",
    "tier": "SAPLING",
    "dedicateTo": "Arjun Kumar"
  }'
```

---

## 📊 Database Collections

### credit_transactions
Stores all credit transactions (earnings and redemptions).

### tier_configs
Static reference data for tier configurations (seeded).

### go_green_trees
Updated with credit-related fields:
- `tier` - Tree tier level
- `creditsUsed` - Credits spent on this tree
- `certificateTier` - Certificate type (BRONZE, SILVER, etc.)
- `certificateUrl` - URL to generated certificate
- `plantingStatus` - PENDING | SCHEDULED | PLANTED | VERIFIED

---

## 🔒 Security Considerations

1. **Authentication**: All endpoints require JWT authentication
2. **Authorization**: Consider adding admin role check for manual credit awards
3. **Transaction Safety**: All credit operations use MongoDB sessions for atomicity
4. **Audit Trail**: All transactions are logged with metadata
5. **Rate Limiting**: Consider adding rate limiting to prevent abuse

---

## 🎯 Next Steps

### Frontend Implementation
1. Create Credit Widget component
2. Build tier progress visualization
3. Implement tree selection modal
4. Add floating credit animations
5. Create success celebration modal

### Backend Enhancements
1. Implement certificate PDF generation
2. Add leaderboard functionality
3. Create admin dashboard for credit management
4. Set up notification service integration
5. Implement retry mechanism for failed credit awards

---

## 📝 Troubleshooting

### Issue: Credits not awarding automatically
**Solution**: Check that EventEmitterModule is imported in AppModule and vaccination service is emitting events correctly.

### Issue: Tier configs not found
**Solution**: Run the seeder script: `npx ts-node src/go-green/seed-tiers.ts`

### Issue: Transaction errors
**Solution**: Ensure MongoDB is running and connection string is correct in .env

---

## 📞 Support

For issues or questions:
1. Check the main documentation: `GO_GREEN_CREDIT_SYSTEM.md`
2. Review API endpoint examples above
3. Check MongoDB logs for database errors
4. Verify event emission in vaccination/health-record services

---

**Created**: March 16, 2026  
**Version**: 1.0  
**Status**: Ready for Testing
