const supertest = require('supertest');
const chai = require('chai');
const expect = chai.expect;
let server;
let request;

describe('POST /api/enrich', () => {
    before(done => {
        server = require('../index'); // Reference to your app.js or server.js
        server.on('app_started', () => {
            request = supertest(server);
            done();
        });
    });
    it('should return 200 and enriched addresses', done => {
        const requestBody = [
            {
                "address_line_one": "283 Main Street",
                "city": "San Francisco",
                "state": "CA",
                "zip_code": "94101"
            },
            {
                "address_line_one": "293 Main Street",
                "city": "San Francisco",
                "state": "CA",
                "zip_code": "94101"
            },
            {
                "address_line_one": "303 Main Street",
                "city": "San Francisco",
                "state": "CA",
                "zip_code": "94101"
            }
        ];
        
        request
            .post('/api/enrich')
            .send(requestBody)
            .expect(200)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.be.an('array');
                expect(res.body.length).to.be.eql(requestBody.length);
                res.body.forEach((address, i) => {
                    expect(address.address_line_one).to.be.eql(requestBody[i].address_line_one);
                    expect(address.city).to.be.eql(requestBody[i].city);
                    expect(address.state).to.be.eql(requestBody[i].state);
                    expect(address.zip_code).to.be.eql(requestBody[i].zip_code);
                    expect(address.latitude).to.be.a('number');
                    expect(address.longitude).to.be.a('number');
                });
                done();
            });
    });
    it('should return 500 and error for no addresses', done => {
        const requestBody = [];
        request
            .post('/api/enrich')
            .send(requestBody)
            .expect(500)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.be.an('object');
                expect(res.body.error).to.be.eql('No input address found');
                done();
            });
    });
    it('should return 500 and error for address validations', done => {
        const requestBody = [
            {
                "address_line_one": "283 Main Street",
                "city": "San Francisco",
                "state": "",
                "zip_code": "94101"
            },
            {
                "address_line_one": "293 Main Street",
                "city": "San Francisco",
                "state": "CA",
                "zip_code": "94101"
            }
        ];
        
        request
            .post('/api/enrich')
            .send(requestBody)
            .expect(500)
            .end((err, res) => {
                if (err) return done(err);
                expect(res.body).to.be.an('object');
                expect(res.body.error).to.be.eql('Address is missing required attribute - state');
                done();
            });
    });

    after(done => {
        done();
    });
});