# Neotech Project Implementation Plan

**Start Date**: 24 April 2026 | Working Days: Monday to Saturday | Total Duration: 11 Days

## Project Architecture Overview

### Dual Layer System

| Layer              | Technology | Modules                                                                                                          |
| ------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------- |
| Management Layer   | PostgreSQL | Admin, Users, Vendors, Patients, Orders, Test Master, Samples, Procurement, Reports Management                   |
| Genetic Core Layer | MongoDB    | Genetic Variant Database, Gene Reference Pages, Gene Descriptions, Patient Additional Data, All Report Templates |

## 📅 Full Timeline With Exact Dates (2026 CALENDAR VERIFIED ✅)

### Week 1: Foundation & Core Systems

| Date     | Day       | Module         | Milestone                                                            | Status    |
| -------- | --------- | -------------- | -------------------------------------------------------------------- | --------- |
| 24 April | Friday    | Orders Final   | Orders, Samples flow fully operational                               | ✅ Done    |
| 25 April | Saturday  | Admin Base     | Users, Vendors, Roles, Permissions                                   | ✅ Done    |
| 26 April | **Sunday**  | OFF            | Rest Day                                                             | ✅ Rest    |
| 27 April | Monday    | Patient System | Patient Additional data sync layer                                   | ⬜ Planned |
| 28 April | **Tuesday** | Report Engine  | Universal report engine, PDF pipeline, MongoDB integration completed | ⬜ Planned |
| 29 April | Wednesday | Procurement    | Basic stock management implemented                                   | ⬜ Planned |

### Report Implementation (4 Days Exactly)

| Date     | Day       | Batch       | Reports Completed                                              | Daily Total   | Status    |
| -------- | --------- | ----------- | -------------------------------------------------------------- | ------------- | --------- |
| 30 April | Thursday  | Priority 1  | Cardiometabolic Test, My Wellness, Woman's Health Test         | **3 Reports** | ⬜ Planned |
| 1 May    | Friday    | Priority 2  | Men's Health, My Skin, My Immunity, Eyes Health, Kidney Health | **5 Reports** | ⬜ Planned |
| 2 May    | Saturday  | Standard    | Autoimmune, Sleep Test                                         | **2 Reports** | ⬜ Planned |
| 3 May    | **Sunday**  | OFF         | Rest Day                                                             | ✅ Rest    |
| 4 May    | Monday    | Special PGx | Clopidogrel, Statin, Warfarin, Hypertension-PGx                | **4 Reports** | ⬜ Planned |

✅ **MILESTONE 4 May 2026**: ALL 13 REPORTS IMPLEMENTED ✅

> Note: Report generation will take time for each patient due to genetic variant analysis, this is expected behaviour.

### Final Stabilization Week

| Date  | Day       | Task                                                        | Status    |
| ----- | --------- | ----------------------------------------------------------- | --------- |
| 5 May | Tuesday   | End to End testing, cross module integration                | ⬜ Planned |
| 6 May | Wednesday | Bug fixes, accuracy validation, performance optimizations   | ⬜ Planned |
| 7 May | Thursday  | Working days calendar implementation, final UAT preparation | ⬜ Planned |
| 8 May | Friday    | Production deployment, go-live                              | ⬜ Planned |

## 🎯 Final Deadlines

| Item                      | Delivery Date |
| ------------------------- | ------------- |
| Management Layer Complete | 29 April      |
| All 13 Reports Working    | 4 May         |
| Full System Ready         | 7 May         |
| Production Go-Live        | 8 May         |

## 🔧 Technical Implementation Guidelines

1. **Next.js Project Structure**

   * Management layer components will use Drizzle ORM with PostgreSQL

   * Genetic core modules will use Mongoose with MongoDB inside same Next.js project

   * Unified API layer with proper boundary separation between both databases

   * No external microservices required, all logic will live within single Next.js application

2. **Data Flow Pattern**

```text
Order Created → Sample Received → Genetic Data Upload → Variant Processing → Report Generation → Final Report Delivery
```

1. **Critical Constraints**

   * All dates calculations will follow Mon-Sat working days only

   * Report generation jobs will be queued as background processes

   * Genetic data will never be stored in PostgreSQL

   * Patient identifiers will be synchronized across both databases

## ✅ Test Types Inventory

Total 13 Report Types:

1. Cardiometabolic Test

2. My Wellness

3. My Skin

4. My Immunity Test

5. Woman's Health Test

6. Men's Health Test

7. Eyes Health Test

8. Kidney Health Test

9. Autoimmune

10. Sleep Test

11. Clopidogrel Sensitivity (Special)

12. Statin Report (Special)

13. Warfarin Report (Special)

14. Hypertension-PGx (Special)

## 📊 Dependencies & Risks

| Risk                          | Mitigation                                       |
| ----------------------------- | ------------------------------------------------ |
| Report generation performance | Implement incremental generation + caching       |
| Database synchronization      | Event based triggers with retry mechanism        |
| Data accuracy                 | Double validation layer for all genetic mappings |
| Legacy data migration         | Phased migration with rollback points            |

*Last Updated: 28 April 2026 | ✅ 28 April = TUESDAY CALENDAR VERIFIED