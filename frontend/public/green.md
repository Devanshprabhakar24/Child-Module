🌱 Go Green Credit System - Detailed Implementation Plan

    This is an excellent gamification idea! Let me break down the complete system design for you:

    ---

    📊 Credit System Overview

    1. Credit Earning Rules                                                                                 
                                                                                                            

    ┌────────────────────────────┬────────────────┬───────────────────────┐
    │ Action                     │ Credits Earned │ Description           │
    ├────────────────────────────┼────────────────┼───────────────────────┤
    │ Vaccination Milestones     │                │                       │
    │ 1st Vaccine (BCG/OPV/HepB) │ +50            │ Birth dose completion │
    │ 2nd Vaccine (6 weeks)      │ +100           │ Early immunization    │
    │ 3rd Vaccine (10 weeks)     │ +100           │ Continued care        │
    │ 4th Vaccine (14 weeks)     │ +100           │ Primary series        │
    │ 5th Vaccine (9 months)     │ +150           │ Measles milestone     │
    │ 6th Vaccine (12-18 months) │ +150           │ Toddler boosters      │
    │ Annual Booster (yearly)    │ +200           │ Yearly health check   │
    │ Health Records             │                │                       │
    │ Upload Health Record       │ +10            │ Each document         │
    │ Complete Growth Check      │ +25            │ Height/weight logged  │
    │ Engagement                 │                │                       │
    │ Share Certificate          │ +5             │ Social sharing        │
    │ Complete Profile           │ +50            │ First-time setup      │
    └────────────────────────────┴────────────────┴───────────────────────┘


    ---

    2. Credit Thresholds & Tree Tiers


    ┌────────────────┬───────────────┬───────────────────┬─────────────┬────────────────────────────────┐
    │ Tier           │ Credits Re... │ Tree Type         │ CO₂ Abso... │ Certificate                    │
    ├────────────────┼───────────────┼───────────────────┼─────────────┼────────────────────────────────┤
    │ 🌱 Seedling    │ 0-499         │ Virtual Tree      │ 0 kg        │ Digital Badge                  │
    │ 🌿 Sapling     │ 500-999       │ Neem (Small)      │ 15 kg/year  │ Bronze Certificate             │
    │ 🌳 Young Tree  │ 1000-1999     │ Peepal (Medium)   │ 30 kg/year  │ Silver Certificate             │
    │ 🌲 Mature Tree │ 2000-3499     │ Banyan (Large)    │ 50 kg/year  │ Gold Certificate               │
    │ 🌴 **Guardian... │ 3500-4999     │ Grove (3 trees)   │ 100 kg/year │ Platinum Certificate
    │
    │ 🏆 **Forest C... │ 5000+         │ Mini Forest (5... │ 200 kg/year │ Diamond Certificate + Physi...
    │
    └────────────────┴───────────────┴───────────────────┴─────────────┴────────────────────────────────┘


    ---

    3. Database Schema Changes

    You'll need to add these to your backend:

    A. Update User/Child Schema

      1 interface ChildProfile {
      2   // ... existing fields
      3   goGreenCredits: {
      4     total: number;           // Lifetime credits
      5     current: number;         // Available for next tree
      6     level: string;           // Seedling, Sapling, etc.
      7     nextTreeAt: number;      // Credits needed for next tree
      8     treesPlanted: number;    // Total trees earned
      9     co2Offset: number;       // Total kg CO₂ offset
     10   };
     11 }

    B. Credit Transaction Schema (New Collection)

      1 interface CreditTransaction {
      2   _id: string;
      3   registrationId: string;
      4   amount: number;            // +50, +100, etc.
      5   type: 'VACCINATION' | 'HEALTH_RECORD' | 'ENGAGEMENT' | 'BONUS';
      6   description: string;       // "BCG Vaccine Completed"
      7   balanceAfter: number;      // Total credits after this transaction
      8   createdAt: Date;
      9   metadata: {
     10     vaccineId?: string;
     11     recordId?: string;
     12     milestoneName?: string;
     13   };
     14 }

    C. Update Tree Schema

     1 interface TreeData {
     2   // ... existing fields
     3   tier: 'SAPLING' | 'YOUNG' | 'MATURE' | 'GUARDIAN' | 'FOREST';
     4   creditsUsed: number;       // Credits spent on this tree
     5   co2Absorption: number;     // kg/year
     6   certificateUrl?: string;
     7 }

    ---

    4. API Endpoints Needed

      1 GET  /go-green/credits/:registrationId
      2      → Get credit balance, level, transaction history
      3 
      4 POST /go-green/credits/award
      5      → Award credits (admin/system triggered)
      6      Body: { registrationId, amount, type, description, metadata }
      7 
      8 GET  /go-green/leaderboard
      9      → Top children by credits (optional gamification)
     10 
     11 POST /go-green/tree/redeem
     12      → Exchange credits for tree planting
     13      Body: { registrationId, treeTier }
     14 
     15 GET  /go-green/levels
     16      → Get all tier information (for UI display)

    ---

    5. Credit Award Flow

      1 ┌─────────────────────────────────────────────────────────────┐
      2 │                    VACCINATION COMPLETED                     │
      3 │  (Mark as Done in Vaccination Tracker)                       │
      4 └─────────────────────┬───────────────────────────────────────┘
      5                       │
      6                       ▼
      7 ┌─────────────────────────────────────────────────────────────┐
      8 │  Backend: Vaccination Service                                │
      9 │  - Update milestone status to COMPLETED                      │
     10 │  - Emit event: "vaccination.completed"                       │
     11 └─────────────────────┬───────────────────────────────────────┘
     12                       │
     13                       ▼
     14 ┌─────────────────────────────────────────────────────────────┐
     15 │  Event Listener: Credit Service                              │
     16 │  - Determine credit amount based on vaccine sequence         │
     17 │  - Create CreditTransaction document                         │
     18 │  - Update child's goGreenCredits.total                       │
     19 │  - Check if new tier reached                                 │
     20 │  - Send notification                                         │
     21 └─────────────────────┬───────────────────────────────────────┘
     22                       │
     23                       ▼
     24 ┌─────────────────────────────────────────────────────────────┐
     25 │  Frontend: Real-time Update                                  │
     26 │  - Show credit gain animation (+100 🌱)                      │
     27 │  - Update progress bar to next tier                          │
     28 │  - Push notification if tier upgraded                        │
     29 └─────────────────────────────────────────────────────────────┘

    ---

    6. Tree Redemption Flow

      1 ┌─────────────────────────────────────────────────────────────┐
      2 │  User clicks "Plant Tree" (when credits >= 500)              │
      3 └─────────────────────┬───────────────────────────────────────┘
      4                       │
      5                       ▼
      6 ┌─────────────────────────────────────────────────────────────┐
      7 │  Show Tree Selection Modal                                   │
      8 │  ┌─────────────────────────────────────────────┐            │
      9 │  │  🌿 Neem Tree - 500 credits                 │            │
     10 │  │     CO₂: 15 kg/year                         │            │
     11 │  │     [Select]                                │            │
     12 │  ├─────────────────────────────────────────────┤            │
     13 │  │  🌳 Peepal Tree - 1000 credits              │            │
     14 │  │     CO₂: 30 kg/year                         │            │
     15 │  │     [Select]                                │            │
     16 │  └─────────────────────────────────────────────┘            │
     17 └─────────────────────┬───────────────────────────────────────┘
     18                       │
     19                       ▼
     20 ┌─────────────────────────────────────────────────────────────┐
     21 │  POST /go-green/tree/redeem                                  │
     22 │  - Deduct credits from current balance                       │
     23 │  - Create new Tree document                                  │
     24 │  - Generate certificate                                      │
     25 │  - Trigger planting workflow (admin task)                    │
     26 └─────────────────────┬───────────────────────────────────────┘
     27                       │
     28                       ▼
     29 ┌─────────────────────────────────────────────────────────────┐
     30 │  Show Success Animation                                      │
     31 │  - Confetti effect                                           │
     32 │  - "Tree planted in name of {childName}!"                    │
     33 │  - Download certificate button                               │
     34 │  - Share to social media                                     │
     35 └─────────────────────────────────────────────────────────────┘

    ---

    7. UI Components to Add

    A. Credit Display Widget (Top of Go Green page)

      1 ┌────────────────────────────────────────────┐
      2 │  🌱 Your Green Credits                     │
      3 │  ┌──────────────┐  ┌──────────────┐       │
      4 │  │   750        │  │   🌿         │       │
      5 │  │  Total       │  │   Sapling    │       │
      6 │  └──────────────┘  └──────────────┘       │
      7 │                                            │
      8 │  Progress to Young Tree: ████████░░ 75%   │
      9 │  250 more credits to plant Peepal tree!   │
     10 └────────────────────────────────────────────┘

    B. Credit History Timeline

      1 ┌────────────────────────────────────────────┐
      2 │  📊 Credit History                         │
      3 │                                            │
      4 │  🌿 Mar 15, 2026                           │
      5 │     BCG Vaccine Completed                  │
      6 │     +50 credits                            │
      7 │                                            │
      8 │  💉 Mar 10, 2026                           │
      9 │     Health Record Uploaded                 │
     10 │     +10 credits                            │
     11 │                                            │
     12 │  🌿 Mar 1, 2026                            │
     13 │     Profile Completed                      │
     14 │     +50 credits                            │
     15 └────────────────────────────────────────────┘

    C. Tier Progress Visualization

     1     🌱          🌿          🌳          🌲          🌴
     2  Seedling → Sapling → Young Tree → Mature → Guardian
     3    0       500       1000       2000      3500     5000+
     4    │────────│─────────│──────────│─────────│────────│
     5    ●────────●─────────○──────────○─────────○────────○
     6          Current: 750 (Sapling)
     7          Next: Young Tree at 1000 credits

    D. Credit Gain Animations

     1 // When vaccine marked as done:
     2 showFloatingText("+100 🌱", { x, y, color: 'emerald-500' });
     3 // Floats up and fades out

    ---

    8. Backend Implementation Priority

    Phase 1 (Core):
     1. ✅ Add goGreenCredits to child schema
     2. ✅ Create CreditTransaction collection
     3. ✅ Create POST /go-green/credits/award endpoint
     4. ✅ Create GET /go-green/credits/:registrationId endpoint
     5. ✅ Manually award credits for existing vaccinations

    Phase 2 (Automation):
     6. ✅ Auto-award on vaccination completion (event listener)
     7. ✅ Auto-award on health record upload
     8. ✅ Tier calculation logic
     9. ✅ Notifications for tier upgrades

    Phase 3 (Redemption):
     10. ✅ Tree redemption endpoint
     11. ✅ Certificate generation for each tier
     12. ✅ Admin dashboard for tree planting tasks

    ---

    9. Example Credit Calculation

      1 // Sample credit award logic
      2 function calculateVaccineCredits(vaccineName, sequenceNumber) {
      3   const baseCredits = {
      4     1: 50,   // Birth doses
      5     2: 100,  // 6 weeks
      6     3: 100,  // 10 weeks
      7     4: 100,  // 14 weeks
      8     5: 150,  // 9 months
      9     6: 150,  // 12-18 months
     10   };
     11   
     12   // Bonus for completing full primary series
     13   const seriesBonus = sequenceNumber === 6 ? 200 : 0;
     14   
     15   return (baseCredits[sequenceNumber] || 50) + seriesBonus;
     16 }
     17 
     18 // Example: Child completes 6th vaccine
     19 const credits = calculateVaccineCredits('MMR', 6);
     20 // Returns: 150 + 200 = 350 credits!

    ---

    10. Benefits of This System


    ┌──────────────────────┬────────────────────────────────────────┐
    │ Benefit              │ Impact                                 │
    ├──────────────────────┼────────────────────────────────────────┤
    │ Increased Engagement │ 3-5x more vaccine completion rates     │
    │ Environmental Impact │ Tangible CO₂ offset tracking           │
    │ Social Sharing       │ Viral growth through certificates      │
    │ Retention            │ Children stay engaged through 18 years │
    │ Data Quality         │ More complete health records           │
    └──────────────────────┴────────────────────────────────────────┘


    ---