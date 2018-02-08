<a name="AXL"></a>

## AXL
AXL

**Kind**: global class  
**Properties**

| Name | Type |
| --- | --- |
| options | <code>Object.&lt;Options&gt;</code> | 


* [AXL](#AXL)
    * [new AXL(options)](#new_AXL_new)
    * [.listRoutePlan(pattern)](#AXL+listRoutePlan) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.listTransPattern(pattern)](#AXL+listTransPattern) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.listLdapDirectory()](#AXL+listLdapDirectory) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getPhoneByUUID(uuid)](#AXL+getPhoneByUUID) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getPhoneByName(name)](#AXL+getPhoneByName) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getLine(pattern)](#AXL+getLine) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.getTransPattern(uuid)](#AXL+getTransPattern) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.updatePhoneByName(name)](#AXL+updatePhoneByName) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.updatePhoneByUUID(uuid)](#AXL+updatePhoneByUUID) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.updateLineByNumber(number)](#AXL+updateLineByNumber) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.updateLineByUUID(number)](#AXL+updateLineByUUID) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.doLdapSync(uuid)](#AXL+doLdapSync) ⇒ <code>Promise.&lt;Response&gt;</code>
    * [.updateUserPin(user, pin)](#AXL+updateUserPin) ⇒ <code>Promise.&lt;Response&gt;</code>

<a name="new_AXL_new"></a>

### new AXL(options)

| Param | Type |
| --- | --- |
| options | <code>Object.&lt;Options&gt;</code> | 

**Example**  
```js
const AXL = require('node-cisco-axl);

var axlOptions = {
host: process.env.CUCM,
user: process.env.AXLUSER,
pass: process.env.AXLPASS,
version: process.env.AXLVERSION
}

const axl = new AXL(axlOptions);

axl.listRoutePlan('9109200040')
   .then(uuid =>{
   console.log('uuid: '+uuid);
});
```
<a name="AXL+listRoutePlan"></a>

### axL.listRoutePlan(pattern) ⇒ <code>Promise.&lt;Response&gt;</code>
**Kind**: instance method of [<code>AXL</code>](#AXL)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - Response promise  

| Param | Type |
| --- | --- |
| pattern | <code>any</code> | 

<a name="AXL+listTransPattern"></a>

### axL.listTransPattern(pattern) ⇒ <code>Promise.&lt;Response&gt;</code>
**Kind**: instance method of [<code>AXL</code>](#AXL)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - Response promise  

| Param | Type |
| --- | --- |
| pattern | <code>any</code> | 

<a name="AXL+listLdapDirectory"></a>

### axL.listLdapDirectory() ⇒ <code>Promise.&lt;Response&gt;</code>
**Kind**: instance method of [<code>AXL</code>](#AXL)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - Response promise  
<a name="AXL+getPhoneByUUID"></a>

### axL.getPhoneByUUID(uuid) ⇒ <code>Promise.&lt;Response&gt;</code>
**Kind**: instance method of [<code>AXL</code>](#AXL)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - Response promise  

| Param | Type |
| --- | --- |
| uuid | <code>any</code> | 

<a name="AXL+getPhoneByName"></a>

### axL.getPhoneByName(name) ⇒ <code>Promise.&lt;Response&gt;</code>
**Kind**: instance method of [<code>AXL</code>](#AXL)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - Response promise  

| Param | Type |
| --- | --- |
| name | <code>any</code> | 

<a name="AXL+getLine"></a>

### axL.getLine(pattern) ⇒ <code>Promise.&lt;Response&gt;</code>
**Kind**: instance method of [<code>AXL</code>](#AXL)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - Response promise  

| Param | Type |
| --- | --- |
| pattern | <code>any</code> | 

<a name="AXL+getTransPattern"></a>

### axL.getTransPattern(uuid) ⇒ <code>Promise.&lt;Response&gt;</code>
**Kind**: instance method of [<code>AXL</code>](#AXL)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - Response promise  

| Param | Type |
| --- | --- |
| uuid | <code>any</code> | 

<a name="AXL+updatePhoneByName"></a>

### axL.updatePhoneByName(name) ⇒ <code>Promise.&lt;Response&gt;</code>
**Kind**: instance method of [<code>AXL</code>](#AXL)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - Response promise  

| Param | Type |
| --- | --- |
| name | <code>any</code> | 

<a name="AXL+updatePhoneByUUID"></a>

### axL.updatePhoneByUUID(uuid) ⇒ <code>Promise.&lt;Response&gt;</code>
**Kind**: instance method of [<code>AXL</code>](#AXL)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - Response promise  

| Param | Type |
| --- | --- |
| uuid | <code>any</code> | 

<a name="AXL+updateLineByNumber"></a>

### axL.updateLineByNumber(number) ⇒ <code>Promise.&lt;Response&gt;</code>
**Kind**: instance method of [<code>AXL</code>](#AXL)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - Response promise  

| Param | Type |
| --- | --- |
| number | <code>any</code> | 

<a name="AXL+updateLineByUUID"></a>

### axL.updateLineByUUID(number) ⇒ <code>Promise.&lt;Response&gt;</code>
**Kind**: instance method of [<code>AXL</code>](#AXL)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - Response promise  

| Param | Type |
| --- | --- |
| number | <code>any</code> | 

<a name="AXL+doLdapSync"></a>

### axL.doLdapSync(uuid) ⇒ <code>Promise.&lt;Response&gt;</code>
**Kind**: instance method of [<code>AXL</code>](#AXL)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - Response promise  

| Param | Type |
| --- | --- |
| uuid | <code>any</code> | 

<a name="AXL+updateUserPin"></a>

### axL.updateUserPin(user, pin) ⇒ <code>Promise.&lt;Response&gt;</code>
**Kind**: instance method of [<code>AXL</code>](#AXL)  
**Returns**: <code>Promise.&lt;Response&gt;</code> - Response promise  

| Param | Type |
| --- | --- |
| user | <code>any</code> | 
| pin | <code>any</code> | 

