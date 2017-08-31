'use strict';

const StringVariables = {
  AT: '@',
  EMPTY: '',
  SPACE: ' ',
  SUCCESS_MSG: 'Success',
}

const ResponseCodes = {
  SUCCESS: 'success',
  ERROR: 'error',
  PROGRESS: 'progress',
}

const Styles = {
  SUCCESS: 'success',
  ERROR: 'error',
}

const getInputSelectorByName = (name) => {
  return `input[name='${name}']`;
}

const getElemSelectorById = (id) => {
  return `#${id}`;
}

class MyFormClass {

  constructor(elems, inputs, allowedDomains) {
    this.allowedDomains = allowedDomains;
    this.inputs = inputs;
    this.elems = elems;
    this.re = {
      digits: /\d+/g,
      phone: /^\+7\([0-9]{3}\)[0-9]{3}\-[0-9]{2}-[0-9]{2}$/,
      email: /^([A-Za-z])([A-Za-z0-9\.\_]*)$/
    }  
  }

  validate() {
    let isValid = false;
    const errorFields = [];
    const form = this.getData();

    const fio = form.fio.trim().split(StringVariables.SPACE);
    if (fio.length != 3) {
      errorFields.push(this.inputs.fio);
    }

    const email = form.email.trim().split(StringVariables.AT);
    if (!this.re.email.test(email[0]) || this.allowedDomains.indexOf(email[1]) == -1) {
      errorFields.push(this.inputs.email);
    }

    const phone = form.phone.trim();
    const digits = phone.match(this.re.digits) || []; 
    let sum = 0;
    for (let el of digits.join(StringVariables.EMPTY).split(StringVariables.EMPTY)) {
      sum += parseInt(el);
    }
    if (sum > 30 || !this.re.phone.test(phone)) {
      errorFields.push(this.inputs.phone);        
    } 

    return {
      isValid: errorFields.length == 0,
      errorFields: errorFields
    } 
  }

  getData() {
    return {
      fio: $(getInputSelectorByName(this.inputs.fio)).val(),
      email: $(getInputSelectorByName(this.inputs.email)).val(),
      phone: $(getInputSelectorByName(this.inputs.phone)).val(),
    }
  }

  setData(obj) {
    if (obj.fio) {
      $(getInputSelectorByName(this.inputs.fio)).val(obj.fio);    
    }
    if (obj.email) { 
      $(getInputSelectorByName(this.inputs.email)).val(obj.email);
    }
    if (obj.phone) { 
      $(getInputSelectorByName(this.inputs.phone)).val(obj.phone);
    }
  }

  submit() {
    for (let name in this.inputs) {
      $(getInputSelectorByName(name)).removeClass(Styles.ERROR);
    }

    const result = this.validate();

    if (!result.isValid) {
      if (result.errorFields) {
        for (let name of result.errorFields) {
          $(getInputSelectorByName(name)).addClass(Styles.ERROR);
        }
      }
    } else {
      $(getElemSelectorById(this.elems.btn)).prop('disabled', true);

      const url = $(getElemSelectorById(this.elems.form)).attr('action');
      const $resultContainer = $(getElemSelectorById(this.elems.result));

      const send = (url, $resultContainer) => {     
        $.get(url, (response) => {      
          if (response.status == ResponseCodes.SUCCESS) {
            $resultContainer.addClass(Styles.SUCCESS);
            $resultContainer.text(StringVariables.SUCCESS_MSG);
          } else if (response.status == ResponseCodes.ERROR) {
            $resultContainer.addClass(Styles.ERROR);
            $resultContainer.text(response.reason);
          } else if (response.status == ResponseCodes.PROGRESS) {
            setTimeout(() => send(url, $resultContainer), response.timeout);
          }
        });
      }

      send(url, $resultContainer);
    }
  }

}

const MyForm = new MyFormClass(
  { btn: 'submitButton', form: 'myForm', result: 'resultContainer' },
  { fio: 'fio', email: 'email', phone: 'phone' },
  ['ya.ru','yandex.ru','yandex.ua','yandex.by','yandex.kz','yandex.com']
);
