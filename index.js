"use strict";

const puppeteer = require("puppeteer");
const Promise = require("bluebird");
const express = require("express");
const mqtt = require("mqtt");

const port = 3199;
const app = express();
const mqttClient = mqtt.connect("mqtt://localhost", {
	will: {
		topic: "revspace/j",
		payload: "E_BOT_STUK",
		retain: true,
	}
});

app.get("/mqtt", (req, res) => {
	console.log("PARTICIPANTS", req.query.participants);
	mqttClient.publish('revspace/j', req.query.participants.toString(), {retain: true});
	res.send("ack");
});

app.get("/console", (req, res) => {
	console.log(req.query.log);
	console.log("Log from browser:", ...Object.values(JSON.parse(req.query.log)));
	res.send("ack");
});

app.use(express.static("public"));

app.listen(port, "127.0.0.1", () => {
	console.log("started");
});

let page;
let browser;

Promise.try(() => {
	return puppeteer.launch({
		headless: false,
		args: ["--no-sandbox"]
	});
}).then((res) => {
	browser = res;
	const context = browser.defaultBrowserContext();
	context.clearPermissionOverrides();
	return browser.newPage();
}).then((res) => {
	page = res;
	return page.goto(`http://localhost:${port}`);
}).then(() => {
	page.on('dialog', (dialog) => {
		console.log(dialog);
	});
});
