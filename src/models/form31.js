/**
 * Form31 Model
 * Represents the data structure for a Form 31 bankruptcy document
 */
class Form31 {
  constructor(data = {}) {
    // Metadata
    this.metadata = {
      generatedTimestamp: data.metadata?.generatedTimestamp || new Date().toISOString(),
      sourceFile: data.metadata?.sourceFile || '',
      generatedBy: data.metadata?.generatedBy || 'PDFtoXMLConverter'
    };
    
    // Case information
    this.caseInfo = {
      courtFileNumber: data.caseInfo?.courtFileNumber || '',
      dateOfFiling: data.caseInfo?.dateOfFiling || '',
      district: data.caseInfo?.district || '',
      division: data.caseInfo?.division || ''
    };
    
    // Debtor information
    this.debtor = {
      type: data.debtor?.type || 'individual',
      name: {
        firstName: data.debtor?.name?.firstName || '',
        middleName: data.debtor?.name?.middleName || '',
        lastName: data.debtor?.name?.lastName || ''
      },
      address: {
        streetNumber: data.debtor?.address?.streetNumber || '',
        streetName: data.debtor?.address?.streetName || '',
        city: data.debtor?.address?.city || '',
        province: data.debtor?.address?.province || '',
        postalCode: data.debtor?.address?.postalCode || '',
        country: data.debtor?.address?.country || 'Canada'
      },
      contactInfo: {
        telephone: data.debtor?.contactInfo?.telephone || '',
        email: data.debtor?.contactInfo?.email || ''
      },
      occupation: data.debtor?.occupation || '',
      employer: data.debtor?.employer || '',
      dateOfBirth: data.debtor?.dateOfBirth || '',
      SIN: data.debtor?.SIN || ''
    };
    
    // Creditors
    this.creditors = {
      creditor: data.creditors?.creditor || [],
      totalUnsecured: data.creditors?.totalUnsecured || '0.00',
      totalSecured: data.creditors?.totalSecured || '0.00',
      totalPreferred: data.creditors?.totalPreferred || '0.00',
      grandTotal: data.creditors?.grandTotal || '0.00'
    };
    
    // Assets and liabilities
    this.assetsAndLiabilities = {
      totalAssets: data.assetsAndLiabilities?.totalAssets || '0.00',
      totalLiabilities: data.assetsAndLiabilities?.totalLiabilities || '0.00',
      deficiency: data.assetsAndLiabilities?.deficiency || '0.00'
    };
    
    // Signatures
    this.signatures = {
      debtorSignature: {
        name: data.signatures?.debtorSignature?.name || '',
        date: data.signatures?.debtorSignature?.date || ''
      },
      witnessSignature: data.signatures?.witnessSignature || null
    };
  }
  
  /**
   * Validate the form data for required fields
   * @returns {boolean} Whether the data is valid
   */
  validate() {
    // Check required fields
    if (!this.caseInfo.courtFileNumber) return false;
    if (!this.debtor.name.firstName || !this.debtor.name.lastName) return false;
    if (!this.debtor.address.streetName || !this.debtor.address.city || !this.debtor.address.province) return false;
    
    return true;
  }
  
  /**
   * Convert to XML-friendly object for serialization
   * @returns {Object} XML-friendly object
   */
  toXmlObject() {
    return {
      'bankruptcyForm31': {
        '$': {
          'version': '1.0',
          'xmlns': 'https://ised-isde.canada.ca/bankruptcy/form31'
        },
        'metadata': this.metadata,
        'caseInfo': this.caseInfo,
        'debtor': {
          '$': { 'type': this.debtor.type },
          ...this.debtor
        },
        'creditors': this.creditors,
        'assetsAndLiabilities': this.assetsAndLiabilities,
        'signatures': this.signatures
      }
    };
  }
}

module.exports = Form31;