const HandleError = require('../utils/HandleError');
const { sendEmail } = require('../utils/SendEmail');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const User = require('../models/user.model');
const EmailToken = require('../models/emailToken.model');
const PasswordToken = require('../models/passwordToken.model');
const jwt = require('jsonwebtoken');
const cron = require('node-cron');
const mongoose = require('mongoose');

// Helper function to capitalize a string
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1)

module.exports.Register =  async (req, res, next) => {
    try{
        const first_name = capitalize(req.body.first_name.trim());
        const last_name = capitalize(req.body.last_name.trim());
        const email = req.body.email.trim().toLowerCase();
        const password = req.body.password.trim();
        const confirmPassword = req.body.confirmPassword.trim();
        const gender = capitalize(req.body.gender.trim()) || null;
        // Patterns
        const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        const full_name_Pattern = /^[A-Za-z\s]+$/u
        if (!full_name_Pattern.test(first_name) || !full_name_Pattern.test(last_name)) {
            throw new HandleError(`Only characters are allowed in first/last name.`, 400);
        }
        if (!emailPattern.test(email)) throw new HandleError(`Invalid email address.`, 400);
        if (password.length < 6) throw new HandleError(`Password must be at least 6 characters.`, 400);
        if (password !== confirmPassword) throw new HandleError(`Password and confirm password must match.`, 400);
        
        const emailUsedBefore = await User.findOne({ email })
        if(emailUsedBefore) throw new HandleError(`Email already used by another user`, 400);
        
        // Hash password
        const saltRounds = 10
        const hashedPass = await bcrypt.hash(password, saltRounds)
        const newUser = new User({
            first_name,
            last_name,
            email,
            password: hashedPass,
            gender,
        }).save()
        .then(async (user) => {
            // generate a random token and hash it for DB 
            const verifyToken = crypto.randomBytes(32).toString("hex");
            const hashedToken = await bcrypt.hash(verifyToken, 10)
            const token = await new EmailToken({
                userId: user._id,
                token: hashedToken,
            }).save();
            // send email to the user
            const url = `${process.env.BASE_URL}/verify-email/${user.id}/${verifyToken}`;
            await sendEmail(user.email, "Verify Your Email Address", `
            <p>Dear User,</p>
            <p>Thank you for registering. To complete your registration and activate your account, please verify your email address by clicking the link below:</p>
            <p><a href="${url}">Verify Your Email</a></p>
            <p><i>Note: This link will expire in 1 hour.</i></p>
            <p>If you didn't sign up for [Your Company Name], please disregard this email. Your account will not be activated until you verify your email.</p>
            <p>If you have any questions or need assistance, please don't hesitate to contact our support team at <a href="mailto:support@example.com">support@example.com</a>.</p>
            <p>Best regards,<br>[Your Company Name] Team</p>
            `);
            res.status(200).json({success: true, message: 'Registration successful! An email has been sent to verify your email address. Please check your inbox (including the spam folder) to complete the registration process.'});
        })
    }catch(e){
        console.log(e);
        next(e)
    }
}
module.exports.Login = async (req, res, next) => {
    try{
        const email = req.body.email.trim().toLowerCase();
        const Password = req.body.password.trim();
        // Patterns
        const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        // validation
        if (!emailPattern.test(email)) throw new HandleError(`Invalid email address.`, 400);
        if(Password.length < 6) throw new HandleError(`Password must be at least 6 characters.`, 400);
        // search for user to login
        const user = await User.findOne({email})
        if(!user) throw new HandleError(`The email you entered does not exist in our system.`, 401);
        // compare password to hashed password in database
        const match = await bcrypt.compare(Password, user.password)
        if(!match) throw new HandleError(`The email or password you entered is incorrect.`, 401);
        // verify email
        if(!user.isVerified) {
            let token = await EmailToken.findOne({ userId: user._id });
			if (!token) {
                const verifyToken = crypto.randomBytes(32).toString("hex");
                const hashedToken = await bcrypt.hash(verifyToken, 10)
				token = await new EmailToken({
					userId: user._id,
					token: hashedToken,
				}).save();
                // send email to the user
                const url = `${process.env.BASE_URL}/verify-email/${user.id}/${verifyToken}`;
                await sendEmail(user.email, "Verify Your Email Address", `
                <p>Dear User,</p>
                <p>Thank you for registering. To complete your registration and activate your account, please verify your email address by clicking the link below:</p>
                <p><a href="${url}">Verify Your Email</a></p>
                <p><i>Note: This link will expire in 1 hour.</i></p>
                <p>If you didn't sign up for [Your Company Name], please disregard this email. Your account will not be activated and will be deleted until you verify your email.</p>
                <p>If you didn't sign up for [Your Company Name], please disregard this email. Your account will not be activated and will be deleted until you verify your email.</p>
                <p>If you have any questions or need assistance, please don't hesitate to contact our support team at <a href="mailto:support@example.com">support@example.com</a>.</p>
                <p>Best regards,<br>[Your Company Name] Team</p>
              `);
                throw new HandleError(`Please verify your email. A verification link has been sent to your registered email address.`, 403)
			}
            throw new HandleError(`Please verify your email.`, 403)
        }
        // login successful
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        const expiryDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
        const { password, ...userData } = user.toObject();
        res.cookie('c_user', user._id.toString(), { expires: expiryDate });
        res.cookie('access_token', token, { httpOnly: true, expires: expiryDate }).status(200).json({...userData, token});
    }catch(e){
        next(e)
    }
}
module.exports.forgotPassword = async (req, res, next) => {
    try{
        const email = req.body.email.trim().toLowerCase();
         // Patterns
        const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        if (!emailPattern.test(email)) throw new HandleError(`Invalid email address.`, 400);
        // search for user to login
        const user = await User.findOne({email})
        if(!user) throw new HandleError(`The email you entered does not exist in our system.`, 401);
        // delete all previous tokens before initializing new one
        await PasswordToken.deleteMany({ userId: user._id});
        // generate new token
        const NewPasswordToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = await bcrypt.hash(NewPasswordToken, 10);
        const token = await new PasswordToken({
            userId: user._id,
            token: hashedToken,
        }).save();
        // send email to user
        const url = `${process.env.BASE_URL}/reset-password/${user._id}/${NewPasswordToken}`
        const emailSent = await sendEmail(user.email, 'Forgot your password', `
        <p>Dear User,</p>
        <p>We have received a request to reset your password. To complete the password reset process, please follow the instructions below:</p>
        <ol>
        <li>Click on the following link to reset your password:</li>
        <p><a href="${url}">Reset Password</a></p>
        <li>On the password reset page, enter your new password and confirm it.</li>
        <li>Click the "Submit" button to reset your password.</li>
        </ol>
        <p>Link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, please ignore this email, and your password will remain unchanged.</p>
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team at <a href="mailto:support@example.com">support@example.com</a>.</p>
        <p>Best regards,<br>[Your Company Name] Team</p>
      `);
      if (emailSent) return res.send({ Status: 'success' });
    }catch(e){
        console.log(e);
        next(e)
    }
}
module.exports.resetPassword = async (req, res, next) => {
    try{
        const {id, token} = req.params;
        const password = req.body.password.trim();
        const confirmPassword = req.body.confirmPassword.trim();
        let userID;
        // check if user and token is valid
        try {
            userID = new mongoose.Types.ObjectId(id);
        } catch (error) {
            throw new HandleError(`Invalid link`, 400);
        }
        const user = await User.findById(userID);
        if(!user) throw new HandleError(`Invalid link`, 400)
        const PasswordResetToken = await PasswordToken.findOne({ userId: userID });
        if (!PasswordResetToken) throw new HandleError(`Invalid link`, 400);
        const match = await bcrypt.compare(token, PasswordResetToken.token);
        if(!match) throw new HandleError(`Invalid link`, 400);
        // password validation
        if (password.length < 6) throw new HandleError(`Password must be at least 6 characters.`, 400);
        if (password !== confirmPassword) throw new HandleError(`Password and confirm password must match.`, 400);
        // hash password
        const hashedPass = await bcrypt.hash(password, 10);
        const updatedUser = await User.findByIdAndUpdate({_id: userID}, {password: hashedPass})
        if(!updatedUser) throw new HandleError(`Password didn't update.`, 400);
        // delete token after using it
        await PasswordToken.deleteOne({ userId: userID });
        res.send({message: 'Password changed successfully'});
    }catch(e){
        console.log(e);
        next(e)
    }
}
module.exports.verifyEmail = async (req, res, next) => {
    try {
        const { id, token } = req.params;
        let userID;
        try {
            userID = new mongoose.Types.ObjectId(id);
        } catch (error) {
            throw new HandleError(`Invalid link`, 400);
        }
        // handle error if user already verified and token is not valid
        const user = await User.findById(userID);
        if (!user || user.isVerified) throw new HandleError(user ? `Email already verified` : `Invalid link`, 400);
        const EmailVerifyToken = await EmailToken.findOne({ userId: userID });
        if (!EmailVerifyToken) throw new HandleError(`Invalid link`, 400);
        const match = await bcrypt.compare(token, EmailVerifyToken.token);
        if(!match) throw new HandleError(`Invalid link`, 400);
        // set user to verified
        await User.updateOne({ _id: user._id }, { isVerified: true });
        // delete email verification token after use it
        await EmailToken.deleteOne({ userId: userID });
        res.status(200).send({ message: 'Email verified successfully.' });
    } catch (e) {
        next(e);
    }
};
module.exports.Logout = async (req, res, next) => {
    try{
        await res.clearCookie('access_token');
        res.status(200).send({success: true})
    }catch (e) {
        next(e);
    }
}
// Schedule a job to run every hour (at the beginning of each hour)
cron.schedule('0 * * * *', async () => {
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);
    try {
        // Find and delete users who are not verified and were created more than 24 hours ago
        const deletedUsers = await User.deleteMany({
            isVerified: false,
            createdAt: { $lt: twentyFourHoursAgo },
        });
        if (deletedUsers.deletedCount > 0) {
            console.log(`${deletedUsers.deletedCount} unverified users deleted.`);
        }
    } catch (error) {
        console.error('Error deleting unverified users:', error);
    }
});