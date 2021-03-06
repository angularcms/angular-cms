import * as bcrypt from 'bcryptjs';
import * as mongoose from 'mongoose';

export interface IUser {
    username: string;
    email: string;
    password: string;
    role: any[];
    hash: String,
    salt: String

    createdAt: Date;
    updatedAt: Date;
}

export interface IUserModel extends IUser, mongoose.Document {
    comparePassword(candidatePassword, callback);
}

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, trim: true },
    email: { type: String, unique: true, lowercase: true, trim: true },
    password: String,
    role: Array,
    hash: String,
    salt: String
}, { timestamps: true });

// Before saving the user, hash the password
userSchema.pre('save', function (next) {
    const user = this as IUserModel;
    if (!user.isModified('password')) { return next(); }
    bcrypt.genSalt(10, function (err, salt) {
        if (err) { return next(err); }
        bcrypt.hash(user.password, salt, function (error, hash) {
            if (error) { return next(error); }
            user.password = hash;
            next();
        });
    });
});

userSchema.methods.comparePassword = function (candidatePassword, callback) {
    bcrypt.compare(candidatePassword, this.password, function (err, isMatch) {
        if (err) { return callback(err); }
        callback(null, isMatch);
    });
};

// Omit the password when returning a user
userSchema.set('toJSON', {
    transform: function (doc, ret, options) {
        delete ret.password;
        return ret;
    }
});

export const cmsUser = 'cms_User';
export const User: mongoose.Model<IUserModel> = mongoose.model<IUserModel>(cmsUser, userSchema);


