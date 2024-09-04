const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(functions.config().sg.apikey);

const { Filter, FieldValue } = require('firebase-admin/firestore');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: functions.config().fb.projectid,
    clientEmail: functions.config().fb.clientemail,
    privateKey: functions.config().fb.privatekey.replace(/\\n/g, "\n"),
  }),
  databaseURL: `https://${functions.config().fb.projectId}.firebaseio.com`,
});



// Initialize Firestore
const db = admin.firestore();

const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
    user: functions.config().em.user,
    pass: functions.config().em.pass
  }
});

transporter.verify(function (error, success) {
  if (error) {
    logger.error("Error sending emails", error);
  } else {
    logger.info("Server is ready to take our messages", { structuredData: true });
  }
});

function getStartAndEndOfDay(date) {
  return [
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime(),
    new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime()
  ];
}

// Get user by uid
async function getUser(uid) {
  return db.collection("users").doc(uid).get().then(format);
}

// Update item
function logItemAction(id, action) {
  return db.collection("items").doc(id).update({
    logDates: FieldValue.arrayUnion({
      action: action,
      date: new Date().getTime()
    })
  });
}

function disableItem(id) {
  return db.collection("items").doc(id).update({
    isActive: false
  });
}

// Cloud Function to run on a schedule
exports.scheduledEmailSender = functions.pubsub.schedule('every 24 hours').onRun(sendMessages);
exports.sendMessages = onRequest((request, response) => {
  sendMessages(null);
  logger.info("Hello logs!", { structuredData: true });
  response.send("Hello from Firebase!");
});

async function sendMessages(context) {
  // Get the current date
  const today = new Date();
  const date = new Date();
  const tenDaysLater = new Date(date.setDate(date.getDate() + 10));

  // Beginning of the day
  const [startOfToday, endOfToday] = getStartAndEndOfDay(today);
  const [startOfTenDaysLater, endOfTenDaysLater] = getStartAndEndOfDay(tenDaysLater);

  logger.info("0-" + startOfToday + " " + endOfToday, { structuredData: true });

  const fromAddress = "pebble@lennys.app";

  try {
    // Fetch data from Firestore
    const snapshot = await db.collection('items')
      .where("isActive", "==", true)
      .where(
        Filter.or(
          Filter.and(Filter.where('sendDate', '>=', startOfToday), Filter.where('sendDate', '<=', endOfToday)),
          Filter.and(Filter.where('sendDate', '>=', startOfTenDaysLater), Filter.where('sendDate', '<=', endOfTenDaysLater))
        )
      )
      .get()
      .then(format);

    // Prepare an array to hold email promises
    const emailPromises = [];

    logger.info("1-" + snapshot.length, { structuredData: true });

    snapshot.forEach(async doc => {
      const messageData = doc;
      var userData = await getUser(messageData.owner);

      if (messageData.sendDate >= startOfToday && messageData.sendDate <= endOfToday) {
        // The time has come
        await logItemAction(doc.id, "messageSent");
        await disableItem(doc.id);

        // Prepare the email
        const realMailOptions = {
          from: fromAddress,
          to: messageData.recipient,
          subject: 'You have a message waiting for you',
          text: `Hello, ${messageData.name}! ${userData.name} has left a message for you.\n` + messageData.message
        };

        logger.info("2.1-" + messageData.recipient, { structuredData: true });



        // Send the email and push the promise to the array
        emailPromises.push(transporter.sendMail(realMailOptions));

        // Prepare the email
        const senderNotificationMailOptions = {
          from: fromAddress,
          to: userData.email,
          subject: `Your message is sent to ${messageData.name}`,
          text: `Hello, ${userData.name}! Your message "${messageData.title}" for ${messageData.name} is sent today as below.\n\n` + messageData.message
        };

        logger.info("2.2-" + userData.email, { structuredData: true });

        // Send the email and push the promise to the array
        emailPromises.push(transporter.sendMail(senderNotificationMailOptions));
      } else {
        // Send the link to postpone
        logItemAction(doc.id, "postponeSent");

        const message = `Hello, ${userData.name}! This is your scheduled email.\n` + messageData.message
          + '\nIf you would like to postpone it click here: \n'
          + 'Otherwise it will be sent on ' + new Date(messageData.sendDate).toDateString();

        // Prepare the email
        const mailOptions = {
          from: fromAddress,
          to: userData.email,
          subject: 'You have a message to be delivered',
          text: message
        };

        logger.info("3-" + userData.email, { structuredData: true });

        sgMail
          .send(mailOptions)
          .then(() => {
            logger.info('Email sent through send grid')
          })
          .catch((error) => {
            logger.error(error)
          });

        // Send the email and push the promise to the array
        emailPromises.push(transporter.sendMail(mailOptions));
      }


    });

    // Wait for all emails to be sent
    await Promise.all(emailPromises);

    logger.info("Emails sent successfully!", { structuredData: true });
  } catch (error) {
    logger.error("Error sending emails", error);
  }

  return null;
}

/**** HELPERS ****/

// Format Firestore response
function format(response) {
  // Converts doc into object that contains data and `doc.id`
  const formatDoc = (doc) => ({ id: doc.id, ...doc.data() });
  if (response.docs) {
    // Handle a collection of docs
    return response.docs.map(formatDoc);
  } else {
    // Handle a single doc
    return response.exists ? formatDoc(response) : null;
  }
}