const cron = require('node-cron');
const otps = require('../model/otp');



cron.schedule('* * * * *',async () => {
  try{
    await otps.deleteMany({otp_expires:{$lt: new Date()}})
  }catch(error){
    console.log(error)
  }
})
