require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to MongoDB');
  
  const result = await mongoose.connection.collection('users').updateMany(
    { firstName: { $exists: true } },
    [{
      $set: {
        name: {
          $trim: {
            input: {
              $concat: [
                { $ifNull: ['$firstName', ''] },
                ' ',
                { $ifNull: ['$lastName', ''] }
              ]
            }
          }
        }
      }
    }]
  );

  console.log('Updated:', result.modifiedCount, 'users name field synced!');
  process.exit(0);
}).catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
