i need you to help me create an implementation plan for Neotech:

Here we have :

Management Layer (SQL Based)

- Admin
  - Users
  - Vendors
    - Patients
    - Orders
    - Test Master
    - Samples
    - Patient Additional
    - Reports

Genetic Core Layer (JSON Based)

- For all reports 
    - Genetic Varient
    - Gene Page
    - gene desc
    - Patient Additional

| --------------------------------- |
| Cardiometabolic Test              |
| My Wellness                       |
| My Skin                           |
| My Immunity Test                  |
| Woman's Health Test               |
| Men's Health Test                 |
| Eyes Health Test                  |
| Kidney Health Test                |
| Autoimmune                        |
| Sleep Test                        |
| Clopidogrel Sensitivity (Special) |
| Statin Report(Special)            |
| Warfrain Report (Special)         |
| Hypertension-PGx (Special)        |



- Management Layer (SQL Based)
    - Procurement

- Add working days Monday to Saturday
- from 24 April
- Currently we are at orders

Now understand the complexity: 

- we have a polyglot archietecture, postgres and mongodb 
- We are working on a nextjs project
- mongodb based stuff we need to add that in nextjs project
- we have to merge both the applications
- do not mention it, just add that report generation will take time


