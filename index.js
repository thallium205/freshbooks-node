var request = require('request');
var easyxml = require('easyxml');
var xml2js = require('xml2js');

function Freshbooks(account, token, agent, showAttributes) {
    this.url = 'https://' + account + '.freshbooks.com/api/2.1/xml-in';
    this.token = token;
    this.agent = agent;
    this.parser = new xml2js.Parser({explicitArray: false, ignoreAttrs: showAttributes !== undefined ? (showAttributes ? false : true) : true, async: true});
    easyxml.configure({rootElement: 'request', manifest: true});
}

Freshbooks.prototype.call = function(method, json, callback) {
    var self = this;

    var xml = easyxml.render(json);
    xml = xml.replace('<request', '<request method="' + method + '"');

    var options = {
        uri: self.url,
        method: "POST",
        headers: {
            'Authorization': 'Basic ' + new Buffer(self.token + ':X').toString('base64'),
            'User-Agent': self.agent
        },
        body: xml
    }

    request(options, function(err, res, body) {
        if (err) {
            return callback(err);
        } else if (res.statusCode !== 200) {
            return callback(new Error(res.statusCode));
        } else {
            self.parser.parseString(body, function(err, json) {
                if (err) return callback(err);
                if (json && json.response && json.response.error) {
                    return callback(json);
                } else {
                    return callback(null, json);
                }
            });
        }
    });
}

module.exports = Freshbooks;