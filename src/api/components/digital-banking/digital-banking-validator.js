const joi = require('joi');

module.exports = {
  login: {
    body: {
      email: joi.string().email().required().label('Email'),
      pin: joi.string().min(6).max(6).required().label('PIN'),
    },
  },

  createAccount: {
    body: {
      id_number: joi.string().required().label('National Identity Number'),
      name: joi.string().min(1).max(100).required().label('Name'),
      email: joi.string().email().required().label('Email'),
      phone: joi.string().required().label('Phone Number'),
      birth_place: joi.string().required().label('Birth Place'),
      birth_date: joi.date().max('now').required().label('Birth Date'),
      address: joi.string().required().label('Address'),
      pin: joi.string().min(6).max(6).required().label('PIN'),
      pin_confirm: joi.string().required().label('PIN confirmation'),
    },
  },

  updateAccount: {
    body: {
      name: joi.string().min(1).max(100).required().label('Name'),
      email: joi.string().email().required().label('Email'),
      phone: joi.string().required().label('Phone Number'),
      address: joi.string().required().label('Address'),
    },
  },

  changePin: {
    body: {
      pin_old: joi.string().required().label('Old PIN'),
      pin_new: joi.string().min(6).max(6).required().label('New PIN'),
      pin_confirm: joi.string().required().label('PIN confirmation'),
    },
  },

  withdrawBalance: {
    body: {
      pin: joi.string().min(6).max(6).required().label('PIN'),
      withdraw: joi.number().required().label('Withdraw'),
    },
  },

  depositBalance: {
    body: {
      pin: joi.string().min(6).max(6).required().label('PIN'),
      deposit: joi.number().required().label('Deposit'),
    },
  },

  transferBalance: {
    body: {
      pin: joi.string().min(6).max(6).required().label('PIN'),
      transfer: joi.number().required().label('Transfer'),
      to_id: joi.string().required().label('Transfer to id'),
    },
  },
};
