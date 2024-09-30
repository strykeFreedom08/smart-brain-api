const handleSignIn = (pgdb, bcrypt) => (req, res) => {
    const {email, password} = req.body;

    if(!email || !password){
        return res.status(400).json('Incorrect form submission.')
    }

    pgdb.select('email', 'hash')
        .from('login')
        .where('email', '=', email)
        .then(data => {
            bcrypt.compare(req.body.password, data[0].hash, function(err, isValid) {
                if(isValid){
                    pgdb.select('*')
                        .from('users')
                        .where('email', '=', email)
                        .then(user => {
                            res.json(user[0])
                        })
                        .catch(err => res.status(400).json('Unable to get user.'))

                }else{
                    res.status(400).json('Wrong credentials.')
                }
            })
        }).catch(err => res.status(400).json('User is not exists.'))
}

module.exports = {
    handleSignIn: handleSignIn
}