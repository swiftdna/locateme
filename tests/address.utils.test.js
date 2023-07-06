const chai = require('chai');
const expect = chai.expect;
const { validateAddress, combineAddresses, generateErrorMessage } = require('../modules/Address');

describe('Address Helper Functions', () => {
  describe('validateAddress', () => {
    it('should return missing attributes', () => {
      const address = {
        address_line_one: '123 Main St',
        city: 'Anytown',
        // missing 'state' and 'zip_code'
      };
      expect(validateAddress(address)).to.eql(['state', 'zip_code']);
    });

    it('should return empty array when all attributes are present', () => {
      const address = {
        address_line_one: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zip_code: '91355'
      };
      expect(validateAddress(address)).to.eql([]);
    });
  });
  
  describe('generateErrorMessage', () => {
    it('should generate an error message string', () => {
      const missingAttr = ['state', 'zip_code'];
      expect(generateErrorMessage(missingAttr)).to.equal('Address is missing required attributes: state, zip_code');
    });
  });
  
  describe('combineAddresses', () => {
    it('should combine addresses and remove _id', () => {
      const addresses = {
        cached: [{_id: 1, name: 'Cached Address'}],
        enriched: [{_id: 2, name: 'Non-Cached Address'}]
      };
      const combined = combineAddresses(addresses);
      combined.forEach(address => expect(address).to.not.have.property('_id'));
    });
  });
});