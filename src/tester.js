const snsHelper = require('./snsHelper.js');

snsHelper.sendMessage('Hello there',function(){
  console.log('callback')
})
