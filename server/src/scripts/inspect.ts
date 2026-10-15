import mongoose from 'mongoose';

const uri = process.env.MONGO_URI;
if (!uri) { console.error('нет MONGO_URI'); process.exit(1); }

await mongoose.connect(uri, { serverSelectionTimeoutMS: 10_000 });
const db = mongoose.connection;

const applied = await db.collection('_migrations').find().toArray();
console.log('применённые миграции:', applied.length ? applied.map((m) => m._id).join(', ') : 'нет ни одной');

const cats = db.collection('categories');
console.log('категорий всего:', await cats.countDocuments());
console.log('  со старым полем color:', await cats.countDocuments({ color: { $exists: true } }));
console.log('  без поля ink:', await cats.countDocuments({ ink: { $exists: false } }));

const tx = db.collection('transactions');
console.log('транзакций всего:', await tx.countDocuments());
console.log('  с дробной суммой (рубли v1):', await tx.countDocuments({ $expr: { $ne: ['$amount', { $trunc: '$amount' }] } }));
console.log('  с полем transfer (записаны сервером v2):', await tx.countDocuments({ transfer: { $exists: true } }));

const sample = await tx.find({}, { projection: { amount: 1, date: 1 } }).sort({ _id: -1 }).limit(5).toArray();
console.log('последние 5 сумм:', sample.map((t) => t.amount).join(', '));

await mongoose.connection.close(false);