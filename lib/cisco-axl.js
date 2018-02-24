'use strict';

const _ = require('lodash');
const parser = require('xml2json');
const Axios = require('axios');

/**
 * 
 * 
 * @class AXL
 * 
 * @constructor
 * @param {Object.<Options>} options 
 * @property {Object.<Options>} options 
 * 
 * @example
 * 
 * const AXL = require('node-cisco-axl);
 * 
 * var axlOptions = {
 * host: process.env.CUCM,
 * user: process.env.AXLUSER,
 * pass: process.env.AXLPASS,
 * version: process.env.AXLVERSION
 * }
 * 
 * const axl = new AXL(axlOptions);
 * 
 * axl.listRoutePlan('9109200040')
 *    .then(uuid =>{
 *    console.log('uuid: '+uuid);
 * });
 * 
 * 
 * 
 */


class AXL {
  constructor({
    host,
    user,
    pass,
    version
  }) {
    this.host = host || '';
    this.user = user || '';
    this.version = version || '';
    this.authToken = new Buffer(user + ':' + pass).toString('base64');
    this.axios = Axios.create({
      baseURL: 'https://' + host + ':8443/axl/',
      timeout: 8000
    });
    this.soapEnv = 'http://schemas.xmlsoap.org/soap/envelope/';
    this.soapNs = `http://www.cisco.com/AXL/API/${this.version}`;

    this.getSoapEnv = this.getSoapEnv.bind(this);
    this.constructHeaders = this.constructHeaders.bind(this);
    this.callApi = this.callApi.bind(this);
  }

  getSoapEnv() {
    return (
      `<soapenv:Envelope xmlns:soapenv="${this.soapEnv}" xmlns:ns="${this.soapNs}">` +
      '<soapenv:Header/>' +
      '<soapenv:Body>' +
      '{{body}}' +
      '</soapenv:Body>' +
      '</soapenv:Envelope>'
    );
  }

  constructHeaders(func) {
    return {
      headers: {
        'SOAPAction': `CUCM:DB ver=${this.version} ${func}`,
        'Authorization': `Basic ${this.authToken}`,
        'Content-Type': 'text/xml; charset=utf-8',
      }
    };
  }

  callApi([body, headers]) {
    return this.axios.post('', body, headers);
  }

  parseResult(result) {
    return result.data;
  };

  convertXml(xml) {
    return parser.toJson(xml, {
      trim: true, object: true, sanitize: true
    });
  }

  trimJson(json, funcResp, func) {
    return _.chain(json)
      .result('soapenv:Envelope')
      .result('soapenv:Body')
      .result(`ns:${funcResp}`)
      .result('return')
      .result(func)
      .valueOf();
  }

	/**
	 * 
	 * 
	 * @param {any} pattern 
	 * @returns {Promise.<Response>} Response promise
	 * 
	 */
  listRoutePlan(pattern) {
    const getSoapBody = pattern => new Buffer(
      this.getSoapEnv().replace(
        '{{body}}',
        '<ns:listRoutePlan sequence="?">' +
        '<searchCriteria>' +
        '<dnOrPattern>' + '%' + pattern + '</dnOrPattern>' +
        '</searchCriteria>' +
        '<returnedTags uuid="?">' +
        '<dnOrPattern>?</dnOrPattern>' +
        '<partition uuid="?">?</partition>' +
        '<type>?</type>' +
        '<routeDetail>?</routeDetail>' +
        '</returnedTags>' +
        '</ns:listRoutePlan>'
      )
    )

    const trimJSON = json => this.trimJson(
      json, 'listRoutePlanResponse', 'routePlan'
    );
    // TODO: Error handling at this level

    return Promise.all([
      getSoapBody(pattern),
      this.constructHeaders('listRoutePlan')
    ])
      .then(this.callApi)
      .then(this.parseResult)
      .then(this.convertXml)
      .then(trimJSON);
  }

	/**
	 * 
	 * 
	 * @param {any} pattern 
	 * @returns {Promise.<Response>} Response promise
	 * 
	 * 
	 */
  listTransPattern(pattern) {
    const getSoapBody = pattern => new Buffer(
      this.getSoapEnv().replace(
        '{{body}}',
        '<ns:listTransPattern sequence="?">' +
        '<searchCriteria>' +
        '<pattern>' + pattern + '</pattern>' +
        '</searchCriteria>' +
        '<returnedTags uuid="?">' +
        '<pattern>?</pattern>' +
        '<description>?</description>' +
        '<routePartitionName uuid="?">?</routePartitionName>' +
        '<calledPartyTransformationMask>?</calledPartyTransformationMask>' +
        '<callingPartyTransformationMask>?</callingPartyTransformationMask>' +
        '<useCallingPartyPhoneMask>?</useCallingPartyPhoneMask>' +
        '<callingPartyPrefixDigits>?</callingPartyPrefixDigits>' +
        '<digitDiscardInstructionName uuid="?">?</digitDiscardInstructionName>' +
        '<patternUrgency>?</patternUrgency>' +
        '<prefixDigitsOut>?</prefixDigitsOut>' +
        '<provideOutsideDialtone>?</provideOutsideDialtone>' +
        '<callingPartyNumberingPlan>?</callingPartyNumberingPlan>' +
        '<callingPartyNumberType>?</callingPartyNumberType>' +
        '<calledPartyNumberingPlan>?</calledPartyNumberingPlan>' +
        '<calledPartyNumberType>?</calledPartyNumberType>' +
        '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
        '</returnedTags>' +
        '</ns:listTransPattern>'
      )
    );
    const trimJSON = json => this.trimJson(
      json,
      'listTransPatternResponse',
      'transPattern'
    );

    // TODO: Error handling at this level

    return Promise.all([
      getSoapBody(pattern),
      this.constructHeaders('listTransPattern')
    ])
      .then(this.callApi)
      .then(this.parseResult)
      .then(this.convertXml)
      .then(trimJSON);
  }

	/**
	 * 
	 * 
	 * @returns {Promise.<Response>} Response promise
	 * 
	 * 
	 */
  listLdapDirectory() {
    const getSoapBody = () => new Buffer(
      this.getSoapEnv().replace(
        '{{body}}',
        '<ns:listLdapDirectory sequence="?">' +
        '<searchCriteria>' +
        '<name>%</name>' +
        '</searchCriteria>' +
        '<returnedTags uuid="?">' +
        '<name>?</name>' +
        '<ldapDn>?</ldapDn>' +
        '<userSearchBase>?</userSearchBase>' +
        '</returnedTags>' +
        '</ns:listLdapDirectory>'
      )
    );

    const trimJSON = json => this.trimJson(
      json,
      'listLdapDirectoryResponse',
      'ldapDirectory'
    );
    // TODO: Error handling at this level

    return Promise.all([
      getSoapBody(pattern),
      this.constructHeaders('listLdapDirectory')
    ])
      .then(this.callApi)
      .then(this.parseResult)
      .then(this.convertXml)
      .then(trimJSON);
  }

  phoneTags = (
    '<returnedTags ctiid="?" uuid="?">' +
    '<name>?</name>' +
    '<description>?</description>' +
    '<product>?</product>' +
    '<model>?</model>' +
    '<class>?</class>' +
    '<protocol>?</protocol>' +
    '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
    '<devicePoolName uuid="?">?</devicePoolName>' +
    '<commonDeviceConfigName uuid="?">?</commonDeviceConfigName>' +
    '<commonPhoneConfigName uuid="?">?</commonPhoneConfigName>' +
    '<networkLocation>?</networkLocation>' +
    '<locationName uuid="?">?</locationName>' +
    '<mediaResourceListName uuid="?">?</mediaResourceListName>' +
    '<networkHoldMohAudioSourceId>?</networkHoldMohAudioSourceId>' +
    '<userHoldMohAudioSourceId>?</userHoldMohAudioSourceId>' +
    '<securityProfileName uuid="?">?</securityProfileName>' +
    '<sipProfileName uuid="?">?</sipProfileName>' +
    '<geoLocationName uuid="?">?</geoLocationName>' +
    '<lines>' +
    '<line ctiid="?" uuid="?">' +
    '<index>?</index>' +
    '<label>?</label>' +
    '<display>?</display>' +
    '<dirn uuid="?">' +
    '<pattern>?</pattern>' +
    '<routePartitionName uuid="?">?</routePartitionName>' +
    '</dirn>' +
    '<ringSetting>?</ringSetting>' +
    '<consecutiveRingSetting>?</consecutiveRingSetting>' +
    '<displayAscii>?</displayAscii>' +
    '<e164Mask>?</e164Mask>' +
    '<mwlPolicy>?</mwlPolicy>' +
    '<maxNumCalls>?</maxNumCalls>' +
    '<busyTrigger>?</busyTrigger>' +
    '<callInfoDisplay>' +
    '<callerName>?</callerName>' +
    '<callerNumber>?</callerNumber>' +
    '<redirectedNumber>?</redirectedNumber>' +
    '<dialedNumber>?</dialedNumber>' +
    '</callInfoDisplay>' +
    '<associatedEndusers>' +
    '<enduser>' +
    '<userId>?</userId>' +
    '</enduser>' +
    '</associatedEndusers>' +
    '</line>' +
    '<lineIdentifier>' +
    '<directoryNumber>?</directoryNumber>' +
    '<routePartitionName>?</routePartitionName>' +
    '</lineIdentifier>' +
    '</lines>' +
    '<numberOfButtons>?</numberOfButtons>' +
    '<phoneTemplateName uuid="?">?</phoneTemplateName>' +
    '<speeddials>' +
    '<speeddial>' +
    '<dirn>?</dirn>' +
    '<label>?</label>' +
    '<index>?</index>' +
    '</speeddial>' +
    '</speeddials>' +
    '<busyLampFields>' +
    '<busyLampField>' +
    '<blfDest>?</blfDest>' +
    '<label>?</label>' +
    '<index>?</index>' +
    '</busyLampField>' +
    '</busyLampFields>' +
    '<userLocale>?</userLocale>' +
    '<networkLocale>?</networkLocale>' +
    '<idleTimeout>?</idleTimeout>' +
    '<authenticationUrl>?</authenticationUrl>' +
    '<directoryUrl>?</directoryUrl>' +
    '<idleUrl>?</idleUrl>' +
    '<informationUrl>?</informationUrl>' +
    '<messagesUrl>?</messagesUrl>' +
    '<proxyServerUrl>?</proxyServerUrl>' +
    '<servicesUrl>?</servicesUrl>' +
    '<services>' +
    '<service uuid="?">' +
    '<telecasterServiceName uuid="?">?</telecasterServiceName>' +
    '<name>?</name>' +
    '<url>?</url>' +
    '<urlButtonIndex>?</urlButtonIndex>' +
    '<urlLabel>?</urlLabel>' +
    '<serviceNameAscii>?</serviceNameAscii>' +
    '<phoneService>?</phoneService>' +
    '</service>' +
    '</services>' +
    '<softkeyTemplateName uuid="?">?</softkeyTemplateName>' +
    '<loginUserId>?</loginUserId>' +
    '<defaultProfileName uuid="?">?</defaultProfileName>' +
    '<enableExtensionMobility>?</enableExtensionMobility>' +
    '<currentProfileName uuid="?">?</currentProfileName>' +
    '<loginTime>?</loginTime>' +
    '<loginDuration>?</loginDuration>' +
    '<currentConfig>' +
    '<userHoldMohAudioSourceId>?</userHoldMohAudioSourceId>' +
    '<phoneTemplateName uuid="?">?</phoneTemplateName>' +
    '<mlppDomainId>?</mlppDomainId>' +
    '<mlppIndicationStatus>?</mlppIndicationStatus>' +
    '<preemption>?</preemption>' +
    '<softkeyTemplateName uuid="?">?</softkeyTemplateName>' +
    '<ignorePresentationIndicators>?</ignorePresentationIndicators>' +
    '<singleButtonBarge>?</singleButtonBarge>' +
    '<joinAcrossLines>?</joinAcrossLines>' +
    '<callInfoPrivacyStatus>?</callInfoPrivacyStatus>' +
    '<dndStatus>?</dndStatus>' +
    '<dndRingSetting>?</dndRingSetting>' +
    '<dndOption>?</dndOption>' +
    '<alwaysUsePrimeLine>?</alwaysUsePrimeLine>' +
    '<alwaysUsePrimeLineForVoiceMessage>?</alwaysUsePrimeLineForVoiceMessage>' +
    '<emccCallingSearchSpaceName uuid="?">?</emccCallingSearchSpaceName>' +
    '<deviceName>?</deviceName>' +
    '<model>?</model>' +
    '<product>?</product>' +
    '<deviceProtocol>?</deviceProtocol>' +
    '<class>?</class>' +
    '<addressMode>?</addressMode>' +
    '<allowAutoConfig>?</allowAutoConfig>' +
    '<remoteSrstOption>?</remoteSrstOption>' +
    '<remoteSrstIp>?</remoteSrstIp>' +
    '<remoteSrstPort>?</remoteSrstPort>' +
    '<remoteSipSrstIp>?</remoteSipSrstIp>' +
    '<remoteSipSrstPort>?</remoteSipSrstPort>' +
    '<geolocationInfo>?</geolocationInfo>' +
    '<remoteLocationName>?</remoteLocationName>' +
    '</currentConfig>' +
    '<hlogStatus>?</hlogStatus>' +
    '<ownerUserName uuid="?">?</ownerUserName>' +
    '</returnedTags>' +
    '</ns:getPhone>'
  )

	/**
	 * 
	 * 
	 * @param {any} uuid 
	 * @returns {Promise.<Response>} Response promise
	 * 
	 * 
	 */
  getPhoneByUUID(uuid) {
    const getSoapBody = (uuid) => new Buffer(
      this.getSoapEnv().replace(
        '{{body}}',
        '<ns:getPhone sequence="?">' +
        '<uuid>' + uuid + '</uuid>' +
        this.phoneTags
      )
    )

    const trimJSON = json => this.trimJson(
      json,
      'getPhoneResponse',
      'phone'
    );
    // TODO: Error handling at this level

    return Promise.all([
      getSoapBody(uuid),
      this.constructHeaders('getPhone')
    ])
      .then(this.callApi)
      .then(this.parseResult)
      .then(this.convertXml)
      .then(trimJSON);
  }

	/**
	 * 
	 * 
	 * @param {any} name 
	 * @returns {Promise.<Response>} Response promise
	 * 
	 * 
	 */
  getPhoneByName(name) {
    const getSoapBody = name => new Buffer(
      this.getSoapEnv().replace(
        '{{body}}',
        '<ns:getPhone sequence="?">' +
        '<name>' + name + '</name>' +
        this.phoneTags
      )
    );

    const trimJSON = json => this.trimJson(
      json,
      'getPhoneResponse',
      'phone'
    );

    // TODO: Error handling at this level

    return Promise.all([
      getSoapBody(name),
      this.getSoapHeaders('getPhone')
    ])
      .then(this.callApi)
      .then(this.parseResult)
      .then(this.convertXml)
      .then(trimJSON);

  }

	/**
	 * 
	 * 
	 * @param {any} pattern 
	 * @returns {Promise.<Response>} Response promise
	 * 
	 * 
	 */
  getLine(pattern) {
    const getSoapBody = pattern => new Buffer(
      this.getSoapEnv().replace(
        '{{body}}',
        '<ns:getLine sequence="?">' +
        '<pattern>' + pattern + '</pattern>' +
        '<returnedTags uuid="?">' +
        '<pattern>?</pattern>' +
        '<description>?</description>' +
        '<usage>?</usage>' +
        '<routePartitionName uuid="?">?</routePartitionName>' +
        '<callForwardAll>' +
        '<forwardToVoiceMail>?</forwardToVoiceMail>' +
        '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
        '<secondaryCallingSearchSpaceName uuid="?">?</secondaryCallingSearchSpaceName>' +
        '<destination>?</destination>' +
        '</callForwardAll>' +
        '<callForwardBusy>' +
        '<forwardToVoiceMail>?</forwardToVoiceMail>' +
        '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
        '<destination>?</destination>' +
        '</callForwardBusy>' +
        '<callForwardBusyInt>' +
        '<forwardToVoiceMail>?</forwardToVoiceMail>' +
        '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
        '<destination>?</destination>' +
        '</callForwardBusyInt>' +
        '<callForwardNoAnswer>' +
        '<forwardToVoiceMail>?</forwardToVoiceMail>' +
        '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
        '<destination>?</destination>' +
        '<duration>?</duration>' +
        '</callForwardNoAnswer>' +
        '<callForwardNoAnswerInt>' +
        '<forwardToVoiceMail>?</forwardToVoiceMail>' +
        '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
        '<destination>?</destination>' +
        '<duration>?</duration>' +
        '</callForwardNoAnswerInt>' +
        '<callForwardNoCoverage>' +
        '<forwardToVoiceMail>?</forwardToVoiceMail>' +
        '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
        '<destination>?</destination>' +
        '</callForwardNoCoverage>' +
        '<callForwardNoCoverageInt>' +
        '<forwardToVoiceMail>?</forwardToVoiceMail>' +
        '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
        '<destination>?</destination>' +
        '</callForwardNoCoverageInt>' +
        '<callForwardOnFailure>' +
        '<forwardToVoiceMail>?</forwardToVoiceMail>' +
        '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
        '<destination>?</destination>' +
        '</callForwardOnFailure>' +
        '<callForwardAlternateParty>' +
        '<forwardToVoiceMail>?</forwardToVoiceMail>' +
        '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
        '<destination>?</destination>' +
        '<duration>?</duration>' +
        '</callForwardAlternateParty>' +
        '<callForwardNotRegistered>' +
        '<forwardToVoiceMail>?</forwardToVoiceMail>' +
        '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
        '<destination>?</destination>' +
        '</callForwardNotRegistered>' +
        '<callForwardNotRegisteredInt>' +
        '<forwardToVoiceMail>?</forwardToVoiceMail>' +
        '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
        '<destination>?</destination>' +
        '</callForwardNotRegisteredInt>' +
        '<callPickupGroupName uuid="?">?</callPickupGroupName>' +
        '<autoAnswer>?</autoAnswer>' +
        '<networkHoldMohAudioSourceId>?</networkHoldMohAudioSourceId>' +
        '<userHoldMohAudioSourceId>?</userHoldMohAudioSourceId>' +
        '<alertingName>?</alertingName>' +
        '<asciiAlertingName>?</asciiAlertingName>' +
        '<presenceGroupName uuid="?">?</presenceGroupName>' +
        '<shareLineAppearanceCssName uuid="?">?</shareLineAppearanceCssName>' +
        '<voiceMailProfileName uuid="?">?</voiceMailProfileName>' +
        '<defaultActivatedDeviceName uuid="?">?</defaultActivatedDeviceName>' +
        '<directoryURIs>' +
        '<directoryUri uuid="?">' +
        '<isPrimary>?</isPrimary>' +
        '<uri>?</uri>' +
        '<partition uuid="?">?</partition>' +
        '<advertiseGloballyViaIls>?</advertiseGloballyViaIls>' +
        '</directoryUri>' +
        '</directoryURIs>' +
        '<allowCtiControlFlag>?</allowCtiControlFlag>' +
        '<associatedDevices>' +
        '<device>?</device>' +
        '</associatedDevices>' +
        '<active>?</active>' +
        '</returnedTags>' +
        '</ns:getLine>'
      )
    );

    const trimJSON = json => this.trimJson(
      json,
      'getLineResponse',
      'line'
    );
    // TODO: Error handling at this level

    return Promise.all([
      getSoapBody(pattern),
      this.getSoapHeaders('getLine')
    ])
      .then(callApi)
      .then(parseResult)
      .then(xmltoJSON)
      .then(trimJSON);
  }

	/**
	 * 
	 * 
	 * @param {any} uuid 
	 * @returns {Promise.<Response>} Response promise
	 * 
	 * 
	 */
  getTransPattern(uuid) {
    const getSoapBody = uuid => new Buffer(
      this.getSoapBody().replace(
        '{{body}}',
        '<ns:getTransPattern sequence="?">' +
        '<searchCriteria>' +
        '<uuid>' + uuid + '</uuid>' +
        '</searchCriteria>' +
        '<returnedTags uuid="?">' +
        '<pattern>?</pattern>' +
        '<description>?</description>' +
        '<routePartitionName uuid="?">?</routePartitionName>' +
        '<calledPartyTransformationMask>?</calledPartyTransformationMask>' +
        '<callingPartyTransformationMask>?</callingPartyTransformationMask>' +
        '<useCallingPartyPhoneMask>?</useCallingPartyPhoneMask>' +
        '<callingPartyPrefixDigits>?</callingPartyPrefixDigits>' +
        '<digitDiscardInstructionName uuid="?">?</digitDiscardInstructionName>' +
        '<patternUrgency>?</patternUrgency>' +
        '<prefixDigitsOut>?</prefixDigitsOut>' +
        '<provideOutsideDialtone>?</provideOutsideDialtone>' +
        '<callingPartyNumberingPlan>?</callingPartyNumberingPlan>' +
        '<callingPartyNumberType>?</callingPartyNumberType>' +
        '<calledPartyNumberingPlan>?</calledPartyNumberingPlan>' +
        '<calledPartyNumberType>?</calledPartyNumberType>' +
        '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
        '</returnedTags>' +
        '</ns:getTransPattern>'
      )
    );

    const trimJSON = json => this.trimJson(
      json,
      'getTransPatternResponse',
      'transPattern'
    );

    // TODO: Error handling at this level

    return Promise.all([
      getSoapBody(uuid),
      this.getSoapHeaders('getTransPattern')
    ])
      .then(this.callApi)
      .then(this.parseResult)
      .then(this.convertXml)
      .then(trimJSON);
  }

	/**
	 * 
	 * 
	 * @param {any} name 
	 * @returns {Promise.<Response>} Response promise 
	 * 
	 * 
	 */
  updatePhoneByName(name) {
    const getSoapBody = pattern => new Buffer(
      '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.cisco.com/AXL/API/' + this.version + '">' +
      '<soapenv:Header/>' +
      '<soapenv:Body>' +
      '<ns:updatePhone sequence="?">' +
      '<name>' + name + '</name>' +
      '<newName>?</newName>' +
      '<description>?</description>' +
      '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
      '<devicePoolName uuid="?">?</devicePoolName>' +
      '<commonDeviceConfigName uuid="?">?</commonDeviceConfigName>' +
      '<commonPhoneConfigName uuid="?">?</commonPhoneConfigName>' +
      '<networkLocation>Use System Default</networkLocation>' +
      '<locationName uuid="?">?</locationName>' +
      '<mediaResourceListName uuid="?">?</mediaResouyrceListName>' +
      '<networkHoldMohAudioSourceId>?</networkHoldMohAudioSourceId>' +
      '<userHoldMohAudioSourceId>?</userHoldMohAudioSourceId>' +
      '<loadInformation special="?">?</loadInformation>' +
      '<vendorConfig>' +
      '</vendorConfig>' +
      '<securityProfileName uuid="?">?</securityProfileName>' +
      '<sipProfileName uuid="?">?</sipProfileName>' +
      '<removeLines>' +
      '<line ctiid="?">' +
      '<index>?</index>' +
      '<label>?</label>' +
      '<display>?</display>' +
      '<dirn uuid="?">' +
      '<pattern>?</pattern>' +
      '<routePartitionName uuid="?">?</routePartitionName>' +
      '</dirn>' +
      '<ringSetting>Ring</ringSetting>' +
      '<consecutiveRingSetting>Use System Default</consecutiveRingSetting>' +
      '<ringSettingIdlePickupAlert>Use System Default</ringSettingIdlePickupAlert>' +
      '<ringSettingActivePickupAlert>Use System Default</ringSettingActivePickupAlert>' +
      '<displayAscii>?</displayAscii>' +
      '<e164Mask>?</e164Mask>' +
      '<mwlPolicy>Use System Policy</mwlPolicy>' +
      '<maxNumCalls>2</maxNumCalls>' +
      '<busyTrigger>1</busyTrigger>' +
      '<callInfoDisplay>' +
      '<callerName>true</callerName>' +
      '<callerNumber>false</callerNumber>' +
      '<redirectedNumber>false</redirectedNumber>' +
      '<dialedNumber>true</dialedNumber>' +
      '</callInfoDisplay>' +
      '<recordingProfileName uuid="?">?</recordingProfileName>' +
      '<monitoringCssName uuid="?">?</monitoringCssName>' +
      '<recordingFlag>Call Recording Disabled</recordingFlag>' +
      '<audibleMwi>Default</audibleMwi>' +
      '<speedDial>?</speedDial>' +
      '<partitionUsage>General</partitionUsage>' +
      '<associatedEndusers>' +
      '<enduser>' +
      '<userId>?</userId>' +
      '</enduser>' +
      '</associatedEndusers>' +
      '<missedCallLogging>true</missedCallLogging>' +
      '<recordingMediaSource>Gateway Preferred</recordingMediaSource>' +
      '</line>' +
      '<lineIdentifier>' +
      '<directoryNumber>?</directoryNumber>' +
      '<routePartitionName>?</routePartitionName>' +
      '</lineIdentifier>' +
      '</removeLines>' +
      '<addLines>' +
      '<line ctiid="?">' +
      '<index>?</index>' +
      '<label>?</label>' +
      '<display>?</display>' +
      '<dirn uuid="?">' +
      '<pattern>?</pattern>' +
      '<routePartitionName uuid="?">?</routePartitionName>' +
      '</dirn>' +
      '<ringSetting>Ring</ringSetting>' +
      '<consecutiveRingSetting>Use System Default</consecutiveRingSetting>' +
      '<ringSettingIdlePickupAlert>Use System Default</ringSettingIdlePickupAlert>' +
      '<ringSettingActivePickupAlert>Use System Default</ringSettingActivePickupAlert>' +
      '<displayAscii>?</displayAscii>' +
      '<e164Mask>?</e164Mask>' +
      '<mwlPolicy>Use System Policy</mwlPolicy>' +
      '<maxNumCalls>2</maxNumCalls>' +
      '<busyTrigger>1</busyTrigger>' +
      '<callInfoDisplay>' +
      '<callerName>true</callerName>' +
      '<callerNumber>false</callerNumber>' +
      '<redirectedNumber>false</redirectedNumber>' +
      '<dialedNumber>true</dialedNumber>' +
      '</callInfoDisplay>' +
      '<recordingProfileName uuid="?">?</recordingProfileName>' +
      '<monitoringCssName uuid="?">?</monitoringCssName>' +
      '<recordingFlag>Call Recording Disabled</recordingFlag>' +
      '<audibleMwi>Default</audibleMwi>' +
      '<speedDial>?</speedDial>' +
      '<partitionUsage>General</partitionUsage>' +
      '<associatedEndusers>' +
      '<enduser>' +
      '<userId>?</userId>' +
      '</enduser>' +
      '</associatedEndusers>' +
      '<missedCallLogging>true</missedCallLogging>' +
      '<recordingMediaSource>Gateway Preferred</recordingMediaSource>' +
      '</line>' +
      '<lineIdentifier>' +
      '<directoryNumber>?</directoryNumber>' +
      '<routePartitionName>?</routePartitionName>' +
      '</lineIdentifier>' +
      '</addLines>' +
      '<lines>' +
      '<line ctiid="?">' +
      '<index>?</index>' +
      '<label>?</label>' +
      '<display>?</display>' +
      '<dirn uuid="?">' +
      '<pattern>?</pattern>' +
      '<routePartitionName uuid="?">?</routePartitionName>' +
      '</dirn>' +
      '<ringSetting>Ring</ringSetting>' +
      '<consecutiveRingSetting>Use System Default</consecutiveRingSetting>' +
      '<ringSettingIdlePickupAlert>Use System Default</ringSettingIdlePickupAlert>' +
      '<ringSettingActivePickupAlert>Use System Default</ringSettingActivePickupAlert>' +
      '<displayAscii>?</displayAscii>' +
      '<e164Mask>?</e164Mask>' +
      '<mwlPolicy>Use System Policy</mwlPolicy>' +
      '<maxNumCalls>2</maxNumCalls>' +
      '<busyTrigger>1</busyTrigger>' +
      '<callInfoDisplay>' +
      '<callerName>true</callerName>' +
      '<callerNumber>false</callerNumber>' +
      '<redirectedNumber>false</redirectedNumber>' +
      '<dialedNumber>true</dialedNumber>' +
      '</callInfoDisplay>' +
      '<recordingProfileName uuid="?">?</recordingProfileName>' +
      '<monitoringCssName uuid="?">?</monitoringCssName>' +
      '<recordingFlag>Call Recording Disabled</recordingFlag>' +
      '<audibleMwi>Default</audibleMwi>' +
      '<speedDial>?</speedDial>' +
      '<partitionUsage>General</partitionUsage>' +
      '<associatedEndusers>' +
      '<enduser>' +
      '<userId>?</userId>' +
      '</enduser>' +
      '</associatedEndusers>' +
      '<missedCallLogging>true</missedCallLogging>' +
      '<recordingMediaSource>Gateway Preferred</recordingMediaSource>' +
      '</line>' +
      '<lineIdentifier>' +
      '<directoryNumber>?</directoryNumber>' +
      '<routePartitionName>?</routePartitionName>' +
      '</lineIdentifier>' +
      '</lines>' +
      '<phoneTemplateName uuid="?">?</phoneTemplateName>' +
      '<speeddials>' +
      '<speeddial>' +
      '<dirn>?</dirn>' +
      '<label>?</label>' +
      '<index>?</index>' +
      '</speeddial>' +
      '</speeddials>' +
      '<busyLampFields>' +
      '<busyLampField>' +
      '<blfDest>?</blfDest>' +
      '<blfDirn>?</blfDirn>' +
      '<routePartition>?</routePartition>' +
      '<label>?</label>' +
      '<associatedBlfSdFeatures>' +
      '<feature>?</feature>' +
      '</associatedBlfSdFeatures>' +
      '<index>?</index>' +
      '</busyLampField>' +
      '</busyLampFields>' +
      '<primaryPhoneName uuid="?">?</primaryPhoneName>' +
      '<ringSettingIdleBlfAudibleAlert>Default</ringSettingIdleBlfAudibleAlert>' +
      '<ringSettingBusyBlfAudibleAlert>Default</ringSettingBusyBlfAudibleAlert>' +
      '<blfDirectedCallParks>' +
      '<blfDirectedCallPark>' +
      '<label>?</label>' +
      '<directedCallParkId>?</directedCallParkId>' +
      '<directedCallParkDnAndPartition>' +
      '<dnPattern>?</dnPattern>' +
      '<routePartitionName uuid="?">?</routePartitionName>' +
      '</directedCallParkDnAndPartition>' +
      '<index>?</index>' +
      '</blfDirectedCallPark>' +
      '</blfDirectedCallParks>' +
      '<addOnModules>' +
      '<addOnModule>' +
      '<loadInformation special="?">?</loadInformation>' +
      '<model>7914 14-Button Line Expansion Module</model>' +
      '<index>?</index>' +
      '</addOnModule>' +
      '</addOnModules>' +
      '<userLocale>?</userLocale>' +
      '<networkLocale>?</networkLocale>' +
      '<idleTimeout>?</idleTimeout>' +
      '<authenticationUrl>?</authenticationUrl>' +
      '<directoryUrl>?</directoryUrl>' +
      '<idleUrl>?</idleUrl>' +
      '<informationUrl>?</informationUrl>' +
      '<messagesUrl>?</messagesUrl>' +
      '<proxyServerUrl>?</proxyServerUrl>' +
      '<servicesUrl>?</servicesUrl>' +
      '<services>' +
      '<service>' +
      '<telecasterServiceName uuid="?">?</telecasterServiceName>' +
      '<name>?</name>' +
      '<url>?</url>' +
      '<urlButtonIndex>0</urlButtonIndex>' +
      '<urlLabel>?</urlLabel>' +
      '<serviceNameAscii>?</serviceNameAscii>' +
      '</service>' +
      '</services>' +
      '<softkeyTemplateName uuid="?">?</softkeyTemplateName>' +
      '<defaultProfileName uuid="?">?</defaultProfileName>' +
      '<enableExtensionMobility>?</enableExtensionMobility>' +
      '<singleButtonBarge>Default</singleButtonBarge>' +
      '<joinAcrossLines>Default</joinAcrossLines>' +
      '<builtInBridgeStatus>Default</builtInBridgeStatus>' +
      '<callInfoPrivacyStatus>Default</callInfoPrivacyStatus>' +
      '<hlogStatus>?</hlogStatus>' +
      '<ownerUserName uuid="?">?</ownerUserName>' +
      '<ignorePresentationIndicators>false</ignorePresentationIndicators>' +
      '<packetCaptureMode>None</packetCaptureMode>' +
      '<packetCaptureDuration>0</packetCaptureDuration>' +
      '<subscribeCallingSearchSpaceName uuid="?">?</subscribeCallingSearchSpaceName>' +
      '<rerouteCallingSearchSpaceName uuid="?">?</rerouteCallingSearchSpaceName>' +
      '<allowCtiControlFlag>?</allowCtiControlFlag>' +
      '<presenceGroupName uuid="?">?</presenceGroupName>' +
      '<unattendedPort>false</unattendedPort>' +
      '<requireDtmfReception>false</requireDtmfReception>' +
      '<rfc2833Disabled>false</rfc2833Disabled>' +
      '<certificateOperation>No Pending Operation</certificateOperation>' +
      '<authenticationMode>By Null String</authenticationMode>' +
      '<keySize>1024</keySize>' +
      '<keyOrder>RSA Only</keyOrder>' +
      '<ecKeySize>384</ecKeySize>' +
      '<authenticationString>?</authenticationString>' +
      '<upgradeFinishTime>?</upgradeFinishTime>' +
      '<deviceMobilityMode>Default</deviceMobilityMode>' +
      '<remoteDevice>false</remoteDevice>' +
      '<dndOption>Ringer Off</dndOption>' +
      '<dndRingSetting>?</dndRingSetting>' +
      '<dndStatus>?</dndStatus>' +
      '<isActive>true</isActive>' +
      '<mobilityUserIdName uuid="?">?</mobilityUserIdName>' +
      '<phoneSuite>Default</phoneSuite>' +
      '<phoneServiceDisplay>Default</phoneServiceDisplay>' +
      '<isProtected>false</isProtected>' +
      '<mtpRequired>?</mtpRequired>' +
      '<mtpPreferedCodec>711ulaw</mtpPreferedCodec>' +
      '<dialRulesName uuid="?">?</dialRulesName>' +
      '<sshUserId>?</sshUserId>' +
      '<sshPwd>?</sshPwd>' +
      '<digestUser>?</digestUser>' +
      '<outboundCallRollover>No Rollover</outboundCallRollover>' +
      '<hotlineDevice>false</hotlineDevice>' +
      '<secureInformationUrl>?</secureInformationUrl>' +
      '<secureDirectoryUrl>?</secureDirectoryUrl>' +
      '<secureMessageUrl>?</secureMessageUrl>' +
      '<secureServicesUrl>?</secureServicesUrl>' +
      '<secureAuthenticationUrl>?</secureAuthenticationUrl>' +
      '<secureIdleUrl>?</secureIdleUrl>' +
      '<alwaysUsePrimeLine>Default</alwaysUsePrimeLine>' +
      '<alwaysUsePrimeLineForVoiceMessage>Default</alwaysUsePrimeLineForVoiceMessage>' +
      '<featureControlPolicy uuid="?">?</featureControlPolicy>' +
      '<deviceTrustMode>Not Trusted</deviceTrustMode>' +
      '<earlyOfferSupportForVoiceCall>false</earlyOfferSupportForVoiceCall>' +
      '<requireThirdPartyRegistration>?</requireThirdPartyRegistration>' +
      '<blockIncomingCallsWhenRoaming>?</blockIncomingCallsWhenRoaming>' +
      '<homeNetworkId>?</homeNetworkId>' +
      '<AllowPresentationSharingUsingBfcp>false</AllowPresentationSharingUsingBfcp>' +
      '<confidentialAccess>' +
      '<confidentialAccessMode>?</confidentialAccessMode>' +
      '<confidentialAccessLevel>?</confidentialAccessLevel>' +
      '</confidentialAccess>' +
      '<requireOffPremiseLocation>false</requireOffPremiseLocation>' +
      '<allowiXApplicableMedia>false</allowiXApplicableMedia>' +
      '<cgpnIngressDN uuid="?">?</cgpnIngressDN>' +
      '<useDevicePoolCgpnIngressDN>true</useDevicePoolCgpnIngressDN>' +
      '<msisdn>?</msisdn>' +
      '<enableCallRoutingToRdWhenNoneIsActive>false</enableCallRoutingToRdWhenNoneIsActive>' +
      '<wifiHotspotProfile uuid="?">?</wifiHotspotProfile>' +
      '<wirelessLanProfileGroup uuid="?">?</wirelessLanProfileGroup>' +
      '<elinGroup uuid="?">?</elinGroup>' +
      '</ns:updatePhone>' +
      '</soapenv:Body>' +
      '</soapenv:Envelope>'
    );

    const getSoapHeaders = () => ({
      headers: {
        'SOAPAction': `CUCM:DB ver=${this.version} updatePhone`,
        'Authorization': `Basic ${this.authToken}`,
        'Content-Type': 'text/xml; charset=utf-8',
      }
    });

    const callApi = ([soapBody, soapHeaders]) =>
      this.axios.post('', soapBody, soapHeaders)

    const parseResult = result => result.data;
    const xmltoJSON = xml => parser.toJson(xml, {
      trim: true,
      object: true,
      sanitize: true
    });
    const trimJSON = json => _.chain(json)
      .result('soapenv:Envelope')
      .result('soapenv:Body')
      .valueOf();

    // TODO: Error handling at this level

    return Promise.all([
      getSoapBody(pattern),
      getSoapHeaders()
    ])
      .then(callApi)
      .then(parseResult)
      .then(xmltoJSON)
      .then(trimJSON);
  }

	/**
	 * 
	 * 
	 * @param {any} uuid 
	 * @returns {Promise.<Response>} Response promise
	 * 
	 * 
	 */
  updatePhoneByUUID(uuid) {
    const getSoapBody = pattern => new Buffer(
      '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.cisco.com/AXL/API/' + this.version + '">' +
      '<soapenv:Header/>' +
      '<soapenv:Body>' +
      '<ns:updatePhone sequence="?">' +
      '<uuid>' + uuid + '</uuid>' +
      '<newName>?</newName>' +
      '<description>?</description>' +
      '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
      '<devicePoolName uuid="?">?</devicePoolName>' +
      '<commonDeviceConfigName uuid="?">?</commonDeviceConfigName>' +
      '<commonPhoneConfigName uuid="?">?</commonPhoneConfigName>' +
      '<networkLocation>Use System Default</networkLocation>' +
      '<locationName uuid="?">?</locationName>' +
      '<mediaResourceListName uuid="?">?</mediaResouyrceListName>' +
      '<networkHoldMohAudioSourceId>?</networkHoldMohAudioSourceId>' +
      '<userHoldMohAudioSourceId>?</userHoldMohAudioSourceId>' +
      '<loadInformation special="?">?</loadInformation>' +
      '<vendorConfig>' +
      '</vendorConfig>' +
      '<securityProfileName uuid="?">?</securityProfileName>' +
      '<sipProfileName uuid="?">?</sipProfileName>' +
      '<removeLines>' +
      '<line ctiid="?">' +
      '<index>?</index>' +
      '<label>?</label>' +
      '<display>?</display>' +
      '<dirn uuid="?">' +
      '<pattern>?</pattern>' +
      '<routePartitionName uuid="?">?</routePartitionName>' +
      '</dirn>' +
      '<ringSetting>Ring</ringSetting>' +
      '<consecutiveRingSetting>Use System Default</consecutiveRingSetting>' +
      '<ringSettingIdlePickupAlert>Use System Default</ringSettingIdlePickupAlert>' +
      '<ringSettingActivePickupAlert>Use System Default</ringSettingActivePickupAlert>' +
      '<displayAscii>?</displayAscii>' +
      '<e164Mask>?</e164Mask>' +
      '<mwlPolicy>Use System Policy</mwlPolicy>' +
      '<maxNumCalls>2</maxNumCalls>' +
      '<busyTrigger>1</busyTrigger>' +
      '<callInfoDisplay>' +
      '<callerName>true</callerName>' +
      '<callerNumber>false</callerNumber>' +
      '<redirectedNumber>false</redirectedNumber>' +
      '<dialedNumber>true</dialedNumber>' +
      '</callInfoDisplay>' +
      '<recordingProfileName uuid="?">?</recordingProfileName>' +
      '<monitoringCssName uuid="?">?</monitoringCssName>' +
      '<recordingFlag>Call Recording Disabled</recordingFlag>' +
      '<audibleMwi>Default</audibleMwi>' +
      '<speedDial>?</speedDial>' +
      '<partitionUsage>General</partitionUsage>' +
      '<associatedEndusers>' +
      '<enduser>' +
      '<userId>?</userId>' +
      '</enduser>' +
      '</associatedEndusers>' +
      '<missedCallLogging>true</missedCallLogging>' +
      '<recordingMediaSource>Gateway Preferred</recordingMediaSource>' +
      '</line>' +
      '<lineIdentifier>' +
      '<directoryNumber>?</directoryNumber>' +
      '<routePartitionName>?</routePartitionName>' +
      '</lineIdentifier>' +
      '</removeLines>' +
      '<addLines>' +
      '<line ctiid="?">' +
      '<index>?</index>' +
      '<label>?</label>' +
      '<display>?</display>' +
      '<dirn uuid="?">' +
      '<pattern>?</pattern>' +
      '<routePartitionName uuid="?">?</routePartitionName>' +
      '</dirn>' +
      '<ringSetting>Ring</ringSetting>' +
      '<consecutiveRingSetting>Use System Default</consecutiveRingSetting>' +
      '<ringSettingIdlePickupAlert>Use System Default</ringSettingIdlePickupAlert>' +
      '<ringSettingActivePickupAlert>Use System Default</ringSettingActivePickupAlert>' +
      '<displayAscii>?</displayAscii>' +
      '<e164Mask>?</e164Mask>' +
      '<mwlPolicy>Use System Policy</mwlPolicy>' +
      '<maxNumCalls>2</maxNumCalls>' +
      '<busyTrigger>1</busyTrigger>' +
      '<callInfoDisplay>' +
      '<callerName>true</callerName>' +
      '<callerNumber>false</callerNumber>' +
      '<redirectedNumber>false</redirectedNumber>' +
      '<dialedNumber>true</dialedNumber>' +
      '</callInfoDisplay>' +
      '<recordingProfileName uuid="?">?</recordingProfileName>' +
      '<monitoringCssName uuid="?">?</monitoringCssName>' +
      '<recordingFlag>Call Recording Disabled</recordingFlag>' +
      '<audibleMwi>Default</audibleMwi>' +
      '<speedDial>?</speedDial>' +
      '<partitionUsage>General</partitionUsage>' +
      '<associatedEndusers>' +
      '<enduser>' +
      '<userId>?</userId>' +
      '</enduser>' +
      '</associatedEndusers>' +
      '<missedCallLogging>true</missedCallLogging>' +
      '<recordingMediaSource>Gateway Preferred</recordingMediaSource>' +
      '</line>' +
      '<lineIdentifier>' +
      '<directoryNumber>?</directoryNumber>' +
      '<routePartitionName>?</routePartitionName>' +
      '</lineIdentifier>' +
      '</addLines>' +
      '<lines>' +
      '<line ctiid="?">' +
      '<index>?</index>' +
      '<label>?</label>' +
      '<display>?</display>' +
      '<dirn uuid="?">' +
      '<pattern>?</pattern>' +
      '<routePartitionName uuid="?">?</routePartitionName>' +
      '</dirn>' +
      '<ringSetting>Ring</ringSetting>' +
      '<consecutiveRingSetting>Use System Default</consecutiveRingSetting>' +
      '<ringSettingIdlePickupAlert>Use System Default</ringSettingIdlePickupAlert>' +
      '<ringSettingActivePickupAlert>Use System Default</ringSettingActivePickupAlert>' +
      '<displayAscii>?</displayAscii>' +
      '<e164Mask>?</e164Mask>' +
      '<mwlPolicy>Use System Policy</mwlPolicy>' +
      '<maxNumCalls>2</maxNumCalls>' +
      '<busyTrigger>1</busyTrigger>' +
      '<callInfoDisplay>' +
      '<callerName>true</callerName>' +
      '<callerNumber>false</callerNumber>' +
      '<redirectedNumber>false</redirectedNumber>' +
      '<dialedNumber>true</dialedNumber>' +
      '</callInfoDisplay>' +
      '<recordingProfileName uuid="?">?</recordingProfileName>' +
      '<monitoringCssName uuid="?">?</monitoringCssName>' +
      '<recordingFlag>Call Recording Disabled</recordingFlag>' +
      '<audibleMwi>Default</audibleMwi>' +
      '<speedDial>?</speedDial>' +
      '<partitionUsage>General</partitionUsage>' +
      '<associatedEndusers>' +
      '<enduser>' +
      '<userId>?</userId>' +
      '</enduser>' +
      '</associatedEndusers>' +
      '<missedCallLogging>true</missedCallLogging>' +
      '<recordingMediaSource>Gateway Preferred</recordingMediaSource>' +
      '</line>' +
      '<lineIdentifier>' +
      '<directoryNumber>?</directoryNumber>' +
      '<routePartitionName>?</routePartitionName>' +
      '</lineIdentifier>' +
      '</lines>' +
      '<phoneTemplateName uuid="?">?</phoneTemplateName>' +
      '<speeddials>' +
      '<speeddial>' +
      '<dirn>?</dirn>' +
      '<label>?</label>' +
      '<index>?</index>' +
      '</speeddial>' +
      '</speeddials>' +
      '<busyLampFields>' +
      '<busyLampField>' +
      '<blfDest>?</blfDest>' +
      '<blfDirn>?</blfDirn>' +
      '<routePartition>?</routePartition>' +
      '<label>?</label>' +
      '<associatedBlfSdFeatures>' +
      '<feature>?</feature>' +
      '</associatedBlfSdFeatures>' +
      '<index>?</index>' +
      '</busyLampField>' +
      '</busyLampFields>' +
      '<primaryPhoneName uuid="?">?</primaryPhoneName>' +
      '<ringSettingIdleBlfAudibleAlert>Default</ringSettingIdleBlfAudibleAlert>' +
      '<ringSettingBusyBlfAudibleAlert>Default</ringSettingBusyBlfAudibleAlert>' +
      '<blfDirectedCallParks>' +
      '<blfDirectedCallPark>' +
      '<label>?</label>' +
      '<directedCallParkId>?</directedCallParkId>' +
      '<directedCallParkDnAndPartition>' +
      '<dnPattern>?</dnPattern>' +
      '<routePartitionName uuid="?">?</routePartitionName>' +
      '</directedCallParkDnAndPartition>' +
      '<index>?</index>' +
      '</blfDirectedCallPark>' +
      '</blfDirectedCallParks>' +
      '<addOnModules>' +
      '<addOnModule>' +
      '<loadInformation special="?">?</loadInformation>' +
      '<model>7914 14-Button Line Expansion Module</model>' +
      '<index>?</index>' +
      '</addOnModule>' +
      '</addOnModules>' +
      '<userLocale>?</userLocale>' +
      '<networkLocale>?</networkLocale>' +
      '<idleTimeout>?</idleTimeout>' +
      '<authenticationUrl>?</authenticationUrl>' +
      '<directoryUrl>?</directoryUrl>' +
      '<idleUrl>?</idleUrl>' +
      '<informationUrl>?</informationUrl>' +
      '<messagesUrl>?</messagesUrl>' +
      '<proxyServerUrl>?</proxyServerUrl>' +
      '<servicesUrl>?</servicesUrl>' +
      '<services>' +
      '<service>' +
      '<telecasterServiceName uuid="?">?</telecasterServiceName>' +
      '<name>?</name>' +
      '<url>?</url>' +
      '<urlButtonIndex>0</urlButtonIndex>' +
      '<urlLabel>?</urlLabel>' +
      '<serviceNameAscii>?</serviceNameAscii>' +
      '</service>' +
      '</services>' +
      '<softkeyTemplateName uuid="?">?</softkeyTemplateName>' +
      '<defaultProfileName uuid="?">?</defaultProfileName>' +
      '<enableExtensionMobility>?</enableExtensionMobility>' +
      '<singleButtonBarge>Default</singleButtonBarge>' +
      '<joinAcrossLines>Default</joinAcrossLines>' +
      '<builtInBridgeStatus>Default</builtInBridgeStatus>' +
      '<callInfoPrivacyStatus>Default</callInfoPrivacyStatus>' +
      '<hlogStatus>?</hlogStatus>' +
      '<ownerUserName uuid="?">?</ownerUserName>' +
      '<ignorePresentationIndicators>false</ignorePresentationIndicators>' +
      '<packetCaptureMode>None</packetCaptureMode>' +
      '<packetCaptureDuration>0</packetCaptureDuration>' +
      '<subscribeCallingSearchSpaceName uuid="?">?</subscribeCallingSearchSpaceName>' +
      '<rerouteCallingSearchSpaceName uuid="?">?</rerouteCallingSearchSpaceName>' +
      '<allowCtiControlFlag>?</allowCtiControlFlag>' +
      '<presenceGroupName uuid="?">?</presenceGroupName>' +
      '<unattendedPort>false</unattendedPort>' +
      '<requireDtmfReception>false</requireDtmfReception>' +
      '<rfc2833Disabled>false</rfc2833Disabled>' +
      '<certificateOperation>No Pending Operation</certificateOperation>' +
      '<authenticationMode>By Null String</authenticationMode>' +
      '<keySize>1024</keySize>' +
      '<keyOrder>RSA Only</keyOrder>' +
      '<ecKeySize>384</ecKeySize>' +
      '<authenticationString>?</authenticationString>' +
      '<upgradeFinishTime>?</upgradeFinishTime>' +
      '<deviceMobilityMode>Default</deviceMobilityMode>' +
      '<remoteDevice>false</remoteDevice>' +
      '<dndOption>Ringer Off</dndOption>' +
      '<dndRingSetting>?</dndRingSetting>' +
      '<dndStatus>?</dndStatus>' +
      '<isActive>true</isActive>' +
      '<mobilityUserIdName uuid="?">?</mobilityUserIdName>' +
      '<phoneSuite>Default</phoneSuite>' +
      '<phoneServiceDisplay>Default</phoneServiceDisplay>' +
      '<isProtected>false</isProtected>' +
      '<mtpRequired>?</mtpRequired>' +
      '<mtpPreferedCodec>711ulaw</mtpPreferedCodec>' +
      '<dialRulesName uuid="?">?</dialRulesName>' +
      '<sshUserId>?</sshUserId>' +
      '<sshPwd>?</sshPwd>' +
      '<digestUser>?</digestUser>' +
      '<outboundCallRollover>No Rollover</outboundCallRollover>' +
      '<hotlineDevice>false</hotlineDevice>' +
      '<secureInformationUrl>?</secureInformationUrl>' +
      '<secureDirectoryUrl>?</secureDirectoryUrl>' +
      '<secureMessageUrl>?</secureMessageUrl>' +
      '<secureServicesUrl>?</secureServicesUrl>' +
      '<secureAuthenticationUrl>?</secureAuthenticationUrl>' +
      '<secureIdleUrl>?</secureIdleUrl>' +
      '<alwaysUsePrimeLine>Default</alwaysUsePrimeLine>' +
      '<alwaysUsePrimeLineForVoiceMessage>Default</alwaysUsePrimeLineForVoiceMessage>' +
      '<featureControlPolicy uuid="?">?</featureControlPolicy>' +
      '<deviceTrustMode>Not Trusted</deviceTrustMode>' +
      '<earlyOfferSupportForVoiceCall>false</earlyOfferSupportForVoiceCall>' +
      '<requireThirdPartyRegistration>?</requireThirdPartyRegistration>' +
      '<blockIncomingCallsWhenRoaming>?</blockIncomingCallsWhenRoaming>' +
      '<homeNetworkId>?</homeNetworkId>' +
      '<AllowPresentationSharingUsingBfcp>false</AllowPresentationSharingUsingBfcp>' +
      '<confidentialAccess>' +
      '<confidentialAccessMode>?</confidentialAccessMode>' +
      '<confidentialAccessLevel>?</confidentialAccessLevel>' +
      '</confidentialAccess>' +
      '<requireOffPremiseLocation>false</requireOffPremiseLocation>' +
      '<allowiXApplicableMedia>false</allowiXApplicableMedia>' +
      '<cgpnIngressDN uuid="?">?</cgpnIngressDN>' +
      '<useDevicePoolCgpnIngressDN>true</useDevicePoolCgpnIngressDN>' +
      '<msisdn>?</msisdn>' +
      '<enableCallRoutingToRdWhenNoneIsActive>false</enableCallRoutingToRdWhenNoneIsActive>' +
      '<wifiHotspotProfile uuid="?">?</wifiHotspotProfile>' +
      '<wirelessLanProfileGroup uuid="?">?</wirelessLanProfileGroup>' +
      '<elinGroup uuid="?">?</elinGroup>' +
      '</ns:updatePhone>' +
      '</soapenv:Body>' +
      '</soapenv:Envelope>'
    );

    const getSoapHeaders = () => ({
      headers: {
        'SOAPAction': `CUCM:DB ver=${this.version} updatePhone`,
        'Authorization': `Basic ${this.authToken}`,
        'Content-Type': 'text/xml; charset=utf-8',
      }
    });

    const callApi = ([soapBody, soapHeaders]) =>
      this.axios.post('', soapBody, soapHeaders)

    const parseResult = result => result.data;
    const xmltoJSON = xml => parser.toJson(xml, {
      trim: true,
      object: true,
      sanitize: true
    });
    const trimJSON = json => _.chain(json)
      .result('soapenv:Envelope')
      .result('soapenv:Body')
      .valueOf();

    // TODO: Error handling at this level

    return Promise.all([
      getSoapBody(pattern),
      getSoapHeaders()
    ])
      .then(callApi)
      .then(parseResult)
      .then(xmltoJSON)
      .then(trimJSON);
  }

	/**
	 * 
	 * 
	 * @param {any} number 
	 * @returns {Promise.<Response>} Response promise
	 * 
	 * 
	 */
  updateLineByNumber(number) {
    const getSoapBody = pattern => new Buffer(
      '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.cisco.com/AXL/API/' + this.version + '">' +
      '<soapenv:Header/>' +
      '<soapenv:Body>' +
      '<ns:updateLine sequence="?">' +
      '<pattern>' + number + '</pattern>' +
      '<newPattern>?</newPattern>' +
      '<description>?</description>' +
      '<newRoutePartitionName uuid="?">?</newRoutePartitionName>' +
      '<aarNeighborhoodName uuid="?">?</aarNeighborhoodName>' +
      '<aarDestinationMask>?</aarDestinationMask>' +
      '<aarKeepCallHistory>?</aarKeepCallHistory>' +
      '<aarVoiceMailEnabled>?</aarVoiceMailEnabled>' +
      '<callForwardAll>' +
      '<forwardToVoiceMail>?</forwardToVoiceMail>' +
      '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
      '<secondaryCallingSearchSpaceName uuid="?">?</secondaryCallingSearchSpaceName>' +
      '<destination>?</destination>' +
      '</callForwardAll>' +
      '<callForwardBusy>' +
      '<forwardToVoiceMail>?</forwardToVoiceMail>' +
      '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
      '<destination>?</destination>' +
      '</callForwardBusy>' +
      '<callForwardBusyInt>' +
      '<forwardToVoiceMail>?</forwardToVoiceMail>' +
      '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
      '<destination>?</destination>' +
      '</callForwardBusyInt>' +
      '<callForwardNoAnswer>' +
      '<forwardToVoiceMail>?</forwardToVoiceMail>' +
      '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
      '<destination>?</destination>' +
      '<duration>?</duration>' +
      '</callForwardNoAnswer>' +
      '<callForwardNoAnswerInt>' +
      '<forwardToVoiceMail>?</forwardToVoiceMail>' +
      '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
      '<destination>?</destination>' +
      '<duration>?</duration>' +
      '</callForwardNoAnswerInt>' +
      '<callForwardNoCoverage>' +
      '<forwardToVoiceMail>?</forwardToVoiceMail>' +
      '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
      '<destination>?</destination>' +
      '</callForwardNoCoverage>' +
      '<callForwardNoCoverageInt>' +
      '<forwardToVoiceMail>?</forwardToVoiceMail>' +
      '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
      '<destination>?</destination>' +
      '</callForwardNoCoverageInt>' +
      '<callForwardOnFailure>' +
      '<forwardToVoiceMail>?</forwardToVoiceMail>' +
      '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
      '<destination>?</destination>' +
      '</callForwardOnFailure>' +
      '<callForwardAlternateParty>' +
      '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
      '<destination>?</destination>' +
      '<duration>?</duration>' +
      '</callForwardAlternateParty>' +
      '<callForwardNotRegistered>' +
      '<forwardToVoiceMail>?</forwardToVoiceMail>' +
      '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
      '<destination>?</destination>' +
      '</callForwardNotRegistered>' +
      '<callForwardNotRegisteredInt>' +
      '<forwardToVoiceMail>?</forwardToVoiceMail>' +
      '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
      '<destination>?</destination>' +
      '</callForwardNotRegisteredInt>' +
      '<callPickupGroupName uuid="?">?</callPickupGroupName>' +
      '<autoAnswer>Auto Answer Off</autoAnswer>' +
      '<networkHoldMohAudioSourceId>?</networkHoldMohAudioSourceId>' +
      '<userHoldMohAudioSourceId>?</userHoldMohAudioSourceId>' +
      '<alertingName>?</alertingName>' +
      '<asciiAlertingName>?</asciiAlertingName>' +
      '<presenceGroupName uuid="?">?</presenceGroupName>' +
      '<shareLineAppearanceCssName uuid="?">?</shareLineAppearanceCssName>' +
      '<voiceMailProfileName uuid="?">?</voiceMailProfileName>' +
      '<patternPrecedence>Default</patternPrecedence>' +
      '<releaseClause>No Error</releaseClause>' +
      '<hrDuration>?</hrDuration>' +
      '<hrInterval>?</hrInterval>' +
      '<cfaCssPolicy>Use System Default</cfaCssPolicy>' +
      '<defaultActivatedDeviceName uuid="?">?</defaultActivatedDeviceName>' +
      '<parkMonForwardNoRetrieveDn>?</parkMonForwardNoRetrieveDn>' +
      '<parkMonForwardNoRetrieveIntDn>?</parkMonForwardNoRetrieveIntDn>' +
      '<parkMonForwardNoRetrieveVmEnabled>?</parkMonForwardNoRetrieveVmEnabled>' +
      '<parkMonForwardNoRetrieveIntVmEnabled>?</parkMonForwardNoRetrieveIntVmEnabled>' +
      '<parkMonForwardNoRetrieveCssName uuid="?">?</parkMonForwardNoRetrieveCssName>' +
      '<parkMonForwardNoRetrieveIntCssName uuid="?">?</parkMonForwardNoRetrieveIntCssName>' +
      '<parkMonReversionTimer>?</parkMonReversionTimer>' +
      '<partyEntranceTone>Default</partyEntranceTone>' +
      '<directoryURIs>' +
      '<directoryUri>' +
      '<isPrimary>?</isPrimary>' +
      '<uri>?</uri>' +
      '<partition uuid="?">?</partition>' +
      '<advertiseGloballyViaIls>true</advertiseGloballyViaIls>' +
      '</directoryUri>' +
      '</directoryURIs>' +
      '<allowCtiControlFlag>true</allowCtiControlFlag>' +
      '<rejectAnonymousCall>?</rejectAnonymousCall>' +
      '<patternUrgency>false</patternUrgency>' +
      '<confidentialAccess>' +
      '<confidentialAccessMode>?</confidentialAccessMode>' +
      '<confidentialAccessLevel>?</confidentialAccessLevel>' +
      '</confidentialAccess>' +
      '<externalCallControlProfile uuid="?">?</externalCallControlProfile>' +
      '<enterpriseAltNum>' +
      '<numMask>?</numMask>' +
      '<isUrgent>false</isUrgent>' +
      '<addLocalRoutePartition>true</addLocalRoutePartition>' +
      '<routePartition uuid="?">?</routePartition>' +
      '<advertiseGloballyIls>true</advertiseGloballyIls>' +
      '</enterpriseAltNum>' +
      '<e164AltNum>' +
      '<numMask>?</numMask>' +
      '<isUrgent>false</isUrgent>' +
      '<addLocalRoutePartition>true</addLocalRoutePartition>' +
      '<routePartition uuid="?">?</routePartition>' +
      '<advertiseGloballyIls>true</advertiseGloballyIls>' +
      '</e164AltNum>' +
      '<pstnFailover>?</pstnFailover>' +
      '<callControlAgentProfile>?</callControlAgentProfile>' +
      '<useEnterpriseAltNum>?</useEnterpriseAltNum>' +
      '<useE164AltNum>?</useE164AltNum>' +
      '<active>true</active>' +
      '</ns:updateLine>' +
      '</soapenv:Body>' +
      '</soapenv:Envelope>'
    );

    const getSoapHeaders = () => ({
      headers: {
        'SOAPAction': `CUCM:DB ver=${this.version} updateLine`,
        'Authorization': `Basic ${this.authToken}`,
        'Content-Type': 'text/xml; charset=utf-8',
      }
    });

    const callApi = ([soapBody, soapHeaders]) =>
      this.axios.post('', soapBody, soapHeaders)

    const parseResult = result => result.data;
    const xmltoJSON = xml => parser.toJson(xml, {
      trim: true,
      object: true,
      sanitize: true
    });
    const trimJSON = json => _.chain(json)
      .result('soapenv:Envelope')
      .result('soapenv:Body')
      .valueOf();

    // TODO: Error handling at this level

    return Promise.all([
      getSoapBody(pattern),
      getSoapHeaders()
    ])
      .then(callApi)
      .then(parseResult)
      .then(xmltoJSON)
      .then(trimJSON);
  }

	/**
	 * 
	 * 
	 * @param {any} number 
	 * @returns {Promise.<Response>} Response promise
	 * 
	 * @memberOf AXL
	 */
  updateLineByUUID(number) {
    const getSoapBody = pattern => new Buffer(
      '<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="http://www.cisco.com/AXL/API/' + this.version + '">' +
      '<soapenv:Header/>' +
      '<soapenv:Body>' +
      '<ns:updateLine sequence="?">' +
      '<uuid>' + uuid + '</uuid>' +
      '<newPattern>?</newPattern>' +
      '<description>?</description>' +
      '<newRoutePartitionName uuid="?">?</newRoutePartitionName>' +
      '<aarNeighborhoodName uuid="?">?</aarNeighborhoodName>' +
      '<aarDestinationMask>?</aarDestinationMask>' +
      '<aarKeepCallHistory>?</aarKeepCallHistory>' +
      '<aarVoiceMailEnabled>?</aarVoiceMailEnabled>' +
      '<callForwardAll>' +
      '<forwardToVoiceMail>?</forwardToVoiceMail>' +
      '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
      '<secondaryCallingSearchSpaceName uuid="?">?</secondaryCallingSearchSpaceName>' +
      '<destination>?</destination>' +
      '</callForwardAll>' +
      '<callForwardBusy>' +
      '<forwardToVoiceMail>?</forwardToVoiceMail>' +
      '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
      '<destination>?</destination>' +
      '</callForwardBusy>' +
      '<callForwardBusyInt>' +
      '<forwardToVoiceMail>?</forwardToVoiceMail>' +
      '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
      '<destination>?</destination>' +
      '</callForwardBusyInt>' +
      '<callForwardNoAnswer>' +
      '<forwardToVoiceMail>?</forwardToVoiceMail>' +
      '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
      '<destination>?</destination>' +
      '<duration>?</duration>' +
      '</callForwardNoAnswer>' +
      '<callForwardNoAnswerInt>' +
      '<forwardToVoiceMail>?</forwardToVoiceMail>' +
      '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
      '<destination>?</destination>' +
      '<duration>?</duration>' +
      '</callForwardNoAnswerInt>' +
      '<callForwardNoCoverage>' +
      '<forwardToVoiceMail>?</forwardToVoiceMail>' +
      '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
      '<destination>?</destination>' +
      '</callForwardNoCoverage>' +
      '<callForwardNoCoverageInt>' +
      '<forwardToVoiceMail>?</forwardToVoiceMail>' +
      '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
      '<destination>?</destination>' +
      '</callForwardNoCoverageInt>' +
      '<callForwardOnFailure>' +
      '<forwardToVoiceMail>?</forwardToVoiceMail>' +
      '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
      '<destination>?</destination>' +
      '</callForwardOnFailure>' +
      '<callForwardAlternateParty>' +
      '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
      '<destination>?</destination>' +
      '<duration>?</duration>' +
      '</callForwardAlternateParty>' +
      '<callForwardNotRegistered>' +
      '<forwardToVoiceMail>?</forwardToVoiceMail>' +
      '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
      '<destination>?</destination>' +
      '</callForwardNotRegistered>' +
      '<callForwardNotRegisteredInt>' +
      '<forwardToVoiceMail>?</forwardToVoiceMail>' +
      '<callingSearchSpaceName uuid="?">?</callingSearchSpaceName>' +
      '<destination>?</destination>' +
      '</callForwardNotRegisteredInt>' +
      '<callPickupGroupName uuid="?">?</callPickupGroupName>' +
      '<autoAnswer>Auto Answer Off</autoAnswer>' +
      '<networkHoldMohAudioSourceId>?</networkHoldMohAudioSourceId>' +
      '<userHoldMohAudioSourceId>?</userHoldMohAudioSourceId>' +
      '<alertingName>?</alertingName>' +
      '<asciiAlertingName>?</asciiAlertingName>' +
      '<presenceGroupName uuid="?">?</presenceGroupName>' +
      '<shareLineAppearanceCssName uuid="?">?</shareLineAppearanceCssName>' +
      '<voiceMailProfileName uuid="?">?</voiceMailProfileName>' +
      '<patternPrecedence>Default</patternPrecedence>' +
      '<releaseClause>No Error</releaseClause>' +
      '<hrDuration>?</hrDuration>' +
      '<hrInterval>?</hrInterval>' +
      '<cfaCssPolicy>Use System Default</cfaCssPolicy>' +
      '<defaultActivatedDeviceName uuid="?">?</defaultActivatedDeviceName>' +
      '<parkMonForwardNoRetrieveDn>?</parkMonForwardNoRetrieveDn>' +
      '<parkMonForwardNoRetrieveIntDn>?</parkMonForwardNoRetrieveIntDn>' +
      '<parkMonForwardNoRetrieveVmEnabled>?</parkMonForwardNoRetrieveVmEnabled>' +
      '<parkMonForwardNoRetrieveIntVmEnabled>?</parkMonForwardNoRetrieveIntVmEnabled>' +
      '<parkMonForwardNoRetrieveCssName uuid="?">?</parkMonForwardNoRetrieveCssName>' +
      '<parkMonForwardNoRetrieveIntCssName uuid="?">?</parkMonForwardNoRetrieveIntCssName>' +
      '<parkMonReversionTimer>?</parkMonReversionTimer>' +
      '<partyEntranceTone>Default</partyEntranceTone>' +
      '<directoryURIs>' +
      '<directoryUri>' +
      '<isPrimary>?</isPrimary>' +
      '<uri>?</uri>' +
      '<partition uuid="?">?</partition>' +
      '<advertiseGloballyViaIls>true</advertiseGloballyViaIls>' +
      '</directoryUri>' +
      '</directoryURIs>' +
      '<allowCtiControlFlag>true</allowCtiControlFlag>' +
      '<rejectAnonymousCall>?</rejectAnonymousCall>' +
      '<patternUrgency>false</patternUrgency>' +
      '<confidentialAccess>' +
      '<confidentialAccessMode>?</confidentialAccessMode>' +
      '<confidentialAccessLevel>?</confidentialAccessLevel>' +
      '</confidentialAccess>' +
      '<externalCallControlProfile uuid="?">?</externalCallControlProfile>' +
      '<enterpriseAltNum>' +
      '<numMask>?</numMask>' +
      '<isUrgent>false</isUrgent>' +
      '<addLocalRoutePartition>true</addLocalRoutePartition>' +
      '<routePartition uuid="?">?</routePartition>' +
      '<advertiseGloballyIls>true</advertiseGloballyIls>' +
      '</enterpriseAltNum>' +
      '<e164AltNum>' +
      '<numMask>?</numMask>' +
      '<isUrgent>false</isUrgent>' +
      '<addLocalRoutePartition>true</addLocalRoutePartition>' +
      '<routePartition uuid="?">?</routePartition>' +
      '<advertiseGloballyIls>true</advertiseGloballyIls>' +
      '</e164AltNum>' +
      '<pstnFailover>?</pstnFailover>' +
      '<callControlAgentProfile>?</callControlAgentProfile>' +
      '<useEnterpriseAltNum>?</useEnterpriseAltNum>' +
      '<useE164AltNum>?</useE164AltNum>' +
      '<active>true</active>' +
      '</ns:updateLine>' +
      '</soapenv:Body>' +
      '</soapenv:Envelope>'
    );

    const getSoapHeaders = () => ({
      headers: {
        'SOAPAction': `CUCM:DB ver=${this.version} updateLine`,
        'Authorization': `Basic ${this.authToken}`,
        'Content-Type': 'text/xml; charset=utf-8',
      }
    });

    const callApi = ([soapBody, soapHeaders]) =>
      this.axios.post('', soapBody, soapHeaders)

    const parseResult = result => result.data;
    const xmltoJSON = xml => parser.toJson(xml, {
      trim: true,
      object: true,
      sanitize: true
    });
    const trimJSON = json => _.chain(json)
      .result('soapenv:Envelope')
      .result('soapenv:Body')
      .valueOf();

    // TODO: Error handling at this level

    return Promise.all([
      getSoapBody(pattern),
      getSoapHeaders()
    ])
      .then(callApi)
      .then(parseResult)
      .then(xmltoJSON)
      .then(trimJSON);
  }

	/**
	 * 
	 * 
	 * @param {any} uuid 
	 * @returns {Promise.<Response>} Response promise
	 * 
	 * @memberOf AXL
	 */
  doLdapSync(uuid) {
    const getSoapBody = uuid => new Buffer(
      this.getSoapEnv().replace(
        '{{body}}',
        '<ns:doLdapSync sequence="?">' +
        '<uuid>' + uuid + '</uuid>' +
        '<sync>t</sync>' +
        '<returnedTags uuid="?">' +
        '</returnedTags>' +
        '</ns:doLdapSync>'
      )
    );

    // Didn't Convert this Because the Result is a One-Off
    const trimJSON = json => _.chain(json)
      .result('soapenv:Envelope')
      .result('soapenv:Body')
      .valueOf();

    // TODO: Error handling at this level

    return Promise.all([
      getSoapBody(uuid),
      this.getSoapHeaders('doLdapSync')
    ])
      .then(this.callApi)
      .then(this.parseResult)
      .then(this.convertXml)
      .then(trimJSON);
  }

	/**
	 * 
	 * 
	 * @param {any} user 
	 * @param {any} pin 
	 * @returns {Promise.<Response>} Response promise
	 * 
	 * @memberOf AXL
	 */
  updateUserPin(user, pin) {
    const getSoapBody = (user, pin) => new Buffer(
      this.getSoapEnv().replace(
        '{{body}}',
        '<ns:updateUser sequence="?">' +
        '<userid>' + user + '</userid>' +
        '<pin>' + pin + '</pin>' +
        '<pinCredentials>' +
        '<pinResetHackCount>t</pinResetHackCount>' +
        '</pinCredentials>' +
        '</ns:updateUser>'
      )
    );

    const trimJSON = json => _.chain(json)
      .result('soapenv:Envelope')
      .result('soapenv:Body')
      .valueOf();

    // TODO: Error handling at this level

    return Promise.all([
      getSoapBody(user, pin),
      this.getSoapHeaders('updateUser')
    ])
      .then(this.callApi)
      .then(this.parseResult)
      .then(this.convertXml)
      .then(trimJSON);
  }

}

module.exports = AXL;