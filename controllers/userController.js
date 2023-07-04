const User = require('../model/userModel');
const AppError = require('../util/app-error');
const catchAsync = require('../util/catch-async');
const { deleteOne, updateOne, getOne, getAll } = require('./handlerFactory');

const filterObj = (obj, ...allowedFields) => {
  const newObject = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      newObject[key] = obj[key];
    }
  });

  return newObject;
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password update. Please use /updateMyPassword.',
        400
      )
    );
  }

  const filteredBody = filterObj(req.body, 'name', 'email');
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  // 204: deleted
  res.status(204).json({ status: 'success', data: null });
});

exports.createUser = (req, res) => {
  // 500 means internal server error
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined. Please sign up instead!',
  });
};

exports.getAllUsers = getAll(User);
exports.getAnUser = getOne(User);

// DO not update password with this
exports.updateUser = updateOne(User);

exports.deleteUser = deleteOne(User);
