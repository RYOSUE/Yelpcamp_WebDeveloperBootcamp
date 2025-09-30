// NODE_ENVは環境変数で、production, development, testなどの環境を示す
// 開発環境ではdotenvパッケージを使って.envファイルから環境変数を読み込む
// 本番環境ではdotenvは不要なので、if文でNODE_ENVがproductionでない場合にのみdotenvを読み込む
// dotenvパッケージは、環境変数を定義するための便利な方法で、.envファイルに定義された変数をprocess.envに読み込む
// これにより、アプリケーションの設定や機密情報をコードから分離し、環境ごとに異なる設定を簡単に管理できるようになります
// 例えば、データベースの接続情報やAPIキーなどを.envファイルに定義し、アプリケーションコードではprocess.envを通じてそれらの値を参照することができます
// これにより、コードを変更せずに環境ごとに異なる設定を適用できるため、開発やデプロイが容易になります
if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
};

const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const ExpressError = require('./utils/ExpressError');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport')
const LocalStrategy = require('passport-local');
const User = require('./models/user');
// const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const user = require('./models/user');
// const { secureHeapUsed } = require('crypto');


// モデルの定義とデータベース接続
mongoose.connect('mongodb://localhost:27017/yelp-camp',
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false })
    .then(() => {
        console.log('MongoDBコネクションOK !');
    })
    .catch(err => {
        console.error('MongoDBコネクションエラー:', err);
    });

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
    replaceWith: '_',
}));

const sessionConfig = {
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // クライアントサイドのJavaScriptからcookieにアクセスできないようにする
        // secure: true,   // HTTPSを使用している場合はtrueに設定する
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1週間
    }
};
app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

app.get('/', (req, res) => {
    res.render('home');
});

app.use('/', userRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.all('*', (req, res, next) => {  // '*'ルーティングはexpress 4.X系で動作確認済み, express 5.X系では未サポート?
    next(new ExpressError('ページが見つかりませんでした', 404));
});
// ↑'localhost:3000/abc'のような存在しないページにアクセスしたときに発火する
// 'localhost:3000/campgrounds/abc'のような存在しないページにアクセスしたときは、
// catchAsyncでエラーをキャッチしているので、ExpressErrorは発火しない

app.use((err, req, res, next) => {
    const { statusCode = 500, message = '予期せぬ問題が発生しました' } = err;
    if (!err.message) {
        err.message = '予期せぬ問題が発生しました';
    };
    res.status(statusCode).render('error', { err });
})

app.listen(3000, () => {
    console.log('ポート3000でリクエストを待ち受け中...');
});