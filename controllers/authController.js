const bcrypt = require('bcryptjs');

const User = require('../models/User');

module.exports = {
  viewLogin: async (req, res) => {
    try {
      // Setting flash message
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };

      if (req.session.user === null || req.session.user === undefined) {
        res.render('index', {
          alert,
          title: 'Staycation | Login',
        });
      } else {
        res.redirect('/admin/dashboard');
      }

    } catch (error) {
      res.redirect('/'); 
    }
  },

  actionLogin: async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await User.findOne({ username: username });
      if (!user) {
        req.flash('alertMessage', 'Username is Not Found');
        req.flash('alertStatus', 'danger');
        res.redirect('/');
      }

      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        req.flash('alertMessage', 'Your password is wrong');
        req.flash('alertStatus', 'danger');
        res.redirect('/');
      }

      req.session.user = {
        id: user._id,
        username: user.username,
      };

      res.redirect('/admin/dashboard');
    } catch (error) {
      res.redirect('/');
    }
  },

  actionLogout: (req, res) => {
    req.session.destroy();
    res.redirect('/');
  },
};
