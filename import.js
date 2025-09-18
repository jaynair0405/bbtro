require('dotenv').config();

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const mysql = require('mysql2');

// MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});
const scheduleToDetailMap = {}; // scheduleId → detailId

function importDetails(filePath) {
  return new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        const sql = `
          INSERT INTO details 
          (detail_id, detail_number, line, sign_on_time, sign_on_place, sign_off_time, sign_off_place, 
           total_duty_hours, total_wheel_movement, total_piloting)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
          row.detailId,
          row.detailNumber,
          row.line,
          row.signOnTime,
          row.signOnPlace,
          row.signOffTime,
          row.signOffPlace,
          row.totalDutyHours,
          row.totalWheelMovement,
          row.totalPiloting
        ];

        // Map scheduleId → detailId for train linking
        if (row.scheduleId && row.detailId) {
          scheduleToDetailMap[row.scheduleId] = row.detailId;
        }

        connection.query(sql, values);
      })
      .on('end', () => {
        console.log(`✅ Imported: ${filePath}`);
        resolve();
      });
  });
}

function importTrains(filePath) {
    return new Promise((resolve) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          const scheduleId = row.scheduleId || '';
          const detailId = scheduleId.replace(/-\d+$/, '');  // extract base detail ID
  
          const sql = `
            INSERT INTO trains 
            (detail_id, line, train_number, start_station, start_time, end_station, end_time, status, remarks)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;
  
          const values = [
            detailId,
            row.line,
            row.trainNumber,
            row.startStation,
            row.startTime,
            row.endStation,
            row.endTime,
            row.status,
            row.remarks
          ];
  
          connection.query(sql, values);
        })
        .on('end', () => {
          console.log(`✅ Imported: ${filePath}`);
          resolve();
        });
    });
  }
  

async function runImports() {
  // Update paths based on your folder structure
  await importDetails('./csv/HB87_details.csv');
  await importDetails('./csv/ML89A_details.csv');

  await importTrains('./csv/HB87_trains.csv');
  await importTrains('./csv/ML89A_trains.csv');

  connection.end();
}

runImports();

