const fs = require('fs-extra');
const path = require('path');

const Category = require('../models/Category');
const Bank = require('../models/Bank');
const Item = require('../models/Item');
const Image = require('../models/Image');
const Feature = require('../models/Feature');
const Activity = require('../models/Activity');
const Booking = require('../models/Booking');
const Member = require('../models/Member');

module.exports = {
  viewDashboard: async (req, res) => {
    try {
      const member = await Member.find();
      const booking = await Booking.find();
      const item = await Item.find();

      res.render('admin/dashboard/view_dashboard', {
        title: 'Staycation - Dashboard',
        user: req.session.user,
        member,
        booking,
        item,
      });
    } catch(error) {
      res.redirect('/admin/dashboard');
    }
  },

  viewCategory: async (req, res) => {
    try {
      const categories = await Category.find();

      // Setting flash message
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };

      res.render('admin/category/view_category', {
        categories,
        alert,
        title: 'Staycation - Category',
        user: req.session.user,
      });
    } catch(error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/category');
    }
  },

  addCategory: async (req, res) => {
    try {
      const { name } = req.body;
      await Category.create({ name });

      // setting flash message
      req.flash('alertMessage', 'Success Add Category');
      req.flash('alertStatus', 'success');
      res.redirect('/admin/category');
    } catch(error) {
      // setting flash message
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/category');
    }
  },

  editCategory: async (req, res) => {
    try {
      const { id, name } = req.body;
      const category = await Category.findOne({ _id: id });
      category.name = name;
      await category.save();

      // setting flash message
      req.flash('alertMessage', 'Success Update Category');
      req.flash('alertStatus', 'success');
      res.redirect('/admin/category');
    } catch (error) {
      // setting flash message
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/category');
    }
  },

  deleteCategory: async (req, res) => {
    try {
      const { id } = req.params;
      const category = await Category.findOne({ _id: id });
      await category.remove();

      // setting flash message
      req.flash('alertMessage', 'Success Delete Category');
      req.flash('alertStatus', 'success');
      res.redirect('/admin/category')
    } catch (error) {
      // setting flash message
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/category');
    }
  },

  viewBank: async (req, res) => {
    try {
      const banks = await Bank.find();

      // Setting flash message
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };

      res.render('admin/bank/view_bank', {
        title: 'Staycation - Bank',
        alert,
        banks,
        user: req.session.user,
      });
    } catch(error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/bank');
    }
  },

  addBank: async (req, res) => {
    try {
      const { bankName, accountNumber, name } = req.body;

      await Bank.create({
        bankName,
        accountNumber,
        name,
        imageUrl: `images/${req.file.filename}`,
      });

      // setting flash message
      req.flash('alertMessage', 'Success Add Bank');
      req.flash('alertStatus', 'success');
      res.redirect('/admin/bank');
    } catch(error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/bank');
    }
  },

  editBank: async (req, res) => {
    try {
      const { id, bankName, accountNumber, name } = req.body;
      const bank = await Bank.findOne({ _id: id });

      if (req.file !== undefined) {
        if (fs.existsSync(path.join(`public/${bank.imageUrl}`))) {
          await fs.unlink(path.join(`public/${bank.imageUrl}`));
        }
        bank.imageUrl = `images/${req.file.filename}`;
      }

      bank.bankName = bankName;
      bank.accountNumber = accountNumber;
      bank.name = name;
      await bank.save();

      // setting flash message
      req.flash('alertMessage', 'Success Update Bank');
      req.flash('alertStatus', 'success');
      res.redirect('/admin/bank');
    } catch(error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/bank');
    }
  },

  deleteBank: async (req, res) => {
    try {
      const { id } = req.params;
      const bank = await Bank.findOne({ _id: id });

      if (fs.existsSync(path.join(`public/${bank.imageUrl}`))) {
        await fs.unlink(path.join(`public/${bank.imageUrl}`));
      }

      await bank.remove();

      // setting flash message
      req.flash('alertMessage', 'Success Delete Bank');
      req.flash('alertStatus', 'success');
      res.redirect('/admin/bank');
    } catch(error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/bank');
    }
  },

  viewItem: async (req, res) => {
    try {
      const categories = await Category.find();
      const items = await Item.find()
        .populate({ path: 'imageId', select: 'id imageUrl' })
        .populate({ path: 'categoryId', select: 'id name' });

      // Setting flash message
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };

      res.render('admin/item/view_item', {
        title: 'Staycation - Item',
        categories,
        alert,
        items,
        action: 'view',
        user: req.session.user,
      });
    } catch(error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/item');
    }
  },

  addItem: async (req, res) => {
    try {
      // ambil data yang dikirim dari form
      const {
        title,
        price,
        city,
        category: categoryId,
        unit,
        descriptionItem,
      } = req.body;

      // jika ada gambar yang dikirim
      if (req.files.length > 0) {
        const category = await Category.findOne({ _id: categoryId });

        const newItem = {
          title,
          price,
          city,
          description: descriptionItem,
          unit,
          categoryId: category._id,
        };

        // menyimpan item baru di collection item
        const item = await Item.create(newItem);

        // mengupdate data itemId di collection category
        category.itemId.push({ _id: item._id });
        await category.save();

        for (let i = 0; i < req.files.length; i++) {
          // meyimpan gambar baru di collection image
          const imageSave = await Image.create({
            imageUrl: `images/${req.files[i].filename}`
          });

          // mengupdate data imageId di collection item
          item.imageId.push({ _id: imageSave._id });
          await item.save();
        };

        // setting flash message
        req.flash('alertMessage', 'Success Add Item');
        req.flash('alertStatus', 'success');
        res.redirect('/admin/item');
      }

    } catch(error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/item');
    }
  },

  showImageItem: async (req, res) => {
    try {
      const { id } = req.params;
      const item = await Item.findOne({ _id: id })
        .populate({ path: 'imageId', select: 'id imageUrl' });

      // Setting flash message
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };

      res.render('admin/item/view_item', {
        title: 'Staycation - Show Image Item',
        alert,
        item,
        action: 'show image',
        user: req.session.user,
      });
    } catch(error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/item');
    }
  },

  showEditItem: async (req, res) => {
    try {
      const { id } = req.params;
      const item = await Item.findOne({ _id: id })
        .populate({ path: 'imageId', select: 'id imageUrl' })
        .populate({ path: 'categoryId', select: 'id name' });

      const categories = await Category.find();

      // Setting flash message
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };

      res.render('admin/item/view_item', {
        title: 'Staycation - Edit Item',
        alert,
        item,
        categories,
        action: 'edit',
        user: req.session.user,
      });
    } catch(error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/item');
    }
  },

  editItem: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        title,
        price,
        city,
        category: categoryId,
        unit,
        descriptionItem,
      } = req.body;
      const item = await Item.findOne({ _id: id });

      if (req.files.length > 0) {
        for (let i = 0; i < item.imageId.length; i++) {
          const imageUpdate = await Image.findOne({ _id: item.imageId[i]._id });

          // delete gambar yang lama
          if (fs.existsSync(path.join(`public/${imageUpdate.imageUrl}`))) {
            await fs.unlink(path.join(`public/${imageUpdate.imageUrl}`));
          }

          // update gambar baru
          imageUpdate.imageUrl = `images/${req.files[i].filename}`;
          await imageUpdate.save();
        }
      }

      item.title = title;
      item.price = price;
      item.city = city;
      item.description = descriptionItem;
      item.unit = unit;
      item.categoryId = categoryId;
      await item.save();

      // setting flash message
      req.flash('alertMessage', 'Success Update Item');
      req.flash('alertStatus', 'success');
      res.redirect('/admin/item');
    } catch(error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/item');
    }
  },

  deleteItem: async (req, res) => {
    try {
      const { id } = req.params;
      const item = await Item.findOne({ _id: id });
      const category = await Category.findOne({ _id: item.categoryId });

      // menghapus gambar
      for (let i = 0; i < item.imageId.length; i++) {
        const image = await Image.findOne({ _id: item.imageId[i]._id });
        const imagePath = path.join(`public/${image.imageUrl}`);
        if (fs.existsSync(imagePath)) {
          await fs.unlink(imagePath);
        }
        await image.remove();
      }

      // menghapus category itemId
      for (let i = 0; i < category.itemId.length; i++) {
        if (JSON.stringify(category.itemId[i]) === JSON.stringify(item._id)) {
          category.itemId.splice(i, 1);
        }
      }
      await category.save();

      // menghapus item
      await item.remove();
      
      // setting flash message
      req.flash('alertMessage', 'Success Delete Item');
      req.flash('alertStatus', 'success');
      res.redirect('/admin/item');
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect('/admin/item');
    }
  },

  viewDetailItem: async (req, res) => {
    const { itemId } = req.params;
    
    try {
      const features = await Feature.find({ itemId: itemId });
      const activities = await Activity.find({ itemId: itemId });

      // Setting flash message
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };

      res.render('admin/item/detail/view_detail_item', {
        title: 'Staycation - Detail Item',
        alert,
        itemId,
        features,
        activities,
        user: req.session.user,
      });
    } catch (error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect(`/admin/item/detail/${itemId}`);
    }
  },

  addFeature: async (req, res) => {
    const { name, qty, itemId } = req.body;

    try {
      if (!req.file) {
        // setting flash message
        req.flash('alertMessage', 'Image Feature is Empty');
        req.flash('alertStatus', 'danger');
        res.redirect(`/admin/item/detail/${itemId}`);
      }

      const feature = await Feature.create({
        name,
        qty,
        imageUrl: `images/${req.file.filename}`,
        itemId,
      });

      // menambahkan feature id di dalam item collection
      const item = await Item.findOne({ _id: feature.itemId });
      item.featureId.push({ _id: feature._id });
      await item.save();

      // setting flash message
      req.flash('alertMessage', 'Success Add Feature');
      req.flash('alertStatus', 'success');
      res.redirect(`/admin/item/detail/${itemId}`);
    } catch(error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect(`/admin/item/detail/${itemId}`);
    }
  },

  editFeature: async (req, res) => {
    const { id, name, qty, itemId } = req.body;

    try {
      const feature = await Feature.findOne({ _id: id });

      if (req.file !== undefined) {
        if (fs.existsSync(path.join(`public/${feature.imageUrl}`))) {
          await fs.unlink(path.join(`public/${feature.imageUrl}`));
        }
        feature.imageUrl = `images/${req.file.filename}`;
      }

      feature.name = name;
      feature.qty = qty;
      await feature.save();

      // setting flash message
      req.flash('alertMessage', 'Success Update Feature');
      req.flash('alertStatus', 'success');
      res.redirect(`/admin/item/detail/${itemId}`);
    } catch(error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect(`/admin/item/detail/${itemId}`);
    }
  },

  deleteFeature: async (req, res) => {
    const { id, itemId } = req.params;

    try {
      const feature = await Feature.findOne({ _id: id });
      const item = await Item.findOne({ _id: itemId });

      // delete image
      if (fs.existsSync(path.join(`public/${feature.imageUrl}`))) {
        await fs.unlink(path.join(`public/${feature.imageUrl}`));
      }

      // delete featureId in item collection
      for (let i = 0; i < item.featureId.length; i++) {
        if (JSON.stringify(item.featureId[i]._id) === JSON.stringify(feature._id)) {
          item.featureId.pull({ _id: feature._id });
        }
      }
      await item.save();

      // delete feature
      await feature.remove();

      // setting flash message
      req.flash('alertMessage', 'Success Delete Feature');
      req.flash('alertStatus', 'success');
      res.redirect(`/admin/item/detail/${itemId}`);
    } catch(error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect(`/admin/item/detail/${itemId}`);
    }
  },

  addActivity: async (req, res) => {
    const { name, type, itemId } = req.body;

    try {
      if (!req.file) {
        // setting flash message
        req.flash('alertMessage', 'Image Activity is Empty');
        req.flash('alertStatus', 'danger');
        res.redirect(`/admin/item/detail/${itemId}`);
      }

      const activity = await Activity.create({
        name,
        type,
        imageUrl: `images/${req.file.filename}`,
        itemId,
      });

      // menambahkan activity id di dalam item collection
      const item = await Item.findOne({ _id: activity.itemId });
      item.activityId.push({ _id: activity._id });
      await item.save();

      // setting flash message
      req.flash('alertMessage', 'Success Add Activity');
      req.flash('alertStatus', 'success');
      res.redirect(`/admin/item/detail/${itemId}`);
    } catch(error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect(`/admin/item/detail/${itemId}`);
    }
  },

  editActivity: async (req, res) => {
    const { id, name, type, itemId } = req.body;

    try {
      const activity = await Activity.findOne({ _id: id });

      if (req.file !== undefined) {
        if (fs.existsSync(path.join(`public/${activity.imageUrl}`))) {
          await fs.unlink(path.join(`public/${activity.imageUrl}`));
        }
        activity.imageUrl = `images/${req.file.filename}`;
      }

      activity.name = name;
      activity.type = type;
      await activity.save();

      // setting flash message
      req.flash('alertMessage', 'Success Update Activity');
      req.flash('alertStatus', 'success');
      res.redirect(`/admin/item/detail/${itemId}`);
    } catch(error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect(`/admin/item/detail/${itemId}`);
    }
  },

  deleteActivity: async (req, res) => {
    const { id, itemId } = req.params;

    try {
      const activity = await Activity.findOne({ _id: id });
      const item = await Item.findOne({ _id: itemId });

      // delete image
      if (fs.existsSync(path.join(`public/${activity.imageUrl}`))) {
        await fs.unlink(path.join(`public/${activity.imageUrl}`));
      }

      // delete featureId in item collection
      for (let i = 0; i < item.featureId.length; i++) {
        if (JSON.stringify(item.featureId[i]._id) === JSON.stringify(activity._id)) {
          item.featureId.pull({ _id: activity._id });
        }
      }
      await item.save();

      // delete activity
      await activity.remove();

      // setting flash message
      req.flash('alertMessage', 'Success Delete Activity');
      req.flash('alertStatus', 'success');
      res.redirect(`/admin/item/detail/${itemId}`);
    } catch(error) {
      req.flash('alertMessage', `${error.message}`);
      req.flash('alertStatus', 'danger');
      res.redirect(`/admin/item/detail/${itemId}`);
    }
  },

  viewBooking: async (req, res) => {
    try {
      const booking = await Booking.find()
        .populate('memberId')
        .populate('bankId');

      res.render('admin/booking/view_booking', {
        title: 'Staycation - Booking',
        user: req.session.user,
        booking,
      });
    } catch (error) {
      res.redirect('/admin/booking');
    }
  },

  showDetailBooking: async (req, res) => {
    const { id } = req.params;

    try {
      const booking = await Booking.findOne({ _id: id })
        .populate('memberId')
        .populate('bankId');

      // Setting flash message
      const alertMessage = req.flash('alertMessage');
      const alertStatus = req.flash('alertStatus');
      const alert = {
        message: alertMessage,
        status: alertStatus,
      };

      res.render('admin/booking/show_detail_booking', {
        title: 'Staycation - Detail Booking',
        user: req.session.user,
        booking,
        alert,
      });
    } catch (error) {
      res.redirect('/admin/booking');
    }
  },

  actionConfirmation: async (req, res) => {
    const { id } = req.params;

    try {
      const booking = await Booking.findOne({ _id: id });

      booking.payments.status = 'Accept';
      await booking.save();

      // setting flash message
      req.flash('alertMessage', 'Success Confirmation Payment');
      req.flash('alertStatus', 'success');
      res.redirect(`/admin/booking/${id}`);
    } catch (error) {
      console.log(error);
      res.redirect(`/admin/booking/${id}`);
    }
  },

  actionReject: async (req, res) => {
    const { id } = req.params;

    try {
      const booking = await Booking.findOne({ _id: id });

      booking.payments.status = 'Reject';
      await booking.save();

      // setting flash message
      req.flash('alertMessage', 'Success Reject Payment');
      req.flash('alertStatus', 'success');
      res.redirect(`/admin/booking/${id}`);
    } catch (error) {
      res.redirect(`/admin/booking/${id}`);
    }
  },
};
