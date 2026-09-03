/* Approved VVH v1 digital checklists.  The template/version is stored with
 * every inspection, so a later approved amendment never changes history. */
const forms = {
  GC: {
    version: 'VVH-2025-08', title: 'General Checking of Locos',
    items: [
      ['General','1','Check loco log book for defect entries made by crew.','Check crew defect entries'],
      ['General','2','Check fault messages on DDS.','Check fault messages'],
      ['General','3','Check safety items: headlight, flasher, marker, horn, wipers, SPM, VCD, fire extinguisher, wedges, safety clamp and cab/gauge lights.','All safety items working and available'],
      ['General','4','Check for air leakage in HT compartment, machine room, pneumatic panel and undergear.','No air leakage'],
      ['General','5','Test BP/FP/MR generation and A-9/SA-9 pressures in the working cab.','Pressures normal'],
      ['General','6','Check brake power at 80% continuous current; adjust if required.','Loco must not move'],
      ['General','7','Check GR, TFP and SR oil level and leakage from equipment, conservator, radiator and pumps.','Level normal; no leakage'],
      ['General','8','Check pantograph raising and lowering from both cabs.','Working'],
      ['General','9','Carry out HT test.','Normal'],
      ['General','10','Check AUX machines and abnormal sound.','Normal'],
      ['General','11','Check both HLC.','Working'],
      ['General','12','Check cab AC and heaters in both cabs.','Working'],
      ['Side Gear','13','Check buffers for crack/damage and foundation bolt tightness.','Intact'],
      ['Side Gear','14','Ensure nut-bolts, cattle guard and rail guard locking bolts are intact.','Intact'],
      ['Side Gear','15','Check dampers and foundation-bracket nut-bolts.','Intact'],
      ['Side Gear','16','Check wheel-set guide rods for crack/damage.','No crack/damage'],
      ['Side Gear','17','For WAP-4: inspect bogie frame, brake rigging, brake hangers, trunnion assembly and safety straps.','No crack/damage'],
      ['Side Gear','18','Check primary and secondary springs for cracks.','No crack'],
      ['Side Gear','19','Check battery-box foundation bracket and nut-bolts.','Intact'],
      ['Side Gear','20','Check axle boxes, liners, equalizer beam, safety brackets and cotter pins.','Intact'],
      ['Side Gear','21','Check sand-box security and working of sanders.','Working'],
      ['Side Gear','22','Visually check side bearers.','Normal'],
      ['Side Gear','23','Measure CBC height from rail level.','Record reading'],
      ['Side Gear','24','Ensure opening/closing of CBC on both sides.','Working'],
      ['Side Gear','25','Check CBC yoke-pin locking bolts.','Intact'],
      ['Under Gear','26','Check traction-link assembly, rings, TBU/PBU, brake disc, axle guide rod and spheriblocs for damage/cracks.','Intact'],
      ['Under Gear','27','Check traction motor cover bolts, MSU bolt, safety sling, torque arms and holder-plate bolts.','Intact'],
      ['Under Gear','28','Check gear-case oil level/leakage and gear-case bolt tightness.','Normal; no leakage'],
      ['Under Gear','29','Ensure safety slings are available at compressors and traction motors.','Available'],
      ['Under Gear','30','Check hanging-compressor legs, weld cracks, nut-bolts and 3-phase safety sling.','Intact'],
      ['Under Gear','31','Check air-dryer mounting plate and nut-bolts.','Intact'],
      ['Under Gear','32','Check TM mounting, lugs, sandwich assembly, split pins and cracks.','Intact'],
      ['Under Gear','33','Check MR tank/SL foundation, supporting brackets and nut-bolts.','Intact']
    ]
  },
  TI_CONVENTIONAL: {
    version: 'VVH-PENDING-PROFORMA', title: 'Conventional Loco Trip Inspection',
    items: [
      ['Trip inspection','1','Check crew log-book, DDS messages and reported defects.','Checked'],
      ['Trip inspection','2','Check safety equipment, lights, horn, wipers, VCD/SPM and fire extinguisher.','Working/available'],
      ['Pneumatic','3','Check BP, FP, MR, BC and brake application/release.','Normal'],
      ['Roof/HT','4','Check pantograph operation, HT equipment and visible roof defects.','Normal'],
      ['Bogie/undergear','5','Check brake rigging, springs, axle boxes, gears and oil leakage.','Intact/no leakage'],
      ['Running gear','6','Check wheel condition, guide rods and safety brackets.','Normal'],
      ['Cab','7','Check cab instruments, cab lights, gauges and crew safety facilities.','Working'],
      ['Completion','8','Record defects attended, deferred or advised to home shed.','Record action']
    ]
  },
  TI_3PHASE: {
    version: 'VVH-2025-08', title: 'Trip Inspection Proforma for 3-Phase Locos',
    items: [
      ['General','i','Check driver booking in log book and notify TLC where booking exists.','Checked'],
      ['General','ii','Check DDS logging for one round trip.','Checked'],
      ['General','iii','Check loco body structure for damage.','No damage'],
      ['Rail guard & cattle guard','i','Check and adjust rail-guard height.','105 to 120 mm'],
      ['Rail guard & cattle guard','ii','Check cattle-guard nut-bolt tightness and crack/gap.','Intact'],
      ['Driver seat','i','Check driver-seat looseness, squareness and cracks; repair defects.','Intact'],
      ['Driver desk','i','Ensure transparent rubber caps on push buttons.','Fitted'],
      ['Driver desk','ii','Check cleanliness/working of switches, lamps and gauges.','Normal'],
      ['Driver desk','iii','Verify BP, FP, MR, BC, AFI and U-meter gauge readings.','Normal'],
      ['Driver desk','iv','Check emergency push button switch.','Working'],
      ['Cab climate','i','Check cab heater/blower, cooler fan and AC.','Working'],
      ['Speedometer','i','Record date, time, kilometre, memory condition and display/connections.','Checked'],
      ['Safety items','i','Verify wooden wedges, fire extinguishers, LV board, safety clamp and spare BP/FP hoses.','Available'],
      ['Doors & footsteps','i','Check door locks, machine-room doors and footsteps.','Working/intact'],
      ['Roof equipment','i','Inspect roof equipment, insulators and foreign materials.','Clean/intact'],
      ['Bogie frame & brake gear','i','Check brake rigging, hangers, pull rods, brake blocks and safety slings.','Normal'],
      ['Wheel set & axle box','i','Check wheel cracks/skidding and measure flange, root and tread wear.','Flange <3 mm; root <6 mm; tread <6.5 mm'],
      ['Temperature','i','Check axle, MSU and TM bearing temperatures.','Not over ambient +27 C'],
      ['Brake power','i','Apply brake and verify brake power/piston stroke.','WAP-7/WAG-9: 107 to 117 mm'],
      ['Completion','i','Record attention given, defects carried forward and fitness decision.','Record action']
    ]
  }
};

async function ensureTripShedTemplates(conn) {
  for (const [type, form] of Object.entries(forms)) {
    await conn.execute(
      `INSERT INTO div_trip_inspection_templates (inspection_type, version_no, title, enabled, entry_enabled)
       VALUES (?, ?, ?, 1, 1) ON DUPLICATE KEY UPDATE title=VALUES(title)`,
      [type, form.version, form.title]
    );
    const [[template]] = await conn.execute(
      'SELECT id FROM div_trip_inspection_templates WHERE inspection_type=? AND version_no=?', [type, form.version]
    );
    const [[count]] = await conn.execute(
      'SELECT COUNT(*) AS n FROM div_trip_inspection_template_items WHERE template_id=?', [template.id]
    );
    if (count.n) continue;
    for (let i = 0; i < form.items.length; i += 1) {
      const [section, itemNo, labelEn, standard] = form.items[i];
      await conn.execute(
        `INSERT INTO div_trip_inspection_template_items
           (template_id, section_name, item_no, label_en, standard_value, sort_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [template.id, section, itemNo, labelEn, standard, i + 1]
      );
    }
  }
}

module.exports = { ensureTripShedTemplates };
