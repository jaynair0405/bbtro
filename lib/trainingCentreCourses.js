'use strict';
// Only user-confirmed MTC CLA rules. No numeric assessment thresholds are assumed.
module.exports = [
    {code:'MM_PROMOTION', legacy:'PROMOTION', name:'Motorman Promotion', days:48, handling:12, eligibility:'LPG; LPP moving to Motorman', syllabus:{transportation:12,technical:36}, renewals:[['MM_REFRESHER',36],['AUTOMATIC',6]]},
    {code:'MM_REFRESHER', legacy:'REFRESHER', name:'Motorman Refresher', days:18, eligibility:'Motormen', planning:true, renewals:[['MM_REFRESHER',36]]},
    {code:'AUTOMATIC', legacy:'ONE_DAY_INTENSIVE', name:'One-Day Automatic', days:1, eligibility:'Motormen', renewals:[['AUTOMATIC',6]]},
    {code:'MEMU_CONVERSION', legacy:'MEMU_INITIAL', name:'MEMU Conversion', days:10, eligibility:'Motormen', syllabus:{conventional:5,BT:3,Medha_BEML:2}, renewals:[['MEMU_REFRESHER',36]]},
    {code:'MEMU_REFRESHER', legacy:'MEMU_REFRESHER', name:'MEMU Refresher', days:7, eligibility:'Motormen', planning:true, syllabus:{conventional:4,BT:2,Medha_BEML:1}, renewals:[['MEMU_REFRESHER',36]]},
    {code:'TM_CONVERSION', name:'Train Manager Promotion/Conversion', days:15, eligibility:'Goods Train Managers', renewals:[['TM_REFRESHER',36]]},
    {code:'TM_REFRESHER', name:'Train Manager Refresher', days:4, eligibility:'Suburban Train Managers', renewals:[['TM_REFRESHER',36]]},
    {code:'LPS_CONVERSION', name:'LPS Conversion', days:10, eligibility:'Staff already designated Loco Pilot Shunter', renewals:[['LPS_REFRESHER',36]]},
    {code:'LPS_REFRESHER', name:'LPS Refresher', days:5, eligibility:'Staff already designated Loco Pilot Shunter', renewals:[['LPS_REFRESHER',36]]},
    {code:'MM_HARBOUR_MAIN', name:'Motorman Harbour-to-Main-Line Conversion', days:5, eligibility:'Motormen moving from Harbour to Main Line', renewals:[]},
    {code:'CLI_CONVERSION', name:'CLI Conversion', days:12, eligibility:'Staff already designated CLI', renewals:[]}
];
