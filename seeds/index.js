const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities'); // cities.jsから都市データを引っ張る
const { places, descriptors } = require('./seedHelpers'); // seedHelpers.jsからプレースとデスクリプターを引っ張る

// モデルの定義とデータベース接続
mongoose.connect('mongodb://localhost:27017/yelp-camp',
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log('MongoDBコネクションOK !');
    })
    .catch(err => {
        console.error('MongoDBコネクションエラー:', err);
    });

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 50; i++) {
        const randomCityIndex = Math.floor(Math.random() * cities.length);
        const price = Math.floor(Math.random() * 2000 + 1000);
        const camp = new Campground({
            author: '685b7e86659d7e443841eac2', // username = 'admin', email: 'admin@example.com', password = 'admin'
            location: `${cities[randomCityIndex].prefecture} ${cities[randomCityIndex].city}`,
            title: `${sample(descriptors)}・${sample(places)}`,
            description: '木曾路はすべて山の中である。あるところは岨づたいに行く崖の道であり、あるところは数十間の深さに臨む木曾川の岸であり、あるところは山の尾をめぐる谷の入り口である。一筋の街道はこの深い森林地帯を貫いていた。東ざかいの桜沢から、西の十曲峠まで、木曾十一宿はこの街道に添うて、二十二里余にわたる長い谿谷の間に散在していた。道路の位置も幾たびか改まったもので、古道はいつのまにか深い山間に埋もれた。',
            price: price,
            images: [
                {
                    url: 'https://res.cloudinary.com/dwtosp4m1/image/upload/v1751005723/YelpCamp/cbwvf197xfcbxaniijxa.jpg',
                    filename: 'YelpCamp/cbwvf197xfcbxaniijxa'
                },
                {
                    url: 'https://res.cloudinary.com/dwtosp4m1/image/upload/v1751005723/YelpCamp/yop9brknft3aqyr3jmll.jpg',
                    filename: 'YelpCamp/yop9brknft3aqyr3jmll'
                },
                {
                    url: 'https://res.cloudinary.com/dwtosp4m1/image/upload/v1751005724/YelpCamp/ndwqoyblevepfgjc4e7r.jpg',
                    filename: 'YelpCamp/ndwqoyblevepfgjc4e7r'
                }
            ]
        });
        await camp.save();
    }
};

seedDB()
    .then(() => {
        mongoose.connection.close();
        console.log('データベースのシードが完了しました。接続を閉じます。');
    });