const express = require("express");
const router = express.Router();
const db = require("../../models");
const authentication = require("../../middleware/login_module").check_auth;

var multer = require("multer");

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/images");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + file.originalname.replace(/\s+/g, "-"));
    },
});

const uploadSourceLeadFile = multer({
    storage: storage, // global posting data upload file storage assign
    limits: {
        // Define limits for the file
        fileSize: 5 * 1024 * 1024, // 5 mb image only allowed
    },
    fileFilter: function (req, file, cb) {
        // Filter the file based on the type.
        if (
            file.mimetype == "image/png" ||
            file.mimetype == "image/jpg" ||
            file.mimetype == "image/jpeg"
        ) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
        }
    },
}).single("event_photo");

router.get("/add-event", authentication, function (req, res, next) {
    try {
        res.render("events/add-event", {
            title: "Add Event",
            sessionUser: req.user,
        });
    } catch (error) {
        console.log(error);
    }
});

router.post("/add-event", async function (req, res, next) {
    try {
        uploadSourceLeadFile(req, res, async function (err) {
            // Check err while upload
            if (err) {
                console.log('Error while uploading image');
                console.log(err);
                return res.send({
                    type: 'error',
                    message: err.message
                });
            } else {
                const { description, sort_description, title } = req.body;
                console.log(req.body);
                try {
                    db.Event.create({
                        title,
                        photo: req.file.filename,
                        description,
                        sortDescription: sort_description,
                        date: new Date(),
                        updatedDate: new Date(),
                    })
                        .then(() => {
                            let message = `event Created successfully`;
                            res.send({
                                status: 200,
                                message,
                                type: "success",
                            });
                        })
                        .catch((error) => {
                            console.log(error);
                            res.send({
                                status: 400,
                                message: `Something Went Wrong while creating event`,
                                type: "fails",
                            });
                        });
                } catch (error) {
                    console.log(error);
                    res.send({
                        status: 500,
                        message: error.message,
                        type: "error",
                    });
                }

            }
        });
    } catch (error) {
        console.log(error);
    }
});

router.get('/', async (req, res) => {
    try {
        // Retrieve all event posts from the database using the event model
        const eventPosts = await db.Event.findAll({
            attributes: ['event_id', 'title', 'date', 'photo', 'description', 'sort_description'], // You can directly specify the attribute without an alias
            raw: true,// Get raw JSON data instead of Sequelize instances
        });

        console.log('event posts retrieved:', eventPosts);

        res.render("events/events", {
            title: "ChildDR | Setting",
            eventPosts: eventPosts,
            layout: "blank",
            sessionUser: req.user,
        });
    } catch (error) {
        console.error('Error retrieving event posts:', error);
        // Handle errors appropriately
        res.status(500).send('Error retrieving event posts'); // Return an error response to the client
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const event = await db.Event.findByPk(id);
        const eventPost = event.toJSON();

        if (!eventPost) {
            // event post not found, handle error or redirect to an error page
            res.status(404).send('event not found');
            return;
        }

        res.render('events/event-detail', {
            title: eventPost.title,
            description: eventPost.description,
            date: eventPost.date,
            authorName: eventPost.authorName,
            photo: eventPost.photo,
            layout: 'blank',
            sessionUser: req.user,
        });
    } catch (error) {
        console.error('Error retrieving event post:', error);
        // Handle errors appropriately
        res.status(500).send('Error retrieving event post');
    }
});

module.exports = router;
