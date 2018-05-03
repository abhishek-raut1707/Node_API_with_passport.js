var LocalStrategy = require('passport-local').Strategy;
var User = require('../model/user.model.js');

module.exports = function(passport)
{
	////////////////////////////////////////////////////////////////////////////////////
	//session passport


	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done){
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});


// // 	///////////////////////////////////////////////////////////////////////////////////////////
// // 	//Login


// 	passport.use('local-login', new LocalStrategy({
// 		usernameField: 'email',
// 		passwordField: 'password',
// 		passReqToCallback: true
// 	},
// 	function(req, email, password, done) {
// 		if(email)
// 			email = email.toLowerCase();

			
// 		process.nextTick(function() {
// 			User.findOne({'local.email': email}, function(err, user) {
// 				if(err)
// 					return done(err);

// 				if(!user)
// 				{
// 					return done(null, false, req.flash('loginMsg', 'No User Found with this Email'));
// 				}
// 				if(!user.validatePassword(password))
// 				{
// 					return done(null, false, req.flash('loginMsg', 'Invalid Password'));
// 				}
// 				else {
// 					return done(null, user);
// 				}
// 			});
// 		});
// 	}));


// // 	//////////////////////////////////////////////////////////////////////////////////////////////
// // 	//Signup

// 	passport.use('local-signup', new LocalStrategy({
// 		usernameField: 'email',
// 		passwordField: 'password',
// 		passReqToCallback: true
// 	},
// 	function(req, email, password, done) {

// 		if(email)
// 			email = email.toLowerCase();


// 		process.nextTick(function() {
// 			if(!req.user)
// 			{
// 				User.findOne({'local.email': email}, function(err, user) {
// 					if(err)
// 						return done(err);

// 					if(user)
// 					{
// 						return done(null, false, req.flash('signupMsg', 'Email already exists'))
// 					} else {
// 						var newUser = new User();

// 						newUser.local.email = email;
// 						newUser.local.password = newUser.generateHash(password);

// 						newUser.save(function(err, user) {
// 							if(err)
// 								return done(err);
// 							return done(null, user);
// 						});
// 					}
// 				});
// 			} else if ( !req.user.local.email ) {
//                 // ...presumably they're trying to connect a local account
//                 // BUT let's check if the email used to connect a local account is being used by another user
//                 User.findOne({ 'local.email' :  email }, function(err, user) {
//                     if (err)
//                         return done(err);

//                     if (user) {
//                         return done(null, false, req.flash('loginMsg', 'That email is already taken.'));
//                         // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
//                     } else {
//                         var user = req.user;
//                         user.local.email = email;
//                         user.local.password = user.generateHash(password);
//                         user.save(function (err) {
//                             if (err)
//                                 return done(err);

//                             return done(null,user);
//                         });
//                     }
//                 });
//             } else {
//                 // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
//                 return done(null, req.user);
//             }
// 		});
// 	}));
// }


////////////////////////////////////////////////////////////////////////////////////////////////

passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(function() {
            User.findOne({ 'local.email' :  email }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);

                // if no user is found, return the message
                if (!user)
                    return done(null, false, req.flash('loginMessage', 'No user found.'));

                if (!user.validatePassword(password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));

                // all is well, return user
                else
                    return done(null, user);
            });
        });

    }));

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
    function(req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching

        // asynchronous
        process.nextTick(function() {
            // if the user is not already logged in:
            if (!req.user) {
                User.findOne({ 'local.email' :  email }, function(err, user) {
                    // if there are any errors, return the error
                    if (err)
                        return done(err);

                    // check to see if theres already a user with that email
                    if (user) {
                        return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                    } else {

                        // create the user
                        var newUser            = new User();

                        newUser.local.email    = email;
                        newUser.local.password = newUser.generateHash(password);

                        newUser.save(function(err) {
                            if (err)
                                return done(err);

                            return done(null, newUser);
                        });
                    }

                });
            // if the user is logged in but has no local account...
            } else if ( !req.user.local.email ) {
                // ...presumably they're trying to connect a local account
                // BUT let's check if the email used to connect a local account is being used by another user
                User.findOne({ 'local.email' :  email }, function(err, user) {
                    if (err)
                        return done(err);

                    if (user) {
                        return done(null, false, req.flash('loginMessage', 'That email is already taken.'));
                        // Using 'loginMessage instead of signupMessage because it's used by /connect/local'
                    } else {
                        var user = req.user;
                        user.local.email = email;
                        user.local.password = user.generateHash(password);
                        user.save(function (err) {
                            if (err)
                                return done(err);

                            return done(null,user);
                        });
                    }
                });
            } else {
                // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
                return done(null, req.user);
            }

        });

    }));
}