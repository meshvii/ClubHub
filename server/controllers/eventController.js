const Club = require("../models/clubModel");
const Event = require("../models/clubEventModel");
const clubRole = require("./clubroleController");

exports.createEvent = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to create an event. Changes: ${JSON.stringify(req.body)}`);
        const { title, description, date, location, clubName } = req.body;

        const club = await Club.findOne({ name: req.params.name});
        if (!club) {
            throw new Error('Not Found: Fail to create event as club DNE');
        }

        if (!req.session.isLoggedIn) {
            throw new Error('Unauthorized: Must sign in to add event');
        }
        
        const isAdmin = await clubRole.isClubAdminMiddleware(req.session.email, req.params.name);
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can add events');
        }

        const clubObjectId = club._id;

        // Create the event
        const newEvent = await Event.create({
            title: title,
            description: description,
            date: date,
            location: location,
            club: clubObjectId
        });

        res.status(200).json({ message: 'Event created successfully'});
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    } catch (err) {
        if (err.message.includes('Unauthorized')) {
            res.status(403).json({
                status: "fail",
                message: err.message,
                description: `Unauthorized: ${req.session.email} is not and admin of club ${req.params.name}`,
            });
        } else if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: 'fail',
                message: err.message,
                description: `Club ${req.params.name} does not exist`
            });
        } else {
            res.status(500).json({
                status: 'fail',
                message: 'An error occurred while processing your request',
                description: 'Server Error'
            });
            console.error(`${req.sessionID} - Server Error: ${err}`);
        }
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
};

exports.getEventsForClub = async (req, res) => {
    try {
        // Find all events for the given clubId
        console.log(`${req.sessionID} - ${req.session.email} requesting GET on ${req.params.name}`);
        
        const club = await Club.findOne({ name: req.params.name});
        if (!club) {
            throw new Error('Not Found: Fail to get events as club DNE');
        }
        const clubObjectId = club._id;
        const events = await Event.find({ club: clubObjectId });

        res.status(200).json({
            events: events,
            message: "Events found successfully"
        });

        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    } catch (err) {
        if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Fail to get events as ${req.params.name} DNE`,
            });
        } else {
            res.status(500).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Server Error`,
            });
            console.log(`${req.sessionID} - Server Error: ${err}`)
        }
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
};

exports.getEvent = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} requesting GET on ${req.params.event}`);
        
        const event = await Event.findOne({_id: req.params.event});
        
        if (!event) {
            throw new Error('Not Found: Fail to get event as event DNE');
        }
        

        res.status(200).json({
            title: event.title,
            date: event.date,
            description: event.description,
            location: event.location,
            message: "Club Found Succesfully"
        });

        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    } catch (err) {
        if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Fail to get event as ${req.params.name} DNE`,
            });
        } else {
            res.status(500).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Server Error`,
            });
            console.log(`${req.sessionID} - Server Error: ${err}`)
        }
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
}

exports.editEvent = async(req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to edit event ${ req.params.event}. Changes: ${JSON.stringify(req.body)}`);
        const { title, description, date, location } = req.body;
        
        // Checking if club exists first as we need a valid club to get possible role
        const event = await Event.findOne({ _id: req.params.event });  
        if (!event) {
            throw new Error('Not Found: Fail to edit club as DNE');
        }

        if (!req.session.isLoggedIn) {
            throw new Error('Unauthorized: Must sign in to edit a club');
        }
        
        const isAdmin = await clubRole.isClubAdminMiddleware(req.session.email, req.params.name);
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can modify the club.');
        }
        
        const updateStatus = await Event.updateOne({ _id: req.params.event },req.body);
        if (!updateStatus.acknowledged) {
            throw err;
        }

        res.status(201).json({
            status: "success",
            message: "event modified",
            data: {
                event: event,
            },
        });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
        if (err.message.includes('Unauthorized')) {
            res.status(403).json({
                status: "fail",
                message: err.message,
                description: `Unauthorized: ${req.session.email} is not and admin of club ${req.params.name}`,
            });
        } else if (err.message.includes('Bad Request')) {
            res.status(400).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Failed to edit event`
            });
        } else if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Fail to edit event as ${req.params.event} DNE`,
            });
        } else {
            res.status(500).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Server Error`,
            });
            console.log(`${req.sessionID} - Server Error: ${err}`)
        }
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to delete event ${req.params.event}`);
        
        // Find the event by its ID
        const event = await Event.findOne({ _id: req.params.event });  
        if (!event) {
            throw new Error('Not Found: Event does not exist');
        }

        // Check if the user is authorized to delete the event
        if (!req.session.isLoggedIn) {
            throw new Error('Unauthorized: Must sign in to delete an event');
        }
        
        const isAdmin = await clubRole.isClubAdminMiddleware(req.session.email, req.params.name);
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can delete events');
        }
        
        // Delete the event
        await Event.deleteOne({ _id: req.params.event });

        res.status(200).json({
            status: "success",
            message: "Event deleted successfully",
        });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
        if (err.message.includes('Unauthorized')) {
            res.status(403).json({
                status: "fail",
                message: err.message,
                description: `Unauthorized: ${req.session.email} is not an admin of club ${req.params.name}`,
            });
        } else if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Fail to delete event as ${req.params.event} does not exist`,
            });
        } else {
            res.status(500).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Server Error`,
            });
            console.log(`${req.sessionID} - Server Error: ${err}`)
        }
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
};