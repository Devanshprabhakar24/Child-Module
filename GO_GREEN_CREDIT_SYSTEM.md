# 🌱 Go Green Credit System - Complete Implementation Guide

**WombTo18 Environmental Gamification Initiative**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Credit Earning Rules](#credit-earning-rules)
3. [Credit Thresholds & Tree Tiers](#credit-thresholds--tree-tiers)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Credit Award Flow](#credit-award-flow)
7. [Tree Redemption Flow](#tree-redemption-flow)
8. [UI Components](#ui-components)
9. [Implementation Priority](#implementation-priority)
10. [Example Calculations](#example-calculations)

---

## 📖 Overview

The Go Green Credit System gamifies child health milestones by rewarding parents with credits for completing vaccinations, uploading health records, and engaging with the platform. These credits can be redeemed to plant trees in their child's name, creating a real-world environmental impact while promoting child health.

### Core Principles

- **Health First**: Credits incentivize timely vaccinations
- **Environmental Impact**: Virtual credits become real trees
- **Progressive Rewards**: Higher tiers = bigger environmental impact
- **Social Proof**: Shareable certificates drive viral growth

---

## 💰 Credit Earning Rules

### Vaccination Milestones

| Action | Credits | Description | Trigger |
|--------|---------|-------------|---------|
| 1st Vaccine (BCG/OPV/HepB) | +50 | Birth dose completion | Mark as Done |
| 2nd Vaccine (6 weeks) | +100 | Early immunization | Mark as Done |
| 3rd Vaccine (10 weeks) | +100 | Continued care | Mark as Done |
| 4th Vaccine (14 weeks) | +100 | Primary series | Mark as Done |
| 5th Vaccine (9 months) | +150 | Measles milestone | Mark as Done |
| 6th Vaccine (12-18 months) | +150 | Toddler boosters | Mark as Done |
| Annual Booster (yearly) | +200 | Yearly health check | Mark as Done |
| **Series Completion Bonus** | +200 | Complete all 6 primary vaccines | Auto-awarded |

### Health Records

| Action | Credits | Description |
|--------|---------|-------------|
| Upload Health Record | +10 | Each document (max 50/month) |
| Complete Growth Check | +25 | Height/weight logged by admin |
| Annual Health Checkup | +50 | Complete yearly assessment |

### Engagement Actions

| Action | Credits | Description |
|--------|---------|-------------|
| Share Certificate | +5 | Social media share |
| Complete Profile | +50 | First-time setup completion |
| Refer Another Parent | +100 | Successful referral |
| Daily Login Streak (7 days) | +25 | Weekly bonus |

---

## 🌳 Credit Thresholds & Tree Tiers

### Tier Progression System

```
Tier Progression:
🌱 Seedling (0-499) → 🌿 Sapling (500-999) → 🌳 Young Tree (1000-1999) → 
🌲 Mature Tree (2000-3499) → 🌴 Guardian Tree (3500-4999) → 🏆 Forest Creator (5000+)
```

### Detailed Tier Benefits

| Tier | Credits Required | Tree Type | CO₂ Absorption | Certificate | Physical Reward |
|------|-----------------|-----------|----------------|-------------|-----------------|
| 🌱 **Seedling** | 0-499 | Virtual Tree | 0 kg/year | Digital Badge | None |
| 🌿 **Sapling** | 500-999 | Neem (Small) | 15 kg/year | Bronze PDF | E-Certificate |
| 🌳 **Young Tree** | 1000-1999 | Peepal (Medium) | 30 kg/year | Silver PDF | E-Certificate + Badge |
| 🌲 **Mature Tree** | 2000-3499 | Banyan (Large) | 50 kg/year | Gold PDF | Printed Certificate |
| 🌴 **Guardian Tree** | 3500-4999 | Grove (3 trees) | 100 kg/year | Platinum PDF | Printed + Plaque |
| 🏆 **Forest Creator** | 5000+ | Mini Forest (5 trees) | 200 kg/year | Diamond PDF | Physical Plaque + Wall of Fame |

### Tree Species Details

| Tree | Scientific Name | Growth Rate | Lifespan | Special Benefits |
|------|----------------|-------------|----------|------------------|
| Neem | Azadirachta indica | Fast | 200+ years | Medicinal, Air purification |
| Peepal | Ficus religiosa | Medium | 1500+ years | High CO₂ absorption, Sacred |
| Banyan | Ficus benghalensis | Slow | 200+ years | Largest canopy, Ecosystem support |
| Gulmohar | Delonix regia | Fast | 50+ years | Beautiful flowers, Shade |
| Mango | Mangifera indica | Medium | 300+ years | Fruit bearing, Economic value |

---

## 💾 Database Schema

### A. Update Child Profile Schema

```typescript
// Add to existing registration/child schema

interface GoGreenCredits {
  total: number;           // Lifetime credits earned
  current: number;         // Available credits for redemption
  level: 'SEEDLING' | 'SAPLING' | 'YOUNG' | 'MATURE' | 'GUARDIAN' | 'FOREST';
  nextTreeAt: number;      // Credits needed for next tree
  treesPlanted: number;    // Total trees earned
  co2Offset: number;       // Total kg CO₂ offset per year
  lastCreditDate?: Date;   // Last credit earned date
}

// Example document:
{
  _id: "64abc123...",
  registrationId: "CHD-KL-20260306-000001",
  childName: "Arjun Kumar",
  // ... other fields
  goGreenCredits: {
    total: 750,
    current: 250,  // 500 used for 1 tree
    level: "SAPLING",
    nextTreeAt: 750,  // Needs 750 more for Young Tree
    treesPlanted: 1,
    co2Offset: 15,  // kg/year
    lastCreditDate: "2026-03-15T10:30:00Z"
  }
}
```

### B. Credit Transaction Schema (New Collection)

```typescript
interface CreditTransaction {
  _id: string;
  registrationId: string;
  amount: number;            // +50, +100, etc. (always positive for earning)
  type: 'VACCINATION' | 'HEALTH_RECORD' | 'ENGAGEMENT' | 'BONUS' | 'REDEMPTION';
  description: string;       // "BCG Vaccine Completed"
  balanceAfter: number;      // Total credits after this transaction
  createdAt: Date;
  metadata: {
    vaccineId?: string;
    vaccineName?: string;
    recordId?: string;
    milestoneName?: string;
    treeId?: string;         // For redemption transactions
  };
}

// Example documents:
{
  _id: "txn_001",
  registrationId: "CHD-KL-20260306-000001",
  amount: 50,
  type: "VACCINATION",
  description: "BCG Vaccine Completed",
  balanceAfter: 50,
  createdAt: "2026-03-01T09:00:00Z",
  metadata: {
    vaccineId: "vac_123",
    vaccineName: "BCG"
  }
}

{
  _id: "txn_002",
  registrationId: "CHD-KL-20260306-000001",
  amount: -500,  // Negative for redemption
  type: "REDEMPTION",
  description: "Redeemed for Neem Tree",
  balanceAfter: 250,
  createdAt: "2026-03-15T14:30:00Z",
  metadata: {
    treeId: "tree_456",
    treeTier: "SAPLING"
  }
}
```

### C. Update Tree Schema

```typescript
interface TreeData {
  // ... existing fields
  tier: 'SAPLING' | 'YOUNG' | 'MATURE' | 'GUARDIAN' | 'FOREST';
  creditsUsed: number;       // Credits spent on this tree
  co2Absorption: number;     // kg/year
  certificateUrl?: string;
  certificateTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  plantingStatus: 'PENDING' | 'SCHEDULED' | 'PLANTED' | 'VERIFIED';
  plantedDate?: Date;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Example:
{
  _id: "tree_456",
  treeId: "TREE-KL-2026-001",
  registrationId: "CHD-KL-20260306-000001",
  species: "Neem (Azadirachta indica)",
  tier: "SAPLING",
  creditsUsed: 500,
  co2Absorption: 15,  // kg/year
  certificateTier: "BRONZE",
  certificateUrl: "/certificates/tree_456_bronze.pdf",
  plantingStatus: "PLANTED",
  plantedDate: "2026-03-20T10:00:00Z",
  gpsCoordinates: {
    latitude: 12.9716,
    longitude: 77.5946
  }
}
```

### D. Tier Configuration Collection (Static Reference)

```typescript
interface TierConfig {
  level: string;
  minCredits: number;
  maxCredits: number;
  treeType: string;
  co2Absorption: number;
  certificateType: string;
  badgeIcon: string;
  color: string;
}

// Seed data:
[
  {
    level: "SEEDLING",
    minCredits: 0,
    maxCredits: 499,
    treeType: "Virtual Tree",
    co2Absorption: 0,
    certificateType: "DIGITAL_BADGE",
    badgeIcon: "🌱",
    color: "#94a3b8"
  },
  {
    level: "SAPLING",
    minCredits: 500,
    maxCredits: 999,
    treeType: "Neem (Azadirachta indica)",
    co2Absorption: 15,
    certificateType: "BRONZE",
    badgeIcon: "🌿",
    color: "#10b981"
  },
  {
    level: "YOUNG",
    minCredits: 1000,
    maxCredits: 1999,
    treeType: "Peepal (Ficus religiosa)",
    co2Absorption: 30,
    certificateType: "SILVER",
    badgeIcon: "🌳",
    color: "#3b82f6"
  },
  {
    level: "MATURE",
    minCredits: 2000,
    maxCredits: 3499,
    treeType: "Banyan (Ficus benghalensis)",
    co2Absorption: 50,
    certificateType: "GOLD",
    badgeIcon: "🌲",
    color: "#eab308"
  },
  {
    level: "GUARDIAN",
    minCredits: 3500,
    maxCredits: 4999,
    treeType: "Grove (3 trees)",
    co2Absorption: 100,
    certificateType: "PLATINUM",
    badgeIcon: "🌴",
    color: "#a855f7"
  },
  {
    level: "FOREST",
    minCredits: 5000,
    maxCredits: 999999,
    treeType: "Mini Forest (5 trees)",
    co2Absorption: 200,
    certificateType: "DIAMOND",
    badgeIcon: "🏆",
    color: "#ec4899"
  }
]
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
    "childName": "Arjun Kumar",
    "credits": {
      "total": 750,
      "current": 250,
      "level": "SAPLING",
      "nextTreeAt": 750,
      "treesPlanted": 1,
      "co2Offset": 15
    },
    "tier": {
      "current": "SAPLING",
      "next": "YOUNG",
      "progress": 75,  // percentage to next tier
      "creditsForNextTier": 250
    },
    "transactions": [
      {
        "_id": "txn_001",
        "amount": 50,
        "type": "VACCINATION",
        "description": "BCG Vaccine Completed",
        "balanceAfter": 50,
        "createdAt": "2026-03-01T09:00:00Z",
        "metadata": { "vaccineName": "BCG" }
      }
    ]
  }
}
```

#### POST `/go-green/credits/award`
Award credits (admin/system triggered)

**Request:**
```json
{
  "registrationId": "CHD-KL-20260306-000001",
  "amount": 100,
  "type": "VACCINATION",
  "description": "6-week vaccines completed",
  "metadata": {
    "vaccineId": "vac_789",
    "vaccineName": "OPV-1"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "transactionId": "txn_002",
    "previousBalance": 50,
    "creditsAwarded": 100,
    "newBalance": 150,
    "tierChanged": false,
    "message": "100 credits awarded! You're 350 credits away from planting your first tree!"
  }
}
```

#### POST `/go-green/credits/bulk-award`
Award credits for multiple past vaccinations (migration tool)

**Request:**
```json
{
  "registrationId": "CHD-KL-20260306-000001",
  "vaccines": [
    { "vaccineId": "vac_001", "vaccineName": "BCG", "completedDate": "2026-03-01" },
    { "vaccineId": "vac_002", "vaccineName": "OPV-1", "completedDate": "2026-04-15" }
  ]
}
```

### Tree Redemption

#### POST `/go-green/tree/redeem`
Exchange credits for tree planting

**Request:**
```json
{
  "registrationId": "CHD-KL-20260306-000001",
  "tier": "SAPLING",
  "treeSpecies": "Neem",  // Optional, defaults based on tier
  "dedicateTo": "Arjun Kumar"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "treeId": "TREE-KL-2026-001",
    "tier": "SAPLING",
    "creditsUsed": 500,
    "remainingCredits": 250,
    "certificateUrl": "/certificates/tree_456_bronze.pdf",
    "estimatedPlantingDate": "2026-04-15",
    "message": "Congratulations! A Neem tree will be planted in Arjun Kumar's name!"
  }
}
```

#### GET `/go-green/tree/options`
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
        "treeType": "Neem",
        "creditsRequired": 500,
        "co2Absorption": 15,
        "canRedeem": true,
        "certificate": "Bronze"
      },
      {
        "tier": "YOUNG",
        "treeType": "Peepal",
        "creditsRequired": 1000,
        "co2Absorption": 30,
        "canRedeem": false,
        "creditsNeeded": 250,
        "certificate": "Silver"
      }
    ]
  }
}
```

### Leaderboard (Optional Gamification)

#### GET `/go-green/leaderboard`
Top children by credits

**Query Parameters:**
- `limit` (default: 10)
- `timeframe` (all-time | monthly | yearly)
- `region` (optional state filter)

**Response:**
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "registrationId": "CHD-KL-20260306-000001",
        "childName": "Arjun Kumar",
        "totalCredits": 2500,
        "treesPlanted": 2,
        "level": "MATURE"
      },
      {
        "rank": 2,
        "registrationId": "CHD-KA-20260401-000042",
        "childName": "Priya Sharma",
        "totalCredits": 2200,
        "treesPlanted": 2,
        "level": "MATURE"
      }
    ],
    "userRank": {
      "rank": 15,
      "registrationId": "CHD-KL-20260306-000001",
      "totalCredits": 750
    }
  }
}
```

### Reference Data

#### GET `/go-green/levels`
Get all tier information

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "level": "SEEDLING",
      "minCredits": 0,
      "maxCredits": 499,
      "treeType": "Virtual Tree",
      "co2Absorption": 0,
      "certificateType": "DIGITAL_BADGE",
      "badgeIcon": "🌱",
      "color": "#94a3b8",
      "benefits": ["Digital badge", "Progress tracking"]
    },
    {
      "level": "SAPLING",
      "minCredits": 500,
      "maxCredits": 999,
      "treeType": "Neem (Azadirachta indica)",
      "co2Absorption": 15,
      "certificateType": "BRONZE",
      "badgeIcon": "🌿",
      "color": "#10b981",
      "benefits": ["Tree planting", "Bronze certificate", "CO₂ tracking"]
    }
    // ... more tiers
  ]
}
```

---

## 🔄 Credit Award Flow

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    VACCINATION COMPLETED                        │
│  (Parent/Admin marks vaccine as "Done" in Vaccination Tracker)  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend: PUT /vaccinations/:milestoneId                       │
│  - Update status to COMPLETED                                   │
│  - Show success toast                                           │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend: VaccinationsService.update()                          │
│  - Update milestone document                                    │
│  - Emit event: "vaccination.completed"                          │
│    Event payload: { registrationId, milestoneId, vaccineName }  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  Event Listener: CreditAwardListener                            │
│  - Listen for "vaccination.completed" events                    │
│  - Determine credit amount based on vaccine sequence            │
│  - Call CreditService.award()                                   │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend: CreditService.award()                                 │
│  1. Calculate credit amount (e.g., 100 for 2nd vaccine)         │
│  2. Create CreditTransaction document                           │
│  3. Update child.goGreenCredits:                                │
│     - total += amount                                           │
│     - current += amount                                         │
│     - Check if tier changed                                     │
│     - Update treesPlanted if applicable                         │
│  4. If tier changed:                                            │
│     - Create tier upgrade notification                          │
│     - Generate new certificate if tree planted                  │
│  5. Return transaction details                                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend: NotificationService.send()                            │
│  - Create in-app notification                                   │
│  - Send push notification (if enabled)                          │
│  - Send email (if configured)                                   │
│    Subject: "🌱 You earned 100 Green Credits!"                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend: Real-time Update (WebSocket/Polling)                 │
│  - Receive credit update event                                  │
│  - Show floating animation: "+100 🌱"                           │
│  - Update credit widget                                         │
│  - Show progress bar animation                                  │
│  - If tier upgraded: Show celebration modal                     │
└─────────────────────────────────────────────────────────────────┘
```

### Event Listener Implementation (Backend)

```typescript
// src/go-green/credit-award.listener.ts

@Injectable()
export class CreditAwardListener {
  constructor(
    private creditService: CreditService,
    private notificationService: NotificationService,
  ) {}

  @OnEvent('vaccination.completed')
  async handleVaccinationCompleted(payload: VaccinationCompletedEvent) {
    // Determine credit amount based on vaccine sequence
    const creditAmount = this.calculateVaccineCredits(
      payload.vaccineName,
      payload.sequenceNumber,
    );

    // Award credits
    const transaction = await this.creditService.award({
      registrationId: payload.registrationId,
      amount: creditAmount,
      type: 'VACCINATION',
      description: `${payload.vaccineName} Vaccine Completed`,
      metadata: {
        vaccineId: payload.milestoneId,
        vaccineName: payload.vaccineName,
        sequenceNumber: payload.sequenceNumber,
      },
    });

    // Check for series completion bonus
    if (payload.sequenceNumber === 6) {
      await this.creditService.award({
        registrationId: payload.registrationId,
        amount: 200,
        type: 'BONUS',
        description: 'Primary Series Completion Bonus',
        metadata: { bonusType: 'SERIES_COMPLETE' },
      });
    }

    // Send notification
    await this.notificationService.send({
      registrationId: payload.registrationId,
      type: 'CREDIT_AWARDED',
      title: `🌱 You earned ${creditAmount} Green Credits!`,
      message: `${payload.vaccineName} vaccine completed. Keep going!`,
      data: {
        creditsEarned: creditAmount,
        newBalance: transaction.balanceAfter,
      },
    });
  }

  private calculateVaccineCredits(vaccineName: string, sequenceNumber: number): number {
    const baseCredits: Record<number, number> = {
      1: 50,
      2: 100,
      3: 100,
      4: 100,
      5: 150,
      6: 150,
    };

    const seriesBonus = sequenceNumber === 6 ? 200 : 0;
    return (baseCredits[sequenceNumber] || 50) + seriesBonus;
  }
}
```

---

## 🌳 Tree Redemption Flow

### Complete Redemption Process

```
┌─────────────────────────────────────────────────────────────────┐
│  User clicks "Plant Tree" button                                │
│  (Visible when credits >= 500)                                  │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend: GET /go-green/tree/options                           │
│  - Fetch available tree tiers                                   │
│  - Show what user can afford                                    │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend: Show Tree Selection Modal                            │
│  ┌───────────────────────────────────────────────────┐          │
│  │  🌿 Choose Your Tree                              │          │
│  │                                                   │          │
│  │  ┌─────────────────────────────────────────┐     │          │
│  │  │  🌿 Neem Tree                           │     │          │
│  │  │  Cost: 500 credits                      │     │          │
│  │  │  CO₂: 15 kg/year                        │     │          │
│  │  │  Certificate: Bronze                    │     │          │
│  │  │  [SELECT - Available]                   │     │          │
│  │  └─────────────────────────────────────────┘     │          │
│  │                                                   │          │
│  │  ┌─────────────────────────────────────────┐     │          │
│  │  │  🌳 Peepal Tree                         │     │          │
│  │  │  Cost: 1000 credits                     │     │          │
│  │  │  CO₂: 30 kg/year                        │     │          │
│  │  │  Certificate: Silver                    │     │          │
│  │  │  [SELECT - Need 250 more credits]       │     │          │
│  │  └─────────────────────────────────────────┘     │          │
│  └───────────────────────────────────────────────────┘          │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  User selects tree tier and confirms                            │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend: POST /go-green/tree/redeem                           │
│  Body: { registrationId, tier: "SAPLING", treeSpecies: "Neem" } │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend: TreeService.redeem()                                  │
│  1. Validate credit balance                                     │
│  2. Create tree document (status: PENDING)                      │
│  3. Deduct credits:                                             │
│     - current -= creditsRequired                                │
│     - treesPlanted += 1                                         │
│     - co2Offset += tree.co2Absorption                           │
│  4. Create REDEMPTION transaction                               │
│  5. Generate certificate PDF                                    │
│  6. Create admin task for physical planting                     │
│  7. Send confirmation email                                     │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  Frontend: Show Success Animation                               │
│  - Confetti effect                                              │
│  - "🎉 Tree planted in Arjun Kumar's name!"                     │
│  - Display certificate preview                                  │
│  - Share buttons (WhatsApp, Facebook, Instagram)                │
│  - "Download Certificate" button                                │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  Backend: Admin Notification                                    │
│  - Create planting task                                         │
│  - Assign to field team                                         │
│  - Schedule planting date                                       │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  Field Operations: Tree Planting                                │
│  - Physical tree planted at GPS location                        │
│  - Photo uploaded to tree record                                │
│  - Status updated to PLANTED                                    │
│  - Parent receives "Your tree has been planted!" notification   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎨 UI Components

### A. Credit Display Widget

**Location:** Top of Go Green page, below header

```
┌──────────────────────────────────────────────────────────────┐
│  🌱 Your Green Credits                          [History ▼]  │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │                  │  │                  │                 │
│  │     750          │  │      🌿          │                 │
│  │   Total Earned   │  │    Sapling       │                 │
│  │                  │  │                  │                 │
│  └──────────────────┘  └──────────────────┘                 │
│                                                               │
│  Progress to Young Tree: ████████░░░░ 75%                   │
│  └────────────────────────────────────────┘                  │
│                                                               │
│  🎯 250 more credits to plant Peepal tree!                  │
│                                                               │
│  Quick Actions: [View History] [How to Earn] [Plant Tree]   │
└──────────────────────────────────────────────────────────────┘
```

**Component Props:**
```typescript
interface CreditWidgetProps {
  totalCredits: number;
  currentCredits: number;
  currentLevel: string;
  nextLevel: string;
  progressPercentage: number;
  creditsForNextTier: number;
  treesPlanted: number;
  co2Offset: number;
}
```

### B. Credit History Timeline

**Location:** Modal or separate tab

```
┌──────────────────────────────────────────────────────────────┐
│  📊 Credit History                              [Export CSV] │
│                                                               │
│  Filter: [All Types ▼] [This Year ▼]                        │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Mar 15, 2026                              +100 🌿      │  │
│  │  💉 6-Week Vaccines Completed                          │  │
│  │  Balance: 450 credits                                  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Mar 10, 2026                               +10 📄      │  │
│  │  📋 Health Record Uploaded                             │  │
│  │  Balance: 350 credits                                  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Mar 1, 2026                               +50 🌱       │  │
│  │  ✅ Profile Completed                                  │  │
│  │  Balance: 340 credits                                  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  Feb 20, 2026                              +50 🌱       │  │
│  │  💉 BCG Vaccine Completed                              │  │
│  │  Balance: 290 credits                                  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  Showing 20 of 45 transactions                    [1] [2] [3]│
└──────────────────────────────────────────────────────────────┘
```

### C. Tier Progress Visualization

**Location:** Go Green dashboard or dedicated "My Level" page

```
┌──────────────────────────────────────────────────────────────┐
│  🏆 Your Green Journey                                       │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │  🌱 ───── 🌿 ───── 🌳 ───── 🌲 ───── 🌴 ───── 🏆       │  │
│  │  │       │       │       │       │       │             │  │
│  │  0      500    1000    2000    3500    5000+           │  │
│  │                                                         │  │
│  │         ●─────────○───────○───────○───────○             │  │
│  │      Current: 750 (Sapling)                             │  │
│  │      Next: Young Tree at 1000 credits                   │  │
│  │                                                         │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  Your Achievements:                                           │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │   🌱        │ │   🌿        │ │   🔒        │            │
│  │  Seedling   │ │  Sapling    │ │   Young     │            │
│  │  Unlocked   │ │  Unlocked   │ │   Locked    │            │
│  │  Mar 2026   │ │  Mar 2026   │ │   250 more  │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
│                                                               │
│  [View All Badges]                                            │
└──────────────────────────────────────────────────────────────┘
```

### D. Credit Gain Animations

**Implementation:**
```typescript
// Floating text animation component
function FloatingCreditText({ amount, position, onComplete }) {
  return (
    <motion.div
      initial={{ opacity: 1, y: position.y }}
      animate={{ opacity: 0, y: position.y - 100 }}
      transition={{ duration: 1.5 }}
      onAnimationComplete={onComplete}
      className="fixed text-2xl font-bold text-emerald-500 pointer-events-none z-50"
      style={{ left: position.x }}
    >
      +{amount} 🌱
    </motion.div>
  );
}

// Usage in vaccination page
const handleMarkAsDone = async (milestoneId) => {
  const result = await markVaccineAsDone(milestoneId);
  
  // Show floating credit animation
  showFloatingCredit({
    amount: result.creditsEarned,
    position: { x: event.clientX, y: event.clientY },
  });
  
  // Update credit widget with animation
  animateCreditIncrease(result.newBalance);
};
```

### E. Tree Selection Modal

```
┌──────────────────────────────────────────────────────────────┐
│  🌳 Plant a Tree in Your Child's Name           [X]         │
│                                                               │
│  Current Balance: 750 credits                                 │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  🌿 SAPLING TIER                                 │  │  │
│  │  │                                                  │  │  │
│  │  │  Tree: Neem (Azadirachta indica)                │  │  │
│  │  │  CO₂ Absorption: 15 kg/year                     │  │  │
│  │  │  Certificate: Bronze                            │  │  │
│  │  │                                                  │  │  │
│  │  │  Cost: 500 credits                              │  │  │
│  │  │  [SELECT TREE] ← Available                      │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                                                         │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  🌳 YOUNG TREE TIER                              │  │  │
│  │  │                                                  │  │  │
│  │  │  Tree: Peepal (Ficus religiosa)                 │  │  │
│  │  │  CO₂ Absorption: 30 kg/year                     │  │  │
│  │  │  Certificate: Silver                            │  │  │
│  │  │                                                  │  │  │
│  │  │  Cost: 1000 credits                             │  │  │
│  │  │  Need 250 more credits                          │  │  │
│  │  │  [LOCKED]                                       │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │                                                         │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  🌲 MATURE TREE TIER                             │  │  │
│  │  │                                                  │  │  │
│  │  │  Tree: Banyan (Ficus benghalensis)              │  │  │
│  │  │  CO₂ Absorption: 50 kg/year                     │  │  │
│  │  │  Certificate: Gold                              │  │  │
│  │  │                                                  │  │  │
│  │  │  Cost: 2000 credits                             │  │  │
│  │  │  Need 1250 more credits                         │  │  │
│  │  │  [LOCKED]                                       │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ℹ️ Trees are planted within 30 days of redemption           │
│  📍 You'll receive GPS coordinates and photos                │
│                                                               │
│  [Cancel] [How It Works]                                      │
└──────────────────────────────────────────────────────────────┘
```

### F. Success Celebration Modal

```
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│              🎉 🌳 🎉                                         │
│                                                               │
│         Congratulations!                                      │
│                                                               │
│    A Neem tree will be planted in                           │
│         Arjun Kumar's name!                                  │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │                                                        │  │
│  │   🌿 TREE PLANTED                                      │  │
│  │   TREE-KL-2026-001                                     │  │
│  │                                                        │  │
│  │   Species: Neem (Azadirachta indica)                  │  │
│  │   Tier: Sapling                                        │  │
│  │   CO₂ Offset: 15 kg/year                              │  │
│  │   Estimated Planting: April 15, 2026                  │  │
│  │                                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  Remaining Credits: 250 🌱                                    │
│                                                               │
│  [📥 Download Certificate]  [📤 Share]                        │
│                                                               │
│  Share your achievement:                                      │
│  [WhatsApp] [Facebook] [Instagram] [Twitter]                 │
│                                                               │
│  [Close]                                                      │
└──────────────────────────────────────────────────────────────┘
```

---

## 📊 Implementation Priority

### Phase 1: Core Infrastructure (Week 1-2)

**Backend:**
- [ ] Add `goGreenCredits` field to child/registration schema
- [ ] Create `CreditTransaction` collection and schema
- [ ] Create `TierConfig` collection (static reference data)
- [ ] Implement `GET /go-green/credits/:registrationId` endpoint
- [ ] Implement `POST /go-green/credits/award` endpoint
- [ ] Create credit service with award/redeem logic
- [ ] Add tier calculation utility

**Frontend:**
- [ ] Create CreditWidget component
- [ ] Add credit display to Go Green page
- [ ] Create credit history modal
- [ ] Add tier progress visualization

**Testing:**
- [ ] Manual credit awards via API
- [ ] Verify balance calculations
- [ ] Test tier progression

### Phase 2: Automation (Week 3-4)

**Backend:**
- [ ] Create event listener for vaccination completions
- [ ] Auto-award credits for new vaccinations
- [ ] Add health record upload credits
- [ ] Implement series completion bonus
- [ ] Create notification templates

**Frontend:**
- [ ] Add floating credit animations
- [ ] Real-time credit updates (WebSocket/polling)
- [ ] Credit earned notifications
- [ ] Tier upgrade celebration modal

**Testing:**
- [ ] End-to-end vaccination flow
- [ ] Verify auto-credit awards
- [ ] Test notification delivery

### Phase 3: Tree Redemption (Week 5-6)

**Backend:**
- [ ] Implement `POST /go-green/tree/redeem` endpoint
- [ ] Create tree redemption service
- [ ] Generate tier-based certificates
- [ ] Create admin planting tasks
- [ ] Implement credit deduction logic

**Frontend:**
- [ ] Create tree selection modal
- [ ] Build tree options display
- [ ] Success celebration animation
- [ ] Certificate preview and download
- [ ] Social sharing integration

**Testing:**
- [ ] Full redemption flow
- [ ] Certificate generation
- [ ] Admin task creation

### Phase 4: Gamification (Week 7-8)

**Backend:**
- [ ] Implement `GET /go-green/leaderboard` endpoint
- [ ] Add referral credit tracking
- [ ] Create daily login streak logic
- [ ] Badge/achievement system

**Frontend:**
- [ ] Leaderboard page
- [ ] Achievement badges display
- [ ] Referral tracking UI
- [ ] Login streak widget

**Testing:**
- [ ] Leaderboard accuracy
- [ ] Badge unlocking
- [ ] Streak tracking

---

## 🧮 Example Calculations

### Scenario 1: Complete Primary Vaccination Series

```javascript
Child: Arjun Kumar
Registration: CHD-KL-20260306-000001

Vaccination Timeline:
┌────────────┬──────────────┬─────────┬──────────────┐
│ Date       │ Vaccine      │ Credits │ Total Balance│
├────────────┼──────────────┼─────────┼──────────────┤
│ Mar 1      │ BCG          │ +50     │ 50           │
│ Apr 15     │ OPV-1        │ +100    │ 150          │
│ May 15     │ OPV-2        │ +100    │ 250          │
│ Jun 15     │ OPV-3        │ +100    │ 350          │
│ Sep 1      │ Measles      │ +150    │ 500          │
│ Dec 1      │ MMR          │ +150    │ 650          │
│ Dec 1      │ Series Bonus │ +200    │ 850          │
└────────────┴──────────────┴─────────┴──────────────┘

Result:
- Total Credits: 850
- Current Level: SAPLING (500-999)
- Trees Available: 1 Neem tree (500 credits)
- Remaining After Planting: 350 credits
- CO₂ Offset: 15 kg/year
```

### Scenario 2: Engaged Parent (Full Journey)

```javascript
Child: Priya Sharma
Registration: CHD-KA-20260401-000042

Activity Timeline (First 2 Years):
┌────────────┬────────────────────┬─────────┬──────────────┐
│ Date       │ Activity           │ Credits │ Total Balance│
├────────────┼────────────────────┼─────────┼──────────────┤
│ Apr 1      │ Profile Complete   │ +50     │ 50           │
│ Apr 1      │ BCG Vaccine        │ +50     │ 100          │
│ Apr 15     │ Health Record      │ +10     │ 110          │
│ May 15     │ OPV-1              │ +100    │ 210          │
│ Jun 1      │ Growth Check       │ +25     │ 235          │
│ Jun 15     │ OPV-2              │ +100    │ 335          │
│ Jul 15     │ Health Record      │ +10     │ 345          │
│ Aug 15     │ OPV-3              │ +100    │ 445          │
│ Sep 1      │ Share Certificate  │ +5      │ 450          │
│ Sep 15     │ Measles Vaccine    │ +150    │ 600          │
│ Oct 1      │ Health Record      │ +10     │ 610          │
│ Dec 1      │ MMR Vaccine        │ +150    │ 760          │
│ Dec 1      │ Series Bonus       │ +200    │ 960          │
│ Dec 15     │ Redeem Neem Tree   │ -500    │ 460          │
│ Jan 1      │ Annual Booster     │ +200    │ 660          │
│ Feb 1      │ Health Record      │ +10     │ 670          │
│ Mar 1      │ Growth Check       │ +25     │ 695          │
│ Apr 1      │ Login Streak       │ +25     │ 720          │
│ May 1      │ Health Record      │ +10     │ 730          │
│ Jun 1      │ Annual Checkup     │ +50     │ 780          │
│ Jul 1      │ Referral           │ +100    │ 880          │
│ Aug 1      │ Health Record      │ +10     │ 890          │
│ Sep 1      │ Share Certificate  │ +5      │ 895          │
│ Oct 1      │ Login Streak       │ +25     │ 920          │
│ Nov 1      │ Health Record      │ +10     │ 930          │
│ Dec 1      │ Annual Booster     │ +200    │ 1130         │
│ Dec 15     │ Redeem Peepal Tree │ -1000   │ 130          │
└────────────┴────────────────────┴─────────┴──────────────┘

Result After 2 Years:
- Total Credits Earned: 2130
- Current Balance: 130
- Level: YOUNG TREE (1000-1999)
- Trees Planted: 2 (1 Neem + 1 Peepal)
- Total CO₂ Offset: 45 kg/year (15 + 30)
- Certificates: Bronze + Silver
```

### Scenario 3: Forest Creator (5+ Years)

```javascript
Child: Rohan Patel
Registration: CHD-GJ-20250101-000001

5-Year Summary:
- Total Vaccinations: 15 (including boosters)
- Health Records Uploaded: 50
- Growth Checks: 20
- Referrals: 5
- Login Streaks: 50 weeks

Credit Breakdown:
┌────────────────────────┬─────────┐
│ Source                 │ Credits │
├────────────────────────┼─────────┤
│ Vaccinations           │ 2500    │
│ Series Bonuses (x2)    │ 400     │
│ Health Records         │ 500     │
│ Growth Checks          │ 500     │
│ Annual Checkups        │ 250     │
│ Referrals              │ 500     │
│ Login Streaks          │ 500     │
│ Shares                 │ 100     │
│ Profile Complete       │ 50      │
├────────────────────────┼─────────┤
│ TOTAL                  │ 5300    │
└────────────────────────┴─────────┘

Redemptions:
┌────────────┬─────────┬──────────────┐
│ Tree       │ Cost    │ CO₂ Offset   │
├────────────┼─────────┼──────────────┤
│ Neem       │ -500    │ 15 kg/year   │
│ Peepal     │ -1000   │ 30 kg/year   │
│ Banyan     │ -2000   │ 50 kg/year   │
│ Grove (3x) │ -3500   │ 100 kg/year  │
├────────────┼─────────┼──────────────┤
│ Remaining  │ 300     │              │
└────────────┴─────────┴──────────────┘

Achievements:
- Level: GUARDIAN TREE (3500-4999)
- Trees Planted: 6 total
- Total CO₂ Offset: 195 kg/year
- Certificates: Bronze, Silver, Gold, Platinum
- Physical Rewards: Plaque, Wall of Fame
- Leaderboard Rank: #3 (State), #47 (National)
```

---

## 📈 Expected Impact

### Engagement Metrics

| Metric | Before | After (Projected) | Improvement |
|--------|--------|------------------|-------------|
| Vaccine Completion Rate | 65% | 90% | +38% |
| App Session Duration | 3 min | 8 min | +167% |
| Health Records Uploaded | 2/child | 8/child | +300% |
| Social Shares | 5% | 35% | +600% |
| Parent Retention (1yr) | 40% | 75% | +87% |

### Environmental Impact (10,000 Children)

| Year | Trees Planted | CO₂ Offset/Year | Equivalent To |
|------|---------------|-----------------|---------------|
| Year 1 | 2,000 | 30,000 kg | 6,500 cars off road |
| Year 2 | 5,000 | 75,000 kg | 16,300 cars off road |
| Year 3 | 10,000 | 150,000 kg | 32,600 cars off road |
| Year 5 | 25,000 | 375,000 kg | 81,500 cars off road |

---

## 🔐 Security Considerations

1. **Credit Fraud Prevention:**
   - Server-side credit calculation only
   - Transaction signing and validation
   - Rate limiting on credit awards
   - Audit trail for all transactions

2. **Redemption Validation:**
   - Atomic credit deduction (transaction support)
   - Prevent double-spending
   - Admin approval for high-tier redemptions

3. **Data Privacy:**
   - Encrypt GPS coordinates of planted trees
   - Anonymize leaderboard data (optional)
   - GDPR-compliant data retention

---

## 📞 Support & Documentation

### Admin Dashboard Features
- View all credit transactions
- Manual credit adjustment (with reason logging)
- Tree planting task management
- Certificate regeneration
- Bulk credit awards (migration tool)

### Parent Help Center
- How to earn credits (FAQ)
- Tree planting process explained
- Certificate download guide
- Sharing instructions

---

**Document Version:** 1.0  
**Last Updated:** March 16, 2026  
**Author:** WombTo18 Development Team
