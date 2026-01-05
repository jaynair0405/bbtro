require('dotenv').config();                                                                
  const mysql = require('mysql2/promise');                                                   
                                                                                             
  async function test() {                                                                    
    console.log('Testing MySQL connection...');                                              
    console.log('Host:', process.env.DB_HOST);                                               
    console.log('User:', process.env.DB_USER);                                               
    console.log('Database:', process.env.DB_NAME);                                           
    console.log('');                                                                         
                                                                                             
    try {                                                                                    
      const conn = await mysql.createConnection({                                            
        host: process.env.DB_HOST,                                                           
        user: process.env.DB_USER,                                                           
        password: process.env.DB_PASSWORD,                                                   
        database: process.env.DB_NAME                                                        
      });                                                                                    
                                                                                             
      console.log('✓ MySQL connected successfully!');                                        
      console.log('');                                                                       
                                                                                             
      console.log('Testing sessions table...');                                              
      const [rows] = await conn.query('SELECT COUNT(*) as count FROM sessions');             
      console.log('✓ Sessions table accessible');                                            
      console.log('Current session count:', rows[0].count);                                  
                                                                                             
      await conn.end();                                                                      
    } catch (err) {                                                                          
      console.error('✗ Connection failed!');                                                 
      console.error('Error:', err.message);                                                  
    }                                                                                        
  }                                                                                          
                                                                                             
  test();                 