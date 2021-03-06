module.exports = function(async, Message, Users, aws, formidable, FriendResult){
    return {
        SetRouting: function(router){
            router.get('/settings/profile', this.getProfilePage);

            router.post('/userupload', aws.Upload.any(), this.userUpload);
            router.post('/settings/profile', this.postProfilePage);

            router.get('/profile/:name', this.overviewPage);
            router.post('/profile/:name', this.overviewPostPage);
        },

        getProfilePage: function(req, res){
            async.parallel([
                function(callback){
                    Users.findOne({'username': req.user.username}).populate('request.userId').exec((err, result) => {
                        callback(err, result);
                    });
                },

                function(callback){
                    const nameRegex = new RegExp("^" + req.user.username.toLowerCase(), "i");
                    Message.aggregate(
                        {$match: {$or: [{'senderName': nameRegex}, {'receiverName': nameRegex}]}},
                        {$sort: {'createdAt': -1}},
                        {
                            $group: {"_id": {
                                "last_message_between": {
                                    $cond: [
                                        {
                                            $gt: [
                                                {$substr: ["$senderName", 0, 1]},
                                                {$substr: ["$receiverName", 0, 1]}
                                            ]
                                        },
                                        {$concat: ["$senderName", " and ", "$receiverName"]} ,
                                        {$concat: ["$receiverName", " and ", "$senderName"]}    
                                    ]
                                }
                            },  "body": {$first: "$$ROOT"}
                            }
                        }, function(err, newResult){
                            const arr = [
                                {path: 'body.sender', model: 'User'},
                                {path: 'body.receiver', model: 'User'}
                            ];

                            Message.populate(newResult, arr, (err, newResult1) => {
                                // console.log(newResult1[0].body.sender);
                                
                                callback(err, newResult1)
                            });
                        }
                    );
                }
            ], (err, results) => {
                const result1 = results[0];
                const result2 = results[1];
                // console.log(result1.request[0].userId);
                
                res.render('user/profile', {title: 'Footballkik - Profile', user: req.user, data: result1, chat: result2});
            });
        },

        userUpload: function(req, res){
            const form = new formidable.IncomingForm();

            form.on('file', (field, file) => {

            });

            form.on('error', (err) => {
                // console.log(err);
            });

            form.on('end', () => {
                console.log('file upload is successful');
            });

            form.parse(req);
        },

        postProfilePage: function(req, res){
            FriendResult.PostRequest(req, res, '/settings/profile');

            async.waterfall([
                function(callback){
                    Users.findOne({'_id': req.user._id}, (err, results) => {
                        callback(err, results);
                    });
                }, 

                function(result, callback){
                    if(req.body.upload === null || req.body.upload === ''){
                        Users.update({
                            "_id": req.user._id
                        },
                        {
                            username: req.body.username,
                            fullname: req.body.fullname,
                            gender: req.body.gender,
                            mantra: req.body.mantra,
                            userImage: result.userImage,
                            country: req.body.country
                        },
                        {
                            upsert: true
                        }, (err, result) => {
                            console.log(result);
                            
                            res.redirect('/settings/profile');
                        });
                    }else if(req.body.upload !== null || req.body.upload !== ''){
                        Users.update({
                            "_id": req.user._id
                        },
                        {
                            username: req.body.username,
                            fullname: req.body.fullname,
                            gender: req.body.gender,
                            mantra: req.body.mantra,
                            userImage: req.body.upload,
                            country: req.body.country
                        },
                        {
                            upsert: true
                        }, (err, result) => {
                            console.log(result);
                            
                            res.redirect('/settings/profile');
                        });
                    }
                    
                }
            ]);
        },

        overviewPage: function(req, res){
            async.parallel([
                function(callback){
                    Users.findOne({'username': req.params.name}).populate('request.userId').exec((err, result) => {
                        callback(err, result);
                    });
                },

                function(callback){
                    const nameRegex = new RegExp("^" + req.user.username.toLowerCase(), "i");
                    Message.aggregate(
                        {$match: {$or: [{'senderName': nameRegex}, {'receiverName': nameRegex}]}},
                        {$sort: {'createdAt': -1}},
                        {
                            $group: {"_id": {
                                "last_message_between": {
                                    $cond: [
                                        {
                                            $gt: [
                                                {$substr: ["$senderName", 0, 1]},
                                                {$substr: ["$receiverName", 0, 1]}
                                            ]
                                        },
                                        {$concat: ["$senderName", " and ", "$receiverName"]} ,
                                        {$concat: ["$receiverName", " and ", "$senderName"]}    
                                    ]
                                }
                            },  "body": {$first: "$$ROOT"}
                            }
                        }, function(err, newResult){
                            const arr = [
                                {path: 'body.sender', model: 'User'},
                                {path: 'body.receiver', model: 'User'}
                            ];

                            Message.populate(newResult, arr, (err, newResult1) => {
                                // console.log(newResult1[0].body.sender);
                                
                                callback(err, newResult1)
                            });
                        }
                    );
                }
            ], (err, results) => {
                const result1 = results[0];
                const result2 = results[1];
                // console.log(result1.request[0].userId);
                
                res.render('user/overview', {title: 'Footballkik - Overview', user: req.user, data: result1, chat: result2});
            });
        },

        overviewPostPage: function(req, res){
            FriendResult.PostRequest(req, res, '/profile/' + req.params.name);
        }
    }
}