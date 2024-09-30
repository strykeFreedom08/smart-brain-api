const handleRegister = (pgdb, bcrypt) => (req, res) => {
    const {email, name, password} = req.body;
    
    if(!email || !name || !password){
        return res.status(400).json('Incorrect form submission.')
    }
    
    const saltRounds = 10;

    bcrypt.hash(password, saltRounds, function(err, hash) {
        if(err){
            res.status(400).json('Error registration.')
        }else{
            pgdb.transaction(trx => {
                trx.insert({
                    hash: hash,
                    email: email
                })
                .into('login')
                .returning('email')
                .then(trxResult => {
                    return trx('users')
                            .returning('*')
                            .insert({
                                name: name,
                                email: trxResult[0].email,
                                joined: new Date()
                            }).then(user => {
                                res.json(user[0])
                            }).catch(err => res.status(400).json('Unable to register.'));
                })
                .then(trx.commit)
                .catch(trx.rollback)
            })
        }
    });
}

module.exports = {
    handleRegister: handleRegister
}