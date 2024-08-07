const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById){
    const authenticateUser = async (email, password, done) => {
        const user = getUserByEmail(email)
        if(user == null){
            return done(null, false, { message: 'No user Found!'})
        }
        try{
            if(await bcrypt.compare(password, user.password)){
                return done(null, user)
            }
            else{
                return done(null, false, { message: 'Password incorrect!' })
            }
        }
        catch(err){
            return done(err)
        }
    }
    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser))
    // serialized value used to generate session value
    passport.serializeUser((user, done) => { done(null, user.id) })
    // get's the authenticated user from session value
    passport.deserializeUser((id, done) => { return done(null, getUserById(id)) })
}

module.exports = initialize;