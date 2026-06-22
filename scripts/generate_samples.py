#!/usr/bin/env python
"""Generate sample industrial documents"""

import os
import sys
import json
from pathlib import Path

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import Config

print("📄 Generating sample industrial documents...")
print("="*60)

# Sample documents
sample_docs = {
    'pump_maintenance_log.txt': """PUMP-A23 MAINTENANCE LOG
Equipment: Centrifugal Pump A23
Model: Flowserve 3x2-10
Serial: FS-2024-0145

Maintenance History:
- 2024-01-15: Preventive maintenance performed
  - Oil change completed
  - Bearing inspection: Normal condition
  - Seal replacement: Standard procedure SOP-PM-001
  - Pressure reading: 45 bar
  - Temperature reading: 65°C
  
- 2024-02-20: Repair - Seal failure
  - Root cause: Thermal degradation
  - Part replaced: Mechanical seal assembly
  - Downtime: 4 hours
  - Cost: Rs. 25,000
  
- 2024-03-10: Inspection
  - Vibration analysis: Normal
  - Thermal imaging: 62°C
  - Compliance: OISD-119 requirements met

Next scheduled maintenance: 2024-04-15
Maintenance Procedure: SOP-PM-001 (Centrifugal Pump Preventive Maintenance)
""",
    
    'heat_exchanger_sop.txt': """STANDARD OPERATING PROCEDURE
SOP-HX-001: Heat Exchanger Operation and Maintenance

Equipment: Shell & Tube Heat Exchanger HX-01
Manufacturer: Alfa Laval
Model: AlfaCond 600
Design Pressure: 10 bar
Design Temperature: 100°C

Operating Parameters:
- Inlet Pressure: 5-8 bar
- Outlet Pressure: 3-5 bar
- Inlet Temperature: 80-90°C
- Outlet Temperature: 50-60°C
- Flow Rate: 50-80 m³/h

Maintenance Schedule:
- Daily: Visual inspection, pressure check
- Weekly: Temperature recording, pressure recording
- Monthly: Cleaning cycle, performance analysis
- Quarterly (PESO compliance): Full inspection
- Annually: Complete overhaul, testing

Regulatory Compliance:
- OISD-118: Piping Code
- PESO (Petroleum Exploration & Production Rules)
- BIS Standards for Heat Exchangers
- Factory Act: Safety inspection requirements

Emergency Procedures:
- High pressure alarm: Reduce inlet flow immediately
- Temperature spike: Increase cooling water flow
- Shutdown: Follow emergency shutdown checklist
""",
    
    'safety_bulletin.txt': """SAFETY BULLETIN - EQUIPMENT FAILURE INCIDENT
Date: 2024-02-15
Incident ID: INC-2024-045
Severity: HIGH

Incident Summary:
Compressor COM-03 failed due to lubrication system malfunction, causing bearing seizure and equipment shutdown.

Root Cause Analysis:
1. Lubrication pump pressure drop (30 psi → 15 psi) not detected
2. Pressure gauge reading not verified for 3 weeks
3. Scheduled PM skipped due to production pressure
4. Alarm system not set to alert on pressure threshold

Lessons Learned:
- MANDATORY: Daily gauge verification for critical equipment
- MANDATORY: Never skip preventive maintenance
- ACTION: Install automated pressure alarm (Regulation: OISD-135)
- ACTION: Increase PM frequency for compression systems

Affected Equipment:
- Compressor COM-03 (Primary)
- Pressure Relief Valve PRV-05 (Secondary)
- Filter Assembly FLT-08 (Related)

Required Action:
- Re-certify all operators (Training SOP-TRN-12)
- Inspect similar compressors at Plants B and C
- Update Maintenance Procedure SOP-CM-001

Deadline: 2024-03-15
""",
    
    'inspection_report.csv': """Equipment_ID,Inspection_Date,Inspector_Name,Status,Pressure_Bar,Temperature_C,Notes,Compliance_Standard
PUMP-A23,2024-03-10,John Smith,PASS,45,65,Normal operation,OISD-119
HX-01,2024-03-12,Sarah Johnson,PASS,8,85,Shell side needs cleaning,OISD-118
COM-03,2024-03-08,Mike Brown,FAIL,20,95,Lubrication issue - urgent,OISD-135
TANK-01,2024-03-15,Emma Wilson,PASS,0,35,Storage tank clean,Factory Act
VLV-04,2024-03-14,David Lee,PASS,5,40,Valve operating smoothly,BIS-Standards
FLT-08,2024-03-11,Anna Garcia,PASS,2,45,Filter element replaced,OISD-140
""",
    
    'equipment_specs.txt': """EQUIPMENT SPECIFICATION DATABASE

Equipment: Centrifugal Pump PUMP-A23
Manufacturer: Flowserve
Model: 3x2-10
Serial Number: FS-2024-0145
Capacity: 100 m³/h
Pressure Rating: 10 bar (Class 300)
Temperature Rating: 120°C
Material: Carbon Steel with SS internals
Sealing Type: Mechanical seal
Motor Power: 15 kW
RPM: 1800

Equipment: Heat Exchanger HX-01
Manufacturer: Alfa Laval
Model: AlfaCond 600
Type: Shell & Tube
Area: 150 m²
Design Pressure: 10 bar / 5 bar
Design Temperature: 100°C / 60°C
Tubes: 316 SS
Shell: Carbon Steel
Connection Size: DN80

Equipment: Air Compressor COM-03
Manufacturer: Atlas Copco
Model: ZR series 90 kW
Type: Rotary Screw
Displacement: 450 m³/h
Discharge Pressure: 8 bar
Temperature Control: Oil injected
Lubrication System: Integrated oil system
Cooling: Air-oil cooler
""",
    
    'compliance_checklist.txt': """REGULATORY COMPLIANCE CHECKLIST - Q1 2024

Factory Act Compliance:
☑ Fire extinguishers installed and tested (Req: Annual)
☑ Emergency exits marked and clear (Req: Continuous)
☑ Guarding on moving parts adequate (Req: Continuous)
☑ Pressure relief devices functional (Req: Quarterly)
☑ Safety data sheets available (Req: Continuous)
✗ MISSING: Annual safety training records for 5 operators (Due: 2024-03-20)

OISD-119 (Pump Standards):
☑ Pump inspected quarterly
☑ Vibration analysis performed
☑ Seal condition acceptable
✗ OVERDUE: Flow calibration (Last: 2023-10-20, Due: 2024-01-20)

OISD-135 (Compressor Safety):
☑ Lubrication system inspected
☑ Pressure relief valve tested
☑ Cooling system operating
✗ CRITICAL: Pressure alarm not functioning (Detected: 2024-02-15)

PESO (Petroleum Rules):
☑ Equipment tags and labels present
☑ Inspection certificates available
✗ PENDING: Certificate renewal for COM-03 (Exp: 2024-04-30)

BIS Standards:
☑ Heat exchanger design meets BIS-3000
☑ Material certification available
✗ ACTION NEEDED: Recertification after recent modification

Non-conformances Identified: 5
Deadline for Closure: 2024-04-15
Auditor: External compliance firm XYZ
"""
}

# Create sample documents
os.makedirs(Config.DOCUMENTS_DIR, exist_ok=True)

for filename, content in sample_docs.items():
    filepath = os.path.join(Config.DOCUMENTS_DIR, filename)
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"✓ Created: {filename}")

print(f"\n✅ Generated {len(sample_docs)} sample documents")
print(f"📂 Location: {Config.DOCUMENTS_DIR}")
print("\nNext: Run 'python scripts/ingest_documents.py' to process them")
