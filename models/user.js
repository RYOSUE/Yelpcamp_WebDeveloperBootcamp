const { attempt } = require('joi');
const mongoose = require('mongoose');
const {Schema} = mongoose;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    }
});

UserSchema.plugin(passportLocalMongoose, {
    errorMessages: {
        UserExistsError: 'このユーザー名はすでに使用されています。',
        MissingPasswordError: 'パスワードを入力してください。',
        AttemptTooSoonError: 'アカウントがロックされています、時間を置いて再度試してください。',
        TooManyAttemptsError: 'ログイン失敗が続いたため、アカウントをロックしました。しばらく時間を置いてから再度お試しください。',
        NoSaltValueStoredError: '認証ができませんでした。',
        IncorrectPasswordError: 'パスワードまたはユーザー名が間違っています。',
        IncorrectUsernameError: 'パスワードまたはユーザー名が間違っています。',
    }
});
module.exports = mongoose.model('User', UserSchema);